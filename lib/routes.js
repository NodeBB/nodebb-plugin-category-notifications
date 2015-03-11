
'use strict';

var controllers = require('./controllers'),
	helpers = require.main.require('./src/routes/helpers');

(function(routes) {


	routes.init = function(params, callback) {
		var middlewares = [params.middleware.checkGlobalPrivacySettings];

		helpers.setupPageRoute(params.router, '/user/:userslug/friends', params.middleware, middlewares, controllers.getFriends);

		callback();
	};


}(module.exports));

