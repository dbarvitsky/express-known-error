'use strict';

const CustomError = require('./custom-error.js').CustomError;
const knownErrorSources = {};

CustomError.prototype.from = function( errorSource, response ) {
    if (!errorSource) {
        console.warn("The error source is not provided");
        return;
    }
    var es = knownErrorSources[errorSource];
    if (!es) {
        console.warn("Error source ",errorSource," is not configured");
    }
    
    es.configureError(this,response);
    return this;
};

module.exports = { 
    register: function( code, handler) {
        knownErrorSources[code] = {
            configureError : handler || function() {}
        };
    }
};