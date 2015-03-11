
'use strict';

var controllers = require('./controllers'),
	helpers = require.main.require('./src/routes/helpers');

(function(routes) {


	routes.init = function(params, callback) {


		params.router.get('/admin/plugins/category-notifications', params.middleware.admin.buildHeader, controllers.getAdmin);
		params.router.get('/api/admin/plugins/category-notifications', controllers.getAdmin);

		callback();
	};


}(module.exports));

