describe ("Model", function () {
	describe ("Methods", function () {
		describe ("#constructor", function () {
			describe ("@opts", function () {
				it ("noAdd:true should not add a model instance to any store", function () {
					var len = enyo.store.models["enyo.Model"].length;
					new enyo.Model({}, {}, {noAdd: true});
					expect(enyo.store.models["enyo.Model"].length).to.equal(len);
				});
			});
			describe ("@attrs", function () {
				var model, ctor;
				
				afterEach (function () {
					model && model.destroy();
				});
				
				it ("should have a unique attributes property if no attributes are provided", function () {
					model = new enyo.Model();
					expect(model.attributes).to.not.equal(model.ctor.prototype.attributes);
				});
				it ("should apply the attributes if they do exist", function () {
					model = new enyo.Model({testprop: true});
					expect(model.attributes.testprop).to.be.true;
					expect(model.attributes).to.not.equal(model.ctor.prototype.attributes);
				});
				it ("should safely merge the subkinds default attributes with those supplied", function () {
					ctor = enyo.kind({kind: "enyo.Model", attributes: {prop1: true, prop2: false}});
					model = new ctor({prop2: true, prop3: false});
					expect(model.attributes).to.deep.equal({prop1: true, prop2: true, prop3: false});
					model.destroy();
					model = new ctor();
					expect(model.attributes).to.deep.equal({prop1: true, prop2: false});
				});
				it ("should use the parse method on attrs if the option is set as a default option or in the opts parameter", function () {
					ctor = enyo.kind({kind: "enyo.Model", options: {parse: true}, parse: function (data) {return data.subdata;}});
					model = new ctor({subdata: {prop1: true, prop2: false}});
					expect(model.attributes).to.deep.equal({prop1: true, prop2: false});
					model.destroy();
					ctor.prototype.options.parse = false;
					model = new ctor({subdata: {prop1: true, prop2: false}}, null, {parse: true});
					expect(model.attributes).to.deep.equal({prop1: true, prop2: false});
				});
			});
			describe ("@props", function () {
				var model;
				
				afterEach (function () {
					model && model.destroy();
				});
				
				it ("should detect and apply props if they exist", function () {
					model = new enyo.Model(null, {euid: "@m1"});
					expect(model.euid).to.equal("@m1");
				});
			});
		});
		describe ("#destroy", function () {
			var model;
			
			afterEach (function () {
				model && model.destroy();
			});
			
			it ("should remove the model from the store", function () {
				var len = enyo.store.models["enyo.Model"].length;
				model = new enyo.Model(null, {options: {syncStore: true}});
				expect(enyo.store.models["enyo.Model"].length).to.be.above(len);
				model.destroy();
				expect(enyo.store.models["enyo.Model"].has(model)).to.not.be.ok;
			});
			it ("should remove all listeners", function () {
				model = new enyo.Model();
				model.on("test", function () {throw new Error("test");});
				var fn = function () {model.emit("test");};
				expect(fn).to.throw("test");
				model.destroy();
				expect(fn).to.not.throw("test");
			});
			it ("should remove all observers", function () {
				model = new enyo.Model();
				model.observe("prop1", function () {throw new Error("prop1");});
				var fn = function () {model.set("prop1", Math.random());};
				expect(fn).to.throw("prop1");
				model.destroy();
				expect(fn).to.not.throw("prop1");
			});
		});
		describe ("#set", function () {
			var model;
			
			afterEach (function () {
				model && model.destroy();
			});
			
			it ("should update an attribute value", function () {
				model = new enyo.Model();
				expect(model.get("prop1")).to.be.undefined;
				expect(model.attributes.prop1).to.be.undefined;
				model.set("prop1", true);
				expect(model.get("prop1")).to.be.true;
				expect(model.attributes.prop1).to.be.true;
			});
			it ("should update attributes with an object", function () {
				model = new enyo.Model();
				expect(model.get("prop1")).to.be.undefined;
				expect(model.attributes.prop1).to.be.undefined;
				expect(model.get("prop2")).to.be.undefined;
				expect(model.attributes.prop2).to.be.undefined;
				model.set({prop1: true, prop2: false});
				expect(model.get("prop1")).to.be.true;
				expect(model.attributes.prop1).to.be.true;
				expect(model.get("prop2")).to.be.false;
				expect(model.attributes.prop2).to.be.false;
			});
			it ("should emit a changed event when changes occur and not when they don't", function () {
				var fn;
				model = new enyo.Model({prop1: true, prop2: false, prop3: 1});
				model.on("change", function () { throw new Error("change"); });
				fn = function () {
					model.set("prop1", true);
				};
				expect(fn).to.not.throw("change");
				fn = function () {
					model.set({prop2: true, prop3: 2});
				};
				expect(fn).to.throw("change");
				expect(model.changed).to.exist.and.to.have.keys(["prop2", "prop3"]);
				expect(model.previous).to.exist.and.to.have.keys(["prop1", "prop2", "prop3"]);
			});
		});
	});
	describe ("Static Methods", function () {
		describe ("~concat", function () {
			it ("all subkinds should properly inherit and merge options", function () {
				var ctor1 = enyo.kind({kind: "enyo.Model", options: {prop1: true, prop2: false}})
					, ctor2 = enyo.kind({kind: ctor1, options: {prop2: true, prop3: false}});
				expect(ctor1.prototype.options).to.include.keys("prop1", "prop2");
				expect(ctor2.prototype.options).to.include.keys("prop1", "prop2", "prop3");
			});
		});
	});
	describe ("Other", function () {
		var model, ctor;
		
		afterEach (function () {
			model && model.destroy();
		});
		
		it ("should have a new entry in the default store whenever a subkind is named and undeferred", function () {
			enyo.kind({name: "NewKind1", kind: "enyo.Model", noDefer: true});
			expect(enyo.store.models.NewKind1).to.exist.and.to.be.an.instanceof(enyo.ModelList);
			enyo.kind({name: "NewKind2", kind: "NewKind1", noDefer: true});
			expect(enyo.store.models.NewKind2).to.exist.and.to.be.an.instanceof(enyo.ModelList);
		});
		it ("should properly be added to the store's enyo.Model category for an unnamed kind of model", function () {
			var len = enyo.store.models["enyo.Model"].length;
			ctor = enyo.kind({kind: "enyo.Model"});
			model = new ctor();
			enyo.store._flushQueue();
			expect(enyo.store.models["enyo.Model"].length).to.at.least(len+1);
			enyo.store.models["enyo.Model"].remove(model);
		});
	});
});