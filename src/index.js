const cron = require("node-cron");
const config = require("./config");
const pipeline = require("./pipeline");

async function runOnce() {
	try {
		await pipeline.run();
	} catch (err) {
		console.error(`[pipeline] run failed: ${err.message}`);
	}
}

const runNow = process.argv.includes("--once");

if (runNow) {
	runOnce().then(() => process.exit(0));
} else {
	console.log(`[mention-finder] scheduled with cron "${config.cronSchedule}"`);
	cron.schedule(config.cronSchedule, runOnce);
}
