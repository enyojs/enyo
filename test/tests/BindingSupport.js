describe ("BindingSupport Mixin", function () {
	describe ("Methods", function () {
		var ctor, obj;
		
		ctor = enyo.kind({
			kind: null,
			mixins: [enyo.BindingSupport]
		});
		
		describe("#binding", function () {
			it ("should respond to binding", function () {
				expect(ctor.prototype).itself.to.respondTo("binding");
			});
			it ("should accept one or more parameters", function () {
				var loc;
				
				loc = new ctor();
				loc.binding({testprop1: true});
				loc.binding({testprop1: true}, {testprop2: false});
				
				expect(loc.bindings).to.have.length(2);
				expect(loc.bindings[0]).to.have.property("testprop1", true);
				expect(loc.bindings[1]).to.have.property("testprop2", false);
				
				loc.destroy();
			});
			it ("should append properties to bindings array if object uninitialized", function () {
				var loc;
				
				loc = enyo.singleton({
					kind: ctor,
					constructed: function () {
						this.binding({testentry: true});
						expect(this.bindings).to.have.length(1);
						expect(this.bindings[0]).to.not.be.an.instanceof(enyo.Binding);
						this.inherited(arguments);
					}
				});
				
				expect(loc.bindings).to.have.length(1);
				expect(loc.bindings[0]).to.be.instanceof(enyo.Binding);
				
				loc.destroy();
			});
		});
		describe("#clearBindings", function () {
			it ("should respond to clearBindings", function () {
				expect(ctor.prototype).itself.to.respondTo("clearBindings");
			});
			it ("should destroy and remove all bindings without a parameter", function () {
				var loc, bindings;
				
				loc = enyo.singleton({
					kind: ctor,
					bindings: [
						{name: "binding1"},
						{name: "binding2"},
						{name: "binding3"}
					]
				});
				bindings = loc.bindings.slice();
				expect(loc.bindings).to.have.length(3);
				expect(bindings).to.have.length(3);
				expect(loc.bindings[0]).to.be.instanceof(enyo.Binding);
				expect(loc.bindings[1]).to.be.instanceof(enyo.Binding);
				expect(loc.bindings[2]).to.be.instanceof(enyo.Binding);
				loc.clearBindings();
				expect(loc.bindings).to.be.empty;
				expect(bindings[0].destroyed).to.be.true;
				expect(bindings[1].destroyed).to.be.true;
				expect(bindings[2].destroyed).to.be.true;
				loc.destroy();
			});
			it ("should destroy and remove only bindings from the subset provided", function () {
				var loc, bindings;
				
				loc = enyo.singleton({
					kind: ctor,
					bindings: [
						{name: "binding1"},
						{name: "binding2"},
						{name: "binding3"}
					]
				});
				
				bindings = loc.bindings.slice(1);
				expect(loc.bindings).to.have.length(3);
				expect(bindings).to.have.length(2);
				expect(loc.bindings[0]).to.be.instanceof(enyo.Binding);
				expect(loc.bindings[1]).to.be.instanceof(enyo.Binding);
				expect(loc.bindings[2]).to.be.instanceof(enyo.Binding);
				loc.clearBindings(bindings);
				expect(loc.bindings).to.have.length(1);
				expect(loc.bindings[0]).to.have.property("name", "binding1");
				expect(bindings[0].destroyed).to.be.true;
				expect(bindings[1].destroyed).to.be.true;
				loc.destroy();
			});
		});
		describe("#removeBinding", function () {
			it ("should respond to removeBinding", function () {
				expect(ctor.prototype).itself.to.respondTo("removeBinding");
			});
			it ("should remove a binding from the bindings array", function () {
				var loc, bnd;
				
				loc = enyo.singleton({
					kind: ctor,
					bindings: [
						{name: "binding1"}
					]
				});
				
				expect(loc.bindings).to.have.length(1);
				expect(loc.bindings[0]).to.be.instanceof(enyo.Binding);
				bnd = loc.bindings[0];
				loc.removeBinding(bnd);
				expect(loc.bindings).to.be.empty;
				expect(bnd).to.exist.and.to.have.not.have.property("destroyed");
				
				loc.destroy();
			});
		});
		describe("#constructed", function () {
			it ("should properly initialize binding definitions in the bindings array", function () {
				var loc;
				
				loc = enyo.singleton({
					kind: ctor,
					bindings: [
						{name: "binding1"},
						{name: "binding2"}
					]
				});
				
				expect(loc.bindings).to.have.length(2);
				expect(loc.bindings[0]).to.be.an.instanceof(enyo.Binding);
				expect(loc.bindings[1]).to.be.an.instanceof(enyo.Binding);
				
				loc.destroy();
			})
		});
		describe("#destroy", function () {
			it ("should properly destroy and remove all bindings from an instance", function () {
				var loc, bindings;
				
				loc = enyo.singleton({
					kind: ctor,
					bindings: [
						{name: "binding1"},
						{name: "binding2"},
						{name: "binding3"}
					]
				});
				bindings = loc.bindings.slice();
				expect(loc.bindings).to.have.length(3);
				expect(bindings).to.have.length(3);
				expect(loc.bindings[0]).to.be.instanceof(enyo.Binding);
				expect(loc.bindings[1]).to.be.instanceof(enyo.Binding);
				expect(loc.bindings[2]).to.be.instanceof(enyo.Binding);
				loc.destroy();
				expect(loc.bindings).to.be.null;
				expect(bindings[0].destroyed).to.be.true;
				expect(bindings[1].destroyed).to.be.true;
				expect(bindings[2].destroyed).to.be.true;
			});
		});
	});
	describe ("Other", function () {
		describe ("bindings array", function () {
			it ("should be able to correctly find components when they are created", function () {
				var childCtor, loc;
				
				childCtor = enyo.kind({
					components: [
						{name: "two", testprop: "two-testprop"}
					], 
					deep1: {
						deep2: new enyo.Object({
							deep3: new enyo.Object({
								testprop: "deep3-testprop"
							})
						})
					}
				});
				
				loc = enyo.singleton({
					kind: enyo.Component,
					components: [
						{name: "one", kind: childCtor, testprop: "one-testprop"}
					],
					bindings: [
						{from: ".$.one.testprop", to: ".testprop1"},
						{from: ".$.one.$.two.testprop", to: ".testprop2"},
						{from: ".$.one.deep1.deep2.deep3.testprop", to: ".testprop3"},
						{from: ".$.late.testprop", to: ".testprop4"}
					]
				});
				
				expect(loc).to.have.property("testprop1", "one-testprop");
				expect(loc).to.have.property("testprop2", "two-testprop");
				expect(loc).to.have.property("testprop3", "deep3-testprop");
				
				loc.set("$.one.testprop", "one-testprop-two");
				loc.set("$.one.$.two.testprop", "two-testprop-three");
				loc.set("$.one.deep1.deep2.deep3.testprop", "deep3-testprop-four");
				
				expect(loc).to.have.property("testprop1", "one-testprop-two");
				expect(loc).to.have.property("testprop2", "two-testprop-three");
				expect(loc).to.have.property("testprop3", "deep3-testprop-four");
				
				loc.set("$.one.deep1.deep2.deep3", new enyo.Object({
					testprop: "new-deep3-testprop"
				}));
				
				expect(loc).to.have.property("testprop3", "new-deep3-testprop");
				loc.createComponent({name: "late", testprop: "late-testprop"});
				expect(loc).to.have.property("testprop4", "late-testprop");
				loc.destroy();
			});
			it ("should function correctly with two-way synchronization", function () {
				var loc;
				
				loc = enyo.singleton({
					kind: enyo.Component,
					components: [
						{name: "one", testprop: true}
					],
					bindings: [
						{from: ".$.one.testprop", to: ".testprop", oneWay: false}
					]
				});
				
				expect(loc).to.have.property("testprop", true);
				
				loc.set("testprop", false);
				
				expect(loc).to.have.property("testprop", false);
				expect(loc.$.one).to.have.property("testprop", false);
				
				loc.destroy();
			});
		});
		describe ("nested bindings arrays", function () {
			it ("should have correct ownership when a bindings array block is in a nested component", function () {
				var loc;
				
				loc = enyo.singleton({
					kind: enyo.Component,
					components: [
						{name: "one", components: [
							{name: "two", components: [
								{name: "three", value: "three"}
							], bindings: [
								{from: ".owner.$.three.value", to: ".value"}
							]}
						], bindings: [
							{from: ".owner.$.two.value", to: ".value"}
						]}
					],
					bindings: [
						{from: ".$.one.value", to: ".linkedValue"},
						{from: ".$.three.value", to: ".value"}
					]
				});
				
				expect(loc).to.have.property("linkedValue", "three");
				expect(loc).to.have.property("value", "three");
				
				loc.destroy();
			});
		});
		describe ("binding a complex object as a property", function () {
			it ("should properly update a one-way synchronized binding", function () {
				var loc, obj;
				
				loc = enyo.singleton({
					kind: enyo.Component,
					components: [
						{name: "one", model: null}
					],
					bindings: [
						{from: ".model", to: ".$.one.model"}
					]
				});
				
				obj = new enyo.Model();
				
				expect(loc.model).to.not.exist;
				expect(loc.$.one.model).to.not.exist;
				
				loc.set("model", obj);
				
				expect(obj).to.equal(loc.model).and.to.equal(loc.$.one.model);
				
				obj = new enyo.Model();
				
				loc.set("model", obj);
				
				expect(obj).to.equal(loc.model).and.to.equal(loc.$.one.model);
				
				loc.destroy();
			});
		});
	});
});