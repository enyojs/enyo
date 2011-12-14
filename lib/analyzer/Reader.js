enyo.kind({
	name: "Reader",
	kind: enyo.Component,
	events: {
		onFinish: ""
	},
	moduleIndex: 0,
	modules: {},
	loadModules: function(inLoader) {
		this.loader = inLoader;
		this.moduleIndex = 0;
		this.modules = {};
		this.nextModule();
	},
	nextModule: function() {
		var m = this.loader.modules[this.moduleIndex++];
		if (m) {
			this.loadModule(m.path);
		} else {
			this.modulesFinished();
		}
	},
	loadModule: function(inUrl) {
		enyo.xhrGet({
			url: inUrl,
			load: enyo.bind(this, "moduleLoaded", inUrl)
		});
	},
	moduleLoaded: function(inUrl, d) {
		if (d && d.length) {
			this.addModule(inUrl, d);
		}
		this.nextModule();
	},
	addModule: function(inPath, inCode) {
		this.modules[inPath] = new Module({name: inPath, path: inPath, source: inCode});
	},
	modulesFinished: function() {
		this.doFinish();
	}
});