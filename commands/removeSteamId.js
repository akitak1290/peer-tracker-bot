import { SlashCommandBuilder } from 'discord.js';
import Tags from '../db.js';

export default {
	data: new SlashCommandBuilder()
		.setName('removeid')
		.setDescription('Remove user\'s steam ID'),
	async execute(interaction) {
		await interaction.deferReply();

		const tag = await Tags.findOne({ where: { name: interaction.user.username } });

		if (tag) {
			// equivalent to: UPDATE tags SET usage_count = usage_count + 1 WHERE name = 'tagName';
			tag.increment('usage_count');

			tag.destroy({ where: { name: interaction.user.username } });

			await interaction.editReply(`Removed steam ID for user ${interaction.user.username}`);
		}
		else {
			await interaction.editReply({ content: `${interaction.user.username} has not setup a steam ID`, ephemeral: true });
		}
	},
};