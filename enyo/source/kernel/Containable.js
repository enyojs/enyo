enyo.kind({
	name: "enyo.Containable",
	kind: enyo.Component,
	published: {
		container: null,
		parent: null
	},
	create: function() {
		this.inherited(arguments);
		this.containerChanged();
	},
	destroy: function() {
		//this.setParent(null);
		this.setContainer(null);
		this.inherited(arguments);
	},
	// containment
	containerChanged: function(inOldContainer) {
		if (inOldContainer) {
			inOldContainer.removeControl(this);
		}
		if (this.container) {
			this.container.addControl(this);
		}
	},
	// parentage
	parentChanged: function(inOldParent) {
		if (inOldParent && inOldParent != this.parent) {
			inOldParent.removeChild(this);
		}
	},
	//* @public
	// Note: oddly, a Control is considered a descendant of itself
	isDescendantOf: function(inAncestor) {
		var p = this;
		while (p && p!=inAncestor) {
			p = p.parent;
		}
		return inAncestor && (p == inAncestor);
	}
});