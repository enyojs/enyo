// TODO: Someday add tests that test with default context and emit with a specified object to emit to
describe('enyo.EventEmitter', function () {
	var EventEmitter = enyo.EventEmitter;

	describe('methods', function () {
		
		var emitter;

		beforeEach(function() {
			emitter = new enyo.Object({mixins: [EventEmitter]});
		});
		
		describe('silence', function () {
			it ('should start unsilenced', function () {
				expect(emitter.isSilenced()).to.equal(false);
			});

			it ('should set silenced flag', function () {
				emitter.silence();
				expect(emitter.isSilenced()).to.equal(true);
			});

			it ('should return this', function () {
				expect(emitter.silence()).to.equal(emitter);
			});

			it ('should stack', function () {
				emitter.silence();
				emitter.silence();
				emitter.unsilence();
				expect(emitter.isSilenced()).to.equal(true);
				emitter.unsilence();
				expect(emitter.isSilenced()).to.equal(false);
			});
		});

		describe('unsilence', function () {
			it ('should return this', function () {
				expect(emitter.unsilence()).to.equal(emitter);
			});

			it ('should clear all with truthy parameter', function () {
				emitter.silence();
				emitter.silence();
				emitter.unsilence(true);
				expect(emitter.isSilenced()).to.equal(false);
			});

			it ('should work with multiple unsilence calls', function () {
				emitter.unsilence();
				emitter.unsilence();
				emitter.unsilence();
				expect(emitter.isSilenced()).to.equal(false);
				emitter.silence();
				expect(emitter.isSilenced()).to.equal(true);
				emitter.unsilence();
				expect(emitter.isSilenced()).to.equal(false);
			});
		});

		describe('addListener/on', function () {
			var mock, listener = { method1: function () {}, method2: function () {} };

			beforeEach(function () {
				mock = sinon.mock(listener);
			});

			it ('should return this', function () {
				expect(emitter.on('*', mock.method1, mock)).to.equal(emitter);
			});

			it ('should add listeners', function () {
				emitter.on('*', mock.method1, mock);
				expect(emitter.listeners().length).to.equal(1);
				emitter.on('*', mock.method2, mock);
				expect(emitter.listeners().length).to.equal(2);
			});
		});

		describe('removeListener/off', function () {
			var mock, listener = { method1: function () {}, method2: function () {} };

			beforeEach(function () {
				mock = sinon.mock(listener);
			});

			it ('should return this', function () {
				expect(emitter.off('*', mock.method1, mock)).to.equal(emitter);
			});

			it ('should remove existing listeners', function () {
				emitter.on('*', mock.method1, mock);
				emitter.on('*', mock.method2, mock);
				emitter.off('*', mock.method2, mock);
				expect(emitter.listeners().length).to.equal(1);
				expect(emitter.listeners()[0].fn).to.equal(mock['method1']);
				emitter.off('*', mock.method1, mock);
				expect(emitter.listeners().length).to.equal(0);
			});

			it ('shouldn\'t remove non-matching listeners', function () {
				emitter.on('*', mock.method1, mock);
				emitter.on('*', mock.method2, mock);
				emitter.off('frank', mock.method2, mock);
				expect(emitter.listeners().length).to.equal(2);
				emitter.off('*', 'method3', mock);
				expect(emitter.listeners().length).to.equal(2);
				emitter.off('*', mock.method2, emitter);
				expect(emitter.listeners().length).to.equal(2);
			});
		});

		describe('removeAllListeners', function () {
			var mock, listener = { method1: function () {}, method2: function () {} };

			beforeEach(function () {
				mock = sinon.mock(listener);
			});

			it ('should return this', function () {
				expect(emitter.removeAllListeners()).to.equal(emitter);
			});

			it ('should remove all existing listeners with no params', function () {
				emitter.on('*', mock.method1, mock);
				emitter.on('*', mock.method2, mock);
				emitter.removeAllListeners();
				expect(emitter.listeners().length).to.equal(0);
			});

			it ('shouldn\'t remove non-matching listeners', function () {
				emitter.on('a', mock.method1, mock);
				emitter.on('b', mock.method2, mock);
				emitter.removeAllListeners('*');
				expect(emitter.listeners().length).to.equal(2);
				emitter.removeAllListeners('a');
				expect(emitter.listeners().length).to.equal(1);
				emitter.removeAllListeners('b');
				expect(emitter.listeners().length).to.equal(0);
			});
		});

		describe('emit/triggerEvent', function () {
			var mock, listener = { method1: function () {}, method2: function () {} };

			beforeEach(function () {
				mock = sinon.mock(listener);
			});

			afterEach(function () {
				mock.restore();
			});

			it ('should return false with no listeners', function () {
				expect(emitter.emit()).to.equal(false);
			});

			it ('should send all events to *', function () {
				mock.expects('method1').twice();
				mock.expects('method2').once();
				emitter.on('*', listener.method1, listener);
				emitter.on('cole', listener.method2, listener);
				emitter.emit('aaron');
				emitter.emit('cole');
				mock.verify();
			});

			it ('should not send any events when silenced', function () {
				emitter.silence();
				mock.expects('method1').never();
				mock.expects('method2').never();
				emitter.on('*', listener.method1, listener);
				emitter.on('cole', listener.method2, listener);
				emitter.emit('aaron');
				emitter.emit('cole');
				mock.verify();
			});

			it ('should send event name', function () {
				mock.expects('method1').once().withArgs(emitter, 'data');
				emitter.on('*', listener.method1, listener);
				emitter.emit('data');
				mock.verify();
			});

			it ('should send passed-in data', function () {
				mock.expects('method1').once().withArgs(emitter, 'data', {a: 1});
				emitter.on('*', listener.method1, listener);
				emitter.emit('data', {a: 1});
				mock.verify();
			});
		});
	});
});

