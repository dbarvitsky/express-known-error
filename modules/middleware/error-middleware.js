'use strict';
const errors = require('../errors/error.service');

module.exports = function( err, req, res, next ) {
    if (err) {
        var err_json = errors.generateError(err,{
            path: req.path,
            params: req.params,
            userId : req.auth ? req.auth.userId : null,
            uid : 12345678
        });
        var status = err_json.status || 500;
        delete err_json.status;
        res.status(status).json(err_json).end();
    } else 
    res.status(500).json({});
};