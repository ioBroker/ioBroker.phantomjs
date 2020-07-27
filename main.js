/* jshint -W097 */// jshint strict:false
/*jslint node: true */
'use strict';

var utils = require('@iobroker/adapter-core'); // Get common adapter utils
var path      = require('path');
var fs        = require('fs');
var cp        = require('child_process');
var phantomjs = require('phantomjs-prebuilt');

var settings = {
    output:                 '',
    width:                  800,
    height:                 600,
    timeout:                2000,
    online:                 false,
    'clip-top':             0,
    'clip-left':            0,
    'clip-width':           800,
    'clip-height':          600,
    'scroll-top':           0,
    'scroll-left':          0,
    url:                    ''
};
var adapter = utils.Adapter('phantomjs');

adapter.on('stateChange', function (id, state) {
    if (state && !state.ack) {
        if (id === adapter.namespace + '.filename') {
            settings.output = getFileName(state.val);
            adapter.setState('filename', settings.output, true);
        } else if (state.val && id === adapter.namespace + '.url') {
            settings.url = state.val;
            setTimeout(function () {
                render(Object.assign({}, settings), function (err, stdout, stderr) {
                    if (err) adapter.log.error(err);
                    if (stderr) adapter.log.error(stderr);
                    if (stdout) adapter.log.debug(stdout);
                    adapter.setState('url', state.val, true);
                });
            }, 0);
        } else if (state.val && id === adapter.namespace + '.width') {
            settings.width = parseInt(state.val, 10) || 800;
            adapter.setState('width', settings.width, true);

            settings['clip-width'] = settings.width;
            adapter.setState('clipWidth', settings['clip-width'], true);
        } else if (state.val && id === adapter.namespace + '.height') {
            settings.height = parseInt(state.val, 10) || 600;
            adapter.setState('height', settings.height, true);

            settings['clip-height'] = settings.width;
            adapter.setState('clipHeight', settings['clip-height'], true);
        } else if (state.val !== undefined && id === adapter.namespace + '.renderTime') {
            settings.timeout = parseInt(state.val, 10) || 2000;
            adapter.setState('renderTime', settings.timeout, true);
        } else if (state.val !== undefined && id === adapter.namespace + '.online') {
            settings.online = state.val === 1 || state.val === '1' || state.val === 'true' || state.val === true;
            adapter.setState('online', settings.online, true);
        } else if (state.val && id === adapter.namespace + '.clipTop') {
            settings['clip-top'] = parseInt(state.val, 10) || 0;
            adapter.setState('clipTop', settings['clip-top'], true);
        } else if (state.val && id === adapter.namespace + '.clipLeft') {
            settings['clip-left'] = parseInt(state.val, 10) || 0;
            adapter.setState('clipLeft', settings['clip-left'], true);
        } else if (state.val && id === adapter.namespace + '.clipWidth') {
            settings['clip-width'] = parseInt(state.val, 10) || 800;
            adapter.setState('clipWidth', settings['clip-width'], true);
        } else if (state.val && id === adapter.namespace + '.clipHeight') {
            settings['clip-height'] = parseInt(state.val, 10) || 600;
            adapter.setState('clipHeight', settings['clip-height'], true);
        } else if (state.val && id === adapter.namespace + '.scrollTop') {
            settings['scroll-top'] = parseInt(state.val, 10) || 0;
            adapter.setState('scrollTop', settings['scroll-top'], true);
        } else if (state.val && id === adapter.namespace + '.scrollLeft') {
            settings['scroll-left'] = parseInt(state.val, 10) || 0;
            adapter.setState('scrollLeft', settings['scroll-left'], true);
        }
    }
});

adapter.on('ready', main);

adapter.on('message', function (msg) {
    processMessage(msg);
});

process.on('uncaughtException', function(err) {
    adapter.log.warn('Exception: ' + err);
});

