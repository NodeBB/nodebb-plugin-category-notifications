'use strict';

define('admin/plugins/category-notifications', [
	'settings', 'alerts',
], function (settings, alerts) {
	var ACP = {};

	ACP.init = function () {
		settings.load('category-notifications', $('.category-notifications-settings'));
		$('#save').on('click', saveSettings);
	};

	function saveSettings() {
		settings.save('category-notifications', $('.category-notifications-settings'), function () {
			alerts.alert({
				type: 'success',
				alert_id: 'category-notifications-saved',
				title: 'Settings Saved',
			});
		});
	}

	return ACP;
});
