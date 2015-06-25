var db = require('mongo_schemas');
var _ = require('lodash');


module.exports = (function() {
    var _return = {};

    _return.get = function(req, res, next) {
        next();
    };

    _return.post = function(req, res, next) {
        /* 
        data need to be something like this :
        { 
            type : "add/list/edit" , 
            data : {}
        }
        */

        console.open(req.body);
        if ((_.includes(req.user._permissions, "root") || _.includes(req.user._permissions, "stations"))) {
            if (req.body && req.body.type == "add" && req.body.data) {
                var station = req.body.data;
                station._creator = req.user._id;
                new db.stations(station).save(function(err, data) {
                    if (err) {
                        console.log(err);
                        res.json({
                            add: false
                        });
                    } else if (data) {
                        res.json({
                            add: true,
                            data: data
                        })
                    }
                });
            } else if (req.body && req.body.type == "list") {
                db.stations.find().populate({
                    path: '_creator',
                    select: 'first_name last_name -_id'
                }).lean().exec(function(err, stations) {
                    if (err) {
                        console.log(err);
                    } else if (stations) {
                        // todo : add persion date to each on
                        res.json(stations);
                    }
                });
            } else if (req.body && req.body.type == "edit" && req.body.data) {
                db.users.findOne({
                    _id: req.body.data._id
                }, function(err, staion) {
                    if (err) {
                        console.log(err);
                    } else if (staion) {
                        for (i in req.body.data) {
                            staion[i] = req.body.data[i];
                        }
                        staion.save(function(err) {
                            if (err) {
                                res.json({
                                    edit: false
                                });
                            } else {
                                res.json({
                                    edit: true
                                });
                            }
                        });
                    }
                });
            }
        } else next();

    };

    return _return;
})();