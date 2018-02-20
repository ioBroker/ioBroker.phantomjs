'use strict';
var page   = require('webpage').create();
var system = require('system');

var address;
var output;
var timeout = 2000;

page.viewportSize = {width: 800, height: 600};
// page.clipRect = {xxx} does not work!
var clipRect = {width: 810, height: 600, top: 0, left: 0};

// page = {
//     "objectName": "WebPage",
//     "title": "",
//     "frameTitle": "",
//     "content": "<html><head></head><body></body></html>",
//     "frameContent": "<html><head></head><body></body></html>",
//     "url": "",
//     "frameUrl": "",
//     "loading": false,
//     "loadingProgress": 0,
//     "canGoBack": false,
//     "canGoForward": false,
//     "plainText": "",
//     "framePlainText": "",
//     "libraryPath": "C:/ioBroker.phantomjs/lib",
//     "offlineStoragePath": "C:/Users/ttt/AppData/Local/Ofi Labs/PhantomJS",
//     "offlineStorageQuota": 5242880,
//     "viewportSize": {"height": 600, "width": 800},
//     "paperSize": {},
//     "clipRect": {"height": 600, "left": 0, "top": 0, "width": 800},
//     "scrollPosition": {"left": 0, "top": 0},
//     "navigationLocked": false,
//     "customHeaders": {},
//     "zoomFactor": 1,
//     "cookies": [],
//     "windowName": "",
//     "pages": [],
//     "pagesWindowName": [],
//     "ownsPages": true,
//     "framesName": [],
//     "frameName": "",
//     "framesCount": 0,
//     "focusedFrameName": "",
//     "cookieJar": {"objectName": "", "cookies": []}
// }

var clipSet = false;
for (var a = 0; a < system.args.length; a++) {
    if (system.args[a] === '--width') {
        a++;
        page.viewportSize.width = parseInt(system.args[a], 10);
        if (!clipSet) {
            clipRect.width = page.viewportSize.width;
        }
    } else if (system.args[a] === '--height') {
        a++;
        page.viewportSize.height = parseInt(system.args[a], 10);
        if (!clipSet) {
            clipRect.height = page.viewportSize.height;
        }
    } else if (system.args[a] === '--paper-format') {
        a++;
        if (page.paperSize && page.paperSize.format) {
            page.paperSize.format = system.args[a];
        } else {
            page.paperSize = {format: system.args[a], orientation: 'portrait', margin: '1cm'};
        }
    } else if (system.args[a] === '--paper-orientation') {
        a++;
        if (page.paperSize && page.paperSize.orientation) {
            page.paperSize.orientation = system.args[a];
        } else {
            page.paperSize = {format: 'A4', orientation: system.args[a], margin: '1cm'};
        }
    } else if (system.args[a] === '--paper-margin') {
        a++;
        if (page.paperSize && page.paperSize.margin) {
            page.paperSize.margin = system.args[a];
        } else {
            page.paperSize = {format: 'A4', orientation: 'portrait', margin: system.args[a]};
        }
    } else if (system.args[a] === '--paper-margin-top') {
        a++;
        if (page.paperSize && page.paperSize.margin !== undefined) {
            if (typeof page.paperSize.margin !== 'object') {
                page.paperSize.margin = {top: system.args[a], left: 0};
            } else {
                page.paperSize.margin.top = system.args[a];
            }
        } else {
            page.paperSize = {format: 'A4', orientation: 'portrait', margin: {top: system.args[a], left: 0}};
        }
    } else if (system.args[a] === '--paper-margin-left') {
        a++;
        if (page.paperSize && page.paperSize.margin !== undefined) {
            if (typeof page.paperSize.margin !== 'object') {
                page.paperSize.margin = {top: 0, left: system.args[a]};
            } else {
                page.paperSize.margin.left = system.args[a];
            }
        } else {
            page.paperSize = {format: 'A4', orientation: 'portrait', margin: {top: 0, left: system.args[a]}};
        }
    } else if (system.args[a] === '--paper-width') {
        a++;
        if (!page.paperSize || !page.paperSize.width) {
            page.paperSize = {width: system.args[a], height: 600, margin: '0px'};
        } else {
            page.paperSize.width = system.args[a];
        }
    } else if (system.args[a] === '--paper-height') {
        a++;
        if (!page.paperSize || !page.paperSize.height) {
            page.paperSize = {width: 800, height: system.args[a], margin: '0px'};
        } else {
            page.paperSize.height = system.args[a];
        }
    } else if (system.args[a] === '--clip-top') {
        a++;
        clipRect.top = parseInt(system.args[a], 10);
    } else if (system.args[a] === '--clip-left') {
        a++;
        clipRect.left = parseInt(system.args[a], 10);
    } else if (system.args[a] === '--clip-width') {
        a++;
        clipRect.width = parseInt(system.args[a], 10);
        clipSet = true;
    } else if (system.args[a] === '--clip-height') {
        a++;
        clipRect.height = parseInt(system.args[a], 10);
        clipSet = true;
    } else if (system.args[a] === '--url') {
        a++;
        address = system.args[a];
    } else if (system.args[a] === '--output') {
        a++;
        output = system.args[a].replace(/^"/, '').replace(/"$/, '');
    } else if (system.args[a] === '--timeout' || system.args[a] === '--renderTime') {
        a++;
        timeout = parseInt(system.args[a], 10);
    } else if (system.args[a] === '--zoom') {
        a++;
        page.zoomFactor = parseFloat(system.args[a]);
    } else if (system.args[a] === '--scroll-left') {
        a++;
        page.scrollPosition.left = parseInt(system.args[a], 10);
    } else if (system.args[a] === '--scroll-top') {
        a++;
        page.scrollPosition.top = parseInt(system.args[a], 10);
    }
}
page.clipRect = clipRect;

if (!address) {
    console.error('No URL specified!');
    phantom.exit(1);
} else
if (!output) {
    console.error('No output specified!');
    phantom.exit(2);
} else {
    console.log('viewportSize:   ' + JSON.stringify(page.viewportSize));
    console.log('clipRect:       ' + JSON.stringify(page.clipRect));
    console.log('paperSize:      ' + JSON.stringify(page.paperSize));
    console.log('scrollPosition: ' + JSON.stringify(page.scrollPosition));
    console.log('URL:            ' + address);
    console.log('output:         ' + output);
    console.log('zoom:           ' + page.zoomFactor);

    page.onError = function (msg, trace) {
        var msgStack = ['ERROR: ' + msg];

        if (trace && trace.length) {
            msgStack.push('TRACE:');
            trace.forEach(function (t) {
                msgStack.push(' -> ' + t.file + ': ' + t.line + (t.function ? ' (in function "' + t.function +'")' : ''));
            });
        }

        console.error(msgStack.join('\n'));
    };

    page.onResourceError = function (resourceError) {
        console.log('Unable to load resource (#' + resourceError.id + 'URL:' + resourceError.url + ')');
        console.log('Error code: ' + resourceError.errorCode + '. Description: ' + resourceError.errorString);
    };

    page.open(address, function (status) {
        if (status !== 'success') {
            console.error('Unable to load the address!');
            phantom.exit(1);
        } else {
            window.setTimeout(function () {
                try {
                    page.render(output);
                } catch (err) {
                    console.error(err);
                    phantom.exit(3);
                }
                phantom.exit();
            }, timeout);
        }
    });
}
