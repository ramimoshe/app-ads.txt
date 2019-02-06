'use strict';

const URL             = require('url').URL;
const Promise         = require('bluebird');
const request         = require('superagent');
const _               = require('lodash/fp');
const { parseAdsTxt } = require('ads.txt');


exports.crawlData = url => {
    try {
        const parsedUrl = new URL(url);
        return Promise.any([
            fetchByBaselineUrl(parsedUrl),
            fetchByRemovingFirstSubDomain(parsedUrl),
            fetchInRootDomainWith1PublicSuffix(parsedUrl),
            fetchInRootDomainWith2PublicSuffix(parsedUrl)
        ]);
    } catch (error) {
        if (error.code === 'ERR_INVALID_URL') {
            throw error;
        }
        return createResponse();
    }
};

// www.rami.com -> www.rami.com
async function fetchByBaselineUrl(url) {
    const appAdsUrl = `${url.hostname}/app-ads.txt`;
    return fetchByHttpsOrHttp(appAdsUrl);
}

// a.b.c.example.com -> b.c.example.com
async function fetchByRemovingFirstSubDomain(url) {
    // try to fetch root domain
    const appAdsUrl = `${url.hostname.replace(/^[^.]+\./g, '')}/app-ads.txt`;
    return fetchByHttpsOrHttp(appAdsUrl);
}

// a.b.c.example.com -> example.com
async function fetchInRootDomainWith1PublicSuffix(url) {
    const appAdsUrl = `${url.hostname.split('.').slice(-2).join('.')}/app-ads.txt`;
    return fetchByHttpsOrHttp(appAdsUrl);
}

// a.b.c.example.co.il -> example.co.il
async function fetchInRootDomainWith2PublicSuffix(url) {
    const appAdsUrl = `${url.hostname.split('.').slice(-3).join('.')}/app-ads.txt`;
    return fetchByHttpsOrHttp(appAdsUrl);
}

async function fetchByHttpsOrHttp(url) {
    try {
        return await fetchUrl(`https://${url}`);
    } catch (error) {

    }

    return await fetchUrl(`http://${url}`);
}

async function fetchUrl(url) {
    const response      = await request.get(url);
    const appAdsContent = parseAdsTxt(response.body);
    return _.isEmpty(appAdsContent.fields) ? createResponse() : createResponse(url, appAdsContent);
}

function createResponse(appAdsUrl = '', appAdsFileContent = '') {
    return {
        appAdsUrl: appAdsUrl,
        data     : appAdsFileContent
    };
}
