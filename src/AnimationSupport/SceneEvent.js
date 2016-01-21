var
	Scene = require('./Scene'),
	director = require('./Director'),
	delegator = require('./EventDelegator'),
	utils = require('../utils');

var
	/**
	 * Holds references for DOM event updates to be used for 
	 * virtual events.
	 * @private
	 */
	_eventCache = {},

	/**
	 * Checks if registered DOM event is been triggered for the actors
	 * added to this scene.
	 * @private
	 */
	_isTriggered = false,

	/**
	 * Holds refereneces of the activator who has initiated a virtual
	 * event for the actor/s in this scene.
	 * @private
	 */
	_triggerer = '';


var EventAction = {

	/**
	 * Sets the delta values of x, y and z for events
	 * @param {Object} obj - Object contains dX, dY and dZ as keys
	 * @public
	 */
	setAnimationDelta: function(ev) {
		_eventCache.dX = ev.dX + _eventCache.dX || 0;
		_eventCache.dY = ev.dY + _eventCache.dY || 0;
		_eventCache.dZ = ev.dZ + _eventCache.dZ || 0;
		_eventCache[ev.vtype] = ev;

		_isTriggered = true;
		_triggerer = ev.vtype;
	},

	/**
	 * Gets the delta values of x, y and z for events
	 * @public
	 */
	getAnimationDelta: function() {
		return _eventCache[_triggerer];
	},

	/**
	 * Trigger the registered event to all the listeners
	 * @public
	 */
	triggerEvent: function() {
		_isTriggered = false;
		return delegator.emitEvent(this, this.getAnimationDelta());
	},

	/**
	 * Activates handles for generated actors
	 * @public
	 */
	register: function (actor) {
		if (this.handlers) {
			delegator.register(actor, this.handlers);
		}
	},

	action: function (ts, pose) {
		if (_isTriggered && this.getAnimationDelta()) {
			if (!this.triggerEvent()) {
				director.shot(this, ts);
			}
		}
		return pose;
	}
};


/**
 * Registers an actor/s from a scene.
 * (Actors could be delinked during the animation
 * however they will current their state when delinked)
 */
Scene.register = function(actor, scene) {
	delegator.register(scene, actors);
};


/**
 * Scene is used to generate animation structure.
 * @module enyo/AnimationSupport/SceneEvent
 */
module.exports = function(props) {
	var scene = Scene(props);
	utils.mixin(scene, EventAction);
	return scene;
};

