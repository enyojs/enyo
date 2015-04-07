(function (enyo, scope) {
	/**
	* Fires when a scrolling action starts.
	*
	* @event enyo.ScrollMath#onScrollStart
	* @type {Object}
	* @property {Object} sender - The [component]{@link enyo.Component} that most recently 
	*	propagated the {@glossary event}.
	* @property {enyo.Scroller~ScrollEvent} event - An [object]{@glossary Object} containing 
	*	event information.
	* @private
	*/

	/**
	* Fires while a scrolling action is in progress.
	*
	* @event enyo.ScrollMath#onScroll
	* @type {Object}
	* @property {Object} sender - The [component]{@link enyo.Component} that most recently 
	*	propagated the {@glossary event}.
	* @property {enyo.Scroller~ScrollEvent} event - An [object]{@glossary Object} containing 
	*	event information.
	* @private
	*/

	/**
	* Fires when a scrolling action stops.
	*
	* @event enyo.ScrollMath#onScrollStop
	* @type {Object}
	* @property {Object} sender - The [component]{@link enyo.Component} that most recently 
	*	propagated the {@glossary event}.
	* @property {enyo.Scroller~ScrollEvent} event - An [object]{@glossary Object} containing 
	*	event information.
	* @private
	*/

	/**
	* {@link enyo.ScrollMath} implements a scrolling dynamics simulation. It is a
	* helper [kind]{@glossary kind} used by other [scroller]{@link enyo.Scroller}
	* kinds, such as {@link enyo.TouchScrollStrategy}.
	* 
	* `enyo.ScrollMath` is not typically created in application code.
	*
	* @class enyo.ScrollMath
	* @protected
	*/
	enyo.kind(
		/** @lends enyo.ScrollMath.prototype */ {

		/**
		* @private
		*/
		name: 'enyo.ScrollMath',

		/**
		* @private
		*/
		kind: 'enyo.Component',

		/**
		* @private
		*/
		published: 
			/** @lends enyo.ScrollMath.prototype */ {

			/** 
			* Set to `true` to enable vertical scrolling.
			*
			* @type {Boolean}
			* @default true
			* @private
			*/
			vertical: true,

			/** 
			* Set to `true` to enable horizontal scrolling.
			*
			* @type {Boolean}
			* @default true
			* @private
			*/
			horizontal: true
		},

		/**
		* @private
		*/
		events: {
			onScrollStart: '',
			onScroll: '',
			onScrollStop: '',
			onStabilize: ''
		},

		/**
		* "Spring" damping returns the scroll position to a value inside the boundaries. Lower 
		* values provide faster snapback.
		*
		* @private
		*/
		kSpringDamping: 0.93,

		/** 
		* "Drag" damping resists dragging the scroll position beyond the boundaries. Lower values 
		* provide more resistance.
		*
		* @private
		*/
		kDragDamping: 0.5,
		
		/** 
		* "Friction" damping reduces momentum over time. Lower values provide more friction.
		*
		* @private
		*/
		kFrictionDamping: 0.97,

		/** 
		* Additional "friction" damping applied when momentum carries the viewport into overscroll. 
		* Lower values provide more friction.
		*
		* @private
		*/
		kSnapFriction: 0.9,
		
		/** 
		* Scalar applied to `flick` event velocity.
		*
		* @private
		*/
		kFlickScalar: 15,

		/** 
		* Limits the maximum allowable flick. On Android > 2, we limit this to prevent compositing 
		* artifacts.
		*
		* @private
		*/
		kMaxFlick: enyo.platform.android > 2 ? 2 : 1e9,
		
		/** 
		* The value used in [friction()]{@link enyo.ScrollMath#friction} to determine if the delta 
		* (e.g., y - y0) is close enough to zero to consider as zero.
		*
		* @private
		*/
		kFrictionEpsilon: enyo.platform.webos >= 4 ? 1e-1 : 1e-2,
		
		/** 
		* Top snap boundary, generally `0`.
		*
		* @private
		*/
		topBoundary: 0,
		
		/** 
		* Right snap boundary, generally `(viewport width - content width)`.
		*
		* @private
		*/
		rightBoundary: 0,
		
		/** 
		* Bottom snap boundary, generally `(viewport height - content height)`.
		*
		* @private
		*/
		bottomBoundary: 0,
		
		/** 
		* Left snap boundary, generally `0`.
		*
		* @private
		*/
		leftBoundary: 0,
		
		/** 
		* Animation time step.
		*
		* @private
		*/
		interval: 20,
		
		/** 
		* Flag to enable frame-based animation; if `false`, time-based animation is used.
		*
		* @private
		*/
		fixedTime: true,

		/**
		* Simulation state.
		*
		* @private
		*/
		x0: 0,

		/**
		* Simulation state.
		*
		* @private
		*/
		x: 0,

		/**
		* Simulation state.
		*
		* @private
		*/
		y0: 0,

		/**
		* Simulation state.
		*
		* @private
		*/
		y: 0,

		/**
		* @method
		* @private
		*/
		destroy: enyo.inherit(function (sup) {
			return function() {
				this.stop();
				sup.apply(this, arguments);
			};
		}),

		/**
		* Simple Verlet integrator for simulating Newtonian motion.
		*
		* @private
		*/
		verlet: function () {
			var x = this.x;
			this.x += x - this.x0;
			this.x0 = x;
			//
			var y = this.y;
			this.y += y - this.y0;
			this.y0 = y;
		},

		/**
		* Boundary damping function. Returns damped `value` based on `coeff` on one side of 
		* `origin`.
		*
		* @private
		*/
		damping: function (val, origin, coeff, sign) {
			var kEpsilon = 0.5;
			//
			// this is basically just value *= coeff (generally, coeff < 1)
			//
			// 'sign' and the conditional is to force the damping to only occur
			// on one side of the origin.
			//
			var dv = val - origin;
			// Force close-to-zero to zero
			if (Math.abs(dv) < kEpsilon) {
				return origin;
			}
			return val*sign > origin*sign ? coeff * dv + origin : val;
		},

		/**
		* Dual-boundary damping function. Returns damped `value` based on `coeff` when exceeding 
		* either boundary.
		*
		* @private
		*/
		boundaryDamping: function (val, aBoundary, bBoundary, coeff) {
			return this.damping(this.damping(val, aBoundary, coeff, 1), bBoundary, coeff, -1);
		},

		/**
		* Simulation constraints (spring damping occurs here).
		*
		* @private
		*/
		constrain: function () {
			var y = this.boundaryDamping(this.y, this.topBoundary, this.bottomBoundary, this.kSpringDamping);
			if (y != this.y) {
				// ensure snapping introduces no velocity, add additional friction
				this.y0 = y - (this.y - this.y0) * this.kSnapFriction;
				this.y = y;
			}
			var x = this.boundaryDamping(this.x, this.leftBoundary, this.rightBoundary, this.kSpringDamping);
			if (x != this.x) {
				this.x0 = x - (this.x - this.x0) * this.kSnapFriction;
				this.x = x;
			}
		},

		/**
		* The friction function.
		*
		* @private
		*/
		friction: function (ex, ex0, coeff) {
			// implicit velocity
			var dp = this[ex] - this[ex0];
			// let close-to-zero collapse to zero (i.e. smaller than epsilon is considered zero)
			var c = Math.abs(dp) > this.kFrictionEpsilon ? coeff : 0;
			// reposition using damped velocity
			this[ex] = this[ex0] + c * dp;
		},

		/** 
		* One unit of time for simulation.
		*
		* @private
		*/
		frame: 10,
		// piece-wise constraint simulation
		simulate: function (t) {
			while (t >= this.frame) {
				t -= this.frame;
				if (!this.dragging) {
					this.constrain();
				}
				this.verlet();
				this.friction('y', 'y0', this.kFrictionDamping);
				this.friction('x', 'x0', this.kFrictionDamping);
			}
			return t;
		},

		/**
		* @fires enyo.ScrollMath#onScrollStop
		* @private
		*/
		animate: function () {
			this.stop();
			// time tracking
			var t0 = enyo.perfNow(), t = 0;
			// delta tracking
			var x0, y0;
			// animation handler
			var fn = this.bindSafely(function() {
				// wall-clock time
				var t1 = enyo.perfNow();
				// schedule next frame
				this.job = enyo.requestAnimationFrame(fn);
				// delta from last wall clock time
				var dt = t1 - t0;
				// record the time for next delta
				t0 = t1;
				// user drags override animation
				if (this.dragging) {
					this.y0 = this.y = this.uy;
					this.x0 = this.x = this.ux;
					this.endX = this.endY = null;
				}
				// frame-time accumulator
				// min acceptable time is 16ms (60fps)
				t += Math.max(16, dt);
				// prevent snapping to originally desired scroll position if we are in overscroll
				if (this.isInOverScroll()) {
					this.endX = null;
					this.endY = null;
				}
				// alternate fixed-time step strategy:
				else if (this.fixedTime) {
					t = this.interval;
				}
				// consume some t in simulation
				t = this.simulate(t);
				// scroll if we have moved, otherwise the animation is stalled and we can stop
				if (y0 != this.y || x0 != this.x) {
					this.scroll();
				} else if (!this.dragging) {
					// set final values
					if (this.endX != null) {
						this.x = this.x0 = this.endX;
					}
					if (this.endY != null) {
						this.y = this.y0 = this.endY;
					}

					this.stop();
					this.scroll();
					this.doScrollStop();

					this.endX = null;
					this.endY = null;
				}
				y0 = this.y;
				x0 = this.x;
			});
			this.job = enyo.requestAnimationFrame(fn);
		},
		
		/**
		* @private
		*/
		start: function () {
			if (!this.job) {
				this.doScrollStart();
				this.animate();
			}
		},

		/**
		* @private
		*/
		stop: function (fire) {
			var job = this.job;
			if (job) {
				this.job = enyo.cancelRequestAnimationFrame(job);
			}
			if (fire) {
				this.doScrollStop();

				this.endX = undefined;
				this.endY = undefined;
			}
		},

		/**
		* Adjusts the scroll position to be valid, if necessary (e.g., after the scroll contents
		* have changed).
		*
		* @private
		*/
		stabilize: function (opts) {
			var fire = !opts || opts.fire === undefined || opts.fire;
			var y = Math.min(this.topBoundary, Math.max(this.bottomBoundary, this.y));
			var x = Math.min(this.leftBoundary, Math.max(this.rightBoundary, this.x));
			if (y != this.y || x != this.x) {
				this.y = this.y0 = y;
				this.x = this.x0 = x;
				if (fire) {
					this.doStabilize();
				}
			}
		},

		/**
		* @private
		*/
		startDrag: function (e) {
			this.dragging = true;
			//
			this.my = e.pageY;
			this.py = this.uy = this.y;
			//
			this.mx = e.pageX;
			this.px = this.ux = this.x;
		},

		/**
		* @private
		*/
		drag: function (e) {
			var dy, dx, v, h;
			if (this.dragging) {
				v = this.canScrollY();
				h = this.canScrollX();

				dy = v ? e.pageY - this.my : 0;
				this.uy = dy + this.py;
				// provides resistance against dragging into overscroll
				this.uy = this.boundaryDamping(this.uy, this.topBoundary, this.bottomBoundary, this.kDragDamping);
				//
				dx = h ? e.pageX - this.mx : 0;
				this.ux = dx + this.px;
				// provides resistance against dragging into overscroll
				this.ux = this.boundaryDamping(this.ux, this.leftBoundary, this.rightBoundary, this.kDragDamping);
				//
				this.start();
				return true;
			}
		},

		/**
		* @private
		*/
		dragDrop: function () {
			if (this.dragging && !window.PalmSystem) {
				var kSimulatedFlickScalar = 0.5;
				this.y = this.uy;
				this.y0 = this.y - (this.y - this.y0) * kSimulatedFlickScalar;
				this.x = this.ux;
				this.x0 = this.x - (this.x - this.x0) * kSimulatedFlickScalar;
			}
			this.dragFinish();
		},

		/**
		* @private
		*/
		dragFinish: function () {
			this.dragging = false;
		},

		/**
		* @private
		*/
		flick: function (e) {
			var v;
			if (this.canScrollY()) {
				v = e.yVelocity > 0 ? Math.min(this.kMaxFlick, e.yVelocity) : Math.max(-this.kMaxFlick, e.yVelocity);
				this.y = this.y0 + v * this.kFlickScalar;
			}
			if (this.canScrollX()) {
				v = e.xVelocity > 0 ? Math.min(this.kMaxFlick, e.xVelocity) : Math.max(-this.kMaxFlick, e.xVelocity);
				this.x = this.x0 + v * this.kFlickScalar;
			}
			this.start();
		},

		/**
		* TODO: Refine and test newMousewheel, remove this
		* @private
		*/
		mousewheel: function (e) {
			var dy = this.vertical ? e.wheelDeltaY || (!e.wheelDeltaX ? e.wheelDelta : 0) : 0,
				dx = this.horizontal ? e.wheelDeltaX : 0,
				shouldScroll = false;
			if ((dy > 0 && this.y < this.topBoundary) || (dy < 0 && this.y > this.bottomBoundary)) {
				this.y = this.y0 = this.y0 + dy;
				shouldScroll = true;
			}
			if ((dx > 0 && this.x < this.leftBoundary) || (dx < 0 && this.x > this.rightBoundary)) {
				this.x = this.x0 = this.x0 + dx;
				shouldScroll = true;
			}
			this.stop(!shouldScroll);
			if (shouldScroll) {
				this.start();
				return true;
			}
		},

		/**
		* @private
		*/
		newMousewheel: function (e) {
			var wdY = (e.wheelDeltaY === undefined) ? e.wheelDelta : e.wheelDeltaY,
				dY = wdY,
				dX = e.wheelDeltaX,
				canY = this.canScrollY(),
				canX = this.canScrollX(),
				shouldScroll = false,
				m = 2,
				// TODO: Figure out whether we need to port the configurable
				// max / multiplier feature from Moonstone's implementation,
				// and (if so) how
				// max = 100,
				scr = this.isScrolling(),
				ovr = this.isInOverScroll(),
				refY = (scr && this.endY !== null) ? this.endY : this.y,
				refX = (scr && this.endX !== null) ? this.endX : this.x,
				tY = refY,
				tX = refX;

			if (ovr) {
				return true;
			}

			// If we're getting strictly vertical mousewheel events over a scroller that
			// can only move horizontally, the user is probably using a one-dimensional
			// mousewheel and would like us to scroll horizontally instead
			if (dY && !dX && canX && !canY) {
				dX = dY;
				dY = 0;
			}
			
			if (dY && canY) {
				tY = -(refY + (dY * m));
				shouldScroll = true;
			}
			if (dX && canX) {
				tX = -(refX + (dX * m));
				shouldScroll = true;
			}

			if (shouldScroll) {
				this.scrollTo(tX, tY, {allowOverScroll: true});
				return true;
			}
		},

		/**
		* @fires enyo.ScrollMath#onScroll
		* @private
		*/
		scroll: function () {
			this.doScroll();
		},

		// NOTE: Yip/Orvell method for determining scroller instantaneous velocity
		// FIXME: incorrect if called when scroller is in overscroll region
		// because does not account for additional overscroll damping.
		
		/**
		* Scrolls to the specified position.
		*
		* @param {Number} x - The `x` position in pixels.
		* @param {Number} y - The `y` position in pixels.
		* @param {Object} opts - TODO: Document. When behavior == 'instant', we skip animation.
		* @private
		*/
		scrollTo: function (x, y, opts) {
			var animate = !opts || opts.behavior !== 'instant',
				allowOverScroll = opts && opts.allowOverScroll,
				maxX = Math.abs(Math.min(0, this.rightBoundary)),
				maxY = Math.abs(Math.min(0, this.bottomBoundary));

			if (!animate || !allowOverScroll) {
				x = Math.max(0, Math.min(x, maxX));
				y = Math.max(0, Math.min(y, maxY));
			}

			if (-x == this.x && -y == this.y) return;

			if (!animate) {
				this.doScrollStart();
				this.setScrollX(-x);
				this.setScrollY(-y);
				this.doScroll();
				this.doScrollStop();
			}
			else {
				if (y !== null) {
					this.endY = -y;
					this.y = this.y0 - (y + this.y0) * (1 - this.kFrictionDamping);
				}
				if (x !== null) {
					this.endX = -x;
					this.x = this.x0 - (x + this.x0) * (1 - this.kFrictionDamping);
				}
				this.start();
			}
		},

		/**
		* Sets the scroll position along the x-axis.
		*
		* @param {Number} x - The x-axis scroll position in pixels.
		* @method
		* @private
		*/
		setScrollX: function (x) {
			this.x = this.x0 = x;
		},

		/**
		* Sets the scroll position along the y-axis.
		*
		* @param {Number} y - The y-axis scroll position in pixels.
		* @method
		* @private
		*/
		setScrollY: function (y) {
			this.y = this.y0 = y;
		},

		/**
		* Sets the scroll position; defaults to setting this position along the y-axis.
		*
		* @param {Number} pos - The scroll position in pixels.
		* @method
		* @private
		*/
		setScrollPosition: function (pos) {
			this.setScrollY(pos);
		},

		/** 
		* Determines whether or not the [scroller]{@link enyo.Scroller} is actively moving.
		* 
		* @return {Boolean} `true` if actively moving; otherwise, `false`.
		* @private
		*/
		isScrolling: function () {
			return Boolean(this.job);
		},

		canScrollX: function() {
			return this.horizontal && this.rightBoundary < 0;
		},

		canScrollY: function() {
			return this.vertical && this.bottomBoundary < 0;
		},

		/** 
		* Determines whether or not the [scroller]{@link enyo.Scroller} is in overscroll.
		* 
		* @return {Boolean} `true` if in overscroll; otherwise, `false`.
		* @private
		*/
		isInOverScroll: function () {
			return this.job && (this.x > this.leftBoundary || this.x < this.rightBoundary ||
				this.y > this.topBoundary || this.y < this.bottomBoundary);
		}
	});

})(enyo, this);
