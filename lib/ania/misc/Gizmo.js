//
// We want to be able to script-include Gizmo files and have them
// automatically instantiate themselves as constructors.
//
// We also want to be able to split Gizmos into presentation and
// behavioral bits.
//
// We achieve these goals by defining Gizmo files as js code that calls
// enyo.Gizmo(<configuration object>).
//
// enyo.Gizmo method creates an object factory in place of the
// Gizmo constructor. When the constructor (really the factory method)
// is called it will replace itself with the real Gizmo constructor
// and return an instance from that constructor.
//
// If enyo.Gizmo method is called for an existing (factory) constructor,
// the input configuration is mixed in to the configuration stored by the factory.
// This way we allow a Gizmo to be assembled at load time by an arbitrary set
// of configurations in an arbitrary order.
//

enyo.Gizmo = function(inConfig) {
	var factory = enyo.getObject(inConfig.name);
	if (factory) {
		enyo.mixin(factory.config, inConfig);
	} else {
		factory = enyo.setObject(inConfig.name, enyo._createGizmoFactory(inConfig));
	}
	return factory;
};

//* @protected
enyo._createGizmoFactory = function(inConfig) {
	var factory = function(inProps) {
		var ctor = enyo._createGizmoClass(inConfig);
		var obj = new ctor(inProps);
		return obj;
	};
	factory.config = inConfig;
	factory.isFactory = true;
	return factory;
};

enyo._createGizmoClass = function(inConfig) {
	var isa = inConfig.kind && enyo.constructorForKind(inConfig.kind);
	if (isa && isa.isFactory) {
		isa = enyo._createGizmoClass(isa.config);
	}
	return enyo.kind(inConfig);
};

// Gizmos have functional interface (i.e. they are expressed as invocations of the enyo.Gizmo method)
// but the guts are JSON config blocks.
// We want the functional interface so you can load Gizmos as plain script tags (e.g.) and have them
// do something, and not rely on some loader.
// However, if we *have* loaded a Gizmo as data, this method allows us to unpack the config itself.
enyo.unpackGizmo = function(inGizmo) {
	var config, save = enyo.Gizmo;
	enyo.Gizmo = function(inConfig) {
		config = inConfig;
	};
	try {
		eval(inGizmo);
	} finally {
		enyo.Gizmo = save;
	}
	return config;
};