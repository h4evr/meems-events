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
     * @constructor module:meems-events#DomEvents
     */
    var DomEvents = (function () {
        var hasAddEventListener = 'addEventListener' in window;
        var hasAttachEvent = 'attachEvent' in window;

        function addfn1(el, event, fn) {
            el.addEventListener(event, fn, false);
        }

        function addfn2(el, event, fn) {
            el.attachEvent('on' + event, fn);
        }

        function addfn3(el, event, fn) {
            el['on' + event] = fn;
        }

        function rmfn1(el, event, fn) {
            el.removeEventListener(event, fn, false);
        }

        function rmfn2(el, event, fn) {
            el.detachEvent('on' + event, fn);
        }

        function rmfn3(el, event, fn) {
            el['on' + event] = null;
        }

        return {
            /**
             * Add an event listener to a DOM element.
             * @function module:meems-events#DomEvents.on
             * @param {DOMElement} el The element to add the listener to.
             * @param {String} event The event name.
             * @param {Function} fn The callback function for when the event occurs.
             */
            on: hasAddEventListener ? addfn1 : (hasAttachEvent ? addfn2 : addfn3),

            /**
             * Remove an event listener from a DOM element.
             * @function module:meems-events#DomEvents.off
             * @param {DOMElement} el The element to remove the listener from.
             * @param {String} event The event name.
             * @param {Function} fn The callback function that was previously added.
             */
            off: hasAddEventListener ? rmfn1 : (hasAttachEvent ? rmfn2 : rmfn3)
        };
    }());

    /**
     * Class that enables an object to act as an event handler.
     * @constructor module:meems-events#Handler
     */
    function Handler() {
        this.$handlers = {};
        return this;
    }

    Handler.prototype = {
        /**
         * Listen for an event.
         * @function module:meems-events#Handler#on
         * @param {String} eventName The name of the event.
         * @param {module:meems-events#Handler~EventListener} fn The callback.
         * @returns {Handler} this
         */
        on : function (eventName, fn) {
            this._handlers[eventName] = this._handlers[eventName] || [];
            this._handlers[eventName].push(fn);
            return this;
        },

        /**
         * Stop listening for an event.
         * @function module:meems-events#Handler#off
         * @param {String} eventName The name of the event.
         * @param {module:meems-events#Handler~EventListener} fn The callback.
         * @returns {Handler} this
         */
        off : function (eventName, fn)  {
            if (this._handlers[eventName] !== undefined) {
                this._handlers[eventName] = this._handlers[eventName].filter(function (element) {
                    return element !== fn;
                });
            }
            return this;
        },

        /**
         * Fire an event name, triggering all listeners.
         * @function module:meems-events#Handler#fire
         * @param {String} eventName The name of the event to trigger.
         * @param {...Mixed} args All extra parameters will be passed to the listeners.
         * @returns {Handler} this
         */
        fire : function (eventName, args) {
            var handlers = this.$handlers[eventName] || [];
            
            for (var i = 0; i < handlers.length; ++i) {
                handlers[i].apply(this, arguments);
            }
            
            return this;
        }
    };

    /**
     * @callback module:meems-events#Handler~EventListener
     * @param {String} eventName The name of the event to trigger.
     * @param {...Mixed} args Extra parameters passed to the {@link module:meems-events#Handler#fire} method.
     */

    var Events = {
        Dom: DomEvents,
        Handler: Handler,
        /** Event name for when the user starts to press the screen. */
        touchStartEventName : touchStartEventName,
        /** Event name for when the user releases a press on the screen. */
        touchEndEventName : touchEndEventName,
        /** Event name for when the user moves the finger/cursor on the screen. */
        touchMoveEventName : touchMoveEventName,
        /**
         * Transforms an MouseMouve or TouchMouve event into an object
         * with x and y coordinates of the first touch.
         * @param {*} e The event object
         * @returns {Object} Object with the x and y coordinates.
         */
        getCursorPosition : getCursorPosition
    };
    
    return Events;
});