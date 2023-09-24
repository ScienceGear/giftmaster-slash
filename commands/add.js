const { SlashCommandBuilder } = require('@discordjs/builders');
const { MessageEmbed } = require('discord.js');
const fs = require('fs');
const os = require('os');
const config = require('../config.json');
const CatLoggr = require('cat-loggr');

const log = new CatLoggr();

module.exports = {
	data: new SlashCommandBuilder()
		.setName('add')
		.setDescription('Add an account to a service.')
		.addStringOption(option =>
			option.setName('type')
				.setDescription('The type of service (free or premium)')
				.setRequired(true)
				.addChoices(
					{ name: 'Free', value: 'free' },
					{ name: 'Premium', value: 'premium' },
				))
		.addStringOption(option =>
			option.setName('service')
				.setDescription('The service to add the account to')
				.setRequired(true))
		.addStringOption(option =>
			option.setName('account')
				.setDescription('The account to add')
				.setRequired(true)),

	async execute(interaction) {
		const service = interaction.options.getString('service');
		const account = interaction.options.getString('account');
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

		if (!service || !account || (type !== 'free' && type !== 'premium')) {
			const missingParamsEmbed = new MessageEmbed()
				.setColor(config.color.red)
				.setTitle('Missing parameters or invalid type!')
				.setDescription('You need to specify a service, an account, and a valid type (free or premium)!')
				.setFooter(interaction.user.tag, interaction.user.displayAvatarURL({ dynamic: true, size: 64 }))
				.setTimestamp();
			return interaction.reply({ embeds: [missingParamsEmbed], ephemeral: true });
		}

		let filePath;
		if (type === 'free') {
			filePath = `${__dirname}/../free/${service}.txt`;
		} else if (type === 'premium') {
			filePath = `${__dirname}/../premium/${service}.txt`;
		}

		fs.appendFile(filePath, `${os.EOL}${account}`, function (error) {
			if (error) {
				log.error(error);
				return interaction.reply('An error occurred while adding the account.');
			}

			const successEmbed = new MessageEmbed()
				.setColor(config.color.green)
				.setTitle('Account added!')
				.setDescription(`Successfully added \`${account}\` account to \`${service}\` service **${type}**.`)
				.setFooter(interaction.user.tag, interaction.user.displayAvatarURL())
				.setTimestamp();

			interaction.reply({ embeds: [successEmbed], ephemeral: true });
		});
	},
};
