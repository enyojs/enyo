enyo.kind({
	name: "enyo.sample.AnimatorSample",
	components: [
		{content: "Smooth Animation:", name: "deferText", showing: false},
		{content: "Choppy Animation:", name: "nondeferText"},
		{name: "dot", style: "width: 10px; height: 10px; background-color: red;"},
		{kind: "Animator", duration: 3000, startValue: 0, endValue: 10000, onStep: "stepAnimation", onEnd: "animationEnded", easingFunction: enyo.easing.linear }
	],
	stepAnimation: function(inSender, inEvent) {
		var v = inSender.value/100;
		this.$.dot.applyStyle("width", v + "%");
	},
	/* an expensive operation: */
	expensive: function(){
		localStorage.test = 1E4;
		while(localStorage.test--){}
	},
	animationEnded: function(){
		this.doAnimation();
	},
	rendered: function(){
		this.inherited(arguments);
		this.doAnimation();
	},
	defer: false,
	doAnimation: function(){
		setTimeout(enyo.bind(this, function(){
			if(this.defer){
				this.startJob("expensive", "expensive", 1000, 1);
			} else {
				this.startJob("expensive", "expensive", 1000);
			}
			this.$.deferText.setShowing(this.defer);
			this.$.nondeferText.setShowing(!this.defer);
			this.$.animator.play();
			this.defer = !this.defer;
		}), 500);
	}
});
