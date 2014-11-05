(function (enyo, scope) {
	/**
	* {@link enyo.ScrollStrategy} is a helper [kind]{@glossary kind} that implements a default 
	* scrolling strategy for an {@link enyo.Scroller}.
	* 
	* `enyo.ScrollStrategy` is not typically created in application code. Instead, it is specified 
	* as the value of the [strategyKind]{@link enyo.Scroller#strategyKind} property of an
	* `enyo.Scroller` or {@link enyo.List}, or is used by the framework implicitly.
	*
	* @class enyo.ScrollStrategy
	* @protected
	*/
	enyo.kind(
		/** @lends enyo.ScrollStrategy.prototype */ {

		/**
		* @private
		*/
		name: 'enyo.ScrollStrategy',

		/**
		* @private
		*/
		tag: null,

		/**
		* @private
		*/
		published: 
			/** @lends enyo.ScrollStrategy.prototype */ {
			
			/**
			* Specifies how to vertically scroll.  Acceptable values are `'scroll'`, `'auto'`,
			* `'hidden'`, and `'default'`. The precise effect of the setting is determined by the
			* scroll strategy.
			* 
			* @type {String}
			* @default 'default'
			* @public
			*/
			vertical: 'default',
			
			/**
			* Specifies how to horizontally scroll.  Acceptable values are `'scroll'`, `'auto'`,
			* `'hidden'`, and `'default'`. The precise effect of the setting is determined by the
			* scroll strategy.
			* 
			* @type {String}
			* @default 'default'
			* @public
			*/
			horizontal: 'default',
			
			/**
			* The horizontal scroll position.
			* 
			* @type {Number}
			* @default 0
			* @public
			*/
			scrollLeft: 0,
			
			/**
			* The vertical scroll position.
			* 
			* @type {Number}
			* @default 0
			* @public
			*/
			scrollTop: 0,
			
			/**
			* Maximum height of the scroll content.
			* 
			* @type {Number}
			* @default null
			* @public
			*/
			maxHeight: null,
			
			/**
			* Indicates whether mouse wheel may be used to move the [scroller]{@link enyo.Scroller}.
			* 
			* @type {Boolean}
			* @default true
			* @public
			*/
			useMouseWheel: true
		},
		
		/**
		* @private
		*/
		events: {
			onScrollStart: '',
			onScrollStop: ''
		},

		/**
		* @private
		*/
		handlers: {
			ondragstart: 'dragstart',
			ondragfinish: 'dragfinish',
			ondown: 'down',
			onmove: 'move',
			onmousewheel: 'mousewheel',
			onscroll: 'domScroll'
		},

		/**
		* @method
		* @private
		*/
		create: enyo.inherit(function (sup) {
			return function() {
				sup.apply(this, arguments);
				this.horizontalChanged();
				this.verticalChanged();
				this.maxHeightChanged();
			};
		}),

		/**
		* @method
		* @private
		*/
		rendered: enyo.inherit(function (sup) {
			return function() {
				sup.apply(this, arguments);
				enyo.makeBubble(this.container, 'scroll');
				this.scrollNode = this.calcScrollNode();
			};
		}),

		/**
		* @method
		* @private
		*/
		teardownRender: enyo.inherit(function (sup) {
			return function() {
				sup.apply(this, arguments);
				this.scrollNode = null;
			};
		}),

		/**
		* @private
		*/
		calcScrollNode: function () {
			return this.container.hasNode();
		},

		/**
		* @private
		*/
		horizontalChanged: function () {
			this.container.applyStyle('overflow-x', this.horizontal == 'default' ? 'auto' : this.horizontal);
		},

		/**
		* @private
		*/
		verticalChanged: function () {
			this.container.applyStyle('overflow-y', this.vertical == 'default' ? 'auto' : this.vertical);
		},

		/**
		* @private
		*/
		maxHeightChanged: function () {
			this.container.applyStyle('max-height', this.maxHeight);
		},

		/** 
		* Scrolls to the specified position.
		*
		* @param {Number} x - The `x` position in pixels.
		* @param {Number} y - The `y` position in pixels.
		* @public
		*/
		scrollTo: function (x, y) {
			if (this.scrollNode) {
				this.setScrollLeft(x);
				this.setScrollTop(y);
			}
		},

		/** 
		* Ensures that the given node is visible in the [scroller's]{@link enyo.Scroller} viewport.
		*
		* @param {Node} node - The node to make visible in the [scroller's]{@link enyo.Scroller}
		*	viewport.
		* @param {Boolean} alignWithTop - If `true`, the node is aligned with the top of the
		*	scroller.
		* @public
		*/
		scrollToNode: function (node, alignWithTop) {
			if (this.scrollNode) {
				var sb = this.getScrollBounds();
				var n = node;
				var b = {height: n.offsetHeight, width: n.offsetWidth, top: 0, left: 0};
				while (n && n.parentNode && n.id != this.scrollNode.id) {
					b.top += n.offsetTop;
					b.left += n.offsetLeft;
					n = n.parentNode;
				}
				// By default, the element is scrolled to align with the top of the scroll area.
				this.setScrollTop(Math.min(sb.maxTop, alignWithTop === false ? b.top - sb.clientHeight + b.height : b.top));
				this.setScrollLeft(Math.min(sb.maxLeft, alignWithTop === false ? b.left - sb.clientWidth + b.width : b.left));
			}
		},

		/**
		* Scrolls the given [control]{@link enyo.Control} into view.
		*
		* @param {enyo.Control} ctl - The [control]{@link enyo.Control} to make visible in the
		*	[scroller's]{@link enyo.Scroller} viewport.
		* @param {Boolean} alignWithTop - If `true`, the node is aligned with the top of the
		*	scroller.
		* @public
		*/
		scrollIntoView: function (ctl, alignWithTop) {
			if (ctl.hasNode()) {
				ctl.node.scrollIntoView(alignWithTop);
			}
		},
		isInView: function(inNode) {
			var sb = this.getScrollBounds();
			var ot = inNode.offsetTop;
			var oh = inNode.offsetHeight;
			var ol = inNode.offsetLeft;
			var ow = inNode.offsetWidth;
			return (ot >= sb.top && ot + oh <= sb.top + sb.clientHeight) && (ol >= sb.left && ol + ow <= sb.left + sb.clientWidth);
		},

		/**
		* Sets the vertical scroll position.
		*
		* @param {Number} top - The vertical scroll position in pixels.
		* @public
		*/
		setScrollTop: function (top) {
			this.scrollTop = top;
			if (this.scrollNode) {
				this.scrollNode.scrollTop = this.scrollTop;
			}
		},

		/**
		* Sets the horizontal scroll position.
		*
		* @param {Number} left - The horizontal scroll position in pixels.
		* @public
		*/
		setScrollLeft: function (left) {
			this.scrollLeft = left;
			if (this.scrollNode) {
				this.scrollNode.scrollLeft = this.scrollLeft;
			}
		},

		/**
		* Retrieves the horizontal scroll position.
		*
		* @returns {Number} The horizontal scroll position in pixels.
		* @public
		*/
		getScrollLeft: function () {
			return this.scrollNode ? this.scrollNode.scrollLeft : this.scrollLeft;
		},

		/**
		* Retrieves the vertical scroll position.
		*
		* @returns {Number} The vertical scroll position in pixels.
		* @private
		*/
		getScrollTop: function () {
			return this.scrollNode ? this.scrollNode.scrollTop : this.scrollTop;
		},

		/**
		* @private
		*/
		_getScrollBounds: function () {
			var s = this.getScrollSize(), cn = this.container.hasNode();
			var b = {
				left: this.getScrollLeft(),
				top: this.getScrollTop(),
				clientHeight: cn ? cn.clientHeight : 0,
				clientWidth: cn ? cn.clientWidth : 0,
				height: s.height,
				width: s.width
			};
			b.maxLeft = Math.max(0, b.width - b.clientWidth);
			b.maxTop = Math.max(0, b.height - b.clientHeight);
			return b;
		},

		/**
		* @private
		*/
		getScrollSize: function () {
			var n = this.scrollNode;
			return {width: n ? n.scrollWidth : 0, height: n ? n.scrollHeight : 0};
		},

		/**
		* Retrieves the scroll boundaries of the [scroller]{@link enyo.Scroller}.
		* 
		* @returns {enyo.Scroller~BoundaryObject} An [object]{@glossary Object} describing the 
		*	scroll boundaries.
		* @public
		*/
		getScrollBounds: function () {
			return this._getScrollBounds();
		},

		/**
		* @private
		*/
		calcStartInfo: function () {
			var sb = this.getScrollBounds();
			var y = this.getScrollTop(), x = this.getScrollLeft();
			this.canVertical = sb.maxTop > 0 && this.vertical != 'hidden';
			this.canHorizontal = sb.maxLeft > 0 && this.horizontal != 'hidden';
			this.startEdges = {
				top: y === 0,
				bottom: y === sb.maxTop,
				left: x === 0,
				right: x === sb.maxLeft
			};
		},

		// NOTE: down, move, and drag handlers are needed only for native touch scrollers

		/**
		* @private
		*/
		shouldDrag: function (e) {
			var requestV = e.vertical;
			return (requestV && this.canVertical  || !requestV && this.canHorizontal) /*&& !this.isOobVerticalScroll(event)*/;
		},

		/**
		* @private
		*/
		dragstart: function (sender, e) {
			this.dragging = this.shouldDrag(e);
			if (this.dragging) {
				return this.preventDragPropagation;
			}
		},

		/**
		* @private
		*/
		dragfinish: function (sender, e) {
			if (this.dragging) {
				this.dragging = false;
				e.preventTap();
			}
		},

		/**
		* Avoid allowing scroll when starting at a vertical boundary to prevent iOS from window 
		* scrolling.
		* 
		* @private
		*/
		down: function (sender, e) {
			if (this.isScrolling()) {
				e.preventTap();
			}
			this.calcStartInfo();
		},

		/**
		* NOTE: Mobile native [scrollers]{@link enyo.Scroller} need `touchmove`. Indicate this by 
		* setting the `requireTouchmove` property to `true`.
		* 
		* @private
		*/
		move: function (sender, e) {
			if (e.which && (this.canVertical && e.vertical || this.canHorizontal && e.horizontal)) {
				e.disablePrevention();
			}
		},

		/**
		* @private
		*/
		mousewheel: function (sender, e) {
			//* We disable mouse wheel scrolling by preventing the default
			if (!this.useMouseWheel) {
				e.preventDefault();
			}
		},

		/**
		* @private
		*/
		domScroll: function(sender, e) {
			if (!this._scrolling) {
				this.doScrollStart();
			}
			this._scrolling = true;
			this.startJob('stopScrolling', function() {
				this._scrolling = false;
				this.doScrollStop();
			}, 100);
		},

		/**
		* @public
		*/
		isScrolling: function() {
			return this._scrolling;
		}
	});

})(enyo, this);
