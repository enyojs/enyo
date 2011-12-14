/**
A virtual base class for anything with a range and position
within that range, like a <a href="#enyo.ProgressBar">ProgressBar</a> or
<a href="#enyo.Slider">Slider</a>.

To set the progress, do this:

	madeProgress: function(inValue) {
		this.$.progress.setPosition(inValue);
	}

The default range is 0-100, but it can be customized like so:

	{kind: "Progress", minimum: 50, maximum: 220, position: 70}

This will make a progress with a range of 50-220 and an initial position of 70.
*/
enyo.kind({
	name: "enyo.Progress",
	kind: enyo.Control,
	published: {
		/** The maximum value of the range. */
		maximum: 100,
		/** The minimum value of the range. */
		minimum: 0,
		/** The current progress. */
		position: 0,
		/** The position will be rounded to a multiple of this property. */
		snap: 1
	},
	lastPosition: -1,
	statified: {
		lastPosition: 0
	},
	//* @protected
	create: function() {
		this.inherited(arguments);
		this.positionChanged();
	},
	positionChanged: function(inOldPosition) {
		this.position = this.calcNormalizedPosition(this.position);
		if (this.lastPosition != this.position) {
			this.applyPosition();
			this.lastPosition = this.position;
		}
	},
	applyPosition: function() {
	},
	calcNormalizedPosition: function(inPosition) {
		inPosition = Math.max(this.minimum, Math.min(this.maximum, inPosition));
		return Math.round(inPosition / this.snap) * this.snap;
	},
	calcRange: function() {
		return this.maximum - this.minimum;
	},
	calcPercent: function(inPosition) {
		return Math.round(100 * (inPosition - this.minimum) / this.calcRange());
	},
	calcPositionByPercent: function(inPercent) {
		return (inPercent/100) * this.calcRange() + this.minimum;
	}
});
