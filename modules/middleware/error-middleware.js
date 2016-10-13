'use strict';
const errors = require('../errors/error.service');
const statuses = require('statuses');

module.exports = function(options) {
    if (!options) options = {
        includeUserId: true,
        includeStackTrace: true,
        errorIdGenerator: function() { return 'erroruniquecodehere'; }
    };
    return function( err, req, res, next ) {
        try {
            if (err) {
                var err_json = errors.generateError(err,{
                    path: req.path,
                    params: req.params,
                    userId : options.includeUserId && req.auth ? req.auth.userId : null,
                    uid : options.errorIdGenerator()
                });
                var status = err_json.status || 500;
                delete err_json.status;
                if (!options.includeStackTrace && err_json.details && err_json.details.stackTrace) delete err_json.details.stackTrace;
                try {
                    res.status(status).json(err_json).end();
                    return;
                } catch (e) {
                    if (!statuses[status]) {
                        console.warn('HTTP status of the error is invalid. Trying 500. Original error:',err,', Original error json:',err_json,', Express error',e);
                        res.status(500).json(err_json).end();
                        return;
                    }
                }
            }
        } catch(e) {
            console.warn('Could not format HTTP error message. Original error:',err,'. Express error:',e);
            res.status(500).json({});
        }
    };
}