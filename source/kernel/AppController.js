// there is a concept for the AppController, perhaps another
// type of controller altogether, that it has a "handle"
// capability that will accept an "event" or "trigger" and
// asynchronously execute the handler (if it has one) if
// the property matches the trigger/event as a general
// form of delegation
enyo._handle = function (trigger) {
  if (trigger in this) {
    enyo.asyncMethod(this, function (args) {
      if (this.beforeHandler) this.beforeHandler(trigger);
      this[trigger].apply(this, args);
    }, arguments);
  }
};

enyo.kind({
  name: "enyo.AppController",
  kind: "enyo.Controller",
  
  beforeHandler: enyo.nop,
  
  handle: function () {
    enyo._handle.apply(this, arguments);
  }
});