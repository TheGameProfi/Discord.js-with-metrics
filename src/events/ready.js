const { Events, ActivityType } = require('discord.js');
const { connectedDiscord, commandCounter, guildCounter } = require('../modules/prometheus/prometheus_exporter');

module.exports = {
	name: Events.ClientReady,
	once: true,
	execute(client) {

		console.log(`Ready! Logged in as ${client.user.tag}`);

		connectedDiscord.set(1);

        guildCounter.set(client.guilds.cache.size);
        commandCounter.set(client.commands.size);
	},
};