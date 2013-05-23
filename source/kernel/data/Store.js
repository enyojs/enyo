(function (enyo) {

	enyo.store = null;
	enyo.models = {
		kinds: [],
		add: function (ctor) {
			if (!~enyo.indexOf(ctor, this.kinds)) {
				this.kinds.push(ctor);
			}
			if (enyo.store) {
				enyo.store._addModelKind(ctor);
			}
		}
	};

	/**
		As seen https://gist.github.com/jcxplorer/823878, by jcxplorer.
		TODO: replace with faster implementation
	*/
	var uuid = function () {
		var uuid = "", idx = 0, rand;
		for (; idx < 32; ++idx) {
			rand = Math.random() * 16 | 0;
			if (idx == 8 || idx == 12 || idx == 16 || idx == 20) {
				uuid += "-";
			}
			uuid += (idx == 12? 4: (idx == 16? (rand & 3 | 8): rand)).toString(16);
		}
		return uuid;
	};

	enyo.kind({

		// ...........................
		// PUBLIC PROPERTIES

		name: "enyo.Store",
		kind: "enyo.Controller",
		source: null,
		
		// ...........................
		// PROTECTED PROPERTIES
		
		_records: null,
		
		// ...........................
		// COMPUTED PROPERTIES

		// ...........................
		// PUBLIC METHODS
		
		uuid: function () {
			return uuid();
		},
		find: function (ctor, options) {
			
		},
		init: function (model) {
			var id = model.euuid = this.uuid();
			this._records[id] = model;
			this._records[model.kindName].all.push(model);
		},
		fetch: function (model, fn) {
			this.log(model);
		},
		commit: function (model, fn) {
			this.log(model);
		},
		destroy: function (model, fn) {
			this.log(model);
		},
		constructor: function () {
			// there can only be one store executing at a time
			if (enyo.store) {
				throw "There can only be one enyo.Store active";
			}
			enyo.store = this;
			this.inherited(arguments);
			this._records = {};
			enyo.forEach(enyo.models.kinds, this._addModelKind, this);
		},
		didFetch: function () {
			
		},
		didCommit: function () {
			
		},
		didDestroy: function () {
			
		},

		// ...........................
		// PROTECTED METHODS

		_addModelKind: function (ctor) {
			if (!this._records[ctor.prototype.kindName]) {
				this._records[ctor.prototype.kindName] = {
					all: [],
					byPrimaryKey: {}
				};
			}
		}

		// ...........................
		// OBSERVERS

	});


})(enyo);