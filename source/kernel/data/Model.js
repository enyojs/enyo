(function (enyo) {
	
	//*@protected
	var _strip_attributes = function (str) {
		return (str || "").replace(/(\.)?attributes\./, "");
	};
	
	//*@public
	/**
		
		STATUS VALUES:
			NEW
			DIRTY
			CLEAN
			ERROR
	*/
	enyo.kind({
	
		// ...........................
		// PUBLIC PROPERTIES

		//*@public
		name: "enyo.Model",
		
		//*@public
		kind: "enyo.Component",
		
		//*@public
		attributes: null,
		
		//*@public
		events: {
			onChange: "",
			onReady: "",
			onFetch: ""
		},
		
		//*@public
		status: "NEW",
		
		//*@public
		url: "",

		// ...........................
		// PROTECTED PROPERTIES

		//*@protected
		mixins: ["enyo.MultipleDispatchSupport"],
		
		//*@protected
		_collections: null,

		// ...........................
		// COMPUTED PROPERTIES

		// ...........................
		// PUBLIC METHODS
		
		//*@public
		isAttribute: function (prop) {
			return (prop = _strip_attributes(prop)) ? !!(prop in this.attributes): false;
		},
		
		//*@public
		get: function (prop) {
			if (this.isAttribute(prop)) {
				return enyo.getPath.call(this.attributes, prop);
			} else {
				return this.inherited(arguments);
			}
		},
		
		//*@public
		/**
			See _enyo.Object#set_. If the property is an attribute
			it will be set in the attributes hash but the notification
			will be emitted as if it were a property of the model. If the
			_prop_ parameter is a hash for batch updates on the model
			it will assume all of the properties of the hash are attributes
			and wait until all have been updated before issuing the
			notifications and events.
		*/
		set: function (prop, value) {
			var prev;
			var props;
			var changed = false;

			if ("string" === typeof prop) {
				if (this.isAttribute(prop)) {
					prev = this.get(prop);
					this._previous[prop] = prev;
					enyo.setPath.call(this.attributes, prop, value);
					this.notifyObservers(prop, prev, value);
					this._flush_changes();
					changed = true;
				} else {
					this.inherited(arguments);
				}
			} else if ("object" === typeof prop) {
				// reassign to make more sense
				props = prop;
				// we want to ensure that we are queueing the attribute
				// change notifications but aren't flushing them until the end
				this.stopNotifications();
				// this will not let the attributes changed event to bubble
				// until we're done with the batch operation
				this.silence();
				// update all of the properties in the hash as attributes
				for (prop in props) {
					this.set(prop, props[prop]);
				}
				// now we unsilence our events and fire that first
				this.unsilence();
				this._flush_changes();
				// now we allow our notifications to flush automatically
				this.startNotifications();
				changed = true;
			}
			
			// if something was updated we need to update our state
			if (changed) this.status = "DIRTY";
			return this;
		},
		
		//*@public
		previous: function (property) {
			return this._previous[property];
		},

		// ...........................
		// PROTECTED METHODS
		
		//*@protected
		constructor: function (props) {
			// if there are no attributes defined we create them as
			// empty
			if (!this.attributes) this.attributes = {};
			if (props && "object" === typeof props) {
				var attrs = props;
				if (props.attributes) {
					attrs = props.attributes;
					// might be slow but we need to ensure the
					// property doesn't show up as enumerable
					delete props.attributes;
				}
				// attempt to implicitly grab attribute keys
				enyo.mixin(this.attributes, attrs);
				arguments[0] = {};
			}
			this.inherited(arguments);
			// initialize internal properties
			this._previous = {};
			this._changed = {};
			this._collections = [];
		},
		
		//*@protected
		_add_collection: function (collection) {
			var $collections = this._collections;
			if (!~enyo.indexOf(collection, $collections)) {
				$collections.push(collection);
				this.addDispatchTarget(collection);
			}
		},
		
		//*@protected
		_remove_collection: function (collection) {
			var $collections = this._collections;
			var idx = enyo.indexOf(collection, $collections);
			if (!!~idx) {
				$collections.splice(idx, 1);
				this.removeDispatchTarget(collection);
			}
		},
		
		//*@protected
		_flush_changes: function () {
			// it is possible this will be called when silenced during
			// batch operations so we ignore those requests until the end
			if (this._silenced) return;
			// send the event out that we changed
			this.doChange({
				changed: this._changed,
				previous: this._previous
			});
			// reset the the changed hash so as not to be misleading
			this._changed = {};
		},

		// ...........................
		// OBSERVERS
		
		//*@protected
		/**
			This observer spies on property updates and if the property
			is an attribute its changed state is entered into the records
			own changeset queue. When the changeset queue is complete it
			is flushed (elsewhere) but this maintain the most recent changed
			version of the property.
		*/
		_attribute_spy: enyo.observer(function (property, previous, value) {
			if (this.isAttribute(property)) {
				this._previous[property] = previous;
				this._changed[property] = value;
			}
		}, "*")
		
	});
	
	
})(enyo);