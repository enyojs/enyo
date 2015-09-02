var
	kind = require('enyo/kind');

var
	Store = require('enyo/Store'),
	Model = require('enyo/Model');

describe('Store', function () {
	
	describe('methods', function () {
		
		describe('#find', function () {
			
			it ('should respond to the method find', function () {
				expect(Store).to.respondTo('find');
			});
			
			describe('@params', function () {
				
				describe('ctor', function () {
					var TestModel;
					
					before(function () {
						TestModel = kind({
							name: 'TestModel',
							kind: Model
						});
					});
					
					after(function () {
						TestModel = null;
					});
					
					it ('should properly find and search for the given constructor', function () {
						
						var model1,
							model2,
							fn;
							
						fn = function (model) {
							return model.get('id') == 12;
						};
						
						// first we test for a generic model
						model1 = new Model({id: 12});
						
						expect(Store.find(Model, fn, {all: false})).to.eql(model1);
						
						// now we show it differentiating which models its filtering based on the
						// constructor passed in
						model2 = new TestModel({id: 12});
						
						expect(Store.find(TestModel, fn, {all: false})).to.eql(model2);
						
						model1.destroy();
						model2.destroy();
					});
					
				});
				
				describe('opts', function () {
			
					it ('should return an array if opts.all is true (default)', function () {
						
						var fn = function () { return false; };
						
						expect(Store.find(Model, fn)).to.be.an('array');
						
					});
					
					it ('should return undefined if opts.all is false and no model was found',
						function () {
						
						var fn = function () { return false; };
						
						expect(Store.find(Model, fn, {all: false})).to.be.undefined;
						
					});
					
					it ('should use the provided opts.context for the filter method', function () {
						
						var ctx = {},
							fn;
						
						fn = function () {
							expect(this).to.eql(ctx);
						};
						
						Store.find(Model, fn, {context: ctx});
						
					});
					
				});
				
			});
			
		});
		
		describe('#findLocal', function () {
			
			// really it is an alias so the only thing we test is that it exists like we say
			// it does
			it ('should respond to the method findLocal', function () {
				expect(Store).to.respondTo('findLocal');
			});
			
		});
		
	});
	
});