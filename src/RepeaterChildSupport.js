/**
* Exports the {@link module:enyo/RepeaterChildSupport~RepeaterChildSupport} mixin
* @module enyo/RepeaterChildSupport
*/

require('enyo');

var
	kind = require('./kind'),
	utils = require('./utils');

var
	Binding = require('./Binding');

/**
* The {@link module:enyo/RepeaterChildSupport~RepeaterChildSupport} [mixin]{@glossary mixin} contains methods and
* properties that are automatically applied to all children of {@link module:enyo/DataRepeater~DataRepeater}
* to assist in selection support. (See {@link module:enyo/DataRepeater~DataRepeater} for details on how to
* use selection support.) This mixin also [adds]{@link module:enyo/Repeater~Repeater#decorateEvent} the
* `model`, `child` ([control]{@link module:enyo/Control~Control} instance), and `index` properties to
* all [events]{@glossary event} emitted from the repeater's children.
*
* @mixin
* @public
*/
var RepeaterChildSupport = {

	/*
	* @private
	*/
	name: 'RepeaterChildSupport',

	/**
	* Indicates whether the current child is selected in the [repeater]{@link module:enyo/DataRepeater~DataRepeater}.
	*
	* @type {Boolean}
	* @default false
	* @public
	*/
	selected: false,

	/**
	* Setting cachePoint: true ensures that events from the repeater child's subtree will
	* always bubble up through the child, allowing the events to be decorated with repeater-
	* related metadata and references.
	*
	* @type {Boolean}
	* @default true
	* @private
	*/
	cachePoint: true,
	
	/*
	* @method
	* @private
	*/
	selectedChanged: kind.inherit(function (sup) {
		return function () {
			if (this.repeater.selection) {
				this.addRemoveClass(this.selectedClass || 'selected', this.selected);
				// for efficiency purposes, we now directly call this method as opposed to
				// forcing a synchronous event dispatch
				var idx = this.repeater.collection.indexOf(this.model);
				if (this.selected && !this.repeater.isSelected(this.model)) {
					this.repeater.select(idx);
				} else if (!this.selected && this.repeater.isSelected(this.model)) {
					this.repeater.deselect(idx);
				}
			}
			sup.apply(this, arguments);
		};
	}),

	/*
	* @method
	* @private
	*/
	modelChanged: kind.inherit(function (sup) {
		return function () {
			this.syncBindings();
			sup.apply(this, arguments);
		};
	}),

	/*
	* @method
	* @private
	*/
	decorateEvent: kind.inherit(function (sup) {
		return function (sender, event) {
			var c = this.repeater.collection;
			if (c) {
				event.model = this.model;
				event.child = this;
				event.index = this.repeater.collection.indexOf(this.model);
			}
			sup.apply(this, arguments);
		};
	}),

	/*
	* @private
	*/
	_selectionHandler: function () {
		if (this.repeater.selection && !this.get('disabled')) {
			if (this.repeater.selectionType != 'group' || !this.selected) {
				this.set('selected', !this.selected);
			}
		}
	},
	/**
	* Deliberately used to supersede the default method and set 
	* [owner]{@link module:enyo/Component~Component#owner} to this [control]{@link module:enyo/Control~Control} so that there 
	* are no name collisions in the instance [owner]{@link module:enyo/Component~Component#owner}, and also so 
	* that [bindings]{@link module:enyo/Binding~Binding} will correctly map to names.
	*
	* @method
	* @private
	*/
	createClientComponents: kind.inherit(function () {
		return function (components) {
			this.createComponents(components, {owner: this});
		};
	}),
	/**
	* Used so that we don't stomp on any built-in handlers for the `ontap`
	* {@glossary event}.
	*
	* @method
	* @private
	*/
	dispatchEvent: kind.inherit(function (sup) {
		return function (name, event, sender) {
			var owner;
			
			// if the event is coming from a child of the repeater-child (this...) and has a
			// delegate assigned to it there is a distinct possibility it is supposed to be
			// targeting the instanceOwner of repeater-child not the repeater-child itself
			// so we have to check this case and treat it as expected - if there is a handler
			// and it returns true then we must skip the normal flow
			if (event.originator !== this && event.delegate && event.delegate.owner === this) {
				if (typeof this[name] != 'function') {
					// ok we don't have the handler here let's see if our owner does
					owner = this.getInstanceOwner();
					if (owner && owner !== this) {
						if (typeof owner[name] == 'function') {
							// alright it appears that we're supposed to forward this to the
							// next owner instead
							return owner.dispatch(name, event, sender);
						}
					}
				}
			}
			
			if (!event._fromRepeaterChild) {
				if (!!~utils.indexOf(name, this.repeater.selectionEvents)) {
					this._selectionHandler();
					event._fromRepeaterChild = true;
				}
			}
			return sup.apply(this, arguments);
		};
	}),

	/*
	* @method
	* @private
	*/
	constructed: kind.inherit(function (sup) {
		return function () {
			sup.apply(this, arguments);
			var r = this.repeater,
				s = r.selectionProperty;
			// this property will only be set if the instance of the repeater needs
			// to track the selected state from the view and model and keep them in sync
			if (s) {
				var bnd = this.binding({
					from: 'model.' + s,
					to: 'selected',
					oneWay: false/*,
					kind: enyo.BooleanBinding*/
				});
				this._selectionBindingId = bnd.euid;
			}
		};
	}),

	/*
	* @method
	* @private
	*/
	destroy: kind.inherit(function (sup) {
		return function () {
			if (this._selectionBindingId) {
				var b$ = Binding.find(this._selectionBindingId);
				if (b$) {
					b$.destroy();
				}
			}
			sup.apply(this, arguments);
		};
	}),

	/*
	* @private
	*/
	_selectionBindingId: null
};

module.exports = RepeaterChildSupport;
