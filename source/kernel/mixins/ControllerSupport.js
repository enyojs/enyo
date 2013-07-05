//*@public
/**
*/
enyo.createMixin({

	// ...........................
	// PUBLIC PROPERTIES

	//*@public
	name: "enyo.ControllerSupport",

	// ...........................
	// PROTECTED PROPERTIES

	//*@protected
	_supportsControllers: true,

	// ...........................
	// COMPUTED PROPERTIES

	// ...........................
	// PUBLIC METHODS

	// ...........................
	// PROTECTED METHODS

	//*@protected
	create: function () {
		if (this.controller) {
			this.notifyObservers("controller");
		}
	},

	//*protected
	destroy: function () {
		if (this.controller) {
			if (this.controller.owner && this === this.controller.owner) {
				this.controller.destroy();
			}
			this.controller = null;
		}
	},

	//*@protected
	_controllerChanged: enyo.observer(function (property, previous, value) {
		if (previous && value && previous === value) {
			// seems to be the same controller we already had
			return;
		}
		// first attempt to find the controller from the
		// information we've been handed
		if (this.controller) {
			this.findAndInstance("controller");
		}
	}, "controller"),

	//*@protected
	controllerFindAndInstance: function (ctor, inst) {
		// if there is no constructor or instance it was not found
		if (!(ctor || inst)) {
			enyo.error("cannot find controller: " + this.controller);
			return;
		}
		// if a constructor exists we instanced the class and can
		// claim it as our own
		if (ctor) {
			inst.set("owner", this);
		}
		// lets add ourselves as a dispatch listener
		else {
			inst.addDispatchTarget(this);
		}
		// we rebuild (rather than refresh) our bindings because
		// they are now most likely connected to the previous controller.
		for (var $i=0, b$; (b$=this.bindings[$i]); ++$i) {
			if (b$.source == this || b$.from == "controller" || b$.from == ".controller") {
				b$.rebuild();
			}
		}
	},

	//*@protected
	dispatchEvent: function (name, event, sender) {
		// if we have a controller attempt to dispatch the event there
		// and if it returns true, stop the dispatch
		if (this.controller && this.controller._isController) {
			if (this.controller.dispatchEvent(name, event, sender)) {
				return true;
			}
			// this scenario is handled completely in the inherited method
			// here we simply want to make sure that the controller has an
			// opportunity to deal with the remapped event
			if (this[name] && "string" === typeof this[name]) {
				if (this.controller.dispatchEvent(this[name], event, sender)) {
					return true;
				}
			}
		}
		return this.inherited(arguments);
	},

	//*@protected
	dispatch: function (inMethodName, inEvent, inSender) {
		// allow a controller to handle the delegated named event from
		// a child
		var c = this.controller;
		if (c) {
			if (c[inMethodName] && enyo.isFunction(c[inMethodName])) {
				return c[inMethodName].call(c, inSender || this, inEvent);
			}
		}
		return this.inherited(arguments);
	}

	// ...........................
	// OBSERVERS

});
