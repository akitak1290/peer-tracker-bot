import dotenv from 'dotenv';
import Steam from 'steam';
import Dota2 from 'dota2';
import fetch from 'node-fetch';
import steam_resources from 'steam-resources';
import retry from 'retry';

import logger from '../utils/logger.js';
import { EWatchLiveResult } from '../utils/const.js';

dotenv.config({ path: '.env' });

// Steam Guard authentication is not enabled for this project,
// if needed, reference: http://www.natewillard.com/blog/node-steam/steam/steam-guard/javascript/node/2015/09/09/node-Steamguard/
class SteamClient {

	constructor() {
		this._steamClient = new Steam.SteamClient();
		this._steamUser = new Steam.SteamUser(this._steamClient);
		this._steamFriends = new Steam.SteamFriends(this._steamClient);
		this._dota2 = new Dota2.Dota2Client(this._steamClient, false, false);
		this._dota2Schema = steam_resources.GC.Dota.Internal;

		// current spectate server
		this._currentServer = null;

		this._steamClient.on('connected', () => {
			logger.info('[STEAMCLIENT] connected to steam server');
			this._steamUser.logOn({
				'account_name': process.env.STEAM_USER_NAME,
				'password': process.env.STEAM_PASSWORD,
			});
		});

		this._steamClient.on('logOnResponse', (logOnRes) => {
			logger.info(`[STEAMCLIENT] logged in as ${process.env.STEAM_USER_NAME}`);
			// set status to online
			// this._steamFriends.setPersonaState(Steam.EPersonaState.Busy);

			if (logOnRes.eresult == Steam.EResult.OK) {
				this._dota2.launch();

				this._dota2.on('ready', async () => {
					logger.info('[STEAMCLIENT] launched dota 2');
				});

				this._dota2.on('unhandled', (kMsg) => {
					logger.warn(`UNHANDLED MESSAGE ${kMsg}`);
				});

				this._dota2.on('unready', () => {
					logger.info('Node-dota2 unready.');
				});
			}
			else {
				logger.warn('[STEAMCLIENT]', logOnRes.eresult);
			}
		});

		// eslint-disable-next-line no-unused-vars
		this._steamClient.on('loggedOff', (eResult) => {
			logger.info('[STEAMCLIENT] logged off from steam');
		});

		this._steamClient.on('error', (error) => {
			logger.info(`[STEAMCLIENT] connection closed by server: +${error}`);
		});
	}

	connect() {
		if (this._steamClient) {
			this._steamClient.connect();
		}
	}

	isGReady() {
		return this._dota2._gcReady;
	}

	async getRealTimeDataPlayers(steamId32Bit) {
		const data = {};

		try {
			this._currentServer = await this.requestSpectateFriendGame(steamId32Bit);
			logger.info(`[STEAMCLIENT] got friend's current server id ${this._currentServer}`);

			const realTimeData = await this.requestRealTimeDataAPI(this._currentServer);
			logger.info(`[WEBAPI] got real time match data ${JSON.stringify(realTimeData)}`);

			const haveTeams = realTimeData.teams ? true : false;
			const havePlayers = haveTeams && realTimeData.teams[0].players && realTimeData.teams[1].players ? true : false;
			if (havePlayers) {
				data.team1 = realTimeData.teams[0].players;
				data.team2 = realTimeData.teams[1].players;
			}
			else {
				logger.warn('[WEBAPI] API request succeeded without teams data');
				data.error = 'API request succeeded without teams data';
			}

			return data;
		}
		catch (err) {
			data.error = err;
			return data;
		}
	}

	async requestSpectateFriendGame(steamId32Bit) {
		return new Promise((resolve, reject) => {
			const msgCode = this._dota2Schema.EDOTAGCMsg.k_EMsgGCSpectateFriendGame;
			const payload = new this._dota2Schema.CMsgSpectateFriendGame({
				steam_id: this._dota2.ToSteamID(steamId32Bit),
				live: false,
			});

			// the game coordinator might not be ready immediately
			// after connection
			if (!this._dota2._gcReady) {
				reject('[DOTACOORDINATOR] dota game coordinator is not ready');
			}

			// both handler and cb needs to be present for sendToGC to work with cb so we have the thing below
			// https://github.com/odota/node-dota2/blob/76b9fe35a7058fe0156e2e3e9c81cbc3b92a5224/handlers/helper.js#L103
			// https://github.com/seishun/node-steam/blob/a6e4603c51b49287437eec239de9876bab31f5d0/lib/handlers/game_coordinator/index.js#L33
			this._dota2.sendToGC(
				msgCode,
				payload,
				(message, callback) => {
					const response = this._dota2Schema.CMsgSpectateFriendGameResponse.decode(message);
					logger.info(`[DOTACOORDINATOR] k_EMsgGCSpectateFriendGame request got code ${response.watch_live_result}: ${EWatchLiveResult[response.watch_live_result]}`);
					if (callback !== undefined) {
						callback(response);
					}
				},
				(cbRes, err) => {
					if (err) {
						reject(`[DOTACOORDINATOR] ${err}`);
					}
					cbRes.server_steamid ? resolve(cbRes.server_steamid.toString()) : reject('[DOTACOORDINATOR] server not found');
				},
			);
		});
	}

	async requestRealTimeDataAPI(server_id) {
		return new Promise((resolve, reject) => {
			const operation = retry.operation({
				retries: 2,
				factor: 2,
				minTimeout: 1 * 1000,
			});

			operation.attempt(async currentAttempt => {
				const url = new URL(`https://api.steampowered.com/IDOTA2MatchStats_570/GetRealtimeStats/v1/?key=${process.env.STEAM_WEBAPI_KEY}&server_steam_id=${server_id}`);

				try {
					const res = await fetch(url);
					if (operation.retry(!res.ok)) {
						logger.info(`[STEAMWEB] failed to fetch match data ${res.status}, attempt: ${currentAttempt}`);
						currentAttempt++;
						return ;
					}

					if (res.ok) {
						// response.status >= 200 && response.status < 300
						const data = res.json();
						resolve(data);
					}
					else {
						reject(`[WEBAPI] failed to fetch match data after ${currentAttempt} attempts`);
					}
				}
				catch (error) {
					logger.warn(`[WEBAPI] failed to fetch match data, got status: ${error}, attemp: ${currentAttempt}`);
					currentAttempt++;
					return ;
				}
			});
		});
	}

	exit() {
		return new Promise((resolve) => {
			this._currentServer = null;
			this._dota2.exit();
			logger.info('[STEAMCLIENT] manually closed dota');
			this._steamClient.disconnect();
			logger.info('[STEAMCLIENT] manually closed steam');
			this._steamClient.removeAllListeners();
			this._dota2.removeAllListeners();
			logger.info('[STEAMCLIENT] removed all listeners from dota and steam');
			resolve(true);
		});
	}
}

const steamClientSingleton = new SteamClient();
export default steamClientSingleton;