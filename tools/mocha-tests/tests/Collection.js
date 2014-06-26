describe('enyo.Collection', function () {
	
	var Collection = enyo.Collection,
		Model = enyo.Model,
		STATES = enyo.States;
	
	var proto = Collection.prototype;
	
	describe('properties', function () {
		
		var collection;
		
		before(function () {
			collection = new Collection();
		});
		
		after(function () {
			collection.destroy({destroy: true});
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
				collection.source = src1;
			});
			
			after(function () {
				src1.destroy();
				src2.destroy();
				src3.destroy();
				
				collection.source = null;
			});
			
			it ('should have the default READY status', function () {
				expect(collection.status).to.equal(STATES.READY);
			});
			
			it ('should be FETCHING and BUSY after fetch is called', function () {
				
				// because we're using the default nop implementation of enyo.Source it will not
				// actually do anything
				collection.fetch();
				expect(collection.status & STATES.FETCHING).to.equal(STATES.FETCHING);
				expect(collection.status & STATES.BUSY).to.be.ok;
				expect(collection.status & STATES.READY).to.not.be.ok;
				
				// call fetched to clear its state
				collection.fetched();
				expect(collection.status).to.equal(STATES.READY);
			});
			
			it ('should be COMMITTING and BUSY after commit is called', function () {
				
				// because we're using the default nop implementation of enyo.Source it will not
				// actually do anything
				collection.commit();
				expect(collection.status & STATES.COMMITTING).to.equal(STATES.COMMITTING);
				expect(collection.status & STATES.BUSY).to.be.ok;
				expect(collection.statys & STATES.READY).to.not.be.ok;
				
				// call committed to clear its state
				collection.committed();
				expect(collection.status).to.equal(STATES.READY);
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
				collection.fetch();
				expect(collection.status & STATES.ERROR_FETCHING).to.equal(STATES.ERROR_FETCHING);
				expect(collection.status & STATES.ERROR).to.be.ok;
				expect(collection.status & STATES.READY).to.not.be.ok;
				
				// clear the state
				collection.clearError();
				
				// now we check the commit
				collection.commit();
				expect(collection.status & STATES.ERROR_COMMITTING).to.be.ok
				expect(collection.status & STATES.ERROR).to.be.ok;
				expect(collection.status & STATES.READY).to.not.be.ok;
				
				collection.clearError();
				src1.commit.restore();
				src1.fetch.restore();
			});
			
			it ('should not allow a commit or fetch to be called when in an error state',
				function () {
				
				var spy = sinon.spy(),
					opts = {},
					fn;
				
				// spy will be the success callback we expect never to be fired
				opts.success = spy;
				
				fn = function () {
					opts.success();
				};
				
				// ensure that calls will be successful if it reaches them
				sinon.stub(src1, 'commit', fn);
				sinon.stub(src1, 'fetch', fn);
				
				// should not do this unless testing!
				collection.set('status', collection.status | STATES.ERROR);
				
				// successive calls to commit or fetch should never be successful
				collection.commit(opts);
				collection.fetch(opts);
				
				expect(spy.called).to.be.false;
				expect(collection.status & STATES.ERROR).to.be.ok;
				expect(collection.statys & STATES.READY).to.not.be.ok;
				
				collection.clearError();
				src1.commit.restore();
				src1.fetch.restore();
			});
			
			it ('should not allow a destroy with commit to be called when in an error state',
				function () {
				
				// we needed to keep this separate so it wouldn't actually destroy the re-used
				// collection
				var collection = new Collection(),
					spy = sinon.spy(),
					opts = {},
					fn;
				
				collection.source = src1;
				collection.status = collection.status | STATES.ERROR_COMMITTING;
				
				opts.success = spy;
				opts.commit = true;
				
				fn = function () {
					opts.success();
				};
				
				sinon.stub(src1, 'destroy', fn);
				
				collection.destroy(opts);
				
				expect(spy.called).to.be.false;
				expect(collection.status & STATES.ERROR).to.be.ok;
				expect(collection.status & STATES.READY).to.not.be.ok;
				
				collection.clearError();
				collection.destroy();
				src1.destroy.restore();
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
				
				// now we assign all of the sources to the collection
				collection.source = [src1, src2, src3];
				
				// first we will check the state control of fetch
				collection.fetch();
				
				// we expect 2 of the 3 to have responded successfully that will leave the state
				// in BUSY
				expect(collection.status & STATES.FETCHING).to.equal(STATES.FETCHING);
				expect(collection.status & STATES.BUSY).to.be.ok;
				expect(collection._waiting).to.have.length(1);
				
				// now try and complete the queue by fudging the callback
				collection.fetched(null, null, src3.name);
				expect(collection.status & STATES.READY).to.equal(STATES.READY);
				expect(collection._waiting).to.be.null;
				
				// first we will check the state control of committing
				collection.commit();
				
				// we expect 2 of the 3 to have responded successfully that will leave the state
				// in BUSY
				expect(collection.status & STATES.COMMITTING).to.equal(STATES.COMMITTING);
				expect(collection.status & STATES.BUSY).to.be.ok;
				expect(collection._waiting).to.have.length(1);
				
				// now try and complete the queue by fudging the callback
				collection.committed(null, null, src3.name);
				expect(collection.status & STATES.READY).to.equal(STATES.READY);
				expect(collection._waiting).to.be.null;
				
				src1.fetch.restore();
				src2.fetch.restore();
				src1.commit.restore();
				src2.commit.restore();
			});
			
		});
		
	});
	
	describe('methods', function () {
		
		describe('#isError', function () {
			
			var collection;
			
			before(function () {
				collection = new Collection();
			});
			
			after(function () {
				collection.destroy({destroy: true});
			});
			
			it ('should correctly return true if the status is an ERROR state value', function () {
				
				collection.status = STATES.ERROR_COMMITTING;
				expect(collection.isError()).to.be.true;
				
				collection.status = STATES.ERROR_FETCHING;
				expect(collection.isError()).to.be.true;
				
				collection.status = STATES.ERROR_DESTROYING;
				expect(collection.isError()).to.be.true;
				
				collection.status = STATES.ERROR_UNKNOWN;
				expect(collection.isError()).to.be.true;
				
			});
			
			it ('should correctly return false if the status is not an ERROR state value',
				function () {
				
				collection.status = STATES.READY;
				expect(collection.isError()).to.be.false;
				
			});
			
			it ('should correctly use the parameter if provided', function () {
				
				collection.status = STATES.READY;
				expect(collection.isError(STATES.ERROR_COMMITTING)).to.be.true;
				
				collection.status = STATES.ERROR_FETCHING;
				expect(collection.isError(STATES.READY)).to.be.false;
				
			});
			
			it ('should correctly ignore the parameter if it is not numeric', function () {
				
				collection.status = STATES.ERROR_FETCHING;
				expect(collection.isError({})).to.be.true;
				
			});
			
		});
		
		describe('#isBusy', function () {
			
			var collection;
			
			before(function () {
				collection = new Collection();
			});
			
			after(function () {
				collection.destroy({destroy: true});
			});
			
			it ('should correctly return true if the status is a BUSY state value', function () {
				
				collection.status = STATES.FETCHING;
				expect(collection.isBusy()).to.be.true;
				
				collection.status = STATES.COMMITTING;
				expect(collection.isBusy()).to.be.true;
				
				collection.status = STATES.DESTROYING;
				expect(collection.isBusy()).to.be.true;
				
			});
			
			it ('should correctly return false if the status is not a BUSY state value',
				function () {
				
				collection.status = STATES.READY;
				expect(collection.isBusy()).to.be.false;
				
			});
			
			it ('should correctly use the parameter if provided', function () {
				
				collection.status = STATES.READY;
				expect(collection.isBusy(STATES.COMMITTING)).to.be.true;
				
				collection.status = STATES.BUSY;
				expect(collection.isBusy(STATES.READY)).to.be.false;
				
			});
			
			it ('should correctly ignore the parameter if it is not numeric', function () {
				
				collection.status = STATES.COMMITTING;
				expect(collection.isBusy({})).to.be.true;
				
			});
			
		});
		
		describe('#isReady', function () {
			
			var collection;
			
			before(function () {
				collection = new Collection();
			});
			
			after(function () {
				collection.destroy({destroy: true});
			});
			
			it ('should correctly return true if the status is a READY state value', function () {
				
				collection.status = STATES.READY;
				expect(collection.isReady()).to.be.true;
				
			});
			
			it ('should correctly return false if the status is not a READY state value',
				function () {
				
				collection.status = STATES.BUSY;
				expect(collection.isReady()).to.be.false;
				
			});
			
			it ('should correctly use the parameter if provided', function () {
				
				collection.status = STATES.READY;
				expect(collection.isReady(STATES.COMMITTING)).to.be.false;
				
				collection.status = STATES.BUSY;
				expect(collection.isReady(STATES.READY)).to.be.true;
				
			});
			
			it ('should correctly ignore the parameter if it is not numeric', function () {
				
				collection.status = STATES.READY;
				expect(collection.isReady({})).to.be.true;
				
			});
			
		});
		
		describe('#add', function () {
			
			var collection;
			
			before(function () {
				collection = new Collection();
			});
			
			after(function () {
				collection.destroy({destroy: true});
			});
			
			beforeEach(function () {
				collection.empty({destroy: true});
			});
			
			it ('should respond to the method add', function () {
				expect(proto).to.itself.respondTo('add');
			});
			
			it ('should notify observers of the length property when it is updated', function () {
				
				var spy = sinon.spy();
				
				// register the spy to listen for changes to length
				collection.observe('length', spy);
				collection.add({});
				
				expect(collection.length).to.equal(1);
				expect(spy.callCount).to.equal(1);
				
				collection.unobserve('length', spy);
			});
			
			it ('should listen to events from models that are added', function () {
				
				var spy = sinon.spy(),
					model;
				
				collection.add({});
				model = collection.at(0);
				
				collection.on('change', spy);
				model.set('prop', 'value');
				
				expect(spy.callCount).to.equal(1);
				
			});
			
			describe('params', function () {
				
				describe('@models', function () {
					
					beforeEach(function () {
						collection.empty({destroy: true});
					});
					
					it ('should accept a model instance', function () {
						collection.add(new enyo.Model());
						
						expect(collection.length).to.equal(1);
					});
					
					it ('should accept an array of model instances', function () {
						var ary = [
							new Model(),
							new Model(),
							new Model()
						];
						
						collection.add(ary);
						
						expect(collection.length).to.equal(3);
					});
					
					it ('should accept an object literal if create is true (default)', function () {
						collection.add({});
						
						expect(collection.length).to.equal(1);
					});
					
					it ('should accept an array of object literals', function () {
						var ary = [
							{},
							{},
							{}
						];
						
						collection.add(ary);
						
						expect(collection.length).to.equal(3);
					});
					
				});
				
				describe('@opts', function () {
					
					var collection;
					
					before(function () {
						collection = new Collection();
					});
					
					after(function () {
						collection.destroy({destroy: true});
					});
					
					describe('~merge', function () {
						
						afterEach(function () {
							collection.empty({destroy: true});
						});
						
						it ('should merge existing (found) models with new data when true',
							function () {
							
							// add a default model with a default id and some param to be updated
							// if found and possible to merge
							collection.add({id: 0, param: 0});
							
							// to test the merge interaction with some merged some not merged
							collection.add([{id: 0, param: 1}, {id: 1}]);
							
							expect(collection.length).to.equal(2);
							expect(collection.at(0).get('param')).to.equal(1);
						});
						
						it ('should ignore existing models when false', function () {
							
							// add a default model with a default id and some param to be updated
							// if found and possible to merge
							collection.add({id: 0, param: 0});
							
							// to test the merge interaction with some merged some not merged
							collection.add([{id: 0, param: 1}, {id: 1}], {merge: false});
							
							expect(collection.length).to.equal(2);
							expect(collection.at(0).get('param')).to.equal(0);
						});
						
					});
					
					describe('~purge', function () {
						
						afterEach(function () {
							collection.empty({destroy: true});
						});
						
						it ('should remove models from the existing dataset that are not ' +
							'included in the new dataset', function () {
							
							// add a default model
							collection.add({id: 0});
							
							// to test the merge interaction with purge
							collection.add([{id: 1}, {id: 2}], {purge: true});
							
							expect(collection.length).to.equal(2);
							expect(collection.at(0).get('id')).to.equal(1);
							expect(collection.at(1).get('id')).to.equal(2);
						});
						
					});
					
					describe('~destroy', function () {
						
						afterEach(function () {
							collection.empty({destroy: true});
						});
						
						it ('should destroy models removed if the purge and destroy flags are true',
							function () {
							
							var models;
							
							collection.add([
								{id: 0},
								{id: 1},
								{id: 2}
							]);
							
							// keep a copy of the models that were just instanced to check after
							models = collection.models.slice();
							collection.add({id: 3}, {purge: true, destroy: true});
							
							models.forEach(function (ln) {
								expect(ln.destroyed).to.be.true;
							});
						});
						
					});
					
					describe('~silent', function () {
						
						afterEach(function () {
							collection.empty({destroy: true});
						});
						
						it ('should not emit events or notifications if the silent flag is true',
							function () {
							
							var spy = sinon.spy();
							
							// before we test we actually want to add some items to check the more
							// complex scenario where it would emit several
							collection.add([{id: 0, param: 0}, {id: 1}]);
							
							// register the spy for any possible event to be emitted from the
							// addition
							collection.on('*', spy);
							
							// register an observer for any notifications emitted from the addition
							collection.observe('*', spy);
							
							// this should ultimately trigger an add and remove and a change event
							collection.add([{id: 0, param: 1}, {id: 2}], {
								purge: true,
								destroy: true,
								silent: true
							});
							
							expect(collection.length).to.equal(2);
							expect(collection.at(0).get('param')).to.equal(1);
							expect(collection.at(0).get('id')).to.equal(0);
							expect(collection.at(1).get('id')).to.equal(2);
							expect(spy.callCount).to.equal(0);
							
							collection.unobserve('*', spy);
							collection.off('*', spy);
						});
						
					});
					
					describe('~parse', function () {
						
						afterEach(function () {
							collection.empty({destroy: true});
						});
						
						it ('should call the collection\'s parse method if set to true before ' +
							'evaluating the @models parameter', function () {
							
							var stub = sinon.stub(collection, 'parse');
							
							collection.add({}, {parse: true});
							
							expect(stub.callCount).to.equal(1);
							
							stub.restore();
						});
						
					});
					
					describe('~find', function () {
						
						afterEach(function () {
							collection.empty({destroy: true});
						});
						
						it ('should look for an existing instance of the model being added in ' +
							'the collection and store before instancing it', function () {
							
							var spy = sinon.spy(),
								model = new Model({id: 1}, null, {noAdd: true});
							
							// we pre-add a model to the collection
							collection.add({id: 0});
							
							// we pre-add a model to the store
							enyo.store.add(model);
							
							// this spy should not be called but once
							collection.on('add', spy);
							
							// simple test, re-add the same record and it should do nothing
							collection.add({id: 0});
							
							// should add to the collection but not create a new one
							collection.add({id: 1});
							
							expect(spy.callCount).to.equal(1);
							expect(collection.length).to.equal(2);
							expect(collection.at(1)).to.eql(model);
							collection.off('add', spy);
							model.destroy();
						});
						
						it ('should ignore existing models and create new instances when false ' +
							'and merge is false', function () {
							
								var spy = sinon.spy(),
									model = new Model({id: 1}, null, {noAdd: true});
							
								// we pre-add a model to the collection
								collection.add({id: 0});
							
								// we pre-add a model to the store
								enyo.store.add(model);
							
								// this spy should not be called but once
								collection.on('add', spy);
								
								// simple test, re-add the same record and it should do nothing
								collection.add({id: 0}, {find: false, merge: false});
							
								// should add to the collection but not create a new one
								collection.add({id: 1}, {find: false});
							
								expect(spy.callCount).to.equal(2);
								expect(collection.length).to.equal(3);
								expect(collection.at(1)).to.not.eql(model);
								collection.off('add', spy);
								model.destroy();
						});
						
					});
					
					describe('~sort', function () {
						
						before(function () {
							collection.comparator = function (a, b) {
								if (a.get('id') > b.get('id')) return 1;
								else return -1;
							};
						});
						
						after(function () {
							collection.comparator = null;
						});
						
						afterEach(function () {
							collection.empty({destroy: true});
						});
						
						it ('should use the comparator method of the collection if true',
							function () {
							
							collection.add([
								{id: 200},
								{id: 201},
								{id: 3},
								{id: 3000},
								{id: 456}
							], {sort: true});
							
							// using the comparator we added this should have reversed their
							// order so we should see smallest -> largest id ascending order
							expect(collection.map(function (ln) {
								return ln.get('id');
							}).join(',')).to.equal('3,200,201,456,3000');
						});
						
						it ('should use the provided method if a function', function () {
							
							var fn = function (a, b) {
								if (a.get('id') > b.get('id')) return -1;
								else return 1;
							};
							
							collection.add([
								{id: 200},
								{id: 201},
								{id: 3},
								{id: 3000},
								{id: 456}
							], {sort: fn});
							
							// using the comparator we added this should have reversed their
							// order so we should see smallest -> largest id ascending order
							expect(collection.map(function (ln) {
								return ln.get('id');
							}).join(',')).to.equal('3000,456,201,200,3');
						});
						
					});
					
					describe('~commit', function () {
						
						afterEach(function () {
							collection.empty({destroy: true});
						});
						
						it ('should call commit when commit is true and changes are made',
							function () {
							
							var stub = sinon.stub(collection, 'commit');
							
							collection.add({}, {commit: true});
							
							expect(stub.callCount).to.equal(1);
							stub.restore();
						});
						
						it ('should not call commit when commit is true but changes are not made',
							function () {
							
							var stub = sinon.stub(collection, 'commit');
							
							collection.add({id: 0});
							
							collection.add({id: 0}, {merge: false, commit: true});
							
							expect(stub.callCount).to.equal(0);
							stub.restore();
						});
						
					});
					
					describe('~create', function () {
						
						afterEach(function () {
							collection.empty({destroy: true});
						});
						
						it ('should create an instance if it cannot resolve a model', function () {
							
							collection.add({});
							expect(collection.length).to.equal(1);
						});
						
						it ('should not create an instance if it cannot resolve a model and the ' +
							'create flag is false', function () {
							
							collection.add({}, {create: false});
							expect(collection.length).to.equal(0);
						});
						
					});
					
					describe('~index', function () {
						
						afterEach(function () {
							collection.empty({destroy: true});
						});
						
						it ('should default to adding models to the end if not set explicitly',
							function () {
							var model = new Model();
							
							collection.add([{}, {}, {}]);
							
							// check to make sure that it will add it at the end automatically
							collection.add(model);
							expect(collection.at(3)).to.eql(model);
							model.destroy();
						});
						
						it ('should add a model at the given valid index', function () {
							var model = new Model();
							
							collection.add([{}, {}, {}]);
							
							// add it at a different index to see if it updates the indices
							// properly
							collection.add(model, {index: 1});
							expect(collection.length).to.equal(4);
							expect(collection.at(1)).to.eql(model);
							model.destroy();
						});
						
						it ('should add models at the given valid index', function () {
							var model1 = new Model(),
								model2 = new Model(),
								ary = [model1, {}, {}, model2];
								
							collection.add([{}, {}, {}]);
							
							// splice these models into the collection at the requested index
							collection.add(ary, {index: 0});
							expect(collection.length).to.equal(7);
							expect(collection.at(0)).to.eql(model1);
							expect(collection.at(3)).to.eql(model2);
							model1.destroy();
							model2.destroy();
						});
						
					});
					
					describe('~modelOptions', function () {
						
						afterEach(function () {
							collection.empty({destroy: true});
						});
						
						it ('should pass these options to the enyo.Model constructor when ' +
							'create is true', function () {
							var spy = sinon.spy(Model.prototype, 'parse');
							
							collection.add({}, {modelOptions: {parse: true}});
							
							expect(spy.callCount).to.equal(1);
							spy.restore();
						});
						
					});
					
				});
				
			});
			
		});
		
		describe('#remove', function () {
			
			var collection;
			
			before(function () {
				collection = new Collection();
			});
			
			after(function () {
				collection.destroy({destroy: true});
			});
			
			it ('should respond to the method remove', function () {
				expect(proto).to.itself.respondTo('remove');
			});
			
			it ('should notify observers of the length property when it is updated', function () {
				
				var spy = sinon.spy();
				
				collection.add({});
				
				// add the spy as an observer for length changes
				collection.observe('length', spy);
				collection.remove(collection.at(0), {destroy: true});
				
				expect(collection.length).to.equal(0);
				expect(spy.callCount).to.equal(1);
				
				collection.unobserve(spy);
			});
			
			it ('should stop listening to events from models that are removed', function () {
				
				// note that collections emit a change event when any model emits a change event
				var spy = sinon.spy(),
					model;
				
				collection.add({});
				model = collection.at(0);
				
				collection.on('change', spy);
				
				model.set('prop', 'value');
				expect(spy.callCount).to.equal(1);
				spy.reset();
				collection.remove(model);
				model.set('prop', null);
				
				expect(spy.callCount).to.equal(0);
				collection.off('change', spy);
			});
			
			describe('params', function () {
				
				describe('@models', function () {
					
					before(function () {
						collection.add([
							{},
							{},
							{}
						]);
					});
					
					after(function () {
						collection.empty({destroy: true});
					});
					
					it ('should accept a model instance', function () {
						collection.remove(collection.at(0));
						expect(collection.length).to.equal(2);
					});
					
					it ('should accept an array of model instances', function () {
						collection.remove(collection.models);
						expect(collection.length).to.equal(0);
					});
					
				});
				
				describe('@opts', function () {
					
					describe('~silent', function () {
						
						it ('should not emit events or notifications if the silent flag is true',
							function () {
							
							var spy = sinon.spy();
							
							collection.add({});
							
							// add the spy as a listener for events and for notifications
							collection.on('*', spy);
							collection.observe('*', spy);
							
							collection.remove(collection.models, {silent: true, destroy: true});
							
							expect(collection.length).to.equal(0);
							expect(spy.called).to.be.false;
						});
						
					});
					
					describe('~commit', function () {
						
						it ('should call commit when commit is true and changes are made',
							function () {
							
							var stub;
							
							collection.add({});
							
							stub = sinon.stub(collection, 'commit');
							
							collection.remove(collection.models, {commit: true});
							
							expect(stub.callCount).to.equal(1);
							stub.restore();
						});
						
						it ('should not call commit when commit is true but changes are not made',
							function () {
							
							var model = new Model(),
								stub = sinon.stub(collection, 'commit');
							
							// attempt to remove a model that is not in the collection
							collection.remove(model, {commit: true});
							
							expect(stub.callCount).to.equal(0);
							stub.restore();
							model.destroy();
						});
						
					});
					
					describe('~complete', function () {
						
						it ('should remove a model from the collection\'s store reference if it ' +
							'is true and the model was also removed from the collection',
							function () {
							
							var model;
							
							collection.add({});
							model = collection.at(0);
							
							expect(collection.store.has(model)).to.be.true;
							
							collection.remove(model, {complete: true});
							
							expect(collection.length).to.equal(0);
							expect(collection.store.has(model)).to.be.false;
							
							model.destroy();
						});
						
					});
					
					describe('~destroy', function () {
						
						it ('should destroy the models removed from the collection', function () {
							
							var models;
							
							collection.add([
								{},
								{},
								{}
							]);
							
							models = collection.models.slice();
							collection.remove(collection.models, {destroy: true});
							
							expect(collection.length).to.equal(0);
							
							models.forEach(function (ln) {
								expect(ln.destroyed).to.be.true;
							});
						});
						
					});
					
				});
				
			});
			
		});
		
		describe('#sort', function () {
			
		});
		
		describe('#forEach', function () {
			
		});
		
		describe('#filter', function () {
			
		});
		
		describe('#parse', function () {
			
		});
		
		describe('#at', function () {
			
		});
		
		describe('#raw', function () {
			
		});
		
		describe('#has', function () {
			
		});
		
		describe('#find', function () {
			
		});
		
		describe('#map', function () {
			
		});
		
		describe('#indexOf', function () {
			
		});
		
		describe('#empty', function () {
			
		});
		
		describe('#toJSON', function () {
			
		});
		
		describe('#commit', function () {
			
		});
		
		describe('#fetch', function () {
			
		});
		
		describe('#destroy', function () {
			
		});

	});
	
	describe('statics', function () {
		
		describe('~constructor', function () {
			
		});
		
		describe('~concat', function () {
			
		});
		
	});
	
	describe('usage', function () {
		
		describe('events', function () {
			
			
			
		});
		
		
	});
	
});