/**
 * Created by jinxc on 14-8-20.
 */
var RemotePushService = require('../service/remotePushService');

module.exports = function(app, opts) {
    var service = new RemotePushService(app, opts);
    //app.set('remotePushService', service, true);
    service.name = '__remotePush__';
    return service;
};