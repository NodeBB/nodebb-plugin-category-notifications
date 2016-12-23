
'use strict';

var routes = module.exports;

routes.init = function(params, callback) {
	params.router.get('/admin/plugins/category-notifications', params.middleware.admin.buildHeader, renderAdmin);
	params.router.get('/api/admin/plugins/category-notifications', renderAdmin);

	callback();
};

function renderAdmin(req, res, next) {
	res.render('admin/plugins/category-notifications', {});
}

