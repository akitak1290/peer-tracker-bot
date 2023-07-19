import { Events } from 'discord.js';
import Tags from '../db.js';

export default {
	name: Events.ClientReady,
	once: true,
	execute(client) {
		// connect with the db
		Tags.sync();
		console.log(`Ready! Logged in as ${client.user.tag}`);
	},
};