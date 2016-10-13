'use strict';

const express = require('express');
const bodyParser = require('body-parser');
const logger = require('winston');
const reqLogger = require('express-request-logger');

var app =  express();
app.set('port',5000);

app.use(reqLogger.create(logger, {}));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: false}));

// Intercept the call, authenticate, put the auth object
// into the req for everybody to enjoy downstream:

app.use(require('./modules/middleware/secure-middleware')({
    // Lift security from explicit endpoints
    exclude : [/^\/api\/login/]
}));

// Inject the res.serve method, which will wait
// for the promise and handle the error.
app.use(require('./modules/middleware/async-middleware'));

// Serve a simple service throwing various errors
app.use(require('./modules/example1/example1.routes'));

// Handle all sorts of errors and return properly formatted
// error message in JSON
app.use(require('./modules/middleware/error-middleware')(/*default options*/));

// Fall-back into 404
app.use(function(req,res) {
    res.status(404).send('Not found');
});

// Run the app:
app.listen(app.get('port'), function () {
    logger.info('Prototype is running on port:', app.get('port'));
});