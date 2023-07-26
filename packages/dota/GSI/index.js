import d2gsi from 'dota2-gsi';
import EventEmitter from 'events';
import logger from '../utils/logger.js';

class GSIServer extends EventEmitter {
	constructor() {
		super();
		// start express server
		this.server = null;
		this._inGame = false;
		this._liveGameWatcher = -1;
	}

	initiate() {
		this.server = new d2gsi();
		this._inGame = false;
		this._liveGameWatcher = -1;

		this.server.events.on('newclient', (client) => {
			logger.info(`[GSISERVER] New client connection, IP address: ${client.ip}`);
			if (client.auth && client.auth.token) {
				logger.info(`[GSISERVER] Auth token: ${client.auth.token}`);
			}
			else {
				logger.warn('[GSISERVER] No Auth token');
			}

			// eslint-disable-next-line no-unused-vars
			client.on('map:clock_time', (_) => {
				// if gamestate.player.team2 is present,
				// user is spectating a match
				// also, make sure it is not a custom game
				if (!this._inGame && !client.gamestate.player.team2 && client.gamestate.map.customgamename === '') {
					this._inGame = true;
					this.emit('liveMatchData', client.gamestate.player.steamid);
				}

				clearTimeout(this._liveGameWatcher);

				// reset state in case player is disconnected
				// or the game is finished
				this._liveGameWatcher = setTimeout(() => {
					this._inGame = false;
				}, 5 * 1000);
			});

			// eslint-disable-next-line no-unused-vars
			// client.on('map:clock_time', function(_) {
			// 	let client_store;

			//	// ! gamestate.player.team only works in spectator mode
			// 	const player_ids = [];

			// 	const initalSetup = setInterval(function() {
			// 		// exit the current game
			// 		if (!client.gamestate.player.team2) {
			// 			clearInterval(initalSetup);
			// 		}

			// 		// players ids found
			// 		if (client.gamestate.player.team2 && player_ids.length === 0) {
			// 			for (const player in client.gamestate.player.team2) {
			// 				player_ids.push(client.gamestate.player.team2[player].accountid);
			// 			}
			// 			for (const player in client.gamestate.player.team3) {
			// 				player_ids.push(client.gamestate.player.team3[player].accountid);
			// 			}
			// 		}

			// 		// stored players ids
			// 		if (player_ids.length == 10) {
			// 			clearInterval(initalSetup);
			// 			console.log(player_ids);
			// 		}
			// 	}, 10 * 1000);

			// 	stop finding players ids after 2 minutes
			// 	setTimeout(() => {
			// 		clearInterval(initalSetup);
			// 	}, 2 * 60 * 1000);
			// });

			client.on('player:activity', function(activity) {
				if (activity == 'playing') console.log('Game started!');
			});
		});
	}
}

const gsiServerSingleton = new GSIServer();

export default gsiServerSingleton;