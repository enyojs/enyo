enyo.kind({
	name: "ComponentTest",
	kind: enyo.TestSuite,
	testNestedComponentUndefinedKind: function() {
		var pass = false;
		// should throw exception as this is an error
		try {
			var a = enyo.kind(
				{
					name: "parentComponent",
					components: [
						{
							name: "nestedComponent",
							kind: undefined
						}
					]
				}
			);
			new a({});
		} catch(e) {
			pass = true;
		}
		if (!pass) {
			throw("no exception for explicitly undefined kind in a nested component");
		}
		this.finish();
	}
});