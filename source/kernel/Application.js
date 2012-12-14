
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
            target = enyo.getPath(target);
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
        if (true === this.renderOnStart) {
            this.render();
        }
    },
    controllersChanged: function () {
        var controllers = this.controllers;
        enyo.forEach(controllers, function (kind) {
            var ctor = enyo.constructorForKind(kind);
            var instName = this.instanceNameFrom(kind, ctor);
            var namespace = this.get("namespace");
            if (!ctor) return enyo.warn("enyo.Application: " +
                "could not find a constructor for the requested " +
                "controller kind - " + kind);
            namespace[instName] = new ctor();
        }, this);
    },
    namespace: enyo.Computed(function () {
        var kindName = this.kindName;
        var parts = kindName.split(".");
        var ns = parts[0];
        return enyo.getPath(ns);
    }),
    instanceNameFrom: function (name, ctor) {
        var instanceName = ctor.prototype.instanceName;
        if ("string" === typeof instanceName) return instanceName;
        name = name.indexOf(".") > -1? name.split(".")[1]: name;
        name = enyo.uncap(name);
        return (ctor.prototype.instanceName = name);
    }
});