function processMessage(msg) {
    if (msg.command === 'send') {
        setTimeout(function () {
            render(msg.message, function (err, stdout, stderr) {
                if (err)    adapter.log.error(JSON.stringify(err));
                if (stderr) adapter.log.debug(stderr);
                if (stdout) adapter.log.debug(stdout);

                if (msg.callback) {
                    msg.message.error  = err;
                    msg.message.stdout = stdout;
                    msg.message.stderr = stderr;
                    adapter.sendTo(msg.from, msg.command, msg.message, msg.callback);
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
    // var options = {
    //     url:        state.val,
    //     output:     fileName,
    //     width:      width,
    //     height:     height,
    //     timeout:    renderTime,
    //     online:     online
    // };

    adapter.setState('working', true, true);

    options.output = getFileName(options.output || fileName);

    // compatibility
    if (options.renderTime && !options.timeout) {
        options.timeout = options.renderTime;
        delete options.renderTime;
    }

    adapter.log.info('Create ' + options.width + 'px*' + options.height + 'px in ' + options.timeout + 'ms - "' + options.url + '" => "' + options.output + '"');

    // generate command
    var cmd = [__dirname + '/lib/rasterize.js'];
    for (var attr in options) {
        if (options.hasOwnProperty(attr) && attr !== 'online') {
            if (attr === 'output') {
                cmd.push('--' + attr);
                cmd.push('"' + options[attr].replace(/\\/g, '/') + '"');
            } else {
                cmd.push('--' + attr);
                cmd.push(options[attr]);
            }
        }
    }

    adapter.log.debug(cmd.join(' '));

    var interval = (parseInt(options.timeout, 10) || 2000) + 5000;

    var timeout = setTimeout(function () {
        timeout = null;
        if (pid) {
            pid.kill();
        }
        adapter.setState('working', false, true);
        adapter.log.error('PhantomJS process does not returned after ' + interval + 'ms');
        if (callback) {
            callback('timeout');
            callback = null;
        }
    }, interval);

    var pid = cp.execFile(phantomjs.path, cmd, function (err, stdout, stderr) {
        if (timeout) {
            clearTimeout(timeout);
            timeout = null;

            adapter.setState('working', false, true);
            adapter.log.debug('and save to "' + options.output + '"');
            // adapter.log.debug(stdout);
            // if (stderr) adapter.log.error(stderr);

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
                                    desc:   'Can be accessed from web server under http://ip:port/state/' + adapter.namespace + '.pictures.' + fileName
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
                        if (callback) {
                            callback(err, stdout, stderr);
                            callback = null;
                        }
                    });
                } catch (err) {
                    adapter.log.error('Cannot read file "' + options.output + '": ' + err);
                    if (callback) {
                        callback(err, stdout, stderr);
                        callback = null;
                    }
                }
            } else {
                if (callback) {
                    callback(err, stdout, stderr);
                    callback = null;
                }
            }
        } else {
            adapter.log.error('PhantomJS process required too many time!');
            if (callback) {
                callback('timeout');
                callback = null;
            }
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
        settings.output = getFileName(state ? state.val : '');
        if (!state || state.val !== settings.output || !state.ack) {
            adapter.setState('filename', settings.output, true);
        }
    });

    adapter.getState('width', function (err, state) {
        if (err) adapter.log.error(err);
        settings.width = parseInt(state ? state.val : 0, 10) || 800;
        settings['clip-width'] = settings.width;
        if (!state || state.val !== settings.width || !state.ack) {
            adapter.setState('width', settings.width, true);
        }
        adapter.setState('clipWidth', settings['clip-width'], true);
    });

    adapter.getState('height', function (err, state) {
        if (err) adapter.log.error(err);
        settings.height = parseInt(state ? state.val : 0, 10) || 600;
        settings['clip-height'] = settings.height;
        if (!state || state.val !== settings.height || !state.ack) {
            adapter.setState('height', settings.height, true);
        }
        adapter.setState('clipHeight', settings['clip-height'], true);
    });

    adapter.getState('renderTime', function (err, state) {
        if (err) adapter.log.error(err);
        settings.timeout = parseInt(state ? state.val : 0, 10) || 2000;
        if (!state || state.val !== settings.timeout || !state.ack) {
            adapter.setState('renderTime', settings.timeout, true);
        }
    });

    adapter.getState('online', function (err, state) {
        if (err) adapter.log.error(err);
        settings.online = !!(state && (state.val === 1 || state.val === '1' || state.val === 'true' || state.val === true));
        if (!state || state.val !== settings.online || !state.ack) {
            adapter.setState('online', settings.online, true);
        }
    });

    adapter.getState('clipTop', function (err, state) {
        if (err) adapter.log.error(err);
        settings['clip-top'] = parseInt(state ? state.val : 0, 10) || 0;
        if (!state || state.val !== settings['clip-top'] || !state.ack) {
            adapter.setState('clipTop', settings['clip-top'], true);
        }
    });

    adapter.getState('clipLeft', function (err, state) {
        if (err) adapter.log.error(err);
        settings['clip-left'] = parseInt(state ? state.val : 0, 10) || 0;
        if (!state || state.val !== settings['clip-left'] || !state.ack) {
            adapter.setState('clipLeft', settings['clip-left'], true);
        }
    });

    adapter.getState('scrollTop', function (err, state) {
        if (err) adapter.log.error(err);
        settings['scroll-top'] = parseInt(state ? state.val : 0, 10) || 0;
        if (!state || state.val !== settings['scroll-top'] || !state.ack) {
            adapter.setState('scrollTop', settings['scroll-top'], true);
        }
    });
    adapter.getState('scrollLeft', function (err, state) {
        if (err) adapter.log.error(err);
        settings['scroll-left'] = parseInt(state ? state.val : 0, 10) || 0;
        if (!state || state.val !== settings['scroll-left'] || !state.ack) {
            adapter.setState('scrollLeft', settings['scroll-left'], true);
        }
    });
    adapter.subscribeStates('*');
}
