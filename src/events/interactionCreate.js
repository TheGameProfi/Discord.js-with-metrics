const { Events } = require('discord.js');
const { createError, createWarning } = require('../handlers/loggingHandler');
const { interactionCounter, latencyGauge } = require('../modules/prometheus/prometheus_exporter');
require('dotenv').config();

module.exports = {
    name: Events.InteractionCreate,
    async execute(interaction) {
        if (!interaction.isChatInputCommand() && !interaction.isContextMenuCommand()) return;

        const command = interaction.client.commands.get(interaction.commandName);

        if (!command)
            return createError(`Command not found: ${interaction.commandName}`);

        try {
            interactionCounter.inc();
            const startTime = Date.now();
            await command.execute(interaction);
            const endTime = Date.now();
            const duration = endTime - startTime;
            latencyGauge.set(duration);
        } catch (error) {
            createError(`There was an error running this command: ${error}`)
            if (interaction.replied || interaction.deferred) {
                await interaction.followUp({ content: 'There was an error while executing this command!', ephemeral: true });
            } else {
                await interaction.reply({ content: 'There was an error while executing this command!', ephemeral: true });
            }
        }
    },
};