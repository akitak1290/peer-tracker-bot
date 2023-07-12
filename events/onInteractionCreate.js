import { Events } from 'discord.js';

export default {
	name: Events.InteractionCreate,
    async execute(interaction) {
        // filter to only get slash command, as interactions can be other things
        if (!interaction.isChatInputCommand()) return;

        // get corresponding command from client's request
        const command = interaction.client.commands.get(interaction.commandName);

        if (!command) {
            console.error(`No command matching ${interaction.commandName} was found.`);
            return;
        }

        try {
            await command.execute(interaction);
        } catch (error) {
            console.error(error);
            if (interaction.replied || interaction.deferred) {
                await interaction.followUp({ content: 'There was an error while executing this command!', ephemeral: true });
            } else {
                await interaction.reply({ content: 'There was an error while executing this command!', ephemeral: true });
            }
        }
    }
};