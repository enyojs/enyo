(function (enyo, scope) {
	enyo.kind({
		name: 'enyo.VirtualDataRepeater',
		kind: 'enyo.DataRepeater',
		numItems: 10,
		first: 0,
		reorderNodes: false,
		
		reset: function () {
			this.orderedChildren = [],
			this.childIndex = {},
			this.destroyClientControls();
			this.setExtent();
			this._last = Math.min(this.numItems, this.collection.length) - 1;
			this.doIt();
			this.hasReset = true;
		},

		setExtent: function() {
			this.first = 0;
		},
		
		refresh: function (immediate) {
			if (!this.hasReset) return this.reset();

			this.stabilizeWindow();

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
			return this.childIndex[idx];
		},

		doIt: function(immediate) {
			var dd = this.get('data'),
				f = this.first,
				o = this.orderedChildren,
				ci = this.childIndex,
				n = this.numItems,
				e = Math.max(n, o.length),
				sp, i, idx, c, m, s, sc, l, ln;

			// TODO: Something better. Shouldn't have
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
						// this.log(this.id, f, n, c.index, idx);

						if (c.model === m) continue;

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
			}
		},

		fwd: function() {
			this.set('first', this.first + 1);
		},
		
		bak: function() {
			this.set('first', this.first - 1);
		},

		adjustHead: function(d) {
			var n = this.numItems,
				o = this.orderedChildren,
				m;

			if (o) {
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
			}
		},

		firstChanged: function(prev) {
			this.stabilizeWindow();

			if (this.hasRendered) {
				this.adjustHead(this.first - prev);

				this.refresh(true);
			}
		},

		stabilizeWindow: function() {
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
			if (this.data && this.hasRendered && this.hasReset) {
				this.refresh(true);
			}
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
		modelsRemoved: enyo.inherit( function (sup) {
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
						/*for (; i >= 0; i--) {
							if (ii[i] <= f) {
								d++
							}
							else {
								break;
							}
						}
						if (d) {
							this.adjustChildren(d);
						}*/
					}
					sup.apply(this, arguments);
				}
			};
		}),

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