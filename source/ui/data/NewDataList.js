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
			{method: 'calculateMetrics', path: [
				'direction', 'columns', 'rows',
				'itemHeight', 'itemWidth', 'columns'
			]}
		],
		calculateMetrics: function() {
			var d = this.direction,
				iw = this.itemWidth,
				ih = this.itemHeight,
				m = (d == 'vertical') ? 'clientHeight' : 'clientWidth',
				h = this.hasNode()[m],
				minMax, d2x;
			this.itemSize = (d == 'vertical') ? ih : iw;
			this.itemSize2 = (d == 'vertical') ? iw : ih;

			d2x = (d == 'vertical') ? this.columns : this.rows;
			this.dim2extent = (d2x == 'auto') ? 1 : d2x;
			
			minMax = this.itemSize * 2;
			this.threshold = { min: -Infinity, max: minMax, minMax: minMax };

			this.set('numItems', this.dim2extent * (Math.ceil(h / this.itemSize) + this.overhang));
		},
		rendered: enyo.inherit(function (sup) {
			return function() {
				this.calculateMetrics();
				sup.apply(this, arguments);
			};
		}),
		scroll: function() {
			var tt = this.threshold,
				v = this.scrollTop,
				dir = this.yDir,
				sz = this.itemSize,
				cb = this.cachedBounds ? this.cachedBounds : this._getScrollBounds(),
				mTop = cb.maxTop,
				mMax = this.threshold.minMax,
				mMin = mTop - (sz * 2),
				d, st, j;
			if (dir == 1 && v > tt.max) {
				d = v - tt.max;
				st = Math.ceil(d / sz);
				j = st * sz;
				tt.max = Math.min(mTop, tt.max + j);
				tt.min = (tt.max == mTop) ? mMin : tt.max - sz;
				this.set('first', this.first + (st * this.dim2extent));
			}
			else if (dir == -1 && v < tt.min) {
				d = tt.min - v;
				st = Math.ceil(d / sz);
				j = st * sz;
				tt.max = Math.max(mMax, tt.min - (j - sz));
				tt.min = (tt.max > mMax) ? tt.max - sz : -Infinity;
				this.set('first', this.first - (st * this.dim2extent));
			}
			this.positionChildren();
		},
		positionChildren: function() {
			var oc = this.orderedChildren,
				e = this.dim2extent,
				d = this.direction,
				i, c, idx, g, p, g2, p2, a, b;
			for (i = 0; i < oc.length; i++) {
				c = oc[i];
				idx = c.index;
				g = Math.floor(idx / e);
				g2 = idx % e;
				p = ((g * this.itemSize) - Math.round(this.scrollTop));
				p2 = g2 * (this.itemSize2 + this.spacing);
				if (d == 'vertical') {
					a = p2;
					b = p;
				}
				else {
					a = p;
					b = p2;
				}
				enyo.dom.transform(c, {translate3d: a + 'px, ' + b + 'px, 0'});
			}
		},
		/**
		* @private
		*/
		getScrollHeight: function () {
			return Math.ceil(this.collection.length / this.dim2extent) * this.itemSize;
		}
	});
})(enyo, this);