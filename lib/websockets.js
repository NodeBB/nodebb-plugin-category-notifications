'use strict';


var sockets = require.main.require('./src/socket.io/plugins');
var friends = require('./friends');

sockets.friends = {};

sockets.friends.friend = function(socket, data, callback) {
	if (!socket.uid || !data || !data.uid) {
		return callback(new Error('[[error:invalid-data]]'));
	}
	
	friends.requestFriendship(socket.uid, data.uid, callback);
};

sockets.friends.unfriend = function(socket, data, callback) {
	if (!socket.uid || !data || !data.uid) {
		return callback(new Error('[[error:invalid-data]]'));
	}
	friends.removeFriendship(socket.uid, data.uid, callback);	
};

sockets.friends.accept = function(socket, data, callback) {
	if (!socket.uid || !data || !data.uid) {
		return callback(new Error('[[error:invalid-data]]'));
	}
	friends.acceptFriendship(socket.uid, data.uid, callback);
};

sockets.friends.reject = function(socket, data, callback) {
	if (!socket.uid || !data || !data.uid) {
		return callback(new Error('[[error:invalid-data]]'));
	}
	friends.rejectFriendship(socket.uid, data.uid, callback);
};

sockets.friends.areFriendsOrRequested = function(socket, data, callback) {
	if (!socket.uid || !data || !data.uid) {
		return callback(new Error('[[error:invalid-data]]'));
	}
	friends.areFriendsOrRequested(socket.uid, [parseInt(data.uid, 10)], callback);
};

