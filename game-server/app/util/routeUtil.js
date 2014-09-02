var exp = module.exports;
var dispatcher = require('./dispatcher');

exp.chat = function(session, msg, app, cb) {
	var chatServers = app.getServersByType('chat');

	if(!chatServers || chatServers.length === 0) {
		cb(new Error('can not find chat servers.'));
		return;
	}

	var res = dispatcher.dispatch(session.get('rid'), chatServers);

	cb(null, res.id);
};

exp.push = function(key, msg, app, cb) {
    var pushServers = app.getServersByType('push');

    if(!pushServers || pushServers.length === 0) {
        cb(new Error('can not find chat servers.'));
        return;
    }

    var res = dispatcher.dispatch(key, pushServers);

    cb(null, res.id);
};