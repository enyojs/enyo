var
	kind = require('enyo/kind'),
	Component = require('enyo/Component');

describe('Component Handlers', function () {

	describe('usage', function () {

		describe('Handler union', function () {
			var k, handlers;

			before(function () {
				var k1 = kind({
					name: 'tests.TestBase',
					kind: Component,
					handlers: {
						onOk: 'ok'
					}
				});

				var k2 = kind({
					name: 'tests.TestSub',
					kind: k1,
					handlers: {
						onMore: 'more'
					}
				});

				k = new k2({
					handlers: {
						onFurther: 'foo'
					}
				});

				handlers = k.handlers;

				k1 = k2 = null;
			});

			after(function () {
				k.destroy();
				handlers = null;
			});

			it('should have onOk', function () {
				expect(handlers.onOk).to.exist
			});

			it('should have onMore', function () {
				expect(handlers.onMore).to.exist
			});

			it('should have onFurther', function () {
				expect(handlers.onFurther).to.exist
			});
		});
	});
});