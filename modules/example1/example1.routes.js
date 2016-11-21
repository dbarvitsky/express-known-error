'use strict';

const router = require('express').Router();
const service = require('../fake-service/fake.service.js');

router.get('/api/example1/sync/ok',function( req, res, next) {
    res.serve( service.simpleSync );
});

router.get('/api/example1/sync/error',function( req, res, next) {
    res.serve( service.simpleSyncError);
});

router.get('/api/example1/sync/pojo-error',function( req, res, next) {
    res.serve( service.pojoSyncError );
});

router.get('/api/example1/async/ok',function( req, res, next) {
    res.serve( service.simpleAsync );
});

router.get('/api/example1/async/error',function( req, res, next) {
    res.serve( service.simpleAsyncError);
});

router.get('/api/example1/async/pojo-error',function( req, res, next) {
    res.serve( service.pojoAsyncError );
});

router.get('/api/example1/async/security-ok',function( req,res,next){
    res.serve( function(user) {
        return service.userContextPass(user,req.query["message"]);
    });
});

router.get('/api/example1/async/security-fail',function( req,res,next){
    res.serve( function(user) {
        return service.userContextFail(user,req.query["message"]);
    });
});

router.get('/api/example1/sync/http-error',function( req,res,next){
    res.serve( function(user) {
        return service.httpErrorSync();
    });
});

router.get('/api/example1/async/http-error',function( req,res,next){
    res.serve( function(user) {
        return service.httpErrorAsync();
    });
});

router.get('/api/example1/async/response-error',function( req,res,next){
    res.serve( function(user) {
        return service.responseErrorAsync();
    });
});

module.exports = router;