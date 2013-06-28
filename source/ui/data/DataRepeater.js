(function (enyo) {

	//*@public
	/**
	*/
	enyo.kind({

		// ...........................
		// PUBLIC PROPERTIES

		//*@public
		name: "enyo.DataRepeater",

		//*@public
		kind: "enyo.View",

		//*@public
		childMixins: [],
		
		//*@public
		concat: ["childMixins"],

		//*@public
		controlParentName: "container",
		
		//*@public
		containerOptions: {
			name: "container",
			kind: "enyo.View",
			classes: "enyo-fill enyo-data-repeater-container",
		},

		//*@public
		handlers: {
			onModelAdded: "_modelAdded",
			onModelsAdded: "_modelsAdded",
			onModelRemoved: "_modelRemoved",
			onModelsRemoved: "_modelsRemoved"
		},

		//*@public
		bindings: [
			{from: ".controller.length", to: ".length"},
			{from: ".controller.data", to: ".data"}
		],
		

		//*@public
		batching: false,

		// ...........................
		// PROTECTED PROPERTIES

		//*@protected
		_childKind: null,

		// ...........................
		// PUBLIC METHODS
		
		//*@public
		initComponents: function () {
			// we need to find the child definition and prepare it for
			// use in our repeater including adding auto binding support
			var $components = this.kindComponents || this.components || [];
			var $owner = this.components? this.owner: this;
			this._childKind = enyo.kind({
				// tag: null, // no need for the extra container
				// TODO: it should be possible to use the above line but for
				// now it is causing far too many issues
				kind: "enyo.View",
				mixins: ["enyo.AutoBindingSupport", "enyo.RepeaterChildSupport"].concat(this.childMixins || []),
				components: $components,
				defaultKind: this.defaultKind || "enyo.View",
				defaultProps: {owner: $owner}
			});
			this._initContainer();
		},

		//*@public
		controllerFindAndInstance: function(ctor, inst) {
			this.inherited(arguments);
			if (inst && inst._isController) {
				this.reset();
			}
		},

		// TODO:
		reset: function () {
			var $d = this.get("data");
			var $c = this.$.scroller;
			this.destroyClientControls();
			$c.resizeHandler();
			if ($d) {
				enyo.forEach($d, this.add, this);
			}
		},

		render: function () {
			this.reset();
			this.inherited(arguments);
		},

		//*@public
		add: function (rec) {
			if (!this.generated) {
				return;
			}
			var $k = this._childKind;
			var $c = this.createComponent({kind: $k});
			var b = this.batching;
			$c.set("model", rec);
			if (!b) {
				$c.render();
			}
		},

		//*@public
		remove: function (idx) {
			var $ch = this.get("active");
			var $c = $ch[idx || (Math.abs($ch.length-1))];
			if ($c) {
				$c.destroy();
			}
		},

		//*@public
		update: function (idx) {
			var $d = this.get("data");
			var $ch = this.get("active");
			var $c = $ch[idx];
			if ($d && $c) {
				$c.set("model", $d[idx]);
			}
		},

		//*@public
		prune: function () {
			var $ch = this.get("active");
			var l = this.length;
			var $x = $ch.slice(l);
			enyo.forEach($x, function (c) {
				c.destroy();
			});
		},

		// ...........................
		// COMPUTED PROPERTIES

		//*@public
		active: enyo.computed(function () {
			return this.controlParent? this.controlParent.children: this.children;
		}, "controlParent", {cached: true, defer: true}),

		// ...........................
		// PROTECTED METHODS

		//*@protected
		_initContainer: function () {
			var $container = this.get("containerOptions");
			var name = $container.name || ($container.name = "scroller");
			this.createChrome([$container]);
			this.discoverControlParent();
			if (name != "scroller") {
				this.$.scroller = this.$[name];
			}
		},

		//*@protected
		_modelAdded: function (sender, event) {
			if (sender !== this.controller) {
				return;
			}
			var $model = event.model;
			this.add($model, event.index);
		},

		//*@protected
		_modelsAdded: function (sender, event) {
			if (sender !== this.controller) {
				return;
			}
			this.set("batching", true);
			enyo.forEach(event.models, function (info) {
				this.add(info.model, info.index);
			}, this);
			this.set("batching", false);
		},

		//*@protected
		_modelRemoved: function (sender, event) {
			if (sender !== this.controller) {
				return;
			}
			this.remove(event.index);
		},

		//*@protected
		_modelsRemoved: function (sender, event) {
			if (sender !== this.controller) {
				return;
			}
			enyo.forEach(event.models, function (info) {
				this.remove(info.index);
			}, this);
		},

		// ...........................
		// OBSERVERS

		//*@public
		batchingChanged: function (prev, val) {
			if (false === val) {
				this.render();
			}
		},

		//*@protected
		_lengthChanged: enyo.observer(function (prop, prev, val) {
			if (!isNaN(prev) && !isNaN(val)) {
				if (prev > val) {
					this.prune();
				}
			}
		}, "length")

	});

})(enyo);
