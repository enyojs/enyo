var
	kind = require('enyo/kind');

var
	ComputedSupport = require('enyo/ComputedSupport');


describe ('ComputedSupport Mixin', function () {
	describe ('Other', function () {
		var ctor, obj;
		
		ctor = kind({
			kind: null,
			p1: 1,
			mixins: [ComputedSupport],
			computed: [
				{method: 'cp1', path: ['p1']}
			]
		});
		
		describe('Paths', function () {
			// ENYO-380
			it ('should allow sub-kind to reference the same path as parent', function () {

				var sub = kind({
					kind: ctor,
					computed: [
						{method: 'cp2', path: ['p1']}
					],
					cp2: function () {
						return this.p1;
					}
				});

				expect(new sub().get('cp2')).to.equal(1);
			});
		});
	});
});