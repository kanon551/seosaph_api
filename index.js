const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
const { getLogStatus } = require("./src/service/OrganisationService");
const dotenv = require("dotenv").config();
const app = express();
const cookieParser = require('cookie-parser');
const logger = require('./src/utils/logger');
const port = process.env.PORT;
const server = require('http').Server(app);
const morganMiddleware  = require('./src/middleware/morganMiddleware');
const { errorHandler, handle404 } = require('./src/middleware/errorHandler');
const connectDB = require('./src/config/dbConnection');
const rigRouter = require('./src/routes/rigRouter');




server.listen(port, async () => {
    logger.info(`Server is running on port ${port}`);
});


var io = require('socket.io')(server, {
  cors: {
    origin: '*',
  }
});

const fetchLogStatus = async (startDate, endDate) => {
  try {
      const response = await getLogStatus(startDate, endDate);
      return response;
  } catch (error) {
      throw new Error('Error fetching log status');
  }
};


// Handle WebSocket connections
io.on('connection', (socket) => {
  console.log('A client connected');

  socket.on('fetchLogData', async (logPayload) => {
    const { startDate, endDate } = logPayload;

    try {
        const logData = await fetchLogStatus(startDate, endDate);
        socket.emit('logUpdate', logData); 
    } catch (error) {
        console.error('Error fetching log data:', error);
        socket.emit('logUpdate', { error: 'Failed to fetch log data' });
    }
  });

  socket.on('disconnect', () => {
      console.log('A client disconnected');
  });
});


app.set('socketio', io);

connectDB();

app.use(cookieParser());
app.use(cors({ origin: true, credentials: true }));
const frontend = path.resolve(__dirname, '../build_customer');
app.use(morganMiddleware)
app.use(express.json());
app.use("/api", rigRouter);
app.use(errorHandler);
app.use(handle404);
app.use('*', express.static(frontend));