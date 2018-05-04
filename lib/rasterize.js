'use strict';
var page;
var system;
try {
    page   = require('webpage').create();
    system = require('system');
} catch (e) {
    console.log('Simulation');
    page = {};
    system = {args: process.argv};
}

var address;
var output;
var timeout = 2000;

// page.viewportSize = {width: 800, height: 600}; does not work?
var viewportSize   = {width: 800, height: 600};
var clipRect       = {width: 810, height: 600, top: 0, left: 0};
var scrollPosition = {top: 0, left: 0};
var paperSize      = {};
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
        viewportSize.width = parseInt(system.args[a], 10);
        if (!clipSet) {
            clipRect.width = viewportSize.width;
        }
    } else if (system.args[a] === '--height') {
        a++;
        viewportSize.height = parseInt(system.args[a], 10);
        if (!clipSet) {
            clipRect.height = viewportSize.height;
        }
    } else if (system.args[a] === '--paper-format') {
        a++;
        if (paperSize.format) {
            paperSize.format = system.args[a];
        } else {
            paperSize = {format: system.args[a], orientation: 'portrait', margin: '1cm'};
        }
        paperSize.changed = true;
    } else if (system.args[a] === '--paper-orientation') {
        a++;
        if (paperSize.orientation) {
            paperSize.orientation = system.args[a];
        } else {
            paperSize = {format: 'A4', orientation: system.args[a], margin: '1cm'};
        }
        paperSize.changed = true;
    } else if (system.args[a] === '--paper-margin') {
        a++;
        if (paperSize.margin) {
            paperSize.margin = system.args[a];
        } else {
            paperSize = {format: 'A4', orientation: 'portrait', margin: system.args[a]};
        }
        paperSize.changed = true;
    } else if (system.args[a] === '--paper-margin-top') {
        a++;
        if (paperSize.margin !== undefined) {
            if (typeof paperSize.margin !== 'object') {
                paperSize.margin = {top: system.args[a], left: 0};
            } else {
                paperSize.margin.top = system.args[a];
            }
        } else {
            paperSize = {format: 'A4', orientation: 'portrait', margin: {top: system.args[a], left: 0}};
        }
        paperSize.changed = true;
    } else if (system.args[a] === '--paper-margin-left') {
        a++;
        if (paperSize.margin !== undefined) {
            if (typeof paperSize.margin !== 'object') {
                paperSize.margin = {top: 0, left: system.args[a]};
            } else {
                paperSize.margin.left = system.args[a];
            }
        } else {
            paperSize = {format: 'A4', orientation: 'portrait', margin: {top: 0, left: system.args[a]}};
        }
        paperSize.changed = true;
    } else if (system.args[a] === '--paper-width') {
        a++;
        if (!paperSize.width) {
            paperSize = {width: system.args[a], height: 600, margin: '0px'};
        } else {
            paperSize.width = system.args[a];
        }
        paperSize.changed = true;
    } else if (system.args[a] === '--paper-height') {
        a++;
        if (!paperSize.height) {
            paperSize = {width: 800, height: system.args[a], margin: '0px'};
        } else {
            paperSize.height = system.args[a];
        }
        paperSize.changed = true;
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
        scrollPosition.left = parseInt(system.args[a], 10);
    } else if (system.args[a] === '--scroll-top') {
        a++;
        scrollPosition.top = parseInt(system.args[a], 10);
    }
}
page.viewportSize   = viewportSize;
page.clipRect       = clipRect;
if (paperSize.changed) {
    delete paperSize.changed;
    page.paperSize      = paperSize;
}

page.scrollPosition = scrollPosition;

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

    if (typeof page.open !== 'function') {
        process && process.exit(); // simulation stopped
    }

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
