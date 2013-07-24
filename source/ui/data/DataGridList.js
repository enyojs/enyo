(function (enyo) {

	//*@public
	/**
		A type of _enyo.DataRepeater_ designed to layout a grid from its
		components according to the data supplied by its _enyo.Collection_. It employs
		a paginated scrolling scheme to enhance performance in larger datasets.
	*/
	enyo.kind({
		
		//*@public
		name: "enyo.DataGridList",
		
		//*@public
		kind: "enyo.DataList",
		
		//*@public
		classes: "enyo-data-grid-list",
		
		//*@public
		/**
			This is the spacing (in pixels) between all elements in the grid list. It
			should be an even number or will be coerced into one for consistency.
			This is the exact spacing to be allocated between any item on all sides.
		*/
		spacing: 10,
		
		//*@public
		/**
			This is the minimum width (in pixels) for the grid items. They will not
			be collapsed beyond this size but they may be proportionally expanded.
		*/
		minWidth: 100,
		
		//*@public
		/**
			This is the minimum height (in pixels) for the grid items. They will not
			be collapsed beyond this size but they may be proportionally expanded.
		*/
		minHeight: 100,
		
		//*@protected
		initComponents: function () {
			this.inherited(arguments);
			var $k = this.defaultKind;
			$k.extend({classes: "enyo-data-grid-list-item"});
		},
		create: function () {
			this.inherited(arguments);
			// currently we don't allow anything else
			this.orientation = "v";
			this.spacingChanged();
		},
		adjustPageSize: function (p) {
			this.layoutPage(p);
			this.pages[p.index].height = this.getHeight(p);
			var $s = "height: " + p.height + "px;";
			if (p.width != this.width) {
				p.width = this.pages[p.index].width = this.width;
				$s += " width: " + p.width + "px;";
			}
			p.addStyles($s);
		},
		layoutPage: function (p) {
			if (p.children.length) {
				// spacing in pixels
				var $s = this.spacing,
					$t = $s,
					$l = 0,
					$w = this.tileWidth,
					$h = this.tileHeight,
					$c = this.columns,
					r$ = -1, t$, o$;
				for (var $i=0, c$, j$=0; (c$=p.children[$i]); ++$i) {
					if (!c$.disabled) {
						t$ = "";
						o$ = j$ % $c;
						r$ = o$ === 0? r$+1: r$;
						$t = r$ === 0? $t: $s + (r$ * ($h + $s));
						$l = o$ === 0? $s: $l + ($w + $s);
						if (c$.top != $t) {
							t$ += "top: " + (c$.top = $t) + "px; ";
						}
						if (c$.left != $l) {
							t$ += "left: " + (c$.left = $l) + "px; ";
						}
						if (c$.width != $w) {
							t$ += "width: " + (c$.width = $w) + "px; ";
						}
						if (c$.height != $h) {
							t$ += "height: " + (c$.height = $h) + "px;";
						}
						if (t$) {
							c$.addStyles(t$);
						}
						++j$;
					}
				}
				p.rows = r$ + 1;
			}
		},
		generatePage: function (p, n) {
			this.inherited(arguments);
			this.adjustPageSize(p);
		},
		getHeight: function (n) {
			if (n && (n.name == "page1" || n.name == "page2")) {
				/*jshint boss:true*/
				return (n.height = this.getPageHeight(n));
			}
			return this.inherited(arguments);
		},
		getPageHeight: function (p) {
			if (p.children.length) {
				var $a = 0;
				for (var $i=0, c$; (c$=p.children[$i]); ++$i) {
					if (!c$.disabled) {
						++$a;
					}
				}
				return (Math.floor($a / this.columns) + ($a % this.columns? 1: 0)) * (this.tileHeight + this.spacing);
			}
			return 0;
		},
		updateSizing: function () {
			this.inherited(arguments);
			var $w = this.width,
				$s = this.spacing,
				$m = this.minWidth,
				$h = this.minHeight;
			this.columns = Math.floor(($w - $s) / ($m + $s));
			this.tileWidth = Math.floor(($w - (this.columns * $s) - $s) / this.columns);
			this.tileHeight = Math.floor($h * (this.tileWidth / $m));
			this.adjustControlsPerPage();
			this.adjustDefaultPageSize();
		},
		adjustControlsPerPage: function () {
			var $c = this.columns,
				$p = this.controlsPerPage, m$;
			m$ = $p % $c;
			if (m$ !== 0) {
				m$ = ($c - ($p % $c));
				if ($p + m$ > 50) {
					m$ = -1 * (Math.abs(m$ - $c));
				}
				this.controlsPerPage = $p + m$;
			}
		},
		adjustDefaultPageSize: function () {
			var $s = this.spacing,
				$h = this.tileHeight,
				$c = this.columns,
				$p = this.controlsPerPage,
				$t = Math.floor($p / $c) * ($h + $s);
			this.defaultPageSize = $t;
			// invalidate all known sizes as their cached value is
			// useless now
			for (var $i=0, p$; (p$=this.pages[$i]); ++$i) {
				this.pages[$i].height = $t;
			}
		},
		adjustBuffer: function () {
			if (this.length) {
				var $v = this.length,
					$s = this.spacing,
					$h = this.tileHeight,
					$c = this.columns,
					$t = ((Math.floor($v / $c) + ($v % $c? 1: 0)) * ($h + $s)) + $s;
				if (this.$.buffer.height != $t) {
					this.$.buffer.applyStyle("height", (this.$.buffer.height = $t) + "px");
				}
			}
			if (this.$.buffer.width != this.width) {
				this.$.buffer.applyStyle("width", (this.$.buffer.width = this.width) + "px");
			}
		},
		layoutPages: function () {
			var $s = this.$.scroller.getScrollTop(),
				$i, $k;
			this.refresh();
			$i = this.getPagePosition(this.$.page1.index);
			$k = this.getPagePosition(this.$.page2.index);
			if ($s < Math.min($i, $k) || $s > Math.max($i, $k)) {
				this._noScroll = true;
				this.$.scroller.setScrollTop(Math.min($i, $k));
				this._noScroll = false;
			}
		},
		updateMetrics: function () {
			this.pageCount = Math.ceil(this.length / this.controlsPerPage);
			this.bufferSize = 0;
			for (var $i=0; $i<this.pageCount; ++$i) {
				this.bufferSize += this.getPageSize($i);
			}
			this.adjustBuffer();
		},
		spacingChanged: function () {
			// tile spacing needs to be an even number
			var $t = this.spacing;
			if ($t % 2 !== 0) {
				this.spacing = $t > 0? $t-1: 0;
			}
			if (this.generated && this.$.scroller.canGenerate) {
				this.startJob("layoutPages", this.layoutPages, 100);
			}
		},
		didScroll: function (sender, event) {
			if (!this._noScroll) {
				return this.inherited(arguments);
			}
			return true;
		}
	});

})(enyo);