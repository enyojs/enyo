describe('enyo.Model', function () {
	
	var Model = enyo.Model,
		proto = Model.prototype,
		STATES = enyo.States;
	
	
	describe('properties', function () {
		
		var model;
		
		before(function () {
			model = new Model();
		});
		
		after(function () {
			model.destroy();
		});
		
		describe('#status', function () {
			
			// we need to create a fake source to be able to fudge requests to test status
			var src1,
				src2,
				src3;
			
			before(function () {
				src1 = enyo.Source.create({name: 'src1'});
				src2 = enyo.Source.create({name: 'src2'});
				src3 = enyo.Source.create({name: 'src3'});
			
				// assign it directly
				model.source = src1;
			});
			
			after(function () {
				src1.destroy();
				src2.destroy();
				src3.destroy();
				
				model.source = null;
			});
			
			it ('should have the default CLEAN and NEW status and be READY', function () {
				expect(model.status & STATES.READY).to.be.ok;
			});
			
			it ('should be FETCHING and BUSY after fetch is called', function () {
				
				// because we're using the default nop implementation of enyo.Source it will not
				// actually do anything
				model.fetch();
				expect(model.status & (STATES.FETCHING | STATES.BUSY)).to.be.ok;
				
				// call fetched to clear its state
				model.fetched();
				expect(model.status & STATES.READY).to.be.ok;
			});
			
			it ('should be COMMITTING and BUSY after commit is called', function () {
				
				// because we're using the default nop implementation of enyo.Source it will not
				// actually do anything
				model.commit();
				expect(model.status & (STATES.COMMITTING | STATES.BUSY)).to.be.ok;
				
				// call committed to clear its state
				model.committed();
				expect(model.status & STATES.READY).to.be.ok;
			});
			
			it ('should be ERROR_FETCHING and ERROR if error encountered during either a commit ' +
				'or fetch call', function () {
				
				// we will stub the methods on the source to call the error handler
				var fn = function (model, opts) {
					opts.error();
				};
				
				sinon.stub(src1, 'commit', fn);
				sinon.stub(src1, 'fetch', fn);
				
				// first we check the fetch
				model.fetch();
				expect(model.status & (STATES.ERROR_FETCHING | STATES.ERROR)).to.be.ok;
				
				// clear the state
				model.clearError();
				
				// now we check the commit
				model.commit();
				expect(model.status & (STATES.ERROR_COMMITTING | STATES.ERROR)).to.be.ok;
				
				model.clearError();
				src1.commit.restore();
				src1.fetch.restore();
			});
			
			it ('should not allow a commit or fetch to be called when in an error state',
				function () {
				
				var spy = sinon.spy(),
					opts = {},
					fn;
				
				fn = function () {
					opts.success();
				};
				
				// spy will be the success callback we expect never to be fired
				opts.success = spy;
				
				// ensure that calls will be successful if it reaches them
				sinon.stub(src1, 'commit', fn);
				sinon.stub(src1, 'fetch', fn);
				
				// should not do this unless testing!
				model.status = STATES.CLEAN | STATES.ERROR;
				
				// successive calls to commit or fetch should never be successful
				model.commit(opts);
				model.fetch(opts);
				expect(spy.called).to.be.false;
				expect(model.status & STATES.ERROR).to.be.ok;
				
				model.clearError();
				src1.commit.restore();
				src1.fetch.restore();
			});
			
			it ('should not return to READY state until all sources return successfully for ' +
				'fetch and commit calls', function () {
				
				// we need to force success for both commit and fetch for all sources except one
				// so we can make sure that its state wasn't reset until the end
				var fn = function (model, opts) {
					opts.success();
				};
				
				sinon.stub(src1, 'fetch', fn);
				sinon.stub(src2, 'fetch', fn);
				sinon.stub(src1, 'commit', fn);
				sinon.stub(src2, 'commit', fn);
				
				// now we assign all of the sources to the model
				model.source = [src1, src2, src3];
				
				// first we will check the state control of fetch
				model.fetch();
				
				// we expect 2 of the 3 to have responded successfully that will leave the state
				// in BUSY
				expect(model.status & (STATES.FETCHING | STATES.BUSY)).to.be.ok;
				expect(model._waiting).to.have.length(1);
				
				// now try and complete the queue by fudging the callback
				model.fetched(null, null, src3.name);
				expect(model.status & STATES.READY).to.be.ok;
				expect(model._waiting).to.be.null;
				
				// first we will check the state control of committing
				model.commit();
				
				// we expect 2 of the 3 to have responded successfully that will leave the state
				// in BUSY
				expect(model.status & (STATES.COMMITTING | STATES.BUSY)).to.be.ok;
				expect(model._waiting).to.have.length(1);
				
				// now try and complete the queue by fudging the callback
				model.committed(null, null, src3.name);
				expect(model.status & STATES.READY).to.be.ok;
				expect(model._waiting).to.be.null;
				
				src1.fetch.restore();
				src2.fetch.restore();
				src1.commit.restore();
				src2.commit.restore();
			});
			
		});
	
	});
	
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

		describe('#fetch', function () {

			var model, source;

			before(function () {
				enyo.kind({
					name: 'enyo.test.Source',
					kind: 'enyo.Source',
					fetch: function (model, opts) {
						opts.success({
							parsed: false
						});
					}
				});

				enyo.kind({
					name: 'enyo.test.Model',
					kind: 'enyo.Model',
					source: new enyo.test.Source(),
					parse: function (res) {
						res.parsed = true;
						return res;
					}
				});

				model = new enyo.test.Model();
			});

			after(function () {
				model.source.destroy();
				model.destroy();
				delete enyo.test.Source;
				delete enyo.test.Model;
			});

			it ('should parse the result', function () {
				model.fetch({
					parse: true
				});
				expect(model.attributes.parsed).to.equal(true);
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