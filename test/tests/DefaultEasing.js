var
	kind = require('enyo/kind'),
	Control = require('enyo/Control');

var b = 0,
	c = 1;

var easings = {
	timeCheck: function(t, d) {
		t = t * d;
		return t;
	},
	easeInCubic: function(t, d) {
		t = easings.timeCheck(t, d);
		return c * (t /= d) * t * t + b;
	},
	easeOutCubic: function(t, d) {
		t = easings.timeCheck(t, d);
		return c * ((t = t / d - 1) * t * t + 1) + b;
	}
};

var parseMatrix = function (v) {
	var m = [1,0,0,0,0,1,0,0,0,0,1,0,0,0,0,1];
	v = v.replace(/^\w*\(/, '').replace(')', '');
	v = parseValue(v);
	if (v.length <= 6) {
		m[0] = v[0];
		m[1] = v[1];
		m[4] = v[2];
		m[5] = v[3];
		m[12] = v[4];
		m[13] = v[5];
	} else {
		m = v;
	}
	return m;
};

var parseValue = function (val) {
	return val.toString().split(",").map(function(v) {
		return parseFloat(v, 10);
	});
};

describe("Easing Animation", function() {
	var TestControl, testControl;
	before(function () {
		TestControl = kind({
			name: 'TestControl',
			kind: Control,
			components: [{
				name: "easeIn",
				animate: {translate: "100, 0, 0"},
				duration: 100,
				ease: easings.easeInCubic
			}, {
				name: "easeOut",
				animate: {translate: "100, 0, 0"},
				duration: 100,
				ease: easings.easeOutCubic
			}, {
				name: "linear",
				animate: {translate: "100, 0, 0"},
				duration: 100
			}]
		});

		testControl = new TestControl({parentNode: document.body});
		
	});

	after(function () {
		testControl.destroy();
		TestControl = null;
	});

	describe("ease-in timing function", function() {
		it("should be at final Position after easing animation on time", function(done) {
			testControl.render();
			testControl.$.easeIn.start(true);
			testControl.$.easeIn.completed = function() {
				var m = parseMatrix(testControl.$.easeIn.node.style.transform);
				expect(m[12]).to.equal(100);
				done();
			};
		});

		it("should not be a linear curve", function(done) {
			testControl.$.easeIn.addAnimation({translate: "0, 0, 0"});
			testControl.$.easeIn.start(true);
			testControl.$.easeIn.animationStep = function(t) {
				if(t !== 1) {
					var m = parseMatrix(testControl.$.easeIn.node.style.transform);
					var distance = ((100 - m[12]) / 100).toFixed(4);
					expect(distance !== t.toFixed(4)).to.be.true;
				}
			};
			testControl.$.easeIn.completed = function() {
				//To complete the animation
				done();
			};
		});

		it("should satisfy the equation (d = t^3 i.e easeInCubic curve) in interval [0, 1]", function(done) {
			testControl.$.easeIn.addAnimation({translate: "100, 0, 0"});
			testControl.$.easeIn.start(true);
			testControl.$.easeIn.animationStep = function(t) {
				var m = parseMatrix(testControl.$.easeIn.node.style.transform);
				var distance = (m[12] / 100).toFixed(4);
				expect(distance === (t * t * t).toFixed(4)).to.be.true;
			};
			testControl.$.easeIn.completed = function() {
				//To complete the animation
				done();
			};
		});
	});

	describe("ease-out timing function", function() {
		it("should be at final Position after easing animation on time", function(done) {
			// testControl.render();
			testControl.$.easeOut.start(true);
			testControl.$.easeOut.completed = function() {
				var m = parseMatrix(testControl.$.easeOut.node.style.transform);
				expect(m[12]).to.equal(100);
				done();
			};
		});

		it("should not be a linear curve", function(done) {
			testControl.$.easeOut.addAnimation({translate: "0, 0, 0"});
			testControl.$.easeOut.start(true);
			testControl.$.easeOut.animationStep = function(t) {
				if(t !== 1) {
					var m = parseMatrix(testControl.$.easeOut.node.style.transform);
					var distance = ((100 - m[12]) / 100).toFixed(4);
					expect(distance !== t.toFixed(4)).to.be.true;
				}
			};
			testControl.$.easeOut.completed = function() {
				//To complete the animation
				done();
			};
		});

		it("should satisfy the equation (d = ((t-1)^3) + 1 i.e easeOutCubic curve) in interval [0, 1]", function(done) {
			testControl.$.easeOut.addAnimation({translate: "100, 0, 0"});
			testControl.$.easeOut.start(true);
			testControl.$.easeOut.animationStep = function(t) {
				var m = parseMatrix(testControl.$.easeOut.node.style.transform);
				var distance = (m[12] / 100).toFixed(4);
				expect(distance === ((--t * t * t) + 1).toFixed(4)).to.be.true;
			};
			testControl.$.easeOut.completed = function() {
				//To complete the animation
				done();
			};
		});
	});

	describe("when no easing given (linear animation)", function() {
		it("should be at final Position after easing animation on time", function(done) {
			// testControl.render();
			testControl.$.linear.start(true);
			testControl.$.linear.completed = function() {
				var m = parseMatrix(testControl.$.linear.node.style.transform);
				expect(m[12]).to.equal(100);
				done();
			};
		});

		it("should be a linear i.e d/t = 1", function(done) {
			testControl.$.linear.addAnimation({translate: "0, 0, 0"});
			testControl.$.linear.start(true);
			testControl.$.linear.animationStep = function(t) {
				if(t !== 1) {
					var m = parseMatrix(testControl.$.linear.node.style.transform);
					var distance = ((100 - m[12]) / 100).toFixed(3);
					console.log(distance, t.toFixed(3));
					expect(distance === t.toFixed(3)).to.be.true;
				}
			};
			testControl.$.linear.completed = function() {
				//To complete the animation
				done();
			};
		});
	});
});