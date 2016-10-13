'use strict';


function sendResponse( result, res ) {
    res.status(200).json(result).end();
}

module.exports = function( req, res, next ) {
    res.serve = function( logic ) {
        try 
        {
            console.log('Serving');
            var data = logic(req.auth,req.body,req.params, req.query);
            if (data)
            {
                if (data.catch) data.catch( function(error) { next(error);});
                if (data.then) 
                    data.then( function(result) {
                        console.log('DONE');
                        sendResponse(result,res);
                    });
                else 
                    sendResponse(data,res);
            } else {
                res.status(500).send('No data');
            }
        } catch (e) {
            next(e);
        }
    };
    next();
};