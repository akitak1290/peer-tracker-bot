import gsiServerSingleton from './GSI/index.js';
import steamClientSingleton from './steam/index.js';
// import logger from './utils/logger.js';

// detect if player is in game to launch script
// is manual for now

// fetch player id

// ! IMPORTANT: FIX package/dota/.env not being properly referenced
// ! for now, move nested .env to outer

export async function getMatchPlayersWithPlayer(steamId32Bit) {
	const data = await steamClientSingleton.getRealTimeDataPlayers(steamId32Bit);

	return data.error ? {} : data;
}

export async function setEvent(eventName, cb) {
	gsiServerSingleton.on(eventName, cb);
}