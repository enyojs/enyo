
enyo.kind({
    name: "enyo.ViewController",
    kind: "enyo.Controller",
    view: null,
    renderTarget: "document.body",
    constructor: function () {
        this.inherited(arguments);
    },
    create: function () {
        var view = this.view;
    },
    render: function () {
        var target = this.get("target");
        var ctor = this.get("viewKind");
        var view = this.view = new ctor();
        view.renderInto(target);
    },
    renderInto: function (target) {
        this.set("renderTarget", target);
        this.render();
    },
    target: enyo.Computed(function () {
        var target = this.renderTarget;
        if ("string" === typeof target) {
            if ("#" === target[0]) {
                target = target.slice(1);
                target = enyo.dom.byId(target);
            } else {
                target = enyo.getPath(target);
            }
            if (!target) {
                target = enyo.dom.byId(target);
            }
        }
        if (!target) {
            throw "Cannot find requested render target!";
        }
        return target;
    }, "renderTarget"),
    viewKind: enyo.Computed(function () {
        var view = this.view;
        if ("string" === typeof view) {
            view = enyo.getPath(view);
        }
        if (!view) {
            throw "Cannot find the requested view!";
        }
        return view;
    }, "view")
});

enyo.kind({
    name: "enyo.Application",
    kind: "enyo.ViewController",
    autoStart: true,
    renderOnStart: false,
    controllers: null,
    concat: ["controllers"],
    constructor: function () {
        this.inherited(arguments);
        if (true === this.autoStart) this.start();
    },
    initComponents: function () {
        enyo.forEach(["controllers"], function (prop) {
            var fn = prop + "Changed";
            if ("function" === typeof this[fn]) this[fn]();
        }, this);
    },
    start: function () {
        this.initComponents();
        this._setupBindings();
        if (true === this.renderOnStart) {
            this.render();
        }
    },
    controllersChanged: function () {
        var controllers = this.controllers;
        enyo.forEach(controllers, function (props) {
            var kind;
            var name;
            var global;
            if ("string" === typeof props) {
                kind = props;
                name = this.instanceNameFromKind(kind);
            } else {
                kind = props.kind;
                name = props.name || this.instanceFromKind(kind);
                global = props.global? Boolean(props.global): undefined;
            }
            var ctor = enyo.constructorForKind(kind);
            var namespace = this.get("namespace");
            if (!ctor) return enyo.warn("enyo.Application: " +
                "could not find a constructor for the requested " +
                "controller kind - " + kind);
            //namespace[name] = new ctor();
            enyo.setPath.call(namespace, name, new ctor());
        }, this);
    },
    namespace: enyo.Computed(function (path) {
        var kindName = this.kindName;
        var parts = kindName.split(".");
        var ns = parts[0];
        return path? ns: enyo.getPath(ns);
    }),
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
    
    
    
    _setupBindings: function () {
        var defs;
        var config;
        var idx = 0;
        var bindings;
        var binding;
        var ns = this.namespace(true);
        var props = ["to", "from"];
        var regex = /[a-z]/;
        this.clearBindings();
        bindings = this._bindings = [];
        if ((defs = this.bindings)) {
            for (len = defs.length; idx < len; ++idx) {
                config = defs[idx];
                enyo.forEach(props, function (prop) {
                    var def = config[prop];
                    var parts;
                    if (!def) return;
                    if (!!~def.indexOf(".")) {
                        parts = def.split(".");
                        if (regex.test(parts[0][0]) && parts[0] !== ns) {
                            parts.unshift(ns);
                            config[prop] = parts.join(".");
                        }
                    }
                });
                binding = new enyo.Binding({owner: this, autoConnect: true}, config);
                bindings.push(binding);
            }
        }
    }
});
