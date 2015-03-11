<h1>Category Notifications</h1>


<form class="form category-notifications-settings">
	<div class="row">
		<div class="col-sm-6 col-xs-12">
			<div class="form-group">
				<label>Notification Setting</label>
				<select id="notificationSetting" name="type" class="form-control" >
					<option value="email">Send Email Only</option>
					<option value="notification">Send Notification Only</option>
					<option value="both">Send Both Email and Notification</option>
				</select>
			</div>
		</div>
	</div>
</form>

<button class="btn btn-primary" id="save">Save</button>

<script type="text/javascript">
	'use strict';
	/* globals app */
	require(['settings'], function(Settings) {
		Settings.load('category-notifications', $('.category-notifications-settings'), function(err, settings) {
			if (err) {
				return app.alertError(err.message);
			}
		});

		$('#save').on('click', function() {
			Settings.save('category-notifications', $('.category-notifications-settings'), function(err) {
				if (err) {
					return app.alertError(err.message);
				}
				app.alertSuccess('Saved');
			});
			return false;
		});
	});

</script>