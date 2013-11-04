//*@public
/**
	The _enyo.ModelController_ kind is designed as a proxy for other objects
	to bind to properties of a _model_ safely, even when the model is changing.
	It also allows for extended logic capabilities beyond that of the _model_
	alone without modifying the _model_ kind. Its primary purpose is to _proxy_
	the underlying data from the _model_. Like _enyo.Model_, the use of the _get_
	and _set_ methods are restricted to _attributes_ of the _model_ schema. There
	are convenience methods _localGet_ and _localSet_ that will act like the _get_
	and _set_ of _enyo.Object_ and subkinds. This _controller_ has the ability
	to interact with the _enyo.Component_ event system but also proxies the _event_
	API of _enyo.Model_ and _enyo.Controller_.
*/
enyo.kind({
	name: "enyo.ModelController",
	kind: enyo.Controller,
	/**
		This property must be set to an instance of _enyo.Model_ for it
		to function as expected.
	*/
	model: null,
	/**
		Retrieve an _attribute_ from the _model_ (if it exists). The only exceptions
		are the _model_ property itself may be returned from this method or _computed_
		properties of the _controller_. This way, _bindings_ can correctly bind to
		a _model controller's computed properties_ without modifying the _model_ definition.
		There is a limitation here that a computed property with the same name as an _attribute_
		or _computed property_ of the _model_ will not be accessible to _bindings_ on the
		_model controller_.
	*/
	get: function (prop) {
		if (prop == "model") {
			return this.getLocal(prop);
		} else if (this._isComputed(prop)) {
			return this._getComputed(prop);
		} else if (this.model) {
			return this.model.get.apply(this.model, arguments);
		} else {
			// to ensure that bindings will clear according to their api
			return null;
		}
	},
	/**
		Will allow the retrieval of local properties and computed properties
		according to the _enyo.Object.get_ method.
	*/
	getLocal: function () {
		return enyo.getPath.apply(this, arguments);
	},
	/**
		Set an _attribute_ (or _attributes_ if an object) on the _model_
		(if it exists). Returns the _model_ if it exists otherwise _undefined_.
		The only exception is the _model_ properties itself may be set using
		this method as well.
	*/
	set: function (prop, value) {
		if (prop == "model") { return this.setLocal(prop, value); }
		if (this.model) { return this.model.set.apply(this.model, arguments); }
	},
	/**
		Will allow the setting of local properties according to the _enyo.Object.set_
		method.
	*/
	setLocal: function () {
		return enyo.setPath.apply(this, arguments);
	},
	/**
		To arbitrarily update any bindings to known _attributes_ of the
		_model_ (if it exists), call this method. Optionally provide
		a hash of properties and values with which to notify observers noting
		that the values will be used as the _previous_ values if there is
		no `model` present on the _controller_.
	*/
	sync: function (props) {
		var m  = this.model,
			aa = props || (this.model && this.model.attributes);
		for (var k in aa) { this.notifyObservers(k, m? m.previous[k]: aa[k], m? this.model.get(k): null); }
	},
	/**
		This method responds to the _model_ property being set on this _controller_.
		Overload this method for additional behaviors.
	*/
	modelChanged: function (previous, model) {
		var p = previous,
			m = model;
		// remove our listeners from the model that is no longer ours
		if (p) {
			p.removeListener("change", this._modelChanged);
			p.removeListener("destroy", this._modelDestroyed);
			// if we're removing the current record and there isn't a replacement
			// we need to synchronize observers related to this record
			if (!m) { this.sync(p.attributes); }
		}
		if (m) {
			// assign listeners to respond to events from the model
			m.addListener("change", this._modelChanged);
			m.addListener("destroy", this._modelDestroyed);
			this.sync();
		}
	},
	//*@protected
	create: enyo.inherit(function (sup) {
		return function () {
			sup.apply(this, arguments);
			if (this.model) {
				this.notifyObservers("model", null, this.model);
			}
		};
	}),
	constructor: enyo.inherit(function (sup) {
		return function () {
			sup.apply(this, arguments);
			this._modelChanged = this.bindSafely("_modelChanged");
		};
	}),
	_modelChanged: function (r) {
		var ch = r.changed;
		for (var k in ch) { this.notifyObservers(k, r.previous[k], ch[k]); }
	},
	_modelDestroyed: function (r) {
		if (r === this.model) {
			this.setLocal("model", null);
		}
	}
});
