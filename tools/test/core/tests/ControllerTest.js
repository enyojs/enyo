enyo.kind({
	name: "ControllerTest",
	kind: enyo.TestSuite,
	noDefer: true,
	testGlobalProperty: function () {
		/*global test:true */
		var c = enyo.singleton({
			name: "test.global.controller",
			kind: "enyo.Controller",
			global: true
		});
		this.finish(
			(c !== test.global.controller && "controller was not set globally as expected")
		);
	},
	testGlobalInComponent: function () {
		var a = enyo.singleton({
			kind: "enyo.Application",
			components: [
				{name: "controller", global: true}
			]
		});
		this.finish(
			(!window.controller && "controller was not set globally ever") ||
			((a.destroy() || true) && !window.controller && "controller removed from global scope when owner destroyed") ||
			(window.controller.destroyed && "controller was destroyed when owner was destroyed")
		);
	}
});

enyo.kind({
	name: "ModelControllerTest",
	kind: enyo.TestSuite,
	noDefer: true,
	testStandAlone: function () {
		var mc = new enyo.ModelController(),
			c  = new enyo.Control(),
			b  = new enyo.Binding({source: mc, from: ".prop1", target: c, to: ".content"}),
			m  = new enyo.Model({prop1: "1"});
		mc.set("model", m);
		b.destroy();
		this.finish(
			(mc.get("prop1") != "1" && "could not retrieve the correct value from the model") ||
			(c.get("content") != "1" && "control's content did not propagate from binding")
		);
	},
	testModelSetAtCreation: function() {
		var	c  = new enyo.Control();
		var m  = new enyo.Model({prop1: "0"});
		var mc = new enyo.ModelController({model: m});
		var b  = new enyo.Binding({source: mc, from: ".prop1", target: c, to: ".content"});
		mc.set("prop1", "1");
		b.destroy();
		this.finish(
			(mc.get("prop1") != "1" && "could not retrieve the correct value from the model") ||
			(c.get("content") != "1" && "control's content did not propagate from binding")
		);
	},
	testTwoWayBinding: function () {
		var mc = new enyo.ModelController(),
			c  = new enyo.Control(),
			b  = new enyo.Binding({source: mc, from: ".prop1", target: c, to: ".content", oneWay: false}),
			m  = new enyo.Model({prop1: "1"});
		mc.set("model", m);
		c.set("content", "2");
		b.destroy();
		this.finish(
			(c.get("content") != "2" && "content value was overridden by controller's") ||
			(mc.get("prop1") != "2" && "controller was unable to proxy correct value") ||
			(m.get("prop1") != "2" && "model did not have correct value")
		);
	},
	testObservers: function () {
		var mc = new enyo.ModelController(),
			m  = new enyo.Model({prop1: "1"}),
			f  = null,
			g  = null;
		mc.addObserver("prop1", function () { f = this.get("prop1"); g = this.getLocal("prop1"); });
		// should be pointing out the necessity of having practical observers
		// as it is possible to have collision if naming isn't unique
		mc.set("model", m);
		mc.set("prop1", "2");
		mc.setLocal("prop1", "3");
		this.finish(
			(mc.get("prop1") != "2" && "model value was not correctly set -> `" + m.get("prop1") + "` vs `" + mc.get("prop1") + "` vs `" + f + "`") ||
			(mc.getLocal("prop1") != "3" && "controller's local value was not set correctly") ||
			(g != "3" && "local property change did not fire observer as expected, got `" + f + "` instead of `" + mc.getLocal("prop1") + "`")
		);
	},
	testLocalComputed: function () {
		var mc = new enyo.ModelController(),
			m  = new enyo.Model({prop1: "1"}),
			c  = new enyo.Control(),
			b  = new enyo.Binding({source: mc, from: ".prop1Computed", target: c, to: ".content"});
		mc.prop1Computed = function () { return this.get("prop1") + "+2"; };
		mc.computed = {prop1Computed: ["prop1"]};
		mc.computedMap = {prop1: ["prop1Computed"]};
		mc.set("model", m);
		mc.set("prop1", "2");
		b.destroy();
		this.finish(c.get("content") != "2+2" && "computed property did not update as expected, got `" + c.get("content") + "` instead of `2+2`");
	},
	testModelComputed: function () {
		var mc = new enyo.ModelController(),
			m  = new enyo.Model({prop1: function () { return 2+3; }, prop2: function () { return 3+4; }, prop3: false}, {computed: {prop1: ["prop3"]}}),
			c1 = new enyo.Control(),
			c2 = new enyo.Control(),
			b1 = new enyo.Binding({source: mc, from: ".prop1", target: c1, to: ".content"}),
			b2 = new enyo.Binding({source: mc, from: ".prop2", target: c2, to: ".content"});
		mc.set("model", m);
		mc.prop2 = function () { return 4+5; };
		mc.computed = {prop2: ["prop1"]};
		mc.computedMap = {prop1: ["prop2"]};
		mc.set("prop3", true);
		b1.destroy();
		b2.destroy();
		this.finish(
			(m.get("prop1") != 5 && "model computed property not retrieved correctly") ||
			(mc.get("prop1") != 5 && "controller did not retrieve prop1 correctly got `" + mc.get("prop1") + "` instead of `5`") ||
			(mc.get("prop2") != 9 && "controller did not retrieve the correct computed property") ||
			(mc.get("prop3") !== true && "controller could not retrieve the modifed value of prop3 as expected")
		);
	},
	testSyncOnModelAddition: function () {
		var mc = new enyo.ModelController(),
			c  = new enyo.Control({controller: mc, bindings: [{from: ".controller.prop1", to: ".prop1"}, {from: ".controller.prop2", to: ".prop2"}]}),
			m1 = new enyo.Model({prop1: "1", prop2: "2"}),
			m2 = new enyo.Model({prop1: "2", prop2: "3"});
		mc.set("model", m1);
		this.finish(
			((c.prop1 != "1" || c.prop2 != "2") && "values were not initialized properly on model addition to controller") ||
			((mc.set("model", m2)) && (c.prop1 != "2" || c.prop2 != "3") && "values did not re-initialize on second model addition")
		);
	},
	testSyncOnModelRemoved: function () {
		var mc = new enyo.ModelController(),
			c  = new enyo.Control({controller: mc, bindings: [{from: ".controller.prop1", to: ".prop1"}]}),
			m  = new enyo.Model({prop1: "1"}), p;
		mc.set("model", m);
		p = c.prop1;
		mc.set("model", null);
		this.finish(
			(p != "1" && "the previous value was somehow incorrect meaning the binding didn't fire to begin with") ||
			(c.prop1 !== null && "clearing the model on the controller did not sync the binding to null as expected")
		);
	}
});
