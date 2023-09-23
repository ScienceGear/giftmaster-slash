const { SlashCommandBuilder } = require('@discordjs/builders');
const { MessageEmbed } = require('discord.js');
const fs = require('fs');
const config = require('../config.json');
const CatLoggr = require('cat-loggr');

const log = new CatLoggr();

module.exports = {
	data: new SlashCommandBuilder()
		.setName('create')
		.setDescription('Create a new service.')
		.addStringOption(option =>
			option.setName('service')
				.setDescription('The name of the service to create')
				.setRequired(true)),

	async execute(interaction) {
		const service = interaction.options.getString('service');

		if (!interaction.member.permissions.has('MANAGE_CHANNELS')) {
			const errorEmbed = new MessageEmbed()
				.setColor(config.color.red)
				.setTitle('You Don\'t Have Permissions!')
				.setDescription('🛑 Only Admin Can Do It HEHE')
				.setFooter(interaction.user.tag, interaction.user.displayAvatarURL({ dynamic: true, size: 64 }))
				.setTimestamp();
			return interaction.reply({ embeds: [errorEmbed], ephemeral: true });
		}

		if (!service) {
			const missingParamsEmbed = new MessageEmbed()
				.setColor(config.color.red)
				.setTitle('Missing parameters!')
				.setDescription('You need to specify a service name!')
				.setFooter(interaction.user.tag, interaction.user.displayAvatarURL({ dynamic: true, size: 64 }))
				.setTimestamp();
			return interaction.reply({ embeds: [missingParamsEmbed], ephemeral: true });
		}

		const filePath = `${__dirname}/../free/${service}.txt`;

		fs.writeFile(filePath, '', function (error) {
			if (error) {
				log.error(error);
				return interaction.reply('An error occurred while creating the service.');
			}

			const successEmbed = new MessageEmbed()
				.setColor(config.color.green)
				.setTitle('Service created!')
				.setDescription(`New ${service} service created!`)
				.setFooter(interaction.user.tag, interaction.user.displayAvatarURL())
				.setTimestamp();

			interaction.reply({ embeds: [successEmbed], ephemeral: true });
		});
	},
};
