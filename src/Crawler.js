'use strict';

const URL             = require('url').URL;
const Promise         = require('bluebird');
const _               = require('lodash/fp');
const { parseAdsTxt } = require('ads.txt');
const ProxyAgent      = require('proxy-agent');


class Crawler {
    constructor({ proxyUrl } = {}) {
        this._httpClient = require('superagent');

        if (proxyUrl) {
            const agent = new ProxyAgent(proxyUrl);
            this._httpClient.agent(agent);
        }
    }

    async crawlData(url) {
        try {
            const parsedUrl = new URL(url);
            return await Promise.any([
                this._fetchByBaselineUrl(parsedUrl),
                this._fetchByRemovingFirstSubDomain(parsedUrl),
                this._fetchInRootDomainWith1PublicSuffix(parsedUrl),
                this._fetchInRootDomainWith2PublicSuffix(parsedUrl)
            ]);
        } catch (error) {
            if (error.code === 'ERR_INVALID_URL') {
                throw error;
            }
            return this._createResponse();
        }
    }

    // www.rami.com -> www.rami.com
    async _fetchByBaselineUrl(url) {
        const appAdsUrl = `${url.hostname}/app-ads.txt`;
        return this._fetchByHttpsOrHttp(appAdsUrl);
    }

    // a.b.c.example.com -> b.c.example.com
    async _fetchByRemovingFirstSubDomain(url) {
        // try to fetch root domain
        const appAdsUrl = `${url.hostname.replace(/^[^.]+\./g, '')}/app-ads.txt`;
        return this._fetchByHttpsOrHttp(appAdsUrl);
    }

    // a.b.c.example.com -> example.com
    async _fetchInRootDomainWith1PublicSuffix(url) {
        const appAdsUrl = `${url.hostname.split('.').slice(-2).join('.')}/app-ads.txt`;
        return this._fetchByHttpsOrHttp(appAdsUrl);
    }

    // a.b.c.example.co.il -> example.co.il
    async _fetchInRootDomainWith2PublicSuffix(url) {
        const appAdsUrl = `${url.hostname.split('.').slice(-3).join('.')}/app-ads.txt`;
        return this._fetchByHttpsOrHttp(appAdsUrl);
    }

    async _fetchByHttpsOrHttp(url) {
        try {
            return await this._fetchUrl(`https://${url}`);
        } catch (error) {
        }

        return await this._fetchUrl(`http://${url}`);
    }

    async _fetchUrl(url) {
        const response      = await this._httpClient
            .get(url)
            .timeout({
                response: 6000,  // Wait 6 seconds for the server to start sending,
                deadline: 60000, // Allow 1 minute for the file to finish loading.
            });
        const appAdsContent = parseAdsTxt(response.text);
        return _.isEmpty(appAdsContent.fields) ? this._createResponse() : this._createResponse(url, appAdsContent);
    }

    _createResponse(appAdsUrl = '', appAdsFileContent = '') {
        return {
            appAdsUrl: appAdsUrl,
            data     : appAdsFileContent
        };
    }
}

module.exports = Crawler;