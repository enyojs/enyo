enyo.kind({
	name: "ComponentDispatchTest",
	kind: enyo.TestSuite,
	testDispatchEvent2NullArgs: function() {
		var test = this;
		var c = new enyo.Component({
			handlers: {
				onOk: "ok"
			},
			ok: function(inSender) {
				test.finish((inSender != c && "bad inSender") || (arguments.length !== 1 && "bad arguments"));
			}
		});
		c.dispatchEvent2("onOk");
	},
	testDispatchEvent2OneArg: function() {
		var test = this;
		var c = new enyo.Component({
			handlers: {
				onOk: "ok"
			},
			ok: function(inSender, inValue) {
				test.finish((inSender != c && "bad inSender") || (inValue !== 42 && "bad inValue"));
			}
		});
		c.dispatchEvent2("onOk", [42]);
	},
	testDispatchEvent2Owner: function() {
		var test = this;
		var c = new enyo.Component({
			components: [{
				name: "child",
				onOk: "ok"
			}],
			ok: function(inSender, inValue) {
				test.finish((inSender != this.$.child && "bad inSender") || (inValue !== 42 && "bad inValue"));
			}
		});
		c.$.child.dispatchEvent2("onOk", [42]);
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
			ok: function(inSender, inValue) {
				test.finish((inSender != c.$.child && "bad inSender") || (inValue !== 42 && "bad inValue"));
			}
		});
		c.$.child.bubble("onOk", [42]);
	},
	testDoubleBubble: function() {
		var test = this;
		var owner = new enyo.Component({
			handlers: {
				onOk: "ok"
			},
			ok: function(inSender, inValue) {
				test.finish((inSender != child && "bad inSender") || (inValue !== 42 && "bad inValue"));
			}
		});
		var child = new enyo.Component({
			owner: owner
		});
		var grandchild = new enyo.Component({
			owner: child
		});
		grandchild.bubble("onOk", [42]);
	}
});