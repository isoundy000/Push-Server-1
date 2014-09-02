var utils = require('../util/utils');
var redis = require('redis');

var DEFAULT_PREFIX = 'REMOTE:PUSH';

var RemotePushManager = function (app, opts) {
    this.app = app;
    this.opts = opts || {};
    this.prefix = opts.prefix || DEFAULT_PREFIX;
    this.host = opts.host;
    this.port = opts.port;
    this.db = opts.db || '0';
    this.sub = null;
};

module.exports = RemotePushManager;

RemotePushManager.prototype.start = function (cb) {
    this.sub = redis.createClient(this.port, this.host, this.opts);
    if (this.opts.auth_pass) {
        this.sub.auth(this.opts.auth_pass);
    }
    var self = this;
    this.sub.on("error", function (err) {
        console.error("[remote-push-plugin][redis][sub]" + err.stack);
    });
    this.sub.once('ready', function (err) {
        if (!!err) {
            cb(err);
        } else {
            self.sub.select(self.db, cb);
            self.sub.subscribe(self.prefix);
        }
    });
    this.sub.on("message", function (channel, message) {
        var msg = JSON.parse(message);
        if (msg) {
            console.log(msg);
            var type = msg.type;
            var content = msg.content;
            var from = msg.from;
            if (type) {
                if (type == 'user') {
                    var clients = msg.clients;
                    self.app.rpc.push.pushRemote.pushByUids.toServer('push-server-1', clients, content, function (err) {
                        console.log('----------------')
                    })
                } else if (type == 'channel') {
                    var cid = msg.cid;
                    self.app.rpc.push.pushRemote.pushByChannelId(cid, from, cid, content, function (err) {

                    });
                } else if (type == 'server') {
                    var sid = msg.sid;
                    self.app.rpc.push.pushRemote.pushByServerid.toServer(sid, content, function (err) {

                    })

                } else if (type == 'broadcast') {
                    self.app.rpc.push.pushRemote.broadcast.toServer('push-server-1', content, function (err) {

                    })
                }
            }
        }
    });
};

RemotePushManager.prototype.stop = function (force, cb) {
    if (this.sub) {
        this.sub.end();
        this.sub = null;
    }
    utils.invokeCallback(cb);
};
