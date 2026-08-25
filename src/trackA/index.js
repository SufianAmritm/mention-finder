const reddit = require("./reddit");
const discourse = require("./discourse");
const bbpress = require("./bbpress");
const subreddits = require("../../config/subreddits.json");
const forums = require("../../config/forums.json");

async function collect() {
	const [redditPosts, discourseTopics, wpPosts] = await Promise.all([
		reddit.fetchAllowlistedSubreddits(subreddits),
		discourse.fetchAll(forums.discourse),
		bbpress.fetchAll(forums.bbpress.flatMap((f) => f.feedUrls)),
	]);

	return [...redditPosts, ...discourseTopics, ...wpPosts];
}

module.exports = { collect };
