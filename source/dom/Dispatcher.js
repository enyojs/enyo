//* @protected
enyo.$ = {};

enyo.dispatcher = {
	handlerName: "dispatchDomEvent",
	captureHandlerName: "captureDomEvent",
	mouseOverOutEvents: {enter: 1, leave: 1},
	// these events come from document
	events: ["mousedown", "mouseup", "mouseover", "mouseout", "mousemove", "mousewheel", "click", "dblclick", "change", "keydown", "keyup", "keypress", "input"],
	// thes events come from window
	windowEvents: ["resize", "load", "unload", "message"],
	connect: function() {
		if (document.addEventListener) {
			var listen = function() {
				document.addEventListener.apply(document, arguments);
			}
		} else {
			listen = function(inEvent, inCb) {
				document.attachEvent("on" + inEvent, function() {
					//console.log("got an event");
					event.target = event.srcElement;
					return inCb(event);
				});
			}
		}
		//
		var d = enyo.dispatcher;
		for (var i=0, e; e=d.events[i]; i++) {
			listen(e, enyo.dispatch, false);
		}
		//
		var adder = document.addEventListener ? "addEventListener" : "attachEvent";
		//console.log(adder);
		for (i=0, e; e=d.windowEvents[i]; i++) {
			window[adder](e, enyo.dispatch, false);
		}
	},
	//* Takes an Event.target and finds the corresponding enyo control
	findDispatchTarget: function(inNode) {
		var t, n = inNode;
		// FIXME: Mozilla: try/catch is here to squelch "Permission denied to access property xxx from a non-chrome context" 
		// which appears to happen for scrollbar nodes in particular. It's unclear why those nodes are valid targets if 
		// it is illegal to interrogate them. Would like to trap the bad nodes explicitly rather than using an exception block.
		try {
			while (n) {
				if (t = enyo.$[n.id]) {
					// there could be multiple nodes with this id, the relevant node for this event is n
					// we don't push this directly to t.node because sometimes we are just asking what
					// the target 'would be' (aka, calling findDispatchTarget from handleMouseOverOut)
					t.eventNode = n;
					break;
				}
				n = n.parentNode;
			}
		} catch(x) {
			console.log(x, n);
		}
		return t;
	},
	//* Return the default enyo control for events
	findDefaultTarget: function(e) {
		return enyo.dispatcher.rootHandler;
		//return enyo.master.getComponents()[0];
	},
	//* Fire an event for Enyo to listen for
	dispatch: function(e) {
		//console.log([e.type, e.target.id, e.target.tagName].join(" "));
		// Find the control who maps to e.target, or the first control that maps to an ancestor of e.target.
		var c = this.findDispatchTarget(e.target) || this.findDefaultTarget(e);
		// Cache the original target
		e.dispatchTarget = c;
		// support pluggable features
		for (var i=0, fn; fn=this.features[i]; i++) {
			if (fn.call(this, e)) {
				return true;
			}
		}
		// feature (aka filter) may have established a new target
		c = e.filterTarget || c;
		if (c) {
			// capture phase
			// filterTarget redirects event handling and forward means we'll also send the event 
			// to the original target; so we decide not to process capture phase if we are capturing
			// and not forwarding.
			if (!e.filterTarget || e.forward) {
				if (this.dispatchCapture(e, c) === true) {
					return true;
				}
			}
			// bubble phase
			var handled = this.dispatchBubble(e, c);
			// if the event was captured, forward it if desired
			if (e.forward) {
				handled = this.forward(e);
			}
			//return !handled;
		}
	},
	forward: function(e) {
		var c = e.dispatchTarget;
		return c && this.dispatchBubble(e, c);
	},
	dispatchCapture: function(e, c) {
		var ancestors = this.buildAncestorList(e.target);
		// FIXME: it's unclear what kind of cancelling we want here.
		// Currently we allow aborting the capture phase.
		// We may want to abort the entire event processing or nothing at all.
		//
		// iterate through ancestors starting from eldest
		for (var i= ancestors.length-1, a; a=ancestors[i]; i--) {
			if (this.dispatchToCaptureTarget(e, a) === true) {
				return true;
			}
		}
	},
	// we ascend the dom making a list of enyo controls
	buildAncestorList: function(inNode) {
		// NOTE: the control is considered its own ancestor
		var ancestors = [];
		var n = inNode;
		var c;
		while (n) {
			c = enyo.$[n.id];
			if (c) {
				ancestors.push(c);
			}
			n = n.parentNode;
		}
		return ancestors;
	},
	dispatchToCaptureTarget: function(e, c) {
		// generic event handler name
		var fn = this.captureHandlerName;
		// If this control implements event handlers...
		if (c[fn]) {
			// ...pass event to target's event handler, abort capture if handler returns true.
			if (c[fn](e) !== true) {
				return false;
			}
			return true;
		}
	},
	dispatchBubble: function(e, c) {
		/*
		if (e.type == "mouseup") {
			var t = enyo.dom.findTarget(c, e.pageX, e.pageY);
			console.log(e.pageX + " x " + e.pageY + " c: " + c.id + " t: " + (t ? t.id : "no target"));
		}
		*/
		e.stopPropagation = function() {
			this._handled = true;
		};
		// Bubble up through the control tree
		while (c) {
			// NOTE: diagnostic only 
			if (e.type == "click" && e.ctrlKey && e.altKey) {
				console.log(e.type + ": " + c.name + " [" + c.kindName + "]");
			}
			// Stop processing if dispatch returns true
			if (this.dispatchToTarget(e, c) === true) {
				return true;
			}
			// Bubble up through parents
			//c = c.container || c.owner;
			c = c.parent || c.container || c.owner;
		}
		return false;
	},
	dispatchToTarget: function(e, c) {
		// mouseover/out handling
		if (this.handleMouseOverOut(e, c)) {
			return true;
		}
		// generic event handler name
		var fn = this.handlerName;
		// If this control implements event handlers...
		if (c[fn]) {
			// ...pass event to target's event handler, abort bubbling if handler returns true.
			if (c[fn](e) !== true && !e._handled) {
				return false;
			}
			// cache the handler to help implement symmetric events (in/out)
			e.handler = c;
			return true;
		}
	},
	handleMouseOverOut: function(e, c) {
		if (this.mouseOverOutEvents[e.type]) {
			if (this.isInternalMouseOverOut(e, c)) {
				return true;
			}
		}
	},
	isInternalMouseOverOut: function(e, c) {
		// cache original event node
		var eventNode = c.eventNode;
		// get control for related target, may set a new eventNode
		var rdt = this.findDispatchTarget(e.relatedTarget);
		// if the targets are the same, but the nodes are different, then cross-flyweight, and not internal
		if (c == rdt && eventNode != c.eventNode) {
			// this is the node responsible for the 'out'
			c.eventNode = eventNode;
			//console.log("cross-flyweight mouseover/out", e.type, c.id);
			return false;
		}
		// if the relatedTarget is a decendant of the target, it's internal
		return rdt && rdt.isDescendantOf(c);
	}
};

