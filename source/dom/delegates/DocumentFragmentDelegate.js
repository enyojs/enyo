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
		render: function (control) {
			var el;
			
			if (control.parent) {
				control.parent.beforeChildRender(control);
				
				if (!control.parent.generated) return;
				if (control.tag === null) return control.parent.render();
			}
			
			if (control.hasNode()) {
				control.removeNodeFromDom();
				this.teardownRender(control);
			}

			control.node = this.generate(control);
			control.addNodeToParent();
			
			// because technically it was a fragment and we need it to use the actual
			// node next time it's needed
			control.node = null;
			if (control.generated) control.rendered();
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
			control.generated = false;
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
				frag,
				el,
				i = 0;
			
			// if a frag/node isn't passed in then we need to generate it from the top
			// and this will be the entity we append to
			frag = node || document.createDocumentFragment();
			
			// if this particular control is not allowed to be generated we don't
			if (control.canGenerate === false) return frag;
			
			// now if we have a tag we create the correct element for this control
			// and append it to the fragment/parent
			if (control.tag && !control.hasNode()) {
				el = document.createElement(control.tag);
				
				// insert it into the tree
				frag.appendChild(el);
			} else el = control.node;
			
			if (el) {
				
				// control.cssText is a shortcut for pre-parsed browser-ready css string
				// should the view have somehow already been rendered
				el.style.cssText = control.cssText || control.style;
				
				// go ahead and render any attributes to the node
				this.renderAttributes(control, el);
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
			
			control.generated = true;
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
					if (val === null || val === false || val === '') {
						node.removeAttribute(key);
					} else {
						node.setAttribute(key, val);
					}
				}
			}
		}

	};
	
})(enyo, this);