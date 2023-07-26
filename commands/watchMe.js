import { SlashCommandBuilder } from 'discord.js';
import Tags from '../db/index.js';

export default {
	data: new SlashCommandBuilder()
		.setName('setwatcher')
		.setDescription('Allow bot to know when user is in a dota match'),
	async execute(interaction) {
		await interaction.deferReply();

		try {
			const user = await Tags.findOne({ where: { name: interaction.user.username } });

			if (user) {
				await Tags.update(
					{ watching: !user.watching },
					{ where: { name: user.name } },
				);
			}

			await interaction.editReply(`Watching status set to ${!user.watching} for user ${user.name}.`);
		}
		catch (error) {
			if (error.name === 'SequelizeUniqueConstraintError') {
				await interaction.editReply({ content: 'A steam ID is already linked to this user.', ephemeral: true });
			}
			else {
				await interaction.editReply({ content: 'Something went wrong with adding your steam id.', ephemeral: true });
			}
		}
	},
};