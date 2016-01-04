var 
	kind = require('enyo/kind'),
	Component = require('enyo/Component'),
	Control = require('enyo/Control');

describe('Component dispatch', function () {

	describe('usage', function () {

		describe('Dispatch event with null args', function () {
			var argLen, sender, c;

			before(function () {
				c = new Component({
					handlers: {
						onOk: 'ok'
					},
					ok: function(inSender, inEvent) {
						sender = inSender;
						argLen = arguments.length;
					}
				});

				c.dispatchEvent('onOk');
			});

			after(function () {
				c.destroy();
			});

			it('should have the correct sender', function () {
				expect(sender).to.deep.equal(c);
			});

			it('should have the correct number of arguments', function () {
				expect(argLen).to.equal(2);
			});
		});

		describe('Dispatch event with one arg', function () {
			var value, sender, c;

			before(function () {
				c = new Component({
					handlers: {
						onOk: 'ok'
					},
					ok: function(inSender, inEvent) {
						sender = inSender;
						value = inEvent.value;
					}
				});

				c.dispatchEvent('onOk', {value: 42});
			});

			after(function () {
				c.destroy();
			});

			it('should have the correct sender', function () {
				expect(sender).to.deep.equal(c);
			});

			it('should have the correct argument value', function () {
				expect(value).to.equal(42);
			});
		});

		describe('Dispatch event to owner', function () {
			var value, sender, c;

			before(function () {
				c = new Component({
					components: [
						{name: 'child', onOk: 'ok'}
					],
					ok: function(inSender, inEvent) {
						sender = inSender;
						value = inEvent.value;
					}
				});

				c.$.child.dispatchEvent('onOk', {value: 42});
			});

			after(function () {
				c.destroy();
			});

			it('should have the correct sender', function () {
				expect(sender).to.deep.equal(c.$.child);
			});

			it('should have the correct argument value', function () {
				expect(value).to.equal(42);
			});
		});

		describe('Bubble event', function () {
			var sender, value, c;

			before(function () {
				c = new Component({
					components: [
						{name: 'child'}
					],
					handlers: {
						onOk: 'ok'
					},
					ok: function(inSender, inEvent) {
						sender = inSender;
						value = inEvent.value;
					}
				});

				c.$.child.bubble('onOk', {value: 42});
			});

			it('should have the correct sender', function () {
				expect(sender).to.deep.equal(c.$.child);
			});

			it('should have the correct argument value', function () {
				expect(value).to.equal(42);
			});
		});

		describe('Double bubble event', function () {
			var owner, child, sender, value;

			before(function () {
				owner = new Component({
					handlers: {
						onOk: 'ok'
					},
					ok: function(inSender, inEvent) {
						sender = inSender;
						value = inEvent.value;
					}
				});
				child = new Component({
					owner: owner
				});
				var grandchild = new Component({
					owner: child
				});
				grandchild.bubble('onOk', {value: 42});
			});

			after(function () {
				owner.destroy();
			});

			it('should have the correct sender', function () {
				expect(sender).to.deep.equal(child);
			});

			it('should have the correct argument value', function () {
				expect(value).to.equal(42);
			});
		});

		describe('Delegate dispatch', function () {
			var calledFoo = false,
				calledOnFoo = false,
				calledCustomEvent = false;

			before(function () {
				// we have to use enyo.Controls instead of enyo.Component to get the dispatch
				// through the levels of the components tree
				var k = new Control({
					components: [
						{onCustomEvent: 'customEvent', onFoo: 'foo', name: 'control1', components: [
							{onCustomEvent: 'onFoo', name: 'control2', components: [
								{name: 'innerComponent'}
							]}
						]}
					],
					fireCustomEvent: function() {
						this.$.innerComponent.bubble('onCustomEvent');
					},
					customEvent: function(inSender) {
						// we expect this due to handler specified on control1
						calledCustomEvent = true;
					},
					onFoo: function(inSender) {
						// we expect this due to handler specified on control2
						calledOnFoo = true;
					},
					foo: function(inSender) {
						// this shouldn't be called
						calledFoo = true;
					}
				});

				k.fireCustomEvent();
				k.destroy();
			});

			it('should call the right handlers', function () {
				expect(calledOnFoo).to.be.true;
				expect(calledCustomEvent).to.be.true;
				expect(calledFoo).to.be.false;
			});
		});

		describe('Double delegate dispatch', function () {
			var k2, sender, child;

			before(function () {
				var K = kind({
					kind: Component,
					events: {
						onForwardedEvent: ''
					},
					components: [{
						kind: Component,
						components: [
							{kind: Component, name: 'innerComponent', onInnerEvent: 'handleInnerEvent'}
						]
					}],
					fireInnerEvent: function() {
						this.$.innerComponent.bubble('onInnerEvent');
					},
					handleInnerEvent: function(inSender, inEvent) {
						this.doForwardedEvent(inEvent);
						return true;
					}
				});

				var K2 = kind({
					components: [{
						kind: K,
						name: 'child',
						onForwardedEvent: 'handleForwardedEvent'
					}],
					handleForwardedEvent: function(inSender, inEvent) {
						child = this.$.child;
						sender = inSender;
					}
				});

				k2 = new K2();
				k2.$.child.fireInnerEvent();
			});

			after(function () {
				k2.destroy();
			});

			it('should have the right sender', function () {
				expect(sender).to.deep.equal(child);
			});
		});
	});
});