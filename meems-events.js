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

    var $domEvents = {};
    var $elToCallbacks = {};
    var $takenOver = null;

    /**
     * Generic handler for all DOM events.
     *
     * @method onDomEvent
     * @private
     * @param {String} eventName The name of the event.
     * @param {Event} e The event object.
     */
    var onDomEvent = function (eventName, e) {
        if ($domEvents[eventName] === undefined) {
            return;
        }

        var elements = $domEvents[eventName],
            target = e.target,
            i, ln, el,
            callbacks, j, ln2;

        if ($takenOver && eventName === $takenOver[0]) {
            el = $takenOver[1];

            while (target) {
                if (target === el) {
                    $takenOver[2](e);
                    $takenOver = null;
                    return;
                }

                target = target.parentNode;
            }
        } else {
            while (target) {
                for (i = 0, ln = elements.length; i < ln; ++i) {
                    el = elements[i];

                    if (el === target) {
                        callbacks = $elToCallbacks[eventName][i];

                        for (j = 0, ln2 = callbacks.length; j < ln2; ++j) {
                            if (callbacks[j](e) === false) {
                                break;
                            }
                        }

                        // Found element, stop searching.
                        return;
                    }
                }

                target = target.parentNode;
            }
        }
    };

    /**
     * Provides functions to add and remove event listeners to the DOM.
     *
     * @class NativeDomEvents
     * @private
     * @constructor
     */
    var NativeDomEvents = (function () {
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
            off: hasAddEventListener ? rmfn1 : (hasAttachEvent ? rmfn2 : rmfn3)
        };
    }());


    /**
     * Provides functions to add and remove event listeners to the DOM.
     * @class DomEvents
     * @constructor
     */
    var DomEvents = {
        /**
         * Add an event listener to a DOM element.
         * @method on
         * @param {HTMLElement} el The element to add the listener to.
         * @param {String} event The event name.
         * @param {Function} fn The callback function for when the event occurs.
         */
        on: function (el, event, fn) {
            if ($domEvents[event] === undefined) {
                NativeDomEvents.on(document, event, (function (eventName) {
                    return function (e) {
                        return onDomEvent(eventName, e);
                    };
                }(event)));

                $domEvents[event] = [ el ];
                $elToCallbacks[event] = [ [ fn ] ];

            } else {
                var els = $domEvents[event];
                var index = -1;

                for (var i = 0, ln = els.length; i < ln; ++i) {
                    if (els[i] === el) {
                        index = i;
                        break;
                    }
                }

                if (index === -1) {
                    els.push(el);
                    $elToCallbacks[event].push([ fn ]);
                } else {
                    $elToCallbacks[event][index].push(fn);
                }
            }
        },

        /**
         * Remove an event listener from a DOM element.
         *
         * @method off
         * @param {HTMLElement} el The element to remove the listener from.
         * @param {String} event The event name.
         * @param {Function} fn The callback function that was previously added.
         */
        off: function (el, event, fn) {
            if ($domEvents[event] !== undefined) {
                var els = $domEvents[event], cb;

                for (var i = 0, ln = els.length; i < ln; ++i) {
                    if (els[i] === el) {
                        cb = $elToCallbacks[i];

                        for (var j = 0, ln2 = cb.length; j < ln2; ++j) {
                            if (cb[j] === fn) {
                                cb.splice(j, 1);
                                return;
                            }
                        }
                    }
                }
            }
        },

        /**
         * Enables a handler to take over an event, being the only handler to be called.
         *
         * @method takeOver
         * @param {HTMLElement} el The element that will intercept.
         * @param {String} event The event name to take over.
         * @param {Function} fn The callback function.
         */
        takeOver: function (el, event, fn) {
            $takenOver = [event, el, fn];
        }
    }

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