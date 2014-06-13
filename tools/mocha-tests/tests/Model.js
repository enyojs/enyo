describe('enyo.Model', function () {
	
	var Model = enyo.Model,
		proto = Model.prototype;
	
	describe('methods', function () {
		
		describe('#constructor', function () {
			
			describe('params', function () {
			
				describe('@attrs', function () {
					
					before(function () {
						enyo.kind({
							name: 'TestModel',
							kind: Model,
							attributes: {
								default1: 'value1'
							}
						});
					});
					
					after(function () {
						TestModel = null;
					});
					
					it ('should always have a unique attributes hash', function () {
						
						var model = new Model();
						
						expect(model.attributes).to.not.eql(proto.attributes);
						model.destroy();
					});
				
					it ('should merge provided attributes with existing attributes', function () {
						
						var model = new TestModel({key1: 'value1', key2: 'value2'});
						
						expect(model.attributes).to.deep.equal({
							default1: 'value1',
							key1: 'value1',
							key2: 'value2'
						});
						
						model.destroy();
					});
					
				});
				
				describe('@props', function () {
					
					it ('should apply properties via the importProps method if they exist',
						function () {
						
						var model = new Model(null, {euid: '@m1'});
						
						expect(model.euid).to.equal('@m1');
						model.destroy();
					});
					
				});
				
				describe('@opts', function () {
					
					it ('should honor the constructor configuration option noAdd if it is true',
						function () {
						
						// this option is really only used by collection in order to create a model
						// without adding it to the store so that it can batch the operation
						var model = new Model(null, null, {noAdd: true});
						
						expect(enyo.store.has(model)).to.be.false;
						model.destroy();
					});
					
				});
				
			});
			
		});
		describe('#destroy', function () {
			
			var model;
			
			beforeEach(function () {
				model = new Model();
			});
			
			it ('should remove the model from the store', function () {
				
				model.destroy();
				
				expect(enyo.store.has(model)).to.be.false;
			});
			
			it ('should remove all listeners from the model', function () {
				
				// we add a listener for an event then destroy the model and attempt to emit
				// and event again to see if it was still listening
				var spy = sinon.spy();
				model.on('*', spy);
				
				model.destroy();
				// it should have received an event so we clear it to be sure
				expect(spy.called).to.be.true;
				spy.reset();
				
				model.emit('EVENT');
				expect(spy.called).to.be.false;
			});
			
			it ('should remove all observers', function () {
				
				// we add an observer for any notification and then destroy the model and attempt
				// to notify again to see if it was still observing
				var spy = sinon.spy();
				model.observe('*', spy);
				
				model.notify('NOTIFICATION');
				expect(spy.called).to.be.true;
				spy.reset();
				
				model.destroy();
				
				model.notify('NOTIFICATION');
				expect(spy.called).to.be.false;
			});
			
		});
		
		describe('#set', function () {
			
			var model;
			
			before(function () {
				model = new Model();
			});
			
			after(function () {
				model.destroy();
			});
			
			it ('should accept a path and a value', function () {
				model.set('path', 'value');
				expect(model.get('path')).to.equal('value');
				expect(model.attributes.path).to.equal('value');
			});
			
			it ('should accept an object of key/values', function () {
				model.set({key1: 'value1', key2: 'value2'});
				expect(model.get('key1')).to.equal('value1');
				expect(model.get('key2')).to.equal('value2');
				expect(model.attributes.key1).to.equal('value1');
				expect(model.attributes.key2).to.equal('value2');
			});
			
			it ('should emit a change event when an attribute is actually changed', function () {
				
				var spy = sinon.spy();
				
				model.on('change', spy);
				model.set('key1', 'value2');
				expect(spy.callCount).to.equal(1);
				spy.reset();
				
				// now test that it does get fired when no actual change takes place
				model.set('key1', 'value2');
				expect(spy.called).to.be.false;
				
				model.off('change', spy);
			});
			
		});
		
	});
	
	describe('statics', function () {
		
		describe('~concat', function () {
			
			before(function () {
				enyo.kind({
					name: 'TestModel',
					noDefer: true,
					kind: Model,
					options: {
						key1: 'value1',
						key3: 'value3'
					}
				});
			});
			
			after(function () {
				TestModel = null;
			});
			
			it ('should merge the options hash for all subkinds', function () {
				
				// create an anonymous subkind to see if the options are being merged
				var Ctor = enyo.kind({
					kind: TestModel,
					noDefer: true,
					options: {
						key2: 'value2'
					}
				});
				
				expect(Ctor.prototype.options).to.include({
					key1: 'value1',
					key2: 'value2',
					key3: 'value3'
				});
				
			});
			
			it ('should add an entry to enyo.store.models for each new subclass of enyo.Model',
				function () {
				
				expect(enyo.store.models.TestModel).to.exist;
			});
			
		});
		
	});
	
	describe('usage', function () {
		
		it ('should property add an instance of enyo.Model to enyo.store\'s internal models',
			function () {
			
			var len = enyo.store.models['enyo.Model'].length,
				model = new Model();
			
			expect(enyo.store.has(model)).to.be.true;
			expect(enyo.store.models['enyo.Model']).to.have.length.above(len);
		});
		
	});
	
});