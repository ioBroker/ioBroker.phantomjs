/* jshint -W097 */// jshint strict:false
/*jslint node: true */
'use strict';

var utils     = require(__dirname + '/lib/utils'); // Get common adapter utils
var path      = require('path');
var fs        = require('fs');
var cp        = require('child_process');
var phantomjs = require('phantomjs-prebuilt');

var fileName;
var width;
var height;
var renderTime;
var online;

var adapter = utils.Adapter('phantomjs');

adapter.on('stateChange', function (id, state) {
    if (state && !state.ack) {
        if (id === adapter.namespace + '.filename') {
            fileName = getFileName(state.val);
            adapter.setState('filename', fileName, true);
        } else if (state.val && id === adapter.namespace + '.url') {
            setTimeout(function () {
                render({
                    url:        state.val,
                    output:     fileName,
                    width:      width,
                    height:     height,
                    timeout:    renderTime,
                    online:     online
                }, function (err, stdout, stderr) {
                    if (err) adapter.log.error(err);
                    if (stderr) adapter.log.error(stderr);
                    if (stdout) adapter.log.debug(stdout);
                    adapter.setState('url', state.val, true);
                });
            }, 0);
        } else if (state.val && id === adapter.namespace + '.width') {
            width = parseInt(state.val, 10) || 800;
            adapter.setState('width', width, true);
        } else if (state.val && id === adapter.namespace + '.height') {
            height = parseInt(state.val, 10) || 600;
            adapter.setState('height', height, true);
        } else if (state.val !== undefined && id === adapter.namespace + '.renderTime') {
            renderTime = parseInt(state.val, 10) || 2000;
            adapter.setState('renderTime', renderTime, true);
        } else if (state.val !== undefined && id === adapter.namespace + '.online') {
            online = state.val === 1 || state.val === '1' || state.val === 'true' || state.val === true;
            adapter.setState('online', online, true);
        }
    }
});

adapter.on('ready', function () {
    main();
});

adapter.on('message', function (msg) {
    processMessage(msg);
});

process.on('uncaughtException', function(err) {
    adapter.log.warn('Exception: ' + err);
});

function processMessage(msg) {
    if (msg.command == 'send') {

        var options = {
            url:         msg.message.url || '',
            output:      getFileName(msg.message.output || fileName),
            width:       msg.message.width      ? parseInt(msg.message.width,      10) || 800  : width,
            height:      msg.message.height     ? parseInt(msg.message.height,     10) || 600  : height,
            timeout:     msg.message.renderTime ? parseInt(msg.message.renderTime, 10) || 2000 : renderTime,
            online:      (msg.message.online !== undefined) ? (msg.message.online === 1 || msg.message.online === '1' || msg.message.online === 'true' || msg.message.online === true) : online
        };

        setTimeout(function () {
            render(options, function (err, stdout, stderr) {
                if (err) adapter.log.error(err);
                if (msg.callback) {
                    options.error = err;
                    adapter.sendTo(msg.from, msg.command, options, msg.callback);
                }
            });
        }, 0);
    }
}

function getFileName(newName) {
    if (!newName) newName = 'picture.png';

    if (newName[0] !== '/' && !newName.match(/[A-Za-z]+:/)) {
        newName = path.join(__dirname, newName);
    }
    return newName;
}

function render(options, callback) {
    adapter.log.info('Create ' + options.width + 'px*' + options.height + 'px ' + ' in ' + options.timeout + 'ms - "' + options.url + '" => "' + options.output + '"');

    adapter.setState('working', true, true);
    cp.execFile(phantomjs.path, [
        __dirname + '/lib/rasterize.js',
        options.url,
        options.output,
        (options.output || '').match(/\.pdf/i) ? options.paging || 'A4' : (options.width + 'px*' + options.height + 'px'),
        options.timeout + 'ms'
    ], function (err, stdout, stderr) {
        adapter.setState('working', false, true);
        adapter.log.info('and save to "' + options.output + '"');

        if (!err && options.online) {
            var parts    = options.output.replace(/\\/g, '/').split('/');
            var fileName = parts.pop().replace(/[.\s]/g, '_');

            try {
                var data = fs.readFileSync(options.output);
                adapter.getObject('pictures.' + fileName, function (err, obj) {
                    if (!obj) {
                        adapter.setObject('pictures.' + fileName, {
                            common: {
                                type:   'file',
                                role:   'file',
                                read:   true,
                                write:  false,
                                desc:   'Can be accessed from web server under http://ip:8082/state/' + adapter.namespace + '.pictures.' + fileName
                            },
                            type: 'state',
                            native: {
                                url: options.url
                            }
                        });
                    }
                });
                adapter.setBinaryState(adapter.namespace + '.pictures.' + fileName, data, function (err) {
                    if (err) adapter.log.error(err);
                    callback && callback(err, stdout, stderr);
                });
            } catch (err) {
                adapter.log.error('Cannot read file "' + options.output + '": ' + err);
                callback && callback(err, stdout, stderr);
            }
        } else {
            callback && callback(err, stdout, stderr);
        }
    });
}

function main() {
    adapter.getState('working', function (err, state) {
        if (err) adapter.log.error(err);
        if (!state || state.val || !state.ack) {
            adapter.setState('working', false, true);
        }
    });

    adapter.getState('filename', function (err, state) {
        if (err) adapter.log.error(err);
        fileName = getFileName(state ? state.val : '');
        if (!state || state.val !== fileName || !state.ack) {
            adapter.setState('filename', fileName, true);
        }
    });

    adapter.getState('height', function (err, state) {
        if (err) adapter.log.error(err);
        height = parseInt(state ? state.val : 0, 10) || 600;
        if (!state || state.val !== height || !state.ack) {
            adapter.setState('height', height, true);
        }
    });

    adapter.getState('renderTime', function (err, state) {
        if (err) adapter.log.error(err);
        renderTime = parseInt(state ? state.val : 0, 10) || 2000;
        if (!state || state.val !== renderTime || !state.ack) {
            adapter.setState('renderTime', renderTime, true);
        }
    });

    adapter.getState('online', function (err, state) {
        if (err) adapter.log.error(err);
        online = !!(state && (state.val === 1 || state.val === '1' || state.val === 'true' || state.val === true));
        if (!state || state.val !== online || !state.ack) {
            adapter.setState('online', online, true);
        }
    });

    adapter.getState('width', function (err, state) {
        if (err) adapter.log.error(err);
        width = parseInt(state ? state.val : 0, 10) || 800;
        if (!state || state.val !== width || !state.ack) {
            adapter.setState('width', width, true);
        }
    });
    adapter.subscribeStates('*');
}
