/**
	_enyo.Drawer_ is a control that appears or disappears based on its _open_
	property. By default, the drawer appears or disappears with a sliding
	animation whose direction is determined by the _orient_ property.

	For more information, see the documentation on
	[Drawers](building-apps/layout/drawers.html) in the Enyo Developer Guide.
*/

enyo.kind({
	name: "enyo.Drawer",
	published: {
		//* The visibility state of the drawer's associated control
		open : true,
		/**
			Direction of the opening/closing animation--either "v" for vertical
			or "h" for horizontal
		*/
		orient : "v",
		//* If true, the opening/closing transition will be animated
		animated : true,
		/**
			If true, Drawer will resize it's container as it's animating, which is useful
			when placed inside of a FittableLayout
		*/
		resizeContainer: true
	},
	events: {
		/**
			Fires when the drawer has been opened or closed. The handler can determine
			whether the drawer was just opened or just closed based on the _open_
			property. If _this.getOpen()_ returns true, the drawer was opened; if not,
			it was closed.
		*/
		onDrawerAnimationStep: "",
		onDrawerAnimationEnd: ""
	},
	//* @protected
	style: "overflow: hidden; position: relative;",
	tools: [
		{kind: "Animator", onStep: "animatorStep", onEnd: "animatorEnd"},
		{name: "client", style: "position: relative;", classes: "enyo-border-box"}
	],
	create: enyo.inherit(function (sup) {
		return function() {
			sup.apply(this, arguments);
			this.animatedChanged();
			this.openChanged();
		};
	}),
	initComponents: enyo.inherit(function (sup) {
		return function() {
			this.createChrome(this.tools);
			sup.apply(this, arguments);
		};
	}),
	animatedChanged: function() {
		if (!this.animated && this.hasNode() && this.$.animator.isAnimating()) {
			this.$.animator.stop();
			this.animatorEnd();
		}
	},
	openChanged: function() {
		this.$.client.show();
		if (this.hasNode()) {
			if (this.$.animator.isAnimating()) {
				this.$.animator.reverse();
			} else {
				var v = this.orient == "v";
				var d = v ? "height" : "width";
				var p = v ? "top" : "left";
				// unfixing the height/width is needed to properly
				// measure the scrollHeight/Width DOM property, but
				// can cause a momentary flash of content on some browsers
				this.applyStyle(d, null);
				var s = this.hasNode()[v ? "scrollHeight" : "scrollWidth"];
				if (this.animated) {
					this.$.animator.play({
						startValue: this.open ? 0 : s,
						endValue: this.open ? s : 0,
						dimension: d,
						position: p
					});
				} else {
					// directly run last frame if not animating
					this.animatorEnd();
				}
			}
		} else {
			this.$.client.setShowing(this.open);
		}
	},
	animatorStep: function(inSender) {
		// the actual drawer DOM node adjusts its height
		if (this.hasNode()) {
			var d = inSender.dimension;
			this.node.style[d] = this.domStyles[d] = inSender.value + "px";
		}
		// while the client inside the drawer adjusts its position to move out of the visible area
		var cn = this.$.client.hasNode();
		if (cn) {
			var p = inSender.position;
			var o = (this.open ? inSender.endValue : inSender.startValue);
			cn.style[p] = this.$.client.domStyles[p] = (inSender.value - o) + "px";
		}
		if (this.container && this.resizeContainer) {
			this.container.resized();
		}
		this.doDrawerAnimationStep();
		return true;
	},
	animatorEnd: function() {
		if (!this.open) {
			this.$.client.hide();
		}
		else {
			// save changes to this.domCssText --> see ENYO-1561
			this.$.client.domCssText = enyo.Control.domStylesToCssText(this.$.client.domStyles);
			// at end of open animation, clean limit on height/width
			var v = (this.orient == "v");
			var d = v ? "height" : "width";
			var p = v ? "top" : "left";
			var cn = this.$.client.hasNode();
			// clear out changes to container position & node dimension
			if (cn) {
				cn.style[p] = this.$.client.domStyles[p] = null;
			}
			if (this.node) {
				this.node.style[d] = this.domStyles[d] = null;
			}
		}
		if (this.container && this.resizeContainer) {
			this.container.resized();
		}
		this.doDrawerAnimationEnd();
		return true;
	}
});
