//*@public
/**
	_enyo.DataList_ is an [enyo.DataRepeater](#enyo.DataRepeater) that employs a
	paginated scrolling scheme to enhance performance with larger datasets. The
	data is provided to the DataList by an [enyo.Collection](#enyo.Collection) set
	as the value of its _collection_ property.

	Note that care should be taken when deciding how to lay out the list's
	children. When there are a large number of child elements, the layout process
	can be taxing and non-performant for the browser. Avoid	dynamically-updated
	layouts that require lots of calculations each time the data in a view is
	updated. Try to use CSS whenever possible.

	While paging through data, _enyo.DataList_ emits the _paging_ event, which
	allows you to make updates on a per-page basis, as necessary. You may register
	for this event by calling _addListener()_ and specifying the event, along with
	a callback method.

	The callback method is passed a reference to the _enyo.DataList_, the name of
	the event (_"paging"_), and a hash with the properties _start_, _end_, and
	_action_, referring to the lowest active index in the dataset, the highest
	active index, and the action that triggered the paging, respectively. The
	value of _action_ value may be either _"scroll"_ or _"reset"_.
*/
enyo.kind({
	name: "enyo.DataList",
	kind: enyo.DataRepeater,
	/**
		_enyo.DataList_ places its rows inside of a scroller. Any configurable
		options of _enyo.Scroller_ may be placed in this hash; their values will be
		set accordingly on this list's scroller. If no options are specified, the
		default _enyo.Scroller_ settings are used.
	*/
	scrollerOptions: null,
	/**
		The paging orientation. Valid values are _"vertical"_ and _"horizontal"_.
		This property will be mapped to a particular strategy governing how the list
		will flow.
	*/
	orientation: "vertical",
	/**
		This is typically handled automatically, but some platforms may benefit from
		having a larger or smaller value here. If there is a number here, it will be
		multiplied by the available viewport size (depending on orientation) to
		determine the minimum page size. The page size is directly related to the
		number of controls that are generated at any given time (and that
		subsequently need updating) whenever paging occurs. This number may be any
		rational number greater than _1.2_.
	*/
	pageSizeMultiplier: null,
	/**
		It is helpful for performance if the list doesn't need to guess at the size of
		the children. In cases where all children are a fixed height/width (depending on
		the orientation of the list) you may explicitly define that value for the list
		to use and bypass much of its guesswork. This value is a number that will be interpreted
		in pixels and applied to the primary size depending on orientation: _height_ when
		_vertical_ and _width_ when _horizontal_. Note this value is not applied to the
		children via CSS by the list.
	*/
	fixedChildSize: null,
	/**
		To disable the default smoothing-transitions (for supported platforms), set
		this flag to false.
	*/
	allowTransitions: true,
	/**
		Because some systems perform poorly on initialization, there is a delay when
		we attempt to actually draw the contents of a DataList. Usually, you will
		not need to adjust this value (expressed in milliseconds). If _renderDelay_
		is null, there will be no delay and rendering will take place synchronously.
		If _renderDelay_ is set to 0, rendering will be done asynchronously.
	*/
	renderDelay: 250,
	/**
		Completely resets the current list such that it scrolls to the top of the
		scrollable region and regenerates all of its children. This is typically
		necessary only on initialization or if the entire dataset has been swapped
		out.
	*/
	reset: function () {
		if (this.get("absoluteShowing")) {
			// we can only reset if we've already rendered
			if (this.generated && this.$.scroller.generated) {
				this.delegate.reset(this);
			}
		} else {
			this._addToShowingQueue("reset", this.reset);
		}
	},
	/**
		Unlike _reset()_, which tears down and regenerates the entire list, this
		method attempts to refresh the pages as they are against the current
		dataset. This is much cheaper to call than _reset()_, but is primarily used
		internally.
	*/
	refresh: function () {
		if (this.get("absoluteShowing")) {
			if (this.hasRendered) {
				this.delegate.refresh(this);
			}
		} else {
			this._addToShowingQueue("refresh", this.refresh);
		}
	},
	/**
		Pass in an integer within the bounds of the lists's collection to scroll to
		the position of that index in the list.
	*/
	scrollToIndex: function (idx) {
		var len = this.collection? this.collection.length: 0;
		if (idx >= 0 && idx < len) {
			if (this.get("absoluteShowing")) {
				this.delegate.scrollToIndex(this, idx);
			} else {
				this._addToShowingQueue("scrollToIndex", function () {
					this.delegate.scrollToIndex(this, idx);
				});
			}
		}
	},
	//*@protected
	constructor: enyo.inherit(function (sup) {
		return function () {
			sup.apply(this, arguments);
			this.metrics       = {};
			this.metrics.pages = {};
			if (this.pageSizeMultiplier !== null && !isNaN(this.pageSizeMultiplier)) {
				this.pageSizeMultiplier = Math.max(1.2, this.pageSizeMultiplier);
			}
		};
	}),
	create: enyo.inherit(function (sup) {
		return function () {
			// if we can, we use transitions
			this.allowTransitionsChanged();
			// map the selected strategy to the correct delegate for operations
			// on the list, default to _vertical_ if none is provided or if it
			// could not be found
			this.delegate = this.ctor.delegates[this.orientation] || this.base.delegates.vertical;
			// if the delegate has an initialization routine execute it now before the
			// container and children are rendered
			if (this.delegate.initList) {
				this.delegate.initList(this);
			}
			sup.apply(this, arguments);
			// initialize the _pages_ array and add the pages to it
			this.pages = [this.$.page1, this.$.page2];
		};
	}),
	render: enyo.inherit(function (sup) {
		return function () {
			this.$.scroller.canGenerate = false;
			this.$.scroller.teardownRender();
			sup.apply(this, arguments);
		};
	}),
	/**
		Attempts to perform initialization. There are only a few basic startup
		paths, but we need to be aware of what they are:

		* The view is rendered, it has a collection, and the collection has data.
		* The view is rendered, it has a collection with no data, and data is added
			later.
		* The view is rendered, but has no collection.

		Once the list itself is rendered, we check to see if we have a collection;
		if so, do we have any data to start rendering the rest of the list?
		Ultimately, the implementation decisions are decided by the delegate
		strategy.
	*/
	rendered: function () {
		if (this.get("absoluteShowing")) {
			// actually rendering a datalist can be taxing for some systems so
			// we arbitrarily delay showing for a fixed amount of time unless delay is
			// null in which case it will be executed immediately
			var startup = function () {
				// now that the base list is rendered, we can safely generate our scroller
				this.$.scroller.canGenerate = true;
				this.$.scroller.render();
				// and now we hand over the action to our strategy to let it initialize the
				// way it needs to
				this.delegate.rendered(this);
				this.hasRendered = true;
				// now add our class to adjust visibility (if no overridden)
				this.addClass("rendered");
				if (this.didRender) {
					this.didRender();
				}
			};
			if (this.renderDelay === null) {
				startup.call(this);
			} else {
				this.startJob("rendering", startup, this.renderDelay);
				// this delay will allow slower systems to keep going and get everything else
				// on screen before worrying about setting up the list
			}
		} else {
			this._addToShowingQueue("rendered", this.rendered);
		}
	},
	//*@protected
	_absoluteShowingChanged: function () {
		if (this.get("absoluteShowing")) {
			if (this._showingQueue && this._showingQueue.length) {
				var queue = this._showingQueue;
				var methods = this._showingQueueMethods;
				var fn;
				var name;
				this._showingQueue = null;
				this._showingQueueMethods = null;
				do {
					name = queue.shift();
					fn = methods[name];
					fn.call(this);
				} while (queue.length);
			}
		}
	},
	_addToShowingQueue: function (name, fn) {
		var queue = this._showingQueue || (this._showingQueue = []);
		var methods = this._showingQueueMethods || (this._showingQueueMethods = {});
		var idx = enyo.indexOf(name, queue);
		if (idx >= 0) {
			queue.splice(idx, 1);
		}
		queue.push(name);
		methods[name] = fn;
	},
	/**
		This function intentionally left blank. In DataRepeater, it removes the
		control at the specified index but that is handled by the delegate here.
	*/
	remove: function(index) {},
	//*@public
	/**
		Overloaded to call a method of the delegate strategy.
	*/
	modelsAdded: function (c, e, props) {
		if (c === this.collection && this.$.scroller.canGenerate) {
			if (this.get("absoluteShowing")) {
				this.delegate.modelsAdded(this, props);
			} else {
				this._addToShowingQueue("refresh", function () {
					this.refresh();
				});
			}
		}
	},
	/**
		Overloaded to call a method of the delegate strategy.
	*/
	modelsRemoved: enyo.inherit(function(sup) {
		return function modelsRemoved(c, e, props) {
			if (c === this.collection && this.$.scroller.canGenerate) {
				if (this.get("absoluteShowing")) {
					this.delegate.modelsRemoved(this, props);
				} else {
					this._addToShowingQueue("refresh", function () {
						this.refresh();
					});
				}
			}

			sup.apply(this, arguments);
		};
	}),
	destroy: enyo.inherit(function (sup) {
		return function () {
			if (this.delegate && this.delegate.destroyList) {
				this.delegate.destroyList(this);
			}
			this._showingQueue = null;
			this._showingQueueMethods = null;
			sup.apply(this, arguments);
		};
	}),
	/**
		Overloaded from base kind to ensure that the container options correctly apply
		the scroller options before instantiating it.
	*/
	initContainer: enyo.inherit(function (sup) {
		return function () {
			var o = enyo.clone(this.get("containerOptions")),
				s = this.get("scrollerOptions");
			if (s) { enyo.mixin(o, s, {exists: true}); }
			this.set("containerOptions", o);
			sup.apply(this, arguments);
		};
	}),
	/**
		We let the delegate strategy manage the event, but we arbitrarily return
		true because we don't want the event to propagate beyond this kind.
	*/
	didScroll: function (sender, event) {
		if (this.hasRendered && this.collection) {
			if (this.heightNeedsUpdate || this.widthNeedsUpdate) {
				// assign this here so that if for any reason it needs to
				// it can reset it
				this.heightNeedsUpdate = this.widthNeedsUpdate = false;
				this.refresh();
			}
			this.delegate.didScroll(this, event);
		}
		return true;
	},
	/**
		Special override to handle resizing in an attempt to minimize the amount of
		work we're doing. We don't want to waterfall the event to all children, so
		we hijack the normal handler.
	*/
	didResize: function (sender, event) {
		if (this.get("absoluteShowing")) {
			if (this.hasRendered && this.collection) {
				if (this.heightNeedsUpdate || this.widthNeedsUpdate) {
					// assign this here so that if for any reason it needs to
					// it can reset it
					this.heightNeedsUpdate = this.widthNeedsUpdate = false;
					this.refresh();
				}
				this.delegate.didResize(this, event);
			}
		} else {
			this._addToShowingQueue("didResize", this.didResize);
		}
	},
	showingChangedHandler: enyo.inherit(function (sup) {
		return function (inSender, inEvent) {
			this.set("absoluteShowing", this.getAbsoluteShowing(true));
			
			return sup.apply(this, arguments);
		};
	}),
	/**
		Overload to adjust the root method to be able to find the nested child
		based on the requested index if its page is currently active. Returns
		undefined if the index is out of bounds or if the control is not currently
		available.

		Also see _getChildForIndex()_, which calls this method.
	*/
	childForIndex: function (i) {
		return this.delegate.childForIndex(this, i);
	},
	//*@protected
	allowTransitionsChanged: function () {
		this.addRemoveClass("transitions", this.allowTransitions);
	},
	/**
		_enyo.DataList_ uses an overloaded container from its base kind. We set the
		container to a scroller and provide a way to modify the scroller options
		(via the _scrollerOptions_ hash). All children will reside in one of the two
		pages owned by the scroller.
	*/
	containerOptions: {name: "scroller", kind: "enyo.Scroller", components: [
		{name: "active", classes: "active", components: [
			{name: "page1", classes: "page page1"},
			{name: "page2", classes: "page page2"},
			{name: "buffer", classes: "buffer"}
		]}
	], canGenerate: false, classes: "enyo-fit enyo-data-list-scroller"},
	//* We access this kind's constructor and need it to be undeferred at that time.
	noDefer: true,
	absoluteShowing: true,
	//* All of the CSS is relative to this class.
	classes: "enyo-data-list",
	//* Our initial _controlParent_ is us for the _flyweighter_ child.
	controlParentName: "",
	//* Of course we set our container to _scroller_ as needed by the base kind.
	containerName: "scroller",
	/**
		We have to trap the Enyo-generated _onScroll_ event and let the delegate
		handle it. We also need to catch the _onresize_ events so we know when to
		update our cached sizing. We overload the default handler so that we don't
		waterfall the resizing; we arbitrarily handle it to minimize the amount of
		work we do.
	*/
	handlers: {onScroll: "didScroll", onresize: "didResize"},
	observers: {_absoluteShowingChanged: ["absoluteShowing"]},
	//* Add the RegisteredEventSupport mixin for the paging event
	mixins: [enyo.RegisteredEventSupport],
	//* All delegates are named elsewhere but are stored in these statics.
	statics: {delegates: {}},
	//* An array of the actual _page_ references for easier access.
	pages: null
});
//*@protected
/**
	All subclasses of _enyo.DataList_ will have their own _delegates_ static hash.
	This is per _kind_, not per _instance_.
*/
enyo.DataList.subclass = function (ctor) {
	ctor.delegates = enyo.clone(ctor.prototype.base.delegates || this.delegates);
};
