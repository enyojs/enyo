// gesture feature
/**
 enyo.gesture is an event filter for enyo dispatcher.
 There are no public methods defined here.
 */

//* @public
enyo.gesture = {
	//* @protected
	holdDelay: 200,
	minFlick: 0.1,
	eventProps: ["target", "relatedTarget", "clientX", "clientY", "pageX", "pageY", "screenX", "screenY", "altKey", "ctrlKey", "metaKey", "shiftKey",
		"detail", "identifier", "dispatchTarget"],
	makeEvent: function(inType, inEvent) {
		var e = {type: inType};
		for (var i=0, p; p=this.eventProps[i]; i++) {
			e[p] = inEvent[p];
		}
		return e;
	},
	down: function(inEvent) {
		var e = this.makeEvent("down", inEvent);
		enyo.dispatch(e);
		this.startTracking(e);
		this.downTarget = e.target;
		this.dispatchTarget = e.dispatchTarget;
		this.beginHold(e);
	},
	move: function(inEvent) {
		this.cancelHold();
		var e = this.makeEvent("move", inEvent);
		enyo.dispatch(e);
		if (this.trackInfo) {
			this.track(e);
		}
	},
	up: function(inEvent) {
		this.cancelHold();
		var e = this.makeEvent("up", inEvent);
		var tapPrevented = false;
		e.preventTap = function() {
			tapPrevented = true;
		};
		this.endTracking(e);
		enyo.dispatch(e);
		if (!tapPrevented) {
			this.sendTap(e);
		}
	},
	startTracking: function(e) {
		this.trackInfo = {};
		this.flickable = false;
		this.track(e);
	},
	track: function(inEvent) {
		//this.flickable = false;
		var ti = this.trackInfo;
		var s = ti.last;
		if (s) {
			// setting max hz to 120 helps avoid spaz data
			var dt = ti.dt = Math.max(8, new Date().getTime() - s.time);
			var x = ti.vx = (inEvent.pageX - s.x) / dt;
			var y = ti.vy = (inEvent.pageY - s.y) / dt;
			var v = ti.v = Math.sqrt(x*x + y*y);
			this.flickable = v > this.minFlick;
		}
		ti.last = {x: inEvent.pageX, y: inEvent.pageY, time: new Date().getTime()};
	},
	endTracking: function(e) {
		if (this.flickable && this.trackInfo) {
			this.sendFlick(e);
		}
		this.trackInfo = null;
	},
	over: function(inEvent) {
		enyo.dispatch(this.makeEvent("enter", inEvent));
	},
	out: function(inEvent) {
		enyo.dispatch(this.makeEvent("leave", inEvent));
	},
	beginHold: function(inEvent) {
		this.holdStart = new Date().getTime();
		this.holdJob = setInterval(enyo.bind(this, "sendHold", inEvent), this.holdDelay);
	},
	cancelHold: function() {
		clearInterval(this.holdJob);
		this.holdJob = null;
	},
	sendHold: function(inEvent) {
		var e = this.makeEvent("hold", inEvent);
		e.holdTime = new Date().getTime() - this.holdStart;
		enyo.dispatch(e);
	},
	sendTap: function(inEvent) {
		// The common ancestor for the down/up pair is the origin for the tap event
		var p = this.findCommonAncestor(this.dispatchTarget, inEvent.dispatchTarget);
		var t = p && p.hasNode();
		if (t) {
			var e = this.makeEvent("tap", inEvent);
			e.target = t;
			enyo.dispatch(e);
		}
	},
	findCommonAncestor: function(inA, inB) {
		var p = inB;
		while (p) {
			if (inA.isDescendantOf(p)) {
				return p;
			}
			p = p.parent;
		}
	},
	sendFlick: function(inEvent) {
		var e = this.makeEvent("flick", inEvent);
		e.xVelocity = this.trackInfo.vx;
		e.yVelocity = this.trackInfo.vy;
		e.velocity = this.trackInfo.v;
		e.target = this.downTarget;
		enyo.dispatch(e);
	}
};

//* @protected
enyo.dispatcher.features.push(
	function(e) {
		// NOTE: beware of properties in enyo.gesture inadvertantly mapped to event types
		if (enyo.gesture.events[e.type]) {
			return enyo.gesture.events[e.type](e);
		}
	}
);

enyo.gesture.events = {
	mousedown: function(e) {
		enyo.gesture.down(e);
	},
	mouseup: function(e) {
		enyo.gesture.up(e);
	},
	mousemove:  function(e) {
		enyo.gesture.move(e);
	},
	mouseover:  function(e) {
		enyo.gesture.over(e);
	},
	mouseout:  function(e) {
		enyo.gesture.out(e);
	}
}