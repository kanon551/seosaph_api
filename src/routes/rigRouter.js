const express = require('express');
const orgRouter = require('./orgRouter');

const rigRouter = express.Router();

    rigRouter.use("/org", orgRouter);

module.exports = rigRouter