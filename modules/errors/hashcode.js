'use strict';
module.exports = function( id ) {
    if (!id) return 0;
    if (typeof id !== 'string') throw new TypeError("Invalid code, string expected");
    var hash = 17;
    if (id.length == 0) return hash;
    for (var i = 0; i < id.length; i++) {
        var character = id.charCodeAt(i);
        hash = ((hash<<5)-hash)+character;
        hash = hash & hash; // Convert to 32bit integer
    }
    return Math.abs(hash);
};