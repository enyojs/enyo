var
	Scene = require('./Scene'),
	director = require('./Director'),
	dispatcher = require('../dispatcher'),
	emitter = require('../EventEmitter'),
	utils = require('../utils');

var eventsMap = {
	vdrag: "drag",
	vscroll: "scroll",
	vmousewheel: "mousewheel",
	vtouch: "touchmove",
	drag: "vdrag",
	scroll: "vscroll",
	mousewheel: "vmousewheel",
	touchmove: "vtouch"
};


/**
* This module handles the animation events for the character.
* If the character has opted to have animations handled by animation framework,
* then it can add "handleAnimationEvents" as true as its property.
* The character can also mention which events he wants to be handled by the framework by
* providing list of animation events in "handlers" block like;
* { 
*	name: "myKind",
*	handlers: [
*		"scroll",
*		"mousewheel",
*		"touchstart",
*		"touchmove",
*		"touchend"
*	]
* }
*
* By default these events are handled within the framework(others for now have to be handled by the application).
*/
var EventDelegator = {

	/**
	* Attaches the evnet handlers to the character either its own events or
	* else default events with the framework. As of now only these events are 
	* supported;
	* - scroll
	* - touch
	* - mousewheel
	* @public
	*/
	register: function (scene, charc) {
		var events = scene.handlers || {};
		for (var key in events) {
			this.addRemoveListener(scene, charc, key, events[key]);
		}
	},

	/**
	* Detaches the evnet handlers from the character either its own events or
	* else default events from with the framework. As of now only these events are 
	* supported;
	* - scroll
	* - touch
	* - mousewheel
	* @public
	*/
	deRegister: function (scene, charc) {
		var events = scene.handlers || {};
		for (var key in events) {
			this.addRemoveListener(scene, charc, key, events[key], true);
		}
	},

	/**
	* @private
	*/
	addRemoveListener: function(scene, charc, name, callback, remove) {
		var d = remove ? dispatcher.stopListening : dispatcher.listen,
			e = eventsMap[name];
		d(charc.hasNode(), e, charc.bindSafely(this[e + 'Event'], charc));

		var fn = remove ? emitter.off : emitter.on;
		fn.apply(emitter, [name, scene[callback], charc]);
	},

	/**
	* @private
	*/
	emitEvent: function(action, name) {
		emitter.emit(name, 
				action.eventOriginator,
				action.getAnimationDelta());
	},

	/**
	* @private
	*/
	touchmoveEvent: function (sender, inEvent) {
		var x = inEvent.targetTouches[0].pageX,
			y = inEvent.targetTouches[0].pageY;
			
		if(x !== 0 || y !== 0) {
			inEvent.dX = x;
			inEvent.dY = y;
			inEvent.dZ = 0;
			inEvent.vtype = eventsMap['touchmove'];
			EventAction.setAnimationDelta(inEvent);
		}
	},

	/**
	* @private
	*/
	scrollEvent: function (inSender, inEvent) {
		inEvent.dX = inEvent.deltaX;
		inEvent.dY = inEvent.deltaY;
		inEvent.dZ = 0;
		inEvent.vtype = eventsMap['scroll'];
		EventAction.setAnimationDelta(inEvent);
	},

	/**
	* @private
	*/
	dragEvent: function (inSender, inEvent) {
		inEvent.dX = inEvent.offsetX;
		inEvent.dY = inEvent.offsetY;
		inEvent.dZ = 0;
		inEvent.vtype = eventsMap['drag'];
		EventAction.setAnimationDelta(inEvent);
	},

	/**
	* @private
	*/
	mousewheelEvent: function (sender, inEvent) {
		inEvent.dX = inEvent.deltaX;
		inEvent.dY = inEvent.deltaY;
		inEvent.dZ = 0;
		inEvent.vtype = eventsMap[inEvent.type];
		EventAction.setAnimationDelta(inEvent);
	}
};



var sup,

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

	eventOriginator: undefined,

	/**
	 * Sets the delta values of x, y and z for events
	 * @param {Object} obj - Object contains dX, dY and dZ as keys
	 * @memberOf module:enyo/AnimationSupport/SceneEvent
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
	 * To get event changes captured, for delta values of x, y and z.
     * @return {Object}  delta    - pose
     * @memberOf module:enyo/AnimationSupport/SceneEvent
	 * @public
	 */
	getAnimationDelta: function() {
		return _eventCache;
	},

	/**
	 * To be when an virtual event has to be triggered for the last event captured.
     * @return {void}
     * @memberOf module:enyo/AnimationSupport/SceneEvent
	 * @public
	 */
	triggerEvent: function() {
		_isTriggered = false;
		EventDelegator.emitEvent(this, _triggerer);
	},

	/**
	 * To be used when an actor is registerd for event tracking.
	 * Its keeps track of only on actor which is refered as
	 * the originator.
     * @param  {Object} actor - Component on which events will be captured.
     * @return {void}
     * @memberOf module:enyo/AnimationSupport/SceneEvent
	 * @public
	 */
	register: function (actor) {
		if (this.handlers) {
			this.eventOriginator = actor;
			EventDelegator.register(this, actor);
		}
	},

	/**
     * Overridden function initiates action on the animation
     * for the given scene event.
     * @param  {number} ts   - timespan
     * @param  {Object} pose - pose from the animation list
     * @return {Object}      - pose
     * @memberOf module:enyo/AnimationSupport/SceneEvent
     * @private
     * @override
     */
	action: function (ts, pose) {
		if (_isTriggered && _triggerer && this.handlers && this.handlers[_triggerer] !== undefined) {
			if (this.handlers[_triggerer] === "") {
				ts = director.shot(this, ts);
				pose = sup.call(this, ts, pose);
				if(ts === 0) _isTriggered = false;
			} else {
				this.triggerEvent();
			}
		}
		return pose;
	}
};


/**
 * Scene Event A child entity of Scene which helps 
 * to perform user interaction based animations. <br>
 * This Scene can register virtual events for actors 
 * to enhance performance of delegation of events. <br>
 * SceneEvent can hold many actors on which animation has 
 * to performed, however only one actor{originator} can be
 * registered for event tracking. <br>
 * To capture events which are tracked by SceneEvent,
 * handlers could be added within the scene block with there
 * respective call backs.<br><br>
 * Usage -  var sceneInstance = SceneEvent({
 *				animation: [{ rotate: "180,0,0"}],
 *				handlers: {vmousewheel: ""},
 *			});
 *			sceneInstance.register(eventActor);
 *			sceneInstance.play();
 * @module enyo/AnimationSupport/SceneEvent
 */
module.exports = function(props) {
	var scene = Scene(props);
	sup = scene.action;
	utils.mixin(scene, EventAction);
	return scene;
};