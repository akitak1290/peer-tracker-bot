import { SlashCommandBuilder, EmbedBuilder } from 'discord.js';
import Tags from '../db/index.js';

async function fetchUser(userId) {
	// convert 64bit steam id to 32bit dota id
	userId = Number(userId.substr(-16, 16)) - 6561197960265728;

	// API endpoint to fetch user's peers
	const url = `https://api.opendota.com/api/players/${userId}`;
	const lastMatchUrl = url + '/matches?limit=1';
	const wlUrl = url + '/wl';

	let data = {};
	try {
		const [res, resLatestMatch, resWl] = await Promise.all([
			fetch(url), fetch(lastMatchUrl), fetch(wlUrl),
		]);

		data = await res.json();
		const lastMatch = await resLatestMatch.json();
		data.lastMatchId = lastMatch[0].match_id;
		data.lastMatch = `https://www.dotabuff.com/matches/${lastMatch[0].match_id}`;
		const wl = await resWl.json();
		data.win = wl.win;
		data.lose = wl.lose;
	}
	catch (error) {
		console.log(error);
	}

	return data;
}

export default {
	data: new SlashCommandBuilder()
		.setName('user')
		.setDescription('Provides information about the user.'),
	async execute(interaction) {
		// interaction.user is the object representing the User who ran the command
		// interaction.member is the GuildMember object, which represents the user in the specific guild
		await interaction.deferReply();

		// equivalent to: SELECT * FROM tags WHERE name = 'tagName' LIMIT 1;
		const tag = await Tags.findOne({ where: { name: interaction.user.username } });

		if (tag) {
			// equivalent to: UPDATE tags SET usage_count = usage_count + 1 WHERE name = 'tagName';
			tag.increment('usage_count');

			const user = await fetchUser(tag.steamId);
			if (!user.profile) {
				console.log('Something went wrong when fetching user data');
				await interaction.editReply('Uh oh! Something went wrong...');
				return;
			}
			console.log(user);

			const userEmbed = new EmbedBuilder()
				.setColor(0x0099FF)
				.setAuthor({ name: `${user.profile.personaname}`, iconURL: `${user.profile.avatarmedium}`, url: `https://www.dotabuff.com/players/${user.profile.account_id}` })
				.setURL(`https://www.dotabuff.com/players/${user.profile.account_id}`)
				.setDescription('Dotabuff')
				.addFields({ name: 'Last match: ', value: `[${user.lastMatchId}](${user.lastMatch})` })
				.addFields(
					{ name: '\u200B', value: '\u200B' },
					{ name: 'Steam ID', value: `${tag.steamId}` },
					{ name: 'Watching', value: `Subscribed to watcher? : ${tag.watching ? 'yes' : 'no'}` },
					{ name: 'Win: ', value: `${user.win}`, inline: true },
					{ name: 'Lose: ', value: `${user.lose}`, inline: true },
				)
				.setTimestamp()
				.setFooter({ text: 'That\'s all I\'ve got, what did you expect? More?!' });
			await interaction.editReply({ embeds: [userEmbed] });
		}
		else {
			await interaction.editReply('User has not set a Dota2 Id');
		}
	},
};
