(function () {
    
    /**
        NOTES TO SELF:
        
        multiple routers, each handles the hash-changed event asynchronously?
        
        they each encapsulate their own behavior based on their routes internally
        so the only global action is the normalization of the hashChanged event
        handling means
        
        routes respond to the external hashChanged event or to internal triggers
        
        setting the location can arbitrarily change the hash location as well or
        simply trigger internal routing and NOT change the browsers location
        
        routes can have configurations
            they can be static
            they can be dynamic (matching a simple url scheme)
            they can (by default) respond to both external and internal changes
                or external only
                or internal only
            they can have a context assigned to execute under
            
    */
    
    
    //*@protected
    // we need to determine by what means we are able to detect
    // hash changes in the browser
    // ...
    
    //*@protected
    // each router registers with this list
    var listeners = [];
    //*@protected
    // this method is registered as the handler for occasions when
    // the hash change event is fired
    var hashDidChange = function () {
        var list = enyo.cloneArray(listeners);
        var router;
        while (list.length) {
            router = list.shift();
            router.hashChanged();
        }
    };
    
    
    //*@public
    /**
        The _enyo.Router_ is a kind of controller with the ability to
        interpret changes in the url as well as set changes to the url
        in a cross-browser compatible way. With defined route handling
        state of the application can be managed more closely with the
        location state of the browser.
    */
    enyo.kind({
        //*@public
        name: "enyo.Router",
        //*@protected
        kind: "enyo.Controller",
        //*@public
        /**
            The _routes_ object constitutes the handlers for this router.
            Routes are string paths, static or dynamic, that route particular
            hash-change events. 
        */
        routes: null,
    });

}());


//// THIS IS NOT A REAL IMPLEMENTATION IT IS HACKED TO
//// WORK FOR EXAMPLE PURPOSES ONLY!
//enyo.kind({
//  name: "enyo.Router",
//  kind: "enyo.Object",
//  location: window.location,
//  published: {
//    routes: null
//  },
//  start: function () {
//    window.onhashchange = enyo.bind(this, this.hashChanged);
//    this.hashChanged();
//  },
//  route: function (inTarget) {
//    this.location.hash = "#/" + inTarget;
//  },
//  hashChanged: function () {
//    var routes = this.get("routes"), hash = this.get("hash");
//    if (hash === "" || !!~routes.indexOf(hash))
//      this.get("controller").handle(hash || "default");
//  },
//  hash: enyo.Computed(function () {
//    return this.location.hash.replace(/\#\//, "");
//  })
//});