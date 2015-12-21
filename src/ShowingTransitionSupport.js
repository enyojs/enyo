require('moonstone');

var kind = require('enyo/kind');

/**
* @module moonstone/ShowingTransitionSupport
*
* The {@link module:moonstone/ShowingTransitionSupport} [mixin]{@glossary mixin} is applicable to
* and control that should use a transition or animation when it is shown or hidden. This mixin adds
* optional state-classes to the component at its resting or transitioning states. The states are as
* follows:
*
* * 'shown' and 'hidden' - resting, static, not-transitioning, past tense states.
* * 'showing' and 'hiding' - transitioning-to, progressive tense states.
*
* A CSS class may be optionally supplied and applied to the component during that state. It will be
* removed immediately when the component is no longer in that state. The 'hidden', 'hiding', and
* 'showing' CSS classes are already defined as defaults, to account for the most common use case.
* The same classes are allowed to be used on multiple states.
*
* It may be desirable to only have a transition on only one of the showing or hiding states; this is
* also possible.
*
* Transitions take time, so be sure to include a {hidingDuration} and/or {showingDuration}. You may
* take advantage of this [mixin]{@glossary mixin}'s state classes without using transitions by
* leaving the duration properties blank (0, null or undefined) and the resting states will simply be
* applied immediately, skipping the transition state classes.
*
* An optional method may be supplied to fire at the end of either of the transitions, using
* {hidingMethod} and/or {showingMethod}
*
* @mixin
* @public
*/
module.exports = {

	/**
	* @private
	*/
	name: 'ShowingTransitionSupport',

	/**
	* A read-only property for checking whether we are in the middle of a transition.
	*
	* @type {Boolean}
	* @default false
	* @public
	*/
	showingTransitioning: false,

	/**
	* The amount of time the "showing" transition takes to complete in milliseconds.
	*
	* @type {Number}
	* @default undefined
	* @public
	*/
	showingDuration: undefined,

	/**
	* The amount of time the "hiding" transition takes to complete in milliseconds.
	*
	* @type {Number}
	* @default undefined
	* @public
	*/
	hidingDuration: undefined,

	/**
	* The method to fire at the end of the "showing" transition. This may be name of a method on the
	* component, or a function.
	*
	* @type {String|Function}
	* @default undefined
	* @public
	*/
	shownMethod: undefined,

	/**
	* The method to fire at the end of the "hiding" transition. This may be name of a method on the
	* component, or a function.
	*
	* @type {String|Function}
	* @default undefined
	* @public
	*/
	hiddenMethod: undefined,

	/**
	* The the classname to apply for the "shown" (component is visible) resting state.
	*
	* @type {String}
	* @default undefined
	* @public
	*/
	shownClass: undefined,

	/**
	* The the classname to apply for the "hidden" (component is not visible) resting state.
	*
	* @type {String}
	* @default 'hidden'
	* @public
	*/
	hiddenClass: undefined,

	/**
	* The the classname to apply for the "hiding" (component has started the transition to the
	* hidden state) transition state.
	*
	* @type {String}
	* @default 'hiding'
	* @public
	*/
	hidingClass: undefined,

	/**
	* The the classname to apply for the "showing" (component has started the transition to the
	* shown state) transition state.
	*
	* @type {String}
	* @default 'showing'
	* @public
	*/
	showingClass: undefined,

	/**
	* Initializes the defaults, and prepares the component with its classes in case of initially
	* "showing: false".
	*
	* @method
	* @private
	*/
	create: kind.inherit(function (sup) {
		return function () {
			sup.apply(this, arguments);
			this.showingDuration = (this.showingDuration === undefined) ? null      : this.showingDuration;
			this.hidingDuration  = (this.hidingDuration  === undefined) ? null      : this.hidingDuration;
			this.shownMethod     = (this.shownMethod     === undefined) ? null      : this.shownMethod;
			this.hiddenMethod    = (this.hiddenMethod    === undefined) ? null      : this.hiddenMethod;
			this.shownClass      = (this.shownClass      === undefined) ? null      : this.shownClass;
			this.hiddenClass     = (this.hiddenClass     === undefined) ? 'hidden'  : this.hiddenClass;
			this.hidingClass     = (this.hidingClass     === undefined) ? 'hiding'  : this.hidingClass;
			this.showingClass    = (this.showingClass    === undefined) ? 'showing' : this.showingClass;
			this.showingChanged();
		};
	}),

	/**
	* Overrides the showingChanged handler to add support for transitions at the right times and
	* places.
	*
	* @method
	* @private
	*/
	showingChanged: kind.inherit(function (sup) {
		return function (sender, ev) {
			var args = arguments;

			// Prepare our visual state
			this.applyStyle('display', null);
			this.applyStyle('visibility', null);
			if (this.showing) {
				// Reset our state classes, in case we switched mid-stream
				this.removeClass(this.hidingClass);
				this.removeClass(this.hiddenClass);
				sup.apply(this, args);
				if (this.showingDuration && this.generated) {
					this.set('showingTransitioning', true);
					// Start transition: Apply a class and start a timer.
					// When timer finishes, run the exit function,
					// remove the transitioning class
					// and add the final-state class
					this.addClass(this.showingClass);
					this.startJob('showingTransition', function () {
						if (this.shownMethod && typeof this.shownMethod == 'string') this[this.shownMethod];	// Run the supplied method.
						else if (typeof this.shownMethod == 'function') this.shownMethod.call(this);	// Run the supplied method.
						this.removeClass(this.showingClass);
						this.addClass(this.shownClass);
						this.set('showingTransitioning', false);
					}, this.showingDuration);
				} else {
					// No transition, just a shown class.
					this.addClass(this.shownClass);
				}
			} else {
				// Reset our state classes, in case we switched mid-stream
				this.removeClass(this.showingClass);
				this.removeClass(this.shownClass);
				if (this.hidingDuration && this.generated) {
					this.set('showingTransitioning', true);
					this.addClass(this.hidingClass);
					this.startJob('showingTransition', this.bindSafely(function () {
						if (this.hiddenMethod && typeof this.hiddenMethod == 'string') this[this.hiddenMethod];	// Run the supplied method.
						else if (typeof this.hiddenMethod == 'function') this.hiddenMethod.call(this);	// Run the supplied method.
						this.removeClass(this.hidingClass);
						this.addClass(this.hiddenClass);
						this.set('showingTransitioning', false);
						sup.apply(this, args);
						this.applyStyle('visibility', 'hidden');
						this.applyStyle('display', null);
					}), this.hidingDuration);
				} else {
					// No transition, just a hidden class.
					this.removeClass(this.hidingClass);
					this.addClass(this.hiddenClass);
					sup.apply(this, args);
					this.applyStyle('visibility', 'hidden');
					this.applyStyle('display', null);
				}
			}
		};
	})
};
