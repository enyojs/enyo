var kind = require('../../lib/kind');
var Component = require('../../lib/Component');

describe('Component Handlers', function () {

	describe('usage', function () {

		describe('Handler union', function () {

			var k1 = kind({
				name: "tests.TestBase",
				kind: Component,
				handlers: {
					onOk: "ok"
				}
			});

			var k2 = kind({
				name: "tests.TestSub",
				kind: k1,
				handlers: {
					onMore: "more"
				}
			});

			var h = new k2({handlers: {onFurther: "foo"}}).handlers;

			delete k1;
			delete k2;

			before(function () {
			});

			after(function () {
			});

			it('should have onOk', function () {

				expect(h.onOk).to.exist

			});

			it('should have onMore', function () {

				expect(h.onMore).to.exist

			});

			it('should have onFurther', function () {

				expect(h.onFurther).to.exist

			});
		});

	});
});




//
//enyo.kind({
//	name: "ComponentHandlersTest",
//	kind: enyo.TestSuite,
//	noDefer: true,

//	testHandlerUnion: function() {
//		enyo.kind({
//			name: "tests.TestBase",
//			kind: enyo.Component,
//			handlers: {
//				onOk: "ok"
//			}
//		});
//		enyo.kind({
//			name: "tests.TestSub",
//			kind: tests.TestBase,
//			handlers: {
//				onMore: "more"
//			}
//		});
//		var h = new tests.TestSub({handlers: {onFurther: "foo"}}).handlers;
//		delete tests.TestBase;
//		delete tests.TestSub;
//		this.finish((!h.onOk && "bad onOk") || (!h.onMore && "bad onMore") || (!h.onFurther && "bad onFurther"));
//	}
//});
