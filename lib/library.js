'use strict';

var routes = require('./routes');
var categoryNotification = require('./categoryNotifications');

var library = module.exports;

library.init = function(params, callback) {
	require('./websockets');
	routes.init(params, callback);
};

library.adminMenu = function(menu, callback) {
	menu.plugins.push({
		route: '/plugins/category-notifications',
		icon: 'fa-pencil',
		name: 'Category Notifications'
	});

	callback(null, menu);
};

library.onTopicPost = function(data) {
	categoryNotification.onTopicPost(data.topic);
};

library.onTopicReply = function(data) {
	categoryNotification.onTopicReply(data.post);
};

library.onUserDelete = function (data) {
	categoryNotification.onUserDelete(data);
};


