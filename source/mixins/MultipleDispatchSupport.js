//*@public
/**
*/
enyo.createMixin({
    
    // ...........................
    // PUBLIC PROPERTIES
    
    //*@public
    name: "enyo.MultipleDispatchSupport",
    
    // ...........................
    // PROTECTED PROPERTIES
    
    //*@protected
    _dispatch_targets: null,
    
    //*@protected
    _default_dispatch: false,
    
    // ...........................
    // COMPUTED PROPERTIES
    
    // ...........................
    // PUBLIC METHODS
    
    //*@public
    /**
        Add an instance listener for dispatched and delegated events.
    */
    addDispatchTarget: function (target) {
        var targets = this._dispatch_targets;
        if (targets.indexOf(target) === -1 && target !== this) targets.push(target);
    },
    
    // ...........................
    // PROTECTED METHODS
    
    //*@protected
    ownerChanged: function () {
        this.inherited(arguments);
        if (this.owner && this.owner instanceof enyo.Component) {
            this.set("_default_dispatch", true);
            this.set("_controller_bubble_target", this.owner);
        }
    },
    
    //*@protected
    dispatchFrom: function (sender, event) {
        if (event.dispatchedByController) {
            if (event.dispatchController === this) return true;
        } else if (sender === this) {
            event.dispatchedByController = true;
            event.dispatchController = this;
        }
        return false;
    },
    
    //*@protected
    bubbleUp: function (name, event, sender) {
        var targets;
        
        // TODO: for now, this is solving a problem that is not obvious
        // whether or not this change will make a difference for
        // solely owned controllers this can potentially cause top
        // level application-instances to receive the same bubbled event
        // twice if it is not explicitly handled and has a truthy value
        // returned somewhere to stop propagation
        
        if (this._default_dispatch) {
            this.inherited(arguments);
        }
        
        targets = this._dispatch_targets;
        enyo.forEach(enyo.clone(targets), function (target) {
            if (target) {
                if (target.destroyed) {
                    this.removeDispatchTarget(target);
                } else {
                    target.dispatchBubble(name, event, sender);
                }
            }
        }, this);
    },
    
    //*@protected
    dispatchEvent: function (name, event, sender) {
        if (this.dispatchFrom(sender, event)) return false;
        return this.inherited(arguments);
    },
    
    //*@protected
    bubbleDelegation: function (delegate, prop, name, event, sender) {
        if (this._default_dispatch) {
            this.inherited(arguments);
        }
        var targets = this.get("_dispatch_targets");
        enyo.forEach(enyo.clone(targets), function (target) {
            if (target) {
                if (target.destroyed) {
                    this.removeDispatchTarget(target);
                } else {
                    target.delegateEvent(delegate, prop, name, event, sender);
                }
            }
        });
    },
    
    //*@protected
    removeDispatchTarget: function (target) {
        var targets = this._dispatch_targets;
        var idx;
        idx = targets.indexOf(target);
        if (idx !== -1) targets.splice(idx, 1);
    },
    
    //*@protected
    create: function () {
        this._dispatch_targets = [];
    }
    
    // ...........................
    // OBSERVERS

});
