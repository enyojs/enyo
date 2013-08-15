enyo.kind({

	// ...........................
	// PUBLIC PROPERTIES

	//*@public
	name: "enyo.ModelController",
	
	//*@public
	kind: "enyo.Controller",
	
	create: enyo.super(function (sup) {
		return function () {
			sup.apply(this, arguments);
			this.notifyObservers("model");
		};
	}),
	
	// ...........................
	// PUBLIC METHODS

	//*@public
	isAttribute: function (prop) {
		return this.model && enyo.isModel(this.model)? this.model.isAttribute(prop): false;
	},

	//*@public
	get: enyo.super(function (sup) {
		return function (prop) {
			if (!this.isAttribute(prop)) {
				sup.apply(this, arguments);
			}
			return this.model && enyo.isModel(this.model)? this.model.get(prop): undefined;
		};
	}),

	//*@public
	set: enyo.super(function (sup) {
		return function (prop, val) {
			if (!this.isAttribute(prop)) {
				return sup.apply(this, arguments);
			}
			return this.model.set(prop, val);
		};
	}),

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
	modelChanged: function (p) {
		var m = this.model;
		if (p) {
			p.removeObserver("*", this._attributeSpy);
		}
		if (m) {
			if (enyo.isString(m)) {
				m = this.model = enyo.getPath.call(m[0] == "."? this: enyo.global, m);
			}
			if (m) {
				this._attributeSpy = m.addObserver("*", this.attributeSpy, this);
				this.stopNotifications();
				this.sync();
				this.startNotifications();
			}
		}
	},
	attributeSpy: function (prev, val, prop) {
		this.notifyObservers(prop, prev, val);
	}
	/*
	modelChanged: function (prev, val) {
		if (prev && enyo.isModel(prev)) {
			prev.removeObserver("*", this.notifyObservers);
		}
		if (val || (val = this.model) && enyo.isModel(val)) {
			val.addObserver("*", this.notifyObservers);
			this.stopNotifications();
			this.sync();
			this.startNotifications();
		}
	}*/

});
