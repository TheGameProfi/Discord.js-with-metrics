// This Eslint rule is disabled to allow inline comments in the code for type Hinting;
/* eslint-disable no-inline-comments */

const path = require('path');
const fs = require('fs');
/* eslint-disable no-unused-vars */
const { SlashCommandBuilder } = require('discord.js');
const { LocalizeConfig } = require('./definition');
/* eslint-enable no-unused-vars */

async function generate() {
	const commandFoldersPath = path.join(__dirname, '..', 'commands');
	const commandFolders = fs.readdirSync(commandFoldersPath);

	// eslint-disable-next-line no-inline-comments
	const commands = /** @type {SlashCommandBuilder[]} */ ([]);

	for (const folder of commandFolders) {
		const commandsPath = path.join(commandFoldersPath, folder);
		const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js') && !file.startsWith('module'));
		for (const file of commandFiles) {
			const filePath = path.join(commandsPath, file);
			const command = require(filePath);
			// Push the command to the commands array if it has the required properties
			if ('data' in command && 'execute' in command) {
				// eslint-disable-next-line no-inline-comments
				const builder = /** @type {SlashCommandBuilder} */ (command.data);
				commands.push(builder);
			}
		}
	}

	if (commands.length === 0) {
		console.error('No commands found to generate en-US locale.');
		return;
	}
	const enUsPath = path.join(__dirname, 'en-US.json');

	const data = /** @type {LocalizeConfig} */ {};
	const commandsData = /** @type {Record<string, Command>} */ ({});

	for (const commandBuilder of commands) {
		const command = handleCommandBuilder(commandBuilder.toJSON());
		const name = command.name;
		commandsData[name] = command;
	}
	data.commands = commandsData;
	data.replies = {
		// Add any replies you want to include in the locale file
	};
	data.buttons = {
		// Add any buttons you want to include in the locale file
	};
	data.modals = {
		// Add any modals you want to include in the locale file
	};
	// Write the data to the en-US.json file
	fs.writeFileSync(enUsPath, JSON.stringify(data, null, 2), 'utf8');
	console.log(`Generated ${enUsPath}`);
}

function handleCommandBuilder(commandBuilder) {
	const name = commandBuilder.name;
	const description = commandBuilder.description;

	const command = /** @type {Command} */ {
		name,
		description,
	};

	// Loop options to find subcommands or groups
	for (const option of commandBuilder.options) {
		if (option.type === 1) { // 1 = SUB_COMMAND
			if (!validOption) continue;
			if (!command.subCommands) {
				command.subCommands = {};
			}
			command.subCommands[option.name] = handleCommandBuilder(option);
		}
		else if (option.type === 2) { // 2 = SUB_COMMAND_GROUP
			if (!validOption) continue;
			if (!command.subCommands) {
				command.subCommands = {};
			}
			command.subCommands[option.name] = handleCommandBuilder(option);
		}
		else {
			if (!validOption) continue;
			if (!command.options) {
				command.options = {};
			}
			command.options[option.name] = option.description;
		}
	}
	return command;
}

function validOption(option) {
	if (!option.name || !option.description) {
		console.warn(`Skipping option without name or description: ${JSON.stringify(option)}`);
		return false;
	}
	return true;
}

(async () => {
	await generate();
})();