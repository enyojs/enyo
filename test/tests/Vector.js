var expect = chai.expect;
var trialactor1 = "actorOne";
var trialactor2 = "actorTwo";

describe("Vector", function() {

    describe("Add", function() {
        it("should add two arrays of equal size and size greater than 3 and return sum of two in a array.", function() {
           var a = [1,2,3,3];
           var b = [1,2,3,3];
            expect(Vector.add(a,b).toString()).to.equal([2,4,6,6].toString());
        });
         it("if both arrays having size greater than 3 but not equal in size should add and return array till their indexes match.", function() {
           var a = [1,2,3,3,4];
           var b = [1,2,3,3];
            expect(Vector.add(a,b).toString()).to.equal([2,4,6,6].toString());
        });
         it("if both arrays having size greater than 3 but not equal in size should add and return array till their indexes match.", function() {
           var a = [1,2,3,3,4];
           var b = [1,2,3];
            expect(Vector.add(a,b).toString()).to.equal([2,4,6].toString());
        });
    });

    describe("Subtract", function() {
        it("should add two arrays of equal size and size greater than 3 and return sum of two in a array.", function() {
           var a = [1,2,3,3];
           var b = [1,2,3,3];
            expect(Vector.subtract(a,b).toString()).to.equal([0,0,0,0].toString());
        });
         it("if both arrays having size greater than 3 but not equal in size should add and return array till their indexes match.", function() {
           var a = [1,2,3,3,4];
           var b = [1,2,3,3];
            expect(Vector.subtract(a,b).toString()).to.equal([0,0,0,0].toString());
        });
         it("if both arrays having size greater than 3 but not equal in size should add and return array till their indexes match.", function() {
           var a = [1,2,3,3,4];
           var b = [1,2,3];
            expect(Vector.subtract(a,b).toString()).to.equal([0,0,0].toString());
        });
    });

    describe("Divide", function() {
         it("if array size greater than 3 function should divide first three values", function() {
           var a = [6,2,8,4];
           var b = 2;
            expect(Vector.divide(a,b).toString()).to.equal([3,1,4].toString());
        });
        it("should divide the array with second parameter and return result vector", function() {
           var a = [6,2,8];
           var b = 2;
            expect(Vector.divide(a,b).toString()).to.equal([3,1,4].toString());
        });

     });

    describe("Multiply", function() {
         it("should multiply all values in array with second parameter", function() {
           var a = [1,2,3];
           var b = 2;
            expect(Vector.multiply(a,b).toString()).to.equal([2,4,6].toString());
        });
    });

    describe("EqualS", function() {
         it("should compare each values of array to given value", function() {
           var a = [1,2,3];
           var b = 2;
            expect(Vector.equalS(a,b)).to.equal(false);
        });
    });
    describe("GreaterS", function() {
         it("should compare each values of array to given value and checks whether it is greate than a given value or not", function() {
           var a = [1,2,3];
           var b = 2;
            expect(Vector.greaterS(a,b)).to.equal(false);
        });
    });
    describe("distance", function() {
         it("should calculate absolute distance between two vector given in form of array", function() {
           var a = [1,2,3];
           var b = [2,3,6];
            expect(Math.round(Vector.distance(a,b))).to.equal(Math.round(Math.sqrt(11)));
        });
    });

     describe("Direction", function() {
         it("should return true when all values in second parameter is greater than all values present in first array", function() {
           var a = [1,2,3];
           var b = [2,3,6];
            expect(Vector.direction(a,b)).to.equal(true);
        });
    });
      describe("QuantDot", function() {
         it("should return dot product of two 3D vectors", function() {
           var a = [1,2,3,4];
           var b = [2,3,6,5];
            expect(Vector.quantDot(a,b)).to.equal(46);
        });
    });
       describe("QuantCross", function() {
         it("should return Cross product of two 3D vectors as array", function() {
           var a = [1,2,3,4];
           var b = [2,3,6,5];
            expect(Vector.quantCross(a,b).toString()).to.equal([ 16, 22, 38, -6 ].toString());
        });
    });
       describe("ToQuant", function() {
         it("should Convert a rotation vector to a quaternion vector.", function() {
           var a = [1,2,3,4];
           var b = [2,3,6,5];
            expect(Vector.toQuant().toString()).to.equal([0,0,0,1].toString());
        });
    });
});


