//* @protected
enyo.requiresWindow(function() {
	// add touch-specific gesture feature
	var gesture = enyo.gesture;
	//
	gesture.events.touchstart = function(e) {
		gesture.events = touchGesture;
		gesture.events.touchstart(e);
	}
	//
	var touchGesture = {
		// FIXME: for touchmove to fire on Android, must prevent touchstart event.
		// However, it's problematic to systematize this because preventing touchstart
		// stops native scrolling and prevents focus changes.
		touchstart: function(inEvent) {
			var e = this.makeEvent(inEvent);
			gesture.down(e);
			this.overEvent = e;
			gesture.over(e);
		},
		touchmove: function(inEvent) {
			var e = this.makeEvent(inEvent);
			gesture.move(e);
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
			gesture.out(this.overEvent);
			gesture.up(this.makeEvent(inEvent));
		},
		makeEvent: function(inEvent) {
			var e = enyo.clone(inEvent.changedTouches[0]);
			e.target = this.findTarget(null, e.pageX, e.pageY);
			//console.log("target for " + inEvent.type + " at " + e.pageX + ", " + e.pageY + " is " + (e.target ? e.target.id : "none"));
			return e;
		},
		// NOTE: will find only 1 element under the touch and 
		// will fail if an element is positioned outside the bounding box of its parent
		findTarget: function(inNode, inX, inY) {
			var n = inNode || document.body;
			if (n.getBoundingClientRect) {
				var o = n.getBoundingClientRect();
				var x = inX - o.left;
				var y = inY - o.top;
				//console.log("test: " + n.id + " (" + o.left + ", " + o.top + ")");
				if (x>0 && y>0 && x<=o.width && y<=o.height) {
					//console.log("IN: " + n.id + " -> [" + x + "," + y + " in " + o.width + "x" + o.height + "] (children: " + n.childNodes.length + ")");
					var target;
					for (var n$=n.childNodes, i=n$.length-1, c; c=n$[i]; i--) {
						target = this.findTarget(c, inX, inY);
						if (target) {
							return target;
						}
					}
					return n;
				}
			}
		},
		connect: function() {
			document.ontouchstart = enyo.dispatch;
			document.ontouchmove = enyo.dispatch;
			document.ontouchend = enyo.dispatch;
			document.ongesturestart = enyo.dispatch;
			document.ongesturechange = enyo.dispatch;
			document.ongestureend = enyo.dispatch;
		}
	};
	//
	touchGesture.connect();
});