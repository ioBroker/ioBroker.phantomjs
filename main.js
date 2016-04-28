/* jshint -W097 */// jshint strict:false
/*jslint node: true */
"use strict";

var utils     = require(__dirname + '/lib/utils'); // Get common adapter utils
var path      = require('path');
var cp        = require('child_process');
var phantomjs = require('phantomjs');

var fileName;
var width;
var height;

var adapter = utils.adapter('phantomjs');

adapter.on('stateChange', function (id, state) {
    if (state && !state.ack) {
        if (id === adapter.namespace + '.filename') {
            fileName = getFileName(state.val);
            adapter.setState('filename', fileName, true);
        } else if (state.val && id === adapter.namespace + '.url') {
            setTimeout(function () {
                render({
                    url:    state.val,
                    output: fileName,
                    width:  width,
                    height: height
                }, function (err, stdout, stderr) {
                    if (err) adapter.log.error(err);
                    adapter.setState('url', state.val, true);
                });
            }, 0);
        } else if (state.val && id === adapter.namespace + '.width') {
            width = parseInt(state.val, 10) || 800;
            adapter.setState('width', width, true);
        } else if (state.val && id === adapter.namespace + '.height') {
            height = parseInt(state.val, 10) || 600;
            adapter.setState('height', height, true);
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
            width:       msg.message.width  ? parseInt(msg.message.width,  10) || 800 : width,
            height:      msg.message.height ? parseInt(msg.message.height, 10) || 600 : height
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
    adapter.log.info('Create "' + options.url + '"');
    adapter.log.info('and save to "' + options.output + '"');

    cp.execFile(phantomjs.path, [
        __dirname + '/lib/rasterize.js',
        options.url,
        options.output,
        options.width + 'px*' + options.height + 'px'
    ], function(err, stdout, stderr) {
        callback && callback(err, stdout, stderr);
    });
}

function main() {
    adapter.getState('filename', function (err, state) {
        if (err) adapter.log.error(err);
        fileName = getFileName(state ? state.val : '');
        adapter.setState('filename', fileName, true);
    });

    adapter.getState('height', function (err, state) {
        if (err) adapter.log.error(err);
        height = parseInt(state ? state.val : 0, 10) || 600;
        adapter.setState('height', height, true);
    });

    adapter.getState('width', function (err, state) {
        if (err) adapter.log.error(err);
        width = parseInt(state ? state.val : 0, 10) || 800;
        adapter.setState('width', width, true);
        adapter.subscribeStates('*');
    });
}