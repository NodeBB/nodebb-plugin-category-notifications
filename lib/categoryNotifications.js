'use strict';

var async = require('async'),
	db = require.main.require('./src/database'),
	nconf = require.main.require('nconf'),

	plugins = require.main.require('./src/plugins'),
	user = require.main.require('./src/user'),
	meta = require.main.require('./src/meta'),
	emailer = require.main.require('./src/emailer'),
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

function getSubscribers(cid, exceptUid, callback) {
	db.getSortedSetRange('cid:' + cid + ':subscribed:uids', 0, -1, function(err, uids) {
		if (err) {
			return callback(err);
		}
		uids = uids.filter(function(uid) {
			return parseInt(uid, 10) !== parseInt(exceptUid, 10);
		});

		callback(null, uids);
	});
}

categoryNotifications.onTopicPost = function(topic, callback) {
	callback = callback || function() {};

	meta.settings.get('category-notifications', function(err, settings) {
		if (err) {
			return callback(err);
		}

		settings.type = settings.type || 'email';

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

		settings.type = settings.type || 'email';

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
	getSubscribers(topic.cid, topic.user.uid, function(err, uids) {
		if (err || !uids.length) {
			return;
		}

		notifications.create({
			bodyShort: '[[notifications:user_posted_topic, ' + topic.user.username + ', ' + topic.title + ']]',
			bodyLong: topic.mainPost.content,
			pid: topic.mainPost.pid,
			path: '/post/' + topic.mainPost.pid,
			nid: 'tid:' + topic.tid + ':uid:' + topic.uid,
			tid: topic.tid,
			from: topic.uid
		}, function(err, notification) {
			if (!err && notification) {
				notifications.push(notification, uids);
			}
		});
	});
}

function sendTopicEmail(topic) {
	getSubscribers(topic.cid, topic.user.uid, function(err, uids) {
		if (err || !uids.length) {
			return;
		}

		var tpl = 'categoryNotifications_topic',
			params = {
				subject: 'New Topic in "' + topic.category.name + '"',
				site_title: meta.config.title || 'NodeBB',
				url: nconf.get('url'),
				title: topic.title,
				topicSlug: topic.slug,
				category: {
					name: topic.category.name,
					slug: topic.category.slug
				},
				content: topic.mainPost.content,
				user: {
					slug: topic.user.userslug,
					name: topic.user.username,
					picture: topic.user.picture
				}
			};

		async.eachLimit(uids, 50, function(uid, next) {
			emailer.send(tpl, uid, params, next);
		}, function(err) {
			if (err) {
				console.error(err);
			}
		});
	});
}

function sendPostNotification(post) {
	getSubscribers(post.topic.cid, post.user.uid, function(err, uids) {
		if (err || !uids.length) {
			return;
		}

		notifications.create({
			bodyShort: '[[notifications:user_posted_to, ' + post.user.username + ', ' + post.topic.title + ']]',
			bodyLong: post.content,
			pid: post.pid,
			path: '/post/' + post.pid,
			nid: 'tid:' + post.topic.tid + ':pid:' + post.pid + ':uid:' + post.uid,
			tid: post.topic.tid,
			from: post.uid
		}, function(err, notification) {
			if (!err && notification) {
				notifications.push(notification, uids);
			}
		});
	});
}

function sendPostEmail(post) {
	getSubscribers(post.topic.cid, post.user.uid, function(err, uids) {
		if (err || !uids.length) {
			return;
		}

		var tpl = 'categoryNotifications_post',
			params = {
				subject: 'New Reply in "' + post.topic.title + '"',
				site_title: meta.config.title || 'NodeBB',
				url: nconf.get('url'),
				title: post.topic.title,
				topicSlug: post.topic.slug,
				content: post.content,
				user: {
					slug: post.user.userslug,
					name: post.user.username,
					picture: post.user.picture
				},
				pid: post.pid
			};

		async.eachLimit(uids, 50, function(uid, next) {
			emailer.send(tpl, uid, params, next);
		}, function(err) {
			if (err) {
				console.error(err);
			}
		});
	});
}


module.exports = categoryNotifications;