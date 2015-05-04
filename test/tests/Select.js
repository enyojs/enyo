var
	kind = require('../../lib/kind');

var
	Select = require('../../lib/Select');

describe('Select', function () {

	describe('properties', function () {

		var testSelect;

		beforeEach(function () {
			testSelect = new Select({
				selected: 3,
				components: [
					{value: 'one'},
					{value: 'two'},
					{value: 'three'},
					{value: 'four'}
				]
			});
			testSelect.render();
		});

		afterEach(function () {
			testSelect.destroy();
		});

		describe('#selected', function () {
			it ('should be 3 create-time', function () {
				expect(testSelect.get('selected')).to.equal(3);
			});
		});

		describe('#value', function () {
			it ('should have the value "four" at create-time', function () {
				expect(testSelect.get('value')).to.equal('four');
			});
		});

	});

});