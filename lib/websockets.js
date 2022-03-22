'use strict';

const sockets = require.main.require('./src/socket.io/plugins');
const categoryNotifications = require('./categoryNotifications');

sockets.categoryNotifications = {};

sockets.categoryNotifications.subscribe = async function (socket, data) {
	if (!socket.uid || !data || !data.cid) {
		throw new Error('[[error:invalid-data]]');
	}
	await categoryNotifications.subscribe(socket.uid, data.cid);
};

sockets.categoryNotifications.unsubscribe = async function (socket, data) {
	if (!socket.uid || !data || !data.cid) {
		throw new Error('[[error:invalid-data]]');
	}

	await categoryNotifications.unsubscribe(socket.uid, data.cid);
};

sockets.categoryNotifications.isSubscribed = async function (socket, data) {
	if (!socket.uid || !data) {
		throw new Error('[[error:invalid-data]]');
	}
	if (!data.cid) {
		return;
	}
	return await categoryNotifications.isSubscribed(socket.uid, data.cid);
};
