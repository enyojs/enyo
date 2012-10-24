/**
	Gesture events: emulates iOS gesture events on non iOS devices
	Event Contents
		- pageX / pageY: center point between fingers
		- rotation: degrees of rotation from beginning of gesture
		- scale: % change of distance between fingers
*/
//* @protected
(function() {
	if (!enyo.platform.gesture && enyo.platform.touch) {
		enyo.dispatcher.features.push(function(e) {
			if (handlers[e.type]) {
				touchGestures[e.type](e);
			}
		});
	}
	var handlers = {
		touchstart: true,
		touchmove: true,
		touchend: true
	};
	var touchGestures = {
		orderedTouches: [],
		gesture: null,
		touchstart: function(inEvent) {
			// some devices can send multiple changed touches on start and end
			enyo.forEach(inEvent.changedTouches, function(t) {
				var id = t.identifier;
				// some devices can send multiple touchstarts
				if (enyo.indexOf(id, this.orderedTouches) < 0) {
					this.orderedTouches.push(id);
				}
			}, this);
			if (inEvent.touches.length >= 2 && !this.gesture) {
				var p = this.gesturePositions(inEvent);
				this.gesture = this.gestureVector(p);
				this.gesture.angle = this.gestureAngle(p);
				this.gesture.scale = 1;
				this.gesture.rotation = 0;
				var g = this.makeGesture("gesturestart", inEvent, {vector: this.gesture, scale: 1, rotation: 0});
				enyo.dispatch(g);
			}
		},
		touchend: function(inEvent) {
			// some devices can send multiple changed touches on start and end
			enyo.forEach(inEvent.changedTouches, function(t) {
				enyo.remove(t.identifier, this.orderedTouches);
			}, this);
			if (inEvent.touches.length <= 1 && this.gesture) {
				var t = inEvent.touches[0] || inEvent.changedTouches[inEvent.changedTouches.length - 1];
				// gesture end sends last rotation and scale, with the x/y of the last finger
				enyo.dispatch(this.makeGesture("gestureend", inEvent, {vector: {xcenter: t.pageX, ycenter: t.pageY}, scale: this.gesture.scale, rotation: this.gesture.rotation}));
				this.gesture = null;
			}
		},
		touchmove: function(inEvent) {
			if (this.gesture) {
				var g = this.makeGesture("gesturechange", inEvent);
				this.gesture.scale = g.scale;
				this.gesture.rotation = g.rotation;
				enyo.dispatch(g);
			}
		},
		findIdentifiedTouch: function(inTouches, inId) {
			for (var i = 0, t; (t = inTouches[i]); i++) {
				if (t.identifier === inId) {
					return t;
				}
			}
		},
		gesturePositions: function(inEvent) {
			var first = this.findIdentifiedTouch(inEvent.touches, this.orderedTouches[0]);
			var last = this.findIdentifiedTouch(inEvent.touches, this.orderedTouches[this.orderedTouches.length - 1]);
			var fx = first.pageX, lx = last.pageX, fy = first.pageY, ly = last.pageY;
			// center the first touch as 0,0
			var x = lx - fx, y = ly - fy;
			var h = Math.sqrt(x*x + y*y);
			return {x: x, y: y, h: h, fx: fx, lx: lx, fy: fy, ly: ly};
		},
		// find rotation angle
		gestureAngle: function(inPositions) {
			var p = inPositions;
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
		// find bounding box
		gestureVector: function(inPositions) {
			// the least recent touch and the most recent touch determine the bounding box of the gesture event
			var p = inPositions;
			// center the first touch as 0,0
			return {
				magnitude: p.h,
				xcenter: Math.abs(Math.round(p.fx + (p.x / 2))),
				ycenter: Math.abs(Math.round(p.fy + (p.y / 2)))
			};
		},
		makeGesture: function(inType, inEvent, inCache) {
			var vector, scale, rotation;
			if (inCache) {
				vector = inCache.vector;
				scale = inCache.scale;
				rotation = inCache.rotation;
			} else {
				var p = this.gesturePositions(inEvent);
				vector = this.gestureVector(p);
				scale = vector.magnitude / this.gesture.magnitude;
				// gestureEvent.rotation is difference from the starting angle, clockwise
				rotation = (360 + this.gestureAngle(p) - this.gesture.angle) % 360;
			}
			var e = enyo.clone(inEvent);
			return enyo.mixin(e, {
				type: inType,
				scale: scale,
				pageX: vector.xcenter,
				pageY: vector.ycenter,
				rotation: rotation
			});
		}
	};
})();
