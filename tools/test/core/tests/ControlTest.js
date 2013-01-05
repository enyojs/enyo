enyo.kind({
	name: "ControlTest",
	kind: enyo.TestSuite,
	testAddingComponents: function() {
		var K = enyo.kind({
			kind: enyo.Control,
			components: [
				{ name: "a" },
				{ name: "b" },
				{ name: "c" }
			]
		});

		// create new div, attach to start of body, delete at end
		// needed because we need live DOM with getElementById working
		var div = document.createElement("div");
		document.body.appendChild(div);

		var k = new K();
		k.renderInto(div);

		var kn = div.firstChild;
		try {
			// basic tests of rendered nodes
			if (k.hasNode() !== kn) {
				throw("control node doesn't match rendering");
			}
			if (kn.firstChild !== k.$.a.hasNode()) {
				throw("a child not first node");
			}
			if (kn.lastChild !== k.$.c.hasNode()) {
				throw("c child not last node");
			}
			// test deleting c
			k.$.c.destroy();
			if (kn.lastChild !== k.$.b.hasNode()) {
				throw("b child not last node after deletion");
			}
			// add new node to end
			var cc = k.createComponent({});
			cc.render();
			if (kn.lastChild !== cc.hasNode()) {
				throw("added a child to end, not last node");
			}
			// add new node before a (should be at start)
			var aa = k.createComponent({}, {addBefore: k.$.a});
			aa.render();
			if (kn.firstChild !== aa.hasNode()) {
				throw("added a child using node reference, not first node");
			}
			// add another node to start using addBefore: null
			var aaa = k.createComponent({}, {addBefore: null});
			aaa.render();
			if (kn.firstChild !== aaa.hasNode()) {
				throw("added a child not first node");
			}
		} finally {
			// clean up after our test
			k.destroy();
			document.body.removeChild(div);
		}
		this.finish();
	},
	testGetBounds: function() {
		var K = enyo.kind({
			style: "position: absolute; top: 10px; height: 30px; left: 15px; width: 35px;"
		});
		// create new div, attach to start of body, delete at end
		// needed because we need live DOM with getElementById working
		var div = document.createElement("div");
		document.body.appendChild(div);

		var k = new K();
		var b;
		b = k.getBounds();
			if (b.top !== undefined || b.left !== undefined || b.height !== undefined || b.width !== undefined) {
				throw("bad bounds, expected all undefined, got " + JSON.stringify(b));
			}
		k.renderInto(div);
		try {
			b = k.getBounds();
			if (b.top !== 10 || b.left !== 15 || b.height !== 30 || b.width !== 35) {
				throw("bad bounds, expected {top: 10, left: 15, height: 30, width: 35}, got " + JSON.stringify(b));
			}
		} finally {
			// clean up after our test
			k.destroy();
			document.body.removeChild(div);
		}
		this.finish();
	}
});
