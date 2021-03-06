var db = require('mongo_schemas');
var _ = require('lodash');

module.exports = (function() {
  var _return = {};

  _return.get = function(req, res) {
    var _r = [];
    if (req.user && req.user.task) {
      req.user.task.forEach(function(task) {
        _r.push({
          title: task.title,
          _id: task._id
        });
      });
    }
    res.send(_r);
  };

  _return.post = function(req, res) {
    var my_task_ids = [];
    if (req.user && req.user.task) {
      req.user.task.forEach(function(task) {
        my_task_ids.push(String(task._id));
      });
    }

    var exp = req.body;
    if (exp.title && exp.text && exp._task &&
      _.includes(my_task_ids, exp._task)) {

      exp._writer = req.user._id;
      new db.experience(exp).save(function(err) {
        if (err) {
          res.json({
            save: false,
            err: err
          });
        } else {
          res.json({
            save: true
          });
          db.tasks.findOne({
            _id: exp._task
          }, {
            title: true,
            name: true,
            _id: false
          }).lean().exec(function(err, task) {
            console.log(
              'new experience add by -> ' +
              req.user.first_name +
              " " + req.user.last_name +
              " as " + task.title +
              " / " + task.name);
          });
        }
      });

    } else {
      res.json({
        err: "low args"
      });
    }
  };

  return _return;
})();
