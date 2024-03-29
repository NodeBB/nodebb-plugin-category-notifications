'use strict';

$(document).ready(function () {
	$(window).on('action:ajaxify.end', function () {
		if (ajaxify.data.template.category && app.user.uid) {
			var unsubscribeHtml = '<button type="button" class="btn btn-default btn-warning unsubscribe"><i class="fa fa-pencil"></i> [[categorynotifications:unsubscribe]]</button>';
			var subscribeHtml = '<button type="button" class="btn btn-default btn-success subscribe"><i class="fa fa-pencil"></i> [[categorynotifications:subscribe]]</button>';

			var cid = ajaxify.data.cid;
			require(['translator', 'alerts'], function (translator, alerts) {
				socket.emit('plugins.categoryNotifications.isSubscribed', { cid: cid }, function (err, isSubscribed) {
					function handleClick(className, method) {
						$('.category').on('click', className, function () {
							socket.emit(method, { cid: cid }, function (err) {
								if (err) {
									return alerts.error(err.message);
								}
								var btn = className === '.subscribe' ? unsubscribeHtml : subscribeHtml;
								translator.translate(btn, function (translated) {
									$(className).replaceWith($(translated));
								});
							});
						});
					}

					if (err) {
						return alerts.error(err.message);
					}

					var btn = isSubscribed ? unsubscribeHtml : subscribeHtml;
					translator.translate(btn, function (translated) {
						$('[component="category/controls"]').prepend($(translated));
					});

					handleClick('.subscribe', 'plugins.categoryNotifications.subscribe');
					handleClick('.unsubscribe', 'plugins.categoryNotifications.unsubscribe');
				});
			});
		}
	});
});
