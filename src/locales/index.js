const fs = require('fs');
const path = require('path');

// eslint-disable-next-line no-unused-vars
const { Locale, LocalizationMap } = require('discord.js');
const { createWarning } = require('../handlers/loggingHandler');

function loadLocales() {
	const files = fs.readdirSync(__dirname);

	const result = {};
	for (const file of files) {
		if (!file.endsWith('.json')) continue;
		const lang = path.basename(file, '.json');
		result[lang] = JSON.parse(
			fs.readFileSync(path.join(__dirname, file), 'utf8'),
		);
	}
	return result;
}

const locales = loadLocales();

/**
 * Resolve nested object by path.
 * @template T
 * @param {T} obj
 * @param {string | string[]} entry - dot.notation or array path
 * @returns {any}
 */
function getAtPath(obj, entry) {
	const parts = Array.isArray(entry) ? entry : String(entry).split('.').filter(Boolean);
	return parts.reduce((o, p) => (o && typeof o === 'object' ? o[p] : undefined), obj);
}

/**
 * Builds a Discord.js LocalizationMap with nested path support.
 * Now supports choosing the top-level section (default: "commands").
 *
 * @param {string | string[]} indexPath - e.g. "admin.ban" or ["admin","ban"]
 * @param {"name" | "description"} key
 * @param {"commands" | "replies"} [type="commands"] - top-level section to read from (e.g. "commands", "buttons", "modals")
 * @returns {LocalizationMap}
 */
function getLocalizations(indexPath, key, type = 'commands') {
	// eslint-disable-next-line no-inline-comments
	const out = /** @type {LocalizationMap} */ {};
	const pathArr = Array.isArray(indexPath) ? indexPath : String(indexPath).split('.').filter(Boolean);

	const localeSet = new Set(Object.values(Locale));

	for (const [lang, data] of Object.entries(locales)) {
		if (!localeSet.has(lang)) {
			createWarning(`⚠ Unknown locale file: ${lang}.json`);
			continue;
		}

		const node = getAtPath(data, [type, ...pathArr]);
		const value = node?.[key];
		if (!value) continue;

		out[lang] = value;
	}

	return out;
}

module.exports = { locales, getLocalizations };
