enyo.kind({

	// ...........................
	// PUBLIC PROPERTIES

	//*@public
	name: "enyo.ModelController",
	
	//*@public
	mixins: ["enyo.ModelSupport"],

	//*@public
	kind: "enyo.Controller",
	
	// ...........................
	// PUBLIC METHODS

	//*@public
	isAttribute: function (prop) {
		return this.model && enyo.isModel(this.model)? this.model.isAttribute(prop): false;
	},

	//*@public
	get: function (prop) {
		if (!this.isAttribute(prop)) {
			return this.inherited(arguments);
		}
		return this.model && enyo.isModel(this.model)? this.model.get(prop): undefined;
	},

	//*@public
	set: function (prop, val) {
		if (!this.isAttribute(prop)) {
			return this.inherited(arguments);
		}
		return this.model.set(prop, val);
	},

	//*@public
	sync: function () {
		var $m = this.model;
		if ($m && enyo.isModel($m)) {
			var $a = $m.__attributeKeys, $b = this.bindings, $i, a$, b$;
			for ($i=0; $i<$a.length || $i<$b.length; ++$i) {
				if ((a$=$a[$i])) {
					this.notifyObservers(a$, $m.previous(a$), $m.get(a$));
				}
				if ((b$=$b[$i])) {
					b$.sync();
				}
			}
		}
	},
	
	modelChanged: function (prev, val) {
		// TODO: This is a terrible fix for a bug there is no easy solution
		// for in the long run. This will unfortunately be executed sometimes
		// out of context because of the way our inherited scheme works and
		// the synchronous execution of observers and events may cause an inherited
		// check before the temporary inherited method (this method) is removed.
		if (!this._isController) {
			return;
		}
		if (prev && enyo.isModel(prev)) {
			prev.removeObserver("*", this.notifyObservers);
		}
		if (val || (val = this.model) && enyo.isModel(val)) {
			val.addObserver("*", this.notifyObservers, this);
			this.stopNotifications();
			this.sync();
			this.startNotifications();
		}
	}

});
