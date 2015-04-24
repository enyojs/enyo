(function (enyo, scope) {

	var vdrBench = {};

	function getBench (inst) {
		var k = inst.kind;

		return vdrBench[k] || (vdrBench[k] = enyo.dev.bench({name: k, logging: false, autoStart: false}));
	}

	window.vdrReport = function () {
		for (var k in vdrBench) {
			enyo.dev.report(k);
		}
	};

	window.vdrClear = function () {
		for (var k in vdrBench) {
			enyo.dev.clear(k);
			enyo.dev.clear(k);
		}
	};

	enyo.kind({
		name: 'enyo.VirtualDataRepeater',
		kind: 'enyo.DataRepeater',
		numItems: 10,
		first: 0,
		reorderNodes: false,

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

		_tempLogOC: function() {
			var o = this.orderedChildren;

			if (o) {
				return o.reduce(function(cur, child) {
					return cur + child.index + ' ';
				}, '');
			}
		},

		setExtent: function(first, numItems) {
			var pf = this.first,
				pn = this.numItems,
				df, dn;

			// if (this.id.match(/Row2_r/)) this.log(this.id, 'pre', this._tempLogOC());

			if (typeof first === 'number') {
				this.first = first;
			}

			if (typeof numItems === 'number') {
				this.numItems = numItems;
			}

			if (this.collection) {
				this.stabilizeExtent();

				if (this.hasInitialized/* && this.hasRendered*/) {
					df = this.first - pf;
					dn = this.numItems - pn;

					// if (this.id.match(/Row2_r/)) this.log(this.id, 'diff', df, dn);

					// this.adjustHead(df, dn);
				}
				else {
					this.init();
				}

				// TODO: Figure out if we need to guard this...
				// What happens if it's called before we've rendered?
				// if (this.id.match(/Row2_r/)) this.log(this.id, 'post', this._tempLogOC());
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
			var s = this.isSelected(model),
				sc = child.selectedClass || 'selected',
				spc;

			// TODO: Something better. Shouldn't have
			// Spotlight-specific code here.
			spc = enyo.Spotlight && enyo.Spotlight.getCurrent();
			if (spc && child === spc && child.model !== model) {
				enyo.Spotlight.unspot;
			}

			child.set('model', model);
			child.set('index', index);
			child.set('selected', s);
			child.show();

			child.addRemoveClass(sc, s);
			child.removeClass('enyo-vdr-first');
			child.removeClass('enyo-vdr-last');
		},

		doIt: function() {
			var bench = this.bench || (this.bench = getBench(this));
			bench.start();

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
						c.set('index', idx);
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

			bench.stop();
			
			/*// TODO: Something better. Shouldn't have
			// Spotlight-specific code here.
			if (enyo.Spotlight) {
				sp = enyo.Spotlight.getCurrent();
			}

			// TODO: Explore optimizing for direction of change
			for (i = 0; i < e; ++i) {
				idx = f + i;
				c = o[i];
				m = i < n && dd.at(idx);
				if (m) {
					s = this.isSelected(m);
					if (c) {
						if (this.id.match(/Row2_r/)) this.log(this.id, f, n, c.index, idx);

						if (c.model === m && c.index === idx) continue;

						sc = c.selectedClass || 'selected';
						ci[c.index] = null;
						c.set('model', m);
						c.set('index', idx);
						c.addRemoveClass(sc, s);
						c.set('selected', s);
						// TODO: See above.
						if (c === sp) {
							enyo.Spotlight.unspot();
						}
						if (typeof this.updateChild === 'function') this.updateChild(c);
						ci[idx] = c;
					}
					else {
						c = this.createComponent({model: m, index: idx});
						sc = c.selectedClass || 'selected';
						c.addRemoveClass(sc, s);
						c.set('selected', s);
						if (typeof this.deployChild === 'function') this.deployChild(c);
						c.render();
						o.push(c);
						ci[idx] = c;
					}
				}
				else {
					if (typeof this.retireChild === 'function') this.retireChild(c);
					ci[idx] = null;
					if (c) {
						c.destroy();
						if (l === undefined) l = i;
					}
				}
			}
			if (l !== undefined) o.splice(l);

			ln = o.length;
			if (ln) {
				o[0].addClass('enyo-vdr-first');
				o[ln - 1].addClass('enyo-vdr-last');
				
				if (typeof this.positionChildren === 'function') this.positionChildren();
			}*/
		},

		fwd: function() {
			this.set('first', this.first + 1);
		},
		
		bak: function() {
			this.set('first', this.first - 1);
		},

		adjustHead: function(df, dn) {
			var n = this.numItems,
				o = this.orderedChildren,
				m;

			if (o) {
				if (0 < df && df < n) {

					m = o.splice(df);
					if (this.reorderNodes) {
						this.moveNodesDown(o);
					}
					this.orderedChildren = m.concat(o);
				}
				else if (0 > df && -df < n) {
					m = o.splice(n + df);
					if (this.reorderNodes) {
						this.moveNodesUp(m);
					}
					this.orderedChildren = m.concat(o);
				}
			}
		},

		set: enyo.inherit(function (sup) {
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

		firstChanged: function(prev) {
			// this.log(arguments);
			/*this.stabilizeExtent();

			if (this.hasRendered) {
				this.adjustHead(this.first - prev);

				this.refresh(true);
			}*/
		},

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

		/*adjustTail: function(d) {
			var n = this.numItems,
				o = this.orderedChildren,
				m;

			if (0 < d && d < n) {
				m = o.splice(d);
				if (this.reorderNodes) {
					this.moveNodesDown(o);
				}
				this.orderedChildren = m.concat(o);
			}
			else if (0 > d && -d < n) {
				m = o.splice(n + d);
				if (this.reorderNodes) {
					this.moveNodesUp(m);
				}
				this.orderedChildren = m.concat(o);
			}
		},*/

		numItemsChanged: function(prev) {
			// this.log(arguments);
			/*var f = this.first,
				n = this.numItems,
				c = this.collection,
				o = this.orderedChildren,
				l, d;

			if (c) {
				l = c.length;
				n = Math.min(n, l - f);
				this._last = Math.min(f + n, l) - 1;

				d = this.numItems - prev;
				if (d > 0) {

				}

				// this.adjustTail(this.numItems - prev);


				this.refresh();
			}*/
			/*if (this.data && this.hasRendered) {
				this.refresh(true);
			}*/
		},

		moveNodesDown: function(nodes) {
			var i;

			for (i = 0; i < nodes.length; i++) {
				// FIXME: Do we need container?
				nodes[i].appendNodeToParent(this.$.container.hasNode());
			}
		},

		moveNodesUp: function(nodes) {
			var i, c;

			for (i = nodes.length - 1; i >= 0; i--) {
				c = nodes[i];
				c.addBefore = this.orderedChildren[0];
				c.addNodeToParent();
				c.addBefore = undefined;
			}
		},

		/**
		* @private
		*/
		/*modelsRemoved: enyo.inherit( function (sup) {
			return function (sender, e, props) {
				var m = props.models,
					lo = m.low,
					ii = m.indices,
					i = ii.length - 1,
					f = this.first,
					l = this._last,
					d = 0;

				if (sender == this.collection) {
					if (lo <= l) {
						while (ii[i] <=f) {
							d++;
							i--;
						}
						if (d) this.adjustHead(d);
						// for (; i >= 0; i--) {
						// 	if (ii[i] <= f) {
						// 		d++
						// 	}
						// 	else {
						// 		break;
						// 	}
						// }
						// if (d) {
						// 	this.adjustChildren(d);
						// }
					}
					sup.apply(this, arguments);
				}
			};
		}),*/

		/**
		* @private
		*/
		// modelsAdded: enyo.inherit( function (sup) {
		// 	return function (sender, e, props) {
		// 		this.log(props);
		// 		sup.apply(this, arguments);
		// 	};
		// }),

		dataChanged: function() {
			if (this.get('data') && this.hasRendered) {
				this.reset();
			}
		}
	});
})(enyo, this);