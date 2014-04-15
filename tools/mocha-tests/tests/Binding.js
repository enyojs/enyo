describe ("Binding", function () {
	describe("Methods", function () {
		describe("#constructor", function () {
			it ("should be a valid constructor", function () {
				expect(enyo.Binding).to.exist.and.to.be.a("function");
				expect(enyo.Binding.prototype).itself.to.have.property("kindName", "enyo.Binding");
			});
			it ("should be the enyo.defaultBindingKind static property", function () {
				expect(enyo.defaultBindingKind).to.exist.and.to.equal(enyo.Binding);
			});
			it ("should return an instance of enyo.Binding", function () {
				var bnd = new enyo.Binding();
				expect(bnd).to.be.an.instanceof(enyo.Binding);
			});
		});
		describe.skip("#isConnected", function () {
		});
		describe.skip("#isReady", function () {
		});
		describe.skip("#connect", function () {
		});
		describe.skip("#disconnect", function () {
		});
		describe.skip("#sync", function () {
		});
		describe.skip("#destroy", function () {
		});
	});
	describe ("Static Methods", function () {
		describe ("~find", function () {
			var bnd = new enyo.Binding();
		
			after (function () {
				bnd.destroy();
			});
		
			it ("should respond to find", function () {
				expect(enyo.Binding).itself.to.respondTo("find");
			});
			it ("should return an instance of a binding if found by its euid", function () {
				expect(enyo.Binding.find(bnd.euid)).to.deep.equal(bnd);
			});
			it ("should return undefined when not found", function () {
				expect(enyo.Binding.find(enyo.uid("b"))).to.be.undefined;
			});
		});
	});
	describe ("Properties", function () {
		describe.skip("#oneWay", function () {
		});
		describe.skip("#connected", function () {
		});
		describe.skip("#owner", function () {
		});
		describe.skip("#autoConnect", function () {
		});
		describe.skip("#autoSync", function () {
		});
		describe.skip("#source", function () {
		});
		describe.skip("#target", function () {
		});
		describe("#from", function () {
			var bnd;
		
			beforeEach (function () {
				bnd = new enyo.Binding();
			});
		
			afterEach (function () {
				bnd.destroy();
			});
		
			it ("should always be a string", function () {
				expect(bnd.from).to.be.a("string");
				bnd.from = {};
				bnd.isReady();
				expect(bnd.from).to.be.a("string");
			});
		});
		describe("#to", function () {
			var bnd;
		
			beforeEach (function () {
				bnd = new enyo.Binding();
			});
		
			afterEach (function () {
				bnd.destroy();
			});
		
			it ("should always be a string", function () {
				expect(bnd.to).to.be.a("string");
				bnd.to = {};
				bnd.isReady();
				expect(bnd.to).to.be.a("string");
			});
		});
		
		describe.skip("#dirty", function () {
		});
		describe("#transform", function () {
			var bnd;
		
			afterEach (function () {
				bnd && bnd.destroy();
			});
		
			it ("should not find a transform if there isn't one provided", function () {
				bnd = new enyo.Binding();
				expect(bnd.transform).to.not.exist;
			});
			it ("should find a transform if it is a function", function () {
				bnd = new enyo.Binding({
					transform: function () {}
				});
				expect(bnd.transform).to.exist.and.to.be.a("function");
				expect(bnd.getTransform()).to.exist.and.to.be.a("function");
			});
			it ("should find a transform if it is a string-global", function () {
				window.xform = function () {};
			
				bnd = new enyo.Binding({
					transform: "xform"
				});
			
				expect(bnd.getTransform()).to.exist.and.to.be.a("function");
				expect(bnd.getTransform()).to.deep.equal(window.xform);
			
				delete window.xform;
			});
			it ("should find a transform if it is a string-owner", function () {
				var obj = new enyo.Object({
					xform: function () {}
				});
			
				bnd = new enyo.Binding({
					owner: obj,
					transform: "xform"
				});
			
				expect(bnd.getTransform()).to.exist.and.to.be.a("function");
				expect(bnd.getTransform()).to.deep.equal(obj.xform);
			
				obj.destroy();
			});
			it ("should find a transform if it is a string-bindingTransformOwner", function () {
				var obj = new enyo.Component({
					components: [
						{name: "child"}
					],
					xform: function () {}
				});
			
				bnd = new enyo.Binding({
					owner: obj.$.child,
					transform: "xform"
				});
			
				expect(bnd.getTransform()).to.exist.and.to.be.a("function");
				expect(bnd.getTransform()).to.deep.equal(obj.xform);
			
				obj.destroy();
			});
			it ("should use a transform when it exists", function () {
				var obj1, obj2;
			
				obj1 = new enyo.Object();
				obj2 = new enyo.Object();
			
				bnd = new enyo.Binding({
					source: obj1,
					target: obj2,
					from: ".testprop",
					to: ".testprop",
					transform: function (val) {
						return val? val + 1: val;
					}
				});
			
				obj1.set("testprop", 1);
			
				expect(obj1.testprop).to.equal(1);
				expect(obj2.testprop).to.equal(2);
			
				obj1.destroy();
				obj2.destroy();
			});
			it ("should supply the correct direction to the transform", function () {
				var obj1, obj2;
			
				obj1 = new enyo.Object();
				obj2 = new enyo.Object();
			
				bnd = new enyo.Binding({
					oneWay: false,
					source: obj1,
					target: obj2,
					from: ".testprop",
					to: ".testprop",
					transform: function (val, dir) {
						return dir == enyo.Binding.DIRTY_FROM
							? val? val + 1: val
							: val? val - 1: val
							;
					}
				});
			
				obj1.set("testprop", 1);
			
				expect(obj1.testprop).to.equal(1);
				expect(obj2.testprop).to.equal(2);
			
				obj2.set("testprop", 3);
			
				expect(obj2.testprop).to.equal(3);
				expect(obj1.testprop).to.equal(2);
			
				obj1.destroy();
				obj2.destroy();
			});
			it ("should stop propagation of the binding change when stop() is called", function () {
				var obj1, obj2;
			
				obj1 = new enyo.Object();
				obj2 = new enyo.Object();
			
				bnd = new enyo.Binding({
					source: obj1,
					target: obj2,
					from: ".testprop",
					to: ".testprop",
					transform: function (val, dir, binding) {
						return !val || val == 1? binding.stop(): val + 1;
					}
				});
			
				obj1.set("testprop", 1);
			
				expect(obj1.testprop).to.equal(1);
				expect(obj2.testprop).to.not.exist;
			
				obj1.set("testprop", 2);
			
				expect(obj1.testprop).to.equal(2);
				expect(obj2.testprop).to.equal(3);
			
				obj1.destroy();
				obj2.destroy();	
			});
		});
	});
	describe ("Other", function () {
		describe ("one-way", function () {
			it ("should always default to one-way", function () {
				var bnd = new enyo.Binding();
				expect(bnd.oneWay).to.be.true;
				bnd.destroy();
			});
			it ("should keep one way synchronization between two bindable objects", function () {
				var obj1, obj2, bnd;
			
				obj1 = new enyo.Object({
					testprop: true
				});
			
				obj2 = new enyo.Object({
					testprop: null
				});
			
				bnd = new enyo.Binding({
					source: obj1,
					target: obj2,
					from: ".testprop",
					to: ".testprop"
				});
			
				expect(obj1.testprop).to.be.true;
				expect(obj2.testprop).to.be.true;
			
				obj1.set("testprop", false);
			
				expect(obj1.testprop).to.be.false;
				expect(obj2.testprop).to.be.false;
			
				obj1.destroy();
				obj2.destroy();
				bnd.destroy();
			});
		});
		describe ("two-way", function () {
			it ("should not default to two-way", function () {
				var bnd = new enyo.Binding();
				expect(bnd.oneWay).to.be.true;
				bnd.destroy();
			});
			it ("should keep two way synchronization between two bindable objects", function () {
				var obj1, obj2, bnd;
			
				obj1 = new enyo.Object({
					testprop: true
				});
			
				obj2 = new enyo.Object({
					testprop: false
				});
			
				bnd = new enyo.Binding({
					source: obj1,
					target: obj2,
					from: ".testprop",
					to: ".testprop",
					oneWay: false
				});
			
				expect(obj1.testprop).to.be.true;
				expect(obj2.testprop).to.be.true;
			
				obj1.set("testprop", false);
			
				expect(obj1.testprop).to.be.false;
				expect(obj2.testprop).to.be.false;
			
				obj2.set("testprop", true);
			
				expect(obj1.testprop).to.be.true;
				expect(obj2.testprop).to.be.true;
			
				obj1.destroy();
				obj2.destroy();
				bnd.destroy();
			});
		});
	});
});
