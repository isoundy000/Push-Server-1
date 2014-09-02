/**
 * Created by jinxc on 14-8-20.
 */
module.exports = function(app) {
    return new Event(app);
};

var Event = function(app) {
    //do construction
};

Event.prototype.add_servers = function(servers) {
    //do something when application add servers
};

Event.prototype.remove_servers = function(ids) {
    //do something when application remove servers
};

Event.prototype.replace_servers = function(servers) {
    //do something when server reconnected
};

Event.prototype.bind_session = function(session) {
    //do something when session binded
};

Event.prototype.close_session = function(session) {
    //do something when session closed
};