describe('Utilities', function () {
	
	// tests for the enyo.mixin functionality
	describe('enyo.mixin', function () {
		
		var src1 = {key1: 'value1', key2: 'value2'},
			src2 = {key3: 'value3', key4: 'value4'};
		
		it ('should copy the keys of a single object as the second parameter to the first',
			function () {
			
			var ret = {};
			
			enyo.mixin(ret, src1);
			
			// ret should be the exact same as teh src1 object but not be the same reference
			expect(ret).to.deep.equal(src1);
			expect(ret).to.not.equal(src1);
		});
		
		it ('should create a new object if first parameter is null or undefined', function () {
			var ret = enyo.mixin(null, src1);
			
			// ret should be the exact same as the src1 object but not be the same reference
			expect(ret).to.deep.equal(src1);
			expect(ret).to.not.equal(src1);
		});
		
		it ('should copy the keys of all objects in an array as the second parameter to the first',
			function () {
			
			var ret = enyo.mixin({}, [src1, src2]);
			
			expect(ret).to.have.property('key1', 'value1');
			expect(ret).to.have.property('key2', 'value2');
			expect(ret).to.have.property('key3', 'value3');
			expect(ret).to.have.property('key4', 'value4');
		});
		
		it ('should copy the keys of all objects in an array as the first parameter to a new ' +
			'object', function () {
		
			var ret = enyo.mixin([src1, src2]);
	
			expect(ret).to.have.property('key1', 'value1');
			expect(ret).to.have.property('key2', 'value2');
			expect(ret).to.have.property('key3', 'value3');
			expect(ret).to.have.property('key4', 'value4');
		});
		
		it ('should not copy keys that are already set on the return object when the ignore ' +
			'option flag is set', function () {
			
			var ret = enyo.mixin([src1, src2, {key1: 'WRONG VALUE'}], {ignore: true});
			
			expect(ret).to.have.property('key1', 'value1');
			expect(ret).to.have.property('key2', 'value2');
			expect(ret).to.have.property('key3', 'value3');
			expect(ret).to.have.property('key4', 'value4');
		});
		
		it ('should not copy undefined keys from source objects if the exists option flag is set',
			function () {
			
			var ret = enyo.mixin([src1, src2, {key5: undefined}], {exists: true});
		
			expect(ret).to.have.property('key1', 'value1');
			expect(ret).to.have.property('key2', 'value2');
			expect(ret).to.have.property('key3', 'value3');
			expect(ret).to.have.property('key4', 'value4');
			expect(ret).to.not.have.property('key5');
		});
		
		it ('should use the function passed in as the filter option to determine if a key and ' +
			'value should be copied to the return object when it exists', function () {
			
			var ret = {},
				fn;
			
			// should only return keys of the form `keyN` where N is greater or equal to 3
			fn = function (key, value) {
				return Number(key.charAt(3)) >= 3;
			};
			
			enyo.mixin(ret, [src1, src2, {key5: 'value5'}], {filter: fn});
			
			expect(ret).to.have.property('key3', 'value3');
			expect(ret).to.have.property('key4', 'value4');
			expect(ret).to.have.property('key5', 'value5');
		});
		
	});
	
});