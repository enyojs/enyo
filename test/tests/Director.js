var expect = chai.expect;
var trialactor1 = "actorOne";
var trialactor2 = "actorTwo";

describe("Director", function() {

    describe ("Roll Method",function () {

        it("Director should have Roll method", function() {
            expect(Director).to.respondTo('roll');
        });

        it("Calling Roll method with no argument throw error", function() {
            expect(Director.roll).to.throw(Error,'No arguments Passed');
        });

        it("Passing ungenerated scene to roll method return 'scene.active' as true", function() {
            var scene = Scene({});
            Scene.link(trialactor1, scene);
            Director.roll(scene);
            expect(scene.active).to.equal(true);
        });

        it("Passing generated scene to roll method return 'scene.active' as false", function() {
            var scene = Scene({});
            var actor = document.getElementById('demo_actor');
            actor.generated = true;
            actor.hasNode = function() {
    	          return this.generated && (this.node || this.findNodeById());
            }
            actor.findNodeById = function() {
        		return this;
        	}
            Scene.link(actor, scene);
            Director.roll(scene);
            expect(scene.active).to.equal(false);
        });

    });

    describe("Take Method",function () {

        it("Director should have Take method", function() {
            expect(Director).to.respondTo('take');
        });

        it("Calling take method with no argument throw error", function() {
            expect(Director.take).to.throw(Error,'No arguments Passed');
        });

        it("Passing generated scene and setting framespeed return 'scene.animating' as true", function() {
            var scene = Scene({});
            scene.addAnimation({
                rotate: "180, 10, 10"
            }, 1000);
            var actor = document.getElementById('demo_actor');
            actor.generated = true;
            actor.hasNode = function() {
    	          return this.generated && (this.node || this.findNodeById());
            }
            actor.findNodeById = function() {
        		return this;
        	}
            actor.node = actor;
            Scene.link(actor, scene);
            scene.generated = true;
            scene._frameSpeed = 1;

            Director.take(scene,50);
            expect(scene.animating).to.equal(true);
        });

        it("Passing non-generated scene and setting framespeed as 0 to take method return 'scene.animating' as false", function() {
            var scene = Scene({});
            scene.addAnimation({
                rotate: "180, 10, 10"
            }, 1000);
            var actor = document.getElementById('demo_actor');
            actor.generated = true;
            actor.hasNode = function() {
    	          return this.generated && (this.node || this.findNodeById());
            }
            actor.findNodeById = function() {
        		return this;
        	}
            actor.node = actor;
            Scene.link(actor, scene);
            scene.generated = false;
            Director.take(scene,50);
            expect(scene.animating).to.equal(false);
        });

        it("Passing 'scene._frameSpeed = 0' return 'scene.active' as false", function() {
            var scene = Scene({});
            var actor = {name:'actor',generated:true};
            Scene.link(actor, scene);
            scene.generated = true;
            Director.take(scene,5);
            expect(scene.animating).to.equal(false);
        });

        it("when scene.totalSpan is lesser than ts, return 'scene.animating' as true", function() {
            var scene = Scene({});
            scene.addAnimation({
                rotate: "180, 10, 10"
            }, 1000);
            var actor = document.getElementById('demo_actor');
            actor.generated = true;
            actor.hasNode = function() {
    	          return this.generated && (this.node || this.findNodeById());
            }
            actor.findNodeById = function() {
        		return this;
        	}
            actor.node = actor;
            Scene.link(actor, scene);
            scene.generated = true;
            scene._frameSpeed = 1;
            Director.take(scene,50);
            expect(scene.animating).to.equal(true);
        });

        it("when scene.totalSpan is greater than ts, return 'scene.animating' as false", function() {
            var scene = Scene({});
            scene.addAnimation({
                rotate: "180, 10, 10"
            }, 100);
            var actor = {name:'actor',generated:true};
            Scene.link(actor, scene);
            scene.generated = true;
            scene._frameSpeed = 1;
            Director.take(scene,1000);
            expect(scene.animating).to.equal(false);
        });

        it("when ts is greater than 'scene.totalSpan', then  'scene.timeline' is equal to total scene duration", function() {
            var scene = Scene({});
            scene.addAnimation({
                rotate: "180, 10, 10"
            }, 100);
            var actor = document.getElementById('demo_actor');
            actor.generated = true;
            actor.hasNode = function() {
    	          return this.generated && (this.node || this.findNodeById());
            }
            actor.findNodeById = function() {
        		return this;
        	}
            actor.node = actor;
            Scene.link(actor, scene);
            scene.generated = true;
            scene._frameSpeed = 1;
            Director.take(scene,1000);
            expect(scene.timeline).to.equal(100);
        });
    });

    describe("Action Method",function () {

        it("Director should have 'action' method", function() {
            expect(Director).to.respondTo('action');
        });

        it("Calling action method with no argument throw error", function() {
            expect(Director.action).to.throw(Error,'No arguments Passed');
        });

        it("Scene.currentAnimPosIndex should be 0 by default",function () {
            var scene = Scene({});
            expect(scene.currentAnimPosIndex).to.equal(0);
        });

        it("At animPos index 0, previous duration of scene should be zero",function () {
            var scene = Scene({});
            scene.addAnimation({
                rotate: "180, 10, 10"
            }, 100);
            scene.addAnimation({
                translate: "180, 10, 10"
            }, 100);
            var actor = document.getElementById('demo_actor');
            actor.generated = true;
            actor.hasNode = function() {
    	          return this.generated && (this.node || this.findNodeById());
            }
            actor.findNodeById = function() {
        		return this;
        	}
            actor.node = actor;
            Director.action(actor, scene, 50);
            expect(scene.prevDur).to.equal(0);
        });

        it("At animPos index n, previous duration of scene should be duration of index (n-1)",function () {
            var scene = Scene({});
            scene.addAnimation({
                rotate: "180, 10, 10"
            }, 100);
            scene.addAnimation({
                translate: "180, 10, 10"
            }, 100);
            var actor = document.getElementById('demo_actor');
            actor.generated = true;
            actor.hasNode = function() {
    	          return this.generated && (this.node || this.findNodeById());
            }
            actor.findNodeById = function() {
        		return this;
        	}
            actor.node = actor;
            Director.action(actor, scene, 150);
            expect(scene.prevDur).to.equal(100);
        });

    });

    describe("cut Method",function () {

        it("Director should have 'cut' method", function() {
            expect(Director).to.respondTo('cut');
        });

        it("Calling cut method with no argument throw error", function() {
            expect(Director.action).to.throw(Error,'No arguments Passed');
        });

    });

    describe("cast Method",function () {

        it("Director should have 'cast' method", function() {
            expect(Director).to.respondTo('cast');
        });

        it("Calling cast method with no argument throw error", function() {
            expect(Director.cast).to.throw(Error,'No arguments Passed');
        });

        it("calling cast method should link the actors to the scene", function() {
            var scene = Scene({});
            Director.cast('actor1',scene);
            Director.cast('actor2',scene);

            var obj = scene.rolePlays;
            var firstValue = obj[Object.keys(obj)[0]];
            var v1 = firstValue[Object.keys(firstValue)[0]];
            var v2 = firstValue[Object.keys(firstValue)[1]];
            expect(v1).to.equal("actor1");
        });

    });

    describe("reject Method",function () {

        it("Director should have 'reject' method", function() {
            expect(Director).to.respondTo('reject');
        });

        it("Calling reject method with no argument throw error", function() {
            expect(Director.reject).to.throw(Error,'No arguments Passed');
        });

        it("calling reject method should delink the actors from the scene", function() {
            var scene = Scene({});
            Scene.link('actor1', scene);
            Scene.link('actor2', scene);
            Director.reject(scene,'actor1');
            var obj = scene.rolePlays;
            var firstValue = obj[Object.keys(obj)[0]];
            var v1 = firstValue[Object.keys(firstValue)[0]];
            var v2 = firstValue[Object.keys(firstValue)[1]];
            expect(v1).to.not.equal("actor1");
        });

    });

    describe('First shot Method',function () {

        it("Director should have 'firstShot' method", function() {
            expect(Director).to.respondTo('firstShot');
        });

        it("Calling firstShot method with no argument throw error", function() {
            expect(Director.firstShot).to.throw(Error,'No arguments Passed');
        });

        it('actor._initialPose must be equal to frame.getComputedProperty',function () {
            var actor = document.getElementById('demo_actor');
            actor.generated = true;
            actor.hasNode = function() {
    	          return this.generated && (this.node || this.findNodeById());
            }
            actor.findNodeById = function() {
        		return this;
        	}
            actor.node = actor;

            var frame_computedProperty = Frame.getComputedProperty(actor, undefined);
            frame_computedProperty.duration = 0;
            Director.firstShot(actor);
            expect(actor._initialPose).eql(frame_computedProperty);
        });

        it('actor._initialPoses should have keys of "_startAnim","_endAnim","_transform","currentState","matrix","props","duration"',function () {
            var actor = document.getElementById('demo_actor');
            actor.generated = true;
            actor.hasNode = function() {
                  return this.generated && (this.node || this.findNodeById());
            }
            actor.findNodeById = function() {
                return this;
            }
            actor.node = actor;
            Director.firstShot(actor);
            expect(actor._initialPose).to.have.all.keys('_startAnim', '_endAnim','_transform','currentState','matrix','props','duration');
        });

    });

    describe("shot Method",function () {

        it("Director should have 'shot' method", function() {
            expect(Director).to.respondTo('shot');
        });

        it("Calling action method with no argument throw error", function() {
            expect(Director.shot).to.throw(Error,'No arguments Passed');
        });
        
    });

    describe('Angle Method',function () {

        it("Director should have 'reject' method", function() {
            expect(Director).to.respondTo('angle');
        });

        it("Calling Angle method with no argument should return 'dX'", function() {
            expect(Director.angle()).to.equal('dX');
        });

        it("Calling Angle method with argument 'X' should return 'dX'", function() {
            expect(Director.angle('X')).to.equal('dX');
        });

        it("Calling Angle method with argument 'Y' should return 'dX'", function() {
            expect(Director.angle('Y')).to.equal('dY');
        });

        it("Calling Angle method with argument 'Z' should return 'dZ'", function() {
            expect(Director.angle('Z')).to.equal('dZ');
        });

    });

});
