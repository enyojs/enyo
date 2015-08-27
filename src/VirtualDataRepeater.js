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

		var refresh = this.bindSafely(function() {
			this.doIt();
		});

		// refresh is used as the event handler for
		// collection resets so checking for truthy isn't
		// enough. it must be true.
		if(immediate === true) {
			refresh();
		} else {
			this.startJob('refreshing', refresh, 16);
		}
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
			s;

		if (pMod !== model) {
			child.set('model', model);
			s = this.isSelected(model);
			child.set('selected', s);
			child.addRemoveClass(sc, s);
		}

		if (pIdx !== index) {
			child.set('index', index);
			this.childrenByIndex[index] = child;
			if (this.childrenByIndex[pIdx] === child) {
				this.childrenByIndex[pIdx] = null;
			}
		}

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
			omL = om.length,
			om2 = this.orderedModels_alt,
			n = this.numItems,
			needed = this.needed,
			b = this.bullpen,
			i, idx, m, ci, c, nNeeded, j, ln;
		for (i = 0; i < n; ++i) {
			idx = f + i;
			m = dd.at(idx);
			if (m) {
				ci = omL ? om.indexOf(m) : -1;
				if (ci >= 0) {
					c = o[ci];
					o.splice(ci, 1);
					om.splice(ci, 1);
					o2.push(c);
					this.assignChild(m, idx, c);
				}
				else {
					needed.push(i);
				}
				om2.push(m);
			}
			else {
				break;
			}
		}
		nNeeded = needed.length;
		for (j = 0; j < nNeeded; ++j) {
			i = needed[j];
			idx = f + i;
			m = om2[i];
			c = om.pop() && o.pop() || b.pop();
			if (c) {
				this.assignChild(m, idx, c);
			}
			else {
				c = this.createComponent({model: m});
				this.assignChild(m, idx, c);
				// TODO: Rethink child lifecycle hooks (currently deploy / update / retire)
				if (typeof this.deployChild === 'function') this.deployChild(c);
				c.render();
			}
			o2.splice(i, 0, c);
		}
		needed.length = 0;
		while (o.length) {
			c = om.pop() && o.pop();
			c.set('model', null);
			c.hide();
			b.push(c);
		}
		this.orderedChildren = o2;
		this.orderedChildren_alt = o;
		this.orderedModels = om2;
		this.orderedModels_alt = om;
		ln = o2.length;
		if (ln) {
			o2[0].addClass('enyo-vdr-first');
			o2[ln - 1].addClass('enyo-vdr-last');
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
