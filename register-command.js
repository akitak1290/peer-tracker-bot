import { REST, Routes } from 'discord.js';
import 'dotenv/config';
import fs from 'fs';
import path from 'node:path';


(async () => {
	const commands = [];
	const commandsPath = path.join(process.cwd(), 'commands');
	const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));

	// load command files
	for (const file of commandFiles) {
		const filePath = `./commands/${file}`;
		const { default: command } = await import(filePath);
		// Set a new item in the Collection with the key as the command name and the value as the exported module
		if ('data' in command && 'execute' in command) {
			commands.push(command.data.toJSON());
		}
		else {
			console.log(`[WARNING] The command at ${filePath} is missing a required "data" or "execute" property.`);
		}
	}

	// construct and prepare an instance of the REST module
	const rest = new REST().setToken(process.env.DISCORD_TOKEN);

	// DELETE CURRENT SLASH COMMANDS
	rest.put(Routes.applicationGuildCommands(process.env.APP_ID, process.env.SERVER_ID), { body: [] })
		.then(() => console.log('Successfully deleted all guild commands.'))
		.catch(console.error);
	// LOAD NEW SLASH COMMANDS
	// self calling anonymous function because of async
	try {
		console.log(`Started refreshing ${commands.length} application (/) commands.`);

		// the put method is used to fully refresh all commands in the guild with the current set
		const data = await rest.put(
			Routes.applicationGuildCommands(process.env.APP_ID, process.env.SERVER_ID),
			{ body: commands },
		);

		// 'global' commands for all server the bot is in
		// const data = await rest.put(
		//     Routes.applicationCommands(process.env.APP_ID),
		//     { body: commands },
		// );

		console.log(`Successfully reloaded ${data.length} application (/) commands.`);
	}
	catch (error) {
		console.error(error);
	}
})();