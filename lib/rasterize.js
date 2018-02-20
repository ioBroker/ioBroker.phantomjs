'use strict';
var page   = require('webpage').create();
var system = require('system');

var address;
var output = '../picture.png';
var timeout = 2000;

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

page.viewportSize = {width: 800, height: 600};
page.clipRect     = {width: 800, height: 600, top: 0, left: 0};

var clipSet = false;
for (var a = 0; a < system.args.length; a++) {
    if (system.args[a] === '--width') {
        a++;
        page.viewportSize.width = parseInt(system.args[a], 10);
        if (!clipSet) {
            page.clipRect.width = page.viewportSize.width;
        }
    } else if (system.args[a] === '--height') {
        a++;
        page.viewportSize.height = parseInt(system.args[a], 10);
        if (!clipSet) {
            page.clipRect.height = page.viewportSize.height;
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
        page.clipRect.top = parseInt(system.args[a], 10);
    } else if (system.args[a] === '--clip-left') {
        a++;
        page.clipRect.left = parseInt(system.args[a], 10);
    } else if (system.args[a] === '--clip-width') {
        a++;
        page.clipRect.width = parseInt(system.args[a], 10);
        clipSet = true;
    } else if (system.args[a] === '--clip-height') {
        a++;
        page.clipRect.height = parseInt(system.args[a], 10);
        clipSet = true;
    } else if (system.args[a] === '--url') {
        a++;
        address = system.args[a];
    } else if (system.args[a] === '--output') {
        a++;
        output = system.args[a];
    } else if (system.args[a] === '--timeout') {
        a++;
        timeout = parseInt(system.args[a], 10);
    } else if (system.args[a] === '--zoom') {
        a++;
        page.zoomFactor = parseFloat(system.args[a]);
    }
}

console.log('viewportSize: ' + JSON.stringify(page.viewportSize));
console.log('clipRect:     ' + JSON.stringify(page.clipRect));
console.log('paperSize:    ' + JSON.stringify(page.paperSize));
console.log('URL:          ' + address);
console.log('output:       ' + output);
console.log('zoom:         ' + page.zoomFactor);

/*if (system.args.length > 3 && output.match(/\.pdf$/)) {
    size = system.args[3].split('*');
    page.paperSize = size.length === 2 ?
        {width: size[0], height: size[1], margin: '0px'} :
        {format: system.args[3], orientation: 'portrait', margin: '1cm'};
} else if (system.args.length > 3 && system.args[3].substr(-2) === 'px') {
    size = system.args[3].split('*');
    var pageWidth;
    var pageHeight;
    if (size.length === 2) {
        pageWidth  = parseInt(size[0], 10);
        pageHeight = parseInt(size[1], 10);

        page.viewportSize = {width: pageWidth, height: pageHeight};
        page.clipRect     = {top: 0, left: 0, width: pageWidth, height: pageHeight};
    } else {
        console.log('size:', system.args[3]);
        pageWidth  = parseInt(system.args[3], 10);
        pageHeight = parseInt(pageWidth * 3/4, 10); // it's as good an assumption as any

        console.log('pageHeight:', pageHeight);
        page.viewportSize = {width: pageWidth, height: pageHeight};
    }
}*/
page.onError = function (msg, trace) {
    var msgStack = ['ERROR: ' + msg];

    if (trace && trace.length) {
        msgStack.push('TRACE:');
        trace.forEach(function(t) {
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
    console.log(new Date().toISOString() + ' Done: ' + status);
    if (status !== 'success') {
        console.error('Unable to load the address!');
        phantom.exit(1);
    } else {
        window.setTimeout(function () {
            try {
                console.log(new Date().toISOString() + ' Render...');
                page.render(output);
            } catch (err) {
                console.error(err);
                phantom.exit(1);
            }
            var fs = require('fs');
            var count = 0;
            var ivl = setInterval(function() {
                count++;
                console.log(new Date().toISOString() + ' Done');
                if (fs.isFile(output)) {
                    console.log(new Date().toISOString() + ' Exists');
                    clearInterval(ivl);
                    phantom.exit();
                }
                if (count > 40) {
                    console.log(new Date().toISOString() + ' Timeout');
                    phantom.exit();
                }
            }, 300);
            console.log(new Date().toISOString() + ' Done');
            //phantom.exit();
        }, timeout);
    }
});
