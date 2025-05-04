const { storeOrgDetails, fetchLogRecords, getLogStatus } = require("../service/OrganisationService");
const logger = require("../utils/logger");
const responseUtility = require('../utils/responseUtility');



//@desc POST ---
//@route POST /api/org/orgSignIn
//@access public
const saveOrgDetails = async(req,res,next) => {
    try{
            const response = await storeOrgDetails(req.body);
            return res.status(200).json(responseUtility.build('SUCCESS', response));
    }
    catch(error){
        return next(error);
    }
}

//@desc GET ---
//@route GET /api/org/getOrgDetails
//@access private
const fetchOrgDetails = async(req,res,next) => {
    try{
            const clinetDetails = {
                city: req.body.ipInfo?.city,
                state: req.body.ipInfo?.region,
                country: req.body.ipInfo?.country_name,
                name: req.body.waName,
                mobile: req.body.waNumber
            }
            return res.status(200).json(responseUtility.build('SUCCESS', clinetDetails));
    }
    catch(error){
        return next(error);
    }
}

//@desc POST ---
//@route POST /api/org/getLogDetails
//@access private
const fetchLogDetails = async(req,res,next) => {
    try{
            const logDetails = {
                service: req.body.service,
                level: req.body.level,
                startDate: req.body.startDate,
                endDate: req.body.endDate,
                page: req.body.page,
                limit: req.body.limit
            }
            
            const response = await fetchLogRecords(logDetails);
            return res.status(200).json(responseUtility.build('SUCCESS', response));
    }
    catch(error){
        return next(error);
    }
}

//@desc POST ---
//@route POST /api/org/getLogStatus
//@access private
const fetchLogStatus = async(req,res,next) => {
    try{    

            const {startDate, endDate} = req.body;
            const response = await getLogStatus(startDate, endDate);
            return res.status(200).json(responseUtility.build('SUCCESS', response));
    }
    catch(error){
        return next(error);
    }
}

module.exports = {saveOrgDetails, fetchOrgDetails, fetchLogDetails, fetchLogStatus};