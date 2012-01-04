enyo.kind({
	name: "langTest",
	kind: enyo.TestSuite,
	testCallee: function() {
		var err = "";
		var fn = function() {
			err = (arguments.callee.nom !== 'fn');
		}
		fn.nom = "fn";
		fn();
		this.finish(err);
	},
	testClass: function() {
		enyo.kind({
			name: "AClass"
		});
		var obj = new AClass();
		var err = (typeof AClass !== 'function');
		this.finish(err)
	}
/*
test("class-fn", function() {
	ok = false;
	opus.kind({
		name: "AClass",
		iam: function() {
			return 'AClass';
		}
	});
	var obj = new AClass();
	ok = (obj.iam() == "AClass");
	return ok;
});

test("constructor", function() {
	ok = false;
	opus.kind({
		name: "Base",
		constructor: function() {
			ok = true;
		}
	});
	var b = new Base();
	return ok;
});

test("subclass", function() {
	var base = sub = false;
	opus.kind({
		name: "Base",
		constructor: function() {
			base = true;
		}
	});
	opus.kind({
		name: "Sub",
		isa: Base,
		constructor: function() {
			// note: name tricks re: _constructor, normally one would use this.inherited(arguments);
			Base.prototype._constructor.apply(this);
			sub = true;
		}
	});
	new Sub();
	return base && sub;
});
*/
});