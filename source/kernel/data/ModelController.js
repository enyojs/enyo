(function (enyo) {
	
	var _selected = /^selected/;
	
	enyo.kind({

		// ...........................
		// PUBLIC PROPERTIES

		//*@public
		name: "enyo.ModelController",

		//*@public
		model: null,
		
		//*@public
		events: {
			onModelSelected: "",
			onModelDeselected: ""
		},

		// ...........................
		// PROTECTED PROPERTIES

		//*@public
		kind: "enyo.Controller",

		// ...........................
		// COMPUTED PROPERTIES

		//*@protected
		_attributeKeys: enyo.computed(function () {
			return this.model? this.model._attributeKeys: null;
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
					this._removeModel($model);
				}
				if (($model = value)) {
					this.stopNotifications();
					this.inherited(arguments);
					this._initModel($model);
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
			enyo.forEach(this.get("_attributeKeys"), function (key) {
				this.notifyObservers(key, null, this.model.get(key));
			}, this);
		},

		// ...........................
		// PROTECTED METHODS

		create: function () {
			this.inherited(arguments);
			if (this.model) {
				this._initModel(this.model);
			}
		},
		
		_removeModel: function (model) {
			var $model = model || this.model;
			if ($model) {
				$model.removeDispatchTarget(this);
				$model.removeObserver("*", this.notifyObservers);
			}
		},
		
		_initModel: function (model) {
			var $model = model;
			if ($model) {
				$model.addDispatchTarget(this);
				$model.addObserver("*", this.notifyObservers, this);
				this.stopNotifications();
				this.sync();
				this.startNotifications();
			}
		},
		
		// ...........................
		// OBSERVERS

		_selectionSpy: enyo.observer(function (property, previous, value) {
			if (_selected.test(property)) {
				if (true === value) {
					this.doModelSelected();
				} else if (false === value) {
					this.doModelDeselected();
				}
			}
		}, "*")
		
	});

})(enyo);
