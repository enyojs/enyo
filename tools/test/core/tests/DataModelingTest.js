(function (enyo) {
	
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
		name: "CreateModelTests",
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
		}
	});
	
})(enyo);