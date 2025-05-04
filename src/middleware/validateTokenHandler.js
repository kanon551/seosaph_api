const jwt = require("jsonwebtoken");
const { Unauthorized, NetworkAuthenticationRequired, RequestTimeout, GatewayTimeout } = require("../utils/exceptions");
const logger = require('../utils/logger');
const {decryptWithPrivateKey} = require('../utils/GlobalFunctions');
const {ExceptionResolver} = require('../middleware/ExceptionResolver');
const {findOne} = require('../utils/queryWrapper');



const validateToken = async(req, res, next) => {
    try {
      const token = req.header('Authorization');
      if (!token) {
          throw new NetworkAuthenticationRequired("Token Authorization Required.");
      }
    
      let splitToken = token.split(" ")[1];
      const encryptedIdentifier = req.headers['x-encrypted-identifier'];
      if (!splitToken || !encryptedIdentifier) {
          throw new Unauthorized("Access denied. Missing Token or identifier");
      }

      // Decrypt the identifier
        const decryptedIdentifier = decryptWithPrivateKey(encryptedIdentifier);
        const [clientID, timestamp] = decryptedIdentifier.split('|');

        // Validate timestamp (e.g., allow 5 minutes of tolerance)
        const currentTime = Date.now();
        const timeDiff = currentTime - parseInt(timestamp, 10);
        const maxAllowedTime = 5 * 60 * 1000; // 5 minutes in milliseconds

        if (timeDiff > maxAllowedTime || timeDiff < 0) {
            throw new GatewayTimeout(`Request expired or timestamp invalid`);
        }

        const fetchOrgData = await findOne('Organisation', {
            filter: { authToken: splitToken },
            projection: { ipInfo: 1, orgId: 1, waName: 1, waNumber: 1, authTokenExpiry: 1, _id: 0 },
        });

        const currentDate = new Date()
        const expiryDate = new Date(fetchOrgData?.authTokenExpiry)
        const isValid = currentDate < expiryDate

        if(isValid){
            req.body = { 
              ...req.body,
                ipInfo: fetchOrgData.ipInfo, 
                orgId: fetchOrgData.orgId,
                waName: fetchOrgData.waName,
                waNumber: fetchOrgData.waNumber
            };
              next();
        }
        else {
            throw new RequestTimeout("Session Expired. Please Login again");
        }  


      
    }
    catch (error) {
        logger.error(`validateToken -> ${error.message}`);
        ExceptionResolver(error, null);
    }
  };
  const asyncValidateToken = async(req, res, next) => {
    try{
      await validateToken(req, res, next);
    }
    catch(error){
      return next(error);
    }
  };
  
  module.exports = asyncValidateToken;