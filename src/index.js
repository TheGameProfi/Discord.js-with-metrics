const { startExporter, connectedMongo } = require('./modules/prometheus/prometheus_exporter');
const { createError, createWarning } = require('./handlers/loggingHandler');
const eventHandler = require('./handlers/eventHandler');

const { Client, Collection,  Events, GatewayIntentBits } = require('discord.js');
const mongoose = require('mongoose');
const registerCommands = require('./handlers/registerCommands');

require('dotenv').config();
const bot_token = process.env.BOT_TOKEN;
const mongoDB_url = process.env.MONGODB_URL;
const prometheus = process.env.PROMETHEUS;

// Connect to the database
(async() => {
    if(prometheus === 'true')
        await startExporter();
    try {
        await mongoose.connect(mongoDB_url);
        console.log('Connected to the database');
        
        connectedMongo.set(1);

        // Start the bot
        (async () => {
            
            
            // Create the Bot Client
            const client = new Client({ 
                intents: [
                    GatewayIntentBits.Guilds,
                    GatewayIntentBits.GuildMessages,
                    GatewayIntentBits.MessageContent,
                    GatewayIntentBits.GuildPresences,
                    GatewayIntentBits.GuildVoiceStates,
                    GatewayIntentBits.GuildMembers
                ] 
            });
    
            client.commands = new Collection();

            // Register the commands
            registerCommands(client);

            // Event handling
            eventHandler(client);
    
            // Login to the bot
            client.login(bot_token);
    
        })();

    } catch (error) {
        createError(`[ERROR] There was an error connecting to the database: ${error}`);
    }

})();