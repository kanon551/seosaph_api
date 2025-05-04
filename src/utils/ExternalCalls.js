const {findOne} = require('../utils/queryWrapper');
const axios = require('axios');
const logger = require('../utils/logger');

const getIPDetails = async(ip, waNumber, waName, mobile) => {
    try{

        const checkIpInfo = await findOne('Organisation', {
            filter: { waNumber, waName, mobile },
            projection: { ipInfo: 1, _id: 0 },
        });

        if (checkIpInfo?.ipInfo && Object.keys(checkIpInfo?.ipInfo).length > 0) {
            // logger.info(`IP Info Obtained for ${ip}- [${waName}-${waNumber}]`);
            return {
                ipInfo: checkIpInfo.ipInfo,
                status: 1
            };
        } else {
            const ipPayload = {
                method: 'GET',
                url: `https://ipapi.co/${ip}/json/`,
            };
        
            const response = await axios(ipPayload);
            // logger.info(`IP Info registered for ${ip}-[${waName}-${waNumber}] : ${JSON.stringify(response.data)}`);
            return {
                ipInfo: response.data,
                status: 0
            };
        }

    }
    catch(err){
        logger.error(`getIPDetails -> ${JSON.stringify(err?.response?.data)}`);
        return {
            ipInfo: {},
            status: 0
        }
    }
}

module.exports = {getIPDetails};