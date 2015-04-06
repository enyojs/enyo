describe('ProgressiveFilter', function () {
	
	describe('properties', function () {
		
	});
	
	describe('usage', function () {
		
		describe('basic', function () {
		
			var filter,
				collection;
		
			before(function () {
				enyo.kind({
					name: 'TestProgressiveFilter',
					kind: 'enyo.ProgressiveFilter',
					method: function (model) {
						var regex = /^[Aa]/;
					
						return regex.test(model.get('name'));
					}
				});

				collection = new enyo.Collection();
				filter = new TestProgressiveFilter({collection: collection});
			});
		
			after(function () {
				TestProgressiveFilter = null;
			
				filter.destroy();
				collection.destroy();
			});
			
			
			it ('should correctly mirror the proxy collection unfiltered', function () {
				expect(filter.length).to.equal(0);
				
				collection.add([
					{name: 'Adam'},
					{name: 'Anthony'},
					{name: 'Adrian'},
					{name: 'Ashley'},
					{name: 'Bob'},
					{name: 'Joe'},
					{name: 'Mark'},
					{name: 'Zoey'}
				]);
				
				expect(filter.length).to.equal(8);
			});
			
			it ('should correctly apply the filter when triggered', function () {
				filter.filter();
				
				expect(filter.length).to.equal(4);
				expect(collection.length).to.equal(8);
			});
			
			it ('should correctly filter new models added to proxy collection when filtered',
				function () {
				
				collection.add([
					{name: 'Alex'},
					{name: 'Andrew'},
					{name: 'Scott'},
					{name: 'Peyton'}
				]);
				
				expect(collection.length).to.equal(12);
				expect(filter.length).to.equal(6);
			});
			
			it ('should update the filtered property when it has been filtered', function () {
				expect(filter.get('filtered')).to.be.true;
			});
			
			it ('should correctly return to mirror state when reset is called', function () {
				filter.reset();
				expect(filter.length).to.equal(collection.length);
			});
			
			it ('should update the filtered property when it has been reset', function () {
				expect(filter.get('filtered')).to.be.false;
			});
			
			it ('should correctly add all new models added to the proxy collection when ' +
				'unfiltered', function () {
				
				collection.add([
					{name: 'Anne'},
					{name: 'Alexadra'},
					{name: 'Parker'},
					{name: 'Ricky'}	
				]);
				
				expect(collection.length).to.equal(filter.length);
			});
			
			it ('should emit a change notification from a model contained in a filtered set',
				function () {
				
				var spy = sinon.spy(),
					model = collection.at(0);
				
				expect(model.get('name')).to.equal('Adam');
				filter.filter();
				expect(filter.has(model)).to.be.true;
				expect(filter.length).to.equal(8);
				
				filter.on('change', spy);
				model.set('age', 12);
				
				expect(spy.called).to.be.true;
				filter.off('change', spy);
			});
			
			it ('should not emit a change notification from a model not contained in a filtered ' +
				'set', function () {
				
				var spy = sinon.spy(),
					model = collection.at(4);
				
				expect(model.get('name')).to.equal('Bob');
				expect(filter.get('filtered')).to.be.true;
				expect(filter.has(model)).to.be.false;
				filter.on('change', spy);
				model.set('age', 10);
				
				expect(spy.called).to.be.false;
				filter.off('change', spy);
			});
			
			it ('should correctly force a reset when the proxy collection is sorted', function () {
				
				var spy = sinon.spy();
				filter.on('reset', spy);
				
				expect(filter.at(0).get('name')).to.equal('Adam');
				
				// sort them in descending order (inverse alphabetical)
				collection.sort(function (a, b) {
					var aname = a.get('name'),
						bname = b.get('name');
					
					if (aname > bname) return -1;
					else if (aname < bname) return 1;
					else return 0;
				});
				
				expect(collection.at(0).get('name')).to.equal('Zoey');
				expect(filter.at(0).get('name')).to.equal('Ashley');
				expect(spy.called).to.be.true;
				filter.off('reset', spy);
			});
			
			it ('should correctly remove models that are in the filtered set when removed from ' +
				'the proxy collection', function () {
				
				// sort them in ascending order (alphabetical)
				collection.sort(function (a, b) {
					var aname = a.get('name'),
						bname = b.get('name');
				
					if (aname > bname) return 1;
					else if (aname < bname) return -1;
					else return 0;
				});
				
				var models = [
					collection.at(0), // Adam
					collection.at(1), // Adrian
					collection.at(8), // Bob
					collection.at(13) // Ricky
				];
				
				var spy = sinon.spy();
				
				filter.on('remove', spy);
				
				collection.remove(models);
				
				expect(collection.length).to.equal(12);
				expect(filter.length).to.equal(6);
				expect(spy.called).to.be.true;
				
				filter.off('remove', spy);
			});
			
		});
		
		describe('advanced', function () {
			
			var filter,
				collection;
				
			before(function () {
				enyo.kind({
					name: 'TestNestedProgressiveFilter',
					kind: 'enyo.ProgressiveFilter',
					method: function (model) {
						
						// contains a 'd' or an 'o'
						var regex = /[do]/g;
						
						return regex.test(model.get('name'));
					}
				})
				
				enyo.kind({
					name: 'TestProgressiveFilter',
					kind: 'enyo.ProgressiveFilter',
					
					components: [
						{name: 'nested', kind: 'TestNestedProgressiveFilter'}
					],
					
					method: function (model) {
						var regex = /^[Aa]/;
						
						return regex.test(model.get('name'));
					}
				});
				
				collection = new enyo.Collection();
				filter = new TestProgressiveFilter({collection: collection});
			});
			
			after(function () {
				TestProgressiveFilter = null;
				TestNestedProgressiveFilter = null;
				filter.destroy();
				collection.destroy();
			});
			
			describe('nesting', function () {
				
				it ('should correctly identify itself as nested', function () {
					expect(filter.isChildFilter).to.not.be.ok;
					expect(filter.nested.isChildFilter).to.be.true;
				});
				
				it ('should correctly mirror the entire set of its parent when the parent is ' +
					'unfiltered', function () {
					
					expect(collection.length).to.equal(0);
					expect(filter.length).to.equal(0);
					expect(filter.nested.length).to.equal(0);
					collection.add([
						{name: 'Adam'},
						{name: 'Anthony'},
						{name: 'Adrian'},
						{name: 'Ashley'},
						{name: 'Bob'},
						{name: 'Joe'},
						{name: 'Mark'},
						{name: 'Zoey'}
					]);
					
					expect(collection.length).to.equal(8);
					expect(filter.length).to.equal(8);
					expect(filter.nested.length).to.equal(8);
				});
				
				it ('should be able to filter on complete set if parent is unfiltered',
					function () {
					
					filter.nested.filter();
					expect(filter.length).to.equal(8);
					expect(filter.nested.length).to.equal(6);
				});
				
				it ('should automatically update if the parent is then filtered', function () {
					
					filter.filter();
					expect(filter.length).to.equal(4);
					expect(filter.nested.length).to.equal(3);
				});
				
			});
			
		});
		
	});
	
});