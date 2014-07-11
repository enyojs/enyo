describe('enyo.ProgressiveFilter', function () {
	var Collection = enyo.Collection,
		ProgressiveFilter = enyo.ProgressiveFilter;

	describe('properties', function () {
		
		var progressiveFilter;
		
		describe('#filterText', function () {
			it ('should default to empty if no filter specified', function () {
				progressiveFilter = new ProgressiveFilter();
				expect(progressiveFilter.filterText).to.equal('');
				progressiveFilter.destroy({destroy: true});
			});
		});

		describe('#filters', function () {
			it ('should default to empty Array if no model name specified', function () {
				progressiveFilter = new ProgressiveFilter();
				expect(progressiveFilter.filters).to.eql([]);
				progressiveFilter.destroy({destroy: true});
			});
		});
	});
	
	describe('methods', function () {
		
		var progressiveFilter, collection,
			data = [{a: 'one', b: 'tootsie'}, {a: 'two', b: 'roll'}, {a: 'three', b: 'pops'}];

		describe('#reset', function () {
			before(function () {
				collection = new Collection(data);
				progressiveFilter = new ProgressiveFilter({
					filterText: 'e',
					filters: [{path: 'a'}],
					collection: collection
				});
			});

			after(function () {
				progressiveFilter.destroy({destroy: true});
				collection.destroy({destroy: true});
			});

			afterEach(function () {
				collection.empty(data);
				progressiveFilter.set('filterText', 'e');
				progressiveFilter.set('filters', [{path: 'a'}]);
			});

		
			it ('should reset to empty filterText', function () {
				expect(progressiveFilter.models.length).to.equal(2);
				progressiveFilter.reset();
				expect(progressiveFilter.models.length).to.equal(3);
				expect(progressiveFilter.get('filterText')).to.equal('');
			});

			it ('should return progressiveFilter for chaining', function () {
				expect(progressiveFilter.reset()).to.equal(progressiveFilter);
			});
		});
	});
	
	describe('usage', function () {
		
		var progressiveFilter, collection,
			data = [{a: 'one', b: 'tootsie'}, {a: 'two', b: 'roll'}, {a: 'three', b: 'pops'}];

		describe('basic', function () {

			before(function () {
				collection = new Collection(data);
				progressiveFilter = new ProgressiveFilter({
					collection: collection
				});
			});

			after(function () {
				progressiveFilter.destroy({destroy: true});
				collection.destroy({destroy: true});
			});

			afterEach(function () {
				collection.empty(data);
				progressiveFilter.set('filterText', '');
				progressiveFilter.set('filters', []);
			});

			it ('should proxy all the data with the no specified filter', function () {
				expect(progressiveFilter.models.length).to.equal(3);
			});

			it ('should not filter if only filterText applied', function () {
				progressiveFilter.set('filterText', 't');
				expect(progressiveFilter.models.length).to.equal(3);
			});

			it ('should not filter if only filters applied', function () {
				progressiveFilter.set('filters', {path: 'a'});
				expect(progressiveFilter.models.length).to.equal(3);
			});

			it ('should filter if good filter applied', function () {
				progressiveFilter.set('filterText', 't');
				progressiveFilter.set('filters', [{path: 'a'}]);
				expect(progressiveFilter.models.length).to.equal(2);
			});

			it ('should filter case insensitively by default', function () {
				progressiveFilter.set('filterText', 'T');
				progressiveFilter.set('filters', [{path: 'a'}]);
				expect(progressiveFilter.models.length).to.equal(2);
			});

			it ('should filter case insensitively if specified', function () {
				progressiveFilter.set('filterText', 'T');
				progressiveFilter.set('filters', [{path: 'a', method: ProgressiveFilter.caseInsensitiveFilter}]);
				expect(progressiveFilter.models.length).to.equal(2);
			});

			it ('should filter case sensitively if specified', function () {
				progressiveFilter.set('filterText', 'T');
				progressiveFilter.set('filters', [{path: 'a', method: ProgressiveFilter.caseSensitiveFilter}]);
				expect(progressiveFilter.models.length).to.equal(0);
			});

			it ('should refine as good filterText changes', function () {
				progressiveFilter.set('filterText', 't');
				progressiveFilter.set('filters', [{path: 'a'}]);
				expect(progressiveFilter.models.length).to.equal(2);
				progressiveFilter.set('filterText', 'th');
				expect(progressiveFilter.models.length).to.equal(1);
				expect(progressiveFilter.at(0).get('a')).to.equal('three');
				progressiveFilter.set('filterText', 'thy');
				expect(progressiveFilter.models.length).to.equal(0);
			});

			it ('should update as records added', function () {
				progressiveFilter.set('filterText', 't');
				progressiveFilter.set('filters', [{path: 'a'}]);
				expect(progressiveFilter.models.length).to.equal(2);
				collection.add({a: 'ten', b: 'unused'});
				expect(progressiveFilter.models.length).to.equal(3);
				collection.add({a: 'simple', b: 'also unused'});
				expect(progressiveFilter.models.length).to.equal(3);
			});

			it ('should update child filters as records removed', function () {
				progressiveFilter.set('filterText', 't');
				progressiveFilter.set('filters', [{path: 'a'}]);
				expect(progressiveFilter.models.length).to.equal(2);
				collection.remove(collection.at(2));
				expect(progressiveFilter.models.length).to.equal(1);
			});

			it ('should refilter if filterText not a refinement', function () {
				progressiveFilter.set('filterText', 't');
				progressiveFilter.set('filters', [{path: 'a'}]);
				expect(progressiveFilter.models.length).to.equal(2);
				progressiveFilter.set('filterText', 'n');
				expect(progressiveFilter.models.length).to.equal(1);
				expect(progressiveFilter.at(0).get('a')).to.equal('one');
			});

			it ('should refilter if modelName changes', function () {
				progressiveFilter.set('filterText', 't');
				progressiveFilter.set('filters', [{path: 'a'}]);
				expect(progressiveFilter.models.length).to.equal(2);
				progressiveFilter.set('filters', [{path: 'b'}]);
				expect(progressiveFilter.models.length).to.equal(1);
				expect(progressiveFilter.at(0).get('b')).to.equal('tootsie');
			});

			it ('should work with multiple filters', function () {
				progressiveFilter.set('filterText', 'r');
				progressiveFilter.set('filters', [{path: 'a'},{path: 'b'}]);
				expect(progressiveFilter.models.length).to.equal(2);
				expect(progressiveFilter.at(0).get('b')).to.equal('roll');
				expect(progressiveFilter.at(1).get('a')).to.equal('three');
			});

			xit ('should discard history when switching model', function () {
			});

			it ('should return empty set if path not valid', function () {
				progressiveFilter.set('filterText', 't');
				progressiveFilter.set('filters', [{path: 'anything'}]);
				expect(progressiveFilter.models.length).to.equal(0);
			});

			it ('should discard history when switching case sensitivity');
		});

		describe('advanced', function () {

			before(function () {
				collection = new Collection(data);
				progressiveFilter = new ProgressiveFilter({
					filterText: 't',
					filters: [{path: 'a'}],
					collection: collection
				});
			});

			after(function () {
				progressiveFilter.destroy({destroy: true});
				collection.destroy({destroy: true});
			});

			afterEach(function () {
				collection.empty(data);
				progressiveFilter.set('collection', collection);
				progressiveFilter.set('filterText', 't');
				progressiveFilter.set('filters', [{path: 'a'}]);
			});

			it ('should be OK to remove the collection', function () {
				expect(progressiveFilter.models.length).to.equal(2);
				progressiveFilter.set('collection', null);
				expect(progressiveFilter.models.length).to.equal(0);
			});

			it ('should update when a new collection is applied', function () {
				var collection2 = new Collection([{a: 'truth', b: 'dare'}]);

				expect(progressiveFilter.models.length).to.equal(2);

				progressiveFilter.set('collection', collection2);

				expect(progressiveFilter.models.length).to.equal(1);
			});

			it ('should be possible to specify a custom filter function', function () {
				progressiveFilter.set('filters', [{path: 'a', method: function (c, v, t, m) {
					t = t.split('').reverse().join('');
					return v && v.indexOf(t) >= 0;
				}}]);
				expect(progressiveFilter.models.length).to.equal(2);
				progressiveFilter.set('filterText', 'ht');
				expect(progressiveFilter.models.length).to.equal(1);
			});

			it ('should be possible to specify * for path', function () {
				progressiveFilter.set('filters', [{path: '*', method: function (c, v, t, m) {
					t = t.split('').reverse().join('');
					expect(v).to.equal(null);
					return m && m.get('a').indexOf(t) >= 0;
				}}]);
				expect(progressiveFilter.models.length).to.equal(2);
				progressiveFilter.set('filterText', 'ht');
				expect(progressiveFilter.models.length).to.equal(1);
			});
		});
	});
});