enyo.dispatch = function(inEvent) {
	//return enyo.dispatcher.dispatch(enyo.fixEvent(inEvent));
	return enyo.dispatcher.dispatch(inEvent);
};

enyo.bubble = function(e) {
	if (e) {
		enyo.dispatch(e);
	}
};

enyo.bubbler = 'enyo.bubble(arguments[0])';

// FIXME: we need to create and initialize dispatcher someplace else to allow overrides
enyo.requiresWindow(enyo.dispatcher.connect);

//
// feature plugins (aka filters)
//

enyo.dispatcher.features = [];

// capturing feature

enyo.dispatcher.features.push(function(e) {
	var c = e.dispatchTarget;
	// prevent capturing events that go to the rootHandler as these events do not target an enyo control
	if (this.captureTarget && (c != enyo.dispatcher.rootHandler) && !this.noCaptureEvents[e.type]) {
		if (!c || !c.isDescendantOf(this.captureTarget)) {
			e.filterTarget = this.captureTarget;
			e.forward = this.autoForwardEvents[e.type] || this.forwardEvents;
		}
	}
});

/*
	NOTE: This object is a plug-in; these methods should 
	be called on _enyo.dispatcher_, and not on the plug-in itself.
*/
enyo.mixin(enyo.dispatcher, {
	noCaptureEvents: {load: 1, unload:1, error: 1},
	autoForwardEvents: {mouseout: 1},
	captures: [],
	//* Capture events for `inTarget` and optionally forward them
	capture: function(inTarget, inShouldForward) {
		var info = {target: inTarget, forward: inShouldForward};
		this.captures.push(info);
		this.setCaptureInfo(info);
		//console.log("capture on");
	},
	//* Release the last captured event
	release: function() {
		//console.log("capture off");
		this.captures.pop();
		this.setCaptureInfo(this.captures[this.captures.length-1]);
	},
	//* Set the information for a captured event
	setCaptureInfo: function(inInfo) {
		this.captureTarget = inInfo && inInfo.target;
		this.forwardEvents = inInfo && inInfo.forward;
	}
});

// key preview feature

enyo.dispatcher.keyEvents = {keydown: 1, keyup: 1, keypress: 1};

enyo.dispatcher.features.push(function(e) {
	if (this.keyWatcher && this.keyEvents[e.type]) {
		this.dispatchToTarget(e, this.keyWatcher);
	}
});

enyo.dispatcher.rootHandler = {
	// ensures events handled by the rootHandler receive no special gesture treatment
	requiresDomMousedown: true,
	listeners: [],
	addListener: function(inListener) {
		this.listeners.push(inListener);
	},
	removeListener: function(inListener) {
		enyo.remove(inListener, this.listeners);
	},
	dispatchDomEvent: function(e) {
		// note: some root events should be dispatched to all controls via enyo master
		if (e.type == "resize") {
			this.broadcastMessage("resize");
			// return before broadcasting resize as an event
			return;
		}
		/*
		// send an "autoHide" message when window hides or deactivates
		if (e.type == "windowDeactivated" || e.type == "windowHidden") {
			this.broadcastMessage("autoHide");
		}
		*/
		this.broadcastEvent(e);
	},
	// messages go to enyo master
	broadcastMessage: function(inMessage) {
		for (var n in enyo.master.$) {
			//console.log("broadcasting message", inMessage, "to", n);
			enyo.master.$[n].broadcastMessage(inMessage);
		}
	},
	// events go to listeners
	broadcastEvent: function(e) {
		for (var i=0, l; l=this.listeners[i]; i++) {
			// we may need to do something with the return value
			// and/or return some value ourselves
			l.dispatchDomEvent(e);
		}
	},
	// FIXME: we are implementing a subset of Component interface in an adhoc manner.
	// This much of the interface is required.
	isDescendantOf: function() {
		return false;
	}
};
