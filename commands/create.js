const { SlashCommandBuilder } = require('@discordjs/builders');
const { MessageEmbed } = require('discord.js');
const fs = require('fs/promises');
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
				.setRequired(true)
		)
		.addStringOption(option =>
			option.setName('type')
				.setDescription('The type of service (free or premium)')
				.setRequired(true)
				.addChoices(
					{ name: 'Free', value: 'free' },
					{ name: 'Premium', value: 'premium' },
				)),

	async execute(interaction) {
		const service = interaction.options.getString('service');
		const type = interaction.options.getString('type');

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

		let filePath;
		if (type === 'free') {
			filePath = `${__dirname}/../free/${service}.txt`;
		} else if (type === 'premium') {
			filePath = `${__dirname}/../premium/${service}.txt`;
		} else {
			const invalidTypeEmbed = new MessageEmbed()
				.setColor(config.color.red)
				.setTitle('Invalid service type!')
				.setDescription('Service type must be "free" or "premium".')
				.setFooter(interaction.user.tag, interaction.user.displayAvatarURL({ dynamic: true, size: 64 }))
				.setTimestamp();
			return interaction.reply({ embeds: [invalidTypeEmbed], ephemeral: true });
		}

		try {
			await fs.writeFile(filePath, '');
			const successEmbed = new MessageEmbed()
				.setColor(config.color.green)
				.setTitle('Service created!')
				.setDescription(`New service **${type}** \`${service}\` service created!`)
				.setFooter(interaction.user.tag, interaction.user.displayAvatarURL())
				.setTimestamp();

			interaction.reply({ embeds: [successEmbed], ephemeral: true });
		} catch (error) {
			log.error(error);
			return interaction.reply('An error occurred while creating the service.');
		}
	},
};