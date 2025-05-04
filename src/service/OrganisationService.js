const logger = require('../utils/logger');
const {ExceptionResolver} = require('../middleware/ExceptionResolver');
const ShortUniqueId = require('short-unique-id');
const {upsert, findByQueryPagination, aggregate} = require('../utils/queryWrapper');
const {getIPDetails} = require('../utils/ExternalCalls');
const {decryptWithPrivateKey, generateToken, decryptData} = require('../utils/GlobalFunctions');
const { createSign } = require('crypto');
const fs = require("fs");
const momentTz = require('moment-timezone');
const { ExpectationFailed } = require('../utils/exceptions');

const privateKey = fs.readFileSync(require.resolve('../config/private_key.pem'), { encoding: 'utf8' });

function isDateStartToday(startDate){
    const currentDate = momentTz.tz(new Date(), 'Asia/Kolkata').format('YYYY-MM-DD');
    const startDateFormatted = momentTz.tz(startDate, 'Asia/Kolkata').format('YYYY-MM-DD');
    return startDateFormatted === currentDate;
}

const storeOrgDetails = async(orgDetails) => {
    try{

        const { data, appKey } = orgDetails;
        const decryptedAPPKey = decryptWithPrivateKey(appKey);
        const decryptedData = decryptData(data, decryptedAPPKey);


        const originalPayload = JSON.parse(decryptedData);

        const { waNumber, waName, email, mobile, timezone, timestamp, token, ipAddress, ipType } = originalPayload;

        const ipResponse = await getIPDetails(ipAddress, waNumber, waName, mobile)
        const { ipInfo, status } = ipResponse;

        const { authToken, authTokenExpiry } = generateToken();

        const { randomUUID } = new ShortUniqueId({ length: 22 });
        const insertPayload = {
            waNumber, 
            waName,
            email, 
            mobile,
            orgId: randomUUID()
        }

        const result = await upsert('Organisation', {
            filter: { waNumber, waName, mobile },
            update: {
                $set: {
                    timezone,
                    timestamp: new Date(timestamp.replace(' ', 'T')),
                    token,
                    authToken,
                    authTokenExpiry,
                    ...(status === 0 && ipInfo && Object.keys(ipInfo).length > 0 && {ipInfo} ),
                },
                $setOnInsert: insertPayload
            }
        });

        if(!result._id){
            throw new ExpectationFailed(`Login Failed. Unable to register ${waNumber}. Please try again.`);
        }

        const responsePayload = {
            authToken,
            authTokenExpiry,
            name: waName,
            message: 'Login Successful'
        };

        // Sign the response payload
        const sign = createSign('SHA256');
        sign.update(JSON.stringify(responsePayload));
        sign.end();
        const signoff = sign.sign(privateKey, 'base64');

        return {
            ...responsePayload,
            signature: signoff
        };


    }
    catch(err){
        logger.error(`storeOrgDetails -> ${err.message}`);
        ExceptionResolver(err, null);
    }
}

const fetchLogRecords = async(logPayload) => {
    try{
        const { service, level, startDate, endDate, page, limit } = logPayload;


        let filter = {};
        if (service) filter.service = service;
        if (level) filter.level = { $in: level };
        if (startDate && endDate) {
            filter.createdAt = {
            $gte: new Date(startDate),
            $lte: new Date(endDate)
        };
        }
        const result = await findByQueryPagination('Log', {
            filter,
            projection : {},
            sort : { createdAt: -1 },
            page,
            limit
        });

        return result;
    }
    catch(err){
        logger.error(`fetchLogRecords -> ${err.message}`);
        ExceptionResolver(err, null);
    }
}

