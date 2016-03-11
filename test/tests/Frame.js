var expect = chai.expect;
var elem = document.getElementById("elem");
elem.style.webkitTransform = "matrix3d(1.02496,-0.001491,0,0.001489,0.175375,0.283378,0,-0.002232,0,0,1,0,-8,67,0,1)";
describe("Vector", function() {

    describe("recomposeMatrix", function() {
        it("should combine rotate translate skew perspective and scale matrix to return final matrix", function() {
           var a = [1,2,3,3];
           var b = [1,3,3,3];
           var c = [4,5,6,7];
           var d = [5,-2,4,5];
            expect(frame.recomposeMatrix(a,b,c,d,a).toString()).to.equal([-140,-60,144,0,-604,-395,792,0,616,-140,-114,0,1,2,3,1].toString());
        });
    });

    describe("getStyleValues", function() {
        it("should return queried style property from dom style", function() {
            expect(frame.getStyleValue(elem.style,"opacity")).to.equal(0);
        });
    });

     describe("getMatrix", function() {
        it("should return current transform matrix from dom", function() {
          var initial = {opacity:0}; var finalProp = {opacity:1};
          var transform = [1.02496,-0.001491,0,0.001489,0.175375,0.283378,0,-0.002232,0,0,1,0,-8,67,0,1];
            expect(frame.getMatrix(elem.style,"transform").toString()).to.equal(transform.toString());
        });
    });
  describe("setTransformProperty", function() {
        it("should set given matrix directly to dom", function() {
         var prop = "matrix3d(-140, -60, 144, 0, -604, -395, 792, 0, 616, -140, -114, 0, 1, 2, 3, 1)";
         var mat =[-140, -60, 144, 0, -604, -395, 792, 0, 616, -140, -114, 0, 1, 2, 3, 1]; 
         frame.setTransformProperty(elem,mat);
         expect(elem.style.transform).to.equal(prop);
        });
});

  describe("setProperty", function() {
        it("should set given css property directly to dom", function() {
       frame.setProperty(elem,"top",[20]);
         expect(elem.style.top).to.equal("20px");
        });
});

   describe("decomposeMatrix", function() {
     var mat = [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, -408, 0, 1];
     var ret = {};
     frame.decomposeMatrix(mat,ret);
     it("should extract matrix corresponding to perspective", function() {
        expect(ret.perspective.toString()).to.equal([0,0,0,0].toString());
      });
     it("should extract matrix corresponding to translate", function() {
      expect(ret.translate.toString()).to.equal([0,-408,0].toString());
      });
      it("should extract matrix corresponding to scale", function() {
      expect(ret.scale.toString()).to.equal([1,1,1].toString());
      });
       it("should extract matrix corresponding to rotate", function() {
      expect(ret.rotate.toString()).to.equal([0,0,0,1].toString());
      });
       it("should extract matrix corresponding to skew", function() {
      expect(ret.skew.toString()).to.equal([0,0,0].toString());
      });
}); 

   describe("accelerate", function() {
        it("should set given matrix value directly to dom", function() {
          var mat = [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, -408, 0, 1];
          frame.accelerate(elem,mat);
         expect(elem.style.transform).to.equal("matrix3d(1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, -408, 0, 1)");
        });
});

   describe("parseMatrix", function() {
        it("should set given matrix value directly to dom", function() {
          var mat = "1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, -408, 0, 1";
         expect(frame.parseMatrix(mat).toString()).to.equal([1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, -408, 0, 1].toString());
        });
});
    describe("getComputedProperty", function() {
        it("should set endAnim object properties as final state of animation", function() {
          var prop = {opacity:1,width:"10px"};
          console.log(frame.getComputedProperty(elem,prop));
         expect(frame.getComputedProperty(elem,prop)._endAnim.opacity.toString()).to.equal("1");
         expect(frame.getComputedProperty(elem,prop)._endAnim.width.toString()).to.equal("10");
        });
});

});
