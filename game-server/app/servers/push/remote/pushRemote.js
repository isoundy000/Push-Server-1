module.exports = function (app) {
    return new PushRemote(app);

};

var PushRemote = function (app) {
    this.app = app;
    this.channelService = app.get('channelService');
    this.statusService = this.app.get('statusService');
    this.globalChannel = this.app.get('globalChannelService');
};

/**
 * Get user from chat channel.
 *
 * @param {String} name channel name
 * @param {boolean} flag channel parameter
 * @return {Array} users uids in channel
 *
 */
PushRemote.prototype.getUsers = function (name, flag) {
    var users = [];
    var channel = this.channelService.getChannel(name, flag);
    if (!!channel) {
        users = channel.getMembers();
    }
//    for (var i in users) {
//        if (!users[i]) {
//            users.splice(i);
//        }
//    }
    return users;
};

PushRemote.prototype.author = function (uid, sid, cb) {

    this.statusService.add(uid, sid, function () {
        console.log('statusService add:' + uid);
    });
    this.globalChannel.add('global', uid, sid, function () {
        console.log('globalChannel add:' + uid);
    });

    cb(null);
};

//把客户端添加到推送列表中
PushRemote.prototype.add = function (uid, sid, channelName, cb) {
    var channel = this.channelService.getChannel(channelName, true);
    var param = {
        route: 'onAdd',
        user: uid
    };
    channel.pushMessage(param);

/*    this.statusService.add(uid, sid, function () {
        console.log('statusService add:' + uid);
    });
    this.globalChannel.add('global', uid, sid, function () {
        console.log('globalChannel add:' + uid);
    });*/

    if (!!channel) {
        channel.add(uid, sid);
    }

    console.log(channelName + "--sid-->" + sid);

    cb(null, this.getUsers(channelName, false));
};

//删除推送列表中离线的客户端
PushRemote.prototype.kick = function (uid, sid, channelName, cb) {
    var channel = this.channelService.getChannel(channelName, false);
    if (!!channel) {
        console.log('kick' + uid);
        channel.leave(uid, sid);
    }
    var param = {
        route: 'onLeave',
        user: uid
    };
    //channel.pushMessage(param);
    /**
     *
     */
    this.statusService.leave(uid, sid, function () {
        console.log('statusService leave:' + uid);
    });

    this.globalChannel.leave('global', uid, sid, function () {
        console.log('globalChannel leave:' + uid);
    });
    cb();
};

/**
 *
 * @param msg
 * @param next
 */
PushRemote.prototype.pushByServerid = function (msg, next) {
    this.channelService.broadcast('connector', 'onMsg', msg, {}, function (err) {
        console.log('channelService pushByServerid');
        next(null, {
            route: msg.route
        });
    })
};

/**
 *
 * @param msg
 * @param next
 */
PushRemote.prototype.pushByChannelId = function (uid, cid, msg, next) {
    console.log('channelService pushByChannelId');
    var pushMsg = this.channelService.getChannel(cid, false);
    var param = {
        msg: msg.content,
        from: uid,
        target: msg.target
    };
    pushMsg.pushMessage('onMsg', param);
    next(null, {
        route: msg.route
    });
};


/**
 *
 * @param msg
 * @param next
 */
PushRemote.prototype.broadcast = function (msg, cb) {
    this.globalChannel.pushMessage('connector', 'onMsg', msg, 'global', {}, function (err) {
        cb(err);
    });
};


PushRemote.prototype.pushByUids = function (client, message, cb) {
    this.statusService.pushByUids(client, 'onMsg', message, function (err) {
        console.log('statusService pushByUids');
        cb(err);
    });
};