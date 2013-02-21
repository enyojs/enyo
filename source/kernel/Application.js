(function () {
    
    //*@public
    /**
        In order to provide some convenience and debugging tools we track
        the applications running at any given time. Here we collection them
        for reference later. When _enyo.Application_s are destroyed they know
        to remove themselves from this table.
    */
    var applications = enyo.applications = {};

    //*@protected
    /**
        Used internally to maintain registration of applications with
        the framework.
    */
    var register = function (app) {
        applications[app._instance_name] = app;
    };
    
    //*@protected
    /**
        Used internally to unregister applications that have been destroyed.
    */
    var unregister = function (app) {
        var kind = app.kindName;
        var kinds = applications[kind] || [];
        var idx = kinds.indexOf(app);
        if (!~idx) {
            kinds.splice(idx, 1);
        }
    };
    
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
    
        // ...........................
        // PUBLIC PROPERTIES
        
        //*@public
        name: "enyo.Application",
        
        //*@public
        kind: "enyo.ViewController",
        
        //*@public
        autoStart: true,
        
        //*@public
        renderOnStart: true,
        
        //*@public
        controllers: null,
        
        //*@public
        initBindings: false,
        
        //*@public
        concat: ["controllers"],
    
        // ...........................
        // PROTECTED PROPERTIES
    
        //*@protected
        _instance_name: "",
    
        // ...........................
        // COMPUTED PROPERTIES
    
        // ...........................
        // PUBLIC METHODS
        
        //*@public
        /**
            If the _autoStart_ flag is set to true this will automatically
            be executed when the constructor is called. Otherwise it can
            be executed whenever the application should begin execution.
        */
        start: function () {
            // we register kind of early in the process in case any controllers
            // or other initialization assumes it will be there...
            register(this);
            // once the controllers have been initialized we can go ahead and
            // hookup any bindings that were supplied to the application
            this.initBindings = true;
            this.setup();
            if (true === this.renderOnStart) {
                this.render();
            }
        },
    
        // ...........................
        // PROTECTED METHODS
        
        //*@protected
        constructor: function (props) {
            if (props && enyo.exists(props.name)) {
                enyo.setPath(props.name, this);
                this._instance_name = props.name;
                delete props.name;
            }
            this.inherited(arguments);
        },
        
        //*@protected
        constructed: function () {
            this.inherited(arguments);
            if (true === this.autoStart) this.start();              
        },
        
        //*@protected
        createView: function () {
            var ctor = this.get("_view_kind");
            this.set("view", new ctor({app: this, _bubble_target: this}));
        },
        
        //*@protected
        postInitialization: function () {
            this.inherited(arguments);
            this.setupControllers();
        },
    
        //*@protected
        setupControllers: function () {
            var kinds = this.controllers || [];
            var controllers = this.controllers = {};
            enyo.forEach(kinds, function (kind) {
                // we need the name of the instance whether the controller is global
                // or app-specific
                var name = kind.name;
                // there is the optional global flag that indicates if the controller
                // is to be instanced outside the scope of the application
                var global = Boolean(kind.global);
                var ctor;
                var inst;
                // cleanup
                delete kind.global;
                delete kind.name;
                // if the definition does not supply a controller kind we add one
                if (!("kind" in kind)) kind.kind = "enyo.Controller";
                // create a kind constructor for the controller with all of the given
                // properties
                ctor = enyo.kind(kind);
                inst = new ctor({owner: this, app: this});
                // if the controller is not a global controller we create it as part
                // of our applications controller store
                if (false === global) {
                    controllers[name] = inst;
                } else {
                    enyo.setPath(name, inst);
                }
            }, this);
        },
        
        //*@protected
        destroy: function () {
            this.inherited(arguments);
            this.destroyControllers();
            unregister(this);
        },
        
        //*@protected
        destroyControllers: function () {
            var constrollers = this.controllers;
            var controller;
            var name;
            for (name in controllers) {
                if (!controllers.hasOwnProperty(name)) continue;
                controller = controllers[name];
                if (controller.owner && this === controller.owner) {
                    controller.destroy();
                }
                delete controllers[name];
            }
            delete this.controllers;
        }
    
        // ...........................
        // OBSERVERS

    });
    
}());
