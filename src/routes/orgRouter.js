const express = require('express');
const asyncValidateToken = require('../middleware/validateTokenHandler');
const multer = require('multer');
const { saveOrgDetails, fetchOrgDetails, fetchLogDetails, fetchLogStatus } = require('../controller/OrganisationController');
const upload = multer();


const orgRouter = express.Router();

    orgRouter.route("/orgSignIn").post(saveOrgDetails);
    orgRouter.route("/getOrgDetails").get(asyncValidateToken, fetchOrgDetails);
    orgRouter.route("/getLogDetails").post(asyncValidateToken, fetchLogDetails);
    orgRouter.route("/getLogStatus").post(asyncValidateToken, fetchLogStatus);
    // orgRouter.route("test2").get(asyncValidateToken, upload.single('file'), exampleControllerExample);
    // orgRouter.route("test3").get(asyncValidateToken, upload.array('files'), exampleControllerExample);

module.exports = orgRouter;