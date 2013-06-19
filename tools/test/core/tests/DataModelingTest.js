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
					return action == "commit"? this.age: payload.my.nested.age;
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
				return this.finish("Model was expected to have status NEW");
			}
			$m = new models.GenericDefaults();
			if ($m.status !== enyo.Model.NEW) {
				return this.finish("Model was expected to have status NEW");
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
			// this test can't be executed due to an outstanding TODO in the `raw`
			// method for `enyo.Model`
			// var $m =
			new models.GenericWithFormatter();
			this.finish();
		}
	});

	enyo.kind({
		name: "CollectionTests",
		kind: enyo.TestSuite,
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

})(enyo);