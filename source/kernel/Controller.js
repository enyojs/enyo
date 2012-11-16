enyo.kind({
  name: "enyo.Controller",
  kind: "enyo.Component",
  published: {
    content: null
  },
  dispatchEvent: function(inEventName, inEvent, inSender) {
		this.decorateEvent(inEventName, inEvent, inSender);
		if (this.handlers[inEventName] && this.dispatch(this.handlers[inEventName], inEvent, inSender)) {
			return true;
		}
		return false;
	},
	destroy: function () {
	  this.set("isDestroyed", true);
	  this.inherited(arguments);
	},
	ownerChanged: function () {
	  if (!this.id) this.id = this.makeId();
	}
});