import { SlashCommandBuilder } from 'discord.js';
import Tags from '../db.js';

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
            console.log(tag)

            await interaction.editReply(`This command was run by ${interaction.user.username}, with linked steam ID ${tag.steamId}, who joined on ${interaction.member.joinedAt}.`);
        } else {
            await interaction.editReply(`This command was run by ${interaction.user.username}, who joined on ${interaction.member.joinedAt}.`);
        }
    }
};
