import { SlashCommandBuilder } from 'discord.js';
import Tags from "../db.js";

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
    
    for (let i = data.length; i >= 0; i--) {
      if (data[i].account_id === peerId) {
        peer = data[i]
        peer.matches = `https://www.opendota.com/players/${userId}/matches?included_account_id=${peerId}`
        break;
      }
    }
    return peer;
  }

export default {
    data: new SlashCommandBuilder()
        .setName('peer')
        .setDescription('Provides information about the user.')
        .addStringOption(option =>
          option
            .setName('id')
            .setDescription('peer ID')
            .setRequired(true)),
    async execute (interaction) {
        await interaction.deferReply();
        const steamId = interaction.options.getString('id');

        const tag = await Tags.findOne({ where: { name: interaction.user.username } });

        if (tag) {
          // equivalent to: UPDATE tags SET usage_count = usage_count + 1 WHERE name = 'tagName';
          tag.increment('usage_count');

          const peer = await fetchUserPeer(tag.steamId, steamId);

          await interaction.editReply(peer.matches);
        } else {
            await interaction.editReply({content: `${interaction.user.username} has not setup a steam ID`, ephemeral: true });
        }
    }
};
