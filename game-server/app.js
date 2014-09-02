var pomelo = require('pomelo');
var routeUtil = require('./app/util/routeUtil');
/**
 * Init app for client.
 */
var app = pomelo.createApp();
app.set('name', 'chatofpomelo-websocket');

var status = require('pomelo-status-plugin');

app.configure('production|development', 'push', function () {
    app.use(status, {status: {
        host: '127.0.0.1',
        port: 6379
    }});
});

var globalChannel = require('pomelo-globalchannel-plugin');

app.configure('production|development', 'push', function () {
    app.use(globalChannel, {globalChannel: {
        host: '127.0.0.1',
        port: 6379,
        db: '1'       // optinal, from 0 to 15 with default redis configure
    }});
});

var app_plugin = require('./app/plugin');

app.configure('production|development', 'gate', function () {
    app.use(app_plugin, {remotePush: {
        host: '127.0.0.1',
        port: 6379,
        db: '2'       // optinal, from 0 to 15 with default redis configure
    }});
});

// app configuration
app.configure('production|development', 'connector', function () {
    app.set('connectorConfig',
        {
            connector: pomelo.connectors.hybridconnector,
            heartbeat: 3,
            useDict: true,
            useProtobuf: true
        });
});

app.configure('production|development', 'gate', function () {
    app.set('connectorConfig',
        {
            connector: pomelo.connectors.hybridconnector,
            useProtobuf: true
        });
});

// app configure
app.configure('production|development', function () {
    // app.enable('systemMonitor');
    // route configures
    app.route('chat', routeUtil.chat);
    app.route('push', routeUtil.push);
    // filter configures
    // app.filter(pomelo.timeout());
});

// start app
app.start();

process.on('uncaughtException', function (err) {
    console.error(' Caught exception: ' + err.stack);
});