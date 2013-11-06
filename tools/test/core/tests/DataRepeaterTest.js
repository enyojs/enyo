enyo.kind({
	name: "DataRepeaterTest",
	kind: enyo.TestSuite,
	noDefer: true,
	testRepeaterSelection: function() {
		this.runSelectionTests("enyo.DataRepeater");
	},
	testListSelection: function() {
		this.runSelectionTests("enyo.DataList");
	},
	testGridSelection: function() {
		this.runSelectionTests("enyo.DataGridList");
	},
	runSelectionTests: function(kind) {
		var div = document.createElement("div");
		document.body.appendChild(div);
		var testControl = new enyo.Control({
			bindings: [
				{ from: ".$.repeater.selected", to: ".boundSelection" },
				{ from: ".$.repeater.selected", to: ".$.selected.content", transform:function(val) { return val ? val.get("text") : ""; } }
			],
			boundSelection: null,
			components: [
				{name:"repeater", kind: kind, components: [
					{bindings: [{from: ".model.text", to: ".content"}]}
				], renderDelay: null},
				{name: "selected"}
			]
		});
		testControl.renderInto(div);
		try {
			// Setup test environment
			var repeater = testControl.$.repeater;
			var selected = testControl.$.selected;
			var s, c = new enyo.Collection();
			for (var $i=0, r$=[]; r$.length<200; ++$i) {
				r$.push({text: "Item " + $i});
			}
			c.add(r$);
			testControl.renderInto(div);
			repeater.set("collection", c);

			// Test selection disabled
			repeater.set("selection", false);
			repeater.select(15);
			if (repeater.get("selected") != null) {
				throw "Selection not properly disabled.";
			}

			// Select one
			repeater.set("selection", true);
			repeater.select(15);
			if (repeater.get("selected").get("text") != "Item 15") {
				throw "Single selection: Did not select correct item; selection.";
			}
			if (testControl.boundSelection.get("text") != "Item 15") {
				throw "Single selection (binding): Did not select correct item; selection.";
			}
			if (selected.content != "Item 15") {
				throw "Single selection (bound control): Did not select correct item; selection.";
			}

			// Select another
			repeater.select(199);
			if (repeater.get("selected").get("text") != "Item 199") {
				throw "Single selection (change): Did not select correct item; selection.";
			}
			if (testControl.boundSelection.get("text") != "Item 199") {
				throw "Single selection (binding): Did not select correct item; selection.";
			}
			if (selected.content != "Item 199") {
				throw "Single selection (bound control): Did not select correct item; selection.";
			}

			// Deselect
			repeater.deselect(199);
			if (repeater.get("selected") != null) {
				throw "Single selection: Did not deselect correctly.";
			}
			if (testControl.boundSelection != null) {
				throw "Single selection (binding): Did not deselect correctly.";
			}

			// Select, then deselect all
			repeater.select(199);
			if (repeater.get("selected").get("text") != "Item 199") {
				throw "Single selection: Did not select correct item; selection.";
			}
			repeater.deselectAll();
			if (repeater.get("selected") != null) {
				throw "Single selection: Did not deselect all correctly.";
			}
			if (testControl.boundSelection != null) {
				throw "Single selection (binding): Did not deselect all correctly.";
			}
			if (selected.content !== "") {
				throw "Single selection (bound control): Did not deselect all correctly.";
			}

			// Multi-select single
			repeater.set("multipleSelection", true);
			// destroy a binding that will not propagate the array
			testControl.bindings[1].destroy();
			repeater.select(25);
			s = repeater.get("selected");
			if (s.length != 1) {
				throw "Multiple-selection (single): Selection length wrong." + JSON.stringify(s);
			}
			if (s[0].get("text") != "Item 25") {
				throw "Multiple-selection (single): Did not select correct item; selection.";
			}
			if (testControl.boundSelection.length != 1) {
				throw "Multiple-selection (single, binding): Selection length wrong." + JSON.stringify(s);
			}
			if (testControl.boundSelection[0].get("text") != "Item 25") {
				throw "Multiple-selection (single, binding): Did not select correct item; selection.";
			}

			// Multi-select multiple
			repeater.deselectAll();
			repeater.set("multipleSelection", true);
			repeater.select(25);
			repeater.select(35);
			repeater.select(125);
			repeater.select(135);
			s = repeater.get("selected");
			if (s.length != 4) {
				throw "Multiple-selection (multiple): Selection length wrong." + JSON.stringify(s);
			}
			if ((s[0].get("text") != "Item 25") ||
				(s[1].get("text") != "Item 35") ||
				(s[2].get("text") != "Item 125") ||
				(s[3].get("text") != "Item 135")) {
				throw "Multiple-selection (multiple): Did not select correct items; selection.";
			}
			if (testControl.boundSelection.length != 4) {
				throw "Multiple-selection (multiple): Selection length wrong." + JSON.stringify(s);
			}
			if ((testControl.boundSelection[0].get("text") != "Item 25") ||
				(testControl.boundSelection[1].get("text") != "Item 35") ||
				(testControl.boundSelection[2].get("text") != "Item 125") ||
				(testControl.boundSelection[3].get("text") != "Item 135")) {
				throw "Multiple-selection (multiple, binding): Did not select correct items; selection.";
			}

			// Deselect all
			repeater.deselectAll();
			if (repeater.get("selected").length !== 0) {
				throw "Multiple selection: Did not deselect all correctly.";
			}

			// Select all
			repeater.selectAll();
			if (repeater.get("selected").length !== 200) {
				throw "Multiple selection: Did not select all correctly.";
			}
			if ((s[0].get("text") != "Item 0") ||
				(s[50].get("text") != "Item 50") ||
				(s[150].get("text") != "Item 150") ||
				(s[199].get("text") != "Item 199")) {
				throw "Multiple-selection (multiple): Did not select correct items; selection.";
			}
			if (testControl.boundSelection.length !== 200) {
				throw "Multiple selection: Did not select all correctly.";
			}
			if ((testControl.boundSelection[0].get("text") != "Item 0") ||
				(testControl.boundSelection[50].get("text") != "Item 50") ||
				(testControl.boundSelection[150].get("text") != "Item 150") ||
				(testControl.boundSelection[199].get("text") != "Item 199")) {
				throw "Multiple-selection (multiple): Did not select correct items; selection.";
			}

			// isSelected
			repeater.deselectAll();
			if (repeater.isSelected(repeater.collection.at(102))) {
				throw "isSelected for non-selected item returned true";
			}
			repeater.select(102);
			if (!repeater.isSelected(repeater.collection.at(102))) {
				throw "isSelected for selected item returned false";
			}

			this.finish();
		} finally {
			testControl.destroy();
			document.body.removeChild(div);
		}
	},
	testAddRemoveAddDataList: function () {
		var d = [{index: 0}, {index: 1}, {index: 2}],
			c = new enyo.Collection(d),
			r = new enyo.DataList({collection: c, renderDelay: null, style: "height: 300px !important;"}),
			// the reason we are looking at the node is because synchronously executing this code
			// means we cannot be sure that the children will have been claimed by active JavaScript
			// objects yet
			f = function (p) { return p.hasNode().children.length; },
			p1, p2, p3;
		r.setParent(enyo.floatingLayer);
		r.render();
		p1 = f(r.$.page1);
		c.removeAll();
		p2 = f(r.$.page1);
		c.add(d);
		p3 = f(r.$.page1);
		r.destroy();
		enyo.floatingLayer.removeNodeFromDom();
		this.finish(
			(p1 !== 3 && "initial page did not have correct number of children, expected '3' got '" + p1 + "'") ||
			(p2 !== 0 && "expected no children but got '" + p2 + "'") ||
			(p3 !== 3 && "re-adding the records to the collection did not produce the correct number of children, got '" + p3 + "'")
		);
	}
});
