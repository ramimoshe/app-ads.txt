# app-ads.txt
app-ads.txt crawler according to "IAB Technology Laboratory"

[![NPM version](https://img.shields.io/npm/v/app-ads-txt.svg?style=flat)](https://npmjs.org/package/app-ads-txt)
[![NPM Downloads](https://img.shields.io/npm/dm/app-ads-txt.svg?style=flat)](https://npmjs.org/package/app-ads-txt)
[![Node.js Version](https://img.shields.io/node/v/app-ads-txt.svg?style=flat)](http://nodejs.org/download/)

### install
  ```bash
    npm i app-ads-txt
  ```
  
### How to use
```js
    const appAdsTxtCrawler = require('app-ads-txt').crawler;
    const appAdsTxtData = appAdsTxtCrawler.crawlData('example.com');
```

### How it works (by "IAB Technology Laboratory")
Follow these steps to transform the developer URL into a path to crawl for locating an appads.
txt file.
1. Extract the host name portion of the URL.
2. Remove any “www.” or “m.” prefix present in the host name.
3. Remove all but the first (and, if present, second) name from the host name which
precedes the standard public suffix. For example:
a. example.com simply remains example.com
b. subdomain.example.com remains subdomain.example.com
c. another.subdomain.example.com becomes subdomain.example.com
d. another.subdomain.example.co.uk becomes subdomain.example.co.uk
4. Append /app-ads.txt to that path.
5. Crawlers should attempt to fetch the HTTPS version of the URL first, falling back to the
HTTP version if SSL is unavailable.

License
----

MIT
