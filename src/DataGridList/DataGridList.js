require('enyo');

/**
* Contains the declaration for the {@link module:enyo/DataGridList~DataGridList} kind.
* @module enyo/DataGridList
*/

var
	kind = require('../kind');
var
	DataList = require('../DataList'),
	VerticalGridDelegate = require('../VerticalGridDelegate');

/**
* {@link module:enyo/DataGridList~DataGridList} is a paginated {@link module:enyo/DataList~DataList} designed to lay out
* its children in a grid. Like `DataList`, it links its children directly to the
* underlying records in the collection specified as its collection.
*
* Because the layout is arbitrarily handled, spacing of children must be set using
* the kind's available API (e.g., with the [spacing]{@link module:enyo/DataGridList~DataGridList#spacing},
* [minWidth]{@link module:enyo/DataGridList~DataGridList#minWidth}, and
* [minHeight]{@link module:enyo/DataGridList~DataGridList#minHeight} properties).
* 
* Note that `DataGridList` will attempt to grow or shrink the size of its
* children in order to keep them evenly spaced.
*
* @class DataGridList
* @extends module:enyo/DataList~DataList
* @ui
* @public
*/
var DataGridList = module.exports = kind(
	/** @lends module:enyo/DataGridList~DataGridList.prototype */ {

	/**
	* @private
	*/
	name: 'enyo.DataGridList',

	/**
	* @private
	*/
	kind: DataList,

	/**
	* The spacing (in pixels) between elements in the [grid list]{@link module:enyo/DataGridList~DataGridList}. It 
	* should be an even number, or else it will be coerced into one for consistency. This is the
	* exact spacing to be allocated on all sides of each item.
	*
	* @type {Number}
	* @default 10
	* @public
	*/
	spacing: 10,

	/**
	* The minimum width (in pixels) for each [grid]{@link module:enyo/DataGridList~DataGridList} item. 
	* Grid items will not be collapsed beyond this size, but they may be proportionally
	* expanded.
	*
	* @type {Number}
	* @default 100
	* @public
	*/
	minWidth: 100,

	/**
	* The minimum height (in pixels) for each [grid]{@link module:enyo/DataGridList~DataGridList} item. 
	* Grid items will not be collapsed beyond this size, but they may be proportionally
	* expanded.
	*/
	minHeight: 100,

	/**
	* While {@link module:enyo/DataList~DataList} provides some generic [delegates]{@glossary delegate} for
	* handling [objects]{@glossary Object}, we have to arbitrarily lay out our children, so
	* we have our own. We add these and ensure that the appropriate delegate is selected
	* depending on the request.
	*
	* @method
	* @private
	*/
	constructor: kind.inherit(function (sup) {
		return function () {
			var o = this.orientation;
			// this will only remap _vertical_ and _horizontal_ meaning it is still possible to
			// add others easily
			this.orientation = (o == 'vertical'? 'verticalGrid': (o == 'horizontal'? 'horizontalGrid': o));
			var s = this.spacing;
			// ensure that spacing is set to an even number or zero
			this.spacing = (s % 2 === 0? s: Math.max(s-1, 0));
			return sup.apply(this, arguments);
		};
	}),
	/**
	* Ensures that each item being created for the [DataGridList]{@link module:enyo/DataGridList~DataGridList}
	* has the correct CSS classes so it will display properly (and be movable, since the items
	* must be absolutely positioned).
	*
	* @method
	* @private
	*/
	initComponents: kind.inherit(function (sup) {
		return function () {
			sup.apply(this, arguments);
			// note we wait until after the container and its children have been created
			// so these default properties will only apply to the real children of the grid
			var d = this.defaultProps,
				c = ' item';
			d.classes = (d.classes || '') + c;
		};
	}),
	/**
	* We don't want to worry about the normal required handling when `showing` changes
	* unless we're actually visible and the list has been fully rendered and we actually
	* have some data.
	*
	* @method
	* @private
	*/
	showingChanged: kind.inherit(function (sup) {
		return function () {
			sup.apply(this, arguments);
			var len = this.collection? this.collection.length: 0;
			if (this.$.scroller.generated && len && this.showing) {
				// avoid the default handler and call the event handler method
				// designated by `enyo.DataList`
				this.didResize();
			}
		};
	}),

	/** 
	* We access this [kind's]{@glossary kind} [constructor]{@glossary constructor}
	* and need it to be undeferred at that time.
	*
	* @private
	*/

	
	/**
	* All of the CSS is relative to this class.
	*
	* @private
	*/
	classes: 'enyo-data-grid-list',

	// Accessibility

	/**
	* @default grid
	* @type {String}
	* @see enyo/AccessibilitySupport~AccessibilitySupport#accessibilityRole
	* @public
	*/
	accessibilityRole: 'grid'
});

DataGridList.delegates.verticalGrid = VerticalGridDelegate;
