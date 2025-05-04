const mongoose = require('mongoose');
const { startLogSimulation } = require('../service/logSimulator');

const uri = process.env.MONDODB_STRING;

const connectDB = async () => {
    try {
            await mongoose.connect(uri);
            const db = mongoose.connection.useDb('seosaph');
                if (db.readyState === 1) {
                    console.log(`Successfully connected to the ${db.name} database`);
                    startLogSimulation();
                } else {
                    console.log(`Failed to connect to the ${db.name} database. State: ${db.readyState}`);
                }
    } catch (error) {
      console.error(error.message);
      process.exit(1);
    }
  }

module.exports = connectDB;
