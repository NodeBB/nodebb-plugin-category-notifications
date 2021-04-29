<p>[[email:greeting_no_name]],</p>

<p>
	<a href="{url}/user/{user.slug}">
		<!-- IF user.picture -->
		<img style="vertical-align: middle; width: 32px; height: 32px; border-radius: 50%; padding-right: 1em;" src="{user.picture}" title="{user.name}"/>
		<!-- ELSE -->
		<div style="vertical-align: middle; width: 32px; height: 32px; line-height: 32px; font-size: 16px; background-color: {notifications.user.icon:bgColor}; color: white; text-align: center; display: inline-block; border-radius: 50%; padding-right: 1em;" title="{user.name}">{notifications.user.icon:text}</div>
		<!-- ENDIF notifications.image -->
	</a>
	<a href="{url}/user/{user.slug}">{user.name}</a> has posted a new topic called "<a href="{url}/topic/{topicSlug}">{title}</a>" in "<a href="{url}/category/{category.slug}">{category.name}</a>":
</p>

<blockquote>{content}</blockquote>

<a href="{url}/topic/{topicSlug}">Click here to view the topic</a>

<p>
	Thanks,<br />
	<strong>{site_title}</strong>
</p>

<hr />
<p>
	You are receiving this email because you have subscribed to <a href="{url}/category/{category.slug}">{category.name}</a>.
</p>