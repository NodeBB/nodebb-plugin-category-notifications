'use strict';

const routes = module.exports;

routes.init = function (params) {
	const routesHelpers = require.main.require('./src/routes/helpers');
	routesHelpers.setupAdminPageRoute(params.router, '/admin/plugins/category-notifications', params.middleware, [], (req, res) => {
		res.render('admin/plugins/category-notifications', {});
	});
};


