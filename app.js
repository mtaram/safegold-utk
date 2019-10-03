'use strict';

const express = require('express');
const path = require('path');
const compression = require('compression');
const bodyParser = require('body-parser');
const helmet = require('helmet');
const app = express();
const appConfig = require('./config/app.json');
const errorHandler = require('./utils/error-handler.js');
const port = appConfig.port ? appConfig.port : 8000;
const version = 'v0';

// confirm?
process.setMaxListeners(0);

app.use(compression());
app.use(bodyParser.json({ limit: '50mb' }));
app.use(bodyParser.urlencoded({
  limit: '50mb', extended: true
}));
app.use(helmet());

app.use('*', (req, res, next) => {
  console.log(`URL: ${req.baseUrl}`);
  next();
});

app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'PUT, GET, POST, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, X-access-token');
  next();
});

app.use('/api/v0/users', require('./modules/v0/users/routes.js'));
app.use('/api/v0/safe-gold', require('./modules/v0/safe-gold/routes.js'));

app.get('/test', (req, res) => {
  res.send('wooo');
});
app.use(errorHandler);

app.listen(port)
  .on('error', error => {
    console.log(error);
  })
  .on('listening', () => {
    console.log(`Express listening on ${port}`);
  });

// let httpsServer = https.createServer(credentials, app);
// httpsServer.listen(port)
//   .on('error', error => {
//     logger.error(error);
//   })
//   .on('listening', () => {
//     logger.info(`Express listening on ${port}`);
//   });
