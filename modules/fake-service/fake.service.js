'use strict';

const errors = require('./fake.errors');
const httpErrors = require('http-errors');

function waitSome() {
    return new Promise( function(resolve,reject) {
        setTimeout(function(){
            resolve();
        },100);
    });
}

function UserContext( data ) {
    Object.assign(this,data);
    this.isInRole = function(role) {
        return this.permissions.indexOf(role) >=0;
    };
    this.requireRole = function(role) {
        var self = this;
        return new Promise(function(ok,fail) {
            if (self.isInRole(role)) ok();
            else fail( new errors.AccessDeniedError({ user: self.name, missingRole: role }));
        });
    };
}

module.exports = {
    resolveUser: function( userId, sessionId ) {
        return waitSome().then( function() { 
            return new UserContext({
                userId : userId || 'login12345',
                sessionToken: sessionId || 'session12345',
                name: 'Bob',
                permissions: ['read','write']
            });
        });
    },
    simpleSync: function() {
        return {
            "test" : "passed",
            "info" : "From simpleSync function, just returning the pojo"
        };
    },
    simpleSyncError: function() {
        throw new Error("Simple exception from sync code.");
    },
    pojoSyncError: function() {
        throw { code: '42', message: 'Just because I can' };
    },
    simpleAsync: function() {
        return waitSome().then(function() { 
            return {
                "test" : "passed",
                "info" : "From simpleAsync, successfully returned promise"
            };
        });
    },
    simpleAsyncError: function() {
        return waitSome().then(function() {
            throw new Error("Simple exception from promise");
        });
    },
    pojoAsyncError: function() {
        return waitSome().then(function() {
            throw { code: errors.BecauseICanError.code, message: 'Just because I can' };
        });
    },
    userContextPass: function(user,message) {
        return user.requireRole("read").then(function(){
            return {
                test: "passed",
                greeting: "Hello, "+user.name+". "+message
            };
        });
    },
    userContextFail: function(user,message) {
        return user.requireRole("administrator").then(function(){
            return {
                test: "passed",
                greeting: "Hello, "+user.name+". "+message
            };
        });
    },
    httpErrorSync: function() {
        throw new httpErrors.ImATeapot();
    },
    httpErrorAsync: function() {
        return waitSome().then( function(){
            throw new httpErrors.ImATeapot();
        });
    }

};