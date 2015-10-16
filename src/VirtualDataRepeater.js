require('enyo');

/**
* Contains the declaration for the {@link module:enyo/VirtualDataRepeater~VirtualDataRepeater} kind.
* @module enyo/VirtualDataRepeater
*/

var
	kind = require('./kind');

var
	DataRepeater = require('./DataRepeater');

/**
* @class VirtualDataRepeater
* @extends module:enyo/DataRepeater~DataRepeater
* @public
*/
module.exports = kind({
	name: 'enyo.VirtualDataRepeater',
	kind: DataRepeater,
	numItems: 10,
	first: 0,
	// TODO: Decide whether we want to implement node reordering
	// reorderNodes: false,

	reset: function () {
		this.init();
		this.destroyClientControls();
		this.setExtent();
	},

	init: function () {
		this.orderedChildren = [],
		this.orderedChildren_alt = [],
		this.childrenByIndex = {},
		this.orderedModels = [],
		this.orderedModels_alt = [],
		this.needed = [],
		this.bullpen = [],
		this.hasInitialized = true;
	},

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
	
	refresh: function (immediate) {
		if (!this.hasInitialized) return this.reset();

		this.stabilizeExtent();

		this.doIt();
	},

	childForIndex: function(idx) {
		return this.childrenByIndex[idx];
	},

	childForModel: function(model) {
		var idx = this.orderedModels.indexOf(model);
		return this.orderedChildren[idx];
	},

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
			cbi = this.childrenByIndex,
			i, idx, m, ci, c, nNeeded, j, len2;
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
		// First, if we have fewer children than we had before,
		// we need to remove stale entries from our index
		for (i = len2; i < len; i++) {
			cbi[i] = null;
		}
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

	fwd: function() {
		this.set('first', this.first + 1);
	},
	
	bak: function() {
		this.set('first', this.first - 1);
	},

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

	dataChanged: function() {
		if (this.get('data') && this.hasRendered) {
			this.reset();
		}
	}
});
