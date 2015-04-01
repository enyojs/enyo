describe('enyo.RelationalModel', function () {
	
	// convenience mechanism for quicker reference of the constructor
	var Relational = enyo.RelationalModel;
	
	describe('methods', function () {
		
		// convenience mechanism for quicker reference of the prototype
		var proto = Relational.prototype,
		
		// the primary model instance to reuse between tests
			model;
			
		var Model;
		
		before(function () {
			
			// a generic nested relational kind for a specific test case
			enyo.kind({
				name: 'GenericModel',
				kind: Relational,
				relations: [
					{
						type: 'toOne',
						key: 'nestedToOne',
						isOwner: true,
						create: true
					}
				]
			});
		
			// a generic kind with a bunch of various relations to use for the following api tests
			Model = enyo.kind({
				kind: Relational,
				relations: [
					{
						type: 'toOne',
						key: 'toOne',
						model: 'GenericModel',
						isOwner: true,
						create: true,
						includeInJSON: false
					},
					{
						type: 'toMany',
						key: 'toMany',
						isOwner: true,
						includeInJSON: false
					},
					{
						type: 'manyToMany',
						key: 'manyToMany',
						isOwner: true,
						includeInJSON: false
					},
					{
						type: 'toOne',
						key: 'toOneNotOwned',
						isOwner: false,
						includeInJSON: false
					}
				]
			});
			
			model = new Model({
				id: 0,
				toOne: {
					nestedToOne: {
						nestedToOneProp: true
					}
				}
			});
		});
		
		after(function () {
			// dereference the constructor
			Model = null;
			GenericModel = null;
			// breakdown the model instance
			model.destroy();
		});
	
		describe('#getRelation', function () {
			
			it ('should respond to the method getRelation', function () {
				expect(proto).to.itself.respondTo('getRelation');
			});
			
			it ('should return a Relation instance if it exists for the requested key or falsy',
				function () {
					expect(model.getRelation('toOne')).to.be.an.instanceof(enyo.toOne);
					expect(model.getRelation('INVALID')).to.not.be.ok;
			});
			
		});
		
		describe('#isRelation', function () {
			
			it ('should respond to the method isRelation', function () {
				expect(proto).to.itself.respondTo('isRelation');
			});
			
			it ('should should return a relation instance if a relation exists for the ' +
				'requested key or falsy', function () {
				expect(model.isRelation('toOne')).to.be.an.instanceof(enyo.toOne);
				expect(model.isRelation('INVALID')).to.not.be.ok;
			});
			
		});
		
		describe('#get', function () {
			
			it ('should respond to the method get', function () {
				expect(proto).to.itself.respondTo('get');
			});
			
			it ('should return a value from the attributes hash when a non-recursive string path ' +
				'is provided', function () {
				expect(model.get('id')).to.equal(0);
			});
			
			it ('should return an instance of a model when requesting a toOne relation key',
				function () {
				
				expect(model.get('toOne')).to.be.an.instanceof(Relational);
			});
			
			it ('should return an instance of a collection when requesting a toMany or a ' +
				'manyToMany relation key', function () {
				
				expect(model.get('toMany')).to.be.an.instanceof(enyo.Collection);
				expect(model.get('manyToMany')).to.be.an.instanceof(enyo.Collection);
			});
			
			it ('should return an attribute from a nested relational model when a recursive ' +
				'string path is provided', function () {
				
				expect(model.get('toOne.nestedToOne.nestedToOneProp')).to.be.true;
			});
			
		});
		
		describe('#set', function () {
			
			it ('should respond to the method set', function () {
				expect(proto).to.itself.respondTo('set');
			});
			
			it ('should set a property of the attributes hash to the value when a ' +
				'non-recursive string path is provided', function () {
				
				// so we set a value of the parent model
				model.set('testprop', true);
				
				// and we expect it to have been set
				expect(model.get('testprop')).to.be.true;
				expect(model.attributes.testprop).to.be.true;
			});
			
			it ('should set a property of the attributes hash of a related toOne model ' +
				'when a recursive string path is provided', function () {
				
				// set a recursive value of the toOne related model
				model.set('toOne.testprop', true);
				// set an even more recursive value of the toOne's nested related model
				model.set('toOne.nestedToOne.testprop', true);
				
				// ensure they were both updated as expected
				expect(model.get('toOne').attributes.testprop).to.be.true;
				expect(model.get('toOne.nestedToOne').attributes.testprop).to.be.true;
			});
			
			it ('should set a property of a related toMany collection when a recursive ' +
				'string path is provided', function () {
				
				// set the recursive path of the toMany relation to some value
				model.set('toMany.testprop', true);
				
				// make sure it was set
				expect(model.get('toMany.testprop')).to.be.true;
				expect(model.get('toMany').testprop).to.be.true;
			});
			
		});
		
		describe('#raw', function () {
			
			it ('should respond to the method raw', function () {
				expect(proto).to.itself.respondTo('raw');
			});
			
			it ('should return a hash with the attributes of the model', function () {
				// as we designated in the model definition nothing else was to be included
				// but we will test that next
				expect(model.raw()).to.eql({
					id: 0,
					testprop: true
				});
			});
			
			it ('should return only the keys requested in the includeKeys array', function () {
				// first we modify the array to just get the id
				model.includeKeys = ['id'];
				expect(model.raw()).to.eql({
					id: 0
				});
			});
			
		});
		
		describe('#fetchRelated', function () {
			it ('should be able to fetch data for all relations');
			it ('should be able to fetch data for the specified relation');
		});
		
		describe('#destroy', function () {
			
			// for this we create a separate instance of the model we've been looking at
			var model;
			
			beforeEach(function () {
				if (!model || model.destroyed) model = new Model();
			});
			
			afterEach(function () {
				if (!model.destroyed) model.destroy();
			});
			
			it ('should respond to the method destroy', function () {
				expect(proto).to.itself.respondTo('destroy');
			});
			
			it ('should destroy all relations', function () {
				var stubs = [];
				// we want to stub these destroys to ensure that they are called as expected
				model.relations.forEach(function (rel) {
					stubs.push(sinon.spy(rel, 'destroy'));
				});
				
				// now we destroy the model and look at all the stubs to ensure they were
				// all called
				model.destroy();
				
				stubs.forEach(function (stub) {
					expect(stub.called).to.be.true;
				});
			});
			
			it ('should cause all relations with isOwner true to destroy their models as well',
				function () {
				var extra;
				
				// we need to make sure we add an instance of the unowned relation
				model.set('toOneNotOwned', (extra = new Relational()));
				
				// we need to stub the destroy methods of all of the related models to ensure
				// that they are destroyed as well
				var spy1 = sinon.spy(model.get('toOne'), 'destroy'),
					spy2 = sinon.spy(model.get('toOne.nestedToOne'), 'destroy'),
					spy3 = sinon.spy(model.get('toMany'), 'destroy'),
					spy4 = sinon.spy(model.get('manyToMany'), 'destroy'),
					// the only one we expect NOT to be called
					spy5 = sinon.spy(model.get('toOneNotOwned'), 'destroy');
				
				// now destroy the model
				model.destroy();
				
				// now check for the expected call status of all of the destroy methods
				// except the one
				expect(spy1.called).to.be.true;
				expect(spy2.called).to.be.true;
				expect(spy3.called).to.be.true;
				expect(spy4.called).to.be.true;
				// the one case that should not be true
				expect(spy5.called).to.be.false;
				
				// make sure to clean up the additional model
				extra.destroy();
			});
			
			it ('should cause a remote destroy attempt when option complete is true');
			
		});
	
	});
		
	describe('relation options', function () {
	
		describe('~type', function () {
			
			var model;
			
			var Model;
			
			before(function () {
				Model = enyo.kind({
					kind: Relational,
					relations: [
						{
							key: 'defaultedToOne'
						},
						{
							type: 'toOne',
							key: 'toOneString'
						},
						{
							type: 'enyo.toOne',
							key: 'enyo.toOneString'
						},
						{
							type: enyo.toOne,
							key: 'enyo.toOneConstructor'
						},
						{
							type: 'toMany',
							key: 'toManyString'
						},
						{
							type: 'enyo.toMany',
							key: 'enyo.toManyString'
						},
						{
							type: enyo.toMany,
							key: 'enyo.toManyConstructor'
						},
						{
							type: 'manyToMany',
							key: 'manyToManyString'
						},
						{
							type: 'enyo.manyToMany',
							key: 'enyo.manyToManyString'
						},
						{
							type: enyo.manyToMany,
							key: 'enyo.manyToManyConstructor'
						}
					]
				});
				model = new Model();
			});
			
			after(function () {
				Model = null;
				model.destroy();
			});
			
			it ('should accept all variations of type declarations for relations', function () {
				expect(model.getRelation('toOneString'))
					.to.be.an.instanceof(enyo.toOne);
				expect(model.getRelation('enyo.toOneString'))
					.to.be.an.instanceof(enyo.toOne);
				expect(model.getRelation('enyo.toOneConstructor'))
					.to.be.an.instanceof(enyo.toOne);
				expect(model.getRelation('toManyString'))
					.to.be.an.instanceof(enyo.toMany);
				expect(model.getRelation('enyo.toManyString'))
					.to.be.an.instanceof(enyo.toMany);
				expect(model.getRelation('enyo.toManyConstructor'))
					.to.be.an.instanceof(enyo.toMany);
				expect(model.getRelation('manyToManyString'))
					.to.be.an.instanceof(enyo.manyToMany);
				expect(model.getRelation('enyo.manyToManyString'))
					.to.be.an.instanceof(enyo.manyToMany);
				expect(model.getRelation('enyo.manyToManyConstructor'))
					.to.be.an.instanceof(enyo.manyToMany);
			});
			
			it ('should default to enyo.toOne', function () {
				expect(model.getRelation('defaultedToOne')).to.be.an.instanceof(enyo.toOne);
			});
			
		});
		
		describe('~key', function () {
			
			var model;
			
			var Model;
			
			before(function () {
				Model = enyo.kind({
					kind: Relational,
					relations: [
						{
							type: 'toOne',
							key: 'toOne',
							inverseKey: 'toOneInverse',
							isOwner: true,
							create: true
						}
					]
				});
				model = new Model();
			});
			
			after(function () {
				Model = null;
				model.destroy();
			});
			
			it ('should be used as the local key in the attributes hash of the model the ' +
				'relation belongs to and point to the instance of the relation', function () {
				
				expect(model.attributes.toOne).to.be.an.instanceof(enyo.toOne);
			});
			
			it ('should be used as the implicit inverseKey in automatic reverse relations',
				function () {
				
				expect(model.get('toOne').getRelation('toOneInverse').inverseKey).to.equal('toOne');
			});
			
		});
		
		describe('~inverseKey', function () {
			
			var model1,
				model2;
			
			var Model;
			
			before(function () {
				Model = enyo.kind({
					kind: Relational,
					relations: [
						{
							type: 'toOne',
							key: 'toOne',
							inverseKey: 'toOneInverse'
						}
					]
				});
				model1 = new Relational({toOneInverse: 0});
				model2 = new Model({id: 0});
			});
			
			after(function () {
				Model = null;
				model1.destroy();
				model2.destroy();
			});
			
			it ('should use the inverseKey to find existing models', function () {
				expect(model2.get('toOne')).to.eql(model1);
			});
			
			it ('should be used as the implicit inverseKey in automatic reverse relations',
				function () {
				
				expect(model2.get('toOne.toOneInverse')).to.eql(model2);
			});
			
		});
	
		describe('~isOwner', function () {
			
			var model;
			
			var Model;
			
			before(function () {
				Model = enyo.kind({
					kind: Relational,
					relations: [
						{
							type: 'toOne',
							key: 'toOneOwned',
							isOwner: true
						},
						{
							type: 'toOne',
							key: 'toOneNotOwned',
							create: true
						}
					]
				});
				model = new Model();
			});
			
			after(function () {
				Model = null;
				model.get('toOneNotOwned').destroy();
				model.destroy();
			});
			
		});
	
		describe('~includeInJSON', function () {
			
			var model;
			
			var Model;
			
			before(function () {
				Model = enyo.kind({
					kind: Relational,
					relations: [
						{
							type: 'toOne',
							key: 'toOne',
							isOwner: true,
							create: true,
							includeInJSON: false
						},
						{
							type: 'toOne',
							key: 'toOneNotOwned',
							isOwner: false,
							create: true
						}
					]
				});
				model = new Model({
					toOne: 10,
					toOneNotOwned: 11
				});
			});
			
			after(function () {
				Model = null;
				model.get('toOneNotOwned').destroy();
				model.destroy();
			});
			
			it ('should not include a relation in raw output when includeInJSON is false',
				function () {
				
				expect(model.raw()).to.eql({
					toOneNotOwned: 11
				});
			});
			
			it ('should include the entire relation raw output when includeInJSON is true and ' +
				'isOwner is true', function () {
				
				// update the flag so the test can do what it needs
				model.getRelation('toOne').includeInJSON = true;
				expect(model.raw()).to.eql({
					toOne: {
						id: 10
					},
					toOneNotOwned: 11
				});
			});
			
			it ('should include the id of the relation by default when isOwner is false and no ' +
				'other property/properties is/are specified', function () {
				
				expect(model.raw().toOneNotOwned).to.equal(11);
			});
			
			it ('should include a single key when includeInJSON is a string', function () {
				// update the relational flag
				model.getRelation('toOne').includeInJSON = 'name';
				// add a value for it to attempt to retrieve
				model.set('toOne.name', 'expected value');
				
				expect(model.raw().toOne).to.equal('expected value');
			});
			
			it ('should include all keys requested when includeInJSON is an array', function () {
				// udpate the relational flag
				model.getRelation('toOne').includeInJSON = ['name', 'age'];
				// add a value
				model.set('toOne.age', 12);
				
				expect(model.raw().toOne).to.eql({
					name: 'expected value',
					age: 12
				});
			});
			
			it ('should include any return value when includeInJSON is a function', function () {
				// update relational flag
				model.getRelation('toOne').includeInJSON = function () { return 'new value'; };
				
				expect(model.raw().toOne).to.equal('new value');
			});
			
		});
		
		describe('~create', function () {
			
			var model;
			
			var Model;
			
			before(function () {
				Model = enyo.kind({
					kind: Relational,
					relations: [
						{
							type: 'toOne',
							key: 'toOne',
							create: true
						}
					]
				});
				model = new Model({
					toOne: {
						id: 10
					}
				});
			});
			
			after(function () {
				Model = null;
				model.destroy();
			});
			
			it ('should create an instance when create is true', function () {
				expect(model.get('toOne')).to.be.an.instanceof(Relational);
			});
			
			it ('should use existing data when creating an instance when create is true',
				function () {
				
				expect(model.get('toOne.id')).to.equal(10);
			});
			
		});
		
		describe('~parse', function () {
			
			var model;
			
			before(function () {
				
				enyo.kind({
					name: 'GenericModel1',
					kind: Relational,
					noDefer: true,
					relations: [
						{
							type: 'toOne',
							key: 'toOne',
							model: 'GenericModel2',
							create: true,
							parse: true
						}
					]
				});
				
				
				enyo.kind({
					name: 'GenericModel2',
					kind: Relational,
					noDefer: true
				});
				
			});
			
			after(function () {
				GenericModel1 = null;
				GenericModel2 = null;
				if (model && !model.destroyed) model.destroy();
			});
			
			it ('should force a model to execute its parse method when creating an instance and ' +
				'parse is true', function () {

				var spy = sinon.spy(GenericModel2.prototype, 'parse');
				model = new GenericModel1({toOne: 10});
				expect(spy.called).to.be.true;
			});
			
		});
		
		describe ('#autoFetch', function () {
			
			it ('should not be true by default');
			it ('should automatically attempt to fetch remote data when autoFetch is true');
			
		});
		
		describe ('#inverseType', function () {
			
			it ('should be ignored in explicit relations');
			it ('should be used to instance automatic reverse relations');
			
		});
		
	});
	
	describe ('usage', function () {
		
		describe ('manyToMany', function () {
			
			// the collection of teachers we create for the tests
			var teachers,
			
			// the collection of students we create for the tests
				students;
			
			before(function () {
			
				// for this series of tests we will use the Teacher/Student paradigm for human
				// readability and understanding and dereference the constructors when we're done
				enyo.kind({
					name: 'Teacher',
					kind: Relational,
					relations: [
						{
							type: 'manyToMany',
							model: 'Student',
							key: 'students',
							inverseKey: 'teachers'
						}
					]
				});
			
				enyo.kind({
					name: 'Student',
					kind: Relational,
					relations: [
						{
							type: 'manyToMany',
							model: 'Teacher',
							key: 'teachers',
							inverseKey: 'students',
							includeInJSON: false
						}
					]
				});
				
				// we will instantiate 3 teachers and then multiple students assigned
				// to the various teachers
				
				// note that we test directionality and instantiation order here
				teachers = new enyo.Collection([
					
					// this is an example of the declaration of Teacher before student
					// is instantiated and notice the student does not have a record of
					// the teacher
					{id: 0, students: [3]},
					{id: 1},
					
					// this is an example of mix-match from both directions
					{id: 2, students: [3]}
				], {model: 'Teacher'});
				
				students = new enyo.Collection([
					{id: 0, teachers: [0, 2]},
					{id: 1, teachers: [0, 1]},
					{id: 2, teachers: [1, 2]},
					{id: 3},
					{id: 4, teachers: [0, 1, 2]},
					{id: 5, teachers: [2]}
				], {model: 'Student'});
			});
			
			after(function () {
				// destroy the collections and their models
				teachers.destroy();
				students.destroy();
				// dereference the constructors
				Teacher = null;
				Student = null;
			});
			
			// the teachers are instantiated first so we are matching the system's ability
			// to find the identified student once it is actually instanced and vice-versa
			it ('should identify related models when related identifier is found before ' +
				'the instance of the related model has been generated', function () {
				
				var teacher1 = teachers.at(0),
					student4 = students.at(3);
				
				// ensure they both actually exist as expected
				expect(teacher1).to.exist;
				expect(student4).to.exist;
				
				// now we need to ensure that the correct number of students were found for
				// the teacher
				expect(teacher1.get('students')).to.have.length(4);
				// that student4 is one of those students
				expect(teacher1.get('students').indexOf(student4) > -1).to.be.true;
				// that student4 has teacher1 as one of its teachers
				expect(student4.get('teachers').indexOf(teacher1) > -1).to.be.true;
			});
			
			it ('should identify related models when they have already been generated ' +
				'and added to the store', function () {
				
				// look at each of the relations (both ends) and determine if the correct
				// number of entries exists
				expect(teachers.at(0).get('students')).to.have.length(4);
				expect(teachers.at(1).get('students')).to.have.length(3);
				expect(teachers.at(2).get('students')).to.have.length(5);
				expect(students.at(0).get('teachers')).to.have.length(2);
				expect(students.at(1).get('teachers')).to.have.length(2);
				expect(students.at(2).get('teachers')).to.have.length(2);
				expect(students.at(3).get('teachers')).to.have.length(2);
				expect(students.at(4).get('teachers')).to.have.length(3);
				expect(students.at(5).get('teachers')).to.have.length(1);
			});
			
			it ('should properly update all related models when one end is destroyed',
				function () {
				
				// we will destroy a teacher and expect all students that included it previously
				// to update as expected
				var teacher2 = teachers.at(1),
					student2 = students.at(1),
					student3 = students.at(2),
					student5 = students.at(4);
					
				expect(student2.get('teachers').indexOf(teacher2) > -1).to.be.true;
				expect(student3.get('teachers').indexOf(teacher2) > -1).to.be.true;
				expect(student5.get('teachers').indexOf(teacher2) > -1).to.be.true;
				
				// destroy it
				teacher2.destroy();
				
				// now we expect all of these students to no longer maintain their reference to
				// the destroyed teacher
				
				// note that the test reports slow because of these contiguous lookups
				expect(student2.get('teachers').indexOf(teacher2) === -1).to.be.true;
				expect(student3.get('teachers').indexOf(teacher2) === -1).to.be.true;
				expect(student5.get('teachers').indexOf(teacher2) === -1).to.be.true;
			});
			
			it ('should properly update all related models when one is created post-initialization',
				function () {
				
				var teacher4;
				
				// we will create a new teacher related to a bunch of students and check to
				// see if they were updated internally with the new teacher as expected
				teachers.add({
					id: 3,
					students: [0, 1]
				});
				
				// because we destroyed one the index is off by one
				teacher4 = teachers.at(2);
				
				// we expect it to have those students
				expect(teacher4.get('students')).to.have.length(2);
				
				// and we expect those students to now have that teacher
				expect(students.at(0).get('teachers').indexOf(teacher4) > -1).to.be.true;
				expect(students.at(1).get('teachers').indexOf(teacher4) > -1).to.be.true;
			});
			
			it ('should properly update all related models when a relationship is added between ' +
				'existing models', function () {
				
				// we will attempt this bidirectionally if not for any other reason than
				// completeness
				var student3 = students.at(2),
					teacher4 = teachers.at(2),
					spy = sinon.spy();
				
				expect(student3.get('teachers').indexOf(teacher4) === -1).to.be.true;
				expect(teacher4.get('students').indexOf(student3) === -1).to.be.true;
				
				// register a spy to detect if the student will announce a change event as
				// expected
				student3.on('change', spy);
				
				// so we go ahead and add it
				student3.get('teachers').add(teacher4);
				
				// and now we see if it actually updated as expected
				expect(student3.get('teachers').indexOf(teacher4) > -1).to.be.true;
				expect(teacher4.get('students').indexOf(student3) > -1).to.be.true;
				expect(spy.called).to.be.true;
			});
			
			it ('should properly update all related models when a relationship is removed ' +
				'between existing models', function () {
				
				// we will attempt this bidirectionally if not for any other reason than
				// completeness
				var student3 = students.at(2),
					teacher4 = teachers.at(2),
					spy = sinon.spy();
				
				expect(student3.get('teachers').indexOf(teacher4) > -1).to.be.true;
				expect(teacher4.get('students').indexOf(student3) > -1).to.be.true;
				
				// register a spy to detect if the student will announce a change event as
				// expected
				student3.on('change', spy);
				
				// so we go ahead and add it
				student3.get('teachers').remove(teacher4);
				
				// and now we see if it actually updated as expected
				expect(student3.get('teachers').indexOf(teacher4) === -1).to.be.true;
				expect(teacher4.get('students').indexOf(student3) === -1).to.be.true;
				expect(spy.called).to.be.true;
			});
			
		});
	
		describe('events', function () {
			
			// the model instance we'll be using
			var model;
			
			// we create a temporary kind that houses the types of relations we want to test
			var Model = enyo.kind({
				kind: Relational,
				relations: [
					{
						// changes to this relation should indicate a change on our parent
						type: 'toOne',
						key: 'toOneOwned',
						create: true,
						isOwner: true
					},
					{
						// changes to this relation should not indicate a change on our parent
						type: 'toOne',
						key: 'toOneNotOwned',
						create: true,
						isOwner: false
					},
					{
						// changes to this collection should indicate a change on our parent
						type: 'toMany',
						key: 'toMany',
						create: true,
						isOwner: true
					}
				]
			});
			
			before(function () {
				model = new Model({
					// we hand it an instance because it wouldn't have created it anyway because
					// it isn't the owner
					toOneNotOwned: new Relational()
				});
			});
			
			after(function () {
				// dereference the constructor
				Model = null;
				// breakdown our instance
				model.get('toOneNotOwned').destroy();
				model.destroy();
			});
		
			it ('should propagate change events when isOwner is true and a child-relation ' +
				'changes', function () {
				
				// we create a spy to simply detect if the event fired when expected
				var spy = sinon.spy();
				model.on('change', spy);
				
				// now we touch the relation we own to try and trigger the resulting change on
				// the parent
				model.set('toOneOwned.id', 0);
				
				// we remove the spy now
				model.off('change', spy);
				
				// this test is important because it ensures it was called and only once which
				// is very, very important!
				expect(spy.callCount).to.equal(1);
			});
			
			it ('should not propagate change events when isOwner is false and a child-relation ' +
				'changes', function () {
				
				// if the spy is called then it was notified needlessly
				var spy = sinon.spy();
				model.on('change', spy);
				
				// touch the non-owned relation
				model.set('toOneNotOwned.id', 0);
				
				// we remove the spy now
				model.off('change', spy);
				
				// ensure that the spy was never called
				expect(spy.called).to.be.false;
			});
			
			it ('should propagate a change event when isOwner is true and a toMany relation ' +
				'is updated', function () {
				
				var spy = sinon.spy();
				model.on('change', spy);
				
				// add a model to the collection
				model.get('toMany').add({});
				
				// remove the spy
				model.off('change', spy);
				
				// ensure that the spy was called and only called once
				expect(spy.callCount).to.equal(1);
			});
		
		});
		
		// we need to ensure that bindings function as expected in normal scenarios so we break
		// them down by type to see what we can get
		describe('bindings', function () {
			
			// the model instance to be used throughout these sub-tests
			var model,
			
			// the shared object instance to use as a binding target
				obj;
				
			var Model,
				ObjectCtor;
			
			before(function () {
				// the temporary kind to use
				Model = enyo.kind({
					kind: Relational,
					relations: [
						// we create a toOne relation
						{
							type: 'toOne',
							key: 'toOne',
							create: true,
							isOwner: true
						},
						// a toMany relation
						{
							type: 'toMany',
							key: 'toMany',
							isOwner: true
						},
						// and a manyToMany relation
						{
							type: 'manyToMany',
							key: 'manyToMany',
							isOwner: true
						}
					]
				});
			
				// the temporary object kind to use so we can test implicit bindings not just
				// imperative ones
				ObjectCtor = enyo.kind({
					kind: enyo.Object,
					bindings: [
						{from: 'model.toOne.toOneProp', to: 'toOneProp', oneWay: false},
						{from: 'model.toMany.length', to: 'toManyProp'},
						{from: 'model.manyToMany.length', to: 'manyToManyProp'}
					]
				});
				
				model = new Model({
					toOne: {
						toOneProp: 'expected value'
					},
					toMany: [
						{id: 0},
						{id: 1},
						{id: 2}
					],
					manyToMany: [
						{id: 3},
						{id: 4},
						{id: 5}
					]
				});
				obj = new ObjectCtor({model: model});
			});
			
			after(function () {
				// dereference constructors
				Model = null;
				ObjectCtor = null;
				// cleanup model and object
				model.destroy();
				obj.destroy();
			});
			
			describe('toOne', function () {
				
				it ('should be able to bind to an attribute of the relational model', function () {
					expect(obj.toOneProp).to.equal('expected value');
				});
				
				it ('should be able to set a two-way value', function () {
					// set the target-side of the two-way binding
					obj.set('toOneProp', 'next value');
					// ensure that it is being retrieved as expected via the getter
					expect(model.get('toOne.toOneProp')).to.equal('next value');
					// ensure that it was properly set on the attributes hash
					expect(model.get('toOne').attributes.toOneProp).to.equal('next value');
				});
				
			});
			
			describe('toMany', function () {
				
				it ('should be able to bind to a local property of the toMany relation',
					function () {
					
					expect(obj.get('toManyProp')).to.equal(3);
				});
				
			});
			
			describe('manyToMany', function () {
				
				it ('should be able to bind to a local property of the manyToMany relation',
					function () {
					
					expect(obj.get('manyToManyProp')).to.equal(3);
				});
				
			});
			
		});
		
	});
		
});