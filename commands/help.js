const { SlashCommandBuilder } = require('@discordjs/builders');
const { MessageEmbed } = require('discord.js');
const config = require('../config.json');
const stock = require('./stock');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('help')
		.setDescription('Display the command list.'),

	async execute(interaction) {
		const { commands } = interaction.client;

		const commandListEmbed = new MessageEmbed()
			.setColor(config.color.default)
			.setTitle('Help Panel')
			.setDescription(`👋 Hello and welcome to **${interaction.guild.name}**! 🌟 We are here to provide you with the best services. 🚀`)
			.setImage(config.banner)
			.setThumbnail(interaction.client.user.displayAvatarURL({ dynamic: true, size: 64 })) // Set the bot's avatar as the thumbnail
			.addFields({
				name: `Commands`,
				value: "`/help`   **Displays the help command**\n`/create` **Create a new service**\n`/free`   **Generate a reward**\n`/add`    **Add a reward to the stock**\n`/stock`  **View the current stock**\n`/premium` **Generate premium reward**"
			})
			.setFooter(interaction.user.tag, interaction.user.displayAvatarURL({ dynamic: true, size: 64 }))
			.setTimestamp()
			.addField('Useful Links', `[**Website**](${config.website}) [**Discord**](https://dsc.gg/sciencegear)`);

		await interaction.reply({ embeds: [commandListEmbed] });
	},
};
