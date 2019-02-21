'use strict';

const Crawler = require('../../src/Crawler');


describe('Crawler', function () {

    describe('Test proxy', () => {
        test('crawlData - valid url - should return data', async () => {
            try {
                const crawler = new Crawler({ proxyUrl: '' });
                const res     = await crawler.crawlData('');
                console.log(res);
            } catch (error) {
                console.log(error);
            }
        });
    });

});
