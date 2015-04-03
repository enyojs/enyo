(function (enyo, scope) {

	var selfClosing = {img: 1, hr: 1, br: 1, area: 1, base: 1, basefont: 1, input: 1, link: 1,
		meta: 1, command: 1, embed: 1, keygen: 1, wbr: 1, param: 1, source: 1, track: 1, col: 1};

	/**
	* This is the default render delegate used by {@link enyo.Control}. It
	* generates the HTML [string]{@glossary String} content and correctly inserts
	* it into the DOM. A string-concatenation technique is used to perform DOM
	* insertion in batches.
	*
	* @name enyo.HTMLStringDelegate
	* @type Object
	* @public
	*/
	enyo.HTMLStringDelegate = {

		/**
		* @private
		*/
		invalidate: function (control, item) {
			switch (item) {
			case 'content':
				this.renderContent(control);
				break;
			default:
				control.tagsValid = false;
				break;
			}
		},

		/**
		* @private
		*/
		render: function (control) {
			if (control.parent) {
				control.parent.beforeChildRender(control);

				if (!control.parent.generated) return;
				if (control.tag === null) return control.parent.render();
			}

			if (!control.hasNode()) this.renderNode(control);
			if (control.hasNode()) {
				this.renderDom(control);
				if (control.generated) control.rendered();
			}
		},

		/**
		* @private
		*/
		renderInto: function (control, parentNode) {
			parentNode.innerHTML = this.generateHtml(control);

			if (control.generated) control.rendered();
		},

		/**
		* @private
		*/
		renderNode: function (control) {
			this.teardownRender(control);
			control.node = document.createElement(control.tag);
			control.addNodeToParent();
			control.set('generated', true);
		},

		/**
		* @private
		*/
		renderDom: function (control) {
			this.renderAttributes(control);
			this.renderStyles(control);
			this.renderContent(control);
		},

		/**
		* @private
		*/
		renderStyles: function (control) {
			var style = control.style;

			// we can safely do this knowing it will synchronize properly without a double
			// set in the DOM because we're flagging the internal property
			if (control.hasNode()) {
				control.node.style.cssText = style;
				// retrieve the parsed value for synchronization
				control.cssText = style = control.node.style.cssText;
				// now we set it knowing they will be synchronized and everybody that is listening
				// will also be updated to know about the change
				control.set('style', style);
			}
		},

		/**
		* @private
		*/
		renderAttributes: function (control) {
			var attrs = control.attributes,
				node = control.hasNode(),
				key,
				val;

			if (node) {
				for (key in attrs) {
					val = attrs[key];
					if (val === null || val === false || val === "") {
						node.removeAttribute(key);
					} else {
						node.setAttribute(key, val);
					}
				}
			}
		},

		/**
		* @private
		*/
		renderContent: function (control) {
			if (control.generated) this.teardownChildren(control);
			if (control.hasNode()) control.node.innerHTML = this.generateInnerHtml(control);
		},

		/**
		* @private
		*/
		generateHtml: function (control) {
			var content,
				html;

			if (control.canGenerate === false) {
				return '';
			}
			// do this first in case content generation affects outer html (styles or attributes)
			content = this.generateInnerHtml(control);
			// generate tag, styles, attributes
			html = this.generateOuterHtml(control, content);
			// NOTE: 'generated' is used to gate access to findNodeById in
			// hasNode, because findNodeById is expensive.
			// NOTE: we typically use 'generated' to mean 'created in DOM'
			// but that has not actually happened at this point.
			// We set 'generated = true' here anyway to avoid having to walk the
			// control tree a second time (to set it later).
			// The contract is that insertion in DOM will happen synchronously
			// to generateHtml() and before anybody should be calling hasNode().
			control.set('generated', true);
			return html;
		},

		/**
		* @private
		*/
		generateOuterHtml: function (control, content) {
			if (!control.tag) return content;
			if (!control.tagsValid) this.prepareTags(control);
			return control._openTag + content + control._closeTag;
		},

		/**
		* @private
		*/
		generateInnerHtml: function (control) {
			var allowHtml = control.allowHtml,
				content;

			// flow can alter the way that html content is rendered inside
			// the container regardless of whether there are children.
			control.flow();
			if (control.children.length) return this.generateChildHtml(control);
			else {
				content = control.get('content');
				return allowHtml ? content : enyo.dom.escape(content);
			}
		},

		/**
		* @private
		*/
		generateChildHtml: function (control) {
			var child,
				html = '',
				i = 0,
				delegate;

			for (; (child = control.children[i]); ++i) {
				delegate = child.renderDelegate || this;
				html += delegate.generateHtml(child);
			}

			return html;
		},

		/**
		* @private
		*/
		prepareTags: function (control) {
			var html = '';

			// open tag
			html += '<' + control.tag + (control.style ? ' style="' + control.style + '"' : '');
			html += this.attributesToHtml(control.attributes);
			if (selfClosing[control.tag]) {
				control._openTag = html + '/>';
				control._closeTag = '';
			} else {
				control._openTag = html + '>';
				control._closeTag = '</' + control.tag + '>';
			}

			control.tagsValid = true;
		},

		/**
		* @private
		*/
		attributesToHtml: function(attrs) {
			var key,
				val,
				html = '';

			for (key in attrs) {
				val = attrs[key];
				if (val != null && val !== false && val !== '') {
					html += ' ' + key + '="' + this.escapeAttribute(val) + '"';
				}
			}

			return html;
		},

		/**
		* @private
		*/
		escapeAttribute: function (text) {
			if (typeof text != 'string') return text;

			return String(text).replace(/&/g, '&amp;').replace(/\"/g, '&quot;');
		},

		/**
		* @private
		*/
		teardownRender: function (control, cache) {
			if (control.generated) this.teardownChildren(control, cache);
			control.node = null;
			control.set('generated', false);
		},

		/**
		* @private
		*/
		teardownChildren: function (control, cache) {
			var child,
				i = 0;

			for (; (child = control.children[i]); ++i) {
				child.teardownRender(cache);
			}
		}
	};

})(enyo, this);