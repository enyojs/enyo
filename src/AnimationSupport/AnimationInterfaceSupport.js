require('enyo');

var
    kind = require('../kind'),
    animator = require('./Core'),
    frame = require('./Frame'),
    utils = require('../utils'),
    dispatcher = require('../dispatcher');

var extend = kind.statics.extend;

kind.concatenated.push('animation');

var AnimationInterfaceSupport = {

    /**
     * @private
     */
    patterns: [],

    /**
     * @private
     */
    checkX: 0,

    /**
     * @private
     */
    checkY: 0,

    /**
     * @private
     */
    deltaX: 0,

    /**
     * @private
     */
    deltaY: 0,

    /**
     * @private
     */
    translateX: 0,

    /**
     * @private
     */
    translateY: 0,

    /**
     * @private
     */
    scrollValue: 0,

    /**
     * @private
     */
    deltaValueX: 0,

    /**
     * @private
     */
    deltaValueY: 0,

    /**
     * @private
     */
    checkDragStartX: 0,

    /**
     * @private
     */
    checkDragStartY: 0,

    /**
     * @private
     */
    deltaDragValueX: 0,

    /**
     * @private
     */
    deltaDragValueY: 0,

    /**
     * @private
     */
    setAnimateOne: 0,

    /**
     * @private
     */
    setAnimateTwo: 0,

    /**
     * @private
     */
    setAnimateThree: 0,

    /**
     * @private
     */
    eventArray: [
        "dragstart",
        "dragend",
        "drag",
        "flick",
        "down",
        "move",
        "scroll",
        "mousewheel",
        "touchstart",
        "touchmove",
        "touchend"
    ],

    /**
     * @public
     */
    initialize: function() {
        var i, eventArrayLength = this.eventArray.length;
        for (i = 0; i < eventArrayLength; i++) {
            dispatcher.listen(this.node, this.eventArray[i], this.bindSafely(this.detectTheEvent));
        }
    },

    /**
     * @public
     */
    detectTheEvent: function(inSender, inEvent) {
        var eventType = inSender.type;
        switch (eventType) {
            case "dragstart":
                this.touchDragStart(inSender, inEvent, inSender.pageX, inSender.pageY);
                break;
            case "drag":
                this.touchDragMove(inSender, inEvent, inSender.pageX, inSender.pageY);
                break;
            case "dragend":
                this.touchDragEnd(inSender, inEvent);
                break;
            case "flick":
                this.handleMyEvent(inSender, inEvent);
                break;
            case "down":
                this.handleMyEvent(inSender, inEvent);
                break;
            case "move":
                this.handleMyEvent(inSender, inEvent);
                break;
            case "scroll":
                this.scrollEvent(inSender, inEvent);
                break;
            case "mousewheel":
                this.mousewheelEvent(inSender, inEvent);
                break;
            case "touchstart":
                this.touchDragStart(inSender, inEvent, inSender.targetTouches[0].pageX, inSender.targetTouches[0].pageY);
                break;
            case "touchmove":
                this.touchDragMove(inSender, inEvent, inSender.targetTouches[0].pageX, inSender.targetTouches[0].pageY);
                break;
            case "touchend":
                this.touchDragEnd(inSender, inEvent);
                break;
            default:
                this.handleMyEvent(inSender, inEvent);
        }
    },

    /**
     * @public
     */
    touchDragStart: function(inSender, inEvent, x, y) {
        this.checkX = x;
        this.checkY = y;
    },

    /**
     * @public
     */
    touchDragMove: function(inSender, inEvent, x, y) {
        var currentX = x,
            currentY = y;

        if (currentX != 0 || currentY != 0) {
            this.deltaValueX = this.checkX - currentX;

            this.checkX = currentX; // set the initial position to the current position while moving 

            this.deltaValueY = this.checkY - currentY;

            this.checkY = currentY; // set the initial position to the current position while moving 

            //call commonTasks function with delta values
            this.translateX = this.translateX + this.deltaValueX;
            this.translateY = this.translateY + this.deltaValueY;

            this.setAnimateOne = this.translateX;
            this.setAnimateTwo = this.translateX;
            this.setAnimateThree = this.translateY;

        }

    },

    /**
     * @public
     */
    touchDragEnd: function(inSender, inEvent, x, y) {
        this.checkX = 0;
        this.checkY = 0;
        this.deltaValueX = 0;
        this.deltaValueY = 0;
    },

    /**
     * @public
     */
    scrollEvent: function(inSender, inEvent) {
        var delta = inSender.deltaY,
            scrollTop = inSender.target.scrollTop,
            scrollLeft = inSender.target.scrollLeft;

        if (this.scrollValue === 0) {
            this.scrollValue = inSender.target.scrollTop;
        }

        delta = inSender.target.scrollTop - this.scrollValue;

        this.deltaX = scrollLeft - this.deltaX;
        this.deltaY = scrollTop - this.deltaY;
        this.scrollValue = scrollTop;

        this.translateX = this.translateX + this.deltaX;
        this.translateY = this.translateY + this.deltaY;

        //call commonTasks function with delta values
        this.setAnimateOne = delta;
        this.setAnimateTwo = this.translateX;
        this.setAnimateThree = this.translateY;


        this.deltaX = scrollLeft;
        this.deltaY = scrollTop;
    },

    /**
     * @public
     */
    mousewheelEvent: function(inSender, inEvent) {
        var delta = inSender.deltaY,
            deltaX = inSender.wheelDeltaX,
            deltaY = inSender.wheelDeltaY;

        this.translateX = this.translateX + deltaX;
        this.translateY = this.translateY + deltaY;

        //call commonTasks function with delta values
        this.setAnimateOne = delta;
        this.setAnimateTwo = (-1 * (this.translateX));
        this.setAnimateThree = (-1 * (this.translateY));
        if (patterns[0].name === "Slideable") {
            this.setAnimateTwo = this.setAnimateThree;
        }


    },

    /**
     * @public
     */
    commonTasks: function(delta, deltax, deltay) {
        var patternsLength = patterns.length;
        if (delta !== 0) {
            delta = delta / Math.abs(delta);
        }
        //Call specific interface
        for (var i = 0; i < patternsLength; i++) {
            if (patterns[i].name === "Fadeable") {
                patterns[i].fadeByDelta.call(this, delta);
            } else if (patterns[i].name === "Flippable") {
                patterns[i].doFlip.call(this, delta);
            } else if (patterns[i].name === "Slideable") {
                if (this.parallax === true) {
                    for (var j = 0; j < this.children.length; j++) {
                        var current = this.children[j];
                        animator.trigger(current);
                        patterns[i].slide.call(current, (-1 * deltax / current.speed), (-1 * deltay / current.speed), 0);
                        current.start(true);
                    }
                } else {
                    patterns[i].slide.call(this, (-1 * deltax), (-1 * deltay), 0);
                }
            }
            if (patterns[i].name !== "Slideable") {
                this.setAnimateOne = 0;
                this.setAnimateTwo = 0;
                this.setAnimateThree = 0;
            }
        }
        this.start(true);
    },

    /**
     * @public
     */
    handleMyEvent: function(inSender, inEvent) {
        /*TODO:*/
    },

    /**
     * @public
     */
    commitAnimation: function(x, y, z) {
        var i, len;

        if (patterns && Object.prototype.toString.call(patterns) === "[object Array]") {
            len = patterns.length;
            for (i = 0; i < len; i++) {
                if (typeof patterns[i].triggerEvent === 'function') {
                    //patterns[i].triggerEvent();

                }
                this.commonTasks(this.setAnimateOne, this.setAnimateTwo, this.setAnimateThree);

            }
        }
    },

    /**
     * @private
     */
    rendered: kind.inherit(function(sup) {
        return function() {
            sup.apply(this, arguments);
            this.initialize();
        };
    })
};

module.exports = AnimationInterfaceSupport;

/**
    Hijacking original behaviour as in other Enyo supports.
*/
var sup = kind.concatHandler;

/**
 * @private
 */
kind.concatHandler = function(ctor, props, instance) {
    sup.call(this, ctor, props, instance);
    var aPattern = props.pattern;
    if (aPattern && Object.prototype.toString.call(aPattern) === "[object Array]") {
        var proto = ctor.prototype || ctor;
        extend(AnimationInterfaceSupport, proto);

        patterns = aPattern;
        var len = patterns.length;
        for (var i = 0; i < len; i++) {
            extend(patterns[i], proto);
        }
        animator.register(proto);
    }
};
