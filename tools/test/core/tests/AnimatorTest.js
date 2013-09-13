enyo.kind({
	name: "AnimatorTest",
	kind: enyo.TestSuite,
	noDefer: true,
	testDeferLowPriorityTasks: function() {
		var finish = this.bindSafely("finish");
		var animation = new enyo.Animator({duration: 70});
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
		}, 90);
	}
});
