/**
	_enyo.Sprite_ is a basic animation component.  Call _play()_ to start
	the animation.  The animation will run for the period of time (in milliseconds)
	specified by its _duration_, subject to its _timingFunction_ and _direction_.
*/
enyo.kind({
	name: "enyo.SpriteAnimation",
	//* @public
	published: {
		//* Default value used if the animation has no _duration_ specified
		src: "",
		//* The amount of miliseconds your animation will run
		duration: 5000,
		//* The width of a single sprite-cell image
		width: 100,
		//* The height of a single sprite-cell image
		height: 100,
		//* How many rows of sprites-cells do you have?
		rows: 1,
		//* How many columns of sprites-cells do you have?
		columns: 2,
		//* Accepts any valid CSS animation-iteration-count value. Defaults to "infinite" (looping forever)
		iterationCount: "infinite",
		/*
			cellOrientation indicates whether the cells are horizontally
			laid-out (default) or vertically laid-out. Ex:
				Horizontal:
					[1][2]
					[3][4]
				Vertical:
					[1][3]
					[2][4]
		*/
		cellOrientation: "horizontal",
		/**
			Apply an offset to the coordinates of the first sprite,
			normally this can be left at 0x0, but if you have multiple sprites
			in a single image file, or there's a padding around your image, 
			specify the amount of pixels using offsetTop and offsetLeft.
		*/
		offsetTop: 0,
		offsetLeft: 0,

		animationName: function() { return this.get("id") + "_keyframes"; },
		totalWidth: function() { return this.get("offsetLeft") + this.get("width") * this.get("columns"); },
		totalHeight: function() { return this.get("offsetTop") + this.get("height") * this.get("rows"); },
		steps: function() { return (this.get("cellOrientation") == "horizontal") ? this.get("columns") : this.get("rows"); }
	},
	components: [
		{kind: "enyo.Image", name: "spriteImage", mixins: ["enyo.StylesheetSupport"], sizing: "cover", styles: "background-size: initial;"}
	],
	bindings: [
		{from: ".src", to: ".$.spriteImage.src"}
	],
	computed: {
		"animationName": ["id"],
		"totalWidth": ["offsetLeft", "width", "columns"],
		"totalHeight": ["offsetTop", "height", "rows"],
		"steps": ["cellOrientation", "columns", "rows"]
	},
	observers: {
		setSize: ["width", "height", "totalWidth", "totalHeight"],
		setOffset: ["offsetTop", "offsetLeft"],
		_applyAnimation: ["iterationCount", "cellOrientation", "columns", "rows", "id"],
		updateKeyframes: ["cellOrientation", "width", "height", "totalWidth", "totalHeight", "columns", "rows", "offsetTop", "offsetLeft"]
	},
	//* @protected

	////////// PUBLIC //////////
	create: function() {
		this.inherited(arguments);
		
		this.setSize();
		this.updateKeyframes();
		this._applyAnimation();
	},
	durationChanged: function() {
		this.$.spriteImage.applyStyle("-webkit-animation-duration", (this.get("duration") / 1000) + "s");
		this._forceAnimationReset();
	},
	setSize: function() {
		this.applyStyle("width", this.get("width") + "px");
		this.applyStyle("height", this.get("height") + "px");
		this.applyStyle("overflow", "hidden");

		this.$.spriteImage.applyStyle("width", this.get("totalWidth") + "px");
		this.$.spriteImage.applyStyle("height", this.get("totalHeight") + "px");
	},
	setOffset: function() {
		this.$.spriteImage.applyStyle("background-position", this.get("offsetTop") + "px " + this.get("offsetLeft") + "px");
	},
	updateKeyframes: function() {
		this.$.spriteImage.set("stylesheetContent", this._generateKeyframes());
		this._forceAnimationReset();
	},
	_forceAnimationReset: function() {
		this.$.spriteImage.applyStyle("-webkit-animation-name", null);
		this.startJob("forceAnimationReset", function() {
			this.$.spriteImage.applyStyle("-webkit-animation-name", this.get("animationName"));
		}, 100);	// This long delay is needed to force webkit to un-set and re-set the animation.
	},
	_applyAnimation: function() {
		this.$.spriteImage.applyStyle("-webkit-animation-timing-function", "steps(" + this.get("steps") + ", start)");
		this.$.spriteImage.applyStyle("-webkit-animation-iteration-count", this.get("iterationCount"));
		this.durationChanged();
	},
	_generateKeyframes: function() {
		var o,
			width = this.get("width"),
			height = this.get("height"),
			rows = this.get("rows"),
			cols = this.get("columns"),
			horiz = this.get("cellOrientation") == "horizontal" ? true : false,
			kfStr = "",
			outer = (horiz ? rows : cols);

		kfStr += "@-webkit-keyframes "+ this.get("animationName") +" {\n";
		for (o = 0; o < outer; o++) {
			kfStr += this._generateKeyframe(
				// percent
				((o / outer) ? ((o / outer) + 0.0001) : 0),
				// startX
				horiz ? width : (-width * o),
				// startY
				horiz ? (-height * o) : height
			);
			kfStr += this._generateKeyframe(
				// percent
				((o+1) / outer),
				// endX
				horiz ? ((-width * cols) + width) : (-width * o),
				// endY
				horiz ? (-height * o) : ((-height * rows) + height)
			);
		}
		kfStr += "}\n";
		return kfStr;
	},
	_generateKeyframe: function(inPercent, inX, inY) {
		return (inPercent * 100) +"%	{ -webkit-transform: translateZ(0) translateX("+ inX +"px)   translateY("+ inY +"px); }\n";
	}
});
