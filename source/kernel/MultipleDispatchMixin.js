
//*@public
/**
*/
enyo.Mixin({
    name: "enyo.MultipleDispatchMixin",
    //*@protected
    dispatchTargets: null,
    //*@protected
    defaultDispatch: false,
    //*@protected
    initMixin: function () {
        // initialize the dispatch targets arrays
        this.dispatchTargets = [];
    },
    //*@public
    /**
        If we have an owner and it is a view we need to use our
        default bubbling scheme.
    */
    ownerChanged: function () {
        this.inherited(arguments);
        if (this.owner && this.owner instanceof enyo.Control) {
            this.defaultDispatch = true;
            this.controllerBubbleTarget = this.owner;
        }
    },
    //*@public
    /**
        Add an instance listener for dispatched and delegated events.
    */
    addDispatchTarget: function (target) {
        var targets = this.dispatchTargets;
        if (targets.indexOf(target) === -1 && target !== this) targets.push(target);
        this.inherited(arguments);
    },
    /**
    */
    dispatchFrom: function (sender, event) {
        if (event.dispatchedByController) {
            if (event.dispatchController === this) return true;
            else return false;
        } else if (sender === this) {
            event.dispatchedByController = true;
            event.dispatchController = this;
        }
        return false;
    },
    //dispatchBubble: function (name, event, sender) {
    //    
    //},
    //*@protected
    bubbleUp: function (name, event, sender) {
        var targets;
        if (this.defaultDispatch) {
            return this.inherited(arguments);
        }
        targets = this.get("dispatchTargets");
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
    dispatch: function (name, event, sender) {
        //if (this.dispatchFrom(sender, event)) return false;
        return this.inherited(arguments);
    },
    /**
    */
    dispatchEvent: function (name, event, sender) {
        if (this.dispatchFrom(sender, event)) return false;
        return this.inherited(arguments);
    },
    //*@protected
    bubbleDelegation: function (delegate, prop, name, event, sender) {
        if (this.defaultDispatch) {
            this.inherited(arguments);
        }
        var targets = this.get("dispatchTargets");
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
        var targets = this.get("dispatchTargets"), idx;
        idx = targets.indexOf(target);
        if (idx !== -1) targets.splice(idx, 1);
    }
});
