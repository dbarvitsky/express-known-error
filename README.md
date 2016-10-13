# Error middleware demo and Known Error pattern

## Background 

The Known Error or Custom Error pattern's main idea is to have a dictionary of all errors with unique codes so that when the 
service consumer receives this error, we know this is "legit" situation as opposed to someting breaking behind our service.

There are 3 middlewares working together:

* `async-middleware` injects `res.serve` function that takes the `logic` function as an argument. the `res.serve` runs this `logic` function and interpretes the result. If result is a promise, it waits for the promise to be fulfilled. If it is not a promise, it assumes the result to be a response object and sends it to output. If  the `logic` function fails for whatever reason (explicitly or in promise it returns), the `res.serve` sends an error down the pipeline.

* `error-middleware` captures all errors, builds and returns json with proper error code and http response code. It has a special case for exceptions that are have `isKnownError` static property and tries to polyfill all others.

* `secure-middleware` parses the request headers (uses `user` and `session-token`), loads and injects user object into `req.auth`. All functions downstream can use the `req.auth` to check if the user has permissions, etc.

## Testing
The demo has the following endpoints:

## Synchronous (return result immediately)
* `/api/example1/sync/ok` - successfully returns json synchronously.
* `/api/example1/sync/error` - throws an arbitrary error (`new Error(...)`) synchronously.
* `/api/example1/sync/pojo-error` - throws a pojo error (`new {....}`) synchronously.
* `/api/example1/sync/http-error` - throws an error through express's `http-errors` module (`throw new httpErrors.ImATeapot()`)

## Asynchronous (return result through promise)
* `/api/example1/async/ok` - successfully returns json through promise.
* `/api/example1/async/error` - throws an arbitrary error (`new Error(...)`) in promise.
* `/api/example1/async/pojo-error` - throws a pojo error (`new {....}`) in promise.
* `/api/example1/sync/http-error` - throws an error through express's `http-errors` module (`throw new httpErrors.ImATeapot()`) in promise
 
* `/api/example1/async/security-ok?message=Whatever` - demonstrates how `req.auth` is used, returns json from promise.
* `/api/example1/async/security-fail?message=Whatever` - demonstrates access denied "known error".

## Creating custom errors
The example can be found in [Fake Service](./fake-service/fake.errors.js):


```
'use strict';
module.exports = require('../errors/error.service.js').defineErrors(
{
    // Generate a module name:
    module: __dirname,
    // Give error classes a name prefix:
    namePrefix: "FS_",
    // Give all known error codes from this module a prefix:
    codePrefix: "331"
},
{
   AccessDeniedError: {
       // Http Status:
       status: "403",
       // Error code (call support with this)
       code: "40300",
       // User-friendly message (with ${parameters} substitution and ${variable|defaults}).
       message: "Access denied for user ${user}, you need ${missingRole|specific} role to access this resource",
       // These are parameters the error expects in a constructor:
       parameters : {
           // if required=true and parameter is not passed in, generates a warning
           // If exposed=true the parameter will be copied to json error object before sending. The exposeAs can give it a name
           user : { required: true, expose: true, exposeAs : "userName" },
           missingRole: { reqired: false, expose: false }
       }
   }
};
```
Usage example:
```
const errors = require('./fake.errors');
//...
throw new errors.AccessDeniedError({ user: self.name, missingRole: role }));
//... or
new Promise( function(resolve,reject) {
    ...
    fail( new errors.AccessDeniedError({ user: self.name, missingRole: role })));
})

```

# TBD
* Polifill from pojo errors. When user throws a `{code: 12345}` pojo exception, service shall apply the exception logic according to code or error name. Fairly trivial.
* Support nested errors and error causes. For example `throw new errors.AccessDeniedError({...}).from('partner-api',response)`.