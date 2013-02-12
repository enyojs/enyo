
//*@public
/**
    The _enyo.ViewController_ is an abstract class designed
    to allow a controller to own a _view_ and designate its
    state rather than the other way around. It has the ability
    to render its _view_ into the DOM on demand.
*/
enyo.kind({
    //*@public
    name: "enyo.ViewController",
    //*@public
    kind: "enyo.Controller",
    //*@public
    /**
        The _view_ property can be assigned a string path or
        a reference to a _view_ that this controller will use
        when its _render_ or _renderInto_ methods are called.
    */
    view: null,
    //*@public
    /**
        The _renderTarget_ can be a string representation such
        as _document.body_ (a special case in JavaScript) or a
        node's id attribute e.g. `#mydiv`.
    */
    renderTarget: "document.body",
    //*@protected
    create: function () {
        var ctor = this.get("viewKind");
        this.view = new ctor();
        this.inherited(arguments);
    },
    //*@public
    /**
        Call this method to render the selected _view_ into the
        designated _renderTarget_.
    */
    render: function () {
        var target = this.get("target");
        var view = this.get("view");
        view.renderInto(target);
    },
    //*@public
    /**
        Pass this method the target node to render the _view_ into
        immediately.
    */
    renderInto: function (target) {
        this.set("renderTarget", target);
        this.render();
    },
    //*@protected
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
    //*@protected
    viewKind: enyo.Computed(function () {
        var view = this.view;
        if ("object" === typeof view && view.kind) {
            view = enyo.kind(view);
        } else if ("string" === typeof view) {
            view = enyo.getPath(view);
        }
        if (!view) {
            throw "Cannot find the requested view!";
        }
        return view;
    }, "view")
});
