require('enyo');

/**
* Contains the declaration for the {@link module:enyo/VirtualDataRepeater~VirtualDataRepeater} kind.
*
* @wip
* @public
* @module enyo/VirtualDataRepeater
*/

var
	kind = require('./kind');

var
	DataRepeater = require('./DataRepeater');

/**
* Like {@link module:enyo/DataRepeater~DataRepeater},
* {@link module:enyo/VirtualDataRepeater~VirtualDataRepeater} repeats the
* {@link module:enyo/Control~Control} provided in the `components` block over
* the elements of the data set provided in the `collection` property (which
* may be an instance of {@link module:enyo/Collection~Collection} or a plain
* old JavaScript array).
*
* However, unlike {@link module:enyo/DataRepeater~DataRepeater},
* {@link module:enyo/VirtualDataRepeater~VirtualDataRepeater} only generates
* children for a given range of items in the provided collection.
*
* To specify the range of items to be generated, provide the initial index via
* the `first` property and the maximum number of items to generate via the
* `numItems` property. The repeater will refresh automatically when you change
* either of these properties.
*
* @class VirtualDataRepeater
* @extends module:enyo/DataRepeater~DataRepeater
* @wip
* @public
*/
module.exports = kind(
	/** @lends module:enyo/VirtualDataRepeater~VirtualDataRepeater.prototype */ {
	name: 'enyo.VirtualDataRepeater',
	kind: DataRepeater,
	/**
	* The maximum number of items to generate. Fewer items will be
	* generated if the provided collection does not contain enough
	* elements (that is, if the length of the collection minus
	* the `first` index is less than `numItems`).
	*
	* @type {Number}
	* @default 10
	* @public
	*/
	numItems: 10,
	/**
	* The zero-based index of the provided collection from which
	* the repeater should start repeating children. This property will
	* be coerced to a legal value if you provide a value that is outside
	* the range of the collection.
	*
	* @type {Number}
	* @default 0
	* @public
	*/
	first: 0,
	// TODO: Decide whether we want to implement node reordering
	// reorderNodes: false,

	// Not including JSDoc info here, as we want the inherited doc to be used.
	reset: function () {
		// If we are showing, go ahead and reset...
		if (this.getAbsoluteShowing()) {
			this.init();
			this.destroyClientControls();
			this.setExtent();
			if (this._needsReset) {
				// Now that we've done our deferred reset, we
				// can become visible again
				this.applyStyle('visibility', 'visible');
				this._needsReset = false;
			}
		}
		// If we aren't showing, defer the reset until we are shown again
		else {
			// Because our state will be stale by the time we reset, become invisible
			// to avoid briefly "flashing" the stale state when we are shown
			this.applyStyle('visibility', 'hidden');
			this._needsReset = true;
		}
	},

	/**
	* @private
	*/
	init: function () {
		this.orderedChildren = [],
		this.orderedChildren_alt = [],
		this.childrenByIndex = [],
		this.orderedModels = [],
		this.orderedModels_alt = [],
		this.needed = [],
		this.bullpen = [],
		this.hasInitialized = true;
	},

	/**
	* @private
	*/
	setExtent: function(first, numItems) {
		var pf = this.first,
			pn = this.numItems;
		if (typeof first === 'number') {
			this.first = first;
		}
		if (typeof numItems === 'number') {
			this.numItems = numItems;
		}
		if (this.collection) {
			this.stabilizeExtent();
			if (!this.hasInitialized) {
				this.init();
			}
			this.doIt();
		}
		if (this.first !== pf) {
			this.notify('first', pf, this.first);
		}
		if (this.numItems !== pn) {
			this.notify('numItems', pn, this.numItems);
		}
	},

	// Not including JSDoc info here, as we want the inherited doc to be used.
	refresh: function (immediate) {
		// If we haven't initialized, we need to reset instead
		if (!this.hasInitialized) return this.reset();

		// If we're being called as the handler for a collection reset,
		// note that so we can do extra stuff as needed
		if (arguments[1] === 'reset' && typeof this.collectionResetHandler === 'function') {
			this._needsToHandleCollectionReset = true;
		}

		// For performance reasons, it's better to refresh asynchronously most
		// of the time, so we put the refresh logic in a function we can async
		var refresh = this.bindSafely(function () {
			// If we are showing, go ahead and refresh...
			if (this.getAbsoluteShowing()) {
				this.stabilizeExtent();
				this.doIt();
				// If we need to do anything to respond to the collection
				// resetting, now's the time
				if (this._needsToHandleCollectionReset) {
					this.collectionResetHandler();
					this._needsToHandleCollectionReset = false;
				}
				if (this._needsRefresh) {
					// Now that we've done our deferred refresh, we
					// can become visible again
					this.applyStyle('visibility', 'visible');
					this._needsRefresh = false;
				}
			}
			// If we aren't showing, defer the refresh until we are shown again
			else {
				// Because our state will be stale by the time we refresh, become invisible
				// to avoid briefly "flashing" the stale state when we are shown
				this.applyStyle('visibility', 'hidden');
				this._needsRefresh = true;
			}
		});

		// refresh is used as the event handler for
		// collection resets so checking for truthy isn't
		// enough. it must be true.
		if (immediate === true) {
			refresh();
		}
		else {
			// TODO: Consider the use cases and the reasons why
			// we're making this async, and decide whether it makes
			// sense to delay more than 16ms. In particular, in cases
			// where the benefit of async'ing comes from debouncing, it
			// may be that 16ms is not enough on slower hardware.
			this.startJob('refreshing', refresh, 16);
		}
	},

	/**
	* @private
	*/
	showingChangedHandler: kind.inherit(function (sup) {
		return function () {
			// If we have deferred a reset or a refresh,
			// take care of it now that we're showing again
			if (this._needsReset) {
				this.reset();
			}
			else if (this._needsRefresh) {
				this.refresh();
			}
			return sup.apply(this, arguments);
		};
	}),

	// Not including JSDoc info here, as we want the inherited doc to be used.
	childForIndex: function(idx) {
		return this.childrenByIndex[idx];
	},

	/**
	* Attempts to return the [control]{@link module:enyo/Control~Control} representation of a particular
	* model (which may be an instance of [enyo/Model]{@link module:enyo/Model~Model} or a plain old
	* JavaScript object).
	*
	* @param {Number} idx - The model whose [control]{@link module:enyo/Control~Control} you want to retrieve.
	* @returns {module:enyo/Control~Control|undefined} The [control]{@link module:enyo/Control~Control} representing
	* the specified model, or `undefined` if there is not currently a control representing the model.
	* @public
	*/
	childForModel: function(model) {
		var idx = this.orderedModels.indexOf(model);
		return this.orderedChildren[idx];
	},

	/**
	* @private
	*/
	assignChild: function(model, index, child) {
		var pMod = child.model,
			pIdx = child.index,
			sc = child.selectedClass || 'selected',
			cbi = this.childrenByIndex,
			s;

		if (pMod !== model) {
			child.set('model', model);
			s = this.isSelected(model);
			child.set('selected', s);
			child.addRemoveClass(sc, s);
		}

		if (pIdx !== index) {
			child.set('index', index);
		}

		cbi[index] = child;

		child.removeClass('enyo-vdr-first');
		child.removeClass('enyo-vdr-last');
		child.show();
	},

	/**
	* @private
	*/
	doIt: function() {
		var dd = this.get('data'),
			f = this.first,
			o = this.orderedChildren,
			o2 = this.orderedChildren_alt,
			om = this.orderedModels,
			om2 = this.orderedModels_alt,
			len = om.length,
			n = this.numItems,
			needed = this.needed,
			b = this.bullpen,
			i, idx, m, ci, c, nNeeded, j, len2;

		// Clear our index, which we'll rebuild as we assign children
		this.childrenByIndex.length = 0;

		// Walk up from the first index through the
		// last and make sure that a child is assigned
		// for each
		for (i = 0; i < n; ++i) {
			idx = f + i;
			// Get our model
			m = dd.at(idx);
			if (m) {
				// If we already have a child with the model
				// we need, reuse it
				ci = len ? om.indexOf(m) : -1;
				if (ci >= 0) {
					c = o[ci];
					o.splice(ci, 1);
					om.splice(ci, 1);
					o2.push(c);
					this.assignChild(m, idx, c);
				}
				else {
					// Otherwise, remember that we need to grab
					// or create a child for this model
					needed.push(i);
				}
				om2.push(m);
			}
			else {
				break;
			}
		}
		nNeeded = needed.length;
		// If we have any models that we need to produce children
		// for, do it now
		for (j = 0; j < nNeeded; ++j) {
			i = needed[j];
			idx = f + i;
			m = om2[i];
			// Reuse an existing child if we have one, checking
			// just-decommissioned children first and then children
			// previously placed in the bullpen
			c = om.pop() && o.pop() || b.pop();
			if (c) {
				this.assignChild(m, idx, c);
			}
			else {
				// If we don't have a child on hand, we create a new one
				c = this.createComponent({model: m});
				this.assignChild(m, idx, c);
				// TODO: Rethink child lifecycle hooks (currently deploy / update / retire)
				if (typeof this.deployChild === 'function') this.deployChild(c);
				c.render();
			}
			// Put the newly assigned child in the right place in
			// the new orderedChildren array
			o2.splice(i, 0, c);
		}
		// If we have unused children hanging around, make
		// them wait in the bullpen
		while (o.length) {
			c = om.pop() && o.pop();
			c.set('model', null);
			c.hide();
			b.push(c);
		}
		// And now some cleanup...
		len2 = o2.length;
		// Reset our "needed" array, so it's ready for next time
		needed.length = 0;
		// Swap in our new ordered arrays for the old ones
		this.orderedChildren = o2;
		this.orderedChildren_alt = o;
		this.orderedModels = om2;
		this.orderedModels_alt = om;
		// If we have any children, tag the first and last ones,
		// and then apply positioning if applicable
		if (len2) {
			o2[0].addClass('enyo-vdr-first');
			o2[len2 - 1].addClass('enyo-vdr-last');
			if (typeof this.positionChildren === 'function') this.positionChildren();
		}
	},

	/**
	* @private
	*/
	fwd: function() {
		this.set('first', this.first + 1);
	},

	/**
	* @private
	*/
	bak: function() {
		this.set('first', this.first - 1);
	},

	// Not including JSDoc info here, as we want the inherited doc to be used.
	set: kind.inherit(function (sup) {
		return function (prop, val) {
			if (prop === 'first') {
				this.setExtent(val);
				return this;
			}
			if (prop === 'numItems') {
				this.setExtent(null, val);
				return this;
			}
			return sup.apply(this, arguments);
		};
	}),

	/**
	* @private
	*/
	stabilizeExtent: function() {
		var f = this.first,
			n = this.numItems,
			c = this.collection,
			l;

		if (c) {
			l = c.length;
			f = Math.min(f, l - n);
			f = this.first = Math.max(f, 0);
			this._last = Math.min(f + n, l) - 1;
		}
	},

	/**
	* @private
	*/
	dataChanged: function() {
		if (this.get('data') && this.hasRendered) {
			this.reset();
		}
	}
});
