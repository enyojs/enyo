(function (enyo) {

	//*@public
	/**
		_enyo.DataList_ is an <a href="#enyo.DataRepeater">enyo.DataRepeater</a>
		that employs a paginated scrolling scheme to enhance performance with larger
		datasets. All children will have the _enyo.AutoBindingSupport_ mixin applied
		automatically and may use its API for convenience.  (See the
		<a href="https://github.com/enyojs/enyo/blob/master/source/kernel/mixins/AutoBindingSupport.js">mixin
		source code</a> for usage details.)

			enyo.kind({
				name: "MyView",
				components: [
					{name: "list", kind: "enyo.DataList", components: [
						{bindFrom: ".firstName"},
						{bindFrom: ".lastName"}
					], controller: ".app.controllers.myController"}
				]
			});

		Note that, when care should be taken when deciding how the children of the list
		will be laid out. When updating the layout of child elements, when there are many,
		can be taxing and non-performant for the browser. Do not use dynamicly updated
		layouts that require many calculations whenever the data will be updated in a view.
		Try using CSS whenever possible.

		Note that _enyo.DataList_ currently does not support horizontal orientation.
	*/
	enyo.kind({
		name: "enyo.DataList",
		kind: "enyo.DataRepeater",
		//*@public
		/**
			The _enyo.DataList_ kind places its rows inside of a scroller. Any
			configurable options associated with an _enyo.Scroller_ may be
			placed in this hash and will be set accordingly on the scroller
			for this list. If no options are specified, the default _enyo.Scroller_
			settings are used.
		*/
		scrollerOptions: null,
		//*@public
		/**
			The paging orientation. Valid values are `vertical` and `horizontal`.
		*/
		orientation: "vertical",
		//*@public
		classes: "enyo-data-list",
		//*@public
		/**
			The number of _controls_ to keep as _active_ per page. If the individual
			elements are very small, this number may need to be increased; likewise,
			if they are very large, the number may need to be decreased.
		*/
		controlsPerPage: 50,
		//*@protected
		containerOptions: {
			name: "scroller",
			kind: "enyo.Scroller",
			canGenerate: false,
			classes: "enyo-fit enyo-data-list-scroller",
			components: [
				{name: "active", classes: "enyo-data-list-active", components: [
					{name: "page1", classes: "enyo-data-list-page"},
					{name: "page2", classes: "enyo-data-list-page"}
				]},
				{name: "buffer", classes: "enyo-data-list-buffer"}
			]
		},
		//*@protected
		handlers: {
			onScroll: "didScroll"
		},
		controlParentName: "page1",
		containerName: "scroller",
		debugPageBoundaries: false,
		create: enyo.super(function (sup) {
			return function () {
				sup.apply(this, arguments);
				this.orientation = this.orientation[0] == "v"? "v": "h";
				if (this.debugPageBoundaries) {
					this.$.page1.applyStyle("background-color", "#d8d8d8");
					this.$.page2.applyStyle("background-color", "#58d3f7");
				}
				this.resetMetrics();
			};
		}),
		rendered: function () {
			// the initial time the list is rendered, we've only rendered the
			// list node itself, but now we know it should be safe to calculate
			// some boundaries so there's no ugly overlap in our absolutely
			// positioned elements and rows and we can also render the rows and
			// correctly map them to corresponding pages
			this.$.scroller.canGenerate = true;
			this.$.scroller.render();
			// let's position and size everything initially and it will be adjusted
			// as we go
			this.updateSizing();
			var $h = this.height,
				$w = this.width,
				$r = this.orientation,
				$t = 0, $s;
			for (var $i=0, c$; (c$=this.$.active.children[$i]); ++$i) {
				$s = "";
				if ($r == "v") {
					$s += "width: " + $w + "px; top: " + $t + "px; " + "left: 0px;";
				} else {
					$s += "height: " + $h + "px; left: " + $t + "px; " + "top: 0px;";
				}
				c$.addStyles($s);
				if ($t === 0) {
					if ($r == "v") {
						$t = $h;
					} else {
						$t = $w;
					}
				}
				// this will initialize the cached values
				this.getTop(c$);
				this.getLeft(c$);
			}
			this._firstPage = this.$.page1;
			this._lastPage = this.$.page2;
			if (this.length) {
				this.reset();
			}
		},
		resetMetrics: function () {
			this.childSize = 0;
			this.pageCount = 0;
			this.pages = {};
			this.bufferSize = 0;
		},
		updateMetrics: function () {
			this.defaultPageSize = this.controlsPerPage * (this.childSize || 100);
			this.pageCount = Math.ceil(this.length / this.controlsPerPage);
			this.bufferSize = 0;
			for (var $i=0; $i<this.pageCount; ++$i) {
				this.bufferSize += this.getPageSize($i);
			}
			this.adjustBuffer();
		},
		getPageSize: function (p) {
			var $r = this.orientation,
				$s, $n;
			if (this.pages[p]) {
				return $r == "v"? this.pages[p].height: this.pages[p].width;
			}
			$n = Math.min(this.length - (this.controlsPerPage * p), this.controlsPerPage);
			$s = this.defaultPageSize * ($n / this.controlsPerPage);
			return Math.max(1, $s);
		},
		reset: function () {
			var $i, p$;
			if (this.generated && this.$.scroller.generated) {
				for ($i=1; (p$=this.$.active.children[$i]); --$i) {
					this.resetPage(p$);
					p$.index = $i;
				}
				this.resetMetrics();
				for ($i=0; (p$=this.$.active.children[$i]); ++$i) {
					this.generatePage(p$, $i);
				}
				this.updateMetrics();
				// at this point there is most likely overlap of the pages but
				// if so it will be out of the visible region
				this.resetPagePositions();
				this.$.scroller.rendered();
				this._hasReset = true;
			}
		},
		resetPage: function (p) {
			this.controlParentName = p.name;
			this.discoverControlParent();
			while (p.children.length < this.controlsPerPage) {
				this.createComponent({});
			}
		},
		generatePage: function (p, n) {
			var $d = this.get("data"),
				$c = this.controlsPerPage,
				$o = $c * n,
				$e = Math.min(this.length, $o + $c),
				$r = this.orientation, $p;
			this.controlParentName = p.name;
			this.discoverControlParent();
			p.index = n;
			for (var $i=0, $j=$o, c$, d$; (c$ = p.children[$i]) && (d$=$d[$j]) && $j < $e; ++$i, ++$j) {
				if (c$._listDisabledChild) {
					this.enableChild(c$);
				}
				if (c$.model !== d$) {
					c$.stopNotifications();
					c$.set("index", $j);
					c$.set("model", d$);
					c$.set("selected", this.isSelected(d$));
					c$.startNotifications();
				}
			}
			if ($i < p.children.length) {
				this.prune(p, $i);
			}
			p.renderReusingNode();
			$p = this.pages[n];
			if (!$p) {
				$p = this.pages[n] = {};
			}
			if ($r == "v") {
				$p.height = this.getHeight(p);
				$p.width = p.width = this.width;
			} else {
				$p.width = this.getWidth(p);
				$p.height = p.height = this.height;
			}
			$p.start = $o;
			$p.end = $o + ($i - 1);
			if (!this.childSize) {
				this.childSize = Math.floor(($r == "v"? $p.height: $p.width) / $c);
				this.updateMetrics();
			}
		},
		add: function (i) {
			if (this.generated && this.$.scroller.canGenerate) {
				var $n = this.pageForIndex(i),
					$p = this.$.page1.index == $n? this.$.page1: this.$.page2.index == $n? this.$.page2: null;
				if ($p) {
					this.generatePage($p, $n);
					if (!this.batching) {
						this.updateMetrics();
						this.adjustLastPage();
					}
				}
			}
		},
		remove: function (i) {
			if (this.generated && this.$.scroller.canGenerate) {
				var $n = this.pageForIndex(i),
					$p = this.$.page1.index == $n? this.$.page1: this.$.page2.index == $n? this.$.page2: null;
				if ($p) {
					this.generatePage($p, $n);
					if (!this.batching) {
						this.updateMetrics();
						this.adjustLastPage();
					}
				}
			}
		},
		refresh: function () {
			if (this.generated && this.$.scroller.canGenerate) {
				for (var $i=0, p$; (p$=this.$.active.children[$i]); ++$i) {
					this.generatePage(p$, p$.index);
				}
				this.updateMetrics();
				this.resetPagePositions();
			}
		},
		pageForIndex: function (i) {
			return Math.floor(i / this.controlsPerPage);
		},
		indexInPage: function (i, p) {
			// FIXME: This needs to be adjusted to make better guesses
			// but for now it's just brute force -- the issue being that
			// the children are not always in order by index
			var $f = false;
			for (var $i=0, c$; (c$=p.children[$i]); ++$i) {
				if (c$.index == i) {
					$f = true;
					break;
				}
			}
			return $f;
		},
		modelsAdded: function (sender, event) {
			// FIXME: This is a temporary implementation as it will continue to
			// throw indices for pages already generated - but it would need to inspect
			// them to ensure they are ordered and then group them so the page is only
			// generated once
			if (sender == this.controller) {
				if (!this._hasReset) {
					return this.reset();
				}
				// if these conditions are true then it hasn't reset yet so it
				// is safe to ignore the event
				if (this.generated && this.$.scroller.canGenerate) {
					this.set("batching", true);
					for (var $i=0, r$; (r$=event.models[$i]); ++$i) {
						this.add(r$.index);
					}
					this.updateMetrics();
					this.adjustLastPage();
					this.set("batching", false);
				}
			}
		},
		modelsRemoved: function (sender, event) {
			if (sender == this.controller) {
				if (this.generated && this.$.scroller.canGenerate) {
					this.set("batching", true);
					// FIXME: This is a temporary implementation for this event;
					// ultimately it needs to only do anything if the current indices
					// are affected by the indices that are removed
					this.reset();
					this.set("batching", false);
				}
			}
		},
		modelAdded: function (sender, event) {
			if (sender == this.controller) {
				if (!this._hasReset && !this.batching) {
					return this.reset();
				}
				if (this.generated && this.$.scroller.canGenerate) {
					this.add(event.index);
				}
			}
		},
		modelRemoved: function (sender, event) {
			if (sender == this.controller) {
				if (this.generated && this.$.scroller.canGenerate) {
					this.remove(event.index);
				}
			}
		},
		update: function (i) {
			// TODO: This should never get called and should possibly be removed
			// from the API altogether
		},
		prune: function (p, i, e) {
			var $t = p.children.slice(i, e);
			for(var $i=0, c$; (c$=$t[$i]); ++$i) {
				c$.set("model", null);
				this.disableChild(c$);
			}
		},
		disableChild: function (c$) {
			if (!c$._listDisabledChild) {
				c$.setShowing(false);
				c$.canGenerate = false;
				c$._listDisabledChild = true;
			}
		},
		enableChild: function (c$) {
			if (c$._listDisabledChild) {
				c$.canGenerate = true;
				c$._listDisabledChild = false;
				c$.setShowing(true);
			}
		},
		adjustBuffer: function () {
			var $s = this.bufferSize,
				$r = this.orientation,
				$p = $r == "v"? "height": "width",
				$o = $p == "height"? "width": "height";
			if (this.$.buffer[$p] != $s) {
				this.$.buffer[$p] = $s;
				this.$.buffer.applyStyle($p, $s + "px");
				this.$.buffer.applyStyle($o, this[$o] + "px");
			}
		},
		adjustPageSize: function (p) {
			var $r = this.orientation,
				$s = this.getPageSize(p.index), $h, $w;
			if ($r == "v") {
				$h = this.getHeight(p);
				$w = this.width;
				if ($h != $s) {
					p.height = this.pages[p.index].height = $h;
				}
				if (p.width != $w) {
					p.applyStyle("width", $w + "px");
					p.width = $w;
				}
			} else {
				$w = this.getWidth(p);
				$h = this.height;
				if ($w != $s) {
					p.width = this.pages[p.index].width = $w;
				}
				if (p.height != $h) {
					p.applyStyle("height", $h + "px");
					p.height = $h;
				}
			}
		},
		resetPagePositions: function () {
			this.updateMetrics();
			for (var $i=0, p$; (p$=this.$.active.children[$i]); ++$i) {
				var $p = this.getPagePosition(p$.index),
					$r = this.orientation,
					$s = $r == "v"? "top": "left";
				if (p$[$s] != $p) {
					p$[$s] = $p;
					p$.applyStyle($s, $p + "px");
				}
			}
		},
		adjustLastPage: function () {
			var $b = this.getLastPage(),
				$r = this.orientation,
				$i = $b.index,
				$p = this.getPagePosition($i),
				$s = $r == "v"? "top": "left";
			if ($b[$s] != $p) {
				$b[$s] = $p;
				$b.applyStyle($s, $p + "px");
			}
		},
		getPagePosition: function (p) {
			var $t = 0;
			while (p > 0) {
				--p;
				$t += this.getPageSize(p);
			}
			return $t;
		},
		/**
			These getter methods are implemented in this way for efficiency, as they
			will be called often and there is a memory penalty for returning an object
			with these properties as opposed to returning the static value directly.
		*/
		getHeight: function (n) {
			var $n = n || this;
			return $n && $n.hasNode()? ($n.height = $n.node.offsetHeight): 0;
		},
		getWidth: function (n) {
			var $n = n || this;
			return $n && $n.hasNode()? ($n.width = $n.node.offsetWidth): 0;
		},
		getTop: function (n) {
			var $n = n || this;
			return $n && $n.hasNode()? ($n.top = $n.node.offsetTop): 0;
		},
		getLeft: function (n) {
			var $n = n || this;
			return $n && $n.hasNode()? ($n.left = $n.node.offsetLeft): 0;
		},
		getFirstPage: function () {
			return this._firstPage || (this._firstPage = this.$.page1);
		},
		getLastPage: function () {
			return this._lastPage || (this._lastPage = this.$.page2);
		},
		didScroll: function (sender, event) {
			var $d = this.getDirection(),
				$f;
			if ($d) {
				$f = this[$d];
				this.throttleJob($d, $f, 10);
			}
			return true;
		},
		getDirection: function () {
			var $s = this.$.scroller,
				$r = this.orientation,
				$l = this.last,
				$c = $r == "v"? $s.getScrollTop(): $s.getScrollLeft(),
				$d = false;
			if (!isNaN($l)) {
				if ($l < $c) {
					$d = $r == "v"? "down": "right";
				} else if ($l > $c) {
					$d = $r == "v"? "up": "left";
				}
			}
			this.last = $c;
			return $d;
		},
		up: function () {
			if (this.orientation == "v") {
				var $p = this.getLastPage(),
					$t = $p.top,
					$s = this.$.scroller.getScrollTop(),
					$h = this.height;
				if (($s + $h) < $t) {
					this.positionPageBefore($p);
				}
			}
		},
		down: function () {
			if (this.orientation == "v") {
				var $p = this.getFirstPage(),
					$t = $p.top,
					$h = $p.height,
					$s = this.$.scroller.getScrollTop();
				if (($t + $h) < $s) {
					this.positionPageAfter($p);
				}
			}
		},
		left: function () {
			
		},
		right: function () {
			
		},
		positionPageAfter: function (p) {
			var $r = this.orientation,
				$b = this.getLastPage(),
				$i = $b.index,
				$c = this.pageCount,
				s$ = $r == "v"? "top": "left", p$;
			if ($c - $i > 1) {
				this.generatePage(p, ++$i);
				p$ = this.getPagePosition($i);
				p.applyStyle(s$, p$ + "px");
				p[s$] = p$;
				this._firstPage = $b;
				this._lastPage = p;
				if ($i == ($c - 1)) {
					this.updateMetrics();
				}
			}
		},
		positionPageBefore: function (p) {
			var $b = this.getFirstPage(),
				$r = this.orientation,
				$i = $b.index,
				s$ = $r == "v"? "top": "left", p$;
			if ($i > 0) {
				this.generatePage(p, --$i);
				p$ = this.getPagePosition($i);
				p.applyStyle(s$, p$ + "px");
				p[s$] = p$;
				this._firstPage = p;
				this._lastPage = $b;
			}
		},
		initContainer: enyo.super(function (sup) {
			return function () {
				var $o = enyo.clone(this.get("containerOptions")),
					$s = this.get("scrollerOptions");
				if ($s) {
					enyo.mixin($o, $s, {exists: true});
				}
				this.set("containerOptions", $o);
				sup.apply(this, arguments);
			};
		}),
		batchingChanged: function (prev, val) {
			if (this.generated && false === val) {
				// this is happening so various scrollers that need to know the content
				// may have adjusted will update their flow accordingly
				this.$.scroller.rendered();
			}
		},
		resizeHandler: enyo.super(function (sup) {
			return function () {
				sup.apply(this, arguments);
				this.updateSizing();
				if (this.length) {
					this.startJob("layoutPages", this.layoutPages, 100);
				}
			};
		}),
		updateSizing: function () {
			this.width = this.getWidth();
			this.height = this.getHeight();
		},
		layoutPages: function () {
			this.adjustPageSize(this.$.page1);
			this.adjustPageSize(this.$.page2);
			this.adjustLastPage();
		},
		getChildForIndex: function (i) {
			var p$ = this.pageForIndex(i);
			if (this.$.page1.index == p$) {
				p$ = this.$.page1;
			} else if (this.$.page2.index == p$) {
				p$ = this.$.page2;
			} else {
				p$ = false;
			}
			if (p$) {
				for (var $i=0, c$; (c$=p$.children[$i]); ++$i) {
					if (c$.index == i) {
						return c$;
					}
				}
			}
			return false;
		}

	});

})(enyo);
