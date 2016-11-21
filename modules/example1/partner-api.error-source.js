'use strict';

require('../errors/error-source.js')
.register("partner-api",function(error,response) {
    error.detail.reasonCode = response.code;
    error.detail.reasonMessage = response.message; 
});