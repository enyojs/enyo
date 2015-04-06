describe('enyo.ModelController', function () {
	
	var ModelController = enyo.ModelController,
		Model = enyo.Model;
	
	describe('methods', function () {
		
		describe('#set', function () {
			
			var controller,
				model;
				
			before(function () {
				controller = new ModelController();
				model = new Model();
				
				controller.set('model', model);
			})
			
			after(function () {
				controller.destroy();
				model.destroy();
			});
			
			it ('should correctly determine properties belonging to the controller', function () {
				controller.prop = 1;
				model.set('prop', 2);
				
				controller.set('prop', 3);
				
				expect(controller.prop).to.equal(3);
				expect(model.get('prop')).to.equal(2);
			});
			
			it ('should correctly set the model when the property does not belong to the ' +
				'controller', function () {
				
				delete controller.prop;
				
				controller.set('prop', 4);
				expect(model.get('prop')).to.equal(4);
			});
			
			it ('should gracefully fail when no model exists and it was not an own property',
				function () {
				
				controller.set('model', null);
				controller.set('prop', 1);
				
				// if it hasn't thrown an error...
				expect(model.get('prop')).to.equal(4);
			});
			
		});
		
		describe('#get', function () {
			
			var controller,
				model;
				
			before(function () {
				enyo.kind({
					name: 'TestModelController',
					kind: ModelController,
					computed: [
						{method: 'prop'}
					],
					prop: function () {
						return true;
					}
				});
				controller = new ModelController();
				model = new Model();
				controller.set('model', model);
			});
			
			after(function () {
				TestModelController = null;
				controller.destroy();
				model.destroy();
			});
			
			it ('should properly determine properties belonging to the controller', function () {
				controller.prop = 1;
				model.set('prop', 2);
								
				expect(controller.get('prop')).to.equal(1);
			});
			
			it ('should correctly get the model when the property does not belong to the ' +
				'controller', function () {
				
				delete controller.prop;
				
				expect(model.get('prop')).to.equal(2);
			});
			
			it ('should gracefully fail when no model exists and it was not an own property',
				function () {
				
				controller.set('model', null);
				
				expect(controller.get('prop')).to.be.undefined;
			});
			
			it ('should correctly retrieve a computed property of the controller', function () {
				
				controller.destroy();
				controller = new TestModelController();
				controller.set('model', model);
				
				expect(controller.get('prop')).to.be.true;
			});
			
		});
		
	});
	
	describe('events', function () {
		
		var controller,
			model;
		
		before(function () {
			controller = new ModelController();
			model = new Model();
			controller.set('model', model);
		});
		
		after(function () {
			controller.destroy();
			model.destroy();
		});
		
		it ('should emit change when model emits change', function () {
			
			var spy = sinon.spy();
			
			controller.on('change', spy);
			model.set('prop', 1);
			
			expect(spy.callCount).to.equal(1);
			controller.off('change', spy);
		});
		
		it ('should emit destroy when model emits destroy', function () {
			
			var spy = sinon.spy();
			
			controller.on('destroy', spy);
			model.destroy();
			
			expect(spy.callCount).to.equal(1);
			expect(controller.model).to.be.null;
			controller.off('destroy', spy);
		});
		
	});
	
	describe('notifications', function () {
		var model, controller;
		
		afterEach (function () {
			model && model.destroy();
			controller && controller.destroy();
		});
		
		it ('should notify for each property changed on a model and trigger binding updated', function () {
			controller = new ModelController();
			model = new enyo.Model();
			controller.set('model', model);
			
			var spy1 = sinon.spy()
				, spy2 = sinon.spy()
				, obj = new enyo.Object();
				
			obj.binding({from: 'someProp1', source: controller, to: 'someProp'});
			controller.observe('someProp1', spy1);
			controller.observe('someProp2', spy2);
			model.set({someProp1: 'someValue1', someProp2: 'someValue2'});
			expect(spy1).to.have.been.called;
			expect(spy2).to.have.been.called;
			expect(obj.someProp).to.exist.and.to.equal('someValue1');
		});
		
		it ('should allow bindings to chain through to child attributes and update properly when the model instance changes', function () {
			var ctor, mod1, mod2, obj;
			
			ctor = enyo.kind({
				kind: enyo.RelationalModel,
				relations: [{
					key: 'tooneprop',
					create: true
				}]
			});
			
			mod1 = new ctor({tooneprop: {name: 'model1'}});
			mod2 = new ctor({tooneprop: {name: 'model2'}});
			obj = new enyo.Object();
			controller = new ModelController();
			obj.binding({from: 'tooneprop.name', source: controller, to: 'selectedName'});
			expect(obj.selectedName).to.be.undefined;
			controller.set('model', mod1);
			expect(obj.selectedName).to.equal('model1');
			controller.set('model', mod2);
			expect(obj.selectedName).to.equal('model2');
		});
		
	});
	
});