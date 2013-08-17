enyo.kind({
	name: "MultipleDispatchTest",
	kind: enyo.TestSuite,
	noDefer: true,
	testDefaultDispatch: function () {
		var s = this, c, mm, test = {};
		test.Component = enyo.kind({
			kind: "enyo.Component",
			handlers: {
				onTest1: "accept"
			},
			accept: function () {
				s.finish();
			}
		});
		test.DispatchComponent = enyo.kind({
			kind: "enyo.MultipleDispatchComponent",
			events: {
				onTest1: ""
			}
		});
		c = new test.Component();
		mm = new test.DispatchComponent({owner: c});
		if (!mm._dispatchDefaultPath) {
			return this.finish("did not detect default dispatch path");
		}
		mm.doTest1();
	},
	testAddDispatchTarget: function () {
		var mm, test = {};
		test.DispatchComponent = enyo.kind({
			kind: "enyo.MultipleDispatchComponent",
			events: {
				onTest1: ""
			}
		});
		mm = new test.DispatchComponent();
		if (!mm._dispatchTargets) {
			return this.finish("dispatch targets not initialized properly");
		}
		if (mm._dispatchTargets.length !== 0) {
			return this.finish("dispatch targets weren't zeroed out");
		}
		mm.addDispatchTarget(new enyo.Component());
		if (mm._dispatchTargets.length !== 1) {
			return this.finish("dispatch target not added properly");
		}
		this.finish();
	},
	testRemoveDispatchTarget: function () {
		var mm, test = {}, c;
		test.DispatchComponent = enyo.kind({
			kind: "enyo.MultipleDispatchComponent",
			events: {
				onTest1: ""
			}
		});
		mm = new test.DispatchComponent();
		mm.addDispatchTarget((c = new enyo.Component()));
		if (mm._dispatchTargets.length !== 1) {
			return this.finish("dispatch target not added properly");
		}
		mm.removeDispatchTarget(c);
		if (mm._dispatchTargets.length !== 0) {
			return this.finish("dispatch target not removed properly");
		}
		this.finish();
	},
	testMultipleListenersWithoutOwner: function () {
		var s = this, ex = 4, mm, test = {};
		test.Component = enyo.kind({
			kind: "enyo.Component",
			handlers: {
				onTest1: "accept"
			},
			accept: function () {
				--ex;
				if (ex === 0) {
					s.finish();
				}
			}
		});
		test.DispatchComponent = enyo.kind({
			kind: "enyo.MultipleDispatchComponent",
			events: {
				onTest1: ""
			}
		});
		mm = new test.DispatchComponent();
		for (var i=0; i<4; ++i) {
			mm.addDispatchTarget(new test.Component());
		}
		mm.doTest1();
	},
	testMultipleListenersWithOwner: function () {
		var s = this, c, ex = 5, mm, test = {};
		test.Component = enyo.kind({
			kind: "enyo.Component",
			handlers: {
				onTest1: "accept"
			},
			accept: function () {
				--ex;
				if (ex === 0) {
					s.finish();
				}
			}
		});
		test.DispatchComponent = enyo.kind({
			kind: "enyo.MultipleDispatchComponent",
			events: {
				onTest1: ""
			}
		});
		c = new test.Component({name: "NotAutoCreated"});
		mm = new test.DispatchComponent({owner: c});
		for (var i=0; i<4; ++i) {
			mm.addDispatchTarget(new test.Component());
		}
		mm.doTest1();
	}
});
