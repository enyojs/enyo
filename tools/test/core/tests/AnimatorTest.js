enyo.kind({
	name: "AnimatorTest",
	kind: enyo.TestSuite,
	noDefer: true,
	testDeferLowPriorityTasks: function() {
		var finish = this.bindSafely("finish");
		this.checkJobs = function(inSender, inEvent) {
			setTimeout(function(){
				if(!c.low){
					finish("low priority job did not execute after animation has finished");
				} else {
					// check order of execution
					if( JSON.stringify(c.executionOrder) !== '["normal","high","low"]' ){
						finish("jobs did not execute in the correct order");
					}

					finish();
				}
			}, 10);
			return true;
		};
		var animation = this.createComponent({kind: "enyo.Animator", duration: 70, onEnd: "checkJobs"});
		var c = new enyo.Component({
			executionOrder: [],
			executeHighPriorityJob: function() {
				this.executionOrder.push("high");
				this.high = true;
			},
			executeNormalPriorityJob: function() {
				this.executionOrder.push("normal");
				this.normal = true;
			},
			executeLowPriorityJob: function() {
				this.executionOrder.push("low");
				this.low = true;
			}
		});
		animation.play();

		c.startJob("LowPriorityJob", "executeLowPriorityJob", 1, 3); // gets deferred
		c.startJob("NormalPriorityJob", "executeNormalPriorityJob", 1); // is invoked immediately
		c.startJob("HighPriorityJob", "executeHighPriorityJob", 1, 8); // is invoked immediately

		setTimeout(function(){
			if(c.low){
				finish("low priority job execute despite being blocked by animation");
			}
			if(!c.normal){
				finish("normal priority job did not execute despite overriding priority");
			}
			if(!c.high){
				finish("high priority job did not execute despite overriding priority");
			}
		}, 10);
	}
});

//~ Test issue described in https://github.com/enyojs/enyo/commit/d76bca80195adedca4de61f197d7b452efe78b8c#commitcomment-4082791
//~ and fixed in https://github.com/enyojs/enyo/pull/449
enyo.kind({
	name: "AnimatorStartupTest",
	kind: enyo.TestSuite,
	noDefer: true,
	create: function(){
		this.inherited(arguments);

		this.animation = new enyo.Animator({duration: 50});
		this.animation.play();
		this.c = new enyo.Component({
			counter: 0,
			executeStartUpJob: function(){
				this.counter++;
			}
		});
		this.c.startJob("startupjob", "executeStartUpJob", 1, 1);
	},
	testStartUpjobs: function() {
		this.animation.onEnd = this.bindSafely("animationFinished");
	},
	animationFinished: function(){
		this.finish(this.c.counter ? "" : "Job didn't run even though the animation finished");
	}
});
