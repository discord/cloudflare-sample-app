import { load } from 'cheerio';

export async function lookup(input: number, applicationId: string, token: string) {
  var standard = input;
  const standardUri = `https://www.nzqa.govt.nz/ncea/assessment/view-detailed.do?standardNumber=${standard}`;
  const cacheKey = new URL(standardUri).toString(); // Use a valid URL for cacheKey
  const cache = caches.default;
  const cachedResponse = await cache.match(cacheKey);

  if (cachedResponse) {
    console.log('Cache hit');
    // Use cached response if it exists and is less than 2 hours old
    await fetch(
      `https://discord.com/api/v10/webhooks/${applicationId}/${token}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: cachedResponse.body,
      }
    );
    return;
  }

  const response = await fetch(standardUri);
  const data = await response.text();
  const $ = load(data); // perhaps look at moving off cheerio to htmlrewriter

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
      description: `[${standardName}](${standardUri})`,
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
        icon_url: `https://cdn.discordapp.com/avatars/${applicationId}/c8ee73d8401a7a112512ea81a87c4cbd.png`,
      },
      timestamp: new Date().toISOString(),
    };

    if (Array.isArray(standardFile)) {
      if (standardFile.includes('Achievement')) {
        const asYear = standardFile[2];
        let isNum = /^\d+$/.test(asYear);

        if (asYear != undefined && isNum) {
          embedJson.fields.push({
            name: 'Achievement Standard',
            value: `[AS${standard} (${asYear}, PDF)](https://www.nzqa.govt.nz/nqfdocs/ncea-resource/achievements/${asYear}/as${standard}.pdf)`,
            inline: false
          });
        } else {
          embedJson.fields.push({
            name: 'Achievement Standard',
            value: `No File Found`,
            inline: false
          });
        }
      } else if (standardFile.includes('Unit')) {
        embedJson.fields.push({
          name: 'Unit Standard',
          value: `[US${standard} (PDF)](https://www.nzqa.govt.nz/nqfdocs/units/pdf/${standard}.pdf)`,
          inline: false
        });
      } else {
        embedJson.fields.push({
          name: 'Standard specification',
          value: 'No File Found',
          inline: false
        });
      }
    }
    if (assessment === 'External') {
      const year = new Date().getFullYear() - 2;
      console.log(year);
      const examPaperUrl = `[AS${standard}'s exam paper for ${year} (PDF)](https://www.nzqa.govt.nz/nqfdocs/ncea-resource/exams/${year}/${standard}-exm-${year}.pdf)`;
      // const answersUrl = `https://www.nzqa.govt.nz/nqfdocs/ncea-resource/exams/${year}/${standard}-ass-${year}.pdf`;
      // todo: potentially add resource booklets, and for all of these URLs run fetch and see if it returns 404 or the pdf
      embedJson.fields.push(
        {
          name: 'Examination Paper', value: examPaperUrl,
          inline: false
        }

        // { name: 'Answers to Paper', value: answersUrl }
      );
    }

    const followupData = {
      embeds: [embedJson],
    };

    await fetch(
      `https://discord.com/api/v10/webhooks/${applicationId}/${token}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(followupData),
      }
    );

    const cacheResponse = new Response(JSON.stringify(followupData), {
      headers: {
        'content-type': 'application/json',
        'Cache-Control': 'max-age=7200',
      },
    });
    await cache.put(cacheKey, cacheResponse);
  } catch (error) {
    await fetch(
      `https://discord.com/api/v10/webhooks/${applicationId}/${token}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          content:
            'Please enter a valid standard! (</lookup:1137896912020840599>)',
        }),
      }
    );
  }
  return;
}
