enyo.kind({
	
	// ...........................
	// PUBLIC PROPERTIES

	//*@public
	name: "wip.Repeater",
	
	//*@public
	kind: "enyo.View",
	
	//*@public
	defaultChildController: "enyo.ObjectController",
	
	//*@public
	childMixins: ["enyo.AutoBindingSupport"],
	
	// ...........................
	// PROTECTED PROPERTIES
	
	//*@protected
	concat: ["childMixins"],
	
	//*@protected
	handlers: {
		didadd: "repeaterDidAdd",
		didremove: "repeaterDidRemove",
		didreset: "repeaterDidReset",
		didchange: "repeaterDidChange"
	},
	
	//*@protected
	bindings: [
		{from: ".controller.data", to: ".data"}
	],
	
	// ...........................
	// COMPUTED PROPERTIES
	
	//*@public
	/**
		A computed property that represents the length of the
		current _data_ value as data may be overloaded and only
		be a subset (e.g. filtered) of the total data. This will
		the equivalent of the number of children that are rendered.
	*/
	length: enyo.computed(function () {
		return (this.get("data") || []).length;
	}, "data"),
	
	// ...........................
	// PUBLIC METHODS
	
	//*@public
	prune: function () {
		var children = this.getClientControls();
		var len = this.get("length");
		var idx = 0;
		var blackbook = children.slice(len);
		var count = blackbook.length;
		for (; idx < count; ++idx) blackbook[idx].destroy();
	},
	
	//*@public
	sync: function (start, end) {
		var idx = start || 0;
		var fin = end || this.get("length")-1;
		var data = this.get("data");
		for (; idx <= fin; ++idx) this.update(idx, data);
	},
	
	//*@public
	update: function (index, data) {
		index = parseInt(index);
		var children = this.getClientControls();
		var data = data? data.length? data[index]: data: this.get("data")[index];
		var child = children[index];
		var len = this.get("length");
		if (index < 0 || index >= len) return;
		if (!data && child) {
			this.remove(index);
		} else if (data && !child) {
			this.add(index, data);
		} else if (data && child) {
			child.controller.set("data", data);
		}
	},
	
	//*@public
	remove: function (index) {
		this.log(index);
	},
	
	//*@protected
	add: function (index, data) {
		var children = this.getClientControls();
		var pos = children.length;
		var data = data || this.get("data")[index];
		var kind = this.child;
		var child;
		if (pos !== index) {
			throw "add was called for index other than the end";
		}
		child = this.createComponent({kind: kind});
		child.controller.set("data", data);
		child.render();
	},
	
	// ...........................
	// PROTECTED METHODS
	
	//*@protected
	create: function () {
		this.inherited(arguments);
		this.sync();
	},
	
	//*@protected
	initComponents: function () {
		// we intercept the original components definition to hyjack
		// the normal flow of initializing components
		var components = this.kindComponents || this.components || [];
		// we try and retrieve the definition/configuration for the child
		// component/view we will need to use in the repeater, if there are
		// multiple children we combine them into a wrapper view
		var def = (function (children) {
			return children.length > 1? {components: children}: enyo.clone(children[0]);
		}(components));
		// we grab a reference to any mixins the definition might have
		// so we can add the one we know needs to be there
		var mixins = def.mixins || [];
		// now we add the auto-bindings support mixin so it will always
		// be applied to our children
		def.mixins = enyo.merge(mixins, this.childMixins);
		// we reset whichever of these was going to be used (or both)
		// so we don't actually create any children/controls at this time
		this.kindComponents = this.components = null;
		// finish our own normal initialization without component creation
		this.inherited(arguments);
		// if the child definition itself has a name it won't work because
		// we'll be repeating it so we remove it
		// note that names on the children will be fine because they will
		// become kindComponents of the child when it is implemented
		delete def.name;
		def.kind = def.kind || "enyo.View";
		// this is where the components on the child definition become
		// kind components (if they weren't already)
		this.child = enyo.kind(def);
		// if the definition for the child does not have a controller set
		// we apply our default
		if (!this.child.prototype.controller) {
			this.child.prototype.controller = this.defaultChildController;
		}
	},
	
	//*@protected
	/**
		Whenever a new value is added to the dataset we receive this
		event. Because it is an addition we know we'll be adding a
		child or some children (depending on how many elements were added).
		This allows us find and render only the new elements and when
		necessary rerender any changed indices only.
	*/
	repeaterDidAdd: function (sender, event) {
		var values = event.values;
		var indices = enyo.keys(values);
		var pos = 0;
		var len = indices.length;
		var idx;
		for (; pos < len; ++pos) {
			idx = indices[pos];
			this.update(idx, values[idx]);
		}
	},
	
	//*@protected
	repeaterDidRemove: function (sender, event) {
		var values = event.values;
		var indices = enyo.keys(values);
		var len = indices.length;
		var pos = 0;
		var data = this.get("data");
		var idx;
		for (; pos < len; ++pos) {
			idx = indices[pos];
			this.update(idx, data[idx]);
		}
		this.prune();
	},
	
	//*@protected
	repeaterDidChange: function (sender, event) {
		var values = event.values;
		var indices = enyo.keys(values);
		var idx;
		var len = indices.length;
		var children = this.getClientControls();
		var child;
		var pos = 0;
		for (; pos < len; ++pos) {
			idx = indices[pos];
			child = children[idx];
			if (!child) continue;
			child.controller.set("data", values[idx]);
		}
	},
	
	//*@protected
	repeaterDidReset: function (sender, event) {
		this.sync();
		this.prune();
	}
	
	// ...........................
	// OBSERVERS
	
});
