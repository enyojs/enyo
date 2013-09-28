enyo.kind({
	name: "ComponentDispatchTest",
	kind: enyo.TestSuite,
	noDefer: true,
	testDispatchEvent2NullArgs: function() {
		var test = this;
		var c = new enyo.Component({
			handlers: {
				onOk: "ok"
			},
			ok: function(inSender, inEvent) {
				test.finish((inSender != c && "bad inSender") || (arguments.length !== 2 && "bad arguments"));
			}
		});
		c.dispatchEvent("onOk");
	},
	testDispatchEvent2OneArg: function() {
		var test = this;
		var c = new enyo.Component({
			handlers: {
				onOk: "ok"
			},
			ok: function(inSender, inEvent) {
				test.finish((inSender != c && "bad inSender") || (inEvent.value !== 42 && "bad inEvent.value"));
			}
		});
		c.dispatchEvent("onOk", {value: 42});
	},
	testDispatchEvent2Owner: function() {
		var test = this;
		var c = new enyo.Component({
			components: [{
				name: "child",
				onOk: "ok"
			}],
			ok: function(inSender, inEvent) {
				test.finish((inSender != this.$.child && "bad inSender") || (inEvent.value !== 42 && "bad inEvent.value"));
			}
		});
		c.$.child.dispatchEvent("onOk", {value: 42});
	},
	testBubble: function() {
		var test = this;
		var c = new enyo.Component({
			components: [{
				name: "child"
			}],
			handlers: {
				onOk: "ok"
			},
			ok: function(inSender, inEvent) {
				test.finish((inSender != c.$.child && "bad inSender") || (inEvent.value !== 42 && "bad inEvent.value"));
			}
		});
		c.$.child.bubble("onOk", {value: 42});
	},
	testDoubleBubble: function() {
		var test = this;
		var owner = new enyo.Component({
			handlers: {
				onOk: "ok"
			},
			ok: function(inSender, inEvent) {
				test.finish((inSender != child && "bad inSender") || (inEvent.value !== 42 && "bad inEvent.value"));
			}
		});
		var child = new enyo.Component({
			owner: owner
		});
		var grandchild = new enyo.Component({
			owner: child
		});
		grandchild.bubble("onOk", {value: 42});
	},
	testDelegateDispatch: function() {
		var calledFoo = false;
		var calledOnFoo = false;
		var calledCustomEvent = false;

		// we have to use enyo.Controls instead of enyo.Component to get the dispatch
		// through the levels of the components tree
		var k = new enyo.Control({
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
				// we expect this due to handler specificed on control1
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

		if (calledOnFoo && calledCustomEvent && !calledFoo) {
			this.finish();
		} else {
			this.finish("wrong handlers called");
		}
		k.destroy();
	},
	testDoubleDelegateDispatch: function() {
		var finish = this.bindSafely("finish");
		var K = enyo.kind({
			kind: "enyo.Component",
			events: {
				onForwardedEvent: ""
			},
			components: [{
				kind: "enyo.Component",
				components: [
					{kind: "enyo.Component", name: "innerComponent", onInnerEvent: "handleInnerEvent"}
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
		var K2 = enyo.kind({
			components: [{
				kind: K,
				name: "child",
				onForwardedEvent: "handleForwardedEvent"
			}],
			handleForwardedEvent: function(inSender, inEvent) {
				if (inSender === this.$.child) {
					finish();
				} else {
					finish("bad sender");
				}
			}
		});
		var k2 = new K2();
		k2.$.child.fireInnerEvent();
		k2.destroy();
	}
});