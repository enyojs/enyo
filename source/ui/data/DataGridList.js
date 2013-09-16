//*@public
/**
	The _enyo.DataGridList_ kind is a paginated <a href="#enyo.DataList">enyo.DataList</a>
	designed to layout its children in a grid. Like _enyo.DataList_, it links its children
	directly to the underlying _record_ in the _collection_ set as its `controller`. Because
	the layout is arbitrarily handled spacing of children must be set by the available API
	(e.g. `spacing`, `minWidth`, `minHeight`) of the _enyo.DataGridList_ kind. Note that the
	behavior of _enyo.DataGridList_ is to attempt to expand/collapse the size of the children
	so they may remain evenly spaced in the given area.
*/
enyo.kind({
	name: "enyo.DataGridList",
	kind: enyo.DataList,
	/**
		The spacing (in pixels) between elements in the grid list. It should be an
		even number, or else it will be coerced into one for consistency.
		This is the exact spacing to be allocated on all sides of each item in total.
	*/
	spacing: 10,
	/**
		The minimum width (in pixels) for each grid item. Grid items will not be
		collapsed beyond this size, but they may be proportionally expanded.
	*/
	minWidth: 100,
	/**
		The minimum height (in pixels) for each grid item. Grid items will not be
		collapsed beyond this size, but they may be proportionally expanded.
	*/
	minHeight: 100,
	//*@protected
	/**
		While _enyo.DataList_ provides some generic delegates for handling objects
		we have to arbitrarily layout our children so we have our own. We add these
		and ensure that the appropriate delegate is selected depending on the request.
	*/
	constructor: enyo.inherit(function (sup) {
		return function () {
			var o = this.orientation;
			// this will only remap _vertical_ and _horizontal_ meaning it is still possible to
			// add others easily
			this.orientation = (o == "vertical"? "verticalGrid": (o == "horizontal"? "horizontalGrid": o));
			var s = this.spacing;
			// ensure that spacing is set to an even number or zero
			this.spacing = (s % 2 === 0? s: Math.max(s-1, 0));
			return sup.apply(this, arguments);
		};
	}),
	/**
		We ensure that each of the items being created for the _DataGridList_ have the correct
		CSS classes so they will display properly (and be movable, since, if they aren't absolutely
		positioned it cannot work).
	*/
	initComponents: enyo.inherit(function (sup) {
		return function () {
			sup.apply(this, arguments);
			// note we wait until after the container and its children have been created
			// so these default properties will only apply to the real children of the grid
			var d = this.defaultProps,
				c = " item";
			d.classes = (d.classes || "") + c;
		};
	}),
	/**
		We don't want to worry about the normal required handling when showing changes unless
		we're actually visible and the list has been fully rendered and we actually have
		some data.
	*/
	showingChanged: enyo.inherit(function (sup) {
		return function () {
			sup.apply(this, arguments);
			if (this.$.scroller.generated && this.length && this.showing) {
				// avoid the default handler and call the event handler method
				// designated by _enyo.DataList_
				this.didResize();
			}
		};
	}),
	//*@protected
	//* We access this kind's constructor and need it to be undeferred at that time.
	noDefer: true,
	//* All of the CSS is relative to this class.
	classes: "enyo-data-grid-list"
});
