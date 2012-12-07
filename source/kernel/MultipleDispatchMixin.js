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
    // this will attempt to keep circular events
    // from propagating...
    this.seenEvents = [];
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
      this._bubbleTarget = this.owner;
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
  //*@protected
  bubbleUp: function (name, event, sender) {
    if (this.defaultDispatch) return this.inherited(arguments);
    var targets = this.get("dispatchTargets"), id = enyo.uid("event");
    event.seenId = id;
    this.seenEvents.push(id);
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
    if (-1 !== this.seenEvents.indexOf(event.seenId)) return false;
    return this.inherited(arguments);
  },
  //*@protected
  bubbleDelegation: function (delegate, prop, name, event, sender) {
    if (this.defaultDispatch) return this.inherited(arguments);
    var targets = this.get("dispatchTargets");
    enyo.forEach(enyo.clone(targets), function (target) {
      if (target) {
        if (target.destroyed) {
          this.removeDispatchTarget(target);
        } else {
          target.delegateEvent(delegate, prop, name, event, sender);
        }
      }
    })
  },
  //*@protected
  removeDispatchTarget: function (target) {
    var targets = this.get("dispatchTargets"), idx;
    idx = targets.indexOf(target);
    if (idx !== -1) targets.splice(idx, 1);
  }
});