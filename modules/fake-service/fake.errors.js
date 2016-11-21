'use strict';
module.exports = require('../errors/error.service.js').defineErrors(
{
    module: __dirname,
    namePrefix: "FS_",
    codePrefix: "331"
},
{
   AccessDeniedError: {
       status: "403",
       code: "40300",
       message: "Access denied for user ${user}, you need ${missingRole|specific} role to access this resource",
       parameters : {
           user : { required: true, expose: true, exposeAs : "userName" },
           missingRole: { reqired: false, expose: false }
       }
   },
   
   BecauseICanError: {
       code: "42",
       status: "418",
       message: "${message|Some dummy just threw a error 33142 without message.}",
       parameters : {
           message : { required: false, expose: true, exposeAs : "originalErrorMessage" }
       }
   },
   
   AccountLockedError: {
       status: "403",
       code: "40301",
       message: "Account is locked - ${reasonMessage|please contact support}.",
       parameters: {
           reasonCode: { required: false, expose: true },
           reasonMessage: { required: false, expose: true }
       }
   }
});