var express = require('express');
var async = require('async');
var app = express();

var mongo = require('mongoskin');

var db = mongo.db("mongodb://10.202.85.95/yelp/", {native_parser:true});

app.engine('.html', require('ejs').__express);
app.set('views', __dirname);
app.set('view engine', 'html');

app.get('/query/:param1/:param2', function(req, res) {
    var param1 = req.params.param1
    var param2 = req.params.param2    
    var query = {"state" : param1};
    var projection = {};
    db.collection('businesses')
        .find(query,projection)
        .sort( {review_count: -1 } )
        .limit(10)
        .toArray(function (err, business) {        
           

            async.map(business, 
                function(business, callback){ 
                    var query = {"business_id" : business.business_id, 
                                 "votes.useful" : { $gt : parseInt(param2)}};
                    db.collection('review')
                      .find(query)
                      .limit(10)
                      .toArray(function (err, reviews){

                        business.reviews = reviews;
                        callback(err, business); 

                      });
                },
                function(err, results){

                   res.render("business_map", {data: results, param1: param1, param2: param2});        

            });

    });
});

app.listen(3000);
console.log('listening on port 3000');
