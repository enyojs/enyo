describe('enyo.BucketFilter', function () {
	var Collection = enyo.Collection,
		BucketFilter = enyo.BucketFilter;

	describe('properties', function () {
		
		var bucketFilter;
		
		describe('#activeFilter', function () {
			it ('should default to * if no default filter specified', function () {
				bucketFilter = new BucketFilter();
				expect(bucketFilter.activeFilter).to.equal('*');
				bucketFilter.destroy({destroy: true});
			});

			it ('should use default filter if specified', function () {
				bucketFilter = new BucketFilter({defaultFilter: 'sparky'});
				expect(bucketFilter.activeFilter).to.equal('sparky');
				bucketFilter.destroy({destroy: true});
			});

			it ('should use default filter if specified on a filter', function () {
				bucketFilter = new BucketFilter({components: [{name: 'default', isDefault: true}]});
				expect(bucketFilter.activeFilter).to.equal('default');
				bucketFilter.destroy({destroy: true});
			});
		});
	});
	
	describe('usage', function () {
		
		var bucketFilter, collection,
			data = [{a: 'one', b: 1}, {a: 'two', b: 2}, {a: 'three', b: 3}];

		describe('basic', function () {

			before(function() {
				collection = new Collection(data);
				bucketFilter = new BucketFilter({
					components: [
						{name: 'aFilter'},
						{name: 'bFilter'} 
					],
					aFilter: function(model) {
						return model.get('a')[0] === 't';
					},
					bFilter: function(model) {
						return model.get('b') > 2;
					}
				});
				// Setting after initialization to expose bug
				bucketFilter.set('collection', collection);
			});

			after(function() {
				bucketFilter.destroy({destroy: true});
				collection.destroy({destroy: true});
			});

			afterEach(function() {
				collection.empty(data);
				bucketFilter.set('activeFilter', '*');
			});

			it ('should proxy all the data with the default filter', function() {
				expect(bucketFilter.models.length).to.equal(3);
			});

			it ('should apply filters as set', function() {
				bucketFilter.set('activeFilter', 'aFilter');
				expect(bucketFilter.models.length).to.equal(2);
				expect(bucketFilter.at(0).get('a')).to.equal('two');
				bucketFilter.set('activeFilter', 'bFilter');
				expect(bucketFilter.models.length).to.equal(1);
				expect(bucketFilter.at(0).get('a')).to.equal('three');
			});

			it ('should update child filters as records added', function() {
				expect(bucketFilter.models.length).to.equal(3);
				expect(bucketFilter.$.aFilter.length).to.equal(2);
				expect(bucketFilter.$.bFilter.length).to.equal(1);
				collection.add({a: 'ten', b: 10});
				expect(bucketFilter.models.length).to.equal(4);
				expect(bucketFilter.$.aFilter.length).to.equal(3);
				expect(bucketFilter.$.bFilter.length).to.equal(2);
			});

			it ('should update child filters as records removed', function() {
				expect(bucketFilter.models.length).to.equal(3);
				expect(bucketFilter.$.aFilter.length).to.equal(2);
				expect(bucketFilter.$.bFilter.length).to.equal(1);
				collection.remove(collection.at(2));
				expect(bucketFilter.models.length).to.equal(2);
				expect(bucketFilter.$.aFilter.length).to.equal(1);
				expect(bucketFilter.$.bFilter.length).to.equal(0);
			});

		});

		describe('advanced', function () {

			before(function() {
				collection = new Collection(data);
				bucketFilter = new BucketFilter({
					components: [
						{name: 'aFilter'},
						{name: 'bFilter'} 
					],
					aFilter: function(model) {
						return model.get('a')[0] === 't';
					},
					bFilter: function(model) {
						return model.get('b') > 2;
					},
					collection: collection
				});
			});

			after(function() {
				bucketFilter.destroy({destroy: true});
				collection.destroy({destroy: true});
			});

			afterEach(function() {
				collection.empty(data);
				bucketFilter.set('activeFilter', '*');
				bucketFilter.set('collection', collection);
			});

			it ('should be OK to remove the collection', function() {
				expect(bucketFilter.models.length).to.equal(3);
				expect(bucketFilter.$.aFilter.length).to.equal(2);
				expect(bucketFilter.$.bFilter.length).to.equal(1);
				bucketFilter.set('collection', null);
				expect(bucketFilter.models.length).to.equal(0);
				expect(bucketFilter.$.aFilter.length).to.equal(0);
				expect(bucketFilter.$.bFilter.length).to.equal(0);
			});

			it ('should update when a new collection is applied', function() {
				var collection2 = new Collection([{a: 'truth', b: 99}]);

				expect(bucketFilter.models.length).to.equal(3);
				expect(bucketFilter.$.aFilter.length).to.equal(2);
				expect(bucketFilter.$.bFilter.length).to.equal(1);

				bucketFilter.set('collection', collection2);

				expect(bucketFilter.models.length).to.equal(1);
				expect(bucketFilter.$.aFilter.length).to.equal(1);
				expect(bucketFilter.$.bFilter.length).to.equal(1);
			});

			it ('should sub-filter if collection is another BucketFilter set at create', function() {
				var bucketFilter2 = new BucketFilter({
						components: [{name: 'smaller'}],
						smaller: function(model) {
							return model.get('b') < 3;
						},
						collection: bucketFilter
					});

				expect(bucketFilter.models.length).to.equal(3);
				expect(bucketFilter.$.aFilter.length).to.equal(2);
				expect(bucketFilter.$.bFilter.length).to.equal(1);

				expect(bucketFilter2.models.length).to.equal(3);
				expect(bucketFilter2.$.smaller.length).to.equal(2);

				bucketFilter.set('activeFilter', 'aFilter');

				expect(bucketFilter2.models.length).to.equal(2);
				expect(bucketFilter2.$.smaller.length).to.equal(1);

				collection.add({a: 'tony', b: '99'});

				expect(bucketFilter2.models.length).to.equal(3);
				expect(bucketFilter2.$.smaller.length).to.equal(1);
			});

			it ('should sub-filter if collection is another BucketFilter set at runtime', function() {
				var bucketFilter2 = new BucketFilter({
						components: [{name: 'smaller'}],
						smaller: function(model) {
							return model.get('b') < 3;
						}
					});

				bucketFilter2.set('collection', bucketFilter);

				expect(bucketFilter2.models.length).to.equal(3);
				expect(bucketFilter2.$.smaller.length).to.equal(2);

				bucketFilter.set('activeFilter', 'aFilter');

				expect(bucketFilter2.models.length).to.equal(2);
				expect(bucketFilter2.$.smaller.length).to.equal(1);

				collection.add({a: 'tony', b: '99'});

				expect(bucketFilter2.models.length).to.equal(3);
				expect(bucketFilter2.$.smaller.length).to.equal(1);
			});
		});
	});
});
