/*global define*/
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
            on: hasAddEventListener ? addfn1 : (hasAttachEvent ? addfn2 : addfn3),
            off: hasAddEventListener ? rmfn1 : (hasAttachEvent ? rmfn2 : rmfn3)
        };
    }());

    function EventHandler() {
        this.$handlers = {};
        return this;
    }
    
    EventHandler.prototype = {
        on : function (eventName, fn) {
            this.$handlers[eventName] = this.$handlers[eventName] || [];
            this.$handlers[eventName].push(fn);
            return this;
        },
        
        off : function (eventName, fn)  {
            if (this.$handlers[eventName] !== undefined) {
                this.$handlers[eventName] = this.$handlers[eventName].filter(function (element) {
                    return element !== fn;
                });
            }
            return this;
        },
        
        fire : function (eventName/*, args ...*/) {
            var handlers = this.$handlers[eventName] || [];
            
            for (var i = 0; i < handlers.length; ++i) {
                if (handlers[i].apply(this, arguments)) {
                    break;
                }
            }
            
            return this;
        }
    };

    var Events = {
        Dom: DomEvents,
        Handler: EventHandler,
        touchStartEventName : touchStartEventName,
        touchEndEventName : touchEndEventName,
        touchMoveEventName : touchMoveEventName,
        getCursorPosition : getCursorPosition
    };
    
    return Events;
});
