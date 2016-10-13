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
   }
});