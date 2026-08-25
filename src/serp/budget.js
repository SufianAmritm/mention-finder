const fs = require("fs");
const path = require("path");
const config = require("../config");

const budgetPath = path.join(__dirname, "..", "..", "data", "budget.json");

function today() {
	return new Date().toISOString().slice(0, 10);
}

function load() {
	if (!fs.existsSync(budgetPath)) return { date: today(), count: 0 };
	const entry = JSON.parse(fs.readFileSync(budgetPath, "utf8"));
	if (entry.date !== today()) return { date: today(), count: 0 };
	return entry;
}

function save(entry) {
	fs.mkdirSync(path.dirname(budgetPath), { recursive: true });
	fs.writeFileSync(budgetPath, JSON.stringify(entry, null, 2));
}

function hasBudget() {
	return load().count < config.serpDailyBudget;
}

function consume() {
	const entry = load();
	entry.count += 1;
	save(entry);
	return entry.count;
}

function remaining() {
	return Math.max(0, config.serpDailyBudget - load().count);
}

module.exports = { hasBudget, consume, remaining };
