import { Events } from 'discord.js';
import Tags from '../db.js';

export default {
	name: Events.ClientReady,
	once: true,
	execute(client) {
		Tags.sync(); // connect with the db
		console.log(`Ready! Logged in as ${client.user.tag}`);
	},
};