const Discord = require('discord.js');
const axios = require('axios');
const cheerio = require('cheerio');
const fs = require('fs');

module.exports = {
  name: 'lookup',
  description: 'Get detailed information on a standard!',
  commandOptions: [
    {
      type: 3,
      name: 'standard',
      description: 'Standard number to research',
      required: true,
    },
  ],
  global: true,
  execute(interaction) {
    var list = [];
    var standard = interaction.data.options[0].value;
    axios
      .get(
        `https://www.nzqa.govt.nz/ncea/assessment/view-detailed.do?standardNumber=${standard}`
      )
      .then((response) => {
        const $ = cheerio.load(response.data);
        $('div[id="mainPage"]')
          .find('h3')
          .each(function (index, element) {
            list.push($(element).text());
          });
        var standard_details = $('table[class="noHover"] *')
          .contents()
          .map(function () {
            return this.type === 'text' ? $(this).text() : '';
          })
          .get()
          .join(' ');

        //
        var asstandard_file = $(
          '#mainPage > table.tableData.noHover > tbody > tr:nth-child(2) *'
        )
          .contents()
          .map(function () {
            return this.type === 'text' ? $(this).text() : '';
          })
          .get()
          .join(' ');

        standard_details = standard_details
          .replace('undefined', '')
          .replace('-', '')
          .replace('website')
          .replace(/\s\s+/g, ' ')
          .replace(/(\r\n|\n|\r)/gm, '')
          .split(' ');
        asstandard_file = asstandard_file
          .replace('undefined', '')
          .replace('-', '')
          .replace('website')
          .replace(/\s\s+/g, ' ')
          .replace(/(\r\n|\n|\r)/gm, '')
          .split(' ');

        if (standard_details[8] == 'undefined') {
          standard_details.splice(8, 1);
        }
        console.log(standard_details);
        console.log(asstandard_file);
        console.log(`Getting data for AS${standard}`);

        var standardname = list[1];
        const botAuthor = client.users.cache.get('293538313464184833');
        const dir = './commands';

        try {
          const infoembed = new Discord.MessageEmbed()
            .setColor('#0099ff')
            .setTitle('AS' + standard)
            .setDescription(standardname)
            .addFields(
              { name: 'Level', value: standard_details[8], inline: true },
              { name: 'Credits', value: standard_details[6], inline: true },
              {
                name: 'Assessment',
                value: standard_details[7].replace(' ', ''),
                inline: false,
              }
            )
            .setFooter(
              client.user.tag,
              client.user.displayAvatarURL({
                size: 256,
                format: 'png',
                dynamic: true,
              })
            )
            .setTimestamp();
          let isnum = /^\d+$/.test(asstandard_file[3]);

          if (asstandard_file[3] != undefined && isnum) {
            infoembed.addFields({
              name: 'Achievement Standard',
              value: `https://www.nzqa.govt.nz/nqfdocs/ncea-resource/achievements/${asstandard_file[3]}/as${standard}.pdf`,
            });
          } else {
            infoembed.addFields({
              name: 'Achievement Standard',
              value: `No File Found`,
            });
          }
          if (standard_details[7] == 'External') {
            infoembed.addFields(
              {
                name: 'Examination Paper',
                value: `https://www.nzqa.govt.nz/nqfdocs/ncea-resource/exams/2020/${standard}-exm-2020.pdf`,
              },
              {
                name: 'Answers to Paper',
                value: `https://www.nzqa.govt.nz/nqfdocs/ncea-resource/exams/2020/${standard}-ass-2020.pdf`,
              }
            );
          }
          client.api
            .interactions(interaction.id, interaction.token)
            .callback.post({
              data: {
                type: 4,
                data: {
                  embeds: [infoembed],
                },
              },
            });
        } catch (error) {
          console.log(error);
          client.api
            .interactions(interaction.id, interaction.token)
            .callback.post({
              data: {
                type: 4,
                data: {
                  content:
                    'Please enter a valid standard! (/lookup <standard_number>)',
                },
              },
            });
        }
      });
  },
};
