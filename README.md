![Logo](admin/phantomjs.png)
# ioBroker.phantomjs
====================

[![NPM version](http://img.shields.io/npm/v/iobroker.phantomjs.svg)](https://www.npmjs.com/package/iobroker.phantomjs)
[![Downloads](https://img.shields.io/npm/dm/iobroker.phantomjs.svg)](https://www.npmjs.com/package/iobroker.phantomjs)
[![Tests](https://travis-ci.org/ioBroker/ioBroker.phantomjs.svg?branch=master)](https://travis-ci.org/ioBroker/ioBroker.phantomjs)

[![NPM](https://nodei.co/npm/iobroker.phantomjs.png?downloads=true)](https://nodei.co/npm/iobroker.phantomjs/)

This adapter allows you to create the screen shots of web pages (e.g. flot) and save it as png file or share it via internal WEB-server.

User can later send this file in email or per telegram or whatever.

Slow web clients can display the charts if the charts will be automatically generated every x minutes.

## Usage
There are two ways how to create images.

### Via states
By creation of the instance for states will be created:
- **filename** - file name, where the picture will be saved. If path is not absolute, it will be relative to ```.../iobroker/node_modules/iobroker.phantomjs```
- **width** - width of the picture. Default value 800px
- **height** - height of the picture. Default value 600px
- **renderTime** - Interval in ms to wait till the page will be rendered
- **online** - If requested URL picture must be uploaded to internal web server. It could be accessed then via http://ip:8082/state/phantomjs.0.filename_png
- **url** - url that should be rendered. This state should be written as all other states are filled with required data.

After the url state is written, the adapter tries to create the picture and as it created changes the ack flag of **url** state to true.

### Via messages
With the script code, like this:

```
sendTo('phantomjs.0', 'send', {
    url: 'http://localhost:8082/flot/index.html?l%5B0%5D%5Bid%5D=system.adapter.admin.0.memHeapTotal&l%5B0%5D%5Boffset%5D=0&l%5B0%5D%5Bart%5D=average&l%5B0%5D%5Bcolor%5D=%23FF0000&l%5B0%5D%5Bthickness%5D=3&l%5B0%5D%5Bshadowsize%5D=3&timeArt=relative&relativeEnd=now&range=10&live=false&aggregateType=step&aggregateSpan=300&hoverDetail=false&useComma=false&zoom=false',
    output: 'image.png',
    width: 300,
    height: 200,
	renderTime: 10000,
	online: true
}, function (result) {
    console.log(result.error + ' ' + result.output);
});
```

you can create a screen shot of some URL. Only **url** field is mandatory all others are optional and will be filled from current settings.  


## Changelog
### 0.1.1 (2016-04-30)
* (bluefox) change package name from phantomjs to phantomjs-prebuilt

### 0.1.0 (2016-04-30)
* (bluefox) add renderTime
* (bluefox) add upload to local web-server

### 0.0.1 (2016-04-28)
* (bluefox) initial commit

## License
Copyright 2016 bluefox <dogafox@gmail.com>.

Licensed under the Apache License, Version 2.0 (the "License"); you may not use this file except in compliance with the License. You may obtain a copy of the License at

http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software distributed under the License is distributed on an 
"AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the License for the specific 
language governing permissions and limitations under the License.