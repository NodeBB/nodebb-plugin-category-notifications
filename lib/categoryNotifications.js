'use strict';

const async = require('async');

const nconf = require.main.require('nconf');
const db = require.main.require('./src/database');
const meta = require.main.require('./src/meta');
const emailer = require.main.require('./src/emailer');
const notifications = require.main.require('./src/notifications');
const user = require.main.require('./src/user');
const categories = require.main.require('./src/categories');

const categoryNotifications = module.exports;

categoryNotifications.isSubscribed = async function (uid, cid) {
	return await db.isSortedSetMember(`cid:${cid}:subscribed:uids`, uid);
};

categoryNotifications.subscribe = async function (uid, cid) {
	await db.sortedSetAdd(`cid:${cid}:subscribed:uids`, Date.now(), uid);
};

categoryNotifications.unsubscribe = async function (uid, cid) {
	await db.sortedSetRemove(`cid:${cid}:subscribed:uids`, uid);
};

categoryNotifications.onUserDelete = async function (data) {
	const cids = await db.getSortedSetRange('categories:cid', 0, -1);
	await db.sortedSetsRemove(
		cids.map(cid => `cid:${cid}:subscribed:uids`),
		data.uid
	);
};

async function getSubscribers(cid, exceptUid) {
	const uids = await db.getSortedSetRange(`cid:${cid}:subscribed:uids`, 0, -1);
	return uids.filter(uid => parseInt(uid, 10) !== parseInt(exceptUid, 10));
}

categoryNotifications.onTopicPost = async function (topic) {
	const settings = await meta.settings.get('category-notifications');
	settings.type = settings.type || 'email';

	if (settings.type === 'notification') {
		await sendTopicNotification(topic);
	} else if (settings.type === 'email') {
		await sendTopicEmail(topic);
	} else if (settings.type === 'both') {
		await Promise.all([
			sendTopicEmail(topic),
			sendTopicNotification(topic),
		]);
	}
};

categoryNotifications.onTopicReply = async function (post) {
	const settings = await meta.settings.get('category-notifications');
	settings.type = settings.type || 'email';

	if (settings.type === 'notification') {
		await sendPostNotification(post);
	} else if (settings.type === 'email') {
		await sendPostEmail(post);
	} else if (settings.type === 'both') {
		await Promise.all([
			sendPostEmail(post),
			sendPostNotification(post),
		]);
	}
};

async function sendTopicNotification(topic) {
	const uids = await getSubscribers(topic.cid, topic.user.uid);
	if (!uids.length) {
		return;
	}

	const notification = await notifications.create({
		bodyShort: `[[notifications:user-posted-topic, ${topic.user.username}, ${topic.title}]]`,
		bodyLong: topic.mainPost.content,
		pid: topic.mainPost.pid,
		path: `/post/${topic.mainPost.pid}`,
		nid: `tid:${topic.tid}:uid:${topic.uid}`,
		tid: topic.tid,
		from: topic.uid,
	});
	notifications.push(notification, uids);
}

async function sendTopicEmail(topic) {
	let uids = await getSubscribers(topic.cid, topic.user.uid);
	uids = await user.blocks.filterUids(topic.user.uid, uids);
	if (!uids.length) {
		return;
	}

	const tpl = 'categoryNotifications_topic';
	const params = {
		subject: `[[categorynotifications:new-topic-in, ${topic.category.name}]]`,
		site_title: meta.config.title || 'NodeBB',
		url: nconf.get('url'),
		title: topic.title,
		topicSlug: topic.slug,
		category: {
			name: topic.category.name,
			slug: topic.category.slug,
		},
		content: topic.mainPost.content,
		user: {
			slug: topic.user.userslug,
			name: topic.user.username,
			picture: topic.user.picture,
		},
	};
	await sendEmailToUids(uids, tpl, params);
}

async function sendPostNotification(post) {
	const uids = await getSubscribers(post.topic.cid, post.user.uid);
	if (!uids.length) {
		return;
	}

	const notification = await notifications.create({
		bodyShort: `[[notifications:user-posted-to, ${post.user.username}, ${post.topic.title}]]`,
		bodyLong: post.content,
		pid: post.pid,
		path: `/post/${post.pid}`,
		nid: `tid:${post.topic.tid}:pid:${post.pid}:uid:${post.uid}`,
		tid: post.topic.tid,
		from: post.uid,
	});
	notifications.push(notification, uids);
}

async function sendPostEmail(post) {
	let uids = await getSubscribers(post.topic.cid, post.user.uid);
	uids = await user.blocks.filterUids(post.user.uid, uids);
	if (!uids.length) {
		return;
	}
	const category = await categories.getCategoryFields(post.topic.cid, ['name', 'slug']);
	const tpl = 'categoryNotifications_post';
	const params = {
		subject: `[[categorynotifications:new-reply-in, ${post.topic.title}]]`,
		site_title: meta.config.title || 'NodeBB',
		url: nconf.get('url'),
		title: post.topic.title,
		topicSlug: post.topic.slug,
		category: category,
		content: post.content,
		user: {
			slug: post.user.userslug,
			name: post.user.username,
			picture: post.user.picture,
		},
		pid: post.pid,
	};
	await sendEmailToUids(uids, tpl, params);
}

async function sendEmailToUids(uids, tpl, params) {
	let errorLogged = false;
	await async.eachLimit(uids, 50, async (uid) => {
		await emailer.send(tpl, uid, params).catch((err) => {
			if (!errorLogged) {
				console.error(err.stack);
				errorLogged = true;
			}
		});
	});
}
