require('enyo');

var
	States = require('./States');

/**
* Provides generic API methods related to using {@link enyo.States}.
*
* @module enyo/StateSupport
* @public
*/
module.exports = {
	
	/**
	* @private
	*/
	name: 'StateSupport',
	
	/**
	* The given status. This property will be modified by the other API methods of
	* {@link enyo.StateSupport}.
	*
	* @type enyo.States
	* @default null
	*/
	status: null,
	
	/**
	* Will remove any [error flags]{@link enyo.States.ERROR} from the given
	* [status]{@link enyo.StateSupport.status}.
	*
	* @public
	*/
	clearError: function () {
		this.status = this.status & ~States.ERROR;
	},
	
	/**
	* Convenience method to avoid using [bitwise]{@glossary bitwise} comparison for the
	* [status]{@link enyo.StateSupport.status}. Determines whether the current status
	* (or the optional passed-in value) is an [error state]{@link enyo.States.ERROR}.
	* The passed-in value will only be used if it is a [Number]{@glossary Number}.
	*
	* @param {enyo.States} [status] - The specific value to compare as an
	*	[error state]{@link enyo.States.ERROR}.
	* @returns {Boolean} Whether the value is an [error state]{@link enyo.States.ERROR} or not.
	* @public
	*/
	isError: function (status) {
		return !! ((isNaN(status) ? this.status : status) & States.ERROR);
	},
	
	/**
	* Convenience method to avoid using [bitwise]{@glossary bitwise} comparison for the
	* [status]{@link enyo.StateSupport.status}. Determines whether the current status
	* (or the optional passed-in value) is a [busy state]{@link enyo.States.BUSY}. The
	* passed-in value will only be used if it is a [Number]{@glossary Number}.
	*
	* @param {enyo.States} [status] - The specific value to compare as a
	*	[busy state]{@link enyo.States.BUSY}.
	* @returns {Boolean} Whether the value is a [busy state]{@link enyo.States.BUSY} or not.
	* @public
	*/
	isBusy: function (status) {
		return !! ((isNaN(status) ? this.status : status) & States.BUSY);
	},
	
	/**
	* Convenience method to avoid using [bitwise]{@glossary bitwise} comparison for the
	* [status]{@link enyo.StateSupport.status}. Determines whether the current status
	* (or the optional passed-in value) is a [ready state]{@link enyo.States.READY}. The
	* passed-in value will only be used if it is a [Number]{@glossary Number}.
	*
	* @param {enyo.States} [status] - The specific value to compare as a
	*	[ready state]{@link enyo.States.READY}.
	* @returns {Boolean} Whether the value is a [ready state]{@link enyo.States.BUSY} or not.
	* @public
	*/
	isReady: function (status) {
		return !! ((isNaN(status) ? this.status : status) & States.READY);
	}
};
