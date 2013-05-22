(function (enyo) {

	enyo.kind({

		// ...........................
		// PUBLIC PROPERTIES

		//*@public
		name: "enyo.ModelController",

		//*@public
		model: null,

		// ...........................
		// PROTECTED PROPERTIES

		//*@public
		kind: "enyo.Controller",

		// ...........................
		// COMPUTED PROPERTIES

		//*@protected
		_attribute_keys: enyo.computed(function () {
			return this.model? enyo.keys(this.model.attributes): null;
		}, "model", {cached: true, defer: true}),

		// ...........................
		// PUBLIC METHODS

		//*@public
		isAttribute: function (property) {
			return this.model? this.model.isAttribute(property): false;
		},

		//*@public
		get: function (property) {
			if ("model" === property || !this.isAttribute(property)) {
				return this.inherited(arguments);
			}
			return this.model? this.model.get(property): undefined;
		},

		//*@public
		set: function (property, value) {
			if ("model" !== property && !this.isAttribute(property)) {
				return this.inherited(arguments);
			}
			if ("model" === property) {
				var $model = this.model;
				if ($model) {
					$model.removeDispatchTarget(this);
					$model.removeObserver("*", this.notifyObservers);
				}
				if (($model = value)) {
					$model.addDispatchTarget(this);
					$model.addObserver("*", this.notifyObservers, this);
					this.stopNotifications();
					this.inherited(arguments);
					this.sync();
					this.startNotifications();
					return this;
				}
			}
			return this.model? this.model.set(property, value): this;
		},

		//*@public
		sync: function () {
			enyo.forEach(this.bindings, function (binding) {
				binding.sync();
			});
			enyo.forEach(this.get("_attribute_keys"), function (key) {
				this.notifyObservers(key, null, this.model.get(key));
			}, this);
		}

		// ...........................
		// PROTECTED METHODS

		// ...........................
		// OBSERVERS

	});

})(enyo);
