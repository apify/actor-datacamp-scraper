import { Dataset, createPlaywrightRouter } from 'crawlee';

const DATASET_LANG = 'en-US';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type LangField<T = any> = Record<typeof DATASET_LANG, T>;

export const router = createPlaywrightRouter();

router.addHandler('list', async ({ enqueueLinks, request, page, log }) => {
    log.info(`Enqueueing new URLs`);
    await enqueueLinks({
        globs: ['https://www.datacamp.com/courses-all/page/*'],
        label: 'list',
    });
    log.info(`Scraping courses`);
    const data = await page.evaluate(() => JSON.parse(document.getElementById('__NEXT_DATA__')!.innerHTML!));
    for (const hit of data.props.pageProps.hits) {
        const topics = hit.topics_array?.map((topic: LangField) => topic[DATASET_LANG]) || [];
        const technologies = hit.technology_array?.map((tech: LangField) => tech[DATASET_LANG]) || [];
        await Dataset.pushData({
            url: hit.url,
            title: hit.title?.[DATASET_LANG],
            primarySkillLevel: hit.skill_level?.[0],
            technologies,
            skillLevels: hit.skill_level,
            shortDescription: hit.short_description?.[DATASET_LANG],
            authors: hit.authors_array,
            durationHours: hit.duration_float,
            topics,
            topicsString: topics.join(', '),
            technologiesString: technologies.join(', '),
            fromUrl: request.loadedUrl,
            objectID: hit.objectID,
            raw: hit,
        });
    }
});