const getLogStatus = async(startDate, endDate) => {
    try{

        const sameDay = isDateStartToday(startDate);
        const levels = ['info', 'warn', 'error', 'debug'];

        let pipeLine = [
            {
                 $match: {
                 createdAt: { $gte: new Date(startDate), $lte: new Date(endDate) },
               },
            }
         ];

        if(sameDay){
            pipeLine.push(
                {
                    $group: {
                        _id: {
                            hour: {
                            $hour: { date: "$createdAt", timezone: "Asia/Kolkata" },
                            },
                            level: "$level",
                        },
                        count: { $sum: 1 },
                    },
                }
            )
        }
        else {
            pipeLine.push(
                {
                    $group: {
                      _id: {
                        date: {
                          $dateToString: {
                            format: "%Y-%m-%d",
                            date: "$createdAt",
                            timezone: "Asia/Kolkata",
                          },
                        },
                        level: "$level",
                      },
                      count: { $sum: 1 },
                    },
                }
            )
        }

        pipeLine.push({ $sort: { "_id": 1 } });
        // const seconds = 2400;
        // const since = new Date(Date.now() - seconds * 1000);

        // const pipeline = [
        //     {
        //       $match: {
        //         createdAt: { $gte: since },
        //       },
        //     },
        //     {
        //       $group: {
        //         _id: '$level',
        //         count: { $sum: 1 },
        //       },
        //     },
        //   ];

        const levelCounts = await aggregate('Log', pipeLine);

        // return levelCounts;
        // const totalLogs = levelCounts.reduce((sum, level) => sum + level.count, 0);
        // const averagePerSecond = totalLogs / seconds;
    
        // const errorLevel = levelCounts.find(l => l._id === 'error');
        // const errorRate = errorLevel ? (errorLevel.count / totalLogs) * 100 : 0;

        // return {
        //     levels: levelCounts,
        //     averageLogsPerSecond: parseFloat(averagePerSecond.toFixed(2)),
        //     errorRate: parseFloat(errorRate.toFixed(2)),
        // }

        // working solutin
        // if (sameDay) {
        //     // Fill missing hours and levels (0–23)
        //     const result = [];
      
        //     for (let hour = 0; hour < 24; hour++) {
        //       for (const level of levels) {
        //         const range = `${hour}-${hour + 1}`;
        //         const match = levelCounts.find(
        //           (entry) => entry._id.hour === hour && entry._id.level === level
        //         );
      
        //         result.push({
        //           hourRange: range,
        //           level,
        //           count: match ? match.count : 0,
        //         });
        //       }
        //     }
      
        //     return result;
        //   } else {
        //     // Return raw daily result
        //     const formatted = [];
      
        //     for (const level of levels) {
        //       const grouped = levelCounts
        //         .filter((entry) => entry._id.level === level)
        //         .map((entry) => ({
        //           date: entry._id.date,
        //           level,
        //           count: entry.count,
        //         }));
      
        //       formatted.push(...grouped);
        //     }
        //     return formatted;
        // }
        // working solution
      
        
        // if (sameDay) {
        //     // Hourly view: transform into desired format
        //     const hourlyData = [];
      
        //     for (let hour = 0; hour < 24; hour++) {
        //       const hourLabel = String(hour + 1).padStart(2, "0") + ":00";
        //       const hourBlock = { hourRange: hourLabel };
      
        //       for (const level of levels) {
        //         const match = levelCounts.find(
        //           (entry) => entry._id.hour === hour && entry._id.level === level
        //         );
        //         hourBlock[level] = match ? match.count : 0;
        //       }
      
        //       hourlyData.push(hourBlock);
        //     }
      
        //     return hourlyData;
        //   } else {
        //     // Daily view stays the same
        //     const dailyData = [];
      
        //     for (const level of levels) {
        //       const grouped = levelCounts
        //         .filter((entry) => entry._id.level === level)
        //         .map((entry) => ({
        //           date: entry._id.date,
        //           level,
        //           count: entry.count,
        //         }));
        //       dailyData.push(...grouped);
        //     }
      
        //     return dailyData;
        //   }


        if (sameDay) {
            // Format hourly range output
            const hourlyData = [];
      
            for (let hour = 0; hour < 24; hour++) {
              const hourLabel = String(hour + 1).padStart(2, "0") + ":00";
              const hourBlock = { range: hourLabel };
      
              for (const level of levels) {
                const match = levelCounts.find(
                  (entry) => entry._id.hour === hour && entry._id.level === level
                );
                hourBlock[level] = match ? match.count : 0;
              }
      
            //   hourlyData.push(hourBlock);
            if (hourBlock.info !== 0 || hourBlock.warn !== 0 || hourBlock.error !== 0 || hourBlock.debug !== 0) {
                hourlyData.push(hourBlock);
            }
            }
      
            return hourlyData;
          } else {
            // Format daily summary output
            const groupedByDate = {};
      
            for (const entry of levelCounts) {
              const { date, level } = entry._id;
              if (!groupedByDate[date]) {
                groupedByDate[date] = { range: date };
                levels.forEach((lvl) => (groupedByDate[date][lvl] = 0));
              }
              groupedByDate[date][level] = entry.count;
            }
      
            return Object.values(groupedByDate);
          }
    }
    catch(err){
        logger.error(`getLogStatus -> ${err.message}`);
        ExceptionResolver(err, null);
    }
}

module.exports = {storeOrgDetails, fetchLogRecords, getLogStatus};