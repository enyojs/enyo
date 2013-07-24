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
		childMixins: [
			"enyo.AutoBindingSupport",
			"enyo.RepeaterChildSupport"
		],
		
		selection: true,
		multipleSelection: false,
		
		//*@public
		concat: ["childMixins"],

		//*@public
		controlParentName: "container",
		
		containerName: "container",
		
		//*@public
		containerOptions: {
			name: "container",
			classes: "enyo-fill enyo-data-repeater-container",
		},

		//*@public
		handlers: {
			onModelAdded: "modelAdded",
			onModelsAdded: "modelsAdded",
			onModelRemoved: "modelRemoved",
			onModelsRemoved: "modelsRemoved",
			onSelected: "childSelected",
			onDeselected: "childDeselected"
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
		
		__selection: null,

		// ...........................
		// PUBLIC METHODS
		
		//*@public
		initComponents: function () {
			this.initContainer();
			// we need to find the child definition and prepare it for
			// use in our repeater including adding auto binding support
			var $c = this.kindComponents || this.components || [];
			// var $o = this.components? this.owner: this, $p;
			var $o = this.components? this.owner: this;
			// if there is a special definition in the components block we
			// wrap it up in a new anonymous kind for reuse later
			if ($c.length) {
				$p = enyo.pool.claimObject(true);
				$p.kind = this.defaultKind || "enyo.View";
				if ($c.length > 1) {
					$p.components = $c;
				} else {
					enyo.mixin($p, $c[0]);
				}
				this.defaultKind = enyo.kind($p);
				enyo.pool.releaseObject($p);
			} else {
				// otherwise we use the defaultKind property value and assume
				// it was set properly
				this.defaultKind = enyo.constructorForKind(this.defaultKind);
			}
			$p = this.defaultProps || (this.defaultProps = {});
			$p.owner = $o;
			$p.mixins = this.childMixins;
			$p.selection = this.selection;
			$p.multipleSelection = this.multipleSelection;
		},
		
		constructor: function () {
			this.__selection = [];
			return this.inherited(arguments);
		},

		//*@public
		controllerFindAndInstance: function(ctor, inst) {
			this.inherited(arguments);
			if (inst && inst._isController) {
				this.reset();
			}
		},

		reset: function () {
			var $d = this.get("data");
			this.destroyClientControls();
			for (var $i=0, d$; (d$=$d[$i]); ++$i) {
				this.add(d$, $i);
			}
		},

		//*@public
		add: function (record, idx) {
			var $c = this.createComponent({model: record, index: idx});
			if (this.generated && !this.batching) {
				$c.render();
			}
		},

		//*@public
		remove: function (idx) {
			var $g = this.getClientControls();
			var $c = $g[idx || (Math.abs($g.length-1))];
			if ($c) {
				$c.destroy();
			}
		},

		update: function (idx) {
			var $d = this.get("data");
			var $g = this.getClientControls();
			var $c = $g[idx];
			if ($d[idx] && $c) {
				$c.set("model", $d[idx]);
			}
		},

		prune: function () {
			var $g = this.getClientControls();
			var $x = $g.slice(this.length);
			for (var $i=0, c$; (c$=$x[$i]); ++$i) {
				c$.destroy();
			}
		},

		initContainer: function () {
			var $c = this.get("containerOptions"), $n;
			$n = $c.name || ($c.name = this.containerName);
			this.createChrome([$c]);
			this.discoverControlParent();
			if ($n != this.containerName) {
				this.$[this.containerName] = this.$[$n];
			}
		},

		modelAdded: function (sender, event) {
			if (sender == this.controller) {
				this.add(event.model, event.index);
			}
		},

		modelsAdded: function (sender, event) {
			if (sender == this.controller) {
				this.set("batching", true);
				for (var $i=0, m$; (m$=event.models[$i]); ++$i) {
					this.add(m$.model, m$.index);
				}
				this.set("batching", false);
			}
		},

		modelRemoved: function (sender, event) {
			if (sender == this.controller) {
				this.remove(event.index);
			}
		},

		modelsRemoved: function (sender, event) {
			if (sender == this.controller) {
				for (var $i=0, m$; (m$=event.models[$i]); ++$i) {
					this.remove(m$.index);
				}
			}
		},

		// ...........................
		// OBSERVERS

		//*@public
		batchingChanged: function (prev, val) {
			if (this.generated && false === val) {
				this.$[this.containerName].renderReusingNode();
			}
		},
		
		childSelected: function (sender, event) {
			var $c = event.child;
			var $s = this.__selection, $i, $t;
			if (this.selection) {
				$i = enyo.indexOf($c, $s);
				if (this.multipleSelection) {
					if (!~$i) {
						$s.push($c);
					}
				} else {
					while($s.length) {
						$t = $s.pop();
						$t.set("selected", false);
					}
					$s.push($c);
				}
			}
			return true;
		},
		childDeselected: function (sender, event) {
			var $c = event.child;
			var $s = this.__selection, $i;
			if (this.selection) {
				$i = enyo.indexOf($c, $s);
				if (!!~$i) {
					$s.splice($i, 1);
				}
			}
			return true;
		}

	});

})(enyo);
