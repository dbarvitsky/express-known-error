'use static';
const util = require('util');
const CustomError = require('./custom-error').CustomError;
const customErrorFactory = require('./custom-error').customErrorFactory;
const rx_path = /.*[\\\/]/gm
const getHashCode = require('./hashcode');

var knownErrors = {
    byName : {},
    byCode : {}
};


function defineErrors(options,errors) {
    if (!options.module) throw new TypeError("The \"module\" parameter is required");
    options.module = options.module.replace(rx_path,'');
    if (!errors || typeof errors !== 'object') throw new TypeError("The \"errors\" parameter is required and must be an object");
    var namePrefix = options.namePrefix || options.module;
    var codePrefix = options.codePrefix || getHashCode(namePrefix);
    var result = {
        code: {}
    };
    for( var name in errors ) {
        if (errors.hasOwnProperty(name)) {
            var errorDef = errors[name];
            if (!errorDef.code) errorDef.code = getHashCode(name);
            if (!errorDef.status) errorDef.status = 500;

            var fullName = namePrefix+name;
            var fullCode = codePrefix+errorDef.code;

            
            var errorCtor = customErrorFactory(fullName,fullCode,errorDef);
            
            knownErrors.byName[fullName] = errorCtor;
            knownErrors.byCode[fullCode] = errorCtor;
            result[name] = errorCtor;
        }
    }
    return result;
}

module.exports = {
    generateError: function(error,context) {
        var detail = Object.assign({},context);
        detail.stackTrace = error.stack;
        if (error)
        {
            /* Known error - generate JSON and return */
            if (error.isKnownError) {
                var errorObj = error.toJSON();
                errorObj.detail = detail;
                errorObj.status = error.status;
                return errorObj;
            }
            /* Try to polyfill from common error types.*/
            var fallback = {
                code : error.code || error.statusCode,
                errorMessage: error.message || 'Internal Server Error',
                source : error.source || null,
                detail: detail
            };
            fallback.status = error.statusCode || error.code || 500;
            console.warn("Non-known error",fallback,"exception",error,". IT, please investigate and ask developers to create a known error for it.");
            return fallback;
        }
        return {
            code: 500,
            errorMessage: 'Internal Server Error',
            detail: detail
        };
    },
    defineErrors: defineErrors,
    knownErrors: knownErrors
};