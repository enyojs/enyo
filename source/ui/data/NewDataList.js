(function (enyo, scope) {
	var Scrollable = enyo.Scrollable;

	enyo.kind({
		name: 'enyo.NewDataList',
		kind: 'enyo.VirtualDataRepeater',
		direction: 'vertical',
		itemHeight: 100,
		itemWidth: 100,
		spacing: 0,
		rows: 'auto',
		columns: 'auto',
		overhang: 3,
		mixins: [Scrollable],
		observers: [
			{method: 'reset', path: [
				'direction', 'columns', 'rows',
				'itemHeight', 'itemWidth', 'columns'
			]}
		],
		/**
		* @public
		*/
		getVisibleItems: function() {
			return this.orderedChildren.slice(this.firstVisibleI, this.lastVisibleI + 1);
		},

		/**
		* @private
		*/
		calculateMetrics: function(opts) {
			var sp = this.spacing,
				n = this.hasNode(),
				oT = this.topOffset,
				oR = this.rightOffset,
				oB = this.bottomOffset,
				oL = this.leftOffset,
				cw = (opts && opts.width !== undefined) ?
					opts.width :
					n.clientWidth - oR - oL,
				ch = (opts && opts.height !== undefined) ?
					opts.height :
					n.clientHeight - oT - oB,
				s1, s2, md1, md2, d2x, is1, is2, d1, d2, minMax, num;

			if (this.direction == 'vertical') {
				s1 = ch;
				s2 = cw;
				md1 = this.minItemHeight;
				md2 = this.minItemWidth;
				is1 = this.itemHeight;
				is2 = this.itemWidth;
				d2x = this.columns;
			}
			else {
				s1 = cw;
				s2 = ch;
				md1 = this.minItemWidth;
				md2 = this.minItemHeight;
				is1 = this.itemWidth;
				is2 = this.itemHeight;
				d2x = this.rows;
			}

			this.sizeItems = (md1 && md2);

			if (this.sizeItems) {
				// the number of columns is the ratio of the available width minus the spacing
				// by the minimum tile width plus the spacing
				d2x = Math.max(Math.floor((s2 - (sp * 2)) / (md2 + sp)), 1);
				// the actual tile width is a ratio of the remaining width after all columns
				// and spacing are accounted for and the number of columns that we know we should have
				is2 = ((s2 - (sp * (d2x + 1))) / d2x);
				// the actual tile height is related to the tile width
				is1 = (md1 * (is2 / md2));
			}
			else if (d2x === 'auto') {
				d2x = 1;
			}
			
			d1 = sp + is1;
			d2 = sp + is2;

			minMax = d1 * 2;
			this.threshold = { min: -Infinity, max: minMax, minMax: minMax };

			num = d2x * (Math.ceil(s1 / d1) + this.overhang);

			this.dim2extent = d2x;
			this.itemSize = is1;
			this.itemSize2 = is2;
			this.delta = d1;
			this.delta2 = d2;
			this.size = s1;
			this.size2 = s2;

			this.set('numItems', num);
		},
		/**
		* @private
		*/
		scroll: function() {
			var tt = this.threshold,
				v = (this.direction === 'vertical'),
				val = v ? this.scrollTop : this.scrollLeft,
				dir = v ? this.yDir : this.xDir,
				delta = this.delta,
				cb = this.cachedBounds ? this.cachedBounds : this._getScrollBounds(),
				mTop = v ? cb.maxTop : cb.maxLeft,
				mMax = this.threshold.minMax,
				mMin = mTop - (delta * 2),
				d, st, j;
			if (dir == 1 && val > tt.max) {
				d = val - tt.max;
				st = Math.ceil(d / delta);
				j = st * delta;
				tt.max = Math.min(mTop, tt.max + j);
				tt.min = (tt.max == mTop) ? mMin : tt.max - delta;
				this.set('first', this.first + (st * this.dim2extent));
			}
			else if (dir == -1 && val < tt.min) {
				d = tt.min - val;
				st = Math.ceil(d / delta);
				j = st * delta;
				tt.max = Math.max(mMax, tt.min - (j - delta));
				tt.min = (tt.max > mMax) ? tt.max - delta : -Infinity;
				this.set('first', this.first - (st * this.dim2extent));
			}
			this.positionChildren();
		},
		/**
		* @private
		*/
		positionChildren: function() {
			var oc = this.orderedChildren,
				e = this.dim2extent,
				v = (this.direction == 'vertical'),
				sd = v ? 'scrollTop' : 'scrollLeft',
				sp = this.spacing,
				is = this.itemSize,
				is2 = this.itemSize2,
				i, c, idx, g, p, g2, p2, a, b, w, h, fi, li;

			if (oc) {
				for (i = 0; i < oc.length; i++) {
					c = oc[i];
					idx = c.index;
					g = Math.floor(idx / e);
					g2 = idx % e;
					p = sp + (g * this.delta) - Math.round(this[sd]);
					p2 = sp + (g2 * this.delta2);
					if (v) {
						a = p2;
						b = p;
						w = is2;
						h = is;
					}
					else {
						a = p;
						b = p2;
						w = is;
						h = is2;
					}
					if (this.sizeItems) {
						c.applyStyle('width', w + 'px');
						c.applyStyle('height', h + 'px');
					}
					if (fi === undefined && (p + is) > 0) {
						fi = i;
					}
					if (p < this.size) {
						li = i;
					}
					enyo.dom.transform(c, {translate3d: a + 'px, ' + b + 'px, 0'});
				}
				this.firstVisibleI = fi;
				this.lastVisibleI = li;
			}
		},
		/**
		* @private
		*/
		getScrollHeight: function () {
			return (this.direction === 'vertical' ? this.getVirtualScrollDimension() : null);
		},
		/**
		* @private
		*/
		getScrollWidth: function () {
			return (this.direction === 'horizontal' ? this.getVirtualScrollDimension() : null);
		},
		/**
		* @private
		*/
		getVirtualScrollDimension: function() {
			var len = this.collection ? this.collection.length : 0;

			return (Math.ceil(len / this.dim2extent) * this.delta) + this.spacing;
		},

		/**
		* @private
		*/
		modelsAdded: enyo.inherit(function (sup) {
			return function() {
				this.calcBoundaries();
				sup.apply(this, arguments);
			};
		}),
		
		/**
		* @private
		*/
		modelsRemoved: enyo.inherit(function (sup) {
			return function() {
				this.calcBoundaries();
				sup.apply(this, arguments);
			};
		}),

		/**
		* @private
		*/
		refresh: enyo.inherit(function (sup) {
			return function () {
				if (arguments[1] === 'reset') {
					this.calcBoundaries();
				}
				sup.apply(this, arguments);
			};
		}),
		
		/**
		* @private
		*/
		reset: enyo.inherit(function (sup) {
			return function () {
				var v = (this.direction === 'vertical');

				this.set('scrollTop', 0);
				this.set('scrollLeft', 0);
				this.set('vertical', v || 'hidden');
				this.set('horizontal', !v || 'hidden');
				this.calculateMetrics();
				this.calcBoundaries();
				sup.apply(this, arguments);
			};
		})
	});
})(enyo, this);