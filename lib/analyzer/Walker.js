enyo.kind({
	name: "Walker",
	kind: enyo.Component,
	published: {
		verbose: false
	},
	events: {
		onReport: "",
		onFinish: ""
	},
	components: [
		{kind: "Reader", onFinish: "readerFinish"}
	],
	walk: function(inSource) {
		// make a new loader
		this.loader = new enyo.loaderFactory(runtimeMachine);
		// stub out script loader, we only need manifests to walk dependencies
		this.loader.loadScript = function(){};
		// stub out stylesheet loader
		this.loader.loadSheet = function(){};
		// control logging
		this.loader.verbose = this.verbose;
		// callbacks
		this.loader.report = enyo.bind(this, "walkReport");
		this.loader.finish = enyo.bind(this, "walkFinish");
		// substitute for default loader
		enyo.loader = this.loader;
		// walk application dependencies
		enyo.depends(inSource);
	},
	walkReport: function(inAction, inName) {
		this.doReport(inAction, inName);
	},
	walkFinish: function() {
		// we've read all the manifests and constructed our list of modules
		// now build a database by reading and analyzing each module
		this.analyzeModules();
	},
	analyzeModules: function() {
		this.$.reader.loadModules(this.loader);
	},
	readerFinish: function() {
		this.modules = this.$.reader.modules;
		this.doFinish();
	}
});
