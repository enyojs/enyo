/*jslint white: true*/
var
    kind = require('../kind'),
    utils = require('../utils'),
    animation = require('./Core'),
    Slideable = require('enyo/AnimationSupport/Slideable');

/**
 * Interface to achieve Parallax animation
 *
 * @module enyo/AnimationSupport/Parallax
 * @public
 */
module.exports = {

    /**
     * @private
     */
    name: 'Parallax',

    /**
     * @private
     */
    animate: true,

    /**
     * @public
     * 
     */
    rendered: kind.inherit(function(sup) {
        return function() {
            sup.apply(this, arguments);
            this.doParallax(this);
        };
    }),

    /**
     * @public
     * 
     */
    commonTasks: function(delta, deltax, deltay) {
        var children = this.children;
        for (var i = 0; i < children.length; i++) {
            var speed = children[i].speed;
            children[i].slide.call(children[i], (-1 * deltax) / speed, (-1 * deltay) / speed, 0);
            children[i].start(true);
        }
    },

    /**
     * @public
     * 
     */
    doParallax: function(container, deltax, deltay) {
        var container = this.children;
        for (var i = 0; i < this.children.length; i++) {
            var currentElement = this.children[i];
            utils.mixin(currentElement, Slideable);
            animation.trigger(currentElement);
        }
    }

};
