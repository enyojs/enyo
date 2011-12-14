/**
	Module translator converts parser output into a collection of documentation objects suitable for formatting.
*/
enyo.kind({
	name: "Module",
	kind: "Component",
	statics: {
		// static mapping of all the enyo.Module objects, both file and kind
		topicMap: {},
		// static array of all enyo Kinds
		topicIndex: [],
		// static mapping of all the enyo.Module objects, both file and kind
		topicMap2: {},
		// static array of all enyo Kinds
		topicIndex2: []
	},
	published: {
		path: "",
		source: ""
	},
	type: "module",
	create: function() {
		this.inherited(arguments);
		this.module = new enyo.Documentor(this.source).results;
		this.group = this.module.group || "public";
		//
		// FIXME: remove crufty part of path
		var n = "enyo";
		var s = this.path.indexOf(n);
		var p = this.path.slice(s + n.length);
		this.addToIndex(p, this);
		console.log(p);
		//
		this.indexObjects();
	},
	addToIndex: function(inName, inObject) {
		Module.topicMap2[inName] = inObject;
		Module.topicIndex2.push(inName);
	},
	indexObjects: function() {
		var objects = this.module.objects;
		for (var i=0, c, name; c=objects[i]; i++) {
			//console.log(c.group, c.type, c.name);
			if (c.group == "public" && c.name) {
				switch (c.type) {
					case "kind":
						name = c.name.value;
						break;
					case "object":
						name = c.name;
						break;
					case "function":
						name = c.name;
						break;
					default: 
						continue;
				}
				//
				this.addToIndex(name, c);
				//
				Module.topicMap[name] = this;
				Module.topicIndex.push(name);
			}
		}
	},
	kindByName: function(inName) {
		var objects = this.module.objects;
		for (var i=0, c; c=objects[i]; i++) {
			if (inName == c.name.value) {
				return c;
			}
		}
	}
});
