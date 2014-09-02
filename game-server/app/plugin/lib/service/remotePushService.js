/**
 * Created by jinxc on 14-8-20.
 */
var redis = require('redis');
var DefaultManager = require('../manager/remotePushManager');
var logger = require('pomelo-logger').getLogger(__filename);

var RemotePushService = function (app, opts) {
    this.app = app;
    this.opts = opts || {};
    this.manager = new DefaultManager(app, opts);
};

module.exports = RemotePushService;

RemotePushService.prototype.start = function (cb) {
// do something application start
    this.manager.start(cb);
};

RemotePushService.prototype.stop = function (force, cb) {
// do something on application stop
    this.manager.stop(force, cb);
};
