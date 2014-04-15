describe ("RelationalModel", function () {
	var Relational = enyo.RelationalModel;
	
	describe ("Methods", function () {
		var proto = Relational.prototype;
	
		describe ("#getRelation", function () {
			
			it ("should respond to the method getRelation", function () {
				expect(proto).to.itself.respondTo("getRelation");
			});
			
			it ("should return a relation instance if a relation exists for the requested key or falsy", function () {
				var model;
				
				model = enyo.singleton({
					kind: Relational,
					relations: [{
						key: "testprop"
					}]
				});
				
				expect(model.getRelation("testprop")).to.exist.and.to.be.an.instanceof(enyo.toOne);
				expect(model.getRelation("someotherprop")).to.not.be.ok;
				model.destroy();
			});
			
		});
		
		describe ("#isRelation", function () {
			
			it ("should respond to the method isRelation", function () {
				expect(proto).to.itself.respondTo("isRelation");
			});
			
			it ("should should return a relation instance if a relation exists for the requested key or falsy", function () {
				var model;
				
				model = enyo.singleton({
					kind: Relational,
					relations: [{
						key: "testprop"
					}]
				});
				
				expect(model.isRelation("testprop")).to.exist.and.to.be.an.instanceof(enyo.toOne);
				expect(model.isRelation("someotherprop")).to.not.be.ok;
				model.destroy();
			})
			
		});
		
		describe ("#get", function () {
			
			it ("should return an attribute value as expected", function () {
				var model = new Relational({testprop: true});
				expect(model.get("testprop")).to.be.true;
				model.destroy();
			});
			
			it ("should return an instance of a model or collection when requesting a relation", function () {
				var ctor, model;
				
				ctor = enyo.kind({
					kind: Relational,
					relations: [{
						key: "testprop"
					}]
				});
				
				model = new ctor({testprop: {id: 0}});
				expect(model.get("testprop")).to.exist.and.to.be.an.instanceof(Relational);
				model.destroy();
			});
			
		});
		
		describe ("#set", function () {
			
			it ("should set a property of the attributes object to the value", function () {
				var model = new Relational();
				model.set("testprop1", true);
				expect(model.get("testprop1")).to.be.true;
				expect(model.attributes.testprop1).to.be.true;
				model.destroy();
			});
			
			it ("should set the property on a relation's model/collection", function () {
				var model;
				
				model = enyo.singleton({
					kind: Relational,
					relations: [{
						key: "tooneprop"
					}, {
						key: "tomanyprop",
						type: "toMany"
					}]
				});
				
				model.set("tooneprop.testprop", true);
				model.set("tomanyprop.testprop", true);
				
				expect(model.get("tooneprop").attributes.testprop).to.be.true;
				expect(model.get("tomanyprop").testprop).to.be.true;
				
				model.destroy();
			});
			
		});
		
		describe ("#setLocal", function () {
			it ("should set a local property not of the attributes object", function () {
				var model = new Relational();
				model.setLocal("localprop", true);
				expect(model.localprop).to.be.true;
				expect(model.attributes.localprop).to.not.exist;
				model.destroy();
			});
		});
		
		describe ("#raw", function () {
			
			it ("should return an object literal with the attributes of the model", function () {
				var model = new Relational({prop1: true, prop2: false});
				expect(model.raw()).to.eql({prop1: true, prop2: false});
				model.destroy();
			});
			
			it ("should return only the keys requested in the includeKeys array", function () {
				var model;
				
				model = enyo.singleton({
					kind: Relational,
					includeKeys: ["id", "testprop"],
					relations: [{
						key: "testprop",
						includeInJSON: "id"
					}, {
						key: "otherprop"
					}]
				});
				model.set({id: 345, testprop: 10, otherprop: {id: 456}});
				expect(model.raw()).to.eql({id: 345, testprop: 10});
				model.destroy();
			});
			
		});
		
		describe ("#fetchRelated", function () {
			it ("should be able to fetch data for all relations");
			it ("should be able to fetch data for the specified relation");
		});
		
		describe ("#destroy", function () {
			
			it ("should destroy all relations");
			it ("should cause all relations with isOwner true to destroy their models as well");
			it ("should cause a remote destroy attempt when option complete is true");
			
		});
	
	});
		
	describe ("Relation properties", function () {
	
		describe ("#type", function () {
			
			it ("should accept the strings 'toOne', 'toMany', 'enyo.toOne', 'enyo.toMany'", function () {
				var model = enyo.singleton({
					kind: Relational,
					relations: [{
						type: "toOne"
					}, {
						type: "enyo.toOne"
					}, {
						type: "toMany"
					}, {
						type: "enyo.toMany"
					}]
				});
				
				expect(model.relations[0]).to.be.an.instanceof(enyo.toOne);
				expect(model.relations[1]).to.be.an.instanceof(enyo.toOne);
				expect(model.relations[2]).to.be.an.instanceof(enyo.toMany);
				expect(model.relations[3]).to.be.an.instanceof(enyo.toMany);
				
				model.destroy();
			});
			
			it ("should accept the constructor for enyo.toOne and enyo.toMany", function () {
				var model = enyo.singleton({
					kind: Relational,
					relations: [{
						type: enyo.toOne
					}, {
						type: enyo.toMany
					}]
				});
				
				expect(model.relations[0]).to.be.an.instanceof(enyo.toOne);
				expect(model.relations[1]).to.be.an.instanceof(enyo.toMany);
				model.destroy();
			});
			
			it ("should default to enyo.toOne", function () {
				var model = enyo.singleton({
					kind: Relational,
					relations: [{}]
				});
				
				expect(model.relations[0]).to.be.an.instanceof(enyo.toOne);
				model.destroy();
			});
			
		});
		
		describe ("#key", function () {
			
			it ("should add the key to the attributes of the model pointing to the relation instance", function () {
				var model = enyo.singleton({
					kind: Relational,
					relations: [{
						key: "someKey"
					}]
				});
				expect(model.attributes.someKey).to.eql(model.relations[0]);
				model.destroy();
			});
			
			it ("should be used as the implicit inverseKey in automatic reverse relations", function () {
				var model = enyo.singleton({
					kind: Relational,
					relations: [{
						key: "someKey",
						inverseKey: "knownInverse"
					}]
				});
				expect(model.get("someKey").relations[0].inverseKey).to.equal("someKey");
				model.destroy();
			});
			
		});
		
		describe ("#inverseKey", function () {
			
			it ("should use the inverseKey, when available, to find existing models", function () {
				var ctor, mod1, mod2;
				
				ctor = enyo.kind({
					kind: Relational,
					relations: [{
						key: "childModel",
						inverseKey: "parentModel",
						create: false
					}]
				});
				mod2 = new Relational({parentModel: "someid"});
				mod1 = new ctor({id: "someid"});
				expect(mod1.get("childModel")).to.eql(mod2);
				mod1.destroy();
				mod2.destroy();
			});
			
			it ("should use the inverseKey as the implicit key in automatic reverse relations", function () {
				var model = enyo.singleton({
					kind: Relational,
					relations: [{
						key: "someKey",
						inverseKey: "knownInverse"
					}]
				});
				expect(model.get("someKey").relations[0].key).to.equal("knownInverse");
				model.destroy();
			});
			
		});
	
		describe ("#isOwner", function () {
			
			it ("should only allow one end of a relationship to have isOwner true");
			
			it ("should respond to changes in child-relations as if it also changed", function () {
				var ctor, model, spy = sinon.spy();
				
				ctor = enyo.kind({
					kind: Relational,
					relations: [{
						key: "childModel"
					}]
				});
				
				model = new ctor();
				model.on("change", spy);
				expect(model.isDirty).to.be.false;
				model.set("childModel.name", "someNewValue");
				expect(model.get("childModel.name")).to.equal("someNewValue");
				expect(model.isDirty).to.be.true;
				expect(spy).to.have.been.called;
				model.destroy();
			});
			
			it ("should ignore events and notifications when neither relation has isOwner true", function () {
				var ctor1, ctor2, mod1, mod2, spy = sinon.spy();
				ctor1 = enyo.kind({
					kind: Relational,
					relations: [{
						key: "ctor2",
						inverseKey: "ctor1",
						model: ctor2,
						isOwner: false,
						create: true
					}]
				});
				ctor2 = enyo.kind({
					kind: Relational,
					relations: [{
						key: "ctor1",
						inverseKey: "ctor2",
						model: ctor1,
						isOwner: false
					}]
				});
				mod1 = new ctor1({id: "id01", ctor2: {id: "id00", name: "someName"}});
				mod2 = new ctor2({id: "id00", ctor1: {id: "id01"}})
				mod1.on("change", spy);
				mod1.set("ctor2.name", "someOtherName");
				expect(spy).to.not.have.been.called;
				expect(mod1.isDirty).to.be.false;
				
				mod1.destroy();
				mod2.destroy();
			});
			
		});
	
		describe ("#includeInJSON", function () {
			
			it ("should not include a relation in raw output when includeInJSON is false", function () {
				var ctor, model;
				
				ctor = enyo.kind({
					kind: Relational,
					relations: [{
						key: "childModel",
						includeInJSON: false
					}]
				});
				
				model = new ctor();
				expect(model.raw()).to.be.empty;
				model.destroy();
			});
			
			it ("should include the entire relation raw output when includeInJSON is true and isOwner is true", function () {
				var ctor, model;
				
				ctor = enyo.kind({
					kind: Relational,
					relations: [{
						key: "childModel",
						includeInJSON: true
					}]
				});
				
				model = new ctor({childModel: {id: "id0101", name: "someName"}});
				expect(model.raw()).to.eql({childModel: {id: "id0101", name: "someName"}});
				model.destroy();
			});
			
			it ("should include the id of the relation by default when isOwner is false", function () {
				var ctor, model;
				
				ctor = enyo.kind({
					kind: Relational,
					relations: [{
						key: "childModel",
						isOwner: false
					}]
				});
				
				model = new ctor();
				model.set("childModel", new Relational({id: "id0101"}));
				expect(model.raw()).to.eql({childModel: "id0101"});
				model.get("childModel").destroy();
				model.destroy();
			});
			
			it ("should include a single key when includeInJSON is a string", function () {
				var ctor, model;
				
				ctor = enyo.kind({
					kind: Relational,
					relations: [{
						key: "childModel",
						includeInJSON: "name"
					}]
				});
				
				model = new ctor({childModel: {id: "id0101", name: "someName"}});
				expect(model.raw()).to.eql({childModel: "someName"});
				model.destroy();
			});
			
			it ("should include all keys requested when includeInJSON is an array", function () {
				var ctor, model;
				
				ctor = enyo.kind({
					kind: Relational,
					relations: [{
						key: "childModel",
						includeInJSON: ["name", "age"]
					}]
				});
				
				model = new ctor({childModel: {id: "id0101", name: "someName", age: 35}});
				expect(model.raw()).to.eql({childModel: {name: "someName", age: 35}});
				model.destroy();
			});
			
			it ("should include any return value when includeInJSON is a function", function () {
				var ctor, model;
				
				ctor = enyo.kind({
					kind: Relational,
					relations: [{
						key: "childModel",
						includeInJSON: function (key) {
							return "cool";
						}
					}]
				});
				
				model = new ctor({childModel: {id: "id0101", name: "someName", age: 35}});
				expect(model.raw()).to.eql({childModel: "cool"});
				model.destroy();
			});
			
		});
		
		describe ("#create", function () {
			
			it ("should create an instance from existing data when isOwner is true", function () {
				var ctor, model;
				
				ctor = enyo.kind({
					kind: Relational,
					relations: [{
						key: "testprop"
					}]
				});
				model = new ctor({testprop: {id: 0}});
				expect(model.attributes.testprop).to.exist.and.to.be.an.instanceof(enyo.toOne);
				expect(model.getRelation("testprop").related).to.exist.and.to.be.an.instanceof(enyo.RelationalModel);
				model.destroy();
			});
			
		});
		
		describe ("#parse", function () {
			
			it ("should parse incoming data for a relation when it exists and create is true", function () {
				var ctor, model, spy = sinon.spy(), base;
				base = enyo.kind({kind: Relational, parse: spy});
				ctor = enyo.kind({
					kind: Relational,
					relations: [{
						key: "somekey",
						model: base,
						parse: true
					}]
				});
				
				model = new ctor({somekey: {id: "02318214893423423"}});
				expect(spy).to.have.been.calledOnce;
				model.destroy();
			});
			
		});
		
		describe ("#autoFetch", function () {
			
			it ("should not be true by default");
			it ("should automatically attempt to fetch remote data when autoFetch is true");
			
		});
		
		describe ("#inverseType", function () {
			
			it ("should be ignored in explicit relations");
			it ("should be used to instance automatic reverse relations");
			
		});
		
	});
	
	describe ("toOne Relations", function () {
		
		it ("should be able to declare an explicit toOne relation");
		it ("should be able to declare an implicit toOne relation");
		it ("should find the related model when it is created later");
		it ("should find the related model when it is created before");
		it ("should create the related model when it is passed in as data");
		it ("should fetch the related model when autoFetch is true");
		it ("should be able to fetch the related model later when autoFetch is false");
		it ("should should not respond to events/notifications for related model(s) if isOwner is false");
		it ("should destroy all relations where isOwner is true and destroyed by default");
		it ("should not destroy a relation where isOwner is true and the destroy flag is false");
		
	});
	
	describe ("toMany Relations", function () {
		
		it ("should be able to declare an explicit toMany relation");
		it ("should be able to declare an implicit toMany relation");
		it ("should find related models when they are created later");
		it ("should find related models when they are created before");
		it ("should create the related models when they are passed in as data");
		it ("should fetch the related models when autoFetch is true");
		it ("should be able to fetch the related models later when autoFetch is false");
		it ("should force the reverse relation (if any) to be toOne even when set as toMany");
		it ("should force all toMany relations to isOwner false");
		
	});
	
	describe ("Events", function () {
		
		it ("should propagate change events when isOwner is true and a child-relation changes");
		
	});
	
	describe ("Bindings", function () {
		
		it ("should be able to bind to attributes", function () {
			var model, obj;
			
			model = enyo.singleton({
				kind: Relational,
				relations: [{
					key: "tooneprop"
				}]
			});
			
			obj = new enyo.Object();
			obj.model = model;
			
			model.set("tooneprop.someattr", "some value");
			obj.binding({from: "model.tooneprop.someattr", to: "localattr"});
			
			expect(model.get("tooneprop.someattr")).to.equal("some value");
			expect(obj.localattr).to.exist.and.to.equal("some value");
		});
		
		it ("should be able to bind through a toOne relation chain", function () {
			
			var ctor, obj, model;
			
			ctor = enyo.kind({
				kind: Relational,
				relations: [{
					key: "tooneprop"
				}]
			});
			
			model = new ctor({tooneprop: 30});
			obj = new enyo.Object({model: model});
			
			obj.binding({from: "model.tooneprop.id", to: "toonepropid"});
			
			expect(obj.toonepropid).to.exist.and.to.equal(30);
			
			model.destroy();
			obj.destroy();
		});
		
		it ("should be able to bind to a local property of the collection of a toMany relation", function () {
			
			var ctor, obj, model;
			
			ctor = enyo.kind({
				kind: Relational,
				relations: [{
					key: "tomanyprop",
					type: "toMany"
				}]
			});
			
			model = new ctor({tomanyprop: [{id: 0}, {id: 1}, {id: 2}]});
			obj = new enyo.Object({model: model});
			
			obj.binding({from: "model.tomanyprop.length", to: "length"});
			
			expect(obj).to.have.length(3);
			
			obj.destroy();
			model.destroy();
		});
		
	});
		
});