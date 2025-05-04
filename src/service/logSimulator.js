// services/logSimulator.js
const logger = require('../utils/logger');
const { save } = require('../utils/queryWrapper');

const services = ['notifications'];
const levels = ['info', 'warn', 'error', 'debug'];

function randomElement(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

function startLogSimulation() {
  services.forEach(service => {
    setInterval(async () => {
    const logData = {
        service,
        level: randomElement(levels),
        message: `${service} says ${Math.random().toString(36).substring(7)}`
      };

      // Use save to save the log data
      await save('Log', logData);
    }, 1000);
  });
}

module.exports = { startLogSimulation };
