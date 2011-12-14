/**
A control designed to be rendered multiple times. Typically, controls provide dynamic 
behavior in response to events and effect changes in rendering. Because flyweight is rendered
multiple times, the question comes up: which rendering of the flyweight should update when an event occurs?
To address this issue, whenever a DOM event is processed by a Flyweight object or any of its children, the flyweight 
automatically updates itself and its children to point to the rendering of itself in which the event occurred.
*/
enyo.kind({
	name: "enyo.Flyweight",
	kind: enyo.Control,
	events: {
		onNodeChange: "",
		onDecorateEvent: ""
	},
	//* @protected
	// NOTE: in enyo 0.7, not capturing mousemove was enough to avoid most events during scrolling
	// as of 0.8's drag system, we process a high number of drag events while scrolling.
	// so we filter events while dragging
	captureDomEvent: function(e) {
		// track if we've captured dragging
		var t = e.type;
		if (t == "dragfinish") {
			this.capturedDragging = false;
		}
		// context switch if not dragging and not mousemove, over, or out.
		// NOTE: any event occuring while scrolling must trigger flyweight event sync
		// because scrolling can prompt rendering, which alters flyweight state.
		// therefore always include: flick, dragstart, dragfinish
		if (t == "flick" || (!this.capturedDragging && t != "mousemove" && t != "mouseover" && t != "mouseout")) {
			//this.log(t);
			this.setNodeByEvent(e);
		}
		// block after we start dragging.
		this.doDecorateEvent(e);
		if (t == "dragstart") {
			this.capturedDragging = true;
		}
	},
	//* @public
	//* Switch to the correct node for the incoming Event
	setNodeByEvent: function(inEvent) {
		var n = this.findNode(inEvent.target);
		if (n) {
			// FIXME: switch flyweight node if it has changed.
			// Depending on this check assumes that child nodes will only need to 
			// be updated if the ancestor flyweight's node is updated. When is this not true?
			// NOTE: we can also be told we need to update via needsNode flag. RowServer.generateRow does this
			if ((n != this.node) || this.needsNode) {
				this.setNode(n);
				this.doNodeChange(n);
				this.needsNode = false;
			}
		}
	},
	/** Given a node assumed to be inside a rendering of the flyweight, locate a node for the flyweight. */
	findNode: function(inNode) {
		var n = inNode;
		while (n) {
			if (n.id == this.id) {
				return n;
			}
			n = n.parentNode;
		}
	},
	// NOTE: we cannot use teardownRender here because the act of rendering a flyweight causes
	// generated to be set to true, which would mean we have to teardownRender before every rendering
	// which is too costly..
	//* Disable access to a Control's node
	disableNodeAccess: function() {
		this.disEnableNodeAccess(this, true);
	},
	//* Enable access to a Control's node
	enableNodeAccess: function() {
		this.disEnableNodeAccess(this);
	},
	//* @protected
	// When rendering a flyweight, we want it to report that
	// it does not have a node so that it's possible to call methods like setShowing 
	// that can affect rendering without them actually affecting any specific previous rendering
	// (i.e. its first rendering)
	disEnableNodeAccess: function(inControl, inDisable) {
		// optimization: only disEnable children if it was possible to do so for this control
		if (this._disEnableNodeAccess(inControl, inDisable)) {
			this.disEnableChildrenNodeAccess(inControl, inDisable);
		}
	},
	_disEnableNodeAccess: function(inControl, inDisable) {
		if (inDisable) {
			if (!inControl._hasNode) {
				inControl._hasNode = inControl.hasNode;
				inControl.hasNode = enyo.nop;
				return true;
			}
		} else if (inControl._hasNode) {
			inControl.hasNode = inControl._hasNode;
			delete inControl._hasNode;
			return true;
		}
	},
	disEnableChildrenNodeAccess: function(inControl, inDisable) {
		for (var i=0, c$=inControl.children, c; c=c$[i]; i++) {
			this.disEnableNodeAccess(c, inDisable);
		}
	},
	// NOTE: When we set a flyweight's node, we udpate all its children's nodes as well.
	setNode: function(inNode) {
		this.node = inNode;
		this.assignChildrenNodes(this);
	},
	// update the given control's node and recursively update all children nodes
	assignChildrenNodes: function(inControl) {
		for (var i=0, c$=inControl.children, c, n; c=c$[i]; i++) {
			n = this.findControlNode(c, inControl.node, i);
			if (n) {
				c.node = n;
				c.generated = true;
				this.assignChildrenNodes(c);
			} else {
				c.teardownRender();
			}
		}
	},
	// locate the node for a given control within a parent node
	findControlNode: function(inControl, inParentNode, inIndex) {
		var id = inControl.id;
		// first see if the control matches node in its parent's childNodes with same array index.
		// this should be the 90% case
		var n = inParentNode && inParentNode.childNodes[inIndex];
		if (n && n.id == id) {
			return n;
		}
		// then fall back to searching in dom
		return (inParentNode && inParentNode.querySelector("[id="+id+"]"));
	}
});

// Call a method on a control (typically in a flyweight context) without 
// access to the node. Useful if the control should call a method without updating its rendering.
enyo.Flyweight.callWithoutNode = function(inControl, inFunc) {
	var n = inControl.hasNode();
	var fn = inControl.hasNode;
	inControl.node = null;
	inControl.hasNode = enyo.nop;
	inFunc();
	inControl.node = n;
	inControl.hasNode = fn;
};
