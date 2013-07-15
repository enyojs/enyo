(function (enyo) {

	//*@public
	/**
	*/
	enyo.kind({

		// ...........................
		// PUBLIC PROPERTIES

		//*@public
		name: "enyo.DataList",

		//*@public
		kind: "enyo.DataRepeater",

		//*@public
		/**
			The _enyo.DataList_ kind places its rows inside of a scroller. Any
			configurable options associated with an _enyo.Scroller_ can be
			placed in this hash and will be set accordingly on the scroller
			for this list. If none are specified default _enyo.Scroller_
			settings are used.
		*/
		scrollerOptions: null,

		//*@public
		protectedStatics: {
			defaultScrollerOptions: {
				preventScrollPropagation: false
			}
		},

		//*@public
		handlers: {
			onScroll: "_didScroll",
			onpostresize: "_didResize"
		},

		//*@public
		controlParentName: "page1",

		//*@public
		classes: "enyo-data-list",

		//*@public
		containerOptions: {
			name: "scroller",
			kind: "enyo.Scroller",
			classes: "enyo-fill enyo-data-list-scroller",
			components: [
				{name: "active", classes: "enyo-data-list-active", components: [
					{name: "page1", kind: "enyo.View", classes: "enyo-data-list-page"},
					{name: "page2", kind: "enyo.View", classes: "enyo-data-list-page"}
				]},
				{name: "buffer", style: "position: relative;"}
			]
		},

		overflow: null,
		underflow: null,

		// ...........................
		// PROTECTED PROPERTIES

		_resized: false,
		_initialPosition: true,

		// ...........................
		// COMPUTED PROPERTIES

		averageBounds: enyo.computed(function () {
			// reset our flag
			this._resized = false;
			this._reset = false;
			this._rendered = false;
			var $ch = this.getClientControls(), $c;
			var $i, $l, $t = {};
			$t.height = 0;
			$t.width = 0;
			for ($i = 1, $l = $ch.length; $i < $l && $i < 10; ++$i) {
				$c = $ch[$i].getBounds();
				$t.height += !isNaN($c.height)? $c.height: 0;
				$t.width += !isNaN($c.width)? $c.width: 0;
			}
			if ($i > 1) {
				$t.height = ~~($t.height / ($i-1));
				$t.width = ~~($t.width / ($i-1));
			}
			return $t;
		}, "_resized", "_reset", "_rendered", {cached: true, defer: true}),

		// ...........................
		// PUBLIC METHODS

		//*@public
		reset: function () {
			var $d = this.get("data");
			this.resetting = true;
			this.destroyClientControls();
			this.resetBuffer();
			this.underflow = {};
			this.overflow = {};
			if ($d) {
				var $i = 0;
				for (var $k in {page1:"", page2:""}) {
					this.controlParentName = $k;
					this.discoverControlParent();
					for (; $i < $d.length && this.threshold(); ++$i) {
						this.add($d[$i], $i);
					}
				}
			}
			this.set("_reset", true);
			this.rendered();
			this.controlParentName = "page1";
			this.discoverControlParent();
			this.resetting = false;
		},

		resetBuffer: function () {
			this.$.buffer.applyStyle("height", "0");
		},

		threshold: function () {
			var $o = this.getBounds().height;
			var $h = this.controlParent.getBounds().height;
			return $h <= (2.5 * $o);
		},

		updateBuffer: function () {
			var $d = this.get("data"), $t = this.get("averageBounds");
			if ($d) {
				this.$.buffer.setBounds({height: ($t.height * $d.length)}, "px");
				this.$.scroller.resized();
			}
		},

		destroyClientControls: function () {
			for (var $i in {page1:"",page2:""}) {
				this.controlParent = this.$[$i];
				this.inherited(arguments);
			}
		},

		rendered: function () {
			this.set("_rendered", true);
			this.inherited(arguments);
			if (this._initialPosition && this.$.page1.hasNode() && this.$.page1.getBounds().height) {
				this._initialPosition = false;
				this.movePageAfter(this.$.page2, this.$.page1);
			}
		},

		reflow: function () {
			this.inherited(arguments);
			this.updateBuffer();
		},

		//*@public
		add: function (rec, idx) {
			// TODO: need to intelligently add indices to the appropriate
			// page when possible and maintain a reference to the overflow
			// indices so when a page is pushed down it can know which models
			// to use and when a page is pushed up it can know the same



			if (!this.threshold()) {
				if (this.controlParentName == "page1") {
					this.controlParentName = "page2";
					this.discoverControlParent();
					this.add(rec, idx);
					this.controlParentName = "page1";
					this.discoverControlParent();
				} else {
					var $o = this.overflow;
					if (!$o.start) {
						$o.start = idx;
					}
					$o.end = idx;
					return idx;
				}
			} else {
				var $c = this.createComponent({kind: this._childKind, model: rec, index: idx});
				$c.render();
				if (!this.batching) {
					this.reflow();
				}
			}
		},

		//*@public
		remove: function (idx) {
			var $ch = this.get("active");
			var $c = $ch[idx || (Math.abs($ch.length-1))];
			if ($c) {
				$c.destroy();
			}
		},

		//*@public
		update: function (idx) {
			var $d = this.get("data");
			var $ch = this.get("active");
			var $c = $ch[idx];
			if ($d && $c) {
				$c.set("model", $d[idx]);
			}
		},

		//*@public
		prune: function () {
			var $ch = this.get("active");
			var l = this.length;
			var $x = $ch.slice(l);
			enyo.forEach($x, function (c) {
				c.destroy();
			});
		},

		//*@public
		up: function () {
			var $c = this.controlParent;
			var $b = $c.getBounds();
			var $p = this.$.scroller.getScrollTop();
			var $n = this.$.page1 == $c? this.$.page2: this.$.page1;
			var $k = $n.getBounds();
			var $o = this.getBounds();
			if ($b.top < $k.top && $b.top !== 0) {
				if ($k.top > ($o.height + $p) && ($k.height <= $p)) {
					this.controlParentName = $n.name;
					this.controlParent = $n;
					this.pageUp();
				}
			} else {
				if ($b.top > $o.height && $b.height <= $p) {
					/* FIXME */
					this.pageUp();
					this.controlParentName = $n.name;
					this.controlParent = $n;
				}
			}
		},

		//*@public
		down: function () {
			var $p = this.$.scroller.getScrollTop();
			var $c = this.controlParent;
			var $b = $c.getBounds();
			var $n = this.$.page1 == $c? this.$.page2: this.$.page1;
			var $k = $n.getBounds();
			var $o = this.$.buffer.getBounds();
			var $f = $b.top + $b.height;
			if ($f < $p && ($o.height - $f) >= $k.height) {
				this.pageDown();
			}
		},

		movePageAfter: function (p1, p2) {
			var $p = p2.getBounds();
			p1.setBounds({top: $p.top + $p.height}, "px");
		},

		movePageBefore: function (p1, p2) {
			var $p = p2.getBounds();
			var $k = p1.getBounds();
			p1.setBounds({top: $p.top - $k.height}, "px");
		},

		pageDown: function () {
			var $p1 = this.controlParent;
			var $n = $p1.name == "page1"? "page2": "page1";
			var $p2 = this.$[$n];
			this.movePageAfter($p1, $p2);
			this.controlParentName = $n;
			this.controlParent = $p2;
			// enyo.asyncMethod(this, "updatePage", $p1, "down");
			this.updatePage($p1, "down");
		},

		updatePage: function (p, direction) {
			var $o = this.overflow;
			var $u = this.underflow;
			var $ch = p.children;
			var $d, $idx, $c, $m;
			if (direction == "down") {
				if (!isNaN($o.start)) {
					// p.teardownChildren();
					p.disconnectDom();
					$d = this.get("data");
					for ($idx = $o.start; $idx < $o.end && ($m = $d[$idx]) && ($c = $ch[$idx - $o.start]); ++$idx) {
						if ($c.index < $u.start || isNaN($u.start)) {
							$u.start = $c.index;
						} else if ($c.index > $u.end || isNaN($u.end)) {
							$u.end = $c.index;
						}
						$c.index = $idx;
						$c.set("model", $m);
					}
					p.connectDom();
					// p.render();
					p.renderReusingNode();
				}
				$o.start = ++$idx;
			}
		},

		pageUp: function () {
			var $p1 = this.controlParent;
			var $n = $p1.name == "page1"? "page2": "page1";
			var $p2 = this.$[$n];
			this.movePageBefore($p1, $p2);

		},

		batchingChanged: function (prev, val) {
			if (false === val) {
				this.rendered();
			}
		},

		initComponents: function () {
			this.inherited(arguments);
			var $k = this._childKind;
			if (!enyo.hasMixin($k, "enyo.RowSupport")) {
				enyo.applyMixin("enyo.RowSupport", $k);
			}
		},

		// ...........................
		// PROTECTED METHODS

		//*@protected
		_initContainer: function () {
			var $c = enyo.clone(this.get("containerOptions"));
			var $o = enyo.clone(this.get("scrollerOptions") || {});
			var $d = enyo.DataList.defaultScrollerOptions;
			// ultimately create a new object without modifying the prototype's
			// options, and only use default values that doesn't override other
			// set values
			this.containerOptions = enyo.mixin(enyo.mixin([$c, $o]), $d, true);
			this.inherited(arguments);
		},

		_didScroll: function (sender, event) {
			var $l = !isNaN(this._lastPos)? this._lastPost: 0;
			var $p = this.$.scroller.getScrollTop();
			var $d = $p - $l;
			// if ($d && Math.abs($d) > this.get("averageBounds").height) {
			if ($d) {
				if ($l > $p) {
					this.up();
				} else if ($l < $p) {
					this.down();
				}
			}
			this._lastPost = $p;
			return true;
		},

		_didResize: function () {
			this.set("_resized", true);
		}

	});

})(enyo);
