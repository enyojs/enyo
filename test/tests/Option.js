var
	kind = require('enyo/kind');

var
	Select = require('enyo/Select');

describe('Option', function () {

	describe('properties', function () {

		var testSelect;

		beforeEach(function () {
			testSelect = new Select({
				components: [
					{value: 'one'},
					{value: 'two'},
					{value: 'three'},
					{value: 'four', selected: true}
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