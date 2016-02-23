var
	kind = require('enyo/kind');

var
	Select = require('enyo/Select');

describe('Select', function () {
	describe('properties', function () {
		var testSelect, testSelectDefault;

		beforeEach(function () {
			var comps = [
				{value: 'one'},
				{value: 'two'},
				{value: 'three'},
				{value: 'four'}
			];

			testSelect = new Select({
				selected: 3,
				components: comps
			});
			testSelect.render();

			testSelectDefault = new Select({
				components: comps
			});
			testSelectDefault.render();
		});

		afterEach(function () {
			testSelect.destroy();
			testSelectDefault.destroy();
		});

		describe('#selected', function () {
			it ('should be 0 render', function () {
				expect(testSelectDefault.get('selected')).to.equal(0);
			});

			it ('should be 3 render', function () {
				expect(testSelect.get('selected')).to.equal(3);
			});
		});

		describe('#value', function () {
			it ('should have the value "one" at render', function () {
				expect(testSelectDefault.get('value')).to.equal('one');
			});

			it ('should have the value "four" at render', function () {
				expect(testSelect.get('value')).to.equal('four');
			});
		});
	});
});