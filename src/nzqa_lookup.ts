import { CheerioAPI, Cheerio, Element, load, AnyNode } from 'cheerio';
import { APIEmbed, APIEmbedField, RESTPostAPIWebhookWithTokenJSONBody } from 'discord-api-types/v10';


export async function lookup(
  input: number,
  applicationId: string,
  token: string
): Promise<void> {
  var standard: number = input;
  const standardUri: string = `https://www.nzqa.govt.nz/ncea/assessment/view-detailed.do?standardNumber=${standard}`;


  const cacheKey: string = new URL(standardUri).toString(); // Use a valid URL for cacheKey
  const cache: Cache = caches.default;
  const cachedResponse: Response | undefined = await cache.match(cacheKey);

  if (cachedResponse) {
    console.log('Cache hit');
    // Use cached response if it exists
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

  const response: Response = await fetch(standardUri, {
    cf: {
      cacheTtl: 28800, // 8 hours
      cacheEverything: true,
    },
  });
  const data: string = await response.text();
  const $: CheerioAPI = load(data); // perhaps look at moving off cheerio to htmlrewriter

  const h3Elements: Cheerio<Element> = $('div[id="mainPage"] h3');
  const list: string[] = h3Elements
    .map((index: number, element: Element) => $(element).text())
    .get();

  const standardDetails: string[] = $('table[class="noHover"] *')
    .contents()
    .map((index: number, element: AnyNode) =>
      element.type === 'text' ? $(element).text() : ''
    )
    .get()
    .join(' ')
    .replace(/undefined|-|website|\s\s+/g, ' ')
    .replace(/(\r\n|\n|\r)/gm, '')
    .split(' ')
    .filter((value: string) => value !== '');

  const standardFile: string[] = $(
    '#mainPage > table.tableData.noHover > tbody > tr:nth-child(2) *'
  )
    .contents()
    .map((index: number, element: AnyNode) =>
      element.type === 'text' ? $(element).text() : ''
    )
    .get()
    .join(' ')
    .replace(/undefined|-|website|\s\s+/g, ' ')
    .replace(/(\r\n|\n|\r)/gm, '')
    .split(' ')
    .filter((value: string) => value !== '');

  if (standardDetails[8] === 'undefined') {
    standardDetails.splice(8, 1);
  }
  const [standardName]: string[] = list.slice(1);

  const level: string = standardDetails[7];
  const credits: string = standardDetails[5];
  const assessment: string = standardDetails[6];

  try {
    const embedJson: APIEmbed = {
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
      ] as APIEmbedField[],
      footer: {
        text: applicationId,
        icon_url: `https://cdn.discordapp.com/avatars/${applicationId}/c8ee73d8401a7a112512ea81a87c4cbd.png`,
      },
      timestamp: new Date().toISOString(),
    };

    if (Array.isArray(standardFile)) {
      if (standardFile.includes('Achievement')) {
        const asYear: string = standardFile[2];
        let isNum: boolean = /^\d+$/.test(asYear);

        if (asYear != undefined && isNum) {
          embedJson.fields!.push({
            name: 'Achievement Standard',
            value: `[AS${standard} (${asYear}, PDF)](https://www.nzqa.govt.nz/nqfdocs/ncea-resource/achievements/${asYear}/as${standard}.pdf)`,
            inline: false,
          });
        } else {
          embedJson.fields!.push({
            name: 'Achievement Standard',
            value: `No File Found`,
            inline: false,
          });
        }
      } else if (standardFile.includes('Unit')) {
        embedJson.fields!.push({
          name: 'Unit Standard',
          value: `[US${standard} (PDF)](https://www.nzqa.govt.nz/nqfdocs/units/pdf/${standard}.pdf)`,
          inline: false,
        });
      } else {
        embedJson.fields!.push({
          name: 'Standard specification',
          value: 'No File Found',
          inline: false,
        });
      }
    }

    if (assessment === 'External') {
      const year: number = new Date().getFullYear() - 2;
      console.log(year);
      const examPaperUrl: string = `[AS${standard}'s exam paper for ${year} (PDF)](https://www.nzqa.govt.nz/nqfdocs/ncea-resource/exams/${year}/${standard}-exm-${year}.pdf)`;
      // const answersUrl = `https://www.nzqa.govt.nz/nqfdocs/ncea-resource/exams/${year}/${standard}-ass-${year}.pdf`;
      // todo: potentially add resource booklets, and for all of these URLs run fetch and see if it returns 404 or the pdf
      embedJson.fields!.push({
        name: 'Examination Paper',
        value: examPaperUrl,
        inline: false,
      });

      // { name: 'Answers to Paper', value: answersUrl }
    }

    const followupData: RESTPostAPIWebhookWithTokenJSONBody = {
      embeds: [embedJson],
    };

    // perhaps look at using the discord-api-methods interactionskit package for these if i end up needing to use them for something else

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

    const cacheResponse: Response = new Response(JSON.stringify(followupData), {
      headers: {
        'content-type': 'application/json',
        'Cache-Control': 'public, max-age=7200, stale-while-revalidate=7200, stale-if-error=86400',
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
