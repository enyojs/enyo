var
	Ajax = require('enyo/Ajax');

describe('Ajax', function () {

	describe('usage', function () {

		describe('200 OK', function () {
			it('should finish normally', function (done) {
				new Ajax({url: 'index.html', handleAs: 'text'})
						.response(this, function(inSender, inValue){
							done();
						})
						.error(this, function(inSender, inValue) {
							done(new Error('bad status: ' + inValue));
						})
						.go();
			});
		});

		describe('404 Not Found', function () {
			it('should finish normally', function (done) {
				new Ajax({url: 'noexist.not'})
						.response(this, function(inSender, inValue){
							done(new Error('ajax failed to fail'));
						})
						.error(this, function(inSender, inValue) {
							done();
						})
						.go();
			});
		});

		describe('AJAX Custom Error', function () {
			it('should finish normally', function (done) {
				new Ajax({url: 'appinfo.json'})
						.response(function(inSender, inValue){
							inSender.fail('cuz I said so');
						})
						.error(this, function(inSender, inValue) {
							done();
						})
						.go();
			});

		});

		describe('AJAX Serial', function () {
			it('should finish normally', function (done) {
				// if the test finishes before ready, it's a failure
				var ready = false;
				//
				// when 'index' request completes, we are 'ready'
				var index = new Ajax({url: 'index.html', handleAs: 'text'});
				index.response(function() {
					ready = true;
				});
				//
				// request triggers 'index' request when it completes
				new Ajax({url: 'index.html', handleAs: 'text'})
						.response(index)
						.response(this, function() {
							// finish clean if 'ready'
							expect(ready).to.be.true;
							done();
						})
						.go();
			});
		});

	});
});
