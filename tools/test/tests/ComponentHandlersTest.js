enyo.kind({
	name: "ComponentHandlersTest",
	kind: enyo.TestSuite,
	testHandlerUnion: function() {
		enyo.kind({
			name: "TestBase",
			kind: enyo.Component,
			handlers: {
				onOk: "ok"
			}
		});
		enyo.kind({
			name: "TestSub",
			kind: TestBase,
			handlers: {
				onMore: "more"
			}
		});
		var h = new TestSub({handlers: {onFurther: "foo"}}).handlers;
		this.finish((!h.onOk && "bad onOk") || (!h.onMore && "bad onMore") || (!h.onFurther && "bad onFurther"));
	}
});