'use strict';

const routes = require('./routes');
const categoryNotification = require('./categoryNotifications');

const library = module.exports;

library.init = function (params) {
	require('./websockets');
	routes.init(params);
};

library.adminMenu = function (menu) {
	menu.plugins.push({
		route: '/plugins/category-notifications',
		icon: 'fa-pencil',
		name: 'Category Notifications',
	});
	return menu;
};

library.onTopicPost = function (data) {
	categoryNotification.onTopicPost(data.topic);
};

library.onTopicReply = function (data) {
	categoryNotification.onTopicReply(data.post);
};

library.onUserDelete = function (data) {
	categoryNotification.onUserDelete(data);
};


