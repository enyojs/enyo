enyo.createMixin({

	// ...........................
	// PUBLIC PROPERTIES

	//*@public
	name: "enyo.ModelSupport",
	
	//*@public
	model: null,
	
	// ...........................
	// PROTECTED PROPERTIES
	
	//*protected
	_supportsModels: true,

	// ...........................
	// PUBLIC METHODS
	
	//*@public
	create: function () {
		this.modelChanged();
	},
	
	//*@public
	modelChanged: function (prev, val) {
		if (prev && val && prev === val) {
			return;
		}
		if (this.model) {
			this.findAndInstance("model");
		}
		if (prev && enyo.isModel(prev)) {
			prev.removeDispatchTarget(this);
		}
		if (arguments.callee._inherited) {
			this.inherited(arguments);
		}
	},
	
	//*@public
	modelFindAndInstance: function (ctor, inst) {
		if (inst) {
			inst.addDispatchTarget(this);
			// we rebuild (rather than refresh) our bindings because
			// they are now most likely connected to the previous model.
			var $r = /^\.?model/;
			for (var $i=0, b$; (b$=this.bindings[$i]); ++$i) {
				if ($r.test(b$.from) || $r.test(b$.to)) {
					b$.rebuild();
				}
			}
		}
		if (arguments.callee._inherited) {
			this.inherited(arguments);
		}
	},
	
	//*@public
	destroy: function () {
		if (this.model && enyo.isModel(this.model)) {
			this.model.removeDispatchTarget(this);
		}
	}

});
