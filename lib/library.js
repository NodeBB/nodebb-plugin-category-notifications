'use strict';

var routes = require('./routes');
var categoryNotification = require('./categoryNotifications');

(function(library) {

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

	library.onTopicPost = function(topic) {
		categoryNotification.onTopicPost(topic);
	};

	library.onTopicReply = function(post) {
		categoryNotification.onTopicReply(post);
	};

}(module.exports));

