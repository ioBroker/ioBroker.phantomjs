var expect = require('chai').expect;
var setup  = require(__dirname + '/lib/setup');
var fs     = require('fs');
var objects     = null;
var states      = null;
var connected   = false;

function checkConnection(value, done, counter) {
    counter = counter || 0;
    if (counter > 20) {
        done && done('Cannot check ' + value);
        return;
    }

    states.getState('phantomjs.0.info.connection', function (err, state) {
        if (err) console.error(err);
        if (state && typeof state.val === 'string' && ((value && state.val.indexOf(',') !== -1) || (!value && state.val.indexOf(',') === -1))) {
            connected = value;
            done();
        } else {
            setTimeout(function () {
                checkConnection(value, done, counter + 1);
            }, 1000);
        }
    });
}

describe('phantomjs: Test UDP server', function() {
    before('phantomjs: Start js-controller', function (_done) {
        this.timeout(600000); // because of first install from npm

        setup.setupController(async function () {
            var config = await setup.getAdapterConfig();
            // enable adapter
            config.common.enabled   = true;
            config.common.loglevel  = 'debug';

            await setup.setAdapterConfig(config.common, config.native);

            setup.startController(function (_objects, _states) {
                objects = _objects;
                states  = _states;
                _done();
            });
        });
    });

    it('phantomjs: wait', function (done) {
        this.timeout(5000);
        setTimeout(function () {
            done();
        }, 3000);
    });

    it('phantomjs: create picture of google.com', function (done) {
        this.timeout(30000);
        states.setState('phantomjs.0.filename', {val: 'image.png', ack: false}, function (err) {
            expect(err).to.be.not.ok;
            states.setState('phantomjs.0.width', {val: 400, ack: false}, function (err) {
                expect(err).to.be.not.ok;
                states.setState('phantomjs.0.height', {val: 200, ack: false}, function (err) {
                    expect(err).to.be.not.ok;
                    states.setState('phantomjs.0.online', {val: true, ack: false}, function (err) {
                        expect(err).to.be.not.ok;
                        states.setState('phantomjs.0.renderTime', {val: 1000, ack: false}, function (err) {
                            expect(err).to.be.not.ok;
                            states.setState('phantomjs.0.url', {val: 'http://google.com', ack: false}, function (err) {
                                expect(err).to.be.not.ok;
                                setTimeout(function () {
                                    states.getState('phantomjs.0.filename', function (err, fileName) {
                                        expect(err).to.be.not.ok;
                                        expect(fileName).to.be.ok;
                                        expect(fileName.ack).to.be.true;

                                        states.getState('phantomjs.0.url', function (err, state) {
                                            expect(err).to.be.not.ok;
                                            expect(state).to.be.ok;
                                            expect(state.ack).to.be.true;
                                            expect(fs.existsSync(fileName.val)).to.be.true;

                                            states.getBinaryState('phantomjs.0.pictures.image_png', function (err, state) {
                                                expect(err).to.be.not.ok;
                                                expect(state).to.be.ok;
                                                done();
                                            });
                                        });
                                    });
                                }, 10000);
                            });
                        });
                    });
                });
            });
        });
    });

    after('phantomjs: Stop js-controller', function (done) {
        this.timeout(5000);
        setup.stopController(function () {
            done();
        });
    });
});
