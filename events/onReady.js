import { Events } from 'discord.js';
import Tags from '../db/index.js';
import 'dotenv/config';

import logger from '../utils/logger.js';

export default {
	name: Events.ClientReady,
	once: true,
	execute(client) {
		logger.info('Connected to discord bot');
		// connect with the db
		Tags.sync();

		if (process.env.NODE_ENV !== 'development') {
			const channel = client.channels.cache.find(c => c.name === process.env.MASTER_CHANNEL_NAME);
			channel.send('Chris P. Bacon is here!');
		}
	},
};