import { SlashCommandBuilder, EmbedBuilder } from 'discord.js';

import Tags from '../db/index.js';
import { getMatchPlayersWithPlayer, setEvent } from '../packages/dota/index.js';
import client from '../client.js';
import logger from '../utils/logger.js';
// import { ErrorOpenDotaApi } from '../utils/const.js';

setEvent('liveMatchData', sendUserData);

export async function fetchUserPeer(userId, peerId) {
	let peer = {};
	const url = `https://api.opendota.com/api/players/${userId}/peers`;
	// API endpoint to fetch user's peers
	try {
		const res = await fetch(url);
		const data = await res.json();

		if (!res.ok) {
			// bad request code
			// throw new Error({
			// 	message: JSON.stringify(data),
			// });
			throw new Error(JSON.stringify(data.error));
		}

		for (let i = 0; i < data.length; i++) {
			// string and number
			if (data[i].account_id == peerId) {
				peer = data[i];
				peer.matchesUrl = `https://www.opendota.com/players/${userId}/matches?included_account_id=${peerId}`;
				break;
			}
		}
		return peer;
	}
	catch (error) {
		// network error or operational error
		logger.warn(`[OPENDOTAAPI] ${error.message}`);
		peer.error = error.message;
		return peer;
		// throw error;
	}
}

export async function parseDataToEmbed(id32bit, liveMatchData) {
	const playerFields = [];
	const peerFields = [];

	for (let i = 0; i < liveMatchData.team1.length; i++) {
		playerFields.push({
			name: `${liveMatchData.team1[i].name}`,
			value: `[${liveMatchData.team1[i].accountid}](https://www.dotabuff.com/players/${liveMatchData.team1[i].accountid})`,
			inline: true,
		});
		playerFields.push({
			name: `${liveMatchData.team2[i].name}`,
			value: `[${liveMatchData.team2[i].accountid}](https://www.dotabuff.com/players/${liveMatchData.team2[i].accountid})`,
			inline: true,
		});
		playerFields.push({
			name: '\u200B',
			value: '\u200B',
			inline: true,
		});
	}

	for (const team in liveMatchData) {
		for (let i = 0; i < liveMatchData[team].length; i++) {
			const peer = await fetchUserPeer(id32bit, liveMatchData[team][i].accountid);

			if (peer.matchesUrl) {
				peerFields.push({
					name: `${liveMatchData[team][i].name}`,
					value: `${peer.matchesUrl}`,
				});
			}
		}
	}

	if (peerFields.length === 0) {
		peerFields.push({
			name: 'No peer found in this match',
			value: '\u200B',
		});
	}

	return new EmbedBuilder()
		.setDescription('Match players')
		.addFields([
			{ name: '\u200B', value: '\u200B' },
			...playerFields,
			{ name: '\u200B', value: '\u200B' },
			...peerFields,
		])
		.setTimestamp();
}

async function sendUserData(id64bit) {
	const user = await Tags.findOne({ where: { watching: 1, steamid: id64bit } });

	if (user) {
		user.increment('usage_count');
		const id32bit = Number(user.steamId.substr(-16, 16)) - 6561197960265728;
		const data = await getMatchPlayersWithPlayer(id32bit);
		const channel = client.channels.cache.find(c => c.name === process.env.MASTER_CHANNEL_NAME);

		if (data.length !== 0) {
			const userEmbed = parseDataToEmbed(id32bit, data);
			channel.send({ embeds: [userEmbed] });
		}
		else {
			channel.send({ content: 'Couldn\'t get live match data :(', ephemeral: true });
		}
	}
}

export default {
	data: new SlashCommandBuilder()
		.setName('livematch')
		.setDescription('Get information about user\'s current match'),
	async execute(interaction) {
		await interaction.deferReply();
		const user = await Tags.findOne({ where: { name: interaction.user.username } });

		if (user) {
			// equivalent to: UPDATE tags SET usage_count = usage_count + 1 WHERE name = 'tagName';
			user.increment('usage_count');
			const id32bit = Number(user.steamId.substr(-16, 16)) - 6561197960265728;
			const data = await getMatchPlayersWithPlayer(id32bit);

			if (data.length !== 0) {
				const userEmbed = parseDataToEmbed(id32bit, data);
				await interaction.editReply({ embeds: [userEmbed] });
			}
			else {
				await interaction.editReply({ content: 'No peer data found' });
			}
		}
		else {
			await interaction.editReply({ content: `${interaction.user.username} has not setup a steam ID`, ephemeral: true });
		}
	},
};
