(function () {

	var defaults = {
		prop1: "value1",
		prop2: "value2",
		prop3: "value3"
	};

	var updates = {
		prop1: "update_value1",
		prop2: "update_value2",
		prop3: "update_value3"
	};

	enyo.kind({
		name: "ObjectControllerTest.js",
		kind: enyo.TestSuite,

		testHashDataAccessors: function () {
			var oc = new enyo.ObjectController();
			var key;
			oc.set("data", enyo.clone(defaults));
			for (key in defaults) {
				if (defaults[key] !== oc.get(key)) {
					return this.finish("failed to retrieve propper value from key");
				}
			}
			this.finish();
		},

		testObjectDataAccessors: function () {
			var oc = new enyo.ObjectController();
			var oco = new enyo.Object(enyo.clone(defaults));
			var key;
			oc.set("data", oco);
			for (key in defaults) {
				if (defaults[key] !== oc.get(key)) {
					return this.finish("failed to retrieve propper value from key");
				}
			}
			this.finish();
		},

		testHashDataSetters: function () {
			var oc = new enyo.ObjectController();
			var clone = enyo.clone(defaults);
			var update = enyo.clone(updates);
			var key;
			oc.set("data", clone);
			for (key in update) {
				oc.set(key, update[key]);
				if (clone[key] !== oc.get(key)) {
					return this.finish("failed to update data hash with new value");
				}
			}
			this.finish();
		},

		testObjectDataSetters: function () {
			var oc = new enyo.ObjectController();
			var oco = new enyo.Object(enyo.clone(defaults));
			var update = enyo.clone(updates);
			var key;
			oc.set("data", oco);
			for (key in update) {
				oc.set(key, update[key]);
				if (oco.get(key) !== update[key] || oc.get(key) !== update[key]) {
					return this.finish("failed to update data object with new value");
				}
			}
			this.finish();
		},

		testHashObservers: function () {
			var oc = new enyo.ObjectController();
			var keys = enyo.keys(defaults);
			var clone = enyo.clone(defaults);
			var update = enyo.clone(updates);
			var key;
			var idx;
			oc.set("data", clone);
			for (key in defaults) {
				try {
					this.changedResponderTest(oc, key, oc.get(key), update[key]);
				} catch (e) {
					if ((idx = enyo.indexOf(e, keys)) > -1) {
						keys.splice(idx, 1);
					} else {
						throw e;
					}
				}
			}
			if (0 === keys.length) {
				this.finish();
			}
			else {
				this.finish("changed responders did not complete");
			}
		},

		testObjectObservers: function () {
			var oc = new enyo.ObjectController();
			var oco = new enyo.Object(enyo.clone(defaults));
			var update = enyo.clone(updates);
			var keys = enyo.keys(defaults);
			var key;
			var idx;
			oc.set("data", oco);
			for (key in defaults) {
				try {
					this.changedResponderTest(oc, key, oc.get(key), update[key]);
				} catch (e) {
					if (oco.get(key) !== update[key]) {
						return this.finish("object controller reported change but " +
							"data object did not have expected value");
					}
					if ((idx = enyo.indexOf(e, keys)) > -1) {
						keys.splice(idx, 1);
					} else {
						throw e;
					}
				}
			}
			if (0 === keys.length) {
				this.finish();
			}
			else {
				this.finish("changed responders did not complete");
			}
		},

		changedResponderTest: function (obj, key, prev, target) {
			var fn = key.toLowerCase() + "Changed";
			obj[fn] = function (nprev, ncur) {
				if (nprev !== prev) {
					throw "previous values did not match";
				}
				if (ncur !== target) {
					throw "updated value was incorrect";
				}
				throw key;
			};
			obj.set(key, target);
		}

	});

})();
