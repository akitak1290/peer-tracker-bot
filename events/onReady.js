import { Events } from 'discord.js';
import Tags from '../db/index.js';
import 'dotenv/config';

// import DotaServer from '../utils/GSI.js';
import d2gsi from 'dota2-gsi';
import logger from '../utils/logger.js';

export default {
	name: Events.ClientReady,
	once: true,
	execute(client) {
		logger.info('Connected to discord bot');
		// connect with the db
		Tags.sync();

		// console.log(`Ready! Logged in as ${client.user.tag}`);

		const channel = client.channels.cache.find(c => c.name === process.env.MASTER_CHANNEL_NAME);
		channel.send('Chris P. Bacon is here!');

		// let client_store;
		const player_ids = [];
		const DotaServer = new d2gsi();
		DotaServer.events.on('newclient', function(dota_client) {
			console.log('New client connection, IP address: ' + dota_client.ip);

			if (dota_client.auth && dota_client.auth.token) {
				console.log('Auth token: ' + dota_client.auth.token);
			}
			else {
				console.log('No Auth token');
			}

			// on joining a game
			// eslint-disable-next-line no-unused-vars
			dota_client.on('map:clock_time', function(_) {
				console.log(JSON.stringify(dota_client));
				const initalSetup = setInterval(function() {
					// exit the current game
					if (!dota_client.gamestate.player.team2) {
						clearInterval(initalSetup);
					}

					// players ids found
					if (dota_client.gamestate.player.team2 && player_ids.length === 0) {
						for (const player in dota_client.gamestate.player.team2) {
							player_ids.push(dota_client.gamestate.player.team2[player].accountid);
						}
						for (const player in dota_client.gamestate.player.team3) {
							player_ids.push(dota_client.gamestate.player.team3[player].accountid);
						}
					}

					// stored players ids
					if (player_ids.length == 10) {
						clearInterval(initalSetup);
						console.log(player_ids);
					}
				}, 10 * 1000);

				// stop finding players ids after 2 minutes
				setTimeout(() => {
					clearInterval(initalSetup);
				}, 2 * 60 * 1000);
			});
		});
	},
};