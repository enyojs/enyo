enyo.kind({
	name: "MultipleDispatchTest",
	kind: enyo.TestSuite,
	noDefer: true,
	testDefaultDispatch: function () {
		var s = this, c, mm;
		enyo.kind({
			name: "test.Component",
			handlers: {
				onTest1: "accept"
			},
			accept: function () {
				s.finish();
			}
		})
		enyo.kind({
			name: "test.DispatchComponent",
			kind: "enyo.MultipleDispatchComponent",
			events: {
				onTest1: ""
			}
		});
		c = new test.Component();
		debugger
		mm = new test.DispatchComponent({owner: c});
		if (!mm._dispatchDefaultPath) {
			this.finish("did not detect default dispatch path");
		}
		mm.doTest1();
	}
});
