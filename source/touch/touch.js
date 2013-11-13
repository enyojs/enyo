//* @protected
enyo.requiresWindow(function() {
	// add touch-specific gesture feature
	var gesture = enyo.gesture;
	var oldevents = gesture.events;
	//
	gesture.events.touchstart = function(e) {
		// for duration of this touch, only handle touch events.  Old event
		// structure will be restored during touchend.
		gesture.events = touchGesture;
		gesture.events.touchstart(e);
	};
	//
	var touchGesture = {
		_touchCount: 0,
		touchstart: function(inEvent) {
			this._touchCount += inEvent.changedTouches.length;
			this.excludedTarget = null;
			var e = this.makeEvent(inEvent);
			gesture.down(e);
			// generate a new event object since over is a different event
			e = this.makeEvent(inEvent);
			this.overEvent = e;
			gesture.over(e);
		},
		touchmove: function(inEvent) {
			enyo.job.stop("resetGestureEvents");
			// NOTE: allow user to supply a node to exclude from event
			// target finding via the drag event.
			var de = gesture.drag.dragEvent;
			this.excludedTarget = de && de.dragInfo && de.dragInfo.node;
			var e = this.makeEvent(inEvent);
			gesture.move(e);
			// prevent default document scrolling if enyo.bodyIsFitting == true
			// avoid window scrolling by preventing default on this event
			// note: this event can be made unpreventable (native scrollers do this)
			if (enyo.bodyIsFitting) {
				inEvent.preventDefault();
			}
			// synthesize over and out (normally generated via mouseout)
			if (this.overEvent && this.overEvent.target != e.target) {
				this.overEvent.relatedTarget = e.target;
				e.relatedTarget = this.overEvent.target;
				gesture.out(this.overEvent);
				gesture.over(e);
			}
			this.overEvent = e;
		},
		touchend: function(inEvent) {
			gesture.up(this.makeEvent(inEvent));
			// NOTE: in touch land, there is no distinction between
			// a pointer enter/leave and a drag over/out.
			// While it may make sense to send a leave event when a touch
			// ends, it does not make sense to send a dragout.
			// We avoid this by processing out after up, but
			// this ordering is ad hoc.
			gesture.out(this.overEvent);
			// reset the event handlers back to the mouse-friendly ones after
			// a short timeout. We can't do this directly in this handler
			// because it messes up Android to handle the mouseup event.
			// FIXME: for 2.1 release, conditional on platform being
			// desktop Chrome, since we're seeing issues in PhoneGap with this
			// code.
			this._touchCount -= inEvent.changedTouches.length;
		},
		// use mouseup after touches are done to reset event handling back to default
		// --this works as long as no one did a preventDefault on the touch events
		mouseup: function() {
			if (this._touchCount === 0) {
				this.sawMousedown = false;
				gesture.events = oldevents;
			}
		},
		makeEvent: function(inEvent) {
			var e = enyo.clone(inEvent.changedTouches[0]);
			e.srcEvent = inEvent;
			e.target = this.findTarget(e);
			// normalize "mouse button" info
			e.which = 1;
			//enyo.log("target for " + inEvent.type + " at " + e.pageX + ", " + e.pageY + " is " + (e.target ? e.target.id : "none"));
			return e;
		},
		calcNodeOffset: function(inNode) {
			if (inNode.getBoundingClientRect) {
				var o = inNode.getBoundingClientRect();
				return {
					left: o.left,
					top: o.top,
					width: o.width,
					height: o.height
				};
			}
		},
		findTarget: function(e) {
			return document.elementFromPoint(e.clientX, e.clientY);
		},
		// NOTE: will find only 1 element under the touch and
		// will fail if an element is positioned outside the bounding box of its parent
		findTargetTraverse: function(inNode, inX, inY) {
			var n = inNode || document.body;
			var o = this.calcNodeOffset(n);
			if (o && n != this.excludedTarget) {
				var x = inX - o.left;
				var y = inY - o.top;
				//enyo.log("test: " + n.id + " (left: " + o.left + ", top: " + o.top + ", width: " + o.width + ", height: " + o.height + ")");
				if (x>0 && y>0 && x<=o.width && y<=o.height) {
					//enyo.log("IN: " + n.id + " -> [" + x + "," + y + " in " + o.width + "x" + o.height + "] (children: " + n.childNodes.length + ")");
					var target;
					for (var n$=n.childNodes, i=n$.length-1, c; (c=n$[i]); i--) {
						target = this.findTargetTraverse(c, inX, inY);
						if (target) {
							return target;
						}
					}
					return n;
				}
			}
		},
		connect: function() {
			enyo.forEach(['touchstart', 'touchmove', 'touchend', 'gesturestart', 'gesturechange', 'gestureend'], function(e) {
				if(enyo.platform.ie < 9){
					document["on" + e] = enyo.dispatch;
				} else {
					// on iOS7 document.ongesturechange is never called
					document.addEventListener(e, enyo.dispatch, false);
				}
			});

			if (enyo.platform.androidChrome <= 18 || enyo.platform.silk === 2) {
				// HACK: on Chrome for Android v18 on devices with higher density displays,
				// document.elementFromPoint expects screen coordinates, not document ones
				// bug also appears on Kindle Fire HD
				this.findTarget = function(e) {
					return document.elementFromPoint(e.screenX, e.screenY);
				};
			} else if (!document.elementFromPoint) {
				this.findTarget = function(e) {
					return this.findTargetTraverse(null, e.clientX, e.clientY);
				};
			}
		}
	};
	//
	touchGesture.connect();
});
