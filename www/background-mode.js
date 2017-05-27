var exec    = require('cordova/exec'),
    channel = require('cordova/channel');

/**
 * Activates the background mode. When activated the application
 * will be prevented from going to sleep while in background
 * for the next time.
 *
 * @return [ Void ]
 */
exports.enable = function() {
    if (this.isEnabled())
        return;

    var fn = function() {
            exports._isEnabled = true;
            exports.fireEvent('enable');
        };

    cordova.exec(fn, null, 'BackgroundMode', 'enable', []);
};

/**
 * Deactivates the background mode. When deactivated the application
 * will not stay awake while in background.
 *
 * @return [ Void ]
 */
exports.disable = function() {
    if (!this.isEnabled())
        return;

    var fn = function() {
            exports._isEnabled = false;
            exports.fireEvent('disable');
        };

    cordova.exec(fn, null, 'BackgroundMode', 'disable', []);
};

/**
 * Enable or disable the background mode.
 *
 * @param [ Bool ] enable The status to set for.
 *
 * @return [ Void ]
 */
exports.setEnabled = function (enable) {
    if (enable) {
        this.enable();
    } else {
        this.disable();
    }
};


/**
 * The actual applied settings.
 *
 * @return [ Object ]
 */
exports.getSettings = function() {
    return this._settings || {};
};


/**
 * If the mode is enabled or disabled.
 *
 * @return [ Boolean ]
 */
exports.isEnabled = function() {
    return this._isEnabled !== false;
};

/**
 * If the mode is active.
 *
 * @return [ Boolean ]
 */
exports.isActive = function() {
    return this._isActive !== false;
};


/**********
 * EVENTS *
 **********/

exports._listener = {};

/**
 * Fire event with given arguments.
 *
 * @param [ String ] event The event's name.
 * @param [ Array<Object> ] The callback's arguments.
 *
 * @return [ Void ]
 */
exports.fireEvent = function (event) {
    var args     = Array.apply(null, arguments).slice(1),
        listener = this._listener[event];

    if (!listener)
        return;

    for (var i = 0; i < listener.length; i++) {
        var fn    = listener[i][0],
            scope = listener[i][1];

        fn.apply(scope, args);
    }
};

/**
 * Register callback for given event.
 *
 * @param [ String ] event The event's name.
 * @param [ Function ] callback The function to be exec as callback.
 * @param [ Object ] scope The callback function's scope.
 *
 * @return [ Void ]
 */
exports.on = function (event, callback, scope) {

    if (typeof callback !== "function")
        return;

    if (!this._listener[event]) {
        this._listener[event] = [];
    }

    var item = [callback, scope || window];

    this._listener[event].push(item);
};

/**
 * Unregister callback for given event.
 *
 * @param [ String ] event The event's name.
 * @param [ Function ] callback The function to be exec as callback.
 *
 * @return [ Void ]
 */
exports.un = function (event, callback) {
    var listener = this._listener[event];

    if (!listener)
        return;

    for (var i = 0; i < listener.length; i++) {
        var fn = listener[i][0];

        if (fn == callback) {
            listener.splice(i, 1);
            break;
        }
    }
};
exports.off = exports.un;


/***********
 * PRIVATE *
 ***********/

/**
 * @private
 *
 * Flag indicates if the mode is enabled.
 */
exports._isEnabled = false;

/**
 * @private
 *
 * Flag indicates if the mode is active.
 */
exports._isActive = false;



/**
 * @private
 *
 * Merge settings with default values.
 *
 * @param [ Object ] options The custom options.
 * @param [ Object ] toMergeIn The options to merge in.
 *
 * @return [ Object ] Default values merged with custom values.
 */
exports._mergeObjects = function (options, toMergeIn) {
    for (var key in toMergeIn) {
        if (!options.hasOwnProperty(key)) {
            options[key] = toMergeIn[key];
            continue;
        }
    }

    return options;
};

/**
 * @private
 *
 * Setter for the isActive flag. Resets the
 * settings if the mode isnt active anymore.
 *
 * @param [ Boolean] value The new value for the flag.
 *
 * @return [ Void ]
 */
exports._setActive = function(value) {
    if (this._isActive == value)
        return;

    this._isActive = value;
    this._settings = value ? this._mergeObjects({}, {}) : {};
};

/**
 * @private
 *
 * Initialize the plugin.
 *
 * Method should be called after the 'deviceready' event
 * but before the event listeners will be called.
 *
 * @return [ Void ]
 */
exports._pluginInitialize = function() {
    this._isAndroid = false;//device.platform.match(/^android|amazon/i) !== null;
    //this.setDefaults({});

    if (device.platform == 'browser') {
        this.enable();
        this._isEnabled = true;
    }

    this._isActive  = this._isActive || device.platform == 'browser';
};

// Called before 'deviceready' listener will be called
channel.onCordovaReady.subscribe(function() {
    channel.onCordovaInfoReady.subscribe(function() {
        exports._pluginInitialize();
    });
});

// Called after 'deviceready' event
channel.deviceready.subscribe(function() {
    if (exports.isEnabled()) {
        exports.fireEvent('enable');
    }

    if (exports.isActive()) {
        exports.fireEvent('activate');
    }
});
