'use strict';

var async = require('async'),
	db = require.main.require('./src/database'),

	plugins = require.main.require('./src/plugins'),
	user = require.main.require('./src/user'),
	notifications = require.main.require('./src/notifications');

var friends = {};

friends.getFriendsPageData = function(uid, callerUid, start, end, callback) {
	async.parallel({
		friends: function(next) {
			user.getUsersFromSet('uid:' + uid + ':friends', callerUid, start, end, next);
		},
		pendingFriends: function(next) {
			user.getUsersFromSet('uid:' + uid + ':friends:pending', callerUid, 0, -1, next);
		}
	}, callback);
};

friends.requestFriendship = function(uid, toUid, callback) {
	if (!parseInt(uid, 10) || !parseInt(toUid, 10)) {
		return callback(new Error('[[error:invalid-uid]]'));
	}

	async.parallel({
		isFriends: async.apply(friends.isFriends, uid, toUid),
		isFriendRequestSent: async.apply(friends.isRequestSent, uid, toUid)
	}, function(err, results) {
		if (err) {
			return callback(err);
		}

		if (results.isFriends) {
			return callback(new Error('[[error:already-friends]]'));
		} else if (results.isFriendRequestSent) {
			return callback(new Error('[[error:friend-request-already-sent]]'));
		}

		var now = Date.now();
		async.parallel([
			async.apply(db.sortedSetAdd, 'uid:' + uid + ':friends:requests', now, toUid),
			async.apply(db.sortedSetAdd, 'uid:' + toUid + ':friends:pending', now, uid),
		], function(err) {
			if (err) {
				return callback(err);
			}

			plugins.fireHook('action:friend.requested', {uid: uid, toUid: toUid});

			sendFriendRequestNotification(uid, toUid, callback);
		});
	});
};

function sendFriendRequestNotification(uid, toUid, callback) {
	user.getMultipleUserFields([uid, toUid], ['username', 'userslug'], function(err, userData) {
		if (err) {
			return callback(err);
		}
		var me = userData[0];
		var to = userData[1];

		notifications.create({
			bodyShort: me.username + ' wants to be friends',
			nid: 'friend:request:' + uid + ':uid:' + toUid,
			from: uid,
			path: '/user/' + to.userslug + '/friends'
		}, function(err, notification) {
			if (err) {
				return callback(err);
			}
			notifications.push(notification, [toUid], callback);
		});
	});
}

friends.acceptFriendship = function(uid, toUid, callback) {
	async.parallel({
		isFriends: async.apply(friends.isFriends, uid, toUid),
		isFriendPending: async.apply(friends.isPending, uid, toUid)
	}, function(err, results) {
		if (err) {
			return callback(err);
		}

		if (results.isFriends) {
			return callback(new Error('[[error:already-friends]]'));
		} else if (!results.isFriendPending) {
			return callback(new Error('[[error:no-friend-request]]'));
		}

		var now = Date.now();
		async.parallel([
			async.apply(db.sortedSetAdd, 'uid:' + uid + ':friends', now, toUid),
			async.apply(db.sortedSetRemove, 'uid:' + uid + ':friends:pending', toUid),
			async.apply(db.sortedSetRemove, 'uid:' + uid + ':friends:requests', toUid),
			async.apply(db.sortedSetAdd, 'uid:' + toUid + ':friends', now, uid),
			async.apply(db.sortedSetRemove, 'uid:' + toUid + ':friends:pending', uid),
			async.apply(db.sortedSetRemove, 'uid:' + toUid + ':friends:requests', uid),
		], function(err) {
			if (err) {
				return callback(err);
			}
			plugins.fireHook('action:friend.accepted', {uid: uid, toUid: toUid});
			callback();
		});
	});
};

friends.rejectFriendship = function(uid, toUid, callback) {
	async.parallel([
		async.apply(db.sortedSetRemove, 'uid:' + uid + ':friends:pending', toUid),
		async.apply(db.sortedSetRemove, 'uid:' + toUid + ':friends:requests', uid)
	], function(err) {
		if (err) {
			return callback(err);
		}
		plugins.fireHook('action:friend.rejected', {uid: uid, toUid: toUid});
		callback();
	});
};

friends.removeFriendship = function(uid, toUid, callback) {
	async.parallel([
		async.apply(db.sortedSetRemove, 'uid:' + uid + ':friends', toUid),
		async.apply(db.sortedSetRemove, 'uid:' + uid + ':friends:requests', toUid),
		async.apply(db.sortedSetRemove, 'uid:' + uid + ':friends:pending', toUid),
		async.apply(db.sortedSetRemove, 'uid:' + toUid + ':friends', uid),
		async.apply(db.sortedSetRemove, 'uid:' + toUid + ':friends:pending', uid),
		async.apply(db.sortedSetRemove, 'uid:' + toUid + ':friends:requests', uid)
	], function(err) {
		if (err) {
			return callback(err);
		}
		plugins.fireHook('action:friend.removed', {uid: uid, toUid: toUid});
		callback();
	});
};

friends.isFriends = function(uid, toUid, callback) {
	if (Array.isArray(toUid)) {
		db.isSortedSetMembers('uid:' + uid + ':friends', toUid, callback);
	} else {
		db.isSortedSetMember('uid:' + uid + ':friends', toUid, callback);
	}
};

friends.isPending = function(uid, toUid, callback) {
	if (Array.isArray(toUid)) {
		db.isSortedSetMembers('uid:' + uid + ':friends:pending', toUid, callback);
	} else {
		db.isSortedSetMember('uid:' + uid + ':friends:pending', toUid, callback);
	}
};

friends.isRequestSent = function(uid, toUid, callback) {
	if (Array.isArray(toUid)) {
		db.isSortedSetMembers('uid:' + uid + ':friends:requests', toUid, callback);
	} else {
		db.isSortedSetMember('uid:' + uid + ':friends:requests', toUid, callback);
	}
};

friends.areFriendsOrRequested = function(uid, uids, callback) {
	async.parallel({
		isFriends: async.apply(db.isSortedSetMembers, 'uid:' + uid + ':friends', uids),
		isRequested: async.apply(db.isSortedSetMembers, 'uid:' + uid + ':friends:requests', uids)
	}, function(err, results) {
		if (err) {
			return callback(err);
		}
		var result = [];
		results.isFriends.forEach(function(isFriend, index) {
			result[index] = isFriend || results.isRequested[index];
		});
		callback(null, result);
	});
};




module.exports = friends;