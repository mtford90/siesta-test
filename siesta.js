(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
/**
 * @module siesta
 */

var collection = require('./src/collection');
var util = require('./src/util');

var CollectionRegistry = require('./src/collectionRegistry').CollectionRegistry,
    Collection = collection.Collection,
    cache = require('./src/cache'),
    Mapping = require('./src/mapping').Mapping,
    notificationCentre = require('./src/notificationCentre').notificationCentre,
    Operation = require('./src/operation/operation').Operation,
    OperationQueue = require('./src/operation/queue').OperationQueue,
    RelationshipType = require('./src/relationship').RelationshipType,
    log = require('./src/operation/log'),
    _ = util._;

if (window.Q) window.q = window.Q;

Operation.logLevel = log.Level.warn;
OperationQueue.logLevel = log.Level.warn;

var siesta;
if (typeof module != 'undefined') {
    siesta = module.exports;
} else {
    siesta = {};
}

/**
 * Wipe everything!
 */
siesta.reset = function() {
    cache.reset();
    CollectionRegistry.reset();
    siesta.ext.http.DescriptorRegistry.reset();
    //noinspection JSAccessibilityCheck
};


/**
 * Listen to notificatons.
 * @param {String} notificationName
 * @param {Function} handler
 */
siesta.on = _.bind(notificationCentre.on, notificationCentre);

/**
 * Listen to notificatons.
 * @param {String} notificationName
 * @param {Function} handler
 */
siesta.addListener = siesta.on;

/**
 * Stop listening to a particular notification
 * 
 * @param {String} notificationName
 * @param {Function} handler
 */
siesta.off = _.bind(notificationCentre.removeListener, notificationCentre);

/**
 * Stop listening to a particular notification
 * 
 * @param {String} notificationName
 * @param {Function} handler
 */
siesta.removeListener = siesta.off;

/**
 * Listen to one and only one notification.
 * 
 * @param {String} notificationName
 * @param {Function} handler
 */
siesta.once = _.bind(notificationCentre.once, notificationCentre);

/**
 * Removes all listeners.
 */
siesta.removeAllListeners = _.bind(notificationCentre.removeAllListeners, notificationCentre);

siesta.Collection = Collection;
siesta.RelationshipType = RelationshipType;

// Used by modules.
var coreChanges = require('./src/changes');

// Make available modules to extensions.
siesta._internal = {
    log: log,
    Mapping: Mapping,
    mapping: require('./src/mapping'),
    error: require('./src/error'),
    ChangeType: coreChanges.ChangeType,
    object: require('./src/object'),
    extend: require('extend'),
    notificationCentre: require('./src/notificationCentre'),
    cache: require('./src/cache'),
    misc: require('./src/misc'),
    Operation: Operation,
    OperationQueue: OperationQueue,
    coreChanges: coreChanges,
    CollectionRegistry: require('./src/collectionRegistry').CollectionRegistry,
    Collection: collection.Collection,
    collection: collection,
    utils: util,
    util: util,
    _: util._,
    query: require('./src/query'),
    store: require('./src/store')
};

siesta.performanceMonitoringEnabled = false;
siesta.httpEnabled = false;
siesta.storageEnabled = false;

siesta.ext = {};

// Object.defineProperty(siesta, 'setPouch', {
//     get: function() {
//         if (siesta.ext.storageEnabled) {
//             return siesta.ext.storage.pouch.setPouch;
//         }
//         return null;
//     }
// });

// Object.defineProperty(siesta.ext, 'storageEnabled', {
//     get: function() {
//         if (siesta.ext._storageEnabled !== undefined) {
//             return siesta.ext._storageEnabled;
//         }
//         return !!siesta.ext.storage;
//     },
//     set: function(v) {
//         siesta.ext._storageEnabled = v;
//     }
// });

/**
 * True if siesta.http.js is installed correctly (or siesta.bundle.js is being used instead).
 */
Object.defineProperty(siesta.ext, 'httpEnabled', {
    get: function() {
        if (siesta.ext._httpEnabled !== undefined) {
            return siesta.ext._httpEnabled;
        }
        return !!siesta.ext.http;
    },
    set: function(v) {
        siesta.ext._httpEnabled = v;
    }
});

/**
 * Creates and registers a new Collection.
 * @param  {[type]} name
 * @param  {[type]} opts
 * @return {Collection}
 */
siesta.collection = function(name, opts) {
    return new Collection(name, opts);
};

/**
 * Sets the ajax function to use e.g. $.ajax
 * @param {Function} ajax
 * @example
 * // Use zepto instead of jQuery for http ajax requests.
 * siesta.setAjax(zepto.ajax);
 */
siesta.setAjax = function(ajax) {
    if (siesta.ext.httpEnabled) {
        siesta.ext.http.ajax = ajax;
    } else {
        throw new Error('http module not installed correctly (have you included siesta.http.js?)');
    }
};

/**
 * Returns the ajax function being used.
 * @return {Function}
 */
siesta.getAjax = function() {
    return siesta.ext.http.ajax;
};

siesta.notify = util.next;

/**
 * Returns an object whos keys map onto string constants used for log levels.
 * @type {Object}
 */
siesta.LogLevel = log.Level;

/**
 * Sets the log level for the named logger
 * @param {String} loggerName
 * @param {String} level
 *
 * @example
 * // Logger used by HTTP request/response descriptors.
 * siesta.setLogLevel('Descriptor', siesta.LogLevel.trace);
 * // Logger used by request descriptors specifically.
 * siesta.setLogLevel('RequestDescriptor', siesta.LogLevel.trace);
 * // Logger used by response descriptors specifically.
 * siesta.setLogLevel('ResponseDescriptor', siesta.LogLevel.trace);
 * // All descriptors are registered in the DescriptorRegistry.
 * siesta.setLogLevel('DescriptorRegistry', siesta.LogLevel.trace);
 * // Logger used by HTTP requests/responses.
 * siesta.setLogLevel('HTTP', siesta.LogLevel.trace);
 * // Objects are cached by local id (_id) or their remote id. This logger is used by the local object cache.
 * siesta.setLogLevel('LocalCache', siesta.LogLevel.trace);
 * // Objects are cached by local id (_id) or their remote id. This logger is used by the remote object cache.
 * siesta.setLogLevel('RemoteCache', siesta.LogLevel.trace);
 * // The logger used by change notifications.
 * siesta.setLogLevel('changes', siesta.LogLevel.trace);
 * // The logger used by the Collection class, which is used to describe a set of mappings.
 * siesta.setLogLevel('Collection', siesta.LogLevel.trace);
 * // The logger used by the Mapping class.
 * siesta.setLogLevel('Mapping', siesta.LogLevel.trace);
 * // The logger used during mapping operations, i.e. mapping data onto the object graph.
 * siesta.setLogLevel('MappingOperation', siesta.LogLevel.trace);
 * // The logger used by the SiestaModel class, which makes up the individual nodes of the object graph.
 * siesta.setLogLevel('SiestaModel', siesta.LogLevel.trace);
 * // The logger used by the performance monitoring extension (siesta.perf.js)
 * siesta.setLogLevel('Performance', siesta.LogLevel.trace);
 * // The logger used during local queries against the object graph.
 * siesta.setLogLevel('Query', siesta.LogLevel.trace);
 * siesta.setLogLevel('Store', siesta.LogLevel.trace);
 * // Much logic in Siesta is tied up in 'Operations'.
 * siesta.setLogLevel('Operation', siesta.LogLevel.trace);
 * // Siesta makes use of queues of operations for managing concurrency and concurrent operation limits.
 * siesta.setLogLevel('OperationQueue', siesta.LogLevel.trace);
 */
siesta.setLogLevel = function(loggerName, level) {
    var Logger = log.loggerWithName(loggerName);
    Logger.setLevel(level);
};



siesta.serialisers = {};
siesta.serializers = siesta.serialisers;

Object.defineProperty(siesta.serialisers, 'id', {
    get: function() {
        if (siesta.ext.httpEnabled) {
            return siesta.ext.http.Serialiser.idSerialiser;
        }
        return null;
    }
});

Object.defineProperty(siesta.serialisers, 'depth', {
    get: function() {
        if (siesta.ext.httpEnabled) {
            return siesta.ext.http.Serialiser.depthSerializer;
        }
        return null;
    }
});

// * `siesta.map` is equivalent to [_.map](http://underscorejs.org/#map)
// * `siesta.each` is equivalent to [_.each](http://underscorejs.org/#each)
// * `siesta.partial` is equivalent to [_.partial](http://underscorejs.org/#partial)
// * `siesta.bind` is equivalent to [_.bind](http://underscorejs.org/#bind)
// * `siesta.pluck` is equivalent to [_.pluck](http://underscorejs.org/#pluck)
// * `siesta.property` is equivalent to [_.property](http://underscorejs.org/#property)
// * `siesta.sortBy` is equivalent to [_.sortBy](http://underscorejs.org/#sortBy)
// * `siesta.parallel` is equivalent to [async.parallel](https://github.com/caolan/async#parallel)
// * `siesta.series` is equivalent to [async.series](https://github.com/caolan/async#series)

siesta.map = util._.map;
siesta.each = util._.each;
siesta.partial = util._.partial;
siesta.bind = util._.bind;
siesta.pluck = util._.pluck;
siesta.property = util._.pluck;
siesta.sortBy = util._.sortBy;
siesta.series = util.series;
siesta.parallel = util.parallel;


if (typeof window != 'undefined') {
    window.siesta = siesta;
}

exports.siesta = siesta;
},{"./src/cache":4,"./src/changes":5,"./src/collection":6,"./src/collectionRegistry":7,"./src/error":8,"./src/mapping":10,"./src/misc":12,"./src/notificationCentre":13,"./src/object":14,"./src/operation/log":17,"./src/operation/operation":18,"./src/operation/queue":19,"./src/query":21,"./src/relationship":22,"./src/store":23,"./src/util":24,"extend":3}],2:[function(require,module,exports){
// Copyright Joyent, Inc. and other Node contributors.
//
// Permission is hereby granted, free of charge, to any person obtaining a
// copy of this software and associated documentation files (the
// "Software"), to deal in the Software without restriction, including
// without limitation the rights to use, copy, modify, merge, publish,
// distribute, sublicense, and/or sell copies of the Software, and to permit
// persons to whom the Software is furnished to do so, subject to the
// following conditions:
//
// The above copyright notice and this permission notice shall be included
// in all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS
// OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
// MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN
// NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
// DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
// OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE
// USE OR OTHER DEALINGS IN THE SOFTWARE.

function EventEmitter() {
  this._events = this._events || {};
  this._maxListeners = this._maxListeners || undefined;
}
module.exports = EventEmitter;

// Backwards-compat with node 0.10.x
EventEmitter.EventEmitter = EventEmitter;

EventEmitter.prototype._events = undefined;
EventEmitter.prototype._maxListeners = undefined;

// By default EventEmitters will print a warning if more than 10 listeners are
// added to it. This is a useful default which helps finding memory leaks.
EventEmitter.defaultMaxListeners = 10;

// Obviously not all Emitters should be limited to 10. This function allows
// that to be increased. Set to zero for unlimited.
EventEmitter.prototype.setMaxListeners = function(n) {
  if (!isNumber(n) || n < 0 || isNaN(n))
    throw TypeError('n must be a positive number');
  this._maxListeners = n;
  return this;
};

EventEmitter.prototype.emit = function(type) {
  var er, handler, len, args, i, listeners;

  if (!this._events)
    this._events = {};

  // If there is no 'error' event listener then throw.
  if (type === 'error') {
    if (!this._events.error ||
        (isObject(this._events.error) && !this._events.error.length)) {
      er = arguments[1];
      if (er instanceof Error) {
        throw er; // Unhandled 'error' event
      }
      throw TypeError('Uncaught, unspecified "error" event.');
    }
  }

  handler = this._events[type];

  if (isUndefined(handler))
    return false;

  if (isFunction(handler)) {
    switch (arguments.length) {
      // fast cases
      case 1:
        handler.call(this);
        break;
      case 2:
        handler.call(this, arguments[1]);
        break;
      case 3:
        handler.call(this, arguments[1], arguments[2]);
        break;
      // slower
      default:
        len = arguments.length;
        args = new Array(len - 1);
        for (i = 1; i < len; i++)
          args[i - 1] = arguments[i];
        handler.apply(this, args);
    }
  } else if (isObject(handler)) {
    len = arguments.length;
    args = new Array(len - 1);
    for (i = 1; i < len; i++)
      args[i - 1] = arguments[i];

    listeners = handler.slice();
    len = listeners.length;
    for (i = 0; i < len; i++)
      listeners[i].apply(this, args);
  }

  return true;
};

EventEmitter.prototype.addListener = function(type, listener) {
  var m;

  if (!isFunction(listener))
    throw TypeError('listener must be a function');

  if (!this._events)
    this._events = {};

  // To avoid recursion in the case that type === "newListener"! Before
  // adding it to the listeners, first emit "newListener".
  if (this._events.newListener)
    this.emit('newListener', type,
              isFunction(listener.listener) ?
              listener.listener : listener);

  if (!this._events[type])
    // Optimize the case of one listener. Don't need the extra array object.
    this._events[type] = listener;
  else if (isObject(this._events[type]))
    // If we've already got an array, just append.
    this._events[type].push(listener);
  else
    // Adding the second element, need to change to array.
    this._events[type] = [this._events[type], listener];

  // Check for listener leak
  if (isObject(this._events[type]) && !this._events[type].warned) {
    var m;
    if (!isUndefined(this._maxListeners)) {
      m = this._maxListeners;
    } else {
      m = EventEmitter.defaultMaxListeners;
    }

    if (m && m > 0 && this._events[type].length > m) {
      this._events[type].warned = true;
      console.error('(node) warning: possible EventEmitter memory ' +
                    'leak detected. %d listeners added. ' +
                    'Use emitter.setMaxListeners() to increase limit.',
                    this._events[type].length);
      if (typeof console.trace === 'function') {
        // not supported in IE 10
        console.trace();
      }
    }
  }

  return this;
};

EventEmitter.prototype.on = EventEmitter.prototype.addListener;

EventEmitter.prototype.once = function(type, listener) {
  if (!isFunction(listener))
    throw TypeError('listener must be a function');

  var fired = false;

  function g() {
    this.removeListener(type, g);

    if (!fired) {
      fired = true;
      listener.apply(this, arguments);
    }
  }

  g.listener = listener;
  this.on(type, g);

  return this;
};

// emits a 'removeListener' event iff the listener was removed
EventEmitter.prototype.removeListener = function(type, listener) {
  var list, position, length, i;

  if (!isFunction(listener))
    throw TypeError('listener must be a function');

  if (!this._events || !this._events[type])
    return this;

  list = this._events[type];
  length = list.length;
  position = -1;

  if (list === listener ||
      (isFunction(list.listener) && list.listener === listener)) {
    delete this._events[type];
    if (this._events.removeListener)
      this.emit('removeListener', type, listener);

  } else if (isObject(list)) {
    for (i = length; i-- > 0;) {
      if (list[i] === listener ||
          (list[i].listener && list[i].listener === listener)) {
        position = i;
        break;
      }
    }

    if (position < 0)
      return this;

    if (list.length === 1) {
      list.length = 0;
      delete this._events[type];
    } else {
      list.splice(position, 1);
    }

    if (this._events.removeListener)
      this.emit('removeListener', type, listener);
  }

  return this;
};

EventEmitter.prototype.removeAllListeners = function(type) {
  var key, listeners;

  if (!this._events)
    return this;

  // not listening for removeListener, no need to emit
  if (!this._events.removeListener) {
    if (arguments.length === 0)
      this._events = {};
    else if (this._events[type])
      delete this._events[type];
    return this;
  }

  // emit removeListener for all listeners on all events
  if (arguments.length === 0) {
    for (key in this._events) {
      if (key === 'removeListener') continue;
      this.removeAllListeners(key);
    }
    this.removeAllListeners('removeListener');
    this._events = {};
    return this;
  }

  listeners = this._events[type];

  if (isFunction(listeners)) {
    this.removeListener(type, listeners);
  } else {
    // LIFO order
    while (listeners.length)
      this.removeListener(type, listeners[listeners.length - 1]);
  }
  delete this._events[type];

  return this;
};

EventEmitter.prototype.listeners = function(type) {
  var ret;
  if (!this._events || !this._events[type])
    ret = [];
  else if (isFunction(this._events[type]))
    ret = [this._events[type]];
  else
    ret = this._events[type].slice();
  return ret;
};

EventEmitter.listenerCount = function(emitter, type) {
  var ret;
  if (!emitter._events || !emitter._events[type])
    ret = 0;
  else if (isFunction(emitter._events[type]))
    ret = 1;
  else
    ret = emitter._events[type].length;
  return ret;
};

function isFunction(arg) {
  return typeof arg === 'function';
}

function isNumber(arg) {
  return typeof arg === 'number';
}

function isObject(arg) {
  return typeof arg === 'object' && arg !== null;
}

function isUndefined(arg) {
  return arg === void 0;
}

},{}],3:[function(require,module,exports){
var hasOwn = Object.prototype.hasOwnProperty;
var toString = Object.prototype.toString;
var undefined;

var isPlainObject = function isPlainObject(obj) {
	"use strict";
	if (!obj || toString.call(obj) !== '[object Object]' || obj.nodeType || obj.setInterval) {
		return false;
	}

	var has_own_constructor = hasOwn.call(obj, 'constructor');
	var has_is_property_of_method = obj.constructor && obj.constructor.prototype && hasOwn.call(obj.constructor.prototype, 'isPrototypeOf');
	// Not own constructor property must be Object
	if (obj.constructor && !has_own_constructor && !has_is_property_of_method) {
		return false;
	}

	// Own properties are enumerated firstly, so to speed up,
	// if last one is own, then all properties are own.
	var key;
	for (key in obj) {}

	return key === undefined || hasOwn.call(obj, key);
};

module.exports = function extend() {
	"use strict";
	var options, name, src, copy, copyIsArray, clone,
		target = arguments[0],
		i = 1,
		length = arguments.length,
		deep = false;

	// Handle a deep copy situation
	if (typeof target === "boolean") {
		deep = target;
		target = arguments[1] || {};
		// skip the boolean and the target
		i = 2;
	} else if (typeof target !== "object" && typeof target !== "function" || target == undefined) {
			target = {};
	}

	for (; i < length; ++i) {
		// Only deal with non-null/undefined values
		if ((options = arguments[i]) != null) {
			// Extend the base object
			for (name in options) {
				src = target[name];
				copy = options[name];

				// Prevent never-ending loop
				if (target === copy) {
					continue;
				}

				// Recurse if we're merging plain objects or arrays
				if (deep && copy && (isPlainObject(copy) || (copyIsArray = Array.isArray(copy)))) {
					if (copyIsArray) {
						copyIsArray = false;
						clone = src && Array.isArray(src) ? src : [];
					} else {
						clone = src && isPlainObject(src) ? src : {};
					}

					// Never move original objects, clone them
					target[name] = extend(deep, clone, copy);

				// Don't bring in undefined values
				} else if (copy !== undefined) {
					target[name] = copy;
				}
			}
		}
	}

	// Return the modified object
	return target;
};


},{}],4:[function(require,module,exports){
/**
 * This is an in-memory cache for models. Models are cached by local id (_id) and remote id (defined by the mapping).
 * Lookups are performed against the cache when mapping.
 * @module cache
 */
var log = require('./operation/log');
var LocalCacheLogger = log.loggerWithName('LocalCache');
LocalCacheLogger.setLevel(log.Level.warn);
var RemoteCacheLogger = log.loggerWithName('RemoteCache');
RemoteCacheLogger.setLevel(log.Level.warn);
var InternalSiestaError = require('./error').InternalSiestaError;
var util = require('./util');


var localCacheById = {};
var localCache = {};


var remoteCache = {};

function reset() {
    remoteCache = {};
    localCacheById = {};
    localCache = {};
}

reset();

/**
 * Return the object in the cache given a local id (_id)
 * @param  {String} localId
 * @return {SiestaModel}
 */
function getViaLocalId(localId) {
    var obj = localCacheById[localId];
    if (obj) {
        if (LocalCacheLogger.debug.isEnabled)
            LocalCacheLogger.debug('Local cache hit: ' + obj._dump(true));
    } else {
        if (LocalCacheLogger.debug.isEnabled)
            LocalCacheLogger.debug('Local cache miss: ' + localId);
    }
    return obj;
}

/**
 * Return the singleton object given a singleton mapping.
 * @param  {Mapping} mapping
 * @return {SiestaModel}
 */
function getSingleton(mapping) {
    var mappingName = mapping.type;
    var collectionName = mapping.collection;
    var collectionCache = localCache[collectionName];
    if (collectionCache) {
        var typeCache = collectionCache[mappingName];
        if (typeCache) {
            var objs = [];
            for (var prop in typeCache) {
                if (typeCache.hasOwnProperty(prop)) {
                    objs.push(typeCache[prop]);
                }
            }
            if (objs.length > 1) {
                throw new InternalSiestaError('A singleton mapping has more than 1 object in the cache! This is a serious error. ' +
                    'Either a mapping has been modified after objects have already been created, or something has gone' +
                    'very wrong. Please file a bug report if the latter.');
            } else if (objs.length) {
                return objs[0];
            }
        }
    }
    return null;
}

/**
 * Given a remote identifier and an options object that describes mapping/collection,
 * return the model if cached.
 * @param  {String} remoteId
 * @param  {Object} opts
 * @return {SiestaModel}
 */
function getViaRemoteId(remoteId, opts) {
    var type = opts.mapping.type;
    var collection = opts.mapping.collection;
    var collectionCache = remoteCache[collection];
    if (collectionCache) {
        var typeCache = remoteCache[collection][type];
        if (typeCache) {
            var obj = typeCache[remoteId];
            if (obj) {
                if (RemoteCacheLogger.debug.isEnabled)
                    RemoteCacheLogger.debug('Remote cache hit: ' + obj._dump(true));
            } else {
                if (RemoteCacheLogger.debug.isEnabled)
                    RemoteCacheLogger.debug('Remote cache miss: ' + remoteId);
            }
            return obj;
        }
    }
    if (RemoteCacheLogger.debug.isEnabled)
        RemoteCacheLogger.debug('Remote cache miss: ' + remoteId);
    return null;
}

/**
 * Insert an objet into the cache using a remote identifier defined by the mapping.
 * @param  {SiestaModel} obj
 * @param  {String} remoteId
 * @param  {String} previousRemoteId If remote id has been changed, this is the old remote identifier
 */
function remoteInsert(obj, remoteId, previousRemoteId) {
    if (obj) {
        var collection = obj.mapping.collection;
        if (collection) {
            if (!remoteCache[collection]) {
                remoteCache[collection] = {};
            }
            var type = obj.mapping.type;
            if (type) {
                if (!remoteCache[collection][type]) {
                    remoteCache[collection][type] = {};
                }
                if (previousRemoteId) {
                    remoteCache[collection][type][previousRemoteId] = null;
                }
                var cachedObject = remoteCache[collection][type][remoteId];
                if (!cachedObject) {
                    remoteCache[collection][type][remoteId] = obj;
                    if (RemoteCacheLogger.debug.isEnabled)
                        RemoteCacheLogger.debug('Remote cache insert: ' + obj._dump(true));
                    if (RemoteCacheLogger.trace.isEnabled)
                        RemoteCacheLogger.trace('Remote cache now looks like: ' + remoteDump(true))
                } else {
                    // Something has gone really wrong. Only one object for a particular collection/type/remoteid combo
                    // should ever exist.
                    if (obj != cachedObject) {
                        var message = 'Object ' + collection.toString() + ':' + type.toString() + '[' + obj.mapping.id + '="' + remoteId + '"] already exists in the cache.' +
                            ' This is a serious error, please file a bug report if you are experiencing this out in the wild';
                        RemoteCacheLogger.error(message, {
                            obj: obj,
                            cachedObject: cachedObject
                        });
                        util.printStackTrace();
                        throw new InternalSiestaError(message);
                    } else {
                        if (RemoteCacheLogger.debug.isEnabled)
                            RemoteCacheLogger.debug('Object has already been inserted: ' + obj._dump(true));
                    }

                }
            } else {
                throw new InternalSiestaError('Mapping has no type', {
                    mapping: obj.mapping,
                    obj: obj
                });
            }
        } else {
            throw new InternalSiestaError('Mapping has no collection', {
                mapping: obj.mapping,
                obj: obj
            });
        }
    } else {
        var msg = 'Must pass an object when inserting to cache';
        RemoteCacheLogger.error(msg);
        throw new InternalSiestaError(msg);
    }
}

/**
 * Dump the remote id cache
 * @param  {boolean} asJson Whether or not to apply JSON.stringify
 * @return {String|Object}
 */
function remoteDump(asJson) {
    var dumpedRestCache = {};
    for (var coll in remoteCache) {
        if (remoteCache.hasOwnProperty(coll)) {
            var dumpedCollCache = {};
            dumpedRestCache[coll] = dumpedCollCache;
            var collCache = remoteCache[coll];
            for (var mapping in collCache) {
                if (collCache.hasOwnProperty(mapping)) {
                    var dumpedMappingCache = {};
                    dumpedCollCache[mapping] = dumpedMappingCache;
                    var mappingCache = collCache[mapping];
                    for (var remoteId in mappingCache) {
                        if (mappingCache.hasOwnProperty(remoteId)) {
                            if (mappingCache[remoteId]) {
                                dumpedMappingCache[remoteId] = mappingCache[remoteId]._dump();
                            }
                        }
                    }
                }
            }
        }
    }
    return asJson ? JSON.stringify(dumpedRestCache, null, 4) : dumpedRestCache;

}

/**
 * Dump the local id (_id) cache
 * @param  {boolean} asJson Whether or not to apply JSON.stringify
 * @return {String|Object}
 */
function localDump(asJson) {
    var dumpedIdCache = {};
    for (var id in localCacheById) {
        if (localCacheById.hasOwnProperty(id)) {
            dumpedIdCache[id] = localCacheById[id]._dump()
        }
    }
    return asJson ? JSON.stringify(dumpedIdCache, null, 4) : dumpedIdCache;
}

/**
 * Dump to the cache.
 * @param  {boolean} asJson Whether or not to apply JSON.stringify
 * @return {String|Object}
 */
function dump(asJson) {
    var dumped = {
        localCache: localDump(),
        remoteCache: remoteDump()
    };
    return asJson ? JSON.stringify(dumped, null, 4) : dumped;
}

function _remoteCache() {
    return remoteCache
}

function _localCache() {
    return localCacheById;
}

/**
 * Query the cache
 * @param  {Object} opts Object describing the query
 * @return {SiestaModel}
 * @example
 * ```js
 * cache.get({_id: '5'}); // Query by local id
 * cache.get({remoteId: '5', mapping: myMapping}); // Query by remote id
 * ```
 */
function get(opts) {
    if (LocalCacheLogger.debug.isEnabled) LocalCacheLogger.debug('get', opts);
    var obj, idField, remoteId;
    var localId = opts._id;
    if (localId) {
        obj = getViaLocalId(localId);
        if (obj) {
            return obj;
        } else {
            if (opts.mapping) {
                idField = opts.mapping.id;
                remoteId = opts[idField];
                if (LocalCacheLogger.debug.isEnabled) LocalCacheLogger.debug(idField + '=' + remoteId);
                return getViaRemoteId(remoteId, opts);
            } else {
                return null;
            }
        }
    } else if (opts.mapping) {
        idField = opts.mapping.id;
        remoteId = opts[idField];
        if (remoteId) {
            return getViaRemoteId(remoteId, opts);
        } else if (opts.mapping.singleton) {
            return getSingleton(opts.mapping);
        }
    } else {
        LocalCacheLogger.warn('Invalid opts to cache', {
            opts: opts
        });
    }
    return null;
}

/**
 * Insert an object into the cache.
 * @param  {SiestaModel} obj
 * @throws {InternalSiestaError} An object with _id/remoteId already exists. Not thrown if same obhect.
 */
function insert(obj) {
    var localId = obj._id;
    if (localId) {
        var collectionName = obj.mapping.collection;
        var mappingName = obj.mapping.type;
        if (!localCacheById[localId]) {
            if (LocalCacheLogger.debug.isEnabled)
                LocalCacheLogger.debug('Local cache insert: ' + obj._dump(true));
            localCacheById[localId] = obj;
            if (LocalCacheLogger.trace.isEnabled)
                LocalCacheLogger.trace('Local cache now looks like: ' + localDump(true));
            if (!localCache[collectionName]) localCache[collectionName] = {};
            if (!localCache[collectionName][mappingName]) localCache[collectionName][mappingName] = {};
            localCache[collectionName][mappingName][localId] = obj;
        } else {
            // Something has gone badly wrong here. Two objects should never exist with the same _id
            if (localCacheById[localId] != obj) {
                var message = 'Object with _id="' + localId.toString() + '" is already in the cache. ' +
                    'This is a serious error. Please file a bug report if you are experiencing this out in the wild';
                LocalCacheLogger.error(message);
                throw new InternalSiestaError(message);
            }
        }
    }
    var idField = obj.idField;
    var remoteId = obj[idField];
    if (remoteId) {
        remoteInsert(obj, remoteId);
    } else {
        if (RemoteCacheLogger.debug.isEnabled)
            RemoteCacheLogger.debug('No remote id ("' + idField + '") so wont be placing in the remote cache', obj);
    }
}

/**
 * Returns true if object is in the cache
 * @param  {SiestaModel} obj
 * @return {boolean}
 */
function contains(obj) {
    var q = {
        _id: obj._id
    };
    var mapping = obj.mapping;
    if (mapping.id) {
        if (obj[mapping.id]) {
            q.mapping = mapping;
            q[mapping.id] = obj[mapping.id];
        }
    }
    return !!get(q);
}

/**
 * Removes the object from the cache (if it's actually in the cache) otherwises throws an error.
 * @param  {SiestaModel} obj
 * @throws {InternalSiestaError} If object already in the cache.
 */
function remove(obj) {
    if (contains(obj)) {
        var collectionName = obj.mapping.collection;
        var mappingName = obj.mapping.type;
        var _id = obj._id;
        if (!mappingName) throw InternalSiestaError('No mapping name');
        if (!collectionName) throw InternalSiestaError('No collection name');
        if (!_id) throw InternalSiestaError('No _id');
        delete localCache[collectionName][mappingName][_id];
        delete localCacheById[_id];
        if (obj.mapping.id) {
            var remoteId = obj[obj.mapping.id];
            delete remoteCache[collectionName][mappingName][remoteId];
        }
    } else {
        throw new InternalSiestaError('Object was not in cache.');
    }
}


function dump(asJson) {
    var dumped = {
        localCache: localDump(),
        remoteCache: remoteDump()
    };
    return asJson ? JSON.stringify(dumped, null, 4) : dumped;
}

exports._remoteCache = _remoteCache;
exports._localCache = _localCache;
Object.defineProperty(exports, '_localCacheByType', {
    get: function() {
        return localCache;
    }
});
exports.get = get;
exports.insert = insert;
exports.remoteInsert = remoteInsert;
exports.reset = reset;
exports._dump = dump;
exports.contains = contains;
exports.remove = remove;
},{"./error":8,"./operation/log":17,"./util":24}],5:[function(require,module,exports){
/**
 * The changes module deals with changes to SiestaModel instances. In the in-memory case this 
 * just means that notifications are sent on any change. If the storage module is being used,
 * the changes module is extended to deal with merging changes into whatever persistant storage
 * method is being used.
 * @module changes
 */

var defineSubProperty = require('./misc').defineSubProperty;
var notificationCentre = require('./notificationCentre').notificationCentre;
var InternalSiestaError = require('./error').InternalSiestaError;
var log = require('./operation/log');
var collectionRegistry = require('./collectionRegistry').CollectionRegistry;

var Logger = log.loggerWithName('changes');
Logger.setLevel(log.Level.warn);

/**
 * Constants that describe change events.
 * Set => A new value is assigned to an attribute/relationship
 * Splice => All javascript array operations are described as splices.
 * Delete => Used in the case where objects are removed from an array, but array order is not known in advance.
 * Remove => Object deletion events
 * New => Object creation events
 * @type {Object}
 */
var ChangeType = {
    Set: 'Set',
    Splice: 'Splice',
    Delete: 'Delete',
    New: 'New',
    Remove: 'Remove'
};

/**
 * Represents an individual change.
 * @param opts
 * @constructor
 */
function Change(opts) {
    this._opts = opts;
    if (!this._opts) {
        this._opts = {};
    }
    defineSubProperty.call(this, 'collection', this._opts);
    defineSubProperty.call(this, 'mapping', this._opts);
    defineSubProperty.call(this, '_id', this._opts);
    defineSubProperty.call(this, 'field', this._opts);
    defineSubProperty.call(this, 'type', this._opts);
    defineSubProperty.call(this, 'index', this._opts);
    defineSubProperty.call(this, 'added', this._opts);
    defineSubProperty.call(this, 'addedId', this._opts);
    defineSubProperty.call(this, 'removed', this._opts);
    defineSubProperty.call(this, 'removedId', this._opts);
    defineSubProperty.call(this, 'new', this._opts);
    defineSubProperty.call(this, 'newId', this._opts);
    defineSubProperty.call(this, 'old', this._opts);
    defineSubProperty.call(this, 'oldId', this._opts);
    defineSubProperty.call(this, 'obj', this._opts);
}

Change.prototype._dump = function (json) {
    var dumped = {};
    dumped.collection = (typeof this.collection) == 'string' ? this.collection : this.collection._dump();
    dumped.mapping = (typeof this.mapping) == 'string' ? this.mapping : this.mapping.type;
    dumped._id = this._id;
    dumped.field = this.field;
    dumped.type = this.type;
    if (this.index) dumped.index = this.index;
    if (this.added) dumped.added = _.map(this.added, function (x) {return x._dump()});
    if (this.removed) dumped.removed = _.map(this.removed, function (x) {return x._dump()});
    if (this.old) dumped.old = this.old;
    if (this.new) dumped.new = this.new;
    return json ? JSON.stringify(dumped, null, 4) : dumped;
};

/**
 * Broadcas
 * @param  {String} collectionName
 * @param  {String} mappingName
 * @param  {Object} c an options dictionary representing the change
 * @return {[type]}
 */
function broadcast(collectionName, mappingName, c) {
    if (Logger.trace.isEnabled) Logger.trace('Sending notification "' + collectionName + '" of type ' + c.type);
    notificationCentre.emit(collectionName, c);
    var mappingNotif = collectionName + ':' + mappingName;
    if (Logger.trace.isEnabled) Logger.trace('Sending notification "' + mappingNotif + '" of type ' + c.type);
    notificationCentre.emit(mappingNotif, c);
    var genericNotif = 'Siesta';
    if (Logger.trace.isEnabled) Logger.trace('Sending notification "' + genericNotif + '" of type ' + c.type);
    notificationCentre.emit(genericNotif, c);
    var localIdNotif = c._id;
    if (Logger.trace.isEnabled) Logger.trace('Sending notification "' + localIdNotif + '" of type ' + c.type);
    notificationCentre.emit(localIdNotif, c);
    var collection = collectionRegistry[collectionName];
    if (!collection) {
        var err = 'No such collection "' + collectionName + '"';
        Logger.error(err, collectionRegistry);
        throw new InternalSiestaError(err);
    }
    var mapping = collection[mappingName];
    if (!mapping) {
        var err = 'No such mapping "' + mappingName + '"';
        Logger.error(err, collectionRegistry);
        throw new InternalSiestaError(err);
    }
    if (mapping.id && c.obj[mapping.id]) {
        var remoteIdNotif = collectionName + ':' + mappingName + ':' + c.obj[mapping.id];
        if (Logger.trace.isEnabled) Logger.trace('Sending notification "' + remoteIdNotif + '" of type ' + c.type);
        notificationCentre.emit(remoteIdNotif, c);
    }
}

/**
 * Throw an error if the change is incorrect.
 * @param changeOpts
 * @throws {InternalSiestaError} If change options are invalid
 */
function validateChange(changeOpts) {
    if (!changeOpts.mapping) throw new InternalSiestaError('Must pass a mapping');
    if (!changeOpts.collection) throw new InternalSiestaError('Must pass a collection');
    if (!changeOpts._id) throw new InternalSiestaError('Must pass a local identifier');
    if (!changeOpts.obj) throw new InternalSiestaError('Must pass the object');
}

/**
 * Register that a change has been made.
 * @param opts
 * @return {Change} The constructed change
 */
function registerChange(opts) {
    validateChange(opts);
    var collection = opts.collection;
    var mapping = opts.mapping;
    var c = new Change(opts);
    broadcast(collection, mapping, c);
    return c;
}

exports.Change = Change;
exports.registerChange = registerChange;
exports.validateChange = validateChange;
exports.ChangeType = ChangeType;
},{"./collectionRegistry":7,"./error":8,"./misc":12,"./notificationCentre":13,"./operation/log":17}],6:[function(require,module,exports){
/**
 * @module collection
 */

var log = require('./operation/log');
var Logger = log.loggerWithName('Collection');
Logger.setLevel(log.Level.warn);

var CollectionRegistry = require('./collectionRegistry').CollectionRegistry;
var Operation = require('./operation/operation').Operation;
var InternalSiestaError = require('./error').InternalSiestaError;
var Mapping = require('./mapping').Mapping;
var extend = require('extend');
var observe = require('../vendor/observe-js/src/observe').Platform;

var util = require('./util');
var _ = util._;

var cache = require('./cache');

var SAFE_METHODS = ['GET', 'HEAD', 'TRACE', 'OPTIONS', 'CONNECT'];
var UNSAFE_METHODS = ['PUT', 'PATCH', 'POST', 'DELETE'];

/**
 * A collection describes a set of models and optionally a REST API which we would
 * like to model.
 *
 * @param name
 * @constructor
 *
 *
 * @example
 * ```js
 * var GitHub = new siesta.Collection('GitHub')
 * // ... configure mappings, descriptors etc ...
 * GitHub.install(function () {
 *     // ... carry on.
 * });
 * ```
 */
function Collection(name) {
    var self = this;
    if (!this) return new Collection(name);
    if (!name) throw new InternalSiestaError('Collection must have a name');
    this._name = name;
    this._docId = 'Collection_' + this._name;
    this._rawMappings = {};
    this._mappings = {};
    /**
     * The URL of the API e.g. http://api.github.com
     * @type {string}
     */
    this.baseURL = '';

    /**
     * Set to true if installation has succeeded. You cannot use the collectio
     * @type {boolean}
     */
    this.installed = false;
    CollectionRegistry.register(this);

    /**
     *
     * @type {string}
     */
    Object.defineProperty(this, 'name', {
        get: function() {
            return self._name;
        }
    });
}

/**
 * Ensure mappings are installed.
 * @param callback
 */
Collection.prototype.install = function(callback) {
    var deferred = window.q ? window.q.defer() : null;
    var self = this;
    if (!this.installed) {
        var mappingsToInstall = [];
        for (var name in this._mappings) {
            if (this._mappings.hasOwnProperty(name)) {
                var mapping = this._mappings[name];
                mappingsToInstall.push(mapping);
            }
        }
        if (Logger.info.isEnabled)
            Logger.info('There are ' + mappingsToInstall.length.toString() + ' mappings to install');
        if (mappingsToInstall.length) {
            var operations = _.map(mappingsToInstall, function(m) {
                return new Operation('Install Mapping', _.bind(m.install, m));
            });
            var op = new Operation('Install Mappings', operations);
            op.completion = function() {
                if (op.failed) {
                    Logger.error('Failed to install collection', op.error);
                    self._finaliseInstallation(op.error, callback);
                } else {
                    self.installed = true;
                    var errors = [];
                    _.each(mappingsToInstall, function(m) {
                        if (Logger.info.isEnabled)
                            Logger.info('Installing relationships for mapping with name "' + m.type + '"');
                        var err = m.installRelationships();
                        if (err) errors.push(err);
                    });
                    if (!errors.length) {
                        _.each(mappingsToInstall, function(m) {
                            if (Logger.info.isEnabled)
                                Logger.info('Installing reverse relationships for mapping with name "' + m.type + '"');
                            var err = m.installReverseRelationships();
                            if (err) errors.push(err);
                        });
                    }
                    var err;
                    if (errors.length == 1) {
                        err = errors[0];
                    } else if (errors.length) {
                        err = errors;
                    }
                    self._finaliseInstallation(err, callback);
                }
            };
            op.start();
        } else {
            self._finaliseInstallation(null, callback);
        }
    } else {
        var err = new InternalSiestaError('Collection "' + this._name + '" has already been installed');
        self._finaliseInstallation(err, callback);
    }
    return deferred ? deferred.promise : null;
};

/**
 * Mark this collection as installed, and place the collection on the global Siesta object.
 * @param  {Object}   err
 * @param  {Function} callback
 */
Collection.prototype._finaliseInstallation = function(err, callback) {
    if (!err) {
        this.installed = true;
        var index = require('../index');
        index[this._name] = this;
    }
    if (callback) callback(err);
};

/**
 * Given the name of a mapping and an options object describing the mapping, creating a Mapping
 * object, install it and return it.
 * @param  {String} name
 * @param  {Object} mapping
 * @return {Mapping}
 */
Collection.prototype._mapping = function(name, opts) {
    if (name) {
        this._rawMappings[name] = opts;
        var opts = extend(true, {}, opts);
        opts.type = name;
        opts.collection = this._name;
        var mappingObject = new Mapping(opts);
        this._mappings[name] = mappingObject;
        this[name] = mappingObject;
        return mappingObject;
    } else {
        throw new InternalSiestaError('No name specified when creating mapping');
    }
};

/**
 * Registers a mapping with this collection.
 * @param {String|Object} optsOrName An options object or the name of the mapping. Must pass options as second param if specify name.
 * @param {Object} opts Options if name already specified.
 * @return {Mapping}
 */
Collection.prototype.mapping = function() {
    var self = this;
    if (arguments.length) {
        if (arguments.length == 1) {
            if (util.isArray(arguments[0])) {
                return _.map(arguments[0], function(m) {
                    return self._mapping(m.name, m);
                });
            } else {
                return this._mapping(arguments[0].name, arguments[0]);
            }
        } else {
            if (typeof arguments[0] == 'string') {
                return this._mapping(arguments[0], arguments[1]);
            } else {
                return _.map(arguments, function(m) {
                    return self._mapping(m.name, m);
                });
            }
        }
    }
    return null;
};

Collection.prototype.descriptor = function(opts) {
    var descriptors = [];
    if (siesta.ext.httpEnabled) {
        opts.collection = this;
        var methods = siesta.ext.http._resolveMethod(opts.method);
        var unsafe = [];
        var safe = [];
        for (var i = 0; i < methods.length; i++) {
            var m = methods[i];
            if (UNSAFE_METHODS.indexOf(m) > -1) {
                unsafe.push(m);
            } else {
                safe.push(m);
            }
        }
        if (unsafe.length) {
            var requestDescriptor = extend({}, opts);
            requestDescriptor.method = unsafe;
            requestDescriptor = new siesta.ext.http.RequestDescriptor(requestDescriptor);
            siesta.ext.http.DescriptorRegistry.registerRequestDescriptor(requestDescriptor);
            descriptors.push(requestDescriptor);
        }
        if (safe.length) {
            var responseDescriptor = extend({}, opts);
            responseDescriptor.method = safe;
            responseDescriptor = new siesta.ext.http.ResponseDescriptor(responseDescriptor);
            siesta.ext.http.DescriptorRegistry.registerResponseDescriptor(responseDescriptor);
            descriptors.push(responseDescriptor);
        }
    } else {
        throw new InternalSiestaError('HTTP module not installed');
    }
    return descriptors;
};

/**
 * Dump this collection as JSON
 * @param  {Boolean} asJson Whether or not to apply JSON.stringify
 * @return {String|Object}
 */
Collection.prototype._dump = function(asJson) {
    var obj = {};
    obj.installed = this.installed;
    obj.docId = this._docId;
    obj.name = this._name;
    obj.baseURL = this.baseURL;
    return asJson ? JSON.stringify(obj, null, 4) : obj;
};


// /**
//  * Persist all changes to PouchDB.
//  * Note: Storage extension must be installed.
//  * @param callback
//  * @returns {Promise}
//  */
// Collection.prototype.save = function(callback) {
//     var deferred = q.defer();
//     callback = util.constructCallbackAndPromiseHandler(callback, deferred);
//     if (siesta.ext.storageEnabled) {
//         util.next(function() {
//             var mergeChanges = siesta.ext.storage.changes.mergeChanges;
//             mergeChanges(callback);
//         });
//     } else {
//         callback('Storage module not installed');
//     }
//     return deferred ? deferred.promise : null;
// };


Collection.prototype._http = function(method) {
    if (siesta.ext.httpEnabled) {
        var args = Array.prototype.slice.call(arguments, 1);
        args.unshift(this);
        var f = siesta.ext.http[method];
        f.apply(f, args);
    } else {
        throw InternalSiestaError('HTTP module not enabled');
    }
}

/**
 * Send a GET request
 * @param {String} path The path to the resource we want to GET
 * @param {Object|Function} optsOrCallback Either an options object or a callback if can use defaults
 * @param {Function} callback Callback if opts specified.
 * @package HTTP
 * @returns {Promise}
 */
Collection.prototype.GET = function() {
    return _.partial(this._http, 'GET').apply(this, arguments);
};

/**
 * Send a OPTIONS request
 * @param {String} path The path to the resource to which we want to send an OPTIONS request
 * @param {Object|Function} optsOrCallback Either an options object or a callback if can use defaults
 * @param {Function} callback Callback if opts specified.
 * @returns {Promise}
 */
Collection.prototype.OPTIONS = function() {
    return _.partial(this._http, 'OPTIONS').apply(this, arguments);
};

/**
 * Send a TRACE request
 * @param {path} path The path to the resource to which we want to send a TRACE request
 * @param {Object|Function} optsOrCallback Either an options object or a callback if can use defaults
 * @param {Function} callback Callback if opts specified.
 * @returns {Promise}
 */
Collection.prototype.TRACE = function() {
    return _.partial(this._http, 'TRACE').apply(this, arguments);
};

/**
 * Send a HEAD request
 * @param {String} path The path to the resource to which we want to send a HEAD request
 * @param {Object|Function} optsOrCallback Either an options object or a callback if can use defaults
 * @param {Function} callback Callback if opts specified.
 * @returns {Promise}
 */
Collection.prototype.HEAD = function() {
    return _.partial(this._http, 'HEAD').apply(this, arguments);
};

/**
 * Send a POST request
 * @param {String} path The path to the resource to which we want to send a POST request
 * @param {SiestaModel} model The model that we would like to POST
 * @param {Object|Function} optsOrCallback Either an options object or a callback if can use defaults
 * @param {Function} callback Callback if opts specified.
 * @returns {Promise}
 */
Collection.prototype.POST = function() {
    return _.partial(this._http, 'POST').apply(this, arguments);
};

/**
 * Send a PUT request
 * @param {String} path The path to the resource to which we want to send a PUT request
 * @param {SiestaModel} model The model that we would like to PUT
 * @param {Object|Function} optsOrCallback Either an options object or a callback if can use defaults
 * @param {Function} callback Callback if opts specified.
 * @returns {Promise}
 */
Collection.prototype.PUT = function() {
    _.partial(this._http, 'PUT').apply(this, arguments);
};

/**
 * Send a PATCH request
 * @param {String} path The path to the resource to which we want to send a PATCH request
 * @param {SiestaModel} model The model that we would like to PATCH
 * @param {Object|Function} optsOrCallback Either an options object or a callback if can use defaults
 * @param {Function} callback Callback if opts specified.
 * @returns {Promise}
 */
Collection.prototype.PATCH = function() {
    return _.partial(this._http, 'PATCH').apply(this, arguments);
};

/**
 * Send a DELETE request. Also removes the object.
 * @param {String} path The path to the resource to which we want to DELETE
 * @param {SiestaModel} model The model that we would like to PATCH
 * @param {Object|Function} optsOrCallback Either an options object or a callback if can use defaults
 * @param {Function} callback Callback if opts specified.
 * @returns {Promise}
 */
Collection.prototype.DELETE = function(path, object) {
    return _.partial(this._http, 'DELETE').apply(this, arguments);
};

/**
 * Returns the number of objects in this collection.
 *
 * @param callback
 * @returns {Promise}
 */
Collection.prototype.count = function(callback) {
    var deferred = window.q ? window.q.defer() : null;
    callback = util.constructCallbackAndPromiseHandler(callback, deferred);
    var tasks = _.map(this._mappings, function(m) {
        return _.bind(m.count, m);
    });
    util.parallel(tasks, function(err, ns) {
        var n;
        if (!err) {
            n = _.reduce(ns, function(m, r) {
                return m + r
            }, 0);
        }
        callback(err, n);
    });
    return deferred ? deferred.promise : null;
};

exports.Collection = Collection;
},{"../index":1,"../vendor/observe-js/src/observe":25,"./cache":4,"./collectionRegistry":7,"./error":8,"./mapping":10,"./operation/log":17,"./operation/operation":18,"./util":24,"extend":3}],7:[function(require,module,exports){
/**
 * @module collection 
 */
var _ = require('./util')._;

function CollectionRegistry() {
    if (!this) return new CollectionRegistry();
    this.collectionNames = [];
}

CollectionRegistry.prototype.register = function (collection) {
    var name = collection._name;
    this[name] = collection;
    this.collectionNames.push(name);
};

CollectionRegistry.prototype.reset = function () {
    var self = this;
    _.each(this.collectionNames, function (name) {
        delete self[name];
    });
    this.collectionNames = [];
};

exports.CollectionRegistry = new CollectionRegistry();
},{"./util":24}],8:[function(require,module,exports){
/**
 * @module error
 */

function InternalSiestaError(message, context, ssf) {
    this.message = message;
    this.context = context;
    // capture stack trace
    ssf = ssf || arguments.callee;
    if (ssf && Error.captureStackTrace) {
        Error.captureStackTrace(this, ssf);
    }
}

InternalSiestaError.prototype = Object.create(Error.prototype);
InternalSiestaError.prototype.name = 'InternalSiestaError';
InternalSiestaError.prototype.constructor = InternalSiestaError;

exports.InternalSiestaError = InternalSiestaError;

},{}],9:[function(require,module,exports){
/**
 * @module relationships
 */

var proxy = require('./proxy')
    , RelationshipProxy = proxy.RelationshipProxy
    , Store = require('./store')
    , util = require('./util')
    , _ = util._
    , InternalSiestaError = require('./error').InternalSiestaError
    , coreChanges = require('./changes')
    , notificationCentre = require('./notificationCentre')
    , wrapArrayForAttributes = notificationCentre.wrapArray
    , SiestaModel = require('./object').SiestaModel
    , ArrayObserver = require('../vendor/observe-js/src/observe').ArrayObserver
    , ChangeType = require('./changes').ChangeType
;

/**
 * [ManyToManyProxy description]
 * @param {Object} opts
 */
function ManyToManyProxy(opts) {
    RelationshipProxy.call(this, opts);
    var self = this;
    Object.defineProperty(this, 'isFault', {
        get: function () {
            if (self._id) {
                return !self.related;
            }
            return true;
        },
        set: function (v) {
            if (v) {
                self._id = undefined;
                self.related = null;
            }
            else {
                if (!self._id) {
                    self._id = [];
                    self.related = [];
                    wrapArray.call(self, self.related);
                }
            }
        }
    });
    this._reverseIsArray = true;
}


function clearReverse(removed) {
    var self = this;
    _.each(removed, function (removedObject) {
        var reverseProxy = proxy.getReverseProxyForObject.call(self, removedObject);
        var idx = reverseProxy._id.indexOf(self.object._id);
        proxy.makeChangesToRelatedWithoutObservations.call(reverseProxy, function (){
            proxy.splice.call(reverseProxy, idx, 1);
        });
    });
}

function setReverse(added) {
    var self = this;
    _.each(added, function (addedObject) {
        var reverseProxy = proxy.getReverseProxyForObject.call(self, addedObject);
        proxy.makeChangesToRelatedWithoutObservations.call(reverseProxy, function (){
            proxy.splice.call(reverseProxy, 0, 0, self.object);
        });
    });
}

function wrapArray(arr) {
    var self = this;
    wrapArrayForAttributes(arr, this.reverseName, this.object);
    if (!arr.oneToManyObserver) {
        arr.oneToManyObserver = new ArrayObserver(arr);
        var observerFunction = function (splices) {
            splices.forEach(function (splice) {
                var added = splice.addedCount ? arr.slice(splice.index, splice.index + splice.addedCount) : [];
                var removed = splice.removed;
                clearReverse.call(self, removed);
                setReverse.call(self, added);
                var mapping = proxy.getForwardMapping.call(self);
                coreChanges.registerChange({
                    collection: mapping.collection,
                    mapping: mapping.type,
                    _id: self.object._id,
                    field: proxy.getForwardName.call(self),
                    removed: removed,
                    added: added,
                    removedId: _.pluck(removed, '_id'),
                    addedId: _.pluck(added, '_id'),
                    type: ChangeType.Splice,
                    index: splice.index,
                    obj: self.object
                });
            });
        };
        arr.oneToManyObserver.open(observerFunction);
    }
}

ManyToManyProxy.prototype = Object.create(RelationshipProxy.prototype);

ManyToManyProxy.prototype.get = function (callback) {
    var deferred = window.q ? window.q.defer() : null;
    callback = util.constructCallbackAndPromiseHandler(callback, deferred);
    var self = this;
    if (this.isFault) {
        Store.get({_id: this._id}, function (err, stored) {
            if (err) {
                if (callback) callback(err);
            }
            else {
                self.related = stored;
                if (callback) callback(null, stored);
            }
        })
    }
    else {
        if (callback) callback(null, this.related);
    }
    return deferred ? deferred.promise : null;
};

function validate(obj) {
    if (Object.prototype.toString.call(obj) != '[object Array]') {
            return 'Cannot assign scalar to many to many';
        }
    return null;
}

ManyToManyProxy.prototype.set = function (obj) {
    proxy.checkInstalled.call(this);
    var self = this;
    if (obj) {
        var errorMessage;
        if (errorMessage = validate.call(this, obj)) {
            return errorMessage;
        }
        else {
            proxy.clearReverseRelated.call(this);
            proxy.set.call(self, obj);
            wrapArray.call(self, obj);
            proxy.setReverse.call(self, obj);
        }
    }
    else {
        proxy.clearReverseRelated.call(this);
        proxy.set.call(self, obj);
    }
};

ManyToManyProxy.prototype.install = function (obj) {
    RelationshipProxy.prototype.install.call(this, obj);
    obj[ ('splice' + util.capitaliseFirstLetter(this.reverseName))] = _.bind(proxy.splice, this);
};

exports.ManyToManyProxy = ManyToManyProxy;
},{"../vendor/observe-js/src/observe":25,"./changes":5,"./error":8,"./notificationCentre":13,"./object":14,"./proxy":20,"./store":23,"./util":24}],10:[function(require,module,exports){
/**
 * @module mapping
 */

var log = require('./operation/log');
var Logger = log.loggerWithName('Mapping');
Logger.setLevel(log.Level.warn);

var defineSubProperty = require('./misc').defineSubProperty;
var CollectionRegistry = require('./collectionRegistry').CollectionRegistry;
var InternalSiestaError = require('./error').InternalSiestaError;
var relationship = require('./relationship');
var RelationshipType = relationship.RelationshipType;
var Query = require('./query').Query;
var Operation = require('./operation/operation').Operation;
var BulkMappingOperation = require('./mappingOperation').BulkMappingOperation;
var SiestaModel = require('./object').SiestaModel;
var guid = require('./misc').guid;
var cache = require('./cache');
var store = require('./store');
var extend = require('extend');

var coreChanges = require('./changes');
var ChangeType = coreChanges.ChangeType;
var wrapArray = require('./notificationCentre').wrapArray;

var OneToManyProxy = require('./oneToManyProxy').OneToManyProxy;
var OneToOneProxy = require('./oneToOneProxy').OneToOneProxy;
var ManyToManyProxy = require('./manyToManyProxy').ManyToManyProxy;

var util = require('./util');
var _ = util._;

/**
 * 
 * @param {Object} opts
 */
function Mapping(opts) {
    var self = this;
    this._opts = opts;

    Object.defineProperty(this, '_fields', {
        get: function() {
            var fields = [];
            if (self._opts.id) {
                fields.push(self._opts.id);
            }
            if (self._opts.attributes) {
                _.each(self._opts.attributes, function(x) {
                    fields.push(x)
                });
            }
            return fields;
        },
        enumerable: true,
        configurable: true
    });

    /**
     * @name type
     * @type {String}
     */
    defineSubProperty.call(this, 'type', self._opts);

    /**
     * @name id
     * @type {String}
     */
    defineSubProperty.call(this, 'id', self._opts);
    defineSubProperty.call(this, 'collection', self._opts);
    defineSubProperty.call(this, 'attributes', self._opts);
    defineSubProperty.call(this, 'relationships', self._opts);
    defineSubProperty.call(this, 'indexes', self._opts);
    defineSubProperty.call(this, 'subclass', self._opts);
    defineSubProperty.call(this, 'singleton', self._opts);

    if (!this.relationships) {
        this.relationships = [];
    }

    if (!this.indexes) {
        this.indexes = [];
    }

    this._validateSubclass();

    this._installed = false;
    this._relationshipsInstalled = false;
    this._reverseRelationshipsInstalled = false;

    Object.defineProperty(this, 'installed', {
        get: function() {
            return self._installed && self._relationshipsInstalled && self._reverseRelationshipsInstalled;
        },
        enumerable: true,
        configurable: true
    });

}

/**
 * Ensure that any subclasses passed to the mapping are valid and working correctly.
 * @private
 */
Mapping.prototype._validateSubclass = function() {
    if (this.subclass && this.subclass !== SiestaModel) {
        var obj = new this.subclass(this);
        if (!obj.mapping) {
            throw new InternalSiestaError('Subclass for mapping "' + this.type + '" has not been configured correctly. ' +
                'Did you call super?');
        }
        if (this.subclass.prototype == SiestaModel.prototype) {
            throw new InternalSiestaError('Subclass for mapping "' + this.type + '" has not been configured correctly. ' +
                'You should use Object.create on SiestaModel prototype.');
        }
    }
};


Mapping.prototype.installRelationships = function() {
    if (!this._relationshipsInstalled) {
        var self = this;
        self._relationships = [];
        if (self._opts.relationships) {
            for (var name in self._opts.relationships) {
                if (Logger.debug.isEnabled)
                    Logger.debug(self.type + ': configuring relationship ' + name);
                if (self._opts.relationships.hasOwnProperty(name)) {
                    var relationship = self._opts.relationships[name];
                    if (relationship.type == RelationshipType.OneToMany ||
                        relationship.type == RelationshipType.OneToOne ||
                        relationship.type == RelationshipType.ManyToMany) {
                        var mappingName = relationship.mapping;
                        if (Logger.debug.isEnabled)
                            Logger.debug('reverseMappingName', mappingName);
                        if (!self.collection) throw new InternalSiestaError('Mapping must have collection');
                        var collection = CollectionRegistry[self.collection];
                        if (!collection) {
                            throw new InternalSiestaError('Collection ' + self.collection + ' not registered');
                        }
                        var reverseMapping = collection[mappingName];
                        if (!reverseMapping) {
                            var arr = mappingName.split('.');
                            if (arr.length == 2) {
                                var collectionName = arr[0];
                                mappingName = arr[1];
                                var otherCollection = CollectionRegistry[collectionName];
                                if (!otherCollection) {
                                    var err = 'Collection with name "' + collectionName + '" does not exist.';
                                    console.error(err, {
                                        registry: CollectionRegistry
                                    });
                                    return err;
                                }
                                reverseMapping = otherCollection[mappingName];
                            }
                        }
                        if (Logger.debug.isEnabled)
                            Logger.debug('reverseMapping', reverseMapping);
                        if (reverseMapping) {
                            relationship.reverseMapping = reverseMapping;
                            relationship.forwardMapping = this;
                            relationship.forwardName = name;
                            relationship.reverseName = relationship.reverse;
                            relationship.isReverse = false;
                        } else {
                            return 'Mapping with name "' + mappingName.toString() + '" does not exist';
                        }
                    } else {
                        return 'Relationship type ' + relationship.type + ' does not exist';
                    }
                }
            }
        }
        this._relationshipsInstalled = true;
    } else {
        throw new InternalSiestaError('Relationships for "' + this.type + '" have already been installed');
    }
    return null;
};

Mapping.prototype.installReverseRelationships = function() {
    if (!this._reverseRelationshipsInstalled) {
        for (var forwardName in this.relationships) {
            if (this.relationships.hasOwnProperty(forwardName)) {
                var relationship = this.relationships[forwardName];
                relationship = extend(true, {}, relationship);
                relationship.isReverse = true;
                var reverseMapping = relationship.reverseMapping;
                var reverseName = relationship.reverseName;
                if (Logger.debug.isEnabled)
                    Logger.debug(self.type + ': configuring  reverse relationship ' + name);
                reverseMapping.relationships[reverseName] = relationship;
            }
        }
        this._reverseRelationshipsInstalled = true;
    } else {
        throw new InternalSiestaError('Reverse relationships for "' + this.type + '" have already been installed.');
    }
};

Mapping.prototype.query = function(query, callback) {
    var deferred = window.q ? window.q.defer() : null;
    callback = util.constructCallbackAndPromiseHandler(callback, deferred);
    var _query = new Query(this, query);
    _query.execute(callback);
    return deferred ? deferred.promise : null;
};

Mapping.prototype.get = function(idOrCallback, callback) {
    var deferred = window.q ? window.q.defer() : null;
    callback = util.constructCallbackAndPromiseHandler(callback, deferred);

    function finish(err, res) {
        if (callback) callback(err, res);
    }

    if (this.singleton) {
        if (typeof idOrCallback == 'function') {
            callback = idOrCallback;
        }
        this.all(function(err, objs) {
            if (err) finish(err);
            if (objs.length > 1) {
                throw new InternalSiestaError('Somehow more than one object has been created for a singleton mapping! ' +
                    'This is a serious error, please file a bug report.');
            } else if (objs.length) {
                finish(null, objs[0]);
            } else {
                finish(null, objs[0]);
            }
        });
    } else {
        var opts = {};
        opts[this.id] = idOrCallback;
        opts.mapping = this;
        var obj = cache.get(opts);
        if (obj) {
            finish(null, obj);
        } else {
            delete opts.mapping;
            var query = new Query(this, opts);
            query.execute(function(err, rows) {
                var obj = null;
                if (!err && rows.length) {
                    if (rows.length > 1) {
                        err = 'More than one object with id=' + idOrCallback.toString();
                    } else {
                        obj = rows[0];
                    }
                }
                finish(err, obj);
            });
        }

    }
    return deferred ? deferred.promise : null;
};

Mapping.prototype.all = function(callback) {
    var deferred = window.q ? window.q.defer() : null;
    callback = util.constructCallbackAndPromiseHandler(callback, deferred);
    var query = new Query(this, {});
    query.execute(callback);
    return deferred ? deferred.promise : null;
};

Mapping.prototype.install = function(callback) {
    if (Logger.info.isEnabled) Logger.info('Installing mapping ' + this.type);
    var deferred = window.q ? window.q.defer() : null;
    callback = util.constructCallbackAndPromiseHandler(callback, deferred);
    if (!this._installed) {
        var errors = this._validate();
        this._installed = true;
        if (Logger.info.isEnabled) {
            if (errors.length) Logger.error('Errors installing mapping ' + this.type + ': ' + errors);
            else Logger.info('Installed mapping ' + this.type);
        }
        if (callback) callback(errors.length ? errors : null);
    } else {
        throw new InternalSiestaError('Mapping "' + this.type + '" has already been installed');
    }
    return deferred ? deferred.promise : null;
};

Mapping.prototype._validate = function() {
    var errors = [];
    if (!this.type) {
        errors.push('Must specify a type');
    }
    if (!this.collection) {
        errors.push('A mapping must belong to an collection');
    }
    return errors;
};


/**
 * Map data into Siesta.
 *
 * @param data Raw data received remotely or otherwise
 * @param callback Called once pouch persistence returns.
 * @param override Force mapping to this object
 */
Mapping.prototype.map = function(data, callback, override) {
    var deferred = window.q ? window.q.defer() : null;
    callback = util.constructCallbackAndPromiseHandler(callback, deferred);
    if (this.installed) {
        if (util.isArray(data)) {
            this._mapBulk(data, callback, override);
        } else {
            this._mapBulk([data], function(err, objects) {
                if (callback) {
                    var obj;
                    if (objects) {
                        if (objects.length) {
                            obj = objects[0];
                        }
                    }
                    callback(err ? err[0] : null, obj);
                }
            }, override ? [override] : undefined);
        }
    } else {
        throw new InternalSiestaError('Mapping must be fully installed before creating any models');
    }
    return deferred ? deferred.promise : null;
};

Mapping.prototype._mapBulk = function(data, callback, override) {
    var deferred = window.q ? window.q.defer() : null;
    callback = util.constructCallbackAndPromiseHandler(callback, deferred);
    var opts = {
        mapping: this,
        data: data
    };
    if (override) opts.objects = override;
    var op = new BulkMappingOperation(opts);
    op.onCompletion(function() {
        var err = op.error;
        if (err) {
            if (callback) callback(err);
        } else {
            var objects = op.result;
            callback(null, objects);
        }
    });
    op.start();
    return deferred ? deferred.promise : null;
};

function _countCache() {
    var collCache = cache._localCacheByType[this.collection] || {};
    var mappingCache = collCache[this.type] || {};
    return _.reduce(Object.keys(mappingCache), function(m, _id) {
        m[_id] = {};
        return m;
    }, {});
}

Mapping.prototype.count = function(callback) {
    var deferred = window.q ? window.q.defer() : null;
    callback = util.constructCallbackAndPromiseHandler(callback, deferred);
    var hash = _countCache.call(this);
    if (siesta.ext.storageEnabled) {
        var pouch = siesta.ext.storage.Pouch.getPouch();
        var indexName = (new siesta.ext.storage.Index(this.collection, this.type))._getName() + '_';
        pouch.query(indexName, {
            include_docs: false
        }, function(err, resp) {
            var n;
            if (!err) {
                _.each(_.pluck(resp.rows, 'id'), function(id) {
                    hash[id] = {};
                });
                n = Object.keys(hash).length;
            }
            callback(err, n);
        });
    } else {
        callback(null, Object.keys(hash).length)
    }
    return deferred ? deferred.promise : null;
};

/**
 * Convert raw data into a SiestaModel
 * @returns {SiestaModel}
 * @private
 */
Mapping.prototype._new = function(data) {
    if (this.installed) {
        var self = this;
        var _id;
        if (data) {
            _id = data._id ? data._id : guid();
        } else {
            _id = guid();
        }
        var newModel;
        if (this.subclass) {
            newModel = new this.subclass(this);
        } else {
            newModel = new SiestaModel(this);
        }
        if (Logger.info.isEnabled)
            Logger.info('New object created _id="' + _id.toString() + '", type=' + this.type, data);
        newModel._id = _id;
        // Place attributes on the object.
        newModel.__values = data || {};
        var fields = this._fields;
        var idx = fields.indexOf(this.id);
        if (idx > -1) {
            fields.splice(idx, 1);
        }
        _.each(fields, function(field) {
            Object.defineProperty(newModel, field, {
                get: function() {
                    return newModel.__values[field] || null;
                },
                set: function(v) {
                    var old = newModel.__values[field];
                    newModel.__values[field] = v;
                    coreChanges.registerChange({
                        collection: self.collection,
                        mapping: self.type,
                        _id: newModel._id,
                        new: v,
                        old: old,
                        type: ChangeType.Set,
                        field: field,
                        obj: newModel
                    });
                    if (util.isArray(v)) {
                        wrapArray(v, field, newModel);
                    }
                },
                enumerable: true,
                configurable: true
            });
        });

        Object.defineProperty(newModel, this.id, {
            get: function() {
                return newModel.__values[self.id] || null;
            },
            set: function(v) {
                var old = newModel[self.id];
                newModel.__values[self.id] = v;
                coreChanges.registerChange({
                    collection: self.collection,
                    mapping: self.type,
                    _id: newModel._id,
                    new: v,
                    old: old,
                    type: ChangeType.Set,
                    field: self.id,
                    obj: newModel
                });
                cache.remoteInsert(newModel, v, old);
            },
            enumerable: true,
            configurable: true
        });


        for (var name in this.relationships) {
            var proxy;
            if (this.relationships.hasOwnProperty(name)) {
                var relationship = this.relationships[name];
                if (relationship.type == RelationshipType.OneToMany) {
                    proxy = new OneToManyProxy(relationship);
                } else if (relationship.type == RelationshipType.OneToOne) {
                    proxy = new OneToOneProxy(relationship);
                } else if (relationship.type == RelationshipType.ManyToMany) {
                    proxy = new ManyToManyProxy(relationship);
                } else {
                    throw new InternalSiestaError('No such relationship type: ' + relationship.type);
                }
            }
            proxy.install(newModel);
            proxy.isFault = false;
        }
        cache.insert(newModel);
        coreChanges.registerChange({
            collection: this.collection,
            mapping: this.type,
            _id: newModel._id,
            newId: newModel._id,
            new: newModel,
            type: ChangeType.New,
            obj: newModel
        });
        return newModel;
    } else {
        util.printStackTrace();
        throw new InternalSiestaError('Mapping must be fully installed before creating any models');
    }

};

Mapping.prototype._dump = function(asJSON) {
    var dumped = {};
    dumped.name = this.type;
    dumped.attributes = this.attributes;
    dumped.id = this.id;
    dumped.collection = this.collection;
    dumped.relationships = _.map(this.relationships, function(r) {
        return r.isForward ? r.forwardName : r.reverseName;
    });
    return asJSON ? JSON.stringify(dumped, null, 4) : dumped;
};

Mapping.prototype.toString = function() {
    return 'Mapping[' + this.type + ']';
};

/**
 * A subclass of InternalSiestaError specifcally for errors that occur during mapping.
 * @param message
 * @param context
 * @param ssf
 * @returns {MappingError}
 * @constructor
 */
function MappingError(message, context, ssf) {
    if (!this) {
        return new MappingError(message, context);
    }

    this.message = message;

    this.context = context;
    // capture stack trace
    ssf = ssf || arguments.callee;
    if (ssf && InternalSiestaError.captureStackTrace) {
        InternalSiestaError.captureStackTrace(this, ssf);
    }
}

MappingError.prototype = Object.create(InternalSiestaError.prototype);
MappingError.prototype.name = 'MappingError';
MappingError.prototype.constructor = MappingError;

function arrayAsString(arr) {
    var arrContents = _.reduce(arr, function(memo, f) {
        return memo + '"' + f + '",'
    }, '');
    arrContents = arrContents.substring(0, arrContents.length - 1);
    return '[' + arrContents + ']';
}


function constructMapFunction(collection, type, fields) {
    var mapFunc;
    var onlyEmptyFieldSetSpecified = (fields.length == 1 && !fields[0].length);
    var noFieldSetsSpecified = !fields.length || onlyEmptyFieldSetSpecified;

    var arr = arrayAsString(fields);
    if (noFieldSetsSpecified) {
        mapFunc = function(doc) {
            var type = "$2";
            var collection = "$3";
            if (doc.type == type && doc.collection == collection) {
                emit(doc.type, doc);
            }
        }.toString();
    } else {
        mapFunc = function(doc) {
            var type = "$2";
            var collection = "$3";
            if (doc.type == type && doc.collection == collection) {
                //noinspection JSUnresolvedVariable
                var fields = $1;
                var aggField = '';
                for (var idx in fields) {
                    //noinspection JSUnfilteredForInLoop
                    var field = fields[idx];
                    var value = doc[field];
                    if (value !== null && value !== undefined) {
                        aggField += value.toString() + '_';
                    } else if (value === null) {
                        aggField += 'null_';
                    } else {
                        aggField += 'undefined_';
                    }
                }
                aggField = aggField.substring(0, aggField.length - 1);
                emit(aggField, doc);
            }
        }.toString();
        mapFunc = mapFunc.replace('$1', arr);
    }
    mapFunc = mapFunc.replace('$2', type);
    mapFunc = mapFunc.replace('$3', collection);
    return mapFunc;
}


function constructMapFunction2(collection, type, fields) {
    var mapFunc;
    var onlyEmptyFieldSetSpecified = (fields.length == 1 && !fields[0].length);
    var noFieldSetsSpecified = !fields.length || onlyEmptyFieldSetSpecified;

    if (noFieldSetsSpecified) {
        mapFunc = function(doc) {
            if (doc.type == type && doc.collection == collection) {
                emit(doc.type, doc);
            }
        };
    } else {
        mapFunc = function(doc) {
            if (doc.type == type && doc.collection == collection) {
                var aggField = '';
                for (var idx in fields) {
                    //noinspection JSUnfilteredForInLoop
                    var field = fields[idx];
                    var value = doc[field];
                    if (value !== null && value !== undefined) {
                        aggField += value.toString() + '_';
                    } else if (value === null) {
                        aggField += 'null_';
                    } else {
                        aggField += 'undefined_';
                    }
                }
                aggField = aggField.substring(0, aggField.length - 1);
                emit(aggField, doc);
            }
        };
    }
    return mapFunc;
}

exports.Mapping = Mapping;
exports.MappingError = MappingError;
exports.constructMapFunction2 = constructMapFunction2;
exports.constructMapFunction = constructMapFunction;
},{"./cache":4,"./changes":5,"./collectionRegistry":7,"./error":8,"./manyToManyProxy":9,"./mappingOperation":11,"./misc":12,"./notificationCentre":13,"./object":14,"./oneToManyProxy":15,"./oneToOneProxy":16,"./operation/log":17,"./operation/operation":18,"./query":21,"./relationship":22,"./store":23,"./util":24,"extend":3}],11:[function(require,module,exports){
/**
 * @module mapping
 */

var Store = require('./store');
var SiestaModel = require('./object').SiestaModel;
var log = require('./operation/log');
var Operation = require('./operation/operation').Operation;
var InternalSiestaError = require('../src/error').InternalSiestaError;
var Query = require('./query').Query;

var Logger = log.loggerWithName('MappingOperation');
Logger.setLevel(log.Level.warn);

var cache = require('./cache');
var util = require('./util');
var _ = util._;
var defineSubProperty = require('./misc').defineSubProperty;
var ChangeType = require('./changes').ChangeType;

function flattenArray(arr) {
    return _.reduce(arr, function(memo, e) {
        if (util.isArray(e)) {
            memo = memo.concat(e);
        } else {
            memo.push(e);
        }
        return memo;
    }, []);
}

function unflattenArray(arr, modelArr) {
    var n = 0;
    var unflattened = [];
    for (var i = 0; i < modelArr.length; i++) {
        if (util.isArray(modelArr[i])) {
            var newArr = [];
            unflattened[i] = newArr;
            for (var j = 0; j < modelArr[i].length; j++) {
                newArr.push(arr[n]);
                n++;
            }
        } else {
            unflattened[i] = arr[n];
            n++;
        }
    }
    return unflattened;
}

/**
 * Defines an encapsulated mapping operation where opts takes a mappin
 * @param {Objects} opts
 */
function BulkMappingOperation(opts) {
    Operation.call(this);

    this._opts = opts;

    /**
     * @name mapping
     * @type {Mapping}
     */
    defineSubProperty.call(this, 'mapping', this._opts);

    /**
     * @name data
     * @type {Array}
     */
    defineSubProperty.call(this, 'data', this._opts);

    /**
     * @name objects
     * @type {Array}
     */
    defineSubProperty.call(this, 'objects', this._opts);

    if (!this.objects) this.objects = [];

    /**
     * Array of errors where indexes map onto same index as the datum that caused an error.
     * @type {Array}
     */
    this.errors = [];

    this.name = 'Mapping Operation';
    this.work = _.bind(this._start, this);
    this.subOps = {};
}

BulkMappingOperation.prototype = Object.create(Operation.prototype);

function mapAttributes() {
    for (var i = 0; i < this.data.length; i++) {
        var datum = this.data[i];
        var object = this.objects[i];
        // No point mapping object onto itself. This happens if a SiestaModel is passed as a relationship.
        if (datum != object) {
            if (object) { // If object is falsy, then there was an error looking up that object/creating it.
                var fields = this.mapping._fields;
                _.each(fields, function(f) {
                    if (datum[f] !== undefined) { // null is fine
                        object[f] = datum[f];
                    }
                });
            }
        }
    }
}


BulkMappingOperation.prototype._map = function() {
    var self = this;
    var numHits = mapAttributes.call(this);
    var relationshipFields = _.keys(self.subOps);
    _.each(relationshipFields, function(f) {
        var op = self.subOps[f].op;
        var indexes = self.subOps[f].indexes;
        var relatedData = getRelatedData.call(self, f).relatedData;
        var unflattenedObjects = unflattenArray(op.objects, relatedData);
        for (var i = 0; i < unflattenedObjects.length; i++) {
            var idx = indexes[i];
            // Errors are plucked from the suboperations.
            var error = self.errors[idx];
            var err = error ? error[f] : null;
            if (!err) {
                var related = unflattenedObjects[i]; // Can be array or scalar.
                var object = self.objects[idx];
                if (object) {
                    var err = object[f + 'Proxy'].set(related);
                    if (err) {
                        if (!self.errors[idx]) self.errors[idx] = {};
                        self.errors[idx][f] = err;
                    }
                }
            }
        }
    });
};

/**
 * For indices where no object is present, perform lookups, creating a new object if necessary.
 * @private
 */
BulkMappingOperation.prototype._lookup = function(callback) {
    var deferred = window.q ? window.q.defer() : null;
    callback = util.constructCallbackAndPromiseHandler(callback, deferred);
    var self = this;
    var remoteLookups = [];
    var localLookups = [];
    for (var i = 0; i < this.data.length; i++) {
        if (!this.objects[i]) {
            var lookup;
            var datum = this.data[i];
            var isScalar = typeof datum == 'string' || typeof datum == 'number' || datum instanceof String;
            if (datum) {
                if (isScalar) {
                    lookup = {
                        index: i,
                        datum: {}
                    };
                    lookup.datum[self.mapping.id] = datum;
                    remoteLookups.push(lookup);
                } else if (datum instanceof SiestaModel) { // We won't need to perform any mapping.
                    this.objects[i] = datum;
                } else if (datum._id) {
                    localLookups.push({
                        index: i,
                        datum: datum
                    });
                } else if (datum[self.mapping.id]) {
                    remoteLookups.push({
                        index: i,
                        datum: datum
                    });
                } else {
                    // Create a new object if and only if the data has any fields that will actually
                    var datumFields = Object.keys(datum);
                    var objectFields = _.reduce(Object.keys(self.mapping.relationships).concat(self.mapping._fields), function(m, x) {
                        m[x] = {};
                        return m;
                    }, {});
                    var shouldCreateNewObject = false;
                    for (var j = 0; j < datumFields.length; j++) {
                        if (objectFields[datumFields[j]]) {
                            shouldCreateNewObject = true;
                            break;
                        }
                    }
                    if (shouldCreateNewObject) {
                        this.objects[i] = self.mapping._new();
                    }
                }
            } else {
                this.objects[i] = null;
            }
        }
    }
    util.parallel([
            function(callback) {
                var localIdentifiers = _.pluck(_.pluck(localLookups, 'datum'), '_id');
                if (localIdentifiers.length) {
                    Store.getMultipleLocal(localIdentifiers, function(err, objects) {
                        if (!err) {
                            for (var i = 0; i < localIdentifiers.length; i++) {
                                var obj = objects[i];
                                var _id = localIdentifiers[i];
                                var lookup = localLookups[i];
                                if (!obj) {
                                    self.errors[lookup.index] = {
                                        _id: 'No object with _id="' + _id.toString() + '"'
                                    };
                                } else {
                                    self.objects[lookup.index] = obj;
                                }
                            }
                        }
                        callback(err);
                    });
                } else {
                    callback();
                }
            },
            function(callback) {
                var remoteIdentifiers = _.pluck(_.pluck(remoteLookups, 'datum'), self.mapping.id);
                if (remoteIdentifiers.length) {
                    if (Logger.trace.isEnabled)
                        Logger.trace('Looking up remoteIdentifiers: ' + JSON.stringify(remoteIdentifiers, null, 4));
                    Store.getMultipleRemote(remoteIdentifiers, self.mapping, function(err, objects) {
                        if (!err) {
                            if (Logger.trace.isEnabled) {
                                var results = {};
                                for (i = 0; i < objects.length; i++) {
                                    results[remoteIdentifiers[i]] = objects[i] ? objects[i]._id : null;
                                }
                                Logger.trace('Results for remoteIdentifiers: ' + JSON.stringify(results, null, 4));
                            }
                            for (i = 0; i < objects.length; i++) {
                                var obj = objects[i];
                                var lookup = remoteLookups[i];
                                if (obj) {
                                    self.objects[lookup.index] = obj;
                                } else {
                                    var data = {};
                                    var remoteId = remoteIdentifiers[i];
                                    data[self.mapping.id] = remoteId;
                                    var cacheQuery = {
                                        mapping: self.mapping
                                    };
                                    cacheQuery[self.mapping.id] = remoteId;
                                    var cached = cache.get(cacheQuery);
                                    if (cached) {
                                        self.objects[lookup.index] = cached;
                                    } else {
                                        self.objects[lookup.index] = self.mapping._new();
                                        // It's important that we map the remote identifier here to ensure that it ends
                                        // up in the cache.
                                        self.objects[lookup.index][self.mapping.id] = remoteId;
                                    }
                                }
                            }
                        }
                        callback(err);
                    });
                } else {
                    callback();
                }
            }
        ],
        callback);
    return deferred ? deferred.promise : null;
};

BulkMappingOperation.prototype._lookupSingleton = function(callback) {
    var deferred = window.q ? window.q.defer() : null;
    callback = util.constructCallbackAndPromiseHandler(callback, deferred);
    var self = this;
    var cachedSingleton = cache.get({
        mapping: this.mapping
    });
    if (!cachedSingleton) {
        var query = new Query(this.mapping);
        query.execute(function(err, objs) {
            if (!err) {
                var obj;
                if (objs.length) {
                    if (objs.length == 1) {
                        obj = objs[0];
                    } else {
                        throw new InternalSiestaError();
                    }
                } else {
                    obj = self.mapping._new();
                }
                for (var i = 0; i < self.data.length; i++) {
                    self.objects[i] = obj;
                }
            }
            callback(err);
        });
    } else {
        for (var i = 0; i < self.data.length; i++) {
            self.objects[i] = cachedSingleton;
        }
        callback();
    }
    return deferred ? deferred.promise : null;
};

BulkMappingOperation.prototype._start = function(done) {
    if (this.data.length) {
        var self = this;
        var tasks = [];
        var lookupFunc = this.mapping.singleton ? this._lookupSingleton : this._lookup;
        tasks.push(_.bind(lookupFunc, this));
        tasks.push(_.bind(this._executeSubOperations, this));
        util.parallel(tasks, function() {
            self._map();
            done(self.errors.length ? self.errors : null, self.objects);
        });
    } else {
        done(null, []);
    }
};

function getRelatedData(name) {
    var indexes = [];
    var relatedData = [];
    for (var i = 0; i < this.data.length; i++) {
        var datum = this.data[i];
        if (datum) {
            if (datum[name]) {
                indexes.push(i);
                relatedData.push(datum[name]);
            }
        }
    }
    return {
        indexes: indexes,
        relatedData: relatedData
    };
}

BulkMappingOperation.prototype._constructSubOperations = function() {
    var subOps = this.subOps;
    var relationships = this.mapping.relationships;
    for (var name in relationships) {
        if (relationships.hasOwnProperty(name)) {
            var relationship = relationships[name];
            var reverseMapping = relationship.forwardName == name ? relationship.reverseMapping : relationship.forwardMapping;
            var __ret = getRelatedData.call(this, name);
            var indexes = __ret.indexes;
            var relatedData = __ret.relatedData;
            if (relatedData.length) {
                var flatRelatedData = flattenArray(relatedData);
                var op = new BulkMappingOperation({
                    mapping: reverseMapping,
                    data: flatRelatedData
                });
                op.__relationshipName = name;
                subOps[name] = {
                    op: op,
                    indexes: indexes
                };
            }
        }
    }
};

function gatherErrorsFromSubOperations() {
    var self = this;
    var relationshipNames = _.keys(this.subOps);
    _.each(relationshipNames, function(name) {
        var op = self.subOps[name].op;
        var indexes = self.subOps[name].indexes;
        var errors = op.errors;
        if (errors.length) {
            var relatedData = getRelatedData.call(self, name).relatedData;
            var unflattenedErrors = unflattenArray(errors, relatedData);
            for (var i = 0; i < unflattenedErrors.length; i++) {
                var idx = indexes[i];
                var err = unflattenedErrors[i];
                var isError = err;
                if (util.isArray(err)) isError = _.reduce(err, function(memo, x) {
                    return memo || x
                }, false);
                if (isError) {
                    if (!self.errors[idx]) self.errors[idx] = {};
                    self.errors[idx][name] = err;
                }
            }
        }
    });
}

BulkMappingOperation.prototype._executeSubOperations = function(callback) {
    var self = this;
    this._constructSubOperations();
    var relationshipNames = _.keys(this.subOps);
    if (relationshipNames.length) {
        var subOperations = _.map(relationshipNames, function(k) {
            return self.subOps[k].op
        });
        var compositeOperation = new Operation(subOperations);
        compositeOperation.onCompletion(function() {
            gatherErrorsFromSubOperations.call(self, relationshipNames);
            callback();
        });
        compositeOperation.start();
    } else {
        callback();
    }
};

exports.BulkMappingOperation = BulkMappingOperation;
exports.flattenArray = flattenArray;
exports.unflattenArray = unflattenArray;
},{"../src/error":8,"./cache":4,"./changes":5,"./misc":12,"./object":14,"./operation/log":17,"./operation/operation":18,"./query":21,"./store":23,"./util":24}],12:[function(require,module,exports){
var InternalSiestaError = require('./error').InternalSiestaError;

function assert(condition, message, context) {
    if (!condition) {
        message = message || "Assertion failed";
        context = context || {};
        throw new InternalSiestaError(message, context);
    }
}

function defineSubProperty (property, subObj, innerProperty) {
    return Object.defineProperty(this, property, {
        get: function () {
            if (innerProperty) {
                return subObj[innerProperty];
            }
            else {
                return subObj[property];
            }
        },
        set: function (value) {
            if (innerProperty) {
                subObj[innerProperty] = value;
            }
            else {
                subObj[property] = value;
            }
        },
        enumerable: true,
        configurable: true
    });
}

var guid = (function () {
    function s4() {
        return Math.floor((1 + Math.random()) * 0x10000)
            .toString(16)
            .substring(1);
    }

    return function () {
        return s4() + s4() + '-' + s4() + '-' + s4() + '-' +
            s4() + '-' + s4() + s4() + s4();
    };
})();

function wrappedCallback (callback) {
    return function (err, res) {
        if (callback) callback(err, res);
    }
}

exports.assert = assert;
exports.defineSubProperty = defineSubProperty;
exports.guid = guid;
exports.wrappedCallback = wrappedCallback;
},{"./error":8}],13:[function(require,module,exports){
var EventEmitter = require('events').EventEmitter;
var notificationCentre = new EventEmitter();
notificationCentre.setMaxListeners(100);
var ArrayObserver = require('../vendor/observe-js/src/observe').ArrayObserver;
var coreChanges = require('./changes');
var ChangeType = coreChanges.ChangeType;
var log = require('./operation/log');

/**
* Wraps the methods of a javascript array object so that notifications are sent
* on calls.
*
* @param array the array we have wrapping
* @param field name of the field
* @param restObject the object to which this array is a property
*/
function wrapArray(array, field, siestaModel) {
    if (!array.observer) {
        array.observer = new ArrayObserver(array);
        array.observer.open(function (splices) {
            var fieldIsAttribute = siestaModel._fields.indexOf(field) > -1;
            if (fieldIsAttribute) {
                splices.forEach(function (splice) {
                    coreChanges.registerChange({
                        collection: siestaModel.collection,
                        mapping: siestaModel.mapping.type,
                        _id: siestaModel._id,
                        index: splice.index,
                        removed: splice.removed,
                        added: splice.addedCount ? array.slice(splice.index, splice.index+splice.addedCount) : [],
                        type: coreChanges.ChangeType.Splice,
                        field: field,
                        obj: siestaModel
                    });
                });
            }
        });
        array.isFault = false;
    }
}

exports.notificationCentre = notificationCentre;
exports.wrapArray = wrapArray;
},{"../vendor/observe-js/src/observe":25,"./changes":5,"./operation/log":17,"events":2}],14:[function(require,module,exports){
var log = require('./operation/log');
var Logger = log.loggerWithName('SiestaModel');
Logger.setLevel(log.Level.warn);

var defineSubProperty = require('./misc').defineSubProperty;
//var OperationQueue = require('../vendor/operations.js/src/queue').OperationQueue;
var util = require('./util');
var _ = util._;
var error = require('./error');
var InternalSiestaError = error.InternalSiestaError;
var coreChanges = require('./changes');

var cache = require('./cache');

//var queues = {};

function SiestaModel(mapping) {

    if (!this) {
        return new SiestaModel(mapping);
    }
    var self = this;
    this.mapping = mapping;
    Object.defineProperty(this, 'idField', {
        get: function() {
            return self.mapping.id ? self.mapping.id : 'id';
        },
        enumerable: true,
        configurable: true
    });
    defineSubProperty.call(this, 'type', this.mapping);
    defineSubProperty.call(this, 'collection', this.mapping);
    defineSubProperty.call(this, '_fields', this.mapping);
    Object.defineProperty(this, '_relationshipFields', {
        get: function() {
            return _.map(self._proxies, function(p) {
                if (p.isForward) {
                    return p.forwardName;
                } else {
                    return p.reverseName;
                }
            });
        },
        enumerable: true,
        configurable: true
    });


    this.isFault = false;

    Object.defineProperty(this, 'isSaved', {
        get: function() {
            return !!self._rev;
        },
        enumerable: true,
        configurable: true
    });

    this._rev = null;

    this.removed = false;
}

/**
 * Human readable dump of this object
 * @returns {*}
 * @private
 */
SiestaModel.prototype._dump = function(asJson) {
    var self = this;
    var cleanObj = {};
    cleanObj.mapping = this.mapping.type;
    cleanObj.collection = this.collection;
    cleanObj._id = this._id;
    cleanObj = _.reduce(this._fields, function(memo, f) {
        if (self[f]) {
            memo[f] = self[f];
        }
        return memo;
    }, cleanObj);
    cleanObj = _.reduce(this._relationshipFields, function(memo, f) {
        if (self[f + 'Proxy']) {
            if (self[f + 'Proxy'].hasOwnProperty('_id')) {
                if (util.isArray(self[f + 'Proxy']._id)) {
                    if (self[f].length) {
                        memo[f] = self[f + 'Proxy']._id;
                    }
                } else if (self[f + 'Proxy']._id) {
                    memo[f] = self[f + 'Proxy']._id;
                }
            } else {
                memo[f] = self[f];
            }
        }
        return memo;
    }, cleanObj);

    return asJson ? JSON.stringify(cleanObj, null, 4) : cleanObj;
};


SiestaModel.prototype.get = function(callback) {
    var deferred = window.q ? window.q.defer() : null;
    callback = util.constructCallbackAndPromiseHandler(callback, deferred);
    callback(null, this);
    return deferred ? deferred.promise : null;
};

SiestaModel.prototype.remove = function(callback) {
    var deferred = window.q ? window.q.defer() : null;
    callback = util.constructCallbackAndPromiseHandler(callback, deferred);
    cache.remove(this);
    this.removed = true;
    coreChanges.registerChange({
        collection: this.collection,
        mapping: this.mapping.type,
        _id: this._id,
        oldId: this._id,
        old: this,
        type: coreChanges.ChangeType.Remove,
        obj: this
    });
    callback(null, this);
    return deferred ? deferred.promise : null;
}

SiestaModel.prototype.restore = function(callback) {
    var deferred = window.q ? window.q.defer() : null;
    callback = util.constructCallbackAndPromiseHandler(callback, deferred);
    if (this.removed) {
        cache.insert(this);
        this.removed = false;
    }
    coreChanges.registerChange({
        collection: this.collection,
        mapping: this.mapping.type,
        _id: this._id,
        newId: this._id,
        new: this,
        type: coreChanges.ChangeType.New,
        obj: this
    });
    callback(null, this);
    return deferred ? deferred.promise : null;
}

exports.SiestaModel = SiestaModel;
exports.dumpSaveQueues = function() {
    var dumped = {};
    for (var id in queues) {
        if (queues.hasOwnProperty(id)) {
            var queue = queues[id];
            dumped[id] = {
                numRunning: queue.numRunningOperations,
                queued: queue._queuedOperations.length
            };
        }
    }
    return dumped;
};
},{"./cache":4,"./changes":5,"./error":8,"./misc":12,"./operation/log":17,"./util":24}],15:[function(require,module,exports){
/**
 * @module relationships
 */

var proxy = require('./proxy')
    , RelationshipProxy = proxy.RelationshipProxy
    , Store = require('./store')
    , util = require('./util')
    , _ = util._
    , InternalSiestaError = require('./error').InternalSiestaError
    , coreChanges = require('./changes')
    , SiestaModel = require('./object').SiestaModel
    , notificationCentre = require('./notificationCentre')
    , wrapArrayForAttributes = notificationCentre.wrapArray
    , ArrayObserver = require('../vendor/observe-js/src/observe').ArrayObserver
    , ChangeType = require('./changes').ChangeType
    ;

/**
 * @class  [OneToManyProxy description]
 * @constructor
 * @param {[type]} opts
 */
function OneToManyProxy(opts) {
    RelationshipProxy.call(this, opts);

    var self = this;
    Object.defineProperty(this, 'isFault', {
        get: function () {
            if (self.isForward) {
                if (self._id) {
                    return !self.related;
                }
                else if (self._id === null) {
                    return false;
                }
                return true;
            }
            else {
                if (self._id) {
                    if (self.related) {
                        if (self._id.length != self.related.length) {
                            validateRelated.call(this);
                            return true;
                        }
                        else {
                            return false;
                        }
                    }
                    return true;
                }
                return true;
            }
        },
        set: function (v) {
            if (v) {
                self._id = undefined;
                self.related = null;
            }
            else {
                if (!self._id) {
                    if (self.isForward) {
                        self._id = null;
                    }
                    else {
                        self._id = [];
                        self.related = [];
                        wrapArray.call(self, self.related);
                    }
                }
            }
        }
    });
    this._reverseIsArray = true;
    this._forwardIsArray = false;
}

OneToManyProxy.prototype = Object.create(RelationshipProxy.prototype);


function clearReverse(removed) {
    var self = this;
    _.each(removed, function (removedObject) {
        var reverseProxy = proxy.getReverseProxyForObject.call(self, removedObject);
        proxy.set.call(reverseProxy, null);
    });
}

function setReverse(added) {
    var self = this;
    _.each(added, function (added) {
        var forwardProxy = proxy.getReverseProxyForObject.call(self, added);
        proxy.set.call(forwardProxy, self.object);
    });
}

function wrapArray(arr) {
    var self = this;
    wrapArrayForAttributes(arr, this.reverseName, this.object);
    if (!arr.oneToManyObserver) {
        arr.oneToManyObserver = new ArrayObserver(arr);
        var observerFunction = function (splices) {
            splices.forEach(function (splice) {
                var added = splice.addedCount ? arr.slice(splice.index, splice.index + splice.addedCount) : [];
                var removed = splice.removed;
                clearReverse.call(self, removed);
                setReverse.call(self, added);
                var mapping = proxy.getForwardMapping.call(self);
                coreChanges.registerChange({
                    collection: mapping.collection,
                    mapping: mapping.type,
                    _id: self.object._id,
                    field: proxy.getForwardName.call(self),
                    removed: removed,
                    added: added,
                    removedId: _.pluck(removed, '_id'),
                    addedId: _.pluck(added, '_id'),
                    type: ChangeType.Splice,
                    index: splice.index,
                    obj: self.object
                });
            });
        };
        arr.oneToManyObserver.open(observerFunction);
    }
}


OneToManyProxy.prototype.get = function (callback) {
    var deferred = window.q ? window.q.defer() : null;
    callback = util.constructCallbackAndPromiseHandler(callback, deferred);
    var self = this;
    if (this.isFault) {
        if (this._id.length) {
            var storeOpts = {_id: this._id};
            Store.get(storeOpts, function (err, stored) {
                if (err) {
                    if (callback) callback(err);
                }
                else {
                    self.related = stored;
                    if (callback) callback(null, stored);
                }
            });
        }
        else if (callback) {
            callback(null, this.related);
        }
    }
    else {
        if (callback) callback(null, this.related);
    }
    return deferred ? deferred.promise : null;
};

/**
 * Validate the object that we're setting
 * @param obj
 * @returns {string|null} An error message or null
 */
function validate(obj) {
    var str = Object.prototype.toString.call(obj);
    if (this.isForward) {
        if (str == '[object Array]') {
            return 'Cannot assign array forward oneToMany (' + str + '): ' + this.forwardName;
        }
    }
    else {
        if (str != '[object Array]') {
            return 'Cannot scalar to reverse oneToMany (' + str + '): ' + this.reverseName;
        }
    }
    return null;
}

function validateRelated() {
    var self = this;
    if (self._id) {
        if (self.related) {
            if (self._id.length != self.related.length) {
                if (self.related.length > 0) {
                    throw new InternalSiestaError('_id and related are somehow out of sync');
                }
            }
        }
    }
}

OneToManyProxy.prototype.set = function (obj) {
    proxy.checkInstalled.call(this);
    var self = this;
    if (obj) {
        var errorMessage;
        if (errorMessage = validate.call(this, obj)) {
            return errorMessage;
        }
        else {
            proxy.clearReverseRelated.call(this);
            proxy.set.call(self, obj);
            if (self.isReverse) {
                wrapArray.call(this, self.related);
            }
            proxy.setReverse.call(self, obj);
        }
    }
    else {
        proxy.clearReverseRelated.call(this);
        proxy.set.call(self, obj);
    }
};

OneToManyProxy.prototype.install = function (obj) {
    RelationshipProxy.prototype.install.call(this, obj);
    if (this.isReverse) {
        obj[ ('splice' + util.capitaliseFirstLetter(this.reverseName))] = _.bind(proxy.splice, this);
    }
};


exports.OneToManyProxy = OneToManyProxy;
},{"../vendor/observe-js/src/observe":25,"./changes":5,"./error":8,"./notificationCentre":13,"./object":14,"./proxy":20,"./store":23,"./util":24}],16:[function(require,module,exports){
/**
 * @module relationships
 */

var proxy = require('./proxy')
    , RelationshipProxy = proxy.RelationshipProxy
    , Store = require('./store')
    , util = require('./util')
    , InternalSiestaError = require('./error').InternalSiestaError
    , SiestaModel = require('./object').SiestaModel;

/**
 * [OneToOneProxy description]
 * @param {Object} opts
 */
function OneToOneProxy(opts) {
    RelationshipProxy.call(this, opts);
    this._reverseIsArray = false;
    this._forwardIsArray = false;
}

OneToOneProxy.prototype = Object.create(RelationshipProxy.prototype);

/**
 * Validate the object that we're setting
 * @param obj
 * @returns {string|null} An error message or null
 */
function validate(obj) {
    if (Object.prototype.toString.call(obj) == '[object Array]') {
        return 'Cannot assign array to one to one relationship';
    }
    else if ((!obj instanceof SiestaModel)) {

    }
    return null;
}

OneToOneProxy.prototype.set = function (obj) {
    proxy.checkInstalled.call(this);
    var self = this;
    if (obj) {
        var errorMessage;
        if (errorMessage = validate(obj)) {
            return errorMessage;
        }
        else {
            proxy.clearReverseRelated.call(this);
            proxy.set.call(self, obj);
            proxy.setReverse.call(self, obj);
        }
    }
    else {
        proxy.clearReverseRelated.call(this);
        proxy.set.call(self, obj);
    }
};

OneToOneProxy.prototype.get = function (callback) {
    var deferred = window.q ? window.q.defer() : null;
    callback = util.constructCallbackAndPromiseHandler(callback, deferred);
    var self = this;
    if (this._id) {
        Store.get({_id: this._id}, function (err, stored) {
            if (err) {
                if (callback) callback(err);
            }
            else {
                self.related = stored;
                if (callback) callback(null, stored);
            }
        })
    }
    return deferred ? deferred.promise : null;
};

exports.OneToOneProxy = OneToOneProxy;
},{"./error":8,"./object":14,"./proxy":20,"./store":23,"./util":24}],17:[function(require,module,exports){
var _ = require('../util')._;

function Logger (name) {
    if (!this) return new Logger(name);
    this.name = name;

    this.trace = constructPerformer(this, _.bind(console.debug ? console.debug : console.log, console), Logger.Level.trace);
    this.debug = constructPerformer(this, _.bind(console.debug ? console.debug  : console.log, console), Logger.Level.debug);
    this.info = constructPerformer(this, _.bind(console.info ? console.info : console.log, console), Logger.Level.info);
    this.log = constructPerformer(this, _.bind(console.log ? console.log : console.log, console), Logger.Level.info);
    this.warn = constructPerformer(this, _.bind(console.warn ? console.warn : console.log, console), Logger.Level.warning);
    this.error = constructPerformer(this, _.bind(console.error ? console.error : console.log, console), Logger.Level.error);
    this.fatal = constructPerformer(this, _.bind(console.error ? console.error : console.log, console), Logger.Level.fatal);

}

var logLevels = {};

function constructPerformer (logger, f, level) {
    var performer = function (message) {
        logger.performLog(f, level, message, arguments);
    };
    Object.defineProperty(performer, 'isEnabled', {
        get: function () {
            var currentLevel = logger.currentLevel();
            return level >= currentLevel;
        },
        enumerable: true,
        configurable: true
    });
    performer.f = f;
    performer.logger = logger;
    performer.level = level;
    return performer;
}

Logger.Level = {
    trace: 0,
    debug: 1,
    info: 2,
    warning: 3,
    warn: 3,
    error: 4,
    fatal: 5
};

Logger.LevelText = {};
Logger.LevelText [Logger.Level.trace] = 'TRACE';
Logger.LevelText [Logger.Level.debug] = 'DEBUG';
Logger.LevelText [Logger.Level.info] = 'INFO ';
Logger.LevelText [Logger.Level.warning] = 'WARN ';
Logger.LevelText [Logger.Level.error] = 'ERROR';

Logger.levelAsText = function (level) {
    return this.LevelText[level];
};

Logger.loggerWithName = function (name) {
    return new Logger(name);
};

Logger.prototype.currentLevel = function () {
    var logLevel = logLevels[this.name];
    return  logLevel ? logLevel : Logger.Level.trace;
};

Logger.prototype.setLevel = function (level) {
    logLevels[this.name] = level;
};

Logger.prototype.override = function (level, override, message) {
    var levelAsText = Logger.levelAsText(level);
    var performer = this[levelAsText.trim().toLowerCase()];
    var f = performer.f;
    var otherArguments = Array.prototype.slice.call(arguments, 3, arguments.length);
    this.performLog(f, level, message, otherArguments, override);
};

Logger.prototype.performLog = function (logFunc, level, message, otherArguments, override) {
    var self = this;
    var currentLevel = override !== undefined ? override : this.currentLevel();
    if (currentLevel <= level) {
        logFunc = _.partial(logFunc, Logger.levelAsText(level) + ' [' + self.name + ']: ' + message);
        var args = [];
        for (var i=0; i<otherArguments.length; i++) {
            args[i] = otherArguments[i];
        }
        args.splice(0, 1);
        logFunc.apply(logFunc, args);
    }
};

module.exports = Logger;

},{"../util":24}],18:[function(require,module,exports){
var log = require('./log');
var Logger = log.loggerWithName('Operation');
var _ = require('../util')._;

function Operation() {
    if (!this) {
        return new (Function.prototype.bind.apply(Operation, arguments));
    }
    var self = this;
    if (arguments.length) {
        if (typeof(arguments[0]) == 'string') {
            this.name = arguments[0];
            this.work = arguments[1];
            this.completion = arguments[2];
        }
        else if (typeof(arguments[0]) == 'function' ||
            Object.prototype.toString.call(arguments[0]) === '[object Array]' ||
            arguments[0] instanceof Operation) {
            this.work = arguments[0];
            this.completion = arguments[1];
        }
    }
    this.error = null;
    this.completed = false;
    this.result = null;
    this.running = false;
    this.cancelled = false;
    this.dependencies = [];
    this._mustSucceed = [];
    this._onCompletion = [];
    this.logLevel = null; // Override.

    Object.defineProperty(this, 'failed', {
        get: function () {
            return  !!self.error || self.failedDueToDependency;
        },
        enumerable: true,
        configurable: true
    });

    Object.defineProperty(this, 'composite', {
        get: function () {
            return self.work instanceof Operation ||
                Object.prototype.toString.call(self.work) === '[object Array]'
        },
        enumerable: true,
        configurable: true
    });

    Object.defineProperty(this, 'numOperationsRemaining', {
        get: function () {
            if (self.work instanceof Operation) {
                return self.work.completed ? 0 : 1
            }
            else if (Object.prototype.toString.call(self.work) === '[object Array]') {
                return _.reduce(self.work, function (memo, op) {
                    if (!op.completed) {
                        return memo + 1;
                    }
                    return memo;
                }, 0);
            }
            else {
                return null;
            }
        },
        enumerable: true,
        configurable: true
    });

    Object.defineProperty(this, 'canRun', {
        get: function () {
            if (self.dependencies.length) {
                return _.reduce(self.dependencies, function (memo, dep) {
                    var mustSucceed = self._mustSucceed.indexOf(dep) > -1;
                    var canRun = memo && dep.completed;
                    if (mustSucceed && canRun) {
                        canRun = canRun && !(dep.failed || dep.cancelled);
                    }
                    return canRun;
                }, true);
            }
            return true;
        },
        enumerable: true,
        configurable: true
    });

    Object.defineProperty(this, 'failedDueToDependency', {
        get: function () {
            if (self.dependencies.length) {
                var failedDeps = _.reduce(self.dependencies, function (memo, dep) {
                    var mustSucceed = self._mustSucceed.indexOf(dep) > -1;
                    var failed = ((dep.failed || dep.cancelled) && mustSucceed);
                    if (failed) {
                        memo.push(dep);
                    }
                    return memo;
                }, []);
                return failedDeps.length ? failedDeps : false;
            }
            return false;
        },
        enumerable: true,
        configurable: true
    });

    Object.defineProperty(this, 'failedDueToCancellationOfDependency', {
        get: function () {
            if (self.dependencies.length) {
                var cancelled = _.reduce(self.dependencies, function (memo, dep) {
                    var mustSucceed = self._mustSucceed.indexOf(dep) > -1;
                    if (mustSucceed) {
                        if (dep.cancelled) memo.push(dep);
                    }
                    return memo;
                }, []);
                return cancelled.length ? cancelled : false;
            }
            return false;
        },
        enumerable: true,
        configurable: true
    });

    Object.defineProperty(this, 'loggingOveridden', {
        get: function () {
            if (self.logLevel) {
                return self.logLevel <= log.Level.info;
            }
            return false;
        },
        enumerable: true,
        configurable: true
    })


}

Operation.running = [];

Operation.prototype._startSingle = function () {
    var self = this;
    this.work(function (err, payload) {
        self.result = payload;
        self.error = err;
        self.completed = true;
        self.running = false;
        self._complete();
    });
};

Operation.prototype._startComposite = function () {
    var self = this;
    var operations = self.work instanceof Operation ? [self.work] : self.work;
    _.each(operations, function (op) {
        op.onCompletion(function () {
            var numOperationsRemaining = self.numOperationsRemaining;
            var name = self.name || 'Unnamed';
            Logger.debug(name + ' has ' + numOperationsRemaining.toString() + ' operations remaining');
            if (!numOperationsRemaining) {
                var errors = _.pluck(operations, 'error');
                var results = _.pluck(operations, 'result');
                self.result = _.some(results) ? results : null;
                self.error = _.some(errors) ? errors : null;
                self.completed = true;
                self.running = false;
                self._complete();
            }
        });
        op.start();
    });
};

Operation.prototype._logCompletion = function () {
    var logFunc = this._getLogFunc();
    if (Logger.info.isEnabled || this.loggingOveridden) {
        var name = this.name || 'Unnamed';
        var failedDependencies = this.failedDueToDependency;
        if (failedDependencies) {
            logFunc('"' + name + '" failed due to failure/cancellation of dependencies: ' + _.pluck(failedDependencies, 'name').join(', '));
        }
        else if (this.failed) {
            var err = this.error;
            // Remove null errors.
            if (Object.prototype.toString.call(err) === '[object Array]') {
                err = _.filter(err, function (e) {return e });
            }
            else {
                err = [this.error];
            }
            logFunc('"' + name + '" failed due to errors:', err);
        }
        else if (this.cancelled) {
            logFunc('"' + name + '" has been cancelled.');
        }
        else {
            logFunc('"' + name + '" has succeeded.');
        }
    }
};

Operation.prototype._getLogFunc = function () {
    if (this.logLevel) {
        return _.bind(Logger.override, Logger, log.Level.info, this.logLevel);
    }
    return Logger.info;
};

Operation.prototype._logStart = function () {
    if (Logger.info.isEnabled || this.loggingOveridden) {
        var name = this.name || 'Unnamed';
        var logFunc = this._getLogFunc();
        logFunc('"' + name + '" has started.');
    }
};


Operation.prototype._complete = function () {
    var self = this;
    this.completed = true;
    var idx = Operation.running.indexOf(this);
    Operation.running.splice(idx, 1);
    if (this.completion) {
        _.bind(this.completion, this)();
    }
    this._logCompletion();
    _.each(this._onCompletion, function (o) {
        _.bind(o, self)();
    });
};

Operation.prototype.__start = function () {
    this._logStart();
    if (this.work) {
        if (this.composite) {
            this._startComposite();
        }
        else {
            this._startSingle();
        }
        Operation.running.push(this);
    }
    else {
        this.result = null;
        this.error = null;
        this.running = false;
        this._complete();
    }
};

Operation.prototype.start = function () {
    var self = this;
    var neverStarted = !this.running && !this.completed;
    var neverStartedAndFailed = neverStarted && this.failed;
    // A dependency failed or was cancelled before this operation started.
    if (neverStartedAndFailed) {
        this._complete();
    }
    else if (neverStarted) {
        this.running = true;
        if (this.canRun) {
            this.__start();
        }
        else {
            _.each(this.dependencies, function (dep) {
                dep.onCompletion(function () {
                    if (self.canRun) {
                        self.__start();
                    }
                })
            });
        }
    }
};


Operation.prototype.addDependency = function () {
    var self = this;
    if (arguments.length == 1) {
        this.dependencies.push(arguments[0]);
    }
    else if (arguments.length) {
        var args = arguments;
        var lastArg = args[args.length - 1];
        var mustSucceed = false;
        if (typeof(lastArg) == 'boolean') {
            args = Array.prototype.slice.call(args, 0, args.length - 1);
            mustSucceed = lastArg;
        }
        _.each(args, function (arg) {
            self.dependencies.push(arg);
        });
        if (mustSucceed) {
            _.each(args, function (arg) {
                self._mustSucceed.push(arg);
            })
        }
    }
};

Operation.prototype.onCompletion = function (o) {
    if (!this.completed) {
        this._onCompletion.push(o);
    }
    else {
        _.bind(o, this)();
    }
};

Operation.prototype.cancel = function (callback) {
    if (!this.cancelled) {
        this.cancelled = true;
        Logger.debug('Cancelling ' + this.name, this);
        if (this.composite) {
            _.each(this.work, function (subop) {
                subop.cancel();
            });
        }
        this.onCompletion(function () {
            this.running = false;
            if (callback) callback();
        });
    }
};

Object.defineProperty(Operation, 'logLevel', {
    get: function () {
        return Logger.currentLevel();
    },
    set: function (v) {
        Logger.setLevel(v);
    },
    configurable: true,
    enumerable: true
});

module.exports.Operation = Operation;

},{"../util":24,"./log":17}],19:[function(require,module,exports){

var log = require('./log');
var Logger = log.loggerWithName('OperationQueue');
var _ = require('../util')._;


function OperationQueue() {

    if (!this) {
        return new (Function.prototype.bind.apply(OperationQueue, arguments));
    }
    var self = this;

    if (arguments.length) {
        if (typeof(arguments[0]) == 'number') {
            this.maxConcurrentOperations = arguments[0];
        }
        else {
            this.name = arguments[0];
            this.maxConcurrentOperations = arguments[1];
        }
    }

    this._queuedOperations = [];
    this._runningOperations = [];
    this._running = false;
    this._onStart = [];
    this._onStop = [];
    this.logLevel = null;

    Object.defineProperty(this, 'numRunningOperations', {
        get: function () {
            return self._runningOperations.length;
        },
        configurable: true,
        enumerable: true
    });

    Object.defineProperty(this, 'loggingOveridden', {
        get: function () {
            if (self.logLevel) {
                return self.logLevel <= log.Level.info;
            }
            return false;
        },
        enumerable: true,
        configurable: true
    })
}

OperationQueue.prototype._nextOperations = function () {
    var self = this;
    while ((self._runningOperations.length < self.maxConcurrentOperations) && self._queuedOperations.length) {
        var op = self._queuedOperations[0];
        self._queuedOperations.splice(0, 1);
        self._runOperation(op);
    }
};


OperationQueue.prototype._runOperation = function (op) {
    var self = this;
    for (var i = 0; i < this._queuedOperations.length; i++) {
        if (this._queuedOperations[i] == op) {
            this._queuedOperations.splice(i, 1);
            break;
        }
    }
    this._runningOperations.push(op);
    op.completion = function () {
        var idx = self._runningOperations.indexOf(op);
        self._runningOperations.splice(idx, 1);
        if (self._running) {
            self._nextOperations();
        }
        self._logStatus();
    };
    op.start();
    this._logStatus();
};

OperationQueue.prototype._logStatus = function () {
    var logFunc = this._getLogFunc();
    if (Logger.info.isEnabled || this.loggingOveridden) {
        var numRunning = this.numRunningOperations;
        var numQueued = this._queuedOperations.length;
        var name = this.name || "Unnamed Queue";
        if (numRunning && numQueued) {
            logFunc('"' + name + '" now has ' + numRunning.toString() + ' operations running and ' + numQueued.toString() + ' operations queued');
        }
        else if (numRunning) {
            logFunc('"' + name + '" now has ' + numRunning.toString() + ' operations running');
        }
        else if (numQueued) {
            logFunc('"' + name + '" now has ' + numQueued.toString() + ' operations queued');
        }
        else {
            logFunc('"' + name + '" has no operations running or queued');
        }
    }
};

OperationQueue.prototype._logStart = function () {
    var logFunc = this._getLogFunc();
    if (Logger.info.isEnabled || this.loggingOveridden) {
        var name = this.name || "Unnamed Queue";
        logFunc('"' + name + '" is now running');
    }
};

OperationQueue.prototype._getLogFunc = function () {
    if (this.logLevel) {
        return _.bind(Logger.override, Logger, log.Level.info, this.logLevel);
    }
    return Logger.info;
};


OperationQueue.prototype._logStop = function () {
    var logFunc = this._getLogFunc();
    if (Logger.info.isEnabled || this.loggingOveridden) {
        var name = this.name || "Unnamed Queue";
        logFunc('"' + name + '" is no longer running');
    }
};

OperationQueue.prototype._addOperation = function (op) {
    if (this.numRunningOperations < this.maxConcurrentOperations && this._running) {
        this._runOperation(op);
    }
    else {
        this._queuedOperations.push(op);
    }
    this._logStatus();
};

OperationQueue.prototype.addOperation = function (operationOrOperations) {
    var self = this;
    if (Object.prototype.toString.call(operationOrOperations) === '[object Array]') {
        _.each(operationOrOperations, function (op) {self._addOperation(op)});
    }
    else {
        this._addOperation(operationOrOperations);
    }
};

OperationQueue.prototype.start = function () {
    var self = this;
    var wasRunning = this._running;
    this._running = true;
    if (!wasRunning) {
        _.each(self._onStart, function (c) {
            _.bind(c, self)();
        });
        self._nextOperations();
        self._logStart();
    }
};

OperationQueue.prototype.stop = function (cancel) {
    var self = this;
    var wasRunning = this._running;
    this._running = false;
    if (wasRunning) {
        if (cancel) {
            var operations = this._runningOperations.slice(0); // Clone so not fighting callbacks.
            _.each(operations, function (o) {
                o.cancel();
            });
        }
        self._logStop();
        _.each(self._onStop, function (c) {
            _.bind(c, self)();
        });
    }
};

OperationQueue.prototype.onStart = function (o) {
    this._onStart.push(o);
};
OperationQueue.prototype.onStop = function (o) {
    this._onStop.push(o);
};

Object.defineProperty(OperationQueue, 'logLevel', {
    get: function () {
        return Logger.currentLevel();
    },
    set: function (v) {
        Logger.setLevel(v);
    },
    configurable: true,
    enumerable: true
});


module.exports.OperationQueue = OperationQueue;

},{"../util":24,"./log":17}],20:[function(require,module,exports){
/**
 * @module relationships
 */

var InternalSiestaError = require('./error').InternalSiestaError,
    Store = require('./store'),
    defineSubProperty = require('./misc').defineSubProperty,
    Operation = require('./operation/operation').Operation,
    util = require('./util'),
    _ = util._,
    Query = require('./query').Query,
    log = require('./operation/log'),
    notificationCentre = require('./notificationCentre'),
    wrapArrayForAttributes = notificationCentre.wrapArray,
    ArrayObserver = require('../vendor/observe-js/src/observe').ArrayObserver,
    coreChanges = require('./changes'),
    ChangeType = coreChanges.ChangeType;

/**
 * @class  [Fault description]
 * @param {RelationshipProxy} proxy
 * @constructor
 */
function Fault(proxy) {
    var self = this;
    this.proxy = proxy;
    Object.defineProperty(this, 'isFault', {
        get: function() {
            return self.proxy.isFault;
        },
        enumerable: true,
        configurable: true
    });
}

Fault.prototype.get = function() {
    this.proxy.get.apply(this.proxy, arguments);
};

Fault.prototype.set = function() {
    this.proxy.set.apply(this.proxy, arguments);
};

/**
 * @class  [RelationshipProxy description]
 * @param {Object} opts
 * @constructor
 */
function RelationshipProxy(opts) {
    this._opts = opts;
    if (!this) return new RelationshipProxy(opts);
    var self = this;
    this.fault = new Fault(this);
    this.object = null;
    this._id = undefined;
    this.related = null;
    Object.defineProperty(this, 'isFault', {
        get: function() {
            if (self._id) {
                return !self.related;
            } else if (self._id === null) {
                return false;
            }
            return true;
        },
        set: function(v) {
            if (v) {
                self._id = undefined;
                self.related = null;
            } else {
                if (!self._id) {
                    self._id = null;
                }
            }
        },
        enumerable: true,
        configurable: true
    });
    defineSubProperty.call(this, 'reverseMapping', this._opts);
    defineSubProperty.call(this, 'forwardMapping', this._opts);
    defineSubProperty.call(this, 'forwardName', this._opts);
    defineSubProperty.call(this, 'reverseName', this._opts);
    defineSubProperty.call(this, 'isReverse', this._opts);
    Object.defineProperty(this, 'isForward', {
        get: function() {
            return !self.isReverse;
        },
        set: function (v) {
            self.isReverse = !v;
        },
        enumerable: true,
        configurable: true
    });
    if (this._opts.isReverse === undefined && this._opts.isForward !== undefined) {
        this.isReverse = !this._opts.isForward;
    }
    else if (this._opts.isReverse === undefined && this._opts.isForward === undefined) {
        throw InternalSiestaError('Must specify either isReverse or isForward when configuring relationship proxy.');
    }
 }

RelationshipProxy.prototype._dump = function(asJson) {
    var dumped = {};
};

RelationshipProxy.prototype.install = function(obj) {
    if (obj) {
        if (!this.object) {
            this.object = obj;
            var self = this;
            var name = getForwardName.call(this);
            Object.defineProperty(obj, name, {
                get: function() {
                    if (self.isFault) {
                        return self.fault;
                    } else {
                        return self.related;
                    }
                },
                set: function(v) {
                    self.set(v);
                },
                configurable: true,
                enumerable: true
            });
            obj[('get' + util.capitaliseFirstLetter(name))] = _.bind(this.get, this);
            obj[('set' + util.capitaliseFirstLetter(name))] = _.bind(this.set, this);
            obj[name + 'Proxy'] = this;
            if (!obj._proxies) {
                obj._proxies = [];
            }
            obj._proxies.push(this);
        } else {
            throw new InternalSiestaError('Already installed.');
        }
    } else {
        throw new InternalSiestaError('No object passed to relationship install');
    }
};

RelationshipProxy.prototype.set = function(obj) {
    throw new InternalSiestaError('Must subclass RelationshipProxy');
};

RelationshipProxy.prototype.get = function(callback) {
    throw new InternalSiestaError('Must subclass RelationshipProxy');
};

function verifyMapping(obj, mapping) {
    if (obj.mapping != mapping) {
        var err = 'Mapping does not match. Expected ' + mapping.type + ' but got ' + obj.mapping.type;
        throw new InternalSiestaError(err);
    }
}

// TODO: Share code between getReverseProxyForObject and getForwardProxyForObject

function getReverseProxyForObject(obj) {
    var reverseName = getReverseName.call(this);
    var proxyName = (reverseName + 'Proxy');
    var reverseMapping = this.reverseMapping;
    // This should never happen. Should g   et caught in the mapping operation?
    if (util.isArray(obj)) {
        // _.each(obj, function(o) {
        //     verifyMapping(o, this.forwardMapping);
        // });
        return _.pluck(obj, proxyName);
    } else {
        // verifyMapping(obj, this.forwardMapping);
        var proxy = obj[proxyName];
        if (!proxy) {
            var err = 'No proxy with name "' + proxyName + '" on mapping ' + reverseMapping.type;
            throw new InternalSiestaError(err);
        }
        return proxy;
    }
}

function getForwardProxyForObject(obj) {
    var forwardName = getForwardName.call(this);
    var proxyName = forwardName + 'Proxy';
    var forwardMapping = this.forwardMapping;
    if (util.isArray(obj)) {
        // _.each(obj, function(o) {
        //     verifyMapping(o, this.reverseMapping);
        // });
        return _.pluck(obj, proxyName);
    } else {
        // verifyMapping(obj, this.reverseMapping);
        var proxy = obj[proxyName];
        if (!proxy) {
            var err = 'No proxy with name "' + proxyName + '" on mapping ' + forwardMapping.type;
            throw new InternalSiestaError(err);
        }
        return proxy;
    }
}

function getReverseName() {
    return this.isForward ? this.reverseName : this.forwardName;
}

function getForwardName() {
    return this.isForward ? this.forwardName : this.reverseName;
}

function getReverseMapping() {
    return this.isForward ? this.reverseMapping : this.forwardMapping;
}

function getForwardMapping() {
    return this.isForward ? this.forwardMapping : this.reverseMapping;
}

function checkInstalled() {
    if (!this.object) {
        throw new InternalSiestaError('Proxy must be installed on an object before can use it.');
    }
}

/**
 * Configure _id and related with the new related object.
 * @param obj
 */
function set(obj) {
    registerSetChange.call(this, obj);
    if (obj) {
        if (util.isArray(obj)) {
            this._id = _.pluck(obj, '_id');
            this.related = obj;
        } else {
            this._id = obj._id;
            this.related = obj;
        }
    } else {
        this._id = null;
        this.related = null;
    }
}

function splice(idx, numRemove) {
    registerSpliceChange.apply(this, arguments);
    var add = Array.prototype.slice.call(arguments, 2);
    var returnValue = _.partial(this._id.splice, idx, numRemove).apply(this._id, _.pluck(add, '_id'));
    if (this.related) {
        _.partial(this.related.splice, idx, numRemove).apply(this.related, add);
    }
    return returnValue;
}

function objAsString(obj) {
    function _objAsString(obj) {
        if (obj) {
            var mapping = obj.mapping;
            var mappingName = mapping.type;
            var ident = obj._id;
            if (typeof ident == 'string') {
                ident = '"' + ident + '"';
            }
            return mappingName + '[_id=' + ident + ']';
        } else if (obj === undefined) {
            return 'undefined';
        } else if (obj === null) {
            return 'null';
        }
    }

    if (util.isArray(obj)) return _.map(_objAsString, obj).join(', ');
    return _objAsString(obj);
}

function clearReverseRelated() {
    var self = this;
    if (!self.isFault) {
        if (this.related) {
            var reverseProxy = getReverseProxyForObject.call(this, this.related);
            var reverseProxies = util.isArray(reverseProxy) ? reverseProxy : [reverseProxy];
            _.each(reverseProxies, function(p) {
                if (util.isArray(p._id)) {
                    var idx = p._id.indexOf(self.object._id);
                    makeChangesToRelatedWithoutObservations.call(p, function() {
                        splice.call(p, idx, 1);
                    });
                } else {
                    set.call(p, null);
                }
            });
        }
    } else {
        if (self._id) {
            var reverseName = getReverseName.call(this);
            var reverseMapping = getReverseMapping.call(this);
            var identifiers = util.isArray(self._id) ? self._id : [self._id];
            if (this._reverseIsArray) {
                _.each(identifiers, function(_id) {
                    coreChanges.registerChange({
                        collection: reverseMapping.collection,
                        mapping: reverseMapping.type,
                        _id: _id,
                        field: reverseName,
                        removedId: [self.object._id],
                        removed: [self.object],
                        type: ChangeType.Delete,
                        obj: self.object
                    });
                });
            } else {
                _.each(identifiers, function(_id) {
                    coreChanges.registerChange({
                        collection: reverseMapping.collection,
                        mapping: reverseMapping.type,
                        _id: _id,
                        field: reverseName,
                        new: null,
                        newId: null,
                        oldId: self.object._id,
                        old: self.object,
                        type: ChangeType.Set,
                        obj: self.object
                    });
                });
            }

        } else {
            throw new Error(getForwardName.call(this) + ' has no _id');
        }
    }
}

function makeChangesToRelatedWithoutObservations(f) {
    if (this.related) {
        this.related.oneToManyObserver.close();
        this.related.oneToManyObserver = null;
        f();
        wrapArray.call(this, this.related);
    } else {
        // If there's a fault we can make changes anyway.
        f();
    }
}

function setReverse(obj) {
    var self = this;
    var reverseProxy = getReverseProxyForObject.call(this, obj);
    var reverseProxies = util.isArray(reverseProxy) ? reverseProxy : [reverseProxy];
    _.each(reverseProxies, function(p) {
        if (util.isArray(p._id)) {
            makeChangesToRelatedWithoutObservations.call(p, function() {
                splice.call(p, p._id.length, 0, self.object);
            });
        } else {
            clearReverseRelated.call(p);
            set.call(p, self.object);
        }
    });
}

function registerSetChange(obj) {
    var proxyObject = this.object;
    if (!proxyObject) throw new InternalSiestaError('Proxy must have an object associated');
    var mapping = proxyObject.mapping.type;
    var coll = proxyObject.collection;
    var newId;
    if (util.isArray(obj)) {
        newId = _.pluck(obj, '_id');
    } else {
        newId = obj ? obj._id : obj;
    }
    // We take [] == null == undefined in the case of relationships.
    var oldId = this._id;
    if (util.isArray(oldId) && !oldId.length) {
        oldId = null;
    }
    var old = this.related;
    if (util.isArray(old) && !old.length) {
        old = null;
    }
    coreChanges.registerChange({
        collection: coll,
        mapping: mapping,
        _id: proxyObject._id,
        field: getForwardName.call(this),
        newId: newId,
        oldId: oldId,
        old: old,
        new: obj,
        type: ChangeType.Set,
        obj: proxyObject
    });
}

function registerSpliceChange(idx, numRemove) {
    var add = Array.prototype.slice.call(arguments, 2);
    var mapping = this.object.mapping.type;
    var coll = this.object.collection;
    coreChanges.registerChange({
        collection: coll,
        mapping: mapping,
        _id: this.object._id,
        field: getForwardName.call(this),
        index: idx,
        removedId: this._id.slice(idx, idx + numRemove),
        removed: this.related ? this.related.slice(idx, idx + numRemove) : null,
        addedId: add.length ? _.pluck(add, '_id') : [],
        added: add.length ? add : [],
        type: ChangeType.Splice,
        obj: this.object
    });
}


function wrapArray(arr) {
    var self = this;
    wrapArrayForAttributes(arr, this.reverseName, this.object);
    if (!arr.oneToManyObserver) {
        arr.oneToManyObserver = new ArrayObserver(arr);
        var observerFunction = function(splices) {
            splices.forEach(function(splice) {
                var added = splice.addedCount ? arr.slice(splice.index, splice.index + splice.addedCount) : [];
                var mapping = getForwardMapping.call(self);
                coreChanges.registerChange({
                    collection: mapping.collection,
                    mapping: mapping.type,
                    _id: self.object._id,
                    field: getForwardName.call(self),
                    removed: splice.removed,
                    added: added,
                    removedId: _.pluck(splice.removed, '_id'),
                    addedId: _.pluck(splice.added, '_id'),
                    type: ChangeType.Splice,
                    obj: self.object
                });
            });
        };
        arr.oneToManyObserver.open(observerFunction);
    }
}

exports.RelationshipProxy = RelationshipProxy;
exports.Fault = Fault;
exports.getReverseProxyForObject = getReverseProxyForObject;
exports.getForwardProxyForObject = getForwardProxyForObject;
exports.getReverseName = getReverseName;
exports.getForwardName = getForwardName;
exports.getReverseMapping = getReverseMapping;
exports.getForwardMapping = getForwardMapping;
exports.checkInstalled = checkInstalled;
exports.set = set;
exports.registerSetChange = registerSetChange;
exports.splice = splice;
exports.clearReverseRelated = clearReverseRelated;
exports.setReverse = setReverse;
exports.objAsString = objAsString;
exports.wrapArray = wrapArray;
exports.registerSpliceChange = registerSpliceChange;
exports.makeChangesToRelatedWithoutObservations = makeChangesToRelatedWithoutObservations;
},{"../vendor/observe-js/src/observe":25,"./changes":5,"./error":8,"./misc":12,"./notificationCentre":13,"./operation/log":17,"./operation/operation":18,"./query":21,"./store":23,"./util":24}],21:[function(require,module,exports){
/**
 * @module query
 */

var log = require('./operation/log')
    , cache = require('./cache')
    , Logger = log.loggerWithName('Query')
    , util = require('./util');
Logger.setLevel(log.Level.warn);

/**
 * @class  [Query description]
 * @param {Mapping} mapping
 * @param {Object} opts
 */
function Query(mapping, opts) {
    this.mapping = mapping;
    this.query = opts;
}

/**
 * If the storage extension is enabled, objects may be faulted and so we need to query via PouchDB. The storage
 * extension provides the RawQuery class to enable this.
 * @param callback
 * @private
 */
function _executeUsingStorageExtension(callback) {
    var deferred = window.q ? window.q.defer() : null;
    callback = util.constructCallbackAndPromiseHandler(callback, deferred);
    var storageExtension = siesta.ext.storage;
    var RawQuery = storageExtension.RawQuery;
    var Pouch = storageExtension.Pouch;
    var rawQuery = new RawQuery(this.mapping.collection, this.mapping.type, this.query);
    rawQuery.execute(function (err, results) {
        if (err) {
            callback(err);
        } else {
            if (Logger.debug.isEnabled)
                Logger.debug('got results', results);
            if (callback) callback(null, Pouch.toSiesta(results));
        }
    });
    return deferred ? deferred.promise : null;
}

/**
 * Returns true if the given object matches the query.
 * @param {SiestaModel} obj
 * @returns {boolean}
 */
function objectMatchesQuery(obj) {
    var fields = Object.keys(this.query);
    for (var i = 0; i < fields.length; i++) {
        var origField = fields[i];
        var splt = origField.split('__');
        var op = 'e';
        var field;
        if (splt.length == 2) {
            field = splt[0]
            op = splt[1];
        } else {
            field = origField;
        }
        var queryObj = this.query[origField];
        var val = obj[field];
        if (op == 'e') {
            if (val != queryObj) {
                return false;
            }
        } else if (op == 'lt') {
            if (val >= queryObj) {
                return false;
            }
        } else if (op == 'lte') {
            if (val > queryObj) {
                return false;
            }
        } else if (op == 'gt') {
            if (val <= queryObj) {
                return false;
            }
        } else if (op == 'gte') {
            if (val < queryObj) {
                return false;
            }
        } else {
            return 'Query operator "' + op + '"' + ' does not exist';
        }
    }
    return true;
}

/**
 * If the storage extension is not enabled, we simply cycle through all objects of the type requested in memory.
 * @param callback
 * @private
 */
function _executeInMemory(callback) {
    var deferred = window.q ? window.q.defer() : null;
    callback = util.constructCallbackAndPromiseHandler(callback, deferred);
    var cacheByType = cache._localCacheByType;
    var mappingName = this.mapping.type;
    var collectionName = this.mapping.collection;
    var cacheByMapping = cacheByType[collectionName];
    var cacheByLocalId;
    if (cacheByMapping) {
        cacheByLocalId = cacheByMapping[mappingName];
    }
    if (cacheByLocalId) {
        var keys = Object.keys(cacheByLocalId);
        var self = this;
        var res = [];
        var err;
        for (var i = 0; i < keys.length; i++) {
            var k = keys[i];
            var obj = cacheByLocalId[k];
            var matches = objectMatchesQuery.call(self, obj);
            if (typeof(matches) == 'string') {
                err = matches;
                break;
            } else {
                if (matches) res.push(obj);
            }
        }
        callback(err, err ? null : res);
    } else if (callback) {
        callback(null, []);
    }
    return deferred ? deferred.promise : null;
}

Query.prototype.execute = function (callback) {
    var deferred = window.q ? window.q.defer() : null;
    callback = util.constructCallbackAndPromiseHandler(callback, deferred);
    // if (siesta.ext.storageEnabled) {
    //     _executeUsingStorageExtension.call(this, callback);
    // }
    // else {
    _executeInMemory.call(this, callback);
    // }
    return deferred ? deferred.promise : null;
};

Query.prototype._dump = function (asJson) {
    // TODO
    return asJson ? '{}' : {};
};

exports.Query = Query;
},{"./cache":4,"./operation/log":17,"./util":24}],22:[function(require,module,exports){
/**
 * @module relationship
 */

/**
 * Constants that describe relationships for mappings.
 * @type {Object}
 */
RelationshipType = {
    OneToMany: 'OneToMany',
    OneToOne: 'OneToOne',
    ManyToMany: 'ManyToMany'
};

exports.RelationshipType = RelationshipType;
},{}],23:[function(require,module,exports){
/**
 * The "store" is responsible for mediating between the in-memory cache and any persistent storage.
 * Note that persistent storage has not been properly implemented yet and so this is pretty useless.
 * All queries will go straight to the cache instead.
 * @module store
 */

var wrappedCallback = require('./misc').wrappedCallback;
var InternalSiestaError = require('./error').InternalSiestaError;
var log = require('./operation/log');
var Logger = log.loggerWithName('Store');
Logger.setLevel(log.Level.warn);

var util = require('./util');
var _ = util._;
var cache = require('./cache');


/**
 * [get description]
 * @param  {Object}   opts
 * @param  {Function} callback
 * @return {Promise}
 * @example
 * ```js
 * var xyz = 'afsdf';
 * ```
 * @example
 * ```js
 * var abc = 'asdsd';
 * ```
 */
function get(opts, callback) {
    var deferred = window.q ? window.q.defer() : null;
    callback = util.constructCallbackAndPromiseHandler(callback, deferred);
    if (Logger.debug.isEnabled)
        Logger.debug('get', opts);
    var siestaModel;
    if (opts._id) {
        if (util.isArray(opts._id)) {
            // Proxy onto getMultiple instead.
            getMultiple(_.map(opts._id, function(id) {
                return {
                    _id: id
                }
            }), callback);
        } else {
            siestaModel = cache.get(opts);
            if (siestaModel) {
                if (Logger.debug.isEnabled)
                    Logger.debug('Had cached object', {
                        opts: opts,
                        obj: siestaModel
                    });
                wrappedCallback(callback)(null, siestaModel);
            } else {
                if (util.isArray(opts._id)) {
                    // Proxy onto getMultiple instead.
                    getMultiple(_.map(opts._id, function(id) {
                        return {
                            _id: id
                        }
                    }), callback);
                } else if (callback) {
                    var storage = siesta.ext.storage;
                    if (storage) {
                        storage.store.getFromPouch(opts, callback);
                    } else {
                        throw 'Storage module not installed'
                    }
                }
            }
        }
    } else if (opts.mapping) {
        if (util.isArray(opts[opts.mapping.id])) {
            // Proxy onto getMultiple instead.
            getMultiple(_.map(opts[opts.mapping.id], function(id) {
                var o = {};
                o[opts.mapping.id] = id;
                o.mapping = opts.mapping;
                return o
            }), callback);
        } else {
            siestaModel = cache.get(opts);
            if (siestaModel) {
                if (Logger.debug.isEnabled)
                    Logger.debug('Had cached object', {
                        opts: opts,
                        obj: siestaModel
                    });
                wrappedCallback(callback)(null, siestaModel);
            } else {
                var mapping = opts.mapping;
                if (mapping.singleton) {
                    mapping.get(callback);
                } else {
                    var idField = mapping.id;
                    var id = opts[idField];
                    if (id) {
                        mapping.get(id, function(err, obj) {
                            if (!err) {
                                if (obj) {
                                    callback(null, obj);
                                } else {
                                    callback(null, null);
                                }
                            } else {
                                callback(err);
                            }
                        });
                    } else {
                        wrappedCallback(callback)(new InternalSiestaError('Invalid options given to store. Missing "' + idField.toString() + '."', {
                            opts: opts
                        }));
                    }
                }

            }
        }
    } else {
        // No way in which to find an object locally.
        var context = {
            opts: opts
        };
        var msg = 'Invalid options given to store';
        Logger.error(msg, context);
        wrappedCallback(callback)(new InternalSiestaError(msg, context));
    }
    return deferred ? deferred.promise : null;
}

function getMultiple(optsArray, callback) {
    var deferred = window.q ? window.q.defer() : null;
    callback = util.constructCallbackAndPromiseHandler(callback, deferred);
    var docs = [];
    var errors = [];
    _.each(optsArray, function(opts) {
        get(opts, function(err, doc) {
            if (err) {
                errors.push(err);
            } else {
                docs.push(doc);
            }
            if (docs.length + errors.length == optsArray.length) {
                if (callback) {
                    if (errors.length) {
                        callback(errors);
                    } else {
                        callback(null, docs);
                    }
                }
            }
        });
    });
    return deferred ? deferred.promise : null;
}
/**
 * Uses pouch bulk fetch API. Much faster than getMultiple.
 * @param localIdentifiers
 * @param callback
 */
function getMultipleLocal(localIdentifiers, callback) {
    var deferred = window.q ? window.q.defer() : null;
    callback = util.constructCallbackAndPromiseHandler(callback, deferred);
    var results = _.reduce(localIdentifiers, function(memo, _id) {
        var obj = cache.get({
            _id: _id
        });
        if (obj) {
            memo.cached[_id] = obj;
        } else {
            memo.notCached.push(_id);
        }
        return memo;
    }, {
        cached: {},
        notCached: []
    });

    function finish(err) {
        if (callback) {
            if (err) {
                callback(err);
            } else {
                callback(null, _.map(localIdentifiers, function(_id) {
                    return results.cached[_id];
                }));
            }
        }
    }
    if (siesta.ext.storageEnabled && results.notCached.length) {
        siesta.ext.storage.store.getMultipleLocalFromCouch(results, finish);
    } else {
        finish();
    }
    return deferred ? deferred.promise : null;
}

function getMultipleRemote(remoteIdentifiers, mapping, callback) {
    var deferred = window.q ? window.q.defer() : null;
    callback = util.constructCallbackAndPromiseHandler(callback, deferred);
    var results = _.reduce(remoteIdentifiers, function(memo, id) {
        var cacheQuery = {
            mapping: mapping
        };
        cacheQuery[mapping.id] = id;
        var obj = cache.get(cacheQuery);
        if (obj) {
            memo.cached[id] = obj;
        } else {
            memo.notCached.push(id);
        }
        return memo;
    }, {
        cached: {},
        notCached: []
    });

    function finish(err) {
        if (callback) {
            if (err) {
                callback(err);
            } else {
                callback(null, _.map(remoteIdentifiers, function(id) {
                    return results.cached[id];
                }));
            }
        }
    }

    if (siesta.ext.storageEnabled && results.notCached.length) {
        siesta.ext.storage.store.getMultipleRemoteFrompouch(mapping, remoteIdentifiers, results, finish);
    } else {
        finish();
    }
    return deferred ? deferred.promise : null;
}

exports.get = get;
exports.getMultiple = getMultiple;
exports.getMultipleLocal = getMultipleLocal;
exports.getMultipleRemote = getMultipleRemote;
},{"./cache":4,"./error":8,"./misc":12,"./operation/log":17,"./util":24}],24:[function(require,module,exports){
/*
 * This is a collection of utilities taken from libraries such as async.js, underscore.js etc.
 * @module util
 */

function printStackTrace() {
    var e = new Error('printStackTrace');
    var stack = e.stack;
    console.log(stack);
}

function capitaliseFirstLetter(string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
}

exports.printStackTrace = printStackTrace;
exports.capitaliseFirstLetter = capitaliseFirstLetter;

var root = {};
// START async.js //

var isArray = Array.isArray || function(obj) {
    return _toString.call(obj) === '[object Array]';
};

function doParallel(fn) {
    return function() {
        var args = Array.prototype.slice.call(arguments);
        return fn.apply(null, [each].concat(args));
    };
}

var map = doParallel(_asyncMap);

function _map(arr, iterator) {
    if (arr.map) {
        return arr.map(iterator);
    }
    var results = [];
    each(arr, function(x, i, a) {
        results.push(iterator(x, i, a));
    });
    return results;
}

function _asyncMap(eachfn, arr, iterator, callback) {
    arr = _map(arr, function(x, i) {
        return {
            index: i,
            value: x
        };
    });
    if (!callback) {
        eachfn(arr, function(x, callback) {
            iterator(x.value, function(err) {
                callback(err);
            });
        });
    } else {
        var results = [];
        eachfn(arr, function(x, callback) {
            iterator(x.value, function(err, v) {
                results[x.index] = v;
                callback(err);
            });
        }, function(err) {
            callback(err, results);
        });
    }
}

var mapSeries = doSeries(_asyncMap);

function doSeries(fn) {
    return function() {
        var args = Array.prototype.slice.call(arguments);
        return fn.apply(null, [eachSeries].concat(args));
    };
}



function eachSeries(arr, iterator, callback) {
    callback = callback || function() {};
    if (!arr.length) {
        return callback();
    }
    var completed = 0;
    var iterate = function() {
        iterator(arr[completed], function(err) {
            if (err) {
                callback(err);
                callback = function() {};
            } else {
                completed += 1;
                if (completed >= arr.length) {
                    callback();
                } else {
                    iterate();
                }
            }
        });
    };
    iterate();
}




function _each(arr, iterator) {
    if (arr.forEach) {
        return arr.forEach(iterator);
    }
    for (var i = 0; i < arr.length; i += 1) {
        iterator(arr[i], i, arr);
    }
}

function each(arr, iterator, callback) {
    callback = callback || function() {};
    if (!arr.length) {
        return callback();
    }
    var completed = 0;
    _each(arr, function(x) {
        iterator(x, only_once(done));
    });

    function done(err) {
        if (err) {
            callback(err);
            callback = function() {};
        } else {
            completed += 1;
            if (completed >= arr.length) {
                callback();
            }
        }
    }
}

function keys(obj) {
    if (Object.keys) {
        return Object.keys(obj);
    }
    var keys = [];
    for (var k in obj) {
        if (obj.hasOwnProperty(k)) {
            keys.push(k);
        }
    }
    return keys;
}


var _parallel = function(eachfn, tasks, callback) {
    callback = callback || function() {};
    if (isArray(tasks)) {
        eachfn.map(tasks, function(fn, callback) {
            if (fn) {
                fn(function(err) {
                    var args = Array.prototype.slice.call(arguments, 1);
                    if (args.length <= 1) {
                        args = args[0];
                    }
                    callback.call(null, err, args);
                });
            }
        }, callback);
    } else {
        var results = {};
        eachfn.each(keys(tasks), function(k, callback) {
            tasks[k](function(err) {
                var args = Array.prototype.slice.call(arguments, 1);
                if (args.length <= 1) {
                    args = args[0];
                }
                results[k] = args;
                callback(err);
            });
        }, function(err) {
            callback(err, results);
        });
    }
};

function series(tasks, callback) {
    callback = callback || function() {};
    if (_isArray(tasks)) {
        mapSeries(tasks, function(fn, callback) {
            if (fn) {
                fn(function(err) {
                    var args = Array.prototype.slice.call(arguments, 1);
                    if (args.length <= 1) {
                        args = args[0];
                    }
                    callback.call(null, err, args);
                });
            }
        }, callback);
    } else {
        var results = {};
        eachSeries(_keys(tasks), function(k, callback) {
            tasks[k](function(err) {
                var args = Array.prototype.slice.call(arguments, 1);
                if (args.length <= 1) {
                    args = args[0];
                }
                results[k] = args;
                callback(err);
            });
        }, function(err) {
            callback(err, results);
        });
    }
}

function only_once(fn) {
    var called = false;
    return function() {
        if (called) throw new Error("Callback was already called.");
        called = true;
        fn.apply(root, arguments);
    }
}

function parallel(tasks, callback) {
    _parallel({
        map: map,
        each: each
    }, tasks, callback);
}

exports.series = series;
exports.parallel = parallel;
exports.isArray = isArray;

// END async.js //

// START underscore.js //

var _ = {};
var ArrayProto = Array.prototype;
var FuncProto = Function.prototype;

var nativeForEach = ArrayProto.forEach;
var nativeMap = ArrayProto.map;
var nativeReduce = ArrayProto.reduce;
var nativeBind = FuncProto.bind;
var slice = ArrayProto.slice;
var breaker = {};

_.keys = keys;

_.each = _.forEach = function(obj, iterator, context) {
    if (obj == null) return obj;
    if (nativeForEach && obj.forEach === nativeForEach) {
        obj.forEach(iterator, context);
    } else if (obj.length === +obj.length) {
        for (var i = 0, length = obj.length; i < length; i++) {
            if (iterator.call(context, obj[i], i, obj) === breaker) return;
        }
    } else {
        var keys = _.keys(obj);
        for (var i = 0, length = keys.length; i < length; i++) {
            if (iterator.call(context, obj[keys[i]], keys[i], obj) === breaker) return;
        }
    }
    return obj;
};

// Return the results of applying the iterator to each element.
// Delegates to **ECMAScript 5**'s native `map` if available.
_.map = _.collect = function(obj, iterator, context) {
    var results = [];
    if (obj == null) return results;
    if (nativeMap && obj.map === nativeMap) return obj.map(iterator, context);
    _.each(obj, function(value, index, list) {
        results.push(iterator.call(context, value, index, list));
    });
    return results;
};

// Partially apply a function by creating a version that has had some of its
// arguments pre-filled, without changing its dynamic `this` context. _ acts
// as a placeholder, allowing any combination of arguments to be pre-filled.
_.partial = function(func) {
    var boundArgs = slice.call(arguments, 1);
    return function() {
        var position = 0;
        var args = boundArgs.slice();
        for (var i = 0, length = args.length; i < length; i++) {
            if (args[i] === _) args[i] = arguments[position++];
        }
        while (position < arguments.length) args.push(arguments[position++]);
        return func.apply(this, args);
    };
};

// Convenience version of a common use case of `map`: fetching a property.
_.pluck = function(obj, key) {
    return _.map(obj, _.property(key));
};

var reduceError = 'Reduce of empty array with no initial value';

// **Reduce** builds up a single result from a list of values, aka `inject`,
// or `foldl`. Delegates to **ECMAScript 5**'s native `reduce` if available.
_.reduce = _.foldl = _.inject = function(obj, iterator, memo, context) {
    var initial = arguments.length > 2;
    if (obj == null) obj = [];
    if (nativeReduce && obj.reduce === nativeReduce) {
        if (context) iterator = _.bind(iterator, context);
        return initial ? obj.reduce(iterator, memo) : obj.reduce(iterator);
    }
    _.each(obj, function(value, index, list) {
        if (!initial) {
            memo = value;
            initial = true;
        } else {
            memo = iterator.call(context, memo, value, index, list);
        }
    });
    if (!initial) throw new TypeError(reduceError);
    return memo;
};

_.property = function(key) {
    return function(obj) {
        return obj[key];
    };
};

// Optimize `isFunction` if appropriate.
if (typeof(/./) !== 'function') {
    _.isFunction = function(obj) {
        return typeof obj === 'function';
    };
}

_.isObject = function(obj) {
    var type = typeof obj;
    return type === 'function' || type === 'object' && !!obj;
};

// An internal function to generate lookup iterators.
var lookupIterator = function(value) {
    if (value == null) return _.identity;
    if (_.isFunction(value)) return value;
    return _.property(value);
};

// Sort the object's values by a criterion produced by an iterator.
_.sortBy = function(obj, iterator, context) {
    iterator = lookupIterator(iterator);
    return _.pluck(_.map(obj, function(value, index, list) {
        return {
            value: value,
            index: index,
            criteria: iterator.call(context, value, index, list)
        };
    }).sort(function(left, right) {
        var a = left.criteria;
        var b = right.criteria;
        if (a !== b) {
            if (a > b || a === void 0) return 1;
            if (a < b || b === void 0) return -1;
        }
        return left.index - right.index;
    }), 'value');
};

var ctor = function() {};

// Create a function bound to a given object (assigning `this`, and arguments,
// optionally). Delegates to **ECMAScript 5**'s native `Function.bind` if
// available.
_.bind = function(func, context) {
    var args, bound;
    if (nativeBind && func.bind === nativeBind) return nativeBind.apply(func, slice.call(arguments, 1));
    if (!_.isFunction(func)) throw new TypeError;
    args = slice.call(arguments, 2);
    return bound = function() {
        if (!(this instanceof bound)) return func.apply(context, args.concat(slice.call(arguments)));
        ctor.prototype = func.prototype;
        var self = new ctor;
        ctor.prototype = null;
        u
        var result = func.apply(self, args.concat(slice.call(arguments)));
        if (Object(result) === result) return result;
        return self;
    };
};

_.identity = function(value) {
    return value;
};

_.zip = function(array) {
    if (array == null) return [];
    var length = _.max(arguments, 'length').length;
    var results = Array(length);
    for (var i = 0; i < length; i++) {
        results[i] = _.pluck(arguments, i);
    }
    return results;
};

// Return the maximum element (or element-based computation).
_.max = function(obj, iteratee, context) {
    var result = -Infinity,
        lastComputed = -Infinity,
        value, computed;
    if (iteratee == null && obj != null) {
        obj = obj.length === +obj.length ? obj : _.values(obj);
        for (var i = 0, length = obj.length; i < length; i++) {
            value = obj[i];
            if (value > result) {
                result = value;
            }
        }
    } else {
        iteratee = _.iteratee(iteratee, context);
        _.each(obj, function(value, index, list) {
            computed = iteratee(value, index, list);
            if (computed > lastComputed || computed === -Infinity && result === -Infinity) {
                result = value;
                lastComputed = computed;
            }
        });
    }
    return result;
};


_.iteratee = function(value, context, argCount) {
    if (value == null) return _.identity;
    if (_.isFunction(value)) return createCallback(value, context, argCount);
    if (_.isObject(value)) return _.matches(value);
    return _.property(value);
};

_.pairs = function(obj) {
    var keys = _.keys(obj);
    var length = keys.length;
    var pairs = Array(length);
    for (var i = 0; i < length; i++) {
        pairs[i] = [keys[i], obj[keys[i]]];
    }
    return pairs;
};

_.matches = function(attrs) {
    var pairs = _.pairs(attrs),
        length = pairs.length;
    return function(obj) {
        if (obj == null) return !length;
        obj = new Object(obj);
        for (var i = 0; i < length; i++) {
            var pair = pairs[i],
                key = pair[0];
            if (pair[1] !== obj[key] || !(key in obj)) return false;
        }
        return true;
    };
};

_.some = function(obj, predicate, context) {
    if (obj == null) return false;
    predicate = _.iteratee(predicate, context);
    var keys = obj.length !== +obj.length && _.keys(obj),
        length = (keys || obj).length,
        index, currentKey;
    for (index = 0; index < length; index++) {
        currentKey = keys ? keys[index] : index;
        if (predicate(obj[currentKey], currentKey, obj)) return true;
    }
    return false;
};

// END underscore.js //

exports._ = _;
var observe = require('../vendor/observe-js/src/observe').Platform;

function next(callback) {
    observe.performMicrotaskCheckpoint();
    setTimeout(callback);
}


/**
 * Performs dirty check/Object.observe callbacks depending on the browser.
 *
 * If Object.observe is present,
 * @param callback
 */
exports.next = next;

/**
 * Returns a handler that acts upon a callback or a promise depending on the result of a different callback.
 * @param callback
 * @param [promise]
 * @returns {Function}
 */
exports.constructCallbackAndPromiseHandler = function(callback, promise) {
    return function(err) {
        if (callback) callback.apply(callback, arguments);
        if (promise) {
            if (err) promise.reject(err);
            else promise.resolve.apply(promise, Array.prototype.slice.call(arguments, 1));
        }
    };
};
},{"../vendor/observe-js/src/observe":25}],25:[function(require,module,exports){
(function (global){
/*
 * Copyright (c) 2014 The Polymer Project Authors. All rights reserved.
 * This code may only be used under the BSD style license found at http://polymer.github.io/LICENSE.txt
 * The complete set of authors may be found at http://polymer.github.io/AUTHORS.txt
 * The complete set of contributors may be found at http://polymer.github.io/CONTRIBUTORS.txt
 * Code distributed by Google as part of the polymer project is also
 * subject to an additional IP rights grant found at http://polymer.github.io/PATENTS.txt
 */

(function(global) {
  'use strict';

  var testingExposeCycleCount = global.testingExposeCycleCount;

  // Detect and do basic sanity checking on Object/Array.observe.
  function detectObjectObserve() {
    if (typeof Object.observe !== 'function' ||
        typeof Array.observe !== 'function') {
      return false;
    }

    var records = [];

    function callback(recs) {
      records = recs;
    }

    var test = {};
    var arr = [];
    Object.observe(test, callback);
    Array.observe(arr, callback);
    test.id = 1;
    test.id = 2;
    delete test.id;
    arr.push(1, 2);
    arr.length = 0;

    Object.deliverChangeRecords(callback);
    if (records.length !== 5)
      return false;

    if (records[0].type != 'add' ||
        records[1].type != 'update' ||
        records[2].type != 'delete' ||
        records[3].type != 'splice' ||
        records[4].type != 'splice') {
      return false;
    }

    Object.unobserve(test, callback);
    Array.unobserve(arr, callback);

    return true;
  }

  var hasObserve = detectObjectObserve();

  function detectEval() {
    // Don't test for eval if we're running in a Chrome App environment.
    // We check for APIs set that only exist in a Chrome App context.
    if (typeof chrome !== 'undefined' && chrome.app && chrome.app.runtime) {
      return false;
    }

    // Firefox OS Apps do not allow eval. This feature detection is very hacky
    // but even if some other platform adds support for this function this code
    // will continue to work.
    if (navigator.getDeviceStorage) {
      return false;
    }

    try {
      var f = new Function('', 'return true;');
      return f();
    } catch (ex) {
      return false;
    }
  }

  var hasEval = detectEval();

  function isIndex(s) {
    return +s === s >>> 0 && s !== '';
  }

  function toNumber(s) {
    return +s;
  }

  function isObject(obj) {
    return obj === Object(obj);
  }

  var numberIsNaN = global.Number.isNaN || function(value) {
    return typeof value === 'number' && global.isNaN(value);
  }

  function areSameValue(left, right) {
    if (left === right)
      return left !== 0 || 1 / left === 1 / right;
    if (numberIsNaN(left) && numberIsNaN(right))
      return true;

    return left !== left && right !== right;
  }

  var createObject = ('__proto__' in {}) ?
    function(obj) { return obj; } :
    function(obj) {
      var proto = obj.__proto__;
      if (!proto)
        return obj;
      var newObject = Object.create(proto);
      Object.getOwnPropertyNames(obj).forEach(function(name) {
        Object.defineProperty(newObject, name,
                             Object.getOwnPropertyDescriptor(obj, name));
      });
      return newObject;
    };

  var identStart = '[\$_a-zA-Z]';
  var identPart = '[\$_a-zA-Z0-9]';
  var identRegExp = new RegExp('^' + identStart + '+' + identPart + '*' + '$');

  function getPathCharType(char) {
    if (char === undefined)
      return 'eof';

    var code = char.charCodeAt(0);

    switch(code) {
      case 0x5B: // [
      case 0x5D: // ]
      case 0x2E: // .
      case 0x22: // "
      case 0x27: // '
      case 0x30: // 0
        return char;

      case 0x5F: // _
      case 0x24: // $
        return 'ident';

      case 0x20: // Space
      case 0x09: // Tab
      case 0x0A: // Newline
      case 0x0D: // Return
      case 0xA0:  // No-break space
      case 0xFEFF:  // Byte Order Mark
      case 0x2028:  // Line Separator
      case 0x2029:  // Paragraph Separator
        return 'ws';
    }

    // a-z, A-Z
    if ((0x61 <= code && code <= 0x7A) || (0x41 <= code && code <= 0x5A))
      return 'ident';

    // 1-9
    if (0x31 <= code && code <= 0x39)
      return 'number';

    return 'else';
  }

  var pathStateMachine = {
    'beforePath': {
      'ws': ['beforePath'],
      'ident': ['inIdent', 'append'],
      '[': ['beforeElement'],
      'eof': ['afterPath']
    },

    'inPath': {
      'ws': ['inPath'],
      '.': ['beforeIdent'],
      '[': ['beforeElement'],
      'eof': ['afterPath']
    },

    'beforeIdent': {
      'ws': ['beforeIdent'],
      'ident': ['inIdent', 'append']
    },

    'inIdent': {
      'ident': ['inIdent', 'append'],
      '0': ['inIdent', 'append'],
      'number': ['inIdent', 'append'],
      'ws': ['inPath', 'push'],
      '.': ['beforeIdent', 'push'],
      '[': ['beforeElement', 'push'],
      'eof': ['afterPath', 'push']
    },

    'beforeElement': {
      'ws': ['beforeElement'],
      '0': ['afterZero', 'append'],
      'number': ['inIndex', 'append'],
      "'": ['inSingleQuote', 'append', ''],
      '"': ['inDoubleQuote', 'append', '']
    },

    'afterZero': {
      'ws': ['afterElement', 'push'],
      ']': ['inPath', 'push']
    },

    'inIndex': {
      '0': ['inIndex', 'append'],
      'number': ['inIndex', 'append'],
      'ws': ['afterElement'],
      ']': ['inPath', 'push']
    },

    'inSingleQuote': {
      "'": ['afterElement'],
      'eof': ['error'],
      'else': ['inSingleQuote', 'append']
    },

    'inDoubleQuote': {
      '"': ['afterElement'],
      'eof': ['error'],
      'else': ['inDoubleQuote', 'append']
    },

    'afterElement': {
      'ws': ['afterElement'],
      ']': ['inPath', 'push']
    }
  }

  function noop() {}

  function parsePath(path) {
    var keys = [];
    var index = -1;
    var c, newChar, key, type, transition, action, typeMap, mode = 'beforePath';

    var actions = {
      push: function() {
        if (key === undefined)
          return;

        keys.push(key);
        key = undefined;
      },

      append: function() {
        if (key === undefined)
          key = newChar
        else
          key += newChar;
      }
    };

    function maybeUnescapeQuote() {
      if (index >= path.length)
        return;

      var nextChar = path[index + 1];
      if ((mode == 'inSingleQuote' && nextChar == "'") ||
          (mode == 'inDoubleQuote' && nextChar == '"')) {
        index++;
        newChar = nextChar;
        actions.append();
        return true;
      }
    }

    while (mode) {
      index++;
      c = path[index];

      if (c == '\\' && maybeUnescapeQuote(mode))
        continue;

      type = getPathCharType(c);
      typeMap = pathStateMachine[mode];
      transition = typeMap[type] || typeMap['else'] || 'error';

      if (transition == 'error')
        return; // parse error;

      mode = transition[0];
      action = actions[transition[1]] || noop;
      newChar = transition[2] === undefined ? c : transition[2];
      action();

      if (mode === 'afterPath') {
        return keys;
      }
    }

    return; // parse error
  }

  function isIdent(s) {
    return identRegExp.test(s);
  }

  var constructorIsPrivate = {};

  function Path(parts, privateToken) {
    if (privateToken !== constructorIsPrivate)
      throw Error('Use Path.get to retrieve path objects');

    for (var i = 0; i < parts.length; i++) {
      this.push(String(parts[i]));
    }

    if (hasEval && this.length) {
      this.getValueFrom = this.compiledGetValueFromFn();
    }
  }

  // TODO(rafaelw): Make simple LRU cache
  var pathCache = {};

  function getPath(pathString) {
    if (pathString instanceof Path)
      return pathString;

    if (pathString == null || pathString.length == 0)
      pathString = '';

    if (typeof pathString != 'string') {
      if (isIndex(pathString.length)) {
        // Constructed with array-like (pre-parsed) keys
        return new Path(pathString, constructorIsPrivate);
      }

      pathString = String(pathString);
    }

    var path = pathCache[pathString];
    if (path)
      return path;

    var parts = parsePath(pathString);
    if (!parts)
      return invalidPath;

    var path = new Path(parts, constructorIsPrivate);
    pathCache[pathString] = path;
    return path;
  }

  Path.get = getPath;

  function formatAccessor(key) {
    if (isIndex(key)) {
      return '[' + key + ']';
    } else {
      return '["' + key.replace(/"/g, '\\"') + '"]';
    }
  }

  Path.prototype = createObject({
    __proto__: [],
    valid: true,

    toString: function() {
      var pathString = '';
      for (var i = 0; i < this.length; i++) {
        var key = this[i];
        if (isIdent(key)) {
          pathString += i ? '.' + key : key;
        } else {
          pathString += formatAccessor(key);
        }
      }

      return pathString;
    },

    getValueFrom: function(obj, directObserver) {
      for (var i = 0; i < this.length; i++) {
        if (obj == null)
          return;
        obj = obj[this[i]];
      }
      return obj;
    },

    iterateObjects: function(obj, observe) {
      for (var i = 0; i < this.length; i++) {
        if (i)
          obj = obj[this[i - 1]];
        if (!isObject(obj))
          return;
        observe(obj, this[0]);
      }
    },

    compiledGetValueFromFn: function() {
      var str = '';
      var pathString = 'obj';
      str += 'if (obj != null';
      var i = 0;
      var key;
      for (; i < (this.length - 1); i++) {
        key = this[i];
        pathString += isIdent(key) ? '.' + key : formatAccessor(key);
        str += ' &&\n     ' + pathString + ' != null';
      }
      str += ')\n';

      var key = this[i];
      pathString += isIdent(key) ? '.' + key : formatAccessor(key);

      str += '  return ' + pathString + ';\nelse\n  return undefined;';
      return new Function('obj', str);
    },

    setValueFrom: function(obj, value) {
      if (!this.length)
        return false;

      for (var i = 0; i < this.length - 1; i++) {
        if (!isObject(obj))
          return false;
        obj = obj[this[i]];
      }

      if (!isObject(obj))
        return false;

      obj[this[i]] = value;
      return true;
    }
  });

  var invalidPath = new Path('', constructorIsPrivate);
  invalidPath.valid = false;
  invalidPath.getValueFrom = invalidPath.setValueFrom = function() {};

  var MAX_DIRTY_CHECK_CYCLES = 1000;

  function dirtyCheck(observer) {
    var cycles = 0;
    while (cycles < MAX_DIRTY_CHECK_CYCLES && observer.check_()) {
      cycles++;
    }
    if (testingExposeCycleCount)
      global.dirtyCheckCycleCount = cycles;

    return cycles > 0;
  }

  function objectIsEmpty(object) {
    for (var prop in object)
      return false;
    return true;
  }

  function diffIsEmpty(diff) {
    return objectIsEmpty(diff.added) &&
           objectIsEmpty(diff.removed) &&
           objectIsEmpty(diff.changed);
  }

  function diffObjectFromOldObject(object, oldObject) {
    var added = {};
    var removed = {};
    var changed = {};

    for (var prop in oldObject) {
      var newValue = object[prop];

      if (newValue !== undefined && newValue === oldObject[prop])
        continue;

      if (!(prop in object)) {
        removed[prop] = undefined;
        continue;
      }

      if (newValue !== oldObject[prop])
        changed[prop] = newValue;
    }

    for (var prop in object) {
      if (prop in oldObject)
        continue;

      added[prop] = object[prop];
    }

    if (Array.isArray(object) && object.length !== oldObject.length)
      changed.length = object.length;

    return {
      added: added,
      removed: removed,
      changed: changed
    };
  }

  var eomTasks = [];
  function runEOMTasks() {
    if (!eomTasks.length)
      return false;

    for (var i = 0; i < eomTasks.length; i++) {
      eomTasks[i]();
    }
    eomTasks.length = 0;
    return true;
  }

  var runEOM = hasObserve ? (function(){
    var eomObj = { pingPong: true };
    var eomRunScheduled = false;

    Object.observe(eomObj, function() {
      runEOMTasks();
      eomRunScheduled = false;
    });

    return function(fn) {
      eomTasks.push(fn);
      if (!eomRunScheduled) {
        eomRunScheduled = true;
        eomObj.pingPong = !eomObj.pingPong;
      }
    };
  })() :
  (function() {
    return function(fn) {
      eomTasks.push(fn);
    };
  })();

  var observedObjectCache = [];

  function newObservedObject() {
    var observer;
    var object;
    var discardRecords = false;
    var first = true;

    function callback(records) {
      if (observer && observer.state_ === OPENED && !discardRecords)
        observer.check_(records);
    }

    return {
      open: function(obs) {
        if (observer)
          throw Error('ObservedObject in use');

        if (!first)
          Object.deliverChangeRecords(callback);

        observer = obs;
        first = false;
      },
      observe: function(obj, arrayObserve) {
        object = obj;
        if (arrayObserve)
          Array.observe(object, callback);
        else
          Object.observe(object, callback);
      },
      deliver: function(discard) {
        discardRecords = discard;
        Object.deliverChangeRecords(callback);
        discardRecords = false;
      },
      close: function() {
        observer = undefined;
        Object.unobserve(object, callback);
        observedObjectCache.push(this);
      }
    };
  }

  /*
   * The observedSet abstraction is a perf optimization which reduces the total
   * number of Object.observe observations of a set of objects. The idea is that
   * groups of Observers will have some object dependencies in common and this
   * observed set ensures that each object in the transitive closure of
   * dependencies is only observed once. The observedSet acts as a write barrier
   * such that whenever any change comes through, all Observers are checked for
   * changed values.
   *
   * Note that this optimization is explicitly moving work from setup-time to
   * change-time.
   *
   * TODO(rafaelw): Implement "garbage collection". In order to move work off
   * the critical path, when Observers are closed, their observed objects are
   * not Object.unobserve(d). As a result, it'siesta possible that if the observedSet
   * is kept open, but some Observers have been closed, it could cause "leaks"
   * (prevent otherwise collectable objects from being collected). At some
   * point, we should implement incremental "gc" which keeps a list of
   * observedSets which may need clean-up and does small amounts of cleanup on a
   * timeout until all is clean.
   */

  function getObservedObject(observer, object, arrayObserve) {
    var dir = observedObjectCache.pop() || newObservedObject();
    dir.open(observer);
    dir.observe(object, arrayObserve);
    return dir;
  }

  var observedSetCache = [];

  function newObservedSet() {
    var observerCount = 0;
    var observers = [];
    var objects = [];
    var rootObj;
    var rootObjProps;

    function observe(obj, prop) {
      if (!obj)
        return;

      if (obj === rootObj)
        rootObjProps[prop] = true;

      if (objects.indexOf(obj) < 0) {
        objects.push(obj);
        Object.observe(obj, callback);
      }

      observe(Object.getPrototypeOf(obj), prop);
    }

    function allRootObjNonObservedProps(recs) {
      for (var i = 0; i < recs.length; i++) {
        var rec = recs[i];
        if (rec.object !== rootObj ||
            rootObjProps[rec.name] ||
            rec.type === 'setPrototype') {
          return false;
        }
      }
      return true;
    }

    function callback(recs) {
      if (allRootObjNonObservedProps(recs))
        return;

      var observer;
      for (var i = 0; i < observers.length; i++) {
        observer = observers[i];
        if (observer.state_ == OPENED) {
          observer.iterateObjects_(observe);
        }
      }

      for (var i = 0; i < observers.length; i++) {
        observer = observers[i];
        if (observer.state_ == OPENED) {
          observer.check_();
        }
      }
    }

    var record = {
      object: undefined,
      objects: objects,
      open: function(obs, object) {
        if (!rootObj) {
          rootObj = object;
          rootObjProps = {};
        }

        observers.push(obs);
        observerCount++;
        obs.iterateObjects_(observe);
      },
      close: function(obs) {
        observerCount--;
        if (observerCount > 0) {
          return;
        }

        for (var i = 0; i < objects.length; i++) {
          Object.unobserve(objects[i], callback);
          Observer.unobservedCount++;
        }

        observers.length = 0;
        objects.length = 0;
        rootObj = undefined;
        rootObjProps = undefined;
        observedSetCache.push(this);
      }
    };

    return record;
  }

  var lastObservedSet;

  function getObservedSet(observer, obj) {
    if (!lastObservedSet || lastObservedSet.object !== obj) {
      lastObservedSet = observedSetCache.pop() || newObservedSet();
      lastObservedSet.object = obj;
    }
    lastObservedSet.open(observer, obj);
    return lastObservedSet;
  }

  var UNOPENED = 0;
  var OPENED = 1;
  var CLOSED = 2;
  var RESETTING = 3;

  var nextObserverId = 1;

  function Observer() {
    this.state_ = UNOPENED;
    this.callback_ = undefined;
    this.target_ = undefined; // TODO(rafaelw): Should be WeakRef
    this.directObserver_ = undefined;
    this.value_ = undefined;
    this.id_ = nextObserverId++;
  }

  Observer.prototype = {
    open: function(callback, target) {
      if (this.state_ != UNOPENED)
        throw Error('Observer has already been opened.');

      addToAll(this);
      this.callback_ = callback;
      this.target_ = target;
      this.connect_();
      this.state_ = OPENED;
      return this.value_;
    },

    close: function() {
      if (this.state_ != OPENED)
        return;

      removeFromAll(this);
      this.disconnect_();
      this.value_ = undefined;
      this.callback_ = undefined;
      this.target_ = undefined;
      this.state_ = CLOSED;
    },

    deliver: function() {
      if (this.state_ != OPENED)
        return;

      dirtyCheck(this);
    },

    report_: function(changes) {
      try {
        this.callback_.apply(this.target_, changes);
      } catch (ex) {
        Observer._errorThrownDuringCallback = true;
        console.error('Exception caught during observer callback: ' +
                       (ex.stack || ex));
      }
    },

    discardChanges: function() {
      this.check_(undefined, true);
      return this.value_;
    }
  }

  var collectObservers = !hasObserve;
  var allObservers;
  Observer._allObserversCount = 0;

  if (collectObservers) {
    allObservers = [];
  }

  function addToAll(observer) {
    Observer._allObserversCount++;
    if (!collectObservers)
      return;

    allObservers.push(observer);
  }

  function removeFromAll(observer) {
    Observer._allObserversCount--;
  }

  var runningMicrotaskCheckpoint = false;

  var hasDebugForceFullDelivery = hasObserve && hasEval && (function() {
    try {
      eval('%RunMicrotasks()');
      return true;
    } catch (ex) {
      return false;
    }
  })();

  global.Platform = global.Platform || {};

  global.Platform.performMicrotaskCheckpoint = function() {
    if (runningMicrotaskCheckpoint)
      return;

    if (hasDebugForceFullDelivery) {
      eval('%RunMicrotasks()');
      return;
    }

    if (!collectObservers)
      return;

    runningMicrotaskCheckpoint = true;

    var cycles = 0;
    var anyChanged, toCheck;

    do {
      cycles++;
      toCheck = allObservers;
      allObservers = [];
      anyChanged = false;

      for (var i = 0; i < toCheck.length; i++) {
        var observer = toCheck[i];
        if (observer.state_ != OPENED)
          continue;

        if (observer.check_())
          anyChanged = true;

        allObservers.push(observer);
      }
      if (runEOMTasks())
        anyChanged = true;
    } while (cycles < MAX_DIRTY_CHECK_CYCLES && anyChanged);

    if (testingExposeCycleCount)
      global.dirtyCheckCycleCount = cycles;

    runningMicrotaskCheckpoint = false;
  };

  if (collectObservers) {
    global.Platform.clearObservers = function() {
      allObservers = [];
    };
  }

  function ObjectObserver(object) {
    Observer.call(this);
    this.value_ = object;
    this.oldObject_ = undefined;
  }

  ObjectObserver.prototype = createObject({
    __proto__: Observer.prototype,

    arrayObserve: false,

    connect_: function(callback, target) {
      if (hasObserve) {
        this.directObserver_ = getObservedObject(this, this.value_,
                                                 this.arrayObserve);
      } else {
        this.oldObject_ = this.copyObject(this.value_);
      }

    },

    copyObject: function(object) {
      var copy = Array.isArray(object) ? [] : {};
      for (var prop in object) {
        copy[prop] = object[prop];
      };
      if (Array.isArray(object))
        copy.length = object.length;
      return copy;
    },

    check_: function(changeRecords, skipChanges) {
      var diff;
      var oldValues;
      if (hasObserve) {
        if (!changeRecords)
          return false;

        oldValues = {};
        diff = diffObjectFromChangeRecords(this.value_, changeRecords,
                                           oldValues);
      } else {
        oldValues = this.oldObject_;
        diff = diffObjectFromOldObject(this.value_, this.oldObject_);
      }

      if (diffIsEmpty(diff))
        return false;

      if (!hasObserve)
        this.oldObject_ = this.copyObject(this.value_);

      this.report_([
        diff.added || {},
        diff.removed || {},
        diff.changed || {},
        function(property) {
          return oldValues[property];
        }
      ]);

      return true;
    },

    disconnect_: function() {
      if (hasObserve) {
        this.directObserver_.close();
        this.directObserver_ = undefined;
      } else {
        this.oldObject_ = undefined;
      }
    },

    deliver: function() {
      if (this.state_ != OPENED)
        return;

      if (hasObserve)
        this.directObserver_.deliver(false);
      else
        dirtyCheck(this);
    },

    discardChanges: function() {
      if (this.directObserver_)
        this.directObserver_.deliver(true);
      else
        this.oldObject_ = this.copyObject(this.value_);

      return this.value_;
    }
  });

  function ArrayObserver(array) {
    if (!Array.isArray(array))
      throw Error('Provided object is not an Array');
    ObjectObserver.call(this, array);
  }

  ArrayObserver.prototype = createObject({

    __proto__: ObjectObserver.prototype,

    arrayObserve: true,

    copyObject: function(arr) {
      return arr.slice();
    },

    check_: function(changeRecords) {
      var splices;
      if (hasObserve) {
        if (!changeRecords)
          return false;
        splices = projectArraySplices(this.value_, changeRecords);
      } else {
        splices = calcSplices(this.value_, 0, this.value_.length,
                              this.oldObject_, 0, this.oldObject_.length);
      }

      if (!splices || !splices.length)
        return false;

      if (!hasObserve)
        this.oldObject_ = this.copyObject(this.value_);

      this.report_([splices]);
      return true;
    }
  });

  ArrayObserver.applySplices = function(previous, current, splices) {
    splices.forEach(function(splice) {
      var spliceArgs = [splice.index, splice.removed.length];
      var addIndex = splice.index;
      while (addIndex < splice.index + splice.addedCount) {
        spliceArgs.push(current[addIndex]);
        addIndex++;
      }

      Array.prototype.splice.apply(previous, spliceArgs);
    });
  };

  function PathObserver(object, path) {
    Observer.call(this);

    this.object_ = object;
    this.path_ = getPath(path);
    this.directObserver_ = undefined;
  }

  PathObserver.prototype = createObject({
    __proto__: Observer.prototype,

    get path() {
      return this.path_;
    },

    connect_: function() {
      if (hasObserve)
        this.directObserver_ = getObservedSet(this, this.object_);

      this.check_(undefined, true);
    },

    disconnect_: function() {
      this.value_ = undefined;

      if (this.directObserver_) {
        this.directObserver_.close(this);
        this.directObserver_ = undefined;
      }
    },

    iterateObjects_: function(observe) {
      this.path_.iterateObjects(this.object_, observe);
    },

    check_: function(changeRecords, skipChanges) {
      var oldValue = this.value_;
      this.value_ = this.path_.getValueFrom(this.object_);
      if (skipChanges || areSameValue(this.value_, oldValue))
        return false;

      this.report_([this.value_, oldValue, this]);
      return true;
    },

    setValue: function(newValue) {
      if (this.path_)
        this.path_.setValueFrom(this.object_, newValue);
    }
  });

  function CompoundObserver(reportChangesOnOpen) {
    Observer.call(this);

    this.reportChangesOnOpen_ = reportChangesOnOpen;
    this.value_ = [];
    this.directObserver_ = undefined;
    this.observed_ = [];
  }

  var observerSentinel = {};

  CompoundObserver.prototype = createObject({
    __proto__: Observer.prototype,

    connect_: function() {
      if (hasObserve) {
        var object;
        var needsDirectObserver = false;
        for (var i = 0; i < this.observed_.length; i += 2) {
          object = this.observed_[i]
          if (object !== observerSentinel) {
            needsDirectObserver = true;
            break;
          }
        }

        if (needsDirectObserver)
          this.directObserver_ = getObservedSet(this, object);
      }

      this.check_(undefined, !this.reportChangesOnOpen_);
    },

    disconnect_: function() {
      for (var i = 0; i < this.observed_.length; i += 2) {
        if (this.observed_[i] === observerSentinel)
          this.observed_[i + 1].close();
      }
      this.observed_.length = 0;
      this.value_.length = 0;

      if (this.directObserver_) {
        this.directObserver_.close(this);
        this.directObserver_ = undefined;
      }
    },

    addPath: function(object, path) {
      if (this.state_ != UNOPENED && this.state_ != RESETTING)
        throw Error('Cannot add paths once started.');

      var path = getPath(path);
      this.observed_.push(object, path);
      if (!this.reportChangesOnOpen_)
        return;
      var index = this.observed_.length / 2 - 1;
      this.value_[index] = path.getValueFrom(object);
    },

    addObserver: function(observer) {
      if (this.state_ != UNOPENED && this.state_ != RESETTING)
        throw Error('Cannot add observers once started.');

      this.observed_.push(observerSentinel, observer);
      if (!this.reportChangesOnOpen_)
        return;
      var index = this.observed_.length / 2 - 1;
      this.value_[index] = observer.open(this.deliver, this);
    },

    startReset: function() {
      if (this.state_ != OPENED)
        throw Error('Can only reset while open');

      this.state_ = RESETTING;
      this.disconnect_();
    },

    finishReset: function() {
      if (this.state_ != RESETTING)
        throw Error('Can only finishReset after startReset');
      this.state_ = OPENED;
      this.connect_();

      return this.value_;
    },

    iterateObjects_: function(observe) {
      var object;
      for (var i = 0; i < this.observed_.length; i += 2) {
        object = this.observed_[i]
        if (object !== observerSentinel)
          this.observed_[i + 1].iterateObjects(object, observe)
      }
    },

    check_: function(changeRecords, skipChanges) {
      var oldValues;
      for (var i = 0; i < this.observed_.length; i += 2) {
        var object = this.observed_[i];
        var path = this.observed_[i+1];
        var value;
        if (object === observerSentinel) {
          var observable = path;
          value = this.state_ === UNOPENED ?
              observable.open(this.deliver, this) :
              observable.discardChanges();
        } else {
          value = path.getValueFrom(object);
        }

        if (skipChanges) {
          this.value_[i / 2] = value;
          continue;
        }

        if (areSameValue(value, this.value_[i / 2]))
          continue;

        oldValues = oldValues || [];
        oldValues[i / 2] = this.value_[i / 2];
        this.value_[i / 2] = value;
      }

      if (!oldValues)
        return false;

      // TODO(rafaelw): Having observed_ as the third callback arg here is
      // pretty lame API. Fix.
      this.report_([this.value_, oldValues, this.observed_]);
      return true;
    }
  });

  function identFn(value) { return value; }

  function ObserverTransform(observable, getValueFn, setValueFn,
                             dontPassThroughSet) {
    this.callback_ = undefined;
    this.target_ = undefined;
    this.value_ = undefined;
    this.observable_ = observable;
    this.getValueFn_ = getValueFn || identFn;
    this.setValueFn_ = setValueFn || identFn;
    // TODO(rafaelw): This is a temporary hack. PolymerExpressions needs this
    // at the moment because of a bug in it'siesta dependency tracking.
    this.dontPassThroughSet_ = dontPassThroughSet;
  }

  ObserverTransform.prototype = {
    open: function(callback, target) {
      this.callback_ = callback;
      this.target_ = target;
      this.value_ =
          this.getValueFn_(this.observable_.open(this.observedCallback_, this));
      return this.value_;
    },

    observedCallback_: function(value) {
      value = this.getValueFn_(value);
      if (areSameValue(value, this.value_))
        return;
      var oldValue = this.value_;
      this.value_ = value;
      this.callback_.call(this.target_, this.value_, oldValue);
    },

    discardChanges: function() {
      this.value_ = this.getValueFn_(this.observable_.discardChanges());
      return this.value_;
    },

    deliver: function() {
      return this.observable_.deliver();
    },

    setValue: function(value) {
      value = this.setValueFn_(value);
      if (!this.dontPassThroughSet_ && this.observable_.setValue)
        return this.observable_.setValue(value);
    },

    close: function() {
      if (this.observable_)
        this.observable_.close();
      this.callback_ = undefined;
      this.target_ = undefined;
      this.observable_ = undefined;
      this.value_ = undefined;
      this.getValueFn_ = undefined;
      this.setValueFn_ = undefined;
    }
  }

  var expectedRecordTypes = {
    add: true,
    update: true,
    delete: true
  };

  function diffObjectFromChangeRecords(object, changeRecords, oldValues) {
    var added = {};
    var removed = {};

    for (var i = 0; i < changeRecords.length; i++) {
      var record = changeRecords[i];
      if (!expectedRecordTypes[record.type]) {
        console.error('Unknown changeRecord type: ' + record.type);
        console.error(record);
        continue;
      }

      if (!(record.name in oldValues))
        oldValues[record.name] = record.oldValue;

      if (record.type == 'update')
        continue;

      if (record.type == 'add') {
        if (record.name in removed)
          delete removed[record.name];
        else
          added[record.name] = true;

        continue;
      }

      // type = 'delete'
      if (record.name in added) {
        delete added[record.name];
        delete oldValues[record.name];
      } else {
        removed[record.name] = true;
      }
    }

    for (var prop in added)
      added[prop] = object[prop];

    for (var prop in removed)
      removed[prop] = undefined;

    var changed = {};
    for (var prop in oldValues) {
      if (prop in added || prop in removed)
        continue;

      var newValue = object[prop];
      if (oldValues[prop] !== newValue)
        changed[prop] = newValue;
    }

    return {
      added: added,
      removed: removed,
      changed: changed
    };
  }

  function newSplice(index, removed, addedCount) {
    return {
      index: index,
      removed: removed,
      addedCount: addedCount
    };
  }

  var EDIT_LEAVE = 0;
  var EDIT_UPDATE = 1;
  var EDIT_ADD = 2;
  var EDIT_DELETE = 3;

  function ArraySplice() {}

  ArraySplice.prototype = {

    // Note: This function is *based* on the computation of the Levenshtein
    // "edit" distance. The one change is that "updates" are treated as two
    // edits - not one. With Array splices, an update is really a delete
    // followed by an add. By retaining this, we optimize for "keeping" the
    // maximum array items in the original array. For example:
    //
    //   'xxxx123' -> '123yyyy'
    //
    // With 1-edit updates, the shortest path would be just to update all seven
    // characters. With 2-edit updates, we delete 4, leave 3, and add 4. This
    // leaves the substring '123' intact.
    calcEditDistances: function(current, currentStart, currentEnd,
                                old, oldStart, oldEnd) {
      // "Deletion" columns
      var rowCount = oldEnd - oldStart + 1;
      var columnCount = currentEnd - currentStart + 1;
      var distances = new Array(rowCount);

      // "Addition" rows. Initialize null column.
      for (var i = 0; i < rowCount; i++) {
        distances[i] = new Array(columnCount);
        distances[i][0] = i;
      }

      // Initialize null row
      for (var j = 0; j < columnCount; j++)
        distances[0][j] = j;

      for (var i = 1; i < rowCount; i++) {
        for (var j = 1; j < columnCount; j++) {
          if (this.equals(current[currentStart + j - 1], old[oldStart + i - 1]))
            distances[i][j] = distances[i - 1][j - 1];
          else {
            var north = distances[i - 1][j] + 1;
            var west = distances[i][j - 1] + 1;
            distances[i][j] = north < west ? north : west;
          }
        }
      }

      return distances;
    },

    // This starts at the final weight, and walks "backward" by finding
    // the minimum previous weight recursively until the origin of the weight
    // matrix.
    spliceOperationsFromEditDistances: function(distances) {
      var i = distances.length - 1;
      var j = distances[0].length - 1;
      var current = distances[i][j];
      var edits = [];
      while (i > 0 || j > 0) {
        if (i == 0) {
          edits.push(EDIT_ADD);
          j--;
          continue;
        }
        if (j == 0) {
          edits.push(EDIT_DELETE);
          i--;
          continue;
        }
        var northWest = distances[i - 1][j - 1];
        var west = distances[i - 1][j];
        var north = distances[i][j - 1];

        var min;
        if (west < north)
          min = west < northWest ? west : northWest;
        else
          min = north < northWest ? north : northWest;

        if (min == northWest) {
          if (northWest == current) {
            edits.push(EDIT_LEAVE);
          } else {
            edits.push(EDIT_UPDATE);
            current = northWest;
          }
          i--;
          j--;
        } else if (min == west) {
          edits.push(EDIT_DELETE);
          i--;
          current = west;
        } else {
          edits.push(EDIT_ADD);
          j--;
          current = north;
        }
      }

      edits.reverse();
      return edits;
    },

    /**
     * Splice Projection functions:
     *
     * A splice map is a representation of how a previous array of items
     * was transformed into a new array of items. Conceptually it is a list of
     * tuples of
     *
     *   <index, removed, addedCount>
     *
     * which are kept in ascending index order of. The tuple represents that at
     * the |index|, |removed| sequence of items were removed, and counting forward
     * from |index|, |addedCount| items were added.
     */

    /**
     * Lacking individual splice mutation information, the minimal set of
     * splices can be synthesized given the previous state and final state of an
     * array. The basic approach is to calculate the edit distance matrix and
     * choose the shortest path through it.
     *
     * Complexity: O(l * p)
     *   l: The length of the current array
     *   p: The length of the old array
     */
    calcSplices: function(current, currentStart, currentEnd,
                          old, oldStart, oldEnd) {
      var prefixCount = 0;
      var suffixCount = 0;

      var minLength = Math.min(currentEnd - currentStart, oldEnd - oldStart);
      if (currentStart == 0 && oldStart == 0)
        prefixCount = this.sharedPrefix(current, old, minLength);

      if (currentEnd == current.length && oldEnd == old.length)
        suffixCount = this.sharedSuffix(current, old, minLength - prefixCount);

      currentStart += prefixCount;
      oldStart += prefixCount;
      currentEnd -= suffixCount;
      oldEnd -= suffixCount;

      if (currentEnd - currentStart == 0 && oldEnd - oldStart == 0)
        return [];

      if (currentStart == currentEnd) {
        var splice = newSplice(currentStart, [], 0);
        while (oldStart < oldEnd)
          splice.removed.push(old[oldStart++]);

        return [ splice ];
      } else if (oldStart == oldEnd)
        return [ newSplice(currentStart, [], currentEnd - currentStart) ];

      var ops = this.spliceOperationsFromEditDistances(
          this.calcEditDistances(current, currentStart, currentEnd,
                                 old, oldStart, oldEnd));

      var splice = undefined;
      var splices = [];
      var index = currentStart;
      var oldIndex = oldStart;
      for (var i = 0; i < ops.length; i++) {
        switch(ops[i]) {
          case EDIT_LEAVE:
            if (splice) {
              splices.push(splice);
              splice = undefined;
            }

            index++;
            oldIndex++;
            break;
          case EDIT_UPDATE:
            if (!splice)
              splice = newSplice(index, [], 0);

            splice.addedCount++;
            index++;

            splice.removed.push(old[oldIndex]);
            oldIndex++;
            break;
          case EDIT_ADD:
            if (!splice)
              splice = newSplice(index, [], 0);

            splice.addedCount++;
            index++;
            break;
          case EDIT_DELETE:
            if (!splice)
              splice = newSplice(index, [], 0);

            splice.removed.push(old[oldIndex]);
            oldIndex++;
            break;
        }
      }

      if (splice) {
        splices.push(splice);
      }
      return splices;
    },

    sharedPrefix: function(current, old, searchLength) {
      for (var i = 0; i < searchLength; i++)
        if (!this.equals(current[i], old[i]))
          return i;
      return searchLength;
    },

    sharedSuffix: function(current, old, searchLength) {
      var index1 = current.length;
      var index2 = old.length;
      var count = 0;
      while (count < searchLength && this.equals(current[--index1], old[--index2]))
        count++;

      return count;
    },

    calculateSplices: function(current, previous) {
      return this.calcSplices(current, 0, current.length, previous, 0,
                              previous.length);
    },

    equals: function(currentValue, previousValue) {
      return currentValue === previousValue;
    }
  };

  var arraySplice = new ArraySplice();

  function calcSplices(current, currentStart, currentEnd,
                       old, oldStart, oldEnd) {
    return arraySplice.calcSplices(current, currentStart, currentEnd,
                                   old, oldStart, oldEnd);
  }

  function intersect(start1, end1, start2, end2) {
    // Disjoint
    if (end1 < start2 || end2 < start1)
      return -1;

    // Adjacent
    if (end1 == start2 || end2 == start1)
      return 0;

    // Non-zero intersect, span1 first
    if (start1 < start2) {
      if (end1 < end2)
        return end1 - start2; // Overlap
      else
        return end2 - start2; // Contained
    } else {
      // Non-zero intersect, span2 first
      if (end2 < end1)
        return end2 - start1; // Overlap
      else
        return end1 - start1; // Contained
    }
  }

  function mergeSplice(splices, index, removed, addedCount) {

    var splice = newSplice(index, removed, addedCount);

    var inserted = false;
    var insertionOffset = 0;

    for (var i = 0; i < splices.length; i++) {
      var current = splices[i];
      current.index += insertionOffset;

      if (inserted)
        continue;

      var intersectCount = intersect(splice.index,
                                     splice.index + splice.removed.length,
                                     current.index,
                                     current.index + current.addedCount);

      if (intersectCount >= 0) {
        // Merge the two splices

        splices.splice(i, 1);
        i--;

        insertionOffset -= current.addedCount - current.removed.length;

        splice.addedCount += current.addedCount - intersectCount;
        var deleteCount = splice.removed.length +
                          current.removed.length - intersectCount;

        if (!splice.addedCount && !deleteCount) {
          // merged splice is a noop. discard.
          inserted = true;
        } else {
          var removed = current.removed;

          if (splice.index < current.index) {
            // some prefix of splice.removed is prepended to current.removed.
            var prepend = splice.removed.slice(0, current.index - splice.index);
            Array.prototype.push.apply(prepend, removed);
            removed = prepend;
          }

          if (splice.index + splice.removed.length > current.index + current.addedCount) {
            // some suffix of splice.removed is appended to current.removed.
            var append = splice.removed.slice(current.index + current.addedCount - splice.index);
            Array.prototype.push.apply(removed, append);
          }

          splice.removed = removed;
          if (current.index < splice.index) {
            splice.index = current.index;
          }
        }
      } else if (splice.index < current.index) {
        // Insert splice here.

        inserted = true;

        splices.splice(i, 0, splice);
        i++;

        var offset = splice.addedCount - splice.removed.length
        current.index += offset;
        insertionOffset += offset;
      }
    }

    if (!inserted)
      splices.push(splice);
  }

  function createInitialSplices(array, changeRecords) {
    var splices = [];

    for (var i = 0; i < changeRecords.length; i++) {
      var record = changeRecords[i];
      switch(record.type) {
        case 'splice':
          mergeSplice(splices, record.index, record.removed.slice(), record.addedCount);
          break;
        case 'add':
        case 'update':
        case 'delete':
          if (!isIndex(record.name))
            continue;
          var index = toNumber(record.name);
          if (index < 0)
            continue;
          mergeSplice(splices, index, [record.oldValue], 1);
          break;
        default:
          console.error('Unexpected record type: ' + JSON.stringify(record));
          break;
      }
    }

    return splices;
  }

  function projectArraySplices(array, changeRecords) {
    var splices = [];

    createInitialSplices(array, changeRecords).forEach(function(splice) {
      if (splice.addedCount == 1 && splice.removed.length == 1) {
        if (splice.removed[0] !== array[splice.index])
          splices.push(splice);

        return
      };

      splices = splices.concat(calcSplices(array, splice.index, splice.index + splice.addedCount,
                                           splice.removed, 0, splice.removed.length));
    });

    return splices;
  }

 // Export the observe-js object for **Node.js**, with
// backwards-compatibility for the old `require()` API. If we're in
// the browser, export as a global object.
var expose = global;
if (typeof exports !== 'undefined') {
if (typeof module !== 'undefined' && module.exports) {
expose = exports = module.exports;
}
expose = exports;
}
expose.Observer = Observer;
expose.Observer.runEOM_ = runEOM;
expose.Observer.observerSentinel_ = observerSentinel; // for testing.
expose.Observer.hasObjectObserve = hasObserve;
expose.ArrayObserver = ArrayObserver;
expose.ArrayObserver.calculateSplices = function(current, previous) {
return arraySplice.calculateSplices(current, previous);
};
expose.Platform = global.Platform;
expose.ArraySplice = ArraySplice;
expose.ObjectObserver = ObjectObserver;
expose.PathObserver = PathObserver;
expose.CompoundObserver = CompoundObserver;
expose.Path = Path;
expose.ObserverTransform = ObserverTransform;
})(typeof global !== 'undefined' && global && typeof module !== 'undefined' && module ? global : this || window);

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{}]},{},[1])
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCIvVXNlcnMvbXRmb3JkL1BsYXlncm91bmQvcmVzdC9pbmRleC5qcyIsIi9Vc2Vycy9tdGZvcmQvUGxheWdyb3VuZC9yZXN0L25vZGVfbW9kdWxlcy9icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9ldmVudHMvZXZlbnRzLmpzIiwiL1VzZXJzL210Zm9yZC9QbGF5Z3JvdW5kL3Jlc3Qvbm9kZV9tb2R1bGVzL2V4dGVuZC9pbmRleC5qcyIsIi9Vc2Vycy9tdGZvcmQvUGxheWdyb3VuZC9yZXN0L3NyYy9jYWNoZS5qcyIsIi9Vc2Vycy9tdGZvcmQvUGxheWdyb3VuZC9yZXN0L3NyYy9jaGFuZ2VzLmpzIiwiL1VzZXJzL210Zm9yZC9QbGF5Z3JvdW5kL3Jlc3Qvc3JjL2NvbGxlY3Rpb24uanMiLCIvVXNlcnMvbXRmb3JkL1BsYXlncm91bmQvcmVzdC9zcmMvY29sbGVjdGlvblJlZ2lzdHJ5LmpzIiwiL1VzZXJzL210Zm9yZC9QbGF5Z3JvdW5kL3Jlc3Qvc3JjL2Vycm9yLmpzIiwiL1VzZXJzL210Zm9yZC9QbGF5Z3JvdW5kL3Jlc3Qvc3JjL21hbnlUb01hbnlQcm94eS5qcyIsIi9Vc2Vycy9tdGZvcmQvUGxheWdyb3VuZC9yZXN0L3NyYy9tYXBwaW5nLmpzIiwiL1VzZXJzL210Zm9yZC9QbGF5Z3JvdW5kL3Jlc3Qvc3JjL21hcHBpbmdPcGVyYXRpb24uanMiLCIvVXNlcnMvbXRmb3JkL1BsYXlncm91bmQvcmVzdC9zcmMvbWlzYy5qcyIsIi9Vc2Vycy9tdGZvcmQvUGxheWdyb3VuZC9yZXN0L3NyYy9ub3RpZmljYXRpb25DZW50cmUuanMiLCIvVXNlcnMvbXRmb3JkL1BsYXlncm91bmQvcmVzdC9zcmMvb2JqZWN0LmpzIiwiL1VzZXJzL210Zm9yZC9QbGF5Z3JvdW5kL3Jlc3Qvc3JjL29uZVRvTWFueVByb3h5LmpzIiwiL1VzZXJzL210Zm9yZC9QbGF5Z3JvdW5kL3Jlc3Qvc3JjL29uZVRvT25lUHJveHkuanMiLCIvVXNlcnMvbXRmb3JkL1BsYXlncm91bmQvcmVzdC9zcmMvb3BlcmF0aW9uL2xvZy5qcyIsIi9Vc2Vycy9tdGZvcmQvUGxheWdyb3VuZC9yZXN0L3NyYy9vcGVyYXRpb24vb3BlcmF0aW9uLmpzIiwiL1VzZXJzL210Zm9yZC9QbGF5Z3JvdW5kL3Jlc3Qvc3JjL29wZXJhdGlvbi9xdWV1ZS5qcyIsIi9Vc2Vycy9tdGZvcmQvUGxheWdyb3VuZC9yZXN0L3NyYy9wcm94eS5qcyIsIi9Vc2Vycy9tdGZvcmQvUGxheWdyb3VuZC9yZXN0L3NyYy9xdWVyeS5qcyIsIi9Vc2Vycy9tdGZvcmQvUGxheWdyb3VuZC9yZXN0L3NyYy9yZWxhdGlvbnNoaXAuanMiLCIvVXNlcnMvbXRmb3JkL1BsYXlncm91bmQvcmVzdC9zcmMvc3RvcmUuanMiLCIvVXNlcnMvbXRmb3JkL1BsYXlncm91bmQvcmVzdC9zcmMvdXRpbC5qcyIsIi9Vc2Vycy9tdGZvcmQvUGxheWdyb3VuZC9yZXN0L3ZlbmRvci9vYnNlcnZlLWpzL3NyYy9vYnNlcnZlLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FDQUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDblNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDN1NBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNoRkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2xZQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDL0lBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDaFpBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3hCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ25CQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDOUpBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDN25CQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDaGFBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDdkRBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUMvSkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDM05BO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDNUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzdGQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDbFZBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNyTUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3ZjQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3BKQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDZEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNqUEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDamdCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSIsImZpbGUiOiJnZW5lcmF0ZWQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlc0NvbnRlbnQiOlsiKGZ1bmN0aW9uIGUodCxuLHIpe2Z1bmN0aW9uIHMobyx1KXtpZighbltvXSl7aWYoIXRbb10pe3ZhciBhPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7aWYoIXUmJmEpcmV0dXJuIGEobywhMCk7aWYoaSlyZXR1cm4gaShvLCEwKTt2YXIgZj1uZXcgRXJyb3IoXCJDYW5ub3QgZmluZCBtb2R1bGUgJ1wiK28rXCInXCIpO3Rocm93IGYuY29kZT1cIk1PRFVMRV9OT1RfRk9VTkRcIixmfXZhciBsPW5bb109e2V4cG9ydHM6e319O3Rbb11bMF0uY2FsbChsLmV4cG9ydHMsZnVuY3Rpb24oZSl7dmFyIG49dFtvXVsxXVtlXTtyZXR1cm4gcyhuP246ZSl9LGwsbC5leHBvcnRzLGUsdCxuLHIpfXJldHVybiBuW29dLmV4cG9ydHN9dmFyIGk9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtmb3IodmFyIG89MDtvPHIubGVuZ3RoO28rKylzKHJbb10pO3JldHVybiBzfSkiLCIvKipcbiAqIEBtb2R1bGUgc2llc3RhXG4gKi9cblxudmFyIGNvbGxlY3Rpb24gPSByZXF1aXJlKCcuL3NyYy9jb2xsZWN0aW9uJyk7XG52YXIgdXRpbCA9IHJlcXVpcmUoJy4vc3JjL3V0aWwnKTtcblxudmFyIENvbGxlY3Rpb25SZWdpc3RyeSA9IHJlcXVpcmUoJy4vc3JjL2NvbGxlY3Rpb25SZWdpc3RyeScpLkNvbGxlY3Rpb25SZWdpc3RyeSxcbiAgICBDb2xsZWN0aW9uID0gY29sbGVjdGlvbi5Db2xsZWN0aW9uLFxuICAgIGNhY2hlID0gcmVxdWlyZSgnLi9zcmMvY2FjaGUnKSxcbiAgICBNYXBwaW5nID0gcmVxdWlyZSgnLi9zcmMvbWFwcGluZycpLk1hcHBpbmcsXG4gICAgbm90aWZpY2F0aW9uQ2VudHJlID0gcmVxdWlyZSgnLi9zcmMvbm90aWZpY2F0aW9uQ2VudHJlJykubm90aWZpY2F0aW9uQ2VudHJlLFxuICAgIE9wZXJhdGlvbiA9IHJlcXVpcmUoJy4vc3JjL29wZXJhdGlvbi9vcGVyYXRpb24nKS5PcGVyYXRpb24sXG4gICAgT3BlcmF0aW9uUXVldWUgPSByZXF1aXJlKCcuL3NyYy9vcGVyYXRpb24vcXVldWUnKS5PcGVyYXRpb25RdWV1ZSxcbiAgICBSZWxhdGlvbnNoaXBUeXBlID0gcmVxdWlyZSgnLi9zcmMvcmVsYXRpb25zaGlwJykuUmVsYXRpb25zaGlwVHlwZSxcbiAgICBsb2cgPSByZXF1aXJlKCcuL3NyYy9vcGVyYXRpb24vbG9nJyksXG4gICAgXyA9IHV0aWwuXztcblxuaWYgKHdpbmRvdy5RKSB3aW5kb3cucSA9IHdpbmRvdy5RO1xuXG5PcGVyYXRpb24ubG9nTGV2ZWwgPSBsb2cuTGV2ZWwud2Fybjtcbk9wZXJhdGlvblF1ZXVlLmxvZ0xldmVsID0gbG9nLkxldmVsLndhcm47XG5cbnZhciBzaWVzdGE7XG5pZiAodHlwZW9mIG1vZHVsZSAhPSAndW5kZWZpbmVkJykge1xuICAgIHNpZXN0YSA9IG1vZHVsZS5leHBvcnRzO1xufSBlbHNlIHtcbiAgICBzaWVzdGEgPSB7fTtcbn1cblxuLyoqXG4gKiBXaXBlIGV2ZXJ5dGhpbmchXG4gKi9cbnNpZXN0YS5yZXNldCA9IGZ1bmN0aW9uKCkge1xuICAgIGNhY2hlLnJlc2V0KCk7XG4gICAgQ29sbGVjdGlvblJlZ2lzdHJ5LnJlc2V0KCk7XG4gICAgc2llc3RhLmV4dC5odHRwLkRlc2NyaXB0b3JSZWdpc3RyeS5yZXNldCgpO1xuICAgIC8vbm9pbnNwZWN0aW9uIEpTQWNjZXNzaWJpbGl0eUNoZWNrXG59O1xuXG5cbi8qKlxuICogTGlzdGVuIHRvIG5vdGlmaWNhdG9ucy5cbiAqIEBwYXJhbSB7U3RyaW5nfSBub3RpZmljYXRpb25OYW1lXG4gKiBAcGFyYW0ge0Z1bmN0aW9ufSBoYW5kbGVyXG4gKi9cbnNpZXN0YS5vbiA9IF8uYmluZChub3RpZmljYXRpb25DZW50cmUub24sIG5vdGlmaWNhdGlvbkNlbnRyZSk7XG5cbi8qKlxuICogTGlzdGVuIHRvIG5vdGlmaWNhdG9ucy5cbiAqIEBwYXJhbSB7U3RyaW5nfSBub3RpZmljYXRpb25OYW1lXG4gKiBAcGFyYW0ge0Z1bmN0aW9ufSBoYW5kbGVyXG4gKi9cbnNpZXN0YS5hZGRMaXN0ZW5lciA9IHNpZXN0YS5vbjtcblxuLyoqXG4gKiBTdG9wIGxpc3RlbmluZyB0byBhIHBhcnRpY3VsYXIgbm90aWZpY2F0aW9uXG4gKiBcbiAqIEBwYXJhbSB7U3RyaW5nfSBub3RpZmljYXRpb25OYW1lXG4gKiBAcGFyYW0ge0Z1bmN0aW9ufSBoYW5kbGVyXG4gKi9cbnNpZXN0YS5vZmYgPSBfLmJpbmQobm90aWZpY2F0aW9uQ2VudHJlLnJlbW92ZUxpc3RlbmVyLCBub3RpZmljYXRpb25DZW50cmUpO1xuXG4vKipcbiAqIFN0b3AgbGlzdGVuaW5nIHRvIGEgcGFydGljdWxhciBub3RpZmljYXRpb25cbiAqIFxuICogQHBhcmFtIHtTdHJpbmd9IG5vdGlmaWNhdGlvbk5hbWVcbiAqIEBwYXJhbSB7RnVuY3Rpb259IGhhbmRsZXJcbiAqL1xuc2llc3RhLnJlbW92ZUxpc3RlbmVyID0gc2llc3RhLm9mZjtcblxuLyoqXG4gKiBMaXN0ZW4gdG8gb25lIGFuZCBvbmx5IG9uZSBub3RpZmljYXRpb24uXG4gKiBcbiAqIEBwYXJhbSB7U3RyaW5nfSBub3RpZmljYXRpb25OYW1lXG4gKiBAcGFyYW0ge0Z1bmN0aW9ufSBoYW5kbGVyXG4gKi9cbnNpZXN0YS5vbmNlID0gXy5iaW5kKG5vdGlmaWNhdGlvbkNlbnRyZS5vbmNlLCBub3RpZmljYXRpb25DZW50cmUpO1xuXG4vKipcbiAqIFJlbW92ZXMgYWxsIGxpc3RlbmVycy5cbiAqL1xuc2llc3RhLnJlbW92ZUFsbExpc3RlbmVycyA9IF8uYmluZChub3RpZmljYXRpb25DZW50cmUucmVtb3ZlQWxsTGlzdGVuZXJzLCBub3RpZmljYXRpb25DZW50cmUpO1xuXG5zaWVzdGEuQ29sbGVjdGlvbiA9IENvbGxlY3Rpb247XG5zaWVzdGEuUmVsYXRpb25zaGlwVHlwZSA9IFJlbGF0aW9uc2hpcFR5cGU7XG5cbi8vIFVzZWQgYnkgbW9kdWxlcy5cbnZhciBjb3JlQ2hhbmdlcyA9IHJlcXVpcmUoJy4vc3JjL2NoYW5nZXMnKTtcblxuLy8gTWFrZSBhdmFpbGFibGUgbW9kdWxlcyB0byBleHRlbnNpb25zLlxuc2llc3RhLl9pbnRlcm5hbCA9IHtcbiAgICBsb2c6IGxvZyxcbiAgICBNYXBwaW5nOiBNYXBwaW5nLFxuICAgIG1hcHBpbmc6IHJlcXVpcmUoJy4vc3JjL21hcHBpbmcnKSxcbiAgICBlcnJvcjogcmVxdWlyZSgnLi9zcmMvZXJyb3InKSxcbiAgICBDaGFuZ2VUeXBlOiBjb3JlQ2hhbmdlcy5DaGFuZ2VUeXBlLFxuICAgIG9iamVjdDogcmVxdWlyZSgnLi9zcmMvb2JqZWN0JyksXG4gICAgZXh0ZW5kOiByZXF1aXJlKCdleHRlbmQnKSxcbiAgICBub3RpZmljYXRpb25DZW50cmU6IHJlcXVpcmUoJy4vc3JjL25vdGlmaWNhdGlvbkNlbnRyZScpLFxuICAgIGNhY2hlOiByZXF1aXJlKCcuL3NyYy9jYWNoZScpLFxuICAgIG1pc2M6IHJlcXVpcmUoJy4vc3JjL21pc2MnKSxcbiAgICBPcGVyYXRpb246IE9wZXJhdGlvbixcbiAgICBPcGVyYXRpb25RdWV1ZTogT3BlcmF0aW9uUXVldWUsXG4gICAgY29yZUNoYW5nZXM6IGNvcmVDaGFuZ2VzLFxuICAgIENvbGxlY3Rpb25SZWdpc3RyeTogcmVxdWlyZSgnLi9zcmMvY29sbGVjdGlvblJlZ2lzdHJ5JykuQ29sbGVjdGlvblJlZ2lzdHJ5LFxuICAgIENvbGxlY3Rpb246IGNvbGxlY3Rpb24uQ29sbGVjdGlvbixcbiAgICBjb2xsZWN0aW9uOiBjb2xsZWN0aW9uLFxuICAgIHV0aWxzOiB1dGlsLFxuICAgIHV0aWw6IHV0aWwsXG4gICAgXzogdXRpbC5fLFxuICAgIHF1ZXJ5OiByZXF1aXJlKCcuL3NyYy9xdWVyeScpLFxuICAgIHN0b3JlOiByZXF1aXJlKCcuL3NyYy9zdG9yZScpXG59O1xuXG5zaWVzdGEucGVyZm9ybWFuY2VNb25pdG9yaW5nRW5hYmxlZCA9IGZhbHNlO1xuc2llc3RhLmh0dHBFbmFibGVkID0gZmFsc2U7XG5zaWVzdGEuc3RvcmFnZUVuYWJsZWQgPSBmYWxzZTtcblxuc2llc3RhLmV4dCA9IHt9O1xuXG4vLyBPYmplY3QuZGVmaW5lUHJvcGVydHkoc2llc3RhLCAnc2V0UG91Y2gnLCB7XG4vLyAgICAgZ2V0OiBmdW5jdGlvbigpIHtcbi8vICAgICAgICAgaWYgKHNpZXN0YS5leHQuc3RvcmFnZUVuYWJsZWQpIHtcbi8vICAgICAgICAgICAgIHJldHVybiBzaWVzdGEuZXh0LnN0b3JhZ2UucG91Y2guc2V0UG91Y2g7XG4vLyAgICAgICAgIH1cbi8vICAgICAgICAgcmV0dXJuIG51bGw7XG4vLyAgICAgfVxuLy8gfSk7XG5cbi8vIE9iamVjdC5kZWZpbmVQcm9wZXJ0eShzaWVzdGEuZXh0LCAnc3RvcmFnZUVuYWJsZWQnLCB7XG4vLyAgICAgZ2V0OiBmdW5jdGlvbigpIHtcbi8vICAgICAgICAgaWYgKHNpZXN0YS5leHQuX3N0b3JhZ2VFbmFibGVkICE9PSB1bmRlZmluZWQpIHtcbi8vICAgICAgICAgICAgIHJldHVybiBzaWVzdGEuZXh0Ll9zdG9yYWdlRW5hYmxlZDtcbi8vICAgICAgICAgfVxuLy8gICAgICAgICByZXR1cm4gISFzaWVzdGEuZXh0LnN0b3JhZ2U7XG4vLyAgICAgfSxcbi8vICAgICBzZXQ6IGZ1bmN0aW9uKHYpIHtcbi8vICAgICAgICAgc2llc3RhLmV4dC5fc3RvcmFnZUVuYWJsZWQgPSB2O1xuLy8gICAgIH1cbi8vIH0pO1xuXG4vKipcbiAqIFRydWUgaWYgc2llc3RhLmh0dHAuanMgaXMgaW5zdGFsbGVkIGNvcnJlY3RseSAob3Igc2llc3RhLmJ1bmRsZS5qcyBpcyBiZWluZyB1c2VkIGluc3RlYWQpLlxuICovXG5PYmplY3QuZGVmaW5lUHJvcGVydHkoc2llc3RhLmV4dCwgJ2h0dHBFbmFibGVkJywge1xuICAgIGdldDogZnVuY3Rpb24oKSB7XG4gICAgICAgIGlmIChzaWVzdGEuZXh0Ll9odHRwRW5hYmxlZCAhPT0gdW5kZWZpbmVkKSB7XG4gICAgICAgICAgICByZXR1cm4gc2llc3RhLmV4dC5faHR0cEVuYWJsZWQ7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuICEhc2llc3RhLmV4dC5odHRwO1xuICAgIH0sXG4gICAgc2V0OiBmdW5jdGlvbih2KSB7XG4gICAgICAgIHNpZXN0YS5leHQuX2h0dHBFbmFibGVkID0gdjtcbiAgICB9XG59KTtcblxuLyoqXG4gKiBDcmVhdGVzIGFuZCByZWdpc3RlcnMgYSBuZXcgQ29sbGVjdGlvbi5cbiAqIEBwYXJhbSAge1t0eXBlXX0gbmFtZVxuICogQHBhcmFtICB7W3R5cGVdfSBvcHRzXG4gKiBAcmV0dXJuIHtDb2xsZWN0aW9ufVxuICovXG5zaWVzdGEuY29sbGVjdGlvbiA9IGZ1bmN0aW9uKG5hbWUsIG9wdHMpIHtcbiAgICByZXR1cm4gbmV3IENvbGxlY3Rpb24obmFtZSwgb3B0cyk7XG59O1xuXG4vKipcbiAqIFNldHMgdGhlIGFqYXggZnVuY3Rpb24gdG8gdXNlIGUuZy4gJC5hamF4XG4gKiBAcGFyYW0ge0Z1bmN0aW9ufSBhamF4XG4gKiBAZXhhbXBsZVxuICogLy8gVXNlIHplcHRvIGluc3RlYWQgb2YgalF1ZXJ5IGZvciBodHRwIGFqYXggcmVxdWVzdHMuXG4gKiBzaWVzdGEuc2V0QWpheCh6ZXB0by5hamF4KTtcbiAqL1xuc2llc3RhLnNldEFqYXggPSBmdW5jdGlvbihhamF4KSB7XG4gICAgaWYgKHNpZXN0YS5leHQuaHR0cEVuYWJsZWQpIHtcbiAgICAgICAgc2llc3RhLmV4dC5odHRwLmFqYXggPSBhamF4O1xuICAgIH0gZWxzZSB7XG4gICAgICAgIHRocm93IG5ldyBFcnJvcignaHR0cCBtb2R1bGUgbm90IGluc3RhbGxlZCBjb3JyZWN0bHkgKGhhdmUgeW91IGluY2x1ZGVkIHNpZXN0YS5odHRwLmpzPyknKTtcbiAgICB9XG59O1xuXG4vKipcbiAqIFJldHVybnMgdGhlIGFqYXggZnVuY3Rpb24gYmVpbmcgdXNlZC5cbiAqIEByZXR1cm4ge0Z1bmN0aW9ufVxuICovXG5zaWVzdGEuZ2V0QWpheCA9IGZ1bmN0aW9uKCkge1xuICAgIHJldHVybiBzaWVzdGEuZXh0Lmh0dHAuYWpheDtcbn07XG5cbnNpZXN0YS5ub3RpZnkgPSB1dGlsLm5leHQ7XG5cbi8qKlxuICogUmV0dXJucyBhbiBvYmplY3Qgd2hvcyBrZXlzIG1hcCBvbnRvIHN0cmluZyBjb25zdGFudHMgdXNlZCBmb3IgbG9nIGxldmVscy5cbiAqIEB0eXBlIHtPYmplY3R9XG4gKi9cbnNpZXN0YS5Mb2dMZXZlbCA9IGxvZy5MZXZlbDtcblxuLyoqXG4gKiBTZXRzIHRoZSBsb2cgbGV2ZWwgZm9yIHRoZSBuYW1lZCBsb2dnZXJcbiAqIEBwYXJhbSB7U3RyaW5nfSBsb2dnZXJOYW1lXG4gKiBAcGFyYW0ge1N0cmluZ30gbGV2ZWxcbiAqXG4gKiBAZXhhbXBsZVxuICogLy8gTG9nZ2VyIHVzZWQgYnkgSFRUUCByZXF1ZXN0L3Jlc3BvbnNlIGRlc2NyaXB0b3JzLlxuICogc2llc3RhLnNldExvZ0xldmVsKCdEZXNjcmlwdG9yJywgc2llc3RhLkxvZ0xldmVsLnRyYWNlKTtcbiAqIC8vIExvZ2dlciB1c2VkIGJ5IHJlcXVlc3QgZGVzY3JpcHRvcnMgc3BlY2lmaWNhbGx5LlxuICogc2llc3RhLnNldExvZ0xldmVsKCdSZXF1ZXN0RGVzY3JpcHRvcicsIHNpZXN0YS5Mb2dMZXZlbC50cmFjZSk7XG4gKiAvLyBMb2dnZXIgdXNlZCBieSByZXNwb25zZSBkZXNjcmlwdG9ycyBzcGVjaWZpY2FsbHkuXG4gKiBzaWVzdGEuc2V0TG9nTGV2ZWwoJ1Jlc3BvbnNlRGVzY3JpcHRvcicsIHNpZXN0YS5Mb2dMZXZlbC50cmFjZSk7XG4gKiAvLyBBbGwgZGVzY3JpcHRvcnMgYXJlIHJlZ2lzdGVyZWQgaW4gdGhlIERlc2NyaXB0b3JSZWdpc3RyeS5cbiAqIHNpZXN0YS5zZXRMb2dMZXZlbCgnRGVzY3JpcHRvclJlZ2lzdHJ5Jywgc2llc3RhLkxvZ0xldmVsLnRyYWNlKTtcbiAqIC8vIExvZ2dlciB1c2VkIGJ5IEhUVFAgcmVxdWVzdHMvcmVzcG9uc2VzLlxuICogc2llc3RhLnNldExvZ0xldmVsKCdIVFRQJywgc2llc3RhLkxvZ0xldmVsLnRyYWNlKTtcbiAqIC8vIE9iamVjdHMgYXJlIGNhY2hlZCBieSBsb2NhbCBpZCAoX2lkKSBvciB0aGVpciByZW1vdGUgaWQuIFRoaXMgbG9nZ2VyIGlzIHVzZWQgYnkgdGhlIGxvY2FsIG9iamVjdCBjYWNoZS5cbiAqIHNpZXN0YS5zZXRMb2dMZXZlbCgnTG9jYWxDYWNoZScsIHNpZXN0YS5Mb2dMZXZlbC50cmFjZSk7XG4gKiAvLyBPYmplY3RzIGFyZSBjYWNoZWQgYnkgbG9jYWwgaWQgKF9pZCkgb3IgdGhlaXIgcmVtb3RlIGlkLiBUaGlzIGxvZ2dlciBpcyB1c2VkIGJ5IHRoZSByZW1vdGUgb2JqZWN0IGNhY2hlLlxuICogc2llc3RhLnNldExvZ0xldmVsKCdSZW1vdGVDYWNoZScsIHNpZXN0YS5Mb2dMZXZlbC50cmFjZSk7XG4gKiAvLyBUaGUgbG9nZ2VyIHVzZWQgYnkgY2hhbmdlIG5vdGlmaWNhdGlvbnMuXG4gKiBzaWVzdGEuc2V0TG9nTGV2ZWwoJ2NoYW5nZXMnLCBzaWVzdGEuTG9nTGV2ZWwudHJhY2UpO1xuICogLy8gVGhlIGxvZ2dlciB1c2VkIGJ5IHRoZSBDb2xsZWN0aW9uIGNsYXNzLCB3aGljaCBpcyB1c2VkIHRvIGRlc2NyaWJlIGEgc2V0IG9mIG1hcHBpbmdzLlxuICogc2llc3RhLnNldExvZ0xldmVsKCdDb2xsZWN0aW9uJywgc2llc3RhLkxvZ0xldmVsLnRyYWNlKTtcbiAqIC8vIFRoZSBsb2dnZXIgdXNlZCBieSB0aGUgTWFwcGluZyBjbGFzcy5cbiAqIHNpZXN0YS5zZXRMb2dMZXZlbCgnTWFwcGluZycsIHNpZXN0YS5Mb2dMZXZlbC50cmFjZSk7XG4gKiAvLyBUaGUgbG9nZ2VyIHVzZWQgZHVyaW5nIG1hcHBpbmcgb3BlcmF0aW9ucywgaS5lLiBtYXBwaW5nIGRhdGEgb250byB0aGUgb2JqZWN0IGdyYXBoLlxuICogc2llc3RhLnNldExvZ0xldmVsKCdNYXBwaW5nT3BlcmF0aW9uJywgc2llc3RhLkxvZ0xldmVsLnRyYWNlKTtcbiAqIC8vIFRoZSBsb2dnZXIgdXNlZCBieSB0aGUgU2llc3RhTW9kZWwgY2xhc3MsIHdoaWNoIG1ha2VzIHVwIHRoZSBpbmRpdmlkdWFsIG5vZGVzIG9mIHRoZSBvYmplY3QgZ3JhcGguXG4gKiBzaWVzdGEuc2V0TG9nTGV2ZWwoJ1NpZXN0YU1vZGVsJywgc2llc3RhLkxvZ0xldmVsLnRyYWNlKTtcbiAqIC8vIFRoZSBsb2dnZXIgdXNlZCBieSB0aGUgcGVyZm9ybWFuY2UgbW9uaXRvcmluZyBleHRlbnNpb24gKHNpZXN0YS5wZXJmLmpzKVxuICogc2llc3RhLnNldExvZ0xldmVsKCdQZXJmb3JtYW5jZScsIHNpZXN0YS5Mb2dMZXZlbC50cmFjZSk7XG4gKiAvLyBUaGUgbG9nZ2VyIHVzZWQgZHVyaW5nIGxvY2FsIHF1ZXJpZXMgYWdhaW5zdCB0aGUgb2JqZWN0IGdyYXBoLlxuICogc2llc3RhLnNldExvZ0xldmVsKCdRdWVyeScsIHNpZXN0YS5Mb2dMZXZlbC50cmFjZSk7XG4gKiBzaWVzdGEuc2V0TG9nTGV2ZWwoJ1N0b3JlJywgc2llc3RhLkxvZ0xldmVsLnRyYWNlKTtcbiAqIC8vIE11Y2ggbG9naWMgaW4gU2llc3RhIGlzIHRpZWQgdXAgaW4gJ09wZXJhdGlvbnMnLlxuICogc2llc3RhLnNldExvZ0xldmVsKCdPcGVyYXRpb24nLCBzaWVzdGEuTG9nTGV2ZWwudHJhY2UpO1xuICogLy8gU2llc3RhIG1ha2VzIHVzZSBvZiBxdWV1ZXMgb2Ygb3BlcmF0aW9ucyBmb3IgbWFuYWdpbmcgY29uY3VycmVuY3kgYW5kIGNvbmN1cnJlbnQgb3BlcmF0aW9uIGxpbWl0cy5cbiAqIHNpZXN0YS5zZXRMb2dMZXZlbCgnT3BlcmF0aW9uUXVldWUnLCBzaWVzdGEuTG9nTGV2ZWwudHJhY2UpO1xuICovXG5zaWVzdGEuc2V0TG9nTGV2ZWwgPSBmdW5jdGlvbihsb2dnZXJOYW1lLCBsZXZlbCkge1xuICAgIHZhciBMb2dnZXIgPSBsb2cubG9nZ2VyV2l0aE5hbWUobG9nZ2VyTmFtZSk7XG4gICAgTG9nZ2VyLnNldExldmVsKGxldmVsKTtcbn07XG5cblxuXG5zaWVzdGEuc2VyaWFsaXNlcnMgPSB7fTtcbnNpZXN0YS5zZXJpYWxpemVycyA9IHNpZXN0YS5zZXJpYWxpc2VycztcblxuT2JqZWN0LmRlZmluZVByb3BlcnR5KHNpZXN0YS5zZXJpYWxpc2VycywgJ2lkJywge1xuICAgIGdldDogZnVuY3Rpb24oKSB7XG4gICAgICAgIGlmIChzaWVzdGEuZXh0Lmh0dHBFbmFibGVkKSB7XG4gICAgICAgICAgICByZXR1cm4gc2llc3RhLmV4dC5odHRwLlNlcmlhbGlzZXIuaWRTZXJpYWxpc2VyO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBudWxsO1xuICAgIH1cbn0pO1xuXG5PYmplY3QuZGVmaW5lUHJvcGVydHkoc2llc3RhLnNlcmlhbGlzZXJzLCAnZGVwdGgnLCB7XG4gICAgZ2V0OiBmdW5jdGlvbigpIHtcbiAgICAgICAgaWYgKHNpZXN0YS5leHQuaHR0cEVuYWJsZWQpIHtcbiAgICAgICAgICAgIHJldHVybiBzaWVzdGEuZXh0Lmh0dHAuU2VyaWFsaXNlci5kZXB0aFNlcmlhbGl6ZXI7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIG51bGw7XG4gICAgfVxufSk7XG5cbi8vICogYHNpZXN0YS5tYXBgIGlzIGVxdWl2YWxlbnQgdG8gW18ubWFwXShodHRwOi8vdW5kZXJzY29yZWpzLm9yZy8jbWFwKVxuLy8gKiBgc2llc3RhLmVhY2hgIGlzIGVxdWl2YWxlbnQgdG8gW18uZWFjaF0oaHR0cDovL3VuZGVyc2NvcmVqcy5vcmcvI2VhY2gpXG4vLyAqIGBzaWVzdGEucGFydGlhbGAgaXMgZXF1aXZhbGVudCB0byBbXy5wYXJ0aWFsXShodHRwOi8vdW5kZXJzY29yZWpzLm9yZy8jcGFydGlhbClcbi8vICogYHNpZXN0YS5iaW5kYCBpcyBlcXVpdmFsZW50IHRvIFtfLmJpbmRdKGh0dHA6Ly91bmRlcnNjb3JlanMub3JnLyNiaW5kKVxuLy8gKiBgc2llc3RhLnBsdWNrYCBpcyBlcXVpdmFsZW50IHRvIFtfLnBsdWNrXShodHRwOi8vdW5kZXJzY29yZWpzLm9yZy8jcGx1Y2spXG4vLyAqIGBzaWVzdGEucHJvcGVydHlgIGlzIGVxdWl2YWxlbnQgdG8gW18ucHJvcGVydHldKGh0dHA6Ly91bmRlcnNjb3JlanMub3JnLyNwcm9wZXJ0eSlcbi8vICogYHNpZXN0YS5zb3J0QnlgIGlzIGVxdWl2YWxlbnQgdG8gW18uc29ydEJ5XShodHRwOi8vdW5kZXJzY29yZWpzLm9yZy8jc29ydEJ5KVxuLy8gKiBgc2llc3RhLnBhcmFsbGVsYCBpcyBlcXVpdmFsZW50IHRvIFthc3luYy5wYXJhbGxlbF0oaHR0cHM6Ly9naXRodWIuY29tL2Nhb2xhbi9hc3luYyNwYXJhbGxlbClcbi8vICogYHNpZXN0YS5zZXJpZXNgIGlzIGVxdWl2YWxlbnQgdG8gW2FzeW5jLnNlcmllc10oaHR0cHM6Ly9naXRodWIuY29tL2Nhb2xhbi9hc3luYyNzZXJpZXMpXG5cbnNpZXN0YS5tYXAgPSB1dGlsLl8ubWFwO1xuc2llc3RhLmVhY2ggPSB1dGlsLl8uZWFjaDtcbnNpZXN0YS5wYXJ0aWFsID0gdXRpbC5fLnBhcnRpYWw7XG5zaWVzdGEuYmluZCA9IHV0aWwuXy5iaW5kO1xuc2llc3RhLnBsdWNrID0gdXRpbC5fLnBsdWNrO1xuc2llc3RhLnByb3BlcnR5ID0gdXRpbC5fLnBsdWNrO1xuc2llc3RhLnNvcnRCeSA9IHV0aWwuXy5zb3J0Qnk7XG5zaWVzdGEuc2VyaWVzID0gdXRpbC5zZXJpZXM7XG5zaWVzdGEucGFyYWxsZWwgPSB1dGlsLnBhcmFsbGVsO1xuXG5cbmlmICh0eXBlb2Ygd2luZG93ICE9ICd1bmRlZmluZWQnKSB7XG4gICAgd2luZG93LnNpZXN0YSA9IHNpZXN0YTtcbn1cblxuZXhwb3J0cy5zaWVzdGEgPSBzaWVzdGE7IiwiLy8gQ29weXJpZ2h0IEpveWVudCwgSW5jLiBhbmQgb3RoZXIgTm9kZSBjb250cmlidXRvcnMuXG4vL1xuLy8gUGVybWlzc2lvbiBpcyBoZXJlYnkgZ3JhbnRlZCwgZnJlZSBvZiBjaGFyZ2UsIHRvIGFueSBwZXJzb24gb2J0YWluaW5nIGFcbi8vIGNvcHkgb2YgdGhpcyBzb2Z0d2FyZSBhbmQgYXNzb2NpYXRlZCBkb2N1bWVudGF0aW9uIGZpbGVzICh0aGVcbi8vIFwiU29mdHdhcmVcIiksIHRvIGRlYWwgaW4gdGhlIFNvZnR3YXJlIHdpdGhvdXQgcmVzdHJpY3Rpb24sIGluY2x1ZGluZ1xuLy8gd2l0aG91dCBsaW1pdGF0aW9uIHRoZSByaWdodHMgdG8gdXNlLCBjb3B5LCBtb2RpZnksIG1lcmdlLCBwdWJsaXNoLFxuLy8gZGlzdHJpYnV0ZSwgc3VibGljZW5zZSwgYW5kL29yIHNlbGwgY29waWVzIG9mIHRoZSBTb2Z0d2FyZSwgYW5kIHRvIHBlcm1pdFxuLy8gcGVyc29ucyB0byB3aG9tIHRoZSBTb2Z0d2FyZSBpcyBmdXJuaXNoZWQgdG8gZG8gc28sIHN1YmplY3QgdG8gdGhlXG4vLyBmb2xsb3dpbmcgY29uZGl0aW9uczpcbi8vXG4vLyBUaGUgYWJvdmUgY29weXJpZ2h0IG5vdGljZSBhbmQgdGhpcyBwZXJtaXNzaW9uIG5vdGljZSBzaGFsbCBiZSBpbmNsdWRlZFxuLy8gaW4gYWxsIGNvcGllcyBvciBzdWJzdGFudGlhbCBwb3J0aW9ucyBvZiB0aGUgU29mdHdhcmUuXG4vL1xuLy8gVEhFIFNPRlRXQVJFIElTIFBST1ZJREVEIFwiQVMgSVNcIiwgV0lUSE9VVCBXQVJSQU5UWSBPRiBBTlkgS0lORCwgRVhQUkVTU1xuLy8gT1IgSU1QTElFRCwgSU5DTFVESU5HIEJVVCBOT1QgTElNSVRFRCBUTyBUSEUgV0FSUkFOVElFUyBPRlxuLy8gTUVSQ0hBTlRBQklMSVRZLCBGSVRORVNTIEZPUiBBIFBBUlRJQ1VMQVIgUFVSUE9TRSBBTkQgTk9OSU5GUklOR0VNRU5ULiBJTlxuLy8gTk8gRVZFTlQgU0hBTEwgVEhFIEFVVEhPUlMgT1IgQ09QWVJJR0hUIEhPTERFUlMgQkUgTElBQkxFIEZPUiBBTlkgQ0xBSU0sXG4vLyBEQU1BR0VTIE9SIE9USEVSIExJQUJJTElUWSwgV0hFVEhFUiBJTiBBTiBBQ1RJT04gT0YgQ09OVFJBQ1QsIFRPUlQgT1Jcbi8vIE9USEVSV0lTRSwgQVJJU0lORyBGUk9NLCBPVVQgT0YgT1IgSU4gQ09OTkVDVElPTiBXSVRIIFRIRSBTT0ZUV0FSRSBPUiBUSEVcbi8vIFVTRSBPUiBPVEhFUiBERUFMSU5HUyBJTiBUSEUgU09GVFdBUkUuXG5cbmZ1bmN0aW9uIEV2ZW50RW1pdHRlcigpIHtcbiAgdGhpcy5fZXZlbnRzID0gdGhpcy5fZXZlbnRzIHx8IHt9O1xuICB0aGlzLl9tYXhMaXN0ZW5lcnMgPSB0aGlzLl9tYXhMaXN0ZW5lcnMgfHwgdW5kZWZpbmVkO1xufVxubW9kdWxlLmV4cG9ydHMgPSBFdmVudEVtaXR0ZXI7XG5cbi8vIEJhY2t3YXJkcy1jb21wYXQgd2l0aCBub2RlIDAuMTAueFxuRXZlbnRFbWl0dGVyLkV2ZW50RW1pdHRlciA9IEV2ZW50RW1pdHRlcjtcblxuRXZlbnRFbWl0dGVyLnByb3RvdHlwZS5fZXZlbnRzID0gdW5kZWZpbmVkO1xuRXZlbnRFbWl0dGVyLnByb3RvdHlwZS5fbWF4TGlzdGVuZXJzID0gdW5kZWZpbmVkO1xuXG4vLyBCeSBkZWZhdWx0IEV2ZW50RW1pdHRlcnMgd2lsbCBwcmludCBhIHdhcm5pbmcgaWYgbW9yZSB0aGFuIDEwIGxpc3RlbmVycyBhcmVcbi8vIGFkZGVkIHRvIGl0LiBUaGlzIGlzIGEgdXNlZnVsIGRlZmF1bHQgd2hpY2ggaGVscHMgZmluZGluZyBtZW1vcnkgbGVha3MuXG5FdmVudEVtaXR0ZXIuZGVmYXVsdE1heExpc3RlbmVycyA9IDEwO1xuXG4vLyBPYnZpb3VzbHkgbm90IGFsbCBFbWl0dGVycyBzaG91bGQgYmUgbGltaXRlZCB0byAxMC4gVGhpcyBmdW5jdGlvbiBhbGxvd3Ncbi8vIHRoYXQgdG8gYmUgaW5jcmVhc2VkLiBTZXQgdG8gemVybyBmb3IgdW5saW1pdGVkLlxuRXZlbnRFbWl0dGVyLnByb3RvdHlwZS5zZXRNYXhMaXN0ZW5lcnMgPSBmdW5jdGlvbihuKSB7XG4gIGlmICghaXNOdW1iZXIobikgfHwgbiA8IDAgfHwgaXNOYU4obikpXG4gICAgdGhyb3cgVHlwZUVycm9yKCduIG11c3QgYmUgYSBwb3NpdGl2ZSBudW1iZXInKTtcbiAgdGhpcy5fbWF4TGlzdGVuZXJzID0gbjtcbiAgcmV0dXJuIHRoaXM7XG59O1xuXG5FdmVudEVtaXR0ZXIucHJvdG90eXBlLmVtaXQgPSBmdW5jdGlvbih0eXBlKSB7XG4gIHZhciBlciwgaGFuZGxlciwgbGVuLCBhcmdzLCBpLCBsaXN0ZW5lcnM7XG5cbiAgaWYgKCF0aGlzLl9ldmVudHMpXG4gICAgdGhpcy5fZXZlbnRzID0ge307XG5cbiAgLy8gSWYgdGhlcmUgaXMgbm8gJ2Vycm9yJyBldmVudCBsaXN0ZW5lciB0aGVuIHRocm93LlxuICBpZiAodHlwZSA9PT0gJ2Vycm9yJykge1xuICAgIGlmICghdGhpcy5fZXZlbnRzLmVycm9yIHx8XG4gICAgICAgIChpc09iamVjdCh0aGlzLl9ldmVudHMuZXJyb3IpICYmICF0aGlzLl9ldmVudHMuZXJyb3IubGVuZ3RoKSkge1xuICAgICAgZXIgPSBhcmd1bWVudHNbMV07XG4gICAgICBpZiAoZXIgaW5zdGFuY2VvZiBFcnJvcikge1xuICAgICAgICB0aHJvdyBlcjsgLy8gVW5oYW5kbGVkICdlcnJvcicgZXZlbnRcbiAgICAgIH1cbiAgICAgIHRocm93IFR5cGVFcnJvcignVW5jYXVnaHQsIHVuc3BlY2lmaWVkIFwiZXJyb3JcIiBldmVudC4nKTtcbiAgICB9XG4gIH1cblxuICBoYW5kbGVyID0gdGhpcy5fZXZlbnRzW3R5cGVdO1xuXG4gIGlmIChpc1VuZGVmaW5lZChoYW5kbGVyKSlcbiAgICByZXR1cm4gZmFsc2U7XG5cbiAgaWYgKGlzRnVuY3Rpb24oaGFuZGxlcikpIHtcbiAgICBzd2l0Y2ggKGFyZ3VtZW50cy5sZW5ndGgpIHtcbiAgICAgIC8vIGZhc3QgY2FzZXNcbiAgICAgIGNhc2UgMTpcbiAgICAgICAgaGFuZGxlci5jYWxsKHRoaXMpO1xuICAgICAgICBicmVhaztcbiAgICAgIGNhc2UgMjpcbiAgICAgICAgaGFuZGxlci5jYWxsKHRoaXMsIGFyZ3VtZW50c1sxXSk7XG4gICAgICAgIGJyZWFrO1xuICAgICAgY2FzZSAzOlxuICAgICAgICBoYW5kbGVyLmNhbGwodGhpcywgYXJndW1lbnRzWzFdLCBhcmd1bWVudHNbMl0pO1xuICAgICAgICBicmVhaztcbiAgICAgIC8vIHNsb3dlclxuICAgICAgZGVmYXVsdDpcbiAgICAgICAgbGVuID0gYXJndW1lbnRzLmxlbmd0aDtcbiAgICAgICAgYXJncyA9IG5ldyBBcnJheShsZW4gLSAxKTtcbiAgICAgICAgZm9yIChpID0gMTsgaSA8IGxlbjsgaSsrKVxuICAgICAgICAgIGFyZ3NbaSAtIDFdID0gYXJndW1lbnRzW2ldO1xuICAgICAgICBoYW5kbGVyLmFwcGx5KHRoaXMsIGFyZ3MpO1xuICAgIH1cbiAgfSBlbHNlIGlmIChpc09iamVjdChoYW5kbGVyKSkge1xuICAgIGxlbiA9IGFyZ3VtZW50cy5sZW5ndGg7XG4gICAgYXJncyA9IG5ldyBBcnJheShsZW4gLSAxKTtcbiAgICBmb3IgKGkgPSAxOyBpIDwgbGVuOyBpKyspXG4gICAgICBhcmdzW2kgLSAxXSA9IGFyZ3VtZW50c1tpXTtcblxuICAgIGxpc3RlbmVycyA9IGhhbmRsZXIuc2xpY2UoKTtcbiAgICBsZW4gPSBsaXN0ZW5lcnMubGVuZ3RoO1xuICAgIGZvciAoaSA9IDA7IGkgPCBsZW47IGkrKylcbiAgICAgIGxpc3RlbmVyc1tpXS5hcHBseSh0aGlzLCBhcmdzKTtcbiAgfVxuXG4gIHJldHVybiB0cnVlO1xufTtcblxuRXZlbnRFbWl0dGVyLnByb3RvdHlwZS5hZGRMaXN0ZW5lciA9IGZ1bmN0aW9uKHR5cGUsIGxpc3RlbmVyKSB7XG4gIHZhciBtO1xuXG4gIGlmICghaXNGdW5jdGlvbihsaXN0ZW5lcikpXG4gICAgdGhyb3cgVHlwZUVycm9yKCdsaXN0ZW5lciBtdXN0IGJlIGEgZnVuY3Rpb24nKTtcblxuICBpZiAoIXRoaXMuX2V2ZW50cylcbiAgICB0aGlzLl9ldmVudHMgPSB7fTtcblxuICAvLyBUbyBhdm9pZCByZWN1cnNpb24gaW4gdGhlIGNhc2UgdGhhdCB0eXBlID09PSBcIm5ld0xpc3RlbmVyXCIhIEJlZm9yZVxuICAvLyBhZGRpbmcgaXQgdG8gdGhlIGxpc3RlbmVycywgZmlyc3QgZW1pdCBcIm5ld0xpc3RlbmVyXCIuXG4gIGlmICh0aGlzLl9ldmVudHMubmV3TGlzdGVuZXIpXG4gICAgdGhpcy5lbWl0KCduZXdMaXN0ZW5lcicsIHR5cGUsXG4gICAgICAgICAgICAgIGlzRnVuY3Rpb24obGlzdGVuZXIubGlzdGVuZXIpID9cbiAgICAgICAgICAgICAgbGlzdGVuZXIubGlzdGVuZXIgOiBsaXN0ZW5lcik7XG5cbiAgaWYgKCF0aGlzLl9ldmVudHNbdHlwZV0pXG4gICAgLy8gT3B0aW1pemUgdGhlIGNhc2Ugb2Ygb25lIGxpc3RlbmVyLiBEb24ndCBuZWVkIHRoZSBleHRyYSBhcnJheSBvYmplY3QuXG4gICAgdGhpcy5fZXZlbnRzW3R5cGVdID0gbGlzdGVuZXI7XG4gIGVsc2UgaWYgKGlzT2JqZWN0KHRoaXMuX2V2ZW50c1t0eXBlXSkpXG4gICAgLy8gSWYgd2UndmUgYWxyZWFkeSBnb3QgYW4gYXJyYXksIGp1c3QgYXBwZW5kLlxuICAgIHRoaXMuX2V2ZW50c1t0eXBlXS5wdXNoKGxpc3RlbmVyKTtcbiAgZWxzZVxuICAgIC8vIEFkZGluZyB0aGUgc2Vjb25kIGVsZW1lbnQsIG5lZWQgdG8gY2hhbmdlIHRvIGFycmF5LlxuICAgIHRoaXMuX2V2ZW50c1t0eXBlXSA9IFt0aGlzLl9ldmVudHNbdHlwZV0sIGxpc3RlbmVyXTtcblxuICAvLyBDaGVjayBmb3IgbGlzdGVuZXIgbGVha1xuICBpZiAoaXNPYmplY3QodGhpcy5fZXZlbnRzW3R5cGVdKSAmJiAhdGhpcy5fZXZlbnRzW3R5cGVdLndhcm5lZCkge1xuICAgIHZhciBtO1xuICAgIGlmICghaXNVbmRlZmluZWQodGhpcy5fbWF4TGlzdGVuZXJzKSkge1xuICAgICAgbSA9IHRoaXMuX21heExpc3RlbmVycztcbiAgICB9IGVsc2Uge1xuICAgICAgbSA9IEV2ZW50RW1pdHRlci5kZWZhdWx0TWF4TGlzdGVuZXJzO1xuICAgIH1cblxuICAgIGlmIChtICYmIG0gPiAwICYmIHRoaXMuX2V2ZW50c1t0eXBlXS5sZW5ndGggPiBtKSB7XG4gICAgICB0aGlzLl9ldmVudHNbdHlwZV0ud2FybmVkID0gdHJ1ZTtcbiAgICAgIGNvbnNvbGUuZXJyb3IoJyhub2RlKSB3YXJuaW5nOiBwb3NzaWJsZSBFdmVudEVtaXR0ZXIgbWVtb3J5ICcgK1xuICAgICAgICAgICAgICAgICAgICAnbGVhayBkZXRlY3RlZC4gJWQgbGlzdGVuZXJzIGFkZGVkLiAnICtcbiAgICAgICAgICAgICAgICAgICAgJ1VzZSBlbWl0dGVyLnNldE1heExpc3RlbmVycygpIHRvIGluY3JlYXNlIGxpbWl0LicsXG4gICAgICAgICAgICAgICAgICAgIHRoaXMuX2V2ZW50c1t0eXBlXS5sZW5ndGgpO1xuICAgICAgaWYgKHR5cGVvZiBjb25zb2xlLnRyYWNlID09PSAnZnVuY3Rpb24nKSB7XG4gICAgICAgIC8vIG5vdCBzdXBwb3J0ZWQgaW4gSUUgMTBcbiAgICAgICAgY29uc29sZS50cmFjZSgpO1xuICAgICAgfVxuICAgIH1cbiAgfVxuXG4gIHJldHVybiB0aGlzO1xufTtcblxuRXZlbnRFbWl0dGVyLnByb3RvdHlwZS5vbiA9IEV2ZW50RW1pdHRlci5wcm90b3R5cGUuYWRkTGlzdGVuZXI7XG5cbkV2ZW50RW1pdHRlci5wcm90b3R5cGUub25jZSA9IGZ1bmN0aW9uKHR5cGUsIGxpc3RlbmVyKSB7XG4gIGlmICghaXNGdW5jdGlvbihsaXN0ZW5lcikpXG4gICAgdGhyb3cgVHlwZUVycm9yKCdsaXN0ZW5lciBtdXN0IGJlIGEgZnVuY3Rpb24nKTtcblxuICB2YXIgZmlyZWQgPSBmYWxzZTtcblxuICBmdW5jdGlvbiBnKCkge1xuICAgIHRoaXMucmVtb3ZlTGlzdGVuZXIodHlwZSwgZyk7XG5cbiAgICBpZiAoIWZpcmVkKSB7XG4gICAgICBmaXJlZCA9IHRydWU7XG4gICAgICBsaXN0ZW5lci5hcHBseSh0aGlzLCBhcmd1bWVudHMpO1xuICAgIH1cbiAgfVxuXG4gIGcubGlzdGVuZXIgPSBsaXN0ZW5lcjtcbiAgdGhpcy5vbih0eXBlLCBnKTtcblxuICByZXR1cm4gdGhpcztcbn07XG5cbi8vIGVtaXRzIGEgJ3JlbW92ZUxpc3RlbmVyJyBldmVudCBpZmYgdGhlIGxpc3RlbmVyIHdhcyByZW1vdmVkXG5FdmVudEVtaXR0ZXIucHJvdG90eXBlLnJlbW92ZUxpc3RlbmVyID0gZnVuY3Rpb24odHlwZSwgbGlzdGVuZXIpIHtcbiAgdmFyIGxpc3QsIHBvc2l0aW9uLCBsZW5ndGgsIGk7XG5cbiAgaWYgKCFpc0Z1bmN0aW9uKGxpc3RlbmVyKSlcbiAgICB0aHJvdyBUeXBlRXJyb3IoJ2xpc3RlbmVyIG11c3QgYmUgYSBmdW5jdGlvbicpO1xuXG4gIGlmICghdGhpcy5fZXZlbnRzIHx8ICF0aGlzLl9ldmVudHNbdHlwZV0pXG4gICAgcmV0dXJuIHRoaXM7XG5cbiAgbGlzdCA9IHRoaXMuX2V2ZW50c1t0eXBlXTtcbiAgbGVuZ3RoID0gbGlzdC5sZW5ndGg7XG4gIHBvc2l0aW9uID0gLTE7XG5cbiAgaWYgKGxpc3QgPT09IGxpc3RlbmVyIHx8XG4gICAgICAoaXNGdW5jdGlvbihsaXN0Lmxpc3RlbmVyKSAmJiBsaXN0Lmxpc3RlbmVyID09PSBsaXN0ZW5lcikpIHtcbiAgICBkZWxldGUgdGhpcy5fZXZlbnRzW3R5cGVdO1xuICAgIGlmICh0aGlzLl9ldmVudHMucmVtb3ZlTGlzdGVuZXIpXG4gICAgICB0aGlzLmVtaXQoJ3JlbW92ZUxpc3RlbmVyJywgdHlwZSwgbGlzdGVuZXIpO1xuXG4gIH0gZWxzZSBpZiAoaXNPYmplY3QobGlzdCkpIHtcbiAgICBmb3IgKGkgPSBsZW5ndGg7IGktLSA+IDA7KSB7XG4gICAgICBpZiAobGlzdFtpXSA9PT0gbGlzdGVuZXIgfHxcbiAgICAgICAgICAobGlzdFtpXS5saXN0ZW5lciAmJiBsaXN0W2ldLmxpc3RlbmVyID09PSBsaXN0ZW5lcikpIHtcbiAgICAgICAgcG9zaXRpb24gPSBpO1xuICAgICAgICBicmVhaztcbiAgICAgIH1cbiAgICB9XG5cbiAgICBpZiAocG9zaXRpb24gPCAwKVxuICAgICAgcmV0dXJuIHRoaXM7XG5cbiAgICBpZiAobGlzdC5sZW5ndGggPT09IDEpIHtcbiAgICAgIGxpc3QubGVuZ3RoID0gMDtcbiAgICAgIGRlbGV0ZSB0aGlzLl9ldmVudHNbdHlwZV07XG4gICAgfSBlbHNlIHtcbiAgICAgIGxpc3Quc3BsaWNlKHBvc2l0aW9uLCAxKTtcbiAgICB9XG5cbiAgICBpZiAodGhpcy5fZXZlbnRzLnJlbW92ZUxpc3RlbmVyKVxuICAgICAgdGhpcy5lbWl0KCdyZW1vdmVMaXN0ZW5lcicsIHR5cGUsIGxpc3RlbmVyKTtcbiAgfVxuXG4gIHJldHVybiB0aGlzO1xufTtcblxuRXZlbnRFbWl0dGVyLnByb3RvdHlwZS5yZW1vdmVBbGxMaXN0ZW5lcnMgPSBmdW5jdGlvbih0eXBlKSB7XG4gIHZhciBrZXksIGxpc3RlbmVycztcblxuICBpZiAoIXRoaXMuX2V2ZW50cylcbiAgICByZXR1cm4gdGhpcztcblxuICAvLyBub3QgbGlzdGVuaW5nIGZvciByZW1vdmVMaXN0ZW5lciwgbm8gbmVlZCB0byBlbWl0XG4gIGlmICghdGhpcy5fZXZlbnRzLnJlbW92ZUxpc3RlbmVyKSB7XG4gICAgaWYgKGFyZ3VtZW50cy5sZW5ndGggPT09IDApXG4gICAgICB0aGlzLl9ldmVudHMgPSB7fTtcbiAgICBlbHNlIGlmICh0aGlzLl9ldmVudHNbdHlwZV0pXG4gICAgICBkZWxldGUgdGhpcy5fZXZlbnRzW3R5cGVdO1xuICAgIHJldHVybiB0aGlzO1xuICB9XG5cbiAgLy8gZW1pdCByZW1vdmVMaXN0ZW5lciBmb3IgYWxsIGxpc3RlbmVycyBvbiBhbGwgZXZlbnRzXG4gIGlmIChhcmd1bWVudHMubGVuZ3RoID09PSAwKSB7XG4gICAgZm9yIChrZXkgaW4gdGhpcy5fZXZlbnRzKSB7XG4gICAgICBpZiAoa2V5ID09PSAncmVtb3ZlTGlzdGVuZXInKSBjb250aW51ZTtcbiAgICAgIHRoaXMucmVtb3ZlQWxsTGlzdGVuZXJzKGtleSk7XG4gICAgfVxuICAgIHRoaXMucmVtb3ZlQWxsTGlzdGVuZXJzKCdyZW1vdmVMaXN0ZW5lcicpO1xuICAgIHRoaXMuX2V2ZW50cyA9IHt9O1xuICAgIHJldHVybiB0aGlzO1xuICB9XG5cbiAgbGlzdGVuZXJzID0gdGhpcy5fZXZlbnRzW3R5cGVdO1xuXG4gIGlmIChpc0Z1bmN0aW9uKGxpc3RlbmVycykpIHtcbiAgICB0aGlzLnJlbW92ZUxpc3RlbmVyKHR5cGUsIGxpc3RlbmVycyk7XG4gIH0gZWxzZSB7XG4gICAgLy8gTElGTyBvcmRlclxuICAgIHdoaWxlIChsaXN0ZW5lcnMubGVuZ3RoKVxuICAgICAgdGhpcy5yZW1vdmVMaXN0ZW5lcih0eXBlLCBsaXN0ZW5lcnNbbGlzdGVuZXJzLmxlbmd0aCAtIDFdKTtcbiAgfVxuICBkZWxldGUgdGhpcy5fZXZlbnRzW3R5cGVdO1xuXG4gIHJldHVybiB0aGlzO1xufTtcblxuRXZlbnRFbWl0dGVyLnByb3RvdHlwZS5saXN0ZW5lcnMgPSBmdW5jdGlvbih0eXBlKSB7XG4gIHZhciByZXQ7XG4gIGlmICghdGhpcy5fZXZlbnRzIHx8ICF0aGlzLl9ldmVudHNbdHlwZV0pXG4gICAgcmV0ID0gW107XG4gIGVsc2UgaWYgKGlzRnVuY3Rpb24odGhpcy5fZXZlbnRzW3R5cGVdKSlcbiAgICByZXQgPSBbdGhpcy5fZXZlbnRzW3R5cGVdXTtcbiAgZWxzZVxuICAgIHJldCA9IHRoaXMuX2V2ZW50c1t0eXBlXS5zbGljZSgpO1xuICByZXR1cm4gcmV0O1xufTtcblxuRXZlbnRFbWl0dGVyLmxpc3RlbmVyQ291bnQgPSBmdW5jdGlvbihlbWl0dGVyLCB0eXBlKSB7XG4gIHZhciByZXQ7XG4gIGlmICghZW1pdHRlci5fZXZlbnRzIHx8ICFlbWl0dGVyLl9ldmVudHNbdHlwZV0pXG4gICAgcmV0ID0gMDtcbiAgZWxzZSBpZiAoaXNGdW5jdGlvbihlbWl0dGVyLl9ldmVudHNbdHlwZV0pKVxuICAgIHJldCA9IDE7XG4gIGVsc2VcbiAgICByZXQgPSBlbWl0dGVyLl9ldmVudHNbdHlwZV0ubGVuZ3RoO1xuICByZXR1cm4gcmV0O1xufTtcblxuZnVuY3Rpb24gaXNGdW5jdGlvbihhcmcpIHtcbiAgcmV0dXJuIHR5cGVvZiBhcmcgPT09ICdmdW5jdGlvbic7XG59XG5cbmZ1bmN0aW9uIGlzTnVtYmVyKGFyZykge1xuICByZXR1cm4gdHlwZW9mIGFyZyA9PT0gJ251bWJlcic7XG59XG5cbmZ1bmN0aW9uIGlzT2JqZWN0KGFyZykge1xuICByZXR1cm4gdHlwZW9mIGFyZyA9PT0gJ29iamVjdCcgJiYgYXJnICE9PSBudWxsO1xufVxuXG5mdW5jdGlvbiBpc1VuZGVmaW5lZChhcmcpIHtcbiAgcmV0dXJuIGFyZyA9PT0gdm9pZCAwO1xufVxuIiwidmFyIGhhc093biA9IE9iamVjdC5wcm90b3R5cGUuaGFzT3duUHJvcGVydHk7XG52YXIgdG9TdHJpbmcgPSBPYmplY3QucHJvdG90eXBlLnRvU3RyaW5nO1xudmFyIHVuZGVmaW5lZDtcblxudmFyIGlzUGxhaW5PYmplY3QgPSBmdW5jdGlvbiBpc1BsYWluT2JqZWN0KG9iaikge1xuXHRcInVzZSBzdHJpY3RcIjtcblx0aWYgKCFvYmogfHwgdG9TdHJpbmcuY2FsbChvYmopICE9PSAnW29iamVjdCBPYmplY3RdJyB8fCBvYmoubm9kZVR5cGUgfHwgb2JqLnNldEludGVydmFsKSB7XG5cdFx0cmV0dXJuIGZhbHNlO1xuXHR9XG5cblx0dmFyIGhhc19vd25fY29uc3RydWN0b3IgPSBoYXNPd24uY2FsbChvYmosICdjb25zdHJ1Y3RvcicpO1xuXHR2YXIgaGFzX2lzX3Byb3BlcnR5X29mX21ldGhvZCA9IG9iai5jb25zdHJ1Y3RvciAmJiBvYmouY29uc3RydWN0b3IucHJvdG90eXBlICYmIGhhc093bi5jYWxsKG9iai5jb25zdHJ1Y3Rvci5wcm90b3R5cGUsICdpc1Byb3RvdHlwZU9mJyk7XG5cdC8vIE5vdCBvd24gY29uc3RydWN0b3IgcHJvcGVydHkgbXVzdCBiZSBPYmplY3Rcblx0aWYgKG9iai5jb25zdHJ1Y3RvciAmJiAhaGFzX293bl9jb25zdHJ1Y3RvciAmJiAhaGFzX2lzX3Byb3BlcnR5X29mX21ldGhvZCkge1xuXHRcdHJldHVybiBmYWxzZTtcblx0fVxuXG5cdC8vIE93biBwcm9wZXJ0aWVzIGFyZSBlbnVtZXJhdGVkIGZpcnN0bHksIHNvIHRvIHNwZWVkIHVwLFxuXHQvLyBpZiBsYXN0IG9uZSBpcyBvd24sIHRoZW4gYWxsIHByb3BlcnRpZXMgYXJlIG93bi5cblx0dmFyIGtleTtcblx0Zm9yIChrZXkgaW4gb2JqKSB7fVxuXG5cdHJldHVybiBrZXkgPT09IHVuZGVmaW5lZCB8fCBoYXNPd24uY2FsbChvYmosIGtleSk7XG59O1xuXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIGV4dGVuZCgpIHtcblx0XCJ1c2Ugc3RyaWN0XCI7XG5cdHZhciBvcHRpb25zLCBuYW1lLCBzcmMsIGNvcHksIGNvcHlJc0FycmF5LCBjbG9uZSxcblx0XHR0YXJnZXQgPSBhcmd1bWVudHNbMF0sXG5cdFx0aSA9IDEsXG5cdFx0bGVuZ3RoID0gYXJndW1lbnRzLmxlbmd0aCxcblx0XHRkZWVwID0gZmFsc2U7XG5cblx0Ly8gSGFuZGxlIGEgZGVlcCBjb3B5IHNpdHVhdGlvblxuXHRpZiAodHlwZW9mIHRhcmdldCA9PT0gXCJib29sZWFuXCIpIHtcblx0XHRkZWVwID0gdGFyZ2V0O1xuXHRcdHRhcmdldCA9IGFyZ3VtZW50c1sxXSB8fCB7fTtcblx0XHQvLyBza2lwIHRoZSBib29sZWFuIGFuZCB0aGUgdGFyZ2V0XG5cdFx0aSA9IDI7XG5cdH0gZWxzZSBpZiAodHlwZW9mIHRhcmdldCAhPT0gXCJvYmplY3RcIiAmJiB0eXBlb2YgdGFyZ2V0ICE9PSBcImZ1bmN0aW9uXCIgfHwgdGFyZ2V0ID09IHVuZGVmaW5lZCkge1xuXHRcdFx0dGFyZ2V0ID0ge307XG5cdH1cblxuXHRmb3IgKDsgaSA8IGxlbmd0aDsgKytpKSB7XG5cdFx0Ly8gT25seSBkZWFsIHdpdGggbm9uLW51bGwvdW5kZWZpbmVkIHZhbHVlc1xuXHRcdGlmICgob3B0aW9ucyA9IGFyZ3VtZW50c1tpXSkgIT0gbnVsbCkge1xuXHRcdFx0Ly8gRXh0ZW5kIHRoZSBiYXNlIG9iamVjdFxuXHRcdFx0Zm9yIChuYW1lIGluIG9wdGlvbnMpIHtcblx0XHRcdFx0c3JjID0gdGFyZ2V0W25hbWVdO1xuXHRcdFx0XHRjb3B5ID0gb3B0aW9uc1tuYW1lXTtcblxuXHRcdFx0XHQvLyBQcmV2ZW50IG5ldmVyLWVuZGluZyBsb29wXG5cdFx0XHRcdGlmICh0YXJnZXQgPT09IGNvcHkpIHtcblx0XHRcdFx0XHRjb250aW51ZTtcblx0XHRcdFx0fVxuXG5cdFx0XHRcdC8vIFJlY3Vyc2UgaWYgd2UncmUgbWVyZ2luZyBwbGFpbiBvYmplY3RzIG9yIGFycmF5c1xuXHRcdFx0XHRpZiAoZGVlcCAmJiBjb3B5ICYmIChpc1BsYWluT2JqZWN0KGNvcHkpIHx8IChjb3B5SXNBcnJheSA9IEFycmF5LmlzQXJyYXkoY29weSkpKSkge1xuXHRcdFx0XHRcdGlmIChjb3B5SXNBcnJheSkge1xuXHRcdFx0XHRcdFx0Y29weUlzQXJyYXkgPSBmYWxzZTtcblx0XHRcdFx0XHRcdGNsb25lID0gc3JjICYmIEFycmF5LmlzQXJyYXkoc3JjKSA/IHNyYyA6IFtdO1xuXHRcdFx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdFx0XHRjbG9uZSA9IHNyYyAmJiBpc1BsYWluT2JqZWN0KHNyYykgPyBzcmMgOiB7fTtcblx0XHRcdFx0XHR9XG5cblx0XHRcdFx0XHQvLyBOZXZlciBtb3ZlIG9yaWdpbmFsIG9iamVjdHMsIGNsb25lIHRoZW1cblx0XHRcdFx0XHR0YXJnZXRbbmFtZV0gPSBleHRlbmQoZGVlcCwgY2xvbmUsIGNvcHkpO1xuXG5cdFx0XHRcdC8vIERvbid0IGJyaW5nIGluIHVuZGVmaW5lZCB2YWx1ZXNcblx0XHRcdFx0fSBlbHNlIGlmIChjb3B5ICE9PSB1bmRlZmluZWQpIHtcblx0XHRcdFx0XHR0YXJnZXRbbmFtZV0gPSBjb3B5O1xuXHRcdFx0XHR9XG5cdFx0XHR9XG5cdFx0fVxuXHR9XG5cblx0Ly8gUmV0dXJuIHRoZSBtb2RpZmllZCBvYmplY3Rcblx0cmV0dXJuIHRhcmdldDtcbn07XG5cbiIsIi8qKlxuICogVGhpcyBpcyBhbiBpbi1tZW1vcnkgY2FjaGUgZm9yIG1vZGVscy4gTW9kZWxzIGFyZSBjYWNoZWQgYnkgbG9jYWwgaWQgKF9pZCkgYW5kIHJlbW90ZSBpZCAoZGVmaW5lZCBieSB0aGUgbWFwcGluZykuXG4gKiBMb29rdXBzIGFyZSBwZXJmb3JtZWQgYWdhaW5zdCB0aGUgY2FjaGUgd2hlbiBtYXBwaW5nLlxuICogQG1vZHVsZSBjYWNoZVxuICovXG52YXIgbG9nID0gcmVxdWlyZSgnLi9vcGVyYXRpb24vbG9nJyk7XG52YXIgTG9jYWxDYWNoZUxvZ2dlciA9IGxvZy5sb2dnZXJXaXRoTmFtZSgnTG9jYWxDYWNoZScpO1xuTG9jYWxDYWNoZUxvZ2dlci5zZXRMZXZlbChsb2cuTGV2ZWwud2Fybik7XG52YXIgUmVtb3RlQ2FjaGVMb2dnZXIgPSBsb2cubG9nZ2VyV2l0aE5hbWUoJ1JlbW90ZUNhY2hlJyk7XG5SZW1vdGVDYWNoZUxvZ2dlci5zZXRMZXZlbChsb2cuTGV2ZWwud2Fybik7XG52YXIgSW50ZXJuYWxTaWVzdGFFcnJvciA9IHJlcXVpcmUoJy4vZXJyb3InKS5JbnRlcm5hbFNpZXN0YUVycm9yO1xudmFyIHV0aWwgPSByZXF1aXJlKCcuL3V0aWwnKTtcblxuXG52YXIgbG9jYWxDYWNoZUJ5SWQgPSB7fTtcbnZhciBsb2NhbENhY2hlID0ge307XG5cblxudmFyIHJlbW90ZUNhY2hlID0ge307XG5cbmZ1bmN0aW9uIHJlc2V0KCkge1xuICAgIHJlbW90ZUNhY2hlID0ge307XG4gICAgbG9jYWxDYWNoZUJ5SWQgPSB7fTtcbiAgICBsb2NhbENhY2hlID0ge307XG59XG5cbnJlc2V0KCk7XG5cbi8qKlxuICogUmV0dXJuIHRoZSBvYmplY3QgaW4gdGhlIGNhY2hlIGdpdmVuIGEgbG9jYWwgaWQgKF9pZClcbiAqIEBwYXJhbSAge1N0cmluZ30gbG9jYWxJZFxuICogQHJldHVybiB7U2llc3RhTW9kZWx9XG4gKi9cbmZ1bmN0aW9uIGdldFZpYUxvY2FsSWQobG9jYWxJZCkge1xuICAgIHZhciBvYmogPSBsb2NhbENhY2hlQnlJZFtsb2NhbElkXTtcbiAgICBpZiAob2JqKSB7XG4gICAgICAgIGlmIChMb2NhbENhY2hlTG9nZ2VyLmRlYnVnLmlzRW5hYmxlZClcbiAgICAgICAgICAgIExvY2FsQ2FjaGVMb2dnZXIuZGVidWcoJ0xvY2FsIGNhY2hlIGhpdDogJyArIG9iai5fZHVtcCh0cnVlKSk7XG4gICAgfSBlbHNlIHtcbiAgICAgICAgaWYgKExvY2FsQ2FjaGVMb2dnZXIuZGVidWcuaXNFbmFibGVkKVxuICAgICAgICAgICAgTG9jYWxDYWNoZUxvZ2dlci5kZWJ1ZygnTG9jYWwgY2FjaGUgbWlzczogJyArIGxvY2FsSWQpO1xuICAgIH1cbiAgICByZXR1cm4gb2JqO1xufVxuXG4vKipcbiAqIFJldHVybiB0aGUgc2luZ2xldG9uIG9iamVjdCBnaXZlbiBhIHNpbmdsZXRvbiBtYXBwaW5nLlxuICogQHBhcmFtICB7TWFwcGluZ30gbWFwcGluZ1xuICogQHJldHVybiB7U2llc3RhTW9kZWx9XG4gKi9cbmZ1bmN0aW9uIGdldFNpbmdsZXRvbihtYXBwaW5nKSB7XG4gICAgdmFyIG1hcHBpbmdOYW1lID0gbWFwcGluZy50eXBlO1xuICAgIHZhciBjb2xsZWN0aW9uTmFtZSA9IG1hcHBpbmcuY29sbGVjdGlvbjtcbiAgICB2YXIgY29sbGVjdGlvbkNhY2hlID0gbG9jYWxDYWNoZVtjb2xsZWN0aW9uTmFtZV07XG4gICAgaWYgKGNvbGxlY3Rpb25DYWNoZSkge1xuICAgICAgICB2YXIgdHlwZUNhY2hlID0gY29sbGVjdGlvbkNhY2hlW21hcHBpbmdOYW1lXTtcbiAgICAgICAgaWYgKHR5cGVDYWNoZSkge1xuICAgICAgICAgICAgdmFyIG9ianMgPSBbXTtcbiAgICAgICAgICAgIGZvciAodmFyIHByb3AgaW4gdHlwZUNhY2hlKSB7XG4gICAgICAgICAgICAgICAgaWYgKHR5cGVDYWNoZS5oYXNPd25Qcm9wZXJ0eShwcm9wKSkge1xuICAgICAgICAgICAgICAgICAgICBvYmpzLnB1c2godHlwZUNhY2hlW3Byb3BdKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBpZiAob2Jqcy5sZW5ndGggPiAxKSB7XG4gICAgICAgICAgICAgICAgdGhyb3cgbmV3IEludGVybmFsU2llc3RhRXJyb3IoJ0Egc2luZ2xldG9uIG1hcHBpbmcgaGFzIG1vcmUgdGhhbiAxIG9iamVjdCBpbiB0aGUgY2FjaGUhIFRoaXMgaXMgYSBzZXJpb3VzIGVycm9yLiAnICtcbiAgICAgICAgICAgICAgICAgICAgJ0VpdGhlciBhIG1hcHBpbmcgaGFzIGJlZW4gbW9kaWZpZWQgYWZ0ZXIgb2JqZWN0cyBoYXZlIGFscmVhZHkgYmVlbiBjcmVhdGVkLCBvciBzb21ldGhpbmcgaGFzIGdvbmUnICtcbiAgICAgICAgICAgICAgICAgICAgJ3Zlcnkgd3JvbmcuIFBsZWFzZSBmaWxlIGEgYnVnIHJlcG9ydCBpZiB0aGUgbGF0dGVyLicpO1xuICAgICAgICAgICAgfSBlbHNlIGlmIChvYmpzLmxlbmd0aCkge1xuICAgICAgICAgICAgICAgIHJldHVybiBvYmpzWzBdO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfVxuICAgIHJldHVybiBudWxsO1xufVxuXG4vKipcbiAqIEdpdmVuIGEgcmVtb3RlIGlkZW50aWZpZXIgYW5kIGFuIG9wdGlvbnMgb2JqZWN0IHRoYXQgZGVzY3JpYmVzIG1hcHBpbmcvY29sbGVjdGlvbixcbiAqIHJldHVybiB0aGUgbW9kZWwgaWYgY2FjaGVkLlxuICogQHBhcmFtICB7U3RyaW5nfSByZW1vdGVJZFxuICogQHBhcmFtICB7T2JqZWN0fSBvcHRzXG4gKiBAcmV0dXJuIHtTaWVzdGFNb2RlbH1cbiAqL1xuZnVuY3Rpb24gZ2V0VmlhUmVtb3RlSWQocmVtb3RlSWQsIG9wdHMpIHtcbiAgICB2YXIgdHlwZSA9IG9wdHMubWFwcGluZy50eXBlO1xuICAgIHZhciBjb2xsZWN0aW9uID0gb3B0cy5tYXBwaW5nLmNvbGxlY3Rpb247XG4gICAgdmFyIGNvbGxlY3Rpb25DYWNoZSA9IHJlbW90ZUNhY2hlW2NvbGxlY3Rpb25dO1xuICAgIGlmIChjb2xsZWN0aW9uQ2FjaGUpIHtcbiAgICAgICAgdmFyIHR5cGVDYWNoZSA9IHJlbW90ZUNhY2hlW2NvbGxlY3Rpb25dW3R5cGVdO1xuICAgICAgICBpZiAodHlwZUNhY2hlKSB7XG4gICAgICAgICAgICB2YXIgb2JqID0gdHlwZUNhY2hlW3JlbW90ZUlkXTtcbiAgICAgICAgICAgIGlmIChvYmopIHtcbiAgICAgICAgICAgICAgICBpZiAoUmVtb3RlQ2FjaGVMb2dnZXIuZGVidWcuaXNFbmFibGVkKVxuICAgICAgICAgICAgICAgICAgICBSZW1vdGVDYWNoZUxvZ2dlci5kZWJ1ZygnUmVtb3RlIGNhY2hlIGhpdDogJyArIG9iai5fZHVtcCh0cnVlKSk7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIGlmIChSZW1vdGVDYWNoZUxvZ2dlci5kZWJ1Zy5pc0VuYWJsZWQpXG4gICAgICAgICAgICAgICAgICAgIFJlbW90ZUNhY2hlTG9nZ2VyLmRlYnVnKCdSZW1vdGUgY2FjaGUgbWlzczogJyArIHJlbW90ZUlkKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHJldHVybiBvYmo7XG4gICAgICAgIH1cbiAgICB9XG4gICAgaWYgKFJlbW90ZUNhY2hlTG9nZ2VyLmRlYnVnLmlzRW5hYmxlZClcbiAgICAgICAgUmVtb3RlQ2FjaGVMb2dnZXIuZGVidWcoJ1JlbW90ZSBjYWNoZSBtaXNzOiAnICsgcmVtb3RlSWQpO1xuICAgIHJldHVybiBudWxsO1xufVxuXG4vKipcbiAqIEluc2VydCBhbiBvYmpldCBpbnRvIHRoZSBjYWNoZSB1c2luZyBhIHJlbW90ZSBpZGVudGlmaWVyIGRlZmluZWQgYnkgdGhlIG1hcHBpbmcuXG4gKiBAcGFyYW0gIHtTaWVzdGFNb2RlbH0gb2JqXG4gKiBAcGFyYW0gIHtTdHJpbmd9IHJlbW90ZUlkXG4gKiBAcGFyYW0gIHtTdHJpbmd9IHByZXZpb3VzUmVtb3RlSWQgSWYgcmVtb3RlIGlkIGhhcyBiZWVuIGNoYW5nZWQsIHRoaXMgaXMgdGhlIG9sZCByZW1vdGUgaWRlbnRpZmllclxuICovXG5mdW5jdGlvbiByZW1vdGVJbnNlcnQob2JqLCByZW1vdGVJZCwgcHJldmlvdXNSZW1vdGVJZCkge1xuICAgIGlmIChvYmopIHtcbiAgICAgICAgdmFyIGNvbGxlY3Rpb24gPSBvYmoubWFwcGluZy5jb2xsZWN0aW9uO1xuICAgICAgICBpZiAoY29sbGVjdGlvbikge1xuICAgICAgICAgICAgaWYgKCFyZW1vdGVDYWNoZVtjb2xsZWN0aW9uXSkge1xuICAgICAgICAgICAgICAgIHJlbW90ZUNhY2hlW2NvbGxlY3Rpb25dID0ge307XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICB2YXIgdHlwZSA9IG9iai5tYXBwaW5nLnR5cGU7XG4gICAgICAgICAgICBpZiAodHlwZSkge1xuICAgICAgICAgICAgICAgIGlmICghcmVtb3RlQ2FjaGVbY29sbGVjdGlvbl1bdHlwZV0pIHtcbiAgICAgICAgICAgICAgICAgICAgcmVtb3RlQ2FjaGVbY29sbGVjdGlvbl1bdHlwZV0gPSB7fTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgaWYgKHByZXZpb3VzUmVtb3RlSWQpIHtcbiAgICAgICAgICAgICAgICAgICAgcmVtb3RlQ2FjaGVbY29sbGVjdGlvbl1bdHlwZV1bcHJldmlvdXNSZW1vdGVJZF0gPSBudWxsO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB2YXIgY2FjaGVkT2JqZWN0ID0gcmVtb3RlQ2FjaGVbY29sbGVjdGlvbl1bdHlwZV1bcmVtb3RlSWRdO1xuICAgICAgICAgICAgICAgIGlmICghY2FjaGVkT2JqZWN0KSB7XG4gICAgICAgICAgICAgICAgICAgIHJlbW90ZUNhY2hlW2NvbGxlY3Rpb25dW3R5cGVdW3JlbW90ZUlkXSA9IG9iajtcbiAgICAgICAgICAgICAgICAgICAgaWYgKFJlbW90ZUNhY2hlTG9nZ2VyLmRlYnVnLmlzRW5hYmxlZClcbiAgICAgICAgICAgICAgICAgICAgICAgIFJlbW90ZUNhY2hlTG9nZ2VyLmRlYnVnKCdSZW1vdGUgY2FjaGUgaW5zZXJ0OiAnICsgb2JqLl9kdW1wKHRydWUpKTtcbiAgICAgICAgICAgICAgICAgICAgaWYgKFJlbW90ZUNhY2hlTG9nZ2VyLnRyYWNlLmlzRW5hYmxlZClcbiAgICAgICAgICAgICAgICAgICAgICAgIFJlbW90ZUNhY2hlTG9nZ2VyLnRyYWNlKCdSZW1vdGUgY2FjaGUgbm93IGxvb2tzIGxpa2U6ICcgKyByZW1vdGVEdW1wKHRydWUpKVxuICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgIC8vIFNvbWV0aGluZyBoYXMgZ29uZSByZWFsbHkgd3JvbmcuIE9ubHkgb25lIG9iamVjdCBmb3IgYSBwYXJ0aWN1bGFyIGNvbGxlY3Rpb24vdHlwZS9yZW1vdGVpZCBjb21ib1xuICAgICAgICAgICAgICAgICAgICAvLyBzaG91bGQgZXZlciBleGlzdC5cbiAgICAgICAgICAgICAgICAgICAgaWYgKG9iaiAhPSBjYWNoZWRPYmplY3QpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHZhciBtZXNzYWdlID0gJ09iamVjdCAnICsgY29sbGVjdGlvbi50b1N0cmluZygpICsgJzonICsgdHlwZS50b1N0cmluZygpICsgJ1snICsgb2JqLm1hcHBpbmcuaWQgKyAnPVwiJyArIHJlbW90ZUlkICsgJ1wiXSBhbHJlYWR5IGV4aXN0cyBpbiB0aGUgY2FjaGUuJyArXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgJyBUaGlzIGlzIGEgc2VyaW91cyBlcnJvciwgcGxlYXNlIGZpbGUgYSBidWcgcmVwb3J0IGlmIHlvdSBhcmUgZXhwZXJpZW5jaW5nIHRoaXMgb3V0IGluIHRoZSB3aWxkJztcbiAgICAgICAgICAgICAgICAgICAgICAgIFJlbW90ZUNhY2hlTG9nZ2VyLmVycm9yKG1lc3NhZ2UsIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBvYmo6IG9iaixcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBjYWNoZWRPYmplY3Q6IGNhY2hlZE9iamVjdFxuICAgICAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgICAgICAgICB1dGlsLnByaW50U3RhY2tUcmFjZSgpO1xuICAgICAgICAgICAgICAgICAgICAgICAgdGhyb3cgbmV3IEludGVybmFsU2llc3RhRXJyb3IobWVzc2FnZSk7XG4gICAgICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAoUmVtb3RlQ2FjaGVMb2dnZXIuZGVidWcuaXNFbmFibGVkKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIFJlbW90ZUNhY2hlTG9nZ2VyLmRlYnVnKCdPYmplY3QgaGFzIGFscmVhZHkgYmVlbiBpbnNlcnRlZDogJyArIG9iai5fZHVtcCh0cnVlKSk7XG4gICAgICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgdGhyb3cgbmV3IEludGVybmFsU2llc3RhRXJyb3IoJ01hcHBpbmcgaGFzIG5vIHR5cGUnLCB7XG4gICAgICAgICAgICAgICAgICAgIG1hcHBpbmc6IG9iai5tYXBwaW5nLFxuICAgICAgICAgICAgICAgICAgICBvYmo6IG9ialxuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgfVxuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgdGhyb3cgbmV3IEludGVybmFsU2llc3RhRXJyb3IoJ01hcHBpbmcgaGFzIG5vIGNvbGxlY3Rpb24nLCB7XG4gICAgICAgICAgICAgICAgbWFwcGluZzogb2JqLm1hcHBpbmcsXG4gICAgICAgICAgICAgICAgb2JqOiBvYmpcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9XG4gICAgfSBlbHNlIHtcbiAgICAgICAgdmFyIG1zZyA9ICdNdXN0IHBhc3MgYW4gb2JqZWN0IHdoZW4gaW5zZXJ0aW5nIHRvIGNhY2hlJztcbiAgICAgICAgUmVtb3RlQ2FjaGVMb2dnZXIuZXJyb3IobXNnKTtcbiAgICAgICAgdGhyb3cgbmV3IEludGVybmFsU2llc3RhRXJyb3IobXNnKTtcbiAgICB9XG59XG5cbi8qKlxuICogRHVtcCB0aGUgcmVtb3RlIGlkIGNhY2hlXG4gKiBAcGFyYW0gIHtib29sZWFufSBhc0pzb24gV2hldGhlciBvciBub3QgdG8gYXBwbHkgSlNPTi5zdHJpbmdpZnlcbiAqIEByZXR1cm4ge1N0cmluZ3xPYmplY3R9XG4gKi9cbmZ1bmN0aW9uIHJlbW90ZUR1bXAoYXNKc29uKSB7XG4gICAgdmFyIGR1bXBlZFJlc3RDYWNoZSA9IHt9O1xuICAgIGZvciAodmFyIGNvbGwgaW4gcmVtb3RlQ2FjaGUpIHtcbiAgICAgICAgaWYgKHJlbW90ZUNhY2hlLmhhc093blByb3BlcnR5KGNvbGwpKSB7XG4gICAgICAgICAgICB2YXIgZHVtcGVkQ29sbENhY2hlID0ge307XG4gICAgICAgICAgICBkdW1wZWRSZXN0Q2FjaGVbY29sbF0gPSBkdW1wZWRDb2xsQ2FjaGU7XG4gICAgICAgICAgICB2YXIgY29sbENhY2hlID0gcmVtb3RlQ2FjaGVbY29sbF07XG4gICAgICAgICAgICBmb3IgKHZhciBtYXBwaW5nIGluIGNvbGxDYWNoZSkge1xuICAgICAgICAgICAgICAgIGlmIChjb2xsQ2FjaGUuaGFzT3duUHJvcGVydHkobWFwcGluZykpIHtcbiAgICAgICAgICAgICAgICAgICAgdmFyIGR1bXBlZE1hcHBpbmdDYWNoZSA9IHt9O1xuICAgICAgICAgICAgICAgICAgICBkdW1wZWRDb2xsQ2FjaGVbbWFwcGluZ10gPSBkdW1wZWRNYXBwaW5nQ2FjaGU7XG4gICAgICAgICAgICAgICAgICAgIHZhciBtYXBwaW5nQ2FjaGUgPSBjb2xsQ2FjaGVbbWFwcGluZ107XG4gICAgICAgICAgICAgICAgICAgIGZvciAodmFyIHJlbW90ZUlkIGluIG1hcHBpbmdDYWNoZSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKG1hcHBpbmdDYWNoZS5oYXNPd25Qcm9wZXJ0eShyZW1vdGVJZCkpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiAobWFwcGluZ0NhY2hlW3JlbW90ZUlkXSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBkdW1wZWRNYXBwaW5nQ2FjaGVbcmVtb3RlSWRdID0gbWFwcGluZ0NhY2hlW3JlbW90ZUlkXS5fZHVtcCgpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH1cbiAgICByZXR1cm4gYXNKc29uID8gSlNPTi5zdHJpbmdpZnkoZHVtcGVkUmVzdENhY2hlLCBudWxsLCA0KSA6IGR1bXBlZFJlc3RDYWNoZTtcblxufVxuXG4vKipcbiAqIER1bXAgdGhlIGxvY2FsIGlkIChfaWQpIGNhY2hlXG4gKiBAcGFyYW0gIHtib29sZWFufSBhc0pzb24gV2hldGhlciBvciBub3QgdG8gYXBwbHkgSlNPTi5zdHJpbmdpZnlcbiAqIEByZXR1cm4ge1N0cmluZ3xPYmplY3R9XG4gKi9cbmZ1bmN0aW9uIGxvY2FsRHVtcChhc0pzb24pIHtcbiAgICB2YXIgZHVtcGVkSWRDYWNoZSA9IHt9O1xuICAgIGZvciAodmFyIGlkIGluIGxvY2FsQ2FjaGVCeUlkKSB7XG4gICAgICAgIGlmIChsb2NhbENhY2hlQnlJZC5oYXNPd25Qcm9wZXJ0eShpZCkpIHtcbiAgICAgICAgICAgIGR1bXBlZElkQ2FjaGVbaWRdID0gbG9jYWxDYWNoZUJ5SWRbaWRdLl9kdW1wKClcbiAgICAgICAgfVxuICAgIH1cbiAgICByZXR1cm4gYXNKc29uID8gSlNPTi5zdHJpbmdpZnkoZHVtcGVkSWRDYWNoZSwgbnVsbCwgNCkgOiBkdW1wZWRJZENhY2hlO1xufVxuXG4vKipcbiAqIER1bXAgdG8gdGhlIGNhY2hlLlxuICogQHBhcmFtICB7Ym9vbGVhbn0gYXNKc29uIFdoZXRoZXIgb3Igbm90IHRvIGFwcGx5IEpTT04uc3RyaW5naWZ5XG4gKiBAcmV0dXJuIHtTdHJpbmd8T2JqZWN0fVxuICovXG5mdW5jdGlvbiBkdW1wKGFzSnNvbikge1xuICAgIHZhciBkdW1wZWQgPSB7XG4gICAgICAgIGxvY2FsQ2FjaGU6IGxvY2FsRHVtcCgpLFxuICAgICAgICByZW1vdGVDYWNoZTogcmVtb3RlRHVtcCgpXG4gICAgfTtcbiAgICByZXR1cm4gYXNKc29uID8gSlNPTi5zdHJpbmdpZnkoZHVtcGVkLCBudWxsLCA0KSA6IGR1bXBlZDtcbn1cblxuZnVuY3Rpb24gX3JlbW90ZUNhY2hlKCkge1xuICAgIHJldHVybiByZW1vdGVDYWNoZVxufVxuXG5mdW5jdGlvbiBfbG9jYWxDYWNoZSgpIHtcbiAgICByZXR1cm4gbG9jYWxDYWNoZUJ5SWQ7XG59XG5cbi8qKlxuICogUXVlcnkgdGhlIGNhY2hlXG4gKiBAcGFyYW0gIHtPYmplY3R9IG9wdHMgT2JqZWN0IGRlc2NyaWJpbmcgdGhlIHF1ZXJ5XG4gKiBAcmV0dXJuIHtTaWVzdGFNb2RlbH1cbiAqIEBleGFtcGxlXG4gKiBgYGBqc1xuICogY2FjaGUuZ2V0KHtfaWQ6ICc1J30pOyAvLyBRdWVyeSBieSBsb2NhbCBpZFxuICogY2FjaGUuZ2V0KHtyZW1vdGVJZDogJzUnLCBtYXBwaW5nOiBteU1hcHBpbmd9KTsgLy8gUXVlcnkgYnkgcmVtb3RlIGlkXG4gKiBgYGBcbiAqL1xuZnVuY3Rpb24gZ2V0KG9wdHMpIHtcbiAgICBpZiAoTG9jYWxDYWNoZUxvZ2dlci5kZWJ1Zy5pc0VuYWJsZWQpIExvY2FsQ2FjaGVMb2dnZXIuZGVidWcoJ2dldCcsIG9wdHMpO1xuICAgIHZhciBvYmosIGlkRmllbGQsIHJlbW90ZUlkO1xuICAgIHZhciBsb2NhbElkID0gb3B0cy5faWQ7XG4gICAgaWYgKGxvY2FsSWQpIHtcbiAgICAgICAgb2JqID0gZ2V0VmlhTG9jYWxJZChsb2NhbElkKTtcbiAgICAgICAgaWYgKG9iaikge1xuICAgICAgICAgICAgcmV0dXJuIG9iajtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIGlmIChvcHRzLm1hcHBpbmcpIHtcbiAgICAgICAgICAgICAgICBpZEZpZWxkID0gb3B0cy5tYXBwaW5nLmlkO1xuICAgICAgICAgICAgICAgIHJlbW90ZUlkID0gb3B0c1tpZEZpZWxkXTtcbiAgICAgICAgICAgICAgICBpZiAoTG9jYWxDYWNoZUxvZ2dlci5kZWJ1Zy5pc0VuYWJsZWQpIExvY2FsQ2FjaGVMb2dnZXIuZGVidWcoaWRGaWVsZCArICc9JyArIHJlbW90ZUlkKTtcbiAgICAgICAgICAgICAgICByZXR1cm4gZ2V0VmlhUmVtb3RlSWQocmVtb3RlSWQsIG9wdHMpO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gbnVsbDtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH0gZWxzZSBpZiAob3B0cy5tYXBwaW5nKSB7XG4gICAgICAgIGlkRmllbGQgPSBvcHRzLm1hcHBpbmcuaWQ7XG4gICAgICAgIHJlbW90ZUlkID0gb3B0c1tpZEZpZWxkXTtcbiAgICAgICAgaWYgKHJlbW90ZUlkKSB7XG4gICAgICAgICAgICByZXR1cm4gZ2V0VmlhUmVtb3RlSWQocmVtb3RlSWQsIG9wdHMpO1xuICAgICAgICB9IGVsc2UgaWYgKG9wdHMubWFwcGluZy5zaW5nbGV0b24pIHtcbiAgICAgICAgICAgIHJldHVybiBnZXRTaW5nbGV0b24ob3B0cy5tYXBwaW5nKTtcbiAgICAgICAgfVxuICAgIH0gZWxzZSB7XG4gICAgICAgIExvY2FsQ2FjaGVMb2dnZXIud2FybignSW52YWxpZCBvcHRzIHRvIGNhY2hlJywge1xuICAgICAgICAgICAgb3B0czogb3B0c1xuICAgICAgICB9KTtcbiAgICB9XG4gICAgcmV0dXJuIG51bGw7XG59XG5cbi8qKlxuICogSW5zZXJ0IGFuIG9iamVjdCBpbnRvIHRoZSBjYWNoZS5cbiAqIEBwYXJhbSAge1NpZXN0YU1vZGVsfSBvYmpcbiAqIEB0aHJvd3Mge0ludGVybmFsU2llc3RhRXJyb3J9IEFuIG9iamVjdCB3aXRoIF9pZC9yZW1vdGVJZCBhbHJlYWR5IGV4aXN0cy4gTm90IHRocm93biBpZiBzYW1lIG9iaGVjdC5cbiAqL1xuZnVuY3Rpb24gaW5zZXJ0KG9iaikge1xuICAgIHZhciBsb2NhbElkID0gb2JqLl9pZDtcbiAgICBpZiAobG9jYWxJZCkge1xuICAgICAgICB2YXIgY29sbGVjdGlvbk5hbWUgPSBvYmoubWFwcGluZy5jb2xsZWN0aW9uO1xuICAgICAgICB2YXIgbWFwcGluZ05hbWUgPSBvYmoubWFwcGluZy50eXBlO1xuICAgICAgICBpZiAoIWxvY2FsQ2FjaGVCeUlkW2xvY2FsSWRdKSB7XG4gICAgICAgICAgICBpZiAoTG9jYWxDYWNoZUxvZ2dlci5kZWJ1Zy5pc0VuYWJsZWQpXG4gICAgICAgICAgICAgICAgTG9jYWxDYWNoZUxvZ2dlci5kZWJ1ZygnTG9jYWwgY2FjaGUgaW5zZXJ0OiAnICsgb2JqLl9kdW1wKHRydWUpKTtcbiAgICAgICAgICAgIGxvY2FsQ2FjaGVCeUlkW2xvY2FsSWRdID0gb2JqO1xuICAgICAgICAgICAgaWYgKExvY2FsQ2FjaGVMb2dnZXIudHJhY2UuaXNFbmFibGVkKVxuICAgICAgICAgICAgICAgIExvY2FsQ2FjaGVMb2dnZXIudHJhY2UoJ0xvY2FsIGNhY2hlIG5vdyBsb29rcyBsaWtlOiAnICsgbG9jYWxEdW1wKHRydWUpKTtcbiAgICAgICAgICAgIGlmICghbG9jYWxDYWNoZVtjb2xsZWN0aW9uTmFtZV0pIGxvY2FsQ2FjaGVbY29sbGVjdGlvbk5hbWVdID0ge307XG4gICAgICAgICAgICBpZiAoIWxvY2FsQ2FjaGVbY29sbGVjdGlvbk5hbWVdW21hcHBpbmdOYW1lXSkgbG9jYWxDYWNoZVtjb2xsZWN0aW9uTmFtZV1bbWFwcGluZ05hbWVdID0ge307XG4gICAgICAgICAgICBsb2NhbENhY2hlW2NvbGxlY3Rpb25OYW1lXVttYXBwaW5nTmFtZV1bbG9jYWxJZF0gPSBvYmo7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAvLyBTb21ldGhpbmcgaGFzIGdvbmUgYmFkbHkgd3JvbmcgaGVyZS4gVHdvIG9iamVjdHMgc2hvdWxkIG5ldmVyIGV4aXN0IHdpdGggdGhlIHNhbWUgX2lkXG4gICAgICAgICAgICBpZiAobG9jYWxDYWNoZUJ5SWRbbG9jYWxJZF0gIT0gb2JqKSB7XG4gICAgICAgICAgICAgICAgdmFyIG1lc3NhZ2UgPSAnT2JqZWN0IHdpdGggX2lkPVwiJyArIGxvY2FsSWQudG9TdHJpbmcoKSArICdcIiBpcyBhbHJlYWR5IGluIHRoZSBjYWNoZS4gJyArXG4gICAgICAgICAgICAgICAgICAgICdUaGlzIGlzIGEgc2VyaW91cyBlcnJvci4gUGxlYXNlIGZpbGUgYSBidWcgcmVwb3J0IGlmIHlvdSBhcmUgZXhwZXJpZW5jaW5nIHRoaXMgb3V0IGluIHRoZSB3aWxkJztcbiAgICAgICAgICAgICAgICBMb2NhbENhY2hlTG9nZ2VyLmVycm9yKG1lc3NhZ2UpO1xuICAgICAgICAgICAgICAgIHRocm93IG5ldyBJbnRlcm5hbFNpZXN0YUVycm9yKG1lc3NhZ2UpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfVxuICAgIHZhciBpZEZpZWxkID0gb2JqLmlkRmllbGQ7XG4gICAgdmFyIHJlbW90ZUlkID0gb2JqW2lkRmllbGRdO1xuICAgIGlmIChyZW1vdGVJZCkge1xuICAgICAgICByZW1vdGVJbnNlcnQob2JqLCByZW1vdGVJZCk7XG4gICAgfSBlbHNlIHtcbiAgICAgICAgaWYgKFJlbW90ZUNhY2hlTG9nZ2VyLmRlYnVnLmlzRW5hYmxlZClcbiAgICAgICAgICAgIFJlbW90ZUNhY2hlTG9nZ2VyLmRlYnVnKCdObyByZW1vdGUgaWQgKFwiJyArIGlkRmllbGQgKyAnXCIpIHNvIHdvbnQgYmUgcGxhY2luZyBpbiB0aGUgcmVtb3RlIGNhY2hlJywgb2JqKTtcbiAgICB9XG59XG5cbi8qKlxuICogUmV0dXJucyB0cnVlIGlmIG9iamVjdCBpcyBpbiB0aGUgY2FjaGVcbiAqIEBwYXJhbSAge1NpZXN0YU1vZGVsfSBvYmpcbiAqIEByZXR1cm4ge2Jvb2xlYW59XG4gKi9cbmZ1bmN0aW9uIGNvbnRhaW5zKG9iaikge1xuICAgIHZhciBxID0ge1xuICAgICAgICBfaWQ6IG9iai5faWRcbiAgICB9O1xuICAgIHZhciBtYXBwaW5nID0gb2JqLm1hcHBpbmc7XG4gICAgaWYgKG1hcHBpbmcuaWQpIHtcbiAgICAgICAgaWYgKG9ialttYXBwaW5nLmlkXSkge1xuICAgICAgICAgICAgcS5tYXBwaW5nID0gbWFwcGluZztcbiAgICAgICAgICAgIHFbbWFwcGluZy5pZF0gPSBvYmpbbWFwcGluZy5pZF07XG4gICAgICAgIH1cbiAgICB9XG4gICAgcmV0dXJuICEhZ2V0KHEpO1xufVxuXG4vKipcbiAqIFJlbW92ZXMgdGhlIG9iamVjdCBmcm9tIHRoZSBjYWNoZSAoaWYgaXQncyBhY3R1YWxseSBpbiB0aGUgY2FjaGUpIG90aGVyd2lzZXMgdGhyb3dzIGFuIGVycm9yLlxuICogQHBhcmFtICB7U2llc3RhTW9kZWx9IG9ialxuICogQHRocm93cyB7SW50ZXJuYWxTaWVzdGFFcnJvcn0gSWYgb2JqZWN0IGFscmVhZHkgaW4gdGhlIGNhY2hlLlxuICovXG5mdW5jdGlvbiByZW1vdmUob2JqKSB7XG4gICAgaWYgKGNvbnRhaW5zKG9iaikpIHtcbiAgICAgICAgdmFyIGNvbGxlY3Rpb25OYW1lID0gb2JqLm1hcHBpbmcuY29sbGVjdGlvbjtcbiAgICAgICAgdmFyIG1hcHBpbmdOYW1lID0gb2JqLm1hcHBpbmcudHlwZTtcbiAgICAgICAgdmFyIF9pZCA9IG9iai5faWQ7XG4gICAgICAgIGlmICghbWFwcGluZ05hbWUpIHRocm93IEludGVybmFsU2llc3RhRXJyb3IoJ05vIG1hcHBpbmcgbmFtZScpO1xuICAgICAgICBpZiAoIWNvbGxlY3Rpb25OYW1lKSB0aHJvdyBJbnRlcm5hbFNpZXN0YUVycm9yKCdObyBjb2xsZWN0aW9uIG5hbWUnKTtcbiAgICAgICAgaWYgKCFfaWQpIHRocm93IEludGVybmFsU2llc3RhRXJyb3IoJ05vIF9pZCcpO1xuICAgICAgICBkZWxldGUgbG9jYWxDYWNoZVtjb2xsZWN0aW9uTmFtZV1bbWFwcGluZ05hbWVdW19pZF07XG4gICAgICAgIGRlbGV0ZSBsb2NhbENhY2hlQnlJZFtfaWRdO1xuICAgICAgICBpZiAob2JqLm1hcHBpbmcuaWQpIHtcbiAgICAgICAgICAgIHZhciByZW1vdGVJZCA9IG9ialtvYmoubWFwcGluZy5pZF07XG4gICAgICAgICAgICBkZWxldGUgcmVtb3RlQ2FjaGVbY29sbGVjdGlvbk5hbWVdW21hcHBpbmdOYW1lXVtyZW1vdGVJZF07XG4gICAgICAgIH1cbiAgICB9IGVsc2Uge1xuICAgICAgICB0aHJvdyBuZXcgSW50ZXJuYWxTaWVzdGFFcnJvcignT2JqZWN0IHdhcyBub3QgaW4gY2FjaGUuJyk7XG4gICAgfVxufVxuXG5cbmZ1bmN0aW9uIGR1bXAoYXNKc29uKSB7XG4gICAgdmFyIGR1bXBlZCA9IHtcbiAgICAgICAgbG9jYWxDYWNoZTogbG9jYWxEdW1wKCksXG4gICAgICAgIHJlbW90ZUNhY2hlOiByZW1vdGVEdW1wKClcbiAgICB9O1xuICAgIHJldHVybiBhc0pzb24gPyBKU09OLnN0cmluZ2lmeShkdW1wZWQsIG51bGwsIDQpIDogZHVtcGVkO1xufVxuXG5leHBvcnRzLl9yZW1vdGVDYWNoZSA9IF9yZW1vdGVDYWNoZTtcbmV4cG9ydHMuX2xvY2FsQ2FjaGUgPSBfbG9jYWxDYWNoZTtcbk9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCAnX2xvY2FsQ2FjaGVCeVR5cGUnLCB7XG4gICAgZ2V0OiBmdW5jdGlvbigpIHtcbiAgICAgICAgcmV0dXJuIGxvY2FsQ2FjaGU7XG4gICAgfVxufSk7XG5leHBvcnRzLmdldCA9IGdldDtcbmV4cG9ydHMuaW5zZXJ0ID0gaW5zZXJ0O1xuZXhwb3J0cy5yZW1vdGVJbnNlcnQgPSByZW1vdGVJbnNlcnQ7XG5leHBvcnRzLnJlc2V0ID0gcmVzZXQ7XG5leHBvcnRzLl9kdW1wID0gZHVtcDtcbmV4cG9ydHMuY29udGFpbnMgPSBjb250YWlucztcbmV4cG9ydHMucmVtb3ZlID0gcmVtb3ZlOyIsIi8qKlxuICogVGhlIGNoYW5nZXMgbW9kdWxlIGRlYWxzIHdpdGggY2hhbmdlcyB0byBTaWVzdGFNb2RlbCBpbnN0YW5jZXMuIEluIHRoZSBpbi1tZW1vcnkgY2FzZSB0aGlzIFxuICoganVzdCBtZWFucyB0aGF0IG5vdGlmaWNhdGlvbnMgYXJlIHNlbnQgb24gYW55IGNoYW5nZS4gSWYgdGhlIHN0b3JhZ2UgbW9kdWxlIGlzIGJlaW5nIHVzZWQsXG4gKiB0aGUgY2hhbmdlcyBtb2R1bGUgaXMgZXh0ZW5kZWQgdG8gZGVhbCB3aXRoIG1lcmdpbmcgY2hhbmdlcyBpbnRvIHdoYXRldmVyIHBlcnNpc3RhbnQgc3RvcmFnZVxuICogbWV0aG9kIGlzIGJlaW5nIHVzZWQuXG4gKiBAbW9kdWxlIGNoYW5nZXNcbiAqL1xuXG52YXIgZGVmaW5lU3ViUHJvcGVydHkgPSByZXF1aXJlKCcuL21pc2MnKS5kZWZpbmVTdWJQcm9wZXJ0eTtcbnZhciBub3RpZmljYXRpb25DZW50cmUgPSByZXF1aXJlKCcuL25vdGlmaWNhdGlvbkNlbnRyZScpLm5vdGlmaWNhdGlvbkNlbnRyZTtcbnZhciBJbnRlcm5hbFNpZXN0YUVycm9yID0gcmVxdWlyZSgnLi9lcnJvcicpLkludGVybmFsU2llc3RhRXJyb3I7XG52YXIgbG9nID0gcmVxdWlyZSgnLi9vcGVyYXRpb24vbG9nJyk7XG52YXIgY29sbGVjdGlvblJlZ2lzdHJ5ID0gcmVxdWlyZSgnLi9jb2xsZWN0aW9uUmVnaXN0cnknKS5Db2xsZWN0aW9uUmVnaXN0cnk7XG5cbnZhciBMb2dnZXIgPSBsb2cubG9nZ2VyV2l0aE5hbWUoJ2NoYW5nZXMnKTtcbkxvZ2dlci5zZXRMZXZlbChsb2cuTGV2ZWwud2Fybik7XG5cbi8qKlxuICogQ29uc3RhbnRzIHRoYXQgZGVzY3JpYmUgY2hhbmdlIGV2ZW50cy5cbiAqIFNldCA9PiBBIG5ldyB2YWx1ZSBpcyBhc3NpZ25lZCB0byBhbiBhdHRyaWJ1dGUvcmVsYXRpb25zaGlwXG4gKiBTcGxpY2UgPT4gQWxsIGphdmFzY3JpcHQgYXJyYXkgb3BlcmF0aW9ucyBhcmUgZGVzY3JpYmVkIGFzIHNwbGljZXMuXG4gKiBEZWxldGUgPT4gVXNlZCBpbiB0aGUgY2FzZSB3aGVyZSBvYmplY3RzIGFyZSByZW1vdmVkIGZyb20gYW4gYXJyYXksIGJ1dCBhcnJheSBvcmRlciBpcyBub3Qga25vd24gaW4gYWR2YW5jZS5cbiAqIFJlbW92ZSA9PiBPYmplY3QgZGVsZXRpb24gZXZlbnRzXG4gKiBOZXcgPT4gT2JqZWN0IGNyZWF0aW9uIGV2ZW50c1xuICogQHR5cGUge09iamVjdH1cbiAqL1xudmFyIENoYW5nZVR5cGUgPSB7XG4gICAgU2V0OiAnU2V0JyxcbiAgICBTcGxpY2U6ICdTcGxpY2UnLFxuICAgIERlbGV0ZTogJ0RlbGV0ZScsXG4gICAgTmV3OiAnTmV3JyxcbiAgICBSZW1vdmU6ICdSZW1vdmUnXG59O1xuXG4vKipcbiAqIFJlcHJlc2VudHMgYW4gaW5kaXZpZHVhbCBjaGFuZ2UuXG4gKiBAcGFyYW0gb3B0c1xuICogQGNvbnN0cnVjdG9yXG4gKi9cbmZ1bmN0aW9uIENoYW5nZShvcHRzKSB7XG4gICAgdGhpcy5fb3B0cyA9IG9wdHM7XG4gICAgaWYgKCF0aGlzLl9vcHRzKSB7XG4gICAgICAgIHRoaXMuX29wdHMgPSB7fTtcbiAgICB9XG4gICAgZGVmaW5lU3ViUHJvcGVydHkuY2FsbCh0aGlzLCAnY29sbGVjdGlvbicsIHRoaXMuX29wdHMpO1xuICAgIGRlZmluZVN1YlByb3BlcnR5LmNhbGwodGhpcywgJ21hcHBpbmcnLCB0aGlzLl9vcHRzKTtcbiAgICBkZWZpbmVTdWJQcm9wZXJ0eS5jYWxsKHRoaXMsICdfaWQnLCB0aGlzLl9vcHRzKTtcbiAgICBkZWZpbmVTdWJQcm9wZXJ0eS5jYWxsKHRoaXMsICdmaWVsZCcsIHRoaXMuX29wdHMpO1xuICAgIGRlZmluZVN1YlByb3BlcnR5LmNhbGwodGhpcywgJ3R5cGUnLCB0aGlzLl9vcHRzKTtcbiAgICBkZWZpbmVTdWJQcm9wZXJ0eS5jYWxsKHRoaXMsICdpbmRleCcsIHRoaXMuX29wdHMpO1xuICAgIGRlZmluZVN1YlByb3BlcnR5LmNhbGwodGhpcywgJ2FkZGVkJywgdGhpcy5fb3B0cyk7XG4gICAgZGVmaW5lU3ViUHJvcGVydHkuY2FsbCh0aGlzLCAnYWRkZWRJZCcsIHRoaXMuX29wdHMpO1xuICAgIGRlZmluZVN1YlByb3BlcnR5LmNhbGwodGhpcywgJ3JlbW92ZWQnLCB0aGlzLl9vcHRzKTtcbiAgICBkZWZpbmVTdWJQcm9wZXJ0eS5jYWxsKHRoaXMsICdyZW1vdmVkSWQnLCB0aGlzLl9vcHRzKTtcbiAgICBkZWZpbmVTdWJQcm9wZXJ0eS5jYWxsKHRoaXMsICduZXcnLCB0aGlzLl9vcHRzKTtcbiAgICBkZWZpbmVTdWJQcm9wZXJ0eS5jYWxsKHRoaXMsICduZXdJZCcsIHRoaXMuX29wdHMpO1xuICAgIGRlZmluZVN1YlByb3BlcnR5LmNhbGwodGhpcywgJ29sZCcsIHRoaXMuX29wdHMpO1xuICAgIGRlZmluZVN1YlByb3BlcnR5LmNhbGwodGhpcywgJ29sZElkJywgdGhpcy5fb3B0cyk7XG4gICAgZGVmaW5lU3ViUHJvcGVydHkuY2FsbCh0aGlzLCAnb2JqJywgdGhpcy5fb3B0cyk7XG59XG5cbkNoYW5nZS5wcm90b3R5cGUuX2R1bXAgPSBmdW5jdGlvbiAoanNvbikge1xuICAgIHZhciBkdW1wZWQgPSB7fTtcbiAgICBkdW1wZWQuY29sbGVjdGlvbiA9ICh0eXBlb2YgdGhpcy5jb2xsZWN0aW9uKSA9PSAnc3RyaW5nJyA/IHRoaXMuY29sbGVjdGlvbiA6IHRoaXMuY29sbGVjdGlvbi5fZHVtcCgpO1xuICAgIGR1bXBlZC5tYXBwaW5nID0gKHR5cGVvZiB0aGlzLm1hcHBpbmcpID09ICdzdHJpbmcnID8gdGhpcy5tYXBwaW5nIDogdGhpcy5tYXBwaW5nLnR5cGU7XG4gICAgZHVtcGVkLl9pZCA9IHRoaXMuX2lkO1xuICAgIGR1bXBlZC5maWVsZCA9IHRoaXMuZmllbGQ7XG4gICAgZHVtcGVkLnR5cGUgPSB0aGlzLnR5cGU7XG4gICAgaWYgKHRoaXMuaW5kZXgpIGR1bXBlZC5pbmRleCA9IHRoaXMuaW5kZXg7XG4gICAgaWYgKHRoaXMuYWRkZWQpIGR1bXBlZC5hZGRlZCA9IF8ubWFwKHRoaXMuYWRkZWQsIGZ1bmN0aW9uICh4KSB7cmV0dXJuIHguX2R1bXAoKX0pO1xuICAgIGlmICh0aGlzLnJlbW92ZWQpIGR1bXBlZC5yZW1vdmVkID0gXy5tYXAodGhpcy5yZW1vdmVkLCBmdW5jdGlvbiAoeCkge3JldHVybiB4Ll9kdW1wKCl9KTtcbiAgICBpZiAodGhpcy5vbGQpIGR1bXBlZC5vbGQgPSB0aGlzLm9sZDtcbiAgICBpZiAodGhpcy5uZXcpIGR1bXBlZC5uZXcgPSB0aGlzLm5ldztcbiAgICByZXR1cm4ganNvbiA/IEpTT04uc3RyaW5naWZ5KGR1bXBlZCwgbnVsbCwgNCkgOiBkdW1wZWQ7XG59O1xuXG4vKipcbiAqIEJyb2FkY2FzXG4gKiBAcGFyYW0gIHtTdHJpbmd9IGNvbGxlY3Rpb25OYW1lXG4gKiBAcGFyYW0gIHtTdHJpbmd9IG1hcHBpbmdOYW1lXG4gKiBAcGFyYW0gIHtPYmplY3R9IGMgYW4gb3B0aW9ucyBkaWN0aW9uYXJ5IHJlcHJlc2VudGluZyB0aGUgY2hhbmdlXG4gKiBAcmV0dXJuIHtbdHlwZV19XG4gKi9cbmZ1bmN0aW9uIGJyb2FkY2FzdChjb2xsZWN0aW9uTmFtZSwgbWFwcGluZ05hbWUsIGMpIHtcbiAgICBpZiAoTG9nZ2VyLnRyYWNlLmlzRW5hYmxlZCkgTG9nZ2VyLnRyYWNlKCdTZW5kaW5nIG5vdGlmaWNhdGlvbiBcIicgKyBjb2xsZWN0aW9uTmFtZSArICdcIiBvZiB0eXBlICcgKyBjLnR5cGUpO1xuICAgIG5vdGlmaWNhdGlvbkNlbnRyZS5lbWl0KGNvbGxlY3Rpb25OYW1lLCBjKTtcbiAgICB2YXIgbWFwcGluZ05vdGlmID0gY29sbGVjdGlvbk5hbWUgKyAnOicgKyBtYXBwaW5nTmFtZTtcbiAgICBpZiAoTG9nZ2VyLnRyYWNlLmlzRW5hYmxlZCkgTG9nZ2VyLnRyYWNlKCdTZW5kaW5nIG5vdGlmaWNhdGlvbiBcIicgKyBtYXBwaW5nTm90aWYgKyAnXCIgb2YgdHlwZSAnICsgYy50eXBlKTtcbiAgICBub3RpZmljYXRpb25DZW50cmUuZW1pdChtYXBwaW5nTm90aWYsIGMpO1xuICAgIHZhciBnZW5lcmljTm90aWYgPSAnU2llc3RhJztcbiAgICBpZiAoTG9nZ2VyLnRyYWNlLmlzRW5hYmxlZCkgTG9nZ2VyLnRyYWNlKCdTZW5kaW5nIG5vdGlmaWNhdGlvbiBcIicgKyBnZW5lcmljTm90aWYgKyAnXCIgb2YgdHlwZSAnICsgYy50eXBlKTtcbiAgICBub3RpZmljYXRpb25DZW50cmUuZW1pdChnZW5lcmljTm90aWYsIGMpO1xuICAgIHZhciBsb2NhbElkTm90aWYgPSBjLl9pZDtcbiAgICBpZiAoTG9nZ2VyLnRyYWNlLmlzRW5hYmxlZCkgTG9nZ2VyLnRyYWNlKCdTZW5kaW5nIG5vdGlmaWNhdGlvbiBcIicgKyBsb2NhbElkTm90aWYgKyAnXCIgb2YgdHlwZSAnICsgYy50eXBlKTtcbiAgICBub3RpZmljYXRpb25DZW50cmUuZW1pdChsb2NhbElkTm90aWYsIGMpO1xuICAgIHZhciBjb2xsZWN0aW9uID0gY29sbGVjdGlvblJlZ2lzdHJ5W2NvbGxlY3Rpb25OYW1lXTtcbiAgICBpZiAoIWNvbGxlY3Rpb24pIHtcbiAgICAgICAgdmFyIGVyciA9ICdObyBzdWNoIGNvbGxlY3Rpb24gXCInICsgY29sbGVjdGlvbk5hbWUgKyAnXCInO1xuICAgICAgICBMb2dnZXIuZXJyb3IoZXJyLCBjb2xsZWN0aW9uUmVnaXN0cnkpO1xuICAgICAgICB0aHJvdyBuZXcgSW50ZXJuYWxTaWVzdGFFcnJvcihlcnIpO1xuICAgIH1cbiAgICB2YXIgbWFwcGluZyA9IGNvbGxlY3Rpb25bbWFwcGluZ05hbWVdO1xuICAgIGlmICghbWFwcGluZykge1xuICAgICAgICB2YXIgZXJyID0gJ05vIHN1Y2ggbWFwcGluZyBcIicgKyBtYXBwaW5nTmFtZSArICdcIic7XG4gICAgICAgIExvZ2dlci5lcnJvcihlcnIsIGNvbGxlY3Rpb25SZWdpc3RyeSk7XG4gICAgICAgIHRocm93IG5ldyBJbnRlcm5hbFNpZXN0YUVycm9yKGVycik7XG4gICAgfVxuICAgIGlmIChtYXBwaW5nLmlkICYmIGMub2JqW21hcHBpbmcuaWRdKSB7XG4gICAgICAgIHZhciByZW1vdGVJZE5vdGlmID0gY29sbGVjdGlvbk5hbWUgKyAnOicgKyBtYXBwaW5nTmFtZSArICc6JyArIGMub2JqW21hcHBpbmcuaWRdO1xuICAgICAgICBpZiAoTG9nZ2VyLnRyYWNlLmlzRW5hYmxlZCkgTG9nZ2VyLnRyYWNlKCdTZW5kaW5nIG5vdGlmaWNhdGlvbiBcIicgKyByZW1vdGVJZE5vdGlmICsgJ1wiIG9mIHR5cGUgJyArIGMudHlwZSk7XG4gICAgICAgIG5vdGlmaWNhdGlvbkNlbnRyZS5lbWl0KHJlbW90ZUlkTm90aWYsIGMpO1xuICAgIH1cbn1cblxuLyoqXG4gKiBUaHJvdyBhbiBlcnJvciBpZiB0aGUgY2hhbmdlIGlzIGluY29ycmVjdC5cbiAqIEBwYXJhbSBjaGFuZ2VPcHRzXG4gKiBAdGhyb3dzIHtJbnRlcm5hbFNpZXN0YUVycm9yfSBJZiBjaGFuZ2Ugb3B0aW9ucyBhcmUgaW52YWxpZFxuICovXG5mdW5jdGlvbiB2YWxpZGF0ZUNoYW5nZShjaGFuZ2VPcHRzKSB7XG4gICAgaWYgKCFjaGFuZ2VPcHRzLm1hcHBpbmcpIHRocm93IG5ldyBJbnRlcm5hbFNpZXN0YUVycm9yKCdNdXN0IHBhc3MgYSBtYXBwaW5nJyk7XG4gICAgaWYgKCFjaGFuZ2VPcHRzLmNvbGxlY3Rpb24pIHRocm93IG5ldyBJbnRlcm5hbFNpZXN0YUVycm9yKCdNdXN0IHBhc3MgYSBjb2xsZWN0aW9uJyk7XG4gICAgaWYgKCFjaGFuZ2VPcHRzLl9pZCkgdGhyb3cgbmV3IEludGVybmFsU2llc3RhRXJyb3IoJ011c3QgcGFzcyBhIGxvY2FsIGlkZW50aWZpZXInKTtcbiAgICBpZiAoIWNoYW5nZU9wdHMub2JqKSB0aHJvdyBuZXcgSW50ZXJuYWxTaWVzdGFFcnJvcignTXVzdCBwYXNzIHRoZSBvYmplY3QnKTtcbn1cblxuLyoqXG4gKiBSZWdpc3RlciB0aGF0IGEgY2hhbmdlIGhhcyBiZWVuIG1hZGUuXG4gKiBAcGFyYW0gb3B0c1xuICogQHJldHVybiB7Q2hhbmdlfSBUaGUgY29uc3RydWN0ZWQgY2hhbmdlXG4gKi9cbmZ1bmN0aW9uIHJlZ2lzdGVyQ2hhbmdlKG9wdHMpIHtcbiAgICB2YWxpZGF0ZUNoYW5nZShvcHRzKTtcbiAgICB2YXIgY29sbGVjdGlvbiA9IG9wdHMuY29sbGVjdGlvbjtcbiAgICB2YXIgbWFwcGluZyA9IG9wdHMubWFwcGluZztcbiAgICB2YXIgYyA9IG5ldyBDaGFuZ2Uob3B0cyk7XG4gICAgYnJvYWRjYXN0KGNvbGxlY3Rpb24sIG1hcHBpbmcsIGMpO1xuICAgIHJldHVybiBjO1xufVxuXG5leHBvcnRzLkNoYW5nZSA9IENoYW5nZTtcbmV4cG9ydHMucmVnaXN0ZXJDaGFuZ2UgPSByZWdpc3RlckNoYW5nZTtcbmV4cG9ydHMudmFsaWRhdGVDaGFuZ2UgPSB2YWxpZGF0ZUNoYW5nZTtcbmV4cG9ydHMuQ2hhbmdlVHlwZSA9IENoYW5nZVR5cGU7IiwiLyoqXG4gKiBAbW9kdWxlIGNvbGxlY3Rpb25cbiAqL1xuXG52YXIgbG9nID0gcmVxdWlyZSgnLi9vcGVyYXRpb24vbG9nJyk7XG52YXIgTG9nZ2VyID0gbG9nLmxvZ2dlcldpdGhOYW1lKCdDb2xsZWN0aW9uJyk7XG5Mb2dnZXIuc2V0TGV2ZWwobG9nLkxldmVsLndhcm4pO1xuXG52YXIgQ29sbGVjdGlvblJlZ2lzdHJ5ID0gcmVxdWlyZSgnLi9jb2xsZWN0aW9uUmVnaXN0cnknKS5Db2xsZWN0aW9uUmVnaXN0cnk7XG52YXIgT3BlcmF0aW9uID0gcmVxdWlyZSgnLi9vcGVyYXRpb24vb3BlcmF0aW9uJykuT3BlcmF0aW9uO1xudmFyIEludGVybmFsU2llc3RhRXJyb3IgPSByZXF1aXJlKCcuL2Vycm9yJykuSW50ZXJuYWxTaWVzdGFFcnJvcjtcbnZhciBNYXBwaW5nID0gcmVxdWlyZSgnLi9tYXBwaW5nJykuTWFwcGluZztcbnZhciBleHRlbmQgPSByZXF1aXJlKCdleHRlbmQnKTtcbnZhciBvYnNlcnZlID0gcmVxdWlyZSgnLi4vdmVuZG9yL29ic2VydmUtanMvc3JjL29ic2VydmUnKS5QbGF0Zm9ybTtcblxudmFyIHV0aWwgPSByZXF1aXJlKCcuL3V0aWwnKTtcbnZhciBfID0gdXRpbC5fO1xuXG52YXIgY2FjaGUgPSByZXF1aXJlKCcuL2NhY2hlJyk7XG5cbnZhciBTQUZFX01FVEhPRFMgPSBbJ0dFVCcsICdIRUFEJywgJ1RSQUNFJywgJ09QVElPTlMnLCAnQ09OTkVDVCddO1xudmFyIFVOU0FGRV9NRVRIT0RTID0gWydQVVQnLCAnUEFUQ0gnLCAnUE9TVCcsICdERUxFVEUnXTtcblxuLyoqXG4gKiBBIGNvbGxlY3Rpb24gZGVzY3JpYmVzIGEgc2V0IG9mIG1vZGVscyBhbmQgb3B0aW9uYWxseSBhIFJFU1QgQVBJIHdoaWNoIHdlIHdvdWxkXG4gKiBsaWtlIHRvIG1vZGVsLlxuICpcbiAqIEBwYXJhbSBuYW1lXG4gKiBAY29uc3RydWN0b3JcbiAqXG4gKlxuICogQGV4YW1wbGVcbiAqIGBgYGpzXG4gKiB2YXIgR2l0SHViID0gbmV3IHNpZXN0YS5Db2xsZWN0aW9uKCdHaXRIdWInKVxuICogLy8gLi4uIGNvbmZpZ3VyZSBtYXBwaW5ncywgZGVzY3JpcHRvcnMgZXRjIC4uLlxuICogR2l0SHViLmluc3RhbGwoZnVuY3Rpb24gKCkge1xuICogICAgIC8vIC4uLiBjYXJyeSBvbi5cbiAqIH0pO1xuICogYGBgXG4gKi9cbmZ1bmN0aW9uIENvbGxlY3Rpb24obmFtZSkge1xuICAgIHZhciBzZWxmID0gdGhpcztcbiAgICBpZiAoIXRoaXMpIHJldHVybiBuZXcgQ29sbGVjdGlvbihuYW1lKTtcbiAgICBpZiAoIW5hbWUpIHRocm93IG5ldyBJbnRlcm5hbFNpZXN0YUVycm9yKCdDb2xsZWN0aW9uIG11c3QgaGF2ZSBhIG5hbWUnKTtcbiAgICB0aGlzLl9uYW1lID0gbmFtZTtcbiAgICB0aGlzLl9kb2NJZCA9ICdDb2xsZWN0aW9uXycgKyB0aGlzLl9uYW1lO1xuICAgIHRoaXMuX3Jhd01hcHBpbmdzID0ge307XG4gICAgdGhpcy5fbWFwcGluZ3MgPSB7fTtcbiAgICAvKipcbiAgICAgKiBUaGUgVVJMIG9mIHRoZSBBUEkgZS5nLiBodHRwOi8vYXBpLmdpdGh1Yi5jb21cbiAgICAgKiBAdHlwZSB7c3RyaW5nfVxuICAgICAqL1xuICAgIHRoaXMuYmFzZVVSTCA9ICcnO1xuXG4gICAgLyoqXG4gICAgICogU2V0IHRvIHRydWUgaWYgaW5zdGFsbGF0aW9uIGhhcyBzdWNjZWVkZWQuIFlvdSBjYW5ub3QgdXNlIHRoZSBjb2xsZWN0aW9cbiAgICAgKiBAdHlwZSB7Ym9vbGVhbn1cbiAgICAgKi9cbiAgICB0aGlzLmluc3RhbGxlZCA9IGZhbHNlO1xuICAgIENvbGxlY3Rpb25SZWdpc3RyeS5yZWdpc3Rlcih0aGlzKTtcblxuICAgIC8qKlxuICAgICAqXG4gICAgICogQHR5cGUge3N0cmluZ31cbiAgICAgKi9cbiAgICBPYmplY3QuZGVmaW5lUHJvcGVydHkodGhpcywgJ25hbWUnLCB7XG4gICAgICAgIGdldDogZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICByZXR1cm4gc2VsZi5fbmFtZTtcbiAgICAgICAgfVxuICAgIH0pO1xufVxuXG4vKipcbiAqIEVuc3VyZSBtYXBwaW5ncyBhcmUgaW5zdGFsbGVkLlxuICogQHBhcmFtIGNhbGxiYWNrXG4gKi9cbkNvbGxlY3Rpb24ucHJvdG90eXBlLmluc3RhbGwgPSBmdW5jdGlvbihjYWxsYmFjaykge1xuICAgIHZhciBkZWZlcnJlZCA9IHdpbmRvdy5xID8gd2luZG93LnEuZGVmZXIoKSA6IG51bGw7XG4gICAgdmFyIHNlbGYgPSB0aGlzO1xuICAgIGlmICghdGhpcy5pbnN0YWxsZWQpIHtcbiAgICAgICAgdmFyIG1hcHBpbmdzVG9JbnN0YWxsID0gW107XG4gICAgICAgIGZvciAodmFyIG5hbWUgaW4gdGhpcy5fbWFwcGluZ3MpIHtcbiAgICAgICAgICAgIGlmICh0aGlzLl9tYXBwaW5ncy5oYXNPd25Qcm9wZXJ0eShuYW1lKSkge1xuICAgICAgICAgICAgICAgIHZhciBtYXBwaW5nID0gdGhpcy5fbWFwcGluZ3NbbmFtZV07XG4gICAgICAgICAgICAgICAgbWFwcGluZ3NUb0luc3RhbGwucHVzaChtYXBwaW5nKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICBpZiAoTG9nZ2VyLmluZm8uaXNFbmFibGVkKVxuICAgICAgICAgICAgTG9nZ2VyLmluZm8oJ1RoZXJlIGFyZSAnICsgbWFwcGluZ3NUb0luc3RhbGwubGVuZ3RoLnRvU3RyaW5nKCkgKyAnIG1hcHBpbmdzIHRvIGluc3RhbGwnKTtcbiAgICAgICAgaWYgKG1hcHBpbmdzVG9JbnN0YWxsLmxlbmd0aCkge1xuICAgICAgICAgICAgdmFyIG9wZXJhdGlvbnMgPSBfLm1hcChtYXBwaW5nc1RvSW5zdGFsbCwgZnVuY3Rpb24obSkge1xuICAgICAgICAgICAgICAgIHJldHVybiBuZXcgT3BlcmF0aW9uKCdJbnN0YWxsIE1hcHBpbmcnLCBfLmJpbmQobS5pbnN0YWxsLCBtKSk7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIHZhciBvcCA9IG5ldyBPcGVyYXRpb24oJ0luc3RhbGwgTWFwcGluZ3MnLCBvcGVyYXRpb25zKTtcbiAgICAgICAgICAgIG9wLmNvbXBsZXRpb24gPSBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgICAgICBpZiAob3AuZmFpbGVkKSB7XG4gICAgICAgICAgICAgICAgICAgIExvZ2dlci5lcnJvcignRmFpbGVkIHRvIGluc3RhbGwgY29sbGVjdGlvbicsIG9wLmVycm9yKTtcbiAgICAgICAgICAgICAgICAgICAgc2VsZi5fZmluYWxpc2VJbnN0YWxsYXRpb24ob3AuZXJyb3IsIGNhbGxiYWNrKTtcbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICBzZWxmLmluc3RhbGxlZCA9IHRydWU7XG4gICAgICAgICAgICAgICAgICAgIHZhciBlcnJvcnMgPSBbXTtcbiAgICAgICAgICAgICAgICAgICAgXy5lYWNoKG1hcHBpbmdzVG9JbnN0YWxsLCBmdW5jdGlvbihtKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAoTG9nZ2VyLmluZm8uaXNFbmFibGVkKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIExvZ2dlci5pbmZvKCdJbnN0YWxsaW5nIHJlbGF0aW9uc2hpcHMgZm9yIG1hcHBpbmcgd2l0aCBuYW1lIFwiJyArIG0udHlwZSArICdcIicpO1xuICAgICAgICAgICAgICAgICAgICAgICAgdmFyIGVyciA9IG0uaW5zdGFsbFJlbGF0aW9uc2hpcHMoKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmIChlcnIpIGVycm9ycy5wdXNoKGVycik7XG4gICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgICAgICBpZiAoIWVycm9ycy5sZW5ndGgpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIF8uZWFjaChtYXBwaW5nc1RvSW5zdGFsbCwgZnVuY3Rpb24obSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmIChMb2dnZXIuaW5mby5pc0VuYWJsZWQpXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIExvZ2dlci5pbmZvKCdJbnN0YWxsaW5nIHJldmVyc2UgcmVsYXRpb25zaGlwcyBmb3IgbWFwcGluZyB3aXRoIG5hbWUgXCInICsgbS50eXBlICsgJ1wiJyk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdmFyIGVyciA9IG0uaW5zdGFsbFJldmVyc2VSZWxhdGlvbnNoaXBzKCk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgKGVycikgZXJyb3JzLnB1c2goZXJyKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIHZhciBlcnI7XG4gICAgICAgICAgICAgICAgICAgIGlmIChlcnJvcnMubGVuZ3RoID09IDEpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGVyciA9IGVycm9yc1swXTtcbiAgICAgICAgICAgICAgICAgICAgfSBlbHNlIGlmIChlcnJvcnMubGVuZ3RoKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBlcnIgPSBlcnJvcnM7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgc2VsZi5fZmluYWxpc2VJbnN0YWxsYXRpb24oZXJyLCBjYWxsYmFjayk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfTtcbiAgICAgICAgICAgIG9wLnN0YXJ0KCk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBzZWxmLl9maW5hbGlzZUluc3RhbGxhdGlvbihudWxsLCBjYWxsYmFjayk7XG4gICAgICAgIH1cbiAgICB9IGVsc2Uge1xuICAgICAgICB2YXIgZXJyID0gbmV3IEludGVybmFsU2llc3RhRXJyb3IoJ0NvbGxlY3Rpb24gXCInICsgdGhpcy5fbmFtZSArICdcIiBoYXMgYWxyZWFkeSBiZWVuIGluc3RhbGxlZCcpO1xuICAgICAgICBzZWxmLl9maW5hbGlzZUluc3RhbGxhdGlvbihlcnIsIGNhbGxiYWNrKTtcbiAgICB9XG4gICAgcmV0dXJuIGRlZmVycmVkID8gZGVmZXJyZWQucHJvbWlzZSA6IG51bGw7XG59O1xuXG4vKipcbiAqIE1hcmsgdGhpcyBjb2xsZWN0aW9uIGFzIGluc3RhbGxlZCwgYW5kIHBsYWNlIHRoZSBjb2xsZWN0aW9uIG9uIHRoZSBnbG9iYWwgU2llc3RhIG9iamVjdC5cbiAqIEBwYXJhbSAge09iamVjdH0gICBlcnJcbiAqIEBwYXJhbSAge0Z1bmN0aW9ufSBjYWxsYmFja1xuICovXG5Db2xsZWN0aW9uLnByb3RvdHlwZS5fZmluYWxpc2VJbnN0YWxsYXRpb24gPSBmdW5jdGlvbihlcnIsIGNhbGxiYWNrKSB7XG4gICAgaWYgKCFlcnIpIHtcbiAgICAgICAgdGhpcy5pbnN0YWxsZWQgPSB0cnVlO1xuICAgICAgICB2YXIgaW5kZXggPSByZXF1aXJlKCcuLi9pbmRleCcpO1xuICAgICAgICBpbmRleFt0aGlzLl9uYW1lXSA9IHRoaXM7XG4gICAgfVxuICAgIGlmIChjYWxsYmFjaykgY2FsbGJhY2soZXJyKTtcbn07XG5cbi8qKlxuICogR2l2ZW4gdGhlIG5hbWUgb2YgYSBtYXBwaW5nIGFuZCBhbiBvcHRpb25zIG9iamVjdCBkZXNjcmliaW5nIHRoZSBtYXBwaW5nLCBjcmVhdGluZyBhIE1hcHBpbmdcbiAqIG9iamVjdCwgaW5zdGFsbCBpdCBhbmQgcmV0dXJuIGl0LlxuICogQHBhcmFtICB7U3RyaW5nfSBuYW1lXG4gKiBAcGFyYW0gIHtPYmplY3R9IG1hcHBpbmdcbiAqIEByZXR1cm4ge01hcHBpbmd9XG4gKi9cbkNvbGxlY3Rpb24ucHJvdG90eXBlLl9tYXBwaW5nID0gZnVuY3Rpb24obmFtZSwgb3B0cykge1xuICAgIGlmIChuYW1lKSB7XG4gICAgICAgIHRoaXMuX3Jhd01hcHBpbmdzW25hbWVdID0gb3B0cztcbiAgICAgICAgdmFyIG9wdHMgPSBleHRlbmQodHJ1ZSwge30sIG9wdHMpO1xuICAgICAgICBvcHRzLnR5cGUgPSBuYW1lO1xuICAgICAgICBvcHRzLmNvbGxlY3Rpb24gPSB0aGlzLl9uYW1lO1xuICAgICAgICB2YXIgbWFwcGluZ09iamVjdCA9IG5ldyBNYXBwaW5nKG9wdHMpO1xuICAgICAgICB0aGlzLl9tYXBwaW5nc1tuYW1lXSA9IG1hcHBpbmdPYmplY3Q7XG4gICAgICAgIHRoaXNbbmFtZV0gPSBtYXBwaW5nT2JqZWN0O1xuICAgICAgICByZXR1cm4gbWFwcGluZ09iamVjdDtcbiAgICB9IGVsc2Uge1xuICAgICAgICB0aHJvdyBuZXcgSW50ZXJuYWxTaWVzdGFFcnJvcignTm8gbmFtZSBzcGVjaWZpZWQgd2hlbiBjcmVhdGluZyBtYXBwaW5nJyk7XG4gICAgfVxufTtcblxuLyoqXG4gKiBSZWdpc3RlcnMgYSBtYXBwaW5nIHdpdGggdGhpcyBjb2xsZWN0aW9uLlxuICogQHBhcmFtIHtTdHJpbmd8T2JqZWN0fSBvcHRzT3JOYW1lIEFuIG9wdGlvbnMgb2JqZWN0IG9yIHRoZSBuYW1lIG9mIHRoZSBtYXBwaW5nLiBNdXN0IHBhc3Mgb3B0aW9ucyBhcyBzZWNvbmQgcGFyYW0gaWYgc3BlY2lmeSBuYW1lLlxuICogQHBhcmFtIHtPYmplY3R9IG9wdHMgT3B0aW9ucyBpZiBuYW1lIGFscmVhZHkgc3BlY2lmaWVkLlxuICogQHJldHVybiB7TWFwcGluZ31cbiAqL1xuQ29sbGVjdGlvbi5wcm90b3R5cGUubWFwcGluZyA9IGZ1bmN0aW9uKCkge1xuICAgIHZhciBzZWxmID0gdGhpcztcbiAgICBpZiAoYXJndW1lbnRzLmxlbmd0aCkge1xuICAgICAgICBpZiAoYXJndW1lbnRzLmxlbmd0aCA9PSAxKSB7XG4gICAgICAgICAgICBpZiAodXRpbC5pc0FycmF5KGFyZ3VtZW50c1swXSkpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gXy5tYXAoYXJndW1lbnRzWzBdLCBmdW5jdGlvbihtKSB7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBzZWxmLl9tYXBwaW5nKG0ubmFtZSwgbSk7XG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIHJldHVybiB0aGlzLl9tYXBwaW5nKGFyZ3VtZW50c1swXS5uYW1lLCBhcmd1bWVudHNbMF0pO1xuICAgICAgICAgICAgfVxuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgaWYgKHR5cGVvZiBhcmd1bWVudHNbMF0gPT0gJ3N0cmluZycpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gdGhpcy5fbWFwcGluZyhhcmd1bWVudHNbMF0sIGFyZ3VtZW50c1sxXSk7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIHJldHVybiBfLm1hcChhcmd1bWVudHMsIGZ1bmN0aW9uKG0pIHtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHNlbGYuX21hcHBpbmcobS5uYW1lLCBtKTtcbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH1cbiAgICByZXR1cm4gbnVsbDtcbn07XG5cbkNvbGxlY3Rpb24ucHJvdG90eXBlLmRlc2NyaXB0b3IgPSBmdW5jdGlvbihvcHRzKSB7XG4gICAgdmFyIGRlc2NyaXB0b3JzID0gW107XG4gICAgaWYgKHNpZXN0YS5leHQuaHR0cEVuYWJsZWQpIHtcbiAgICAgICAgb3B0cy5jb2xsZWN0aW9uID0gdGhpcztcbiAgICAgICAgdmFyIG1ldGhvZHMgPSBzaWVzdGEuZXh0Lmh0dHAuX3Jlc29sdmVNZXRob2Qob3B0cy5tZXRob2QpO1xuICAgICAgICB2YXIgdW5zYWZlID0gW107XG4gICAgICAgIHZhciBzYWZlID0gW107XG4gICAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgbWV0aG9kcy5sZW5ndGg7IGkrKykge1xuICAgICAgICAgICAgdmFyIG0gPSBtZXRob2RzW2ldO1xuICAgICAgICAgICAgaWYgKFVOU0FGRV9NRVRIT0RTLmluZGV4T2YobSkgPiAtMSkge1xuICAgICAgICAgICAgICAgIHVuc2FmZS5wdXNoKG0pO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICBzYWZlLnB1c2gobSk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgaWYgKHVuc2FmZS5sZW5ndGgpIHtcbiAgICAgICAgICAgIHZhciByZXF1ZXN0RGVzY3JpcHRvciA9IGV4dGVuZCh7fSwgb3B0cyk7XG4gICAgICAgICAgICByZXF1ZXN0RGVzY3JpcHRvci5tZXRob2QgPSB1bnNhZmU7XG4gICAgICAgICAgICByZXF1ZXN0RGVzY3JpcHRvciA9IG5ldyBzaWVzdGEuZXh0Lmh0dHAuUmVxdWVzdERlc2NyaXB0b3IocmVxdWVzdERlc2NyaXB0b3IpO1xuICAgICAgICAgICAgc2llc3RhLmV4dC5odHRwLkRlc2NyaXB0b3JSZWdpc3RyeS5yZWdpc3RlclJlcXVlc3REZXNjcmlwdG9yKHJlcXVlc3REZXNjcmlwdG9yKTtcbiAgICAgICAgICAgIGRlc2NyaXB0b3JzLnB1c2gocmVxdWVzdERlc2NyaXB0b3IpO1xuICAgICAgICB9XG4gICAgICAgIGlmIChzYWZlLmxlbmd0aCkge1xuICAgICAgICAgICAgdmFyIHJlc3BvbnNlRGVzY3JpcHRvciA9IGV4dGVuZCh7fSwgb3B0cyk7XG4gICAgICAgICAgICByZXNwb25zZURlc2NyaXB0b3IubWV0aG9kID0gc2FmZTtcbiAgICAgICAgICAgIHJlc3BvbnNlRGVzY3JpcHRvciA9IG5ldyBzaWVzdGEuZXh0Lmh0dHAuUmVzcG9uc2VEZXNjcmlwdG9yKHJlc3BvbnNlRGVzY3JpcHRvcik7XG4gICAgICAgICAgICBzaWVzdGEuZXh0Lmh0dHAuRGVzY3JpcHRvclJlZ2lzdHJ5LnJlZ2lzdGVyUmVzcG9uc2VEZXNjcmlwdG9yKHJlc3BvbnNlRGVzY3JpcHRvcik7XG4gICAgICAgICAgICBkZXNjcmlwdG9ycy5wdXNoKHJlc3BvbnNlRGVzY3JpcHRvcik7XG4gICAgICAgIH1cbiAgICB9IGVsc2Uge1xuICAgICAgICB0aHJvdyBuZXcgSW50ZXJuYWxTaWVzdGFFcnJvcignSFRUUCBtb2R1bGUgbm90IGluc3RhbGxlZCcpO1xuICAgIH1cbiAgICByZXR1cm4gZGVzY3JpcHRvcnM7XG59O1xuXG4vKipcbiAqIER1bXAgdGhpcyBjb2xsZWN0aW9uIGFzIEpTT05cbiAqIEBwYXJhbSAge0Jvb2xlYW59IGFzSnNvbiBXaGV0aGVyIG9yIG5vdCB0byBhcHBseSBKU09OLnN0cmluZ2lmeVxuICogQHJldHVybiB7U3RyaW5nfE9iamVjdH1cbiAqL1xuQ29sbGVjdGlvbi5wcm90b3R5cGUuX2R1bXAgPSBmdW5jdGlvbihhc0pzb24pIHtcbiAgICB2YXIgb2JqID0ge307XG4gICAgb2JqLmluc3RhbGxlZCA9IHRoaXMuaW5zdGFsbGVkO1xuICAgIG9iai5kb2NJZCA9IHRoaXMuX2RvY0lkO1xuICAgIG9iai5uYW1lID0gdGhpcy5fbmFtZTtcbiAgICBvYmouYmFzZVVSTCA9IHRoaXMuYmFzZVVSTDtcbiAgICByZXR1cm4gYXNKc29uID8gSlNPTi5zdHJpbmdpZnkob2JqLCBudWxsLCA0KSA6IG9iajtcbn07XG5cblxuLy8gLyoqXG4vLyAgKiBQZXJzaXN0IGFsbCBjaGFuZ2VzIHRvIFBvdWNoREIuXG4vLyAgKiBOb3RlOiBTdG9yYWdlIGV4dGVuc2lvbiBtdXN0IGJlIGluc3RhbGxlZC5cbi8vICAqIEBwYXJhbSBjYWxsYmFja1xuLy8gICogQHJldHVybnMge1Byb21pc2V9XG4vLyAgKi9cbi8vIENvbGxlY3Rpb24ucHJvdG90eXBlLnNhdmUgPSBmdW5jdGlvbihjYWxsYmFjaykge1xuLy8gICAgIHZhciBkZWZlcnJlZCA9IHEuZGVmZXIoKTtcbi8vICAgICBjYWxsYmFjayA9IHV0aWwuY29uc3RydWN0Q2FsbGJhY2tBbmRQcm9taXNlSGFuZGxlcihjYWxsYmFjaywgZGVmZXJyZWQpO1xuLy8gICAgIGlmIChzaWVzdGEuZXh0LnN0b3JhZ2VFbmFibGVkKSB7XG4vLyAgICAgICAgIHV0aWwubmV4dChmdW5jdGlvbigpIHtcbi8vICAgICAgICAgICAgIHZhciBtZXJnZUNoYW5nZXMgPSBzaWVzdGEuZXh0LnN0b3JhZ2UuY2hhbmdlcy5tZXJnZUNoYW5nZXM7XG4vLyAgICAgICAgICAgICBtZXJnZUNoYW5nZXMoY2FsbGJhY2spO1xuLy8gICAgICAgICB9KTtcbi8vICAgICB9IGVsc2Uge1xuLy8gICAgICAgICBjYWxsYmFjaygnU3RvcmFnZSBtb2R1bGUgbm90IGluc3RhbGxlZCcpO1xuLy8gICAgIH1cbi8vICAgICByZXR1cm4gZGVmZXJyZWQgPyBkZWZlcnJlZC5wcm9taXNlIDogbnVsbDtcbi8vIH07XG5cblxuQ29sbGVjdGlvbi5wcm90b3R5cGUuX2h0dHAgPSBmdW5jdGlvbihtZXRob2QpIHtcbiAgICBpZiAoc2llc3RhLmV4dC5odHRwRW5hYmxlZCkge1xuICAgICAgICB2YXIgYXJncyA9IEFycmF5LnByb3RvdHlwZS5zbGljZS5jYWxsKGFyZ3VtZW50cywgMSk7XG4gICAgICAgIGFyZ3MudW5zaGlmdCh0aGlzKTtcbiAgICAgICAgdmFyIGYgPSBzaWVzdGEuZXh0Lmh0dHBbbWV0aG9kXTtcbiAgICAgICAgZi5hcHBseShmLCBhcmdzKTtcbiAgICB9IGVsc2Uge1xuICAgICAgICB0aHJvdyBJbnRlcm5hbFNpZXN0YUVycm9yKCdIVFRQIG1vZHVsZSBub3QgZW5hYmxlZCcpO1xuICAgIH1cbn1cblxuLyoqXG4gKiBTZW5kIGEgR0VUIHJlcXVlc3RcbiAqIEBwYXJhbSB7U3RyaW5nfSBwYXRoIFRoZSBwYXRoIHRvIHRoZSByZXNvdXJjZSB3ZSB3YW50IHRvIEdFVFxuICogQHBhcmFtIHtPYmplY3R8RnVuY3Rpb259IG9wdHNPckNhbGxiYWNrIEVpdGhlciBhbiBvcHRpb25zIG9iamVjdCBvciBhIGNhbGxiYWNrIGlmIGNhbiB1c2UgZGVmYXVsdHNcbiAqIEBwYXJhbSB7RnVuY3Rpb259IGNhbGxiYWNrIENhbGxiYWNrIGlmIG9wdHMgc3BlY2lmaWVkLlxuICogQHBhY2thZ2UgSFRUUFxuICogQHJldHVybnMge1Byb21pc2V9XG4gKi9cbkNvbGxlY3Rpb24ucHJvdG90eXBlLkdFVCA9IGZ1bmN0aW9uKCkge1xuICAgIHJldHVybiBfLnBhcnRpYWwodGhpcy5faHR0cCwgJ0dFVCcpLmFwcGx5KHRoaXMsIGFyZ3VtZW50cyk7XG59O1xuXG4vKipcbiAqIFNlbmQgYSBPUFRJT05TIHJlcXVlc3RcbiAqIEBwYXJhbSB7U3RyaW5nfSBwYXRoIFRoZSBwYXRoIHRvIHRoZSByZXNvdXJjZSB0byB3aGljaCB3ZSB3YW50IHRvIHNlbmQgYW4gT1BUSU9OUyByZXF1ZXN0XG4gKiBAcGFyYW0ge09iamVjdHxGdW5jdGlvbn0gb3B0c09yQ2FsbGJhY2sgRWl0aGVyIGFuIG9wdGlvbnMgb2JqZWN0IG9yIGEgY2FsbGJhY2sgaWYgY2FuIHVzZSBkZWZhdWx0c1xuICogQHBhcmFtIHtGdW5jdGlvbn0gY2FsbGJhY2sgQ2FsbGJhY2sgaWYgb3B0cyBzcGVjaWZpZWQuXG4gKiBAcmV0dXJucyB7UHJvbWlzZX1cbiAqL1xuQ29sbGVjdGlvbi5wcm90b3R5cGUuT1BUSU9OUyA9IGZ1bmN0aW9uKCkge1xuICAgIHJldHVybiBfLnBhcnRpYWwodGhpcy5faHR0cCwgJ09QVElPTlMnKS5hcHBseSh0aGlzLCBhcmd1bWVudHMpO1xufTtcblxuLyoqXG4gKiBTZW5kIGEgVFJBQ0UgcmVxdWVzdFxuICogQHBhcmFtIHtwYXRofSBwYXRoIFRoZSBwYXRoIHRvIHRoZSByZXNvdXJjZSB0byB3aGljaCB3ZSB3YW50IHRvIHNlbmQgYSBUUkFDRSByZXF1ZXN0XG4gKiBAcGFyYW0ge09iamVjdHxGdW5jdGlvbn0gb3B0c09yQ2FsbGJhY2sgRWl0aGVyIGFuIG9wdGlvbnMgb2JqZWN0IG9yIGEgY2FsbGJhY2sgaWYgY2FuIHVzZSBkZWZhdWx0c1xuICogQHBhcmFtIHtGdW5jdGlvbn0gY2FsbGJhY2sgQ2FsbGJhY2sgaWYgb3B0cyBzcGVjaWZpZWQuXG4gKiBAcmV0dXJucyB7UHJvbWlzZX1cbiAqL1xuQ29sbGVjdGlvbi5wcm90b3R5cGUuVFJBQ0UgPSBmdW5jdGlvbigpIHtcbiAgICByZXR1cm4gXy5wYXJ0aWFsKHRoaXMuX2h0dHAsICdUUkFDRScpLmFwcGx5KHRoaXMsIGFyZ3VtZW50cyk7XG59O1xuXG4vKipcbiAqIFNlbmQgYSBIRUFEIHJlcXVlc3RcbiAqIEBwYXJhbSB7U3RyaW5nfSBwYXRoIFRoZSBwYXRoIHRvIHRoZSByZXNvdXJjZSB0byB3aGljaCB3ZSB3YW50IHRvIHNlbmQgYSBIRUFEIHJlcXVlc3RcbiAqIEBwYXJhbSB7T2JqZWN0fEZ1bmN0aW9ufSBvcHRzT3JDYWxsYmFjayBFaXRoZXIgYW4gb3B0aW9ucyBvYmplY3Qgb3IgYSBjYWxsYmFjayBpZiBjYW4gdXNlIGRlZmF1bHRzXG4gKiBAcGFyYW0ge0Z1bmN0aW9ufSBjYWxsYmFjayBDYWxsYmFjayBpZiBvcHRzIHNwZWNpZmllZC5cbiAqIEByZXR1cm5zIHtQcm9taXNlfVxuICovXG5Db2xsZWN0aW9uLnByb3RvdHlwZS5IRUFEID0gZnVuY3Rpb24oKSB7XG4gICAgcmV0dXJuIF8ucGFydGlhbCh0aGlzLl9odHRwLCAnSEVBRCcpLmFwcGx5KHRoaXMsIGFyZ3VtZW50cyk7XG59O1xuXG4vKipcbiAqIFNlbmQgYSBQT1NUIHJlcXVlc3RcbiAqIEBwYXJhbSB7U3RyaW5nfSBwYXRoIFRoZSBwYXRoIHRvIHRoZSByZXNvdXJjZSB0byB3aGljaCB3ZSB3YW50IHRvIHNlbmQgYSBQT1NUIHJlcXVlc3RcbiAqIEBwYXJhbSB7U2llc3RhTW9kZWx9IG1vZGVsIFRoZSBtb2RlbCB0aGF0IHdlIHdvdWxkIGxpa2UgdG8gUE9TVFxuICogQHBhcmFtIHtPYmplY3R8RnVuY3Rpb259IG9wdHNPckNhbGxiYWNrIEVpdGhlciBhbiBvcHRpb25zIG9iamVjdCBvciBhIGNhbGxiYWNrIGlmIGNhbiB1c2UgZGVmYXVsdHNcbiAqIEBwYXJhbSB7RnVuY3Rpb259IGNhbGxiYWNrIENhbGxiYWNrIGlmIG9wdHMgc3BlY2lmaWVkLlxuICogQHJldHVybnMge1Byb21pc2V9XG4gKi9cbkNvbGxlY3Rpb24ucHJvdG90eXBlLlBPU1QgPSBmdW5jdGlvbigpIHtcbiAgICByZXR1cm4gXy5wYXJ0aWFsKHRoaXMuX2h0dHAsICdQT1NUJykuYXBwbHkodGhpcywgYXJndW1lbnRzKTtcbn07XG5cbi8qKlxuICogU2VuZCBhIFBVVCByZXF1ZXN0XG4gKiBAcGFyYW0ge1N0cmluZ30gcGF0aCBUaGUgcGF0aCB0byB0aGUgcmVzb3VyY2UgdG8gd2hpY2ggd2Ugd2FudCB0byBzZW5kIGEgUFVUIHJlcXVlc3RcbiAqIEBwYXJhbSB7U2llc3RhTW9kZWx9IG1vZGVsIFRoZSBtb2RlbCB0aGF0IHdlIHdvdWxkIGxpa2UgdG8gUFVUXG4gKiBAcGFyYW0ge09iamVjdHxGdW5jdGlvbn0gb3B0c09yQ2FsbGJhY2sgRWl0aGVyIGFuIG9wdGlvbnMgb2JqZWN0IG9yIGEgY2FsbGJhY2sgaWYgY2FuIHVzZSBkZWZhdWx0c1xuICogQHBhcmFtIHtGdW5jdGlvbn0gY2FsbGJhY2sgQ2FsbGJhY2sgaWYgb3B0cyBzcGVjaWZpZWQuXG4gKiBAcmV0dXJucyB7UHJvbWlzZX1cbiAqL1xuQ29sbGVjdGlvbi5wcm90b3R5cGUuUFVUID0gZnVuY3Rpb24oKSB7XG4gICAgXy5wYXJ0aWFsKHRoaXMuX2h0dHAsICdQVVQnKS5hcHBseSh0aGlzLCBhcmd1bWVudHMpO1xufTtcblxuLyoqXG4gKiBTZW5kIGEgUEFUQ0ggcmVxdWVzdFxuICogQHBhcmFtIHtTdHJpbmd9IHBhdGggVGhlIHBhdGggdG8gdGhlIHJlc291cmNlIHRvIHdoaWNoIHdlIHdhbnQgdG8gc2VuZCBhIFBBVENIIHJlcXVlc3RcbiAqIEBwYXJhbSB7U2llc3RhTW9kZWx9IG1vZGVsIFRoZSBtb2RlbCB0aGF0IHdlIHdvdWxkIGxpa2UgdG8gUEFUQ0hcbiAqIEBwYXJhbSB7T2JqZWN0fEZ1bmN0aW9ufSBvcHRzT3JDYWxsYmFjayBFaXRoZXIgYW4gb3B0aW9ucyBvYmplY3Qgb3IgYSBjYWxsYmFjayBpZiBjYW4gdXNlIGRlZmF1bHRzXG4gKiBAcGFyYW0ge0Z1bmN0aW9ufSBjYWxsYmFjayBDYWxsYmFjayBpZiBvcHRzIHNwZWNpZmllZC5cbiAqIEByZXR1cm5zIHtQcm9taXNlfVxuICovXG5Db2xsZWN0aW9uLnByb3RvdHlwZS5QQVRDSCA9IGZ1bmN0aW9uKCkge1xuICAgIHJldHVybiBfLnBhcnRpYWwodGhpcy5faHR0cCwgJ1BBVENIJykuYXBwbHkodGhpcywgYXJndW1lbnRzKTtcbn07XG5cbi8qKlxuICogU2VuZCBhIERFTEVURSByZXF1ZXN0LiBBbHNvIHJlbW92ZXMgdGhlIG9iamVjdC5cbiAqIEBwYXJhbSB7U3RyaW5nfSBwYXRoIFRoZSBwYXRoIHRvIHRoZSByZXNvdXJjZSB0byB3aGljaCB3ZSB3YW50IHRvIERFTEVURVxuICogQHBhcmFtIHtTaWVzdGFNb2RlbH0gbW9kZWwgVGhlIG1vZGVsIHRoYXQgd2Ugd291bGQgbGlrZSB0byBQQVRDSFxuICogQHBhcmFtIHtPYmplY3R8RnVuY3Rpb259IG9wdHNPckNhbGxiYWNrIEVpdGhlciBhbiBvcHRpb25zIG9iamVjdCBvciBhIGNhbGxiYWNrIGlmIGNhbiB1c2UgZGVmYXVsdHNcbiAqIEBwYXJhbSB7RnVuY3Rpb259IGNhbGxiYWNrIENhbGxiYWNrIGlmIG9wdHMgc3BlY2lmaWVkLlxuICogQHJldHVybnMge1Byb21pc2V9XG4gKi9cbkNvbGxlY3Rpb24ucHJvdG90eXBlLkRFTEVURSA9IGZ1bmN0aW9uKHBhdGgsIG9iamVjdCkge1xuICAgIHJldHVybiBfLnBhcnRpYWwodGhpcy5faHR0cCwgJ0RFTEVURScpLmFwcGx5KHRoaXMsIGFyZ3VtZW50cyk7XG59O1xuXG4vKipcbiAqIFJldHVybnMgdGhlIG51bWJlciBvZiBvYmplY3RzIGluIHRoaXMgY29sbGVjdGlvbi5cbiAqXG4gKiBAcGFyYW0gY2FsbGJhY2tcbiAqIEByZXR1cm5zIHtQcm9taXNlfVxuICovXG5Db2xsZWN0aW9uLnByb3RvdHlwZS5jb3VudCA9IGZ1bmN0aW9uKGNhbGxiYWNrKSB7XG4gICAgdmFyIGRlZmVycmVkID0gd2luZG93LnEgPyB3aW5kb3cucS5kZWZlcigpIDogbnVsbDtcbiAgICBjYWxsYmFjayA9IHV0aWwuY29uc3RydWN0Q2FsbGJhY2tBbmRQcm9taXNlSGFuZGxlcihjYWxsYmFjaywgZGVmZXJyZWQpO1xuICAgIHZhciB0YXNrcyA9IF8ubWFwKHRoaXMuX21hcHBpbmdzLCBmdW5jdGlvbihtKSB7XG4gICAgICAgIHJldHVybiBfLmJpbmQobS5jb3VudCwgbSk7XG4gICAgfSk7XG4gICAgdXRpbC5wYXJhbGxlbCh0YXNrcywgZnVuY3Rpb24oZXJyLCBucykge1xuICAgICAgICB2YXIgbjtcbiAgICAgICAgaWYgKCFlcnIpIHtcbiAgICAgICAgICAgIG4gPSBfLnJlZHVjZShucywgZnVuY3Rpb24obSwgcikge1xuICAgICAgICAgICAgICAgIHJldHVybiBtICsgclxuICAgICAgICAgICAgfSwgMCk7XG4gICAgICAgIH1cbiAgICAgICAgY2FsbGJhY2soZXJyLCBuKTtcbiAgICB9KTtcbiAgICByZXR1cm4gZGVmZXJyZWQgPyBkZWZlcnJlZC5wcm9taXNlIDogbnVsbDtcbn07XG5cbmV4cG9ydHMuQ29sbGVjdGlvbiA9IENvbGxlY3Rpb247IiwiLyoqXG4gKiBAbW9kdWxlIGNvbGxlY3Rpb24gXG4gKi9cbnZhciBfID0gcmVxdWlyZSgnLi91dGlsJykuXztcblxuZnVuY3Rpb24gQ29sbGVjdGlvblJlZ2lzdHJ5KCkge1xuICAgIGlmICghdGhpcykgcmV0dXJuIG5ldyBDb2xsZWN0aW9uUmVnaXN0cnkoKTtcbiAgICB0aGlzLmNvbGxlY3Rpb25OYW1lcyA9IFtdO1xufVxuXG5Db2xsZWN0aW9uUmVnaXN0cnkucHJvdG90eXBlLnJlZ2lzdGVyID0gZnVuY3Rpb24gKGNvbGxlY3Rpb24pIHtcbiAgICB2YXIgbmFtZSA9IGNvbGxlY3Rpb24uX25hbWU7XG4gICAgdGhpc1tuYW1lXSA9IGNvbGxlY3Rpb247XG4gICAgdGhpcy5jb2xsZWN0aW9uTmFtZXMucHVzaChuYW1lKTtcbn07XG5cbkNvbGxlY3Rpb25SZWdpc3RyeS5wcm90b3R5cGUucmVzZXQgPSBmdW5jdGlvbiAoKSB7XG4gICAgdmFyIHNlbGYgPSB0aGlzO1xuICAgIF8uZWFjaCh0aGlzLmNvbGxlY3Rpb25OYW1lcywgZnVuY3Rpb24gKG5hbWUpIHtcbiAgICAgICAgZGVsZXRlIHNlbGZbbmFtZV07XG4gICAgfSk7XG4gICAgdGhpcy5jb2xsZWN0aW9uTmFtZXMgPSBbXTtcbn07XG5cbmV4cG9ydHMuQ29sbGVjdGlvblJlZ2lzdHJ5ID0gbmV3IENvbGxlY3Rpb25SZWdpc3RyeSgpOyIsIi8qKlxuICogQG1vZHVsZSBlcnJvclxuICovXG5cbmZ1bmN0aW9uIEludGVybmFsU2llc3RhRXJyb3IobWVzc2FnZSwgY29udGV4dCwgc3NmKSB7XG4gICAgdGhpcy5tZXNzYWdlID0gbWVzc2FnZTtcbiAgICB0aGlzLmNvbnRleHQgPSBjb250ZXh0O1xuICAgIC8vIGNhcHR1cmUgc3RhY2sgdHJhY2VcbiAgICBzc2YgPSBzc2YgfHwgYXJndW1lbnRzLmNhbGxlZTtcbiAgICBpZiAoc3NmICYmIEVycm9yLmNhcHR1cmVTdGFja1RyYWNlKSB7XG4gICAgICAgIEVycm9yLmNhcHR1cmVTdGFja1RyYWNlKHRoaXMsIHNzZik7XG4gICAgfVxufVxuXG5JbnRlcm5hbFNpZXN0YUVycm9yLnByb3RvdHlwZSA9IE9iamVjdC5jcmVhdGUoRXJyb3IucHJvdG90eXBlKTtcbkludGVybmFsU2llc3RhRXJyb3IucHJvdG90eXBlLm5hbWUgPSAnSW50ZXJuYWxTaWVzdGFFcnJvcic7XG5JbnRlcm5hbFNpZXN0YUVycm9yLnByb3RvdHlwZS5jb25zdHJ1Y3RvciA9IEludGVybmFsU2llc3RhRXJyb3I7XG5cbmV4cG9ydHMuSW50ZXJuYWxTaWVzdGFFcnJvciA9IEludGVybmFsU2llc3RhRXJyb3I7XG4iLCIvKipcbiAqIEBtb2R1bGUgcmVsYXRpb25zaGlwc1xuICovXG5cbnZhciBwcm94eSA9IHJlcXVpcmUoJy4vcHJveHknKVxuICAgICwgUmVsYXRpb25zaGlwUHJveHkgPSBwcm94eS5SZWxhdGlvbnNoaXBQcm94eVxuICAgICwgU3RvcmUgPSByZXF1aXJlKCcuL3N0b3JlJylcbiAgICAsIHV0aWwgPSByZXF1aXJlKCcuL3V0aWwnKVxuICAgICwgXyA9IHV0aWwuX1xuICAgICwgSW50ZXJuYWxTaWVzdGFFcnJvciA9IHJlcXVpcmUoJy4vZXJyb3InKS5JbnRlcm5hbFNpZXN0YUVycm9yXG4gICAgLCBjb3JlQ2hhbmdlcyA9IHJlcXVpcmUoJy4vY2hhbmdlcycpXG4gICAgLCBub3RpZmljYXRpb25DZW50cmUgPSByZXF1aXJlKCcuL25vdGlmaWNhdGlvbkNlbnRyZScpXG4gICAgLCB3cmFwQXJyYXlGb3JBdHRyaWJ1dGVzID0gbm90aWZpY2F0aW9uQ2VudHJlLndyYXBBcnJheVxuICAgICwgU2llc3RhTW9kZWwgPSByZXF1aXJlKCcuL29iamVjdCcpLlNpZXN0YU1vZGVsXG4gICAgLCBBcnJheU9ic2VydmVyID0gcmVxdWlyZSgnLi4vdmVuZG9yL29ic2VydmUtanMvc3JjL29ic2VydmUnKS5BcnJheU9ic2VydmVyXG4gICAgLCBDaGFuZ2VUeXBlID0gcmVxdWlyZSgnLi9jaGFuZ2VzJykuQ2hhbmdlVHlwZVxuO1xuXG4vKipcbiAqIFtNYW55VG9NYW55UHJveHkgZGVzY3JpcHRpb25dXG4gKiBAcGFyYW0ge09iamVjdH0gb3B0c1xuICovXG5mdW5jdGlvbiBNYW55VG9NYW55UHJveHkob3B0cykge1xuICAgIFJlbGF0aW9uc2hpcFByb3h5LmNhbGwodGhpcywgb3B0cyk7XG4gICAgdmFyIHNlbGYgPSB0aGlzO1xuICAgIE9iamVjdC5kZWZpbmVQcm9wZXJ0eSh0aGlzLCAnaXNGYXVsdCcsIHtcbiAgICAgICAgZ2V0OiBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICBpZiAoc2VsZi5faWQpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gIXNlbGYucmVsYXRlZDtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHJldHVybiB0cnVlO1xuICAgICAgICB9LFxuICAgICAgICBzZXQ6IGZ1bmN0aW9uICh2KSB7XG4gICAgICAgICAgICBpZiAodikge1xuICAgICAgICAgICAgICAgIHNlbGYuX2lkID0gdW5kZWZpbmVkO1xuICAgICAgICAgICAgICAgIHNlbGYucmVsYXRlZCA9IG51bGw7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgICAgICBpZiAoIXNlbGYuX2lkKSB7XG4gICAgICAgICAgICAgICAgICAgIHNlbGYuX2lkID0gW107XG4gICAgICAgICAgICAgICAgICAgIHNlbGYucmVsYXRlZCA9IFtdO1xuICAgICAgICAgICAgICAgICAgICB3cmFwQXJyYXkuY2FsbChzZWxmLCBzZWxmLnJlbGF0ZWQpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH0pO1xuICAgIHRoaXMuX3JldmVyc2VJc0FycmF5ID0gdHJ1ZTtcbn1cblxuXG5mdW5jdGlvbiBjbGVhclJldmVyc2UocmVtb3ZlZCkge1xuICAgIHZhciBzZWxmID0gdGhpcztcbiAgICBfLmVhY2gocmVtb3ZlZCwgZnVuY3Rpb24gKHJlbW92ZWRPYmplY3QpIHtcbiAgICAgICAgdmFyIHJldmVyc2VQcm94eSA9IHByb3h5LmdldFJldmVyc2VQcm94eUZvck9iamVjdC5jYWxsKHNlbGYsIHJlbW92ZWRPYmplY3QpO1xuICAgICAgICB2YXIgaWR4ID0gcmV2ZXJzZVByb3h5Ll9pZC5pbmRleE9mKHNlbGYub2JqZWN0Ll9pZCk7XG4gICAgICAgIHByb3h5Lm1ha2VDaGFuZ2VzVG9SZWxhdGVkV2l0aG91dE9ic2VydmF0aW9ucy5jYWxsKHJldmVyc2VQcm94eSwgZnVuY3Rpb24gKCl7XG4gICAgICAgICAgICBwcm94eS5zcGxpY2UuY2FsbChyZXZlcnNlUHJveHksIGlkeCwgMSk7XG4gICAgICAgIH0pO1xuICAgIH0pO1xufVxuXG5mdW5jdGlvbiBzZXRSZXZlcnNlKGFkZGVkKSB7XG4gICAgdmFyIHNlbGYgPSB0aGlzO1xuICAgIF8uZWFjaChhZGRlZCwgZnVuY3Rpb24gKGFkZGVkT2JqZWN0KSB7XG4gICAgICAgIHZhciByZXZlcnNlUHJveHkgPSBwcm94eS5nZXRSZXZlcnNlUHJveHlGb3JPYmplY3QuY2FsbChzZWxmLCBhZGRlZE9iamVjdCk7XG4gICAgICAgIHByb3h5Lm1ha2VDaGFuZ2VzVG9SZWxhdGVkV2l0aG91dE9ic2VydmF0aW9ucy5jYWxsKHJldmVyc2VQcm94eSwgZnVuY3Rpb24gKCl7XG4gICAgICAgICAgICBwcm94eS5zcGxpY2UuY2FsbChyZXZlcnNlUHJveHksIDAsIDAsIHNlbGYub2JqZWN0KTtcbiAgICAgICAgfSk7XG4gICAgfSk7XG59XG5cbmZ1bmN0aW9uIHdyYXBBcnJheShhcnIpIHtcbiAgICB2YXIgc2VsZiA9IHRoaXM7XG4gICAgd3JhcEFycmF5Rm9yQXR0cmlidXRlcyhhcnIsIHRoaXMucmV2ZXJzZU5hbWUsIHRoaXMub2JqZWN0KTtcbiAgICBpZiAoIWFyci5vbmVUb01hbnlPYnNlcnZlcikge1xuICAgICAgICBhcnIub25lVG9NYW55T2JzZXJ2ZXIgPSBuZXcgQXJyYXlPYnNlcnZlcihhcnIpO1xuICAgICAgICB2YXIgb2JzZXJ2ZXJGdW5jdGlvbiA9IGZ1bmN0aW9uIChzcGxpY2VzKSB7XG4gICAgICAgICAgICBzcGxpY2VzLmZvckVhY2goZnVuY3Rpb24gKHNwbGljZSkge1xuICAgICAgICAgICAgICAgIHZhciBhZGRlZCA9IHNwbGljZS5hZGRlZENvdW50ID8gYXJyLnNsaWNlKHNwbGljZS5pbmRleCwgc3BsaWNlLmluZGV4ICsgc3BsaWNlLmFkZGVkQ291bnQpIDogW107XG4gICAgICAgICAgICAgICAgdmFyIHJlbW92ZWQgPSBzcGxpY2UucmVtb3ZlZDtcbiAgICAgICAgICAgICAgICBjbGVhclJldmVyc2UuY2FsbChzZWxmLCByZW1vdmVkKTtcbiAgICAgICAgICAgICAgICBzZXRSZXZlcnNlLmNhbGwoc2VsZiwgYWRkZWQpO1xuICAgICAgICAgICAgICAgIHZhciBtYXBwaW5nID0gcHJveHkuZ2V0Rm9yd2FyZE1hcHBpbmcuY2FsbChzZWxmKTtcbiAgICAgICAgICAgICAgICBjb3JlQ2hhbmdlcy5yZWdpc3RlckNoYW5nZSh7XG4gICAgICAgICAgICAgICAgICAgIGNvbGxlY3Rpb246IG1hcHBpbmcuY29sbGVjdGlvbixcbiAgICAgICAgICAgICAgICAgICAgbWFwcGluZzogbWFwcGluZy50eXBlLFxuICAgICAgICAgICAgICAgICAgICBfaWQ6IHNlbGYub2JqZWN0Ll9pZCxcbiAgICAgICAgICAgICAgICAgICAgZmllbGQ6IHByb3h5LmdldEZvcndhcmROYW1lLmNhbGwoc2VsZiksXG4gICAgICAgICAgICAgICAgICAgIHJlbW92ZWQ6IHJlbW92ZWQsXG4gICAgICAgICAgICAgICAgICAgIGFkZGVkOiBhZGRlZCxcbiAgICAgICAgICAgICAgICAgICAgcmVtb3ZlZElkOiBfLnBsdWNrKHJlbW92ZWQsICdfaWQnKSxcbiAgICAgICAgICAgICAgICAgICAgYWRkZWRJZDogXy5wbHVjayhhZGRlZCwgJ19pZCcpLFxuICAgICAgICAgICAgICAgICAgICB0eXBlOiBDaGFuZ2VUeXBlLlNwbGljZSxcbiAgICAgICAgICAgICAgICAgICAgaW5kZXg6IHNwbGljZS5pbmRleCxcbiAgICAgICAgICAgICAgICAgICAgb2JqOiBzZWxmLm9iamVjdFxuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgIH07XG4gICAgICAgIGFyci5vbmVUb01hbnlPYnNlcnZlci5vcGVuKG9ic2VydmVyRnVuY3Rpb24pO1xuICAgIH1cbn1cblxuTWFueVRvTWFueVByb3h5LnByb3RvdHlwZSA9IE9iamVjdC5jcmVhdGUoUmVsYXRpb25zaGlwUHJveHkucHJvdG90eXBlKTtcblxuTWFueVRvTWFueVByb3h5LnByb3RvdHlwZS5nZXQgPSBmdW5jdGlvbiAoY2FsbGJhY2spIHtcbiAgICB2YXIgZGVmZXJyZWQgPSB3aW5kb3cucSA/IHdpbmRvdy5xLmRlZmVyKCkgOiBudWxsO1xuICAgIGNhbGxiYWNrID0gdXRpbC5jb25zdHJ1Y3RDYWxsYmFja0FuZFByb21pc2VIYW5kbGVyKGNhbGxiYWNrLCBkZWZlcnJlZCk7XG4gICAgdmFyIHNlbGYgPSB0aGlzO1xuICAgIGlmICh0aGlzLmlzRmF1bHQpIHtcbiAgICAgICAgU3RvcmUuZ2V0KHtfaWQ6IHRoaXMuX2lkfSwgZnVuY3Rpb24gKGVyciwgc3RvcmVkKSB7XG4gICAgICAgICAgICBpZiAoZXJyKSB7XG4gICAgICAgICAgICAgICAgaWYgKGNhbGxiYWNrKSBjYWxsYmFjayhlcnIpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICAgICAgc2VsZi5yZWxhdGVkID0gc3RvcmVkO1xuICAgICAgICAgICAgICAgIGlmIChjYWxsYmFjaykgY2FsbGJhY2sobnVsbCwgc3RvcmVkKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSlcbiAgICB9XG4gICAgZWxzZSB7XG4gICAgICAgIGlmIChjYWxsYmFjaykgY2FsbGJhY2sobnVsbCwgdGhpcy5yZWxhdGVkKTtcbiAgICB9XG4gICAgcmV0dXJuIGRlZmVycmVkID8gZGVmZXJyZWQucHJvbWlzZSA6IG51bGw7XG59O1xuXG5mdW5jdGlvbiB2YWxpZGF0ZShvYmopIHtcbiAgICBpZiAoT2JqZWN0LnByb3RvdHlwZS50b1N0cmluZy5jYWxsKG9iaikgIT0gJ1tvYmplY3QgQXJyYXldJykge1xuICAgICAgICAgICAgcmV0dXJuICdDYW5ub3QgYXNzaWduIHNjYWxhciB0byBtYW55IHRvIG1hbnknO1xuICAgICAgICB9XG4gICAgcmV0dXJuIG51bGw7XG59XG5cbk1hbnlUb01hbnlQcm94eS5wcm90b3R5cGUuc2V0ID0gZnVuY3Rpb24gKG9iaikge1xuICAgIHByb3h5LmNoZWNrSW5zdGFsbGVkLmNhbGwodGhpcyk7XG4gICAgdmFyIHNlbGYgPSB0aGlzO1xuICAgIGlmIChvYmopIHtcbiAgICAgICAgdmFyIGVycm9yTWVzc2FnZTtcbiAgICAgICAgaWYgKGVycm9yTWVzc2FnZSA9IHZhbGlkYXRlLmNhbGwodGhpcywgb2JqKSkge1xuICAgICAgICAgICAgcmV0dXJuIGVycm9yTWVzc2FnZTtcbiAgICAgICAgfVxuICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgIHByb3h5LmNsZWFyUmV2ZXJzZVJlbGF0ZWQuY2FsbCh0aGlzKTtcbiAgICAgICAgICAgIHByb3h5LnNldC5jYWxsKHNlbGYsIG9iaik7XG4gICAgICAgICAgICB3cmFwQXJyYXkuY2FsbChzZWxmLCBvYmopO1xuICAgICAgICAgICAgcHJveHkuc2V0UmV2ZXJzZS5jYWxsKHNlbGYsIG9iaik7XG4gICAgICAgIH1cbiAgICB9XG4gICAgZWxzZSB7XG4gICAgICAgIHByb3h5LmNsZWFyUmV2ZXJzZVJlbGF0ZWQuY2FsbCh0aGlzKTtcbiAgICAgICAgcHJveHkuc2V0LmNhbGwoc2VsZiwgb2JqKTtcbiAgICB9XG59O1xuXG5NYW55VG9NYW55UHJveHkucHJvdG90eXBlLmluc3RhbGwgPSBmdW5jdGlvbiAob2JqKSB7XG4gICAgUmVsYXRpb25zaGlwUHJveHkucHJvdG90eXBlLmluc3RhbGwuY2FsbCh0aGlzLCBvYmopO1xuICAgIG9ialsgKCdzcGxpY2UnICsgdXRpbC5jYXBpdGFsaXNlRmlyc3RMZXR0ZXIodGhpcy5yZXZlcnNlTmFtZSkpXSA9IF8uYmluZChwcm94eS5zcGxpY2UsIHRoaXMpO1xufTtcblxuZXhwb3J0cy5NYW55VG9NYW55UHJveHkgPSBNYW55VG9NYW55UHJveHk7IiwiLyoqXG4gKiBAbW9kdWxlIG1hcHBpbmdcbiAqL1xuXG52YXIgbG9nID0gcmVxdWlyZSgnLi9vcGVyYXRpb24vbG9nJyk7XG52YXIgTG9nZ2VyID0gbG9nLmxvZ2dlcldpdGhOYW1lKCdNYXBwaW5nJyk7XG5Mb2dnZXIuc2V0TGV2ZWwobG9nLkxldmVsLndhcm4pO1xuXG52YXIgZGVmaW5lU3ViUHJvcGVydHkgPSByZXF1aXJlKCcuL21pc2MnKS5kZWZpbmVTdWJQcm9wZXJ0eTtcbnZhciBDb2xsZWN0aW9uUmVnaXN0cnkgPSByZXF1aXJlKCcuL2NvbGxlY3Rpb25SZWdpc3RyeScpLkNvbGxlY3Rpb25SZWdpc3RyeTtcbnZhciBJbnRlcm5hbFNpZXN0YUVycm9yID0gcmVxdWlyZSgnLi9lcnJvcicpLkludGVybmFsU2llc3RhRXJyb3I7XG52YXIgcmVsYXRpb25zaGlwID0gcmVxdWlyZSgnLi9yZWxhdGlvbnNoaXAnKTtcbnZhciBSZWxhdGlvbnNoaXBUeXBlID0gcmVsYXRpb25zaGlwLlJlbGF0aW9uc2hpcFR5cGU7XG52YXIgUXVlcnkgPSByZXF1aXJlKCcuL3F1ZXJ5JykuUXVlcnk7XG52YXIgT3BlcmF0aW9uID0gcmVxdWlyZSgnLi9vcGVyYXRpb24vb3BlcmF0aW9uJykuT3BlcmF0aW9uO1xudmFyIEJ1bGtNYXBwaW5nT3BlcmF0aW9uID0gcmVxdWlyZSgnLi9tYXBwaW5nT3BlcmF0aW9uJykuQnVsa01hcHBpbmdPcGVyYXRpb247XG52YXIgU2llc3RhTW9kZWwgPSByZXF1aXJlKCcuL29iamVjdCcpLlNpZXN0YU1vZGVsO1xudmFyIGd1aWQgPSByZXF1aXJlKCcuL21pc2MnKS5ndWlkO1xudmFyIGNhY2hlID0gcmVxdWlyZSgnLi9jYWNoZScpO1xudmFyIHN0b3JlID0gcmVxdWlyZSgnLi9zdG9yZScpO1xudmFyIGV4dGVuZCA9IHJlcXVpcmUoJ2V4dGVuZCcpO1xuXG52YXIgY29yZUNoYW5nZXMgPSByZXF1aXJlKCcuL2NoYW5nZXMnKTtcbnZhciBDaGFuZ2VUeXBlID0gY29yZUNoYW5nZXMuQ2hhbmdlVHlwZTtcbnZhciB3cmFwQXJyYXkgPSByZXF1aXJlKCcuL25vdGlmaWNhdGlvbkNlbnRyZScpLndyYXBBcnJheTtcblxudmFyIE9uZVRvTWFueVByb3h5ID0gcmVxdWlyZSgnLi9vbmVUb01hbnlQcm94eScpLk9uZVRvTWFueVByb3h5O1xudmFyIE9uZVRvT25lUHJveHkgPSByZXF1aXJlKCcuL29uZVRvT25lUHJveHknKS5PbmVUb09uZVByb3h5O1xudmFyIE1hbnlUb01hbnlQcm94eSA9IHJlcXVpcmUoJy4vbWFueVRvTWFueVByb3h5JykuTWFueVRvTWFueVByb3h5O1xuXG52YXIgdXRpbCA9IHJlcXVpcmUoJy4vdXRpbCcpO1xudmFyIF8gPSB1dGlsLl87XG5cbi8qKlxuICogXG4gKiBAcGFyYW0ge09iamVjdH0gb3B0c1xuICovXG5mdW5jdGlvbiBNYXBwaW5nKG9wdHMpIHtcbiAgICB2YXIgc2VsZiA9IHRoaXM7XG4gICAgdGhpcy5fb3B0cyA9IG9wdHM7XG5cbiAgICBPYmplY3QuZGVmaW5lUHJvcGVydHkodGhpcywgJ19maWVsZHMnLCB7XG4gICAgICAgIGdldDogZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICB2YXIgZmllbGRzID0gW107XG4gICAgICAgICAgICBpZiAoc2VsZi5fb3B0cy5pZCkge1xuICAgICAgICAgICAgICAgIGZpZWxkcy5wdXNoKHNlbGYuX29wdHMuaWQpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgaWYgKHNlbGYuX29wdHMuYXR0cmlidXRlcykge1xuICAgICAgICAgICAgICAgIF8uZWFjaChzZWxmLl9vcHRzLmF0dHJpYnV0ZXMsIGZ1bmN0aW9uKHgpIHtcbiAgICAgICAgICAgICAgICAgICAgZmllbGRzLnB1c2goeClcbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHJldHVybiBmaWVsZHM7XG4gICAgICAgIH0sXG4gICAgICAgIGVudW1lcmFibGU6IHRydWUsXG4gICAgICAgIGNvbmZpZ3VyYWJsZTogdHJ1ZVxuICAgIH0pO1xuXG4gICAgLyoqXG4gICAgICogQG5hbWUgdHlwZVxuICAgICAqIEB0eXBlIHtTdHJpbmd9XG4gICAgICovXG4gICAgZGVmaW5lU3ViUHJvcGVydHkuY2FsbCh0aGlzLCAndHlwZScsIHNlbGYuX29wdHMpO1xuXG4gICAgLyoqXG4gICAgICogQG5hbWUgaWRcbiAgICAgKiBAdHlwZSB7U3RyaW5nfVxuICAgICAqL1xuICAgIGRlZmluZVN1YlByb3BlcnR5LmNhbGwodGhpcywgJ2lkJywgc2VsZi5fb3B0cyk7XG4gICAgZGVmaW5lU3ViUHJvcGVydHkuY2FsbCh0aGlzLCAnY29sbGVjdGlvbicsIHNlbGYuX29wdHMpO1xuICAgIGRlZmluZVN1YlByb3BlcnR5LmNhbGwodGhpcywgJ2F0dHJpYnV0ZXMnLCBzZWxmLl9vcHRzKTtcbiAgICBkZWZpbmVTdWJQcm9wZXJ0eS5jYWxsKHRoaXMsICdyZWxhdGlvbnNoaXBzJywgc2VsZi5fb3B0cyk7XG4gICAgZGVmaW5lU3ViUHJvcGVydHkuY2FsbCh0aGlzLCAnaW5kZXhlcycsIHNlbGYuX29wdHMpO1xuICAgIGRlZmluZVN1YlByb3BlcnR5LmNhbGwodGhpcywgJ3N1YmNsYXNzJywgc2VsZi5fb3B0cyk7XG4gICAgZGVmaW5lU3ViUHJvcGVydHkuY2FsbCh0aGlzLCAnc2luZ2xldG9uJywgc2VsZi5fb3B0cyk7XG5cbiAgICBpZiAoIXRoaXMucmVsYXRpb25zaGlwcykge1xuICAgICAgICB0aGlzLnJlbGF0aW9uc2hpcHMgPSBbXTtcbiAgICB9XG5cbiAgICBpZiAoIXRoaXMuaW5kZXhlcykge1xuICAgICAgICB0aGlzLmluZGV4ZXMgPSBbXTtcbiAgICB9XG5cbiAgICB0aGlzLl92YWxpZGF0ZVN1YmNsYXNzKCk7XG5cbiAgICB0aGlzLl9pbnN0YWxsZWQgPSBmYWxzZTtcbiAgICB0aGlzLl9yZWxhdGlvbnNoaXBzSW5zdGFsbGVkID0gZmFsc2U7XG4gICAgdGhpcy5fcmV2ZXJzZVJlbGF0aW9uc2hpcHNJbnN0YWxsZWQgPSBmYWxzZTtcblxuICAgIE9iamVjdC5kZWZpbmVQcm9wZXJ0eSh0aGlzLCAnaW5zdGFsbGVkJywge1xuICAgICAgICBnZXQ6IGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgcmV0dXJuIHNlbGYuX2luc3RhbGxlZCAmJiBzZWxmLl9yZWxhdGlvbnNoaXBzSW5zdGFsbGVkICYmIHNlbGYuX3JldmVyc2VSZWxhdGlvbnNoaXBzSW5zdGFsbGVkO1xuICAgICAgICB9LFxuICAgICAgICBlbnVtZXJhYmxlOiB0cnVlLFxuICAgICAgICBjb25maWd1cmFibGU6IHRydWVcbiAgICB9KTtcblxufVxuXG4vKipcbiAqIEVuc3VyZSB0aGF0IGFueSBzdWJjbGFzc2VzIHBhc3NlZCB0byB0aGUgbWFwcGluZyBhcmUgdmFsaWQgYW5kIHdvcmtpbmcgY29ycmVjdGx5LlxuICogQHByaXZhdGVcbiAqL1xuTWFwcGluZy5wcm90b3R5cGUuX3ZhbGlkYXRlU3ViY2xhc3MgPSBmdW5jdGlvbigpIHtcbiAgICBpZiAodGhpcy5zdWJjbGFzcyAmJiB0aGlzLnN1YmNsYXNzICE9PSBTaWVzdGFNb2RlbCkge1xuICAgICAgICB2YXIgb2JqID0gbmV3IHRoaXMuc3ViY2xhc3ModGhpcyk7XG4gICAgICAgIGlmICghb2JqLm1hcHBpbmcpIHtcbiAgICAgICAgICAgIHRocm93IG5ldyBJbnRlcm5hbFNpZXN0YUVycm9yKCdTdWJjbGFzcyBmb3IgbWFwcGluZyBcIicgKyB0aGlzLnR5cGUgKyAnXCIgaGFzIG5vdCBiZWVuIGNvbmZpZ3VyZWQgY29ycmVjdGx5LiAnICtcbiAgICAgICAgICAgICAgICAnRGlkIHlvdSBjYWxsIHN1cGVyPycpO1xuICAgICAgICB9XG4gICAgICAgIGlmICh0aGlzLnN1YmNsYXNzLnByb3RvdHlwZSA9PSBTaWVzdGFNb2RlbC5wcm90b3R5cGUpIHtcbiAgICAgICAgICAgIHRocm93IG5ldyBJbnRlcm5hbFNpZXN0YUVycm9yKCdTdWJjbGFzcyBmb3IgbWFwcGluZyBcIicgKyB0aGlzLnR5cGUgKyAnXCIgaGFzIG5vdCBiZWVuIGNvbmZpZ3VyZWQgY29ycmVjdGx5LiAnICtcbiAgICAgICAgICAgICAgICAnWW91IHNob3VsZCB1c2UgT2JqZWN0LmNyZWF0ZSBvbiBTaWVzdGFNb2RlbCBwcm90b3R5cGUuJyk7XG4gICAgICAgIH1cbiAgICB9XG59O1xuXG5cbk1hcHBpbmcucHJvdG90eXBlLmluc3RhbGxSZWxhdGlvbnNoaXBzID0gZnVuY3Rpb24oKSB7XG4gICAgaWYgKCF0aGlzLl9yZWxhdGlvbnNoaXBzSW5zdGFsbGVkKSB7XG4gICAgICAgIHZhciBzZWxmID0gdGhpcztcbiAgICAgICAgc2VsZi5fcmVsYXRpb25zaGlwcyA9IFtdO1xuICAgICAgICBpZiAoc2VsZi5fb3B0cy5yZWxhdGlvbnNoaXBzKSB7XG4gICAgICAgICAgICBmb3IgKHZhciBuYW1lIGluIHNlbGYuX29wdHMucmVsYXRpb25zaGlwcykge1xuICAgICAgICAgICAgICAgIGlmIChMb2dnZXIuZGVidWcuaXNFbmFibGVkKVxuICAgICAgICAgICAgICAgICAgICBMb2dnZXIuZGVidWcoc2VsZi50eXBlICsgJzogY29uZmlndXJpbmcgcmVsYXRpb25zaGlwICcgKyBuYW1lKTtcbiAgICAgICAgICAgICAgICBpZiAoc2VsZi5fb3B0cy5yZWxhdGlvbnNoaXBzLmhhc093blByb3BlcnR5KG5hbWUpKSB7XG4gICAgICAgICAgICAgICAgICAgIHZhciByZWxhdGlvbnNoaXAgPSBzZWxmLl9vcHRzLnJlbGF0aW9uc2hpcHNbbmFtZV07XG4gICAgICAgICAgICAgICAgICAgIGlmIChyZWxhdGlvbnNoaXAudHlwZSA9PSBSZWxhdGlvbnNoaXBUeXBlLk9uZVRvTWFueSB8fFxuICAgICAgICAgICAgICAgICAgICAgICAgcmVsYXRpb25zaGlwLnR5cGUgPT0gUmVsYXRpb25zaGlwVHlwZS5PbmVUb09uZSB8fFxuICAgICAgICAgICAgICAgICAgICAgICAgcmVsYXRpb25zaGlwLnR5cGUgPT0gUmVsYXRpb25zaGlwVHlwZS5NYW55VG9NYW55KSB7XG4gICAgICAgICAgICAgICAgICAgICAgICB2YXIgbWFwcGluZ05hbWUgPSByZWxhdGlvbnNoaXAubWFwcGluZztcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmIChMb2dnZXIuZGVidWcuaXNFbmFibGVkKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIExvZ2dlci5kZWJ1ZygncmV2ZXJzZU1hcHBpbmdOYW1lJywgbWFwcGluZ05hbWUpO1xuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKCFzZWxmLmNvbGxlY3Rpb24pIHRocm93IG5ldyBJbnRlcm5hbFNpZXN0YUVycm9yKCdNYXBwaW5nIG11c3QgaGF2ZSBjb2xsZWN0aW9uJyk7XG4gICAgICAgICAgICAgICAgICAgICAgICB2YXIgY29sbGVjdGlvbiA9IENvbGxlY3Rpb25SZWdpc3RyeVtzZWxmLmNvbGxlY3Rpb25dO1xuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKCFjb2xsZWN0aW9uKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdGhyb3cgbmV3IEludGVybmFsU2llc3RhRXJyb3IoJ0NvbGxlY3Rpb24gJyArIHNlbGYuY29sbGVjdGlvbiArICcgbm90IHJlZ2lzdGVyZWQnKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgIHZhciByZXZlcnNlTWFwcGluZyA9IGNvbGxlY3Rpb25bbWFwcGluZ05hbWVdO1xuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKCFyZXZlcnNlTWFwcGluZykge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHZhciBhcnIgPSBtYXBwaW5nTmFtZS5zcGxpdCgnLicpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmIChhcnIubGVuZ3RoID09IDIpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdmFyIGNvbGxlY3Rpb25OYW1lID0gYXJyWzBdO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBtYXBwaW5nTmFtZSA9IGFyclsxXTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdmFyIG90aGVyQ29sbGVjdGlvbiA9IENvbGxlY3Rpb25SZWdpc3RyeVtjb2xsZWN0aW9uTmFtZV07XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmICghb3RoZXJDb2xsZWN0aW9uKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB2YXIgZXJyID0gJ0NvbGxlY3Rpb24gd2l0aCBuYW1lIFwiJyArIGNvbGxlY3Rpb25OYW1lICsgJ1wiIGRvZXMgbm90IGV4aXN0Lic7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb25zb2xlLmVycm9yKGVyciwge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJlZ2lzdHJ5OiBDb2xsZWN0aW9uUmVnaXN0cnlcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGVycjtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXZlcnNlTWFwcGluZyA9IG90aGVyQ29sbGVjdGlvblttYXBwaW5nTmFtZV07XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKExvZ2dlci5kZWJ1Zy5pc0VuYWJsZWQpXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgTG9nZ2VyLmRlYnVnKCdyZXZlcnNlTWFwcGluZycsIHJldmVyc2VNYXBwaW5nKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmIChyZXZlcnNlTWFwcGluZykge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJlbGF0aW9uc2hpcC5yZXZlcnNlTWFwcGluZyA9IHJldmVyc2VNYXBwaW5nO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJlbGF0aW9uc2hpcC5mb3J3YXJkTWFwcGluZyA9IHRoaXM7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcmVsYXRpb25zaGlwLmZvcndhcmROYW1lID0gbmFtZTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICByZWxhdGlvbnNoaXAucmV2ZXJzZU5hbWUgPSByZWxhdGlvbnNoaXAucmV2ZXJzZTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICByZWxhdGlvbnNoaXAuaXNSZXZlcnNlID0gZmFsc2U7XG4gICAgICAgICAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiAnTWFwcGluZyB3aXRoIG5hbWUgXCInICsgbWFwcGluZ05hbWUudG9TdHJpbmcoKSArICdcIiBkb2VzIG5vdCBleGlzdCc7XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gJ1JlbGF0aW9uc2hpcCB0eXBlICcgKyByZWxhdGlvbnNoaXAudHlwZSArICcgZG9lcyBub3QgZXhpc3QnO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIHRoaXMuX3JlbGF0aW9uc2hpcHNJbnN0YWxsZWQgPSB0cnVlO1xuICAgIH0gZWxzZSB7XG4gICAgICAgIHRocm93IG5ldyBJbnRlcm5hbFNpZXN0YUVycm9yKCdSZWxhdGlvbnNoaXBzIGZvciBcIicgKyB0aGlzLnR5cGUgKyAnXCIgaGF2ZSBhbHJlYWR5IGJlZW4gaW5zdGFsbGVkJyk7XG4gICAgfVxuICAgIHJldHVybiBudWxsO1xufTtcblxuTWFwcGluZy5wcm90b3R5cGUuaW5zdGFsbFJldmVyc2VSZWxhdGlvbnNoaXBzID0gZnVuY3Rpb24oKSB7XG4gICAgaWYgKCF0aGlzLl9yZXZlcnNlUmVsYXRpb25zaGlwc0luc3RhbGxlZCkge1xuICAgICAgICBmb3IgKHZhciBmb3J3YXJkTmFtZSBpbiB0aGlzLnJlbGF0aW9uc2hpcHMpIHtcbiAgICAgICAgICAgIGlmICh0aGlzLnJlbGF0aW9uc2hpcHMuaGFzT3duUHJvcGVydHkoZm9yd2FyZE5hbWUpKSB7XG4gICAgICAgICAgICAgICAgdmFyIHJlbGF0aW9uc2hpcCA9IHRoaXMucmVsYXRpb25zaGlwc1tmb3J3YXJkTmFtZV07XG4gICAgICAgICAgICAgICAgcmVsYXRpb25zaGlwID0gZXh0ZW5kKHRydWUsIHt9LCByZWxhdGlvbnNoaXApO1xuICAgICAgICAgICAgICAgIHJlbGF0aW9uc2hpcC5pc1JldmVyc2UgPSB0cnVlO1xuICAgICAgICAgICAgICAgIHZhciByZXZlcnNlTWFwcGluZyA9IHJlbGF0aW9uc2hpcC5yZXZlcnNlTWFwcGluZztcbiAgICAgICAgICAgICAgICB2YXIgcmV2ZXJzZU5hbWUgPSByZWxhdGlvbnNoaXAucmV2ZXJzZU5hbWU7XG4gICAgICAgICAgICAgICAgaWYgKExvZ2dlci5kZWJ1Zy5pc0VuYWJsZWQpXG4gICAgICAgICAgICAgICAgICAgIExvZ2dlci5kZWJ1ZyhzZWxmLnR5cGUgKyAnOiBjb25maWd1cmluZyAgcmV2ZXJzZSByZWxhdGlvbnNoaXAgJyArIG5hbWUpO1xuICAgICAgICAgICAgICAgIHJldmVyc2VNYXBwaW5nLnJlbGF0aW9uc2hpcHNbcmV2ZXJzZU5hbWVdID0gcmVsYXRpb25zaGlwO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIHRoaXMuX3JldmVyc2VSZWxhdGlvbnNoaXBzSW5zdGFsbGVkID0gdHJ1ZTtcbiAgICB9IGVsc2Uge1xuICAgICAgICB0aHJvdyBuZXcgSW50ZXJuYWxTaWVzdGFFcnJvcignUmV2ZXJzZSByZWxhdGlvbnNoaXBzIGZvciBcIicgKyB0aGlzLnR5cGUgKyAnXCIgaGF2ZSBhbHJlYWR5IGJlZW4gaW5zdGFsbGVkLicpO1xuICAgIH1cbn07XG5cbk1hcHBpbmcucHJvdG90eXBlLnF1ZXJ5ID0gZnVuY3Rpb24ocXVlcnksIGNhbGxiYWNrKSB7XG4gICAgdmFyIGRlZmVycmVkID0gd2luZG93LnEgPyB3aW5kb3cucS5kZWZlcigpIDogbnVsbDtcbiAgICBjYWxsYmFjayA9IHV0aWwuY29uc3RydWN0Q2FsbGJhY2tBbmRQcm9taXNlSGFuZGxlcihjYWxsYmFjaywgZGVmZXJyZWQpO1xuICAgIHZhciBfcXVlcnkgPSBuZXcgUXVlcnkodGhpcywgcXVlcnkpO1xuICAgIF9xdWVyeS5leGVjdXRlKGNhbGxiYWNrKTtcbiAgICByZXR1cm4gZGVmZXJyZWQgPyBkZWZlcnJlZC5wcm9taXNlIDogbnVsbDtcbn07XG5cbk1hcHBpbmcucHJvdG90eXBlLmdldCA9IGZ1bmN0aW9uKGlkT3JDYWxsYmFjaywgY2FsbGJhY2spIHtcbiAgICB2YXIgZGVmZXJyZWQgPSB3aW5kb3cucSA/IHdpbmRvdy5xLmRlZmVyKCkgOiBudWxsO1xuICAgIGNhbGxiYWNrID0gdXRpbC5jb25zdHJ1Y3RDYWxsYmFja0FuZFByb21pc2VIYW5kbGVyKGNhbGxiYWNrLCBkZWZlcnJlZCk7XG5cbiAgICBmdW5jdGlvbiBmaW5pc2goZXJyLCByZXMpIHtcbiAgICAgICAgaWYgKGNhbGxiYWNrKSBjYWxsYmFjayhlcnIsIHJlcyk7XG4gICAgfVxuXG4gICAgaWYgKHRoaXMuc2luZ2xldG9uKSB7XG4gICAgICAgIGlmICh0eXBlb2YgaWRPckNhbGxiYWNrID09ICdmdW5jdGlvbicpIHtcbiAgICAgICAgICAgIGNhbGxiYWNrID0gaWRPckNhbGxiYWNrO1xuICAgICAgICB9XG4gICAgICAgIHRoaXMuYWxsKGZ1bmN0aW9uKGVyciwgb2Jqcykge1xuICAgICAgICAgICAgaWYgKGVycikgZmluaXNoKGVycik7XG4gICAgICAgICAgICBpZiAob2Jqcy5sZW5ndGggPiAxKSB7XG4gICAgICAgICAgICAgICAgdGhyb3cgbmV3IEludGVybmFsU2llc3RhRXJyb3IoJ1NvbWVob3cgbW9yZSB0aGFuIG9uZSBvYmplY3QgaGFzIGJlZW4gY3JlYXRlZCBmb3IgYSBzaW5nbGV0b24gbWFwcGluZyEgJyArXG4gICAgICAgICAgICAgICAgICAgICdUaGlzIGlzIGEgc2VyaW91cyBlcnJvciwgcGxlYXNlIGZpbGUgYSBidWcgcmVwb3J0LicpO1xuICAgICAgICAgICAgfSBlbHNlIGlmIChvYmpzLmxlbmd0aCkge1xuICAgICAgICAgICAgICAgIGZpbmlzaChudWxsLCBvYmpzWzBdKTtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgZmluaXNoKG51bGwsIG9ianNbMF0pO1xuICAgICAgICAgICAgfVxuICAgICAgICB9KTtcbiAgICB9IGVsc2Uge1xuICAgICAgICB2YXIgb3B0cyA9IHt9O1xuICAgICAgICBvcHRzW3RoaXMuaWRdID0gaWRPckNhbGxiYWNrO1xuICAgICAgICBvcHRzLm1hcHBpbmcgPSB0aGlzO1xuICAgICAgICB2YXIgb2JqID0gY2FjaGUuZ2V0KG9wdHMpO1xuICAgICAgICBpZiAob2JqKSB7XG4gICAgICAgICAgICBmaW5pc2gobnVsbCwgb2JqKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIGRlbGV0ZSBvcHRzLm1hcHBpbmc7XG4gICAgICAgICAgICB2YXIgcXVlcnkgPSBuZXcgUXVlcnkodGhpcywgb3B0cyk7XG4gICAgICAgICAgICBxdWVyeS5leGVjdXRlKGZ1bmN0aW9uKGVyciwgcm93cykge1xuICAgICAgICAgICAgICAgIHZhciBvYmogPSBudWxsO1xuICAgICAgICAgICAgICAgIGlmICghZXJyICYmIHJvd3MubGVuZ3RoKSB7XG4gICAgICAgICAgICAgICAgICAgIGlmIChyb3dzLmxlbmd0aCA+IDEpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGVyciA9ICdNb3JlIHRoYW4gb25lIG9iamVjdCB3aXRoIGlkPScgKyBpZE9yQ2FsbGJhY2sudG9TdHJpbmcoKTtcbiAgICAgICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIG9iaiA9IHJvd3NbMF07XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgZmluaXNoKGVyciwgb2JqKTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9XG5cbiAgICB9XG4gICAgcmV0dXJuIGRlZmVycmVkID8gZGVmZXJyZWQucHJvbWlzZSA6IG51bGw7XG59O1xuXG5NYXBwaW5nLnByb3RvdHlwZS5hbGwgPSBmdW5jdGlvbihjYWxsYmFjaykge1xuICAgIHZhciBkZWZlcnJlZCA9IHdpbmRvdy5xID8gd2luZG93LnEuZGVmZXIoKSA6IG51bGw7XG4gICAgY2FsbGJhY2sgPSB1dGlsLmNvbnN0cnVjdENhbGxiYWNrQW5kUHJvbWlzZUhhbmRsZXIoY2FsbGJhY2ssIGRlZmVycmVkKTtcbiAgICB2YXIgcXVlcnkgPSBuZXcgUXVlcnkodGhpcywge30pO1xuICAgIHF1ZXJ5LmV4ZWN1dGUoY2FsbGJhY2spO1xuICAgIHJldHVybiBkZWZlcnJlZCA/IGRlZmVycmVkLnByb21pc2UgOiBudWxsO1xufTtcblxuTWFwcGluZy5wcm90b3R5cGUuaW5zdGFsbCA9IGZ1bmN0aW9uKGNhbGxiYWNrKSB7XG4gICAgaWYgKExvZ2dlci5pbmZvLmlzRW5hYmxlZCkgTG9nZ2VyLmluZm8oJ0luc3RhbGxpbmcgbWFwcGluZyAnICsgdGhpcy50eXBlKTtcbiAgICB2YXIgZGVmZXJyZWQgPSB3aW5kb3cucSA/IHdpbmRvdy5xLmRlZmVyKCkgOiBudWxsO1xuICAgIGNhbGxiYWNrID0gdXRpbC5jb25zdHJ1Y3RDYWxsYmFja0FuZFByb21pc2VIYW5kbGVyKGNhbGxiYWNrLCBkZWZlcnJlZCk7XG4gICAgaWYgKCF0aGlzLl9pbnN0YWxsZWQpIHtcbiAgICAgICAgdmFyIGVycm9ycyA9IHRoaXMuX3ZhbGlkYXRlKCk7XG4gICAgICAgIHRoaXMuX2luc3RhbGxlZCA9IHRydWU7XG4gICAgICAgIGlmIChMb2dnZXIuaW5mby5pc0VuYWJsZWQpIHtcbiAgICAgICAgICAgIGlmIChlcnJvcnMubGVuZ3RoKSBMb2dnZXIuZXJyb3IoJ0Vycm9ycyBpbnN0YWxsaW5nIG1hcHBpbmcgJyArIHRoaXMudHlwZSArICc6ICcgKyBlcnJvcnMpO1xuICAgICAgICAgICAgZWxzZSBMb2dnZXIuaW5mbygnSW5zdGFsbGVkIG1hcHBpbmcgJyArIHRoaXMudHlwZSk7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKGNhbGxiYWNrKSBjYWxsYmFjayhlcnJvcnMubGVuZ3RoID8gZXJyb3JzIDogbnVsbCk7XG4gICAgfSBlbHNlIHtcbiAgICAgICAgdGhyb3cgbmV3IEludGVybmFsU2llc3RhRXJyb3IoJ01hcHBpbmcgXCInICsgdGhpcy50eXBlICsgJ1wiIGhhcyBhbHJlYWR5IGJlZW4gaW5zdGFsbGVkJyk7XG4gICAgfVxuICAgIHJldHVybiBkZWZlcnJlZCA/IGRlZmVycmVkLnByb21pc2UgOiBudWxsO1xufTtcblxuTWFwcGluZy5wcm90b3R5cGUuX3ZhbGlkYXRlID0gZnVuY3Rpb24oKSB7XG4gICAgdmFyIGVycm9ycyA9IFtdO1xuICAgIGlmICghdGhpcy50eXBlKSB7XG4gICAgICAgIGVycm9ycy5wdXNoKCdNdXN0IHNwZWNpZnkgYSB0eXBlJyk7XG4gICAgfVxuICAgIGlmICghdGhpcy5jb2xsZWN0aW9uKSB7XG4gICAgICAgIGVycm9ycy5wdXNoKCdBIG1hcHBpbmcgbXVzdCBiZWxvbmcgdG8gYW4gY29sbGVjdGlvbicpO1xuICAgIH1cbiAgICByZXR1cm4gZXJyb3JzO1xufTtcblxuXG4vKipcbiAqIE1hcCBkYXRhIGludG8gU2llc3RhLlxuICpcbiAqIEBwYXJhbSBkYXRhIFJhdyBkYXRhIHJlY2VpdmVkIHJlbW90ZWx5IG9yIG90aGVyd2lzZVxuICogQHBhcmFtIGNhbGxiYWNrIENhbGxlZCBvbmNlIHBvdWNoIHBlcnNpc3RlbmNlIHJldHVybnMuXG4gKiBAcGFyYW0gb3ZlcnJpZGUgRm9yY2UgbWFwcGluZyB0byB0aGlzIG9iamVjdFxuICovXG5NYXBwaW5nLnByb3RvdHlwZS5tYXAgPSBmdW5jdGlvbihkYXRhLCBjYWxsYmFjaywgb3ZlcnJpZGUpIHtcbiAgICB2YXIgZGVmZXJyZWQgPSB3aW5kb3cucSA/IHdpbmRvdy5xLmRlZmVyKCkgOiBudWxsO1xuICAgIGNhbGxiYWNrID0gdXRpbC5jb25zdHJ1Y3RDYWxsYmFja0FuZFByb21pc2VIYW5kbGVyKGNhbGxiYWNrLCBkZWZlcnJlZCk7XG4gICAgaWYgKHRoaXMuaW5zdGFsbGVkKSB7XG4gICAgICAgIGlmICh1dGlsLmlzQXJyYXkoZGF0YSkpIHtcbiAgICAgICAgICAgIHRoaXMuX21hcEJ1bGsoZGF0YSwgY2FsbGJhY2ssIG92ZXJyaWRlKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHRoaXMuX21hcEJ1bGsoW2RhdGFdLCBmdW5jdGlvbihlcnIsIG9iamVjdHMpIHtcbiAgICAgICAgICAgICAgICBpZiAoY2FsbGJhY2spIHtcbiAgICAgICAgICAgICAgICAgICAgdmFyIG9iajtcbiAgICAgICAgICAgICAgICAgICAgaWYgKG9iamVjdHMpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmIChvYmplY3RzLmxlbmd0aCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIG9iaiA9IG9iamVjdHNbMF07XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgY2FsbGJhY2soZXJyID8gZXJyWzBdIDogbnVsbCwgb2JqKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9LCBvdmVycmlkZSA/IFtvdmVycmlkZV0gOiB1bmRlZmluZWQpO1xuICAgICAgICB9XG4gICAgfSBlbHNlIHtcbiAgICAgICAgdGhyb3cgbmV3IEludGVybmFsU2llc3RhRXJyb3IoJ01hcHBpbmcgbXVzdCBiZSBmdWxseSBpbnN0YWxsZWQgYmVmb3JlIGNyZWF0aW5nIGFueSBtb2RlbHMnKTtcbiAgICB9XG4gICAgcmV0dXJuIGRlZmVycmVkID8gZGVmZXJyZWQucHJvbWlzZSA6IG51bGw7XG59O1xuXG5NYXBwaW5nLnByb3RvdHlwZS5fbWFwQnVsayA9IGZ1bmN0aW9uKGRhdGEsIGNhbGxiYWNrLCBvdmVycmlkZSkge1xuICAgIHZhciBkZWZlcnJlZCA9IHdpbmRvdy5xID8gd2luZG93LnEuZGVmZXIoKSA6IG51bGw7XG4gICAgY2FsbGJhY2sgPSB1dGlsLmNvbnN0cnVjdENhbGxiYWNrQW5kUHJvbWlzZUhhbmRsZXIoY2FsbGJhY2ssIGRlZmVycmVkKTtcbiAgICB2YXIgb3B0cyA9IHtcbiAgICAgICAgbWFwcGluZzogdGhpcyxcbiAgICAgICAgZGF0YTogZGF0YVxuICAgIH07XG4gICAgaWYgKG92ZXJyaWRlKSBvcHRzLm9iamVjdHMgPSBvdmVycmlkZTtcbiAgICB2YXIgb3AgPSBuZXcgQnVsa01hcHBpbmdPcGVyYXRpb24ob3B0cyk7XG4gICAgb3Aub25Db21wbGV0aW9uKGZ1bmN0aW9uKCkge1xuICAgICAgICB2YXIgZXJyID0gb3AuZXJyb3I7XG4gICAgICAgIGlmIChlcnIpIHtcbiAgICAgICAgICAgIGlmIChjYWxsYmFjaykgY2FsbGJhY2soZXJyKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHZhciBvYmplY3RzID0gb3AucmVzdWx0O1xuICAgICAgICAgICAgY2FsbGJhY2sobnVsbCwgb2JqZWN0cyk7XG4gICAgICAgIH1cbiAgICB9KTtcbiAgICBvcC5zdGFydCgpO1xuICAgIHJldHVybiBkZWZlcnJlZCA/IGRlZmVycmVkLnByb21pc2UgOiBudWxsO1xufTtcblxuZnVuY3Rpb24gX2NvdW50Q2FjaGUoKSB7XG4gICAgdmFyIGNvbGxDYWNoZSA9IGNhY2hlLl9sb2NhbENhY2hlQnlUeXBlW3RoaXMuY29sbGVjdGlvbl0gfHwge307XG4gICAgdmFyIG1hcHBpbmdDYWNoZSA9IGNvbGxDYWNoZVt0aGlzLnR5cGVdIHx8IHt9O1xuICAgIHJldHVybiBfLnJlZHVjZShPYmplY3Qua2V5cyhtYXBwaW5nQ2FjaGUpLCBmdW5jdGlvbihtLCBfaWQpIHtcbiAgICAgICAgbVtfaWRdID0ge307XG4gICAgICAgIHJldHVybiBtO1xuICAgIH0sIHt9KTtcbn1cblxuTWFwcGluZy5wcm90b3R5cGUuY291bnQgPSBmdW5jdGlvbihjYWxsYmFjaykge1xuICAgIHZhciBkZWZlcnJlZCA9IHdpbmRvdy5xID8gd2luZG93LnEuZGVmZXIoKSA6IG51bGw7XG4gICAgY2FsbGJhY2sgPSB1dGlsLmNvbnN0cnVjdENhbGxiYWNrQW5kUHJvbWlzZUhhbmRsZXIoY2FsbGJhY2ssIGRlZmVycmVkKTtcbiAgICB2YXIgaGFzaCA9IF9jb3VudENhY2hlLmNhbGwodGhpcyk7XG4gICAgaWYgKHNpZXN0YS5leHQuc3RvcmFnZUVuYWJsZWQpIHtcbiAgICAgICAgdmFyIHBvdWNoID0gc2llc3RhLmV4dC5zdG9yYWdlLlBvdWNoLmdldFBvdWNoKCk7XG4gICAgICAgIHZhciBpbmRleE5hbWUgPSAobmV3IHNpZXN0YS5leHQuc3RvcmFnZS5JbmRleCh0aGlzLmNvbGxlY3Rpb24sIHRoaXMudHlwZSkpLl9nZXROYW1lKCkgKyAnXyc7XG4gICAgICAgIHBvdWNoLnF1ZXJ5KGluZGV4TmFtZSwge1xuICAgICAgICAgICAgaW5jbHVkZV9kb2NzOiBmYWxzZVxuICAgICAgICB9LCBmdW5jdGlvbihlcnIsIHJlc3ApIHtcbiAgICAgICAgICAgIHZhciBuO1xuICAgICAgICAgICAgaWYgKCFlcnIpIHtcbiAgICAgICAgICAgICAgICBfLmVhY2goXy5wbHVjayhyZXNwLnJvd3MsICdpZCcpLCBmdW5jdGlvbihpZCkge1xuICAgICAgICAgICAgICAgICAgICBoYXNoW2lkXSA9IHt9O1xuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgIG4gPSBPYmplY3Qua2V5cyhoYXNoKS5sZW5ndGg7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBjYWxsYmFjayhlcnIsIG4pO1xuICAgICAgICB9KTtcbiAgICB9IGVsc2Uge1xuICAgICAgICBjYWxsYmFjayhudWxsLCBPYmplY3Qua2V5cyhoYXNoKS5sZW5ndGgpXG4gICAgfVxuICAgIHJldHVybiBkZWZlcnJlZCA/IGRlZmVycmVkLnByb21pc2UgOiBudWxsO1xufTtcblxuLyoqXG4gKiBDb252ZXJ0IHJhdyBkYXRhIGludG8gYSBTaWVzdGFNb2RlbFxuICogQHJldHVybnMge1NpZXN0YU1vZGVsfVxuICogQHByaXZhdGVcbiAqL1xuTWFwcGluZy5wcm90b3R5cGUuX25ldyA9IGZ1bmN0aW9uKGRhdGEpIHtcbiAgICBpZiAodGhpcy5pbnN0YWxsZWQpIHtcbiAgICAgICAgdmFyIHNlbGYgPSB0aGlzO1xuICAgICAgICB2YXIgX2lkO1xuICAgICAgICBpZiAoZGF0YSkge1xuICAgICAgICAgICAgX2lkID0gZGF0YS5faWQgPyBkYXRhLl9pZCA6IGd1aWQoKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIF9pZCA9IGd1aWQoKTtcbiAgICAgICAgfVxuICAgICAgICB2YXIgbmV3TW9kZWw7XG4gICAgICAgIGlmICh0aGlzLnN1YmNsYXNzKSB7XG4gICAgICAgICAgICBuZXdNb2RlbCA9IG5ldyB0aGlzLnN1YmNsYXNzKHRoaXMpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgbmV3TW9kZWwgPSBuZXcgU2llc3RhTW9kZWwodGhpcyk7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKExvZ2dlci5pbmZvLmlzRW5hYmxlZClcbiAgICAgICAgICAgIExvZ2dlci5pbmZvKCdOZXcgb2JqZWN0IGNyZWF0ZWQgX2lkPVwiJyArIF9pZC50b1N0cmluZygpICsgJ1wiLCB0eXBlPScgKyB0aGlzLnR5cGUsIGRhdGEpO1xuICAgICAgICBuZXdNb2RlbC5faWQgPSBfaWQ7XG4gICAgICAgIC8vIFBsYWNlIGF0dHJpYnV0ZXMgb24gdGhlIG9iamVjdC5cbiAgICAgICAgbmV3TW9kZWwuX192YWx1ZXMgPSBkYXRhIHx8IHt9O1xuICAgICAgICB2YXIgZmllbGRzID0gdGhpcy5fZmllbGRzO1xuICAgICAgICB2YXIgaWR4ID0gZmllbGRzLmluZGV4T2YodGhpcy5pZCk7XG4gICAgICAgIGlmIChpZHggPiAtMSkge1xuICAgICAgICAgICAgZmllbGRzLnNwbGljZShpZHgsIDEpO1xuICAgICAgICB9XG4gICAgICAgIF8uZWFjaChmaWVsZHMsIGZ1bmN0aW9uKGZpZWxkKSB7XG4gICAgICAgICAgICBPYmplY3QuZGVmaW5lUHJvcGVydHkobmV3TW9kZWwsIGZpZWxkLCB7XG4gICAgICAgICAgICAgICAgZ2V0OiBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIG5ld01vZGVsLl9fdmFsdWVzW2ZpZWxkXSB8fCBudWxsO1xuICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgc2V0OiBmdW5jdGlvbih2KSB7XG4gICAgICAgICAgICAgICAgICAgIHZhciBvbGQgPSBuZXdNb2RlbC5fX3ZhbHVlc1tmaWVsZF07XG4gICAgICAgICAgICAgICAgICAgIG5ld01vZGVsLl9fdmFsdWVzW2ZpZWxkXSA9IHY7XG4gICAgICAgICAgICAgICAgICAgIGNvcmVDaGFuZ2VzLnJlZ2lzdGVyQ2hhbmdlKHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbGxlY3Rpb246IHNlbGYuY29sbGVjdGlvbixcbiAgICAgICAgICAgICAgICAgICAgICAgIG1hcHBpbmc6IHNlbGYudHlwZSxcbiAgICAgICAgICAgICAgICAgICAgICAgIF9pZDogbmV3TW9kZWwuX2lkLFxuICAgICAgICAgICAgICAgICAgICAgICAgbmV3OiB2LFxuICAgICAgICAgICAgICAgICAgICAgICAgb2xkOiBvbGQsXG4gICAgICAgICAgICAgICAgICAgICAgICB0eXBlOiBDaGFuZ2VUeXBlLlNldCxcbiAgICAgICAgICAgICAgICAgICAgICAgIGZpZWxkOiBmaWVsZCxcbiAgICAgICAgICAgICAgICAgICAgICAgIG9iajogbmV3TW9kZWxcbiAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgICAgIGlmICh1dGlsLmlzQXJyYXkodikpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHdyYXBBcnJheSh2LCBmaWVsZCwgbmV3TW9kZWwpO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICBlbnVtZXJhYmxlOiB0cnVlLFxuICAgICAgICAgICAgICAgIGNvbmZpZ3VyYWJsZTogdHJ1ZVxuICAgICAgICAgICAgfSk7XG4gICAgICAgIH0pO1xuXG4gICAgICAgIE9iamVjdC5kZWZpbmVQcm9wZXJ0eShuZXdNb2RlbCwgdGhpcy5pZCwge1xuICAgICAgICAgICAgZ2V0OiBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gbmV3TW9kZWwuX192YWx1ZXNbc2VsZi5pZF0gfHwgbnVsbDtcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICBzZXQ6IGZ1bmN0aW9uKHYpIHtcbiAgICAgICAgICAgICAgICB2YXIgb2xkID0gbmV3TW9kZWxbc2VsZi5pZF07XG4gICAgICAgICAgICAgICAgbmV3TW9kZWwuX192YWx1ZXNbc2VsZi5pZF0gPSB2O1xuICAgICAgICAgICAgICAgIGNvcmVDaGFuZ2VzLnJlZ2lzdGVyQ2hhbmdlKHtcbiAgICAgICAgICAgICAgICAgICAgY29sbGVjdGlvbjogc2VsZi5jb2xsZWN0aW9uLFxuICAgICAgICAgICAgICAgICAgICBtYXBwaW5nOiBzZWxmLnR5cGUsXG4gICAgICAgICAgICAgICAgICAgIF9pZDogbmV3TW9kZWwuX2lkLFxuICAgICAgICAgICAgICAgICAgICBuZXc6IHYsXG4gICAgICAgICAgICAgICAgICAgIG9sZDogb2xkLFxuICAgICAgICAgICAgICAgICAgICB0eXBlOiBDaGFuZ2VUeXBlLlNldCxcbiAgICAgICAgICAgICAgICAgICAgZmllbGQ6IHNlbGYuaWQsXG4gICAgICAgICAgICAgICAgICAgIG9iajogbmV3TW9kZWxcbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICBjYWNoZS5yZW1vdGVJbnNlcnQobmV3TW9kZWwsIHYsIG9sZCk7XG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgZW51bWVyYWJsZTogdHJ1ZSxcbiAgICAgICAgICAgIGNvbmZpZ3VyYWJsZTogdHJ1ZVxuICAgICAgICB9KTtcblxuXG4gICAgICAgIGZvciAodmFyIG5hbWUgaW4gdGhpcy5yZWxhdGlvbnNoaXBzKSB7XG4gICAgICAgICAgICB2YXIgcHJveHk7XG4gICAgICAgICAgICBpZiAodGhpcy5yZWxhdGlvbnNoaXBzLmhhc093blByb3BlcnR5KG5hbWUpKSB7XG4gICAgICAgICAgICAgICAgdmFyIHJlbGF0aW9uc2hpcCA9IHRoaXMucmVsYXRpb25zaGlwc1tuYW1lXTtcbiAgICAgICAgICAgICAgICBpZiAocmVsYXRpb25zaGlwLnR5cGUgPT0gUmVsYXRpb25zaGlwVHlwZS5PbmVUb01hbnkpIHtcbiAgICAgICAgICAgICAgICAgICAgcHJveHkgPSBuZXcgT25lVG9NYW55UHJveHkocmVsYXRpb25zaGlwKTtcbiAgICAgICAgICAgICAgICB9IGVsc2UgaWYgKHJlbGF0aW9uc2hpcC50eXBlID09IFJlbGF0aW9uc2hpcFR5cGUuT25lVG9PbmUpIHtcbiAgICAgICAgICAgICAgICAgICAgcHJveHkgPSBuZXcgT25lVG9PbmVQcm94eShyZWxhdGlvbnNoaXApO1xuICAgICAgICAgICAgICAgIH0gZWxzZSBpZiAocmVsYXRpb25zaGlwLnR5cGUgPT0gUmVsYXRpb25zaGlwVHlwZS5NYW55VG9NYW55KSB7XG4gICAgICAgICAgICAgICAgICAgIHByb3h5ID0gbmV3IE1hbnlUb01hbnlQcm94eShyZWxhdGlvbnNoaXApO1xuICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgIHRocm93IG5ldyBJbnRlcm5hbFNpZXN0YUVycm9yKCdObyBzdWNoIHJlbGF0aW9uc2hpcCB0eXBlOiAnICsgcmVsYXRpb25zaGlwLnR5cGUpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHByb3h5Lmluc3RhbGwobmV3TW9kZWwpO1xuICAgICAgICAgICAgcHJveHkuaXNGYXVsdCA9IGZhbHNlO1xuICAgICAgICB9XG4gICAgICAgIGNhY2hlLmluc2VydChuZXdNb2RlbCk7XG4gICAgICAgIGNvcmVDaGFuZ2VzLnJlZ2lzdGVyQ2hhbmdlKHtcbiAgICAgICAgICAgIGNvbGxlY3Rpb246IHRoaXMuY29sbGVjdGlvbixcbiAgICAgICAgICAgIG1hcHBpbmc6IHRoaXMudHlwZSxcbiAgICAgICAgICAgIF9pZDogbmV3TW9kZWwuX2lkLFxuICAgICAgICAgICAgbmV3SWQ6IG5ld01vZGVsLl9pZCxcbiAgICAgICAgICAgIG5ldzogbmV3TW9kZWwsXG4gICAgICAgICAgICB0eXBlOiBDaGFuZ2VUeXBlLk5ldyxcbiAgICAgICAgICAgIG9iajogbmV3TW9kZWxcbiAgICAgICAgfSk7XG4gICAgICAgIHJldHVybiBuZXdNb2RlbDtcbiAgICB9IGVsc2Uge1xuICAgICAgICB1dGlsLnByaW50U3RhY2tUcmFjZSgpO1xuICAgICAgICB0aHJvdyBuZXcgSW50ZXJuYWxTaWVzdGFFcnJvcignTWFwcGluZyBtdXN0IGJlIGZ1bGx5IGluc3RhbGxlZCBiZWZvcmUgY3JlYXRpbmcgYW55IG1vZGVscycpO1xuICAgIH1cblxufTtcblxuTWFwcGluZy5wcm90b3R5cGUuX2R1bXAgPSBmdW5jdGlvbihhc0pTT04pIHtcbiAgICB2YXIgZHVtcGVkID0ge307XG4gICAgZHVtcGVkLm5hbWUgPSB0aGlzLnR5cGU7XG4gICAgZHVtcGVkLmF0dHJpYnV0ZXMgPSB0aGlzLmF0dHJpYnV0ZXM7XG4gICAgZHVtcGVkLmlkID0gdGhpcy5pZDtcbiAgICBkdW1wZWQuY29sbGVjdGlvbiA9IHRoaXMuY29sbGVjdGlvbjtcbiAgICBkdW1wZWQucmVsYXRpb25zaGlwcyA9IF8ubWFwKHRoaXMucmVsYXRpb25zaGlwcywgZnVuY3Rpb24ocikge1xuICAgICAgICByZXR1cm4gci5pc0ZvcndhcmQgPyByLmZvcndhcmROYW1lIDogci5yZXZlcnNlTmFtZTtcbiAgICB9KTtcbiAgICByZXR1cm4gYXNKU09OID8gSlNPTi5zdHJpbmdpZnkoZHVtcGVkLCBudWxsLCA0KSA6IGR1bXBlZDtcbn07XG5cbk1hcHBpbmcucHJvdG90eXBlLnRvU3RyaW5nID0gZnVuY3Rpb24oKSB7XG4gICAgcmV0dXJuICdNYXBwaW5nWycgKyB0aGlzLnR5cGUgKyAnXSc7XG59O1xuXG4vKipcbiAqIEEgc3ViY2xhc3Mgb2YgSW50ZXJuYWxTaWVzdGFFcnJvciBzcGVjaWZjYWxseSBmb3IgZXJyb3JzIHRoYXQgb2NjdXIgZHVyaW5nIG1hcHBpbmcuXG4gKiBAcGFyYW0gbWVzc2FnZVxuICogQHBhcmFtIGNvbnRleHRcbiAqIEBwYXJhbSBzc2ZcbiAqIEByZXR1cm5zIHtNYXBwaW5nRXJyb3J9XG4gKiBAY29uc3RydWN0b3JcbiAqL1xuZnVuY3Rpb24gTWFwcGluZ0Vycm9yKG1lc3NhZ2UsIGNvbnRleHQsIHNzZikge1xuICAgIGlmICghdGhpcykge1xuICAgICAgICByZXR1cm4gbmV3IE1hcHBpbmdFcnJvcihtZXNzYWdlLCBjb250ZXh0KTtcbiAgICB9XG5cbiAgICB0aGlzLm1lc3NhZ2UgPSBtZXNzYWdlO1xuXG4gICAgdGhpcy5jb250ZXh0ID0gY29udGV4dDtcbiAgICAvLyBjYXB0dXJlIHN0YWNrIHRyYWNlXG4gICAgc3NmID0gc3NmIHx8IGFyZ3VtZW50cy5jYWxsZWU7XG4gICAgaWYgKHNzZiAmJiBJbnRlcm5hbFNpZXN0YUVycm9yLmNhcHR1cmVTdGFja1RyYWNlKSB7XG4gICAgICAgIEludGVybmFsU2llc3RhRXJyb3IuY2FwdHVyZVN0YWNrVHJhY2UodGhpcywgc3NmKTtcbiAgICB9XG59XG5cbk1hcHBpbmdFcnJvci5wcm90b3R5cGUgPSBPYmplY3QuY3JlYXRlKEludGVybmFsU2llc3RhRXJyb3IucHJvdG90eXBlKTtcbk1hcHBpbmdFcnJvci5wcm90b3R5cGUubmFtZSA9ICdNYXBwaW5nRXJyb3InO1xuTWFwcGluZ0Vycm9yLnByb3RvdHlwZS5jb25zdHJ1Y3RvciA9IE1hcHBpbmdFcnJvcjtcblxuZnVuY3Rpb24gYXJyYXlBc1N0cmluZyhhcnIpIHtcbiAgICB2YXIgYXJyQ29udGVudHMgPSBfLnJlZHVjZShhcnIsIGZ1bmN0aW9uKG1lbW8sIGYpIHtcbiAgICAgICAgcmV0dXJuIG1lbW8gKyAnXCInICsgZiArICdcIiwnXG4gICAgfSwgJycpO1xuICAgIGFyckNvbnRlbnRzID0gYXJyQ29udGVudHMuc3Vic3RyaW5nKDAsIGFyckNvbnRlbnRzLmxlbmd0aCAtIDEpO1xuICAgIHJldHVybiAnWycgKyBhcnJDb250ZW50cyArICddJztcbn1cblxuXG5mdW5jdGlvbiBjb25zdHJ1Y3RNYXBGdW5jdGlvbihjb2xsZWN0aW9uLCB0eXBlLCBmaWVsZHMpIHtcbiAgICB2YXIgbWFwRnVuYztcbiAgICB2YXIgb25seUVtcHR5RmllbGRTZXRTcGVjaWZpZWQgPSAoZmllbGRzLmxlbmd0aCA9PSAxICYmICFmaWVsZHNbMF0ubGVuZ3RoKTtcbiAgICB2YXIgbm9GaWVsZFNldHNTcGVjaWZpZWQgPSAhZmllbGRzLmxlbmd0aCB8fCBvbmx5RW1wdHlGaWVsZFNldFNwZWNpZmllZDtcblxuICAgIHZhciBhcnIgPSBhcnJheUFzU3RyaW5nKGZpZWxkcyk7XG4gICAgaWYgKG5vRmllbGRTZXRzU3BlY2lmaWVkKSB7XG4gICAgICAgIG1hcEZ1bmMgPSBmdW5jdGlvbihkb2MpIHtcbiAgICAgICAgICAgIHZhciB0eXBlID0gXCIkMlwiO1xuICAgICAgICAgICAgdmFyIGNvbGxlY3Rpb24gPSBcIiQzXCI7XG4gICAgICAgICAgICBpZiAoZG9jLnR5cGUgPT0gdHlwZSAmJiBkb2MuY29sbGVjdGlvbiA9PSBjb2xsZWN0aW9uKSB7XG4gICAgICAgICAgICAgICAgZW1pdChkb2MudHlwZSwgZG9jKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfS50b1N0cmluZygpO1xuICAgIH0gZWxzZSB7XG4gICAgICAgIG1hcEZ1bmMgPSBmdW5jdGlvbihkb2MpIHtcbiAgICAgICAgICAgIHZhciB0eXBlID0gXCIkMlwiO1xuICAgICAgICAgICAgdmFyIGNvbGxlY3Rpb24gPSBcIiQzXCI7XG4gICAgICAgICAgICBpZiAoZG9jLnR5cGUgPT0gdHlwZSAmJiBkb2MuY29sbGVjdGlvbiA9PSBjb2xsZWN0aW9uKSB7XG4gICAgICAgICAgICAgICAgLy9ub2luc3BlY3Rpb24gSlNVbnJlc29sdmVkVmFyaWFibGVcbiAgICAgICAgICAgICAgICB2YXIgZmllbGRzID0gJDE7XG4gICAgICAgICAgICAgICAgdmFyIGFnZ0ZpZWxkID0gJyc7XG4gICAgICAgICAgICAgICAgZm9yICh2YXIgaWR4IGluIGZpZWxkcykge1xuICAgICAgICAgICAgICAgICAgICAvL25vaW5zcGVjdGlvbiBKU1VuZmlsdGVyZWRGb3JJbkxvb3BcbiAgICAgICAgICAgICAgICAgICAgdmFyIGZpZWxkID0gZmllbGRzW2lkeF07XG4gICAgICAgICAgICAgICAgICAgIHZhciB2YWx1ZSA9IGRvY1tmaWVsZF07XG4gICAgICAgICAgICAgICAgICAgIGlmICh2YWx1ZSAhPT0gbnVsbCAmJiB2YWx1ZSAhPT0gdW5kZWZpbmVkKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBhZ2dGaWVsZCArPSB2YWx1ZS50b1N0cmluZygpICsgJ18nO1xuICAgICAgICAgICAgICAgICAgICB9IGVsc2UgaWYgKHZhbHVlID09PSBudWxsKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBhZ2dGaWVsZCArPSAnbnVsbF8nO1xuICAgICAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICAgICAgYWdnRmllbGQgKz0gJ3VuZGVmaW5lZF8nO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGFnZ0ZpZWxkID0gYWdnRmllbGQuc3Vic3RyaW5nKDAsIGFnZ0ZpZWxkLmxlbmd0aCAtIDEpO1xuICAgICAgICAgICAgICAgIGVtaXQoYWdnRmllbGQsIGRvYyk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0udG9TdHJpbmcoKTtcbiAgICAgICAgbWFwRnVuYyA9IG1hcEZ1bmMucmVwbGFjZSgnJDEnLCBhcnIpO1xuICAgIH1cbiAgICBtYXBGdW5jID0gbWFwRnVuYy5yZXBsYWNlKCckMicsIHR5cGUpO1xuICAgIG1hcEZ1bmMgPSBtYXBGdW5jLnJlcGxhY2UoJyQzJywgY29sbGVjdGlvbik7XG4gICAgcmV0dXJuIG1hcEZ1bmM7XG59XG5cblxuZnVuY3Rpb24gY29uc3RydWN0TWFwRnVuY3Rpb24yKGNvbGxlY3Rpb24sIHR5cGUsIGZpZWxkcykge1xuICAgIHZhciBtYXBGdW5jO1xuICAgIHZhciBvbmx5RW1wdHlGaWVsZFNldFNwZWNpZmllZCA9IChmaWVsZHMubGVuZ3RoID09IDEgJiYgIWZpZWxkc1swXS5sZW5ndGgpO1xuICAgIHZhciBub0ZpZWxkU2V0c1NwZWNpZmllZCA9ICFmaWVsZHMubGVuZ3RoIHx8IG9ubHlFbXB0eUZpZWxkU2V0U3BlY2lmaWVkO1xuXG4gICAgaWYgKG5vRmllbGRTZXRzU3BlY2lmaWVkKSB7XG4gICAgICAgIG1hcEZ1bmMgPSBmdW5jdGlvbihkb2MpIHtcbiAgICAgICAgICAgIGlmIChkb2MudHlwZSA9PSB0eXBlICYmIGRvYy5jb2xsZWN0aW9uID09IGNvbGxlY3Rpb24pIHtcbiAgICAgICAgICAgICAgICBlbWl0KGRvYy50eXBlLCBkb2MpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9O1xuICAgIH0gZWxzZSB7XG4gICAgICAgIG1hcEZ1bmMgPSBmdW5jdGlvbihkb2MpIHtcbiAgICAgICAgICAgIGlmIChkb2MudHlwZSA9PSB0eXBlICYmIGRvYy5jb2xsZWN0aW9uID09IGNvbGxlY3Rpb24pIHtcbiAgICAgICAgICAgICAgICB2YXIgYWdnRmllbGQgPSAnJztcbiAgICAgICAgICAgICAgICBmb3IgKHZhciBpZHggaW4gZmllbGRzKSB7XG4gICAgICAgICAgICAgICAgICAgIC8vbm9pbnNwZWN0aW9uIEpTVW5maWx0ZXJlZEZvckluTG9vcFxuICAgICAgICAgICAgICAgICAgICB2YXIgZmllbGQgPSBmaWVsZHNbaWR4XTtcbiAgICAgICAgICAgICAgICAgICAgdmFyIHZhbHVlID0gZG9jW2ZpZWxkXTtcbiAgICAgICAgICAgICAgICAgICAgaWYgKHZhbHVlICE9PSBudWxsICYmIHZhbHVlICE9PSB1bmRlZmluZWQpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGFnZ0ZpZWxkICs9IHZhbHVlLnRvU3RyaW5nKCkgKyAnXyc7XG4gICAgICAgICAgICAgICAgICAgIH0gZWxzZSBpZiAodmFsdWUgPT09IG51bGwpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGFnZ0ZpZWxkICs9ICdudWxsXyc7XG4gICAgICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBhZ2dGaWVsZCArPSAndW5kZWZpbmVkXyc7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgYWdnRmllbGQgPSBhZ2dGaWVsZC5zdWJzdHJpbmcoMCwgYWdnRmllbGQubGVuZ3RoIC0gMSk7XG4gICAgICAgICAgICAgICAgZW1pdChhZ2dGaWVsZCwgZG9jKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfTtcbiAgICB9XG4gICAgcmV0dXJuIG1hcEZ1bmM7XG59XG5cbmV4cG9ydHMuTWFwcGluZyA9IE1hcHBpbmc7XG5leHBvcnRzLk1hcHBpbmdFcnJvciA9IE1hcHBpbmdFcnJvcjtcbmV4cG9ydHMuY29uc3RydWN0TWFwRnVuY3Rpb24yID0gY29uc3RydWN0TWFwRnVuY3Rpb24yO1xuZXhwb3J0cy5jb25zdHJ1Y3RNYXBGdW5jdGlvbiA9IGNvbnN0cnVjdE1hcEZ1bmN0aW9uOyIsIi8qKlxuICogQG1vZHVsZSBtYXBwaW5nXG4gKi9cblxudmFyIFN0b3JlID0gcmVxdWlyZSgnLi9zdG9yZScpO1xudmFyIFNpZXN0YU1vZGVsID0gcmVxdWlyZSgnLi9vYmplY3QnKS5TaWVzdGFNb2RlbDtcbnZhciBsb2cgPSByZXF1aXJlKCcuL29wZXJhdGlvbi9sb2cnKTtcbnZhciBPcGVyYXRpb24gPSByZXF1aXJlKCcuL29wZXJhdGlvbi9vcGVyYXRpb24nKS5PcGVyYXRpb247XG52YXIgSW50ZXJuYWxTaWVzdGFFcnJvciA9IHJlcXVpcmUoJy4uL3NyYy9lcnJvcicpLkludGVybmFsU2llc3RhRXJyb3I7XG52YXIgUXVlcnkgPSByZXF1aXJlKCcuL3F1ZXJ5JykuUXVlcnk7XG5cbnZhciBMb2dnZXIgPSBsb2cubG9nZ2VyV2l0aE5hbWUoJ01hcHBpbmdPcGVyYXRpb24nKTtcbkxvZ2dlci5zZXRMZXZlbChsb2cuTGV2ZWwud2Fybik7XG5cbnZhciBjYWNoZSA9IHJlcXVpcmUoJy4vY2FjaGUnKTtcbnZhciB1dGlsID0gcmVxdWlyZSgnLi91dGlsJyk7XG52YXIgXyA9IHV0aWwuXztcbnZhciBkZWZpbmVTdWJQcm9wZXJ0eSA9IHJlcXVpcmUoJy4vbWlzYycpLmRlZmluZVN1YlByb3BlcnR5O1xudmFyIENoYW5nZVR5cGUgPSByZXF1aXJlKCcuL2NoYW5nZXMnKS5DaGFuZ2VUeXBlO1xuXG5mdW5jdGlvbiBmbGF0dGVuQXJyYXkoYXJyKSB7XG4gICAgcmV0dXJuIF8ucmVkdWNlKGFyciwgZnVuY3Rpb24obWVtbywgZSkge1xuICAgICAgICBpZiAodXRpbC5pc0FycmF5KGUpKSB7XG4gICAgICAgICAgICBtZW1vID0gbWVtby5jb25jYXQoZSk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBtZW1vLnB1c2goZSk7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIG1lbW87XG4gICAgfSwgW10pO1xufVxuXG5mdW5jdGlvbiB1bmZsYXR0ZW5BcnJheShhcnIsIG1vZGVsQXJyKSB7XG4gICAgdmFyIG4gPSAwO1xuICAgIHZhciB1bmZsYXR0ZW5lZCA9IFtdO1xuICAgIGZvciAodmFyIGkgPSAwOyBpIDwgbW9kZWxBcnIubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgaWYgKHV0aWwuaXNBcnJheShtb2RlbEFycltpXSkpIHtcbiAgICAgICAgICAgIHZhciBuZXdBcnIgPSBbXTtcbiAgICAgICAgICAgIHVuZmxhdHRlbmVkW2ldID0gbmV3QXJyO1xuICAgICAgICAgICAgZm9yICh2YXIgaiA9IDA7IGogPCBtb2RlbEFycltpXS5sZW5ndGg7IGorKykge1xuICAgICAgICAgICAgICAgIG5ld0Fyci5wdXNoKGFycltuXSk7XG4gICAgICAgICAgICAgICAgbisrO1xuICAgICAgICAgICAgfVxuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgdW5mbGF0dGVuZWRbaV0gPSBhcnJbbl07XG4gICAgICAgICAgICBuKys7XG4gICAgICAgIH1cbiAgICB9XG4gICAgcmV0dXJuIHVuZmxhdHRlbmVkO1xufVxuXG4vKipcbiAqIERlZmluZXMgYW4gZW5jYXBzdWxhdGVkIG1hcHBpbmcgb3BlcmF0aW9uIHdoZXJlIG9wdHMgdGFrZXMgYSBtYXBwaW5cbiAqIEBwYXJhbSB7T2JqZWN0c30gb3B0c1xuICovXG5mdW5jdGlvbiBCdWxrTWFwcGluZ09wZXJhdGlvbihvcHRzKSB7XG4gICAgT3BlcmF0aW9uLmNhbGwodGhpcyk7XG5cbiAgICB0aGlzLl9vcHRzID0gb3B0cztcblxuICAgIC8qKlxuICAgICAqIEBuYW1lIG1hcHBpbmdcbiAgICAgKiBAdHlwZSB7TWFwcGluZ31cbiAgICAgKi9cbiAgICBkZWZpbmVTdWJQcm9wZXJ0eS5jYWxsKHRoaXMsICdtYXBwaW5nJywgdGhpcy5fb3B0cyk7XG5cbiAgICAvKipcbiAgICAgKiBAbmFtZSBkYXRhXG4gICAgICogQHR5cGUge0FycmF5fVxuICAgICAqL1xuICAgIGRlZmluZVN1YlByb3BlcnR5LmNhbGwodGhpcywgJ2RhdGEnLCB0aGlzLl9vcHRzKTtcblxuICAgIC8qKlxuICAgICAqIEBuYW1lIG9iamVjdHNcbiAgICAgKiBAdHlwZSB7QXJyYXl9XG4gICAgICovXG4gICAgZGVmaW5lU3ViUHJvcGVydHkuY2FsbCh0aGlzLCAnb2JqZWN0cycsIHRoaXMuX29wdHMpO1xuXG4gICAgaWYgKCF0aGlzLm9iamVjdHMpIHRoaXMub2JqZWN0cyA9IFtdO1xuXG4gICAgLyoqXG4gICAgICogQXJyYXkgb2YgZXJyb3JzIHdoZXJlIGluZGV4ZXMgbWFwIG9udG8gc2FtZSBpbmRleCBhcyB0aGUgZGF0dW0gdGhhdCBjYXVzZWQgYW4gZXJyb3IuXG4gICAgICogQHR5cGUge0FycmF5fVxuICAgICAqL1xuICAgIHRoaXMuZXJyb3JzID0gW107XG5cbiAgICB0aGlzLm5hbWUgPSAnTWFwcGluZyBPcGVyYXRpb24nO1xuICAgIHRoaXMud29yayA9IF8uYmluZCh0aGlzLl9zdGFydCwgdGhpcyk7XG4gICAgdGhpcy5zdWJPcHMgPSB7fTtcbn1cblxuQnVsa01hcHBpbmdPcGVyYXRpb24ucHJvdG90eXBlID0gT2JqZWN0LmNyZWF0ZShPcGVyYXRpb24ucHJvdG90eXBlKTtcblxuZnVuY3Rpb24gbWFwQXR0cmlidXRlcygpIHtcbiAgICBmb3IgKHZhciBpID0gMDsgaSA8IHRoaXMuZGF0YS5sZW5ndGg7IGkrKykge1xuICAgICAgICB2YXIgZGF0dW0gPSB0aGlzLmRhdGFbaV07XG4gICAgICAgIHZhciBvYmplY3QgPSB0aGlzLm9iamVjdHNbaV07XG4gICAgICAgIC8vIE5vIHBvaW50IG1hcHBpbmcgb2JqZWN0IG9udG8gaXRzZWxmLiBUaGlzIGhhcHBlbnMgaWYgYSBTaWVzdGFNb2RlbCBpcyBwYXNzZWQgYXMgYSByZWxhdGlvbnNoaXAuXG4gICAgICAgIGlmIChkYXR1bSAhPSBvYmplY3QpIHtcbiAgICAgICAgICAgIGlmIChvYmplY3QpIHsgLy8gSWYgb2JqZWN0IGlzIGZhbHN5LCB0aGVuIHRoZXJlIHdhcyBhbiBlcnJvciBsb29raW5nIHVwIHRoYXQgb2JqZWN0L2NyZWF0aW5nIGl0LlxuICAgICAgICAgICAgICAgIHZhciBmaWVsZHMgPSB0aGlzLm1hcHBpbmcuX2ZpZWxkcztcbiAgICAgICAgICAgICAgICBfLmVhY2goZmllbGRzLCBmdW5jdGlvbihmKSB7XG4gICAgICAgICAgICAgICAgICAgIGlmIChkYXR1bVtmXSAhPT0gdW5kZWZpbmVkKSB7IC8vIG51bGwgaXMgZmluZVxuICAgICAgICAgICAgICAgICAgICAgICAgb2JqZWN0W2ZdID0gZGF0dW1bZl07XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH1cbn1cblxuXG5CdWxrTWFwcGluZ09wZXJhdGlvbi5wcm90b3R5cGUuX21hcCA9IGZ1bmN0aW9uKCkge1xuICAgIHZhciBzZWxmID0gdGhpcztcbiAgICB2YXIgbnVtSGl0cyA9IG1hcEF0dHJpYnV0ZXMuY2FsbCh0aGlzKTtcbiAgICB2YXIgcmVsYXRpb25zaGlwRmllbGRzID0gXy5rZXlzKHNlbGYuc3ViT3BzKTtcbiAgICBfLmVhY2gocmVsYXRpb25zaGlwRmllbGRzLCBmdW5jdGlvbihmKSB7XG4gICAgICAgIHZhciBvcCA9IHNlbGYuc3ViT3BzW2ZdLm9wO1xuICAgICAgICB2YXIgaW5kZXhlcyA9IHNlbGYuc3ViT3BzW2ZdLmluZGV4ZXM7XG4gICAgICAgIHZhciByZWxhdGVkRGF0YSA9IGdldFJlbGF0ZWREYXRhLmNhbGwoc2VsZiwgZikucmVsYXRlZERhdGE7XG4gICAgICAgIHZhciB1bmZsYXR0ZW5lZE9iamVjdHMgPSB1bmZsYXR0ZW5BcnJheShvcC5vYmplY3RzLCByZWxhdGVkRGF0YSk7XG4gICAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgdW5mbGF0dGVuZWRPYmplY3RzLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgICB2YXIgaWR4ID0gaW5kZXhlc1tpXTtcbiAgICAgICAgICAgIC8vIEVycm9ycyBhcmUgcGx1Y2tlZCBmcm9tIHRoZSBzdWJvcGVyYXRpb25zLlxuICAgICAgICAgICAgdmFyIGVycm9yID0gc2VsZi5lcnJvcnNbaWR4XTtcbiAgICAgICAgICAgIHZhciBlcnIgPSBlcnJvciA/IGVycm9yW2ZdIDogbnVsbDtcbiAgICAgICAgICAgIGlmICghZXJyKSB7XG4gICAgICAgICAgICAgICAgdmFyIHJlbGF0ZWQgPSB1bmZsYXR0ZW5lZE9iamVjdHNbaV07IC8vIENhbiBiZSBhcnJheSBvciBzY2FsYXIuXG4gICAgICAgICAgICAgICAgdmFyIG9iamVjdCA9IHNlbGYub2JqZWN0c1tpZHhdO1xuICAgICAgICAgICAgICAgIGlmIChvYmplY3QpIHtcbiAgICAgICAgICAgICAgICAgICAgdmFyIGVyciA9IG9iamVjdFtmICsgJ1Byb3h5J10uc2V0KHJlbGF0ZWQpO1xuICAgICAgICAgICAgICAgICAgICBpZiAoZXJyKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAoIXNlbGYuZXJyb3JzW2lkeF0pIHNlbGYuZXJyb3JzW2lkeF0gPSB7fTtcbiAgICAgICAgICAgICAgICAgICAgICAgIHNlbGYuZXJyb3JzW2lkeF1bZl0gPSBlcnI7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9KTtcbn07XG5cbi8qKlxuICogRm9yIGluZGljZXMgd2hlcmUgbm8gb2JqZWN0IGlzIHByZXNlbnQsIHBlcmZvcm0gbG9va3VwcywgY3JlYXRpbmcgYSBuZXcgb2JqZWN0IGlmIG5lY2Vzc2FyeS5cbiAqIEBwcml2YXRlXG4gKi9cbkJ1bGtNYXBwaW5nT3BlcmF0aW9uLnByb3RvdHlwZS5fbG9va3VwID0gZnVuY3Rpb24oY2FsbGJhY2spIHtcbiAgICB2YXIgZGVmZXJyZWQgPSB3aW5kb3cucSA/IHdpbmRvdy5xLmRlZmVyKCkgOiBudWxsO1xuICAgIGNhbGxiYWNrID0gdXRpbC5jb25zdHJ1Y3RDYWxsYmFja0FuZFByb21pc2VIYW5kbGVyKGNhbGxiYWNrLCBkZWZlcnJlZCk7XG4gICAgdmFyIHNlbGYgPSB0aGlzO1xuICAgIHZhciByZW1vdGVMb29rdXBzID0gW107XG4gICAgdmFyIGxvY2FsTG9va3VwcyA9IFtdO1xuICAgIGZvciAodmFyIGkgPSAwOyBpIDwgdGhpcy5kYXRhLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgIGlmICghdGhpcy5vYmplY3RzW2ldKSB7XG4gICAgICAgICAgICB2YXIgbG9va3VwO1xuICAgICAgICAgICAgdmFyIGRhdHVtID0gdGhpcy5kYXRhW2ldO1xuICAgICAgICAgICAgdmFyIGlzU2NhbGFyID0gdHlwZW9mIGRhdHVtID09ICdzdHJpbmcnIHx8IHR5cGVvZiBkYXR1bSA9PSAnbnVtYmVyJyB8fCBkYXR1bSBpbnN0YW5jZW9mIFN0cmluZztcbiAgICAgICAgICAgIGlmIChkYXR1bSkge1xuICAgICAgICAgICAgICAgIGlmIChpc1NjYWxhcikge1xuICAgICAgICAgICAgICAgICAgICBsb29rdXAgPSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBpbmRleDogaSxcbiAgICAgICAgICAgICAgICAgICAgICAgIGRhdHVtOiB7fVxuICAgICAgICAgICAgICAgICAgICB9O1xuICAgICAgICAgICAgICAgICAgICBsb29rdXAuZGF0dW1bc2VsZi5tYXBwaW5nLmlkXSA9IGRhdHVtO1xuICAgICAgICAgICAgICAgICAgICByZW1vdGVMb29rdXBzLnB1c2gobG9va3VwKTtcbiAgICAgICAgICAgICAgICB9IGVsc2UgaWYgKGRhdHVtIGluc3RhbmNlb2YgU2llc3RhTW9kZWwpIHsgLy8gV2Ugd29uJ3QgbmVlZCB0byBwZXJmb3JtIGFueSBtYXBwaW5nLlxuICAgICAgICAgICAgICAgICAgICB0aGlzLm9iamVjdHNbaV0gPSBkYXR1bTtcbiAgICAgICAgICAgICAgICB9IGVsc2UgaWYgKGRhdHVtLl9pZCkge1xuICAgICAgICAgICAgICAgICAgICBsb2NhbExvb2t1cHMucHVzaCh7XG4gICAgICAgICAgICAgICAgICAgICAgICBpbmRleDogaSxcbiAgICAgICAgICAgICAgICAgICAgICAgIGRhdHVtOiBkYXR1bVxuICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICB9IGVsc2UgaWYgKGRhdHVtW3NlbGYubWFwcGluZy5pZF0pIHtcbiAgICAgICAgICAgICAgICAgICAgcmVtb3RlTG9va3Vwcy5wdXNoKHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGluZGV4OiBpLFxuICAgICAgICAgICAgICAgICAgICAgICAgZGF0dW06IGRhdHVtXG4gICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgIC8vIENyZWF0ZSBhIG5ldyBvYmplY3QgaWYgYW5kIG9ubHkgaWYgdGhlIGRhdGEgaGFzIGFueSBmaWVsZHMgdGhhdCB3aWxsIGFjdHVhbGx5XG4gICAgICAgICAgICAgICAgICAgIHZhciBkYXR1bUZpZWxkcyA9IE9iamVjdC5rZXlzKGRhdHVtKTtcbiAgICAgICAgICAgICAgICAgICAgdmFyIG9iamVjdEZpZWxkcyA9IF8ucmVkdWNlKE9iamVjdC5rZXlzKHNlbGYubWFwcGluZy5yZWxhdGlvbnNoaXBzKS5jb25jYXQoc2VsZi5tYXBwaW5nLl9maWVsZHMpLCBmdW5jdGlvbihtLCB4KSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBtW3hdID0ge307XG4gICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gbTtcbiAgICAgICAgICAgICAgICAgICAgfSwge30pO1xuICAgICAgICAgICAgICAgICAgICB2YXIgc2hvdWxkQ3JlYXRlTmV3T2JqZWN0ID0gZmFsc2U7XG4gICAgICAgICAgICAgICAgICAgIGZvciAodmFyIGogPSAwOyBqIDwgZGF0dW1GaWVsZHMubGVuZ3RoOyBqKyspIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmIChvYmplY3RGaWVsZHNbZGF0dW1GaWVsZHNbal1dKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgc2hvdWxkQ3JlYXRlTmV3T2JqZWN0ID0gdHJ1ZTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICBpZiAoc2hvdWxkQ3JlYXRlTmV3T2JqZWN0KSB7XG4gICAgICAgICAgICAgICAgICAgICAgICB0aGlzLm9iamVjdHNbaV0gPSBzZWxmLm1hcHBpbmcuX25ldygpO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICB0aGlzLm9iamVjdHNbaV0gPSBudWxsO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfVxuICAgIHV0aWwucGFyYWxsZWwoW1xuICAgICAgICAgICAgZnVuY3Rpb24oY2FsbGJhY2spIHtcbiAgICAgICAgICAgICAgICB2YXIgbG9jYWxJZGVudGlmaWVycyA9IF8ucGx1Y2soXy5wbHVjayhsb2NhbExvb2t1cHMsICdkYXR1bScpLCAnX2lkJyk7XG4gICAgICAgICAgICAgICAgaWYgKGxvY2FsSWRlbnRpZmllcnMubGVuZ3RoKSB7XG4gICAgICAgICAgICAgICAgICAgIFN0b3JlLmdldE11bHRpcGxlTG9jYWwobG9jYWxJZGVudGlmaWVycywgZnVuY3Rpb24oZXJyLCBvYmplY3RzKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAoIWVycikge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgbG9jYWxJZGVudGlmaWVycy5sZW5ndGg7IGkrKykge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB2YXIgb2JqID0gb2JqZWN0c1tpXTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdmFyIF9pZCA9IGxvY2FsSWRlbnRpZmllcnNbaV07XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHZhciBsb29rdXAgPSBsb2NhbExvb2t1cHNbaV07XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmICghb2JqKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBzZWxmLmVycm9yc1tsb29rdXAuaW5kZXhdID0ge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIF9pZDogJ05vIG9iamVjdCB3aXRoIF9pZD1cIicgKyBfaWQudG9TdHJpbmcoKSArICdcIidcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH07XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBzZWxmLm9iamVjdHNbbG9va3VwLmluZGV4XSA9IG9iajtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgIGNhbGxiYWNrKGVycik7XG4gICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgIGNhbGxiYWNrKCk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIGZ1bmN0aW9uKGNhbGxiYWNrKSB7XG4gICAgICAgICAgICAgICAgdmFyIHJlbW90ZUlkZW50aWZpZXJzID0gXy5wbHVjayhfLnBsdWNrKHJlbW90ZUxvb2t1cHMsICdkYXR1bScpLCBzZWxmLm1hcHBpbmcuaWQpO1xuICAgICAgICAgICAgICAgIGlmIChyZW1vdGVJZGVudGlmaWVycy5sZW5ndGgpIHtcbiAgICAgICAgICAgICAgICAgICAgaWYgKExvZ2dlci50cmFjZS5pc0VuYWJsZWQpXG4gICAgICAgICAgICAgICAgICAgICAgICBMb2dnZXIudHJhY2UoJ0xvb2tpbmcgdXAgcmVtb3RlSWRlbnRpZmllcnM6ICcgKyBKU09OLnN0cmluZ2lmeShyZW1vdGVJZGVudGlmaWVycywgbnVsbCwgNCkpO1xuICAgICAgICAgICAgICAgICAgICBTdG9yZS5nZXRNdWx0aXBsZVJlbW90ZShyZW1vdGVJZGVudGlmaWVycywgc2VsZi5tYXBwaW5nLCBmdW5jdGlvbihlcnIsIG9iamVjdHMpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmICghZXJyKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgKExvZ2dlci50cmFjZS5pc0VuYWJsZWQpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdmFyIHJlc3VsdHMgPSB7fTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZm9yIChpID0gMDsgaSA8IG9iamVjdHMubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJlc3VsdHNbcmVtb3RlSWRlbnRpZmllcnNbaV1dID0gb2JqZWN0c1tpXSA/IG9iamVjdHNbaV0uX2lkIDogbnVsbDtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBMb2dnZXIudHJhY2UoJ1Jlc3VsdHMgZm9yIHJlbW90ZUlkZW50aWZpZXJzOiAnICsgSlNPTi5zdHJpbmdpZnkocmVzdWx0cywgbnVsbCwgNCkpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBmb3IgKGkgPSAwOyBpIDwgb2JqZWN0cy5sZW5ndGg7IGkrKykge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB2YXIgb2JqID0gb2JqZWN0c1tpXTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdmFyIGxvb2t1cCA9IHJlbW90ZUxvb2t1cHNbaV07XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmIChvYmopIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHNlbGYub2JqZWN0c1tsb29rdXAuaW5kZXhdID0gb2JqO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdmFyIGRhdGEgPSB7fTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHZhciByZW1vdGVJZCA9IHJlbW90ZUlkZW50aWZpZXJzW2ldO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZGF0YVtzZWxmLm1hcHBpbmcuaWRdID0gcmVtb3RlSWQ7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB2YXIgY2FjaGVRdWVyeSA9IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBtYXBwaW5nOiBzZWxmLm1hcHBpbmdcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH07XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjYWNoZVF1ZXJ5W3NlbGYubWFwcGluZy5pZF0gPSByZW1vdGVJZDtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHZhciBjYWNoZWQgPSBjYWNoZS5nZXQoY2FjaGVRdWVyeSk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiAoY2FjaGVkKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgc2VsZi5vYmplY3RzW2xvb2t1cC5pbmRleF0gPSBjYWNoZWQ7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHNlbGYub2JqZWN0c1tsb29rdXAuaW5kZXhdID0gc2VsZi5tYXBwaW5nLl9uZXcoKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyBJdCdzIGltcG9ydGFudCB0aGF0IHdlIG1hcCB0aGUgcmVtb3RlIGlkZW50aWZpZXIgaGVyZSB0byBlbnN1cmUgdGhhdCBpdCBlbmRzXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8gdXAgaW4gdGhlIGNhY2hlLlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHNlbGYub2JqZWN0c1tsb29rdXAuaW5kZXhdW3NlbGYubWFwcGluZy5pZF0gPSByZW1vdGVJZDtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgIGNhbGxiYWNrKGVycik7XG4gICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgIGNhbGxiYWNrKCk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICBdLFxuICAgICAgICBjYWxsYmFjayk7XG4gICAgcmV0dXJuIGRlZmVycmVkID8gZGVmZXJyZWQucHJvbWlzZSA6IG51bGw7XG59O1xuXG5CdWxrTWFwcGluZ09wZXJhdGlvbi5wcm90b3R5cGUuX2xvb2t1cFNpbmdsZXRvbiA9IGZ1bmN0aW9uKGNhbGxiYWNrKSB7XG4gICAgdmFyIGRlZmVycmVkID0gd2luZG93LnEgPyB3aW5kb3cucS5kZWZlcigpIDogbnVsbDtcbiAgICBjYWxsYmFjayA9IHV0aWwuY29uc3RydWN0Q2FsbGJhY2tBbmRQcm9taXNlSGFuZGxlcihjYWxsYmFjaywgZGVmZXJyZWQpO1xuICAgIHZhciBzZWxmID0gdGhpcztcbiAgICB2YXIgY2FjaGVkU2luZ2xldG9uID0gY2FjaGUuZ2V0KHtcbiAgICAgICAgbWFwcGluZzogdGhpcy5tYXBwaW5nXG4gICAgfSk7XG4gICAgaWYgKCFjYWNoZWRTaW5nbGV0b24pIHtcbiAgICAgICAgdmFyIHF1ZXJ5ID0gbmV3IFF1ZXJ5KHRoaXMubWFwcGluZyk7XG4gICAgICAgIHF1ZXJ5LmV4ZWN1dGUoZnVuY3Rpb24oZXJyLCBvYmpzKSB7XG4gICAgICAgICAgICBpZiAoIWVycikge1xuICAgICAgICAgICAgICAgIHZhciBvYmo7XG4gICAgICAgICAgICAgICAgaWYgKG9ianMubGVuZ3RoKSB7XG4gICAgICAgICAgICAgICAgICAgIGlmIChvYmpzLmxlbmd0aCA9PSAxKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBvYmogPSBvYmpzWzBdO1xuICAgICAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICAgICAgdGhyb3cgbmV3IEludGVybmFsU2llc3RhRXJyb3IoKTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgIG9iaiA9IHNlbGYubWFwcGluZy5fbmV3KCk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgc2VsZi5kYXRhLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgICAgICAgICAgIHNlbGYub2JqZWN0c1tpXSA9IG9iajtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBjYWxsYmFjayhlcnIpO1xuICAgICAgICB9KTtcbiAgICB9IGVsc2Uge1xuICAgICAgICBmb3IgKHZhciBpID0gMDsgaSA8IHNlbGYuZGF0YS5sZW5ndGg7IGkrKykge1xuICAgICAgICAgICAgc2VsZi5vYmplY3RzW2ldID0gY2FjaGVkU2luZ2xldG9uO1xuICAgICAgICB9XG4gICAgICAgIGNhbGxiYWNrKCk7XG4gICAgfVxuICAgIHJldHVybiBkZWZlcnJlZCA/IGRlZmVycmVkLnByb21pc2UgOiBudWxsO1xufTtcblxuQnVsa01hcHBpbmdPcGVyYXRpb24ucHJvdG90eXBlLl9zdGFydCA9IGZ1bmN0aW9uKGRvbmUpIHtcbiAgICBpZiAodGhpcy5kYXRhLmxlbmd0aCkge1xuICAgICAgICB2YXIgc2VsZiA9IHRoaXM7XG4gICAgICAgIHZhciB0YXNrcyA9IFtdO1xuICAgICAgICB2YXIgbG9va3VwRnVuYyA9IHRoaXMubWFwcGluZy5zaW5nbGV0b24gPyB0aGlzLl9sb29rdXBTaW5nbGV0b24gOiB0aGlzLl9sb29rdXA7XG4gICAgICAgIHRhc2tzLnB1c2goXy5iaW5kKGxvb2t1cEZ1bmMsIHRoaXMpKTtcbiAgICAgICAgdGFza3MucHVzaChfLmJpbmQodGhpcy5fZXhlY3V0ZVN1Yk9wZXJhdGlvbnMsIHRoaXMpKTtcbiAgICAgICAgdXRpbC5wYXJhbGxlbCh0YXNrcywgZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICBzZWxmLl9tYXAoKTtcbiAgICAgICAgICAgIGRvbmUoc2VsZi5lcnJvcnMubGVuZ3RoID8gc2VsZi5lcnJvcnMgOiBudWxsLCBzZWxmLm9iamVjdHMpO1xuICAgICAgICB9KTtcbiAgICB9IGVsc2Uge1xuICAgICAgICBkb25lKG51bGwsIFtdKTtcbiAgICB9XG59O1xuXG5mdW5jdGlvbiBnZXRSZWxhdGVkRGF0YShuYW1lKSB7XG4gICAgdmFyIGluZGV4ZXMgPSBbXTtcbiAgICB2YXIgcmVsYXRlZERhdGEgPSBbXTtcbiAgICBmb3IgKHZhciBpID0gMDsgaSA8IHRoaXMuZGF0YS5sZW5ndGg7IGkrKykge1xuICAgICAgICB2YXIgZGF0dW0gPSB0aGlzLmRhdGFbaV07XG4gICAgICAgIGlmIChkYXR1bSkge1xuICAgICAgICAgICAgaWYgKGRhdHVtW25hbWVdKSB7XG4gICAgICAgICAgICAgICAgaW5kZXhlcy5wdXNoKGkpO1xuICAgICAgICAgICAgICAgIHJlbGF0ZWREYXRhLnB1c2goZGF0dW1bbmFtZV0pO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfVxuICAgIHJldHVybiB7XG4gICAgICAgIGluZGV4ZXM6IGluZGV4ZXMsXG4gICAgICAgIHJlbGF0ZWREYXRhOiByZWxhdGVkRGF0YVxuICAgIH07XG59XG5cbkJ1bGtNYXBwaW5nT3BlcmF0aW9uLnByb3RvdHlwZS5fY29uc3RydWN0U3ViT3BlcmF0aW9ucyA9IGZ1bmN0aW9uKCkge1xuICAgIHZhciBzdWJPcHMgPSB0aGlzLnN1Yk9wcztcbiAgICB2YXIgcmVsYXRpb25zaGlwcyA9IHRoaXMubWFwcGluZy5yZWxhdGlvbnNoaXBzO1xuICAgIGZvciAodmFyIG5hbWUgaW4gcmVsYXRpb25zaGlwcykge1xuICAgICAgICBpZiAocmVsYXRpb25zaGlwcy5oYXNPd25Qcm9wZXJ0eShuYW1lKSkge1xuICAgICAgICAgICAgdmFyIHJlbGF0aW9uc2hpcCA9IHJlbGF0aW9uc2hpcHNbbmFtZV07XG4gICAgICAgICAgICB2YXIgcmV2ZXJzZU1hcHBpbmcgPSByZWxhdGlvbnNoaXAuZm9yd2FyZE5hbWUgPT0gbmFtZSA/IHJlbGF0aW9uc2hpcC5yZXZlcnNlTWFwcGluZyA6IHJlbGF0aW9uc2hpcC5mb3J3YXJkTWFwcGluZztcbiAgICAgICAgICAgIHZhciBfX3JldCA9IGdldFJlbGF0ZWREYXRhLmNhbGwodGhpcywgbmFtZSk7XG4gICAgICAgICAgICB2YXIgaW5kZXhlcyA9IF9fcmV0LmluZGV4ZXM7XG4gICAgICAgICAgICB2YXIgcmVsYXRlZERhdGEgPSBfX3JldC5yZWxhdGVkRGF0YTtcbiAgICAgICAgICAgIGlmIChyZWxhdGVkRGF0YS5sZW5ndGgpIHtcbiAgICAgICAgICAgICAgICB2YXIgZmxhdFJlbGF0ZWREYXRhID0gZmxhdHRlbkFycmF5KHJlbGF0ZWREYXRhKTtcbiAgICAgICAgICAgICAgICB2YXIgb3AgPSBuZXcgQnVsa01hcHBpbmdPcGVyYXRpb24oe1xuICAgICAgICAgICAgICAgICAgICBtYXBwaW5nOiByZXZlcnNlTWFwcGluZyxcbiAgICAgICAgICAgICAgICAgICAgZGF0YTogZmxhdFJlbGF0ZWREYXRhXG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgb3AuX19yZWxhdGlvbnNoaXBOYW1lID0gbmFtZTtcbiAgICAgICAgICAgICAgICBzdWJPcHNbbmFtZV0gPSB7XG4gICAgICAgICAgICAgICAgICAgIG9wOiBvcCxcbiAgICAgICAgICAgICAgICAgICAgaW5kZXhlczogaW5kZXhlc1xuICAgICAgICAgICAgICAgIH07XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9XG59O1xuXG5mdW5jdGlvbiBnYXRoZXJFcnJvcnNGcm9tU3ViT3BlcmF0aW9ucygpIHtcbiAgICB2YXIgc2VsZiA9IHRoaXM7XG4gICAgdmFyIHJlbGF0aW9uc2hpcE5hbWVzID0gXy5rZXlzKHRoaXMuc3ViT3BzKTtcbiAgICBfLmVhY2gocmVsYXRpb25zaGlwTmFtZXMsIGZ1bmN0aW9uKG5hbWUpIHtcbiAgICAgICAgdmFyIG9wID0gc2VsZi5zdWJPcHNbbmFtZV0ub3A7XG4gICAgICAgIHZhciBpbmRleGVzID0gc2VsZi5zdWJPcHNbbmFtZV0uaW5kZXhlcztcbiAgICAgICAgdmFyIGVycm9ycyA9IG9wLmVycm9ycztcbiAgICAgICAgaWYgKGVycm9ycy5sZW5ndGgpIHtcbiAgICAgICAgICAgIHZhciByZWxhdGVkRGF0YSA9IGdldFJlbGF0ZWREYXRhLmNhbGwoc2VsZiwgbmFtZSkucmVsYXRlZERhdGE7XG4gICAgICAgICAgICB2YXIgdW5mbGF0dGVuZWRFcnJvcnMgPSB1bmZsYXR0ZW5BcnJheShlcnJvcnMsIHJlbGF0ZWREYXRhKTtcbiAgICAgICAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgdW5mbGF0dGVuZWRFcnJvcnMubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICAgICAgICB2YXIgaWR4ID0gaW5kZXhlc1tpXTtcbiAgICAgICAgICAgICAgICB2YXIgZXJyID0gdW5mbGF0dGVuZWRFcnJvcnNbaV07XG4gICAgICAgICAgICAgICAgdmFyIGlzRXJyb3IgPSBlcnI7XG4gICAgICAgICAgICAgICAgaWYgKHV0aWwuaXNBcnJheShlcnIpKSBpc0Vycm9yID0gXy5yZWR1Y2UoZXJyLCBmdW5jdGlvbihtZW1vLCB4KSB7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBtZW1vIHx8IHhcbiAgICAgICAgICAgICAgICB9LCBmYWxzZSk7XG4gICAgICAgICAgICAgICAgaWYgKGlzRXJyb3IpIHtcbiAgICAgICAgICAgICAgICAgICAgaWYgKCFzZWxmLmVycm9yc1tpZHhdKSBzZWxmLmVycm9yc1tpZHhdID0ge307XG4gICAgICAgICAgICAgICAgICAgIHNlbGYuZXJyb3JzW2lkeF1bbmFtZV0gPSBlcnI7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfSk7XG59XG5cbkJ1bGtNYXBwaW5nT3BlcmF0aW9uLnByb3RvdHlwZS5fZXhlY3V0ZVN1Yk9wZXJhdGlvbnMgPSBmdW5jdGlvbihjYWxsYmFjaykge1xuICAgIHZhciBzZWxmID0gdGhpcztcbiAgICB0aGlzLl9jb25zdHJ1Y3RTdWJPcGVyYXRpb25zKCk7XG4gICAgdmFyIHJlbGF0aW9uc2hpcE5hbWVzID0gXy5rZXlzKHRoaXMuc3ViT3BzKTtcbiAgICBpZiAocmVsYXRpb25zaGlwTmFtZXMubGVuZ3RoKSB7XG4gICAgICAgIHZhciBzdWJPcGVyYXRpb25zID0gXy5tYXAocmVsYXRpb25zaGlwTmFtZXMsIGZ1bmN0aW9uKGspIHtcbiAgICAgICAgICAgIHJldHVybiBzZWxmLnN1Yk9wc1trXS5vcFxuICAgICAgICB9KTtcbiAgICAgICAgdmFyIGNvbXBvc2l0ZU9wZXJhdGlvbiA9IG5ldyBPcGVyYXRpb24oc3ViT3BlcmF0aW9ucyk7XG4gICAgICAgIGNvbXBvc2l0ZU9wZXJhdGlvbi5vbkNvbXBsZXRpb24oZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICBnYXRoZXJFcnJvcnNGcm9tU3ViT3BlcmF0aW9ucy5jYWxsKHNlbGYsIHJlbGF0aW9uc2hpcE5hbWVzKTtcbiAgICAgICAgICAgIGNhbGxiYWNrKCk7XG4gICAgICAgIH0pO1xuICAgICAgICBjb21wb3NpdGVPcGVyYXRpb24uc3RhcnQoKTtcbiAgICB9IGVsc2Uge1xuICAgICAgICBjYWxsYmFjaygpO1xuICAgIH1cbn07XG5cbmV4cG9ydHMuQnVsa01hcHBpbmdPcGVyYXRpb24gPSBCdWxrTWFwcGluZ09wZXJhdGlvbjtcbmV4cG9ydHMuZmxhdHRlbkFycmF5ID0gZmxhdHRlbkFycmF5O1xuZXhwb3J0cy51bmZsYXR0ZW5BcnJheSA9IHVuZmxhdHRlbkFycmF5OyIsInZhciBJbnRlcm5hbFNpZXN0YUVycm9yID0gcmVxdWlyZSgnLi9lcnJvcicpLkludGVybmFsU2llc3RhRXJyb3I7XG5cbmZ1bmN0aW9uIGFzc2VydChjb25kaXRpb24sIG1lc3NhZ2UsIGNvbnRleHQpIHtcbiAgICBpZiAoIWNvbmRpdGlvbikge1xuICAgICAgICBtZXNzYWdlID0gbWVzc2FnZSB8fCBcIkFzc2VydGlvbiBmYWlsZWRcIjtcbiAgICAgICAgY29udGV4dCA9IGNvbnRleHQgfHwge307XG4gICAgICAgIHRocm93IG5ldyBJbnRlcm5hbFNpZXN0YUVycm9yKG1lc3NhZ2UsIGNvbnRleHQpO1xuICAgIH1cbn1cblxuZnVuY3Rpb24gZGVmaW5lU3ViUHJvcGVydHkgKHByb3BlcnR5LCBzdWJPYmosIGlubmVyUHJvcGVydHkpIHtcbiAgICByZXR1cm4gT2JqZWN0LmRlZmluZVByb3BlcnR5KHRoaXMsIHByb3BlcnR5LCB7XG4gICAgICAgIGdldDogZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgaWYgKGlubmVyUHJvcGVydHkpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gc3ViT2JqW2lubmVyUHJvcGVydHldO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHN1Yk9ialtwcm9wZXJ0eV07XG4gICAgICAgICAgICB9XG4gICAgICAgIH0sXG4gICAgICAgIHNldDogZnVuY3Rpb24gKHZhbHVlKSB7XG4gICAgICAgICAgICBpZiAoaW5uZXJQcm9wZXJ0eSkge1xuICAgICAgICAgICAgICAgIHN1Yk9ialtpbm5lclByb3BlcnR5XSA9IHZhbHVlO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICAgICAgc3ViT2JqW3Byb3BlcnR5XSA9IHZhbHVlO1xuICAgICAgICAgICAgfVxuICAgICAgICB9LFxuICAgICAgICBlbnVtZXJhYmxlOiB0cnVlLFxuICAgICAgICBjb25maWd1cmFibGU6IHRydWVcbiAgICB9KTtcbn1cblxudmFyIGd1aWQgPSAoZnVuY3Rpb24gKCkge1xuICAgIGZ1bmN0aW9uIHM0KCkge1xuICAgICAgICByZXR1cm4gTWF0aC5mbG9vcigoMSArIE1hdGgucmFuZG9tKCkpICogMHgxMDAwMClcbiAgICAgICAgICAgIC50b1N0cmluZygxNilcbiAgICAgICAgICAgIC5zdWJzdHJpbmcoMSk7XG4gICAgfVxuXG4gICAgcmV0dXJuIGZ1bmN0aW9uICgpIHtcbiAgICAgICAgcmV0dXJuIHM0KCkgKyBzNCgpICsgJy0nICsgczQoKSArICctJyArIHM0KCkgKyAnLScgK1xuICAgICAgICAgICAgczQoKSArICctJyArIHM0KCkgKyBzNCgpICsgczQoKTtcbiAgICB9O1xufSkoKTtcblxuZnVuY3Rpb24gd3JhcHBlZENhbGxiYWNrIChjYWxsYmFjaykge1xuICAgIHJldHVybiBmdW5jdGlvbiAoZXJyLCByZXMpIHtcbiAgICAgICAgaWYgKGNhbGxiYWNrKSBjYWxsYmFjayhlcnIsIHJlcyk7XG4gICAgfVxufVxuXG5leHBvcnRzLmFzc2VydCA9IGFzc2VydDtcbmV4cG9ydHMuZGVmaW5lU3ViUHJvcGVydHkgPSBkZWZpbmVTdWJQcm9wZXJ0eTtcbmV4cG9ydHMuZ3VpZCA9IGd1aWQ7XG5leHBvcnRzLndyYXBwZWRDYWxsYmFjayA9IHdyYXBwZWRDYWxsYmFjazsiLCJ2YXIgRXZlbnRFbWl0dGVyID0gcmVxdWlyZSgnZXZlbnRzJykuRXZlbnRFbWl0dGVyO1xudmFyIG5vdGlmaWNhdGlvbkNlbnRyZSA9IG5ldyBFdmVudEVtaXR0ZXIoKTtcbm5vdGlmaWNhdGlvbkNlbnRyZS5zZXRNYXhMaXN0ZW5lcnMoMTAwKTtcbnZhciBBcnJheU9ic2VydmVyID0gcmVxdWlyZSgnLi4vdmVuZG9yL29ic2VydmUtanMvc3JjL29ic2VydmUnKS5BcnJheU9ic2VydmVyO1xudmFyIGNvcmVDaGFuZ2VzID0gcmVxdWlyZSgnLi9jaGFuZ2VzJyk7XG52YXIgQ2hhbmdlVHlwZSA9IGNvcmVDaGFuZ2VzLkNoYW5nZVR5cGU7XG52YXIgbG9nID0gcmVxdWlyZSgnLi9vcGVyYXRpb24vbG9nJyk7XG5cbi8qKlxuKiBXcmFwcyB0aGUgbWV0aG9kcyBvZiBhIGphdmFzY3JpcHQgYXJyYXkgb2JqZWN0IHNvIHRoYXQgbm90aWZpY2F0aW9ucyBhcmUgc2VudFxuKiBvbiBjYWxscy5cbipcbiogQHBhcmFtIGFycmF5IHRoZSBhcnJheSB3ZSBoYXZlIHdyYXBwaW5nXG4qIEBwYXJhbSBmaWVsZCBuYW1lIG9mIHRoZSBmaWVsZFxuKiBAcGFyYW0gcmVzdE9iamVjdCB0aGUgb2JqZWN0IHRvIHdoaWNoIHRoaXMgYXJyYXkgaXMgYSBwcm9wZXJ0eVxuKi9cbmZ1bmN0aW9uIHdyYXBBcnJheShhcnJheSwgZmllbGQsIHNpZXN0YU1vZGVsKSB7XG4gICAgaWYgKCFhcnJheS5vYnNlcnZlcikge1xuICAgICAgICBhcnJheS5vYnNlcnZlciA9IG5ldyBBcnJheU9ic2VydmVyKGFycmF5KTtcbiAgICAgICAgYXJyYXkub2JzZXJ2ZXIub3BlbihmdW5jdGlvbiAoc3BsaWNlcykge1xuICAgICAgICAgICAgdmFyIGZpZWxkSXNBdHRyaWJ1dGUgPSBzaWVzdGFNb2RlbC5fZmllbGRzLmluZGV4T2YoZmllbGQpID4gLTE7XG4gICAgICAgICAgICBpZiAoZmllbGRJc0F0dHJpYnV0ZSkge1xuICAgICAgICAgICAgICAgIHNwbGljZXMuZm9yRWFjaChmdW5jdGlvbiAoc3BsaWNlKSB7XG4gICAgICAgICAgICAgICAgICAgIGNvcmVDaGFuZ2VzLnJlZ2lzdGVyQ2hhbmdlKHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbGxlY3Rpb246IHNpZXN0YU1vZGVsLmNvbGxlY3Rpb24sXG4gICAgICAgICAgICAgICAgICAgICAgICBtYXBwaW5nOiBzaWVzdGFNb2RlbC5tYXBwaW5nLnR5cGUsXG4gICAgICAgICAgICAgICAgICAgICAgICBfaWQ6IHNpZXN0YU1vZGVsLl9pZCxcbiAgICAgICAgICAgICAgICAgICAgICAgIGluZGV4OiBzcGxpY2UuaW5kZXgsXG4gICAgICAgICAgICAgICAgICAgICAgICByZW1vdmVkOiBzcGxpY2UucmVtb3ZlZCxcbiAgICAgICAgICAgICAgICAgICAgICAgIGFkZGVkOiBzcGxpY2UuYWRkZWRDb3VudCA/IGFycmF5LnNsaWNlKHNwbGljZS5pbmRleCwgc3BsaWNlLmluZGV4K3NwbGljZS5hZGRlZENvdW50KSA6IFtdLFxuICAgICAgICAgICAgICAgICAgICAgICAgdHlwZTogY29yZUNoYW5nZXMuQ2hhbmdlVHlwZS5TcGxpY2UsXG4gICAgICAgICAgICAgICAgICAgICAgICBmaWVsZDogZmllbGQsXG4gICAgICAgICAgICAgICAgICAgICAgICBvYmo6IHNpZXN0YU1vZGVsXG4gICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgfVxuICAgICAgICB9KTtcbiAgICAgICAgYXJyYXkuaXNGYXVsdCA9IGZhbHNlO1xuICAgIH1cbn1cblxuZXhwb3J0cy5ub3RpZmljYXRpb25DZW50cmUgPSBub3RpZmljYXRpb25DZW50cmU7XG5leHBvcnRzLndyYXBBcnJheSA9IHdyYXBBcnJheTsiLCJ2YXIgbG9nID0gcmVxdWlyZSgnLi9vcGVyYXRpb24vbG9nJyk7XG52YXIgTG9nZ2VyID0gbG9nLmxvZ2dlcldpdGhOYW1lKCdTaWVzdGFNb2RlbCcpO1xuTG9nZ2VyLnNldExldmVsKGxvZy5MZXZlbC53YXJuKTtcblxudmFyIGRlZmluZVN1YlByb3BlcnR5ID0gcmVxdWlyZSgnLi9taXNjJykuZGVmaW5lU3ViUHJvcGVydHk7XG4vL3ZhciBPcGVyYXRpb25RdWV1ZSA9IHJlcXVpcmUoJy4uL3ZlbmRvci9vcGVyYXRpb25zLmpzL3NyYy9xdWV1ZScpLk9wZXJhdGlvblF1ZXVlO1xudmFyIHV0aWwgPSByZXF1aXJlKCcuL3V0aWwnKTtcbnZhciBfID0gdXRpbC5fO1xudmFyIGVycm9yID0gcmVxdWlyZSgnLi9lcnJvcicpO1xudmFyIEludGVybmFsU2llc3RhRXJyb3IgPSBlcnJvci5JbnRlcm5hbFNpZXN0YUVycm9yO1xudmFyIGNvcmVDaGFuZ2VzID0gcmVxdWlyZSgnLi9jaGFuZ2VzJyk7XG5cbnZhciBjYWNoZSA9IHJlcXVpcmUoJy4vY2FjaGUnKTtcblxuLy92YXIgcXVldWVzID0ge307XG5cbmZ1bmN0aW9uIFNpZXN0YU1vZGVsKG1hcHBpbmcpIHtcblxuICAgIGlmICghdGhpcykge1xuICAgICAgICByZXR1cm4gbmV3IFNpZXN0YU1vZGVsKG1hcHBpbmcpO1xuICAgIH1cbiAgICB2YXIgc2VsZiA9IHRoaXM7XG4gICAgdGhpcy5tYXBwaW5nID0gbWFwcGluZztcbiAgICBPYmplY3QuZGVmaW5lUHJvcGVydHkodGhpcywgJ2lkRmllbGQnLCB7XG4gICAgICAgIGdldDogZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICByZXR1cm4gc2VsZi5tYXBwaW5nLmlkID8gc2VsZi5tYXBwaW5nLmlkIDogJ2lkJztcbiAgICAgICAgfSxcbiAgICAgICAgZW51bWVyYWJsZTogdHJ1ZSxcbiAgICAgICAgY29uZmlndXJhYmxlOiB0cnVlXG4gICAgfSk7XG4gICAgZGVmaW5lU3ViUHJvcGVydHkuY2FsbCh0aGlzLCAndHlwZScsIHRoaXMubWFwcGluZyk7XG4gICAgZGVmaW5lU3ViUHJvcGVydHkuY2FsbCh0aGlzLCAnY29sbGVjdGlvbicsIHRoaXMubWFwcGluZyk7XG4gICAgZGVmaW5lU3ViUHJvcGVydHkuY2FsbCh0aGlzLCAnX2ZpZWxkcycsIHRoaXMubWFwcGluZyk7XG4gICAgT2JqZWN0LmRlZmluZVByb3BlcnR5KHRoaXMsICdfcmVsYXRpb25zaGlwRmllbGRzJywge1xuICAgICAgICBnZXQ6IGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgcmV0dXJuIF8ubWFwKHNlbGYuX3Byb3hpZXMsIGZ1bmN0aW9uKHApIHtcbiAgICAgICAgICAgICAgICBpZiAocC5pc0ZvcndhcmQpIHtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHAuZm9yd2FyZE5hbWU7XG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHAucmV2ZXJzZU5hbWU7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSk7XG4gICAgICAgIH0sXG4gICAgICAgIGVudW1lcmFibGU6IHRydWUsXG4gICAgICAgIGNvbmZpZ3VyYWJsZTogdHJ1ZVxuICAgIH0pO1xuXG5cbiAgICB0aGlzLmlzRmF1bHQgPSBmYWxzZTtcblxuICAgIE9iamVjdC5kZWZpbmVQcm9wZXJ0eSh0aGlzLCAnaXNTYXZlZCcsIHtcbiAgICAgICAgZ2V0OiBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgIHJldHVybiAhIXNlbGYuX3JldjtcbiAgICAgICAgfSxcbiAgICAgICAgZW51bWVyYWJsZTogdHJ1ZSxcbiAgICAgICAgY29uZmlndXJhYmxlOiB0cnVlXG4gICAgfSk7XG5cbiAgICB0aGlzLl9yZXYgPSBudWxsO1xuXG4gICAgdGhpcy5yZW1vdmVkID0gZmFsc2U7XG59XG5cbi8qKlxuICogSHVtYW4gcmVhZGFibGUgZHVtcCBvZiB0aGlzIG9iamVjdFxuICogQHJldHVybnMgeyp9XG4gKiBAcHJpdmF0ZVxuICovXG5TaWVzdGFNb2RlbC5wcm90b3R5cGUuX2R1bXAgPSBmdW5jdGlvbihhc0pzb24pIHtcbiAgICB2YXIgc2VsZiA9IHRoaXM7XG4gICAgdmFyIGNsZWFuT2JqID0ge307XG4gICAgY2xlYW5PYmoubWFwcGluZyA9IHRoaXMubWFwcGluZy50eXBlO1xuICAgIGNsZWFuT2JqLmNvbGxlY3Rpb24gPSB0aGlzLmNvbGxlY3Rpb247XG4gICAgY2xlYW5PYmouX2lkID0gdGhpcy5faWQ7XG4gICAgY2xlYW5PYmogPSBfLnJlZHVjZSh0aGlzLl9maWVsZHMsIGZ1bmN0aW9uKG1lbW8sIGYpIHtcbiAgICAgICAgaWYgKHNlbGZbZl0pIHtcbiAgICAgICAgICAgIG1lbW9bZl0gPSBzZWxmW2ZdO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBtZW1vO1xuICAgIH0sIGNsZWFuT2JqKTtcbiAgICBjbGVhbk9iaiA9IF8ucmVkdWNlKHRoaXMuX3JlbGF0aW9uc2hpcEZpZWxkcywgZnVuY3Rpb24obWVtbywgZikge1xuICAgICAgICBpZiAoc2VsZltmICsgJ1Byb3h5J10pIHtcbiAgICAgICAgICAgIGlmIChzZWxmW2YgKyAnUHJveHknXS5oYXNPd25Qcm9wZXJ0eSgnX2lkJykpIHtcbiAgICAgICAgICAgICAgICBpZiAodXRpbC5pc0FycmF5KHNlbGZbZiArICdQcm94eSddLl9pZCkpIHtcbiAgICAgICAgICAgICAgICAgICAgaWYgKHNlbGZbZl0ubGVuZ3RoKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBtZW1vW2ZdID0gc2VsZltmICsgJ1Byb3h5J10uX2lkO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfSBlbHNlIGlmIChzZWxmW2YgKyAnUHJveHknXS5faWQpIHtcbiAgICAgICAgICAgICAgICAgICAgbWVtb1tmXSA9IHNlbGZbZiArICdQcm94eSddLl9pZDtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIG1lbW9bZl0gPSBzZWxmW2ZdO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIHJldHVybiBtZW1vO1xuICAgIH0sIGNsZWFuT2JqKTtcblxuICAgIHJldHVybiBhc0pzb24gPyBKU09OLnN0cmluZ2lmeShjbGVhbk9iaiwgbnVsbCwgNCkgOiBjbGVhbk9iajtcbn07XG5cblxuU2llc3RhTW9kZWwucHJvdG90eXBlLmdldCA9IGZ1bmN0aW9uKGNhbGxiYWNrKSB7XG4gICAgdmFyIGRlZmVycmVkID0gd2luZG93LnEgPyB3aW5kb3cucS5kZWZlcigpIDogbnVsbDtcbiAgICBjYWxsYmFjayA9IHV0aWwuY29uc3RydWN0Q2FsbGJhY2tBbmRQcm9taXNlSGFuZGxlcihjYWxsYmFjaywgZGVmZXJyZWQpO1xuICAgIGNhbGxiYWNrKG51bGwsIHRoaXMpO1xuICAgIHJldHVybiBkZWZlcnJlZCA/IGRlZmVycmVkLnByb21pc2UgOiBudWxsO1xufTtcblxuU2llc3RhTW9kZWwucHJvdG90eXBlLnJlbW92ZSA9IGZ1bmN0aW9uKGNhbGxiYWNrKSB7XG4gICAgdmFyIGRlZmVycmVkID0gd2luZG93LnEgPyB3aW5kb3cucS5kZWZlcigpIDogbnVsbDtcbiAgICBjYWxsYmFjayA9IHV0aWwuY29uc3RydWN0Q2FsbGJhY2tBbmRQcm9taXNlSGFuZGxlcihjYWxsYmFjaywgZGVmZXJyZWQpO1xuICAgIGNhY2hlLnJlbW92ZSh0aGlzKTtcbiAgICB0aGlzLnJlbW92ZWQgPSB0cnVlO1xuICAgIGNvcmVDaGFuZ2VzLnJlZ2lzdGVyQ2hhbmdlKHtcbiAgICAgICAgY29sbGVjdGlvbjogdGhpcy5jb2xsZWN0aW9uLFxuICAgICAgICBtYXBwaW5nOiB0aGlzLm1hcHBpbmcudHlwZSxcbiAgICAgICAgX2lkOiB0aGlzLl9pZCxcbiAgICAgICAgb2xkSWQ6IHRoaXMuX2lkLFxuICAgICAgICBvbGQ6IHRoaXMsXG4gICAgICAgIHR5cGU6IGNvcmVDaGFuZ2VzLkNoYW5nZVR5cGUuUmVtb3ZlLFxuICAgICAgICBvYmo6IHRoaXNcbiAgICB9KTtcbiAgICBjYWxsYmFjayhudWxsLCB0aGlzKTtcbiAgICByZXR1cm4gZGVmZXJyZWQgPyBkZWZlcnJlZC5wcm9taXNlIDogbnVsbDtcbn1cblxuU2llc3RhTW9kZWwucHJvdG90eXBlLnJlc3RvcmUgPSBmdW5jdGlvbihjYWxsYmFjaykge1xuICAgIHZhciBkZWZlcnJlZCA9IHdpbmRvdy5xID8gd2luZG93LnEuZGVmZXIoKSA6IG51bGw7XG4gICAgY2FsbGJhY2sgPSB1dGlsLmNvbnN0cnVjdENhbGxiYWNrQW5kUHJvbWlzZUhhbmRsZXIoY2FsbGJhY2ssIGRlZmVycmVkKTtcbiAgICBpZiAodGhpcy5yZW1vdmVkKSB7XG4gICAgICAgIGNhY2hlLmluc2VydCh0aGlzKTtcbiAgICAgICAgdGhpcy5yZW1vdmVkID0gZmFsc2U7XG4gICAgfVxuICAgIGNvcmVDaGFuZ2VzLnJlZ2lzdGVyQ2hhbmdlKHtcbiAgICAgICAgY29sbGVjdGlvbjogdGhpcy5jb2xsZWN0aW9uLFxuICAgICAgICBtYXBwaW5nOiB0aGlzLm1hcHBpbmcudHlwZSxcbiAgICAgICAgX2lkOiB0aGlzLl9pZCxcbiAgICAgICAgbmV3SWQ6IHRoaXMuX2lkLFxuICAgICAgICBuZXc6IHRoaXMsXG4gICAgICAgIHR5cGU6IGNvcmVDaGFuZ2VzLkNoYW5nZVR5cGUuTmV3LFxuICAgICAgICBvYmo6IHRoaXNcbiAgICB9KTtcbiAgICBjYWxsYmFjayhudWxsLCB0aGlzKTtcbiAgICByZXR1cm4gZGVmZXJyZWQgPyBkZWZlcnJlZC5wcm9taXNlIDogbnVsbDtcbn1cblxuZXhwb3J0cy5TaWVzdGFNb2RlbCA9IFNpZXN0YU1vZGVsO1xuZXhwb3J0cy5kdW1wU2F2ZVF1ZXVlcyA9IGZ1bmN0aW9uKCkge1xuICAgIHZhciBkdW1wZWQgPSB7fTtcbiAgICBmb3IgKHZhciBpZCBpbiBxdWV1ZXMpIHtcbiAgICAgICAgaWYgKHF1ZXVlcy5oYXNPd25Qcm9wZXJ0eShpZCkpIHtcbiAgICAgICAgICAgIHZhciBxdWV1ZSA9IHF1ZXVlc1tpZF07XG4gICAgICAgICAgICBkdW1wZWRbaWRdID0ge1xuICAgICAgICAgICAgICAgIG51bVJ1bm5pbmc6IHF1ZXVlLm51bVJ1bm5pbmdPcGVyYXRpb25zLFxuICAgICAgICAgICAgICAgIHF1ZXVlZDogcXVldWUuX3F1ZXVlZE9wZXJhdGlvbnMubGVuZ3RoXG4gICAgICAgICAgICB9O1xuICAgICAgICB9XG4gICAgfVxuICAgIHJldHVybiBkdW1wZWQ7XG59OyIsIi8qKlxuICogQG1vZHVsZSByZWxhdGlvbnNoaXBzXG4gKi9cblxudmFyIHByb3h5ID0gcmVxdWlyZSgnLi9wcm94eScpXG4gICAgLCBSZWxhdGlvbnNoaXBQcm94eSA9IHByb3h5LlJlbGF0aW9uc2hpcFByb3h5XG4gICAgLCBTdG9yZSA9IHJlcXVpcmUoJy4vc3RvcmUnKVxuICAgICwgdXRpbCA9IHJlcXVpcmUoJy4vdXRpbCcpXG4gICAgLCBfID0gdXRpbC5fXG4gICAgLCBJbnRlcm5hbFNpZXN0YUVycm9yID0gcmVxdWlyZSgnLi9lcnJvcicpLkludGVybmFsU2llc3RhRXJyb3JcbiAgICAsIGNvcmVDaGFuZ2VzID0gcmVxdWlyZSgnLi9jaGFuZ2VzJylcbiAgICAsIFNpZXN0YU1vZGVsID0gcmVxdWlyZSgnLi9vYmplY3QnKS5TaWVzdGFNb2RlbFxuICAgICwgbm90aWZpY2F0aW9uQ2VudHJlID0gcmVxdWlyZSgnLi9ub3RpZmljYXRpb25DZW50cmUnKVxuICAgICwgd3JhcEFycmF5Rm9yQXR0cmlidXRlcyA9IG5vdGlmaWNhdGlvbkNlbnRyZS53cmFwQXJyYXlcbiAgICAsIEFycmF5T2JzZXJ2ZXIgPSByZXF1aXJlKCcuLi92ZW5kb3Ivb2JzZXJ2ZS1qcy9zcmMvb2JzZXJ2ZScpLkFycmF5T2JzZXJ2ZXJcbiAgICAsIENoYW5nZVR5cGUgPSByZXF1aXJlKCcuL2NoYW5nZXMnKS5DaGFuZ2VUeXBlXG4gICAgO1xuXG4vKipcbiAqIEBjbGFzcyAgW09uZVRvTWFueVByb3h5IGRlc2NyaXB0aW9uXVxuICogQGNvbnN0cnVjdG9yXG4gKiBAcGFyYW0ge1t0eXBlXX0gb3B0c1xuICovXG5mdW5jdGlvbiBPbmVUb01hbnlQcm94eShvcHRzKSB7XG4gICAgUmVsYXRpb25zaGlwUHJveHkuY2FsbCh0aGlzLCBvcHRzKTtcblxuICAgIHZhciBzZWxmID0gdGhpcztcbiAgICBPYmplY3QuZGVmaW5lUHJvcGVydHkodGhpcywgJ2lzRmF1bHQnLCB7XG4gICAgICAgIGdldDogZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgaWYgKHNlbGYuaXNGb3J3YXJkKSB7XG4gICAgICAgICAgICAgICAgaWYgKHNlbGYuX2lkKSB7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiAhc2VsZi5yZWxhdGVkO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBlbHNlIGlmIChzZWxmLl9pZCA9PT0gbnVsbCkge1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIHJldHVybiB0cnVlO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICAgICAgaWYgKHNlbGYuX2lkKSB7XG4gICAgICAgICAgICAgICAgICAgIGlmIChzZWxmLnJlbGF0ZWQpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmIChzZWxmLl9pZC5sZW5ndGggIT0gc2VsZi5yZWxhdGVkLmxlbmd0aCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHZhbGlkYXRlUmVsYXRlZC5jYWxsKHRoaXMpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiB0cnVlO1xuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiB0cnVlO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSxcbiAgICAgICAgc2V0OiBmdW5jdGlvbiAodikge1xuICAgICAgICAgICAgaWYgKHYpIHtcbiAgICAgICAgICAgICAgICBzZWxmLl9pZCA9IHVuZGVmaW5lZDtcbiAgICAgICAgICAgICAgICBzZWxmLnJlbGF0ZWQgPSBudWxsO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICAgICAgaWYgKCFzZWxmLl9pZCkge1xuICAgICAgICAgICAgICAgICAgICBpZiAoc2VsZi5pc0ZvcndhcmQpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHNlbGYuX2lkID0gbnVsbDtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHNlbGYuX2lkID0gW107XG4gICAgICAgICAgICAgICAgICAgICAgICBzZWxmLnJlbGF0ZWQgPSBbXTtcbiAgICAgICAgICAgICAgICAgICAgICAgIHdyYXBBcnJheS5jYWxsKHNlbGYsIHNlbGYucmVsYXRlZCk7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9KTtcbiAgICB0aGlzLl9yZXZlcnNlSXNBcnJheSA9IHRydWU7XG4gICAgdGhpcy5fZm9yd2FyZElzQXJyYXkgPSBmYWxzZTtcbn1cblxuT25lVG9NYW55UHJveHkucHJvdG90eXBlID0gT2JqZWN0LmNyZWF0ZShSZWxhdGlvbnNoaXBQcm94eS5wcm90b3R5cGUpO1xuXG5cbmZ1bmN0aW9uIGNsZWFyUmV2ZXJzZShyZW1vdmVkKSB7XG4gICAgdmFyIHNlbGYgPSB0aGlzO1xuICAgIF8uZWFjaChyZW1vdmVkLCBmdW5jdGlvbiAocmVtb3ZlZE9iamVjdCkge1xuICAgICAgICB2YXIgcmV2ZXJzZVByb3h5ID0gcHJveHkuZ2V0UmV2ZXJzZVByb3h5Rm9yT2JqZWN0LmNhbGwoc2VsZiwgcmVtb3ZlZE9iamVjdCk7XG4gICAgICAgIHByb3h5LnNldC5jYWxsKHJldmVyc2VQcm94eSwgbnVsbCk7XG4gICAgfSk7XG59XG5cbmZ1bmN0aW9uIHNldFJldmVyc2UoYWRkZWQpIHtcbiAgICB2YXIgc2VsZiA9IHRoaXM7XG4gICAgXy5lYWNoKGFkZGVkLCBmdW5jdGlvbiAoYWRkZWQpIHtcbiAgICAgICAgdmFyIGZvcndhcmRQcm94eSA9IHByb3h5LmdldFJldmVyc2VQcm94eUZvck9iamVjdC5jYWxsKHNlbGYsIGFkZGVkKTtcbiAgICAgICAgcHJveHkuc2V0LmNhbGwoZm9yd2FyZFByb3h5LCBzZWxmLm9iamVjdCk7XG4gICAgfSk7XG59XG5cbmZ1bmN0aW9uIHdyYXBBcnJheShhcnIpIHtcbiAgICB2YXIgc2VsZiA9IHRoaXM7XG4gICAgd3JhcEFycmF5Rm9yQXR0cmlidXRlcyhhcnIsIHRoaXMucmV2ZXJzZU5hbWUsIHRoaXMub2JqZWN0KTtcbiAgICBpZiAoIWFyci5vbmVUb01hbnlPYnNlcnZlcikge1xuICAgICAgICBhcnIub25lVG9NYW55T2JzZXJ2ZXIgPSBuZXcgQXJyYXlPYnNlcnZlcihhcnIpO1xuICAgICAgICB2YXIgb2JzZXJ2ZXJGdW5jdGlvbiA9IGZ1bmN0aW9uIChzcGxpY2VzKSB7XG4gICAgICAgICAgICBzcGxpY2VzLmZvckVhY2goZnVuY3Rpb24gKHNwbGljZSkge1xuICAgICAgICAgICAgICAgIHZhciBhZGRlZCA9IHNwbGljZS5hZGRlZENvdW50ID8gYXJyLnNsaWNlKHNwbGljZS5pbmRleCwgc3BsaWNlLmluZGV4ICsgc3BsaWNlLmFkZGVkQ291bnQpIDogW107XG4gICAgICAgICAgICAgICAgdmFyIHJlbW92ZWQgPSBzcGxpY2UucmVtb3ZlZDtcbiAgICAgICAgICAgICAgICBjbGVhclJldmVyc2UuY2FsbChzZWxmLCByZW1vdmVkKTtcbiAgICAgICAgICAgICAgICBzZXRSZXZlcnNlLmNhbGwoc2VsZiwgYWRkZWQpO1xuICAgICAgICAgICAgICAgIHZhciBtYXBwaW5nID0gcHJveHkuZ2V0Rm9yd2FyZE1hcHBpbmcuY2FsbChzZWxmKTtcbiAgICAgICAgICAgICAgICBjb3JlQ2hhbmdlcy5yZWdpc3RlckNoYW5nZSh7XG4gICAgICAgICAgICAgICAgICAgIGNvbGxlY3Rpb246IG1hcHBpbmcuY29sbGVjdGlvbixcbiAgICAgICAgICAgICAgICAgICAgbWFwcGluZzogbWFwcGluZy50eXBlLFxuICAgICAgICAgICAgICAgICAgICBfaWQ6IHNlbGYub2JqZWN0Ll9pZCxcbiAgICAgICAgICAgICAgICAgICAgZmllbGQ6IHByb3h5LmdldEZvcndhcmROYW1lLmNhbGwoc2VsZiksXG4gICAgICAgICAgICAgICAgICAgIHJlbW92ZWQ6IHJlbW92ZWQsXG4gICAgICAgICAgICAgICAgICAgIGFkZGVkOiBhZGRlZCxcbiAgICAgICAgICAgICAgICAgICAgcmVtb3ZlZElkOiBfLnBsdWNrKHJlbW92ZWQsICdfaWQnKSxcbiAgICAgICAgICAgICAgICAgICAgYWRkZWRJZDogXy5wbHVjayhhZGRlZCwgJ19pZCcpLFxuICAgICAgICAgICAgICAgICAgICB0eXBlOiBDaGFuZ2VUeXBlLlNwbGljZSxcbiAgICAgICAgICAgICAgICAgICAgaW5kZXg6IHNwbGljZS5pbmRleCxcbiAgICAgICAgICAgICAgICAgICAgb2JqOiBzZWxmLm9iamVjdFxuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgIH07XG4gICAgICAgIGFyci5vbmVUb01hbnlPYnNlcnZlci5vcGVuKG9ic2VydmVyRnVuY3Rpb24pO1xuICAgIH1cbn1cblxuXG5PbmVUb01hbnlQcm94eS5wcm90b3R5cGUuZ2V0ID0gZnVuY3Rpb24gKGNhbGxiYWNrKSB7XG4gICAgdmFyIGRlZmVycmVkID0gd2luZG93LnEgPyB3aW5kb3cucS5kZWZlcigpIDogbnVsbDtcbiAgICBjYWxsYmFjayA9IHV0aWwuY29uc3RydWN0Q2FsbGJhY2tBbmRQcm9taXNlSGFuZGxlcihjYWxsYmFjaywgZGVmZXJyZWQpO1xuICAgIHZhciBzZWxmID0gdGhpcztcbiAgICBpZiAodGhpcy5pc0ZhdWx0KSB7XG4gICAgICAgIGlmICh0aGlzLl9pZC5sZW5ndGgpIHtcbiAgICAgICAgICAgIHZhciBzdG9yZU9wdHMgPSB7X2lkOiB0aGlzLl9pZH07XG4gICAgICAgICAgICBTdG9yZS5nZXQoc3RvcmVPcHRzLCBmdW5jdGlvbiAoZXJyLCBzdG9yZWQpIHtcbiAgICAgICAgICAgICAgICBpZiAoZXJyKSB7XG4gICAgICAgICAgICAgICAgICAgIGlmIChjYWxsYmFjaykgY2FsbGJhY2soZXJyKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgIHNlbGYucmVsYXRlZCA9IHN0b3JlZDtcbiAgICAgICAgICAgICAgICAgICAgaWYgKGNhbGxiYWNrKSBjYWxsYmFjayhudWxsLCBzdG9yZWQpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9XG4gICAgICAgIGVsc2UgaWYgKGNhbGxiYWNrKSB7XG4gICAgICAgICAgICBjYWxsYmFjayhudWxsLCB0aGlzLnJlbGF0ZWQpO1xuICAgICAgICB9XG4gICAgfVxuICAgIGVsc2Uge1xuICAgICAgICBpZiAoY2FsbGJhY2spIGNhbGxiYWNrKG51bGwsIHRoaXMucmVsYXRlZCk7XG4gICAgfVxuICAgIHJldHVybiBkZWZlcnJlZCA/IGRlZmVycmVkLnByb21pc2UgOiBudWxsO1xufTtcblxuLyoqXG4gKiBWYWxpZGF0ZSB0aGUgb2JqZWN0IHRoYXQgd2UncmUgc2V0dGluZ1xuICogQHBhcmFtIG9ialxuICogQHJldHVybnMge3N0cmluZ3xudWxsfSBBbiBlcnJvciBtZXNzYWdlIG9yIG51bGxcbiAqL1xuZnVuY3Rpb24gdmFsaWRhdGUob2JqKSB7XG4gICAgdmFyIHN0ciA9IE9iamVjdC5wcm90b3R5cGUudG9TdHJpbmcuY2FsbChvYmopO1xuICAgIGlmICh0aGlzLmlzRm9yd2FyZCkge1xuICAgICAgICBpZiAoc3RyID09ICdbb2JqZWN0IEFycmF5XScpIHtcbiAgICAgICAgICAgIHJldHVybiAnQ2Fubm90IGFzc2lnbiBhcnJheSBmb3J3YXJkIG9uZVRvTWFueSAoJyArIHN0ciArICcpOiAnICsgdGhpcy5mb3J3YXJkTmFtZTtcbiAgICAgICAgfVxuICAgIH1cbiAgICBlbHNlIHtcbiAgICAgICAgaWYgKHN0ciAhPSAnW29iamVjdCBBcnJheV0nKSB7XG4gICAgICAgICAgICByZXR1cm4gJ0Nhbm5vdCBzY2FsYXIgdG8gcmV2ZXJzZSBvbmVUb01hbnkgKCcgKyBzdHIgKyAnKTogJyArIHRoaXMucmV2ZXJzZU5hbWU7XG4gICAgICAgIH1cbiAgICB9XG4gICAgcmV0dXJuIG51bGw7XG59XG5cbmZ1bmN0aW9uIHZhbGlkYXRlUmVsYXRlZCgpIHtcbiAgICB2YXIgc2VsZiA9IHRoaXM7XG4gICAgaWYgKHNlbGYuX2lkKSB7XG4gICAgICAgIGlmIChzZWxmLnJlbGF0ZWQpIHtcbiAgICAgICAgICAgIGlmIChzZWxmLl9pZC5sZW5ndGggIT0gc2VsZi5yZWxhdGVkLmxlbmd0aCkge1xuICAgICAgICAgICAgICAgIGlmIChzZWxmLnJlbGF0ZWQubGVuZ3RoID4gMCkge1xuICAgICAgICAgICAgICAgICAgICB0aHJvdyBuZXcgSW50ZXJuYWxTaWVzdGFFcnJvcignX2lkIGFuZCByZWxhdGVkIGFyZSBzb21laG93IG91dCBvZiBzeW5jJyk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfVxufVxuXG5PbmVUb01hbnlQcm94eS5wcm90b3R5cGUuc2V0ID0gZnVuY3Rpb24gKG9iaikge1xuICAgIHByb3h5LmNoZWNrSW5zdGFsbGVkLmNhbGwodGhpcyk7XG4gICAgdmFyIHNlbGYgPSB0aGlzO1xuICAgIGlmIChvYmopIHtcbiAgICAgICAgdmFyIGVycm9yTWVzc2FnZTtcbiAgICAgICAgaWYgKGVycm9yTWVzc2FnZSA9IHZhbGlkYXRlLmNhbGwodGhpcywgb2JqKSkge1xuICAgICAgICAgICAgcmV0dXJuIGVycm9yTWVzc2FnZTtcbiAgICAgICAgfVxuICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgIHByb3h5LmNsZWFyUmV2ZXJzZVJlbGF0ZWQuY2FsbCh0aGlzKTtcbiAgICAgICAgICAgIHByb3h5LnNldC5jYWxsKHNlbGYsIG9iaik7XG4gICAgICAgICAgICBpZiAoc2VsZi5pc1JldmVyc2UpIHtcbiAgICAgICAgICAgICAgICB3cmFwQXJyYXkuY2FsbCh0aGlzLCBzZWxmLnJlbGF0ZWQpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgcHJveHkuc2V0UmV2ZXJzZS5jYWxsKHNlbGYsIG9iaik7XG4gICAgICAgIH1cbiAgICB9XG4gICAgZWxzZSB7XG4gICAgICAgIHByb3h5LmNsZWFyUmV2ZXJzZVJlbGF0ZWQuY2FsbCh0aGlzKTtcbiAgICAgICAgcHJveHkuc2V0LmNhbGwoc2VsZiwgb2JqKTtcbiAgICB9XG59O1xuXG5PbmVUb01hbnlQcm94eS5wcm90b3R5cGUuaW5zdGFsbCA9IGZ1bmN0aW9uIChvYmopIHtcbiAgICBSZWxhdGlvbnNoaXBQcm94eS5wcm90b3R5cGUuaW5zdGFsbC5jYWxsKHRoaXMsIG9iaik7XG4gICAgaWYgKHRoaXMuaXNSZXZlcnNlKSB7XG4gICAgICAgIG9ialsgKCdzcGxpY2UnICsgdXRpbC5jYXBpdGFsaXNlRmlyc3RMZXR0ZXIodGhpcy5yZXZlcnNlTmFtZSkpXSA9IF8uYmluZChwcm94eS5zcGxpY2UsIHRoaXMpO1xuICAgIH1cbn07XG5cblxuZXhwb3J0cy5PbmVUb01hbnlQcm94eSA9IE9uZVRvTWFueVByb3h5OyIsIi8qKlxuICogQG1vZHVsZSByZWxhdGlvbnNoaXBzXG4gKi9cblxudmFyIHByb3h5ID0gcmVxdWlyZSgnLi9wcm94eScpXG4gICAgLCBSZWxhdGlvbnNoaXBQcm94eSA9IHByb3h5LlJlbGF0aW9uc2hpcFByb3h5XG4gICAgLCBTdG9yZSA9IHJlcXVpcmUoJy4vc3RvcmUnKVxuICAgICwgdXRpbCA9IHJlcXVpcmUoJy4vdXRpbCcpXG4gICAgLCBJbnRlcm5hbFNpZXN0YUVycm9yID0gcmVxdWlyZSgnLi9lcnJvcicpLkludGVybmFsU2llc3RhRXJyb3JcbiAgICAsIFNpZXN0YU1vZGVsID0gcmVxdWlyZSgnLi9vYmplY3QnKS5TaWVzdGFNb2RlbDtcblxuLyoqXG4gKiBbT25lVG9PbmVQcm94eSBkZXNjcmlwdGlvbl1cbiAqIEBwYXJhbSB7T2JqZWN0fSBvcHRzXG4gKi9cbmZ1bmN0aW9uIE9uZVRvT25lUHJveHkob3B0cykge1xuICAgIFJlbGF0aW9uc2hpcFByb3h5LmNhbGwodGhpcywgb3B0cyk7XG4gICAgdGhpcy5fcmV2ZXJzZUlzQXJyYXkgPSBmYWxzZTtcbiAgICB0aGlzLl9mb3J3YXJkSXNBcnJheSA9IGZhbHNlO1xufVxuXG5PbmVUb09uZVByb3h5LnByb3RvdHlwZSA9IE9iamVjdC5jcmVhdGUoUmVsYXRpb25zaGlwUHJveHkucHJvdG90eXBlKTtcblxuLyoqXG4gKiBWYWxpZGF0ZSB0aGUgb2JqZWN0IHRoYXQgd2UncmUgc2V0dGluZ1xuICogQHBhcmFtIG9ialxuICogQHJldHVybnMge3N0cmluZ3xudWxsfSBBbiBlcnJvciBtZXNzYWdlIG9yIG51bGxcbiAqL1xuZnVuY3Rpb24gdmFsaWRhdGUob2JqKSB7XG4gICAgaWYgKE9iamVjdC5wcm90b3R5cGUudG9TdHJpbmcuY2FsbChvYmopID09ICdbb2JqZWN0IEFycmF5XScpIHtcbiAgICAgICAgcmV0dXJuICdDYW5ub3QgYXNzaWduIGFycmF5IHRvIG9uZSB0byBvbmUgcmVsYXRpb25zaGlwJztcbiAgICB9XG4gICAgZWxzZSBpZiAoKCFvYmogaW5zdGFuY2VvZiBTaWVzdGFNb2RlbCkpIHtcblxuICAgIH1cbiAgICByZXR1cm4gbnVsbDtcbn1cblxuT25lVG9PbmVQcm94eS5wcm90b3R5cGUuc2V0ID0gZnVuY3Rpb24gKG9iaikge1xuICAgIHByb3h5LmNoZWNrSW5zdGFsbGVkLmNhbGwodGhpcyk7XG4gICAgdmFyIHNlbGYgPSB0aGlzO1xuICAgIGlmIChvYmopIHtcbiAgICAgICAgdmFyIGVycm9yTWVzc2FnZTtcbiAgICAgICAgaWYgKGVycm9yTWVzc2FnZSA9IHZhbGlkYXRlKG9iaikpIHtcbiAgICAgICAgICAgIHJldHVybiBlcnJvck1lc3NhZ2U7XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICBwcm94eS5jbGVhclJldmVyc2VSZWxhdGVkLmNhbGwodGhpcyk7XG4gICAgICAgICAgICBwcm94eS5zZXQuY2FsbChzZWxmLCBvYmopO1xuICAgICAgICAgICAgcHJveHkuc2V0UmV2ZXJzZS5jYWxsKHNlbGYsIG9iaik7XG4gICAgICAgIH1cbiAgICB9XG4gICAgZWxzZSB7XG4gICAgICAgIHByb3h5LmNsZWFyUmV2ZXJzZVJlbGF0ZWQuY2FsbCh0aGlzKTtcbiAgICAgICAgcHJveHkuc2V0LmNhbGwoc2VsZiwgb2JqKTtcbiAgICB9XG59O1xuXG5PbmVUb09uZVByb3h5LnByb3RvdHlwZS5nZXQgPSBmdW5jdGlvbiAoY2FsbGJhY2spIHtcbiAgICB2YXIgZGVmZXJyZWQgPSB3aW5kb3cucSA/IHdpbmRvdy5xLmRlZmVyKCkgOiBudWxsO1xuICAgIGNhbGxiYWNrID0gdXRpbC5jb25zdHJ1Y3RDYWxsYmFja0FuZFByb21pc2VIYW5kbGVyKGNhbGxiYWNrLCBkZWZlcnJlZCk7XG4gICAgdmFyIHNlbGYgPSB0aGlzO1xuICAgIGlmICh0aGlzLl9pZCkge1xuICAgICAgICBTdG9yZS5nZXQoe19pZDogdGhpcy5faWR9LCBmdW5jdGlvbiAoZXJyLCBzdG9yZWQpIHtcbiAgICAgICAgICAgIGlmIChlcnIpIHtcbiAgICAgICAgICAgICAgICBpZiAoY2FsbGJhY2spIGNhbGxiYWNrKGVycik7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgICAgICBzZWxmLnJlbGF0ZWQgPSBzdG9yZWQ7XG4gICAgICAgICAgICAgICAgaWYgKGNhbGxiYWNrKSBjYWxsYmFjayhudWxsLCBzdG9yZWQpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9KVxuICAgIH1cbiAgICByZXR1cm4gZGVmZXJyZWQgPyBkZWZlcnJlZC5wcm9taXNlIDogbnVsbDtcbn07XG5cbmV4cG9ydHMuT25lVG9PbmVQcm94eSA9IE9uZVRvT25lUHJveHk7IiwidmFyIF8gPSByZXF1aXJlKCcuLi91dGlsJykuXztcblxuZnVuY3Rpb24gTG9nZ2VyIChuYW1lKSB7XG4gICAgaWYgKCF0aGlzKSByZXR1cm4gbmV3IExvZ2dlcihuYW1lKTtcbiAgICB0aGlzLm5hbWUgPSBuYW1lO1xuXG4gICAgdGhpcy50cmFjZSA9IGNvbnN0cnVjdFBlcmZvcm1lcih0aGlzLCBfLmJpbmQoY29uc29sZS5kZWJ1ZyA/IGNvbnNvbGUuZGVidWcgOiBjb25zb2xlLmxvZywgY29uc29sZSksIExvZ2dlci5MZXZlbC50cmFjZSk7XG4gICAgdGhpcy5kZWJ1ZyA9IGNvbnN0cnVjdFBlcmZvcm1lcih0aGlzLCBfLmJpbmQoY29uc29sZS5kZWJ1ZyA/IGNvbnNvbGUuZGVidWcgIDogY29uc29sZS5sb2csIGNvbnNvbGUpLCBMb2dnZXIuTGV2ZWwuZGVidWcpO1xuICAgIHRoaXMuaW5mbyA9IGNvbnN0cnVjdFBlcmZvcm1lcih0aGlzLCBfLmJpbmQoY29uc29sZS5pbmZvID8gY29uc29sZS5pbmZvIDogY29uc29sZS5sb2csIGNvbnNvbGUpLCBMb2dnZXIuTGV2ZWwuaW5mbyk7XG4gICAgdGhpcy5sb2cgPSBjb25zdHJ1Y3RQZXJmb3JtZXIodGhpcywgXy5iaW5kKGNvbnNvbGUubG9nID8gY29uc29sZS5sb2cgOiBjb25zb2xlLmxvZywgY29uc29sZSksIExvZ2dlci5MZXZlbC5pbmZvKTtcbiAgICB0aGlzLndhcm4gPSBjb25zdHJ1Y3RQZXJmb3JtZXIodGhpcywgXy5iaW5kKGNvbnNvbGUud2FybiA/IGNvbnNvbGUud2FybiA6IGNvbnNvbGUubG9nLCBjb25zb2xlKSwgTG9nZ2VyLkxldmVsLndhcm5pbmcpO1xuICAgIHRoaXMuZXJyb3IgPSBjb25zdHJ1Y3RQZXJmb3JtZXIodGhpcywgXy5iaW5kKGNvbnNvbGUuZXJyb3IgPyBjb25zb2xlLmVycm9yIDogY29uc29sZS5sb2csIGNvbnNvbGUpLCBMb2dnZXIuTGV2ZWwuZXJyb3IpO1xuICAgIHRoaXMuZmF0YWwgPSBjb25zdHJ1Y3RQZXJmb3JtZXIodGhpcywgXy5iaW5kKGNvbnNvbGUuZXJyb3IgPyBjb25zb2xlLmVycm9yIDogY29uc29sZS5sb2csIGNvbnNvbGUpLCBMb2dnZXIuTGV2ZWwuZmF0YWwpO1xuXG59XG5cbnZhciBsb2dMZXZlbHMgPSB7fTtcblxuZnVuY3Rpb24gY29uc3RydWN0UGVyZm9ybWVyIChsb2dnZXIsIGYsIGxldmVsKSB7XG4gICAgdmFyIHBlcmZvcm1lciA9IGZ1bmN0aW9uIChtZXNzYWdlKSB7XG4gICAgICAgIGxvZ2dlci5wZXJmb3JtTG9nKGYsIGxldmVsLCBtZXNzYWdlLCBhcmd1bWVudHMpO1xuICAgIH07XG4gICAgT2JqZWN0LmRlZmluZVByb3BlcnR5KHBlcmZvcm1lciwgJ2lzRW5hYmxlZCcsIHtcbiAgICAgICAgZ2V0OiBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICB2YXIgY3VycmVudExldmVsID0gbG9nZ2VyLmN1cnJlbnRMZXZlbCgpO1xuICAgICAgICAgICAgcmV0dXJuIGxldmVsID49IGN1cnJlbnRMZXZlbDtcbiAgICAgICAgfSxcbiAgICAgICAgZW51bWVyYWJsZTogdHJ1ZSxcbiAgICAgICAgY29uZmlndXJhYmxlOiB0cnVlXG4gICAgfSk7XG4gICAgcGVyZm9ybWVyLmYgPSBmO1xuICAgIHBlcmZvcm1lci5sb2dnZXIgPSBsb2dnZXI7XG4gICAgcGVyZm9ybWVyLmxldmVsID0gbGV2ZWw7XG4gICAgcmV0dXJuIHBlcmZvcm1lcjtcbn1cblxuTG9nZ2VyLkxldmVsID0ge1xuICAgIHRyYWNlOiAwLFxuICAgIGRlYnVnOiAxLFxuICAgIGluZm86IDIsXG4gICAgd2FybmluZzogMyxcbiAgICB3YXJuOiAzLFxuICAgIGVycm9yOiA0LFxuICAgIGZhdGFsOiA1XG59O1xuXG5Mb2dnZXIuTGV2ZWxUZXh0ID0ge307XG5Mb2dnZXIuTGV2ZWxUZXh0IFtMb2dnZXIuTGV2ZWwudHJhY2VdID0gJ1RSQUNFJztcbkxvZ2dlci5MZXZlbFRleHQgW0xvZ2dlci5MZXZlbC5kZWJ1Z10gPSAnREVCVUcnO1xuTG9nZ2VyLkxldmVsVGV4dCBbTG9nZ2VyLkxldmVsLmluZm9dID0gJ0lORk8gJztcbkxvZ2dlci5MZXZlbFRleHQgW0xvZ2dlci5MZXZlbC53YXJuaW5nXSA9ICdXQVJOICc7XG5Mb2dnZXIuTGV2ZWxUZXh0IFtMb2dnZXIuTGV2ZWwuZXJyb3JdID0gJ0VSUk9SJztcblxuTG9nZ2VyLmxldmVsQXNUZXh0ID0gZnVuY3Rpb24gKGxldmVsKSB7XG4gICAgcmV0dXJuIHRoaXMuTGV2ZWxUZXh0W2xldmVsXTtcbn07XG5cbkxvZ2dlci5sb2dnZXJXaXRoTmFtZSA9IGZ1bmN0aW9uIChuYW1lKSB7XG4gICAgcmV0dXJuIG5ldyBMb2dnZXIobmFtZSk7XG59O1xuXG5Mb2dnZXIucHJvdG90eXBlLmN1cnJlbnRMZXZlbCA9IGZ1bmN0aW9uICgpIHtcbiAgICB2YXIgbG9nTGV2ZWwgPSBsb2dMZXZlbHNbdGhpcy5uYW1lXTtcbiAgICByZXR1cm4gIGxvZ0xldmVsID8gbG9nTGV2ZWwgOiBMb2dnZXIuTGV2ZWwudHJhY2U7XG59O1xuXG5Mb2dnZXIucHJvdG90eXBlLnNldExldmVsID0gZnVuY3Rpb24gKGxldmVsKSB7XG4gICAgbG9nTGV2ZWxzW3RoaXMubmFtZV0gPSBsZXZlbDtcbn07XG5cbkxvZ2dlci5wcm90b3R5cGUub3ZlcnJpZGUgPSBmdW5jdGlvbiAobGV2ZWwsIG92ZXJyaWRlLCBtZXNzYWdlKSB7XG4gICAgdmFyIGxldmVsQXNUZXh0ID0gTG9nZ2VyLmxldmVsQXNUZXh0KGxldmVsKTtcbiAgICB2YXIgcGVyZm9ybWVyID0gdGhpc1tsZXZlbEFzVGV4dC50cmltKCkudG9Mb3dlckNhc2UoKV07XG4gICAgdmFyIGYgPSBwZXJmb3JtZXIuZjtcbiAgICB2YXIgb3RoZXJBcmd1bWVudHMgPSBBcnJheS5wcm90b3R5cGUuc2xpY2UuY2FsbChhcmd1bWVudHMsIDMsIGFyZ3VtZW50cy5sZW5ndGgpO1xuICAgIHRoaXMucGVyZm9ybUxvZyhmLCBsZXZlbCwgbWVzc2FnZSwgb3RoZXJBcmd1bWVudHMsIG92ZXJyaWRlKTtcbn07XG5cbkxvZ2dlci5wcm90b3R5cGUucGVyZm9ybUxvZyA9IGZ1bmN0aW9uIChsb2dGdW5jLCBsZXZlbCwgbWVzc2FnZSwgb3RoZXJBcmd1bWVudHMsIG92ZXJyaWRlKSB7XG4gICAgdmFyIHNlbGYgPSB0aGlzO1xuICAgIHZhciBjdXJyZW50TGV2ZWwgPSBvdmVycmlkZSAhPT0gdW5kZWZpbmVkID8gb3ZlcnJpZGUgOiB0aGlzLmN1cnJlbnRMZXZlbCgpO1xuICAgIGlmIChjdXJyZW50TGV2ZWwgPD0gbGV2ZWwpIHtcbiAgICAgICAgbG9nRnVuYyA9IF8ucGFydGlhbChsb2dGdW5jLCBMb2dnZXIubGV2ZWxBc1RleHQobGV2ZWwpICsgJyBbJyArIHNlbGYubmFtZSArICddOiAnICsgbWVzc2FnZSk7XG4gICAgICAgIHZhciBhcmdzID0gW107XG4gICAgICAgIGZvciAodmFyIGk9MDsgaTxvdGhlckFyZ3VtZW50cy5sZW5ndGg7IGkrKykge1xuICAgICAgICAgICAgYXJnc1tpXSA9IG90aGVyQXJndW1lbnRzW2ldO1xuICAgICAgICB9XG4gICAgICAgIGFyZ3Muc3BsaWNlKDAsIDEpO1xuICAgICAgICBsb2dGdW5jLmFwcGx5KGxvZ0Z1bmMsIGFyZ3MpO1xuICAgIH1cbn07XG5cbm1vZHVsZS5leHBvcnRzID0gTG9nZ2VyO1xuIiwidmFyIGxvZyA9IHJlcXVpcmUoJy4vbG9nJyk7XG52YXIgTG9nZ2VyID0gbG9nLmxvZ2dlcldpdGhOYW1lKCdPcGVyYXRpb24nKTtcbnZhciBfID0gcmVxdWlyZSgnLi4vdXRpbCcpLl87XG5cbmZ1bmN0aW9uIE9wZXJhdGlvbigpIHtcbiAgICBpZiAoIXRoaXMpIHtcbiAgICAgICAgcmV0dXJuIG5ldyAoRnVuY3Rpb24ucHJvdG90eXBlLmJpbmQuYXBwbHkoT3BlcmF0aW9uLCBhcmd1bWVudHMpKTtcbiAgICB9XG4gICAgdmFyIHNlbGYgPSB0aGlzO1xuICAgIGlmIChhcmd1bWVudHMubGVuZ3RoKSB7XG4gICAgICAgIGlmICh0eXBlb2YoYXJndW1lbnRzWzBdKSA9PSAnc3RyaW5nJykge1xuICAgICAgICAgICAgdGhpcy5uYW1lID0gYXJndW1lbnRzWzBdO1xuICAgICAgICAgICAgdGhpcy53b3JrID0gYXJndW1lbnRzWzFdO1xuICAgICAgICAgICAgdGhpcy5jb21wbGV0aW9uID0gYXJndW1lbnRzWzJdO1xuICAgICAgICB9XG4gICAgICAgIGVsc2UgaWYgKHR5cGVvZihhcmd1bWVudHNbMF0pID09ICdmdW5jdGlvbicgfHxcbiAgICAgICAgICAgIE9iamVjdC5wcm90b3R5cGUudG9TdHJpbmcuY2FsbChhcmd1bWVudHNbMF0pID09PSAnW29iamVjdCBBcnJheV0nIHx8XG4gICAgICAgICAgICBhcmd1bWVudHNbMF0gaW5zdGFuY2VvZiBPcGVyYXRpb24pIHtcbiAgICAgICAgICAgIHRoaXMud29yayA9IGFyZ3VtZW50c1swXTtcbiAgICAgICAgICAgIHRoaXMuY29tcGxldGlvbiA9IGFyZ3VtZW50c1sxXTtcbiAgICAgICAgfVxuICAgIH1cbiAgICB0aGlzLmVycm9yID0gbnVsbDtcbiAgICB0aGlzLmNvbXBsZXRlZCA9IGZhbHNlO1xuICAgIHRoaXMucmVzdWx0ID0gbnVsbDtcbiAgICB0aGlzLnJ1bm5pbmcgPSBmYWxzZTtcbiAgICB0aGlzLmNhbmNlbGxlZCA9IGZhbHNlO1xuICAgIHRoaXMuZGVwZW5kZW5jaWVzID0gW107XG4gICAgdGhpcy5fbXVzdFN1Y2NlZWQgPSBbXTtcbiAgICB0aGlzLl9vbkNvbXBsZXRpb24gPSBbXTtcbiAgICB0aGlzLmxvZ0xldmVsID0gbnVsbDsgLy8gT3ZlcnJpZGUuXG5cbiAgICBPYmplY3QuZGVmaW5lUHJvcGVydHkodGhpcywgJ2ZhaWxlZCcsIHtcbiAgICAgICAgZ2V0OiBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICByZXR1cm4gICEhc2VsZi5lcnJvciB8fCBzZWxmLmZhaWxlZER1ZVRvRGVwZW5kZW5jeTtcbiAgICAgICAgfSxcbiAgICAgICAgZW51bWVyYWJsZTogdHJ1ZSxcbiAgICAgICAgY29uZmlndXJhYmxlOiB0cnVlXG4gICAgfSk7XG5cbiAgICBPYmplY3QuZGVmaW5lUHJvcGVydHkodGhpcywgJ2NvbXBvc2l0ZScsIHtcbiAgICAgICAgZ2V0OiBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICByZXR1cm4gc2VsZi53b3JrIGluc3RhbmNlb2YgT3BlcmF0aW9uIHx8XG4gICAgICAgICAgICAgICAgT2JqZWN0LnByb3RvdHlwZS50b1N0cmluZy5jYWxsKHNlbGYud29yaykgPT09ICdbb2JqZWN0IEFycmF5XSdcbiAgICAgICAgfSxcbiAgICAgICAgZW51bWVyYWJsZTogdHJ1ZSxcbiAgICAgICAgY29uZmlndXJhYmxlOiB0cnVlXG4gICAgfSk7XG5cbiAgICBPYmplY3QuZGVmaW5lUHJvcGVydHkodGhpcywgJ251bU9wZXJhdGlvbnNSZW1haW5pbmcnLCB7XG4gICAgICAgIGdldDogZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgaWYgKHNlbGYud29yayBpbnN0YW5jZW9mIE9wZXJhdGlvbikge1xuICAgICAgICAgICAgICAgIHJldHVybiBzZWxmLndvcmsuY29tcGxldGVkID8gMCA6IDFcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGVsc2UgaWYgKE9iamVjdC5wcm90b3R5cGUudG9TdHJpbmcuY2FsbChzZWxmLndvcmspID09PSAnW29iamVjdCBBcnJheV0nKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIF8ucmVkdWNlKHNlbGYud29yaywgZnVuY3Rpb24gKG1lbW8sIG9wKSB7XG4gICAgICAgICAgICAgICAgICAgIGlmICghb3AuY29tcGxldGVkKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gbWVtbyArIDE7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIG1lbW87XG4gICAgICAgICAgICAgICAgfSwgMCk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gbnVsbDtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSxcbiAgICAgICAgZW51bWVyYWJsZTogdHJ1ZSxcbiAgICAgICAgY29uZmlndXJhYmxlOiB0cnVlXG4gICAgfSk7XG5cbiAgICBPYmplY3QuZGVmaW5lUHJvcGVydHkodGhpcywgJ2NhblJ1bicsIHtcbiAgICAgICAgZ2V0OiBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICBpZiAoc2VsZi5kZXBlbmRlbmNpZXMubGVuZ3RoKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIF8ucmVkdWNlKHNlbGYuZGVwZW5kZW5jaWVzLCBmdW5jdGlvbiAobWVtbywgZGVwKSB7XG4gICAgICAgICAgICAgICAgICAgIHZhciBtdXN0U3VjY2VlZCA9IHNlbGYuX211c3RTdWNjZWVkLmluZGV4T2YoZGVwKSA+IC0xO1xuICAgICAgICAgICAgICAgICAgICB2YXIgY2FuUnVuID0gbWVtbyAmJiBkZXAuY29tcGxldGVkO1xuICAgICAgICAgICAgICAgICAgICBpZiAobXVzdFN1Y2NlZWQgJiYgY2FuUnVuKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBjYW5SdW4gPSBjYW5SdW4gJiYgIShkZXAuZmFpbGVkIHx8IGRlcC5jYW5jZWxsZWQpO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBjYW5SdW47XG4gICAgICAgICAgICAgICAgfSwgdHJ1ZSk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICAgICAgfSxcbiAgICAgICAgZW51bWVyYWJsZTogdHJ1ZSxcbiAgICAgICAgY29uZmlndXJhYmxlOiB0cnVlXG4gICAgfSk7XG5cbiAgICBPYmplY3QuZGVmaW5lUHJvcGVydHkodGhpcywgJ2ZhaWxlZER1ZVRvRGVwZW5kZW5jeScsIHtcbiAgICAgICAgZ2V0OiBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICBpZiAoc2VsZi5kZXBlbmRlbmNpZXMubGVuZ3RoKSB7XG4gICAgICAgICAgICAgICAgdmFyIGZhaWxlZERlcHMgPSBfLnJlZHVjZShzZWxmLmRlcGVuZGVuY2llcywgZnVuY3Rpb24gKG1lbW8sIGRlcCkge1xuICAgICAgICAgICAgICAgICAgICB2YXIgbXVzdFN1Y2NlZWQgPSBzZWxmLl9tdXN0U3VjY2VlZC5pbmRleE9mKGRlcCkgPiAtMTtcbiAgICAgICAgICAgICAgICAgICAgdmFyIGZhaWxlZCA9ICgoZGVwLmZhaWxlZCB8fCBkZXAuY2FuY2VsbGVkKSAmJiBtdXN0U3VjY2VlZCk7XG4gICAgICAgICAgICAgICAgICAgIGlmIChmYWlsZWQpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIG1lbW8ucHVzaChkZXApO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBtZW1vO1xuICAgICAgICAgICAgICAgIH0sIFtdKTtcbiAgICAgICAgICAgICAgICByZXR1cm4gZmFpbGVkRGVwcy5sZW5ndGggPyBmYWlsZWREZXBzIDogZmFsc2U7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgIH0sXG4gICAgICAgIGVudW1lcmFibGU6IHRydWUsXG4gICAgICAgIGNvbmZpZ3VyYWJsZTogdHJ1ZVxuICAgIH0pO1xuXG4gICAgT2JqZWN0LmRlZmluZVByb3BlcnR5KHRoaXMsICdmYWlsZWREdWVUb0NhbmNlbGxhdGlvbk9mRGVwZW5kZW5jeScsIHtcbiAgICAgICAgZ2V0OiBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICBpZiAoc2VsZi5kZXBlbmRlbmNpZXMubGVuZ3RoKSB7XG4gICAgICAgICAgICAgICAgdmFyIGNhbmNlbGxlZCA9IF8ucmVkdWNlKHNlbGYuZGVwZW5kZW5jaWVzLCBmdW5jdGlvbiAobWVtbywgZGVwKSB7XG4gICAgICAgICAgICAgICAgICAgIHZhciBtdXN0U3VjY2VlZCA9IHNlbGYuX211c3RTdWNjZWVkLmluZGV4T2YoZGVwKSA+IC0xO1xuICAgICAgICAgICAgICAgICAgICBpZiAobXVzdFN1Y2NlZWQpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmIChkZXAuY2FuY2VsbGVkKSBtZW1vLnB1c2goZGVwKTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICByZXR1cm4gbWVtbztcbiAgICAgICAgICAgICAgICB9LCBbXSk7XG4gICAgICAgICAgICAgICAgcmV0dXJuIGNhbmNlbGxlZC5sZW5ndGggPyBjYW5jZWxsZWQgOiBmYWxzZTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgfSxcbiAgICAgICAgZW51bWVyYWJsZTogdHJ1ZSxcbiAgICAgICAgY29uZmlndXJhYmxlOiB0cnVlXG4gICAgfSk7XG5cbiAgICBPYmplY3QuZGVmaW5lUHJvcGVydHkodGhpcywgJ2xvZ2dpbmdPdmVyaWRkZW4nLCB7XG4gICAgICAgIGdldDogZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgaWYgKHNlbGYubG9nTGV2ZWwpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gc2VsZi5sb2dMZXZlbCA8PSBsb2cuTGV2ZWwuaW5mbztcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgfSxcbiAgICAgICAgZW51bWVyYWJsZTogdHJ1ZSxcbiAgICAgICAgY29uZmlndXJhYmxlOiB0cnVlXG4gICAgfSlcblxuXG59XG5cbk9wZXJhdGlvbi5ydW5uaW5nID0gW107XG5cbk9wZXJhdGlvbi5wcm90b3R5cGUuX3N0YXJ0U2luZ2xlID0gZnVuY3Rpb24gKCkge1xuICAgIHZhciBzZWxmID0gdGhpcztcbiAgICB0aGlzLndvcmsoZnVuY3Rpb24gKGVyciwgcGF5bG9hZCkge1xuICAgICAgICBzZWxmLnJlc3VsdCA9IHBheWxvYWQ7XG4gICAgICAgIHNlbGYuZXJyb3IgPSBlcnI7XG4gICAgICAgIHNlbGYuY29tcGxldGVkID0gdHJ1ZTtcbiAgICAgICAgc2VsZi5ydW5uaW5nID0gZmFsc2U7XG4gICAgICAgIHNlbGYuX2NvbXBsZXRlKCk7XG4gICAgfSk7XG59O1xuXG5PcGVyYXRpb24ucHJvdG90eXBlLl9zdGFydENvbXBvc2l0ZSA9IGZ1bmN0aW9uICgpIHtcbiAgICB2YXIgc2VsZiA9IHRoaXM7XG4gICAgdmFyIG9wZXJhdGlvbnMgPSBzZWxmLndvcmsgaW5zdGFuY2VvZiBPcGVyYXRpb24gPyBbc2VsZi53b3JrXSA6IHNlbGYud29yaztcbiAgICBfLmVhY2gob3BlcmF0aW9ucywgZnVuY3Rpb24gKG9wKSB7XG4gICAgICAgIG9wLm9uQ29tcGxldGlvbihmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICB2YXIgbnVtT3BlcmF0aW9uc1JlbWFpbmluZyA9IHNlbGYubnVtT3BlcmF0aW9uc1JlbWFpbmluZztcbiAgICAgICAgICAgIHZhciBuYW1lID0gc2VsZi5uYW1lIHx8ICdVbm5hbWVkJztcbiAgICAgICAgICAgIExvZ2dlci5kZWJ1ZyhuYW1lICsgJyBoYXMgJyArIG51bU9wZXJhdGlvbnNSZW1haW5pbmcudG9TdHJpbmcoKSArICcgb3BlcmF0aW9ucyByZW1haW5pbmcnKTtcbiAgICAgICAgICAgIGlmICghbnVtT3BlcmF0aW9uc1JlbWFpbmluZykge1xuICAgICAgICAgICAgICAgIHZhciBlcnJvcnMgPSBfLnBsdWNrKG9wZXJhdGlvbnMsICdlcnJvcicpO1xuICAgICAgICAgICAgICAgIHZhciByZXN1bHRzID0gXy5wbHVjayhvcGVyYXRpb25zLCAncmVzdWx0Jyk7XG4gICAgICAgICAgICAgICAgc2VsZi5yZXN1bHQgPSBfLnNvbWUocmVzdWx0cykgPyByZXN1bHRzIDogbnVsbDtcbiAgICAgICAgICAgICAgICBzZWxmLmVycm9yID0gXy5zb21lKGVycm9ycykgPyBlcnJvcnMgOiBudWxsO1xuICAgICAgICAgICAgICAgIHNlbGYuY29tcGxldGVkID0gdHJ1ZTtcbiAgICAgICAgICAgICAgICBzZWxmLnJ1bm5pbmcgPSBmYWxzZTtcbiAgICAgICAgICAgICAgICBzZWxmLl9jb21wbGV0ZSgpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9KTtcbiAgICAgICAgb3Auc3RhcnQoKTtcbiAgICB9KTtcbn07XG5cbk9wZXJhdGlvbi5wcm90b3R5cGUuX2xvZ0NvbXBsZXRpb24gPSBmdW5jdGlvbiAoKSB7XG4gICAgdmFyIGxvZ0Z1bmMgPSB0aGlzLl9nZXRMb2dGdW5jKCk7XG4gICAgaWYgKExvZ2dlci5pbmZvLmlzRW5hYmxlZCB8fCB0aGlzLmxvZ2dpbmdPdmVyaWRkZW4pIHtcbiAgICAgICAgdmFyIG5hbWUgPSB0aGlzLm5hbWUgfHwgJ1VubmFtZWQnO1xuICAgICAgICB2YXIgZmFpbGVkRGVwZW5kZW5jaWVzID0gdGhpcy5mYWlsZWREdWVUb0RlcGVuZGVuY3k7XG4gICAgICAgIGlmIChmYWlsZWREZXBlbmRlbmNpZXMpIHtcbiAgICAgICAgICAgIGxvZ0Z1bmMoJ1wiJyArIG5hbWUgKyAnXCIgZmFpbGVkIGR1ZSB0byBmYWlsdXJlL2NhbmNlbGxhdGlvbiBvZiBkZXBlbmRlbmNpZXM6ICcgKyBfLnBsdWNrKGZhaWxlZERlcGVuZGVuY2llcywgJ25hbWUnKS5qb2luKCcsICcpKTtcbiAgICAgICAgfVxuICAgICAgICBlbHNlIGlmICh0aGlzLmZhaWxlZCkge1xuICAgICAgICAgICAgdmFyIGVyciA9IHRoaXMuZXJyb3I7XG4gICAgICAgICAgICAvLyBSZW1vdmUgbnVsbCBlcnJvcnMuXG4gICAgICAgICAgICBpZiAoT2JqZWN0LnByb3RvdHlwZS50b1N0cmluZy5jYWxsKGVycikgPT09ICdbb2JqZWN0IEFycmF5XScpIHtcbiAgICAgICAgICAgICAgICBlcnIgPSBfLmZpbHRlcihlcnIsIGZ1bmN0aW9uIChlKSB7cmV0dXJuIGUgfSk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgICAgICBlcnIgPSBbdGhpcy5lcnJvcl07XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBsb2dGdW5jKCdcIicgKyBuYW1lICsgJ1wiIGZhaWxlZCBkdWUgdG8gZXJyb3JzOicsIGVycik7XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSBpZiAodGhpcy5jYW5jZWxsZWQpIHtcbiAgICAgICAgICAgIGxvZ0Z1bmMoJ1wiJyArIG5hbWUgKyAnXCIgaGFzIGJlZW4gY2FuY2VsbGVkLicpO1xuICAgICAgICB9XG4gICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgbG9nRnVuYygnXCInICsgbmFtZSArICdcIiBoYXMgc3VjY2VlZGVkLicpO1xuICAgICAgICB9XG4gICAgfVxufTtcblxuT3BlcmF0aW9uLnByb3RvdHlwZS5fZ2V0TG9nRnVuYyA9IGZ1bmN0aW9uICgpIHtcbiAgICBpZiAodGhpcy5sb2dMZXZlbCkge1xuICAgICAgICByZXR1cm4gXy5iaW5kKExvZ2dlci5vdmVycmlkZSwgTG9nZ2VyLCBsb2cuTGV2ZWwuaW5mbywgdGhpcy5sb2dMZXZlbCk7XG4gICAgfVxuICAgIHJldHVybiBMb2dnZXIuaW5mbztcbn07XG5cbk9wZXJhdGlvbi5wcm90b3R5cGUuX2xvZ1N0YXJ0ID0gZnVuY3Rpb24gKCkge1xuICAgIGlmIChMb2dnZXIuaW5mby5pc0VuYWJsZWQgfHwgdGhpcy5sb2dnaW5nT3ZlcmlkZGVuKSB7XG4gICAgICAgIHZhciBuYW1lID0gdGhpcy5uYW1lIHx8ICdVbm5hbWVkJztcbiAgICAgICAgdmFyIGxvZ0Z1bmMgPSB0aGlzLl9nZXRMb2dGdW5jKCk7XG4gICAgICAgIGxvZ0Z1bmMoJ1wiJyArIG5hbWUgKyAnXCIgaGFzIHN0YXJ0ZWQuJyk7XG4gICAgfVxufTtcblxuXG5PcGVyYXRpb24ucHJvdG90eXBlLl9jb21wbGV0ZSA9IGZ1bmN0aW9uICgpIHtcbiAgICB2YXIgc2VsZiA9IHRoaXM7XG4gICAgdGhpcy5jb21wbGV0ZWQgPSB0cnVlO1xuICAgIHZhciBpZHggPSBPcGVyYXRpb24ucnVubmluZy5pbmRleE9mKHRoaXMpO1xuICAgIE9wZXJhdGlvbi5ydW5uaW5nLnNwbGljZShpZHgsIDEpO1xuICAgIGlmICh0aGlzLmNvbXBsZXRpb24pIHtcbiAgICAgICAgXy5iaW5kKHRoaXMuY29tcGxldGlvbiwgdGhpcykoKTtcbiAgICB9XG4gICAgdGhpcy5fbG9nQ29tcGxldGlvbigpO1xuICAgIF8uZWFjaCh0aGlzLl9vbkNvbXBsZXRpb24sIGZ1bmN0aW9uIChvKSB7XG4gICAgICAgIF8uYmluZChvLCBzZWxmKSgpO1xuICAgIH0pO1xufTtcblxuT3BlcmF0aW9uLnByb3RvdHlwZS5fX3N0YXJ0ID0gZnVuY3Rpb24gKCkge1xuICAgIHRoaXMuX2xvZ1N0YXJ0KCk7XG4gICAgaWYgKHRoaXMud29yaykge1xuICAgICAgICBpZiAodGhpcy5jb21wb3NpdGUpIHtcbiAgICAgICAgICAgIHRoaXMuX3N0YXJ0Q29tcG9zaXRlKCk7XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICB0aGlzLl9zdGFydFNpbmdsZSgpO1xuICAgICAgICB9XG4gICAgICAgIE9wZXJhdGlvbi5ydW5uaW5nLnB1c2godGhpcyk7XG4gICAgfVxuICAgIGVsc2Uge1xuICAgICAgICB0aGlzLnJlc3VsdCA9IG51bGw7XG4gICAgICAgIHRoaXMuZXJyb3IgPSBudWxsO1xuICAgICAgICB0aGlzLnJ1bm5pbmcgPSBmYWxzZTtcbiAgICAgICAgdGhpcy5fY29tcGxldGUoKTtcbiAgICB9XG59O1xuXG5PcGVyYXRpb24ucHJvdG90eXBlLnN0YXJ0ID0gZnVuY3Rpb24gKCkge1xuICAgIHZhciBzZWxmID0gdGhpcztcbiAgICB2YXIgbmV2ZXJTdGFydGVkID0gIXRoaXMucnVubmluZyAmJiAhdGhpcy5jb21wbGV0ZWQ7XG4gICAgdmFyIG5ldmVyU3RhcnRlZEFuZEZhaWxlZCA9IG5ldmVyU3RhcnRlZCAmJiB0aGlzLmZhaWxlZDtcbiAgICAvLyBBIGRlcGVuZGVuY3kgZmFpbGVkIG9yIHdhcyBjYW5jZWxsZWQgYmVmb3JlIHRoaXMgb3BlcmF0aW9uIHN0YXJ0ZWQuXG4gICAgaWYgKG5ldmVyU3RhcnRlZEFuZEZhaWxlZCkge1xuICAgICAgICB0aGlzLl9jb21wbGV0ZSgpO1xuICAgIH1cbiAgICBlbHNlIGlmIChuZXZlclN0YXJ0ZWQpIHtcbiAgICAgICAgdGhpcy5ydW5uaW5nID0gdHJ1ZTtcbiAgICAgICAgaWYgKHRoaXMuY2FuUnVuKSB7XG4gICAgICAgICAgICB0aGlzLl9fc3RhcnQoKTtcbiAgICAgICAgfVxuICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgIF8uZWFjaCh0aGlzLmRlcGVuZGVuY2llcywgZnVuY3Rpb24gKGRlcCkge1xuICAgICAgICAgICAgICAgIGRlcC5vbkNvbXBsZXRpb24oZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgICAgICBpZiAoc2VsZi5jYW5SdW4pIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHNlbGYuX19zdGFydCgpO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfSlcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9XG4gICAgfVxufTtcblxuXG5PcGVyYXRpb24ucHJvdG90eXBlLmFkZERlcGVuZGVuY3kgPSBmdW5jdGlvbiAoKSB7XG4gICAgdmFyIHNlbGYgPSB0aGlzO1xuICAgIGlmIChhcmd1bWVudHMubGVuZ3RoID09IDEpIHtcbiAgICAgICAgdGhpcy5kZXBlbmRlbmNpZXMucHVzaChhcmd1bWVudHNbMF0pO1xuICAgIH1cbiAgICBlbHNlIGlmIChhcmd1bWVudHMubGVuZ3RoKSB7XG4gICAgICAgIHZhciBhcmdzID0gYXJndW1lbnRzO1xuICAgICAgICB2YXIgbGFzdEFyZyA9IGFyZ3NbYXJncy5sZW5ndGggLSAxXTtcbiAgICAgICAgdmFyIG11c3RTdWNjZWVkID0gZmFsc2U7XG4gICAgICAgIGlmICh0eXBlb2YobGFzdEFyZykgPT0gJ2Jvb2xlYW4nKSB7XG4gICAgICAgICAgICBhcmdzID0gQXJyYXkucHJvdG90eXBlLnNsaWNlLmNhbGwoYXJncywgMCwgYXJncy5sZW5ndGggLSAxKTtcbiAgICAgICAgICAgIG11c3RTdWNjZWVkID0gbGFzdEFyZztcbiAgICAgICAgfVxuICAgICAgICBfLmVhY2goYXJncywgZnVuY3Rpb24gKGFyZykge1xuICAgICAgICAgICAgc2VsZi5kZXBlbmRlbmNpZXMucHVzaChhcmcpO1xuICAgICAgICB9KTtcbiAgICAgICAgaWYgKG11c3RTdWNjZWVkKSB7XG4gICAgICAgICAgICBfLmVhY2goYXJncywgZnVuY3Rpb24gKGFyZykge1xuICAgICAgICAgICAgICAgIHNlbGYuX211c3RTdWNjZWVkLnB1c2goYXJnKTtcbiAgICAgICAgICAgIH0pXG4gICAgICAgIH1cbiAgICB9XG59O1xuXG5PcGVyYXRpb24ucHJvdG90eXBlLm9uQ29tcGxldGlvbiA9IGZ1bmN0aW9uIChvKSB7XG4gICAgaWYgKCF0aGlzLmNvbXBsZXRlZCkge1xuICAgICAgICB0aGlzLl9vbkNvbXBsZXRpb24ucHVzaChvKTtcbiAgICB9XG4gICAgZWxzZSB7XG4gICAgICAgIF8uYmluZChvLCB0aGlzKSgpO1xuICAgIH1cbn07XG5cbk9wZXJhdGlvbi5wcm90b3R5cGUuY2FuY2VsID0gZnVuY3Rpb24gKGNhbGxiYWNrKSB7XG4gICAgaWYgKCF0aGlzLmNhbmNlbGxlZCkge1xuICAgICAgICB0aGlzLmNhbmNlbGxlZCA9IHRydWU7XG4gICAgICAgIExvZ2dlci5kZWJ1ZygnQ2FuY2VsbGluZyAnICsgdGhpcy5uYW1lLCB0aGlzKTtcbiAgICAgICAgaWYgKHRoaXMuY29tcG9zaXRlKSB7XG4gICAgICAgICAgICBfLmVhY2godGhpcy53b3JrLCBmdW5jdGlvbiAoc3Vib3ApIHtcbiAgICAgICAgICAgICAgICBzdWJvcC5jYW5jZWwoKTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9XG4gICAgICAgIHRoaXMub25Db21wbGV0aW9uKGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgIHRoaXMucnVubmluZyA9IGZhbHNlO1xuICAgICAgICAgICAgaWYgKGNhbGxiYWNrKSBjYWxsYmFjaygpO1xuICAgICAgICB9KTtcbiAgICB9XG59O1xuXG5PYmplY3QuZGVmaW5lUHJvcGVydHkoT3BlcmF0aW9uLCAnbG9nTGV2ZWwnLCB7XG4gICAgZ2V0OiBmdW5jdGlvbiAoKSB7XG4gICAgICAgIHJldHVybiBMb2dnZXIuY3VycmVudExldmVsKCk7XG4gICAgfSxcbiAgICBzZXQ6IGZ1bmN0aW9uICh2KSB7XG4gICAgICAgIExvZ2dlci5zZXRMZXZlbCh2KTtcbiAgICB9LFxuICAgIGNvbmZpZ3VyYWJsZTogdHJ1ZSxcbiAgICBlbnVtZXJhYmxlOiB0cnVlXG59KTtcblxubW9kdWxlLmV4cG9ydHMuT3BlcmF0aW9uID0gT3BlcmF0aW9uO1xuIiwiXG52YXIgbG9nID0gcmVxdWlyZSgnLi9sb2cnKTtcbnZhciBMb2dnZXIgPSBsb2cubG9nZ2VyV2l0aE5hbWUoJ09wZXJhdGlvblF1ZXVlJyk7XG52YXIgXyA9IHJlcXVpcmUoJy4uL3V0aWwnKS5fO1xuXG5cbmZ1bmN0aW9uIE9wZXJhdGlvblF1ZXVlKCkge1xuXG4gICAgaWYgKCF0aGlzKSB7XG4gICAgICAgIHJldHVybiBuZXcgKEZ1bmN0aW9uLnByb3RvdHlwZS5iaW5kLmFwcGx5KE9wZXJhdGlvblF1ZXVlLCBhcmd1bWVudHMpKTtcbiAgICB9XG4gICAgdmFyIHNlbGYgPSB0aGlzO1xuXG4gICAgaWYgKGFyZ3VtZW50cy5sZW5ndGgpIHtcbiAgICAgICAgaWYgKHR5cGVvZihhcmd1bWVudHNbMF0pID09ICdudW1iZXInKSB7XG4gICAgICAgICAgICB0aGlzLm1heENvbmN1cnJlbnRPcGVyYXRpb25zID0gYXJndW1lbnRzWzBdO1xuICAgICAgICB9XG4gICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgdGhpcy5uYW1lID0gYXJndW1lbnRzWzBdO1xuICAgICAgICAgICAgdGhpcy5tYXhDb25jdXJyZW50T3BlcmF0aW9ucyA9IGFyZ3VtZW50c1sxXTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIHRoaXMuX3F1ZXVlZE9wZXJhdGlvbnMgPSBbXTtcbiAgICB0aGlzLl9ydW5uaW5nT3BlcmF0aW9ucyA9IFtdO1xuICAgIHRoaXMuX3J1bm5pbmcgPSBmYWxzZTtcbiAgICB0aGlzLl9vblN0YXJ0ID0gW107XG4gICAgdGhpcy5fb25TdG9wID0gW107XG4gICAgdGhpcy5sb2dMZXZlbCA9IG51bGw7XG5cbiAgICBPYmplY3QuZGVmaW5lUHJvcGVydHkodGhpcywgJ251bVJ1bm5pbmdPcGVyYXRpb25zJywge1xuICAgICAgICBnZXQ6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgIHJldHVybiBzZWxmLl9ydW5uaW5nT3BlcmF0aW9ucy5sZW5ndGg7XG4gICAgICAgIH0sXG4gICAgICAgIGNvbmZpZ3VyYWJsZTogdHJ1ZSxcbiAgICAgICAgZW51bWVyYWJsZTogdHJ1ZVxuICAgIH0pO1xuXG4gICAgT2JqZWN0LmRlZmluZVByb3BlcnR5KHRoaXMsICdsb2dnaW5nT3ZlcmlkZGVuJywge1xuICAgICAgICBnZXQ6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgIGlmIChzZWxmLmxvZ0xldmVsKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHNlbGYubG9nTGV2ZWwgPD0gbG9nLkxldmVsLmluZm87XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgIH0sXG4gICAgICAgIGVudW1lcmFibGU6IHRydWUsXG4gICAgICAgIGNvbmZpZ3VyYWJsZTogdHJ1ZVxuICAgIH0pXG59XG5cbk9wZXJhdGlvblF1ZXVlLnByb3RvdHlwZS5fbmV4dE9wZXJhdGlvbnMgPSBmdW5jdGlvbiAoKSB7XG4gICAgdmFyIHNlbGYgPSB0aGlzO1xuICAgIHdoaWxlICgoc2VsZi5fcnVubmluZ09wZXJhdGlvbnMubGVuZ3RoIDwgc2VsZi5tYXhDb25jdXJyZW50T3BlcmF0aW9ucykgJiYgc2VsZi5fcXVldWVkT3BlcmF0aW9ucy5sZW5ndGgpIHtcbiAgICAgICAgdmFyIG9wID0gc2VsZi5fcXVldWVkT3BlcmF0aW9uc1swXTtcbiAgICAgICAgc2VsZi5fcXVldWVkT3BlcmF0aW9ucy5zcGxpY2UoMCwgMSk7XG4gICAgICAgIHNlbGYuX3J1bk9wZXJhdGlvbihvcCk7XG4gICAgfVxufTtcblxuXG5PcGVyYXRpb25RdWV1ZS5wcm90b3R5cGUuX3J1bk9wZXJhdGlvbiA9IGZ1bmN0aW9uIChvcCkge1xuICAgIHZhciBzZWxmID0gdGhpcztcbiAgICBmb3IgKHZhciBpID0gMDsgaSA8IHRoaXMuX3F1ZXVlZE9wZXJhdGlvbnMubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgaWYgKHRoaXMuX3F1ZXVlZE9wZXJhdGlvbnNbaV0gPT0gb3ApIHtcbiAgICAgICAgICAgIHRoaXMuX3F1ZXVlZE9wZXJhdGlvbnMuc3BsaWNlKGksIDEpO1xuICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgIH1cbiAgICB9XG4gICAgdGhpcy5fcnVubmluZ09wZXJhdGlvbnMucHVzaChvcCk7XG4gICAgb3AuY29tcGxldGlvbiA9IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgdmFyIGlkeCA9IHNlbGYuX3J1bm5pbmdPcGVyYXRpb25zLmluZGV4T2Yob3ApO1xuICAgICAgICBzZWxmLl9ydW5uaW5nT3BlcmF0aW9ucy5zcGxpY2UoaWR4LCAxKTtcbiAgICAgICAgaWYgKHNlbGYuX3J1bm5pbmcpIHtcbiAgICAgICAgICAgIHNlbGYuX25leHRPcGVyYXRpb25zKCk7XG4gICAgICAgIH1cbiAgICAgICAgc2VsZi5fbG9nU3RhdHVzKCk7XG4gICAgfTtcbiAgICBvcC5zdGFydCgpO1xuICAgIHRoaXMuX2xvZ1N0YXR1cygpO1xufTtcblxuT3BlcmF0aW9uUXVldWUucHJvdG90eXBlLl9sb2dTdGF0dXMgPSBmdW5jdGlvbiAoKSB7XG4gICAgdmFyIGxvZ0Z1bmMgPSB0aGlzLl9nZXRMb2dGdW5jKCk7XG4gICAgaWYgKExvZ2dlci5pbmZvLmlzRW5hYmxlZCB8fCB0aGlzLmxvZ2dpbmdPdmVyaWRkZW4pIHtcbiAgICAgICAgdmFyIG51bVJ1bm5pbmcgPSB0aGlzLm51bVJ1bm5pbmdPcGVyYXRpb25zO1xuICAgICAgICB2YXIgbnVtUXVldWVkID0gdGhpcy5fcXVldWVkT3BlcmF0aW9ucy5sZW5ndGg7XG4gICAgICAgIHZhciBuYW1lID0gdGhpcy5uYW1lIHx8IFwiVW5uYW1lZCBRdWV1ZVwiO1xuICAgICAgICBpZiAobnVtUnVubmluZyAmJiBudW1RdWV1ZWQpIHtcbiAgICAgICAgICAgIGxvZ0Z1bmMoJ1wiJyArIG5hbWUgKyAnXCIgbm93IGhhcyAnICsgbnVtUnVubmluZy50b1N0cmluZygpICsgJyBvcGVyYXRpb25zIHJ1bm5pbmcgYW5kICcgKyBudW1RdWV1ZWQudG9TdHJpbmcoKSArICcgb3BlcmF0aW9ucyBxdWV1ZWQnKTtcbiAgICAgICAgfVxuICAgICAgICBlbHNlIGlmIChudW1SdW5uaW5nKSB7XG4gICAgICAgICAgICBsb2dGdW5jKCdcIicgKyBuYW1lICsgJ1wiIG5vdyBoYXMgJyArIG51bVJ1bm5pbmcudG9TdHJpbmcoKSArICcgb3BlcmF0aW9ucyBydW5uaW5nJyk7XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSBpZiAobnVtUXVldWVkKSB7XG4gICAgICAgICAgICBsb2dGdW5jKCdcIicgKyBuYW1lICsgJ1wiIG5vdyBoYXMgJyArIG51bVF1ZXVlZC50b1N0cmluZygpICsgJyBvcGVyYXRpb25zIHF1ZXVlZCcpO1xuICAgICAgICB9XG4gICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgbG9nRnVuYygnXCInICsgbmFtZSArICdcIiBoYXMgbm8gb3BlcmF0aW9ucyBydW5uaW5nIG9yIHF1ZXVlZCcpO1xuICAgICAgICB9XG4gICAgfVxufTtcblxuT3BlcmF0aW9uUXVldWUucHJvdG90eXBlLl9sb2dTdGFydCA9IGZ1bmN0aW9uICgpIHtcbiAgICB2YXIgbG9nRnVuYyA9IHRoaXMuX2dldExvZ0Z1bmMoKTtcbiAgICBpZiAoTG9nZ2VyLmluZm8uaXNFbmFibGVkIHx8IHRoaXMubG9nZ2luZ092ZXJpZGRlbikge1xuICAgICAgICB2YXIgbmFtZSA9IHRoaXMubmFtZSB8fCBcIlVubmFtZWQgUXVldWVcIjtcbiAgICAgICAgbG9nRnVuYygnXCInICsgbmFtZSArICdcIiBpcyBub3cgcnVubmluZycpO1xuICAgIH1cbn07XG5cbk9wZXJhdGlvblF1ZXVlLnByb3RvdHlwZS5fZ2V0TG9nRnVuYyA9IGZ1bmN0aW9uICgpIHtcbiAgICBpZiAodGhpcy5sb2dMZXZlbCkge1xuICAgICAgICByZXR1cm4gXy5iaW5kKExvZ2dlci5vdmVycmlkZSwgTG9nZ2VyLCBsb2cuTGV2ZWwuaW5mbywgdGhpcy5sb2dMZXZlbCk7XG4gICAgfVxuICAgIHJldHVybiBMb2dnZXIuaW5mbztcbn07XG5cblxuT3BlcmF0aW9uUXVldWUucHJvdG90eXBlLl9sb2dTdG9wID0gZnVuY3Rpb24gKCkge1xuICAgIHZhciBsb2dGdW5jID0gdGhpcy5fZ2V0TG9nRnVuYygpO1xuICAgIGlmIChMb2dnZXIuaW5mby5pc0VuYWJsZWQgfHwgdGhpcy5sb2dnaW5nT3ZlcmlkZGVuKSB7XG4gICAgICAgIHZhciBuYW1lID0gdGhpcy5uYW1lIHx8IFwiVW5uYW1lZCBRdWV1ZVwiO1xuICAgICAgICBsb2dGdW5jKCdcIicgKyBuYW1lICsgJ1wiIGlzIG5vIGxvbmdlciBydW5uaW5nJyk7XG4gICAgfVxufTtcblxuT3BlcmF0aW9uUXVldWUucHJvdG90eXBlLl9hZGRPcGVyYXRpb24gPSBmdW5jdGlvbiAob3ApIHtcbiAgICBpZiAodGhpcy5udW1SdW5uaW5nT3BlcmF0aW9ucyA8IHRoaXMubWF4Q29uY3VycmVudE9wZXJhdGlvbnMgJiYgdGhpcy5fcnVubmluZykge1xuICAgICAgICB0aGlzLl9ydW5PcGVyYXRpb24ob3ApO1xuICAgIH1cbiAgICBlbHNlIHtcbiAgICAgICAgdGhpcy5fcXVldWVkT3BlcmF0aW9ucy5wdXNoKG9wKTtcbiAgICB9XG4gICAgdGhpcy5fbG9nU3RhdHVzKCk7XG59O1xuXG5PcGVyYXRpb25RdWV1ZS5wcm90b3R5cGUuYWRkT3BlcmF0aW9uID0gZnVuY3Rpb24gKG9wZXJhdGlvbk9yT3BlcmF0aW9ucykge1xuICAgIHZhciBzZWxmID0gdGhpcztcbiAgICBpZiAoT2JqZWN0LnByb3RvdHlwZS50b1N0cmluZy5jYWxsKG9wZXJhdGlvbk9yT3BlcmF0aW9ucykgPT09ICdbb2JqZWN0IEFycmF5XScpIHtcbiAgICAgICAgXy5lYWNoKG9wZXJhdGlvbk9yT3BlcmF0aW9ucywgZnVuY3Rpb24gKG9wKSB7c2VsZi5fYWRkT3BlcmF0aW9uKG9wKX0pO1xuICAgIH1cbiAgICBlbHNlIHtcbiAgICAgICAgdGhpcy5fYWRkT3BlcmF0aW9uKG9wZXJhdGlvbk9yT3BlcmF0aW9ucyk7XG4gICAgfVxufTtcblxuT3BlcmF0aW9uUXVldWUucHJvdG90eXBlLnN0YXJ0ID0gZnVuY3Rpb24gKCkge1xuICAgIHZhciBzZWxmID0gdGhpcztcbiAgICB2YXIgd2FzUnVubmluZyA9IHRoaXMuX3J1bm5pbmc7XG4gICAgdGhpcy5fcnVubmluZyA9IHRydWU7XG4gICAgaWYgKCF3YXNSdW5uaW5nKSB7XG4gICAgICAgIF8uZWFjaChzZWxmLl9vblN0YXJ0LCBmdW5jdGlvbiAoYykge1xuICAgICAgICAgICAgXy5iaW5kKGMsIHNlbGYpKCk7XG4gICAgICAgIH0pO1xuICAgICAgICBzZWxmLl9uZXh0T3BlcmF0aW9ucygpO1xuICAgICAgICBzZWxmLl9sb2dTdGFydCgpO1xuICAgIH1cbn07XG5cbk9wZXJhdGlvblF1ZXVlLnByb3RvdHlwZS5zdG9wID0gZnVuY3Rpb24gKGNhbmNlbCkge1xuICAgIHZhciBzZWxmID0gdGhpcztcbiAgICB2YXIgd2FzUnVubmluZyA9IHRoaXMuX3J1bm5pbmc7XG4gICAgdGhpcy5fcnVubmluZyA9IGZhbHNlO1xuICAgIGlmICh3YXNSdW5uaW5nKSB7XG4gICAgICAgIGlmIChjYW5jZWwpIHtcbiAgICAgICAgICAgIHZhciBvcGVyYXRpb25zID0gdGhpcy5fcnVubmluZ09wZXJhdGlvbnMuc2xpY2UoMCk7IC8vIENsb25lIHNvIG5vdCBmaWdodGluZyBjYWxsYmFja3MuXG4gICAgICAgICAgICBfLmVhY2gob3BlcmF0aW9ucywgZnVuY3Rpb24gKG8pIHtcbiAgICAgICAgICAgICAgICBvLmNhbmNlbCgpO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgIH1cbiAgICAgICAgc2VsZi5fbG9nU3RvcCgpO1xuICAgICAgICBfLmVhY2goc2VsZi5fb25TdG9wLCBmdW5jdGlvbiAoYykge1xuICAgICAgICAgICAgXy5iaW5kKGMsIHNlbGYpKCk7XG4gICAgICAgIH0pO1xuICAgIH1cbn07XG5cbk9wZXJhdGlvblF1ZXVlLnByb3RvdHlwZS5vblN0YXJ0ID0gZnVuY3Rpb24gKG8pIHtcbiAgICB0aGlzLl9vblN0YXJ0LnB1c2gobyk7XG59O1xuT3BlcmF0aW9uUXVldWUucHJvdG90eXBlLm9uU3RvcCA9IGZ1bmN0aW9uIChvKSB7XG4gICAgdGhpcy5fb25TdG9wLnB1c2gobyk7XG59O1xuXG5PYmplY3QuZGVmaW5lUHJvcGVydHkoT3BlcmF0aW9uUXVldWUsICdsb2dMZXZlbCcsIHtcbiAgICBnZXQ6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgcmV0dXJuIExvZ2dlci5jdXJyZW50TGV2ZWwoKTtcbiAgICB9LFxuICAgIHNldDogZnVuY3Rpb24gKHYpIHtcbiAgICAgICAgTG9nZ2VyLnNldExldmVsKHYpO1xuICAgIH0sXG4gICAgY29uZmlndXJhYmxlOiB0cnVlLFxuICAgIGVudW1lcmFibGU6IHRydWVcbn0pO1xuXG5cbm1vZHVsZS5leHBvcnRzLk9wZXJhdGlvblF1ZXVlID0gT3BlcmF0aW9uUXVldWU7XG4iLCIvKipcbiAqIEBtb2R1bGUgcmVsYXRpb25zaGlwc1xuICovXG5cbnZhciBJbnRlcm5hbFNpZXN0YUVycm9yID0gcmVxdWlyZSgnLi9lcnJvcicpLkludGVybmFsU2llc3RhRXJyb3IsXG4gICAgU3RvcmUgPSByZXF1aXJlKCcuL3N0b3JlJyksXG4gICAgZGVmaW5lU3ViUHJvcGVydHkgPSByZXF1aXJlKCcuL21pc2MnKS5kZWZpbmVTdWJQcm9wZXJ0eSxcbiAgICBPcGVyYXRpb24gPSByZXF1aXJlKCcuL29wZXJhdGlvbi9vcGVyYXRpb24nKS5PcGVyYXRpb24sXG4gICAgdXRpbCA9IHJlcXVpcmUoJy4vdXRpbCcpLFxuICAgIF8gPSB1dGlsLl8sXG4gICAgUXVlcnkgPSByZXF1aXJlKCcuL3F1ZXJ5JykuUXVlcnksXG4gICAgbG9nID0gcmVxdWlyZSgnLi9vcGVyYXRpb24vbG9nJyksXG4gICAgbm90aWZpY2F0aW9uQ2VudHJlID0gcmVxdWlyZSgnLi9ub3RpZmljYXRpb25DZW50cmUnKSxcbiAgICB3cmFwQXJyYXlGb3JBdHRyaWJ1dGVzID0gbm90aWZpY2F0aW9uQ2VudHJlLndyYXBBcnJheSxcbiAgICBBcnJheU9ic2VydmVyID0gcmVxdWlyZSgnLi4vdmVuZG9yL29ic2VydmUtanMvc3JjL29ic2VydmUnKS5BcnJheU9ic2VydmVyLFxuICAgIGNvcmVDaGFuZ2VzID0gcmVxdWlyZSgnLi9jaGFuZ2VzJyksXG4gICAgQ2hhbmdlVHlwZSA9IGNvcmVDaGFuZ2VzLkNoYW5nZVR5cGU7XG5cbi8qKlxuICogQGNsYXNzICBbRmF1bHQgZGVzY3JpcHRpb25dXG4gKiBAcGFyYW0ge1JlbGF0aW9uc2hpcFByb3h5fSBwcm94eVxuICogQGNvbnN0cnVjdG9yXG4gKi9cbmZ1bmN0aW9uIEZhdWx0KHByb3h5KSB7XG4gICAgdmFyIHNlbGYgPSB0aGlzO1xuICAgIHRoaXMucHJveHkgPSBwcm94eTtcbiAgICBPYmplY3QuZGVmaW5lUHJvcGVydHkodGhpcywgJ2lzRmF1bHQnLCB7XG4gICAgICAgIGdldDogZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICByZXR1cm4gc2VsZi5wcm94eS5pc0ZhdWx0O1xuICAgICAgICB9LFxuICAgICAgICBlbnVtZXJhYmxlOiB0cnVlLFxuICAgICAgICBjb25maWd1cmFibGU6IHRydWVcbiAgICB9KTtcbn1cblxuRmF1bHQucHJvdG90eXBlLmdldCA9IGZ1bmN0aW9uKCkge1xuICAgIHRoaXMucHJveHkuZ2V0LmFwcGx5KHRoaXMucHJveHksIGFyZ3VtZW50cyk7XG59O1xuXG5GYXVsdC5wcm90b3R5cGUuc2V0ID0gZnVuY3Rpb24oKSB7XG4gICAgdGhpcy5wcm94eS5zZXQuYXBwbHkodGhpcy5wcm94eSwgYXJndW1lbnRzKTtcbn07XG5cbi8qKlxuICogQGNsYXNzICBbUmVsYXRpb25zaGlwUHJveHkgZGVzY3JpcHRpb25dXG4gKiBAcGFyYW0ge09iamVjdH0gb3B0c1xuICogQGNvbnN0cnVjdG9yXG4gKi9cbmZ1bmN0aW9uIFJlbGF0aW9uc2hpcFByb3h5KG9wdHMpIHtcbiAgICB0aGlzLl9vcHRzID0gb3B0cztcbiAgICBpZiAoIXRoaXMpIHJldHVybiBuZXcgUmVsYXRpb25zaGlwUHJveHkob3B0cyk7XG4gICAgdmFyIHNlbGYgPSB0aGlzO1xuICAgIHRoaXMuZmF1bHQgPSBuZXcgRmF1bHQodGhpcyk7XG4gICAgdGhpcy5vYmplY3QgPSBudWxsO1xuICAgIHRoaXMuX2lkID0gdW5kZWZpbmVkO1xuICAgIHRoaXMucmVsYXRlZCA9IG51bGw7XG4gICAgT2JqZWN0LmRlZmluZVByb3BlcnR5KHRoaXMsICdpc0ZhdWx0Jywge1xuICAgICAgICBnZXQ6IGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgaWYgKHNlbGYuX2lkKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuICFzZWxmLnJlbGF0ZWQ7XG4gICAgICAgICAgICB9IGVsc2UgaWYgKHNlbGYuX2lkID09PSBudWxsKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgICAgIH0sXG4gICAgICAgIHNldDogZnVuY3Rpb24odikge1xuICAgICAgICAgICAgaWYgKHYpIHtcbiAgICAgICAgICAgICAgICBzZWxmLl9pZCA9IHVuZGVmaW5lZDtcbiAgICAgICAgICAgICAgICBzZWxmLnJlbGF0ZWQgPSBudWxsO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICBpZiAoIXNlbGYuX2lkKSB7XG4gICAgICAgICAgICAgICAgICAgIHNlbGYuX2lkID0gbnVsbDtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgIH0sXG4gICAgICAgIGVudW1lcmFibGU6IHRydWUsXG4gICAgICAgIGNvbmZpZ3VyYWJsZTogdHJ1ZVxuICAgIH0pO1xuICAgIGRlZmluZVN1YlByb3BlcnR5LmNhbGwodGhpcywgJ3JldmVyc2VNYXBwaW5nJywgdGhpcy5fb3B0cyk7XG4gICAgZGVmaW5lU3ViUHJvcGVydHkuY2FsbCh0aGlzLCAnZm9yd2FyZE1hcHBpbmcnLCB0aGlzLl9vcHRzKTtcbiAgICBkZWZpbmVTdWJQcm9wZXJ0eS5jYWxsKHRoaXMsICdmb3J3YXJkTmFtZScsIHRoaXMuX29wdHMpO1xuICAgIGRlZmluZVN1YlByb3BlcnR5LmNhbGwodGhpcywgJ3JldmVyc2VOYW1lJywgdGhpcy5fb3B0cyk7XG4gICAgZGVmaW5lU3ViUHJvcGVydHkuY2FsbCh0aGlzLCAnaXNSZXZlcnNlJywgdGhpcy5fb3B0cyk7XG4gICAgT2JqZWN0LmRlZmluZVByb3BlcnR5KHRoaXMsICdpc0ZvcndhcmQnLCB7XG4gICAgICAgIGdldDogZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICByZXR1cm4gIXNlbGYuaXNSZXZlcnNlO1xuICAgICAgICB9LFxuICAgICAgICBzZXQ6IGZ1bmN0aW9uICh2KSB7XG4gICAgICAgICAgICBzZWxmLmlzUmV2ZXJzZSA9ICF2O1xuICAgICAgICB9LFxuICAgICAgICBlbnVtZXJhYmxlOiB0cnVlLFxuICAgICAgICBjb25maWd1cmFibGU6IHRydWVcbiAgICB9KTtcbiAgICBpZiAodGhpcy5fb3B0cy5pc1JldmVyc2UgPT09IHVuZGVmaW5lZCAmJiB0aGlzLl9vcHRzLmlzRm9yd2FyZCAhPT0gdW5kZWZpbmVkKSB7XG4gICAgICAgIHRoaXMuaXNSZXZlcnNlID0gIXRoaXMuX29wdHMuaXNGb3J3YXJkO1xuICAgIH1cbiAgICBlbHNlIGlmICh0aGlzLl9vcHRzLmlzUmV2ZXJzZSA9PT0gdW5kZWZpbmVkICYmIHRoaXMuX29wdHMuaXNGb3J3YXJkID09PSB1bmRlZmluZWQpIHtcbiAgICAgICAgdGhyb3cgSW50ZXJuYWxTaWVzdGFFcnJvcignTXVzdCBzcGVjaWZ5IGVpdGhlciBpc1JldmVyc2Ugb3IgaXNGb3J3YXJkIHdoZW4gY29uZmlndXJpbmcgcmVsYXRpb25zaGlwIHByb3h5LicpO1xuICAgIH1cbiB9XG5cblJlbGF0aW9uc2hpcFByb3h5LnByb3RvdHlwZS5fZHVtcCA9IGZ1bmN0aW9uKGFzSnNvbikge1xuICAgIHZhciBkdW1wZWQgPSB7fTtcbn07XG5cblJlbGF0aW9uc2hpcFByb3h5LnByb3RvdHlwZS5pbnN0YWxsID0gZnVuY3Rpb24ob2JqKSB7XG4gICAgaWYgKG9iaikge1xuICAgICAgICBpZiAoIXRoaXMub2JqZWN0KSB7XG4gICAgICAgICAgICB0aGlzLm9iamVjdCA9IG9iajtcbiAgICAgICAgICAgIHZhciBzZWxmID0gdGhpcztcbiAgICAgICAgICAgIHZhciBuYW1lID0gZ2V0Rm9yd2FyZE5hbWUuY2FsbCh0aGlzKTtcbiAgICAgICAgICAgIE9iamVjdC5kZWZpbmVQcm9wZXJ0eShvYmosIG5hbWUsIHtcbiAgICAgICAgICAgICAgICBnZXQ6IGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgICAgICAgICBpZiAoc2VsZi5pc0ZhdWx0KSB7XG4gICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gc2VsZi5mYXVsdDtcbiAgICAgICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiBzZWxmLnJlbGF0ZWQ7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgIHNldDogZnVuY3Rpb24odikge1xuICAgICAgICAgICAgICAgICAgICBzZWxmLnNldCh2KTtcbiAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgIGNvbmZpZ3VyYWJsZTogdHJ1ZSxcbiAgICAgICAgICAgICAgICBlbnVtZXJhYmxlOiB0cnVlXG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIG9ialsoJ2dldCcgKyB1dGlsLmNhcGl0YWxpc2VGaXJzdExldHRlcihuYW1lKSldID0gXy5iaW5kKHRoaXMuZ2V0LCB0aGlzKTtcbiAgICAgICAgICAgIG9ialsoJ3NldCcgKyB1dGlsLmNhcGl0YWxpc2VGaXJzdExldHRlcihuYW1lKSldID0gXy5iaW5kKHRoaXMuc2V0LCB0aGlzKTtcbiAgICAgICAgICAgIG9ialtuYW1lICsgJ1Byb3h5J10gPSB0aGlzO1xuICAgICAgICAgICAgaWYgKCFvYmouX3Byb3hpZXMpIHtcbiAgICAgICAgICAgICAgICBvYmouX3Byb3hpZXMgPSBbXTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIG9iai5fcHJveGllcy5wdXNoKHRoaXMpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgdGhyb3cgbmV3IEludGVybmFsU2llc3RhRXJyb3IoJ0FscmVhZHkgaW5zdGFsbGVkLicpO1xuICAgICAgICB9XG4gICAgfSBlbHNlIHtcbiAgICAgICAgdGhyb3cgbmV3IEludGVybmFsU2llc3RhRXJyb3IoJ05vIG9iamVjdCBwYXNzZWQgdG8gcmVsYXRpb25zaGlwIGluc3RhbGwnKTtcbiAgICB9XG59O1xuXG5SZWxhdGlvbnNoaXBQcm94eS5wcm90b3R5cGUuc2V0ID0gZnVuY3Rpb24ob2JqKSB7XG4gICAgdGhyb3cgbmV3IEludGVybmFsU2llc3RhRXJyb3IoJ011c3Qgc3ViY2xhc3MgUmVsYXRpb25zaGlwUHJveHknKTtcbn07XG5cblJlbGF0aW9uc2hpcFByb3h5LnByb3RvdHlwZS5nZXQgPSBmdW5jdGlvbihjYWxsYmFjaykge1xuICAgIHRocm93IG5ldyBJbnRlcm5hbFNpZXN0YUVycm9yKCdNdXN0IHN1YmNsYXNzIFJlbGF0aW9uc2hpcFByb3h5Jyk7XG59O1xuXG5mdW5jdGlvbiB2ZXJpZnlNYXBwaW5nKG9iaiwgbWFwcGluZykge1xuICAgIGlmIChvYmoubWFwcGluZyAhPSBtYXBwaW5nKSB7XG4gICAgICAgIHZhciBlcnIgPSAnTWFwcGluZyBkb2VzIG5vdCBtYXRjaC4gRXhwZWN0ZWQgJyArIG1hcHBpbmcudHlwZSArICcgYnV0IGdvdCAnICsgb2JqLm1hcHBpbmcudHlwZTtcbiAgICAgICAgdGhyb3cgbmV3IEludGVybmFsU2llc3RhRXJyb3IoZXJyKTtcbiAgICB9XG59XG5cbi8vIFRPRE86IFNoYXJlIGNvZGUgYmV0d2VlbiBnZXRSZXZlcnNlUHJveHlGb3JPYmplY3QgYW5kIGdldEZvcndhcmRQcm94eUZvck9iamVjdFxuXG5mdW5jdGlvbiBnZXRSZXZlcnNlUHJveHlGb3JPYmplY3Qob2JqKSB7XG4gICAgdmFyIHJldmVyc2VOYW1lID0gZ2V0UmV2ZXJzZU5hbWUuY2FsbCh0aGlzKTtcbiAgICB2YXIgcHJveHlOYW1lID0gKHJldmVyc2VOYW1lICsgJ1Byb3h5Jyk7XG4gICAgdmFyIHJldmVyc2VNYXBwaW5nID0gdGhpcy5yZXZlcnNlTWFwcGluZztcbiAgICAvLyBUaGlzIHNob3VsZCBuZXZlciBoYXBwZW4uIFNob3VsZCBnICAgZXQgY2F1Z2h0IGluIHRoZSBtYXBwaW5nIG9wZXJhdGlvbj9cbiAgICBpZiAodXRpbC5pc0FycmF5KG9iaikpIHtcbiAgICAgICAgLy8gXy5lYWNoKG9iaiwgZnVuY3Rpb24obykge1xuICAgICAgICAvLyAgICAgdmVyaWZ5TWFwcGluZyhvLCB0aGlzLmZvcndhcmRNYXBwaW5nKTtcbiAgICAgICAgLy8gfSk7XG4gICAgICAgIHJldHVybiBfLnBsdWNrKG9iaiwgcHJveHlOYW1lKTtcbiAgICB9IGVsc2Uge1xuICAgICAgICAvLyB2ZXJpZnlNYXBwaW5nKG9iaiwgdGhpcy5mb3J3YXJkTWFwcGluZyk7XG4gICAgICAgIHZhciBwcm94eSA9IG9ialtwcm94eU5hbWVdO1xuICAgICAgICBpZiAoIXByb3h5KSB7XG4gICAgICAgICAgICB2YXIgZXJyID0gJ05vIHByb3h5IHdpdGggbmFtZSBcIicgKyBwcm94eU5hbWUgKyAnXCIgb24gbWFwcGluZyAnICsgcmV2ZXJzZU1hcHBpbmcudHlwZTtcbiAgICAgICAgICAgIHRocm93IG5ldyBJbnRlcm5hbFNpZXN0YUVycm9yKGVycik7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHByb3h5O1xuICAgIH1cbn1cblxuZnVuY3Rpb24gZ2V0Rm9yd2FyZFByb3h5Rm9yT2JqZWN0KG9iaikge1xuICAgIHZhciBmb3J3YXJkTmFtZSA9IGdldEZvcndhcmROYW1lLmNhbGwodGhpcyk7XG4gICAgdmFyIHByb3h5TmFtZSA9IGZvcndhcmROYW1lICsgJ1Byb3h5JztcbiAgICB2YXIgZm9yd2FyZE1hcHBpbmcgPSB0aGlzLmZvcndhcmRNYXBwaW5nO1xuICAgIGlmICh1dGlsLmlzQXJyYXkob2JqKSkge1xuICAgICAgICAvLyBfLmVhY2gob2JqLCBmdW5jdGlvbihvKSB7XG4gICAgICAgIC8vICAgICB2ZXJpZnlNYXBwaW5nKG8sIHRoaXMucmV2ZXJzZU1hcHBpbmcpO1xuICAgICAgICAvLyB9KTtcbiAgICAgICAgcmV0dXJuIF8ucGx1Y2sob2JqLCBwcm94eU5hbWUpO1xuICAgIH0gZWxzZSB7XG4gICAgICAgIC8vIHZlcmlmeU1hcHBpbmcob2JqLCB0aGlzLnJldmVyc2VNYXBwaW5nKTtcbiAgICAgICAgdmFyIHByb3h5ID0gb2JqW3Byb3h5TmFtZV07XG4gICAgICAgIGlmICghcHJveHkpIHtcbiAgICAgICAgICAgIHZhciBlcnIgPSAnTm8gcHJveHkgd2l0aCBuYW1lIFwiJyArIHByb3h5TmFtZSArICdcIiBvbiBtYXBwaW5nICcgKyBmb3J3YXJkTWFwcGluZy50eXBlO1xuICAgICAgICAgICAgdGhyb3cgbmV3IEludGVybmFsU2llc3RhRXJyb3IoZXJyKTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gcHJveHk7XG4gICAgfVxufVxuXG5mdW5jdGlvbiBnZXRSZXZlcnNlTmFtZSgpIHtcbiAgICByZXR1cm4gdGhpcy5pc0ZvcndhcmQgPyB0aGlzLnJldmVyc2VOYW1lIDogdGhpcy5mb3J3YXJkTmFtZTtcbn1cblxuZnVuY3Rpb24gZ2V0Rm9yd2FyZE5hbWUoKSB7XG4gICAgcmV0dXJuIHRoaXMuaXNGb3J3YXJkID8gdGhpcy5mb3J3YXJkTmFtZSA6IHRoaXMucmV2ZXJzZU5hbWU7XG59XG5cbmZ1bmN0aW9uIGdldFJldmVyc2VNYXBwaW5nKCkge1xuICAgIHJldHVybiB0aGlzLmlzRm9yd2FyZCA/IHRoaXMucmV2ZXJzZU1hcHBpbmcgOiB0aGlzLmZvcndhcmRNYXBwaW5nO1xufVxuXG5mdW5jdGlvbiBnZXRGb3J3YXJkTWFwcGluZygpIHtcbiAgICByZXR1cm4gdGhpcy5pc0ZvcndhcmQgPyB0aGlzLmZvcndhcmRNYXBwaW5nIDogdGhpcy5yZXZlcnNlTWFwcGluZztcbn1cblxuZnVuY3Rpb24gY2hlY2tJbnN0YWxsZWQoKSB7XG4gICAgaWYgKCF0aGlzLm9iamVjdCkge1xuICAgICAgICB0aHJvdyBuZXcgSW50ZXJuYWxTaWVzdGFFcnJvcignUHJveHkgbXVzdCBiZSBpbnN0YWxsZWQgb24gYW4gb2JqZWN0IGJlZm9yZSBjYW4gdXNlIGl0LicpO1xuICAgIH1cbn1cblxuLyoqXG4gKiBDb25maWd1cmUgX2lkIGFuZCByZWxhdGVkIHdpdGggdGhlIG5ldyByZWxhdGVkIG9iamVjdC5cbiAqIEBwYXJhbSBvYmpcbiAqL1xuZnVuY3Rpb24gc2V0KG9iaikge1xuICAgIHJlZ2lzdGVyU2V0Q2hhbmdlLmNhbGwodGhpcywgb2JqKTtcbiAgICBpZiAob2JqKSB7XG4gICAgICAgIGlmICh1dGlsLmlzQXJyYXkob2JqKSkge1xuICAgICAgICAgICAgdGhpcy5faWQgPSBfLnBsdWNrKG9iaiwgJ19pZCcpO1xuICAgICAgICAgICAgdGhpcy5yZWxhdGVkID0gb2JqO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgdGhpcy5faWQgPSBvYmouX2lkO1xuICAgICAgICAgICAgdGhpcy5yZWxhdGVkID0gb2JqO1xuICAgICAgICB9XG4gICAgfSBlbHNlIHtcbiAgICAgICAgdGhpcy5faWQgPSBudWxsO1xuICAgICAgICB0aGlzLnJlbGF0ZWQgPSBudWxsO1xuICAgIH1cbn1cblxuZnVuY3Rpb24gc3BsaWNlKGlkeCwgbnVtUmVtb3ZlKSB7XG4gICAgcmVnaXN0ZXJTcGxpY2VDaGFuZ2UuYXBwbHkodGhpcywgYXJndW1lbnRzKTtcbiAgICB2YXIgYWRkID0gQXJyYXkucHJvdG90eXBlLnNsaWNlLmNhbGwoYXJndW1lbnRzLCAyKTtcbiAgICB2YXIgcmV0dXJuVmFsdWUgPSBfLnBhcnRpYWwodGhpcy5faWQuc3BsaWNlLCBpZHgsIG51bVJlbW92ZSkuYXBwbHkodGhpcy5faWQsIF8ucGx1Y2soYWRkLCAnX2lkJykpO1xuICAgIGlmICh0aGlzLnJlbGF0ZWQpIHtcbiAgICAgICAgXy5wYXJ0aWFsKHRoaXMucmVsYXRlZC5zcGxpY2UsIGlkeCwgbnVtUmVtb3ZlKS5hcHBseSh0aGlzLnJlbGF0ZWQsIGFkZCk7XG4gICAgfVxuICAgIHJldHVybiByZXR1cm5WYWx1ZTtcbn1cblxuZnVuY3Rpb24gb2JqQXNTdHJpbmcob2JqKSB7XG4gICAgZnVuY3Rpb24gX29iakFzU3RyaW5nKG9iaikge1xuICAgICAgICBpZiAob2JqKSB7XG4gICAgICAgICAgICB2YXIgbWFwcGluZyA9IG9iai5tYXBwaW5nO1xuICAgICAgICAgICAgdmFyIG1hcHBpbmdOYW1lID0gbWFwcGluZy50eXBlO1xuICAgICAgICAgICAgdmFyIGlkZW50ID0gb2JqLl9pZDtcbiAgICAgICAgICAgIGlmICh0eXBlb2YgaWRlbnQgPT0gJ3N0cmluZycpIHtcbiAgICAgICAgICAgICAgICBpZGVudCA9ICdcIicgKyBpZGVudCArICdcIic7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICByZXR1cm4gbWFwcGluZ05hbWUgKyAnW19pZD0nICsgaWRlbnQgKyAnXSc7XG4gICAgICAgIH0gZWxzZSBpZiAob2JqID09PSB1bmRlZmluZWQpIHtcbiAgICAgICAgICAgIHJldHVybiAndW5kZWZpbmVkJztcbiAgICAgICAgfSBlbHNlIGlmIChvYmogPT09IG51bGwpIHtcbiAgICAgICAgICAgIHJldHVybiAnbnVsbCc7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBpZiAodXRpbC5pc0FycmF5KG9iaikpIHJldHVybiBfLm1hcChfb2JqQXNTdHJpbmcsIG9iaikuam9pbignLCAnKTtcbiAgICByZXR1cm4gX29iakFzU3RyaW5nKG9iaik7XG59XG5cbmZ1bmN0aW9uIGNsZWFyUmV2ZXJzZVJlbGF0ZWQoKSB7XG4gICAgdmFyIHNlbGYgPSB0aGlzO1xuICAgIGlmICghc2VsZi5pc0ZhdWx0KSB7XG4gICAgICAgIGlmICh0aGlzLnJlbGF0ZWQpIHtcbiAgICAgICAgICAgIHZhciByZXZlcnNlUHJveHkgPSBnZXRSZXZlcnNlUHJveHlGb3JPYmplY3QuY2FsbCh0aGlzLCB0aGlzLnJlbGF0ZWQpO1xuICAgICAgICAgICAgdmFyIHJldmVyc2VQcm94aWVzID0gdXRpbC5pc0FycmF5KHJldmVyc2VQcm94eSkgPyByZXZlcnNlUHJveHkgOiBbcmV2ZXJzZVByb3h5XTtcbiAgICAgICAgICAgIF8uZWFjaChyZXZlcnNlUHJveGllcywgZnVuY3Rpb24ocCkge1xuICAgICAgICAgICAgICAgIGlmICh1dGlsLmlzQXJyYXkocC5faWQpKSB7XG4gICAgICAgICAgICAgICAgICAgIHZhciBpZHggPSBwLl9pZC5pbmRleE9mKHNlbGYub2JqZWN0Ll9pZCk7XG4gICAgICAgICAgICAgICAgICAgIG1ha2VDaGFuZ2VzVG9SZWxhdGVkV2l0aG91dE9ic2VydmF0aW9ucy5jYWxsKHAsIGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgc3BsaWNlLmNhbGwocCwgaWR4LCAxKTtcbiAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgc2V0LmNhbGwocCwgbnVsbCk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSk7XG4gICAgICAgIH1cbiAgICB9IGVsc2Uge1xuICAgICAgICBpZiAoc2VsZi5faWQpIHtcbiAgICAgICAgICAgIHZhciByZXZlcnNlTmFtZSA9IGdldFJldmVyc2VOYW1lLmNhbGwodGhpcyk7XG4gICAgICAgICAgICB2YXIgcmV2ZXJzZU1hcHBpbmcgPSBnZXRSZXZlcnNlTWFwcGluZy5jYWxsKHRoaXMpO1xuICAgICAgICAgICAgdmFyIGlkZW50aWZpZXJzID0gdXRpbC5pc0FycmF5KHNlbGYuX2lkKSA/IHNlbGYuX2lkIDogW3NlbGYuX2lkXTtcbiAgICAgICAgICAgIGlmICh0aGlzLl9yZXZlcnNlSXNBcnJheSkge1xuICAgICAgICAgICAgICAgIF8uZWFjaChpZGVudGlmaWVycywgZnVuY3Rpb24oX2lkKSB7XG4gICAgICAgICAgICAgICAgICAgIGNvcmVDaGFuZ2VzLnJlZ2lzdGVyQ2hhbmdlKHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbGxlY3Rpb246IHJldmVyc2VNYXBwaW5nLmNvbGxlY3Rpb24sXG4gICAgICAgICAgICAgICAgICAgICAgICBtYXBwaW5nOiByZXZlcnNlTWFwcGluZy50eXBlLFxuICAgICAgICAgICAgICAgICAgICAgICAgX2lkOiBfaWQsXG4gICAgICAgICAgICAgICAgICAgICAgICBmaWVsZDogcmV2ZXJzZU5hbWUsXG4gICAgICAgICAgICAgICAgICAgICAgICByZW1vdmVkSWQ6IFtzZWxmLm9iamVjdC5faWRdLFxuICAgICAgICAgICAgICAgICAgICAgICAgcmVtb3ZlZDogW3NlbGYub2JqZWN0XSxcbiAgICAgICAgICAgICAgICAgICAgICAgIHR5cGU6IENoYW5nZVR5cGUuRGVsZXRlLFxuICAgICAgICAgICAgICAgICAgICAgICAgb2JqOiBzZWxmLm9iamVjdFxuICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgXy5lYWNoKGlkZW50aWZpZXJzLCBmdW5jdGlvbihfaWQpIHtcbiAgICAgICAgICAgICAgICAgICAgY29yZUNoYW5nZXMucmVnaXN0ZXJDaGFuZ2Uoe1xuICAgICAgICAgICAgICAgICAgICAgICAgY29sbGVjdGlvbjogcmV2ZXJzZU1hcHBpbmcuY29sbGVjdGlvbixcbiAgICAgICAgICAgICAgICAgICAgICAgIG1hcHBpbmc6IHJldmVyc2VNYXBwaW5nLnR5cGUsXG4gICAgICAgICAgICAgICAgICAgICAgICBfaWQ6IF9pZCxcbiAgICAgICAgICAgICAgICAgICAgICAgIGZpZWxkOiByZXZlcnNlTmFtZSxcbiAgICAgICAgICAgICAgICAgICAgICAgIG5ldzogbnVsbCxcbiAgICAgICAgICAgICAgICAgICAgICAgIG5ld0lkOiBudWxsLFxuICAgICAgICAgICAgICAgICAgICAgICAgb2xkSWQ6IHNlbGYub2JqZWN0Ll9pZCxcbiAgICAgICAgICAgICAgICAgICAgICAgIG9sZDogc2VsZi5vYmplY3QsXG4gICAgICAgICAgICAgICAgICAgICAgICB0eXBlOiBDaGFuZ2VUeXBlLlNldCxcbiAgICAgICAgICAgICAgICAgICAgICAgIG9iajogc2VsZi5vYmplY3RcbiAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcihnZXRGb3J3YXJkTmFtZS5jYWxsKHRoaXMpICsgJyBoYXMgbm8gX2lkJyk7XG4gICAgICAgIH1cbiAgICB9XG59XG5cbmZ1bmN0aW9uIG1ha2VDaGFuZ2VzVG9SZWxhdGVkV2l0aG91dE9ic2VydmF0aW9ucyhmKSB7XG4gICAgaWYgKHRoaXMucmVsYXRlZCkge1xuICAgICAgICB0aGlzLnJlbGF0ZWQub25lVG9NYW55T2JzZXJ2ZXIuY2xvc2UoKTtcbiAgICAgICAgdGhpcy5yZWxhdGVkLm9uZVRvTWFueU9ic2VydmVyID0gbnVsbDtcbiAgICAgICAgZigpO1xuICAgICAgICB3cmFwQXJyYXkuY2FsbCh0aGlzLCB0aGlzLnJlbGF0ZWQpO1xuICAgIH0gZWxzZSB7XG4gICAgICAgIC8vIElmIHRoZXJlJ3MgYSBmYXVsdCB3ZSBjYW4gbWFrZSBjaGFuZ2VzIGFueXdheS5cbiAgICAgICAgZigpO1xuICAgIH1cbn1cblxuZnVuY3Rpb24gc2V0UmV2ZXJzZShvYmopIHtcbiAgICB2YXIgc2VsZiA9IHRoaXM7XG4gICAgdmFyIHJldmVyc2VQcm94eSA9IGdldFJldmVyc2VQcm94eUZvck9iamVjdC5jYWxsKHRoaXMsIG9iaik7XG4gICAgdmFyIHJldmVyc2VQcm94aWVzID0gdXRpbC5pc0FycmF5KHJldmVyc2VQcm94eSkgPyByZXZlcnNlUHJveHkgOiBbcmV2ZXJzZVByb3h5XTtcbiAgICBfLmVhY2gocmV2ZXJzZVByb3hpZXMsIGZ1bmN0aW9uKHApIHtcbiAgICAgICAgaWYgKHV0aWwuaXNBcnJheShwLl9pZCkpIHtcbiAgICAgICAgICAgIG1ha2VDaGFuZ2VzVG9SZWxhdGVkV2l0aG91dE9ic2VydmF0aW9ucy5jYWxsKHAsIGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgICAgIHNwbGljZS5jYWxsKHAsIHAuX2lkLmxlbmd0aCwgMCwgc2VsZi5vYmplY3QpO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBjbGVhclJldmVyc2VSZWxhdGVkLmNhbGwocCk7XG4gICAgICAgICAgICBzZXQuY2FsbChwLCBzZWxmLm9iamVjdCk7XG4gICAgICAgIH1cbiAgICB9KTtcbn1cblxuZnVuY3Rpb24gcmVnaXN0ZXJTZXRDaGFuZ2Uob2JqKSB7XG4gICAgdmFyIHByb3h5T2JqZWN0ID0gdGhpcy5vYmplY3Q7XG4gICAgaWYgKCFwcm94eU9iamVjdCkgdGhyb3cgbmV3IEludGVybmFsU2llc3RhRXJyb3IoJ1Byb3h5IG11c3QgaGF2ZSBhbiBvYmplY3QgYXNzb2NpYXRlZCcpO1xuICAgIHZhciBtYXBwaW5nID0gcHJveHlPYmplY3QubWFwcGluZy50eXBlO1xuICAgIHZhciBjb2xsID0gcHJveHlPYmplY3QuY29sbGVjdGlvbjtcbiAgICB2YXIgbmV3SWQ7XG4gICAgaWYgKHV0aWwuaXNBcnJheShvYmopKSB7XG4gICAgICAgIG5ld0lkID0gXy5wbHVjayhvYmosICdfaWQnKTtcbiAgICB9IGVsc2Uge1xuICAgICAgICBuZXdJZCA9IG9iaiA/IG9iai5faWQgOiBvYmo7XG4gICAgfVxuICAgIC8vIFdlIHRha2UgW10gPT0gbnVsbCA9PSB1bmRlZmluZWQgaW4gdGhlIGNhc2Ugb2YgcmVsYXRpb25zaGlwcy5cbiAgICB2YXIgb2xkSWQgPSB0aGlzLl9pZDtcbiAgICBpZiAodXRpbC5pc0FycmF5KG9sZElkKSAmJiAhb2xkSWQubGVuZ3RoKSB7XG4gICAgICAgIG9sZElkID0gbnVsbDtcbiAgICB9XG4gICAgdmFyIG9sZCA9IHRoaXMucmVsYXRlZDtcbiAgICBpZiAodXRpbC5pc0FycmF5KG9sZCkgJiYgIW9sZC5sZW5ndGgpIHtcbiAgICAgICAgb2xkID0gbnVsbDtcbiAgICB9XG4gICAgY29yZUNoYW5nZXMucmVnaXN0ZXJDaGFuZ2Uoe1xuICAgICAgICBjb2xsZWN0aW9uOiBjb2xsLFxuICAgICAgICBtYXBwaW5nOiBtYXBwaW5nLFxuICAgICAgICBfaWQ6IHByb3h5T2JqZWN0Ll9pZCxcbiAgICAgICAgZmllbGQ6IGdldEZvcndhcmROYW1lLmNhbGwodGhpcyksXG4gICAgICAgIG5ld0lkOiBuZXdJZCxcbiAgICAgICAgb2xkSWQ6IG9sZElkLFxuICAgICAgICBvbGQ6IG9sZCxcbiAgICAgICAgbmV3OiBvYmosXG4gICAgICAgIHR5cGU6IENoYW5nZVR5cGUuU2V0LFxuICAgICAgICBvYmo6IHByb3h5T2JqZWN0XG4gICAgfSk7XG59XG5cbmZ1bmN0aW9uIHJlZ2lzdGVyU3BsaWNlQ2hhbmdlKGlkeCwgbnVtUmVtb3ZlKSB7XG4gICAgdmFyIGFkZCA9IEFycmF5LnByb3RvdHlwZS5zbGljZS5jYWxsKGFyZ3VtZW50cywgMik7XG4gICAgdmFyIG1hcHBpbmcgPSB0aGlzLm9iamVjdC5tYXBwaW5nLnR5cGU7XG4gICAgdmFyIGNvbGwgPSB0aGlzLm9iamVjdC5jb2xsZWN0aW9uO1xuICAgIGNvcmVDaGFuZ2VzLnJlZ2lzdGVyQ2hhbmdlKHtcbiAgICAgICAgY29sbGVjdGlvbjogY29sbCxcbiAgICAgICAgbWFwcGluZzogbWFwcGluZyxcbiAgICAgICAgX2lkOiB0aGlzLm9iamVjdC5faWQsXG4gICAgICAgIGZpZWxkOiBnZXRGb3J3YXJkTmFtZS5jYWxsKHRoaXMpLFxuICAgICAgICBpbmRleDogaWR4LFxuICAgICAgICByZW1vdmVkSWQ6IHRoaXMuX2lkLnNsaWNlKGlkeCwgaWR4ICsgbnVtUmVtb3ZlKSxcbiAgICAgICAgcmVtb3ZlZDogdGhpcy5yZWxhdGVkID8gdGhpcy5yZWxhdGVkLnNsaWNlKGlkeCwgaWR4ICsgbnVtUmVtb3ZlKSA6IG51bGwsXG4gICAgICAgIGFkZGVkSWQ6IGFkZC5sZW5ndGggPyBfLnBsdWNrKGFkZCwgJ19pZCcpIDogW10sXG4gICAgICAgIGFkZGVkOiBhZGQubGVuZ3RoID8gYWRkIDogW10sXG4gICAgICAgIHR5cGU6IENoYW5nZVR5cGUuU3BsaWNlLFxuICAgICAgICBvYmo6IHRoaXMub2JqZWN0XG4gICAgfSk7XG59XG5cblxuZnVuY3Rpb24gd3JhcEFycmF5KGFycikge1xuICAgIHZhciBzZWxmID0gdGhpcztcbiAgICB3cmFwQXJyYXlGb3JBdHRyaWJ1dGVzKGFyciwgdGhpcy5yZXZlcnNlTmFtZSwgdGhpcy5vYmplY3QpO1xuICAgIGlmICghYXJyLm9uZVRvTWFueU9ic2VydmVyKSB7XG4gICAgICAgIGFyci5vbmVUb01hbnlPYnNlcnZlciA9IG5ldyBBcnJheU9ic2VydmVyKGFycik7XG4gICAgICAgIHZhciBvYnNlcnZlckZ1bmN0aW9uID0gZnVuY3Rpb24oc3BsaWNlcykge1xuICAgICAgICAgICAgc3BsaWNlcy5mb3JFYWNoKGZ1bmN0aW9uKHNwbGljZSkge1xuICAgICAgICAgICAgICAgIHZhciBhZGRlZCA9IHNwbGljZS5hZGRlZENvdW50ID8gYXJyLnNsaWNlKHNwbGljZS5pbmRleCwgc3BsaWNlLmluZGV4ICsgc3BsaWNlLmFkZGVkQ291bnQpIDogW107XG4gICAgICAgICAgICAgICAgdmFyIG1hcHBpbmcgPSBnZXRGb3J3YXJkTWFwcGluZy5jYWxsKHNlbGYpO1xuICAgICAgICAgICAgICAgIGNvcmVDaGFuZ2VzLnJlZ2lzdGVyQ2hhbmdlKHtcbiAgICAgICAgICAgICAgICAgICAgY29sbGVjdGlvbjogbWFwcGluZy5jb2xsZWN0aW9uLFxuICAgICAgICAgICAgICAgICAgICBtYXBwaW5nOiBtYXBwaW5nLnR5cGUsXG4gICAgICAgICAgICAgICAgICAgIF9pZDogc2VsZi5vYmplY3QuX2lkLFxuICAgICAgICAgICAgICAgICAgICBmaWVsZDogZ2V0Rm9yd2FyZE5hbWUuY2FsbChzZWxmKSxcbiAgICAgICAgICAgICAgICAgICAgcmVtb3ZlZDogc3BsaWNlLnJlbW92ZWQsXG4gICAgICAgICAgICAgICAgICAgIGFkZGVkOiBhZGRlZCxcbiAgICAgICAgICAgICAgICAgICAgcmVtb3ZlZElkOiBfLnBsdWNrKHNwbGljZS5yZW1vdmVkLCAnX2lkJyksXG4gICAgICAgICAgICAgICAgICAgIGFkZGVkSWQ6IF8ucGx1Y2soc3BsaWNlLmFkZGVkLCAnX2lkJyksXG4gICAgICAgICAgICAgICAgICAgIHR5cGU6IENoYW5nZVR5cGUuU3BsaWNlLFxuICAgICAgICAgICAgICAgICAgICBvYmo6IHNlbGYub2JqZWN0XG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfTtcbiAgICAgICAgYXJyLm9uZVRvTWFueU9ic2VydmVyLm9wZW4ob2JzZXJ2ZXJGdW5jdGlvbik7XG4gICAgfVxufVxuXG5leHBvcnRzLlJlbGF0aW9uc2hpcFByb3h5ID0gUmVsYXRpb25zaGlwUHJveHk7XG5leHBvcnRzLkZhdWx0ID0gRmF1bHQ7XG5leHBvcnRzLmdldFJldmVyc2VQcm94eUZvck9iamVjdCA9IGdldFJldmVyc2VQcm94eUZvck9iamVjdDtcbmV4cG9ydHMuZ2V0Rm9yd2FyZFByb3h5Rm9yT2JqZWN0ID0gZ2V0Rm9yd2FyZFByb3h5Rm9yT2JqZWN0O1xuZXhwb3J0cy5nZXRSZXZlcnNlTmFtZSA9IGdldFJldmVyc2VOYW1lO1xuZXhwb3J0cy5nZXRGb3J3YXJkTmFtZSA9IGdldEZvcndhcmROYW1lO1xuZXhwb3J0cy5nZXRSZXZlcnNlTWFwcGluZyA9IGdldFJldmVyc2VNYXBwaW5nO1xuZXhwb3J0cy5nZXRGb3J3YXJkTWFwcGluZyA9IGdldEZvcndhcmRNYXBwaW5nO1xuZXhwb3J0cy5jaGVja0luc3RhbGxlZCA9IGNoZWNrSW5zdGFsbGVkO1xuZXhwb3J0cy5zZXQgPSBzZXQ7XG5leHBvcnRzLnJlZ2lzdGVyU2V0Q2hhbmdlID0gcmVnaXN0ZXJTZXRDaGFuZ2U7XG5leHBvcnRzLnNwbGljZSA9IHNwbGljZTtcbmV4cG9ydHMuY2xlYXJSZXZlcnNlUmVsYXRlZCA9IGNsZWFyUmV2ZXJzZVJlbGF0ZWQ7XG5leHBvcnRzLnNldFJldmVyc2UgPSBzZXRSZXZlcnNlO1xuZXhwb3J0cy5vYmpBc1N0cmluZyA9IG9iakFzU3RyaW5nO1xuZXhwb3J0cy53cmFwQXJyYXkgPSB3cmFwQXJyYXk7XG5leHBvcnRzLnJlZ2lzdGVyU3BsaWNlQ2hhbmdlID0gcmVnaXN0ZXJTcGxpY2VDaGFuZ2U7XG5leHBvcnRzLm1ha2VDaGFuZ2VzVG9SZWxhdGVkV2l0aG91dE9ic2VydmF0aW9ucyA9IG1ha2VDaGFuZ2VzVG9SZWxhdGVkV2l0aG91dE9ic2VydmF0aW9uczsiLCIvKipcbiAqIEBtb2R1bGUgcXVlcnlcbiAqL1xuXG52YXIgbG9nID0gcmVxdWlyZSgnLi9vcGVyYXRpb24vbG9nJylcbiAgICAsIGNhY2hlID0gcmVxdWlyZSgnLi9jYWNoZScpXG4gICAgLCBMb2dnZXIgPSBsb2cubG9nZ2VyV2l0aE5hbWUoJ1F1ZXJ5JylcbiAgICAsIHV0aWwgPSByZXF1aXJlKCcuL3V0aWwnKTtcbkxvZ2dlci5zZXRMZXZlbChsb2cuTGV2ZWwud2Fybik7XG5cbi8qKlxuICogQGNsYXNzICBbUXVlcnkgZGVzY3JpcHRpb25dXG4gKiBAcGFyYW0ge01hcHBpbmd9IG1hcHBpbmdcbiAqIEBwYXJhbSB7T2JqZWN0fSBvcHRzXG4gKi9cbmZ1bmN0aW9uIFF1ZXJ5KG1hcHBpbmcsIG9wdHMpIHtcbiAgICB0aGlzLm1hcHBpbmcgPSBtYXBwaW5nO1xuICAgIHRoaXMucXVlcnkgPSBvcHRzO1xufVxuXG4vKipcbiAqIElmIHRoZSBzdG9yYWdlIGV4dGVuc2lvbiBpcyBlbmFibGVkLCBvYmplY3RzIG1heSBiZSBmYXVsdGVkIGFuZCBzbyB3ZSBuZWVkIHRvIHF1ZXJ5IHZpYSBQb3VjaERCLiBUaGUgc3RvcmFnZVxuICogZXh0ZW5zaW9uIHByb3ZpZGVzIHRoZSBSYXdRdWVyeSBjbGFzcyB0byBlbmFibGUgdGhpcy5cbiAqIEBwYXJhbSBjYWxsYmFja1xuICogQHByaXZhdGVcbiAqL1xuZnVuY3Rpb24gX2V4ZWN1dGVVc2luZ1N0b3JhZ2VFeHRlbnNpb24oY2FsbGJhY2spIHtcbiAgICB2YXIgZGVmZXJyZWQgPSB3aW5kb3cucSA/IHdpbmRvdy5xLmRlZmVyKCkgOiBudWxsO1xuICAgIGNhbGxiYWNrID0gdXRpbC5jb25zdHJ1Y3RDYWxsYmFja0FuZFByb21pc2VIYW5kbGVyKGNhbGxiYWNrLCBkZWZlcnJlZCk7XG4gICAgdmFyIHN0b3JhZ2VFeHRlbnNpb24gPSBzaWVzdGEuZXh0LnN0b3JhZ2U7XG4gICAgdmFyIFJhd1F1ZXJ5ID0gc3RvcmFnZUV4dGVuc2lvbi5SYXdRdWVyeTtcbiAgICB2YXIgUG91Y2ggPSBzdG9yYWdlRXh0ZW5zaW9uLlBvdWNoO1xuICAgIHZhciByYXdRdWVyeSA9IG5ldyBSYXdRdWVyeSh0aGlzLm1hcHBpbmcuY29sbGVjdGlvbiwgdGhpcy5tYXBwaW5nLnR5cGUsIHRoaXMucXVlcnkpO1xuICAgIHJhd1F1ZXJ5LmV4ZWN1dGUoZnVuY3Rpb24gKGVyciwgcmVzdWx0cykge1xuICAgICAgICBpZiAoZXJyKSB7XG4gICAgICAgICAgICBjYWxsYmFjayhlcnIpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgaWYgKExvZ2dlci5kZWJ1Zy5pc0VuYWJsZWQpXG4gICAgICAgICAgICAgICAgTG9nZ2VyLmRlYnVnKCdnb3QgcmVzdWx0cycsIHJlc3VsdHMpO1xuICAgICAgICAgICAgaWYgKGNhbGxiYWNrKSBjYWxsYmFjayhudWxsLCBQb3VjaC50b1NpZXN0YShyZXN1bHRzKSk7XG4gICAgICAgIH1cbiAgICB9KTtcbiAgICByZXR1cm4gZGVmZXJyZWQgPyBkZWZlcnJlZC5wcm9taXNlIDogbnVsbDtcbn1cblxuLyoqXG4gKiBSZXR1cm5zIHRydWUgaWYgdGhlIGdpdmVuIG9iamVjdCBtYXRjaGVzIHRoZSBxdWVyeS5cbiAqIEBwYXJhbSB7U2llc3RhTW9kZWx9IG9ialxuICogQHJldHVybnMge2Jvb2xlYW59XG4gKi9cbmZ1bmN0aW9uIG9iamVjdE1hdGNoZXNRdWVyeShvYmopIHtcbiAgICB2YXIgZmllbGRzID0gT2JqZWN0LmtleXModGhpcy5xdWVyeSk7XG4gICAgZm9yICh2YXIgaSA9IDA7IGkgPCBmaWVsZHMubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgdmFyIG9yaWdGaWVsZCA9IGZpZWxkc1tpXTtcbiAgICAgICAgdmFyIHNwbHQgPSBvcmlnRmllbGQuc3BsaXQoJ19fJyk7XG4gICAgICAgIHZhciBvcCA9ICdlJztcbiAgICAgICAgdmFyIGZpZWxkO1xuICAgICAgICBpZiAoc3BsdC5sZW5ndGggPT0gMikge1xuICAgICAgICAgICAgZmllbGQgPSBzcGx0WzBdXG4gICAgICAgICAgICBvcCA9IHNwbHRbMV07XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBmaWVsZCA9IG9yaWdGaWVsZDtcbiAgICAgICAgfVxuICAgICAgICB2YXIgcXVlcnlPYmogPSB0aGlzLnF1ZXJ5W29yaWdGaWVsZF07XG4gICAgICAgIHZhciB2YWwgPSBvYmpbZmllbGRdO1xuICAgICAgICBpZiAob3AgPT0gJ2UnKSB7XG4gICAgICAgICAgICBpZiAodmFsICE9IHF1ZXJ5T2JqKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgICAgICAgfVxuICAgICAgICB9IGVsc2UgaWYgKG9wID09ICdsdCcpIHtcbiAgICAgICAgICAgIGlmICh2YWwgPj0gcXVlcnlPYmopIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0gZWxzZSBpZiAob3AgPT0gJ2x0ZScpIHtcbiAgICAgICAgICAgIGlmICh2YWwgPiBxdWVyeU9iaikge1xuICAgICAgICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSBlbHNlIGlmIChvcCA9PSAnZ3QnKSB7XG4gICAgICAgICAgICBpZiAodmFsIDw9IHF1ZXJ5T2JqKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgICAgICAgfVxuICAgICAgICB9IGVsc2UgaWYgKG9wID09ICdndGUnKSB7XG4gICAgICAgICAgICBpZiAodmFsIDwgcXVlcnlPYmopIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICByZXR1cm4gJ1F1ZXJ5IG9wZXJhdG9yIFwiJyArIG9wICsgJ1wiJyArICcgZG9lcyBub3QgZXhpc3QnO1xuICAgICAgICB9XG4gICAgfVxuICAgIHJldHVybiB0cnVlO1xufVxuXG4vKipcbiAqIElmIHRoZSBzdG9yYWdlIGV4dGVuc2lvbiBpcyBub3QgZW5hYmxlZCwgd2Ugc2ltcGx5IGN5Y2xlIHRocm91Z2ggYWxsIG9iamVjdHMgb2YgdGhlIHR5cGUgcmVxdWVzdGVkIGluIG1lbW9yeS5cbiAqIEBwYXJhbSBjYWxsYmFja1xuICogQHByaXZhdGVcbiAqL1xuZnVuY3Rpb24gX2V4ZWN1dGVJbk1lbW9yeShjYWxsYmFjaykge1xuICAgIHZhciBkZWZlcnJlZCA9IHdpbmRvdy5xID8gd2luZG93LnEuZGVmZXIoKSA6IG51bGw7XG4gICAgY2FsbGJhY2sgPSB1dGlsLmNvbnN0cnVjdENhbGxiYWNrQW5kUHJvbWlzZUhhbmRsZXIoY2FsbGJhY2ssIGRlZmVycmVkKTtcbiAgICB2YXIgY2FjaGVCeVR5cGUgPSBjYWNoZS5fbG9jYWxDYWNoZUJ5VHlwZTtcbiAgICB2YXIgbWFwcGluZ05hbWUgPSB0aGlzLm1hcHBpbmcudHlwZTtcbiAgICB2YXIgY29sbGVjdGlvbk5hbWUgPSB0aGlzLm1hcHBpbmcuY29sbGVjdGlvbjtcbiAgICB2YXIgY2FjaGVCeU1hcHBpbmcgPSBjYWNoZUJ5VHlwZVtjb2xsZWN0aW9uTmFtZV07XG4gICAgdmFyIGNhY2hlQnlMb2NhbElkO1xuICAgIGlmIChjYWNoZUJ5TWFwcGluZykge1xuICAgICAgICBjYWNoZUJ5TG9jYWxJZCA9IGNhY2hlQnlNYXBwaW5nW21hcHBpbmdOYW1lXTtcbiAgICB9XG4gICAgaWYgKGNhY2hlQnlMb2NhbElkKSB7XG4gICAgICAgIHZhciBrZXlzID0gT2JqZWN0LmtleXMoY2FjaGVCeUxvY2FsSWQpO1xuICAgICAgICB2YXIgc2VsZiA9IHRoaXM7XG4gICAgICAgIHZhciByZXMgPSBbXTtcbiAgICAgICAgdmFyIGVycjtcbiAgICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCBrZXlzLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgICB2YXIgayA9IGtleXNbaV07XG4gICAgICAgICAgICB2YXIgb2JqID0gY2FjaGVCeUxvY2FsSWRba107XG4gICAgICAgICAgICB2YXIgbWF0Y2hlcyA9IG9iamVjdE1hdGNoZXNRdWVyeS5jYWxsKHNlbGYsIG9iaik7XG4gICAgICAgICAgICBpZiAodHlwZW9mKG1hdGNoZXMpID09ICdzdHJpbmcnKSB7XG4gICAgICAgICAgICAgICAgZXJyID0gbWF0Y2hlcztcbiAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgaWYgKG1hdGNoZXMpIHJlcy5wdXNoKG9iaik7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgY2FsbGJhY2soZXJyLCBlcnIgPyBudWxsIDogcmVzKTtcbiAgICB9IGVsc2UgaWYgKGNhbGxiYWNrKSB7XG4gICAgICAgIGNhbGxiYWNrKG51bGwsIFtdKTtcbiAgICB9XG4gICAgcmV0dXJuIGRlZmVycmVkID8gZGVmZXJyZWQucHJvbWlzZSA6IG51bGw7XG59XG5cblF1ZXJ5LnByb3RvdHlwZS5leGVjdXRlID0gZnVuY3Rpb24gKGNhbGxiYWNrKSB7XG4gICAgdmFyIGRlZmVycmVkID0gd2luZG93LnEgPyB3aW5kb3cucS5kZWZlcigpIDogbnVsbDtcbiAgICBjYWxsYmFjayA9IHV0aWwuY29uc3RydWN0Q2FsbGJhY2tBbmRQcm9taXNlSGFuZGxlcihjYWxsYmFjaywgZGVmZXJyZWQpO1xuICAgIC8vIGlmIChzaWVzdGEuZXh0LnN0b3JhZ2VFbmFibGVkKSB7XG4gICAgLy8gICAgIF9leGVjdXRlVXNpbmdTdG9yYWdlRXh0ZW5zaW9uLmNhbGwodGhpcywgY2FsbGJhY2spO1xuICAgIC8vIH1cbiAgICAvLyBlbHNlIHtcbiAgICBfZXhlY3V0ZUluTWVtb3J5LmNhbGwodGhpcywgY2FsbGJhY2spO1xuICAgIC8vIH1cbiAgICByZXR1cm4gZGVmZXJyZWQgPyBkZWZlcnJlZC5wcm9taXNlIDogbnVsbDtcbn07XG5cblF1ZXJ5LnByb3RvdHlwZS5fZHVtcCA9IGZ1bmN0aW9uIChhc0pzb24pIHtcbiAgICAvLyBUT0RPXG4gICAgcmV0dXJuIGFzSnNvbiA/ICd7fScgOiB7fTtcbn07XG5cbmV4cG9ydHMuUXVlcnkgPSBRdWVyeTsiLCIvKipcbiAqIEBtb2R1bGUgcmVsYXRpb25zaGlwXG4gKi9cblxuLyoqXG4gKiBDb25zdGFudHMgdGhhdCBkZXNjcmliZSByZWxhdGlvbnNoaXBzIGZvciBtYXBwaW5ncy5cbiAqIEB0eXBlIHtPYmplY3R9XG4gKi9cblJlbGF0aW9uc2hpcFR5cGUgPSB7XG4gICAgT25lVG9NYW55OiAnT25lVG9NYW55JyxcbiAgICBPbmVUb09uZTogJ09uZVRvT25lJyxcbiAgICBNYW55VG9NYW55OiAnTWFueVRvTWFueSdcbn07XG5cbmV4cG9ydHMuUmVsYXRpb25zaGlwVHlwZSA9IFJlbGF0aW9uc2hpcFR5cGU7IiwiLyoqXG4gKiBUaGUgXCJzdG9yZVwiIGlzIHJlc3BvbnNpYmxlIGZvciBtZWRpYXRpbmcgYmV0d2VlbiB0aGUgaW4tbWVtb3J5IGNhY2hlIGFuZCBhbnkgcGVyc2lzdGVudCBzdG9yYWdlLlxuICogTm90ZSB0aGF0IHBlcnNpc3RlbnQgc3RvcmFnZSBoYXMgbm90IGJlZW4gcHJvcGVybHkgaW1wbGVtZW50ZWQgeWV0IGFuZCBzbyB0aGlzIGlzIHByZXR0eSB1c2VsZXNzLlxuICogQWxsIHF1ZXJpZXMgd2lsbCBnbyBzdHJhaWdodCB0byB0aGUgY2FjaGUgaW5zdGVhZC5cbiAqIEBtb2R1bGUgc3RvcmVcbiAqL1xuXG52YXIgd3JhcHBlZENhbGxiYWNrID0gcmVxdWlyZSgnLi9taXNjJykud3JhcHBlZENhbGxiYWNrO1xudmFyIEludGVybmFsU2llc3RhRXJyb3IgPSByZXF1aXJlKCcuL2Vycm9yJykuSW50ZXJuYWxTaWVzdGFFcnJvcjtcbnZhciBsb2cgPSByZXF1aXJlKCcuL29wZXJhdGlvbi9sb2cnKTtcbnZhciBMb2dnZXIgPSBsb2cubG9nZ2VyV2l0aE5hbWUoJ1N0b3JlJyk7XG5Mb2dnZXIuc2V0TGV2ZWwobG9nLkxldmVsLndhcm4pO1xuXG52YXIgdXRpbCA9IHJlcXVpcmUoJy4vdXRpbCcpO1xudmFyIF8gPSB1dGlsLl87XG52YXIgY2FjaGUgPSByZXF1aXJlKCcuL2NhY2hlJyk7XG5cblxuLyoqXG4gKiBbZ2V0IGRlc2NyaXB0aW9uXVxuICogQHBhcmFtICB7T2JqZWN0fSAgIG9wdHNcbiAqIEBwYXJhbSAge0Z1bmN0aW9ufSBjYWxsYmFja1xuICogQHJldHVybiB7UHJvbWlzZX1cbiAqIEBleGFtcGxlXG4gKiBgYGBqc1xuICogdmFyIHh5eiA9ICdhZnNkZic7XG4gKiBgYGBcbiAqIEBleGFtcGxlXG4gKiBgYGBqc1xuICogdmFyIGFiYyA9ICdhc2RzZCc7XG4gKiBgYGBcbiAqL1xuZnVuY3Rpb24gZ2V0KG9wdHMsIGNhbGxiYWNrKSB7XG4gICAgdmFyIGRlZmVycmVkID0gd2luZG93LnEgPyB3aW5kb3cucS5kZWZlcigpIDogbnVsbDtcbiAgICBjYWxsYmFjayA9IHV0aWwuY29uc3RydWN0Q2FsbGJhY2tBbmRQcm9taXNlSGFuZGxlcihjYWxsYmFjaywgZGVmZXJyZWQpO1xuICAgIGlmIChMb2dnZXIuZGVidWcuaXNFbmFibGVkKVxuICAgICAgICBMb2dnZXIuZGVidWcoJ2dldCcsIG9wdHMpO1xuICAgIHZhciBzaWVzdGFNb2RlbDtcbiAgICBpZiAob3B0cy5faWQpIHtcbiAgICAgICAgaWYgKHV0aWwuaXNBcnJheShvcHRzLl9pZCkpIHtcbiAgICAgICAgICAgIC8vIFByb3h5IG9udG8gZ2V0TXVsdGlwbGUgaW5zdGVhZC5cbiAgICAgICAgICAgIGdldE11bHRpcGxlKF8ubWFwKG9wdHMuX2lkLCBmdW5jdGlvbihpZCkge1xuICAgICAgICAgICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICAgICAgICAgIF9pZDogaWRcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9KSwgY2FsbGJhY2spO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgc2llc3RhTW9kZWwgPSBjYWNoZS5nZXQob3B0cyk7XG4gICAgICAgICAgICBpZiAoc2llc3RhTW9kZWwpIHtcbiAgICAgICAgICAgICAgICBpZiAoTG9nZ2VyLmRlYnVnLmlzRW5hYmxlZClcbiAgICAgICAgICAgICAgICAgICAgTG9nZ2VyLmRlYnVnKCdIYWQgY2FjaGVkIG9iamVjdCcsIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIG9wdHM6IG9wdHMsXG4gICAgICAgICAgICAgICAgICAgICAgICBvYmo6IHNpZXN0YU1vZGVsXG4gICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgIHdyYXBwZWRDYWxsYmFjayhjYWxsYmFjaykobnVsbCwgc2llc3RhTW9kZWwpO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICBpZiAodXRpbC5pc0FycmF5KG9wdHMuX2lkKSkge1xuICAgICAgICAgICAgICAgICAgICAvLyBQcm94eSBvbnRvIGdldE11bHRpcGxlIGluc3RlYWQuXG4gICAgICAgICAgICAgICAgICAgIGdldE11bHRpcGxlKF8ubWFwKG9wdHMuX2lkLCBmdW5jdGlvbihpZCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBfaWQ6IGlkXG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIH0pLCBjYWxsYmFjayk7XG4gICAgICAgICAgICAgICAgfSBlbHNlIGlmIChjYWxsYmFjaykge1xuICAgICAgICAgICAgICAgICAgICB2YXIgc3RvcmFnZSA9IHNpZXN0YS5leHQuc3RvcmFnZTtcbiAgICAgICAgICAgICAgICAgICAgaWYgKHN0b3JhZ2UpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHN0b3JhZ2Uuc3RvcmUuZ2V0RnJvbVBvdWNoKG9wdHMsIGNhbGxiYWNrKTtcbiAgICAgICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHRocm93ICdTdG9yYWdlIG1vZHVsZSBub3QgaW5zdGFsbGVkJ1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfSBlbHNlIGlmIChvcHRzLm1hcHBpbmcpIHtcbiAgICAgICAgaWYgKHV0aWwuaXNBcnJheShvcHRzW29wdHMubWFwcGluZy5pZF0pKSB7XG4gICAgICAgICAgICAvLyBQcm94eSBvbnRvIGdldE11bHRpcGxlIGluc3RlYWQuXG4gICAgICAgICAgICBnZXRNdWx0aXBsZShfLm1hcChvcHRzW29wdHMubWFwcGluZy5pZF0sIGZ1bmN0aW9uKGlkKSB7XG4gICAgICAgICAgICAgICAgdmFyIG8gPSB7fTtcbiAgICAgICAgICAgICAgICBvW29wdHMubWFwcGluZy5pZF0gPSBpZDtcbiAgICAgICAgICAgICAgICBvLm1hcHBpbmcgPSBvcHRzLm1hcHBpbmc7XG4gICAgICAgICAgICAgICAgcmV0dXJuIG9cbiAgICAgICAgICAgIH0pLCBjYWxsYmFjayk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBzaWVzdGFNb2RlbCA9IGNhY2hlLmdldChvcHRzKTtcbiAgICAgICAgICAgIGlmIChzaWVzdGFNb2RlbCkge1xuICAgICAgICAgICAgICAgIGlmIChMb2dnZXIuZGVidWcuaXNFbmFibGVkKVxuICAgICAgICAgICAgICAgICAgICBMb2dnZXIuZGVidWcoJ0hhZCBjYWNoZWQgb2JqZWN0Jywge1xuICAgICAgICAgICAgICAgICAgICAgICAgb3B0czogb3B0cyxcbiAgICAgICAgICAgICAgICAgICAgICAgIG9iajogc2llc3RhTW9kZWxcbiAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgd3JhcHBlZENhbGxiYWNrKGNhbGxiYWNrKShudWxsLCBzaWVzdGFNb2RlbCk7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIHZhciBtYXBwaW5nID0gb3B0cy5tYXBwaW5nO1xuICAgICAgICAgICAgICAgIGlmIChtYXBwaW5nLnNpbmdsZXRvbikge1xuICAgICAgICAgICAgICAgICAgICBtYXBwaW5nLmdldChjYWxsYmFjayk7XG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgdmFyIGlkRmllbGQgPSBtYXBwaW5nLmlkO1xuICAgICAgICAgICAgICAgICAgICB2YXIgaWQgPSBvcHRzW2lkRmllbGRdO1xuICAgICAgICAgICAgICAgICAgICBpZiAoaWQpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIG1hcHBpbmcuZ2V0KGlkLCBmdW5jdGlvbihlcnIsIG9iaikge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmICghZXJyKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmIChvYmopIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNhbGxiYWNrKG51bGwsIG9iaik7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjYWxsYmFjayhudWxsLCBudWxsKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNhbGxiYWNrKGVycik7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgICAgICB3cmFwcGVkQ2FsbGJhY2soY2FsbGJhY2spKG5ldyBJbnRlcm5hbFNpZXN0YUVycm9yKCdJbnZhbGlkIG9wdGlvbnMgZ2l2ZW4gdG8gc3RvcmUuIE1pc3NpbmcgXCInICsgaWRGaWVsZC50b1N0cmluZygpICsgJy5cIicsIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBvcHRzOiBvcHRzXG4gICAgICAgICAgICAgICAgICAgICAgICB9KSk7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH0gZWxzZSB7XG4gICAgICAgIC8vIE5vIHdheSBpbiB3aGljaCB0byBmaW5kIGFuIG9iamVjdCBsb2NhbGx5LlxuICAgICAgICB2YXIgY29udGV4dCA9IHtcbiAgICAgICAgICAgIG9wdHM6IG9wdHNcbiAgICAgICAgfTtcbiAgICAgICAgdmFyIG1zZyA9ICdJbnZhbGlkIG9wdGlvbnMgZ2l2ZW4gdG8gc3RvcmUnO1xuICAgICAgICBMb2dnZXIuZXJyb3IobXNnLCBjb250ZXh0KTtcbiAgICAgICAgd3JhcHBlZENhbGxiYWNrKGNhbGxiYWNrKShuZXcgSW50ZXJuYWxTaWVzdGFFcnJvcihtc2csIGNvbnRleHQpKTtcbiAgICB9XG4gICAgcmV0dXJuIGRlZmVycmVkID8gZGVmZXJyZWQucHJvbWlzZSA6IG51bGw7XG59XG5cbmZ1bmN0aW9uIGdldE11bHRpcGxlKG9wdHNBcnJheSwgY2FsbGJhY2spIHtcbiAgICB2YXIgZGVmZXJyZWQgPSB3aW5kb3cucSA/IHdpbmRvdy5xLmRlZmVyKCkgOiBudWxsO1xuICAgIGNhbGxiYWNrID0gdXRpbC5jb25zdHJ1Y3RDYWxsYmFja0FuZFByb21pc2VIYW5kbGVyKGNhbGxiYWNrLCBkZWZlcnJlZCk7XG4gICAgdmFyIGRvY3MgPSBbXTtcbiAgICB2YXIgZXJyb3JzID0gW107XG4gICAgXy5lYWNoKG9wdHNBcnJheSwgZnVuY3Rpb24ob3B0cykge1xuICAgICAgICBnZXQob3B0cywgZnVuY3Rpb24oZXJyLCBkb2MpIHtcbiAgICAgICAgICAgIGlmIChlcnIpIHtcbiAgICAgICAgICAgICAgICBlcnJvcnMucHVzaChlcnIpO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICBkb2NzLnB1c2goZG9jKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGlmIChkb2NzLmxlbmd0aCArIGVycm9ycy5sZW5ndGggPT0gb3B0c0FycmF5Lmxlbmd0aCkge1xuICAgICAgICAgICAgICAgIGlmIChjYWxsYmFjaykge1xuICAgICAgICAgICAgICAgICAgICBpZiAoZXJyb3JzLmxlbmd0aCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgY2FsbGJhY2soZXJyb3JzKTtcbiAgICAgICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGNhbGxiYWNrKG51bGwsIGRvY3MpO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICB9KTtcbiAgICB9KTtcbiAgICByZXR1cm4gZGVmZXJyZWQgPyBkZWZlcnJlZC5wcm9taXNlIDogbnVsbDtcbn1cbi8qKlxuICogVXNlcyBwb3VjaCBidWxrIGZldGNoIEFQSS4gTXVjaCBmYXN0ZXIgdGhhbiBnZXRNdWx0aXBsZS5cbiAqIEBwYXJhbSBsb2NhbElkZW50aWZpZXJzXG4gKiBAcGFyYW0gY2FsbGJhY2tcbiAqL1xuZnVuY3Rpb24gZ2V0TXVsdGlwbGVMb2NhbChsb2NhbElkZW50aWZpZXJzLCBjYWxsYmFjaykge1xuICAgIHZhciBkZWZlcnJlZCA9IHdpbmRvdy5xID8gd2luZG93LnEuZGVmZXIoKSA6IG51bGw7XG4gICAgY2FsbGJhY2sgPSB1dGlsLmNvbnN0cnVjdENhbGxiYWNrQW5kUHJvbWlzZUhhbmRsZXIoY2FsbGJhY2ssIGRlZmVycmVkKTtcbiAgICB2YXIgcmVzdWx0cyA9IF8ucmVkdWNlKGxvY2FsSWRlbnRpZmllcnMsIGZ1bmN0aW9uKG1lbW8sIF9pZCkge1xuICAgICAgICB2YXIgb2JqID0gY2FjaGUuZ2V0KHtcbiAgICAgICAgICAgIF9pZDogX2lkXG4gICAgICAgIH0pO1xuICAgICAgICBpZiAob2JqKSB7XG4gICAgICAgICAgICBtZW1vLmNhY2hlZFtfaWRdID0gb2JqO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgbWVtby5ub3RDYWNoZWQucHVzaChfaWQpO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBtZW1vO1xuICAgIH0sIHtcbiAgICAgICAgY2FjaGVkOiB7fSxcbiAgICAgICAgbm90Q2FjaGVkOiBbXVxuICAgIH0pO1xuXG4gICAgZnVuY3Rpb24gZmluaXNoKGVycikge1xuICAgICAgICBpZiAoY2FsbGJhY2spIHtcbiAgICAgICAgICAgIGlmIChlcnIpIHtcbiAgICAgICAgICAgICAgICBjYWxsYmFjayhlcnIpO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICBjYWxsYmFjayhudWxsLCBfLm1hcChsb2NhbElkZW50aWZpZXJzLCBmdW5jdGlvbihfaWQpIHtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHJlc3VsdHMuY2FjaGVkW19pZF07XG4gICAgICAgICAgICAgICAgfSkpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfVxuICAgIGlmIChzaWVzdGEuZXh0LnN0b3JhZ2VFbmFibGVkICYmIHJlc3VsdHMubm90Q2FjaGVkLmxlbmd0aCkge1xuICAgICAgICBzaWVzdGEuZXh0LnN0b3JhZ2Uuc3RvcmUuZ2V0TXVsdGlwbGVMb2NhbEZyb21Db3VjaChyZXN1bHRzLCBmaW5pc2gpO1xuICAgIH0gZWxzZSB7XG4gICAgICAgIGZpbmlzaCgpO1xuICAgIH1cbiAgICByZXR1cm4gZGVmZXJyZWQgPyBkZWZlcnJlZC5wcm9taXNlIDogbnVsbDtcbn1cblxuZnVuY3Rpb24gZ2V0TXVsdGlwbGVSZW1vdGUocmVtb3RlSWRlbnRpZmllcnMsIG1hcHBpbmcsIGNhbGxiYWNrKSB7XG4gICAgdmFyIGRlZmVycmVkID0gd2luZG93LnEgPyB3aW5kb3cucS5kZWZlcigpIDogbnVsbDtcbiAgICBjYWxsYmFjayA9IHV0aWwuY29uc3RydWN0Q2FsbGJhY2tBbmRQcm9taXNlSGFuZGxlcihjYWxsYmFjaywgZGVmZXJyZWQpO1xuICAgIHZhciByZXN1bHRzID0gXy5yZWR1Y2UocmVtb3RlSWRlbnRpZmllcnMsIGZ1bmN0aW9uKG1lbW8sIGlkKSB7XG4gICAgICAgIHZhciBjYWNoZVF1ZXJ5ID0ge1xuICAgICAgICAgICAgbWFwcGluZzogbWFwcGluZ1xuICAgICAgICB9O1xuICAgICAgICBjYWNoZVF1ZXJ5W21hcHBpbmcuaWRdID0gaWQ7XG4gICAgICAgIHZhciBvYmogPSBjYWNoZS5nZXQoY2FjaGVRdWVyeSk7XG4gICAgICAgIGlmIChvYmopIHtcbiAgICAgICAgICAgIG1lbW8uY2FjaGVkW2lkXSA9IG9iajtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIG1lbW8ubm90Q2FjaGVkLnB1c2goaWQpO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBtZW1vO1xuICAgIH0sIHtcbiAgICAgICAgY2FjaGVkOiB7fSxcbiAgICAgICAgbm90Q2FjaGVkOiBbXVxuICAgIH0pO1xuXG4gICAgZnVuY3Rpb24gZmluaXNoKGVycikge1xuICAgICAgICBpZiAoY2FsbGJhY2spIHtcbiAgICAgICAgICAgIGlmIChlcnIpIHtcbiAgICAgICAgICAgICAgICBjYWxsYmFjayhlcnIpO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICBjYWxsYmFjayhudWxsLCBfLm1hcChyZW1vdGVJZGVudGlmaWVycywgZnVuY3Rpb24oaWQpIHtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHJlc3VsdHMuY2FjaGVkW2lkXTtcbiAgICAgICAgICAgICAgICB9KSk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBpZiAoc2llc3RhLmV4dC5zdG9yYWdlRW5hYmxlZCAmJiByZXN1bHRzLm5vdENhY2hlZC5sZW5ndGgpIHtcbiAgICAgICAgc2llc3RhLmV4dC5zdG9yYWdlLnN0b3JlLmdldE11bHRpcGxlUmVtb3RlRnJvbXBvdWNoKG1hcHBpbmcsIHJlbW90ZUlkZW50aWZpZXJzLCByZXN1bHRzLCBmaW5pc2gpO1xuICAgIH0gZWxzZSB7XG4gICAgICAgIGZpbmlzaCgpO1xuICAgIH1cbiAgICByZXR1cm4gZGVmZXJyZWQgPyBkZWZlcnJlZC5wcm9taXNlIDogbnVsbDtcbn1cblxuZXhwb3J0cy5nZXQgPSBnZXQ7XG5leHBvcnRzLmdldE11bHRpcGxlID0gZ2V0TXVsdGlwbGU7XG5leHBvcnRzLmdldE11bHRpcGxlTG9jYWwgPSBnZXRNdWx0aXBsZUxvY2FsO1xuZXhwb3J0cy5nZXRNdWx0aXBsZVJlbW90ZSA9IGdldE11bHRpcGxlUmVtb3RlOyIsIi8qXG4gKiBUaGlzIGlzIGEgY29sbGVjdGlvbiBvZiB1dGlsaXRpZXMgdGFrZW4gZnJvbSBsaWJyYXJpZXMgc3VjaCBhcyBhc3luYy5qcywgdW5kZXJzY29yZS5qcyBldGMuXG4gKiBAbW9kdWxlIHV0aWxcbiAqL1xuXG5mdW5jdGlvbiBwcmludFN0YWNrVHJhY2UoKSB7XG4gICAgdmFyIGUgPSBuZXcgRXJyb3IoJ3ByaW50U3RhY2tUcmFjZScpO1xuICAgIHZhciBzdGFjayA9IGUuc3RhY2s7XG4gICAgY29uc29sZS5sb2coc3RhY2spO1xufVxuXG5mdW5jdGlvbiBjYXBpdGFsaXNlRmlyc3RMZXR0ZXIoc3RyaW5nKSB7XG4gICAgcmV0dXJuIHN0cmluZy5jaGFyQXQoMCkudG9VcHBlckNhc2UoKSArIHN0cmluZy5zbGljZSgxKTtcbn1cblxuZXhwb3J0cy5wcmludFN0YWNrVHJhY2UgPSBwcmludFN0YWNrVHJhY2U7XG5leHBvcnRzLmNhcGl0YWxpc2VGaXJzdExldHRlciA9IGNhcGl0YWxpc2VGaXJzdExldHRlcjtcblxudmFyIHJvb3QgPSB7fTtcbi8vIFNUQVJUIGFzeW5jLmpzIC8vXG5cbnZhciBpc0FycmF5ID0gQXJyYXkuaXNBcnJheSB8fCBmdW5jdGlvbihvYmopIHtcbiAgICByZXR1cm4gX3RvU3RyaW5nLmNhbGwob2JqKSA9PT0gJ1tvYmplY3QgQXJyYXldJztcbn07XG5cbmZ1bmN0aW9uIGRvUGFyYWxsZWwoZm4pIHtcbiAgICByZXR1cm4gZnVuY3Rpb24oKSB7XG4gICAgICAgIHZhciBhcmdzID0gQXJyYXkucHJvdG90eXBlLnNsaWNlLmNhbGwoYXJndW1lbnRzKTtcbiAgICAgICAgcmV0dXJuIGZuLmFwcGx5KG51bGwsIFtlYWNoXS5jb25jYXQoYXJncykpO1xuICAgIH07XG59XG5cbnZhciBtYXAgPSBkb1BhcmFsbGVsKF9hc3luY01hcCk7XG5cbmZ1bmN0aW9uIF9tYXAoYXJyLCBpdGVyYXRvcikge1xuICAgIGlmIChhcnIubWFwKSB7XG4gICAgICAgIHJldHVybiBhcnIubWFwKGl0ZXJhdG9yKTtcbiAgICB9XG4gICAgdmFyIHJlc3VsdHMgPSBbXTtcbiAgICBlYWNoKGFyciwgZnVuY3Rpb24oeCwgaSwgYSkge1xuICAgICAgICByZXN1bHRzLnB1c2goaXRlcmF0b3IoeCwgaSwgYSkpO1xuICAgIH0pO1xuICAgIHJldHVybiByZXN1bHRzO1xufVxuXG5mdW5jdGlvbiBfYXN5bmNNYXAoZWFjaGZuLCBhcnIsIGl0ZXJhdG9yLCBjYWxsYmFjaykge1xuICAgIGFyciA9IF9tYXAoYXJyLCBmdW5jdGlvbih4LCBpKSB7XG4gICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICBpbmRleDogaSxcbiAgICAgICAgICAgIHZhbHVlOiB4XG4gICAgICAgIH07XG4gICAgfSk7XG4gICAgaWYgKCFjYWxsYmFjaykge1xuICAgICAgICBlYWNoZm4oYXJyLCBmdW5jdGlvbih4LCBjYWxsYmFjaykge1xuICAgICAgICAgICAgaXRlcmF0b3IoeC52YWx1ZSwgZnVuY3Rpb24oZXJyKSB7XG4gICAgICAgICAgICAgICAgY2FsbGJhY2soZXJyKTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9KTtcbiAgICB9IGVsc2Uge1xuICAgICAgICB2YXIgcmVzdWx0cyA9IFtdO1xuICAgICAgICBlYWNoZm4oYXJyLCBmdW5jdGlvbih4LCBjYWxsYmFjaykge1xuICAgICAgICAgICAgaXRlcmF0b3IoeC52YWx1ZSwgZnVuY3Rpb24oZXJyLCB2KSB7XG4gICAgICAgICAgICAgICAgcmVzdWx0c1t4LmluZGV4XSA9IHY7XG4gICAgICAgICAgICAgICAgY2FsbGJhY2soZXJyKTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9LCBmdW5jdGlvbihlcnIpIHtcbiAgICAgICAgICAgIGNhbGxiYWNrKGVyciwgcmVzdWx0cyk7XG4gICAgICAgIH0pO1xuICAgIH1cbn1cblxudmFyIG1hcFNlcmllcyA9IGRvU2VyaWVzKF9hc3luY01hcCk7XG5cbmZ1bmN0aW9uIGRvU2VyaWVzKGZuKSB7XG4gICAgcmV0dXJuIGZ1bmN0aW9uKCkge1xuICAgICAgICB2YXIgYXJncyA9IEFycmF5LnByb3RvdHlwZS5zbGljZS5jYWxsKGFyZ3VtZW50cyk7XG4gICAgICAgIHJldHVybiBmbi5hcHBseShudWxsLCBbZWFjaFNlcmllc10uY29uY2F0KGFyZ3MpKTtcbiAgICB9O1xufVxuXG5cblxuZnVuY3Rpb24gZWFjaFNlcmllcyhhcnIsIGl0ZXJhdG9yLCBjYWxsYmFjaykge1xuICAgIGNhbGxiYWNrID0gY2FsbGJhY2sgfHwgZnVuY3Rpb24oKSB7fTtcbiAgICBpZiAoIWFyci5sZW5ndGgpIHtcbiAgICAgICAgcmV0dXJuIGNhbGxiYWNrKCk7XG4gICAgfVxuICAgIHZhciBjb21wbGV0ZWQgPSAwO1xuICAgIHZhciBpdGVyYXRlID0gZnVuY3Rpb24oKSB7XG4gICAgICAgIGl0ZXJhdG9yKGFycltjb21wbGV0ZWRdLCBmdW5jdGlvbihlcnIpIHtcbiAgICAgICAgICAgIGlmIChlcnIpIHtcbiAgICAgICAgICAgICAgICBjYWxsYmFjayhlcnIpO1xuICAgICAgICAgICAgICAgIGNhbGxiYWNrID0gZnVuY3Rpb24oKSB7fTtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgY29tcGxldGVkICs9IDE7XG4gICAgICAgICAgICAgICAgaWYgKGNvbXBsZXRlZCA+PSBhcnIubGVuZ3RoKSB7XG4gICAgICAgICAgICAgICAgICAgIGNhbGxiYWNrKCk7XG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgaXRlcmF0ZSgpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgfSk7XG4gICAgfTtcbiAgICBpdGVyYXRlKCk7XG59XG5cblxuXG5cbmZ1bmN0aW9uIF9lYWNoKGFyciwgaXRlcmF0b3IpIHtcbiAgICBpZiAoYXJyLmZvckVhY2gpIHtcbiAgICAgICAgcmV0dXJuIGFyci5mb3JFYWNoKGl0ZXJhdG9yKTtcbiAgICB9XG4gICAgZm9yICh2YXIgaSA9IDA7IGkgPCBhcnIubGVuZ3RoOyBpICs9IDEpIHtcbiAgICAgICAgaXRlcmF0b3IoYXJyW2ldLCBpLCBhcnIpO1xuICAgIH1cbn1cblxuZnVuY3Rpb24gZWFjaChhcnIsIGl0ZXJhdG9yLCBjYWxsYmFjaykge1xuICAgIGNhbGxiYWNrID0gY2FsbGJhY2sgfHwgZnVuY3Rpb24oKSB7fTtcbiAgICBpZiAoIWFyci5sZW5ndGgpIHtcbiAgICAgICAgcmV0dXJuIGNhbGxiYWNrKCk7XG4gICAgfVxuICAgIHZhciBjb21wbGV0ZWQgPSAwO1xuICAgIF9lYWNoKGFyciwgZnVuY3Rpb24oeCkge1xuICAgICAgICBpdGVyYXRvcih4LCBvbmx5X29uY2UoZG9uZSkpO1xuICAgIH0pO1xuXG4gICAgZnVuY3Rpb24gZG9uZShlcnIpIHtcbiAgICAgICAgaWYgKGVycikge1xuICAgICAgICAgICAgY2FsbGJhY2soZXJyKTtcbiAgICAgICAgICAgIGNhbGxiYWNrID0gZnVuY3Rpb24oKSB7fTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIGNvbXBsZXRlZCArPSAxO1xuICAgICAgICAgICAgaWYgKGNvbXBsZXRlZCA+PSBhcnIubGVuZ3RoKSB7XG4gICAgICAgICAgICAgICAgY2FsbGJhY2soKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH1cbn1cblxuZnVuY3Rpb24ga2V5cyhvYmopIHtcbiAgICBpZiAoT2JqZWN0LmtleXMpIHtcbiAgICAgICAgcmV0dXJuIE9iamVjdC5rZXlzKG9iaik7XG4gICAgfVxuICAgIHZhciBrZXlzID0gW107XG4gICAgZm9yICh2YXIgayBpbiBvYmopIHtcbiAgICAgICAgaWYgKG9iai5oYXNPd25Qcm9wZXJ0eShrKSkge1xuICAgICAgICAgICAga2V5cy5wdXNoKGspO1xuICAgICAgICB9XG4gICAgfVxuICAgIHJldHVybiBrZXlzO1xufVxuXG5cbnZhciBfcGFyYWxsZWwgPSBmdW5jdGlvbihlYWNoZm4sIHRhc2tzLCBjYWxsYmFjaykge1xuICAgIGNhbGxiYWNrID0gY2FsbGJhY2sgfHwgZnVuY3Rpb24oKSB7fTtcbiAgICBpZiAoaXNBcnJheSh0YXNrcykpIHtcbiAgICAgICAgZWFjaGZuLm1hcCh0YXNrcywgZnVuY3Rpb24oZm4sIGNhbGxiYWNrKSB7XG4gICAgICAgICAgICBpZiAoZm4pIHtcbiAgICAgICAgICAgICAgICBmbihmdW5jdGlvbihlcnIpIHtcbiAgICAgICAgICAgICAgICAgICAgdmFyIGFyZ3MgPSBBcnJheS5wcm90b3R5cGUuc2xpY2UuY2FsbChhcmd1bWVudHMsIDEpO1xuICAgICAgICAgICAgICAgICAgICBpZiAoYXJncy5sZW5ndGggPD0gMSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgYXJncyA9IGFyZ3NbMF07XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgY2FsbGJhY2suY2FsbChudWxsLCBlcnIsIGFyZ3MpO1xuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgfVxuICAgICAgICB9LCBjYWxsYmFjayk7XG4gICAgfSBlbHNlIHtcbiAgICAgICAgdmFyIHJlc3VsdHMgPSB7fTtcbiAgICAgICAgZWFjaGZuLmVhY2goa2V5cyh0YXNrcyksIGZ1bmN0aW9uKGssIGNhbGxiYWNrKSB7XG4gICAgICAgICAgICB0YXNrc1trXShmdW5jdGlvbihlcnIpIHtcbiAgICAgICAgICAgICAgICB2YXIgYXJncyA9IEFycmF5LnByb3RvdHlwZS5zbGljZS5jYWxsKGFyZ3VtZW50cywgMSk7XG4gICAgICAgICAgICAgICAgaWYgKGFyZ3MubGVuZ3RoIDw9IDEpIHtcbiAgICAgICAgICAgICAgICAgICAgYXJncyA9IGFyZ3NbMF07XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIHJlc3VsdHNba10gPSBhcmdzO1xuICAgICAgICAgICAgICAgIGNhbGxiYWNrKGVycik7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfSwgZnVuY3Rpb24oZXJyKSB7XG4gICAgICAgICAgICBjYWxsYmFjayhlcnIsIHJlc3VsdHMpO1xuICAgICAgICB9KTtcbiAgICB9XG59O1xuXG5mdW5jdGlvbiBzZXJpZXModGFza3MsIGNhbGxiYWNrKSB7XG4gICAgY2FsbGJhY2sgPSBjYWxsYmFjayB8fCBmdW5jdGlvbigpIHt9O1xuICAgIGlmIChfaXNBcnJheSh0YXNrcykpIHtcbiAgICAgICAgbWFwU2VyaWVzKHRhc2tzLCBmdW5jdGlvbihmbiwgY2FsbGJhY2spIHtcbiAgICAgICAgICAgIGlmIChmbikge1xuICAgICAgICAgICAgICAgIGZuKGZ1bmN0aW9uKGVycikge1xuICAgICAgICAgICAgICAgICAgICB2YXIgYXJncyA9IEFycmF5LnByb3RvdHlwZS5zbGljZS5jYWxsKGFyZ3VtZW50cywgMSk7XG4gICAgICAgICAgICAgICAgICAgIGlmIChhcmdzLmxlbmd0aCA8PSAxKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBhcmdzID0gYXJnc1swXTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICBjYWxsYmFjay5jYWxsKG51bGwsIGVyciwgYXJncyk7XG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0sIGNhbGxiYWNrKTtcbiAgICB9IGVsc2Uge1xuICAgICAgICB2YXIgcmVzdWx0cyA9IHt9O1xuICAgICAgICBlYWNoU2VyaWVzKF9rZXlzKHRhc2tzKSwgZnVuY3Rpb24oaywgY2FsbGJhY2spIHtcbiAgICAgICAgICAgIHRhc2tzW2tdKGZ1bmN0aW9uKGVycikge1xuICAgICAgICAgICAgICAgIHZhciBhcmdzID0gQXJyYXkucHJvdG90eXBlLnNsaWNlLmNhbGwoYXJndW1lbnRzLCAxKTtcbiAgICAgICAgICAgICAgICBpZiAoYXJncy5sZW5ndGggPD0gMSkge1xuICAgICAgICAgICAgICAgICAgICBhcmdzID0gYXJnc1swXTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgcmVzdWx0c1trXSA9IGFyZ3M7XG4gICAgICAgICAgICAgICAgY2FsbGJhY2soZXJyKTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9LCBmdW5jdGlvbihlcnIpIHtcbiAgICAgICAgICAgIGNhbGxiYWNrKGVyciwgcmVzdWx0cyk7XG4gICAgICAgIH0pO1xuICAgIH1cbn1cblxuZnVuY3Rpb24gb25seV9vbmNlKGZuKSB7XG4gICAgdmFyIGNhbGxlZCA9IGZhbHNlO1xuICAgIHJldHVybiBmdW5jdGlvbigpIHtcbiAgICAgICAgaWYgKGNhbGxlZCkgdGhyb3cgbmV3IEVycm9yKFwiQ2FsbGJhY2sgd2FzIGFscmVhZHkgY2FsbGVkLlwiKTtcbiAgICAgICAgY2FsbGVkID0gdHJ1ZTtcbiAgICAgICAgZm4uYXBwbHkocm9vdCwgYXJndW1lbnRzKTtcbiAgICB9XG59XG5cbmZ1bmN0aW9uIHBhcmFsbGVsKHRhc2tzLCBjYWxsYmFjaykge1xuICAgIF9wYXJhbGxlbCh7XG4gICAgICAgIG1hcDogbWFwLFxuICAgICAgICBlYWNoOiBlYWNoXG4gICAgfSwgdGFza3MsIGNhbGxiYWNrKTtcbn1cblxuZXhwb3J0cy5zZXJpZXMgPSBzZXJpZXM7XG5leHBvcnRzLnBhcmFsbGVsID0gcGFyYWxsZWw7XG5leHBvcnRzLmlzQXJyYXkgPSBpc0FycmF5O1xuXG4vLyBFTkQgYXN5bmMuanMgLy9cblxuLy8gU1RBUlQgdW5kZXJzY29yZS5qcyAvL1xuXG52YXIgXyA9IHt9O1xudmFyIEFycmF5UHJvdG8gPSBBcnJheS5wcm90b3R5cGU7XG52YXIgRnVuY1Byb3RvID0gRnVuY3Rpb24ucHJvdG90eXBlO1xuXG52YXIgbmF0aXZlRm9yRWFjaCA9IEFycmF5UHJvdG8uZm9yRWFjaDtcbnZhciBuYXRpdmVNYXAgPSBBcnJheVByb3RvLm1hcDtcbnZhciBuYXRpdmVSZWR1Y2UgPSBBcnJheVByb3RvLnJlZHVjZTtcbnZhciBuYXRpdmVCaW5kID0gRnVuY1Byb3RvLmJpbmQ7XG52YXIgc2xpY2UgPSBBcnJheVByb3RvLnNsaWNlO1xudmFyIGJyZWFrZXIgPSB7fTtcblxuXy5rZXlzID0ga2V5cztcblxuXy5lYWNoID0gXy5mb3JFYWNoID0gZnVuY3Rpb24ob2JqLCBpdGVyYXRvciwgY29udGV4dCkge1xuICAgIGlmIChvYmogPT0gbnVsbCkgcmV0dXJuIG9iajtcbiAgICBpZiAobmF0aXZlRm9yRWFjaCAmJiBvYmouZm9yRWFjaCA9PT0gbmF0aXZlRm9yRWFjaCkge1xuICAgICAgICBvYmouZm9yRWFjaChpdGVyYXRvciwgY29udGV4dCk7XG4gICAgfSBlbHNlIGlmIChvYmoubGVuZ3RoID09PSArb2JqLmxlbmd0aCkge1xuICAgICAgICBmb3IgKHZhciBpID0gMCwgbGVuZ3RoID0gb2JqLmxlbmd0aDsgaSA8IGxlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgICBpZiAoaXRlcmF0b3IuY2FsbChjb250ZXh0LCBvYmpbaV0sIGksIG9iaikgPT09IGJyZWFrZXIpIHJldHVybjtcbiAgICAgICAgfVxuICAgIH0gZWxzZSB7XG4gICAgICAgIHZhciBrZXlzID0gXy5rZXlzKG9iaik7XG4gICAgICAgIGZvciAodmFyIGkgPSAwLCBsZW5ndGggPSBrZXlzLmxlbmd0aDsgaSA8IGxlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgICBpZiAoaXRlcmF0b3IuY2FsbChjb250ZXh0LCBvYmpba2V5c1tpXV0sIGtleXNbaV0sIG9iaikgPT09IGJyZWFrZXIpIHJldHVybjtcbiAgICAgICAgfVxuICAgIH1cbiAgICByZXR1cm4gb2JqO1xufTtcblxuLy8gUmV0dXJuIHRoZSByZXN1bHRzIG9mIGFwcGx5aW5nIHRoZSBpdGVyYXRvciB0byBlYWNoIGVsZW1lbnQuXG4vLyBEZWxlZ2F0ZXMgdG8gKipFQ01BU2NyaXB0IDUqKidzIG5hdGl2ZSBgbWFwYCBpZiBhdmFpbGFibGUuXG5fLm1hcCA9IF8uY29sbGVjdCA9IGZ1bmN0aW9uKG9iaiwgaXRlcmF0b3IsIGNvbnRleHQpIHtcbiAgICB2YXIgcmVzdWx0cyA9IFtdO1xuICAgIGlmIChvYmogPT0gbnVsbCkgcmV0dXJuIHJlc3VsdHM7XG4gICAgaWYgKG5hdGl2ZU1hcCAmJiBvYmoubWFwID09PSBuYXRpdmVNYXApIHJldHVybiBvYmoubWFwKGl0ZXJhdG9yLCBjb250ZXh0KTtcbiAgICBfLmVhY2gob2JqLCBmdW5jdGlvbih2YWx1ZSwgaW5kZXgsIGxpc3QpIHtcbiAgICAgICAgcmVzdWx0cy5wdXNoKGl0ZXJhdG9yLmNhbGwoY29udGV4dCwgdmFsdWUsIGluZGV4LCBsaXN0KSk7XG4gICAgfSk7XG4gICAgcmV0dXJuIHJlc3VsdHM7XG59O1xuXG4vLyBQYXJ0aWFsbHkgYXBwbHkgYSBmdW5jdGlvbiBieSBjcmVhdGluZyBhIHZlcnNpb24gdGhhdCBoYXMgaGFkIHNvbWUgb2YgaXRzXG4vLyBhcmd1bWVudHMgcHJlLWZpbGxlZCwgd2l0aG91dCBjaGFuZ2luZyBpdHMgZHluYW1pYyBgdGhpc2AgY29udGV4dC4gXyBhY3RzXG4vLyBhcyBhIHBsYWNlaG9sZGVyLCBhbGxvd2luZyBhbnkgY29tYmluYXRpb24gb2YgYXJndW1lbnRzIHRvIGJlIHByZS1maWxsZWQuXG5fLnBhcnRpYWwgPSBmdW5jdGlvbihmdW5jKSB7XG4gICAgdmFyIGJvdW5kQXJncyA9IHNsaWNlLmNhbGwoYXJndW1lbnRzLCAxKTtcbiAgICByZXR1cm4gZnVuY3Rpb24oKSB7XG4gICAgICAgIHZhciBwb3NpdGlvbiA9IDA7XG4gICAgICAgIHZhciBhcmdzID0gYm91bmRBcmdzLnNsaWNlKCk7XG4gICAgICAgIGZvciAodmFyIGkgPSAwLCBsZW5ndGggPSBhcmdzLmxlbmd0aDsgaSA8IGxlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgICBpZiAoYXJnc1tpXSA9PT0gXykgYXJnc1tpXSA9IGFyZ3VtZW50c1twb3NpdGlvbisrXTtcbiAgICAgICAgfVxuICAgICAgICB3aGlsZSAocG9zaXRpb24gPCBhcmd1bWVudHMubGVuZ3RoKSBhcmdzLnB1c2goYXJndW1lbnRzW3Bvc2l0aW9uKytdKTtcbiAgICAgICAgcmV0dXJuIGZ1bmMuYXBwbHkodGhpcywgYXJncyk7XG4gICAgfTtcbn07XG5cbi8vIENvbnZlbmllbmNlIHZlcnNpb24gb2YgYSBjb21tb24gdXNlIGNhc2Ugb2YgYG1hcGA6IGZldGNoaW5nIGEgcHJvcGVydHkuXG5fLnBsdWNrID0gZnVuY3Rpb24ob2JqLCBrZXkpIHtcbiAgICByZXR1cm4gXy5tYXAob2JqLCBfLnByb3BlcnR5KGtleSkpO1xufTtcblxudmFyIHJlZHVjZUVycm9yID0gJ1JlZHVjZSBvZiBlbXB0eSBhcnJheSB3aXRoIG5vIGluaXRpYWwgdmFsdWUnO1xuXG4vLyAqKlJlZHVjZSoqIGJ1aWxkcyB1cCBhIHNpbmdsZSByZXN1bHQgZnJvbSBhIGxpc3Qgb2YgdmFsdWVzLCBha2EgYGluamVjdGAsXG4vLyBvciBgZm9sZGxgLiBEZWxlZ2F0ZXMgdG8gKipFQ01BU2NyaXB0IDUqKidzIG5hdGl2ZSBgcmVkdWNlYCBpZiBhdmFpbGFibGUuXG5fLnJlZHVjZSA9IF8uZm9sZGwgPSBfLmluamVjdCA9IGZ1bmN0aW9uKG9iaiwgaXRlcmF0b3IsIG1lbW8sIGNvbnRleHQpIHtcbiAgICB2YXIgaW5pdGlhbCA9IGFyZ3VtZW50cy5sZW5ndGggPiAyO1xuICAgIGlmIChvYmogPT0gbnVsbCkgb2JqID0gW107XG4gICAgaWYgKG5hdGl2ZVJlZHVjZSAmJiBvYmoucmVkdWNlID09PSBuYXRpdmVSZWR1Y2UpIHtcbiAgICAgICAgaWYgKGNvbnRleHQpIGl0ZXJhdG9yID0gXy5iaW5kKGl0ZXJhdG9yLCBjb250ZXh0KTtcbiAgICAgICAgcmV0dXJuIGluaXRpYWwgPyBvYmoucmVkdWNlKGl0ZXJhdG9yLCBtZW1vKSA6IG9iai5yZWR1Y2UoaXRlcmF0b3IpO1xuICAgIH1cbiAgICBfLmVhY2gob2JqLCBmdW5jdGlvbih2YWx1ZSwgaW5kZXgsIGxpc3QpIHtcbiAgICAgICAgaWYgKCFpbml0aWFsKSB7XG4gICAgICAgICAgICBtZW1vID0gdmFsdWU7XG4gICAgICAgICAgICBpbml0aWFsID0gdHJ1ZTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIG1lbW8gPSBpdGVyYXRvci5jYWxsKGNvbnRleHQsIG1lbW8sIHZhbHVlLCBpbmRleCwgbGlzdCk7XG4gICAgICAgIH1cbiAgICB9KTtcbiAgICBpZiAoIWluaXRpYWwpIHRocm93IG5ldyBUeXBlRXJyb3IocmVkdWNlRXJyb3IpO1xuICAgIHJldHVybiBtZW1vO1xufTtcblxuXy5wcm9wZXJ0eSA9IGZ1bmN0aW9uKGtleSkge1xuICAgIHJldHVybiBmdW5jdGlvbihvYmopIHtcbiAgICAgICAgcmV0dXJuIG9ialtrZXldO1xuICAgIH07XG59O1xuXG4vLyBPcHRpbWl6ZSBgaXNGdW5jdGlvbmAgaWYgYXBwcm9wcmlhdGUuXG5pZiAodHlwZW9mKC8uLykgIT09ICdmdW5jdGlvbicpIHtcbiAgICBfLmlzRnVuY3Rpb24gPSBmdW5jdGlvbihvYmopIHtcbiAgICAgICAgcmV0dXJuIHR5cGVvZiBvYmogPT09ICdmdW5jdGlvbic7XG4gICAgfTtcbn1cblxuXy5pc09iamVjdCA9IGZ1bmN0aW9uKG9iaikge1xuICAgIHZhciB0eXBlID0gdHlwZW9mIG9iajtcbiAgICByZXR1cm4gdHlwZSA9PT0gJ2Z1bmN0aW9uJyB8fCB0eXBlID09PSAnb2JqZWN0JyAmJiAhIW9iajtcbn07XG5cbi8vIEFuIGludGVybmFsIGZ1bmN0aW9uIHRvIGdlbmVyYXRlIGxvb2t1cCBpdGVyYXRvcnMuXG52YXIgbG9va3VwSXRlcmF0b3IgPSBmdW5jdGlvbih2YWx1ZSkge1xuICAgIGlmICh2YWx1ZSA9PSBudWxsKSByZXR1cm4gXy5pZGVudGl0eTtcbiAgICBpZiAoXy5pc0Z1bmN0aW9uKHZhbHVlKSkgcmV0dXJuIHZhbHVlO1xuICAgIHJldHVybiBfLnByb3BlcnR5KHZhbHVlKTtcbn07XG5cbi8vIFNvcnQgdGhlIG9iamVjdCdzIHZhbHVlcyBieSBhIGNyaXRlcmlvbiBwcm9kdWNlZCBieSBhbiBpdGVyYXRvci5cbl8uc29ydEJ5ID0gZnVuY3Rpb24ob2JqLCBpdGVyYXRvciwgY29udGV4dCkge1xuICAgIGl0ZXJhdG9yID0gbG9va3VwSXRlcmF0b3IoaXRlcmF0b3IpO1xuICAgIHJldHVybiBfLnBsdWNrKF8ubWFwKG9iaiwgZnVuY3Rpb24odmFsdWUsIGluZGV4LCBsaXN0KSB7XG4gICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICB2YWx1ZTogdmFsdWUsXG4gICAgICAgICAgICBpbmRleDogaW5kZXgsXG4gICAgICAgICAgICBjcml0ZXJpYTogaXRlcmF0b3IuY2FsbChjb250ZXh0LCB2YWx1ZSwgaW5kZXgsIGxpc3QpXG4gICAgICAgIH07XG4gICAgfSkuc29ydChmdW5jdGlvbihsZWZ0LCByaWdodCkge1xuICAgICAgICB2YXIgYSA9IGxlZnQuY3JpdGVyaWE7XG4gICAgICAgIHZhciBiID0gcmlnaHQuY3JpdGVyaWE7XG4gICAgICAgIGlmIChhICE9PSBiKSB7XG4gICAgICAgICAgICBpZiAoYSA+IGIgfHwgYSA9PT0gdm9pZCAwKSByZXR1cm4gMTtcbiAgICAgICAgICAgIGlmIChhIDwgYiB8fCBiID09PSB2b2lkIDApIHJldHVybiAtMTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gbGVmdC5pbmRleCAtIHJpZ2h0LmluZGV4O1xuICAgIH0pLCAndmFsdWUnKTtcbn07XG5cbnZhciBjdG9yID0gZnVuY3Rpb24oKSB7fTtcblxuLy8gQ3JlYXRlIGEgZnVuY3Rpb24gYm91bmQgdG8gYSBnaXZlbiBvYmplY3QgKGFzc2lnbmluZyBgdGhpc2AsIGFuZCBhcmd1bWVudHMsXG4vLyBvcHRpb25hbGx5KS4gRGVsZWdhdGVzIHRvICoqRUNNQVNjcmlwdCA1KioncyBuYXRpdmUgYEZ1bmN0aW9uLmJpbmRgIGlmXG4vLyBhdmFpbGFibGUuXG5fLmJpbmQgPSBmdW5jdGlvbihmdW5jLCBjb250ZXh0KSB7XG4gICAgdmFyIGFyZ3MsIGJvdW5kO1xuICAgIGlmIChuYXRpdmVCaW5kICYmIGZ1bmMuYmluZCA9PT0gbmF0aXZlQmluZCkgcmV0dXJuIG5hdGl2ZUJpbmQuYXBwbHkoZnVuYywgc2xpY2UuY2FsbChhcmd1bWVudHMsIDEpKTtcbiAgICBpZiAoIV8uaXNGdW5jdGlvbihmdW5jKSkgdGhyb3cgbmV3IFR5cGVFcnJvcjtcbiAgICBhcmdzID0gc2xpY2UuY2FsbChhcmd1bWVudHMsIDIpO1xuICAgIHJldHVybiBib3VuZCA9IGZ1bmN0aW9uKCkge1xuICAgICAgICBpZiAoISh0aGlzIGluc3RhbmNlb2YgYm91bmQpKSByZXR1cm4gZnVuYy5hcHBseShjb250ZXh0LCBhcmdzLmNvbmNhdChzbGljZS5jYWxsKGFyZ3VtZW50cykpKTtcbiAgICAgICAgY3Rvci5wcm90b3R5cGUgPSBmdW5jLnByb3RvdHlwZTtcbiAgICAgICAgdmFyIHNlbGYgPSBuZXcgY3RvcjtcbiAgICAgICAgY3Rvci5wcm90b3R5cGUgPSBudWxsO1xuICAgICAgICB1XG4gICAgICAgIHZhciByZXN1bHQgPSBmdW5jLmFwcGx5KHNlbGYsIGFyZ3MuY29uY2F0KHNsaWNlLmNhbGwoYXJndW1lbnRzKSkpO1xuICAgICAgICBpZiAoT2JqZWN0KHJlc3VsdCkgPT09IHJlc3VsdCkgcmV0dXJuIHJlc3VsdDtcbiAgICAgICAgcmV0dXJuIHNlbGY7XG4gICAgfTtcbn07XG5cbl8uaWRlbnRpdHkgPSBmdW5jdGlvbih2YWx1ZSkge1xuICAgIHJldHVybiB2YWx1ZTtcbn07XG5cbl8uemlwID0gZnVuY3Rpb24oYXJyYXkpIHtcbiAgICBpZiAoYXJyYXkgPT0gbnVsbCkgcmV0dXJuIFtdO1xuICAgIHZhciBsZW5ndGggPSBfLm1heChhcmd1bWVudHMsICdsZW5ndGgnKS5sZW5ndGg7XG4gICAgdmFyIHJlc3VsdHMgPSBBcnJheShsZW5ndGgpO1xuICAgIGZvciAodmFyIGkgPSAwOyBpIDwgbGVuZ3RoOyBpKyspIHtcbiAgICAgICAgcmVzdWx0c1tpXSA9IF8ucGx1Y2soYXJndW1lbnRzLCBpKTtcbiAgICB9XG4gICAgcmV0dXJuIHJlc3VsdHM7XG59O1xuXG4vLyBSZXR1cm4gdGhlIG1heGltdW0gZWxlbWVudCAob3IgZWxlbWVudC1iYXNlZCBjb21wdXRhdGlvbikuXG5fLm1heCA9IGZ1bmN0aW9uKG9iaiwgaXRlcmF0ZWUsIGNvbnRleHQpIHtcbiAgICB2YXIgcmVzdWx0ID0gLUluZmluaXR5LFxuICAgICAgICBsYXN0Q29tcHV0ZWQgPSAtSW5maW5pdHksXG4gICAgICAgIHZhbHVlLCBjb21wdXRlZDtcbiAgICBpZiAoaXRlcmF0ZWUgPT0gbnVsbCAmJiBvYmogIT0gbnVsbCkge1xuICAgICAgICBvYmogPSBvYmoubGVuZ3RoID09PSArb2JqLmxlbmd0aCA/IG9iaiA6IF8udmFsdWVzKG9iaik7XG4gICAgICAgIGZvciAodmFyIGkgPSAwLCBsZW5ndGggPSBvYmoubGVuZ3RoOyBpIDwgbGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICAgIHZhbHVlID0gb2JqW2ldO1xuICAgICAgICAgICAgaWYgKHZhbHVlID4gcmVzdWx0KSB7XG4gICAgICAgICAgICAgICAgcmVzdWx0ID0gdmFsdWU7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9IGVsc2Uge1xuICAgICAgICBpdGVyYXRlZSA9IF8uaXRlcmF0ZWUoaXRlcmF0ZWUsIGNvbnRleHQpO1xuICAgICAgICBfLmVhY2gob2JqLCBmdW5jdGlvbih2YWx1ZSwgaW5kZXgsIGxpc3QpIHtcbiAgICAgICAgICAgIGNvbXB1dGVkID0gaXRlcmF0ZWUodmFsdWUsIGluZGV4LCBsaXN0KTtcbiAgICAgICAgICAgIGlmIChjb21wdXRlZCA+IGxhc3RDb21wdXRlZCB8fCBjb21wdXRlZCA9PT0gLUluZmluaXR5ICYmIHJlc3VsdCA9PT0gLUluZmluaXR5KSB7XG4gICAgICAgICAgICAgICAgcmVzdWx0ID0gdmFsdWU7XG4gICAgICAgICAgICAgICAgbGFzdENvbXB1dGVkID0gY29tcHV0ZWQ7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0pO1xuICAgIH1cbiAgICByZXR1cm4gcmVzdWx0O1xufTtcblxuXG5fLml0ZXJhdGVlID0gZnVuY3Rpb24odmFsdWUsIGNvbnRleHQsIGFyZ0NvdW50KSB7XG4gICAgaWYgKHZhbHVlID09IG51bGwpIHJldHVybiBfLmlkZW50aXR5O1xuICAgIGlmIChfLmlzRnVuY3Rpb24odmFsdWUpKSByZXR1cm4gY3JlYXRlQ2FsbGJhY2sodmFsdWUsIGNvbnRleHQsIGFyZ0NvdW50KTtcbiAgICBpZiAoXy5pc09iamVjdCh2YWx1ZSkpIHJldHVybiBfLm1hdGNoZXModmFsdWUpO1xuICAgIHJldHVybiBfLnByb3BlcnR5KHZhbHVlKTtcbn07XG5cbl8ucGFpcnMgPSBmdW5jdGlvbihvYmopIHtcbiAgICB2YXIga2V5cyA9IF8ua2V5cyhvYmopO1xuICAgIHZhciBsZW5ndGggPSBrZXlzLmxlbmd0aDtcbiAgICB2YXIgcGFpcnMgPSBBcnJheShsZW5ndGgpO1xuICAgIGZvciAodmFyIGkgPSAwOyBpIDwgbGVuZ3RoOyBpKyspIHtcbiAgICAgICAgcGFpcnNbaV0gPSBba2V5c1tpXSwgb2JqW2tleXNbaV1dXTtcbiAgICB9XG4gICAgcmV0dXJuIHBhaXJzO1xufTtcblxuXy5tYXRjaGVzID0gZnVuY3Rpb24oYXR0cnMpIHtcbiAgICB2YXIgcGFpcnMgPSBfLnBhaXJzKGF0dHJzKSxcbiAgICAgICAgbGVuZ3RoID0gcGFpcnMubGVuZ3RoO1xuICAgIHJldHVybiBmdW5jdGlvbihvYmopIHtcbiAgICAgICAgaWYgKG9iaiA9PSBudWxsKSByZXR1cm4gIWxlbmd0aDtcbiAgICAgICAgb2JqID0gbmV3IE9iamVjdChvYmopO1xuICAgICAgICBmb3IgKHZhciBpID0gMDsgaSA8IGxlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgICB2YXIgcGFpciA9IHBhaXJzW2ldLFxuICAgICAgICAgICAgICAgIGtleSA9IHBhaXJbMF07XG4gICAgICAgICAgICBpZiAocGFpclsxXSAhPT0gb2JqW2tleV0gfHwgIShrZXkgaW4gb2JqKSkgcmV0dXJuIGZhbHNlO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiB0cnVlO1xuICAgIH07XG59O1xuXG5fLnNvbWUgPSBmdW5jdGlvbihvYmosIHByZWRpY2F0ZSwgY29udGV4dCkge1xuICAgIGlmIChvYmogPT0gbnVsbCkgcmV0dXJuIGZhbHNlO1xuICAgIHByZWRpY2F0ZSA9IF8uaXRlcmF0ZWUocHJlZGljYXRlLCBjb250ZXh0KTtcbiAgICB2YXIga2V5cyA9IG9iai5sZW5ndGggIT09ICtvYmoubGVuZ3RoICYmIF8ua2V5cyhvYmopLFxuICAgICAgICBsZW5ndGggPSAoa2V5cyB8fCBvYmopLmxlbmd0aCxcbiAgICAgICAgaW5kZXgsIGN1cnJlbnRLZXk7XG4gICAgZm9yIChpbmRleCA9IDA7IGluZGV4IDwgbGVuZ3RoOyBpbmRleCsrKSB7XG4gICAgICAgIGN1cnJlbnRLZXkgPSBrZXlzID8ga2V5c1tpbmRleF0gOiBpbmRleDtcbiAgICAgICAgaWYgKHByZWRpY2F0ZShvYmpbY3VycmVudEtleV0sIGN1cnJlbnRLZXksIG9iaikpIHJldHVybiB0cnVlO1xuICAgIH1cbiAgICByZXR1cm4gZmFsc2U7XG59O1xuXG4vLyBFTkQgdW5kZXJzY29yZS5qcyAvL1xuXG5leHBvcnRzLl8gPSBfO1xudmFyIG9ic2VydmUgPSByZXF1aXJlKCcuLi92ZW5kb3Ivb2JzZXJ2ZS1qcy9zcmMvb2JzZXJ2ZScpLlBsYXRmb3JtO1xuXG5mdW5jdGlvbiBuZXh0KGNhbGxiYWNrKSB7XG4gICAgb2JzZXJ2ZS5wZXJmb3JtTWljcm90YXNrQ2hlY2twb2ludCgpO1xuICAgIHNldFRpbWVvdXQoY2FsbGJhY2spO1xufVxuXG5cbi8qKlxuICogUGVyZm9ybXMgZGlydHkgY2hlY2svT2JqZWN0Lm9ic2VydmUgY2FsbGJhY2tzIGRlcGVuZGluZyBvbiB0aGUgYnJvd3Nlci5cbiAqXG4gKiBJZiBPYmplY3Qub2JzZXJ2ZSBpcyBwcmVzZW50LFxuICogQHBhcmFtIGNhbGxiYWNrXG4gKi9cbmV4cG9ydHMubmV4dCA9IG5leHQ7XG5cbi8qKlxuICogUmV0dXJucyBhIGhhbmRsZXIgdGhhdCBhY3RzIHVwb24gYSBjYWxsYmFjayBvciBhIHByb21pc2UgZGVwZW5kaW5nIG9uIHRoZSByZXN1bHQgb2YgYSBkaWZmZXJlbnQgY2FsbGJhY2suXG4gKiBAcGFyYW0gY2FsbGJhY2tcbiAqIEBwYXJhbSBbcHJvbWlzZV1cbiAqIEByZXR1cm5zIHtGdW5jdGlvbn1cbiAqL1xuZXhwb3J0cy5jb25zdHJ1Y3RDYWxsYmFja0FuZFByb21pc2VIYW5kbGVyID0gZnVuY3Rpb24oY2FsbGJhY2ssIHByb21pc2UpIHtcbiAgICByZXR1cm4gZnVuY3Rpb24oZXJyKSB7XG4gICAgICAgIGlmIChjYWxsYmFjaykgY2FsbGJhY2suYXBwbHkoY2FsbGJhY2ssIGFyZ3VtZW50cyk7XG4gICAgICAgIGlmIChwcm9taXNlKSB7XG4gICAgICAgICAgICBpZiAoZXJyKSBwcm9taXNlLnJlamVjdChlcnIpO1xuICAgICAgICAgICAgZWxzZSBwcm9taXNlLnJlc29sdmUuYXBwbHkocHJvbWlzZSwgQXJyYXkucHJvdG90eXBlLnNsaWNlLmNhbGwoYXJndW1lbnRzLCAxKSk7XG4gICAgICAgIH1cbiAgICB9O1xufTsiLCIoZnVuY3Rpb24gKGdsb2JhbCl7XG4vKlxuICogQ29weXJpZ2h0IChjKSAyMDE0IFRoZSBQb2x5bWVyIFByb2plY3QgQXV0aG9ycy4gQWxsIHJpZ2h0cyByZXNlcnZlZC5cbiAqIFRoaXMgY29kZSBtYXkgb25seSBiZSB1c2VkIHVuZGVyIHRoZSBCU0Qgc3R5bGUgbGljZW5zZSBmb3VuZCBhdCBodHRwOi8vcG9seW1lci5naXRodWIuaW8vTElDRU5TRS50eHRcbiAqIFRoZSBjb21wbGV0ZSBzZXQgb2YgYXV0aG9ycyBtYXkgYmUgZm91bmQgYXQgaHR0cDovL3BvbHltZXIuZ2l0aHViLmlvL0FVVEhPUlMudHh0XG4gKiBUaGUgY29tcGxldGUgc2V0IG9mIGNvbnRyaWJ1dG9ycyBtYXkgYmUgZm91bmQgYXQgaHR0cDovL3BvbHltZXIuZ2l0aHViLmlvL0NPTlRSSUJVVE9SUy50eHRcbiAqIENvZGUgZGlzdHJpYnV0ZWQgYnkgR29vZ2xlIGFzIHBhcnQgb2YgdGhlIHBvbHltZXIgcHJvamVjdCBpcyBhbHNvXG4gKiBzdWJqZWN0IHRvIGFuIGFkZGl0aW9uYWwgSVAgcmlnaHRzIGdyYW50IGZvdW5kIGF0IGh0dHA6Ly9wb2x5bWVyLmdpdGh1Yi5pby9QQVRFTlRTLnR4dFxuICovXG5cbihmdW5jdGlvbihnbG9iYWwpIHtcbiAgJ3VzZSBzdHJpY3QnO1xuXG4gIHZhciB0ZXN0aW5nRXhwb3NlQ3ljbGVDb3VudCA9IGdsb2JhbC50ZXN0aW5nRXhwb3NlQ3ljbGVDb3VudDtcblxuICAvLyBEZXRlY3QgYW5kIGRvIGJhc2ljIHNhbml0eSBjaGVja2luZyBvbiBPYmplY3QvQXJyYXkub2JzZXJ2ZS5cbiAgZnVuY3Rpb24gZGV0ZWN0T2JqZWN0T2JzZXJ2ZSgpIHtcbiAgICBpZiAodHlwZW9mIE9iamVjdC5vYnNlcnZlICE9PSAnZnVuY3Rpb24nIHx8XG4gICAgICAgIHR5cGVvZiBBcnJheS5vYnNlcnZlICE9PSAnZnVuY3Rpb24nKSB7XG4gICAgICByZXR1cm4gZmFsc2U7XG4gICAgfVxuXG4gICAgdmFyIHJlY29yZHMgPSBbXTtcblxuICAgIGZ1bmN0aW9uIGNhbGxiYWNrKHJlY3MpIHtcbiAgICAgIHJlY29yZHMgPSByZWNzO1xuICAgIH1cblxuICAgIHZhciB0ZXN0ID0ge307XG4gICAgdmFyIGFyciA9IFtdO1xuICAgIE9iamVjdC5vYnNlcnZlKHRlc3QsIGNhbGxiYWNrKTtcbiAgICBBcnJheS5vYnNlcnZlKGFyciwgY2FsbGJhY2spO1xuICAgIHRlc3QuaWQgPSAxO1xuICAgIHRlc3QuaWQgPSAyO1xuICAgIGRlbGV0ZSB0ZXN0LmlkO1xuICAgIGFyci5wdXNoKDEsIDIpO1xuICAgIGFyci5sZW5ndGggPSAwO1xuXG4gICAgT2JqZWN0LmRlbGl2ZXJDaGFuZ2VSZWNvcmRzKGNhbGxiYWNrKTtcbiAgICBpZiAocmVjb3Jkcy5sZW5ndGggIT09IDUpXG4gICAgICByZXR1cm4gZmFsc2U7XG5cbiAgICBpZiAocmVjb3Jkc1swXS50eXBlICE9ICdhZGQnIHx8XG4gICAgICAgIHJlY29yZHNbMV0udHlwZSAhPSAndXBkYXRlJyB8fFxuICAgICAgICByZWNvcmRzWzJdLnR5cGUgIT0gJ2RlbGV0ZScgfHxcbiAgICAgICAgcmVjb3Jkc1szXS50eXBlICE9ICdzcGxpY2UnIHx8XG4gICAgICAgIHJlY29yZHNbNF0udHlwZSAhPSAnc3BsaWNlJykge1xuICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIH1cblxuICAgIE9iamVjdC51bm9ic2VydmUodGVzdCwgY2FsbGJhY2spO1xuICAgIEFycmF5LnVub2JzZXJ2ZShhcnIsIGNhbGxiYWNrKTtcblxuICAgIHJldHVybiB0cnVlO1xuICB9XG5cbiAgdmFyIGhhc09ic2VydmUgPSBkZXRlY3RPYmplY3RPYnNlcnZlKCk7XG5cbiAgZnVuY3Rpb24gZGV0ZWN0RXZhbCgpIHtcbiAgICAvLyBEb24ndCB0ZXN0IGZvciBldmFsIGlmIHdlJ3JlIHJ1bm5pbmcgaW4gYSBDaHJvbWUgQXBwIGVudmlyb25tZW50LlxuICAgIC8vIFdlIGNoZWNrIGZvciBBUElzIHNldCB0aGF0IG9ubHkgZXhpc3QgaW4gYSBDaHJvbWUgQXBwIGNvbnRleHQuXG4gICAgaWYgKHR5cGVvZiBjaHJvbWUgIT09ICd1bmRlZmluZWQnICYmIGNocm9tZS5hcHAgJiYgY2hyb21lLmFwcC5ydW50aW1lKSB7XG4gICAgICByZXR1cm4gZmFsc2U7XG4gICAgfVxuXG4gICAgLy8gRmlyZWZveCBPUyBBcHBzIGRvIG5vdCBhbGxvdyBldmFsLiBUaGlzIGZlYXR1cmUgZGV0ZWN0aW9uIGlzIHZlcnkgaGFja3lcbiAgICAvLyBidXQgZXZlbiBpZiBzb21lIG90aGVyIHBsYXRmb3JtIGFkZHMgc3VwcG9ydCBmb3IgdGhpcyBmdW5jdGlvbiB0aGlzIGNvZGVcbiAgICAvLyB3aWxsIGNvbnRpbnVlIHRvIHdvcmsuXG4gICAgaWYgKG5hdmlnYXRvci5nZXREZXZpY2VTdG9yYWdlKSB7XG4gICAgICByZXR1cm4gZmFsc2U7XG4gICAgfVxuXG4gICAgdHJ5IHtcbiAgICAgIHZhciBmID0gbmV3IEZ1bmN0aW9uKCcnLCAncmV0dXJuIHRydWU7Jyk7XG4gICAgICByZXR1cm4gZigpO1xuICAgIH0gY2F0Y2ggKGV4KSB7XG4gICAgICByZXR1cm4gZmFsc2U7XG4gICAgfVxuICB9XG5cbiAgdmFyIGhhc0V2YWwgPSBkZXRlY3RFdmFsKCk7XG5cbiAgZnVuY3Rpb24gaXNJbmRleChzKSB7XG4gICAgcmV0dXJuICtzID09PSBzID4+PiAwICYmIHMgIT09ICcnO1xuICB9XG5cbiAgZnVuY3Rpb24gdG9OdW1iZXIocykge1xuICAgIHJldHVybiArcztcbiAgfVxuXG4gIGZ1bmN0aW9uIGlzT2JqZWN0KG9iaikge1xuICAgIHJldHVybiBvYmogPT09IE9iamVjdChvYmopO1xuICB9XG5cbiAgdmFyIG51bWJlcklzTmFOID0gZ2xvYmFsLk51bWJlci5pc05hTiB8fCBmdW5jdGlvbih2YWx1ZSkge1xuICAgIHJldHVybiB0eXBlb2YgdmFsdWUgPT09ICdudW1iZXInICYmIGdsb2JhbC5pc05hTih2YWx1ZSk7XG4gIH1cblxuICBmdW5jdGlvbiBhcmVTYW1lVmFsdWUobGVmdCwgcmlnaHQpIHtcbiAgICBpZiAobGVmdCA9PT0gcmlnaHQpXG4gICAgICByZXR1cm4gbGVmdCAhPT0gMCB8fCAxIC8gbGVmdCA9PT0gMSAvIHJpZ2h0O1xuICAgIGlmIChudW1iZXJJc05hTihsZWZ0KSAmJiBudW1iZXJJc05hTihyaWdodCkpXG4gICAgICByZXR1cm4gdHJ1ZTtcblxuICAgIHJldHVybiBsZWZ0ICE9PSBsZWZ0ICYmIHJpZ2h0ICE9PSByaWdodDtcbiAgfVxuXG4gIHZhciBjcmVhdGVPYmplY3QgPSAoJ19fcHJvdG9fXycgaW4ge30pID9cbiAgICBmdW5jdGlvbihvYmopIHsgcmV0dXJuIG9iajsgfSA6XG4gICAgZnVuY3Rpb24ob2JqKSB7XG4gICAgICB2YXIgcHJvdG8gPSBvYmouX19wcm90b19fO1xuICAgICAgaWYgKCFwcm90bylcbiAgICAgICAgcmV0dXJuIG9iajtcbiAgICAgIHZhciBuZXdPYmplY3QgPSBPYmplY3QuY3JlYXRlKHByb3RvKTtcbiAgICAgIE9iamVjdC5nZXRPd25Qcm9wZXJ0eU5hbWVzKG9iaikuZm9yRWFjaChmdW5jdGlvbihuYW1lKSB7XG4gICAgICAgIE9iamVjdC5kZWZpbmVQcm9wZXJ0eShuZXdPYmplY3QsIG5hbWUsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgIE9iamVjdC5nZXRPd25Qcm9wZXJ0eURlc2NyaXB0b3Iob2JqLCBuYW1lKSk7XG4gICAgICB9KTtcbiAgICAgIHJldHVybiBuZXdPYmplY3Q7XG4gICAgfTtcblxuICB2YXIgaWRlbnRTdGFydCA9ICdbXFwkX2EtekEtWl0nO1xuICB2YXIgaWRlbnRQYXJ0ID0gJ1tcXCRfYS16QS1aMC05XSc7XG4gIHZhciBpZGVudFJlZ0V4cCA9IG5ldyBSZWdFeHAoJ14nICsgaWRlbnRTdGFydCArICcrJyArIGlkZW50UGFydCArICcqJyArICckJyk7XG5cbiAgZnVuY3Rpb24gZ2V0UGF0aENoYXJUeXBlKGNoYXIpIHtcbiAgICBpZiAoY2hhciA9PT0gdW5kZWZpbmVkKVxuICAgICAgcmV0dXJuICdlb2YnO1xuXG4gICAgdmFyIGNvZGUgPSBjaGFyLmNoYXJDb2RlQXQoMCk7XG5cbiAgICBzd2l0Y2goY29kZSkge1xuICAgICAgY2FzZSAweDVCOiAvLyBbXG4gICAgICBjYXNlIDB4NUQ6IC8vIF1cbiAgICAgIGNhc2UgMHgyRTogLy8gLlxuICAgICAgY2FzZSAweDIyOiAvLyBcIlxuICAgICAgY2FzZSAweDI3OiAvLyAnXG4gICAgICBjYXNlIDB4MzA6IC8vIDBcbiAgICAgICAgcmV0dXJuIGNoYXI7XG5cbiAgICAgIGNhc2UgMHg1RjogLy8gX1xuICAgICAgY2FzZSAweDI0OiAvLyAkXG4gICAgICAgIHJldHVybiAnaWRlbnQnO1xuXG4gICAgICBjYXNlIDB4MjA6IC8vIFNwYWNlXG4gICAgICBjYXNlIDB4MDk6IC8vIFRhYlxuICAgICAgY2FzZSAweDBBOiAvLyBOZXdsaW5lXG4gICAgICBjYXNlIDB4MEQ6IC8vIFJldHVyblxuICAgICAgY2FzZSAweEEwOiAgLy8gTm8tYnJlYWsgc3BhY2VcbiAgICAgIGNhc2UgMHhGRUZGOiAgLy8gQnl0ZSBPcmRlciBNYXJrXG4gICAgICBjYXNlIDB4MjAyODogIC8vIExpbmUgU2VwYXJhdG9yXG4gICAgICBjYXNlIDB4MjAyOTogIC8vIFBhcmFncmFwaCBTZXBhcmF0b3JcbiAgICAgICAgcmV0dXJuICd3cyc7XG4gICAgfVxuXG4gICAgLy8gYS16LCBBLVpcbiAgICBpZiAoKDB4NjEgPD0gY29kZSAmJiBjb2RlIDw9IDB4N0EpIHx8ICgweDQxIDw9IGNvZGUgJiYgY29kZSA8PSAweDVBKSlcbiAgICAgIHJldHVybiAnaWRlbnQnO1xuXG4gICAgLy8gMS05XG4gICAgaWYgKDB4MzEgPD0gY29kZSAmJiBjb2RlIDw9IDB4MzkpXG4gICAgICByZXR1cm4gJ251bWJlcic7XG5cbiAgICByZXR1cm4gJ2Vsc2UnO1xuICB9XG5cbiAgdmFyIHBhdGhTdGF0ZU1hY2hpbmUgPSB7XG4gICAgJ2JlZm9yZVBhdGgnOiB7XG4gICAgICAnd3MnOiBbJ2JlZm9yZVBhdGgnXSxcbiAgICAgICdpZGVudCc6IFsnaW5JZGVudCcsICdhcHBlbmQnXSxcbiAgICAgICdbJzogWydiZWZvcmVFbGVtZW50J10sXG4gICAgICAnZW9mJzogWydhZnRlclBhdGgnXVxuICAgIH0sXG5cbiAgICAnaW5QYXRoJzoge1xuICAgICAgJ3dzJzogWydpblBhdGgnXSxcbiAgICAgICcuJzogWydiZWZvcmVJZGVudCddLFxuICAgICAgJ1snOiBbJ2JlZm9yZUVsZW1lbnQnXSxcbiAgICAgICdlb2YnOiBbJ2FmdGVyUGF0aCddXG4gICAgfSxcblxuICAgICdiZWZvcmVJZGVudCc6IHtcbiAgICAgICd3cyc6IFsnYmVmb3JlSWRlbnQnXSxcbiAgICAgICdpZGVudCc6IFsnaW5JZGVudCcsICdhcHBlbmQnXVxuICAgIH0sXG5cbiAgICAnaW5JZGVudCc6IHtcbiAgICAgICdpZGVudCc6IFsnaW5JZGVudCcsICdhcHBlbmQnXSxcbiAgICAgICcwJzogWydpbklkZW50JywgJ2FwcGVuZCddLFxuICAgICAgJ251bWJlcic6IFsnaW5JZGVudCcsICdhcHBlbmQnXSxcbiAgICAgICd3cyc6IFsnaW5QYXRoJywgJ3B1c2gnXSxcbiAgICAgICcuJzogWydiZWZvcmVJZGVudCcsICdwdXNoJ10sXG4gICAgICAnWyc6IFsnYmVmb3JlRWxlbWVudCcsICdwdXNoJ10sXG4gICAgICAnZW9mJzogWydhZnRlclBhdGgnLCAncHVzaCddXG4gICAgfSxcblxuICAgICdiZWZvcmVFbGVtZW50Jzoge1xuICAgICAgJ3dzJzogWydiZWZvcmVFbGVtZW50J10sXG4gICAgICAnMCc6IFsnYWZ0ZXJaZXJvJywgJ2FwcGVuZCddLFxuICAgICAgJ251bWJlcic6IFsnaW5JbmRleCcsICdhcHBlbmQnXSxcbiAgICAgIFwiJ1wiOiBbJ2luU2luZ2xlUXVvdGUnLCAnYXBwZW5kJywgJyddLFxuICAgICAgJ1wiJzogWydpbkRvdWJsZVF1b3RlJywgJ2FwcGVuZCcsICcnXVxuICAgIH0sXG5cbiAgICAnYWZ0ZXJaZXJvJzoge1xuICAgICAgJ3dzJzogWydhZnRlckVsZW1lbnQnLCAncHVzaCddLFxuICAgICAgJ10nOiBbJ2luUGF0aCcsICdwdXNoJ11cbiAgICB9LFxuXG4gICAgJ2luSW5kZXgnOiB7XG4gICAgICAnMCc6IFsnaW5JbmRleCcsICdhcHBlbmQnXSxcbiAgICAgICdudW1iZXInOiBbJ2luSW5kZXgnLCAnYXBwZW5kJ10sXG4gICAgICAnd3MnOiBbJ2FmdGVyRWxlbWVudCddLFxuICAgICAgJ10nOiBbJ2luUGF0aCcsICdwdXNoJ11cbiAgICB9LFxuXG4gICAgJ2luU2luZ2xlUXVvdGUnOiB7XG4gICAgICBcIidcIjogWydhZnRlckVsZW1lbnQnXSxcbiAgICAgICdlb2YnOiBbJ2Vycm9yJ10sXG4gICAgICAnZWxzZSc6IFsnaW5TaW5nbGVRdW90ZScsICdhcHBlbmQnXVxuICAgIH0sXG5cbiAgICAnaW5Eb3VibGVRdW90ZSc6IHtcbiAgICAgICdcIic6IFsnYWZ0ZXJFbGVtZW50J10sXG4gICAgICAnZW9mJzogWydlcnJvciddLFxuICAgICAgJ2Vsc2UnOiBbJ2luRG91YmxlUXVvdGUnLCAnYXBwZW5kJ11cbiAgICB9LFxuXG4gICAgJ2FmdGVyRWxlbWVudCc6IHtcbiAgICAgICd3cyc6IFsnYWZ0ZXJFbGVtZW50J10sXG4gICAgICAnXSc6IFsnaW5QYXRoJywgJ3B1c2gnXVxuICAgIH1cbiAgfVxuXG4gIGZ1bmN0aW9uIG5vb3AoKSB7fVxuXG4gIGZ1bmN0aW9uIHBhcnNlUGF0aChwYXRoKSB7XG4gICAgdmFyIGtleXMgPSBbXTtcbiAgICB2YXIgaW5kZXggPSAtMTtcbiAgICB2YXIgYywgbmV3Q2hhciwga2V5LCB0eXBlLCB0cmFuc2l0aW9uLCBhY3Rpb24sIHR5cGVNYXAsIG1vZGUgPSAnYmVmb3JlUGF0aCc7XG5cbiAgICB2YXIgYWN0aW9ucyA9IHtcbiAgICAgIHB1c2g6IGZ1bmN0aW9uKCkge1xuICAgICAgICBpZiAoa2V5ID09PSB1bmRlZmluZWQpXG4gICAgICAgICAgcmV0dXJuO1xuXG4gICAgICAgIGtleXMucHVzaChrZXkpO1xuICAgICAgICBrZXkgPSB1bmRlZmluZWQ7XG4gICAgICB9LFxuXG4gICAgICBhcHBlbmQ6IGZ1bmN0aW9uKCkge1xuICAgICAgICBpZiAoa2V5ID09PSB1bmRlZmluZWQpXG4gICAgICAgICAga2V5ID0gbmV3Q2hhclxuICAgICAgICBlbHNlXG4gICAgICAgICAga2V5ICs9IG5ld0NoYXI7XG4gICAgICB9XG4gICAgfTtcblxuICAgIGZ1bmN0aW9uIG1heWJlVW5lc2NhcGVRdW90ZSgpIHtcbiAgICAgIGlmIChpbmRleCA+PSBwYXRoLmxlbmd0aClcbiAgICAgICAgcmV0dXJuO1xuXG4gICAgICB2YXIgbmV4dENoYXIgPSBwYXRoW2luZGV4ICsgMV07XG4gICAgICBpZiAoKG1vZGUgPT0gJ2luU2luZ2xlUXVvdGUnICYmIG5leHRDaGFyID09IFwiJ1wiKSB8fFxuICAgICAgICAgIChtb2RlID09ICdpbkRvdWJsZVF1b3RlJyAmJiBuZXh0Q2hhciA9PSAnXCInKSkge1xuICAgICAgICBpbmRleCsrO1xuICAgICAgICBuZXdDaGFyID0gbmV4dENoYXI7XG4gICAgICAgIGFjdGlvbnMuYXBwZW5kKCk7XG4gICAgICAgIHJldHVybiB0cnVlO1xuICAgICAgfVxuICAgIH1cblxuICAgIHdoaWxlIChtb2RlKSB7XG4gICAgICBpbmRleCsrO1xuICAgICAgYyA9IHBhdGhbaW5kZXhdO1xuXG4gICAgICBpZiAoYyA9PSAnXFxcXCcgJiYgbWF5YmVVbmVzY2FwZVF1b3RlKG1vZGUpKVxuICAgICAgICBjb250aW51ZTtcblxuICAgICAgdHlwZSA9IGdldFBhdGhDaGFyVHlwZShjKTtcbiAgICAgIHR5cGVNYXAgPSBwYXRoU3RhdGVNYWNoaW5lW21vZGVdO1xuICAgICAgdHJhbnNpdGlvbiA9IHR5cGVNYXBbdHlwZV0gfHwgdHlwZU1hcFsnZWxzZSddIHx8ICdlcnJvcic7XG5cbiAgICAgIGlmICh0cmFuc2l0aW9uID09ICdlcnJvcicpXG4gICAgICAgIHJldHVybjsgLy8gcGFyc2UgZXJyb3I7XG5cbiAgICAgIG1vZGUgPSB0cmFuc2l0aW9uWzBdO1xuICAgICAgYWN0aW9uID0gYWN0aW9uc1t0cmFuc2l0aW9uWzFdXSB8fCBub29wO1xuICAgICAgbmV3Q2hhciA9IHRyYW5zaXRpb25bMl0gPT09IHVuZGVmaW5lZCA/IGMgOiB0cmFuc2l0aW9uWzJdO1xuICAgICAgYWN0aW9uKCk7XG5cbiAgICAgIGlmIChtb2RlID09PSAnYWZ0ZXJQYXRoJykge1xuICAgICAgICByZXR1cm4ga2V5cztcbiAgICAgIH1cbiAgICB9XG5cbiAgICByZXR1cm47IC8vIHBhcnNlIGVycm9yXG4gIH1cblxuICBmdW5jdGlvbiBpc0lkZW50KHMpIHtcbiAgICByZXR1cm4gaWRlbnRSZWdFeHAudGVzdChzKTtcbiAgfVxuXG4gIHZhciBjb25zdHJ1Y3RvcklzUHJpdmF0ZSA9IHt9O1xuXG4gIGZ1bmN0aW9uIFBhdGgocGFydHMsIHByaXZhdGVUb2tlbikge1xuICAgIGlmIChwcml2YXRlVG9rZW4gIT09IGNvbnN0cnVjdG9ySXNQcml2YXRlKVxuICAgICAgdGhyb3cgRXJyb3IoJ1VzZSBQYXRoLmdldCB0byByZXRyaWV2ZSBwYXRoIG9iamVjdHMnKTtcblxuICAgIGZvciAodmFyIGkgPSAwOyBpIDwgcGFydHMubGVuZ3RoOyBpKyspIHtcbiAgICAgIHRoaXMucHVzaChTdHJpbmcocGFydHNbaV0pKTtcbiAgICB9XG5cbiAgICBpZiAoaGFzRXZhbCAmJiB0aGlzLmxlbmd0aCkge1xuICAgICAgdGhpcy5nZXRWYWx1ZUZyb20gPSB0aGlzLmNvbXBpbGVkR2V0VmFsdWVGcm9tRm4oKTtcbiAgICB9XG4gIH1cblxuICAvLyBUT0RPKHJhZmFlbHcpOiBNYWtlIHNpbXBsZSBMUlUgY2FjaGVcbiAgdmFyIHBhdGhDYWNoZSA9IHt9O1xuXG4gIGZ1bmN0aW9uIGdldFBhdGgocGF0aFN0cmluZykge1xuICAgIGlmIChwYXRoU3RyaW5nIGluc3RhbmNlb2YgUGF0aClcbiAgICAgIHJldHVybiBwYXRoU3RyaW5nO1xuXG4gICAgaWYgKHBhdGhTdHJpbmcgPT0gbnVsbCB8fCBwYXRoU3RyaW5nLmxlbmd0aCA9PSAwKVxuICAgICAgcGF0aFN0cmluZyA9ICcnO1xuXG4gICAgaWYgKHR5cGVvZiBwYXRoU3RyaW5nICE9ICdzdHJpbmcnKSB7XG4gICAgICBpZiAoaXNJbmRleChwYXRoU3RyaW5nLmxlbmd0aCkpIHtcbiAgICAgICAgLy8gQ29uc3RydWN0ZWQgd2l0aCBhcnJheS1saWtlIChwcmUtcGFyc2VkKSBrZXlzXG4gICAgICAgIHJldHVybiBuZXcgUGF0aChwYXRoU3RyaW5nLCBjb25zdHJ1Y3RvcklzUHJpdmF0ZSk7XG4gICAgICB9XG5cbiAgICAgIHBhdGhTdHJpbmcgPSBTdHJpbmcocGF0aFN0cmluZyk7XG4gICAgfVxuXG4gICAgdmFyIHBhdGggPSBwYXRoQ2FjaGVbcGF0aFN0cmluZ107XG4gICAgaWYgKHBhdGgpXG4gICAgICByZXR1cm4gcGF0aDtcblxuICAgIHZhciBwYXJ0cyA9IHBhcnNlUGF0aChwYXRoU3RyaW5nKTtcbiAgICBpZiAoIXBhcnRzKVxuICAgICAgcmV0dXJuIGludmFsaWRQYXRoO1xuXG4gICAgdmFyIHBhdGggPSBuZXcgUGF0aChwYXJ0cywgY29uc3RydWN0b3JJc1ByaXZhdGUpO1xuICAgIHBhdGhDYWNoZVtwYXRoU3RyaW5nXSA9IHBhdGg7XG4gICAgcmV0dXJuIHBhdGg7XG4gIH1cblxuICBQYXRoLmdldCA9IGdldFBhdGg7XG5cbiAgZnVuY3Rpb24gZm9ybWF0QWNjZXNzb3Ioa2V5KSB7XG4gICAgaWYgKGlzSW5kZXgoa2V5KSkge1xuICAgICAgcmV0dXJuICdbJyArIGtleSArICddJztcbiAgICB9IGVsc2Uge1xuICAgICAgcmV0dXJuICdbXCInICsga2V5LnJlcGxhY2UoL1wiL2csICdcXFxcXCInKSArICdcIl0nO1xuICAgIH1cbiAgfVxuXG4gIFBhdGgucHJvdG90eXBlID0gY3JlYXRlT2JqZWN0KHtcbiAgICBfX3Byb3RvX186IFtdLFxuICAgIHZhbGlkOiB0cnVlLFxuXG4gICAgdG9TdHJpbmc6IGZ1bmN0aW9uKCkge1xuICAgICAgdmFyIHBhdGhTdHJpbmcgPSAnJztcbiAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgdGhpcy5sZW5ndGg7IGkrKykge1xuICAgICAgICB2YXIga2V5ID0gdGhpc1tpXTtcbiAgICAgICAgaWYgKGlzSWRlbnQoa2V5KSkge1xuICAgICAgICAgIHBhdGhTdHJpbmcgKz0gaSA/ICcuJyArIGtleSA6IGtleTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICBwYXRoU3RyaW5nICs9IGZvcm1hdEFjY2Vzc29yKGtleSk7XG4gICAgICAgIH1cbiAgICAgIH1cblxuICAgICAgcmV0dXJuIHBhdGhTdHJpbmc7XG4gICAgfSxcblxuICAgIGdldFZhbHVlRnJvbTogZnVuY3Rpb24ob2JqLCBkaXJlY3RPYnNlcnZlcikge1xuICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCB0aGlzLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgIGlmIChvYmogPT0gbnVsbClcbiAgICAgICAgICByZXR1cm47XG4gICAgICAgIG9iaiA9IG9ialt0aGlzW2ldXTtcbiAgICAgIH1cbiAgICAgIHJldHVybiBvYmo7XG4gICAgfSxcblxuICAgIGl0ZXJhdGVPYmplY3RzOiBmdW5jdGlvbihvYmosIG9ic2VydmUpIHtcbiAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgdGhpcy5sZW5ndGg7IGkrKykge1xuICAgICAgICBpZiAoaSlcbiAgICAgICAgICBvYmogPSBvYmpbdGhpc1tpIC0gMV1dO1xuICAgICAgICBpZiAoIWlzT2JqZWN0KG9iaikpXG4gICAgICAgICAgcmV0dXJuO1xuICAgICAgICBvYnNlcnZlKG9iaiwgdGhpc1swXSk7XG4gICAgICB9XG4gICAgfSxcblxuICAgIGNvbXBpbGVkR2V0VmFsdWVGcm9tRm46IGZ1bmN0aW9uKCkge1xuICAgICAgdmFyIHN0ciA9ICcnO1xuICAgICAgdmFyIHBhdGhTdHJpbmcgPSAnb2JqJztcbiAgICAgIHN0ciArPSAnaWYgKG9iaiAhPSBudWxsJztcbiAgICAgIHZhciBpID0gMDtcbiAgICAgIHZhciBrZXk7XG4gICAgICBmb3IgKDsgaSA8ICh0aGlzLmxlbmd0aCAtIDEpOyBpKyspIHtcbiAgICAgICAga2V5ID0gdGhpc1tpXTtcbiAgICAgICAgcGF0aFN0cmluZyArPSBpc0lkZW50KGtleSkgPyAnLicgKyBrZXkgOiBmb3JtYXRBY2Nlc3NvcihrZXkpO1xuICAgICAgICBzdHIgKz0gJyAmJlxcbiAgICAgJyArIHBhdGhTdHJpbmcgKyAnICE9IG51bGwnO1xuICAgICAgfVxuICAgICAgc3RyICs9ICcpXFxuJztcblxuICAgICAgdmFyIGtleSA9IHRoaXNbaV07XG4gICAgICBwYXRoU3RyaW5nICs9IGlzSWRlbnQoa2V5KSA/ICcuJyArIGtleSA6IGZvcm1hdEFjY2Vzc29yKGtleSk7XG5cbiAgICAgIHN0ciArPSAnICByZXR1cm4gJyArIHBhdGhTdHJpbmcgKyAnO1xcbmVsc2VcXG4gIHJldHVybiB1bmRlZmluZWQ7JztcbiAgICAgIHJldHVybiBuZXcgRnVuY3Rpb24oJ29iaicsIHN0cik7XG4gICAgfSxcblxuICAgIHNldFZhbHVlRnJvbTogZnVuY3Rpb24ob2JqLCB2YWx1ZSkge1xuICAgICAgaWYgKCF0aGlzLmxlbmd0aClcbiAgICAgICAgcmV0dXJuIGZhbHNlO1xuXG4gICAgICBmb3IgKHZhciBpID0gMDsgaSA8IHRoaXMubGVuZ3RoIC0gMTsgaSsrKSB7XG4gICAgICAgIGlmICghaXNPYmplY3Qob2JqKSlcbiAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgIG9iaiA9IG9ialt0aGlzW2ldXTtcbiAgICAgIH1cblxuICAgICAgaWYgKCFpc09iamVjdChvYmopKVxuICAgICAgICByZXR1cm4gZmFsc2U7XG5cbiAgICAgIG9ialt0aGlzW2ldXSA9IHZhbHVlO1xuICAgICAgcmV0dXJuIHRydWU7XG4gICAgfVxuICB9KTtcblxuICB2YXIgaW52YWxpZFBhdGggPSBuZXcgUGF0aCgnJywgY29uc3RydWN0b3JJc1ByaXZhdGUpO1xuICBpbnZhbGlkUGF0aC52YWxpZCA9IGZhbHNlO1xuICBpbnZhbGlkUGF0aC5nZXRWYWx1ZUZyb20gPSBpbnZhbGlkUGF0aC5zZXRWYWx1ZUZyb20gPSBmdW5jdGlvbigpIHt9O1xuXG4gIHZhciBNQVhfRElSVFlfQ0hFQ0tfQ1lDTEVTID0gMTAwMDtcblxuICBmdW5jdGlvbiBkaXJ0eUNoZWNrKG9ic2VydmVyKSB7XG4gICAgdmFyIGN5Y2xlcyA9IDA7XG4gICAgd2hpbGUgKGN5Y2xlcyA8IE1BWF9ESVJUWV9DSEVDS19DWUNMRVMgJiYgb2JzZXJ2ZXIuY2hlY2tfKCkpIHtcbiAgICAgIGN5Y2xlcysrO1xuICAgIH1cbiAgICBpZiAodGVzdGluZ0V4cG9zZUN5Y2xlQ291bnQpXG4gICAgICBnbG9iYWwuZGlydHlDaGVja0N5Y2xlQ291bnQgPSBjeWNsZXM7XG5cbiAgICByZXR1cm4gY3ljbGVzID4gMDtcbiAgfVxuXG4gIGZ1bmN0aW9uIG9iamVjdElzRW1wdHkob2JqZWN0KSB7XG4gICAgZm9yICh2YXIgcHJvcCBpbiBvYmplY3QpXG4gICAgICByZXR1cm4gZmFsc2U7XG4gICAgcmV0dXJuIHRydWU7XG4gIH1cblxuICBmdW5jdGlvbiBkaWZmSXNFbXB0eShkaWZmKSB7XG4gICAgcmV0dXJuIG9iamVjdElzRW1wdHkoZGlmZi5hZGRlZCkgJiZcbiAgICAgICAgICAgb2JqZWN0SXNFbXB0eShkaWZmLnJlbW92ZWQpICYmXG4gICAgICAgICAgIG9iamVjdElzRW1wdHkoZGlmZi5jaGFuZ2VkKTtcbiAgfVxuXG4gIGZ1bmN0aW9uIGRpZmZPYmplY3RGcm9tT2xkT2JqZWN0KG9iamVjdCwgb2xkT2JqZWN0KSB7XG4gICAgdmFyIGFkZGVkID0ge307XG4gICAgdmFyIHJlbW92ZWQgPSB7fTtcbiAgICB2YXIgY2hhbmdlZCA9IHt9O1xuXG4gICAgZm9yICh2YXIgcHJvcCBpbiBvbGRPYmplY3QpIHtcbiAgICAgIHZhciBuZXdWYWx1ZSA9IG9iamVjdFtwcm9wXTtcblxuICAgICAgaWYgKG5ld1ZhbHVlICE9PSB1bmRlZmluZWQgJiYgbmV3VmFsdWUgPT09IG9sZE9iamVjdFtwcm9wXSlcbiAgICAgICAgY29udGludWU7XG5cbiAgICAgIGlmICghKHByb3AgaW4gb2JqZWN0KSkge1xuICAgICAgICByZW1vdmVkW3Byb3BdID0gdW5kZWZpbmVkO1xuICAgICAgICBjb250aW51ZTtcbiAgICAgIH1cblxuICAgICAgaWYgKG5ld1ZhbHVlICE9PSBvbGRPYmplY3RbcHJvcF0pXG4gICAgICAgIGNoYW5nZWRbcHJvcF0gPSBuZXdWYWx1ZTtcbiAgICB9XG5cbiAgICBmb3IgKHZhciBwcm9wIGluIG9iamVjdCkge1xuICAgICAgaWYgKHByb3AgaW4gb2xkT2JqZWN0KVxuICAgICAgICBjb250aW51ZTtcblxuICAgICAgYWRkZWRbcHJvcF0gPSBvYmplY3RbcHJvcF07XG4gICAgfVxuXG4gICAgaWYgKEFycmF5LmlzQXJyYXkob2JqZWN0KSAmJiBvYmplY3QubGVuZ3RoICE9PSBvbGRPYmplY3QubGVuZ3RoKVxuICAgICAgY2hhbmdlZC5sZW5ndGggPSBvYmplY3QubGVuZ3RoO1xuXG4gICAgcmV0dXJuIHtcbiAgICAgIGFkZGVkOiBhZGRlZCxcbiAgICAgIHJlbW92ZWQ6IHJlbW92ZWQsXG4gICAgICBjaGFuZ2VkOiBjaGFuZ2VkXG4gICAgfTtcbiAgfVxuXG4gIHZhciBlb21UYXNrcyA9IFtdO1xuICBmdW5jdGlvbiBydW5FT01UYXNrcygpIHtcbiAgICBpZiAoIWVvbVRhc2tzLmxlbmd0aClcbiAgICAgIHJldHVybiBmYWxzZTtcblxuICAgIGZvciAodmFyIGkgPSAwOyBpIDwgZW9tVGFza3MubGVuZ3RoOyBpKyspIHtcbiAgICAgIGVvbVRhc2tzW2ldKCk7XG4gICAgfVxuICAgIGVvbVRhc2tzLmxlbmd0aCA9IDA7XG4gICAgcmV0dXJuIHRydWU7XG4gIH1cblxuICB2YXIgcnVuRU9NID0gaGFzT2JzZXJ2ZSA/IChmdW5jdGlvbigpe1xuICAgIHZhciBlb21PYmogPSB7IHBpbmdQb25nOiB0cnVlIH07XG4gICAgdmFyIGVvbVJ1blNjaGVkdWxlZCA9IGZhbHNlO1xuXG4gICAgT2JqZWN0Lm9ic2VydmUoZW9tT2JqLCBmdW5jdGlvbigpIHtcbiAgICAgIHJ1bkVPTVRhc2tzKCk7XG4gICAgICBlb21SdW5TY2hlZHVsZWQgPSBmYWxzZTtcbiAgICB9KTtcblxuICAgIHJldHVybiBmdW5jdGlvbihmbikge1xuICAgICAgZW9tVGFza3MucHVzaChmbik7XG4gICAgICBpZiAoIWVvbVJ1blNjaGVkdWxlZCkge1xuICAgICAgICBlb21SdW5TY2hlZHVsZWQgPSB0cnVlO1xuICAgICAgICBlb21PYmoucGluZ1BvbmcgPSAhZW9tT2JqLnBpbmdQb25nO1xuICAgICAgfVxuICAgIH07XG4gIH0pKCkgOlxuICAoZnVuY3Rpb24oKSB7XG4gICAgcmV0dXJuIGZ1bmN0aW9uKGZuKSB7XG4gICAgICBlb21UYXNrcy5wdXNoKGZuKTtcbiAgICB9O1xuICB9KSgpO1xuXG4gIHZhciBvYnNlcnZlZE9iamVjdENhY2hlID0gW107XG5cbiAgZnVuY3Rpb24gbmV3T2JzZXJ2ZWRPYmplY3QoKSB7XG4gICAgdmFyIG9ic2VydmVyO1xuICAgIHZhciBvYmplY3Q7XG4gICAgdmFyIGRpc2NhcmRSZWNvcmRzID0gZmFsc2U7XG4gICAgdmFyIGZpcnN0ID0gdHJ1ZTtcblxuICAgIGZ1bmN0aW9uIGNhbGxiYWNrKHJlY29yZHMpIHtcbiAgICAgIGlmIChvYnNlcnZlciAmJiBvYnNlcnZlci5zdGF0ZV8gPT09IE9QRU5FRCAmJiAhZGlzY2FyZFJlY29yZHMpXG4gICAgICAgIG9ic2VydmVyLmNoZWNrXyhyZWNvcmRzKTtcbiAgICB9XG5cbiAgICByZXR1cm4ge1xuICAgICAgb3BlbjogZnVuY3Rpb24ob2JzKSB7XG4gICAgICAgIGlmIChvYnNlcnZlcilcbiAgICAgICAgICB0aHJvdyBFcnJvcignT2JzZXJ2ZWRPYmplY3QgaW4gdXNlJyk7XG5cbiAgICAgICAgaWYgKCFmaXJzdClcbiAgICAgICAgICBPYmplY3QuZGVsaXZlckNoYW5nZVJlY29yZHMoY2FsbGJhY2spO1xuXG4gICAgICAgIG9ic2VydmVyID0gb2JzO1xuICAgICAgICBmaXJzdCA9IGZhbHNlO1xuICAgICAgfSxcbiAgICAgIG9ic2VydmU6IGZ1bmN0aW9uKG9iaiwgYXJyYXlPYnNlcnZlKSB7XG4gICAgICAgIG9iamVjdCA9IG9iajtcbiAgICAgICAgaWYgKGFycmF5T2JzZXJ2ZSlcbiAgICAgICAgICBBcnJheS5vYnNlcnZlKG9iamVjdCwgY2FsbGJhY2spO1xuICAgICAgICBlbHNlXG4gICAgICAgICAgT2JqZWN0Lm9ic2VydmUob2JqZWN0LCBjYWxsYmFjayk7XG4gICAgICB9LFxuICAgICAgZGVsaXZlcjogZnVuY3Rpb24oZGlzY2FyZCkge1xuICAgICAgICBkaXNjYXJkUmVjb3JkcyA9IGRpc2NhcmQ7XG4gICAgICAgIE9iamVjdC5kZWxpdmVyQ2hhbmdlUmVjb3JkcyhjYWxsYmFjayk7XG4gICAgICAgIGRpc2NhcmRSZWNvcmRzID0gZmFsc2U7XG4gICAgICB9LFxuICAgICAgY2xvc2U6IGZ1bmN0aW9uKCkge1xuICAgICAgICBvYnNlcnZlciA9IHVuZGVmaW5lZDtcbiAgICAgICAgT2JqZWN0LnVub2JzZXJ2ZShvYmplY3QsIGNhbGxiYWNrKTtcbiAgICAgICAgb2JzZXJ2ZWRPYmplY3RDYWNoZS5wdXNoKHRoaXMpO1xuICAgICAgfVxuICAgIH07XG4gIH1cblxuICAvKlxuICAgKiBUaGUgb2JzZXJ2ZWRTZXQgYWJzdHJhY3Rpb24gaXMgYSBwZXJmIG9wdGltaXphdGlvbiB3aGljaCByZWR1Y2VzIHRoZSB0b3RhbFxuICAgKiBudW1iZXIgb2YgT2JqZWN0Lm9ic2VydmUgb2JzZXJ2YXRpb25zIG9mIGEgc2V0IG9mIG9iamVjdHMuIFRoZSBpZGVhIGlzIHRoYXRcbiAgICogZ3JvdXBzIG9mIE9ic2VydmVycyB3aWxsIGhhdmUgc29tZSBvYmplY3QgZGVwZW5kZW5jaWVzIGluIGNvbW1vbiBhbmQgdGhpc1xuICAgKiBvYnNlcnZlZCBzZXQgZW5zdXJlcyB0aGF0IGVhY2ggb2JqZWN0IGluIHRoZSB0cmFuc2l0aXZlIGNsb3N1cmUgb2ZcbiAgICogZGVwZW5kZW5jaWVzIGlzIG9ubHkgb2JzZXJ2ZWQgb25jZS4gVGhlIG9ic2VydmVkU2V0IGFjdHMgYXMgYSB3cml0ZSBiYXJyaWVyXG4gICAqIHN1Y2ggdGhhdCB3aGVuZXZlciBhbnkgY2hhbmdlIGNvbWVzIHRocm91Z2gsIGFsbCBPYnNlcnZlcnMgYXJlIGNoZWNrZWQgZm9yXG4gICAqIGNoYW5nZWQgdmFsdWVzLlxuICAgKlxuICAgKiBOb3RlIHRoYXQgdGhpcyBvcHRpbWl6YXRpb24gaXMgZXhwbGljaXRseSBtb3Zpbmcgd29yayBmcm9tIHNldHVwLXRpbWUgdG9cbiAgICogY2hhbmdlLXRpbWUuXG4gICAqXG4gICAqIFRPRE8ocmFmYWVsdyk6IEltcGxlbWVudCBcImdhcmJhZ2UgY29sbGVjdGlvblwiLiBJbiBvcmRlciB0byBtb3ZlIHdvcmsgb2ZmXG4gICAqIHRoZSBjcml0aWNhbCBwYXRoLCB3aGVuIE9ic2VydmVycyBhcmUgY2xvc2VkLCB0aGVpciBvYnNlcnZlZCBvYmplY3RzIGFyZVxuICAgKiBub3QgT2JqZWN0LnVub2JzZXJ2ZShkKS4gQXMgYSByZXN1bHQsIGl0J3NpZXN0YSBwb3NzaWJsZSB0aGF0IGlmIHRoZSBvYnNlcnZlZFNldFxuICAgKiBpcyBrZXB0IG9wZW4sIGJ1dCBzb21lIE9ic2VydmVycyBoYXZlIGJlZW4gY2xvc2VkLCBpdCBjb3VsZCBjYXVzZSBcImxlYWtzXCJcbiAgICogKHByZXZlbnQgb3RoZXJ3aXNlIGNvbGxlY3RhYmxlIG9iamVjdHMgZnJvbSBiZWluZyBjb2xsZWN0ZWQpLiBBdCBzb21lXG4gICAqIHBvaW50LCB3ZSBzaG91bGQgaW1wbGVtZW50IGluY3JlbWVudGFsIFwiZ2NcIiB3aGljaCBrZWVwcyBhIGxpc3Qgb2ZcbiAgICogb2JzZXJ2ZWRTZXRzIHdoaWNoIG1heSBuZWVkIGNsZWFuLXVwIGFuZCBkb2VzIHNtYWxsIGFtb3VudHMgb2YgY2xlYW51cCBvbiBhXG4gICAqIHRpbWVvdXQgdW50aWwgYWxsIGlzIGNsZWFuLlxuICAgKi9cblxuICBmdW5jdGlvbiBnZXRPYnNlcnZlZE9iamVjdChvYnNlcnZlciwgb2JqZWN0LCBhcnJheU9ic2VydmUpIHtcbiAgICB2YXIgZGlyID0gb2JzZXJ2ZWRPYmplY3RDYWNoZS5wb3AoKSB8fCBuZXdPYnNlcnZlZE9iamVjdCgpO1xuICAgIGRpci5vcGVuKG9ic2VydmVyKTtcbiAgICBkaXIub2JzZXJ2ZShvYmplY3QsIGFycmF5T2JzZXJ2ZSk7XG4gICAgcmV0dXJuIGRpcjtcbiAgfVxuXG4gIHZhciBvYnNlcnZlZFNldENhY2hlID0gW107XG5cbiAgZnVuY3Rpb24gbmV3T2JzZXJ2ZWRTZXQoKSB7XG4gICAgdmFyIG9ic2VydmVyQ291bnQgPSAwO1xuICAgIHZhciBvYnNlcnZlcnMgPSBbXTtcbiAgICB2YXIgb2JqZWN0cyA9IFtdO1xuICAgIHZhciByb290T2JqO1xuICAgIHZhciByb290T2JqUHJvcHM7XG5cbiAgICBmdW5jdGlvbiBvYnNlcnZlKG9iaiwgcHJvcCkge1xuICAgICAgaWYgKCFvYmopXG4gICAgICAgIHJldHVybjtcblxuICAgICAgaWYgKG9iaiA9PT0gcm9vdE9iailcbiAgICAgICAgcm9vdE9ialByb3BzW3Byb3BdID0gdHJ1ZTtcblxuICAgICAgaWYgKG9iamVjdHMuaW5kZXhPZihvYmopIDwgMCkge1xuICAgICAgICBvYmplY3RzLnB1c2gob2JqKTtcbiAgICAgICAgT2JqZWN0Lm9ic2VydmUob2JqLCBjYWxsYmFjayk7XG4gICAgICB9XG5cbiAgICAgIG9ic2VydmUoT2JqZWN0LmdldFByb3RvdHlwZU9mKG9iaiksIHByb3ApO1xuICAgIH1cblxuICAgIGZ1bmN0aW9uIGFsbFJvb3RPYmpOb25PYnNlcnZlZFByb3BzKHJlY3MpIHtcbiAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgcmVjcy5sZW5ndGg7IGkrKykge1xuICAgICAgICB2YXIgcmVjID0gcmVjc1tpXTtcbiAgICAgICAgaWYgKHJlYy5vYmplY3QgIT09IHJvb3RPYmogfHxcbiAgICAgICAgICAgIHJvb3RPYmpQcm9wc1tyZWMubmFtZV0gfHxcbiAgICAgICAgICAgIHJlYy50eXBlID09PSAnc2V0UHJvdG90eXBlJykge1xuICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgICAgcmV0dXJuIHRydWU7XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gY2FsbGJhY2socmVjcykge1xuICAgICAgaWYgKGFsbFJvb3RPYmpOb25PYnNlcnZlZFByb3BzKHJlY3MpKVxuICAgICAgICByZXR1cm47XG5cbiAgICAgIHZhciBvYnNlcnZlcjtcbiAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgb2JzZXJ2ZXJzLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgIG9ic2VydmVyID0gb2JzZXJ2ZXJzW2ldO1xuICAgICAgICBpZiAob2JzZXJ2ZXIuc3RhdGVfID09IE9QRU5FRCkge1xuICAgICAgICAgIG9ic2VydmVyLml0ZXJhdGVPYmplY3RzXyhvYnNlcnZlKTtcbiAgICAgICAgfVxuICAgICAgfVxuXG4gICAgICBmb3IgKHZhciBpID0gMDsgaSA8IG9ic2VydmVycy5sZW5ndGg7IGkrKykge1xuICAgICAgICBvYnNlcnZlciA9IG9ic2VydmVyc1tpXTtcbiAgICAgICAgaWYgKG9ic2VydmVyLnN0YXRlXyA9PSBPUEVORUQpIHtcbiAgICAgICAgICBvYnNlcnZlci5jaGVja18oKTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH1cblxuICAgIHZhciByZWNvcmQgPSB7XG4gICAgICBvYmplY3Q6IHVuZGVmaW5lZCxcbiAgICAgIG9iamVjdHM6IG9iamVjdHMsXG4gICAgICBvcGVuOiBmdW5jdGlvbihvYnMsIG9iamVjdCkge1xuICAgICAgICBpZiAoIXJvb3RPYmopIHtcbiAgICAgICAgICByb290T2JqID0gb2JqZWN0O1xuICAgICAgICAgIHJvb3RPYmpQcm9wcyA9IHt9O1xuICAgICAgICB9XG5cbiAgICAgICAgb2JzZXJ2ZXJzLnB1c2gob2JzKTtcbiAgICAgICAgb2JzZXJ2ZXJDb3VudCsrO1xuICAgICAgICBvYnMuaXRlcmF0ZU9iamVjdHNfKG9ic2VydmUpO1xuICAgICAgfSxcbiAgICAgIGNsb3NlOiBmdW5jdGlvbihvYnMpIHtcbiAgICAgICAgb2JzZXJ2ZXJDb3VudC0tO1xuICAgICAgICBpZiAob2JzZXJ2ZXJDb3VudCA+IDApIHtcbiAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cblxuICAgICAgICBmb3IgKHZhciBpID0gMDsgaSA8IG9iamVjdHMubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICBPYmplY3QudW5vYnNlcnZlKG9iamVjdHNbaV0sIGNhbGxiYWNrKTtcbiAgICAgICAgICBPYnNlcnZlci51bm9ic2VydmVkQ291bnQrKztcbiAgICAgICAgfVxuXG4gICAgICAgIG9ic2VydmVycy5sZW5ndGggPSAwO1xuICAgICAgICBvYmplY3RzLmxlbmd0aCA9IDA7XG4gICAgICAgIHJvb3RPYmogPSB1bmRlZmluZWQ7XG4gICAgICAgIHJvb3RPYmpQcm9wcyA9IHVuZGVmaW5lZDtcbiAgICAgICAgb2JzZXJ2ZWRTZXRDYWNoZS5wdXNoKHRoaXMpO1xuICAgICAgfVxuICAgIH07XG5cbiAgICByZXR1cm4gcmVjb3JkO1xuICB9XG5cbiAgdmFyIGxhc3RPYnNlcnZlZFNldDtcblxuICBmdW5jdGlvbiBnZXRPYnNlcnZlZFNldChvYnNlcnZlciwgb2JqKSB7XG4gICAgaWYgKCFsYXN0T2JzZXJ2ZWRTZXQgfHwgbGFzdE9ic2VydmVkU2V0Lm9iamVjdCAhPT0gb2JqKSB7XG4gICAgICBsYXN0T2JzZXJ2ZWRTZXQgPSBvYnNlcnZlZFNldENhY2hlLnBvcCgpIHx8IG5ld09ic2VydmVkU2V0KCk7XG4gICAgICBsYXN0T2JzZXJ2ZWRTZXQub2JqZWN0ID0gb2JqO1xuICAgIH1cbiAgICBsYXN0T2JzZXJ2ZWRTZXQub3BlbihvYnNlcnZlciwgb2JqKTtcbiAgICByZXR1cm4gbGFzdE9ic2VydmVkU2V0O1xuICB9XG5cbiAgdmFyIFVOT1BFTkVEID0gMDtcbiAgdmFyIE9QRU5FRCA9IDE7XG4gIHZhciBDTE9TRUQgPSAyO1xuICB2YXIgUkVTRVRUSU5HID0gMztcblxuICB2YXIgbmV4dE9ic2VydmVySWQgPSAxO1xuXG4gIGZ1bmN0aW9uIE9ic2VydmVyKCkge1xuICAgIHRoaXMuc3RhdGVfID0gVU5PUEVORUQ7XG4gICAgdGhpcy5jYWxsYmFja18gPSB1bmRlZmluZWQ7XG4gICAgdGhpcy50YXJnZXRfID0gdW5kZWZpbmVkOyAvLyBUT0RPKHJhZmFlbHcpOiBTaG91bGQgYmUgV2Vha1JlZlxuICAgIHRoaXMuZGlyZWN0T2JzZXJ2ZXJfID0gdW5kZWZpbmVkO1xuICAgIHRoaXMudmFsdWVfID0gdW5kZWZpbmVkO1xuICAgIHRoaXMuaWRfID0gbmV4dE9ic2VydmVySWQrKztcbiAgfVxuXG4gIE9ic2VydmVyLnByb3RvdHlwZSA9IHtcbiAgICBvcGVuOiBmdW5jdGlvbihjYWxsYmFjaywgdGFyZ2V0KSB7XG4gICAgICBpZiAodGhpcy5zdGF0ZV8gIT0gVU5PUEVORUQpXG4gICAgICAgIHRocm93IEVycm9yKCdPYnNlcnZlciBoYXMgYWxyZWFkeSBiZWVuIG9wZW5lZC4nKTtcblxuICAgICAgYWRkVG9BbGwodGhpcyk7XG4gICAgICB0aGlzLmNhbGxiYWNrXyA9IGNhbGxiYWNrO1xuICAgICAgdGhpcy50YXJnZXRfID0gdGFyZ2V0O1xuICAgICAgdGhpcy5jb25uZWN0XygpO1xuICAgICAgdGhpcy5zdGF0ZV8gPSBPUEVORUQ7XG4gICAgICByZXR1cm4gdGhpcy52YWx1ZV87XG4gICAgfSxcblxuICAgIGNsb3NlOiBmdW5jdGlvbigpIHtcbiAgICAgIGlmICh0aGlzLnN0YXRlXyAhPSBPUEVORUQpXG4gICAgICAgIHJldHVybjtcblxuICAgICAgcmVtb3ZlRnJvbUFsbCh0aGlzKTtcbiAgICAgIHRoaXMuZGlzY29ubmVjdF8oKTtcbiAgICAgIHRoaXMudmFsdWVfID0gdW5kZWZpbmVkO1xuICAgICAgdGhpcy5jYWxsYmFja18gPSB1bmRlZmluZWQ7XG4gICAgICB0aGlzLnRhcmdldF8gPSB1bmRlZmluZWQ7XG4gICAgICB0aGlzLnN0YXRlXyA9IENMT1NFRDtcbiAgICB9LFxuXG4gICAgZGVsaXZlcjogZnVuY3Rpb24oKSB7XG4gICAgICBpZiAodGhpcy5zdGF0ZV8gIT0gT1BFTkVEKVxuICAgICAgICByZXR1cm47XG5cbiAgICAgIGRpcnR5Q2hlY2sodGhpcyk7XG4gICAgfSxcblxuICAgIHJlcG9ydF86IGZ1bmN0aW9uKGNoYW5nZXMpIHtcbiAgICAgIHRyeSB7XG4gICAgICAgIHRoaXMuY2FsbGJhY2tfLmFwcGx5KHRoaXMudGFyZ2V0XywgY2hhbmdlcyk7XG4gICAgICB9IGNhdGNoIChleCkge1xuICAgICAgICBPYnNlcnZlci5fZXJyb3JUaHJvd25EdXJpbmdDYWxsYmFjayA9IHRydWU7XG4gICAgICAgIGNvbnNvbGUuZXJyb3IoJ0V4Y2VwdGlvbiBjYXVnaHQgZHVyaW5nIG9ic2VydmVyIGNhbGxiYWNrOiAnICtcbiAgICAgICAgICAgICAgICAgICAgICAgKGV4LnN0YWNrIHx8IGV4KSk7XG4gICAgICB9XG4gICAgfSxcblxuICAgIGRpc2NhcmRDaGFuZ2VzOiBmdW5jdGlvbigpIHtcbiAgICAgIHRoaXMuY2hlY2tfKHVuZGVmaW5lZCwgdHJ1ZSk7XG4gICAgICByZXR1cm4gdGhpcy52YWx1ZV87XG4gICAgfVxuICB9XG5cbiAgdmFyIGNvbGxlY3RPYnNlcnZlcnMgPSAhaGFzT2JzZXJ2ZTtcbiAgdmFyIGFsbE9ic2VydmVycztcbiAgT2JzZXJ2ZXIuX2FsbE9ic2VydmVyc0NvdW50ID0gMDtcblxuICBpZiAoY29sbGVjdE9ic2VydmVycykge1xuICAgIGFsbE9ic2VydmVycyA9IFtdO1xuICB9XG5cbiAgZnVuY3Rpb24gYWRkVG9BbGwob2JzZXJ2ZXIpIHtcbiAgICBPYnNlcnZlci5fYWxsT2JzZXJ2ZXJzQ291bnQrKztcbiAgICBpZiAoIWNvbGxlY3RPYnNlcnZlcnMpXG4gICAgICByZXR1cm47XG5cbiAgICBhbGxPYnNlcnZlcnMucHVzaChvYnNlcnZlcik7XG4gIH1cblxuICBmdW5jdGlvbiByZW1vdmVGcm9tQWxsKG9ic2VydmVyKSB7XG4gICAgT2JzZXJ2ZXIuX2FsbE9ic2VydmVyc0NvdW50LS07XG4gIH1cblxuICB2YXIgcnVubmluZ01pY3JvdGFza0NoZWNrcG9pbnQgPSBmYWxzZTtcblxuICB2YXIgaGFzRGVidWdGb3JjZUZ1bGxEZWxpdmVyeSA9IGhhc09ic2VydmUgJiYgaGFzRXZhbCAmJiAoZnVuY3Rpb24oKSB7XG4gICAgdHJ5IHtcbiAgICAgIGV2YWwoJyVSdW5NaWNyb3Rhc2tzKCknKTtcbiAgICAgIHJldHVybiB0cnVlO1xuICAgIH0gY2F0Y2ggKGV4KSB7XG4gICAgICByZXR1cm4gZmFsc2U7XG4gICAgfVxuICB9KSgpO1xuXG4gIGdsb2JhbC5QbGF0Zm9ybSA9IGdsb2JhbC5QbGF0Zm9ybSB8fCB7fTtcblxuICBnbG9iYWwuUGxhdGZvcm0ucGVyZm9ybU1pY3JvdGFza0NoZWNrcG9pbnQgPSBmdW5jdGlvbigpIHtcbiAgICBpZiAocnVubmluZ01pY3JvdGFza0NoZWNrcG9pbnQpXG4gICAgICByZXR1cm47XG5cbiAgICBpZiAoaGFzRGVidWdGb3JjZUZ1bGxEZWxpdmVyeSkge1xuICAgICAgZXZhbCgnJVJ1bk1pY3JvdGFza3MoKScpO1xuICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIGlmICghY29sbGVjdE9ic2VydmVycylcbiAgICAgIHJldHVybjtcblxuICAgIHJ1bm5pbmdNaWNyb3Rhc2tDaGVja3BvaW50ID0gdHJ1ZTtcblxuICAgIHZhciBjeWNsZXMgPSAwO1xuICAgIHZhciBhbnlDaGFuZ2VkLCB0b0NoZWNrO1xuXG4gICAgZG8ge1xuICAgICAgY3ljbGVzKys7XG4gICAgICB0b0NoZWNrID0gYWxsT2JzZXJ2ZXJzO1xuICAgICAgYWxsT2JzZXJ2ZXJzID0gW107XG4gICAgICBhbnlDaGFuZ2VkID0gZmFsc2U7XG5cbiAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgdG9DaGVjay5sZW5ndGg7IGkrKykge1xuICAgICAgICB2YXIgb2JzZXJ2ZXIgPSB0b0NoZWNrW2ldO1xuICAgICAgICBpZiAob2JzZXJ2ZXIuc3RhdGVfICE9IE9QRU5FRClcbiAgICAgICAgICBjb250aW51ZTtcblxuICAgICAgICBpZiAob2JzZXJ2ZXIuY2hlY2tfKCkpXG4gICAgICAgICAgYW55Q2hhbmdlZCA9IHRydWU7XG5cbiAgICAgICAgYWxsT2JzZXJ2ZXJzLnB1c2gob2JzZXJ2ZXIpO1xuICAgICAgfVxuICAgICAgaWYgKHJ1bkVPTVRhc2tzKCkpXG4gICAgICAgIGFueUNoYW5nZWQgPSB0cnVlO1xuICAgIH0gd2hpbGUgKGN5Y2xlcyA8IE1BWF9ESVJUWV9DSEVDS19DWUNMRVMgJiYgYW55Q2hhbmdlZCk7XG5cbiAgICBpZiAodGVzdGluZ0V4cG9zZUN5Y2xlQ291bnQpXG4gICAgICBnbG9iYWwuZGlydHlDaGVja0N5Y2xlQ291bnQgPSBjeWNsZXM7XG5cbiAgICBydW5uaW5nTWljcm90YXNrQ2hlY2twb2ludCA9IGZhbHNlO1xuICB9O1xuXG4gIGlmIChjb2xsZWN0T2JzZXJ2ZXJzKSB7XG4gICAgZ2xvYmFsLlBsYXRmb3JtLmNsZWFyT2JzZXJ2ZXJzID0gZnVuY3Rpb24oKSB7XG4gICAgICBhbGxPYnNlcnZlcnMgPSBbXTtcbiAgICB9O1xuICB9XG5cbiAgZnVuY3Rpb24gT2JqZWN0T2JzZXJ2ZXIob2JqZWN0KSB7XG4gICAgT2JzZXJ2ZXIuY2FsbCh0aGlzKTtcbiAgICB0aGlzLnZhbHVlXyA9IG9iamVjdDtcbiAgICB0aGlzLm9sZE9iamVjdF8gPSB1bmRlZmluZWQ7XG4gIH1cblxuICBPYmplY3RPYnNlcnZlci5wcm90b3R5cGUgPSBjcmVhdGVPYmplY3Qoe1xuICAgIF9fcHJvdG9fXzogT2JzZXJ2ZXIucHJvdG90eXBlLFxuXG4gICAgYXJyYXlPYnNlcnZlOiBmYWxzZSxcblxuICAgIGNvbm5lY3RfOiBmdW5jdGlvbihjYWxsYmFjaywgdGFyZ2V0KSB7XG4gICAgICBpZiAoaGFzT2JzZXJ2ZSkge1xuICAgICAgICB0aGlzLmRpcmVjdE9ic2VydmVyXyA9IGdldE9ic2VydmVkT2JqZWN0KHRoaXMsIHRoaXMudmFsdWVfLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMuYXJyYXlPYnNlcnZlKTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHRoaXMub2xkT2JqZWN0XyA9IHRoaXMuY29weU9iamVjdCh0aGlzLnZhbHVlXyk7XG4gICAgICB9XG5cbiAgICB9LFxuXG4gICAgY29weU9iamVjdDogZnVuY3Rpb24ob2JqZWN0KSB7XG4gICAgICB2YXIgY29weSA9IEFycmF5LmlzQXJyYXkob2JqZWN0KSA/IFtdIDoge307XG4gICAgICBmb3IgKHZhciBwcm9wIGluIG9iamVjdCkge1xuICAgICAgICBjb3B5W3Byb3BdID0gb2JqZWN0W3Byb3BdO1xuICAgICAgfTtcbiAgICAgIGlmIChBcnJheS5pc0FycmF5KG9iamVjdCkpXG4gICAgICAgIGNvcHkubGVuZ3RoID0gb2JqZWN0Lmxlbmd0aDtcbiAgICAgIHJldHVybiBjb3B5O1xuICAgIH0sXG5cbiAgICBjaGVja186IGZ1bmN0aW9uKGNoYW5nZVJlY29yZHMsIHNraXBDaGFuZ2VzKSB7XG4gICAgICB2YXIgZGlmZjtcbiAgICAgIHZhciBvbGRWYWx1ZXM7XG4gICAgICBpZiAoaGFzT2JzZXJ2ZSkge1xuICAgICAgICBpZiAoIWNoYW5nZVJlY29yZHMpXG4gICAgICAgICAgcmV0dXJuIGZhbHNlO1xuXG4gICAgICAgIG9sZFZhbHVlcyA9IHt9O1xuICAgICAgICBkaWZmID0gZGlmZk9iamVjdEZyb21DaGFuZ2VSZWNvcmRzKHRoaXMudmFsdWVfLCBjaGFuZ2VSZWNvcmRzLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG9sZFZhbHVlcyk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBvbGRWYWx1ZXMgPSB0aGlzLm9sZE9iamVjdF87XG4gICAgICAgIGRpZmYgPSBkaWZmT2JqZWN0RnJvbU9sZE9iamVjdCh0aGlzLnZhbHVlXywgdGhpcy5vbGRPYmplY3RfKTtcbiAgICAgIH1cblxuICAgICAgaWYgKGRpZmZJc0VtcHR5KGRpZmYpKVxuICAgICAgICByZXR1cm4gZmFsc2U7XG5cbiAgICAgIGlmICghaGFzT2JzZXJ2ZSlcbiAgICAgICAgdGhpcy5vbGRPYmplY3RfID0gdGhpcy5jb3B5T2JqZWN0KHRoaXMudmFsdWVfKTtcblxuICAgICAgdGhpcy5yZXBvcnRfKFtcbiAgICAgICAgZGlmZi5hZGRlZCB8fCB7fSxcbiAgICAgICAgZGlmZi5yZW1vdmVkIHx8IHt9LFxuICAgICAgICBkaWZmLmNoYW5nZWQgfHwge30sXG4gICAgICAgIGZ1bmN0aW9uKHByb3BlcnR5KSB7XG4gICAgICAgICAgcmV0dXJuIG9sZFZhbHVlc1twcm9wZXJ0eV07XG4gICAgICAgIH1cbiAgICAgIF0pO1xuXG4gICAgICByZXR1cm4gdHJ1ZTtcbiAgICB9LFxuXG4gICAgZGlzY29ubmVjdF86IGZ1bmN0aW9uKCkge1xuICAgICAgaWYgKGhhc09ic2VydmUpIHtcbiAgICAgICAgdGhpcy5kaXJlY3RPYnNlcnZlcl8uY2xvc2UoKTtcbiAgICAgICAgdGhpcy5kaXJlY3RPYnNlcnZlcl8gPSB1bmRlZmluZWQ7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICB0aGlzLm9sZE9iamVjdF8gPSB1bmRlZmluZWQ7XG4gICAgICB9XG4gICAgfSxcblxuICAgIGRlbGl2ZXI6IGZ1bmN0aW9uKCkge1xuICAgICAgaWYgKHRoaXMuc3RhdGVfICE9IE9QRU5FRClcbiAgICAgICAgcmV0dXJuO1xuXG4gICAgICBpZiAoaGFzT2JzZXJ2ZSlcbiAgICAgICAgdGhpcy5kaXJlY3RPYnNlcnZlcl8uZGVsaXZlcihmYWxzZSk7XG4gICAgICBlbHNlXG4gICAgICAgIGRpcnR5Q2hlY2sodGhpcyk7XG4gICAgfSxcblxuICAgIGRpc2NhcmRDaGFuZ2VzOiBmdW5jdGlvbigpIHtcbiAgICAgIGlmICh0aGlzLmRpcmVjdE9ic2VydmVyXylcbiAgICAgICAgdGhpcy5kaXJlY3RPYnNlcnZlcl8uZGVsaXZlcih0cnVlKTtcbiAgICAgIGVsc2VcbiAgICAgICAgdGhpcy5vbGRPYmplY3RfID0gdGhpcy5jb3B5T2JqZWN0KHRoaXMudmFsdWVfKTtcblxuICAgICAgcmV0dXJuIHRoaXMudmFsdWVfO1xuICAgIH1cbiAgfSk7XG5cbiAgZnVuY3Rpb24gQXJyYXlPYnNlcnZlcihhcnJheSkge1xuICAgIGlmICghQXJyYXkuaXNBcnJheShhcnJheSkpXG4gICAgICB0aHJvdyBFcnJvcignUHJvdmlkZWQgb2JqZWN0IGlzIG5vdCBhbiBBcnJheScpO1xuICAgIE9iamVjdE9ic2VydmVyLmNhbGwodGhpcywgYXJyYXkpO1xuICB9XG5cbiAgQXJyYXlPYnNlcnZlci5wcm90b3R5cGUgPSBjcmVhdGVPYmplY3Qoe1xuXG4gICAgX19wcm90b19fOiBPYmplY3RPYnNlcnZlci5wcm90b3R5cGUsXG5cbiAgICBhcnJheU9ic2VydmU6IHRydWUsXG5cbiAgICBjb3B5T2JqZWN0OiBmdW5jdGlvbihhcnIpIHtcbiAgICAgIHJldHVybiBhcnIuc2xpY2UoKTtcbiAgICB9LFxuXG4gICAgY2hlY2tfOiBmdW5jdGlvbihjaGFuZ2VSZWNvcmRzKSB7XG4gICAgICB2YXIgc3BsaWNlcztcbiAgICAgIGlmIChoYXNPYnNlcnZlKSB7XG4gICAgICAgIGlmICghY2hhbmdlUmVjb3JkcylcbiAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgIHNwbGljZXMgPSBwcm9qZWN0QXJyYXlTcGxpY2VzKHRoaXMudmFsdWVfLCBjaGFuZ2VSZWNvcmRzKTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHNwbGljZXMgPSBjYWxjU3BsaWNlcyh0aGlzLnZhbHVlXywgMCwgdGhpcy52YWx1ZV8ubGVuZ3RoLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5vbGRPYmplY3RfLCAwLCB0aGlzLm9sZE9iamVjdF8ubGVuZ3RoKTtcbiAgICAgIH1cblxuICAgICAgaWYgKCFzcGxpY2VzIHx8ICFzcGxpY2VzLmxlbmd0aClcbiAgICAgICAgcmV0dXJuIGZhbHNlO1xuXG4gICAgICBpZiAoIWhhc09ic2VydmUpXG4gICAgICAgIHRoaXMub2xkT2JqZWN0XyA9IHRoaXMuY29weU9iamVjdCh0aGlzLnZhbHVlXyk7XG5cbiAgICAgIHRoaXMucmVwb3J0Xyhbc3BsaWNlc10pO1xuICAgICAgcmV0dXJuIHRydWU7XG4gICAgfVxuICB9KTtcblxuICBBcnJheU9ic2VydmVyLmFwcGx5U3BsaWNlcyA9IGZ1bmN0aW9uKHByZXZpb3VzLCBjdXJyZW50LCBzcGxpY2VzKSB7XG4gICAgc3BsaWNlcy5mb3JFYWNoKGZ1bmN0aW9uKHNwbGljZSkge1xuICAgICAgdmFyIHNwbGljZUFyZ3MgPSBbc3BsaWNlLmluZGV4LCBzcGxpY2UucmVtb3ZlZC5sZW5ndGhdO1xuICAgICAgdmFyIGFkZEluZGV4ID0gc3BsaWNlLmluZGV4O1xuICAgICAgd2hpbGUgKGFkZEluZGV4IDwgc3BsaWNlLmluZGV4ICsgc3BsaWNlLmFkZGVkQ291bnQpIHtcbiAgICAgICAgc3BsaWNlQXJncy5wdXNoKGN1cnJlbnRbYWRkSW5kZXhdKTtcbiAgICAgICAgYWRkSW5kZXgrKztcbiAgICAgIH1cblxuICAgICAgQXJyYXkucHJvdG90eXBlLnNwbGljZS5hcHBseShwcmV2aW91cywgc3BsaWNlQXJncyk7XG4gICAgfSk7XG4gIH07XG5cbiAgZnVuY3Rpb24gUGF0aE9ic2VydmVyKG9iamVjdCwgcGF0aCkge1xuICAgIE9ic2VydmVyLmNhbGwodGhpcyk7XG5cbiAgICB0aGlzLm9iamVjdF8gPSBvYmplY3Q7XG4gICAgdGhpcy5wYXRoXyA9IGdldFBhdGgocGF0aCk7XG4gICAgdGhpcy5kaXJlY3RPYnNlcnZlcl8gPSB1bmRlZmluZWQ7XG4gIH1cblxuICBQYXRoT2JzZXJ2ZXIucHJvdG90eXBlID0gY3JlYXRlT2JqZWN0KHtcbiAgICBfX3Byb3RvX186IE9ic2VydmVyLnByb3RvdHlwZSxcblxuICAgIGdldCBwYXRoKCkge1xuICAgICAgcmV0dXJuIHRoaXMucGF0aF87XG4gICAgfSxcblxuICAgIGNvbm5lY3RfOiBmdW5jdGlvbigpIHtcbiAgICAgIGlmIChoYXNPYnNlcnZlKVxuICAgICAgICB0aGlzLmRpcmVjdE9ic2VydmVyXyA9IGdldE9ic2VydmVkU2V0KHRoaXMsIHRoaXMub2JqZWN0Xyk7XG5cbiAgICAgIHRoaXMuY2hlY2tfKHVuZGVmaW5lZCwgdHJ1ZSk7XG4gICAgfSxcblxuICAgIGRpc2Nvbm5lY3RfOiBmdW5jdGlvbigpIHtcbiAgICAgIHRoaXMudmFsdWVfID0gdW5kZWZpbmVkO1xuXG4gICAgICBpZiAodGhpcy5kaXJlY3RPYnNlcnZlcl8pIHtcbiAgICAgICAgdGhpcy5kaXJlY3RPYnNlcnZlcl8uY2xvc2UodGhpcyk7XG4gICAgICAgIHRoaXMuZGlyZWN0T2JzZXJ2ZXJfID0gdW5kZWZpbmVkO1xuICAgICAgfVxuICAgIH0sXG5cbiAgICBpdGVyYXRlT2JqZWN0c186IGZ1bmN0aW9uKG9ic2VydmUpIHtcbiAgICAgIHRoaXMucGF0aF8uaXRlcmF0ZU9iamVjdHModGhpcy5vYmplY3RfLCBvYnNlcnZlKTtcbiAgICB9LFxuXG4gICAgY2hlY2tfOiBmdW5jdGlvbihjaGFuZ2VSZWNvcmRzLCBza2lwQ2hhbmdlcykge1xuICAgICAgdmFyIG9sZFZhbHVlID0gdGhpcy52YWx1ZV87XG4gICAgICB0aGlzLnZhbHVlXyA9IHRoaXMucGF0aF8uZ2V0VmFsdWVGcm9tKHRoaXMub2JqZWN0Xyk7XG4gICAgICBpZiAoc2tpcENoYW5nZXMgfHwgYXJlU2FtZVZhbHVlKHRoaXMudmFsdWVfLCBvbGRWYWx1ZSkpXG4gICAgICAgIHJldHVybiBmYWxzZTtcblxuICAgICAgdGhpcy5yZXBvcnRfKFt0aGlzLnZhbHVlXywgb2xkVmFsdWUsIHRoaXNdKTtcbiAgICAgIHJldHVybiB0cnVlO1xuICAgIH0sXG5cbiAgICBzZXRWYWx1ZTogZnVuY3Rpb24obmV3VmFsdWUpIHtcbiAgICAgIGlmICh0aGlzLnBhdGhfKVxuICAgICAgICB0aGlzLnBhdGhfLnNldFZhbHVlRnJvbSh0aGlzLm9iamVjdF8sIG5ld1ZhbHVlKTtcbiAgICB9XG4gIH0pO1xuXG4gIGZ1bmN0aW9uIENvbXBvdW5kT2JzZXJ2ZXIocmVwb3J0Q2hhbmdlc09uT3Blbikge1xuICAgIE9ic2VydmVyLmNhbGwodGhpcyk7XG5cbiAgICB0aGlzLnJlcG9ydENoYW5nZXNPbk9wZW5fID0gcmVwb3J0Q2hhbmdlc09uT3BlbjtcbiAgICB0aGlzLnZhbHVlXyA9IFtdO1xuICAgIHRoaXMuZGlyZWN0T2JzZXJ2ZXJfID0gdW5kZWZpbmVkO1xuICAgIHRoaXMub2JzZXJ2ZWRfID0gW107XG4gIH1cblxuICB2YXIgb2JzZXJ2ZXJTZW50aW5lbCA9IHt9O1xuXG4gIENvbXBvdW5kT2JzZXJ2ZXIucHJvdG90eXBlID0gY3JlYXRlT2JqZWN0KHtcbiAgICBfX3Byb3RvX186IE9ic2VydmVyLnByb3RvdHlwZSxcblxuICAgIGNvbm5lY3RfOiBmdW5jdGlvbigpIHtcbiAgICAgIGlmIChoYXNPYnNlcnZlKSB7XG4gICAgICAgIHZhciBvYmplY3Q7XG4gICAgICAgIHZhciBuZWVkc0RpcmVjdE9ic2VydmVyID0gZmFsc2U7XG4gICAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgdGhpcy5vYnNlcnZlZF8ubGVuZ3RoOyBpICs9IDIpIHtcbiAgICAgICAgICBvYmplY3QgPSB0aGlzLm9ic2VydmVkX1tpXVxuICAgICAgICAgIGlmIChvYmplY3QgIT09IG9ic2VydmVyU2VudGluZWwpIHtcbiAgICAgICAgICAgIG5lZWRzRGlyZWN0T2JzZXJ2ZXIgPSB0cnVlO1xuICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgaWYgKG5lZWRzRGlyZWN0T2JzZXJ2ZXIpXG4gICAgICAgICAgdGhpcy5kaXJlY3RPYnNlcnZlcl8gPSBnZXRPYnNlcnZlZFNldCh0aGlzLCBvYmplY3QpO1xuICAgICAgfVxuXG4gICAgICB0aGlzLmNoZWNrXyh1bmRlZmluZWQsICF0aGlzLnJlcG9ydENoYW5nZXNPbk9wZW5fKTtcbiAgICB9LFxuXG4gICAgZGlzY29ubmVjdF86IGZ1bmN0aW9uKCkge1xuICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCB0aGlzLm9ic2VydmVkXy5sZW5ndGg7IGkgKz0gMikge1xuICAgICAgICBpZiAodGhpcy5vYnNlcnZlZF9baV0gPT09IG9ic2VydmVyU2VudGluZWwpXG4gICAgICAgICAgdGhpcy5vYnNlcnZlZF9baSArIDFdLmNsb3NlKCk7XG4gICAgICB9XG4gICAgICB0aGlzLm9ic2VydmVkXy5sZW5ndGggPSAwO1xuICAgICAgdGhpcy52YWx1ZV8ubGVuZ3RoID0gMDtcblxuICAgICAgaWYgKHRoaXMuZGlyZWN0T2JzZXJ2ZXJfKSB7XG4gICAgICAgIHRoaXMuZGlyZWN0T2JzZXJ2ZXJfLmNsb3NlKHRoaXMpO1xuICAgICAgICB0aGlzLmRpcmVjdE9ic2VydmVyXyA9IHVuZGVmaW5lZDtcbiAgICAgIH1cbiAgICB9LFxuXG4gICAgYWRkUGF0aDogZnVuY3Rpb24ob2JqZWN0LCBwYXRoKSB7XG4gICAgICBpZiAodGhpcy5zdGF0ZV8gIT0gVU5PUEVORUQgJiYgdGhpcy5zdGF0ZV8gIT0gUkVTRVRUSU5HKVxuICAgICAgICB0aHJvdyBFcnJvcignQ2Fubm90IGFkZCBwYXRocyBvbmNlIHN0YXJ0ZWQuJyk7XG5cbiAgICAgIHZhciBwYXRoID0gZ2V0UGF0aChwYXRoKTtcbiAgICAgIHRoaXMub2JzZXJ2ZWRfLnB1c2gob2JqZWN0LCBwYXRoKTtcbiAgICAgIGlmICghdGhpcy5yZXBvcnRDaGFuZ2VzT25PcGVuXylcbiAgICAgICAgcmV0dXJuO1xuICAgICAgdmFyIGluZGV4ID0gdGhpcy5vYnNlcnZlZF8ubGVuZ3RoIC8gMiAtIDE7XG4gICAgICB0aGlzLnZhbHVlX1tpbmRleF0gPSBwYXRoLmdldFZhbHVlRnJvbShvYmplY3QpO1xuICAgIH0sXG5cbiAgICBhZGRPYnNlcnZlcjogZnVuY3Rpb24ob2JzZXJ2ZXIpIHtcbiAgICAgIGlmICh0aGlzLnN0YXRlXyAhPSBVTk9QRU5FRCAmJiB0aGlzLnN0YXRlXyAhPSBSRVNFVFRJTkcpXG4gICAgICAgIHRocm93IEVycm9yKCdDYW5ub3QgYWRkIG9ic2VydmVycyBvbmNlIHN0YXJ0ZWQuJyk7XG5cbiAgICAgIHRoaXMub2JzZXJ2ZWRfLnB1c2gob2JzZXJ2ZXJTZW50aW5lbCwgb2JzZXJ2ZXIpO1xuICAgICAgaWYgKCF0aGlzLnJlcG9ydENoYW5nZXNPbk9wZW5fKVxuICAgICAgICByZXR1cm47XG4gICAgICB2YXIgaW5kZXggPSB0aGlzLm9ic2VydmVkXy5sZW5ndGggLyAyIC0gMTtcbiAgICAgIHRoaXMudmFsdWVfW2luZGV4XSA9IG9ic2VydmVyLm9wZW4odGhpcy5kZWxpdmVyLCB0aGlzKTtcbiAgICB9LFxuXG4gICAgc3RhcnRSZXNldDogZnVuY3Rpb24oKSB7XG4gICAgICBpZiAodGhpcy5zdGF0ZV8gIT0gT1BFTkVEKVxuICAgICAgICB0aHJvdyBFcnJvcignQ2FuIG9ubHkgcmVzZXQgd2hpbGUgb3BlbicpO1xuXG4gICAgICB0aGlzLnN0YXRlXyA9IFJFU0VUVElORztcbiAgICAgIHRoaXMuZGlzY29ubmVjdF8oKTtcbiAgICB9LFxuXG4gICAgZmluaXNoUmVzZXQ6IGZ1bmN0aW9uKCkge1xuICAgICAgaWYgKHRoaXMuc3RhdGVfICE9IFJFU0VUVElORylcbiAgICAgICAgdGhyb3cgRXJyb3IoJ0NhbiBvbmx5IGZpbmlzaFJlc2V0IGFmdGVyIHN0YXJ0UmVzZXQnKTtcbiAgICAgIHRoaXMuc3RhdGVfID0gT1BFTkVEO1xuICAgICAgdGhpcy5jb25uZWN0XygpO1xuXG4gICAgICByZXR1cm4gdGhpcy52YWx1ZV87XG4gICAgfSxcblxuICAgIGl0ZXJhdGVPYmplY3RzXzogZnVuY3Rpb24ob2JzZXJ2ZSkge1xuICAgICAgdmFyIG9iamVjdDtcbiAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgdGhpcy5vYnNlcnZlZF8ubGVuZ3RoOyBpICs9IDIpIHtcbiAgICAgICAgb2JqZWN0ID0gdGhpcy5vYnNlcnZlZF9baV1cbiAgICAgICAgaWYgKG9iamVjdCAhPT0gb2JzZXJ2ZXJTZW50aW5lbClcbiAgICAgICAgICB0aGlzLm9ic2VydmVkX1tpICsgMV0uaXRlcmF0ZU9iamVjdHMob2JqZWN0LCBvYnNlcnZlKVxuICAgICAgfVxuICAgIH0sXG5cbiAgICBjaGVja186IGZ1bmN0aW9uKGNoYW5nZVJlY29yZHMsIHNraXBDaGFuZ2VzKSB7XG4gICAgICB2YXIgb2xkVmFsdWVzO1xuICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCB0aGlzLm9ic2VydmVkXy5sZW5ndGg7IGkgKz0gMikge1xuICAgICAgICB2YXIgb2JqZWN0ID0gdGhpcy5vYnNlcnZlZF9baV07XG4gICAgICAgIHZhciBwYXRoID0gdGhpcy5vYnNlcnZlZF9baSsxXTtcbiAgICAgICAgdmFyIHZhbHVlO1xuICAgICAgICBpZiAob2JqZWN0ID09PSBvYnNlcnZlclNlbnRpbmVsKSB7XG4gICAgICAgICAgdmFyIG9ic2VydmFibGUgPSBwYXRoO1xuICAgICAgICAgIHZhbHVlID0gdGhpcy5zdGF0ZV8gPT09IFVOT1BFTkVEID9cbiAgICAgICAgICAgICAgb2JzZXJ2YWJsZS5vcGVuKHRoaXMuZGVsaXZlciwgdGhpcykgOlxuICAgICAgICAgICAgICBvYnNlcnZhYmxlLmRpc2NhcmRDaGFuZ2VzKCk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgdmFsdWUgPSBwYXRoLmdldFZhbHVlRnJvbShvYmplY3QpO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKHNraXBDaGFuZ2VzKSB7XG4gICAgICAgICAgdGhpcy52YWx1ZV9baSAvIDJdID0gdmFsdWU7XG4gICAgICAgICAgY29udGludWU7XG4gICAgICAgIH1cblxuICAgICAgICBpZiAoYXJlU2FtZVZhbHVlKHZhbHVlLCB0aGlzLnZhbHVlX1tpIC8gMl0pKVxuICAgICAgICAgIGNvbnRpbnVlO1xuXG4gICAgICAgIG9sZFZhbHVlcyA9IG9sZFZhbHVlcyB8fCBbXTtcbiAgICAgICAgb2xkVmFsdWVzW2kgLyAyXSA9IHRoaXMudmFsdWVfW2kgLyAyXTtcbiAgICAgICAgdGhpcy52YWx1ZV9baSAvIDJdID0gdmFsdWU7XG4gICAgICB9XG5cbiAgICAgIGlmICghb2xkVmFsdWVzKVxuICAgICAgICByZXR1cm4gZmFsc2U7XG5cbiAgICAgIC8vIFRPRE8ocmFmYWVsdyk6IEhhdmluZyBvYnNlcnZlZF8gYXMgdGhlIHRoaXJkIGNhbGxiYWNrIGFyZyBoZXJlIGlzXG4gICAgICAvLyBwcmV0dHkgbGFtZSBBUEkuIEZpeC5cbiAgICAgIHRoaXMucmVwb3J0XyhbdGhpcy52YWx1ZV8sIG9sZFZhbHVlcywgdGhpcy5vYnNlcnZlZF9dKTtcbiAgICAgIHJldHVybiB0cnVlO1xuICAgIH1cbiAgfSk7XG5cbiAgZnVuY3Rpb24gaWRlbnRGbih2YWx1ZSkgeyByZXR1cm4gdmFsdWU7IH1cblxuICBmdW5jdGlvbiBPYnNlcnZlclRyYW5zZm9ybShvYnNlcnZhYmxlLCBnZXRWYWx1ZUZuLCBzZXRWYWx1ZUZuLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICBkb250UGFzc1Rocm91Z2hTZXQpIHtcbiAgICB0aGlzLmNhbGxiYWNrXyA9IHVuZGVmaW5lZDtcbiAgICB0aGlzLnRhcmdldF8gPSB1bmRlZmluZWQ7XG4gICAgdGhpcy52YWx1ZV8gPSB1bmRlZmluZWQ7XG4gICAgdGhpcy5vYnNlcnZhYmxlXyA9IG9ic2VydmFibGU7XG4gICAgdGhpcy5nZXRWYWx1ZUZuXyA9IGdldFZhbHVlRm4gfHwgaWRlbnRGbjtcbiAgICB0aGlzLnNldFZhbHVlRm5fID0gc2V0VmFsdWVGbiB8fCBpZGVudEZuO1xuICAgIC8vIFRPRE8ocmFmYWVsdyk6IFRoaXMgaXMgYSB0ZW1wb3JhcnkgaGFjay4gUG9seW1lckV4cHJlc3Npb25zIG5lZWRzIHRoaXNcbiAgICAvLyBhdCB0aGUgbW9tZW50IGJlY2F1c2Ugb2YgYSBidWcgaW4gaXQnc2llc3RhIGRlcGVuZGVuY3kgdHJhY2tpbmcuXG4gICAgdGhpcy5kb250UGFzc1Rocm91Z2hTZXRfID0gZG9udFBhc3NUaHJvdWdoU2V0O1xuICB9XG5cbiAgT2JzZXJ2ZXJUcmFuc2Zvcm0ucHJvdG90eXBlID0ge1xuICAgIG9wZW46IGZ1bmN0aW9uKGNhbGxiYWNrLCB0YXJnZXQpIHtcbiAgICAgIHRoaXMuY2FsbGJhY2tfID0gY2FsbGJhY2s7XG4gICAgICB0aGlzLnRhcmdldF8gPSB0YXJnZXQ7XG4gICAgICB0aGlzLnZhbHVlXyA9XG4gICAgICAgICAgdGhpcy5nZXRWYWx1ZUZuXyh0aGlzLm9ic2VydmFibGVfLm9wZW4odGhpcy5vYnNlcnZlZENhbGxiYWNrXywgdGhpcykpO1xuICAgICAgcmV0dXJuIHRoaXMudmFsdWVfO1xuICAgIH0sXG5cbiAgICBvYnNlcnZlZENhbGxiYWNrXzogZnVuY3Rpb24odmFsdWUpIHtcbiAgICAgIHZhbHVlID0gdGhpcy5nZXRWYWx1ZUZuXyh2YWx1ZSk7XG4gICAgICBpZiAoYXJlU2FtZVZhbHVlKHZhbHVlLCB0aGlzLnZhbHVlXykpXG4gICAgICAgIHJldHVybjtcbiAgICAgIHZhciBvbGRWYWx1ZSA9IHRoaXMudmFsdWVfO1xuICAgICAgdGhpcy52YWx1ZV8gPSB2YWx1ZTtcbiAgICAgIHRoaXMuY2FsbGJhY2tfLmNhbGwodGhpcy50YXJnZXRfLCB0aGlzLnZhbHVlXywgb2xkVmFsdWUpO1xuICAgIH0sXG5cbiAgICBkaXNjYXJkQ2hhbmdlczogZnVuY3Rpb24oKSB7XG4gICAgICB0aGlzLnZhbHVlXyA9IHRoaXMuZ2V0VmFsdWVGbl8odGhpcy5vYnNlcnZhYmxlXy5kaXNjYXJkQ2hhbmdlcygpKTtcbiAgICAgIHJldHVybiB0aGlzLnZhbHVlXztcbiAgICB9LFxuXG4gICAgZGVsaXZlcjogZnVuY3Rpb24oKSB7XG4gICAgICByZXR1cm4gdGhpcy5vYnNlcnZhYmxlXy5kZWxpdmVyKCk7XG4gICAgfSxcblxuICAgIHNldFZhbHVlOiBmdW5jdGlvbih2YWx1ZSkge1xuICAgICAgdmFsdWUgPSB0aGlzLnNldFZhbHVlRm5fKHZhbHVlKTtcbiAgICAgIGlmICghdGhpcy5kb250UGFzc1Rocm91Z2hTZXRfICYmIHRoaXMub2JzZXJ2YWJsZV8uc2V0VmFsdWUpXG4gICAgICAgIHJldHVybiB0aGlzLm9ic2VydmFibGVfLnNldFZhbHVlKHZhbHVlKTtcbiAgICB9LFxuXG4gICAgY2xvc2U6IGZ1bmN0aW9uKCkge1xuICAgICAgaWYgKHRoaXMub2JzZXJ2YWJsZV8pXG4gICAgICAgIHRoaXMub2JzZXJ2YWJsZV8uY2xvc2UoKTtcbiAgICAgIHRoaXMuY2FsbGJhY2tfID0gdW5kZWZpbmVkO1xuICAgICAgdGhpcy50YXJnZXRfID0gdW5kZWZpbmVkO1xuICAgICAgdGhpcy5vYnNlcnZhYmxlXyA9IHVuZGVmaW5lZDtcbiAgICAgIHRoaXMudmFsdWVfID0gdW5kZWZpbmVkO1xuICAgICAgdGhpcy5nZXRWYWx1ZUZuXyA9IHVuZGVmaW5lZDtcbiAgICAgIHRoaXMuc2V0VmFsdWVGbl8gPSB1bmRlZmluZWQ7XG4gICAgfVxuICB9XG5cbiAgdmFyIGV4cGVjdGVkUmVjb3JkVHlwZXMgPSB7XG4gICAgYWRkOiB0cnVlLFxuICAgIHVwZGF0ZTogdHJ1ZSxcbiAgICBkZWxldGU6IHRydWVcbiAgfTtcblxuICBmdW5jdGlvbiBkaWZmT2JqZWN0RnJvbUNoYW5nZVJlY29yZHMob2JqZWN0LCBjaGFuZ2VSZWNvcmRzLCBvbGRWYWx1ZXMpIHtcbiAgICB2YXIgYWRkZWQgPSB7fTtcbiAgICB2YXIgcmVtb3ZlZCA9IHt9O1xuXG4gICAgZm9yICh2YXIgaSA9IDA7IGkgPCBjaGFuZ2VSZWNvcmRzLmxlbmd0aDsgaSsrKSB7XG4gICAgICB2YXIgcmVjb3JkID0gY2hhbmdlUmVjb3Jkc1tpXTtcbiAgICAgIGlmICghZXhwZWN0ZWRSZWNvcmRUeXBlc1tyZWNvcmQudHlwZV0pIHtcbiAgICAgICAgY29uc29sZS5lcnJvcignVW5rbm93biBjaGFuZ2VSZWNvcmQgdHlwZTogJyArIHJlY29yZC50eXBlKTtcbiAgICAgICAgY29uc29sZS5lcnJvcihyZWNvcmQpO1xuICAgICAgICBjb250aW51ZTtcbiAgICAgIH1cblxuICAgICAgaWYgKCEocmVjb3JkLm5hbWUgaW4gb2xkVmFsdWVzKSlcbiAgICAgICAgb2xkVmFsdWVzW3JlY29yZC5uYW1lXSA9IHJlY29yZC5vbGRWYWx1ZTtcblxuICAgICAgaWYgKHJlY29yZC50eXBlID09ICd1cGRhdGUnKVxuICAgICAgICBjb250aW51ZTtcblxuICAgICAgaWYgKHJlY29yZC50eXBlID09ICdhZGQnKSB7XG4gICAgICAgIGlmIChyZWNvcmQubmFtZSBpbiByZW1vdmVkKVxuICAgICAgICAgIGRlbGV0ZSByZW1vdmVkW3JlY29yZC5uYW1lXTtcbiAgICAgICAgZWxzZVxuICAgICAgICAgIGFkZGVkW3JlY29yZC5uYW1lXSA9IHRydWU7XG5cbiAgICAgICAgY29udGludWU7XG4gICAgICB9XG5cbiAgICAgIC8vIHR5cGUgPSAnZGVsZXRlJ1xuICAgICAgaWYgKHJlY29yZC5uYW1lIGluIGFkZGVkKSB7XG4gICAgICAgIGRlbGV0ZSBhZGRlZFtyZWNvcmQubmFtZV07XG4gICAgICAgIGRlbGV0ZSBvbGRWYWx1ZXNbcmVjb3JkLm5hbWVdO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgcmVtb3ZlZFtyZWNvcmQubmFtZV0gPSB0cnVlO1xuICAgICAgfVxuICAgIH1cblxuICAgIGZvciAodmFyIHByb3AgaW4gYWRkZWQpXG4gICAgICBhZGRlZFtwcm9wXSA9IG9iamVjdFtwcm9wXTtcblxuICAgIGZvciAodmFyIHByb3AgaW4gcmVtb3ZlZClcbiAgICAgIHJlbW92ZWRbcHJvcF0gPSB1bmRlZmluZWQ7XG5cbiAgICB2YXIgY2hhbmdlZCA9IHt9O1xuICAgIGZvciAodmFyIHByb3AgaW4gb2xkVmFsdWVzKSB7XG4gICAgICBpZiAocHJvcCBpbiBhZGRlZCB8fCBwcm9wIGluIHJlbW92ZWQpXG4gICAgICAgIGNvbnRpbnVlO1xuXG4gICAgICB2YXIgbmV3VmFsdWUgPSBvYmplY3RbcHJvcF07XG4gICAgICBpZiAob2xkVmFsdWVzW3Byb3BdICE9PSBuZXdWYWx1ZSlcbiAgICAgICAgY2hhbmdlZFtwcm9wXSA9IG5ld1ZhbHVlO1xuICAgIH1cblxuICAgIHJldHVybiB7XG4gICAgICBhZGRlZDogYWRkZWQsXG4gICAgICByZW1vdmVkOiByZW1vdmVkLFxuICAgICAgY2hhbmdlZDogY2hhbmdlZFxuICAgIH07XG4gIH1cblxuICBmdW5jdGlvbiBuZXdTcGxpY2UoaW5kZXgsIHJlbW92ZWQsIGFkZGVkQ291bnQpIHtcbiAgICByZXR1cm4ge1xuICAgICAgaW5kZXg6IGluZGV4LFxuICAgICAgcmVtb3ZlZDogcmVtb3ZlZCxcbiAgICAgIGFkZGVkQ291bnQ6IGFkZGVkQ291bnRcbiAgICB9O1xuICB9XG5cbiAgdmFyIEVESVRfTEVBVkUgPSAwO1xuICB2YXIgRURJVF9VUERBVEUgPSAxO1xuICB2YXIgRURJVF9BREQgPSAyO1xuICB2YXIgRURJVF9ERUxFVEUgPSAzO1xuXG4gIGZ1bmN0aW9uIEFycmF5U3BsaWNlKCkge31cblxuICBBcnJheVNwbGljZS5wcm90b3R5cGUgPSB7XG5cbiAgICAvLyBOb3RlOiBUaGlzIGZ1bmN0aW9uIGlzICpiYXNlZCogb24gdGhlIGNvbXB1dGF0aW9uIG9mIHRoZSBMZXZlbnNodGVpblxuICAgIC8vIFwiZWRpdFwiIGRpc3RhbmNlLiBUaGUgb25lIGNoYW5nZSBpcyB0aGF0IFwidXBkYXRlc1wiIGFyZSB0cmVhdGVkIGFzIHR3b1xuICAgIC8vIGVkaXRzIC0gbm90IG9uZS4gV2l0aCBBcnJheSBzcGxpY2VzLCBhbiB1cGRhdGUgaXMgcmVhbGx5IGEgZGVsZXRlXG4gICAgLy8gZm9sbG93ZWQgYnkgYW4gYWRkLiBCeSByZXRhaW5pbmcgdGhpcywgd2Ugb3B0aW1pemUgZm9yIFwia2VlcGluZ1wiIHRoZVxuICAgIC8vIG1heGltdW0gYXJyYXkgaXRlbXMgaW4gdGhlIG9yaWdpbmFsIGFycmF5LiBGb3IgZXhhbXBsZTpcbiAgICAvL1xuICAgIC8vICAgJ3h4eHgxMjMnIC0+ICcxMjN5eXl5J1xuICAgIC8vXG4gICAgLy8gV2l0aCAxLWVkaXQgdXBkYXRlcywgdGhlIHNob3J0ZXN0IHBhdGggd291bGQgYmUganVzdCB0byB1cGRhdGUgYWxsIHNldmVuXG4gICAgLy8gY2hhcmFjdGVycy4gV2l0aCAyLWVkaXQgdXBkYXRlcywgd2UgZGVsZXRlIDQsIGxlYXZlIDMsIGFuZCBhZGQgNC4gVGhpc1xuICAgIC8vIGxlYXZlcyB0aGUgc3Vic3RyaW5nICcxMjMnIGludGFjdC5cbiAgICBjYWxjRWRpdERpc3RhbmNlczogZnVuY3Rpb24oY3VycmVudCwgY3VycmVudFN0YXJ0LCBjdXJyZW50RW5kLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBvbGQsIG9sZFN0YXJ0LCBvbGRFbmQpIHtcbiAgICAgIC8vIFwiRGVsZXRpb25cIiBjb2x1bW5zXG4gICAgICB2YXIgcm93Q291bnQgPSBvbGRFbmQgLSBvbGRTdGFydCArIDE7XG4gICAgICB2YXIgY29sdW1uQ291bnQgPSBjdXJyZW50RW5kIC0gY3VycmVudFN0YXJ0ICsgMTtcbiAgICAgIHZhciBkaXN0YW5jZXMgPSBuZXcgQXJyYXkocm93Q291bnQpO1xuXG4gICAgICAvLyBcIkFkZGl0aW9uXCIgcm93cy4gSW5pdGlhbGl6ZSBudWxsIGNvbHVtbi5cbiAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgcm93Q291bnQ7IGkrKykge1xuICAgICAgICBkaXN0YW5jZXNbaV0gPSBuZXcgQXJyYXkoY29sdW1uQ291bnQpO1xuICAgICAgICBkaXN0YW5jZXNbaV1bMF0gPSBpO1xuICAgICAgfVxuXG4gICAgICAvLyBJbml0aWFsaXplIG51bGwgcm93XG4gICAgICBmb3IgKHZhciBqID0gMDsgaiA8IGNvbHVtbkNvdW50OyBqKyspXG4gICAgICAgIGRpc3RhbmNlc1swXVtqXSA9IGo7XG5cbiAgICAgIGZvciAodmFyIGkgPSAxOyBpIDwgcm93Q291bnQ7IGkrKykge1xuICAgICAgICBmb3IgKHZhciBqID0gMTsgaiA8IGNvbHVtbkNvdW50OyBqKyspIHtcbiAgICAgICAgICBpZiAodGhpcy5lcXVhbHMoY3VycmVudFtjdXJyZW50U3RhcnQgKyBqIC0gMV0sIG9sZFtvbGRTdGFydCArIGkgLSAxXSkpXG4gICAgICAgICAgICBkaXN0YW5jZXNbaV1bal0gPSBkaXN0YW5jZXNbaSAtIDFdW2ogLSAxXTtcbiAgICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgIHZhciBub3J0aCA9IGRpc3RhbmNlc1tpIC0gMV1bal0gKyAxO1xuICAgICAgICAgICAgdmFyIHdlc3QgPSBkaXN0YW5jZXNbaV1baiAtIDFdICsgMTtcbiAgICAgICAgICAgIGRpc3RhbmNlc1tpXVtqXSA9IG5vcnRoIDwgd2VzdCA/IG5vcnRoIDogd2VzdDtcbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgIH1cblxuICAgICAgcmV0dXJuIGRpc3RhbmNlcztcbiAgICB9LFxuXG4gICAgLy8gVGhpcyBzdGFydHMgYXQgdGhlIGZpbmFsIHdlaWdodCwgYW5kIHdhbGtzIFwiYmFja3dhcmRcIiBieSBmaW5kaW5nXG4gICAgLy8gdGhlIG1pbmltdW0gcHJldmlvdXMgd2VpZ2h0IHJlY3Vyc2l2ZWx5IHVudGlsIHRoZSBvcmlnaW4gb2YgdGhlIHdlaWdodFxuICAgIC8vIG1hdHJpeC5cbiAgICBzcGxpY2VPcGVyYXRpb25zRnJvbUVkaXREaXN0YW5jZXM6IGZ1bmN0aW9uKGRpc3RhbmNlcykge1xuICAgICAgdmFyIGkgPSBkaXN0YW5jZXMubGVuZ3RoIC0gMTtcbiAgICAgIHZhciBqID0gZGlzdGFuY2VzWzBdLmxlbmd0aCAtIDE7XG4gICAgICB2YXIgY3VycmVudCA9IGRpc3RhbmNlc1tpXVtqXTtcbiAgICAgIHZhciBlZGl0cyA9IFtdO1xuICAgICAgd2hpbGUgKGkgPiAwIHx8IGogPiAwKSB7XG4gICAgICAgIGlmIChpID09IDApIHtcbiAgICAgICAgICBlZGl0cy5wdXNoKEVESVRfQUREKTtcbiAgICAgICAgICBqLS07XG4gICAgICAgICAgY29udGludWU7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKGogPT0gMCkge1xuICAgICAgICAgIGVkaXRzLnB1c2goRURJVF9ERUxFVEUpO1xuICAgICAgICAgIGktLTtcbiAgICAgICAgICBjb250aW51ZTtcbiAgICAgICAgfVxuICAgICAgICB2YXIgbm9ydGhXZXN0ID0gZGlzdGFuY2VzW2kgLSAxXVtqIC0gMV07XG4gICAgICAgIHZhciB3ZXN0ID0gZGlzdGFuY2VzW2kgLSAxXVtqXTtcbiAgICAgICAgdmFyIG5vcnRoID0gZGlzdGFuY2VzW2ldW2ogLSAxXTtcblxuICAgICAgICB2YXIgbWluO1xuICAgICAgICBpZiAod2VzdCA8IG5vcnRoKVxuICAgICAgICAgIG1pbiA9IHdlc3QgPCBub3J0aFdlc3QgPyB3ZXN0IDogbm9ydGhXZXN0O1xuICAgICAgICBlbHNlXG4gICAgICAgICAgbWluID0gbm9ydGggPCBub3J0aFdlc3QgPyBub3J0aCA6IG5vcnRoV2VzdDtcblxuICAgICAgICBpZiAobWluID09IG5vcnRoV2VzdCkge1xuICAgICAgICAgIGlmIChub3J0aFdlc3QgPT0gY3VycmVudCkge1xuICAgICAgICAgICAgZWRpdHMucHVzaChFRElUX0xFQVZFKTtcbiAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgZWRpdHMucHVzaChFRElUX1VQREFURSk7XG4gICAgICAgICAgICBjdXJyZW50ID0gbm9ydGhXZXN0O1xuICAgICAgICAgIH1cbiAgICAgICAgICBpLS07XG4gICAgICAgICAgai0tO1xuICAgICAgICB9IGVsc2UgaWYgKG1pbiA9PSB3ZXN0KSB7XG4gICAgICAgICAgZWRpdHMucHVzaChFRElUX0RFTEVURSk7XG4gICAgICAgICAgaS0tO1xuICAgICAgICAgIGN1cnJlbnQgPSB3ZXN0O1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIGVkaXRzLnB1c2goRURJVF9BREQpO1xuICAgICAgICAgIGotLTtcbiAgICAgICAgICBjdXJyZW50ID0gbm9ydGg7XG4gICAgICAgIH1cbiAgICAgIH1cblxuICAgICAgZWRpdHMucmV2ZXJzZSgpO1xuICAgICAgcmV0dXJuIGVkaXRzO1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBTcGxpY2UgUHJvamVjdGlvbiBmdW5jdGlvbnM6XG4gICAgICpcbiAgICAgKiBBIHNwbGljZSBtYXAgaXMgYSByZXByZXNlbnRhdGlvbiBvZiBob3cgYSBwcmV2aW91cyBhcnJheSBvZiBpdGVtc1xuICAgICAqIHdhcyB0cmFuc2Zvcm1lZCBpbnRvIGEgbmV3IGFycmF5IG9mIGl0ZW1zLiBDb25jZXB0dWFsbHkgaXQgaXMgYSBsaXN0IG9mXG4gICAgICogdHVwbGVzIG9mXG4gICAgICpcbiAgICAgKiAgIDxpbmRleCwgcmVtb3ZlZCwgYWRkZWRDb3VudD5cbiAgICAgKlxuICAgICAqIHdoaWNoIGFyZSBrZXB0IGluIGFzY2VuZGluZyBpbmRleCBvcmRlciBvZi4gVGhlIHR1cGxlIHJlcHJlc2VudHMgdGhhdCBhdFxuICAgICAqIHRoZSB8aW5kZXh8LCB8cmVtb3ZlZHwgc2VxdWVuY2Ugb2YgaXRlbXMgd2VyZSByZW1vdmVkLCBhbmQgY291bnRpbmcgZm9yd2FyZFxuICAgICAqIGZyb20gfGluZGV4fCwgfGFkZGVkQ291bnR8IGl0ZW1zIHdlcmUgYWRkZWQuXG4gICAgICovXG5cbiAgICAvKipcbiAgICAgKiBMYWNraW5nIGluZGl2aWR1YWwgc3BsaWNlIG11dGF0aW9uIGluZm9ybWF0aW9uLCB0aGUgbWluaW1hbCBzZXQgb2ZcbiAgICAgKiBzcGxpY2VzIGNhbiBiZSBzeW50aGVzaXplZCBnaXZlbiB0aGUgcHJldmlvdXMgc3RhdGUgYW5kIGZpbmFsIHN0YXRlIG9mIGFuXG4gICAgICogYXJyYXkuIFRoZSBiYXNpYyBhcHByb2FjaCBpcyB0byBjYWxjdWxhdGUgdGhlIGVkaXQgZGlzdGFuY2UgbWF0cml4IGFuZFxuICAgICAqIGNob29zZSB0aGUgc2hvcnRlc3QgcGF0aCB0aHJvdWdoIGl0LlxuICAgICAqXG4gICAgICogQ29tcGxleGl0eTogTyhsICogcClcbiAgICAgKiAgIGw6IFRoZSBsZW5ndGggb2YgdGhlIGN1cnJlbnQgYXJyYXlcbiAgICAgKiAgIHA6IFRoZSBsZW5ndGggb2YgdGhlIG9sZCBhcnJheVxuICAgICAqL1xuICAgIGNhbGNTcGxpY2VzOiBmdW5jdGlvbihjdXJyZW50LCBjdXJyZW50U3RhcnQsIGN1cnJlbnRFbmQsXG4gICAgICAgICAgICAgICAgICAgICAgICAgIG9sZCwgb2xkU3RhcnQsIG9sZEVuZCkge1xuICAgICAgdmFyIHByZWZpeENvdW50ID0gMDtcbiAgICAgIHZhciBzdWZmaXhDb3VudCA9IDA7XG5cbiAgICAgIHZhciBtaW5MZW5ndGggPSBNYXRoLm1pbihjdXJyZW50RW5kIC0gY3VycmVudFN0YXJ0LCBvbGRFbmQgLSBvbGRTdGFydCk7XG4gICAgICBpZiAoY3VycmVudFN0YXJ0ID09IDAgJiYgb2xkU3RhcnQgPT0gMClcbiAgICAgICAgcHJlZml4Q291bnQgPSB0aGlzLnNoYXJlZFByZWZpeChjdXJyZW50LCBvbGQsIG1pbkxlbmd0aCk7XG5cbiAgICAgIGlmIChjdXJyZW50RW5kID09IGN1cnJlbnQubGVuZ3RoICYmIG9sZEVuZCA9PSBvbGQubGVuZ3RoKVxuICAgICAgICBzdWZmaXhDb3VudCA9IHRoaXMuc2hhcmVkU3VmZml4KGN1cnJlbnQsIG9sZCwgbWluTGVuZ3RoIC0gcHJlZml4Q291bnQpO1xuXG4gICAgICBjdXJyZW50U3RhcnQgKz0gcHJlZml4Q291bnQ7XG4gICAgICBvbGRTdGFydCArPSBwcmVmaXhDb3VudDtcbiAgICAgIGN1cnJlbnRFbmQgLT0gc3VmZml4Q291bnQ7XG4gICAgICBvbGRFbmQgLT0gc3VmZml4Q291bnQ7XG5cbiAgICAgIGlmIChjdXJyZW50RW5kIC0gY3VycmVudFN0YXJ0ID09IDAgJiYgb2xkRW5kIC0gb2xkU3RhcnQgPT0gMClcbiAgICAgICAgcmV0dXJuIFtdO1xuXG4gICAgICBpZiAoY3VycmVudFN0YXJ0ID09IGN1cnJlbnRFbmQpIHtcbiAgICAgICAgdmFyIHNwbGljZSA9IG5ld1NwbGljZShjdXJyZW50U3RhcnQsIFtdLCAwKTtcbiAgICAgICAgd2hpbGUgKG9sZFN0YXJ0IDwgb2xkRW5kKVxuICAgICAgICAgIHNwbGljZS5yZW1vdmVkLnB1c2gob2xkW29sZFN0YXJ0KytdKTtcblxuICAgICAgICByZXR1cm4gWyBzcGxpY2UgXTtcbiAgICAgIH0gZWxzZSBpZiAob2xkU3RhcnQgPT0gb2xkRW5kKVxuICAgICAgICByZXR1cm4gWyBuZXdTcGxpY2UoY3VycmVudFN0YXJ0LCBbXSwgY3VycmVudEVuZCAtIGN1cnJlbnRTdGFydCkgXTtcblxuICAgICAgdmFyIG9wcyA9IHRoaXMuc3BsaWNlT3BlcmF0aW9uc0Zyb21FZGl0RGlzdGFuY2VzKFxuICAgICAgICAgIHRoaXMuY2FsY0VkaXREaXN0YW5jZXMoY3VycmVudCwgY3VycmVudFN0YXJ0LCBjdXJyZW50RW5kLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgb2xkLCBvbGRTdGFydCwgb2xkRW5kKSk7XG5cbiAgICAgIHZhciBzcGxpY2UgPSB1bmRlZmluZWQ7XG4gICAgICB2YXIgc3BsaWNlcyA9IFtdO1xuICAgICAgdmFyIGluZGV4ID0gY3VycmVudFN0YXJ0O1xuICAgICAgdmFyIG9sZEluZGV4ID0gb2xkU3RhcnQ7XG4gICAgICBmb3IgKHZhciBpID0gMDsgaSA8IG9wcy5sZW5ndGg7IGkrKykge1xuICAgICAgICBzd2l0Y2gob3BzW2ldKSB7XG4gICAgICAgICAgY2FzZSBFRElUX0xFQVZFOlxuICAgICAgICAgICAgaWYgKHNwbGljZSkge1xuICAgICAgICAgICAgICBzcGxpY2VzLnB1c2goc3BsaWNlKTtcbiAgICAgICAgICAgICAgc3BsaWNlID0gdW5kZWZpbmVkO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBpbmRleCsrO1xuICAgICAgICAgICAgb2xkSW5kZXgrKztcbiAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgIGNhc2UgRURJVF9VUERBVEU6XG4gICAgICAgICAgICBpZiAoIXNwbGljZSlcbiAgICAgICAgICAgICAgc3BsaWNlID0gbmV3U3BsaWNlKGluZGV4LCBbXSwgMCk7XG5cbiAgICAgICAgICAgIHNwbGljZS5hZGRlZENvdW50Kys7XG4gICAgICAgICAgICBpbmRleCsrO1xuXG4gICAgICAgICAgICBzcGxpY2UucmVtb3ZlZC5wdXNoKG9sZFtvbGRJbmRleF0pO1xuICAgICAgICAgICAgb2xkSW5kZXgrKztcbiAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgIGNhc2UgRURJVF9BREQ6XG4gICAgICAgICAgICBpZiAoIXNwbGljZSlcbiAgICAgICAgICAgICAgc3BsaWNlID0gbmV3U3BsaWNlKGluZGV4LCBbXSwgMCk7XG5cbiAgICAgICAgICAgIHNwbGljZS5hZGRlZENvdW50Kys7XG4gICAgICAgICAgICBpbmRleCsrO1xuICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgY2FzZSBFRElUX0RFTEVURTpcbiAgICAgICAgICAgIGlmICghc3BsaWNlKVxuICAgICAgICAgICAgICBzcGxpY2UgPSBuZXdTcGxpY2UoaW5kZXgsIFtdLCAwKTtcblxuICAgICAgICAgICAgc3BsaWNlLnJlbW92ZWQucHVzaChvbGRbb2xkSW5kZXhdKTtcbiAgICAgICAgICAgIG9sZEluZGV4Kys7XG4gICAgICAgICAgICBicmVhaztcbiAgICAgICAgfVxuICAgICAgfVxuXG4gICAgICBpZiAoc3BsaWNlKSB7XG4gICAgICAgIHNwbGljZXMucHVzaChzcGxpY2UpO1xuICAgICAgfVxuICAgICAgcmV0dXJuIHNwbGljZXM7XG4gICAgfSxcblxuICAgIHNoYXJlZFByZWZpeDogZnVuY3Rpb24oY3VycmVudCwgb2xkLCBzZWFyY2hMZW5ndGgpIHtcbiAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgc2VhcmNoTGVuZ3RoOyBpKyspXG4gICAgICAgIGlmICghdGhpcy5lcXVhbHMoY3VycmVudFtpXSwgb2xkW2ldKSlcbiAgICAgICAgICByZXR1cm4gaTtcbiAgICAgIHJldHVybiBzZWFyY2hMZW5ndGg7XG4gICAgfSxcblxuICAgIHNoYXJlZFN1ZmZpeDogZnVuY3Rpb24oY3VycmVudCwgb2xkLCBzZWFyY2hMZW5ndGgpIHtcbiAgICAgIHZhciBpbmRleDEgPSBjdXJyZW50Lmxlbmd0aDtcbiAgICAgIHZhciBpbmRleDIgPSBvbGQubGVuZ3RoO1xuICAgICAgdmFyIGNvdW50ID0gMDtcbiAgICAgIHdoaWxlIChjb3VudCA8IHNlYXJjaExlbmd0aCAmJiB0aGlzLmVxdWFscyhjdXJyZW50Wy0taW5kZXgxXSwgb2xkWy0taW5kZXgyXSkpXG4gICAgICAgIGNvdW50Kys7XG5cbiAgICAgIHJldHVybiBjb3VudDtcbiAgICB9LFxuXG4gICAgY2FsY3VsYXRlU3BsaWNlczogZnVuY3Rpb24oY3VycmVudCwgcHJldmlvdXMpIHtcbiAgICAgIHJldHVybiB0aGlzLmNhbGNTcGxpY2VzKGN1cnJlbnQsIDAsIGN1cnJlbnQubGVuZ3RoLCBwcmV2aW91cywgMCxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHByZXZpb3VzLmxlbmd0aCk7XG4gICAgfSxcblxuICAgIGVxdWFsczogZnVuY3Rpb24oY3VycmVudFZhbHVlLCBwcmV2aW91c1ZhbHVlKSB7XG4gICAgICByZXR1cm4gY3VycmVudFZhbHVlID09PSBwcmV2aW91c1ZhbHVlO1xuICAgIH1cbiAgfTtcblxuICB2YXIgYXJyYXlTcGxpY2UgPSBuZXcgQXJyYXlTcGxpY2UoKTtcblxuICBmdW5jdGlvbiBjYWxjU3BsaWNlcyhjdXJyZW50LCBjdXJyZW50U3RhcnQsIGN1cnJlbnRFbmQsXG4gICAgICAgICAgICAgICAgICAgICAgIG9sZCwgb2xkU3RhcnQsIG9sZEVuZCkge1xuICAgIHJldHVybiBhcnJheVNwbGljZS5jYWxjU3BsaWNlcyhjdXJyZW50LCBjdXJyZW50U3RhcnQsIGN1cnJlbnRFbmQsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG9sZCwgb2xkU3RhcnQsIG9sZEVuZCk7XG4gIH1cblxuICBmdW5jdGlvbiBpbnRlcnNlY3Qoc3RhcnQxLCBlbmQxLCBzdGFydDIsIGVuZDIpIHtcbiAgICAvLyBEaXNqb2ludFxuICAgIGlmIChlbmQxIDwgc3RhcnQyIHx8IGVuZDIgPCBzdGFydDEpXG4gICAgICByZXR1cm4gLTE7XG5cbiAgICAvLyBBZGphY2VudFxuICAgIGlmIChlbmQxID09IHN0YXJ0MiB8fCBlbmQyID09IHN0YXJ0MSlcbiAgICAgIHJldHVybiAwO1xuXG4gICAgLy8gTm9uLXplcm8gaW50ZXJzZWN0LCBzcGFuMSBmaXJzdFxuICAgIGlmIChzdGFydDEgPCBzdGFydDIpIHtcbiAgICAgIGlmIChlbmQxIDwgZW5kMilcbiAgICAgICAgcmV0dXJuIGVuZDEgLSBzdGFydDI7IC8vIE92ZXJsYXBcbiAgICAgIGVsc2VcbiAgICAgICAgcmV0dXJuIGVuZDIgLSBzdGFydDI7IC8vIENvbnRhaW5lZFxuICAgIH0gZWxzZSB7XG4gICAgICAvLyBOb24temVybyBpbnRlcnNlY3QsIHNwYW4yIGZpcnN0XG4gICAgICBpZiAoZW5kMiA8IGVuZDEpXG4gICAgICAgIHJldHVybiBlbmQyIC0gc3RhcnQxOyAvLyBPdmVybGFwXG4gICAgICBlbHNlXG4gICAgICAgIHJldHVybiBlbmQxIC0gc3RhcnQxOyAvLyBDb250YWluZWRcbiAgICB9XG4gIH1cblxuICBmdW5jdGlvbiBtZXJnZVNwbGljZShzcGxpY2VzLCBpbmRleCwgcmVtb3ZlZCwgYWRkZWRDb3VudCkge1xuXG4gICAgdmFyIHNwbGljZSA9IG5ld1NwbGljZShpbmRleCwgcmVtb3ZlZCwgYWRkZWRDb3VudCk7XG5cbiAgICB2YXIgaW5zZXJ0ZWQgPSBmYWxzZTtcbiAgICB2YXIgaW5zZXJ0aW9uT2Zmc2V0ID0gMDtcblxuICAgIGZvciAodmFyIGkgPSAwOyBpIDwgc3BsaWNlcy5sZW5ndGg7IGkrKykge1xuICAgICAgdmFyIGN1cnJlbnQgPSBzcGxpY2VzW2ldO1xuICAgICAgY3VycmVudC5pbmRleCArPSBpbnNlcnRpb25PZmZzZXQ7XG5cbiAgICAgIGlmIChpbnNlcnRlZClcbiAgICAgICAgY29udGludWU7XG5cbiAgICAgIHZhciBpbnRlcnNlY3RDb3VudCA9IGludGVyc2VjdChzcGxpY2UuaW5kZXgsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgc3BsaWNlLmluZGV4ICsgc3BsaWNlLnJlbW92ZWQubGVuZ3RoLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGN1cnJlbnQuaW5kZXgsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY3VycmVudC5pbmRleCArIGN1cnJlbnQuYWRkZWRDb3VudCk7XG5cbiAgICAgIGlmIChpbnRlcnNlY3RDb3VudCA+PSAwKSB7XG4gICAgICAgIC8vIE1lcmdlIHRoZSB0d28gc3BsaWNlc1xuXG4gICAgICAgIHNwbGljZXMuc3BsaWNlKGksIDEpO1xuICAgICAgICBpLS07XG5cbiAgICAgICAgaW5zZXJ0aW9uT2Zmc2V0IC09IGN1cnJlbnQuYWRkZWRDb3VudCAtIGN1cnJlbnQucmVtb3ZlZC5sZW5ndGg7XG5cbiAgICAgICAgc3BsaWNlLmFkZGVkQ291bnQgKz0gY3VycmVudC5hZGRlZENvdW50IC0gaW50ZXJzZWN0Q291bnQ7XG4gICAgICAgIHZhciBkZWxldGVDb3VudCA9IHNwbGljZS5yZW1vdmVkLmxlbmd0aCArXG4gICAgICAgICAgICAgICAgICAgICAgICAgIGN1cnJlbnQucmVtb3ZlZC5sZW5ndGggLSBpbnRlcnNlY3RDb3VudDtcblxuICAgICAgICBpZiAoIXNwbGljZS5hZGRlZENvdW50ICYmICFkZWxldGVDb3VudCkge1xuICAgICAgICAgIC8vIG1lcmdlZCBzcGxpY2UgaXMgYSBub29wLiBkaXNjYXJkLlxuICAgICAgICAgIGluc2VydGVkID0gdHJ1ZTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICB2YXIgcmVtb3ZlZCA9IGN1cnJlbnQucmVtb3ZlZDtcblxuICAgICAgICAgIGlmIChzcGxpY2UuaW5kZXggPCBjdXJyZW50LmluZGV4KSB7XG4gICAgICAgICAgICAvLyBzb21lIHByZWZpeCBvZiBzcGxpY2UucmVtb3ZlZCBpcyBwcmVwZW5kZWQgdG8gY3VycmVudC5yZW1vdmVkLlxuICAgICAgICAgICAgdmFyIHByZXBlbmQgPSBzcGxpY2UucmVtb3ZlZC5zbGljZSgwLCBjdXJyZW50LmluZGV4IC0gc3BsaWNlLmluZGV4KTtcbiAgICAgICAgICAgIEFycmF5LnByb3RvdHlwZS5wdXNoLmFwcGx5KHByZXBlbmQsIHJlbW92ZWQpO1xuICAgICAgICAgICAgcmVtb3ZlZCA9IHByZXBlbmQ7XG4gICAgICAgICAgfVxuXG4gICAgICAgICAgaWYgKHNwbGljZS5pbmRleCArIHNwbGljZS5yZW1vdmVkLmxlbmd0aCA+IGN1cnJlbnQuaW5kZXggKyBjdXJyZW50LmFkZGVkQ291bnQpIHtcbiAgICAgICAgICAgIC8vIHNvbWUgc3VmZml4IG9mIHNwbGljZS5yZW1vdmVkIGlzIGFwcGVuZGVkIHRvIGN1cnJlbnQucmVtb3ZlZC5cbiAgICAgICAgICAgIHZhciBhcHBlbmQgPSBzcGxpY2UucmVtb3ZlZC5zbGljZShjdXJyZW50LmluZGV4ICsgY3VycmVudC5hZGRlZENvdW50IC0gc3BsaWNlLmluZGV4KTtcbiAgICAgICAgICAgIEFycmF5LnByb3RvdHlwZS5wdXNoLmFwcGx5KHJlbW92ZWQsIGFwcGVuZCk7XG4gICAgICAgICAgfVxuXG4gICAgICAgICAgc3BsaWNlLnJlbW92ZWQgPSByZW1vdmVkO1xuICAgICAgICAgIGlmIChjdXJyZW50LmluZGV4IDwgc3BsaWNlLmluZGV4KSB7XG4gICAgICAgICAgICBzcGxpY2UuaW5kZXggPSBjdXJyZW50LmluZGV4O1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgfSBlbHNlIGlmIChzcGxpY2UuaW5kZXggPCBjdXJyZW50LmluZGV4KSB7XG4gICAgICAgIC8vIEluc2VydCBzcGxpY2UgaGVyZS5cblxuICAgICAgICBpbnNlcnRlZCA9IHRydWU7XG5cbiAgICAgICAgc3BsaWNlcy5zcGxpY2UoaSwgMCwgc3BsaWNlKTtcbiAgICAgICAgaSsrO1xuXG4gICAgICAgIHZhciBvZmZzZXQgPSBzcGxpY2UuYWRkZWRDb3VudCAtIHNwbGljZS5yZW1vdmVkLmxlbmd0aFxuICAgICAgICBjdXJyZW50LmluZGV4ICs9IG9mZnNldDtcbiAgICAgICAgaW5zZXJ0aW9uT2Zmc2V0ICs9IG9mZnNldDtcbiAgICAgIH1cbiAgICB9XG5cbiAgICBpZiAoIWluc2VydGVkKVxuICAgICAgc3BsaWNlcy5wdXNoKHNwbGljZSk7XG4gIH1cblxuICBmdW5jdGlvbiBjcmVhdGVJbml0aWFsU3BsaWNlcyhhcnJheSwgY2hhbmdlUmVjb3Jkcykge1xuICAgIHZhciBzcGxpY2VzID0gW107XG5cbiAgICBmb3IgKHZhciBpID0gMDsgaSA8IGNoYW5nZVJlY29yZHMubGVuZ3RoOyBpKyspIHtcbiAgICAgIHZhciByZWNvcmQgPSBjaGFuZ2VSZWNvcmRzW2ldO1xuICAgICAgc3dpdGNoKHJlY29yZC50eXBlKSB7XG4gICAgICAgIGNhc2UgJ3NwbGljZSc6XG4gICAgICAgICAgbWVyZ2VTcGxpY2Uoc3BsaWNlcywgcmVjb3JkLmluZGV4LCByZWNvcmQucmVtb3ZlZC5zbGljZSgpLCByZWNvcmQuYWRkZWRDb3VudCk7XG4gICAgICAgICAgYnJlYWs7XG4gICAgICAgIGNhc2UgJ2FkZCc6XG4gICAgICAgIGNhc2UgJ3VwZGF0ZSc6XG4gICAgICAgIGNhc2UgJ2RlbGV0ZSc6XG4gICAgICAgICAgaWYgKCFpc0luZGV4KHJlY29yZC5uYW1lKSlcbiAgICAgICAgICAgIGNvbnRpbnVlO1xuICAgICAgICAgIHZhciBpbmRleCA9IHRvTnVtYmVyKHJlY29yZC5uYW1lKTtcbiAgICAgICAgICBpZiAoaW5kZXggPCAwKVxuICAgICAgICAgICAgY29udGludWU7XG4gICAgICAgICAgbWVyZ2VTcGxpY2Uoc3BsaWNlcywgaW5kZXgsIFtyZWNvcmQub2xkVmFsdWVdLCAxKTtcbiAgICAgICAgICBicmVhaztcbiAgICAgICAgZGVmYXVsdDpcbiAgICAgICAgICBjb25zb2xlLmVycm9yKCdVbmV4cGVjdGVkIHJlY29yZCB0eXBlOiAnICsgSlNPTi5zdHJpbmdpZnkocmVjb3JkKSk7XG4gICAgICAgICAgYnJlYWs7XG4gICAgICB9XG4gICAgfVxuXG4gICAgcmV0dXJuIHNwbGljZXM7XG4gIH1cblxuICBmdW5jdGlvbiBwcm9qZWN0QXJyYXlTcGxpY2VzKGFycmF5LCBjaGFuZ2VSZWNvcmRzKSB7XG4gICAgdmFyIHNwbGljZXMgPSBbXTtcblxuICAgIGNyZWF0ZUluaXRpYWxTcGxpY2VzKGFycmF5LCBjaGFuZ2VSZWNvcmRzKS5mb3JFYWNoKGZ1bmN0aW9uKHNwbGljZSkge1xuICAgICAgaWYgKHNwbGljZS5hZGRlZENvdW50ID09IDEgJiYgc3BsaWNlLnJlbW92ZWQubGVuZ3RoID09IDEpIHtcbiAgICAgICAgaWYgKHNwbGljZS5yZW1vdmVkWzBdICE9PSBhcnJheVtzcGxpY2UuaW5kZXhdKVxuICAgICAgICAgIHNwbGljZXMucHVzaChzcGxpY2UpO1xuXG4gICAgICAgIHJldHVyblxuICAgICAgfTtcblxuICAgICAgc3BsaWNlcyA9IHNwbGljZXMuY29uY2F0KGNhbGNTcGxpY2VzKGFycmF5LCBzcGxpY2UuaW5kZXgsIHNwbGljZS5pbmRleCArIHNwbGljZS5hZGRlZENvdW50LFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHNwbGljZS5yZW1vdmVkLCAwLCBzcGxpY2UucmVtb3ZlZC5sZW5ndGgpKTtcbiAgICB9KTtcblxuICAgIHJldHVybiBzcGxpY2VzO1xuICB9XG5cbiAvLyBFeHBvcnQgdGhlIG9ic2VydmUtanMgb2JqZWN0IGZvciAqKk5vZGUuanMqKiwgd2l0aFxuLy8gYmFja3dhcmRzLWNvbXBhdGliaWxpdHkgZm9yIHRoZSBvbGQgYHJlcXVpcmUoKWAgQVBJLiBJZiB3ZSdyZSBpblxuLy8gdGhlIGJyb3dzZXIsIGV4cG9ydCBhcyBhIGdsb2JhbCBvYmplY3QuXG52YXIgZXhwb3NlID0gZ2xvYmFsO1xuaWYgKHR5cGVvZiBleHBvcnRzICE9PSAndW5kZWZpbmVkJykge1xuaWYgKHR5cGVvZiBtb2R1bGUgIT09ICd1bmRlZmluZWQnICYmIG1vZHVsZS5leHBvcnRzKSB7XG5leHBvc2UgPSBleHBvcnRzID0gbW9kdWxlLmV4cG9ydHM7XG59XG5leHBvc2UgPSBleHBvcnRzO1xufVxuZXhwb3NlLk9ic2VydmVyID0gT2JzZXJ2ZXI7XG5leHBvc2UuT2JzZXJ2ZXIucnVuRU9NXyA9IHJ1bkVPTTtcbmV4cG9zZS5PYnNlcnZlci5vYnNlcnZlclNlbnRpbmVsXyA9IG9ic2VydmVyU2VudGluZWw7IC8vIGZvciB0ZXN0aW5nLlxuZXhwb3NlLk9ic2VydmVyLmhhc09iamVjdE9ic2VydmUgPSBoYXNPYnNlcnZlO1xuZXhwb3NlLkFycmF5T2JzZXJ2ZXIgPSBBcnJheU9ic2VydmVyO1xuZXhwb3NlLkFycmF5T2JzZXJ2ZXIuY2FsY3VsYXRlU3BsaWNlcyA9IGZ1bmN0aW9uKGN1cnJlbnQsIHByZXZpb3VzKSB7XG5yZXR1cm4gYXJyYXlTcGxpY2UuY2FsY3VsYXRlU3BsaWNlcyhjdXJyZW50LCBwcmV2aW91cyk7XG59O1xuZXhwb3NlLlBsYXRmb3JtID0gZ2xvYmFsLlBsYXRmb3JtO1xuZXhwb3NlLkFycmF5U3BsaWNlID0gQXJyYXlTcGxpY2U7XG5leHBvc2UuT2JqZWN0T2JzZXJ2ZXIgPSBPYmplY3RPYnNlcnZlcjtcbmV4cG9zZS5QYXRoT2JzZXJ2ZXIgPSBQYXRoT2JzZXJ2ZXI7XG5leHBvc2UuQ29tcG91bmRPYnNlcnZlciA9IENvbXBvdW5kT2JzZXJ2ZXI7XG5leHBvc2UuUGF0aCA9IFBhdGg7XG5leHBvc2UuT2JzZXJ2ZXJUcmFuc2Zvcm0gPSBPYnNlcnZlclRyYW5zZm9ybTtcbn0pKHR5cGVvZiBnbG9iYWwgIT09ICd1bmRlZmluZWQnICYmIGdsb2JhbCAmJiB0eXBlb2YgbW9kdWxlICE9PSAndW5kZWZpbmVkJyAmJiBtb2R1bGUgPyBnbG9iYWwgOiB0aGlzIHx8IHdpbmRvdyk7XG5cbn0pLmNhbGwodGhpcyx0eXBlb2YgZ2xvYmFsICE9PSBcInVuZGVmaW5lZFwiID8gZ2xvYmFsIDogdHlwZW9mIHNlbGYgIT09IFwidW5kZWZpbmVkXCIgPyBzZWxmIDogdHlwZW9mIHdpbmRvdyAhPT0gXCJ1bmRlZmluZWRcIiA/IHdpbmRvdyA6IHt9KSJdfQ==
;(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
/**
 * Descriptors deal with the description of HTTP requests and are used by Siesta to determine what to do
 * with HTTP request/response bodies.
 * @module http
 */

var _i = siesta._internal,
    log = _i.log,
    InternalSiestaError = _i.error.InternalSiestaError,
    assert = _i.misc.assert,
    defineSubProperty = _i.misc.defineSubProperty,
    CollectionRegistry = _i.CollectionRegistry,
    extend = _i.extend,
    util = _i.util,
    _ = util._;

var Logger = log.loggerWithName('Descriptor');
Logger.setLevel(log.Level.warn);

var httpMethods = ['POST', 'PATCH', 'PUT', 'HEAD', 'GET', 'DELETE', 'OPTIONS', 'TRACE', 'CONNECT'];

function resolveMethod(methods) {
        // Convert wildcards into methods and ensure is an array of uppercase methods.
    if (methods) {
        if (methods == '*' || methods.indexOf('*') > -1) {
            methods = httpMethods;
        } else if (!util.isArray(methods)) {
            methods = [methods];
        }
    } else {
        methods = ['GET'];
    }
    return _.map(methods, function(x) {
        return x.toUpperCase()
    });
}

/**
 * A descriptor 'describes' possible HTTP requests against an API, and is used to decide whether or not to
 * intercept a HTTP request/response and perform a mapping.
 *
 * @constructor
 * @param {Object} opts
 */
function Descriptor(opts) {
    if (!this) {
        return new Descriptor(opts);
    }

    this._rawOpts = extend(true, {}, opts);
    this._opts = opts;

    if (this._opts.path) {
        // TODO: This is a bit hacky.
        // Essentially hacking named groups into javascript regular expressions.
        // Originally was using XRegExp but that library is 300kb, 30k gunzipped. Fuck that.
        // I do suspect that this is a bit sketchy tho...
        var raw = this._opts.path;
        var r = /\?<([0-9a-zA-Z_-]*)>/g;
        var match, names = [];
        while (match = r.exec(raw)) {
            var name = match[1];
            names.push(name);
        }
        raw = raw.replace(r, '');
        this._opts.path = new RegExp(raw, 'g');
        this.names = names;
    } else {
        this._opts.path = '';
        this.names = [];
    }

    this._opts.method = resolveMethod(this._opts.method);

    // Mappings can be passed as the actual mapping object or as a string (with API specified too)
    if (this._opts.mapping) {
        if (typeof(this._opts.mapping) == 'string') {
            if (this._opts.collection) {
                var collection;
                if (typeof(this._opts.collection) == 'string') {
                    collection = CollectionRegistry[this._opts.collection];
                } else {
                    collection = this._opts.collection;
                }
                if (collection) {
                    var actualMapping = collection[this._opts.mapping];
                    if (actualMapping) {
                        this._opts.mapping = actualMapping;
                    } else {
                        throw new Error('Mapping ' + this._opts.mapping + ' does not exist', {
                            opts: opts,
                            descriptor: this
                        });
                    }
                } else {
                    throw new Error('Collection ' + this._opts.collection + ' does not exist', {
                        opts: opts,
                        descriptor: this
                    });
                }
            } else {
                throw new Error('Passed mapping as string, but did not specify the collection it belongs to', {
                    opts: opts,
                    descriptor: this
                });
            }
        }
    } else {
        throw new Error('Descriptors must be initialised with a mapping', {
            opts: opts,
            descriptor: this
        });
    }

    // If key path, convert data key path into an object that we can then use to traverse the HTTP bodies.
    // otherwise leave as string or undefined.
    var data = this._opts.data;
    if (data) {
        if (data.length) {
            var root;
            var arr = data.split('.');
            if (arr.length == 1) {
                root = arr[0];
            } else {
                var obj = {};
                root = obj;
                var previousKey = arr[0];
                for (var i = 1; i < arr.length; i++) {
                    var key = arr[i];
                    if (i == (arr.length - 1)) {
                        obj[previousKey] = key;
                    } else {
                        var newVar = {};
                        obj[previousKey] = newVar;
                        obj = newVar;
                        previousKey = key;
                    }
                }
            }
            this._opts.data = root;
        }
    }

    /**
     * @name path
     * @type {String}
     */
    defineSubProperty.call(this, 'path', this._opts);
    defineSubProperty.call(this, 'method', this._opts);
    defineSubProperty.call(this, 'mapping', this._opts);
    defineSubProperty.call(this, 'data', this._opts);
    defineSubProperty.call(this, 'transforms', this._opts);
}

Descriptor.prototype.httpMethods = httpMethods;

/**
 * Takes a regex path and returns an object if matched.
 * If any regular expression groups were defined, the returned object will contain the matches.
 *
 * @param  {String|RegExp} path
 * @return {Object}
 * @internal
 * @example
 * ```js
 * var d = new Descriptor({
 *     path: '/resource/(?P<id>)/'
 * })
 * var matched = d._matchPath('/resource/2');
 * console.log(matched); // {id: '2'}
 * ```
 */
Descriptor.prototype._matchPath = function(path) {
    var matches = [];
    //console.log('path', path);
    var match = this._opts.path.exec(path);
    if (match) {
        for (var i=1;i<match.length;i++) {
            matches.push(match[i]);
        }
    }
    //console.log('matches', matches);
    var matched;
    if (matches.length == this.names.length) {
        matched = {};
        _.each(matches, function (m, i) {
            matched[this.names[i]] = m;
        }.bind(this))
    }
    //console.log('matched', matched);
    return matched;
};

/**
 * Returns true if the descriptor accepts the HTTP method.
 *
 * @param  {String} method
 * @return {boolean}
 * @internal
 * @example
 * ```js
 * var d = new Descriptor({
 *     method: ['POST', 'PUT']
 * });
 * console.log(d._matchMethod('GET')); // false
 * ```
 */
Descriptor.prototype._matchMethod = function(method) {
    for (var i = 0; i < this.method.length; i++) {
        if (method.toUpperCase() == this.method[i]) {
            return true;
        }
    }
    return false;
};

/**
 * Performs a breadth-first search through data, embedding obj in the first leaf.
 *
 * @param  {Object} obj
 * @param  {Object} data
 * @return {Object}
 */
function bury(obj, data) {
    var root = data;
    var keys = Object.keys(data);
    assert(keys.length == 1);
    var key = keys[0];
    var curr = data;
    while (!(typeof(curr[key]) == 'string')) {
        curr = curr[key];
        keys = Object.keys(curr);
        assert(keys.length == 1);
        key = keys[0];
    }
    var newParent = curr[key];
    var newObj = {};
    curr[key] = newObj;
    newObj[newParent] = obj;
    return root;
}

Descriptor.prototype._embedData = function(data) {
    if (this.data) {
        var nested;
        if (typeof(this.data) == 'string') {
            nested = {};
            nested[this.data] = data;
        } else {
            nested = bury(data, extend(true, {}, this.data));
        }
        return nested;
    } else {
        return data;
    }
};

/**
 * If nested data has been specified in the descriptor, extract the data.
 * @param  {Object} data
 * @return {Object}
 */
Descriptor.prototype._extractData = function(data) {
    if (Logger.debug.isEnabled)
        Logger.debug('_extractData', data);
    if (this.data) {
        if (typeof(this.data) == 'string') {
            return data[this.data];
        } else {
            var keys = Object.keys(this.data);
            assert(keys.length == 1);
            var currTheirs = data;
            var currOurs = this.data;
            while (typeof(currOurs) != 'string') {
                keys = Object.keys(currOurs);
                assert(keys.length == 1);
                var key = keys[0];
                currOurs = currOurs[key];
                currTheirs = currTheirs[key];
                if (!currTheirs) {
                    break;
                }
            }
            return currTheirs ? currTheirs[currOurs] : null;
        }
    } else {
        return data;
    }
};

/**
 * Returns this descriptors mapping if the request config matches.
 * @param {Object} config
 * @returns {Object}
 */
Descriptor.prototype._matchConfig = function(config) {
    var matches = config.type ? this._matchMethod(config.type) : {};
    if (matches) {
        matches = config.url ? this._matchPath(config.url) : {};
    }
    if (matches) {
        if (Logger.trace.isEnabled)
            Logger.trace('matched config');
    }
    return matches;
};

/**
 * Returns data if the data matches, performing any extraction as specified in opts.data
 *
 * @param  {Object} data
 * @return {Object}
 */
Descriptor.prototype._matchData = function(data) {
    var extractedData = null;
    if (this.data) {
        if (data) {
            extractedData = this._extractData(data);
        }
    } else {
        extractedData = data;
    }
    if (extractedData) {
        Logger.trace('matched data');
    }
    return extractedData;
};

/**
 * Check if the HTTP config and returned data match this descriptor definition.
 *
 * @param  {Object} config Config object for $.ajax and similar
 * @param  {Object} data
 * @return {Object} Extracted data
 */
Descriptor.prototype.match = function(config, data) {
    var regexMatches = this._matchConfig(config);
    var matches = !!regexMatches;
    var extractedData = false;
    if (matches) {
        Logger.trace('config matches');
        extractedData = this._matchData(data);
        matches = !!extractedData;
        if (matches) {
            var key;
            if (util.isArray(extractedData)) {
                for (key in regexMatches) {
                    if (regexMatches.hasOwnProperty(key)) {
                        _.each(extractedData, function(datum) {
                            datum[key] = regexMatches[key];
                        });
                    }
                }
            } else {
                for (key in regexMatches) {
                    if (regexMatches.hasOwnProperty(key)) {
                        extractedData[key] = regexMatches[key];
                    }
                }
            }
            Logger.trace('data matches');
        } else {
            Logger.trace('data doesnt match');
        }
    } else {
        Logger.trace('config doesnt match');
    }
    return extractedData;
};

/**
 * Apply any transforms.
 * @param  {Object} data Serialised data.
 * @return {Object} Serialised data with applied transformations.
 */
Descriptor.prototype._transformData = function(data) {
    var transforms = this.transforms;
    if (typeof(transforms) == 'function') {
        data = transforms(data);
    } else {
        for (var attr in transforms) {
            if (transforms.hasOwnProperty(attr)) {
                if (data[attr]) {
                    var transform = transforms[attr];
                    var val = data[attr];
                    if (typeof(transform) == 'string') {
                        var split = transform.split('.');
                        delete data[attr];
                        if (split.length == 1) {
                            data[split[0]] = val;
                        } else {
                            data[split[0]] = {};
                            var newVal = data[split[0]];
                            for (var i = 1; i < split.length - 1; i++) {
                                var newAttr = split[i];
                                newVal[newAttr] = {};
                                newVal = newVal[newAttr];
                            }
                            newVal[split[split.length - 1]] = val;
                        }
                    } else if (typeof(transform) == 'function') {
                        var transformed = transform(val);
                        if (util.isArray(transformed)) {
                            delete data[attr];
                            data[transformed[0]] = transformed[1];
                        } else {
                            data[attr] = transformed;
                        }
                    } else {
                        throw new InternalSiestaError('Invalid transformer');
                    }
                }
            }
        }
    }
    return data;
};


exports.Descriptor = Descriptor;
exports.resolveMethod = resolveMethod;
},{}],2:[function(require,module,exports){
var _i = siesta._internal;
var log = _i.log;
var Logger = log.loggerWithName('DescriptorRegistry');
Logger.setLevel(log.Level.warn);

var assert = _i.misc.assert;

/**
 * @class Entry point for descriptor registration.
 * @constructor
 */
function DescriptorRegistry() {
    if (!this) {
        return new DescriptorRegistry(opts);
    }
    this.requestDescriptors = {};
    this.responseDescriptors = {};
}

function _registerDescriptor(descriptors, descriptor) {
    var mapping = descriptor.mapping;
    var collection = mapping.collection;
    assert(mapping);
    assert(collection);
    assert(typeof(collection) == 'string');
    if (!descriptors[collection]) {
        descriptors[collection] = [];
    }
    descriptors[collection].push(descriptor);
}

DescriptorRegistry.prototype.registerRequestDescriptor = function (requestDescriptor) {
    _registerDescriptor(this.requestDescriptors, requestDescriptor);
};

DescriptorRegistry.prototype.registerResponseDescriptor = function (responseDescriptor) {
    if (Logger.trace.isEnabled)
        Logger.trace('registerResponseDescriptor');
    _registerDescriptor(this.responseDescriptors, responseDescriptor);
};

function _descriptorsForCollection(descriptors, collection) {
    var descriptorsForCollection;
    if (typeof(collection) == 'string') {
        descriptorsForCollection = descriptors[collection] || [];
    }
    else {
        descriptorsForCollection = (descriptors[collection._name] || []);
    }
    return descriptorsForCollection;
}

DescriptorRegistry.prototype.requestDescriptorsForCollection = function (collection) {
    return _descriptorsForCollection(this.requestDescriptors, collection);
};

DescriptorRegistry.prototype.responseDescriptorsForCollection = function (collection) {
    var descriptorsForCollection = _descriptorsForCollection(this.responseDescriptors, collection);
    if (!descriptorsForCollection.length) {
        if (Logger.debug.isEnabled)
            Logger.debug('No response descriptors for collection ', this.responseDescriptors);
    }
    return  descriptorsForCollection;
};

DescriptorRegistry.prototype.reset = function () {
    this.requestDescriptors = {};
    this.responseDescriptors = {};
};

exports.DescriptorRegistry = new DescriptorRegistry();
},{}],3:[function(require,module,exports){
/**
 * Provisions usage of $.ajax and similar functions to send HTTP requests mapping
 * the results back onto the object graph automatically.
 * @module http
 */

if (!siesta) {
    throw new Error('Could not find siesta');
}

var _i = siesta._internal,
    Collection = siesta.Collection,
    log = _i.log,
    util = _i.util,
    _ = util._,
    descriptor = require('./descriptor'),
    InternalSiestaError = _i.error.InternalSiestaError;

var DescriptorRegistry = require('./descriptorRegistry').DescriptorRegistry;


var Logger = log.loggerWithName('HTTP');
Logger.setLevel(log.Level.warn);

/**
 * Send a HTTP request to the given method and path parsing the response.
 * @param {String} method
 * @param {String} path The path to the resource we want to GET
 * @param {Object|Function} optsOrCallback Either an options object or a callback if can use defaults
 * @param {Function} callback Callback if opts specified.
 */
function _httpResponse(method, path) {
    var self = this;
    var args = Array.prototype.slice.call(arguments, 2);
    var callback;
    var opts = {};
    var name = this._name;
    if (typeof(args[0]) == 'function') {
        callback = args[0];
    } else if (typeof(args[0]) == 'object') {
        opts = args[0];
        callback = args[1];
    }
    var deferred = window.q ? window.q.defer() : null;
    callback = util.constructCallbackAndPromiseHandler(callback, deferred);
    opts.type = method;
    if (!opts.url) { // Allow overrides.
        var baseURL = this.baseURL;
        opts.url = baseURL + path;
    }
    if (opts.parseResponse === undefined) opts.parseResponse = true;
    opts.success = function(data, textStatus, jqXHR) {
        if (Logger.trace.isEnabled)
            Logger.trace(opts.type + ' ' + jqXHR.status + ' ' + opts.url + ': ' + JSON.stringify(data, null, 4));
        var resp = {
            data: data,
            textStatus: textStatus,
            jqXHR: jqXHR
        };
        if (opts.parseResponse) {
            var descriptors = DescriptorRegistry.responseDescriptorsForCollection(self);
            var matchedDescriptor;
            var extractedData;

            for (var i = 0; i < descriptors.length; i++) {
                var descriptor = descriptors[i];
                extractedData = descriptor.match(opts, data);
                if (extractedData) {
                    matchedDescriptor = descriptor;
                    break;
                }
            }

            if (matchedDescriptor) {
                if (Logger.trace.isEnabled)
                    Logger.trace('Mapping extracted data: ' + JSON.stringify(extractedData, null, 4));
                if (typeof(extractedData) == 'object') {
                    var mapping = matchedDescriptor.mapping;
                    mapping.map(extractedData, function(err, obj) {
                        if (callback) {

                            callback(err, obj, resp);
                        }
                    }, opts.obj);
                } else { // Matched, but no data.
                    callback(null, true, resp);
                }
            } else if (callback) {
                if (name) {
                    callback(null, null, resp);
                } else {
                    // There was a bug where collection name doesn't exist. If this occurs, then will never get hold of any descriptors.
                    throw new InternalSiestaError('Unnamed collection');
                }
            }
        } else {
            callback(null, null, resp);
        }

    };
    opts.error = function(jqXHR, textStatus, errorThrown) {
        var resp = {
            jqXHR: jqXHR,
            textStatus: textStatus,
            errorThrown: errorThrown
        };
        if (callback) callback(resp, null, resp);
    };
    if (Logger.trace.isEnabled)
        Logger.trace('Ajax request:', opts);
    siesta.ext.http.ajax(opts);
};

function _serialiseObject(opts, obj, cb) {
    this._serialise(obj, function (err, data) {
        var retData = data;
        if (opts.fields) {
            retData = {};
            _.each(opts.fields, function (f) {
                retData[f] = data[f];
            });
        }
        cb(err, retData);
    });
}

/**
 * Send a HTTP request to the given method and path
 * @param {String} method
 * @param {String} path The path to the resource we want to GET
 * @param {SiestaModel} object The model we're pushing to the server
 * @param {Object|Function} optsOrCallback Either an options object or a callback if can use defaults
 * @param {Function} callback Callback if opts specified.
 */
function _httpRequest(method, path, object) {
    var self = this;
    var args = Array.prototype.slice.call(arguments, 3);
    var callback;
    var opts = {};
    if (typeof(args[0]) == 'function') {
        callback = args[0];
    } else if (typeof(args[0]) == 'object') {
        opts = args[0];
        callback = args[1];
    }
    var deferred = window.q ? window.q.defer() : null;
    callback = util.constructCallbackAndPromiseHandler(callback, deferred);
    args = Array.prototype.slice.call(args, 2);
    var requestDescriptors = DescriptorRegistry.requestDescriptorsForCollection(this);
    var matchedDescriptor;
    opts.type = method;
    var baseURL = this.baseURL;
    opts.url = baseURL + path;
    for (var i = 0; i < requestDescriptors.length; i++) {
        var requestDescriptor = requestDescriptors[i];
        if (requestDescriptor._matchConfig(opts)) {
            matchedDescriptor = requestDescriptor;
            break;
        }
    }
    if (matchedDescriptor) {
        if (Logger.trace.isEnabled)
            Logger.trace('Matched descriptor: ' + matchedDescriptor._dump(true));
        _serialiseObject.call(matchedDescriptor, object, opts, function (err, data) {
            if (Logger.trace.isEnabled)
                Logger.trace('_serialise', {
                    err: err,
                    data: data
                });
            if (err) {
                if (callback) callback(err, null, null);
            } else {
                opts.data = data;
                opts.obj = object;
                _.partial(_httpResponse, method, path, opts, callback).apply(self, args);
            }
        });
       
    } else if (callback) {
        if (Logger.trace.isEnabled)
            Logger.trace('Did not match descriptor');
        callback(null, null, null);
    }
    return deferred ? deferred.promise : null;
};

/**
 * Send a DELETE request. Also removes the object.
 * @param {Collection} collection
 * @param {Stirng} path The path to the resource to which we want to DELETE
 * @param {SiestaModel} model The model that we would like to PATCH
 * @param {Object|Function} optsOrCallback Either an options object or a callback if can use defaults
 * @param {Function} callback Callback if opts specified.
 * @returns {Promise}
 */
function DELETE(collection, path, object) {
    var deferred = window.q ? window.q.defer() : null;
    var args = Array.prototype.slice.call(arguments, 3);
    var opts = {};
    var callback;
    if (typeof(args[0]) == 'function') {
        callback = args[0];
    } else if (typeof(args[0]) == 'object') {
        opts = args[0];
        callback = args[1];
    }
    callback = util.constructCallbackAndPromiseHandler(callback, deferred);
    var deletionMode = opts.deletionMode || 'restore';
    // By default we do not map the response from a DELETE request.
    if (opts.parseResponse === undefined) opts.parseResponse = false;
    _httpResponse.call(collection, 'DELETE', path, opts, function(err, x, y, z) {
        if (err) {
            if (deletionMode == 'restore') {
                object.restore();
            }
        } else if (deletionMode == 'success') {
            object.remove();
        }
        callback(err, x, y, z);
    });
    if (deletionMode == 'now' || deletionMode == 'restore') {
        object.remove();
    }
    return deferred ? deferred.promise : null;
}

/**
 * Send a HTTP request using the given method
 * @param {Collection} collection
 * @param request Does the request contain data? e.g. POST/PATCH/PUT will be true, GET will false
 * @param method
 * @internal
 * @returns {Promise}
 */
function HTTP_METHOD(collection, request, method) {
    var args = Array.prototype.slice.call(arguments, 3);
    return _.partial(request ? _httpRequest : _httpResponse, method).apply(collection, args);
}

/**
 * Send a GET request
 * @param {Collection} collection
 * @param {String} path The path to the resource we want to GET
 * @param {Object|Function} optsOrCallback Either an options object or a callback if can use defaults
 * @param {Function} callback Callback if opts specified.
 * @package HTTP
 * @returns {Promise}
 */
function GET(collection) {
    var args = Array.prototype.slice.call(arguments, 1);
    return _.partial(HTTP_METHOD, collection, false, 'GET').apply(this, args);
}

/**
 * Send an OPTIONS request
 * @param {Collection} collection
 * @param {String} path The path to the resource we want to GET
 * @param {Object|Function} optsOrCallback Either an options object or a callback if can use defaults
 * @param {Function} callback Callback if opts specified.
 * @package HTTP
 * @returns {Promise}
 */
function OPTIONS(collection) {
    var args = Array.prototype.slice.call(arguments, 1);
    return _.partial(HTTP_METHOD, collection, false, 'OPTIONS').apply(this, args);
}

/**
 * Send an TRACE request
 * @param {Collection} collection
 * @param {String} path The path to the resource we want to GET
 * @param {Object|Function} optsOrCallback Either an options object or a callback if can use defaults
 * @param {Function} callback Callback if opts specified.
 * @package HTTP
 * @returns {Promise}
 */
function TRACE(collection) {
    var args = Array.prototype.slice.call(arguments, 1);
    return _.partial(HTTP_METHOD, collection, false, 'TRACE').apply(this, args);
}

/**
 * Send an HEAD request
 * @param {Collection} collection
 * @param {String} path The path to the resource we want to GET
 * @param {Object|Function} optsOrCallback Either an options object or a callback if can use defaults
 * @param {Function} callback Callback if opts specified.
 * @package HTTP
 * @returns {Promise}
 */
function HEAD(collection) {
    var args = Array.prototype.slice.call(arguments, 1);
    return _.partial(HTTP_METHOD, collection, false, 'HEAD').apply(this, args);
}

/**
 * Send an POST request
 * @param {Collection} collection
 * @param {String} path The path to the resource we want to GET
 * @param {SiestaModel} model The model that we would like to POST
 * @param {Object|Function} optsOrCallback Either an options object or a callback if can use defaults
 * @param {Function} callback Callback if opts specified.
 * @package HTTP
 * @returns {Promise}
 */
function POST(collection) {
    var args = Array.prototype.slice.call(arguments, 1);
    return _.partial(HTTP_METHOD, collection, true, 'POST').apply(this, args);
}

/**
 * Send an PUT request
 * @param {Collection} collection
 * @param {String} path The path to the resource we want to GET
 * @param {SiestaModel} model The model that we would like to POST
 * @param {Object|Function} optsOrCallback Either an options object or a callback if can use defaults
 * @param {Function} callback Callback if opts specified.
 * @package HTTP
 * @returns {Promise}
 */
function PUT(collection) {
    var args = Array.prototype.slice.call(arguments, 1);
    return _.partial(HTTP_METHOD, collection, true, 'PUT').apply(this, args);
}

/**
 * Send an PATCH request
 * @param {Collection} collection
 * @param {String} path The path to the resource we want to GET
 * @param {SiestaModel} model The model that we would like to POST
 * @param {Object|Function} optsOrCallback Either an options object or a callback if can use defaults
 * @param {Function} callback Callback if opts specified.
 * @package HTTP
 * @returns {Promise}
 */
function PATCH(collection) {
    var args = Array.prototype.slice.call(arguments, 1);
    return _.partial(HTTP_METHOD, collection, true, 'PATCH').apply(this, args);
}


if (!siesta.ext) {
    siesta.ext = {};
}


var ajax;


siesta.ext.http = {
    RequestDescriptor: require('./requestDescriptor').RequestDescriptor,
    ResponseDescriptor: require('./responseDescriptor').ResponseDescriptor,
    Descriptor: descriptor.Descriptor,
    _resolveMethod: descriptor.resolveMethod,
    Serialiser: require('./serialiser'),
    DescriptorRegistry: require('./descriptorRegistry').DescriptorRegistry,
    setAjax: function(_ajax) {
        ajax = _ajax;
    },
    _httpResponse: _httpResponse,
    _httpRequest: _httpRequest,
    DELETE: DELETE,
    HTTP_METHOD: HTTP_METHOD,
    GET: GET,
    TRACE: TRACE,
    OPTIONS: OPTIONS,
    HEAD: HEAD,
    POST: POST,
    PUT: PUT,
    PATCH: PATCH,
    _serialiseObject: _serialiseObject
};

Object.defineProperty(siesta.ext.http, 'ajax', {
    get: function() {
        var a = ajax || ($ ? $.ajax : null) || (jQuery ? jQuery.ajax : null);
        if (!a) {
            throw new InternalSiestaError('ajax has not been defined and could not find $.ajax or jQuery.ajax');
        }
        return a;
    },
    set: function(v) {
        ajax = v;
    }
});
},{"./descriptor":1,"./descriptorRegistry":2,"./requestDescriptor":4,"./responseDescriptor":5,"./serialiser":6}],4:[function(require,module,exports){
/**
 * @module http
 */

var Descriptor = require('./descriptor').Descriptor
    , Serialiser = require('./serialiser');

var _i = siesta._internal
    , util = _i.util
    , log = _i.log
    , defineSubProperty = _i.misc.defineSubProperty
;

var Logger = log.loggerWithName('RequestDescriptor');
Logger.setLevel(log.Level.warn);

/**
 * @class Describes a HTTP request
 * @param {Object} opts
 */
function RequestDescriptor(opts) {
    if (!this) {
        return new RequestDescriptor(opts);
    }

    Descriptor.call(this, opts);
    if (this._opts['serializer']) {
        this._opts.serialiser = this._opts['serializer'];
    }

    if (!this._opts.serialiser) {
        this._opts.serialiser = Serialiser.depthSerializer(0);
    }


    defineSubProperty.call(this, 'serialiser', this._opts);
    defineSubProperty.call(this, 'serializer', this._opts, 'serialiser');

}

RequestDescriptor.prototype = Object.create(Descriptor.prototype);


RequestDescriptor.prototype._serialise = function (obj, callback) {
    var deferred = window.q ? window.q.defer() : null;
    callback = util.constructCallbackAndPromiseHandler(callback, deferred);
    var self = this;
    if (Logger.trace.isEnabled)
        Logger.trace('_serialise');
    var finished;
    var data = this.serialiser(obj, function (err, data) {
        if (!finished) {
            data = self._transformData(data);
            if (callback) callback(err, self._embedData(data));
        }
    });
    if (data !== undefined) {
        if (Logger.trace.isEnabled)
            Logger.trace('serialiser doesnt use a callback');
        finished = true;
        data = self._transformData(data);
        if (callback) callback(null, self._embedData(data));
    }
    else {
        if (Logger.trace.isEnabled)
            Logger.trace('serialiser uses a callback', this.serialiser);
    }
    return deferred ? deferred.promise : null;
};

RequestDescriptor.prototype._dump = function (asJson) {
    var obj = {};
    obj.methods = this.method;
    obj.mapping = this.mapping.type;
    obj.path = this._rawOpts.path;
    var serialiser;
    if (typeof(this._rawOpts.serialiser) == 'function') {
        serialiser = 'function () { ... }'
    }
    else {
        serialiser = this._rawOpts.serialiser;
    }
    obj.serialiser = serialiser;
    var transforms = {};
    for (var f in this.transforms) {
        if (this.transforms.hasOwnProperty(f)) {
            var transform = this.transforms[f];
            if (typeof(transform) == 'function') {
                transforms[f] = 'function () { ... }'
            }
            else {
                transforms[f] = this.transforms[f];
            }
        }
    }
    obj.transforms = transforms;
    return asJson ? JSON.stringify(obj, null, 4) : obj;
};

exports.RequestDescriptor = RequestDescriptor;

},{"./descriptor":1,"./serialiser":6}],5:[function(require,module,exports){
/**
 * @module http
 */


var Descriptor = require('./descriptor').Descriptor;

/**
 * Describes what to do with a HTTP response.
 * @constructor
 * @implements {Descriptor}
 * @param {Object} opts
 */
function ResponseDescriptor(opts) {
    if (!this) {
        return new ResponseDescriptor(opts);
    }
    Descriptor.call(this, opts);
}

ResponseDescriptor.prototype = Object.create(Descriptor.prototype);

ResponseDescriptor.prototype._extractData = function (data) {
    var extractedData = Descriptor.prototype._extractData.call(this, data);
    if (extractedData) {
        extractedData = this._transformData(extractedData);
    }
    return extractedData;
};

ResponseDescriptor.prototype._matchData = function (data) {
    var extractedData = Descriptor.prototype._matchData.call(this, data);
    if (extractedData) {
        extractedData = this._transformData(extractedData);
    }
    return extractedData;
};

ResponseDescriptor.prototype._dump = function (asJson) {
    var obj = {};
    obj.methods = this.method;
    obj.mapping = this.mapping.type;
    obj.path = this._rawOpts.path;
    var transforms = {};
    for (var f in this.transforms) {
        if (this.transforms.hasOwnProperty(f)) {
            var transform = this.transforms[f];
            if (typeof(transform) == 'function') {
                transforms[f] = 'function () { ... }'
            }
            else {
                transforms[f] = this.transforms[f];
            }
        }
    }
    obj.transforms = transforms;
    return asJson ? JSON.stringify(obj, null, 4) : obj;
};

exports.ResponseDescriptor = ResponseDescriptor;
},{"./descriptor":1}],6:[function(require,module,exports){
/**
 * @module http
 */

var _i = siesta._internal;

var log = _i.log
    , utils = _i.util;
var Logger = log.loggerWithName('Serialiser');
Logger.setLevel(log.Level.warn);
var _ = utils._;

/**
 * Serialises an object into it's remote identifier (as defined by the mapping)
 * @param  {SiestaModel} obj
 * @return {String}
 * 
 */
function idSerialiser(obj) {
    var idField = obj.mapping.id;
    if (idField) {
        return obj[idField] ? obj[idField] : null;
    }
    else {
        if (Logger.debug.isEnabled)
            Logger.debug('No idfield');
        return undefined;
    }
}

/**
 * Serialises obj following relationships to specified depth.
 * @param  {Integer}   depth
 * @param  {SiestaModel}   obj
 * @param  {Function} done 
 */
function depthSerialiser(depth, obj, done) {
    if (Logger.trace.isEnabled)
        Logger.trace('depthSerialiser');
    var data = {};
    _.each(obj._fields, function (f) {
        if (Logger.trace.isEnabled)
            Logger.trace('field', f);
        if (obj[f]) {
            data[f] = obj[f];
        }
    });
    var waiting = [];
    var errors = [];
    var result = {};
    var finished = [];
    _.each(obj._relationshipFields, function (f) {
        if (Logger.trace.isEnabled)
            Logger.trace('relationshipField', f);
        var proxy = obj[f + 'Proxy'];
        if (proxy.isForward) { // By default only forward relationship.
            if (Logger.debug.isEnabled)
                Logger.debug(f);
            waiting.push(f);
            proxy.get(function (err, v) {
                if (Logger.trace.isEnabled)
                    Logger.trace('proxy.get', f);
                if (Logger.debug.isEnabled)
                    Logger.debug(f, v);
                if (err) {
                    errors.push(err);
                    finished.push(f);
                    result[f] = {err: err, v: v};
                }
                else if (v) {
                    if (!depth) {
                        finished.push(f);
                        data[f] = v[obj[f + 'Proxy'].forwardMapping.id];
                        result[f] = {err: err, v: v};
                        if ((waiting.length == finished.length) && done) {
                            done(errors.length ? errors : null, data, result);
                        }
                    }
                    else {
                        depthSerialiser(depth - 1, v, function (err, subData, resp) {
                            if (err) {
                                errors.push(err);
                            }
                            else {
                                data[f] = subData;
                            }
                            finished.push(f);
                            result[f] = {err: err, v: v, resp: resp};
                            if ((waiting.length == finished.length) && done) {
                                done(errors.length ? errors : null, data, result);
                            }
                        });
                    }
                }
                else {
                    if (Logger.debug.isEnabled)
                        Logger.debug('no value for ' + f);
                    finished.push(f);
                    result[f] = {err: err, v: v};
                    if ((waiting.length == finished.length) && done) {
                        done(errors.length ? errors : null, data, result);
                    }
                }
            });
        }
    });
    if (!waiting.length) {
        if (done) done(null, data, {});
    }
}


exports.depthSerialiser = function (depth) {
    return  _.partial(depthSerialiser, depth);
};
exports.depthSerializer = function (depth) {
    return  _.partial(depthSerialiser, depth);
};
exports.idSerializer = idSerialiser;
exports.idSerialiser = idSerialiser;


},{}]},{},[3])
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCIvVXNlcnMvbXRmb3JkL1BsYXlncm91bmQvcmVzdC9zcmMvaHR0cC9kZXNjcmlwdG9yLmpzIiwiL1VzZXJzL210Zm9yZC9QbGF5Z3JvdW5kL3Jlc3Qvc3JjL2h0dHAvZGVzY3JpcHRvclJlZ2lzdHJ5LmpzIiwiL1VzZXJzL210Zm9yZC9QbGF5Z3JvdW5kL3Jlc3Qvc3JjL2h0dHAvaHR0cC5qcyIsIi9Vc2Vycy9tdGZvcmQvUGxheWdyb3VuZC9yZXN0L3NyYy9odHRwL3JlcXVlc3REZXNjcmlwdG9yLmpzIiwiL1VzZXJzL210Zm9yZC9QbGF5Z3JvdW5kL3Jlc3Qvc3JjL2h0dHAvcmVzcG9uc2VEZXNjcmlwdG9yLmpzIiwiL1VzZXJzL210Zm9yZC9QbGF5Z3JvdW5kL3Jlc3Qvc3JjL2h0dHAvc2VyaWFsaXNlci5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTtBQ0FBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3BhQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3RFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNoWUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNwR0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzNEQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBIiwiZmlsZSI6ImdlbmVyYXRlZC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzQ29udGVudCI6WyIoZnVuY3Rpb24gZSh0LG4scil7ZnVuY3Rpb24gcyhvLHUpe2lmKCFuW29dKXtpZighdFtvXSl7dmFyIGE9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtpZighdSYmYSlyZXR1cm4gYShvLCEwKTtpZihpKXJldHVybiBpKG8sITApO3ZhciBmPW5ldyBFcnJvcihcIkNhbm5vdCBmaW5kIG1vZHVsZSAnXCIrbytcIidcIik7dGhyb3cgZi5jb2RlPVwiTU9EVUxFX05PVF9GT1VORFwiLGZ9dmFyIGw9bltvXT17ZXhwb3J0czp7fX07dFtvXVswXS5jYWxsKGwuZXhwb3J0cyxmdW5jdGlvbihlKXt2YXIgbj10W29dWzFdW2VdO3JldHVybiBzKG4/bjplKX0sbCxsLmV4cG9ydHMsZSx0LG4scil9cmV0dXJuIG5bb10uZXhwb3J0c312YXIgaT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2Zvcih2YXIgbz0wO288ci5sZW5ndGg7bysrKXMocltvXSk7cmV0dXJuIHN9KSIsIi8qKlxuICogRGVzY3JpcHRvcnMgZGVhbCB3aXRoIHRoZSBkZXNjcmlwdGlvbiBvZiBIVFRQIHJlcXVlc3RzIGFuZCBhcmUgdXNlZCBieSBTaWVzdGEgdG8gZGV0ZXJtaW5lIHdoYXQgdG8gZG9cbiAqIHdpdGggSFRUUCByZXF1ZXN0L3Jlc3BvbnNlIGJvZGllcy5cbiAqIEBtb2R1bGUgaHR0cFxuICovXG5cbnZhciBfaSA9IHNpZXN0YS5faW50ZXJuYWwsXG4gICAgbG9nID0gX2kubG9nLFxuICAgIEludGVybmFsU2llc3RhRXJyb3IgPSBfaS5lcnJvci5JbnRlcm5hbFNpZXN0YUVycm9yLFxuICAgIGFzc2VydCA9IF9pLm1pc2MuYXNzZXJ0LFxuICAgIGRlZmluZVN1YlByb3BlcnR5ID0gX2kubWlzYy5kZWZpbmVTdWJQcm9wZXJ0eSxcbiAgICBDb2xsZWN0aW9uUmVnaXN0cnkgPSBfaS5Db2xsZWN0aW9uUmVnaXN0cnksXG4gICAgZXh0ZW5kID0gX2kuZXh0ZW5kLFxuICAgIHV0aWwgPSBfaS51dGlsLFxuICAgIF8gPSB1dGlsLl87XG5cbnZhciBMb2dnZXIgPSBsb2cubG9nZ2VyV2l0aE5hbWUoJ0Rlc2NyaXB0b3InKTtcbkxvZ2dlci5zZXRMZXZlbChsb2cuTGV2ZWwud2Fybik7XG5cbnZhciBodHRwTWV0aG9kcyA9IFsnUE9TVCcsICdQQVRDSCcsICdQVVQnLCAnSEVBRCcsICdHRVQnLCAnREVMRVRFJywgJ09QVElPTlMnLCAnVFJBQ0UnLCAnQ09OTkVDVCddO1xuXG5mdW5jdGlvbiByZXNvbHZlTWV0aG9kKG1ldGhvZHMpIHtcbiAgICAgICAgLy8gQ29udmVydCB3aWxkY2FyZHMgaW50byBtZXRob2RzIGFuZCBlbnN1cmUgaXMgYW4gYXJyYXkgb2YgdXBwZXJjYXNlIG1ldGhvZHMuXG4gICAgaWYgKG1ldGhvZHMpIHtcbiAgICAgICAgaWYgKG1ldGhvZHMgPT0gJyonIHx8IG1ldGhvZHMuaW5kZXhPZignKicpID4gLTEpIHtcbiAgICAgICAgICAgIG1ldGhvZHMgPSBodHRwTWV0aG9kcztcbiAgICAgICAgfSBlbHNlIGlmICghdXRpbC5pc0FycmF5KG1ldGhvZHMpKSB7XG4gICAgICAgICAgICBtZXRob2RzID0gW21ldGhvZHNdO1xuICAgICAgICB9XG4gICAgfSBlbHNlIHtcbiAgICAgICAgbWV0aG9kcyA9IFsnR0VUJ107XG4gICAgfVxuICAgIHJldHVybiBfLm1hcChtZXRob2RzLCBmdW5jdGlvbih4KSB7XG4gICAgICAgIHJldHVybiB4LnRvVXBwZXJDYXNlKClcbiAgICB9KTtcbn1cblxuLyoqXG4gKiBBIGRlc2NyaXB0b3IgJ2Rlc2NyaWJlcycgcG9zc2libGUgSFRUUCByZXF1ZXN0cyBhZ2FpbnN0IGFuIEFQSSwgYW5kIGlzIHVzZWQgdG8gZGVjaWRlIHdoZXRoZXIgb3Igbm90IHRvXG4gKiBpbnRlcmNlcHQgYSBIVFRQIHJlcXVlc3QvcmVzcG9uc2UgYW5kIHBlcmZvcm0gYSBtYXBwaW5nLlxuICpcbiAqIEBjb25zdHJ1Y3RvclxuICogQHBhcmFtIHtPYmplY3R9IG9wdHNcbiAqL1xuZnVuY3Rpb24gRGVzY3JpcHRvcihvcHRzKSB7XG4gICAgaWYgKCF0aGlzKSB7XG4gICAgICAgIHJldHVybiBuZXcgRGVzY3JpcHRvcihvcHRzKTtcbiAgICB9XG5cbiAgICB0aGlzLl9yYXdPcHRzID0gZXh0ZW5kKHRydWUsIHt9LCBvcHRzKTtcbiAgICB0aGlzLl9vcHRzID0gb3B0cztcblxuICAgIGlmICh0aGlzLl9vcHRzLnBhdGgpIHtcbiAgICAgICAgLy8gVE9ETzogVGhpcyBpcyBhIGJpdCBoYWNreS5cbiAgICAgICAgLy8gRXNzZW50aWFsbHkgaGFja2luZyBuYW1lZCBncm91cHMgaW50byBqYXZhc2NyaXB0IHJlZ3VsYXIgZXhwcmVzc2lvbnMuXG4gICAgICAgIC8vIE9yaWdpbmFsbHkgd2FzIHVzaW5nIFhSZWdFeHAgYnV0IHRoYXQgbGlicmFyeSBpcyAzMDBrYiwgMzBrIGd1bnppcHBlZC4gRnVjayB0aGF0LlxuICAgICAgICAvLyBJIGRvIHN1c3BlY3QgdGhhdCB0aGlzIGlzIGEgYml0IHNrZXRjaHkgdGhvLi4uXG4gICAgICAgIHZhciByYXcgPSB0aGlzLl9vcHRzLnBhdGg7XG4gICAgICAgIHZhciByID0gL1xcPzwoWzAtOWEtekEtWl8tXSopPi9nO1xuICAgICAgICB2YXIgbWF0Y2gsIG5hbWVzID0gW107XG4gICAgICAgIHdoaWxlIChtYXRjaCA9IHIuZXhlYyhyYXcpKSB7XG4gICAgICAgICAgICB2YXIgbmFtZSA9IG1hdGNoWzFdO1xuICAgICAgICAgICAgbmFtZXMucHVzaChuYW1lKTtcbiAgICAgICAgfVxuICAgICAgICByYXcgPSByYXcucmVwbGFjZShyLCAnJyk7XG4gICAgICAgIHRoaXMuX29wdHMucGF0aCA9IG5ldyBSZWdFeHAocmF3LCAnZycpO1xuICAgICAgICB0aGlzLm5hbWVzID0gbmFtZXM7XG4gICAgfSBlbHNlIHtcbiAgICAgICAgdGhpcy5fb3B0cy5wYXRoID0gJyc7XG4gICAgICAgIHRoaXMubmFtZXMgPSBbXTtcbiAgICB9XG5cbiAgICB0aGlzLl9vcHRzLm1ldGhvZCA9IHJlc29sdmVNZXRob2QodGhpcy5fb3B0cy5tZXRob2QpO1xuXG4gICAgLy8gTWFwcGluZ3MgY2FuIGJlIHBhc3NlZCBhcyB0aGUgYWN0dWFsIG1hcHBpbmcgb2JqZWN0IG9yIGFzIGEgc3RyaW5nICh3aXRoIEFQSSBzcGVjaWZpZWQgdG9vKVxuICAgIGlmICh0aGlzLl9vcHRzLm1hcHBpbmcpIHtcbiAgICAgICAgaWYgKHR5cGVvZih0aGlzLl9vcHRzLm1hcHBpbmcpID09ICdzdHJpbmcnKSB7XG4gICAgICAgICAgICBpZiAodGhpcy5fb3B0cy5jb2xsZWN0aW9uKSB7XG4gICAgICAgICAgICAgICAgdmFyIGNvbGxlY3Rpb247XG4gICAgICAgICAgICAgICAgaWYgKHR5cGVvZih0aGlzLl9vcHRzLmNvbGxlY3Rpb24pID09ICdzdHJpbmcnKSB7XG4gICAgICAgICAgICAgICAgICAgIGNvbGxlY3Rpb24gPSBDb2xsZWN0aW9uUmVnaXN0cnlbdGhpcy5fb3B0cy5jb2xsZWN0aW9uXTtcbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICBjb2xsZWN0aW9uID0gdGhpcy5fb3B0cy5jb2xsZWN0aW9uO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBpZiAoY29sbGVjdGlvbikge1xuICAgICAgICAgICAgICAgICAgICB2YXIgYWN0dWFsTWFwcGluZyA9IGNvbGxlY3Rpb25bdGhpcy5fb3B0cy5tYXBwaW5nXTtcbiAgICAgICAgICAgICAgICAgICAgaWYgKGFjdHVhbE1hcHBpbmcpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMuX29wdHMubWFwcGluZyA9IGFjdHVhbE1hcHBpbmc7XG4gICAgICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoJ01hcHBpbmcgJyArIHRoaXMuX29wdHMubWFwcGluZyArICcgZG9lcyBub3QgZXhpc3QnLCB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgb3B0czogb3B0cyxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBkZXNjcmlwdG9yOiB0aGlzXG4gICAgICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcignQ29sbGVjdGlvbiAnICsgdGhpcy5fb3B0cy5jb2xsZWN0aW9uICsgJyBkb2VzIG5vdCBleGlzdCcsIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIG9wdHM6IG9wdHMsXG4gICAgICAgICAgICAgICAgICAgICAgICBkZXNjcmlwdG9yOiB0aGlzXG4gICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKCdQYXNzZWQgbWFwcGluZyBhcyBzdHJpbmcsIGJ1dCBkaWQgbm90IHNwZWNpZnkgdGhlIGNvbGxlY3Rpb24gaXQgYmVsb25ncyB0bycsIHtcbiAgICAgICAgICAgICAgICAgICAgb3B0czogb3B0cyxcbiAgICAgICAgICAgICAgICAgICAgZGVzY3JpcHRvcjogdGhpc1xuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfSBlbHNlIHtcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKCdEZXNjcmlwdG9ycyBtdXN0IGJlIGluaXRpYWxpc2VkIHdpdGggYSBtYXBwaW5nJywge1xuICAgICAgICAgICAgb3B0czogb3B0cyxcbiAgICAgICAgICAgIGRlc2NyaXB0b3I6IHRoaXNcbiAgICAgICAgfSk7XG4gICAgfVxuXG4gICAgLy8gSWYga2V5IHBhdGgsIGNvbnZlcnQgZGF0YSBrZXkgcGF0aCBpbnRvIGFuIG9iamVjdCB0aGF0IHdlIGNhbiB0aGVuIHVzZSB0byB0cmF2ZXJzZSB0aGUgSFRUUCBib2RpZXMuXG4gICAgLy8gb3RoZXJ3aXNlIGxlYXZlIGFzIHN0cmluZyBvciB1bmRlZmluZWQuXG4gICAgdmFyIGRhdGEgPSB0aGlzLl9vcHRzLmRhdGE7XG4gICAgaWYgKGRhdGEpIHtcbiAgICAgICAgaWYgKGRhdGEubGVuZ3RoKSB7XG4gICAgICAgICAgICB2YXIgcm9vdDtcbiAgICAgICAgICAgIHZhciBhcnIgPSBkYXRhLnNwbGl0KCcuJyk7XG4gICAgICAgICAgICBpZiAoYXJyLmxlbmd0aCA9PSAxKSB7XG4gICAgICAgICAgICAgICAgcm9vdCA9IGFyclswXTtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgdmFyIG9iaiA9IHt9O1xuICAgICAgICAgICAgICAgIHJvb3QgPSBvYmo7XG4gICAgICAgICAgICAgICAgdmFyIHByZXZpb3VzS2V5ID0gYXJyWzBdO1xuICAgICAgICAgICAgICAgIGZvciAodmFyIGkgPSAxOyBpIDwgYXJyLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgICAgICAgICAgIHZhciBrZXkgPSBhcnJbaV07XG4gICAgICAgICAgICAgICAgICAgIGlmIChpID09IChhcnIubGVuZ3RoIC0gMSkpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIG9ialtwcmV2aW91c0tleV0gPSBrZXk7XG4gICAgICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgICAgICB2YXIgbmV3VmFyID0ge307XG4gICAgICAgICAgICAgICAgICAgICAgICBvYmpbcHJldmlvdXNLZXldID0gbmV3VmFyO1xuICAgICAgICAgICAgICAgICAgICAgICAgb2JqID0gbmV3VmFyO1xuICAgICAgICAgICAgICAgICAgICAgICAgcHJldmlvdXNLZXkgPSBrZXk7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICB0aGlzLl9vcHRzLmRhdGEgPSByb290O1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogQG5hbWUgcGF0aFxuICAgICAqIEB0eXBlIHtTdHJpbmd9XG4gICAgICovXG4gICAgZGVmaW5lU3ViUHJvcGVydHkuY2FsbCh0aGlzLCAncGF0aCcsIHRoaXMuX29wdHMpO1xuICAgIGRlZmluZVN1YlByb3BlcnR5LmNhbGwodGhpcywgJ21ldGhvZCcsIHRoaXMuX29wdHMpO1xuICAgIGRlZmluZVN1YlByb3BlcnR5LmNhbGwodGhpcywgJ21hcHBpbmcnLCB0aGlzLl9vcHRzKTtcbiAgICBkZWZpbmVTdWJQcm9wZXJ0eS5jYWxsKHRoaXMsICdkYXRhJywgdGhpcy5fb3B0cyk7XG4gICAgZGVmaW5lU3ViUHJvcGVydHkuY2FsbCh0aGlzLCAndHJhbnNmb3JtcycsIHRoaXMuX29wdHMpO1xufVxuXG5EZXNjcmlwdG9yLnByb3RvdHlwZS5odHRwTWV0aG9kcyA9IGh0dHBNZXRob2RzO1xuXG4vKipcbiAqIFRha2VzIGEgcmVnZXggcGF0aCBhbmQgcmV0dXJucyBhbiBvYmplY3QgaWYgbWF0Y2hlZC5cbiAqIElmIGFueSByZWd1bGFyIGV4cHJlc3Npb24gZ3JvdXBzIHdlcmUgZGVmaW5lZCwgdGhlIHJldHVybmVkIG9iamVjdCB3aWxsIGNvbnRhaW4gdGhlIG1hdGNoZXMuXG4gKlxuICogQHBhcmFtICB7U3RyaW5nfFJlZ0V4cH0gcGF0aFxuICogQHJldHVybiB7T2JqZWN0fVxuICogQGludGVybmFsXG4gKiBAZXhhbXBsZVxuICogYGBganNcbiAqIHZhciBkID0gbmV3IERlc2NyaXB0b3Ioe1xuICogICAgIHBhdGg6ICcvcmVzb3VyY2UvKD9QPGlkPikvJ1xuICogfSlcbiAqIHZhciBtYXRjaGVkID0gZC5fbWF0Y2hQYXRoKCcvcmVzb3VyY2UvMicpO1xuICogY29uc29sZS5sb2cobWF0Y2hlZCk7IC8vIHtpZDogJzInfVxuICogYGBgXG4gKi9cbkRlc2NyaXB0b3IucHJvdG90eXBlLl9tYXRjaFBhdGggPSBmdW5jdGlvbihwYXRoKSB7XG4gICAgdmFyIG1hdGNoZXMgPSBbXTtcbiAgICAvL2NvbnNvbGUubG9nKCdwYXRoJywgcGF0aCk7XG4gICAgdmFyIG1hdGNoID0gdGhpcy5fb3B0cy5wYXRoLmV4ZWMocGF0aCk7XG4gICAgaWYgKG1hdGNoKSB7XG4gICAgICAgIGZvciAodmFyIGk9MTtpPG1hdGNoLmxlbmd0aDtpKyspIHtcbiAgICAgICAgICAgIG1hdGNoZXMucHVzaChtYXRjaFtpXSk7XG4gICAgICAgIH1cbiAgICB9XG4gICAgLy9jb25zb2xlLmxvZygnbWF0Y2hlcycsIG1hdGNoZXMpO1xuICAgIHZhciBtYXRjaGVkO1xuICAgIGlmIChtYXRjaGVzLmxlbmd0aCA9PSB0aGlzLm5hbWVzLmxlbmd0aCkge1xuICAgICAgICBtYXRjaGVkID0ge307XG4gICAgICAgIF8uZWFjaChtYXRjaGVzLCBmdW5jdGlvbiAobSwgaSkge1xuICAgICAgICAgICAgbWF0Y2hlZFt0aGlzLm5hbWVzW2ldXSA9IG07XG4gICAgICAgIH0uYmluZCh0aGlzKSlcbiAgICB9XG4gICAgLy9jb25zb2xlLmxvZygnbWF0Y2hlZCcsIG1hdGNoZWQpO1xuICAgIHJldHVybiBtYXRjaGVkO1xufTtcblxuLyoqXG4gKiBSZXR1cm5zIHRydWUgaWYgdGhlIGRlc2NyaXB0b3IgYWNjZXB0cyB0aGUgSFRUUCBtZXRob2QuXG4gKlxuICogQHBhcmFtICB7U3RyaW5nfSBtZXRob2RcbiAqIEByZXR1cm4ge2Jvb2xlYW59XG4gKiBAaW50ZXJuYWxcbiAqIEBleGFtcGxlXG4gKiBgYGBqc1xuICogdmFyIGQgPSBuZXcgRGVzY3JpcHRvcih7XG4gKiAgICAgbWV0aG9kOiBbJ1BPU1QnLCAnUFVUJ11cbiAqIH0pO1xuICogY29uc29sZS5sb2coZC5fbWF0Y2hNZXRob2QoJ0dFVCcpKTsgLy8gZmFsc2VcbiAqIGBgYFxuICovXG5EZXNjcmlwdG9yLnByb3RvdHlwZS5fbWF0Y2hNZXRob2QgPSBmdW5jdGlvbihtZXRob2QpIHtcbiAgICBmb3IgKHZhciBpID0gMDsgaSA8IHRoaXMubWV0aG9kLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgIGlmIChtZXRob2QudG9VcHBlckNhc2UoKSA9PSB0aGlzLm1ldGhvZFtpXSkge1xuICAgICAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgICAgIH1cbiAgICB9XG4gICAgcmV0dXJuIGZhbHNlO1xufTtcblxuLyoqXG4gKiBQZXJmb3JtcyBhIGJyZWFkdGgtZmlyc3Qgc2VhcmNoIHRocm91Z2ggZGF0YSwgZW1iZWRkaW5nIG9iaiBpbiB0aGUgZmlyc3QgbGVhZi5cbiAqXG4gKiBAcGFyYW0gIHtPYmplY3R9IG9ialxuICogQHBhcmFtICB7T2JqZWN0fSBkYXRhXG4gKiBAcmV0dXJuIHtPYmplY3R9XG4gKi9cbmZ1bmN0aW9uIGJ1cnkob2JqLCBkYXRhKSB7XG4gICAgdmFyIHJvb3QgPSBkYXRhO1xuICAgIHZhciBrZXlzID0gT2JqZWN0LmtleXMoZGF0YSk7XG4gICAgYXNzZXJ0KGtleXMubGVuZ3RoID09IDEpO1xuICAgIHZhciBrZXkgPSBrZXlzWzBdO1xuICAgIHZhciBjdXJyID0gZGF0YTtcbiAgICB3aGlsZSAoISh0eXBlb2YoY3VycltrZXldKSA9PSAnc3RyaW5nJykpIHtcbiAgICAgICAgY3VyciA9IGN1cnJba2V5XTtcbiAgICAgICAga2V5cyA9IE9iamVjdC5rZXlzKGN1cnIpO1xuICAgICAgICBhc3NlcnQoa2V5cy5sZW5ndGggPT0gMSk7XG4gICAgICAgIGtleSA9IGtleXNbMF07XG4gICAgfVxuICAgIHZhciBuZXdQYXJlbnQgPSBjdXJyW2tleV07XG4gICAgdmFyIG5ld09iaiA9IHt9O1xuICAgIGN1cnJba2V5XSA9IG5ld09iajtcbiAgICBuZXdPYmpbbmV3UGFyZW50XSA9IG9iajtcbiAgICByZXR1cm4gcm9vdDtcbn1cblxuRGVzY3JpcHRvci5wcm90b3R5cGUuX2VtYmVkRGF0YSA9IGZ1bmN0aW9uKGRhdGEpIHtcbiAgICBpZiAodGhpcy5kYXRhKSB7XG4gICAgICAgIHZhciBuZXN0ZWQ7XG4gICAgICAgIGlmICh0eXBlb2YodGhpcy5kYXRhKSA9PSAnc3RyaW5nJykge1xuICAgICAgICAgICAgbmVzdGVkID0ge307XG4gICAgICAgICAgICBuZXN0ZWRbdGhpcy5kYXRhXSA9IGRhdGE7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBuZXN0ZWQgPSBidXJ5KGRhdGEsIGV4dGVuZCh0cnVlLCB7fSwgdGhpcy5kYXRhKSk7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIG5lc3RlZDtcbiAgICB9IGVsc2Uge1xuICAgICAgICByZXR1cm4gZGF0YTtcbiAgICB9XG59O1xuXG4vKipcbiAqIElmIG5lc3RlZCBkYXRhIGhhcyBiZWVuIHNwZWNpZmllZCBpbiB0aGUgZGVzY3JpcHRvciwgZXh0cmFjdCB0aGUgZGF0YS5cbiAqIEBwYXJhbSAge09iamVjdH0gZGF0YVxuICogQHJldHVybiB7T2JqZWN0fVxuICovXG5EZXNjcmlwdG9yLnByb3RvdHlwZS5fZXh0cmFjdERhdGEgPSBmdW5jdGlvbihkYXRhKSB7XG4gICAgaWYgKExvZ2dlci5kZWJ1Zy5pc0VuYWJsZWQpXG4gICAgICAgIExvZ2dlci5kZWJ1ZygnX2V4dHJhY3REYXRhJywgZGF0YSk7XG4gICAgaWYgKHRoaXMuZGF0YSkge1xuICAgICAgICBpZiAodHlwZW9mKHRoaXMuZGF0YSkgPT0gJ3N0cmluZycpIHtcbiAgICAgICAgICAgIHJldHVybiBkYXRhW3RoaXMuZGF0YV07XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICB2YXIga2V5cyA9IE9iamVjdC5rZXlzKHRoaXMuZGF0YSk7XG4gICAgICAgICAgICBhc3NlcnQoa2V5cy5sZW5ndGggPT0gMSk7XG4gICAgICAgICAgICB2YXIgY3VyclRoZWlycyA9IGRhdGE7XG4gICAgICAgICAgICB2YXIgY3Vyck91cnMgPSB0aGlzLmRhdGE7XG4gICAgICAgICAgICB3aGlsZSAodHlwZW9mKGN1cnJPdXJzKSAhPSAnc3RyaW5nJykge1xuICAgICAgICAgICAgICAgIGtleXMgPSBPYmplY3Qua2V5cyhjdXJyT3Vycyk7XG4gICAgICAgICAgICAgICAgYXNzZXJ0KGtleXMubGVuZ3RoID09IDEpO1xuICAgICAgICAgICAgICAgIHZhciBrZXkgPSBrZXlzWzBdO1xuICAgICAgICAgICAgICAgIGN1cnJPdXJzID0gY3Vyck91cnNba2V5XTtcbiAgICAgICAgICAgICAgICBjdXJyVGhlaXJzID0gY3VyclRoZWlyc1trZXldO1xuICAgICAgICAgICAgICAgIGlmICghY3VyclRoZWlycykge1xuICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICByZXR1cm4gY3VyclRoZWlycyA/IGN1cnJUaGVpcnNbY3Vyck91cnNdIDogbnVsbDtcbiAgICAgICAgfVxuICAgIH0gZWxzZSB7XG4gICAgICAgIHJldHVybiBkYXRhO1xuICAgIH1cbn07XG5cbi8qKlxuICogUmV0dXJucyB0aGlzIGRlc2NyaXB0b3JzIG1hcHBpbmcgaWYgdGhlIHJlcXVlc3QgY29uZmlnIG1hdGNoZXMuXG4gKiBAcGFyYW0ge09iamVjdH0gY29uZmlnXG4gKiBAcmV0dXJucyB7T2JqZWN0fVxuICovXG5EZXNjcmlwdG9yLnByb3RvdHlwZS5fbWF0Y2hDb25maWcgPSBmdW5jdGlvbihjb25maWcpIHtcbiAgICB2YXIgbWF0Y2hlcyA9IGNvbmZpZy50eXBlID8gdGhpcy5fbWF0Y2hNZXRob2QoY29uZmlnLnR5cGUpIDoge307XG4gICAgaWYgKG1hdGNoZXMpIHtcbiAgICAgICAgbWF0Y2hlcyA9IGNvbmZpZy51cmwgPyB0aGlzLl9tYXRjaFBhdGgoY29uZmlnLnVybCkgOiB7fTtcbiAgICB9XG4gICAgaWYgKG1hdGNoZXMpIHtcbiAgICAgICAgaWYgKExvZ2dlci50cmFjZS5pc0VuYWJsZWQpXG4gICAgICAgICAgICBMb2dnZXIudHJhY2UoJ21hdGNoZWQgY29uZmlnJyk7XG4gICAgfVxuICAgIHJldHVybiBtYXRjaGVzO1xufTtcblxuLyoqXG4gKiBSZXR1cm5zIGRhdGEgaWYgdGhlIGRhdGEgbWF0Y2hlcywgcGVyZm9ybWluZyBhbnkgZXh0cmFjdGlvbiBhcyBzcGVjaWZpZWQgaW4gb3B0cy5kYXRhXG4gKlxuICogQHBhcmFtICB7T2JqZWN0fSBkYXRhXG4gKiBAcmV0dXJuIHtPYmplY3R9XG4gKi9cbkRlc2NyaXB0b3IucHJvdG90eXBlLl9tYXRjaERhdGEgPSBmdW5jdGlvbihkYXRhKSB7XG4gICAgdmFyIGV4dHJhY3RlZERhdGEgPSBudWxsO1xuICAgIGlmICh0aGlzLmRhdGEpIHtcbiAgICAgICAgaWYgKGRhdGEpIHtcbiAgICAgICAgICAgIGV4dHJhY3RlZERhdGEgPSB0aGlzLl9leHRyYWN0RGF0YShkYXRhKTtcbiAgICAgICAgfVxuICAgIH0gZWxzZSB7XG4gICAgICAgIGV4dHJhY3RlZERhdGEgPSBkYXRhO1xuICAgIH1cbiAgICBpZiAoZXh0cmFjdGVkRGF0YSkge1xuICAgICAgICBMb2dnZXIudHJhY2UoJ21hdGNoZWQgZGF0YScpO1xuICAgIH1cbiAgICByZXR1cm4gZXh0cmFjdGVkRGF0YTtcbn07XG5cbi8qKlxuICogQ2hlY2sgaWYgdGhlIEhUVFAgY29uZmlnIGFuZCByZXR1cm5lZCBkYXRhIG1hdGNoIHRoaXMgZGVzY3JpcHRvciBkZWZpbml0aW9uLlxuICpcbiAqIEBwYXJhbSAge09iamVjdH0gY29uZmlnIENvbmZpZyBvYmplY3QgZm9yICQuYWpheCBhbmQgc2ltaWxhclxuICogQHBhcmFtICB7T2JqZWN0fSBkYXRhXG4gKiBAcmV0dXJuIHtPYmplY3R9IEV4dHJhY3RlZCBkYXRhXG4gKi9cbkRlc2NyaXB0b3IucHJvdG90eXBlLm1hdGNoID0gZnVuY3Rpb24oY29uZmlnLCBkYXRhKSB7XG4gICAgdmFyIHJlZ2V4TWF0Y2hlcyA9IHRoaXMuX21hdGNoQ29uZmlnKGNvbmZpZyk7XG4gICAgdmFyIG1hdGNoZXMgPSAhIXJlZ2V4TWF0Y2hlcztcbiAgICB2YXIgZXh0cmFjdGVkRGF0YSA9IGZhbHNlO1xuICAgIGlmIChtYXRjaGVzKSB7XG4gICAgICAgIExvZ2dlci50cmFjZSgnY29uZmlnIG1hdGNoZXMnKTtcbiAgICAgICAgZXh0cmFjdGVkRGF0YSA9IHRoaXMuX21hdGNoRGF0YShkYXRhKTtcbiAgICAgICAgbWF0Y2hlcyA9ICEhZXh0cmFjdGVkRGF0YTtcbiAgICAgICAgaWYgKG1hdGNoZXMpIHtcbiAgICAgICAgICAgIHZhciBrZXk7XG4gICAgICAgICAgICBpZiAodXRpbC5pc0FycmF5KGV4dHJhY3RlZERhdGEpKSB7XG4gICAgICAgICAgICAgICAgZm9yIChrZXkgaW4gcmVnZXhNYXRjaGVzKSB7XG4gICAgICAgICAgICAgICAgICAgIGlmIChyZWdleE1hdGNoZXMuaGFzT3duUHJvcGVydHkoa2V5KSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgXy5lYWNoKGV4dHJhY3RlZERhdGEsIGZ1bmN0aW9uKGRhdHVtKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZGF0dW1ba2V5XSA9IHJlZ2V4TWF0Y2hlc1trZXldO1xuICAgICAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIGZvciAoa2V5IGluIHJlZ2V4TWF0Y2hlcykge1xuICAgICAgICAgICAgICAgICAgICBpZiAocmVnZXhNYXRjaGVzLmhhc093blByb3BlcnR5KGtleSkpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGV4dHJhY3RlZERhdGFba2V5XSA9IHJlZ2V4TWF0Y2hlc1trZXldO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgTG9nZ2VyLnRyYWNlKCdkYXRhIG1hdGNoZXMnKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIExvZ2dlci50cmFjZSgnZGF0YSBkb2VzbnQgbWF0Y2gnKTtcbiAgICAgICAgfVxuICAgIH0gZWxzZSB7XG4gICAgICAgIExvZ2dlci50cmFjZSgnY29uZmlnIGRvZXNudCBtYXRjaCcpO1xuICAgIH1cbiAgICByZXR1cm4gZXh0cmFjdGVkRGF0YTtcbn07XG5cbi8qKlxuICogQXBwbHkgYW55IHRyYW5zZm9ybXMuXG4gKiBAcGFyYW0gIHtPYmplY3R9IGRhdGEgU2VyaWFsaXNlZCBkYXRhLlxuICogQHJldHVybiB7T2JqZWN0fSBTZXJpYWxpc2VkIGRhdGEgd2l0aCBhcHBsaWVkIHRyYW5zZm9ybWF0aW9ucy5cbiAqL1xuRGVzY3JpcHRvci5wcm90b3R5cGUuX3RyYW5zZm9ybURhdGEgPSBmdW5jdGlvbihkYXRhKSB7XG4gICAgdmFyIHRyYW5zZm9ybXMgPSB0aGlzLnRyYW5zZm9ybXM7XG4gICAgaWYgKHR5cGVvZih0cmFuc2Zvcm1zKSA9PSAnZnVuY3Rpb24nKSB7XG4gICAgICAgIGRhdGEgPSB0cmFuc2Zvcm1zKGRhdGEpO1xuICAgIH0gZWxzZSB7XG4gICAgICAgIGZvciAodmFyIGF0dHIgaW4gdHJhbnNmb3Jtcykge1xuICAgICAgICAgICAgaWYgKHRyYW5zZm9ybXMuaGFzT3duUHJvcGVydHkoYXR0cikpIHtcbiAgICAgICAgICAgICAgICBpZiAoZGF0YVthdHRyXSkge1xuICAgICAgICAgICAgICAgICAgICB2YXIgdHJhbnNmb3JtID0gdHJhbnNmb3Jtc1thdHRyXTtcbiAgICAgICAgICAgICAgICAgICAgdmFyIHZhbCA9IGRhdGFbYXR0cl07XG4gICAgICAgICAgICAgICAgICAgIGlmICh0eXBlb2YodHJhbnNmb3JtKSA9PSAnc3RyaW5nJykge1xuICAgICAgICAgICAgICAgICAgICAgICAgdmFyIHNwbGl0ID0gdHJhbnNmb3JtLnNwbGl0KCcuJyk7XG4gICAgICAgICAgICAgICAgICAgICAgICBkZWxldGUgZGF0YVthdHRyXTtcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmIChzcGxpdC5sZW5ndGggPT0gMSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGRhdGFbc3BsaXRbMF1dID0gdmFsO1xuICAgICAgICAgICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBkYXRhW3NwbGl0WzBdXSA9IHt9O1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHZhciBuZXdWYWwgPSBkYXRhW3NwbGl0WzBdXTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBmb3IgKHZhciBpID0gMTsgaSA8IHNwbGl0Lmxlbmd0aCAtIDE7IGkrKykge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB2YXIgbmV3QXR0ciA9IHNwbGl0W2ldO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBuZXdWYWxbbmV3QXR0cl0gPSB7fTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbmV3VmFsID0gbmV3VmFsW25ld0F0dHJdO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBuZXdWYWxbc3BsaXRbc3BsaXQubGVuZ3RoIC0gMV1dID0gdmFsO1xuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICB9IGVsc2UgaWYgKHR5cGVvZih0cmFuc2Zvcm0pID09ICdmdW5jdGlvbicpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHZhciB0cmFuc2Zvcm1lZCA9IHRyYW5zZm9ybSh2YWwpO1xuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKHV0aWwuaXNBcnJheSh0cmFuc2Zvcm1lZCkpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBkZWxldGUgZGF0YVthdHRyXTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBkYXRhW3RyYW5zZm9ybWVkWzBdXSA9IHRyYW5zZm9ybWVkWzFdO1xuICAgICAgICAgICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBkYXRhW2F0dHJdID0gdHJhbnNmb3JtZWQ7XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgICAgICB0aHJvdyBuZXcgSW50ZXJuYWxTaWVzdGFFcnJvcignSW52YWxpZCB0cmFuc2Zvcm1lcicpO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfVxuICAgIHJldHVybiBkYXRhO1xufTtcblxuXG5leHBvcnRzLkRlc2NyaXB0b3IgPSBEZXNjcmlwdG9yO1xuZXhwb3J0cy5yZXNvbHZlTWV0aG9kID0gcmVzb2x2ZU1ldGhvZDsiLCJ2YXIgX2kgPSBzaWVzdGEuX2ludGVybmFsO1xudmFyIGxvZyA9IF9pLmxvZztcbnZhciBMb2dnZXIgPSBsb2cubG9nZ2VyV2l0aE5hbWUoJ0Rlc2NyaXB0b3JSZWdpc3RyeScpO1xuTG9nZ2VyLnNldExldmVsKGxvZy5MZXZlbC53YXJuKTtcblxudmFyIGFzc2VydCA9IF9pLm1pc2MuYXNzZXJ0O1xuXG4vKipcbiAqIEBjbGFzcyBFbnRyeSBwb2ludCBmb3IgZGVzY3JpcHRvciByZWdpc3RyYXRpb24uXG4gKiBAY29uc3RydWN0b3JcbiAqL1xuZnVuY3Rpb24gRGVzY3JpcHRvclJlZ2lzdHJ5KCkge1xuICAgIGlmICghdGhpcykge1xuICAgICAgICByZXR1cm4gbmV3IERlc2NyaXB0b3JSZWdpc3RyeShvcHRzKTtcbiAgICB9XG4gICAgdGhpcy5yZXF1ZXN0RGVzY3JpcHRvcnMgPSB7fTtcbiAgICB0aGlzLnJlc3BvbnNlRGVzY3JpcHRvcnMgPSB7fTtcbn1cblxuZnVuY3Rpb24gX3JlZ2lzdGVyRGVzY3JpcHRvcihkZXNjcmlwdG9ycywgZGVzY3JpcHRvcikge1xuICAgIHZhciBtYXBwaW5nID0gZGVzY3JpcHRvci5tYXBwaW5nO1xuICAgIHZhciBjb2xsZWN0aW9uID0gbWFwcGluZy5jb2xsZWN0aW9uO1xuICAgIGFzc2VydChtYXBwaW5nKTtcbiAgICBhc3NlcnQoY29sbGVjdGlvbik7XG4gICAgYXNzZXJ0KHR5cGVvZihjb2xsZWN0aW9uKSA9PSAnc3RyaW5nJyk7XG4gICAgaWYgKCFkZXNjcmlwdG9yc1tjb2xsZWN0aW9uXSkge1xuICAgICAgICBkZXNjcmlwdG9yc1tjb2xsZWN0aW9uXSA9IFtdO1xuICAgIH1cbiAgICBkZXNjcmlwdG9yc1tjb2xsZWN0aW9uXS5wdXNoKGRlc2NyaXB0b3IpO1xufVxuXG5EZXNjcmlwdG9yUmVnaXN0cnkucHJvdG90eXBlLnJlZ2lzdGVyUmVxdWVzdERlc2NyaXB0b3IgPSBmdW5jdGlvbiAocmVxdWVzdERlc2NyaXB0b3IpIHtcbiAgICBfcmVnaXN0ZXJEZXNjcmlwdG9yKHRoaXMucmVxdWVzdERlc2NyaXB0b3JzLCByZXF1ZXN0RGVzY3JpcHRvcik7XG59O1xuXG5EZXNjcmlwdG9yUmVnaXN0cnkucHJvdG90eXBlLnJlZ2lzdGVyUmVzcG9uc2VEZXNjcmlwdG9yID0gZnVuY3Rpb24gKHJlc3BvbnNlRGVzY3JpcHRvcikge1xuICAgIGlmIChMb2dnZXIudHJhY2UuaXNFbmFibGVkKVxuICAgICAgICBMb2dnZXIudHJhY2UoJ3JlZ2lzdGVyUmVzcG9uc2VEZXNjcmlwdG9yJyk7XG4gICAgX3JlZ2lzdGVyRGVzY3JpcHRvcih0aGlzLnJlc3BvbnNlRGVzY3JpcHRvcnMsIHJlc3BvbnNlRGVzY3JpcHRvcik7XG59O1xuXG5mdW5jdGlvbiBfZGVzY3JpcHRvcnNGb3JDb2xsZWN0aW9uKGRlc2NyaXB0b3JzLCBjb2xsZWN0aW9uKSB7XG4gICAgdmFyIGRlc2NyaXB0b3JzRm9yQ29sbGVjdGlvbjtcbiAgICBpZiAodHlwZW9mKGNvbGxlY3Rpb24pID09ICdzdHJpbmcnKSB7XG4gICAgICAgIGRlc2NyaXB0b3JzRm9yQ29sbGVjdGlvbiA9IGRlc2NyaXB0b3JzW2NvbGxlY3Rpb25dIHx8IFtdO1xuICAgIH1cbiAgICBlbHNlIHtcbiAgICAgICAgZGVzY3JpcHRvcnNGb3JDb2xsZWN0aW9uID0gKGRlc2NyaXB0b3JzW2NvbGxlY3Rpb24uX25hbWVdIHx8IFtdKTtcbiAgICB9XG4gICAgcmV0dXJuIGRlc2NyaXB0b3JzRm9yQ29sbGVjdGlvbjtcbn1cblxuRGVzY3JpcHRvclJlZ2lzdHJ5LnByb3RvdHlwZS5yZXF1ZXN0RGVzY3JpcHRvcnNGb3JDb2xsZWN0aW9uID0gZnVuY3Rpb24gKGNvbGxlY3Rpb24pIHtcbiAgICByZXR1cm4gX2Rlc2NyaXB0b3JzRm9yQ29sbGVjdGlvbih0aGlzLnJlcXVlc3REZXNjcmlwdG9ycywgY29sbGVjdGlvbik7XG59O1xuXG5EZXNjcmlwdG9yUmVnaXN0cnkucHJvdG90eXBlLnJlc3BvbnNlRGVzY3JpcHRvcnNGb3JDb2xsZWN0aW9uID0gZnVuY3Rpb24gKGNvbGxlY3Rpb24pIHtcbiAgICB2YXIgZGVzY3JpcHRvcnNGb3JDb2xsZWN0aW9uID0gX2Rlc2NyaXB0b3JzRm9yQ29sbGVjdGlvbih0aGlzLnJlc3BvbnNlRGVzY3JpcHRvcnMsIGNvbGxlY3Rpb24pO1xuICAgIGlmICghZGVzY3JpcHRvcnNGb3JDb2xsZWN0aW9uLmxlbmd0aCkge1xuICAgICAgICBpZiAoTG9nZ2VyLmRlYnVnLmlzRW5hYmxlZClcbiAgICAgICAgICAgIExvZ2dlci5kZWJ1ZygnTm8gcmVzcG9uc2UgZGVzY3JpcHRvcnMgZm9yIGNvbGxlY3Rpb24gJywgdGhpcy5yZXNwb25zZURlc2NyaXB0b3JzKTtcbiAgICB9XG4gICAgcmV0dXJuICBkZXNjcmlwdG9yc0ZvckNvbGxlY3Rpb247XG59O1xuXG5EZXNjcmlwdG9yUmVnaXN0cnkucHJvdG90eXBlLnJlc2V0ID0gZnVuY3Rpb24gKCkge1xuICAgIHRoaXMucmVxdWVzdERlc2NyaXB0b3JzID0ge307XG4gICAgdGhpcy5yZXNwb25zZURlc2NyaXB0b3JzID0ge307XG59O1xuXG5leHBvcnRzLkRlc2NyaXB0b3JSZWdpc3RyeSA9IG5ldyBEZXNjcmlwdG9yUmVnaXN0cnkoKTsiLCIvKipcbiAqIFByb3Zpc2lvbnMgdXNhZ2Ugb2YgJC5hamF4IGFuZCBzaW1pbGFyIGZ1bmN0aW9ucyB0byBzZW5kIEhUVFAgcmVxdWVzdHMgbWFwcGluZ1xuICogdGhlIHJlc3VsdHMgYmFjayBvbnRvIHRoZSBvYmplY3QgZ3JhcGggYXV0b21hdGljYWxseS5cbiAqIEBtb2R1bGUgaHR0cFxuICovXG5cbmlmICghc2llc3RhKSB7XG4gICAgdGhyb3cgbmV3IEVycm9yKCdDb3VsZCBub3QgZmluZCBzaWVzdGEnKTtcbn1cblxudmFyIF9pID0gc2llc3RhLl9pbnRlcm5hbCxcbiAgICBDb2xsZWN0aW9uID0gc2llc3RhLkNvbGxlY3Rpb24sXG4gICAgbG9nID0gX2kubG9nLFxuICAgIHV0aWwgPSBfaS51dGlsLFxuICAgIF8gPSB1dGlsLl8sXG4gICAgZGVzY3JpcHRvciA9IHJlcXVpcmUoJy4vZGVzY3JpcHRvcicpLFxuICAgIEludGVybmFsU2llc3RhRXJyb3IgPSBfaS5lcnJvci5JbnRlcm5hbFNpZXN0YUVycm9yO1xuXG52YXIgRGVzY3JpcHRvclJlZ2lzdHJ5ID0gcmVxdWlyZSgnLi9kZXNjcmlwdG9yUmVnaXN0cnknKS5EZXNjcmlwdG9yUmVnaXN0cnk7XG5cblxudmFyIExvZ2dlciA9IGxvZy5sb2dnZXJXaXRoTmFtZSgnSFRUUCcpO1xuTG9nZ2VyLnNldExldmVsKGxvZy5MZXZlbC53YXJuKTtcblxuLyoqXG4gKiBTZW5kIGEgSFRUUCByZXF1ZXN0IHRvIHRoZSBnaXZlbiBtZXRob2QgYW5kIHBhdGggcGFyc2luZyB0aGUgcmVzcG9uc2UuXG4gKiBAcGFyYW0ge1N0cmluZ30gbWV0aG9kXG4gKiBAcGFyYW0ge1N0cmluZ30gcGF0aCBUaGUgcGF0aCB0byB0aGUgcmVzb3VyY2Ugd2Ugd2FudCB0byBHRVRcbiAqIEBwYXJhbSB7T2JqZWN0fEZ1bmN0aW9ufSBvcHRzT3JDYWxsYmFjayBFaXRoZXIgYW4gb3B0aW9ucyBvYmplY3Qgb3IgYSBjYWxsYmFjayBpZiBjYW4gdXNlIGRlZmF1bHRzXG4gKiBAcGFyYW0ge0Z1bmN0aW9ufSBjYWxsYmFjayBDYWxsYmFjayBpZiBvcHRzIHNwZWNpZmllZC5cbiAqL1xuZnVuY3Rpb24gX2h0dHBSZXNwb25zZShtZXRob2QsIHBhdGgpIHtcbiAgICB2YXIgc2VsZiA9IHRoaXM7XG4gICAgdmFyIGFyZ3MgPSBBcnJheS5wcm90b3R5cGUuc2xpY2UuY2FsbChhcmd1bWVudHMsIDIpO1xuICAgIHZhciBjYWxsYmFjaztcbiAgICB2YXIgb3B0cyA9IHt9O1xuICAgIHZhciBuYW1lID0gdGhpcy5fbmFtZTtcbiAgICBpZiAodHlwZW9mKGFyZ3NbMF0pID09ICdmdW5jdGlvbicpIHtcbiAgICAgICAgY2FsbGJhY2sgPSBhcmdzWzBdO1xuICAgIH0gZWxzZSBpZiAodHlwZW9mKGFyZ3NbMF0pID09ICdvYmplY3QnKSB7XG4gICAgICAgIG9wdHMgPSBhcmdzWzBdO1xuICAgICAgICBjYWxsYmFjayA9IGFyZ3NbMV07XG4gICAgfVxuICAgIHZhciBkZWZlcnJlZCA9IHdpbmRvdy5xID8gd2luZG93LnEuZGVmZXIoKSA6IG51bGw7XG4gICAgY2FsbGJhY2sgPSB1dGlsLmNvbnN0cnVjdENhbGxiYWNrQW5kUHJvbWlzZUhhbmRsZXIoY2FsbGJhY2ssIGRlZmVycmVkKTtcbiAgICBvcHRzLnR5cGUgPSBtZXRob2Q7XG4gICAgaWYgKCFvcHRzLnVybCkgeyAvLyBBbGxvdyBvdmVycmlkZXMuXG4gICAgICAgIHZhciBiYXNlVVJMID0gdGhpcy5iYXNlVVJMO1xuICAgICAgICBvcHRzLnVybCA9IGJhc2VVUkwgKyBwYXRoO1xuICAgIH1cbiAgICBpZiAob3B0cy5wYXJzZVJlc3BvbnNlID09PSB1bmRlZmluZWQpIG9wdHMucGFyc2VSZXNwb25zZSA9IHRydWU7XG4gICAgb3B0cy5zdWNjZXNzID0gZnVuY3Rpb24oZGF0YSwgdGV4dFN0YXR1cywganFYSFIpIHtcbiAgICAgICAgaWYgKExvZ2dlci50cmFjZS5pc0VuYWJsZWQpXG4gICAgICAgICAgICBMb2dnZXIudHJhY2Uob3B0cy50eXBlICsgJyAnICsganFYSFIuc3RhdHVzICsgJyAnICsgb3B0cy51cmwgKyAnOiAnICsgSlNPTi5zdHJpbmdpZnkoZGF0YSwgbnVsbCwgNCkpO1xuICAgICAgICB2YXIgcmVzcCA9IHtcbiAgICAgICAgICAgIGRhdGE6IGRhdGEsXG4gICAgICAgICAgICB0ZXh0U3RhdHVzOiB0ZXh0U3RhdHVzLFxuICAgICAgICAgICAganFYSFI6IGpxWEhSXG4gICAgICAgIH07XG4gICAgICAgIGlmIChvcHRzLnBhcnNlUmVzcG9uc2UpIHtcbiAgICAgICAgICAgIHZhciBkZXNjcmlwdG9ycyA9IERlc2NyaXB0b3JSZWdpc3RyeS5yZXNwb25zZURlc2NyaXB0b3JzRm9yQ29sbGVjdGlvbihzZWxmKTtcbiAgICAgICAgICAgIHZhciBtYXRjaGVkRGVzY3JpcHRvcjtcbiAgICAgICAgICAgIHZhciBleHRyYWN0ZWREYXRhO1xuXG4gICAgICAgICAgICBmb3IgKHZhciBpID0gMDsgaSA8IGRlc2NyaXB0b3JzLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgICAgICAgdmFyIGRlc2NyaXB0b3IgPSBkZXNjcmlwdG9yc1tpXTtcbiAgICAgICAgICAgICAgICBleHRyYWN0ZWREYXRhID0gZGVzY3JpcHRvci5tYXRjaChvcHRzLCBkYXRhKTtcbiAgICAgICAgICAgICAgICBpZiAoZXh0cmFjdGVkRGF0YSkge1xuICAgICAgICAgICAgICAgICAgICBtYXRjaGVkRGVzY3JpcHRvciA9IGRlc2NyaXB0b3I7XG4gICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgaWYgKG1hdGNoZWREZXNjcmlwdG9yKSB7XG4gICAgICAgICAgICAgICAgaWYgKExvZ2dlci50cmFjZS5pc0VuYWJsZWQpXG4gICAgICAgICAgICAgICAgICAgIExvZ2dlci50cmFjZSgnTWFwcGluZyBleHRyYWN0ZWQgZGF0YTogJyArIEpTT04uc3RyaW5naWZ5KGV4dHJhY3RlZERhdGEsIG51bGwsIDQpKTtcbiAgICAgICAgICAgICAgICBpZiAodHlwZW9mKGV4dHJhY3RlZERhdGEpID09ICdvYmplY3QnKSB7XG4gICAgICAgICAgICAgICAgICAgIHZhciBtYXBwaW5nID0gbWF0Y2hlZERlc2NyaXB0b3IubWFwcGluZztcbiAgICAgICAgICAgICAgICAgICAgbWFwcGluZy5tYXAoZXh0cmFjdGVkRGF0YSwgZnVuY3Rpb24oZXJyLCBvYmopIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmIChjYWxsYmFjaykge1xuXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgY2FsbGJhY2soZXJyLCBvYmosIHJlc3ApO1xuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICB9LCBvcHRzLm9iaik7XG4gICAgICAgICAgICAgICAgfSBlbHNlIHsgLy8gTWF0Y2hlZCwgYnV0IG5vIGRhdGEuXG4gICAgICAgICAgICAgICAgICAgIGNhbGxiYWNrKG51bGwsIHRydWUsIHJlc3ApO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0gZWxzZSBpZiAoY2FsbGJhY2spIHtcbiAgICAgICAgICAgICAgICBpZiAobmFtZSkge1xuICAgICAgICAgICAgICAgICAgICBjYWxsYmFjayhudWxsLCBudWxsLCByZXNwKTtcbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICAvLyBUaGVyZSB3YXMgYSBidWcgd2hlcmUgY29sbGVjdGlvbiBuYW1lIGRvZXNuJ3QgZXhpc3QuIElmIHRoaXMgb2NjdXJzLCB0aGVuIHdpbGwgbmV2ZXIgZ2V0IGhvbGQgb2YgYW55IGRlc2NyaXB0b3JzLlxuICAgICAgICAgICAgICAgICAgICB0aHJvdyBuZXcgSW50ZXJuYWxTaWVzdGFFcnJvcignVW5uYW1lZCBjb2xsZWN0aW9uJyk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgY2FsbGJhY2sobnVsbCwgbnVsbCwgcmVzcCk7XG4gICAgICAgIH1cblxuICAgIH07XG4gICAgb3B0cy5lcnJvciA9IGZ1bmN0aW9uKGpxWEhSLCB0ZXh0U3RhdHVzLCBlcnJvclRocm93bikge1xuICAgICAgICB2YXIgcmVzcCA9IHtcbiAgICAgICAgICAgIGpxWEhSOiBqcVhIUixcbiAgICAgICAgICAgIHRleHRTdGF0dXM6IHRleHRTdGF0dXMsXG4gICAgICAgICAgICBlcnJvclRocm93bjogZXJyb3JUaHJvd25cbiAgICAgICAgfTtcbiAgICAgICAgaWYgKGNhbGxiYWNrKSBjYWxsYmFjayhyZXNwLCBudWxsLCByZXNwKTtcbiAgICB9O1xuICAgIGlmIChMb2dnZXIudHJhY2UuaXNFbmFibGVkKVxuICAgICAgICBMb2dnZXIudHJhY2UoJ0FqYXggcmVxdWVzdDonLCBvcHRzKTtcbiAgICBzaWVzdGEuZXh0Lmh0dHAuYWpheChvcHRzKTtcbn07XG5cbmZ1bmN0aW9uIF9zZXJpYWxpc2VPYmplY3Qob3B0cywgb2JqLCBjYikge1xuICAgIHRoaXMuX3NlcmlhbGlzZShvYmosIGZ1bmN0aW9uIChlcnIsIGRhdGEpIHtcbiAgICAgICAgdmFyIHJldERhdGEgPSBkYXRhO1xuICAgICAgICBpZiAob3B0cy5maWVsZHMpIHtcbiAgICAgICAgICAgIHJldERhdGEgPSB7fTtcbiAgICAgICAgICAgIF8uZWFjaChvcHRzLmZpZWxkcywgZnVuY3Rpb24gKGYpIHtcbiAgICAgICAgICAgICAgICByZXREYXRhW2ZdID0gZGF0YVtmXTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9XG4gICAgICAgIGNiKGVyciwgcmV0RGF0YSk7XG4gICAgfSk7XG59XG5cbi8qKlxuICogU2VuZCBhIEhUVFAgcmVxdWVzdCB0byB0aGUgZ2l2ZW4gbWV0aG9kIGFuZCBwYXRoXG4gKiBAcGFyYW0ge1N0cmluZ30gbWV0aG9kXG4gKiBAcGFyYW0ge1N0cmluZ30gcGF0aCBUaGUgcGF0aCB0byB0aGUgcmVzb3VyY2Ugd2Ugd2FudCB0byBHRVRcbiAqIEBwYXJhbSB7U2llc3RhTW9kZWx9IG9iamVjdCBUaGUgbW9kZWwgd2UncmUgcHVzaGluZyB0byB0aGUgc2VydmVyXG4gKiBAcGFyYW0ge09iamVjdHxGdW5jdGlvbn0gb3B0c09yQ2FsbGJhY2sgRWl0aGVyIGFuIG9wdGlvbnMgb2JqZWN0IG9yIGEgY2FsbGJhY2sgaWYgY2FuIHVzZSBkZWZhdWx0c1xuICogQHBhcmFtIHtGdW5jdGlvbn0gY2FsbGJhY2sgQ2FsbGJhY2sgaWYgb3B0cyBzcGVjaWZpZWQuXG4gKi9cbmZ1bmN0aW9uIF9odHRwUmVxdWVzdChtZXRob2QsIHBhdGgsIG9iamVjdCkge1xuICAgIHZhciBzZWxmID0gdGhpcztcbiAgICB2YXIgYXJncyA9IEFycmF5LnByb3RvdHlwZS5zbGljZS5jYWxsKGFyZ3VtZW50cywgMyk7XG4gICAgdmFyIGNhbGxiYWNrO1xuICAgIHZhciBvcHRzID0ge307XG4gICAgaWYgKHR5cGVvZihhcmdzWzBdKSA9PSAnZnVuY3Rpb24nKSB7XG4gICAgICAgIGNhbGxiYWNrID0gYXJnc1swXTtcbiAgICB9IGVsc2UgaWYgKHR5cGVvZihhcmdzWzBdKSA9PSAnb2JqZWN0Jykge1xuICAgICAgICBvcHRzID0gYXJnc1swXTtcbiAgICAgICAgY2FsbGJhY2sgPSBhcmdzWzFdO1xuICAgIH1cbiAgICB2YXIgZGVmZXJyZWQgPSB3aW5kb3cucSA/IHdpbmRvdy5xLmRlZmVyKCkgOiBudWxsO1xuICAgIGNhbGxiYWNrID0gdXRpbC5jb25zdHJ1Y3RDYWxsYmFja0FuZFByb21pc2VIYW5kbGVyKGNhbGxiYWNrLCBkZWZlcnJlZCk7XG4gICAgYXJncyA9IEFycmF5LnByb3RvdHlwZS5zbGljZS5jYWxsKGFyZ3MsIDIpO1xuICAgIHZhciByZXF1ZXN0RGVzY3JpcHRvcnMgPSBEZXNjcmlwdG9yUmVnaXN0cnkucmVxdWVzdERlc2NyaXB0b3JzRm9yQ29sbGVjdGlvbih0aGlzKTtcbiAgICB2YXIgbWF0Y2hlZERlc2NyaXB0b3I7XG4gICAgb3B0cy50eXBlID0gbWV0aG9kO1xuICAgIHZhciBiYXNlVVJMID0gdGhpcy5iYXNlVVJMO1xuICAgIG9wdHMudXJsID0gYmFzZVVSTCArIHBhdGg7XG4gICAgZm9yICh2YXIgaSA9IDA7IGkgPCByZXF1ZXN0RGVzY3JpcHRvcnMubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgdmFyIHJlcXVlc3REZXNjcmlwdG9yID0gcmVxdWVzdERlc2NyaXB0b3JzW2ldO1xuICAgICAgICBpZiAocmVxdWVzdERlc2NyaXB0b3IuX21hdGNoQ29uZmlnKG9wdHMpKSB7XG4gICAgICAgICAgICBtYXRjaGVkRGVzY3JpcHRvciA9IHJlcXVlc3REZXNjcmlwdG9yO1xuICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgIH1cbiAgICB9XG4gICAgaWYgKG1hdGNoZWREZXNjcmlwdG9yKSB7XG4gICAgICAgIGlmIChMb2dnZXIudHJhY2UuaXNFbmFibGVkKVxuICAgICAgICAgICAgTG9nZ2VyLnRyYWNlKCdNYXRjaGVkIGRlc2NyaXB0b3I6ICcgKyBtYXRjaGVkRGVzY3JpcHRvci5fZHVtcCh0cnVlKSk7XG4gICAgICAgIF9zZXJpYWxpc2VPYmplY3QuY2FsbChtYXRjaGVkRGVzY3JpcHRvciwgb2JqZWN0LCBvcHRzLCBmdW5jdGlvbiAoZXJyLCBkYXRhKSB7XG4gICAgICAgICAgICBpZiAoTG9nZ2VyLnRyYWNlLmlzRW5hYmxlZClcbiAgICAgICAgICAgICAgICBMb2dnZXIudHJhY2UoJ19zZXJpYWxpc2UnLCB7XG4gICAgICAgICAgICAgICAgICAgIGVycjogZXJyLFxuICAgICAgICAgICAgICAgICAgICBkYXRhOiBkYXRhXG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICBpZiAoZXJyKSB7XG4gICAgICAgICAgICAgICAgaWYgKGNhbGxiYWNrKSBjYWxsYmFjayhlcnIsIG51bGwsIG51bGwpO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICBvcHRzLmRhdGEgPSBkYXRhO1xuICAgICAgICAgICAgICAgIG9wdHMub2JqID0gb2JqZWN0O1xuICAgICAgICAgICAgICAgIF8ucGFydGlhbChfaHR0cFJlc3BvbnNlLCBtZXRob2QsIHBhdGgsIG9wdHMsIGNhbGxiYWNrKS5hcHBseShzZWxmLCBhcmdzKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSk7XG4gICAgICAgXG4gICAgfSBlbHNlIGlmIChjYWxsYmFjaykge1xuICAgICAgICBpZiAoTG9nZ2VyLnRyYWNlLmlzRW5hYmxlZClcbiAgICAgICAgICAgIExvZ2dlci50cmFjZSgnRGlkIG5vdCBtYXRjaCBkZXNjcmlwdG9yJyk7XG4gICAgICAgIGNhbGxiYWNrKG51bGwsIG51bGwsIG51bGwpO1xuICAgIH1cbiAgICByZXR1cm4gZGVmZXJyZWQgPyBkZWZlcnJlZC5wcm9taXNlIDogbnVsbDtcbn07XG5cbi8qKlxuICogU2VuZCBhIERFTEVURSByZXF1ZXN0LiBBbHNvIHJlbW92ZXMgdGhlIG9iamVjdC5cbiAqIEBwYXJhbSB7Q29sbGVjdGlvbn0gY29sbGVjdGlvblxuICogQHBhcmFtIHtTdGlybmd9IHBhdGggVGhlIHBhdGggdG8gdGhlIHJlc291cmNlIHRvIHdoaWNoIHdlIHdhbnQgdG8gREVMRVRFXG4gKiBAcGFyYW0ge1NpZXN0YU1vZGVsfSBtb2RlbCBUaGUgbW9kZWwgdGhhdCB3ZSB3b3VsZCBsaWtlIHRvIFBBVENIXG4gKiBAcGFyYW0ge09iamVjdHxGdW5jdGlvbn0gb3B0c09yQ2FsbGJhY2sgRWl0aGVyIGFuIG9wdGlvbnMgb2JqZWN0IG9yIGEgY2FsbGJhY2sgaWYgY2FuIHVzZSBkZWZhdWx0c1xuICogQHBhcmFtIHtGdW5jdGlvbn0gY2FsbGJhY2sgQ2FsbGJhY2sgaWYgb3B0cyBzcGVjaWZpZWQuXG4gKiBAcmV0dXJucyB7UHJvbWlzZX1cbiAqL1xuZnVuY3Rpb24gREVMRVRFKGNvbGxlY3Rpb24sIHBhdGgsIG9iamVjdCkge1xuICAgIHZhciBkZWZlcnJlZCA9IHdpbmRvdy5xID8gd2luZG93LnEuZGVmZXIoKSA6IG51bGw7XG4gICAgdmFyIGFyZ3MgPSBBcnJheS5wcm90b3R5cGUuc2xpY2UuY2FsbChhcmd1bWVudHMsIDMpO1xuICAgIHZhciBvcHRzID0ge307XG4gICAgdmFyIGNhbGxiYWNrO1xuICAgIGlmICh0eXBlb2YoYXJnc1swXSkgPT0gJ2Z1bmN0aW9uJykge1xuICAgICAgICBjYWxsYmFjayA9IGFyZ3NbMF07XG4gICAgfSBlbHNlIGlmICh0eXBlb2YoYXJnc1swXSkgPT0gJ29iamVjdCcpIHtcbiAgICAgICAgb3B0cyA9IGFyZ3NbMF07XG4gICAgICAgIGNhbGxiYWNrID0gYXJnc1sxXTtcbiAgICB9XG4gICAgY2FsbGJhY2sgPSB1dGlsLmNvbnN0cnVjdENhbGxiYWNrQW5kUHJvbWlzZUhhbmRsZXIoY2FsbGJhY2ssIGRlZmVycmVkKTtcbiAgICB2YXIgZGVsZXRpb25Nb2RlID0gb3B0cy5kZWxldGlvbk1vZGUgfHwgJ3Jlc3RvcmUnO1xuICAgIC8vIEJ5IGRlZmF1bHQgd2UgZG8gbm90IG1hcCB0aGUgcmVzcG9uc2UgZnJvbSBhIERFTEVURSByZXF1ZXN0LlxuICAgIGlmIChvcHRzLnBhcnNlUmVzcG9uc2UgPT09IHVuZGVmaW5lZCkgb3B0cy5wYXJzZVJlc3BvbnNlID0gZmFsc2U7XG4gICAgX2h0dHBSZXNwb25zZS5jYWxsKGNvbGxlY3Rpb24sICdERUxFVEUnLCBwYXRoLCBvcHRzLCBmdW5jdGlvbihlcnIsIHgsIHksIHopIHtcbiAgICAgICAgaWYgKGVycikge1xuICAgICAgICAgICAgaWYgKGRlbGV0aW9uTW9kZSA9PSAncmVzdG9yZScpIHtcbiAgICAgICAgICAgICAgICBvYmplY3QucmVzdG9yZSgpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9IGVsc2UgaWYgKGRlbGV0aW9uTW9kZSA9PSAnc3VjY2VzcycpIHtcbiAgICAgICAgICAgIG9iamVjdC5yZW1vdmUoKTtcbiAgICAgICAgfVxuICAgICAgICBjYWxsYmFjayhlcnIsIHgsIHksIHopO1xuICAgIH0pO1xuICAgIGlmIChkZWxldGlvbk1vZGUgPT0gJ25vdycgfHwgZGVsZXRpb25Nb2RlID09ICdyZXN0b3JlJykge1xuICAgICAgICBvYmplY3QucmVtb3ZlKCk7XG4gICAgfVxuICAgIHJldHVybiBkZWZlcnJlZCA/IGRlZmVycmVkLnByb21pc2UgOiBudWxsO1xufVxuXG4vKipcbiAqIFNlbmQgYSBIVFRQIHJlcXVlc3QgdXNpbmcgdGhlIGdpdmVuIG1ldGhvZFxuICogQHBhcmFtIHtDb2xsZWN0aW9ufSBjb2xsZWN0aW9uXG4gKiBAcGFyYW0gcmVxdWVzdCBEb2VzIHRoZSByZXF1ZXN0IGNvbnRhaW4gZGF0YT8gZS5nLiBQT1NUL1BBVENIL1BVVCB3aWxsIGJlIHRydWUsIEdFVCB3aWxsIGZhbHNlXG4gKiBAcGFyYW0gbWV0aG9kXG4gKiBAaW50ZXJuYWxcbiAqIEByZXR1cm5zIHtQcm9taXNlfVxuICovXG5mdW5jdGlvbiBIVFRQX01FVEhPRChjb2xsZWN0aW9uLCByZXF1ZXN0LCBtZXRob2QpIHtcbiAgICB2YXIgYXJncyA9IEFycmF5LnByb3RvdHlwZS5zbGljZS5jYWxsKGFyZ3VtZW50cywgMyk7XG4gICAgcmV0dXJuIF8ucGFydGlhbChyZXF1ZXN0ID8gX2h0dHBSZXF1ZXN0IDogX2h0dHBSZXNwb25zZSwgbWV0aG9kKS5hcHBseShjb2xsZWN0aW9uLCBhcmdzKTtcbn1cblxuLyoqXG4gKiBTZW5kIGEgR0VUIHJlcXVlc3RcbiAqIEBwYXJhbSB7Q29sbGVjdGlvbn0gY29sbGVjdGlvblxuICogQHBhcmFtIHtTdHJpbmd9IHBhdGggVGhlIHBhdGggdG8gdGhlIHJlc291cmNlIHdlIHdhbnQgdG8gR0VUXG4gKiBAcGFyYW0ge09iamVjdHxGdW5jdGlvbn0gb3B0c09yQ2FsbGJhY2sgRWl0aGVyIGFuIG9wdGlvbnMgb2JqZWN0IG9yIGEgY2FsbGJhY2sgaWYgY2FuIHVzZSBkZWZhdWx0c1xuICogQHBhcmFtIHtGdW5jdGlvbn0gY2FsbGJhY2sgQ2FsbGJhY2sgaWYgb3B0cyBzcGVjaWZpZWQuXG4gKiBAcGFja2FnZSBIVFRQXG4gKiBAcmV0dXJucyB7UHJvbWlzZX1cbiAqL1xuZnVuY3Rpb24gR0VUKGNvbGxlY3Rpb24pIHtcbiAgICB2YXIgYXJncyA9IEFycmF5LnByb3RvdHlwZS5zbGljZS5jYWxsKGFyZ3VtZW50cywgMSk7XG4gICAgcmV0dXJuIF8ucGFydGlhbChIVFRQX01FVEhPRCwgY29sbGVjdGlvbiwgZmFsc2UsICdHRVQnKS5hcHBseSh0aGlzLCBhcmdzKTtcbn1cblxuLyoqXG4gKiBTZW5kIGFuIE9QVElPTlMgcmVxdWVzdFxuICogQHBhcmFtIHtDb2xsZWN0aW9ufSBjb2xsZWN0aW9uXG4gKiBAcGFyYW0ge1N0cmluZ30gcGF0aCBUaGUgcGF0aCB0byB0aGUgcmVzb3VyY2Ugd2Ugd2FudCB0byBHRVRcbiAqIEBwYXJhbSB7T2JqZWN0fEZ1bmN0aW9ufSBvcHRzT3JDYWxsYmFjayBFaXRoZXIgYW4gb3B0aW9ucyBvYmplY3Qgb3IgYSBjYWxsYmFjayBpZiBjYW4gdXNlIGRlZmF1bHRzXG4gKiBAcGFyYW0ge0Z1bmN0aW9ufSBjYWxsYmFjayBDYWxsYmFjayBpZiBvcHRzIHNwZWNpZmllZC5cbiAqIEBwYWNrYWdlIEhUVFBcbiAqIEByZXR1cm5zIHtQcm9taXNlfVxuICovXG5mdW5jdGlvbiBPUFRJT05TKGNvbGxlY3Rpb24pIHtcbiAgICB2YXIgYXJncyA9IEFycmF5LnByb3RvdHlwZS5zbGljZS5jYWxsKGFyZ3VtZW50cywgMSk7XG4gICAgcmV0dXJuIF8ucGFydGlhbChIVFRQX01FVEhPRCwgY29sbGVjdGlvbiwgZmFsc2UsICdPUFRJT05TJykuYXBwbHkodGhpcywgYXJncyk7XG59XG5cbi8qKlxuICogU2VuZCBhbiBUUkFDRSByZXF1ZXN0XG4gKiBAcGFyYW0ge0NvbGxlY3Rpb259IGNvbGxlY3Rpb25cbiAqIEBwYXJhbSB7U3RyaW5nfSBwYXRoIFRoZSBwYXRoIHRvIHRoZSByZXNvdXJjZSB3ZSB3YW50IHRvIEdFVFxuICogQHBhcmFtIHtPYmplY3R8RnVuY3Rpb259IG9wdHNPckNhbGxiYWNrIEVpdGhlciBhbiBvcHRpb25zIG9iamVjdCBvciBhIGNhbGxiYWNrIGlmIGNhbiB1c2UgZGVmYXVsdHNcbiAqIEBwYXJhbSB7RnVuY3Rpb259IGNhbGxiYWNrIENhbGxiYWNrIGlmIG9wdHMgc3BlY2lmaWVkLlxuICogQHBhY2thZ2UgSFRUUFxuICogQHJldHVybnMge1Byb21pc2V9XG4gKi9cbmZ1bmN0aW9uIFRSQUNFKGNvbGxlY3Rpb24pIHtcbiAgICB2YXIgYXJncyA9IEFycmF5LnByb3RvdHlwZS5zbGljZS5jYWxsKGFyZ3VtZW50cywgMSk7XG4gICAgcmV0dXJuIF8ucGFydGlhbChIVFRQX01FVEhPRCwgY29sbGVjdGlvbiwgZmFsc2UsICdUUkFDRScpLmFwcGx5KHRoaXMsIGFyZ3MpO1xufVxuXG4vKipcbiAqIFNlbmQgYW4gSEVBRCByZXF1ZXN0XG4gKiBAcGFyYW0ge0NvbGxlY3Rpb259IGNvbGxlY3Rpb25cbiAqIEBwYXJhbSB7U3RyaW5nfSBwYXRoIFRoZSBwYXRoIHRvIHRoZSByZXNvdXJjZSB3ZSB3YW50IHRvIEdFVFxuICogQHBhcmFtIHtPYmplY3R8RnVuY3Rpb259IG9wdHNPckNhbGxiYWNrIEVpdGhlciBhbiBvcHRpb25zIG9iamVjdCBvciBhIGNhbGxiYWNrIGlmIGNhbiB1c2UgZGVmYXVsdHNcbiAqIEBwYXJhbSB7RnVuY3Rpb259IGNhbGxiYWNrIENhbGxiYWNrIGlmIG9wdHMgc3BlY2lmaWVkLlxuICogQHBhY2thZ2UgSFRUUFxuICogQHJldHVybnMge1Byb21pc2V9XG4gKi9cbmZ1bmN0aW9uIEhFQUQoY29sbGVjdGlvbikge1xuICAgIHZhciBhcmdzID0gQXJyYXkucHJvdG90eXBlLnNsaWNlLmNhbGwoYXJndW1lbnRzLCAxKTtcbiAgICByZXR1cm4gXy5wYXJ0aWFsKEhUVFBfTUVUSE9ELCBjb2xsZWN0aW9uLCBmYWxzZSwgJ0hFQUQnKS5hcHBseSh0aGlzLCBhcmdzKTtcbn1cblxuLyoqXG4gKiBTZW5kIGFuIFBPU1QgcmVxdWVzdFxuICogQHBhcmFtIHtDb2xsZWN0aW9ufSBjb2xsZWN0aW9uXG4gKiBAcGFyYW0ge1N0cmluZ30gcGF0aCBUaGUgcGF0aCB0byB0aGUgcmVzb3VyY2Ugd2Ugd2FudCB0byBHRVRcbiAqIEBwYXJhbSB7U2llc3RhTW9kZWx9IG1vZGVsIFRoZSBtb2RlbCB0aGF0IHdlIHdvdWxkIGxpa2UgdG8gUE9TVFxuICogQHBhcmFtIHtPYmplY3R8RnVuY3Rpb259IG9wdHNPckNhbGxiYWNrIEVpdGhlciBhbiBvcHRpb25zIG9iamVjdCBvciBhIGNhbGxiYWNrIGlmIGNhbiB1c2UgZGVmYXVsdHNcbiAqIEBwYXJhbSB7RnVuY3Rpb259IGNhbGxiYWNrIENhbGxiYWNrIGlmIG9wdHMgc3BlY2lmaWVkLlxuICogQHBhY2thZ2UgSFRUUFxuICogQHJldHVybnMge1Byb21pc2V9XG4gKi9cbmZ1bmN0aW9uIFBPU1QoY29sbGVjdGlvbikge1xuICAgIHZhciBhcmdzID0gQXJyYXkucHJvdG90eXBlLnNsaWNlLmNhbGwoYXJndW1lbnRzLCAxKTtcbiAgICByZXR1cm4gXy5wYXJ0aWFsKEhUVFBfTUVUSE9ELCBjb2xsZWN0aW9uLCB0cnVlLCAnUE9TVCcpLmFwcGx5KHRoaXMsIGFyZ3MpO1xufVxuXG4vKipcbiAqIFNlbmQgYW4gUFVUIHJlcXVlc3RcbiAqIEBwYXJhbSB7Q29sbGVjdGlvbn0gY29sbGVjdGlvblxuICogQHBhcmFtIHtTdHJpbmd9IHBhdGggVGhlIHBhdGggdG8gdGhlIHJlc291cmNlIHdlIHdhbnQgdG8gR0VUXG4gKiBAcGFyYW0ge1NpZXN0YU1vZGVsfSBtb2RlbCBUaGUgbW9kZWwgdGhhdCB3ZSB3b3VsZCBsaWtlIHRvIFBPU1RcbiAqIEBwYXJhbSB7T2JqZWN0fEZ1bmN0aW9ufSBvcHRzT3JDYWxsYmFjayBFaXRoZXIgYW4gb3B0aW9ucyBvYmplY3Qgb3IgYSBjYWxsYmFjayBpZiBjYW4gdXNlIGRlZmF1bHRzXG4gKiBAcGFyYW0ge0Z1bmN0aW9ufSBjYWxsYmFjayBDYWxsYmFjayBpZiBvcHRzIHNwZWNpZmllZC5cbiAqIEBwYWNrYWdlIEhUVFBcbiAqIEByZXR1cm5zIHtQcm9taXNlfVxuICovXG5mdW5jdGlvbiBQVVQoY29sbGVjdGlvbikge1xuICAgIHZhciBhcmdzID0gQXJyYXkucHJvdG90eXBlLnNsaWNlLmNhbGwoYXJndW1lbnRzLCAxKTtcbiAgICByZXR1cm4gXy5wYXJ0aWFsKEhUVFBfTUVUSE9ELCBjb2xsZWN0aW9uLCB0cnVlLCAnUFVUJykuYXBwbHkodGhpcywgYXJncyk7XG59XG5cbi8qKlxuICogU2VuZCBhbiBQQVRDSCByZXF1ZXN0XG4gKiBAcGFyYW0ge0NvbGxlY3Rpb259IGNvbGxlY3Rpb25cbiAqIEBwYXJhbSB7U3RyaW5nfSBwYXRoIFRoZSBwYXRoIHRvIHRoZSByZXNvdXJjZSB3ZSB3YW50IHRvIEdFVFxuICogQHBhcmFtIHtTaWVzdGFNb2RlbH0gbW9kZWwgVGhlIG1vZGVsIHRoYXQgd2Ugd291bGQgbGlrZSB0byBQT1NUXG4gKiBAcGFyYW0ge09iamVjdHxGdW5jdGlvbn0gb3B0c09yQ2FsbGJhY2sgRWl0aGVyIGFuIG9wdGlvbnMgb2JqZWN0IG9yIGEgY2FsbGJhY2sgaWYgY2FuIHVzZSBkZWZhdWx0c1xuICogQHBhcmFtIHtGdW5jdGlvbn0gY2FsbGJhY2sgQ2FsbGJhY2sgaWYgb3B0cyBzcGVjaWZpZWQuXG4gKiBAcGFja2FnZSBIVFRQXG4gKiBAcmV0dXJucyB7UHJvbWlzZX1cbiAqL1xuZnVuY3Rpb24gUEFUQ0goY29sbGVjdGlvbikge1xuICAgIHZhciBhcmdzID0gQXJyYXkucHJvdG90eXBlLnNsaWNlLmNhbGwoYXJndW1lbnRzLCAxKTtcbiAgICByZXR1cm4gXy5wYXJ0aWFsKEhUVFBfTUVUSE9ELCBjb2xsZWN0aW9uLCB0cnVlLCAnUEFUQ0gnKS5hcHBseSh0aGlzLCBhcmdzKTtcbn1cblxuXG5pZiAoIXNpZXN0YS5leHQpIHtcbiAgICBzaWVzdGEuZXh0ID0ge307XG59XG5cblxudmFyIGFqYXg7XG5cblxuc2llc3RhLmV4dC5odHRwID0ge1xuICAgIFJlcXVlc3REZXNjcmlwdG9yOiByZXF1aXJlKCcuL3JlcXVlc3REZXNjcmlwdG9yJykuUmVxdWVzdERlc2NyaXB0b3IsXG4gICAgUmVzcG9uc2VEZXNjcmlwdG9yOiByZXF1aXJlKCcuL3Jlc3BvbnNlRGVzY3JpcHRvcicpLlJlc3BvbnNlRGVzY3JpcHRvcixcbiAgICBEZXNjcmlwdG9yOiBkZXNjcmlwdG9yLkRlc2NyaXB0b3IsXG4gICAgX3Jlc29sdmVNZXRob2Q6IGRlc2NyaXB0b3IucmVzb2x2ZU1ldGhvZCxcbiAgICBTZXJpYWxpc2VyOiByZXF1aXJlKCcuL3NlcmlhbGlzZXInKSxcbiAgICBEZXNjcmlwdG9yUmVnaXN0cnk6IHJlcXVpcmUoJy4vZGVzY3JpcHRvclJlZ2lzdHJ5JykuRGVzY3JpcHRvclJlZ2lzdHJ5LFxuICAgIHNldEFqYXg6IGZ1bmN0aW9uKF9hamF4KSB7XG4gICAgICAgIGFqYXggPSBfYWpheDtcbiAgICB9LFxuICAgIF9odHRwUmVzcG9uc2U6IF9odHRwUmVzcG9uc2UsXG4gICAgX2h0dHBSZXF1ZXN0OiBfaHR0cFJlcXVlc3QsXG4gICAgREVMRVRFOiBERUxFVEUsXG4gICAgSFRUUF9NRVRIT0Q6IEhUVFBfTUVUSE9ELFxuICAgIEdFVDogR0VULFxuICAgIFRSQUNFOiBUUkFDRSxcbiAgICBPUFRJT05TOiBPUFRJT05TLFxuICAgIEhFQUQ6IEhFQUQsXG4gICAgUE9TVDogUE9TVCxcbiAgICBQVVQ6IFBVVCxcbiAgICBQQVRDSDogUEFUQ0gsXG4gICAgX3NlcmlhbGlzZU9iamVjdDogX3NlcmlhbGlzZU9iamVjdFxufTtcblxuT2JqZWN0LmRlZmluZVByb3BlcnR5KHNpZXN0YS5leHQuaHR0cCwgJ2FqYXgnLCB7XG4gICAgZ2V0OiBmdW5jdGlvbigpIHtcbiAgICAgICAgdmFyIGEgPSBhamF4IHx8ICgkID8gJC5hamF4IDogbnVsbCkgfHwgKGpRdWVyeSA/IGpRdWVyeS5hamF4IDogbnVsbCk7XG4gICAgICAgIGlmICghYSkge1xuICAgICAgICAgICAgdGhyb3cgbmV3IEludGVybmFsU2llc3RhRXJyb3IoJ2FqYXggaGFzIG5vdCBiZWVuIGRlZmluZWQgYW5kIGNvdWxkIG5vdCBmaW5kICQuYWpheCBvciBqUXVlcnkuYWpheCcpO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBhO1xuICAgIH0sXG4gICAgc2V0OiBmdW5jdGlvbih2KSB7XG4gICAgICAgIGFqYXggPSB2O1xuICAgIH1cbn0pOyIsIi8qKlxuICogQG1vZHVsZSBodHRwXG4gKi9cblxudmFyIERlc2NyaXB0b3IgPSByZXF1aXJlKCcuL2Rlc2NyaXB0b3InKS5EZXNjcmlwdG9yXG4gICAgLCBTZXJpYWxpc2VyID0gcmVxdWlyZSgnLi9zZXJpYWxpc2VyJyk7XG5cbnZhciBfaSA9IHNpZXN0YS5faW50ZXJuYWxcbiAgICAsIHV0aWwgPSBfaS51dGlsXG4gICAgLCBsb2cgPSBfaS5sb2dcbiAgICAsIGRlZmluZVN1YlByb3BlcnR5ID0gX2kubWlzYy5kZWZpbmVTdWJQcm9wZXJ0eVxuO1xuXG52YXIgTG9nZ2VyID0gbG9nLmxvZ2dlcldpdGhOYW1lKCdSZXF1ZXN0RGVzY3JpcHRvcicpO1xuTG9nZ2VyLnNldExldmVsKGxvZy5MZXZlbC53YXJuKTtcblxuLyoqXG4gKiBAY2xhc3MgRGVzY3JpYmVzIGEgSFRUUCByZXF1ZXN0XG4gKiBAcGFyYW0ge09iamVjdH0gb3B0c1xuICovXG5mdW5jdGlvbiBSZXF1ZXN0RGVzY3JpcHRvcihvcHRzKSB7XG4gICAgaWYgKCF0aGlzKSB7XG4gICAgICAgIHJldHVybiBuZXcgUmVxdWVzdERlc2NyaXB0b3Iob3B0cyk7XG4gICAgfVxuXG4gICAgRGVzY3JpcHRvci5jYWxsKHRoaXMsIG9wdHMpO1xuICAgIGlmICh0aGlzLl9vcHRzWydzZXJpYWxpemVyJ10pIHtcbiAgICAgICAgdGhpcy5fb3B0cy5zZXJpYWxpc2VyID0gdGhpcy5fb3B0c1snc2VyaWFsaXplciddO1xuICAgIH1cblxuICAgIGlmICghdGhpcy5fb3B0cy5zZXJpYWxpc2VyKSB7XG4gICAgICAgIHRoaXMuX29wdHMuc2VyaWFsaXNlciA9IFNlcmlhbGlzZXIuZGVwdGhTZXJpYWxpemVyKDApO1xuICAgIH1cblxuXG4gICAgZGVmaW5lU3ViUHJvcGVydHkuY2FsbCh0aGlzLCAnc2VyaWFsaXNlcicsIHRoaXMuX29wdHMpO1xuICAgIGRlZmluZVN1YlByb3BlcnR5LmNhbGwodGhpcywgJ3NlcmlhbGl6ZXInLCB0aGlzLl9vcHRzLCAnc2VyaWFsaXNlcicpO1xuXG59XG5cblJlcXVlc3REZXNjcmlwdG9yLnByb3RvdHlwZSA9IE9iamVjdC5jcmVhdGUoRGVzY3JpcHRvci5wcm90b3R5cGUpO1xuXG5cblJlcXVlc3REZXNjcmlwdG9yLnByb3RvdHlwZS5fc2VyaWFsaXNlID0gZnVuY3Rpb24gKG9iaiwgY2FsbGJhY2spIHtcbiAgICB2YXIgZGVmZXJyZWQgPSB3aW5kb3cucSA/IHdpbmRvdy5xLmRlZmVyKCkgOiBudWxsO1xuICAgIGNhbGxiYWNrID0gdXRpbC5jb25zdHJ1Y3RDYWxsYmFja0FuZFByb21pc2VIYW5kbGVyKGNhbGxiYWNrLCBkZWZlcnJlZCk7XG4gICAgdmFyIHNlbGYgPSB0aGlzO1xuICAgIGlmIChMb2dnZXIudHJhY2UuaXNFbmFibGVkKVxuICAgICAgICBMb2dnZXIudHJhY2UoJ19zZXJpYWxpc2UnKTtcbiAgICB2YXIgZmluaXNoZWQ7XG4gICAgdmFyIGRhdGEgPSB0aGlzLnNlcmlhbGlzZXIob2JqLCBmdW5jdGlvbiAoZXJyLCBkYXRhKSB7XG4gICAgICAgIGlmICghZmluaXNoZWQpIHtcbiAgICAgICAgICAgIGRhdGEgPSBzZWxmLl90cmFuc2Zvcm1EYXRhKGRhdGEpO1xuICAgICAgICAgICAgaWYgKGNhbGxiYWNrKSBjYWxsYmFjayhlcnIsIHNlbGYuX2VtYmVkRGF0YShkYXRhKSk7XG4gICAgICAgIH1cbiAgICB9KTtcbiAgICBpZiAoZGF0YSAhPT0gdW5kZWZpbmVkKSB7XG4gICAgICAgIGlmIChMb2dnZXIudHJhY2UuaXNFbmFibGVkKVxuICAgICAgICAgICAgTG9nZ2VyLnRyYWNlKCdzZXJpYWxpc2VyIGRvZXNudCB1c2UgYSBjYWxsYmFjaycpO1xuICAgICAgICBmaW5pc2hlZCA9IHRydWU7XG4gICAgICAgIGRhdGEgPSBzZWxmLl90cmFuc2Zvcm1EYXRhKGRhdGEpO1xuICAgICAgICBpZiAoY2FsbGJhY2spIGNhbGxiYWNrKG51bGwsIHNlbGYuX2VtYmVkRGF0YShkYXRhKSk7XG4gICAgfVxuICAgIGVsc2Uge1xuICAgICAgICBpZiAoTG9nZ2VyLnRyYWNlLmlzRW5hYmxlZClcbiAgICAgICAgICAgIExvZ2dlci50cmFjZSgnc2VyaWFsaXNlciB1c2VzIGEgY2FsbGJhY2snLCB0aGlzLnNlcmlhbGlzZXIpO1xuICAgIH1cbiAgICByZXR1cm4gZGVmZXJyZWQgPyBkZWZlcnJlZC5wcm9taXNlIDogbnVsbDtcbn07XG5cblJlcXVlc3REZXNjcmlwdG9yLnByb3RvdHlwZS5fZHVtcCA9IGZ1bmN0aW9uIChhc0pzb24pIHtcbiAgICB2YXIgb2JqID0ge307XG4gICAgb2JqLm1ldGhvZHMgPSB0aGlzLm1ldGhvZDtcbiAgICBvYmoubWFwcGluZyA9IHRoaXMubWFwcGluZy50eXBlO1xuICAgIG9iai5wYXRoID0gdGhpcy5fcmF3T3B0cy5wYXRoO1xuICAgIHZhciBzZXJpYWxpc2VyO1xuICAgIGlmICh0eXBlb2YodGhpcy5fcmF3T3B0cy5zZXJpYWxpc2VyKSA9PSAnZnVuY3Rpb24nKSB7XG4gICAgICAgIHNlcmlhbGlzZXIgPSAnZnVuY3Rpb24gKCkgeyAuLi4gfSdcbiAgICB9XG4gICAgZWxzZSB7XG4gICAgICAgIHNlcmlhbGlzZXIgPSB0aGlzLl9yYXdPcHRzLnNlcmlhbGlzZXI7XG4gICAgfVxuICAgIG9iai5zZXJpYWxpc2VyID0gc2VyaWFsaXNlcjtcbiAgICB2YXIgdHJhbnNmb3JtcyA9IHt9O1xuICAgIGZvciAodmFyIGYgaW4gdGhpcy50cmFuc2Zvcm1zKSB7XG4gICAgICAgIGlmICh0aGlzLnRyYW5zZm9ybXMuaGFzT3duUHJvcGVydHkoZikpIHtcbiAgICAgICAgICAgIHZhciB0cmFuc2Zvcm0gPSB0aGlzLnRyYW5zZm9ybXNbZl07XG4gICAgICAgICAgICBpZiAodHlwZW9mKHRyYW5zZm9ybSkgPT0gJ2Z1bmN0aW9uJykge1xuICAgICAgICAgICAgICAgIHRyYW5zZm9ybXNbZl0gPSAnZnVuY3Rpb24gKCkgeyAuLi4gfSdcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgICAgIHRyYW5zZm9ybXNbZl0gPSB0aGlzLnRyYW5zZm9ybXNbZl07XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9XG4gICAgb2JqLnRyYW5zZm9ybXMgPSB0cmFuc2Zvcm1zO1xuICAgIHJldHVybiBhc0pzb24gPyBKU09OLnN0cmluZ2lmeShvYmosIG51bGwsIDQpIDogb2JqO1xufTtcblxuZXhwb3J0cy5SZXF1ZXN0RGVzY3JpcHRvciA9IFJlcXVlc3REZXNjcmlwdG9yO1xuIiwiLyoqXG4gKiBAbW9kdWxlIGh0dHBcbiAqL1xuXG5cbnZhciBEZXNjcmlwdG9yID0gcmVxdWlyZSgnLi9kZXNjcmlwdG9yJykuRGVzY3JpcHRvcjtcblxuLyoqXG4gKiBEZXNjcmliZXMgd2hhdCB0byBkbyB3aXRoIGEgSFRUUCByZXNwb25zZS5cbiAqIEBjb25zdHJ1Y3RvclxuICogQGltcGxlbWVudHMge0Rlc2NyaXB0b3J9XG4gKiBAcGFyYW0ge09iamVjdH0gb3B0c1xuICovXG5mdW5jdGlvbiBSZXNwb25zZURlc2NyaXB0b3Iob3B0cykge1xuICAgIGlmICghdGhpcykge1xuICAgICAgICByZXR1cm4gbmV3IFJlc3BvbnNlRGVzY3JpcHRvcihvcHRzKTtcbiAgICB9XG4gICAgRGVzY3JpcHRvci5jYWxsKHRoaXMsIG9wdHMpO1xufVxuXG5SZXNwb25zZURlc2NyaXB0b3IucHJvdG90eXBlID0gT2JqZWN0LmNyZWF0ZShEZXNjcmlwdG9yLnByb3RvdHlwZSk7XG5cblJlc3BvbnNlRGVzY3JpcHRvci5wcm90b3R5cGUuX2V4dHJhY3REYXRhID0gZnVuY3Rpb24gKGRhdGEpIHtcbiAgICB2YXIgZXh0cmFjdGVkRGF0YSA9IERlc2NyaXB0b3IucHJvdG90eXBlLl9leHRyYWN0RGF0YS5jYWxsKHRoaXMsIGRhdGEpO1xuICAgIGlmIChleHRyYWN0ZWREYXRhKSB7XG4gICAgICAgIGV4dHJhY3RlZERhdGEgPSB0aGlzLl90cmFuc2Zvcm1EYXRhKGV4dHJhY3RlZERhdGEpO1xuICAgIH1cbiAgICByZXR1cm4gZXh0cmFjdGVkRGF0YTtcbn07XG5cblJlc3BvbnNlRGVzY3JpcHRvci5wcm90b3R5cGUuX21hdGNoRGF0YSA9IGZ1bmN0aW9uIChkYXRhKSB7XG4gICAgdmFyIGV4dHJhY3RlZERhdGEgPSBEZXNjcmlwdG9yLnByb3RvdHlwZS5fbWF0Y2hEYXRhLmNhbGwodGhpcywgZGF0YSk7XG4gICAgaWYgKGV4dHJhY3RlZERhdGEpIHtcbiAgICAgICAgZXh0cmFjdGVkRGF0YSA9IHRoaXMuX3RyYW5zZm9ybURhdGEoZXh0cmFjdGVkRGF0YSk7XG4gICAgfVxuICAgIHJldHVybiBleHRyYWN0ZWREYXRhO1xufTtcblxuUmVzcG9uc2VEZXNjcmlwdG9yLnByb3RvdHlwZS5fZHVtcCA9IGZ1bmN0aW9uIChhc0pzb24pIHtcbiAgICB2YXIgb2JqID0ge307XG4gICAgb2JqLm1ldGhvZHMgPSB0aGlzLm1ldGhvZDtcbiAgICBvYmoubWFwcGluZyA9IHRoaXMubWFwcGluZy50eXBlO1xuICAgIG9iai5wYXRoID0gdGhpcy5fcmF3T3B0cy5wYXRoO1xuICAgIHZhciB0cmFuc2Zvcm1zID0ge307XG4gICAgZm9yICh2YXIgZiBpbiB0aGlzLnRyYW5zZm9ybXMpIHtcbiAgICAgICAgaWYgKHRoaXMudHJhbnNmb3Jtcy5oYXNPd25Qcm9wZXJ0eShmKSkge1xuICAgICAgICAgICAgdmFyIHRyYW5zZm9ybSA9IHRoaXMudHJhbnNmb3Jtc1tmXTtcbiAgICAgICAgICAgIGlmICh0eXBlb2YodHJhbnNmb3JtKSA9PSAnZnVuY3Rpb24nKSB7XG4gICAgICAgICAgICAgICAgdHJhbnNmb3Jtc1tmXSA9ICdmdW5jdGlvbiAoKSB7IC4uLiB9J1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICAgICAgdHJhbnNmb3Jtc1tmXSA9IHRoaXMudHJhbnNmb3Jtc1tmXTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH1cbiAgICBvYmoudHJhbnNmb3JtcyA9IHRyYW5zZm9ybXM7XG4gICAgcmV0dXJuIGFzSnNvbiA/IEpTT04uc3RyaW5naWZ5KG9iaiwgbnVsbCwgNCkgOiBvYmo7XG59O1xuXG5leHBvcnRzLlJlc3BvbnNlRGVzY3JpcHRvciA9IFJlc3BvbnNlRGVzY3JpcHRvcjsiLCIvKipcbiAqIEBtb2R1bGUgaHR0cFxuICovXG5cbnZhciBfaSA9IHNpZXN0YS5faW50ZXJuYWw7XG5cbnZhciBsb2cgPSBfaS5sb2dcbiAgICAsIHV0aWxzID0gX2kudXRpbDtcbnZhciBMb2dnZXIgPSBsb2cubG9nZ2VyV2l0aE5hbWUoJ1NlcmlhbGlzZXInKTtcbkxvZ2dlci5zZXRMZXZlbChsb2cuTGV2ZWwud2Fybik7XG52YXIgXyA9IHV0aWxzLl87XG5cbi8qKlxuICogU2VyaWFsaXNlcyBhbiBvYmplY3QgaW50byBpdCdzIHJlbW90ZSBpZGVudGlmaWVyIChhcyBkZWZpbmVkIGJ5IHRoZSBtYXBwaW5nKVxuICogQHBhcmFtICB7U2llc3RhTW9kZWx9IG9ialxuICogQHJldHVybiB7U3RyaW5nfVxuICogXG4gKi9cbmZ1bmN0aW9uIGlkU2VyaWFsaXNlcihvYmopIHtcbiAgICB2YXIgaWRGaWVsZCA9IG9iai5tYXBwaW5nLmlkO1xuICAgIGlmIChpZEZpZWxkKSB7XG4gICAgICAgIHJldHVybiBvYmpbaWRGaWVsZF0gPyBvYmpbaWRGaWVsZF0gOiBudWxsO1xuICAgIH1cbiAgICBlbHNlIHtcbiAgICAgICAgaWYgKExvZ2dlci5kZWJ1Zy5pc0VuYWJsZWQpXG4gICAgICAgICAgICBMb2dnZXIuZGVidWcoJ05vIGlkZmllbGQnKTtcbiAgICAgICAgcmV0dXJuIHVuZGVmaW5lZDtcbiAgICB9XG59XG5cbi8qKlxuICogU2VyaWFsaXNlcyBvYmogZm9sbG93aW5nIHJlbGF0aW9uc2hpcHMgdG8gc3BlY2lmaWVkIGRlcHRoLlxuICogQHBhcmFtICB7SW50ZWdlcn0gICBkZXB0aFxuICogQHBhcmFtICB7U2llc3RhTW9kZWx9ICAgb2JqXG4gKiBAcGFyYW0gIHtGdW5jdGlvbn0gZG9uZSBcbiAqL1xuZnVuY3Rpb24gZGVwdGhTZXJpYWxpc2VyKGRlcHRoLCBvYmosIGRvbmUpIHtcbiAgICBpZiAoTG9nZ2VyLnRyYWNlLmlzRW5hYmxlZClcbiAgICAgICAgTG9nZ2VyLnRyYWNlKCdkZXB0aFNlcmlhbGlzZXInKTtcbiAgICB2YXIgZGF0YSA9IHt9O1xuICAgIF8uZWFjaChvYmouX2ZpZWxkcywgZnVuY3Rpb24gKGYpIHtcbiAgICAgICAgaWYgKExvZ2dlci50cmFjZS5pc0VuYWJsZWQpXG4gICAgICAgICAgICBMb2dnZXIudHJhY2UoJ2ZpZWxkJywgZik7XG4gICAgICAgIGlmIChvYmpbZl0pIHtcbiAgICAgICAgICAgIGRhdGFbZl0gPSBvYmpbZl07XG4gICAgICAgIH1cbiAgICB9KTtcbiAgICB2YXIgd2FpdGluZyA9IFtdO1xuICAgIHZhciBlcnJvcnMgPSBbXTtcbiAgICB2YXIgcmVzdWx0ID0ge307XG4gICAgdmFyIGZpbmlzaGVkID0gW107XG4gICAgXy5lYWNoKG9iai5fcmVsYXRpb25zaGlwRmllbGRzLCBmdW5jdGlvbiAoZikge1xuICAgICAgICBpZiAoTG9nZ2VyLnRyYWNlLmlzRW5hYmxlZClcbiAgICAgICAgICAgIExvZ2dlci50cmFjZSgncmVsYXRpb25zaGlwRmllbGQnLCBmKTtcbiAgICAgICAgdmFyIHByb3h5ID0gb2JqW2YgKyAnUHJveHknXTtcbiAgICAgICAgaWYgKHByb3h5LmlzRm9yd2FyZCkgeyAvLyBCeSBkZWZhdWx0IG9ubHkgZm9yd2FyZCByZWxhdGlvbnNoaXAuXG4gICAgICAgICAgICBpZiAoTG9nZ2VyLmRlYnVnLmlzRW5hYmxlZClcbiAgICAgICAgICAgICAgICBMb2dnZXIuZGVidWcoZik7XG4gICAgICAgICAgICB3YWl0aW5nLnB1c2goZik7XG4gICAgICAgICAgICBwcm94eS5nZXQoZnVuY3Rpb24gKGVyciwgdikge1xuICAgICAgICAgICAgICAgIGlmIChMb2dnZXIudHJhY2UuaXNFbmFibGVkKVxuICAgICAgICAgICAgICAgICAgICBMb2dnZXIudHJhY2UoJ3Byb3h5LmdldCcsIGYpO1xuICAgICAgICAgICAgICAgIGlmIChMb2dnZXIuZGVidWcuaXNFbmFibGVkKVxuICAgICAgICAgICAgICAgICAgICBMb2dnZXIuZGVidWcoZiwgdik7XG4gICAgICAgICAgICAgICAgaWYgKGVycikge1xuICAgICAgICAgICAgICAgICAgICBlcnJvcnMucHVzaChlcnIpO1xuICAgICAgICAgICAgICAgICAgICBmaW5pc2hlZC5wdXNoKGYpO1xuICAgICAgICAgICAgICAgICAgICByZXN1bHRbZl0gPSB7ZXJyOiBlcnIsIHY6IHZ9O1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBlbHNlIGlmICh2KSB7XG4gICAgICAgICAgICAgICAgICAgIGlmICghZGVwdGgpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGZpbmlzaGVkLnB1c2goZik7XG4gICAgICAgICAgICAgICAgICAgICAgICBkYXRhW2ZdID0gdltvYmpbZiArICdQcm94eSddLmZvcndhcmRNYXBwaW5nLmlkXTtcbiAgICAgICAgICAgICAgICAgICAgICAgIHJlc3VsdFtmXSA9IHtlcnI6IGVyciwgdjogdn07XG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAoKHdhaXRpbmcubGVuZ3RoID09IGZpbmlzaGVkLmxlbmd0aCkgJiYgZG9uZSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGRvbmUoZXJyb3JzLmxlbmd0aCA/IGVycm9ycyA6IG51bGwsIGRhdGEsIHJlc3VsdCk7XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBkZXB0aFNlcmlhbGlzZXIoZGVwdGggLSAxLCB2LCBmdW5jdGlvbiAoZXJyLCBzdWJEYXRhLCByZXNwKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgKGVycikge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBlcnJvcnMucHVzaChlcnIpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZGF0YVtmXSA9IHN1YkRhdGE7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGZpbmlzaGVkLnB1c2goZik7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcmVzdWx0W2ZdID0ge2VycjogZXJyLCB2OiB2LCByZXNwOiByZXNwfTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiAoKHdhaXRpbmcubGVuZ3RoID09IGZpbmlzaGVkLmxlbmd0aCkgJiYgZG9uZSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBkb25lKGVycm9ycy5sZW5ndGggPyBlcnJvcnMgOiBudWxsLCBkYXRhLCByZXN1bHQpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICBpZiAoTG9nZ2VyLmRlYnVnLmlzRW5hYmxlZClcbiAgICAgICAgICAgICAgICAgICAgICAgIExvZ2dlci5kZWJ1Zygnbm8gdmFsdWUgZm9yICcgKyBmKTtcbiAgICAgICAgICAgICAgICAgICAgZmluaXNoZWQucHVzaChmKTtcbiAgICAgICAgICAgICAgICAgICAgcmVzdWx0W2ZdID0ge2VycjogZXJyLCB2OiB2fTtcbiAgICAgICAgICAgICAgICAgICAgaWYgKCh3YWl0aW5nLmxlbmd0aCA9PSBmaW5pc2hlZC5sZW5ndGgpICYmIGRvbmUpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGRvbmUoZXJyb3JzLmxlbmd0aCA/IGVycm9ycyA6IG51bGwsIGRhdGEsIHJlc3VsdCk7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfVxuICAgIH0pO1xuICAgIGlmICghd2FpdGluZy5sZW5ndGgpIHtcbiAgICAgICAgaWYgKGRvbmUpIGRvbmUobnVsbCwgZGF0YSwge30pO1xuICAgIH1cbn1cblxuXG5leHBvcnRzLmRlcHRoU2VyaWFsaXNlciA9IGZ1bmN0aW9uIChkZXB0aCkge1xuICAgIHJldHVybiAgXy5wYXJ0aWFsKGRlcHRoU2VyaWFsaXNlciwgZGVwdGgpO1xufTtcbmV4cG9ydHMuZGVwdGhTZXJpYWxpemVyID0gZnVuY3Rpb24gKGRlcHRoKSB7XG4gICAgcmV0dXJuICBfLnBhcnRpYWwoZGVwdGhTZXJpYWxpc2VyLCBkZXB0aCk7XG59O1xuZXhwb3J0cy5pZFNlcmlhbGl6ZXIgPSBpZFNlcmlhbGlzZXI7XG5leHBvcnRzLmlkU2VyaWFsaXNlciA9IGlkU2VyaWFsaXNlcjtcblxuIl19
