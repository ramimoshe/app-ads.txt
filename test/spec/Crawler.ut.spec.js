'use strict';

const Promise        = require('bluebird');
const request        = require('superagent');
const superagentmock = require('superagent-mocker')(request);
const Crawler        = require('../../src/Crawler');


describe('Crawler', function () {

    describe('Test invalid inputs', () => {
        test('crawlData - invalid url - should throw ERR_INVALID_URL exception', async () => {
            try {
                const crawler = new Crawler();
                await crawler.crawlData('invalid');
            } catch (error) {
                expect(error.code).toEqual('ERR_INVALID_URL');
            }
        });
    });

    describe('app-ads.txt not found', () => {
        test('crawlData - valid url - should return an empty content', async () => {
            await Promise.each(['http', 'https'], async protocol => {
                superagentmock.clearRoutes();
                superagentmock.get('*', () => {
                    throw new Error('not found');
                });

                const url     = `${protocol}://example.com/test`;
                const crawler = new Crawler();
                const result  = await crawler.crawlData(url);

                expect(result).toEqual({
                    appAdsUrl: '',
                    data     : ''
                });
            });
        });
    });

    describe('Test baseline developer URL - ' +
        'This test illustrates the baseline URL without any subdomain.', () => {
        test('crawlData - valid url - should return app-ads.txt content', async () => {
            await Promise.each(['http', 'https'], async protocol => {
                superagentmock.clearRoutes();
                const responseDataMock = 'rami.com,104023,DIRECT,79929e88b2ba73bc';
                superagentmock.get('*', () => {
                    throw new Error('not found');
                });
                superagentmock.get(`${protocol}://example.com/app-ads.txt`, () => {
                    return {
                        text: responseDataMock
                    };
                });

                const url     = `${protocol}://example.com/test`;
                const crawler = new Crawler();
                const result  = await crawler.crawlData(url);

                expect(result).toEqual({
                    appAdsUrl: `${protocol}://example.com/app-ads.txt`,
                    data     : {
                        variables: {},
                        fields   :
                            [{
                                domain                : 'rami.com',
                                publisherAccountID    : '104023',
                                accountType           : 'DIRECT',
                                certificateAuthorityID: '79929e88b2ba73bc'
                            }]
                    }
                });
            });
        });
    });

    describe('Test developer URL with ignored www. subdomain - ' +
        'This test illustrates the normalization of the common “www” subdomain.', () => {
        test('crawlData - valid url - should return app-ads.txt content', async () => {
            await Promise.each(['http', 'https'], async protocol => {
                superagentmock.clearRoutes();
                const responseDataMock = 'rami.com,104023,DIRECT,79929e88b2ba73bc';
                superagentmock.get('*', () => {
                    throw new Error('not found');
                });
                superagentmock.get(`${protocol}://example.com/app-ads.txt`, () => {
                    return {
                        text: responseDataMock
                    };
                });

                superagentmock.get(`${protocol}://www.example.com/app-ads.txt`, () => {
                    throw new Error('tried to fetch wrong url');
                });

                const url     = `${protocol}://www.example.com/test`;
                const crawler = new Crawler();
                const result  = await crawler.crawlData(url);

                expect(result).toEqual({
                    appAdsUrl: `${protocol}://example.com/app-ads.txt`,
                    data     : {
                        variables: {},
                        fields   :
                            [{
                                domain                : 'rami.com',
                                publisherAccountID    : '104023',
                                accountType           : 'DIRECT',
                                certificateAuthorityID: '79929e88b2ba73bc'
                            }]
                    }
                });
            });
        });
    });

    describe('Test “m.” developer URL with ignored m. subdomain' +
        'This test illustrates the normalization of the common “m” subdomain.', () => {
        test('crawlData - valid url - should return app-ads.txt content', async () => {
            await Promise.each(['http', 'https'], async protocol => {
                superagentmock.clearRoutes();
                const responseDataMock = 'rami.com,104023,DIRECT,79929e88b2ba73bc';
                superagentmock.get('*', () => {
                    throw new Error('not found');
                });
                superagentmock.get(`${protocol}://example.com/app-ads.txt`, () => {
                    return {
                        text: responseDataMock
                    };
                });

                superagentmock.get(`${protocol}://m.example.com/app-ads.txt`, () => {
                    throw new Error('tried to fetch wrong url');
                });

                const url     = `${protocol}://m.example.com/test`;
                const crawler = new Crawler();
                const result  = await crawler.crawlData(url);

                expect(result).toEqual({
                    appAdsUrl: `${protocol}://example.com/app-ads.txt`,
                    data     : {
                        variables: {},
                        fields   :
                            [{
                                domain                : 'rami.com',
                                publisherAccountID    : '104023',
                                accountType           : 'DIRECT',
                                certificateAuthorityID: '79929e88b2ba73bc'
                            }]
                    }
                });
            });
        });
    });

    describe('Test developer URL with subdomain - ' +
        'This test illustrates how the subdomain will be used for locating an app-ads.txt file.', () => {
        test('crawlData - valid url - should return app-ads.txt content', async () => {
            await Promise.each(['http', 'https'], async protocol => {
                superagentmock.clearRoutes();
                const responseDataMock = 'rami.com,104023,DIRECT,79929e88b2ba73bc';
                superagentmock.get('*', () => {
                    throw new Error('not found');
                });
                superagentmock.get(`${protocol}://subdomain.example.com/app-ads.txt`, () => {
                    return {
                        text: responseDataMock
                    };
                });

                const url     = `${protocol}://subdomain.example.com/test`;
                const crawler = new Crawler();
                const result  = await crawler.crawlData(url);

                expect(result).toEqual({
                    appAdsUrl: `${protocol}://subdomain.example.com/app-ads.txt`,
                    data     : {
                        variables: {},
                        fields   :
                            [{
                                domain                : 'rami.com',
                                publisherAccountID    : '104023',
                                accountType           : 'DIRECT',
                                certificateAuthorityID: '79929e88b2ba73bc'
                            }]
                    }
                });
            });
        });

        test('crawlData - valid url without data on subdomain - should return app-ads.txt content from root domain', async () => {
            await Promise.each(['http', 'https'], async protocol => {
                superagentmock.clearRoutes();
                const responseDataMock = 'rami.com,104023,DIRECT,79929e88b2ba73bc';
                superagentmock.get('*', () => {
                    throw new Error('not found');
                });
                superagentmock.get(`${protocol}://example.com/app-ads.txt`, () => {
                    return {
                        text: responseDataMock
                    };
                });

                superagentmock.get(`${protocol}://subdomain.example.com/app-ads.txt`, () => {
                    throw new Error('tried to fetch wrong url');
                });

                const url     = `${protocol}://subdomain.example.com/test`;
                const crawler = new Crawler();
                const result  = await crawler.crawlData(url);

                expect(result).toEqual({
                    appAdsUrl: `${protocol}://example.com/app-ads.txt`,
                    data     : {
                        variables: {},
                        fields   :
                            [{
                                domain                : 'rami.com',
                                publisherAccountID    : '104023',
                                accountType           : 'DIRECT',
                                certificateAuthorityID: '79929e88b2ba73bc'
                            }]
                    }
                });
            });
        });
    });

    describe('Test developer URL with multiple subdomains - ' +
        'This test illustrates how only the first subdomain will be used for locating an app-ads.txt file.', () => {
        test('crawlData - valid url - should return app-ads.txt content', async () => {
            await Promise.each(['http', 'https'], async protocol => {
                superagentmock.clearRoutes();
                const responseDataMock = 'rami.com,104023,DIRECT,79929e88b2ba73bc';
                superagentmock.get('*', () => {
                    throw new Error('not found');
                });
                superagentmock.get(`${protocol}://subdomain.example.com/app-ads.txt`, () => {
                    return {
                        text: responseDataMock
                    };
                });

                const url     = `${protocol}://another.subdomain.example.com/test`;
                const crawler = new Crawler();
                const result  = await crawler.crawlData(url);

                expect(result).toEqual({
                    appAdsUrl: `${protocol}://subdomain.example.com/app-ads.txt`,
                    data     : {
                        variables: {},
                        fields   :
                            [{
                                domain                : 'rami.com',
                                publisherAccountID    : '104023',
                                accountType           : 'DIRECT',
                                certificateAuthorityID: '79929e88b2ba73bc'
                            }]
                    }
                });
            });
        });

        test('crawlData - valid url without data on subdomain - should return app-ads.txt content from root domain', async () => {
            await Promise.each(['http', 'https'], async protocol => {
                superagentmock.clearRoutes();
                const responseDataMock = 'rami.com,104023,DIRECT,79929e88b2ba73bc';
                superagentmock.get('*', () => {
                    throw new Error('not found');
                });
                superagentmock.get(`${protocol}://example.com/app-ads.txt`, () => {
                    return {
                        text: responseDataMock
                    };
                });

                superagentmock.get(`${protocol}://subdomain.example.com/app-ads.txt`, () => {
                    throw new Error('tried to fetch wrong url');
                });

                const url     = `${protocol}://another.subdomain.example.com/test`;
                const crawler = new Crawler();
                const result  = await crawler.crawlData(url);

                expect(result).toEqual({
                    appAdsUrl: `${protocol}://example.com/app-ads.txt`,
                    data     : {
                        variables: {},
                        fields   :
                            [{
                                domain                : 'rami.com',
                                publisherAccountID    : '104023',
                                accountType           : 'DIRECT',
                                certificateAuthorityID: '79929e88b2ba73bc'
                            }]
                    }
                });
            });
        });
    });

    describe('Test developer URL with subdomain on a multipart public suffix - ' +
        'This test illustrates how only the first subdomain will be used for locating an app-ads.txt file for a ' +
        'URL with a multipart public suffix.', () => {
        test('crawlData - valid url - should return app-ads.txt content', async () => {
            await Promise.each(['http', 'https'], async protocol => {
                superagentmock.clearRoutes();
                const responseDataMock = 'rami.com,104023,DIRECT,79929e88b2ba73bc';
                superagentmock.get('*', () => {
                    throw new Error('not found');
                });
                superagentmock.get(`${protocol}://subdomain.example.co.uk/app-ads.txt`, () => {
                    return {
                        text: responseDataMock
                    };
                });

                const url     = `${protocol}://another.subdomain.example.co.uk/test`;
                const crawler = new Crawler();
                const result  = await crawler.crawlData(url);

                expect(result).toEqual({
                    appAdsUrl: `${protocol}://subdomain.example.co.uk/app-ads.txt`,
                    data     : {
                        variables: {},
                        fields   :
                            [{
                                domain                : 'rami.com',
                                publisherAccountID    : '104023',
                                accountType           : 'DIRECT',
                                certificateAuthorityID: '79929e88b2ba73bc'
                            }]
                    }
                });
            });
        });

        test('crawlData - valid url without data on subdomain - should return app-ads.txt content from root domain', async () => {
            await Promise.each(['http', 'https'], async protocol => {
                superagentmock.clearRoutes();
                const responseDataMock = 'rami.com,104023,DIRECT,79929e88b2ba73bc';
                superagentmock.get('*', () => {
                    throw new Error('not found');
                });
                superagentmock.get(`${protocol}://example.co.uk/app-ads.txt`, () => {
                    return {
                        text: responseDataMock
                    };
                });

                superagentmock.get(`${protocol}://subdomain.example.co.uk/app-ads.txt`, () => {
                    throw new Error('tried to fetch wrong url');
                });

                const url     = `${protocol}://another.subdomain.example.co.uk/test`;
                const crawler = new Crawler();
                const result  = await crawler.crawlData(url);

                expect(result).toEqual({
                    appAdsUrl: `${protocol}://example.co.uk/app-ads.txt`,
                    data     : {
                        variables: {},
                        fields   :
                            [{
                                domain                : 'rami.com',
                                publisherAccountID    : '104023',
                                accountType           : 'DIRECT',
                                certificateAuthorityID: '79929e88b2ba73bc'
                            }]
                    }
                });
            });
        });
    });

});
