(function (enyo) {
	
	enyo.kind({
		name: "enyo.ETestListener",
		kind: "enyo.Component",
		targetEvents: [],
		dispatchBubble: function (event) {
			var events = this.targetEvents;
			events.splice(enyo.indexOf(event, events), 1);
			if (events.length === 0) throw "done";
		}
	});
	
	enyo.kind({
		name: "EnumerableTest",
		kind: "enyo.TestSuite",
		
		testAt: function () {
			var enu = new enyo.Enumerable(["zero","one","two"]);
			this.finish(!(
				enu.at(0) === "zero"
				&& enu.at(1) === "one"
				&& enu.at(2) === "two"
			));
		},
		
		testPush: function () {
			var $ = this;
			var events = ["onItemAdded", "onLengthChanged"];
			var enu = new enyo.Enumerable();
			var com = new enyo.ETestListener({targetEvents: events});
			var clk = setTimeout(function () {
				$.finish("did not receive the correct events");
			}, 1000);
			try {
				enu.addDispatchTarget(com);
				enu.push("zero");
			} catch (e) {
				if ("done" === e && enu.length === 1 && enu.at(0) === "zero") {
					this.finish();
				}
			} finally {
				clearTimeout(clk);
			}
		},
		
		testUnshift: function () {
			var $ = this;
			var events = ["onItemAdded", "onLengthChanged"];
			var enu = new enyo.Enumerable(["one"]);
			var com = new enyo.ETestListener({targetEvents: events});
			var clk = setTimeout(function () {
				$.finish("did not receive the correct events");
			}, 1000);
			try {
				enu.addDispatchTarget(com);
				enu.unshift("zero");
			} catch (e) {
				if ("done" === e && enu.length === 2 && enu.at(0) === "zero") {
					this.finish();
				}
			} finally {
				clearTimeout(clk);
			}
		},
		
		testPop: function () {
			var $ = this;
			var events = ["onItemRemoved", "onLengthChanged"];
			var enu = new enyo.Enumerable(["zero"]);
			var com = new enyo.ETestListener({targetEvents: events});
			var clk = setTimeout(function () {
				$.finish("did not receive the correct events");
			}, 1000);
			try {
				enu.addDispatchTarget(com);
				enu.pop();
			} catch (e) {
				if ("done" === e && enu.length === 0) {
					this.finish();
				}
			} finally {
				clearTimeout(clk);
			}
		},
		
		testShift: function () {
			var $ = this;
			var events = ["onItemRemoved", "onLengthChanged"];
			var enu = new enyo.Enumerable(["zero", "one"]);
			var com = new enyo.ETestListener({targetEvents: events});
			var clk = setTimeout(function () {
				$.finish("did not receive the correct events");
			}, 1000);
			try {
				enu.addDispatchTarget(com);
				enu.shift();
			} catch (e) {
				if ("done" === e && enu.length === 1 && enu.at(0) === "one") {
					this.finish();
				}
			} finally {
				clearTimeout(clk);
			}
		},
		
		testSpliceRemove: function () {
			var $ = this;
			var events = ["onItemRemoved", "onLengthChanged"];
			var enu = new enyo.Enumerable(["zero","one","two","three"]);
			var com = new enyo.ETestListener({targetEvents: events});
			var clk = setTimeout(function () {
				$.finish("did not receive the correct events");
			}, 1000);
			try {
				enu.addDispatchTarget(com);
				enu.splice(1, 2);
			} catch (e) {
				if ("done" === e) {
					if (
						enu.length === 2
						&& enu.at(0) === "zero"
						&& enu.at(1) === "three"
					) this.finish();
					else this.finish("FAILED");
				}
			} finally {
				clearTimeout(clk);
			}
		},
		
		testSpliceRemoveAndAdd: function () {
			var $ = this;
			var events = ["onItemRemoved", "onItemAdded", "onLengthChanged", "onIndexChanged"];
			var enu = new enyo.Enumerable(["zero","one","two","three"]);
			var com = new enyo.ETestListener({targetEvents: events});
			var clk = setTimeout(function () {
				$.finish("did not receive the correct events");
			}, 1000);
			try {
				enu.addDispatchTarget(com);
				enu.splice(1, 2, "another");
			} catch (e) {
				if ("done" === e) {
					if (
						enu.length === 3
						&& enu.at(0) === "zero"
						&& enu.at(1) === "another"
						&& enu.at(2) === "three"
					) this.finish();
					else this.finish("FAILED");
				}
			} finally {
				clearTimeout(clk);
			}
		},
		
		testSpliceAdd: function () {
			var $ = this;
			var events = ["onItemAdded", "onLengthChanged", "onIndexChanged"];
			var enu = new enyo.Enumerable(["zero","one","two","three"]);
			var com = new enyo.ETestListener({targetEvents: events});
			var clk = setTimeout(function () {
				$.finish("did not receive the correct events");
			}, 1000);
			try {
				enu.addDispatchTarget(com);
				enu.splice(1, 0, "another", "friggin", "number");
			} catch (e) {
				if ("done" === e) {
					if (
						enu.length === 7
						&& enu.at(0) === "zero"
						&& enu.at(1) === "another"
						&& enu.at(2) === "friggin"
					) this.finish();
					else this.finish("FAILED");
				}
			} finally {
				clearTimeout(clk);
			}
		}
		
	});
	
})(enyo);