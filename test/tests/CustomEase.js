/*jslint white: true*/
var
    kind = require('enyo/kind'),
    Control = require('enyo/Control');

var parseMatrix = function(v) {
    var m = [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1];
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
var parseValue = function(val) {
    return val.toString().split(",").map(function(v) {
        return parseFloat(v, 10);
    });
};


describe("Easing Animation with custom ease values", function() {
    var TestControl, testControl;
    before(function() {
        TestControl = kind({
            name: 'TestControl',
            kind: Control,
            id: 'TESTCONTROL1',
            components: [{
                name: "test",
                animate: {
                    translate: "100, 0, 0"
                },
                duration: 100,
                ease: {
                    30: 50,
                    80: -10
                }
            }]
        });
        testControl = new TestControl({
            parentNode: document.body
        });

    });

    after(function() {
        testControl.destroy();
        TestControl = null;
    });

    describe("Position of easing element with reference to time ", function() {
        it("should be at final Position after easing animation with custom values on time", function(done) {
            testControl.render();
            testControl.$.test.start(true);
            testControl.$.test.completed = function() {
                var m = parseMatrix(testControl.$.test.node.style.transform);
                expect(m[12]).to.equal(100);
                done();
            };
        });

        it("should slide right covering 80% animation when the time is 30%", function(done) {
            testControl.$.test.addAnimation({
                translate: "-100, 0, 0"
            });
            testControl.$.test.start(true);
            testControl.$.test.animationStep = function(t) {
                if (t > 0.2 && t < 0.4 ) {
                    var m = parseMatrix(testControl.$.test.node.style.transform);
                    console.log("first case : " + m);
                    expect(m[12] >= -60).to.be.true;                   
                }
            };
            testControl.$.test.completed = function() {
                done();
            };
        });
        it("should slide left to -10% of  animation when the time is 80%", function(done) {
            testControl.$.test.addAnimation({
                translate: "0, 0, 0"
            });
            testControl.$.test.start(true);
            testControl.$.test.animationStep = function(t) {
               if (t > 0.7 && t < 0.9) {
                    var m = parseMatrix(testControl.$.test.node.style.transform);
                    console.log("second case : " + m);
                    expect(m[12]  <-100 ).to.be.true;
                }
            };
            testControl.$.test.completed = function() {
                done();
            };
        });
        
        it("should slide right and should be at final point", function(done) {
            testControl.$.test.addAnimation({
                translate: "100, 0, 0"
            });
            testControl.$.test.start();
            testControl.$.test.animationStep = function(t) {
                if (t >= 1) {
                    var m = parseMatrix(testControl.$.test.node.style.transform);
                    console.log("third case : " + m);
                    expect(m[12]).to.equal(100);
                }
            };
            testControl.$.test.completed = function() {
                done();
            };
        });
    });
});
