describe('ProgressiveFilter', function () {
	
	describe('properties', function () {
		
	});
	
	describe('usage', function () {
		
		describe('basic', function () {
		
			var filter;
		
			before(function () {
				enyo.kind({
					name: 'TestProgressiveFilter',
					kind: 'enyo.ProgressiveFilter',
					filterMethod: function (model) {
						var regex = /^[Aa]/;
					
						return regex.test(model.get('name'));
					}
				});
			
				filter = new TestProgressiveFilter();
			});
		
			after(function () {
				TestProgressiveFilter = null;
			
				filter.destroy();
			});
			
		});
		
	});
	
});