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
*/
enyo.kind({
	name: "enyo.DataList",
	kind: enyo.DataRepeater,
	/**
		The _enyo.DataList_ kind will emit a registered event when paging, `paging`,
		so that for per-page updates can be made when necessary. You can register for
		this event by calling _addListener()_ for the `paging` event with a callback.
		The callback method will be passed a reference to the _enyo.DataList_ that is
		paging, the name of the event (`paging`), and hash with the properties `start`,
		`end` and `action` that refer to the lowest active index in the dataset through
		the highest active index and the action that triggered the paging respectively.
		The `action` value can be either 'scroll' or 'reset'.
	*/
	/**
		The _enyo.DataList_ kind places its rows inside of a scroller. Any
		configurable options associated with _enyo.Scroller_ may be placed in this
		hash and will be set accordingly on this list's scroller. If no options are
		specified, the default _enyo.Scroller_ settings are used.
	*/
	scrollerOptions: null,
	/**
		The paging orientation. Valid values are _"vertical"_ and _"horizontal"_.
		This property will be mapped to a particular strategy governing how the list
		will flow.
	*/
	orientation: "vertical",
	/**
		This is typically handled automatically but some platforms may benefit from
		having a larger or smaller value here. If there is a number here it will be
		multiplied by the available viewport size (depending on orientation) to determine
		the minimum page size. The page size is directly related to the number of controls
		that will be generated at any given time (and subsequently needing update)
		whenever paging occurs. This number can be any rational number greater than _1.2_.
	*/
	pageSizeMultiplier: null,
	/**
		To disable the default smoothing-transitions (for supported platforms) set
		this flag to `false`.
	*/
	allowTransitions: true,
	/**
		Because some systems perform poorly on initialization there is a delay when
		attempting to actually draw the contents of a _enyo.DataList_. Usually you
		will not need to adjust this value (ms). If _renderDelay_ is null there will
		be no delay and it will be executed synchronously. Note that if set to 0 it
		will be executed asynchronously.
	*/
	renderDelay: 250,
	/**
		Completely resets the current list such that it scrolls to the top of the
		scrollable region and regenerates all of its children. This is typically
		necessary only on initialization, or if the entire dataset has been swapped
		out.
	*/
	reset: function () {
		// we can only reset if we've already rendered
		if (this.generated && this.$.scroller.generated) {
			this.delegate.reset(this);
		}
	},
	/**
		Unlike _reset()_, which tears down and regenerates the entire list, this
		method attempts to refresh the pages as they are against the current
		dataset. This is much cheaper to call than _reset()_, but is primarily used
		internally.
	*/
	refresh: function () {
		if (this.hasRendered) {
			this.delegate.refresh(this);
		}
	},
	/**
		Pass in an integer within the bounds of the lists's collection to have it
		scroll to the position of that index in the list.
	*/
	scrollToIndex: function (idx) {
		if (idx >= 0 && idx < this.length) {
			this.delegate.scrollToIndex(this, idx);
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
		Attempts to do initialization. There are only a few basic startup paths, but
		we need to be aware of what they are:
		
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
	},
	/**
		Overloaded to call a method of the delegate strategy.
	*/
	modelsAdded: function (c, e, props) {
		if (c === this.collection && this.$.scroller.canGenerate) {
			this.delegate.modelsAdded(this, props);
		}
	},
	/**
		Overloaded to call a method of the delegate strategy.
	*/
	modelsRemoved: function (c, e, props) {
		if (c === this.collection && this.$.scroller.canGenerate) {
			this.delegate.modelsRemoved(this, props);
		}
	},
	destroy: enyo.inherit(function (sup) {
		return function () {
			if (this.delegate && this.delegate.destroyList) {
				this.delegate.destroyList(this);
			}
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
		true Because we don't want the event to propagate beyond this kind.
	*/
	didScroll: function (sender, event) {
		if (this.hasRendered) {
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
		if (this.hasRendered) {
			this.delegate.didResize(this, event);
		}
	},
	/**
		Overload to adjust the root method to be able to find the nested child
		based on the requested index if its page is currently active. Will return
		undefined if the index is out of bounds or if the control is not currently
		available.
	
		Also see [getChildForIndex](#getChildForIndex) which calls this method.
	*/
	childForIndex: function (i) {
		return this.delegate.childForIndex(this, i);
	},
	//*@protected
	allowTransitionsChanged: function () {
		this.addRemoveClass("transitions", this.allowTransitions);
	},
	/**
		The _enyo.DataList_ kind uses an overloaded container from its base kind. We
		set the container to a scroller and provide a way to modify the scroller
		options (via the _scrollerOptions_ hash). All children will reside in one of
		the two pages owned by the scroller.
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
