    // const mongoose = require('mongoose');
    // const mongoosePaginate = require('mongoose-paginate-v2');

    // const { Schema } = mongoose;

    // const LogSchema = new mongoose.Schema({
    //     service: { type: String, required: true },
    //     level: { type: String, enum: ['info', 'warn', 'error'], required: true },
    //     message: { type: String, required: true },
    //     createdAt: { type: Date, default: Date.now }
    // }, {
    //     versionKey: false,
    // });

    // logSchema.plugin(mongoosePaginate);
    // module.exports = {LogSchema};

const mongoose = require('mongoose');
const mongoosePaginate = require('mongoose-paginate-v2');

const logSchema = new mongoose.Schema({
  orgId: String,
  service: String,
  level: String,
  message: String,
  createdAt: {
    type: Date,
    default: Date.now
  }
});

logSchema.plugin(mongoosePaginate);

module.exports = mongoose.model('Log', logSchema);


