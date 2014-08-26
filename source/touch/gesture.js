(function (enyo, scope) {

	/**
	* The extended {@glossary event} [object]{@glossary Object} that is provided when we
	* emulate iOS gesture events on non-iOS devices.
	*
	* @typedef {Object} enyo.gesture~EmulatedGestureEvent
	* @property {Number} pageX - The x-coordinate of the center point between fingers.
	* @property {Number} pageY - The y-coordinate of the center point between fingers.
	* @property {Number} rotation - The degrees of rotation from the beginning of the gesture.
	* @property {Number} scale - The percent change of distance between fingers.
	*/
	
	/**
	* @private
	*/
	if (!enyo.platform.gesture && enyo.platform.touch) {
		enyo.dispatcher.features.push(function(e) {
			if (handlers[e.type]) {
				touchGestures[e.type](e);
			}
		});
	}

	/**
	* @private
	*/
	var handlers = {
		touchstart: true,
		touchmove: true,
		touchend: true
	};

	/**
	* @private
	*/
	var touchGestures = {

		/**
		* @private
		*/
		orderedTouches: [],

		/**
		* @private
		*/
		gesture: null,

		/**
		* @private
		*/
		touchstart: function (e) {
			// some devices can send multiple changed touches on start and end
			var i,
				changedTouches = e.changedTouches,
				length = changedTouches.length;

			for (i = 0; i < length; i++) {
				var id = changedTouches[i].identifier;

				// some devices can send multiple touchstarts
				if (enyo.indexOf(id, this.orderedTouches) < 0) {
					this.orderedTouches.push(id);
				}
			}

			if (e.touches.length >= 2 && !this.gesture) {
				var p = this.gesturePositions(e);

				this.gesture = this.gestureVector(p);
				this.gesture.angle = this.gestureAngle(p);
				this.gesture.scale = 1;
				this.gesture.rotation = 0;
				var g = this.makeGesture('gesturestart', e, {vector: this.gesture, scale: 1, rotation: 0});
				enyo.dispatch(g);
			}
		},

		/**
		* @private
		*/
		touchend: function (e) {
			// some devices can send multiple changed touches on start and end
			var i,
				changedTouches = e.changedTouches,
				length = changedTouches.length;

			for (i = 0; i < length; i++) {
				enyo.remove(changedTouches[i].identifier, this.orderedTouches);
			}

			if (e.touches.length <= 1 && this.gesture) {
				var t = e.touches[0] || e.changedTouches[e.changedTouches.length - 1];

				// gesture end sends last rotation and scale, with the x/y of the last finger
				enyo.dispatch(this.makeGesture('gestureend', e, {vector: {xcenter: t.pageX, ycenter: t.pageY}, scale: this.gesture.scale, rotation: this.gesture.rotation}));
				this.gesture = null;
			}
		},

		/**
		* @private
		*/
		touchmove: function (e) {
			if (this.gesture) {
				var g = this.makeGesture('gesturechange', e);
				this.gesture.scale = g.scale;
				this.gesture.rotation = g.rotation;
				enyo.dispatch(g);
			}
		},

		/**
		* @private
		*/
		findIdentifiedTouch: function (touches, id) {
			for (var i = 0, t; (t = touches[i]); i++) {
				if (t.identifier === id) {
					return t;
				}
			}
		},

		/**
		* @private
		*/
		gesturePositions: function (e) {
			var first = this.findIdentifiedTouch(e.touches, this.orderedTouches[0]);
			var last = this.findIdentifiedTouch(e.touches, this.orderedTouches[this.orderedTouches.length - 1]);
			var fx = first.pageX, lx = last.pageX, fy = first.pageY, ly = last.pageY;
			// center the first touch as 0,0
			var x = lx - fx, y = ly - fy;
			var h = Math.sqrt(x*x + y*y);
			return {x: x, y: y, h: h, fx: fx, lx: lx, fy: fy, ly: ly};
		},

		/**
		* Finds rotation angle.
		* 
		* @private
		*/
		gestureAngle: function (positions) {
			var p = positions;
			// yay math!, rad -> deg
			var a = Math.asin(p.y / p.h) * (180 / Math.PI);
			// fix for range limits of asin (-90 to 90)
			// Quadrants II and III
			if (p.x < 0) {
				a = 180 - a;
			}
			// Quadrant IV
			if (p.x > 0 && p.y < 0) {
				a += 360;
			}
			return a;
		},

		/**
		* Finds bounding box.
		* 
		* @private
		*/
		gestureVector: function (positions) {
			// the least recent touch and the most recent touch determine the bounding box of the gesture event
			var p = positions;
			// center the first touch as 0,0
			return {
				magnitude: p.h,
				xcenter: Math.abs(Math.round(p.fx + (p.x / 2))),
				ycenter: Math.abs(Math.round(p.fy + (p.y / 2)))
			};
		},

		/**
		* @private
		*/
		makeGesture: function (type, e, cache) {
			var vector, scale, rotation;
			if (cache) {
				vector = cache.vector;
				scale = cache.scale;
				rotation = cache.rotation;
			} else {
				var p = this.gesturePositions(e);
				vector = this.gestureVector(p);
				scale = vector.magnitude / this.gesture.magnitude;
				// gestureEvent.rotation is difference from the starting angle, clockwise
				rotation = (360 + this.gestureAngle(p) - this.gesture.angle) % 360;
			}
			var event = enyo.clone(e);
			return enyo.mixin(event, {
				type: type,
				scale: scale,
				pageX: vector.xcenter,
				pageY: vector.ycenter,
				rotation: rotation
			});
		}
	};

})(enyo, this);
