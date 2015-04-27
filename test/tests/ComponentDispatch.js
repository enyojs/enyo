var kind = require('../../lib/kind');
var Component = require('../../lib/Component');
var Control = require('../../lib/Control');

describe('Component dispatch', function () {

	describe('usage', function () {

//	testDispatchEvent2NullArgs: function() {
//		var test = this;
//		var c = new enyo.Component({
//			handlers: {
//				onOk: "ok"
//			},
//			ok: function(inSender, inEvent) {
//				test.finish((inSender != c && "bad inSender") || (arguments.length !== 2 && "bad arguments"));
//			}
//		});
//		c.dispatchEvent("onOk");
//	},

		describe('Dispatch event with null args', function () {

			var argLen;
			var c = new Component({
				handlers: {
					onOk: "ok"
				},
				ok: function(inSender, inEvent) {

					it('should have the correct sender', function () {

						expect(inSender).to.deep.equal(c);

					});

					argLen = arguments.length;

					it('should have the correct number of arguments', function () {

						expect(argLen).to.equal(2);

					});

				}
			});

			c.dispatchEvent("onOk");

			before(function () {
			});

			after(function () {
			});

		});

//	testDispatchEvent2OneArg: function() {
//		var test = this;
//		var c = new enyo.Component({
//			handlers: {
//				onOk: "ok"
//			},
//			ok: function(inSender, inEvent) {
//				test.finish((inSender != c && "bad inSender") || (inEvent.value !== 42 && "bad inEvent.value"));
//			}
//		});
//		c.dispatchEvent("onOk", {value: 42});
//	},

		describe('Dispatch event with one arg', function () {

			var c = new Component({
				handlers: {
					onOk: "ok"
				},
				ok: function(inSender, inEvent) {

					it('should have the correct sender', function () {

						expect(inSender).to.deep.equal(c);

					});

					it('should have the correct argument value', function () {

						expect(inEvent.value).to.equal(42);

					});

				}
			});

			c.dispatchEvent("onOk", {value: 42});

			before(function () {
			});

			after(function () {
			});

		});

//	testDispatchEvent2Owner: function() {
//		var test = this;
//		var c = new enyo.Component({
//			components: [{
//				name: "child",
//				onOk: "ok"
//			}],
//			ok: function(inSender, inEvent) {
//				test.finish((inSender != this.$.child && "bad inSender") || (inEvent.value !== 42 && "bad inEvent.value"));
//			}
//		});
//		c.$.child.dispatchEvent("onOk", {value: 42});
//	},

		describe('Dispatch event to owner', function () {

			var c = new Component({
				components: [{
					name: "child",
					onOk: "ok"
				}],
				ok: function(inSender, inEvent) {

					it('should have the correct sender', function () {

						expect(inSender).to.deep.equal(c.$.child);

					});

					it('should have the correct argument value', function () {

						expect(inEvent.value).to.equal(42);

					});

				}
			});

			c.$.child.dispatchEvent("onOk", {value: 42});

			before(function () {
			});

			after(function () {
			});

		});

//	testBubble: function() {
//		var test = this;
//		var c = new enyo.Component({
//			components: [{
//				name: "child"
//			}],
//			handlers: {
//				onOk: "ok"
//			},
//			ok: function(inSender, inEvent) {
//				test.finish((inSender != c.$.child && "bad inSender") || (inEvent.value !== 42 && "bad inEvent.value"));
//			}
//		});
//		c.$.child.bubble("onOk", {value: 42});
//	},

		describe('Bubble event', function () {

			var c = new Component({
				components: [{
					name: "child"
				}],
				handlers: {
					onOk: "ok"
				},
				ok: function(inSender, inEvent) {

					it('should have the correct sender', function () {

						expect(inSender).to.deep.equal(c.$.child);

					});

					it('should have the correct argument value', function () {

						expect(inEvent.value).to.equal(42);

					});

				}
			});

			c.$.child.bubble("onOk", {value: 42});

			before(function () {
			});

			after(function () {
			});

		});

//	testDoubleBubble: function() {
//		var test = this;
//		var owner = new enyo.Component({
//			handlers: {
//				onOk: "ok"
//			},
//			ok: function(inSender, inEvent) {
//				test.finish((inSender != child && "bad inSender") || (inEvent.value !== 42 && "bad inEvent.value"));
//			}
//		});
//		var child = new enyo.Component({
//			owner: owner
//		});
//		var grandchild = new enyo.Component({
//			owner: child
//		});
//		grandchild.bubble("onOk", {value: 42});
//	},

		describe('Double bubble event', function () {

			var owner = new Component({
				handlers: {
					onOk: "ok"
				},
				ok: function(inSender, inEvent) {

					it('should have the correct sender', function () {

						expect(inSender).to.deep.equal(child);

					});

					it('should have the correct argument value', function () {

						expect(inEvent.value).to.equal(42);

					});

				}
			});
			var child = new Component({
				owner: owner
			});
			var grandchild = new Component({
				owner: child
			});

			grandchild.bubble("onOk", {value: 42});

			before(function () {
			});

			after(function () {
			});

		});

//	testDelegateDispatch: function() {
//		var calledFoo = false;
//		var calledOnFoo = false;
//		var calledCustomEvent = false;
//
//		// we have to use enyo.Controls instead of enyo.Component to get the dispatch
//		// through the levels of the components tree
//		var k = new enyo.Control({
//			components: [
//				{onCustomEvent: "customEvent", onFoo: "foo", name: "control1", components: [
//					{onCustomEvent: "onFoo", name: "control2", components: [
//						{name: "innerComponent"}
//					]}
//				]}
//			],
//			fireCustomEvent: function() {
//				this.$.innerComponent.bubble("onCustomEvent");
//			},
//			customEvent: function(inSender) {
//				// we expect this due to handler specified on control1
//				calledCustomEvent = true;
//			},
//			onFoo: function(inSender) {
//				// we expect this due to handler specified on control2
//				calledOnFoo = true;
//			},
//			foo: function(inSender) {
//				// this shouldn't be called
//				calledFoo = true;
//			}
//		});
//		k.fireCustomEvent();
//
//		if (calledOnFoo && calledCustomEvent && !calledFoo) {
//			this.finish();
//		} else {
//			this.finish("wrong handlers called");
//		}
//		k.destroy();
//	},

		describe('Delegate dispatch', function () {

			var calledFoo = false;
			var calledOnFoo = false;
			var calledCustomEvent = false;

			// we have to use enyo.Controls instead of enyo.Component to get the dispatch
			// through the levels of the components tree
			var k = new Control({
				components: [
					{onCustomEvent: "customEvent", onFoo: "foo", name: "control1", components: [
						{onCustomEvent: "onFoo", name: "control2", components: [
							{name: "innerComponent"}
						]}
					]}
				],
				fireCustomEvent: function() {
					this.$.innerComponent.bubble("onCustomEvent");
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

			before(function () {
			});

			after(function () {
			});

			it('should call the right handlers', function () {

				expect(calledOnFoo).to.be.true;
				expect(calledCustomEvent).to.be.true;
				expect(calledFoo).to.be.false;

			});

		});

//	testDoubleDelegateDispatch: function() {
//		var finish = this.bindSafely("finish");
//		var K = enyo.kind({
//			kind: "enyo.Component",
//			events: {
//				onForwardedEvent: ""
//			},
//			components: [{
//				kind: "enyo.Component",
//				components: [
//					{kind: "enyo.Component", name: "innerComponent", onInnerEvent: "handleInnerEvent"}
//				]
//			}],
//			fireInnerEvent: function() {
//				this.$.innerComponent.bubble("onInnerEvent");
//			},
//			handleInnerEvent: function(inSender, inEvent) {
//				this.doForwardedEvent(inEvent);
//				return true;
//			}
//		});
//		var K2 = enyo.kind({
//			components: [{
//				kind: K,
//				name: "child",
//				onForwardedEvent: "handleForwardedEvent"
//			}],
//			handleForwardedEvent: function(inSender, inEvent) {
//				if (inSender === this.$.child) {
//					finish();
//				} else {
//					finish("bad sender");
//				}
//			}
//		});
//		var k2 = new K2();
//		k2.$.child.fireInnerEvent();
//		k2.destroy();
//	}

		describe('Double delegate dispatch', function () {

			var K = kind({
				kind: Component,
				events: {
					onForwardedEvent: ""
				},
				components: [{
					kind: Component,
					components: [
						{kind: Component, name: "innerComponent", onInnerEvent: "handleInnerEvent"}
					]
				}],
				fireInnerEvent: function() {
					this.$.innerComponent.bubble("onInnerEvent");
				},
				handleInnerEvent: function(inSender, inEvent) {
					this.doForwardedEvent(inEvent);
					return true;
				}
			});

			var K2 = kind({
				components: [{
					kind: K,
					name: "child",
					onForwardedEvent: "handleForwardedEvent"
				}],
				handleForwardedEvent: function(inSender, inEvent) {

					var child = this.$.child;

					it('should have the right sender', function () {

						expect(inSender).to.deep.equal(child);

					});
				}
			});
			var k2 = new K2();

			k2.$.child.fireInnerEvent();
			k2.destroy();

			before(function () {
			});

			after(function () {
			});

		});

	});
});

