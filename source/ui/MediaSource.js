/**
* Fires when the `src` or `type` of the {@link enyo.MediaSource} changes.
*
* @event enyo.MediaSource#onChangeSource
* @type {Object}
* @public
*/

/**
* A media source for {@link enyo.Audio} or {@link enyo.Video}.
*
* ```
* {kind: 'Video', components: [
* 	{src: 'video.mp4', type: 'video/mp4'},
* 	{src: 'video.ogg', type: 'video/ogg'},
* 	{src: 'video.webm', type: 'video/webm'}
* ]}
* ```
* 
* @ui
* @class enyo.MediaSource
* @extends enyo.Control
* @public
*/
enyo.kind(
	/** @lends enyo.MediaSource.prototype */ {

	/**
	* @private
	*/
	name: 'enyo.MediaSource',
	
	/**
	* @private
	*/
	kind: 'Control',
	
	/**
	* @private
	*/
	tag: 'source',
	
	/**
	* Path to the source.
	*
	* @type {String}
	* @default ''
	* @public
	*/
	src: '',
	
	/**
	* MIME Type of the source.
	*
	* @type {String}
	* @default ''
	* @public
	*/
	type: '',
	
	/**
	* @private
	*/
	events: {
		onChangeSource: ''
	},
	
	/**
	* @method
	* @private
	*/
	create: enyo.inherit(function (sup) {
		return function () {
			sup.apply(this, arguments);

			// import the value from attributes if it was specified there instead of the property
			this.syncAttribute('src');
			this.syncAttribute('type');
		};
	}),
	
	/**
	* @fires enyo.MediaSource#onChangeSource
	* @private
	*/
	srcChanged: function () {
		this.setAttribute('src', enyo.path.rewrite(this.src));
		this.doChangeSource();
	},
	
	/**
	* @fires enyo.MediaSource#onChangeSource
	* @private
	*/
	typeChanged: function () {
		this.setAttribute('type', this.type);
		this.doChangeSource();
	},
	
	/**
	* Synchronizes initial property values with attributes. If the property is valued, it is set
	* on the attribute. If not and the attribute is valued, import it onto the property
	* 
	* @private
	*/
	syncAttribute: function (name) {
		var attr = this.getAttribute(name);

		if(!this[name] && attr) {
			this[name] = attr;
		} else {
			this.setAttribute(name, this[name]);
		}
	}
});