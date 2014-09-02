var pushRemote = require('../remote/pushRemote');

module.exports = function (app) {
    return new Handler(app);
};
/**
 *
 * @param app
 * @constructor
 */
var Handler = function (app) {
    this.app = app;
    this.channelService = app.get('channelService');
    this.statusService = this.app.get('statusService');
    this.globalChannel = this.app.get('globalChannelService');
};

var handler = Handler.prototype;

/**
 *
 * @param msg
 * @param next
 */
handler.broadcast = function (msg, session, next) {
    this.globalChannel.pushMessage('connector', 'onMsg', msg, 'global', {}, function (err) {
        next(null, {
            route: msg.route
        });
    });
};

/**
 *
 * @param uids 用户id数组
 * @param route
 * @param msg
 * @param next
 */
handler.pushByUids = function (msg, session, next) {
    var uids = msg.client;
    var message =msg.msg;
    this.statusService.pushByUids(uids, 'onMsg', message, function (err) {
        console.log('statusService pushByUids');
        next(null, {
            route: msg.route
        });
    });
};

/**
 *
 * @param msg
 * @param session
 * @param next
 */
handler.pushByChannelId = function (msg, session, next) {
    var cid = msg.rid;
    console.log("---channel id:"+cid);
    this.app.rpc.push.pushRemote.pushByChannelId(cid, session.uid,cid, msg, next);
};

/**
 *
 * @param msg
 * @param next
 */
handler.pushByServerid = function (session, msg, next) {
    var sid = msg.sid;
    /*    this.globalChannel.getMembersBySid('*', sid, function (err, list) {
     var message = {
     client: list,
     msg: msg
     }
     this.pushByUids(session, msg, next);
     });*/
    this.app.rpc.push.pushRemote.pushByServerid.toServer(sid, msg, next);
};