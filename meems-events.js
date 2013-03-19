/*global define*/
/**
 * Module that provides methods and mixins related with event handling.
 * @module meems-events
 */
define(function () {
    "use strict";

    var touchStartEventName, touchEndEventName, touchMoveEventName,
        getCursorPosition;

    if ('ontouchstart' in window) {
        touchStartEventName = 'touchstart';
        touchMoveEventName = 'touchmove';
        touchEndEventName = 'touchend';
        getCursorPosition = function (e) {
            return {
                x : e.touches[0].pageX,
                y : e.touches[0].pageY
            };
        };
    } else {
        touchStartEventName = 'mousedown';
        touchMoveEventName = 'mousemove';
        touchEndEventName = 'mouseup';
        getCursorPosition = function (e) {
            return {
                x : e.pageX,
                y : e.pageY
            };
        };
    }

    /**
     * Provides functions to add and remove event listeners to the DOM.
     *
     * @class DomEvents
     * @private
     * @constructor
     */
    var DomEvents = (function () {
        var hasAddEventListener = 'addEventListener' in window;
        var hasAttachEvent = 'attachEvent' in window;

        function addfn1(el, event, fn) {
            el.addEventListener(event, fn, true);
        }

        function addfn2(el, event, fn) {
            el.attachEvent('on' + event, fn);
        }

        function addfn3(el, event, fn) {
            el['on' + event] = fn;
        }

        function rmfn1(el, event, fn) {
            el.removeEventListener(event, fn, true);
        }

        function rmfn2(el, event, fn) {
            el.detachEvent('on' + event, fn);
        }

        function rmfn3(el, event) {
            el['on' + event] = null;
        }

        return {
            /**
             * Add an event listener to a DOM element.
             * @method on
             * @param {HTMLElement} el The element to add the listener to.
             * @param {String} event The event name.
             * @param {Function} fn The callback function for when the event occurs.
             */
            on: hasAddEventListener ? addfn1 : (hasAttachEvent ? addfn2 : addfn3),

            /**
             * Remove an event listener from a DOM element.
             * @method off
             * @param {HTMLElement} el The element to remove the listener from.
             * @param {String} event The event name.
             * @param {Function} fn The callback function that was previously added.
             */
            off: hasAddEventListener ? rmfn1 : (hasAttachEvent ? rmfn2 : rmfn3),

            /**
             * Cancel an event and prevent the default handler.
             * @method cancelEvent
             * @param {Event} e Event to cancel.
             * @return {Boolean} You must also return this in the event handler.
             */
            cancelEvent: function (e) {
                if (e.preventDefault) {
                    e.preventDefault();
                }

                if (e.stopPropagation) {
                    e.stopPropagation();
                }

                e.cancelBubble = true;
                e.returnValue = false;

                return false;
            }
        };
    }());

    /**
     * Class that enables an object to act as an event handler.
     * @class Handler
     * @constructor
     */
    function Handler() {
        this.$handlers = {};
        return this;
    }

    Handler.prototype = {
        /**
         * Listen for an event.
         *
         * @method on
         * @param {String} eventName The name of the event.
         * @param {Function} fn The callback.
         * @param {String} fn.eventName The name of the event to trigger.
         * @param {...Mixed} fn.args Extra parameters passed to the fire method.
         * @chainable
         */
        on : function (eventName, fn) {
            this.$handlers[eventName] = this.$handlers[eventName] || [];
            this.$handlers[eventName].push(fn);
            return this;
        },

        /**
         * Stop listening for an event.
         *
         * @method off
         * @param {String} eventName The name of the event.
         * @param {Function} fn The callback.
         * @param {String} fn.eventName The name of the event to trigger.
         * @param {Mixed} [fn.args]* Extra parameters passed to the fire method.
         * @chainable
         */
        off : function (eventName, fn)  {
            if (this.$handlers[eventName] !== undefined) {
                this.$handlers[eventName] = this.$handlers[eventName].filter(function (element) {
                    return element !== fn;
                });
            }
            return this;
        },

        /**
         * Fire an event name, triggering all listeners.
         *
         * @method fire
         * @param {String} eventName The name of the event to trigger.
         * @param {...Mixed} args All extra parameters will be passed to the listeners.
         * @chainable
         */
        fire : function (eventName, args) {
            var handlers = this.$handlers[eventName] || [];
            
            for (var i = 0; i < handlers.length; ++i) {
                handlers[i].apply(this, arguments);
            }
            
            return this;
        }
    };

    var Events = {
        Dom: DomEvents,
        Handler: Handler,

        /**
         * @class Touch
         */
        Touch : {
            /**
             * Event name for when the user starts to press the screen.
             *
             * @property touchStartEventName
             * @static
             * @type String
             */
            touchStartEventName : touchStartEventName,
            /**
             * Event name for when the user releases a press on the screen.
             *
             * @property touchEndEventName
             * @static
             * @type String
             */
            touchEndEventName : touchEndEventName,
            /**
             * Event name for when the user moves the finger/cursor on the screen.

             * @property touchMoveEventName
             * @static
             * @type String
             */
            touchMoveEventName : touchMoveEventName,
            /**
             * Transforms an MouseMouve or TouchMouve event into an object
             * with x and y coordinates of the first touch.
             * @method getCursorPosition
             * @static
             * @param {*} e The event object
             * @return {Object} Object with the x and y coordinates.
             */
            getCursorPosition : getCursorPosition
        }
    };
    
    return Events;
});