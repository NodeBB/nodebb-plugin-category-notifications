'use strict';

var async = require('async');
var friends = require('./friends');

var usersController = require.main.require('./src/controllers/accounts');

var controllers = {};

controllers.getFriends = function(req, res, next) {
	var uid = req.user ? req.user.uid : 0;
	var userData;

	async.waterfall([
		function(next) {
			usersController.getBaseUser(req.params.userslug, uid, next);
		},
		function(_userData, next) {
			userData = _userData;
			friends.getFriendsPageData(userData.uid, uid, 0, 49, next);
		}
	], function(err, friendsData) {
		if (err) {
			return next(err);
		}
		userData.users = friendsData.friends;
		if (parseInt(userData.uid, 10) === parseInt(uid, 10)) {
			userData.pendingFriends = friendsData.pendingFriends;
		}

		res.render('friends', userData);
	});
};

module.exports = controllers;