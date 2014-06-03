/* global tests */
enyo.kind({
	name: "ControlPropsTest",
	kind: enyo.TestSuite,
	noDefer: true,
	testUnionAttributesStylesClasses: function() {
		enyo.kind({
			name: "tests.TestBase",
			kind: enyo.Control,
			attributes: {
				a: 1
			},
			style: "a:1",
			classes: "a"
		});
		enyo.kind({
			name: "tests.TestSub",
			kind: tests.TestBase,
			attributes: {
				b: 1
			},
			style: "b:1",
			classes: "b"
		});
		var t = new tests.TestSub({attributes: {c: 1}, style: "c:1", classes: "c"});
		var rules = t.style.replace(/;$/, "").split(/\s*;[\s;]*/);
		delete tests.TestBase;
		delete tests.TestSub;
		t.domStyles = {};
		for (var i=0, s, n, v, rule; (rule=rules[i]); i++) {
			s = rule.split(/\s*:\s*/);
			n = s.shift();
			v = s.join(':');
			t.domStyles[n] = v;
		}
		this.finish(
			(!t.attributes.a && "bad a attr") || (!t.attributes.b && "bad b attr") || (!t.attributes.c && "bad c attr")
			||
			(!t.domStyles.a && "bad a style") || (!t.domStyles.b && "bad b style") /*|| (!t.domStyles.c && "bad c style")*/
			||
			(t.attributes['class'] !== "a b c" && "bad classes, expected [a b c] got [" + t.attributes['class'] + "]")
		);
	}
});