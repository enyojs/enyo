/* globals models: true */

(function (enyo) {

	// TODO: This is a work in progress.

	/**
		A generic kind of model with not schema or defaults.
	*/
	enyo.kind({
		name: "models.Generic",
		kind: "enyo.Model"
	});

	/**
		A generic kind of model with basic schema declaration.
	*/
	enyo.kind({
		name: "models.GenericSchema",
		kind: "enyo.Model",
		attributes: {
			id: {
				type: Number
			},
			firstName: {
				type: String
			},
			lastName: {
				type: String
			},
			age: {
				type: Number
			}
		}
	});

	/**
		A generic kind of model without a defined schema but
		having defaults.
	*/
	enyo.kind({
		name: "models.GenericDefaults",
		kind: "enyo.Model",
		defaults: {
			id: function () {
				return 1076;
			},
			firstName: "Joe",
			lastName: "Man",
			age: 45
		}
	});

	/**
		A generic kind of model with a defined schema and defaults.
	*/
	enyo.kind({
		name: "models.GenericDefaultsAndSchema",
		kind: "enyo.Model",
		attributes: {
			id: {
				type: Number
			},
			firstName: {
				type: String
			},
			lastName: {
				type: String
			},
			age: {
				type: Number
			}
		},
		defaults: {
			id: function () {
				return 1076;
			},
			firstName: "Joe",
			lastName: "Man",
			age: 45
		}
	});

	/**
		A generic kind of model with a toOne relationship with another model.
	*/
	enyo.kind({
		name: "models.Person",
		kind: "enyo.Model",
		attributes: {
			name: null,
			address: {
				relation: enyo.toOne({
					model: "models.Address",
					inverseKey: "person"
				})
			}
		}
	});

	/**
		Helper kind.
	*/
	enyo.kind({
		name: "models.Address",
		kind: "enyo.Model",
		attributes: {
			street: null,
			city: null,
			person: {
				relation: enyo.toOne({
					isOwner: false,
					inCommit: true
				})
			}
		}
	});

	/**
	*/
	enyo.kind({
		name: "models.Contact",
		kind: "enyo.Model",
		attributes: {
			name: {
				type: String
			},
			emails: {
				relation: enyo.toMany({
					inverseKey: "contact",
					model: "models.EmailAddress",
					inCommit: true
				})
			}
		}
	});

	enyo.kind({
		name: "models.EmailAddress",
		kind: "enyo.Model",
		attributes: {
			address: null,
			contact: {
				relation: enyo.toOne({
					isOwner: false
				})
			}
		}
	});

	enyo.kind({
		name: "models.GenericWithFormatter",
		kind: "enyo.Model",
		attributes: {
			age: {
				type: Number,
				remoteKey: "my",
				formatter: function (key, value, action, payload) {
					if (this.status == enyo.Model.BUSY.COMMITTING) {
						if (action != "commit") {
							throw "Expecting action to be commit during committing";
						}
					} else if (this.status == enyo.Model.BUSY.FETCHING) {
						if (action != "fetch") {
							throw "Expecting action to be fetch during fetching";
						}
					}
					return action == "commit"? {nested: {age: value}}: value.nested.age;
				}
			}
		}
	});

	/**
		A testing source designed to let otherwise asynchronous methods on models
		to hang so we can test their state.
	*/
	enyo.kind({
		name: "models.StatusSource",
		kind: "enyo.Source",
		commit: function () {},
		fetch: function () {},
		destroy: function () {}
	});
	
	enyo.kind({
		name: "models.DestroySource",
		kind: "enyo.Source",
		commit: function () {},
		fetch: function () {},
		destroy: function (model, options) {
			options.success();
		}
	});

	/**
		The `enyo.Model` kind is a very complex type that requires comprehensive
		tests to ensure stability and reliability. The initial tests are without
		relations and without tests against working relations and `enyo.Collection`s.
		While it seems ridiculous to break them down into so many parts it is necessary
		to be able to isolate possible breaking points.

		1. Create models
			- no attributes or defaults
			- with attributes
			- with defaults
			- with attributes and defaults
		2. Expected schema
			- no attributes or defaults means no known or infered schema
			- attributes defined expect schema structure
			- defaults defined expect schema to reflect defaults structure
			- attributes and defaults expect to match attributes
			- test with defined schema and default values with values supplied
				to constructor
			- test with defined schema and defaults values with some values supplied
				to constructor but not all to ensure defaults are used correctly
	*/
	enyo.kind({
		name: "ModelTests",
		kind: enyo.TestSuite,
		noDefer: true,

		/**
			Test creating a model without any features.
		*/
		testCreate: function () {
			new models.Generic();
			this.finish();
		},
		/**
			Test creating a model with a generic schema.
		*/
		testCreateSchema: function () {
			new models.GenericSchema();
			this.finish();
		},
		/**
			Test creating a model with generic defaults.
		*/
		testCreateDefaults: function () {
			new models.GenericDefaults();
			this.finish();
		},

		/**
			Test schema output for undefined schema structure.
		*/
		testNoSchema: function () {
			var $m = new models.Generic();
			if ($m._attributes.length) {
				this.finish("Expected no known attributes");
			} else {
				this.finish();
			}
		},
		/**
			Test schema output for defined attributes only.
		*/
		testWithSchema: function () {
			var $m = new models.GenericSchema();
			var res = enyo.union(["id","firstName","lastName","age"], enyo.keys($m.raw()));
			if (res.length) {
				this.finish("Expected union of keys in attribute and known keys to be none");
			} else {
				this.finish();
			}
		},
		/**
			Test schema output for infered structure based on supplied default values.
		*/
		testWithDefaults: function () {
			var $m = new models.GenericDefaults();
			var res = enyo.union(["id","firstName","lastName","age"], enyo.keys($m.raw()));
			var vals = $m.raw();
			if (res.length) {
				return this.finish("Expected union of keys in attributes and known keys to be none");
			}
			if (
				vals["id"] != 1076 ||
				vals["firstName"] != "Joe" ||
				vals["lastName"] != "Man" ||
				vals["age"] != 45
			) {
				return this.finish("Default values do not match schema result values");
			}
			this.finish();
		},
		/**
			Test schema output for defined schema and default values.
		*/
		testWithDefaultsAndSchema: function () {
			var $m = new models.GenericDefaultsAndSchema();
			var res = enyo.union(["id","firstName","lastName","age"], enyo.keys($m.raw()));
			var vals = $m.raw();
			if (res.length) {
				return this.finish("Expected union of keys in attributes and known keys to be none");
			}
			if (
				vals["id"] != 1076 ||
				vals["firstName"] != "Joe" ||
				vals["lastName"] != "Man" ||
				vals["age"] != 45
			) {
				return this.finish("Default values do not match schema result values");
			}
			this.finish();
		},
		/**
			Test output values when schema defined and defaults with values supplied to
			the constructor.
		*/
		testWithDefaultsAndSchemaAndValues: function () {
			var $m = new models.GenericDefaultsAndSchema({
				id: 1077,
				firstName: "Jill",
				lastName: "Lady",
				age: 33
			});
			var res = enyo.union(["id","firstName","lastName","age"], enyo.keys($m.raw()));
			var vals = $m.raw();
			if (res.length) {
				return this.finish("Expected union of keys in attributes and known keys to be none");
			}
			if (
				vals["id"] != 1077 ||
				vals["firstName"] != "Jill" ||
				vals["lastName"] != "Lady" ||
				vals["age"] != 33
			) {
				return this.finish("Default values do not match schema result values");
			}
			this.finish();
		},
		/**
			Test output values when schema defined and defaults with some values supplied to
			the constructor but not all (ensure defaults are being used where appropriate).
		*/
		testWithDefaultsAndSchemaAndSomeValues: function () {
			var $m = new models.GenericDefaultsAndSchema({
				id: 1077,
				firstName: "Jill"
			});
			var res = enyo.union(["id","firstName","lastName","age"], enyo.keys($m.raw()));
			var vals = $m.raw();
			if (res.length) {
				return this.finish("Expected union of keys in attributes and known keys to be none");
			}
			if (
				vals["id"] != 1077 ||
				vals["firstName"] != "Jill" ||
				vals["lastName"] != "Man" ||
				vals["age"] != 45
			) {
				return this.finish("Default values do not match schema result values");
			}
			this.finish();
		},
		/**
			Test for correct status on initialization in different scenarios.
		*/
		testStatus: function () {
			var $m = new models.Generic();
			if ($m.status !== enyo.Model.NEW) {
				return this.finish("Model was expected to have status NEW");
			}
			$m = new models.GenericSchema();
			if ($m.status !== enyo.Model.NEW) {
				return this.finish("Generic model was expected to have status NEW");
			}
			$m = new models.GenericDefaults();
			if ($m.status !== enyo.Model.CLEAN) {
				return this.finish("Generic Defaults model was expected to have status CLEAN");
			}
			$m = new models.GenericDefaults({"firstName": "Sandy"});
			if ($m.status !== enyo.Model.CLEAN) {
				return this.finish("Model was expected to have status CLEAN");
			}
			$m.set("firstName", "Ted");
			if ($m.status !== enyo.Model.DIRTY) {
				return this.finish("Model was expected to have status DIRTY");
			}
			$m.commit();
			if ($m.status !== enyo.Model.ERROR.SOURCE) {
				return this.finish("Model was expected to have status ERROR.SOURCE");
			}
			new enyo.Store();
			$m.commit();
			if ($m.status !== enyo.Model.ERROR.RESPONSE) {
				return this.finish("Model was expected to have status ERROR.RESPONSE");
			}
			enyo.store = null;
			new enyo.Store({source: models.StatusSource});
			$m = new models.GenericDefaults();
			$m.set("firstName", "Billy");
			$m.commit();
			if ($m.status !== enyo.Model.BUSY.COMMITTING) {
				return this.finish("Model was expected to have status BUSY.COMMITTING");
			}
			$m.didCommit();
			if ($m.status !== enyo.Model.CLEAN) {
				return this.finish("Model was expected to have status CLEAN after commit");
			}
			$m = new models.GenericSchema();
			$m.fetch();
			if ($m.status !== enyo.Model.BUSY.FETCHING) {
				return this.finish("Model was expected to have status BUSY.FETCHING");
			}
			$m.didFetch();
			if ($m.status !== enyo.Model.CLEAN) {
				return this.finish("Model was expected to have status CLEAN after fetch");
			}
			$m = new models.GenericSchema();
			$m.destroy();
			if ($m.status !== enyo.Model.BUSY.DESTROYING) {
				return this.finish("Model was expected to have status BUSY.DESTROYING");
			}
			$m.didDestroy();
			if ($m.status !== enyo.Model.DESTROYED) {
				return this.finish("Model was expected to have status DESTROYED");
			}
			enyo.store = null;
			this.finish();
		},
		/**
			Test the formatter.
		*/
		testFormatter: function () {
			var $m = new models.GenericWithFormatter({
				my: {
					nested: {
						age: 67
					}
				}
			});
			if ($m.get("age") !== 67) {
				return this.finish("Expected local request for age to be 67 but got " + $m.get("age"));
			}
			$m.set("age", 99);
			try {
				if ($m.raw().my.nested.age !== 99) {
					return this.finish("Structure was correct but value wasn't, expected 99 got " + $m.raw().my.nested.age);
				}
			} catch (e) {
				return this.finish("Raw value was not in the correct format for the payload, " +
					enyo.json.stringify($m.raw()), " expected structure my.nested.age");
			}
			this.finish();
		}
	});

	enyo.kind({
		name: "CollectionTests",
		kind: enyo.TestSuite,
		noDefer: true,
		testCreate: function () {
			var $c = new enyo.Collection();
			if (!$c || $c.length) {
				return this.finish("Collection expected to be empty at creation");
			}
			this.finish();
		},
		testCreateWithValues: function () {
			var $c = new enyo.Collection([
				{name: "Joe"},
				{name: "Joe"},
				{name: "Joe"},
				{name: "Joe"},
				{name: "Joe"},
				{name: "Joe"},
				{name: "Joe"},
				{name: "Joe"},
				{name: "Joe"},
				{name: "Joe"},
				{name: "Jim"}
			]);
			if (!$c.length && $c.length == 11) {
				return this.finish("Models not added correctly to collection");
			}
			for (var idx=0,len=$c.length; idx<len; ++idx) {
				if (!($c.at(idx) instanceof enyo.Model)) {
					return this.finish("Entries were not converted to enyo.Model");
				}
			}
			if ($c.at(10).get("name") != "Jim") {
				return this.finish("Records not created correctly, expected Jim but got '" + $c.at(10).get("name") + "'");
			}
			this.finish();
		}
	});

	enyo.kind({
		name: "RelationTests",
		kind: enyo.TestSuite,
		noDefer: true,

		testToOneRelation: function () {
			var $m = new models.Person({
				name: "Jake M.",
				address: {
					street: "5051 Great America Parkway",
					city: "Santa Clara"
				}
			});
			if (!($m.address instanceof models.Address)) {
				return this.finish("toOne related model incorrect, got " + $m.address);
			}
			if ($m.address.get("street") != "5051 Great America Parkway") {
				return this.finish("toOne related model did not have the correct data");
			}
			var $r = $m.raw();
			if (
				$r.address.street != "5051 Great America Parkway" ||
				$r.address.city != "Santa Clara"
			) {
				return this.finish("toOne related model was not embedded in raw output correctly");
			}
			if ($m.status == enyo.Model.DIRTY || $m.address.status == enyo.Model.DIRTY) {
				return this.finish("Relation caused model to be DIRTY even though it should be CLEAN");
			}
			$m.address.set("street", "850 Potrero Avenue");
			if ($m.status != enyo.Model.DIRTY || $m.address.status != enyo.Model.DIRTY) {
				return this.finish("Relation owner expected to be dirty as well as related model");
			}
			$m.didCommit();
			if ($m.status != enyo.Model.CLEAN || $m.address.status != enyo.Model.CLEAN) {
				return this.finish("Relation owner being set to CLEAN on didCommit should result in " +
					"relation also being CLEAN");
			}
			this.finish();
		},
		testToManyRelation: function () {
			var $m = new models.Contact({
				name: "Jake M.",
				emails: [
					{address: "jake@gmail.com"},
					{address: "jake.m@hotmail.com"},
					{address: "jmisawesome@yahoo.com"}
				]
			});
			if (!($m.emails instanceof enyo.Collection)) {
				return this.finish("toMany did not get created correctly");
			}
			if ($m.emails.length != 3) {
				return this.finish("toMany collection did not add the records");
			}
			$m.emails.at(0).set("address", "me@me.com");
			if (
				$m.status != enyo.Model.DIRTY ||
				$m.emails.status != enyo.Model.DIRTY ||
				$m.emails.at(0).status != enyo.Model.DIRTY
			) {
				return this.finish("status' not synched on DIRTY");
			}
			$m.didCommit();
			if (
				$m.status != enyo.Model.CLEAN ||
				$m.emails.status != enyo.Model.CLEAN ||
				$m.emails.at(0).status != enyo.Model.CLEAN
			) {
				return this.finish("status' not synched on CLEAN");
			}
			this.finish();
		}
	});
	
	enyo.kind({
		name: "ModelCollectionAndModelControllerTest",
		kind: enyo.TestSuite,
		noDefer: true,
		testModelSetup: function () {
			var $c = new enyo.ModelController();
			var $m = new enyo.Model({name: "Cole", job: "Test-Writer (apparently)", happiness: "Not happy."});
			if ($c.model) {
				return this.finish("There should not be a model yet");
			}
			$c.set("model", $m);
			if (!$c.model) {
				return this.finish("There should have been a model");
			}
			if (
				$c.get("name") !== "Cole" ||
				$c.get("job") !== "Test-Writer (apparently)" ||
				$c.get("happiness") !== "Not happy."
			) {
				return this.finish("Could not derive expected values from model");
			}
			this.finish();
		},
		testChangeFromModelToController: function () {
			var $c = new enyo.ModelController();
			var $m = new enyo.Model({name: "Cole", job: "Test-Writer (apparently)", happiness: "Not happy."});
			$c.set("model", $m);
			$m.set("happiness", "A little happier.");
			if ($c.get("happiness") !== "A little happier.") {
				return this.finish("Changed attribute in model did not propagate to the controller");
			}
			this.finish();
		},
		testChangeFromControllerToModel: function () {
			var $c = new enyo.ModelController();
			var $m = new enyo.Model({name: "Cole", job: "Test-Writer (apparently)", happiness: "Not happy."});
			$c.set("model", $m);
			$c.set("happiness", "A little happier.");
			if ($m.get("happiness") !== "A little happier.") {
				return this.finish("Changed attribute in controller did not propagate to the model");
			}
			this.finish();
		},
		testChangeFromModelToBoundView: function () {
			var $v = new (enyo.kind({
				kind: "enyo.View",
				mixins: ["enyo.AutoBindingSupport"],
				bindSource: "model",
				components: [
					{name: "name", bindFrom: ".name"},
					{name: "job", bindFrom: ".job"},
					{name: "happiness", bindFrom: ".happiness"}
				]
			}))();
			var $m = new enyo.Model({name: "Cole", job: "Test-Writer (apparently)", happiness: "Not happy."});
			$v.set("model", $m);
			if (
				$v.$.name.content != "Cole" ||
				$v.$.job.content != "Test-Writer (apparently)" ||
				$v.$.happiness.content != "Not happy."
			) {
				return this.finish("Values were not propagated from model to view correctly");
			}
			$m.set("happiness", "If this is always working, pretty happy.");
			if ($v.$.happiness.content != "If this is always working, pretty happy.") {
				return this.finish("Changed value did not match from model to view");
			}
			this.finish();
		},
		testChangeFromModelToControllerBoundView: function () {
			var $v = new (enyo.kind({
				kind: "enyo.View",
				mixins: ["enyo.AutoBindingSupport"],
				bindSource: "controller",
				components: [
					{name: "name", bindFrom: ".name"},
					{name: "job", bindFrom: ".job"},
					{name: "happiness", bindFrom: ".happiness"}
				]
			}))();
			var $c = new enyo.ModelController();
			var $m = new enyo.Model({name: "Cole", job: "Test-Writer (apparently)", happiness: "Not happy."});
			$v.set("controller", $c);
			$c.set("model", $m);
			if (
				$v.$.name.content != "Cole" ||
				$v.$.job.content != "Test-Writer (apparently)" ||
				$v.$.happiness.content != "Not happy."
			) {
				return this.finish("Values were not propagated from model to view correctly");
			}
			$m.set("happiness", "If this is always working, pretty happy.");
			if ($v.$.happiness.content != "If this is always working, pretty happy.") {
				return this.finish("Changed value did not match from model to view");
			}
			this.finish();
		},
		testMultipleModelsToBoundView: function () {
			var $v = new (enyo.kind({
				kind: "enyo.View",
				mixins: ["enyo.AutoBindingSupport"],
				bindSource: "model",
				components: [
					{name: "name", bindFrom: ".name"},
					{name: "job", bindFrom: ".job"},
					{name: "happiness", bindFrom: ".happiness"}
				]
			}))();
			var $m1 = new enyo.Model({name: "Cole1", job: "Test-Writer (apparently)", happiness: "Not happy."});
			var $m2 = new enyo.Model({name: "Cole2", job: "Not-Test-Writer (apparently)", happiness: "Very happy."});
			$v.set("model", $m1);
			if (
				$v.$.name.content != "Cole1" ||
				$v.$.job.content != "Test-Writer (apparently)" ||
				$v.$.happiness.content != "Not happy."
			) {
				return this.finish("Values were not propagated from model to view correctly on first model");
			}
			$v.set("model", $m2);
			if (
				$v.$.name.content != "Cole2" ||
				$v.$.job.content != "Not-Test-Writer (apparently)" ||
				$v.$.happiness.content != "Very happy."
			) {
				return this.finish("Values were not propagated from model to view correctly on second model");
			}
			this.finish();
		},
		testMultipleModelsToControllerBoundView: function () {
			var $v = new (enyo.kind({
				kind: "enyo.View",
				mixins: ["enyo.AutoBindingSupport"],
				bindSource: "controller",
				components: [
					{name: "name", bindFrom: ".name"},
					{name: "job", bindFrom: ".job"},
					{name: "happiness", bindFrom: ".happiness"}
				]
			}))();
			var $m1 = new enyo.Model({name: "Cole1", job: "Test-Writer (apparently)", happiness: "Not happy."});
			var $m2 = new enyo.Model({name: "Cole2", job: "Not-Test-Writer (apparently)", happiness: "Very happy."});
			var $c = new enyo.ModelController();
			$v.set("controller", $c);
			$c.set("model", $m1);
			if (
				$v.$.name.content != "Cole1" ||
				$v.$.job.content != "Test-Writer (apparently)" ||
				$v.$.happiness.content != "Not happy."
			) {
				return this.finish("Values were not propagated from model to view correctly on first model");
			}
			$c.set("model", $m2);
			if (
				$v.$.name.content != "Cole2" ||
				$v.$.job.content != "Not-Test-Writer (apparently)" ||
				$v.$.happiness.content != "Very happy."
			) {
				return this.finish("Values were not propagated from model to view correctly on second model");
			}
			this.finish();
		},
		testEventsFromCollectionToView: function () {
			new enyo.Store({source: "models.DestroySource"});
			var $c = new enyo.Collection(), $d = [];
			var $v = new (enyo.kind({
				kind: "enyo.View",
				handlers: {
					onModelChanged: "modelChanged",
					onModelAdded: "modelAdded",
					onModelsAdded: "modelsAdded",
					onModelRemoved: "modelRemoved",
					onModelsRemoved: "modelsRemoved",
					onModelDestroyed: "modelDestroyed"
				},
				modelChanged: function () {
					throw "modelChanged";
				},
				modelAdded: function () {
					throw "modelAdded";
				},
				modelsAdded: function () {
					throw "modelsAdded";
				},
				modelRemoved: function () {
					throw "modelRemoved";
				},
				modelsRemoved: function () {
					throw "modelsRemoved";
				},
				modelDestroyed: function () {
					throw "modelDestroyed";
				}
			}))();
			$v.set("controller", $c);
			try {
				$c.add(new enyo.Model({name: "Cole"}));
			} catch (e) {
				if (e == "modelAdded") {
					$d.push("onModelAdded");
				}
			}
			try {
				$c.add([new enyo.Model({name: "Cole"}), new enyo.Model({name: "Cole"}), new enyo.Model({name: "Cole"})]);
			} catch (e) {
				if (e == "modelsAdded") {
					$d.push("onModelsAdded");
				}
			}
			try {
				$c.at(0).set("name", "Ben");
			} catch (e) {
				if (e == "modelChanged") {
					$d.push("onModelChanged");
				}
			}
			try {
				$c.remove($c.at(0));
			} catch (e) {
				if (e == "modelRemoved") {
					$d.push("onModelRemoved");
				}
			}
			try {
				$c.remove([$c.at(0), $c.at(1)]);
			} catch (e) {
				if (e == "modelsRemoved") {
					$d.push("onModelsRemoved");
					// reset to nop so it does not throw an event later that
					// disrupts the onModelDestroyed event
					$c.remove = function (){};
				}
			}
			try {
				$c.at(0).destroy();
			} catch (e) {
				if (e == "modelDestroyed") {
					$d.push("onModelDestroyed");
				}
			}
			if ($d.length != 6) {
				return this.finish("Did not receive all of the events, missing " +
					enyo.unique(["onModelAdded","onModelsAdded","onModelRemoved","onModelsRemoved","onModelChanged","onModelDestroyed"], $d).join(", "));
			}
			this.finish();
		},
		testSettingData: function () {
			var $c = new enyo.Collection(), $d = [];
			var $v = new (enyo.kind({
				kind: "enyo.View",
				length: 0,
				controller: $c,
				handlers: {
					onModelsAdded: "modelsAdded"
				},
				modelsAdded: function () {
					throw "modelsAdded";
				},
				bindings: [
					{from: ".controller.length", to: ".length"}
				]
			}))();
			try {
				$c.set("data", [new enyo.Model({name: "Cole"}, new enyo.Model({name: "Cole"}))]);
			} catch (e) {
				if (e == "modelsAdded") {
					$d.push("onModelsAdded");
				}
			}
			if ($d.length != 1) {
				return this.finish("Did not receive the onModelsAdded event when the computed property value was set");
			}
			if ($v.length != $c.length) {
				return this.finish("Bindings apparently didn't fire as expected because length was incorrect");
			}
			this.finish();
		}
	});

})(enyo);