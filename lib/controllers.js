'use strict';

var async = require('async');
var db = require.main.require('./src/database');
var categoryNotifications = require('./categoryNotifications');

var controllers = {};

controllers.getAdmin = function(req, res, next) {
	res.render('admin/plugins/category-notifications', {});
};

module.exports = controllers;