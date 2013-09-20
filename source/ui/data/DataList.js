//*@public
/**
	_enyo.DataList_ is an <a href="#enyo.DataRepeater">enyo.DataRepeater</a>
	that employs a paginated scrolling scheme to enhance performance with larger
	datasets. The data is provided to the _enyo.DataList_ from an _enyo.Collection_
	set as its `controller` property.

	Note that, care should be taken when deciding how the children of the list
	will be laid out. When updating the layout of child elements, when there are many,
	can be taxing and non-performant for the browser. Do not use dynamicly updated
	layouts that require many calculations whenever the data will be updated in a view.
	Try using CSS whenever possible.

	Note that _enyo.DataList_ currently does not support horizontal orientation.
*/
enyo.kind({
	name: "enyo.DataList",
	kind: enyo.DataRepeater,
	/**
		The _enyo.DataList_ kind places its rows inside of a scroller. Any
		configurable options associated with an _enyo.Scroller_ may be
		placed in this hash and will be set accordingly on the scroller
		for this list. If no options are specified, the default _enyo.Scroller_
		settings are used.
	*/
	scrollerOptions: null,
	/**
		The paging orientation. Valid values are `vertical` and `horizontal`. This property
		will be mapped to a particular strategy for how the _list_ will flow.
	*/
	orientation: "vertical",
	/**
		This is the upper bound for children to generate for each page. This can be modified as
		needed since some platforms perform better with more (leading to larger page) or fewer
		(leading to smaller page) active controls at a time. If fewer than this number of children
		should be generated it will only generate as many as are needed. For collections of smaller
		control's this number may need to be increased as each page should measure larger than the
		container so paging can be smooth.
	*/
	controlsPerPage: 20,
	/**
		Completely reset the current list such that it will scroll to the top of the
		scrollable region and regenerate all of its children. This is typically only necessary
		once on initialization or if the entire dataset has been swapped out.
	*/
	reset: function () {
		// we can only reset if we've already rendered
		if (this.generated && this.$.scroller.generated) {
			this.delegate.reset(this);
		}
	},
	/**
		Unlike `reset` that will teardown and regenerate the entire list this
		method will attempt to refresh the pages as they are against the current dataset.
		This is a much cheaper method than `reset` but is primarily used internally.
	*/
	refresh: function () {
		this.delegate.refresh(this);
	},
	//*@protected
	constructor: enyo.inherit(function (sup) {
		return function () {
			sup.apply(this, arguments);
			this.metrics = {};
			this.metrics.pages = {};
		};
	}),
	create: enyo.inherit(function (sup) {
		return function () {
			// map the selected strategy to the correct delegate for operations
			// on the list, default to _vertical_ if none is provided or if it
			// could not be found
			this.delegate = this.ctor.delegates[this.orientation] || this.base.delegates.vertical;
			// if the delegate has an initialization routine execute it now before the
			// container and children are rendered
			if (this.delegate.initList) { this.delegate.initList(this); }
			sup.apply(this, arguments);
			// initialize the _pages_ array and add the pages to it
			this.pages = [this.$.page1, this.$.page2];
			this.createChrome([{name: "flyweighter", canGenerate: false, owner: this}]);
		};
	}),
	/**
		Here is where we attempt to do initialization. There are only a few root startup
		paths but we have to be aware of them. The view is rendered, it has a controller, and
		the controller has data, the view is rendered, it has a controller that has no data
		and data is added later, the view is rendered, has no controller. Once the list itself
		is rendered we check to see if we have a controller, and if so, do we have any data
		to start rendering the rest of the list. Ultimately the implementation decisions are
		decided by the delegate strategy.
	*/
	rendered: function () {
		// now that the base list is rendered we can safely generate our scroller
		this.$.scroller.canGenerate = true;
		this.$.scroller.render();
		// and now we hand over the action to our strategy to let it initialize the
		// way it needs to
		this.delegate.rendered(this);
	},
	/**
		Overloaded to call a method of the delegate strategy.
	*/
	modelsAdded: function (c, e, props) {
		if (c === this.controller && this.$.scroller.canGenerate) { this.delegate.modelsAdded(this, props); }
	},
	/**
		Overloaded to call a method of the delegate strategy.
	*/
	modelsRemoved: function (c, e, props) {
		if (c === this.controller && this.$.scroller.canGenerate) { this.delegate.modelsRemoved(this, props); }
	},
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
		We let the delegate strategy manage the event but we arbitrarily return true
		because we don't want the event propagating beyond this kind.
	*/
	didScroll: function (sender, event) {
		this.delegate.didScroll(this, event);
		return true;
	},
	/**
		Special override to handle resizing to try and minimize the amount of work
		that we're doing. We don't want to waterfall the event to all children so
		we hijack the normal handler.
	*/
	didResize: function (sender, event) {
		this.startJob("resizing", function () {
			this.delegate.didResize(this, event);
		}, 60);
	},
	/**
		Overload to adjust the root method to be able to find the nested child
		based on the requested index.
	*/
	getChildForIndex: function (i) {
		return this.delegate.childForIndex(this, i);
	},
	//*@protected
	/**
		The _enyo.DataList_ kind uses an overloaded container from its base kind. We set
		the container to a scroller and provide a way of modifying those scroller options
		(via the `scrollerOptions` hash). All children will reside in one of the 2 pages
		owned by the scroller.
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
		We have to trap the enyo-generated _onScroll_ event and let the delegate handle it. We
		also need to catch the _onresize_ events so that we know when to update our cached sizing,
		also we overload the default handler so we don't waterfall the resizing we arbitrarily
		handle it to minimize the amount of work we do.
	*/
	handlers: {onScroll: "didScroll", onresize: "didResize"},
	//* All delegates are named elsewhere but are stored in these statics.
	statics: {delegates: {}},
	//* An array of the actual _page_ references for easier access.
	pages: null
});
//*@protected
/**
	All subclasses of _enyo.DataList_ will have the `delegates` static hash of their
	own, this is _per kind_ not _per instance_.
*/
enyo.DataList.subclass = function (ctor, props) {
	ctor.delegates = enyo.clone(ctor.prototype.base.delegates || this.delegates);
};
