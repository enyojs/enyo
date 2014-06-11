describe('enyo.Collection', function () {
	
	var Collection = enyo.Collection,
		Model = enyo.Model;
	
	var proto = Collection.prototype;
	
	describe('methods', function () {
		
		describe('#add', function () {
			
			it ('should respond to the method add', function () {
				expect(proto).to.itself.respondTo('add');
			});
			
			describe('params', function () {
				
				var collection;
				
				before(function () {
					collection = new Collection();
				});
				
				after(function () {
					collection.destroy({destroy: true});
				});
				
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
			
			it ('should respond to the method remove', function () {
				expect(proto).to.itself.respondTo('remove');
			});
			
			describe('params', function () {
				
				var collection;
				
				before(function () {
					collection = new Collection();
				});
				
				after(function () {
					collection.destroy({destroy: true});
				});
				
				describe('@models', function () {
					
					before(function () {
						collection.add([
							{},
							{},
							{}
						]);
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
		
	});
	
});