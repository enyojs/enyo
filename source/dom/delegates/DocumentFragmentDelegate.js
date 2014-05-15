(function (enyo, scope) {
	
	/**
		@public
	*/
	enyo.DocumentFragmentDelegate = {
		
		/**
			@private
		*/
		invalidate: function (control, item) {
			
		},
		
		/**
			@private
		*/
		render: function () {
			
		},
		
		/**
			@private
		*/
		renderInto: function (control, parentNode) {
			
			// generate a document fragment with all content attached and insert it into
			// the parent node
			parentNode.appendChild(this.generate(control));
			
			if (control.generated) control.rendered();
		},
		
		/**
			@private
		*/
		teardownRender: function (control) {
			if (control.generated) this.teardownChildren(control);
			control.node = null;
			control.set('generated', false);
		},
		
		/**
			@private
		*/
		teardownChildren: function (control) {
			var child,
				i = 0;
				
			for (; (child = control.children[i]); ++i) {
				child.teardownRender();
			}
		},
		
		/**
			@private
		*/
		generate: function (control, node) {
			var child,
				content,
				allowHtml = control.allowHtml,
				el,
				i = 0;
			
			// if a frag/node isn't passed in then we need to generate it from the top
			// and this will be the entity we append to
			frag = node || document.createDocumentFragment();
			
			// if this particular control is not allowed to be generated we don't
			if (control.canGenerate === false) return frag;
			
			// now if we have a tag we create the correct element for this control
			// and append it to the fragment/parent
			if (control.tag) {
				el = document.createElement(control.tag);
				
				// control.cssText is a shortcut for pre-parsed browser-ready css string
				// should the view have somehow already been rendered
				el.style.cssText = control.cssText || control.style;
				
				// go ahead and render any attributes to the node
				this.renderAttributes(control, el);
				
				// insert it into the tree
				frag.appendChild(el);
			}
			
			// supposed to give it the opportunity to flow
			control.flow();
			
			// if it has children then we need to recurse and append them as well
			// and hope its now too time consuming
			if (control.children.length) {
				for (; (child = control.children[i]); ++i) {
					
					// it should use the node of the outer control unless it doesn't have
					// one and then it should use the frag or passed in node from above
					this.generate(child, el || frag);
				}
			} else if (el) {
				// we must have some content to set directly
				content = control.get('content');
				el.innerHTML = allowHtml ? content : enyo.dom.escape(content);
			}
			
			control.set('generated', true);
			return frag;
		},
		
		/**
			@private
		*/
		renderAttributes: function (control, node) {
			var attrs = control.attributes,
				node = node || control.hasNode(),
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
		}

	};
	
})(enyo, this);