'use strict';


var sockets = require.main.require('./src/socket.io/plugins');
var categoryNotifications = require('./categoryNotifications');

sockets.categoryNotifications = {};

sockets.categoryNotifications.subscribe = function(socket, data, callback) {
	if (!socket.uid || !data || !data.cid) {
		return callback(new Error('[[error:invalid-data]]'));
	}
	categoryNotifications.subscribe(socket.uid, data.cid, callback);
};

sockets.categoryNotifications.unsubscribe = function(socket, data, callback) {
	if (!socket.uid || !data || !data.cid) {
		return callback(new Error('[[error:invalid-data]]'));
	}

	categoryNotifications.unsubscribe(socket.uid, data.cid, callback);
};

sockets.categoryNotifications.isSubscribed = function(socket, data, callback) {
	if (!socket.uid || !data) {
		return callback(new Error('[[error:invalid-data]]'));
	}
	if (!data.cid) {
		return callback();
	}
	categoryNotifications.isSubscribed(socket.uid, data.cid, callback);
};
