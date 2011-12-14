/**
Pane is designed to host a set of view controls and show one view at a time. Any view 
may be selected and shown as needed. When a view is selected, it animates
into display based on the type of transition specified in the transitionKind property.
By default, views fade in. To specify a Pane with views that fly in, try:

	{kind: "Pane", transitionKind: "enyo.transitions.LeftRightFlyin", components: [
		{kind: "mainView"},
		{kind: "otherView"}
	]}

While a view may be any kind of control, views are typically complex 
collections of controls. Therefore it's often convenient to create kinds 
for each view, as in the example above. Also note that each view will be sized to fit 
the dimensions of the pane.

By default, the first view is selected (displayed). There are several ways to select views; use whichever method is most convenient for the application.
For example, to select a view by reference:

	this.$.pane.selectView(this.$.otherView);

To select a view by name:

	this.$.pane.selectViewByName("otherView");

To select by index:

	this.$.pane.selectViewByIndex(1);

Pane also maintains a history list of views that have been selected.  This list may be navigated 
using the back and next methods.

Frequently, an application will need to retrieve information about the currently selected view. A pane's view
property references the currently selected view. The getViewName and getViewIndex methods return the name and index of the selected view, respectively.

The onSelectView event fires whenever the selected view changes. For example:

	{kind: "Pane", onSelectView: "viewSelected", components: [
		{kind: "mainView"},
		{kind: "searchView"}
	]}

In the following example, we stop search processing when the search view is hidden:

	viewSelected: function(inSender, inView, inPreviousView) {
		if (inPreviousView.name == "searchView") {
			this.cancelSearch();
		}
	}

Pane also supports a performance-enhancing optimization that can defer the creation
of views until they are selected. To enable this optimization, mark individual
views with the lazy property set to true:

	{kind: "Pane", components: [
		{kind: "mainView"},
		{kind: "otherView", lazy: true}
	]}

You must use selectViewByName to select a view that has not yet been created:

	this.$.pane.selectViewByName("otherView");

It's also possible to verify that a lazy marked view has been created without 
selecting it, by calling validateView(inName);

*/
enyo.kind({
	name: "enyo.Pane",
	kind: enyo.Control,
	layoutKind: "PaneLayout",
	published: {
		transitionKind: "enyo.transitions.Fade"
	},
	//* @protected
	view: null,
	lastView: null,
	events: {
		/**
			Event that fires whenever a view is selected. The event contains
			the current view and previous view. For example: 

				viewSelected: function(inSender, inView, inPreviousView) {
					inView.startProcessing();
					inPreviousView.endProcessing();
				}
		*/
		onSelectView: "",
		/**
			Event that fires when a view is selected by name but does not exist
			in either the view list or the set of lazy marked views. Handle this 
			event to dynamically create the view. The event contains the requested
			view name. For example:

				paneCreateView: function(inSender, inName) {
					if (inName == "searchView") {
						this.$.pane.createComponent({kind: "searchView", owner: this});
					}
				}
		*/
		onCreateView: ""
	},
	maxHistory: 40,
	create: function() {
		this.queue = [];
		this.history = [];
		this.views = [];
		this.lazyViews = this.lazyViews || [];
		this.inherited(arguments);
		this.addClass("enyo-pane");
		this.transitionKindChanged();
		// FIXME: setup defaults better
		this.view = this.findDefaultView();
	},
	initComponents: function() {
		// extract component configurations marked as lazy into lazyViews
		//
		// these components are 'managedComponents', managed by me but owned by getInstanceOwner (usually my owner)
		this._extractLazyViews("components");
		// these components are 'kindComponents', managed by me and owned by me
		this._extractLazyViews("kindComponents", this);
		//
		// continue normal initComponents
		this.inherited(arguments);
	},
	_extractLazyViews: function(inComponentPropertyName, inOwner) {
		var c$ = this[inComponentPropertyName];
		if (c$) {
			var comps = [];
			for (var i=0, c; c=c$[i]; i++) {
				if (c.lazy) {
					if (inOwner) {
						c = enyo.mixin(enyo.clone(c), {owner: inOwner});
					}
					this.lazyViews.push(c);
				} else {
					comps.push(c);
				}
			}
			this[inComponentPropertyName] = comps;
		}
	},
	addControl: function(inControl) {
		this.inherited(arguments);
		if (this.controlIsView(inControl)) {
			this.addView(inControl);
		} else {
			this.finishTransition();
		}
	},
	removeControl: function(inControl) {
		if (this.controlIsView(inControl)) {
			this.finishTransition();
			this.removeView(inControl);
		}
		this.inherited(arguments);
	},
	// this control should be considered a view (part of the view list)
	controlIsView: function(inControl) {
		return true;
		//return !inControl.isChrome;
	},
	// returns the control which should be used for transitions for a given view.
	transitioneeForView: function(inView) {
		return inView;
	},
	findDefaultView: function() {
		return this.getViewList()[0];
	},
	addView: function(inControl) {
		this.views.push(inControl);
	},
	removeView: function(inControl) {
		enyo.remove(inControl, this.views);
		this.removeHistoryItem(inControl);
	},
	flow: function() {
		var c$ = this.getViewList();
		for (var i=0, c; c=c$[i]; i++) {
			if ((c != this.view) && !this.$.transition.isTransitioningView(c)) {
				c.applyStyle("display", "none");
			}
		}
		this.inherited(arguments);
	},
	getInnerHtml: function() {
		this.finishTransition();
		this.flow();
		return this.inherited(arguments);
	},
	_selectView: function(inView) {
		this.lastView = this.view;
		this.view = inView;
		this.transitionView(this.lastView, this.view);
		// send a message to the view and all sub-components
		this.view.resized();
	},
	_selectViewBack: function(inView) {
		this._selectView(inView);
		this.doSelectView(this.view, this.lastView);
	},
	// FIXME: better name
	reallySelectView: function(inView) {
		if (inView != this.view) {
			this._selectView(inView);
			this.addHistoryItem(this.lastView);
		}
		this.doSelectView(this.view, this.lastView);
	},
	//* @public
	/**
		Selects the view specified by the inView reference. Fires the onSelectView event.
		Set inSync to true to ensure that the view is selected sychronously.
	*/
	selectView: function(inView, inSync) {
		if (inSync) {
			this.reallySelectView(inView);
		} else {
			enyo.asyncMethod(this, "reallySelectView", inView);
		}
	},
	/**
		Selects the view with the name inName. Fires the onSelectView event.
		Set inSync to true to ensure that the view is selected sychronously.
	*/
	selectViewByName: function(inName, inSync) {
		var v = this.viewByName(inName);
		if (v) {
			this.selectView(v, inSync);
		}
		return v;
	},
	/**
		Selects the view with the index inIndex. Fires the onSelectView event.
		Set inSync to true to ensure that the view is selected sychronously.
	*/
	selectViewByIndex: function(inIndex, inSync) {
		var v = this.viewByIndex(inIndex);
		if (v) {
			this.selectView(v, inSync);
		}
		return v;
	},
	//* @protected
	getViewList: function() {
		return this.views;
	},
	getViewCount: function() {
		return this.getViewList().length;
	},
	//* @public
	/**
		Returns the currently selected view.
	*/
	getView: function() {
		return this.view;
	},
	/**
		Returns the index of the currently selected view.
	*/
	getViewIndex: function() {
		return this.indexOfView(this.view);
	},
	/**
		Returns the name of the currently selected view.
	*/
	getViewName: function() {
		return this.view && this.view.name;
	},
	/**
		Checks whether the view specified by inName exists. If it does not exist,
		attempts to create the view by name from the list of lazy marked views.
		If the view is not found, fires the onCreateView event, which can be
		implemented to dynamically create a view by name.
	*/
	validateView: function(inName) {
		return this.viewByName(inName);
	},
	//* @protected
	viewByName: function(inName) {
		var c$ = this.getViewList();
		for (var i=0, s; s=c$[i]; i++) {
			if (s.name == inName) {
				return s;
			}
		}
		// note: will attempt to create a view requested by name
		// if it is not found; facilitates lazy creation.
		return this.createView(inName);
	},
	//* @protected
	viewByIndex: function(inIndex) {
		return this.getViewList()[inIndex];
	},
	indexOfView: function(inView) {
		var c$ = this.getViewList();
		return enyo.indexOf(inView, c$);
	},
	findLazyView: function(inName) {
		for (var i=0, v; v=this.lazyViews[i]; i++) {
			if (v.name == inName) {
				return v;
			}
		}
	},
	createView: function(inName) {
		var config = this.findLazyView(inName) || this.doCreateView(inName);
		if (config) {
			var s = this.createComponent(config, {owner: this.owner});
			this.flow();
			s.render();
			return s;
		}
	},
	// transitions
	transitionView: function(inFromView, inToView) {
		// if we're currently transitioning, add next change to queue
		if (this._transitioning) {
			this.addToQueue({from: inFromView, to: inToView});
		// FIXME: ad hoc
		} else if (inFromView != inToView) {
			// FIXME: MORE ad hoc
			// FIXME: Edge-case hack to allow a scroller to adjust itself to changes 
			// that may have occured while it was away.
			var s = this.transitioneeForView(inToView);
			if (s && s.start) {
				enyo.asyncMethod(s, s.start);
			}
			if (inFromView) {
				inFromView.broadcastMessage("hidden");
				this.dispatch(this.owner, inFromView.onHide);
			}
			if (this.hasNode()) {
				this.transitionBegin(inFromView, inToView);
			} else {
				this.transitionDone(inFromView, inToView);
			}
		}
	},
	transitionBegin: function(inFromView, inToView) {
		enyo.scrimTransparent.showAtZIndex(10);
		this._transitioning = true;
		this.$.transition.viewChanged(inFromView, inToView);
	},
	transitionDone: function(inFromView, inToView) {
		// ensure transition finishes with correct result
		enyo.scrimTransparent.hideAtZIndex(10);
		this._transitioning = false;
		if (inFromView) {
			inFromView.setShowing(false);
		}
		if (inToView) {
			inToView.setShowing(true);
			if (!this.selectNextInQueue()) {
				this.dispatch(this.owner, inToView.onShow);
			}
		}
	},
	transitionKindChanged: function() {
		if (this.$.transition) {
			this.$.transition.destroy();
		}
		this.createComponent({name: "transition", kind: this.transitionKind, pane: this});
	},
	finishTransition: function() {
		if (this._transitioning) {
			this.queue = [];
			if (this.$.transition.done) {
				this.$.transition.done();
			} else {
				this.transitionDone();
			}
		}
	},
	addToQueue: function(inIndex) {
		this.queue.push(inIndex);
	},
	// FIXME: make queue work again.
	selectNextInQueue: function() {
		var n = this.queue.shift();
		if (n) {
			this.transitionView(n.from, n.to);
			return true;
		}
	},
	addHistoryItem: function(inView) {
		if (this.history.push(this.indexOfView(inView)) > this.maxHistory) {
			this.history.shift();
		}
	},
	removeHistoryItem: function(inView) {
		var views = this.getViewList();
		while (enyo.indexOf(inView, views) > -1) {
			enyo.remove(inView, views);
		}
		if (inView == this.lastView) {
			this.lastView = this.history[this.history.length-1] || 0;
		}
	},
	backHandler: function(inSender, inEvent) {
		this.back(inEvent);
	},
	//* @public
	/**
		Pane maintains a history of selected views in the history property.
		The back method selects the previous view in the history.
	*/
	back: function(e) {
		if (this.history.length) {
			e && e.preventDefault();
			// transition to the first different history view
			var vi = this.indexOfView(this.view);
			do {
				var p = this.history.pop();
			} while (p == vi);
			if (p >= 0) {
				this._selectViewBack(this.viewByIndex(p));
			}
		}
	},
	/**
		Pane maintains a history of selected views in the history property.
		The next method selects the next view in the history. This method is
		typically called in conjunction with back.
	*/
	next: function() {
		this.selectViewByIndex((this.indexOfView(this.view) + 1) % this.getViewCount());
	}
});
