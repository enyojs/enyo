enyo.kind({
	name: "ControlPropsTest",
	kind: enyo.TestSuite,
	testUnionAttributesStylesClasses: function() {
		enyo.kind({
			name: "TestBase",
			kind: enyo.Control,
			attributes: {
				a: 1
			},
			style: "a:1",
			classes: "a"
		});
		enyo.kind({
			name: "TestSub",
			kind: TestBase,
			attributes: {
				b: 1
			},
			style: "b:1",
			classes: "b"
		});
		var t = new TestSub({attributes: {c: 1}, style: "c:1", classes: "c"});
		this.finish(
			(!t.attributes.a && "bad a attr") || (!t.attributes.b && "bad b attr") || (!t.attributes.c && "bad c attr")
			||
			(!t.domStyles.a && "bad a style") || (!t.domStyles.b && "bad b style") /*|| (!t.domStyles.c && "bad c style")*/
			||
			(t.attributes['class'] !== "a b c" && "bad classes, expected [a b c] got [" + t.attributes['class'] + "]")
		);
	}
});