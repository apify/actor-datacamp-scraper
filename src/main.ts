/**
 * This template is a production ready boilerplate for developing with `PlaywrightCrawler`.
 * Use this to bootstrap your projects using the most up-to-date code.
 * If you're looking for examples or want to learn more, see README.
 */

// For more information, see https://docs.apify.com/sdk/js
import { Actor, ProxyConfigurationOptions } from 'apify';
// For more information, see https://crawlee.dev
import { PlaywrightCrawler } from 'crawlee';
// this is ESM project, and as such, it requires you to specify extensions in your relative imports
// read more about this here: https://nodejs.org/docs/latest-v18.x/api/esm.html#mandatory-file-extensions
// note that we need to use `.js` even when inside TS files
import { firefox } from 'playwright';
import { launchOptions as camoufoxLaunchOptions } from 'camoufox-js';
import { router } from './routes.js';

interface Input {
    maxRequestsPerCrawl: number;
    proxyConfig: ProxyConfigurationOptions,
}

// Initialize the Apify SDK
await Actor.init();

// Structure of input is defined in input_schema.json
const {
    proxyConfig = { useApifyProxy: true },
    maxRequestsPerCrawl = 100,
} = await Actor.getInput<Input>() ?? {} as Input;

const proxyConfiguration = await Actor.createProxyConfiguration(proxyConfig);

const crawler = new PlaywrightCrawler({
    proxyConfiguration,
    maxRequestsPerCrawl,
    requestHandler: router,
    launchContext: {
        launcher: firefox,
        launchOptions: await camoufoxLaunchOptions({
            headless: true,
            // fonts: ['Times New Roman'] // <- custom Camoufox options
        }),
    },
});

await crawler.run([
    { url: 'https://www.datacamp.com/courses-all', label: 'list' },
]);

// Exit successfully
await Actor.exit();
