import { SlashCommandBuilder } from 'discord.js';
import Tags from '../db/index.js';

export default {
	data: new SlashCommandBuilder()
		.setName('setid')
		.setDescription('Set user\'s steam ID')
		.addStringOption(option =>
			option
				.setName('id')
				.setDescription('steam ID')
				.setRequired(true)),
	async execute(interaction) {
		await interaction.deferReply();
		const steamId = interaction.options.getString('id');

		try {
			const tag = await Tags.create({
				name: interaction.user.username,
				steamId: steamId,
			});

			await interaction.editReply(`Steam ID ${steamId} added for user ${tag.name}.`);
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