import { SlashCommandBuilder, EmbedBuilder } from 'discord.js';

import Tags from '../db/index.js';
import { getMatchPlayers, setEvent } from '../packages/dota/index.js';
import client from '../client.js';

setEvent('liveMatchData', sendUserData);

async function fetchUserPeer(userId, peerId) {
	let peer = {};
	// API endpoint to fetch user's peers
	const url = `https://api.opendota.com/api/players/${userId}/peers`;
	const res = await fetch(url);
	const data = await res.json();
	// throw API errors
	if (!res.ok) {
		console.log(res.status);
		throw new Error(JSON.stringify(data));
	}

	for (let i = 0; i < data.length; i++) {
		// string and number
		if (data[i].account_id == peerId) {
			peer = data[i];
			peer.matches = `https://www.opendota.com/players/${userId}/matches?included_account_id=${peerId}`;
			break;
		}
	}
	return peer;
}

async function sendUserData(id64bit) {
	const user = await Tags.findOne({ where: { watching: 1, steamid: id64bit } });

	if (user) {
		user.increment('usage_count');
		try {
			const data = await getMatchPlayers(Number(user.steamId.substr(-16, 16)) - 6561197960265728);
			const channel = client.channels.cache.find(c => c.name === process.env.MASTER_CHANNEL_NAME);

			if (data.length !== 0) {
				const playerFields = [];
				const peerFields = [];

				for (let i = 0; i < data.team1.length; i++) {
					playerFields.push({
						name: `${data.team1[i].name}`,
						value: `[${data.team1[i].accountid}](https://www.dotabuff.com/players/${data.team1[i].accountid})`,
						inline: true,
					});
					playerFields.push({
						name: `${data.team2[i].name}`,
						value: `[${data.team2[i].accountid}](https://www.dotabuff.com/players/${data.team2[i].accountid})`,
						inline: true,
					});
					playerFields.push({
						name: '\u200B',
						value: '\u200B',
						inline: true,
					});
				}

				for (const team in data) {
					data[team].forEach(async (player) => {
						const peer = await fetchUserPeer(user.steamId, player.id);

						if (peer.matches) {
							peerFields.push({
								name: '',
								value: `${peer.matches}`,
							});
						}
					});
				}

				if (peerFields.length === 0) {
					peerFields.push({
						name: 'No peer found in this match',
						value: '\u200B',
					});
				}

				const userEmbed = new EmbedBuilder()
					.setDescription('Match players')
					.addFields([
						{ name: '\u200B', value: '\u200B' },
						...playerFields,
						{ name: '\u200B', value: '\u200B' },
						...peerFields,
					])
					.setTimestamp();
				channel.send({ embeds: [userEmbed] });
			}
		}
		catch (error) {
			// not sure what to put here atm
		}
	}
}

export default {
	data: new SlashCommandBuilder()
		.setName('livematch')
		.setDescription('Get information about user\'s current match'),
	async execute(interaction) {
		await interaction.deferReply();
		const tag = await Tags.findOne({ where: { name: interaction.user.username } });

		if (tag) {
			// equivalent to: UPDATE tags SET usage_count = usage_count + 1 WHERE name = 'tagName';
			tag.increment('usage_count');

			try {
				const data = await getMatchPlayers(Number(tag.steamId.substr(-16, 16)) - 6561197960265728);

				if (data.length === 0) {
					await interaction.editReply({ content: 'No peer data found' });
				}
				else {
					const playerFields = [];
					const peerFields = [];

					for (let i = 0; i < data.team1.length; i++) {
						playerFields.push({
							name: `${data.team1[i].name}`,
							value: `[${data.team1[i].accountid}](https://www.dotabuff.com/players/${data.team1[i].accountid})`,
							inline: true,
						});
						playerFields.push({
							name: `${data.team2[i].name}`,
							value: `[${data.team2[i].accountid}](https://www.dotabuff.com/players/${data.team2[i].accountid})`,
							inline: true,
						});
						playerFields.push({
							name: '\u200B',
							value: '\u200B',
							inline: true,
						});
					}

					for (const team in data) {
						data[team].forEach(async (player) => {
							const peer = await fetchUserPeer(tag.steamId, player.id);

							if (peer.matches) {
								peerFields.push({
									name: '',
									value: `${peer.matches}`,
								});
							}
						});
					}

					if (peerFields.length === 0) {
						peerFields.push({
							name: 'No peer found in this match',
							value: '\u200B',
						});
					}

					const userEmbed = new EmbedBuilder()
						.setDescription('Match players')
						.addFields([
							{ name: '\u200B', value: '\u200B' },
							...playerFields,
							{ name: '\u200B', value: '\u200B' },
							...peerFields,
						])
						.setTimestamp();
					await interaction.editReply({ embeds: [userEmbed] });
				}
			}
			catch (error) {
				await interaction.editReply({ content: `Uh oh, ${error.message}`, ephemeral: true });
			}
		}
		else {
			await interaction.editReply({ content: `${interaction.user.username} has not setup a steam ID`, ephemeral: true });
		}
	},
};
