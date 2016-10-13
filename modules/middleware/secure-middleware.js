'use strict';

const service = require('../fake-service/fake.service');

function authenticateUser(options,req) {
    return new Promise( function(resolve,reject) {
        try {
            // Check req properties, require https, etc.
            // ...
            // Open explicitly excluded URLS:
            for (var i = 0; i < options.exclude.length; i++) {
                var exclude = options.exclude[i];
                if (exclude.test && exclude.test(req.path)) {
                    resolve();
                    return;
                }
            }

            // Login, load user object, identify permissions, whatever.
            service.resolveUser(req.headers['user'],req.headers['session-token'])
            .then( function( session ){
                req.auth = session;
                resolve();
            });
        } catch (e) {
            reject(e);
        }
    });
}

module.exports = function(options) {
    if (!options.exclude) options.exclude = [];
    return function( req, res, next ) {
        authenticateUser(options,req).then(function(){ next();});
    };
};