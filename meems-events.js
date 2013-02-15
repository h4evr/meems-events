define(function () {
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
            off: hasAddEventListener ? rmfn1 : (hasAttachEvent ? rmfn2 : rmfn3),
        };
    }());
    
    
    function EventHandler() {
        this._handlers = {};
        return this;
    }
    
    EventHandler.prototype = {
        on : function (eventName, fn) {
            this._handlers[eventName] = this._handlers[eventName] || [];
            this._handlers[eventName].push(fn);
            return this;
        },
        
        off : function (eventName, fn)  {
            if (this._handlers[eventName] !== undefined) {
                this._handlers[eventName] = this._handlers[eventName].filter(function (element) {
                    return element !== fn;
                });
            }
            return this;
        },
        
        fire : function (eventName/*, args ...*/) {
            var handlers = this._handlers[eventName] || [];
            
            for (var i = 0; i < handlers.length; ++i) {
                handlers[i].apply(this, arguments);
            }
            
            return this;
        }
    };
    
    
    var Events = {
        Dom: DomEvents,
        Handler: EventHandler
    };
    
    return Events;
});