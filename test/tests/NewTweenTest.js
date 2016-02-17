var expect = chai.expect;

var
    kind = require('enyo/kind'),
    Control = require('enyo/Control'),
    Scene = require('enyo/AnimationSupport/Scene'),
    Vector = require('enyo/AnimationSupport/Vector'),
    Tween = require('enyo/AnimationSupport/Tween');

var b = 0,
    c = 1;

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

var translateScene = Scene({
    animation: {
        translate: "100, 0, 0"
    },
    duration: 100
});

var rotateScene = Scene({
    animation: {
        rotate: "100, 0, 0"
    },
    duration: 100
});

var traverseScene = Scene({
    animation: {
        path: [[0,0,0],[0,-50,0],[50,-50,0],[50,50,0],[0,50,0]]
    },
    duration: 100
});


describe("Tween", function() {
    var TestControl, testControl;
    before(function () {
        TestControl = kind({
            name: 'TestControl',
            kind: Control,
            components: [{
                name: "childDiv",
            }]
        });

        testControl = new TestControl({parentNode: document.body});
        
    });

    after(function () {
        testControl.destroy();
        TestControl = null;
    });

    describe("Tween.init", function() {

        it("should return undefined when called without any parameters", function() {
            var scene = Tween.init();
            expect(scene).to.equal(undefined);
        });

        it("should return undefined when pose have no animation property", function() {
            var scene = Tween.init(1, 1);
            expect(scene).to.equal(undefined);
        });

        it("should return object with keys include '_startAnim' and '_endAnim'", function() {
            testControl.render();
            Scene.link(testControl.$.childDiv, translateScene);
            var pose = translateScene.getAnimation(0);
            pose = Tween.init(testControl.$.childDiv, pose);
            expect(pose).to.have.any.keys('_startAnim', '_endAnim');
        });
    });

    describe("Tween.step", function() {

        it("should return undefined when called without any parameters", function() {
            var scene = Tween.step();
            expect(scene).to.equal(undefined);
        });

        it("should return undefined when pose have no animation property", function() {
            var scene = Tween.step(1, 1);
            expect(scene).to.equal(undefined);
        });

        it("DOM should be at initial position at t = -0.1", function() {
            testControl.render();
            Scene.link(testControl.$.childDiv, translateScene);
            var pose = translateScene.getAnimation(0);
            pose = Tween.init(testControl.$.childDiv, pose);
            Tween.step(testControl.$.childDiv, pose, -0.1, 100);
            var m = parseMatrix(testControl.$.childDiv.node.style.transform);
            expect(m).to.deep.equal([1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1]);
        });

        it("DOM should be at initial position at t = 0", function() {
            testControl.render();
            Scene.link(testControl.$.childDiv, translateScene);
            var pose = translateScene.getAnimation(0);
            pose = Tween.init(testControl.$.childDiv, pose);
            Tween.step(testControl.$.childDiv, pose, 0, 100);
            var m = parseMatrix(testControl.$.childDiv.node.style.transform);
            expect(m).to.deep.equal([1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1]);
        });

        it("DOM should not be at initial position at t = 0.1", function() {
            testControl.render();
            Scene.link(testControl.$.childDiv, translateScene);
            var pose = translateScene.getAnimation(0);
            pose = Tween.init(testControl.$.childDiv, pose);
            Tween.step(testControl.$.childDiv, pose, 0.1, 100);
            var m = parseMatrix(testControl.$.childDiv.node.style.transform);
            expect(m).to.not.deep.equal([1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1]);
        });

        it("DOM should not be at final position at t = 0.9", function() {
            testControl.render();
            Scene.link(testControl.$.childDiv, translateScene);
            var pose = translateScene.getAnimation(0);
            pose = Tween.init(testControl.$.childDiv, pose);
            Tween.step(testControl.$.childDiv, pose, 0.9, 100);
            var m = parseMatrix(testControl.$.childDiv.node.style.transform);
            expect(m).to.not.deep.equal([1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 100, 0, 0, 1]);
        });

        it("DOM should be at final position at t = 1", function() {
            testControl.render();
            Scene.link(testControl.$.childDiv, translateScene);
            var pose = translateScene.getAnimation(0);
            pose = Tween.init(testControl.$.childDiv, pose);
            Tween.step(testControl.$.childDiv, pose, 1, 100);
            var m = parseMatrix(testControl.$.childDiv.node.style.transform);
            expect(m).to.deep.equal([1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 100, 0, 0, 1]);
        });

        it("DOM should be at final position at t = 1.1", function() {
            testControl.render();
            Scene.link(testControl.$.childDiv, translateScene);
            var pose = translateScene.getAnimation(0);
            pose = Tween.init(testControl.$.childDiv, pose);
            Tween.step(testControl.$.childDiv, pose, 1.1, 100);
            var m = parseMatrix(testControl.$.childDiv.node.style.transform);
            expect(m).to.deep.equal([1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 100, 0, 0, 1]);
        });

        it("DOM should be at final position at t = 0 if d = 0", function() {
            testControl.render();
            Scene.link(testControl.$.childDiv, translateScene);
            var pose = translateScene.getAnimation(0);
            pose = Tween.init(testControl.$.childDiv, pose);
            Tween.step(testControl.$.childDiv, pose, 0, 0);
            var m = parseMatrix(testControl.$.childDiv.node.style.transform);
            expect(m).to.deep.equal([1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 100, 0, 0, 1]);
        });

        it("DOM should be at final position at t = 1 if d = 0", function() {
            testControl.render();
            Scene.link(testControl.$.childDiv, translateScene);
            var pose = translateScene.getAnimation(0);
            pose = Tween.init(testControl.$.childDiv, pose);
            Tween.step(testControl.$.childDiv, pose, 1, 0);
            var m = parseMatrix(testControl.$.childDiv.node.style.transform);
            expect(m).to.deep.equal([1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 100, 0, 0, 1]);
        });
    });
    
    describe("Tween.lerp", function() {

        it("should return undefined when called without any parameters", function() {
            var m = Tween.lerp();
            expect(m).to.equal(undefined);
        });

        it("should return '_startAnim.translate' matrix when t = 0", function() {
            testControl.render();
            Scene.link(testControl.$.childDiv, translateScene);
            var pose = translateScene.getAnimation(0);
            pose = Tween.init(testControl.$.childDiv, pose);
            var m = Tween.lerp(pose._startAnim.translate, pose._endAnim.translate, 0);
            expect(m).to.deep.equal(pose._startAnim.translate);
        });

        it("should return '_endAnim.translate' matrix when t = 1", function() {
            testControl.render();
            Scene.link(testControl.$.childDiv, translateScene);
            var pose = translateScene.getAnimation(0);
            pose = Tween.init(testControl.$.childDiv, pose);
            var m = Tween.lerp(pose._startAnim.translate, pose._endAnim.translate, 1);
            expect(m).to.deep.equal(pose._endAnim.translate);
        });
    });
    
    describe("Tween.slerp", function() {

        it("should return undefined when called without any parameters", function() {
            var m = Tween.slerp();
            expect(m).to.equal(undefined);
        });

        it("should return '_startAnim.rotate' matrix when t = 0", function() {
            testControl.render();
            Scene.link(testControl.$.childDiv, rotateScene);
            var pose = rotateScene.getAnimation(0);
            pose = Tween.init(testControl.$.childDiv, pose);
            var poseEndAnimToQuant = Vector.toQuant(pose._endAnim.rotate);
            var m = Tween.slerp(pose._startAnim.rotate, poseEndAnimToQuant, 0);
            expect(m).to.deep.equal(pose._startAnim.rotate);
        });

        it("should return '_endAnim.rotate' matrix when t = 1", function() {
            testControl.render();
            Scene.link(testControl.$.childDiv, rotateScene);
            var pose = rotateScene.getAnimation(0);
            pose = Tween.init(testControl.$.childDiv, pose);
            var poseEndAnimToQuant = Vector.toQuant(pose._endAnim.rotate);
            var m = Tween.slerp(pose._startAnim.rotate, poseEndAnimToQuant, 1);
            expect(m).to.deep.equal(poseEndAnimToQuant);
        });
    });
    
    describe("Tween.bezier", function() {

        it("should return undefined when called without any parameters", function() {
            var m = Tween.bezier();
            expect(m).to.equal(undefined);
        });

        it("should return '_startAnim.translate' matrix when t = 0", function() {
            testControl.render();
            Scene.link(testControl.$.childDiv, translateScene);
            var pose = translateScene.getAnimation(0);
            pose = Tween.init(testControl.$.childDiv, pose);
            var bezierPoints = Tween.bezierPoints({20: 60, 80: 40}, pose._startAnim.translate, pose._endAnim.translate);
            var m = Tween.bezier(0, bezierPoints);
            expect(m).to.deep.equal(pose._startAnim.translate);
        });

        it("should return '_endAnim.translate' matrix when t = 1", function() {
            testControl.render();
            Scene.link(testControl.$.childDiv, translateScene);
            var pose = translateScene.getAnimation(0);
            pose = Tween.init(testControl.$.childDiv, pose);
            var bezierPoints = Tween.bezierPoints({20: 60, 80: 40}, pose._startAnim.translate, pose._endAnim.translate);
            var m = Tween.bezier(1, bezierPoints);
            expect(m).to.deep.equal(pose._endAnim.translate);
        });
    });
    
    describe("Tween.bezierPoints", function() {

        it("should return undefined when called without any parameters", function() {
            var m = Tween.bezierPoints();
            expect(m).to.equal(undefined);
        });

        it("should return '_startAnim.translate' on array[0]", function() {
            testControl.render();
            Scene.link(testControl.$.childDiv, translateScene);
            var pose = translateScene.getAnimation(0);
            pose = Tween.init(testControl.$.childDiv, pose);
            var m = Tween.bezierPoints({20: 60, 80: 40}, pose._startAnim.translate, pose._endAnim.translate);
            expect(m[0]).to.deep.equal(pose._startAnim.translate);
        });

        it("should return '_endAnim.translate' on array[3]", function() {
            testControl.render();
            Scene.link(testControl.$.childDiv, translateScene);
            var pose = translateScene.getAnimation(0);
            pose = Tween.init(testControl.$.childDiv, pose);
            var m = Tween.bezierPoints({20: 60, 80: 40}, pose._startAnim.translate, pose._endAnim.translate);
            expect(m[3]).to.deep.equal(pose._endAnim.translate);
        });
    });
    
    describe("Tween.traversePath", function() {

        it("should return undefined when called without any parameters", function() {
            var m = Tween.traversePath();
            expect(m).to.equal(undefined);
        });

        it("should return initial path array value when t = 0", function() {
            testControl.render();
            /*Scene.link(testControl.$.childDiv, traverseScene);
            var pose = traverseScene.getAnimation(0);
            pose = Tween.init(testControl.$.childDiv, pose);*/
            var m = Tween.traversePath(0, [[0,0,0],[0,-50,0],[50,-50,0],[50,50,0],[0,50,0]]);
            expect(m).to.deep.equal([0,0,0]);
        });

        it("should return final path array when t = 1", function() {
            testControl.render();
            var m = Tween.traversePath(1, [[0,0,0],[0,-50,0],[50,-50,0],[50,50,0],[0,50,0]]);
            expect(m).to.deep.equal([0,50,0]);
        });
    });

    describe("Tween.bezierSpline", function() {

        it("should return undefined when called without any parameters", function() {
            var m = Tween.bezierSpline();
            expect(m).to.equal(undefined);
        });

        it("should return '_startAnim.rotate' matrix when t = 0", function() {
            testControl.render();
            Scene.link(testControl.$.childDiv, rotateScene);
            var pose = rotateScene.getAnimation(0);
            pose = Tween.init(testControl.$.childDiv, pose);
            var poseEndAnimToQuant = Vector.toQuant(pose._endAnim.rotate);
            var bezierSPoints = Tween.bezierSPoints({20: 60, 80: 40}, pose._startAnim.rotate, poseEndAnimToQuant, "100, 0, 0");
            var m = Tween.bezierSpline(0, bezierSPoints);
            expect(m).to.deep.equal(pose._startAnim.rotate);
        });

        it("should return '_endAnim.rotate' matrix when t = 1", function() {
            testControl.render();
            Scene.link(testControl.$.childDiv, rotateScene);
            var pose = rotateScene.getAnimation(0);
            pose = Tween.init(testControl.$.childDiv, pose);
            var poseEndAnimToQuant = Vector.toQuant(pose._endAnim.rotate);
            var bezierSPoints = Tween.bezierSPoints({20: 60, 80: 40}, pose._startAnim.rotate, poseEndAnimToQuant, "100, 0, 0");
            var m = Tween.bezierSpline(1, bezierSPoints);
            expect(m).to.deep.equal(poseEndAnimToQuant);
        });
    });
    
    describe("Tween.bezierSPoints", function() {

        it("should return undefined when called without any parameters", function() {
            var m = Tween.bezierSPoints();
            expect(m).to.equal(undefined);
        });

        it("should return '_startAnim.rotate' on array[0][0]", function() {
            testControl.render();
            Scene.link(testControl.$.childDiv, rotateScene);
            var pose = rotateScene.getAnimation(0);
            pose = Tween.init(testControl.$.childDiv, pose);
            var poseEndAnimToQuant = Vector.toQuant(pose._endAnim.rotate);
            var m = Tween.bezierSPoints({20: 60, 80: 40}, pose._startAnim.rotate, poseEndAnimToQuant, "100, 0, 0");
            expect(m[0][0]).to.deep.equal(pose._startAnim.rotate);
        });

        it("should return '_endAnim.rotate' on array[1][3]", function() {
            testControl.render();
            Scene.link(testControl.$.childDiv, rotateScene);
            var pose = rotateScene.getAnimation(0);
            pose = Tween.init(testControl.$.childDiv, pose);
            var poseEndAnimToQuant = Vector.toQuant(pose._endAnim.rotate);
            var m = Tween.bezierSPoints({20: 60, 80: 40}, pose._startAnim.rotate, poseEndAnimToQuant, "100, 0, 0");
            expect(m[1][3]).to.deep.equal(poseEndAnimToQuant);
        });
    });
});