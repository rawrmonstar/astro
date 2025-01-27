import { expect } from 'chai';
import cheerio from 'cheerio';
import { loadFixture } from './test-utils.js';

describe('Svelte component', () => {
  let fixture;

  before(async () => {
    fixture = await loadFixture({
      projectRoot: './fixtures/svelte-component/',
      renderers: ['@astrojs/renderer-svelte'],
    });
  });

  describe('build', () => {
    before(async () => {
      await fixture.build();
    });

    it('Works with TypeScript', async () => {
      const html = await fixture.readFile('/typescript/index.html');
      const $ = cheerio.load(html);

      expect($('#svelte-ts').text()).to.equal('Hello, TypeScript');
    });
  });

  describe('dev', () => {
    let devServer;

    before(async () => {
      devServer = await fixture.startDevServer();
    });

    after(async () => {
      devServer && (await devServer.stop());
    });

    it('scripts proxy correctly', async () => {
      const html = await fixture.fetch('/').then((res) => res.text());
      const $ = cheerio.load(html);

      for (const script of $('script').toArray()) {
        const { src } = script.attribs;
        if (!src) continue;
        console.log({ src });
        expect((await fixture.fetch(src)).status, `404: ${src}`).to.equal(200);
      }
    });
  });
});
