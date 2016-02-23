describe('Testing Tween Module', function () {
	var undefined = void 0;

	describe('Bezier Point Calculation - getBezier() function', function (){
		describe('Random values', function (){
			var result;
			it('should be equal to the expect result', function() {
				result = [0.00390625, 0.03125, 0.109375, 0.21875, 0.2734375, 0.21875, 0.109375, 0.03125, 0.00390625];
				expect(Tween.getBezierValues(0.5, 8)).to.deep.equal(result);
			});
			it('should be equal to the expect result', function() {
				result = [0.24009999999999992, 0.4115999999999999, 0.26459999999999995, 0.0756, 0.0081];
				expect(Tween.getBezierValues(0.3, 4)).to.deep.equal(result);
			});
		});

		describe('Boundary values', function (){
			it('should be equal to [1,0,0,0] when the value of t is zero', function() {
				expect(Tween.getBezierValues(0, 3)).to.deep.equal([1,0,0,0]);
			});
			it('should be equal to [1] when the value of n is zero', function() {
				expect(Tween.getBezierValues(0.1, 0)).to.deep.equal([1]);
			});
			it('should be equal to [1] when the values of t and n are zero', function() {
				expect(Tween.getBezierValues(0, 0)).to.deep.equal([1]);
			});
			it('should be equal to undefined when the value of t is greater than 1', function() {
				expect(Tween.getBezierValues(2, 3)).to.equal(undefined);
			});
		});

		describe('Mismatching number of arguments', function (){
			it('should return undefined when number of arguments are only one', function() {
				expect(Tween.getBezierValues(0.7)).to.equal(undefined);
			});
			it('should return undefined when number of arguments are zero', function() {
				expect(Tween.getBezierValues()).to.equal(undefined);
			});
		});

		describe('Negative values', function (){
			it('should be equal to undefined when the value of t is less than zero', function() {
				expect(Tween.getBezierValues(-0.5, 3)).to.equal(undefined);
			});
			it('should be equal to undefined when the value of n is less than zero', function() {
				expect(Tween.getBezierValues(0.5, -3)).to.equal(undefined);
			});
			it('should be equal to undefined when the values of t and n are less than zero', function() {
				expect(Tween.getBezierValues(-0.5, -3)).to.equal(undefined);
			});
		});

		describe('Non number inputs', function (){
			var result = [0.02560000000000001, 0.15360000000000004, 0.3456000000000001, 0.3456, 0.1296];
			it('should return undefined when value of t is string and not parseable to float', function() {
				expect(Tween.getBezierValues("abc", 4)).to.equal(undefined);
			});
			it('should return undefined when value of n is string and not parseable to integer', function() {
				expect(Tween.getBezierValues(0.6, "xy")).to.equal(undefined);
			});
			it('should return undefined when values of t and n are string and not parseable to float and integer respectively', function() {
				expect(Tween.getBezierValues("abc", "xy")).to.equal(undefined);
			});
			it('should return expected result when value of t is string and parseable to float', function() {
				expect(Tween.getBezierValues("0.6", 4)).to.deep.equal(result);
			});
			it('should return expected result when value of k is string and parseable to integer', function() {
				expect(Tween.getBezierValues(0.6, "4")).to.deep.equal(result);
			});
			it('should return expected result when value of t is parseable to float and k is parseable to integer', function() {
				expect(Tween.getBezierValues("0.6", "4")).to.deep.equal(result);
			});
		});

		describe('Integer input for time (t)', function (){
			var result = [0, 0, 0, 0, 0, 1];
			it('should return bezier values by parsing the value of t as float when givan as integer', function() {
				expect(Tween.getBezierValues(1, 5)).to.deep.equal(result);
			});
			it('should return undefined if the value of t is greater than 1 after parsing as float', function() {
				expect(Tween.getBezierValues(3, 5)).to.equal(undefined);
			});			
			it('should return undefined if the value of t is less than 0 after parsing as float', function() {
				expect(Tween.getBezierValues(-1, 5)).to.equal(undefined);
			});
		});

		describe('Float input for order (n)', function (){
			var result = [0.0024300000000000016, 0.028350000000000014, 0.13230000000000006, 0.30870000000000003, 0.3601499999999999, 0.16806999999999994];
			it('should return bezier values by parsing the value of n as integer when givan as float', function() {
				expect(Tween.getBezierValues(0.7, 5.0)).to.deep.equal(result);
			});
			it('should return undefined if the value of n is less than 0 after parsing as integer', function() {
				expect(Tween.getBezierValues(0.1, -5.0)).to.equal(undefined);
			});
		});

		describe('False values', function (){
			it('should return undefined when value of t is undefined', function() {
				expect(Tween.getBezierValues(undefined, 6)).to.equal(undefined);
			});
			it('should return undefined when value of n is undefined', function() {
				expect(Tween.getBezierValues(0.4, undefined)).to.equal(undefined);
			});
			it('should return undefined when values of t and n are undefined', function() {
				expect(Tween.getBezierValues(undefined, undefined)).to.equal(undefined);
			});
			it('should return undefined when value of t is null', function() {
				expect(Tween.getBezierValues(null, 6)).to.equal(undefined);
			});
			it('should return undefined when value of n is null', function() {
				expect(Tween.getBezierValues(0.4, null)).to.equal(undefined);
			});
			it('should return undefined when values of t and n are null', function() {
				expect(Tween.getBezierValues(null, null)).to.equal(undefined);
			});
			it('should return undefined when value of t is NaN', function() {
				expect(Tween.getBezierValues(null, 6)).to.equal(undefined);
			});
			it('should return undefined when value of n is NaN', function() {
				expect(Tween.getBezierValues(0.4, NaN)).to.equal(undefined);
			});
			it('should return undefined when values of t and n are NaN', function() {
				expect(Tween.getBezierValues(NaN, NaN)).to.equal(undefined);
			});
		});
	});

	describe('Bezier Values Calculation - getBezierValues() function', function (){
		describe('Random values', function (){
			var result;
			it('should be equal to the expect result', function() {
				result = [0.00390625, 0.03125, 0.109375, 0.21875, 0.2734375, 0.21875, 0.109375, 0.03125, 0.00390625];
				expect(Tween.getBezierValues(0.5, 8)).to.deep.equal(result);
			});
			it('should be equal to the expect result', function() {
				result = [0.24009999999999992, 0.4115999999999999, 0.26459999999999995, 0.0756, 0.0081];
				expect(Tween.getBezierValues(0.3, 4)).to.deep.equal(result);
			});
		});

		describe('Boundary values', function (){
			it('should be equal to [1,0,0,0] when the value of t is zero', function() {
				expect(Tween.getBezierValues(0, 3)).to.deep.equal([1,0,0,0]);
			});
			it('should be equal to [1] when the value of n is zero', function() {
				expect(Tween.getBezierValues(0.1, 0)).to.deep.equal([1]);
			});
			it('should be equal to [1] when the values of t and n are zero', function() {
				expect(Tween.getBezierValues(0, 0)).to.deep.equal([1]);
			});
			it('should be equal to undefined when the value of t is greater than 1', function() {
				expect(Tween.getBezierValues(2, 3)).to.equal(undefined);
			});
		});

		describe('Bezier values length', function (){
			it('should always be plus one of the value of n', function() {
				var n = 5,
					values = Tween.getBezierValues(1, 5);
				expect(values.length).to.equal(n+1);
			});
		});

		describe('Mismatching number of arguments', function (){
			it('should return undefined when number of arguments are only one', function() {
				expect(Tween.getBezierValues(0.7)).to.equal(undefined);
			});
			it('should return undefined when number of arguments are zero', function() {
				expect(Tween.getBezierValues()).to.equal(undefined);
			});
		});

		describe('Negative values', function (){
			it('should be equal to undefined when the value of t is less than zero', function() {
				expect(Tween.getBezierValues(-0.5, 3)).to.equal(undefined);
			});
			it('should be equal to undefined when the value of n is less than zero', function() {
				expect(Tween.getBezierValues(0.5, -3)).to.equal(undefined);
			});
			it('should be equal to undefined when the values of t and n are less than zero', function() {
				expect(Tween.getBezierValues(-0.5, -3)).to.equal(undefined);
			});
		});

		describe('Non number inputs', function (){
			var result = [0.02560000000000001, 0.15360000000000004, 0.3456000000000001, 0.3456, 0.1296];
			it('should return undefined when value of t is string and not parseable to float', function() {
				expect(Tween.getBezierValues("abc", 4)).to.equal(undefined);
			});
			it('should return undefined when value of n is string and not parseable to integer', function() {
				expect(Tween.getBezierValues(0.6, "xy")).to.equal(undefined);
			});
			it('should return undefined when values of t and n are string and not parseable to float and integer respectively', function() {
				expect(Tween.getBezierValues("abc", "xy")).to.equal(undefined);
			});
			it('should return expected result when value of t is string and parseable to float', function() {
				expect(Tween.getBezierValues("0.6", 4)).to.deep.equal(result);
			});
			it('should return expected result when value of k is string and parseable to integer', function() {
				expect(Tween.getBezierValues(0.6, "4")).to.deep.equal(result);
			});
			it('should return expected result when value of t is parseable to float and k is parseable to integer', function() {
				expect(Tween.getBezierValues("0.6", "4")).to.deep.equal(result);
			});
		});

		describe('Integer input for time (t)', function (){
			var result = [0, 0, 0, 0, 0, 1];
			it('should return bezier values by parsing the value of t as float when givan as integer', function() {
				expect(Tween.getBezierValues(1, 5)).to.deep.equal(result);
			});
			it('should return undefined if the value of t is greater than 1 after parsing as float', function() {
				expect(Tween.getBezierValues(3, 5)).to.equal(undefined);
			});			
			it('should return undefined if the value of t is less than 0 after parsing as float', function() {
				expect(Tween.getBezierValues(-1, 5)).to.equal(undefined);
			});
		});

		describe('Float input for order (n)', function (){
			var result = [0.0024300000000000016, 0.028350000000000014, 0.13230000000000006, 0.30870000000000003, 0.3601499999999999, 0.16806999999999994];
			it('should return bezier values by parsing the value of n as integer when givan as float', function() {
				expect(Tween.getBezierValues(0.7, 5.0)).to.deep.equal(result);
			});
			it('should return undefined if the value of n is less than 0 after parsing as integer', function() {
				expect(Tween.getBezierValues(0.1, -5.0)).to.equal(undefined);
			});
		});

		describe('False values', function (){
			it('should return undefined when value of t is undefined', function() {
				expect(Tween.getBezierValues(undefined, 6)).to.equal(undefined);
			});
			it('should return undefined when value of n is undefined', function() {
				expect(Tween.getBezierValues(0.4, undefined)).to.equal(undefined);
			});
			it('should return undefined when values of t and n are undefined', function() {
				expect(Tween.getBezierValues(undefined, undefined)).to.equal(undefined);
			});
			it('should return undefined when value of t is null', function() {
				expect(Tween.getBezierValues(null, 6)).to.equal(undefined);
			});
			it('should return undefined when value of n is null', function() {
				expect(Tween.getBezierValues(0.4, null)).to.equal(undefined);
			});
			it('should return undefined when values of t and n are null', function() {
				expect(Tween.getBezierValues(null, null)).to.equal(undefined);
			});
			it('should return undefined when value of t is NaN', function() {
				expect(Tween.getBezierValues(null, 6)).to.equal(undefined);
			});
			it('should return undefined when value of n is NaN', function() {
				expect(Tween.getBezierValues(0.4, NaN)).to.equal(undefined);
			});
			it('should return undefined when values of t and n are NaN', function() {
				expect(Tween.getBezierValues(NaN, NaN)).to.equal(undefined);
			});
		});
	});

	describe('Binomial Coefficient Calculation - getCoeff() function', function (){
		describe('Defined values', function (){
			it('should always be equal to 1 when k is 0', function() {
				var num = 1000;
				expect(Tween.getCoeff(num, 0)).to.equal(1);
			});
			it('should always be equal to the input number itself when k is 1', function() {
				var num = 1000;				
				expect(Tween.getCoeff(num, 1)).to.equal(num);
			});
			it('should always be equal to 1 when k is same as the input number', function() {
				var num = 1000;				
				expect(Tween.getCoeff(num, num)).to.equal(1);
			});
		});
		
		describe('Random values', function (){
			it('should be equal to 45 when n is 10 and k is 2', function() {
				expect(Tween.getCoeff(10, 2)).to.equal(45);
			});
			it('should be equal to 5152635520761925 when n is 350 and k is 8', function() {
				expect(Tween.getCoeff(350, 8)).to.equal(5152635520761925);
			});
		});

		describe('Boundary values', function (){
			it('should be equal to undefined when the value of k is greater than the value of n', function() {
				expect(Tween.getCoeff(2, 10)).to.equal(undefined);
			});
		});

		describe('Mismatching number of arguments', function (){
			it('should return undefined when number of arguments are only one', function() {
				expect(Tween.getCoeff(200)).to.equal(undefined);
			});
			it('should return undefined when number of arguments are zero', function() {
				expect(Tween.getCoeff()).to.equal(undefined);
			});
		});

		describe('Negative values', function (){
			it('should return undefined when value of n is less than zero', function() {
				expect(Tween.getCoeff(-125, 10)).to.equal(undefined);
			});
			it('should return undefined when value of k is less than zero', function() {
				expect(Tween.getCoeff(125, -10)).to.equal(undefined);
			});
			it('should return undefined when values of both n and k are less than zero', function() {
				expect(Tween.getCoeff(-125, -10)).to.equal(undefined);
			});
		});

		describe('Non number inputs', function (){
			it('should return undefined when value of n is string and not parseable to integer', function() {
				expect(Tween.getCoeff("abc", 10)).to.equal(undefined);
			});
			it('should return undefined when value of k is string and not parseable to integer', function() {
				expect(Tween.getCoeff(125, "xy")).to.equal(undefined);
			});
			it('should return undefined when values of n and k are string and not parseable to integer', function() {
				expect(Tween.getCoeff("abc", "xy")).to.equal(undefined);
			});
			it('should return expected result when value of n is string and parseable to integer', function() {
				expect(Tween.getCoeff("125", 10)).to.equal(177367091094050);
			});
			it('should return expected result when value of k is string and parseable to integer', function() {
				expect(Tween.getCoeff(125, "10")).to.equal(177367091094050);
			});
			it('should return expected result when values of n and k are string and are parseable to integer', function() {
				expect(Tween.getCoeff("125", "10")).to.equal(177367091094050);
			});
		});

		describe('Non integer inputs', function (){
			it('should return result as whole number by doing floor of the value of n when givan as float', function() {
				expect(Tween.getCoeff(125.2, 10)).to.equal(177367091094050);
			});
			it('should return result as whole number by doing floor of the value of k when givan as float', function() {
				expect(Tween.getCoeff(125, 10.8)).to.equal(177367091094050);
			});
			it('should return result as whole number by doing floor of the values of n and k when givan as float', function() {
				expect(Tween.getCoeff(125.2, 10.8)).to.equal(177367091094050);
			});
		});

		describe('False values', function (){
			it('should return undefined when value of n is undefined', function() {
				expect(Tween.getCoeff(undefined, 10)).to.equal(undefined);
			});
			it('should return undefined when value of k is undefined', function() {
				expect(Tween.getCoeff(125, undefined)).to.equal(undefined);
			});
			it('should return undefined when values of n and k are undefined', function() {
				expect(Tween.getCoeff(undefined, undefined)).to.equal(undefined);
			});
			it('should return undefined when value of n is null', function() {
				expect(Tween.getCoeff(null, 10)).to.equal(undefined);
			});
			it('should return undefined when value of k is null', function() {
				expect(Tween.getCoeff(125, null)).to.equal(undefined);
			});
			it('should return undefined when values of n and k are null', function() {
				expect(Tween.getCoeff(null, null)).to.equal(undefined);
			});
			it('should return undefined when value of n is NaN', function() {
				expect(Tween.getCoeff(null, 10)).to.equal(undefined);
			});
			it('should return undefined when value of k is NaN', function() {
				expect(Tween.getCoeff(125, NaN)).to.equal(undefined);
			});
			it('should return undefined when values of n and k are NaN', function() {
				expect(Tween.getCoeff(NaN, NaN)).to.equal(undefined);
			});
		});
	});
});
