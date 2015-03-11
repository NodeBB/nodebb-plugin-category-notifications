'use strict';

var async = require('async'),
	db = require.main.require('./src/database'),

	plugins = require.main.require('./src/plugins'),
	user = require.main.require('./src/user'),
	meta = require.main.require('./src/meta'),
	notifications = require.main.require('./src/notifications');

var categoryNotifications = {};


categoryNotifications.isSubscribed = function(uid, cid, callback) {
	db.isSortedSetMember('cid:' + cid + ':subscribed:uids', uid, callback);
};

categoryNotifications.subscribe = function(uid, cid, callback) {
	db.sortedSetAdd('cid:' + cid + ':subscribed:uids', Date.now(), uid, callback);
};

categoryNotifications.unsubscribe = function(uid, cid, callback) {
	db.sortedSetRemove('cid:' + cid + ':subscribed:uids', uid, callback);
};

categoryNotifications.onTopicPost = function(topic, callback) {
	callback = callback || function() {};

	meta.settings.get('category-notifications', function(err, settings) {
		if (err) {
			return callback(err);
		}

		if (settings.type === 'notification') {
			sendTopicNotification(topic);
		} else if (settings.type === 'email') {
			sendTopicEmail(topic);
		} else if (settings.type === 'both') {
			sendTopicEmail(topic);
			sendTopicNotification(topic);
		}
		callback();
	});
};

categoryNotifications.onTopicReply = function(post, callback) {
	callback = callback || function() {};

	meta.settings.get('category-notifications', function(err, settings) {
		if (err) {
			return callback(err);
		}

		if (settings.type === 'notification') {
			sendPostNotification(post);
		} else if (settings.type === 'email') {
			sendPostEmail(post);
		} else if (settings.type === 'both') {
			sendPostEmail(post);
			sendPostNotification(post);
		}
		callback();
	});
};

function sendTopicNotification(topic) {

}

function sendTopicEmail(topic) {

}

function sendPostNotification(post) {

}

function sendPostEmail(post) {

}


module.exports = categoryNotifications;