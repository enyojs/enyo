/**
* Contains declaration for {@link module:enyo/ContentAreaSupport~ContentAreaSupport}
* mixin, which adds ability to define property-bound content areas.
*
* @module enyo/ContentAreaSupport
*/

var
	kind = require('enyo/kind'),
	utils = require('enyo/utils'),
	Control = require('enyo/Control');

/**
* Populates a content area either initially or in response to a change to either the content or
* components property. `owner` is only defined for the initial call.
*
* @private
*/
function updateContentArea (control, targetName, contentProperty, componentsProperty, owner) {
	var ext,
		target = targetName instanceof Control ? targetName : control.$[targetName],
		prop = control[componentsProperty] ? componentsProperty : contentProperty,
		value = control[prop];

	if (target) {
		target.destroyClientControls();
		if (!value || utils.isString(value)) {
			target.set('content', value);
		} else {
			ext = owner ? {owner: owner} : null;
			if (utils.isArray(value)) {
				target.createComponents(value, ext);
			} else {
				target.createComponent(value, ext);
			}
			if (target.generated) target.render();
		}
	}
}

/**
* Defines the declaratively-configured content areas.
* 
* @private
*/
function initContentAreas (control) {
	var i, l, c;
	if (control._contentAreas) {
		for (i = 0, l = control._contentAreas.length; i < l; i++) {
			c = control._contentAreas[i];
			control.defineContentArea(c.target, c.content, c.components);
		}
	}
}

/**
* Adds ability to define content areas that map properties containing either string content or a
* components array into a named target in the control heirarchy. Content areas can be defined
* declaratively via the `contentAreas` member on the component configuration or programmatically
* via {@link module:enyo/ContentAreaSupport~ContentAreaSupport#defineContentArea}.
*
* ```javascript
* var
* 	kind = require('enyo/kind'),
* 	ContentAreaSupport = require('enyo/ContentAreaSupport');
*
* // Defines a new kind with a single content area rendering the value of `user`
* // into the control named `name`. `user` can contain either a string or a
* // components declaration array.
* var Hello = kind({
*		kind: Control,
*		mixins: [ContentAreaSupport],
*		user: 'The Doctor',
*
*		contentAreas: [
*			{target: 'name', content: 'user'}
*		],
*
*		components: [
*			{name: 'greeting', content: 'Hello, my name is'},
*			{name: 'name'},
*		]
* });
*
* // Uses the new kind with customized `user` value
* var SayHello = kind({
*		kind: Control,
*		components: [
*			{kind: Hello, user: [
*				{kind: Img, src: 'who.png'},
*				{content: 'David Tennant'}
*			]}
*		]
* });
* ```
*
* @mixin
* @public
*/
var ContentAreaSupport = {

	/**
	* Defines a new content area, target, populated by the contents of either the contentProperty
	* or the componentsProperty. The properties are observed and changes will cause `target` to be
	* updated.
	* 
	* *Note:* If updating a property at run-time to a new components block, the owner must be
	* explicitly set or the new components will be owned by `target`.
	*
	* @param  {String|module:enyo/Control~Control} target	-	Control name or instance that will be populated with the
	*	content.
	* @param  {String} contentProperty -	Name of property from which the content will be sourced.
	* @param  {String} [componentsProperty]	-	Name of property from which the components will be
	*	sourced. May be omitted if `contentProperty` should support either string content or a
	*	component declaration array.
	*
	* @public
	*/
	defineContentArea: function (target, contentProperty, componentsProperty) {
		var observer, owner,
			observeComponents = true;

		// for the 2 arg format, we'll assume that the property is dual-typed for a string or a
		// components block
		if (!componentsProperty) {
			componentsProperty = contentProperty;
			observeComponents = false;
		}

		// bind the update function and observe the properties
		observer = this.bindSafely(function (was, is, prop) {
			updateContentArea(this, target, contentProperty, componentsProperty);
		});
		this.observe(contentProperty, observer);
		if (observeComponents) this.observe(componentsProperty, observer);

		owner = this.hasOwnProperty(componentsProperty) ? this.getInstanceOwner() : this;
		updateContentArea(this, target, contentProperty, componentsProperty, owner);
	},

	/**
	* @private
	*/
	initComponents: kind.inherit(function (sup) {
		return function () {
			sup.apply(this, arguments);
			initContentAreas(this);
		};
	})
};

module.exports = ContentAreaSupport;

var sup = kind.concatHandler;
kind.concatHandler = function (ctor, props, instance) {
	sup.call(this, ctor, props, instance);

	if (props === ContentAreaSupport) return;

	var proto = ctor.prototype || ctor,
		contentAreas = proto._contentAreas && proto._contentAreas.slice(),
		incoming = props.contentAreas;

	if (incoming && incoming instanceof Array) {
		if (contentAreas) {
			contentAreas.push.apply(contentAreas, incoming);
		} else {
			contentAreas = incoming.slice();
		}
	}

	proto._contentAreas = contentAreas;
};