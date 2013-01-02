
//*@public
/**
    An _enyo.Application_ can be used to coordinate execution of
    a given collection of _enyo_ objects. There can be one or more
    _enyo.Applications_ running (with some limitation such as which is
    rendered into the _document.body_ - no limitation if they are each
    rendered into separate DOM nodes or nested). It also provides the
    ability to namespace and automatically initialize any _controllers_
    of the application.
*/
enyo.kind({
    //*@public
    name: "enyo.Application",
    //*@public
    kind: "enyo.ViewController",
    //*@public
    /**
        This flag designates if the application will automatically
        execute its _start_ method when its constructor is called.
    */
    autoStart: true,
    //*@public
    /**
        This flag designates if the application will automatically
        render its _view_ into the _renderTarget_ when its _start_
        method es called.
    */
    renderOnStart: false,
    //*@public
    /**
        This can be set to an array of _controller_s, much like the
        _components_ block of an _enyo.Component_.
    */
    controllers: null,
    //*@protected
    initBindings: false,
    //*@protected
    concat: ["controllers"],
    //*@protected
    constructor: function () {
        this.inherited(arguments);
        if (true === this.autoStart) this.start();
    },
    //*@protected
    initComponents: function () {
        enyo.forEach(["controllers"], function (prop) {
            var fn = prop + "Changed";
            if ("function" === typeof this[fn]) this[fn]();
        }, this);
    },
    //*@public
    /**
        If the _autoStart_ flag is set to true this will automatically
        be executed when the constructor is called. Otherwise it can
        be executed whenever the application should begin execution.
    */
    start: function () {
        this.initComponents();
        this.initBindings = true;
        this.setup();
        if (true === this.renderOnStart) {
            this.render();
        }
    },
    //*@protected
    controllersChanged: function () {
        var controllers = this.controllers;
        enyo.forEach(controllers, function (props) {
            var kind;
            var name;
            var global;
            var ctor;
            var namespace;
            if ("string" === typeof props) {
                kind = props;
                name = this.instanceNameFromKind(kind);
            } else {
                kind = props.kind;
                name = props.name || this.instanceFromKind(kind);
                global = props.global? Boolean(props.global): undefined;
            }
            delete props["name"];
            delete props["global"];
            ctor = enyo.kind(props);
            namespace = this.get("namespace");
            if (!ctor) return enyo.warn("enyo.Application: " +
                "could not find a constructor for the requested " +
                "controller kind - " + kind);
            //namespace[name] = new ctor();
            enyo.setPath.call(namespace, name, new ctor());
        }, this);
    },
    //*@protected
    namespace: enyo.Computed(function (path) {
        var kindName = this.kindName;
        var parts = kindName.split(".");
        var ns = parts[0];
        return path? ns: enyo.getPath(ns);
    }),
    //*@protected
    instanceNameFrom: function (name, global) {
        var orig = name;
        var namespace;
        var parts;
        name = name && name.length? name: "";
        if (!~name.indexOf(".")) {
            parts = name.split(".");
            namespace = parts.shift();
            name = parts.join(".");
        }
        name = enyo.uncap(name);
        if (!name.length) throw "enyo.Application: cannot determine any " +
            "name for the requested kind '" + orig + "'";
        return global? namespace + "." + name: name;
    },
    //*@protected
    //setupBindings: function () {
    //    var defs;
    //    var config;
    //    var idx = 0;
    //    var bindings;
    //    var binding;
    //    var ns = this.namespace(true);
    //    var props = ["to", "from"];
    //    var regex = /[a-z]/;
    //    this.clearBindings();
    //    bindings = this.bindings = [];
    //    if ((defs = this.bindings)) {
    //        for (len = defs.length; idx < len; ++idx) {
    //            config = defs[idx];
    //            enyo.forEach(props, function (prop) {
    //                var def = config[prop];
    //                var parts;
    //                if (!def) return;
    //                if (!!~def.indexOf(".")) {
    //                    parts = def.split(".");
    //                    if (regex.test(parts[0][0]) && parts[0] !== ns) {
    //                        parts.unshift(ns);
    //                        config[prop] = parts.join(".");
    //                    }
    //                }
    //            });
    //            binding = new enyo.Binding({owner: this, autoConnect: true}, config);
    //            bindings.push(binding);
    //        }
    //    }
    //}
});
