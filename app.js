// Require the necessary discord.js classes
import { Collection } from 'discord.js';
import 'dotenv/config';
import path from 'path';
import fs from 'fs';

import client from './client.js';
import steamClientSingleton from './packages/dota/steam/index.js';
import gsiServerSingleton from './packages/dota/GSI/index.js';

import logger from './utils/logger.js';
async function app() {
	// initialize packages
	steamClientSingleton.connect();
	gsiServerSingleton.initiate();

	// command handler
	client.commands = new Collection();
	const commandsPath = path.join(process.cwd(), 'commands');
	const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));

	// load command files
	logger.info(`Loading ${commandFiles.length} discord bot command files`);
	for (const file of commandFiles) {
		const filePath = `./commands/${file}`;
		const { default: command } = await import(filePath);
		// Set a new item in the Collection with the key as the command name and the value as the exported module
		if ('data' in command && 'execute' in command) {
			client.commands.set(command.data.name, command);
		}
		else {
			logger.warning(`The command at ${filePath} is missing a required "data" or "execute" property.`);
		}
	}

	// load event handlers
	const eventsPath = path.join(process.cwd(), 'events');
	const eventFiles = fs.readdirSync(eventsPath).filter(file => file.endsWith('.js'));

	logger.info(`Loading ${eventFiles.length} discord bot event handlers files`);
	for (const file of eventFiles) {
		const filePath = `./events/${file}`;
		const { default: event } = await import(filePath);
		if (event.once) {
			client.once(event.name, (...args) => event.execute(...args));
		}
		else {
			client.on(event.name, (...args) => event.execute(...args));
		}
	}
	client.login(process.env.DISCORD_TOKEN);
}

app();