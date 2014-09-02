module.exports = function (app) {
    return new Handler(app);
};

var Handler = function (app) {
    this.app = app;
};

var handler = Handler.prototype;

/**
 * New client entry chat server.
 *
 * @param  {Object}   msg     request message
 * @param  {Object}   session current session object
 * @param  {Function} next    next stemp callback
 * @return {Void}
 */
handler.enter = function (msg, session, next) {
    var self = this;
    var rid = msg.rid;
    var uid = msg.username + '*' + rid
    var sessionService = self.app.get('sessionService');

    //duplicate log in
    if (!!sessionService.getByUid(uid)) {
        next(null, {
            code: 500,
            error: true
        });
        return;
    }

    session.bind(uid);
    session.set('rid', rid);
    session.push('rid', function (err) {
        if (err) {
            console.error('set rid for session service failed! error is : %j', err.stack);
        }
    });
    session.on('closed', onUserLeave.bind(null, self.app));

    //put user into channel
    self.app.rpc.chat.chatRemote.add(session, uid, self.app.get('serverId'), rid, true, function (users) {
        next(null, {
            users: users
        });
    });
};

/**
 * User log out handler
 *
 * @param {Object} app current application
 * @param {Object} session current session object
 *
 */
var onUserLeave = function (app, session) {
    if (!session || !session.uid) {
        return;
    }
    app.rpc.chat.chatRemote.kick(session, session.uid, app.get('serverId'), session.get('rid'), null);
};

Handler.prototype.author = function (msg, session, next) {
    var self = this;
    var uid = msg.username;

    var sessionService = this.app.get('sessionService');
    //duplicate log in
    if (!!sessionService.getByUid(uid)) {
        next(null, {
            code: 500,
            error: true
        });
        return;
    }
    // seesion 与 客户端进行绑定操作.
    session.bind(uid);
    session.on('closed', onLeave.bind(null, this.app, rid));
    self.app.rpc.push.pushRemote.author(uid, uid, this.app.get('serverId'), function (err, users) {
        if (err) {
            console.log('error-->' + err);
            return;
        } else {
            next(null, {
                users: users
            });
        }
    });
};

/**
 * 进入房间
 * @param msg
 * @param session
 * @param next
 */
Handler.prototype.join = function (msg, session, next) {
    var self = this;
    var rid = msg.rid;
    var uid = msg.username;

    var sessionService = this.app.get('sessionService');
    if (!!sessionService.getByUid(uid)) {
        self.app.rpc.push.pushRemote.add(rid, uid, this.app.get('serverId'), rid, function (err, users) {
            if (err) {
                console.log('error-->' + err);
                return;
            } else {
                next(null, {
                    users: users
                });
            }
//        if (users) {
//            //发回给web management 的消息
//            next(null, {code: 200, msg: 'push server is ok.', users: users});
//        } else {
//            //
//            next(null, {code: 200, msg: "add ok", users: users});
//        }
        });
    } else {
        next(null, {
            code: 500,
            error: true
        });
    }
};

var onLeave = function (app, channelName, session) {
    console.log('onLeave userleave');
    if (!session || !session.uid) {
        return;
    }

    app.rpc.push.pushRemote.kick(channelName, session.uid, app.get('serverId'), channelName, function (err) {
        console.log(err);
    });

}