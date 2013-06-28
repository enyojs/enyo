/* global tests */
enyo.kind({
	name: "ComponentHandlersTest",
	kind: enyo.TestSuite,
	noDefer: true,
	testHandlerUnion: function() {
		enyo.kind({
			name: "tests.TestBase",
			kind: enyo.Component,
			handlers: {
				onOk: "ok"
			}
		});
		enyo.kind({
			name: "tests.TestSub",
			kind: tests.TestBase,
			handlers: {
				onMore: "more"
			}
		});
		var h = new tests.TestSub({handlers: {onFurther: "foo"}}).handlers;
		delete tests.TestBase;
		delete tests.TestSub;
		this.finish((!h.onOk && "bad onOk") || (!h.onMore && "bad onMore") || (!h.onFurther && "bad onFurther"));
	}
});