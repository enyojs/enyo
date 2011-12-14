/**
	A control that optionally defers creation of its components based on the setting of the lazy property.
	Call validateComponents to create and render components.
*/
enyo.kind({
	name: "enyo.LazyControl",
	kind: enyo.Control,
	lazy: true,
	//* @protected
	initComponents: function() {
		if (!this.lazy) {
			// componentsReady handles all initialization of components so that
			// it's a single place to override initialization behavior
			this.componentsReady();
		}
	},
	//* @public
	/**
		Called when components are initialized. Use for initialization instead of create.
	*/
	componentsReady: function() {
		// call Control.initComponents directly to create the default set of components
		// create any chrome before this
		enyo.Control.prototype.initComponents.apply(this, arguments);
	},
	/**
		Ensure components are created.
	*/
	validateComponents: function() {
		if (this.lazy) {
			this.lazy = false;
			//enyo.time("create");
			this.initComponents();
			// um, we may have created a control parent for our owner (if it is a control)!
			if (this.owner && this.owner.discoverControlParent) {
				this.owner.discoverControlParent();
			}
			//var c = enyo.timeEnd("create"), r=0;
			if (this.hasNode()) {
				//enyo.time("render");
				this.render();
				//r = enyo.timeEnd("render");
			}
			//this.log("create", c, "render", r, "total", (c + r));
		}
	}
});
