import { load } from 'cheerio';
import { InteractionResponseType } from 'discord-interactions';

export async function lookup(input, applicationId) {
  var standard = input;
  const response = await fetch(
    `https://www.nzqa.govt.nz/ncea/assessment/view-detailed.do?standardNumber=${standard}`
  );
  const data = await response.text();
  const $ = load(data);

  const h3Elements = $('div[id="mainPage"] h3');
  const list = h3Elements.map((index, element) => $(element).text()).get();

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

  console.log(list);
  console.log(standard_details);
  console.log(asstandard_file);
  console.log(`Getting data for AS${standard}`);

  var standardname = list[1];
  console.log(standard_details);

  try {
    const embedJson = {
      color: 0x0099ff,
      title: 'AS' + standard,
      description: standardname,
      fields: [
        { name: 'Level', value: standard_details[8], inline: true },
        { name: 'Credits', value: standard_details[6], inline: true },
        {
          name: 'Assessment',
          value: standard_details[7].replace(' ', ''),
          inline: false,
        },
      ],
      footer: {
        text: applicationId,
        icon_url: 'https://when.lol/1x1.png',
      },
      timestamp: new Date().toISOString(),
    };

    let isnum = /^\d+$/.test(asstandard_file[3]);

    if (asstandard_file[3] != undefined && isnum) {
      embedJson.fields.push({
        name: 'Achievement Standard',
        value: `https://www.nzqa.govt.nz/nqfdocs/ncea-resource/achievements/${asstandard_file[3]}/as${standard}.pdf`,
      });
    } else {
      embedJson.fields.push({
        name: 'Achievement Standard',
        value: `No File Found`,
      });
    }
    if (standard_details[7] == 'External') {
      embedJson.fields.push(
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
    return {
      type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
      data: {
        embeds: [embedJson],
      },
    };
  } catch (error) {
    console.log(error);
    return {
      type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
      data: {
        content:
          'Please enter a valid standard! (</lookup:1137896912020840599>)',
      },
    };
  }
}
