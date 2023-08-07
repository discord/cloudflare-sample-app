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

  const standardDetails = $('table[class="noHover"] *')
    .contents()
    .map((index, element) => (element.type === 'text' ? $(element).text() : ''))
    .get()
    .join(' ')
    .replace(/undefined|-|website|\s\s+/g, ' ')
    .replace(/(\r\n|\n|\r)/gm, '')
    .split(' ')
    .filter((value) => value !== '');

  const standardFile = $(
    '#mainPage > table.tableData.noHover > tbody > tr:nth-child(2) *'
  )
    .contents()
    .map((index, element) => (element.type === 'text' ? $(element).text() : ''))
    .get()
    .join(' ')
    .replace(/undefined|-|website|\s\s+/g, ' ')
    .replace(/(\r\n|\n|\r)/gm, '')
    .split(' ')
    .filter((value) => value !== '');

  console.log(standardFile);

  if (standardDetails[8] === 'undefined') {
    standardDetails.splice(8, 1);
  }
  const [standardName] = list.slice(1);

  const level = standardDetails[7];
  const credits = standardDetails[5];
  const assessment = standardDetails[6];

  try {
    const embedJson = {
      color: 0x0099ff,
      title: `Standard ${standard}`,
      description: standardName,
      fields: [
        { name: 'Level', value: level, inline: true },
        { name: 'Credits', value: credits, inline: true },
        {
          name: 'Assessment',
          value: assessment.replace(' ', ''),
          inline: false,
        },
      ],
      footer: {
        text: applicationId,
        icon_url: 'https://when.lol/1x1.png',
      },
      timestamp: new Date().toISOString(),
    };

    if (Array.isArray(standardFile)) {
      if (standardFile.includes('Achievement')) {
        const asYear = standardFile[2];
        let isnum = /^\d+$/.test(asYear);

        if (asYear != undefined && isnum) {
          embedJson.fields.push({
            name: 'Achievement Standard',
            value: `https://www.nzqa.govt.nz/nqfdocs/ncea-resource/achievements/${asYear}/as${standard}.pdf`,
          });
        } else {
          embedJson.fields.push({
            name: 'Achievement Standard',
            value: `No File Found`,
          });
        }
      } else if (standardFile.includes('Unit')) {
        embedJson.fields.push({
          name: 'Unit Standard',
          value: `https://www.nzqa.govt.nz/nqfdocs/units/pdf/${standard}.pdf`,
        });
      } else {
        embedJson.fields.push({
          name: 'Standard specification',
          value: 'No File Found',
        });
      }
    }
    if (assessment === 'External') {
      const year = new Date().getFullYear() - 2;
      console.log(year);
      const examPaperUrl = `https://www.nzqa.govt.nz/nqfdocs/ncea-resource/exams/${year}/${standard}-exm-${year}.pdf`;
      const answersUrl = `https://www.nzqa.govt.nz/nqfdocs/ncea-resource/exams/${year}/${standard}-ass-${year}.pdf`;
      embedJson.fields.push(
        { name: 'Examination Paper', value: examPaperUrl },
        { name: 'Answers to Paper', value: answersUrl }
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
