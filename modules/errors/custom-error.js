'use static';

const rx_pattern = /\$\{([^\}]+)\}/gm;
const default_error_message = "Internal Server Error";
const util = require('util');
const getHashCode = require('./hashcode');

function substitute( template, variables, defaultValue ) {
    if (!template) return defaultValue;
    if (!variables) variables = {};
    var result = template.replace(rx_pattern, function(t){
        
        var key = t.substring(2,t.length-1);
        var fallback = "";
        var p = key.indexOf('|');
        if (p > 0) {
            fallback = key.substr(p+1);
            key = key.substr(0,p);
        }
        key = key.trim();
        return variables[key] || fallback;
    });
    return result;
}

function CustomError(options,detail) {
    this.options = options || {};
    this.detail = detail || {};
    Error.captureStackTrace(this, this.constructor);

    for (var name in this.options.parameters) {
        var param = this.options.parameters[name];
        if (param.required && !detail.hasOwnProperty(param.name))
            console.warn('Missing required parameter',name,'in',this);
    }
}

function customErrorFactory(errorName,errorCode,options,base) {
    if (!options) options = {};
    if (!base) base = CustomError;
    if (!options.parameters) options.parameters = {};
    for (var name in options.parameters) {
        var param = options.parameters[name];
        if (!param) options.parameters[name] = { required: false, expose: false, value: null };
        else if (typeof param !== 'object') {
            options.parameters[name] = { required: false, expose: false, value: param };
        }
        if (typeof param.expose === 'string') {
            param.exposeAs = param.expose;
            param.expose = true;
        } else if (param.expose && ! param.exposeAs) {
            param.exposeAs = name;
        }
    }
    
    var result = function(detail) {
        CustomError.call(this,options,detail);
    };
    
    util.inherits(result,base);

    Object.defineProperty(result.prototype,"code",{ value: errorCode, writable: false });
    Object.defineProperty(result.prototype,"name",{ value: errorName, writable: false });
    Object.defineProperty(result.prototype,"status",{ value: options.status, writable: false });
    Object.defineProperty(result.prototype,"source",{ value: options.module, writable: false });
    

    return result;
}

util.inherits(CustomError,Error);

Object.defineProperty(CustomError.prototype,"isKnownError",{
    value: true,
    writable: false
});

CustomError.prototype.getMessageText = function(context) {
    try {
        var message = null;
        var t = context && this.detail ? Object.assign({},context,this.detail) : this.detail;
        
        if (this.options && this.options.message) message = substitute(this.options.message,t,default_error_message);
        if (!message || message.length == 0) {
            console.error('FAILED TO GENERATE ERROR MESSAGE FROM',this.detail);
        }
        return message;
    } catch (error) {
        console.error('FAILED TO GENERATE ERROR MESSAGE FROM',this.detail,'ERROR',error);
    }
    return default_error_message;
};

CustomError.prototype.toJSON = function( context ) {
    var result = {};
    result.message = this.getMessageText(context);
    result.source = this.source;
    result.code = this.code;
    for (var name in this.options.parameters) {
        var param = this.options.parameters[name];
        if (param.expose) {
            result[param.exposeAs || name] = this.detail[name];
        }
    }
    return result;
};

Object.defineProperty(CustomError.prototype,"message",{
    get: function() {
        return this.getMessageText(null);
    }
});

module.exports = {
    CustomError : CustomError,
    customErrorFactory: customErrorFactory
};