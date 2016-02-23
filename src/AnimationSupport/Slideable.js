var
    kind = require('../kind'),
    animation = require('./Core');

/**
 * Interface to achieve slide animation
 *
 * @module enyo/AnimationSupport/Slideable
 * @public
 */
module.exports = {

    /**
     * @private
     */
    name: 'Slideable',

    /**
     * To start animation
     */
    animate: true,

    /**
     * @public
     * slide animation in left direction
     * @parameter: slideDistance - distance in pixels to slide in left direction
     */
    left: function(slideDistance) {
        this.slide((-1 * slideDistance), 0, 0);
    },

    /**
     * @public
     * slide animation in right direction
     * @parameter: slideDistance - distance in pixels to slide in right direction
     */
    right: function(slideDistance) {
        this.slide(slideDistance, 0, 0);
    },

    /**
     * @public
     * slide animation upward
     * @parameter: slideDistance - distance in pixels to slide upward
     */
    up: function(slideDistance) {
        this.slide(0, (-1 * slideDistance), 0);
    },

    /**
     * @public
     * slide animation downward
     * @parameter: slideDistance - distance in pixels to slide downward
     */
    down: function(slideDistance) {
        this.slide(0, slideDistance, 0);
    },

    /**
     * @public
     * slide animation in custom direction
     * @parameter: x - css property to slide in x-axis direction
     * @parameter: y - css property to slide in y-axis direction
     * @parameter: z - css property to slide in z-axis direction
     */
    slide: function(x, y, z) {
        x = x || 0;
        y = y || 0;
        z = z || 0;
        switch (this.direction) {
            case "horizontal":
                this.addAnimation({
                    translate: x + "," + 0 + "," + 0
                });
                break;
            case "vertical":
                this.addAnimation({
                    translate: 0 + "," + y + "," + 0
                });
                break;
            case "depth":
                this.addAnimation({
                    translate: 0 + "," + 0 + "," + x
                });
                break;
            case "depthForward":
                this.addAnimation({
                    translate: x + "," + 0 + "," + -0.009 * x
                });
                break;

            default:
                this.addAnimation({
                    translate: x + "," + y + "," + z
                });
        }
    }
};
