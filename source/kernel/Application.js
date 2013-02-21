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

    //*@protected
    /**
        Used internally used to determine namespaces from pathnames.
    */
    var namespaceFrom = function (path) {
        var parts;
        var ns;
        // if it isn't a string or has no length we can't do anything
        if ("string" !== typeof path || "" === path) return undefined;
        // attempt to split the string to separate the path components
        parts = path.split(".");
        // if it only has one element then we know there isn't a namespace
        if (1 === parts.length) return undefined;
        ns = parts.shift();
        // we assume we have a namespace now
        return ns;
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
        
        Typically the namespace that the _enyo.Application_ is subclassed
        into will be used as the namespace of any singleton controllers
        implemented at initialization.
        
        For example, if you subclass _enyo.Application_ as the following:
        
        enyo.kind({
            name: "MyApp.Application",
            kind: "enyo.Application",
            controllers: [
                {name: "contactsController", kind: "MyApp.ContactsController"}
            ]
        })
        
        it will instantiate the singleton _contactsController_ as
        _MyApp.contactsController_. Any bindings of the application object
        or any other object in-or-outside-of the application can reference
        this controller by that path as long as the application's _start_
        method has been called.
        
        You can explicitly include a separate namespace for a controller in
        its name property if necessary. The path is not restricted to existing
        namespaces and can be as deep as needed, for example:
        
        {name: "My.Controllers.Namespace.That.Is.Stupidly.Deep.controller"...}
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
        
        //*@public
        /**
            Computed property that returns the string representation
            of the namespace assigned to this application object's
            kind-name (not instance). For example:
            
            enyo.kind({
                name: "MyApp.Application",
                kind: "enyo.Application"
            })
            
            would return a namespace of "MyApp".
        */
        namespace: enyo.Computed(function () {
            return namespaceFrom(this._instance_name || this.kindName);
        }, {cached: true}),
    
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
            
            /**
                controller options
                
                can be global
                    - with/without namespace
                    - this means it is not an application specific instance
                      of the controller
                
                can be app-specific instance
                    - only referenceable within the context of the application
                    - ignores namespace and uses base-name from the application-instance's
                      controllers property
                    - must have unique name
            */
            
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
