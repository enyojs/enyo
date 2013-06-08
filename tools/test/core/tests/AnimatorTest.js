enyo.kind({
	name: "AnimatorTest",
	kind: enyo.TestSuite,
	testDeferLowPriorityTasks: function() {
		var low = false, high = false, normal = false;
		var finish = this.bindSafely("finish");
		var animation = new enyo.Animator();
		var c = new enyo.Component({
			executionOrder: [],
			executeHighPriorityJob: function() {
				this.executionOrder.push("high");
				high = true;
			},
			executeNormalPriorityJob: function() {
				this.executionOrder.push("normal");
				normal = true;
			},
			executeLowPriorityJob: function() {
				this.executionOrder.push("low");
				low = true;
			}
		});
		animation.play();

		c.startJob("LowPriorityJob", "executeLowPriorityJob", 1, 3);
		c.startJob("NormalPriorityJob", "executeNormalPriorityJob" , 1   );
		c.startJob("HighPriorityJob", "executeHighPriorityJob", 1, 8);

		setTimeout(function(){
			if(low){
				finish("low priority job execute despite being blocked by animation");
			}
			if(!normal){
				finish("normal priority job did not execute despite overriding priority");
			}
			if(!high){
				finish("high priority job did not execute despite overriding priority");
			}
		}, 50);

		setTimeout(function(){
			if(!low){
				finish("low priority job did not execute after animation has finished");
			} else {
				// check order of execution
				if( JSON.stringify(c.executionOrder) !== '["normal","high","low"]' ){
					finish("jobs did not execute in the correct order");
				}

				finish();
			}
		}, 500);
	}
});
