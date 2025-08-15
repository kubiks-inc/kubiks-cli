"use strict";
var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __esm = (fn, res) => function __init() {
  return fn && (res = (0, fn[__getOwnPropNames(fn)[0]])(fn = 0)), res;
};
var __commonJS = (cb, mod2) => function __require() {
  return mod2 || (0, cb[__getOwnPropNames(cb)[0]])((mod2 = { exports: {} }).exports, mod2), mod2.exports;
};
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to2, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to2, key) && key !== except)
        __defProp(to2, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to2;
};
var __toESM = (mod2, isNodeMode, target) => (target = mod2 != null ? __create(__getProtoOf(mod2)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod2 || !mod2.__esModule ? __defProp(target, "default", { value: mod2, enumerable: true }) : target,
  mod2
));
var __toCommonJS = (mod2) => __copyProps(__defProp({}, "__esModule", { value: true }), mod2);

// node_modules/@opentelemetry/api/build/esm/platform/node/globalThis.js
var _globalThis;
var init_globalThis = __esm({
  "node_modules/@opentelemetry/api/build/esm/platform/node/globalThis.js"() {
    _globalThis = typeof globalThis === "object" ? globalThis : global;
  }
});

// node_modules/@opentelemetry/api/build/esm/platform/node/index.js
var init_node = __esm({
  "node_modules/@opentelemetry/api/build/esm/platform/node/index.js"() {
    init_globalThis();
  }
});

// node_modules/@opentelemetry/api/build/esm/platform/index.js
var init_platform = __esm({
  "node_modules/@opentelemetry/api/build/esm/platform/index.js"() {
    init_node();
  }
});

// node_modules/@opentelemetry/api/build/esm/version.js
var VERSION;
var init_version = __esm({
  "node_modules/@opentelemetry/api/build/esm/version.js"() {
    VERSION = "1.8.0";
  }
});

// node_modules/@opentelemetry/api/build/esm/internal/semver.js
function _makeCompatibilityCheck(ownVersion) {
  var acceptedVersions = /* @__PURE__ */ new Set([ownVersion]);
  var rejectedVersions = /* @__PURE__ */ new Set();
  var myVersionMatch = ownVersion.match(re);
  if (!myVersionMatch) {
    return function () {
      return false;
    };
  }
  var ownVersionParsed = {
    major: +myVersionMatch[1],
    minor: +myVersionMatch[2],
    patch: +myVersionMatch[3],
    prerelease: myVersionMatch[4]
  };
  if (ownVersionParsed.prerelease != null) {
    return function isExactmatch(globalVersion) {
      return globalVersion === ownVersion;
    };
  }
  function _reject(v) {
    rejectedVersions.add(v);
    return false;
  }
  function _accept(v) {
    acceptedVersions.add(v);
    return true;
  }
  return function isCompatible2(globalVersion) {
    if (acceptedVersions.has(globalVersion)) {
      return true;
    }
    if (rejectedVersions.has(globalVersion)) {
      return false;
    }
    var globalVersionMatch = globalVersion.match(re);
    if (!globalVersionMatch) {
      return _reject(globalVersion);
    }
    var globalVersionParsed = {
      major: +globalVersionMatch[1],
      minor: +globalVersionMatch[2],
      patch: +globalVersionMatch[3],
      prerelease: globalVersionMatch[4]
    };
    if (globalVersionParsed.prerelease != null) {
      return _reject(globalVersion);
    }
    if (ownVersionParsed.major !== globalVersionParsed.major) {
      return _reject(globalVersion);
    }
    if (ownVersionParsed.major === 0) {
      if (ownVersionParsed.minor === globalVersionParsed.minor && ownVersionParsed.patch <= globalVersionParsed.patch) {
        return _accept(globalVersion);
      }
      return _reject(globalVersion);
    }
    if (ownVersionParsed.minor <= globalVersionParsed.minor) {
      return _accept(globalVersion);
    }
    return _reject(globalVersion);
  };
}
var re, isCompatible;
var init_semver = __esm({
  "node_modules/@opentelemetry/api/build/esm/internal/semver.js"() {
    init_version();
    re = /^(\d+)\.(\d+)\.(\d+)(-(.+))?$/;
    isCompatible = _makeCompatibilityCheck(VERSION);
  }
});

// node_modules/@opentelemetry/api/build/esm/internal/global-utils.js
function registerGlobal(type, instance, diag3, allowOverride) {
  var _a;
  if (allowOverride === void 0) {
    allowOverride = false;
  }
  var api = _global[GLOBAL_OPENTELEMETRY_API_KEY] = (_a = _global[GLOBAL_OPENTELEMETRY_API_KEY]) !== null && _a !== void 0 ? _a : {
    version: VERSION
  };
  if (!allowOverride && api[type]) {
    var err = new Error("@opentelemetry/api: Attempted duplicate registration of API: " + type);
    diag3.error(err.stack || err.message);
    return false;
  }
  if (api.version !== VERSION) {
    var err = new Error("@opentelemetry/api: Registration of version v" + api.version + " for " + type + " does not match previously registered API v" + VERSION);
    diag3.error(err.stack || err.message);
    return false;
  }
  api[type] = instance;
  diag3.debug("@opentelemetry/api: Registered a global for " + type + " v" + VERSION + ".");
  return true;
}
function getGlobal(type) {
  var _a, _b;
  var globalVersion = (_a = _global[GLOBAL_OPENTELEMETRY_API_KEY]) === null || _a === void 0 ? void 0 : _a.version;
  if (!globalVersion || !isCompatible(globalVersion)) {
    return;
  }
  return (_b = _global[GLOBAL_OPENTELEMETRY_API_KEY]) === null || _b === void 0 ? void 0 : _b[type];
}
function unregisterGlobal(type, diag3) {
  diag3.debug("@opentelemetry/api: Unregistering a global for " + type + " v" + VERSION + ".");
  var api = _global[GLOBAL_OPENTELEMETRY_API_KEY];
  if (api) {
    delete api[type];
  }
}
var major, GLOBAL_OPENTELEMETRY_API_KEY, _global;
var init_global_utils = __esm({
  "node_modules/@opentelemetry/api/build/esm/internal/global-utils.js"() {
    init_platform();
    init_version();
    init_semver();
    major = VERSION.split(".")[0];
    GLOBAL_OPENTELEMETRY_API_KEY = Symbol.for("opentelemetry.js.api." + major);
    _global = _globalThis;
  }
});

// node_modules/@opentelemetry/api/build/esm/diag/ComponentLogger.js
function logProxy(funcName, namespace, args) {
  var logger = getGlobal("diag");
  if (!logger) {
    return;
  }
  args.unshift(namespace);
  return logger[funcName].apply(logger, __spreadArray([], __read(args), false));
}
var __read, __spreadArray, DiagComponentLogger;
var init_ComponentLogger = __esm({
  "node_modules/@opentelemetry/api/build/esm/diag/ComponentLogger.js"() {
    init_global_utils();
    __read = function (o, n) {
      var m2 = typeof Symbol === "function" && o[Symbol.iterator];
      if (!m2)
        return o;
      var i = m2.call(o), r, ar = [], e;
      try {
        while ((n === void 0 || n-- > 0) && !(r = i.next()).done)
          ar.push(r.value);
      } catch (error) {
        e = { error };
      } finally {
        try {
          if (r && !r.done && (m2 = i["return"]))
            m2.call(i);
        } finally {
          if (e)
            throw e.error;
        }
      }
      return ar;
    };
    __spreadArray = function (to2, from, pack) {
      if (pack || arguments.length === 2)
        for (var i = 0, l2 = from.length, ar; i < l2; i++) {
          if (ar || !(i in from)) {
            if (!ar)
              ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
          }
        }
      return to2.concat(ar || Array.prototype.slice.call(from));
    };
    DiagComponentLogger = /** @class */
      function () {
        function DiagComponentLogger2(props) {
          this._namespace = props.namespace || "DiagComponentLogger";
        }
        DiagComponentLogger2.prototype.debug = function () {
          var args = [];
          for (var _i = 0; _i < arguments.length; _i++) {
            args[_i] = arguments[_i];
          }
          return logProxy("debug", this._namespace, args);
        };
        DiagComponentLogger2.prototype.error = function () {
          var args = [];
          for (var _i = 0; _i < arguments.length; _i++) {
            args[_i] = arguments[_i];
          }
          return logProxy("error", this._namespace, args);
        };
        DiagComponentLogger2.prototype.info = function () {
          var args = [];
          for (var _i = 0; _i < arguments.length; _i++) {
            args[_i] = arguments[_i];
          }
          return logProxy("info", this._namespace, args);
        };
        DiagComponentLogger2.prototype.warn = function () {
          var args = [];
          for (var _i = 0; _i < arguments.length; _i++) {
            args[_i] = arguments[_i];
          }
          return logProxy("warn", this._namespace, args);
        };
        DiagComponentLogger2.prototype.verbose = function () {
          var args = [];
          for (var _i = 0; _i < arguments.length; _i++) {
            args[_i] = arguments[_i];
          }
          return logProxy("verbose", this._namespace, args);
        };
        return DiagComponentLogger2;
      }();
  }
});

// node_modules/@opentelemetry/api/build/esm/diag/types.js
var DiagLogLevel;
var init_types = __esm({
  "node_modules/@opentelemetry/api/build/esm/diag/types.js"() {
    (function (DiagLogLevel2) {
      DiagLogLevel2[DiagLogLevel2["NONE"] = 0] = "NONE";
      DiagLogLevel2[DiagLogLevel2["ERROR"] = 30] = "ERROR";
      DiagLogLevel2[DiagLogLevel2["WARN"] = 50] = "WARN";
      DiagLogLevel2[DiagLogLevel2["INFO"] = 60] = "INFO";
      DiagLogLevel2[DiagLogLevel2["DEBUG"] = 70] = "DEBUG";
      DiagLogLevel2[DiagLogLevel2["VERBOSE"] = 80] = "VERBOSE";
      DiagLogLevel2[DiagLogLevel2["ALL"] = 9999] = "ALL";
    })(DiagLogLevel || (DiagLogLevel = {}));
  }
});

// node_modules/@opentelemetry/api/build/esm/diag/internal/logLevelLogger.js
function createLogLevelDiagLogger(maxLevel, logger) {
  if (maxLevel < DiagLogLevel.NONE) {
    maxLevel = DiagLogLevel.NONE;
  } else if (maxLevel > DiagLogLevel.ALL) {
    maxLevel = DiagLogLevel.ALL;
  }
  logger = logger || {};
  function _filterFunc(funcName, theLevel) {
    var theFunc = logger[funcName];
    if (typeof theFunc === "function" && maxLevel >= theLevel) {
      return theFunc.bind(logger);
    }
    return function () {
    };
  }
  return {
    error: _filterFunc("error", DiagLogLevel.ERROR),
    warn: _filterFunc("warn", DiagLogLevel.WARN),
    info: _filterFunc("info", DiagLogLevel.INFO),
    debug: _filterFunc("debug", DiagLogLevel.DEBUG),
    verbose: _filterFunc("verbose", DiagLogLevel.VERBOSE)
  };
}
var init_logLevelLogger = __esm({
  "node_modules/@opentelemetry/api/build/esm/diag/internal/logLevelLogger.js"() {
    init_types();
  }
});

// node_modules/@opentelemetry/api/build/esm/api/diag.js
var __read2, __spreadArray2, API_NAME, DiagAPI;
var init_diag = __esm({
  "node_modules/@opentelemetry/api/build/esm/api/diag.js"() {
    init_ComponentLogger();
    init_logLevelLogger();
    init_types();
    init_global_utils();
    __read2 = function (o, n) {
      var m2 = typeof Symbol === "function" && o[Symbol.iterator];
      if (!m2)
        return o;
      var i = m2.call(o), r, ar = [], e;
      try {
        while ((n === void 0 || n-- > 0) && !(r = i.next()).done)
          ar.push(r.value);
      } catch (error) {
        e = { error };
      } finally {
        try {
          if (r && !r.done && (m2 = i["return"]))
            m2.call(i);
        } finally {
          if (e)
            throw e.error;
        }
      }
      return ar;
    };
    __spreadArray2 = function (to2, from, pack) {
      if (pack || arguments.length === 2)
        for (var i = 0, l2 = from.length, ar; i < l2; i++) {
          if (ar || !(i in from)) {
            if (!ar)
              ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
          }
        }
      return to2.concat(ar || Array.prototype.slice.call(from));
    };
    API_NAME = "diag";
    DiagAPI = /** @class */
      function () {
        function DiagAPI2() {
          function _logProxy(funcName) {
            return function () {
              var args = [];
              for (var _i = 0; _i < arguments.length; _i++) {
                args[_i] = arguments[_i];
              }
              var logger = getGlobal("diag");
              if (!logger)
                return;
              return logger[funcName].apply(logger, __spreadArray2([], __read2(args), false));
            };
          }
          var self2 = this;
          var setLogger = function (logger, optionsOrLogLevel) {
            var _a, _b, _c;
            if (optionsOrLogLevel === void 0) {
              optionsOrLogLevel = { logLevel: DiagLogLevel.INFO };
            }
            if (logger === self2) {
              var err = new Error("Cannot use diag as the logger for itself. Please use a DiagLogger implementation like ConsoleDiagLogger or a custom implementation");
              self2.error((_a = err.stack) !== null && _a !== void 0 ? _a : err.message);
              return false;
            }
            if (typeof optionsOrLogLevel === "number") {
              optionsOrLogLevel = {
                logLevel: optionsOrLogLevel
              };
            }
            var oldLogger = getGlobal("diag");
            var newLogger = createLogLevelDiagLogger((_b = optionsOrLogLevel.logLevel) !== null && _b !== void 0 ? _b : DiagLogLevel.INFO, logger);
            if (oldLogger && !optionsOrLogLevel.suppressOverrideMessage) {
              var stack = (_c = new Error().stack) !== null && _c !== void 0 ? _c : "<failed to generate stacktrace>";
              oldLogger.warn("Current logger will be overwritten from " + stack);
              newLogger.warn("Current logger will overwrite one already registered from " + stack);
            }
            return registerGlobal("diag", newLogger, self2, true);
          };
          self2.setLogger = setLogger;
          self2.disable = function () {
            unregisterGlobal(API_NAME, self2);
          };
          self2.createComponentLogger = function (options) {
            return new DiagComponentLogger(options);
          };
          self2.verbose = _logProxy("verbose");
          self2.debug = _logProxy("debug");
          self2.info = _logProxy("info");
          self2.warn = _logProxy("warn");
          self2.error = _logProxy("error");
        }
        DiagAPI2.instance = function () {
          if (!this._instance) {
            this._instance = new DiagAPI2();
          }
          return this._instance;
        };
        return DiagAPI2;
      }();
  }
});

// node_modules/@opentelemetry/api/build/esm/baggage/internal/baggage-impl.js
var __read3, __values, BaggageImpl;
var init_baggage_impl = __esm({
  "node_modules/@opentelemetry/api/build/esm/baggage/internal/baggage-impl.js"() {
    __read3 = function (o, n) {
      var m2 = typeof Symbol === "function" && o[Symbol.iterator];
      if (!m2)
        return o;
      var i = m2.call(o), r, ar = [], e;
      try {
        while ((n === void 0 || n-- > 0) && !(r = i.next()).done)
          ar.push(r.value);
      } catch (error) {
        e = { error };
      } finally {
        try {
          if (r && !r.done && (m2 = i["return"]))
            m2.call(i);
        } finally {
          if (e)
            throw e.error;
        }
      }
      return ar;
    };
    __values = function (o) {
      var s = typeof Symbol === "function" && Symbol.iterator, m2 = s && o[s], i = 0;
      if (m2)
        return m2.call(o);
      if (o && typeof o.length === "number")
        return {
          next: function () {
            if (o && i >= o.length)
              o = void 0;
            return { value: o && o[i++], done: !o };
          }
        };
      throw new TypeError(s ? "Object is not iterable." : "Symbol.iterator is not defined.");
    };
    BaggageImpl = /** @class */
      function () {
        function BaggageImpl2(entries) {
          this._entries = entries ? new Map(entries) : /* @__PURE__ */ new Map();
        }
        BaggageImpl2.prototype.getEntry = function (key) {
          var entry = this._entries.get(key);
          if (!entry) {
            return void 0;
          }
          return Object.assign({}, entry);
        };
        BaggageImpl2.prototype.getAllEntries = function () {
          return Array.from(this._entries.entries()).map(function (_a) {
            var _b = __read3(_a, 2), k = _b[0], v = _b[1];
            return [k, v];
          });
        };
        BaggageImpl2.prototype.setEntry = function (key, entry) {
          var newBaggage = new BaggageImpl2(this._entries);
          newBaggage._entries.set(key, entry);
          return newBaggage;
        };
        BaggageImpl2.prototype.removeEntry = function (key) {
          var newBaggage = new BaggageImpl2(this._entries);
          newBaggage._entries.delete(key);
          return newBaggage;
        };
        BaggageImpl2.prototype.removeEntries = function () {
          var e_1, _a;
          var keys = [];
          for (var _i = 0; _i < arguments.length; _i++) {
            keys[_i] = arguments[_i];
          }
          var newBaggage = new BaggageImpl2(this._entries);
          try {
            for (var keys_1 = __values(keys), keys_1_1 = keys_1.next(); !keys_1_1.done; keys_1_1 = keys_1.next()) {
              var key = keys_1_1.value;
              newBaggage._entries.delete(key);
            }
          } catch (e_1_1) {
            e_1 = { error: e_1_1 };
          } finally {
            try {
              if (keys_1_1 && !keys_1_1.done && (_a = keys_1.return))
                _a.call(keys_1);
            } finally {
              if (e_1)
                throw e_1.error;
            }
          }
          return newBaggage;
        };
        BaggageImpl2.prototype.clear = function () {
          return new BaggageImpl2();
        };
        return BaggageImpl2;
      }();
  }
});

// node_modules/@opentelemetry/api/build/esm/baggage/internal/symbol.js
var baggageEntryMetadataSymbol;
var init_symbol = __esm({
  "node_modules/@opentelemetry/api/build/esm/baggage/internal/symbol.js"() {
    baggageEntryMetadataSymbol = Symbol("BaggageEntryMetadata");
  }
});

// node_modules/@opentelemetry/api/build/esm/baggage/utils.js
function createBaggage(entries) {
  if (entries === void 0) {
    entries = {};
  }
  return new BaggageImpl(new Map(Object.entries(entries)));
}
function baggageEntryMetadataFromString(str) {
  if (typeof str !== "string") {
    diag.error("Cannot create baggage metadata from unknown type: " + typeof str);
    str = "";
  }
  return {
    __TYPE__: baggageEntryMetadataSymbol,
    toString: function () {
      return str;
    }
  };
}
var diag;
var init_utils = __esm({
  "node_modules/@opentelemetry/api/build/esm/baggage/utils.js"() {
    init_diag();
    init_baggage_impl();
    init_symbol();
    diag = DiagAPI.instance();
  }
});

// node_modules/@opentelemetry/api/build/esm/context/context.js
function createContextKey(description) {
  return Symbol.for(description);
}
var BaseContext, ROOT_CONTEXT;
var init_context = __esm({
  "node_modules/@opentelemetry/api/build/esm/context/context.js"() {
    BaseContext = /** @class */
    /* @__PURE__ */ function () {
        function BaseContext2(parentContext) {
          var self2 = this;
          self2._currentContext = parentContext ? new Map(parentContext) : /* @__PURE__ */ new Map();
          self2.getValue = function (key) {
            return self2._currentContext.get(key);
          };
          self2.setValue = function (key, value) {
            var context2 = new BaseContext2(self2._currentContext);
            context2._currentContext.set(key, value);
            return context2;
          };
          self2.deleteValue = function (key) {
            var context2 = new BaseContext2(self2._currentContext);
            context2._currentContext.delete(key);
            return context2;
          };
        }
        return BaseContext2;
      }();
    ROOT_CONTEXT = new BaseContext();
  }
});

// node_modules/@opentelemetry/api/build/esm/diag/consoleLogger.js
var consoleMap, DiagConsoleLogger;
var init_consoleLogger = __esm({
  "node_modules/@opentelemetry/api/build/esm/diag/consoleLogger.js"() {
    consoleMap = [
      { n: "error", c: "error" },
      { n: "warn", c: "warn" },
      { n: "info", c: "info" },
      { n: "debug", c: "debug" },
      { n: "verbose", c: "trace" }
    ];
    DiagConsoleLogger = /** @class */
    /* @__PURE__ */ function () {
        function DiagConsoleLogger2() {
          function _consoleFunc(funcName) {
            return function () {
              var args = [];
              for (var _i = 0; _i < arguments.length; _i++) {
                args[_i] = arguments[_i];
              }
              if (console) {
                var theFunc = console[funcName];
                if (typeof theFunc !== "function") {
                  theFunc = console.log;
                }
                if (typeof theFunc === "function") {
                  return theFunc.apply(console, args);
                }
              }
            };
          }
          for (var i = 0; i < consoleMap.length; i++) {
            this[consoleMap[i].n] = _consoleFunc(consoleMap[i].c);
          }
        }
        return DiagConsoleLogger2;
      }();
  }
});

// node_modules/@opentelemetry/api/build/esm/metrics/NoopMeter.js
function createNoopMeter() {
  return NOOP_METER;
}
var __extends, NoopMeter, NoopMetric, NoopCounterMetric, NoopUpDownCounterMetric, NoopHistogramMetric, NoopObservableMetric, NoopObservableCounterMetric, NoopObservableGaugeMetric, NoopObservableUpDownCounterMetric, NOOP_METER, NOOP_COUNTER_METRIC, NOOP_HISTOGRAM_METRIC, NOOP_UP_DOWN_COUNTER_METRIC, NOOP_OBSERVABLE_COUNTER_METRIC, NOOP_OBSERVABLE_GAUGE_METRIC, NOOP_OBSERVABLE_UP_DOWN_COUNTER_METRIC;
var init_NoopMeter = __esm({
  "node_modules/@opentelemetry/api/build/esm/metrics/NoopMeter.js"() {
    __extends = /* @__PURE__ */ function () {
      var extendStatics = function (d2, b) {
        extendStatics = Object.setPrototypeOf || { __proto__: [] } instanceof Array && function (d3, b2) {
          d3.__proto__ = b2;
        } || function (d3, b2) {
          for (var p in b2)
            if (Object.prototype.hasOwnProperty.call(b2, p))
              d3[p] = b2[p];
        };
        return extendStatics(d2, b);
      };
      return function (d2, b) {
        if (typeof b !== "function" && b !== null)
          throw new TypeError("Class extends value " + String(b) + " is not a constructor or null");
        extendStatics(d2, b);
        function __() {
          this.constructor = d2;
        }
        d2.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
      };
    }();
    NoopMeter = /** @class */
      function () {
        function NoopMeter2() {
        }
        NoopMeter2.prototype.createHistogram = function (_name, _options) {
          return NOOP_HISTOGRAM_METRIC;
        };
        NoopMeter2.prototype.createCounter = function (_name, _options) {
          return NOOP_COUNTER_METRIC;
        };
        NoopMeter2.prototype.createUpDownCounter = function (_name, _options) {
          return NOOP_UP_DOWN_COUNTER_METRIC;
        };
        NoopMeter2.prototype.createObservableGauge = function (_name, _options) {
          return NOOP_OBSERVABLE_GAUGE_METRIC;
        };
        NoopMeter2.prototype.createObservableCounter = function (_name, _options) {
          return NOOP_OBSERVABLE_COUNTER_METRIC;
        };
        NoopMeter2.prototype.createObservableUpDownCounter = function (_name, _options) {
          return NOOP_OBSERVABLE_UP_DOWN_COUNTER_METRIC;
        };
        NoopMeter2.prototype.addBatchObservableCallback = function (_callback, _observables) {
        };
        NoopMeter2.prototype.removeBatchObservableCallback = function (_callback) {
        };
        return NoopMeter2;
      }();
    NoopMetric = /** @class */
    /* @__PURE__ */ function () {
        function NoopMetric2() {
        }
        return NoopMetric2;
      }();
    NoopCounterMetric = /** @class */
      function (_super) {
        __extends(NoopCounterMetric2, _super);
        function NoopCounterMetric2() {
          return _super !== null && _super.apply(this, arguments) || this;
        }
        NoopCounterMetric2.prototype.add = function (_value, _attributes) {
        };
        return NoopCounterMetric2;
      }(NoopMetric);
    NoopUpDownCounterMetric = /** @class */
      function (_super) {
        __extends(NoopUpDownCounterMetric2, _super);
        function NoopUpDownCounterMetric2() {
          return _super !== null && _super.apply(this, arguments) || this;
        }
        NoopUpDownCounterMetric2.prototype.add = function (_value, _attributes) {
        };
        return NoopUpDownCounterMetric2;
      }(NoopMetric);
    NoopHistogramMetric = /** @class */
      function (_super) {
        __extends(NoopHistogramMetric2, _super);
        function NoopHistogramMetric2() {
          return _super !== null && _super.apply(this, arguments) || this;
        }
        NoopHistogramMetric2.prototype.record = function (_value, _attributes) {
        };
        return NoopHistogramMetric2;
      }(NoopMetric);
    NoopObservableMetric = /** @class */
      function () {
        function NoopObservableMetric2() {
        }
        NoopObservableMetric2.prototype.addCallback = function (_callback) {
        };
        NoopObservableMetric2.prototype.removeCallback = function (_callback) {
        };
        return NoopObservableMetric2;
      }();
    NoopObservableCounterMetric = /** @class */
      function (_super) {
        __extends(NoopObservableCounterMetric2, _super);
        function NoopObservableCounterMetric2() {
          return _super !== null && _super.apply(this, arguments) || this;
        }
        return NoopObservableCounterMetric2;
      }(NoopObservableMetric);
    NoopObservableGaugeMetric = /** @class */
      function (_super) {
        __extends(NoopObservableGaugeMetric2, _super);
        function NoopObservableGaugeMetric2() {
          return _super !== null && _super.apply(this, arguments) || this;
        }
        return NoopObservableGaugeMetric2;
      }(NoopObservableMetric);
    NoopObservableUpDownCounterMetric = /** @class */
      function (_super) {
        __extends(NoopObservableUpDownCounterMetric2, _super);
        function NoopObservableUpDownCounterMetric2() {
          return _super !== null && _super.apply(this, arguments) || this;
        }
        return NoopObservableUpDownCounterMetric2;
      }(NoopObservableMetric);
    NOOP_METER = new NoopMeter();
    NOOP_COUNTER_METRIC = new NoopCounterMetric();
    NOOP_HISTOGRAM_METRIC = new NoopHistogramMetric();
    NOOP_UP_DOWN_COUNTER_METRIC = new NoopUpDownCounterMetric();
    NOOP_OBSERVABLE_COUNTER_METRIC = new NoopObservableCounterMetric();
    NOOP_OBSERVABLE_GAUGE_METRIC = new NoopObservableGaugeMetric();
    NOOP_OBSERVABLE_UP_DOWN_COUNTER_METRIC = new NoopObservableUpDownCounterMetric();
  }
});

// node_modules/@opentelemetry/api/build/esm/metrics/Metric.js
var ValueType;
var init_Metric = __esm({
  "node_modules/@opentelemetry/api/build/esm/metrics/Metric.js"() {
    (function (ValueType2) {
      ValueType2[ValueType2["INT"] = 0] = "INT";
      ValueType2[ValueType2["DOUBLE"] = 1] = "DOUBLE";
    })(ValueType || (ValueType = {}));
  }
});

// node_modules/@opentelemetry/api/build/esm/propagation/TextMapPropagator.js
var defaultTextMapGetter, defaultTextMapSetter;
var init_TextMapPropagator = __esm({
  "node_modules/@opentelemetry/api/build/esm/propagation/TextMapPropagator.js"() {
    defaultTextMapGetter = {
      get: function (carrier, key) {
        if (carrier == null) {
          return void 0;
        }
        return carrier[key];
      },
      keys: function (carrier) {
        if (carrier == null) {
          return [];
        }
        return Object.keys(carrier);
      }
    };
    defaultTextMapSetter = {
      set: function (carrier, key, value) {
        if (carrier == null) {
          return;
        }
        carrier[key] = value;
      }
    };
  }
});

// node_modules/@opentelemetry/api/build/esm/context/NoopContextManager.js
var __read4, __spreadArray3, NoopContextManager;
var init_NoopContextManager = __esm({
  "node_modules/@opentelemetry/api/build/esm/context/NoopContextManager.js"() {
    init_context();
    __read4 = function (o, n) {
      var m2 = typeof Symbol === "function" && o[Symbol.iterator];
      if (!m2)
        return o;
      var i = m2.call(o), r, ar = [], e;
      try {
        while ((n === void 0 || n-- > 0) && !(r = i.next()).done)
          ar.push(r.value);
      } catch (error) {
        e = { error };
      } finally {
        try {
          if (r && !r.done && (m2 = i["return"]))
            m2.call(i);
        } finally {
          if (e)
            throw e.error;
        }
      }
      return ar;
    };
    __spreadArray3 = function (to2, from, pack) {
      if (pack || arguments.length === 2)
        for (var i = 0, l2 = from.length, ar; i < l2; i++) {
          if (ar || !(i in from)) {
            if (!ar)
              ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
          }
        }
      return to2.concat(ar || Array.prototype.slice.call(from));
    };
    NoopContextManager = /** @class */
      function () {
        function NoopContextManager2() {
        }
        NoopContextManager2.prototype.active = function () {
          return ROOT_CONTEXT;
        };
        NoopContextManager2.prototype.with = function (_context, fn, thisArg) {
          var args = [];
          for (var _i = 3; _i < arguments.length; _i++) {
            args[_i - 3] = arguments[_i];
          }
          return fn.call.apply(fn, __spreadArray3([thisArg], __read4(args), false));
        };
        NoopContextManager2.prototype.bind = function (_context, target) {
          return target;
        };
        NoopContextManager2.prototype.enable = function () {
          return this;
        };
        NoopContextManager2.prototype.disable = function () {
          return this;
        };
        return NoopContextManager2;
      }();
  }
});

// node_modules/@opentelemetry/api/build/esm/api/context.js
var __read5, __spreadArray4, API_NAME2, NOOP_CONTEXT_MANAGER, ContextAPI;
var init_context2 = __esm({
  "node_modules/@opentelemetry/api/build/esm/api/context.js"() {
    init_NoopContextManager();
    init_global_utils();
    init_diag();
    __read5 = function (o, n) {
      var m2 = typeof Symbol === "function" && o[Symbol.iterator];
      if (!m2)
        return o;
      var i = m2.call(o), r, ar = [], e;
      try {
        while ((n === void 0 || n-- > 0) && !(r = i.next()).done)
          ar.push(r.value);
      } catch (error) {
        e = { error };
      } finally {
        try {
          if (r && !r.done && (m2 = i["return"]))
            m2.call(i);
        } finally {
          if (e)
            throw e.error;
        }
      }
      return ar;
    };
    __spreadArray4 = function (to2, from, pack) {
      if (pack || arguments.length === 2)
        for (var i = 0, l2 = from.length, ar; i < l2; i++) {
          if (ar || !(i in from)) {
            if (!ar)
              ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
          }
        }
      return to2.concat(ar || Array.prototype.slice.call(from));
    };
    API_NAME2 = "context";
    NOOP_CONTEXT_MANAGER = new NoopContextManager();
    ContextAPI = /** @class */
      function () {
        function ContextAPI2() {
        }
        ContextAPI2.getInstance = function () {
          if (!this._instance) {
            this._instance = new ContextAPI2();
          }
          return this._instance;
        };
        ContextAPI2.prototype.setGlobalContextManager = function (contextManager) {
          return registerGlobal(API_NAME2, contextManager, DiagAPI.instance());
        };
        ContextAPI2.prototype.active = function () {
          return this._getContextManager().active();
        };
        ContextAPI2.prototype.with = function (context2, fn, thisArg) {
          var _a;
          var args = [];
          for (var _i = 3; _i < arguments.length; _i++) {
            args[_i - 3] = arguments[_i];
          }
          return (_a = this._getContextManager()).with.apply(_a, __spreadArray4([context2, fn, thisArg], __read5(args), false));
        };
        ContextAPI2.prototype.bind = function (context2, target) {
          return this._getContextManager().bind(context2, target);
        };
        ContextAPI2.prototype._getContextManager = function () {
          return getGlobal(API_NAME2) || NOOP_CONTEXT_MANAGER;
        };
        ContextAPI2.prototype.disable = function () {
          this._getContextManager().disable();
          unregisterGlobal(API_NAME2, DiagAPI.instance());
        };
        return ContextAPI2;
      }();
  }
});

// node_modules/@opentelemetry/api/build/esm/trace/trace_flags.js
var TraceFlags;
var init_trace_flags = __esm({
  "node_modules/@opentelemetry/api/build/esm/trace/trace_flags.js"() {
    (function (TraceFlags2) {
      TraceFlags2[TraceFlags2["NONE"] = 0] = "NONE";
      TraceFlags2[TraceFlags2["SAMPLED"] = 1] = "SAMPLED";
    })(TraceFlags || (TraceFlags = {}));
  }
});

// node_modules/@opentelemetry/api/build/esm/trace/invalid-span-constants.js
var INVALID_SPANID, INVALID_TRACEID, INVALID_SPAN_CONTEXT;
var init_invalid_span_constants = __esm({
  "node_modules/@opentelemetry/api/build/esm/trace/invalid-span-constants.js"() {
    init_trace_flags();
    INVALID_SPANID = "0000000000000000";
    INVALID_TRACEID = "00000000000000000000000000000000";
    INVALID_SPAN_CONTEXT = {
      traceId: INVALID_TRACEID,
      spanId: INVALID_SPANID,
      traceFlags: TraceFlags.NONE
    };
  }
});

// node_modules/@opentelemetry/api/build/esm/trace/NonRecordingSpan.js
var NonRecordingSpan;
var init_NonRecordingSpan = __esm({
  "node_modules/@opentelemetry/api/build/esm/trace/NonRecordingSpan.js"() {
    init_invalid_span_constants();
    NonRecordingSpan = /** @class */
      function () {
        function NonRecordingSpan2(_spanContext) {
          if (_spanContext === void 0) {
            _spanContext = INVALID_SPAN_CONTEXT;
          }
          this._spanContext = _spanContext;
        }
        NonRecordingSpan2.prototype.spanContext = function () {
          return this._spanContext;
        };
        NonRecordingSpan2.prototype.setAttribute = function (_key, _value) {
          return this;
        };
        NonRecordingSpan2.prototype.setAttributes = function (_attributes) {
          return this;
        };
        NonRecordingSpan2.prototype.addEvent = function (_name, _attributes) {
          return this;
        };
        NonRecordingSpan2.prototype.setStatus = function (_status) {
          return this;
        };
        NonRecordingSpan2.prototype.updateName = function (_name) {
          return this;
        };
        NonRecordingSpan2.prototype.end = function (_endTime) {
        };
        NonRecordingSpan2.prototype.isRecording = function () {
          return false;
        };
        NonRecordingSpan2.prototype.recordException = function (_exception, _time) {
        };
        return NonRecordingSpan2;
      }();
  }
});

// node_modules/@opentelemetry/api/build/esm/trace/context-utils.js
function getSpan(context2) {
  return context2.getValue(SPAN_KEY) || void 0;
}
function getActiveSpan() {
  return getSpan(ContextAPI.getInstance().active());
}
function setSpan(context2, span) {
  return context2.setValue(SPAN_KEY, span);
}
function deleteSpan(context2) {
  return context2.deleteValue(SPAN_KEY);
}
function setSpanContext(context2, spanContext) {
  return setSpan(context2, new NonRecordingSpan(spanContext));
}
function getSpanContext(context2) {
  var _a;
  return (_a = getSpan(context2)) === null || _a === void 0 ? void 0 : _a.spanContext();
}
var SPAN_KEY;
var init_context_utils = __esm({
  "node_modules/@opentelemetry/api/build/esm/trace/context-utils.js"() {
    init_context();
    init_NonRecordingSpan();
    init_context2();
    SPAN_KEY = createContextKey("OpenTelemetry Context Key SPAN");
  }
});

// node_modules/@opentelemetry/api/build/esm/trace/spancontext-utils.js
function isValidTraceId(traceId) {
  return VALID_TRACEID_REGEX.test(traceId) && traceId !== INVALID_TRACEID;
}
function isValidSpanId(spanId) {
  return VALID_SPANID_REGEX.test(spanId) && spanId !== INVALID_SPANID;
}
function isSpanContextValid(spanContext) {
  return isValidTraceId(spanContext.traceId) && isValidSpanId(spanContext.spanId);
}
function wrapSpanContext(spanContext) {
  return new NonRecordingSpan(spanContext);
}
var VALID_TRACEID_REGEX, VALID_SPANID_REGEX;
var init_spancontext_utils = __esm({
  "node_modules/@opentelemetry/api/build/esm/trace/spancontext-utils.js"() {
    init_invalid_span_constants();
    init_NonRecordingSpan();
    VALID_TRACEID_REGEX = /^([0-9a-f]{32})$/i;
    VALID_SPANID_REGEX = /^[0-9a-f]{16}$/i;
  }
});

// node_modules/@opentelemetry/api/build/esm/trace/NoopTracer.js
function isSpanContext(spanContext) {
  return typeof spanContext === "object" && typeof spanContext["spanId"] === "string" && typeof spanContext["traceId"] === "string" && typeof spanContext["traceFlags"] === "number";
}
var contextApi, NoopTracer;
var init_NoopTracer = __esm({
  "node_modules/@opentelemetry/api/build/esm/trace/NoopTracer.js"() {
    init_context2();
    init_context_utils();
    init_NonRecordingSpan();
    init_spancontext_utils();
    contextApi = ContextAPI.getInstance();
    NoopTracer = /** @class */
      function () {
        function NoopTracer2() {
        }
        NoopTracer2.prototype.startSpan = function (name, options, context2) {
          if (context2 === void 0) {
            context2 = contextApi.active();
          }
          var root = Boolean(options === null || options === void 0 ? void 0 : options.root);
          if (root) {
            return new NonRecordingSpan();
          }
          var parentFromContext = context2 && getSpanContext(context2);
          if (isSpanContext(parentFromContext) && isSpanContextValid(parentFromContext)) {
            return new NonRecordingSpan(parentFromContext);
          } else {
            return new NonRecordingSpan();
          }
        };
        NoopTracer2.prototype.startActiveSpan = function (name, arg2, arg3, arg4) {
          var opts;
          var ctx;
          var fn;
          if (arguments.length < 2) {
            return;
          } else if (arguments.length === 2) {
            fn = arg2;
          } else if (arguments.length === 3) {
            opts = arg2;
            fn = arg3;
          } else {
            opts = arg2;
            ctx = arg3;
            fn = arg4;
          }
          var parentContext = ctx !== null && ctx !== void 0 ? ctx : contextApi.active();
          var span = this.startSpan(name, opts, parentContext);
          var contextWithSpanSet = setSpan(parentContext, span);
          return contextApi.with(contextWithSpanSet, fn, void 0, span);
        };
        return NoopTracer2;
      }();
  }
});

// node_modules/@opentelemetry/api/build/esm/trace/ProxyTracer.js
var NOOP_TRACER, ProxyTracer;
var init_ProxyTracer = __esm({
  "node_modules/@opentelemetry/api/build/esm/trace/ProxyTracer.js"() {
    init_NoopTracer();
    NOOP_TRACER = new NoopTracer();
    ProxyTracer = /** @class */
      function () {
        function ProxyTracer2(_provider, name, version, options) {
          this._provider = _provider;
          this.name = name;
          this.version = version;
          this.options = options;
        }
        ProxyTracer2.prototype.startSpan = function (name, options, context2) {
          return this._getTracer().startSpan(name, options, context2);
        };
        ProxyTracer2.prototype.startActiveSpan = function (_name, _options, _context, _fn) {
          var tracer = this._getTracer();
          return Reflect.apply(tracer.startActiveSpan, tracer, arguments);
        };
        ProxyTracer2.prototype._getTracer = function () {
          if (this._delegate) {
            return this._delegate;
          }
          var tracer = this._provider.getDelegateTracer(this.name, this.version, this.options);
          if (!tracer) {
            return NOOP_TRACER;
          }
          this._delegate = tracer;
          return this._delegate;
        };
        return ProxyTracer2;
      }();
  }
});

// node_modules/@opentelemetry/api/build/esm/trace/NoopTracerProvider.js
var NoopTracerProvider;
var init_NoopTracerProvider = __esm({
  "node_modules/@opentelemetry/api/build/esm/trace/NoopTracerProvider.js"() {
    init_NoopTracer();
    NoopTracerProvider = /** @class */
      function () {
        function NoopTracerProvider2() {
        }
        NoopTracerProvider2.prototype.getTracer = function (_name, _version, _options) {
          return new NoopTracer();
        };
        return NoopTracerProvider2;
      }();
  }
});

// node_modules/@opentelemetry/api/build/esm/trace/ProxyTracerProvider.js
var NOOP_TRACER_PROVIDER, ProxyTracerProvider;
var init_ProxyTracerProvider = __esm({
  "node_modules/@opentelemetry/api/build/esm/trace/ProxyTracerProvider.js"() {
    init_ProxyTracer();
    init_NoopTracerProvider();
    NOOP_TRACER_PROVIDER = new NoopTracerProvider();
    ProxyTracerProvider = /** @class */
      function () {
        function ProxyTracerProvider2() {
        }
        ProxyTracerProvider2.prototype.getTracer = function (name, version, options) {
          var _a;
          return (_a = this.getDelegateTracer(name, version, options)) !== null && _a !== void 0 ? _a : new ProxyTracer(this, name, version, options);
        };
        ProxyTracerProvider2.prototype.getDelegate = function () {
          var _a;
          return (_a = this._delegate) !== null && _a !== void 0 ? _a : NOOP_TRACER_PROVIDER;
        };
        ProxyTracerProvider2.prototype.setDelegate = function (delegate) {
          this._delegate = delegate;
        };
        ProxyTracerProvider2.prototype.getDelegateTracer = function (name, version, options) {
          var _a;
          return (_a = this._delegate) === null || _a === void 0 ? void 0 : _a.getTracer(name, version, options);
        };
        return ProxyTracerProvider2;
      }();
  }
});

// node_modules/@opentelemetry/api/build/esm/trace/SamplingResult.js
var SamplingDecision;
var init_SamplingResult = __esm({
  "node_modules/@opentelemetry/api/build/esm/trace/SamplingResult.js"() {
    (function (SamplingDecision2) {
      SamplingDecision2[SamplingDecision2["NOT_RECORD"] = 0] = "NOT_RECORD";
      SamplingDecision2[SamplingDecision2["RECORD"] = 1] = "RECORD";
      SamplingDecision2[SamplingDecision2["RECORD_AND_SAMPLED"] = 2] = "RECORD_AND_SAMPLED";
    })(SamplingDecision || (SamplingDecision = {}));
  }
});

// node_modules/@opentelemetry/api/build/esm/trace/span_kind.js
var SpanKind;
var init_span_kind = __esm({
  "node_modules/@opentelemetry/api/build/esm/trace/span_kind.js"() {
    (function (SpanKind2) {
      SpanKind2[SpanKind2["INTERNAL"] = 0] = "INTERNAL";
      SpanKind2[SpanKind2["SERVER"] = 1] = "SERVER";
      SpanKind2[SpanKind2["CLIENT"] = 2] = "CLIENT";
      SpanKind2[SpanKind2["PRODUCER"] = 3] = "PRODUCER";
      SpanKind2[SpanKind2["CONSUMER"] = 4] = "CONSUMER";
    })(SpanKind || (SpanKind = {}));
  }
});

// node_modules/@opentelemetry/api/build/esm/trace/status.js
var SpanStatusCode;
var init_status = __esm({
  "node_modules/@opentelemetry/api/build/esm/trace/status.js"() {
    (function (SpanStatusCode2) {
      SpanStatusCode2[SpanStatusCode2["UNSET"] = 0] = "UNSET";
      SpanStatusCode2[SpanStatusCode2["OK"] = 1] = "OK";
      SpanStatusCode2[SpanStatusCode2["ERROR"] = 2] = "ERROR";
    })(SpanStatusCode || (SpanStatusCode = {}));
  }
});

// node_modules/@opentelemetry/api/build/esm/trace/internal/tracestate-validators.js
function validateKey(key) {
  return VALID_KEY_REGEX.test(key);
}
function validateValue(value) {
  return VALID_VALUE_BASE_REGEX.test(value) && !INVALID_VALUE_COMMA_EQUAL_REGEX.test(value);
}
var VALID_KEY_CHAR_RANGE, VALID_KEY, VALID_VENDOR_KEY, VALID_KEY_REGEX, VALID_VALUE_BASE_REGEX, INVALID_VALUE_COMMA_EQUAL_REGEX;
var init_tracestate_validators = __esm({
  "node_modules/@opentelemetry/api/build/esm/trace/internal/tracestate-validators.js"() {
    VALID_KEY_CHAR_RANGE = "[_0-9a-z-*/]";
    VALID_KEY = "[a-z]" + VALID_KEY_CHAR_RANGE + "{0,255}";
    VALID_VENDOR_KEY = "[a-z0-9]" + VALID_KEY_CHAR_RANGE + "{0,240}@[a-z]" + VALID_KEY_CHAR_RANGE + "{0,13}";
    VALID_KEY_REGEX = new RegExp("^(?:" + VALID_KEY + "|" + VALID_VENDOR_KEY + ")$");
    VALID_VALUE_BASE_REGEX = /^[ -~]{0,255}[!-~]$/;
    INVALID_VALUE_COMMA_EQUAL_REGEX = /,|=/;
  }
});

// node_modules/@opentelemetry/api/build/esm/trace/internal/tracestate-impl.js
var MAX_TRACE_STATE_ITEMS, MAX_TRACE_STATE_LEN, LIST_MEMBERS_SEPARATOR, LIST_MEMBER_KEY_VALUE_SPLITTER, TraceStateImpl;
var init_tracestate_impl = __esm({
  "node_modules/@opentelemetry/api/build/esm/trace/internal/tracestate-impl.js"() {
    init_tracestate_validators();
    MAX_TRACE_STATE_ITEMS = 32;
    MAX_TRACE_STATE_LEN = 512;
    LIST_MEMBERS_SEPARATOR = ",";
    LIST_MEMBER_KEY_VALUE_SPLITTER = "=";
    TraceStateImpl = /** @class */
      function () {
        function TraceStateImpl2(rawTraceState) {
          this._internalState = /* @__PURE__ */ new Map();
          if (rawTraceState)
            this._parse(rawTraceState);
        }
        TraceStateImpl2.prototype.set = function (key, value) {
          var traceState = this._clone();
          if (traceState._internalState.has(key)) {
            traceState._internalState.delete(key);
          }
          traceState._internalState.set(key, value);
          return traceState;
        };
        TraceStateImpl2.prototype.unset = function (key) {
          var traceState = this._clone();
          traceState._internalState.delete(key);
          return traceState;
        };
        TraceStateImpl2.prototype.get = function (key) {
          return this._internalState.get(key);
        };
        TraceStateImpl2.prototype.serialize = function () {
          var _this = this;
          return this._keys().reduce(function (agg, key) {
            agg.push(key + LIST_MEMBER_KEY_VALUE_SPLITTER + _this.get(key));
            return agg;
          }, []).join(LIST_MEMBERS_SEPARATOR);
        };
        TraceStateImpl2.prototype._parse = function (rawTraceState) {
          if (rawTraceState.length > MAX_TRACE_STATE_LEN)
            return;
          this._internalState = rawTraceState.split(LIST_MEMBERS_SEPARATOR).reverse().reduce(function (agg, part) {
            var listMember = part.trim();
            var i = listMember.indexOf(LIST_MEMBER_KEY_VALUE_SPLITTER);
            if (i !== -1) {
              var key = listMember.slice(0, i);
              var value = listMember.slice(i + 1, part.length);
              if (validateKey(key) && validateValue(value)) {
                agg.set(key, value);
              } else {
              }
            }
            return agg;
          }, /* @__PURE__ */ new Map());
          if (this._internalState.size > MAX_TRACE_STATE_ITEMS) {
            this._internalState = new Map(Array.from(this._internalState.entries()).reverse().slice(0, MAX_TRACE_STATE_ITEMS));
          }
        };
        TraceStateImpl2.prototype._keys = function () {
          return Array.from(this._internalState.keys()).reverse();
        };
        TraceStateImpl2.prototype._clone = function () {
          var traceState = new TraceStateImpl2();
          traceState._internalState = new Map(this._internalState);
          return traceState;
        };
        return TraceStateImpl2;
      }();
  }
});

// node_modules/@opentelemetry/api/build/esm/trace/internal/utils.js
function createTraceState(rawTraceState) {
  return new TraceStateImpl(rawTraceState);
}
var init_utils2 = __esm({
  "node_modules/@opentelemetry/api/build/esm/trace/internal/utils.js"() {
    init_tracestate_impl();
  }
});

// node_modules/@opentelemetry/api/build/esm/context-api.js
var context;
var init_context_api = __esm({
  "node_modules/@opentelemetry/api/build/esm/context-api.js"() {
    init_context2();
    context = ContextAPI.getInstance();
  }
});

// node_modules/@opentelemetry/api/build/esm/diag-api.js
var diag2;
var init_diag_api = __esm({
  "node_modules/@opentelemetry/api/build/esm/diag-api.js"() {
    init_diag();
    diag2 = DiagAPI.instance();
  }
});

// node_modules/@opentelemetry/api/build/esm/metrics/NoopMeterProvider.js
var NoopMeterProvider, NOOP_METER_PROVIDER;
var init_NoopMeterProvider = __esm({
  "node_modules/@opentelemetry/api/build/esm/metrics/NoopMeterProvider.js"() {
    init_NoopMeter();
    NoopMeterProvider = /** @class */
      function () {
        function NoopMeterProvider2() {
        }
        NoopMeterProvider2.prototype.getMeter = function (_name, _version, _options) {
          return NOOP_METER;
        };
        return NoopMeterProvider2;
      }();
    NOOP_METER_PROVIDER = new NoopMeterProvider();
  }
});

// node_modules/@opentelemetry/api/build/esm/api/metrics.js
var API_NAME3, MetricsAPI;
var init_metrics = __esm({
  "node_modules/@opentelemetry/api/build/esm/api/metrics.js"() {
    init_NoopMeterProvider();
    init_global_utils();
    init_diag();
    API_NAME3 = "metrics";
    MetricsAPI = /** @class */
      function () {
        function MetricsAPI2() {
        }
        MetricsAPI2.getInstance = function () {
          if (!this._instance) {
            this._instance = new MetricsAPI2();
          }
          return this._instance;
        };
        MetricsAPI2.prototype.setGlobalMeterProvider = function (provider) {
          return registerGlobal(API_NAME3, provider, DiagAPI.instance());
        };
        MetricsAPI2.prototype.getMeterProvider = function () {
          return getGlobal(API_NAME3) || NOOP_METER_PROVIDER;
        };
        MetricsAPI2.prototype.getMeter = function (name, version, options) {
          return this.getMeterProvider().getMeter(name, version, options);
        };
        MetricsAPI2.prototype.disable = function () {
          unregisterGlobal(API_NAME3, DiagAPI.instance());
        };
        return MetricsAPI2;
      }();
  }
});

// node_modules/@opentelemetry/api/build/esm/metrics-api.js
var metrics;
var init_metrics_api = __esm({
  "node_modules/@opentelemetry/api/build/esm/metrics-api.js"() {
    init_metrics();
    metrics = MetricsAPI.getInstance();
  }
});

// node_modules/@opentelemetry/api/build/esm/propagation/NoopTextMapPropagator.js
var NoopTextMapPropagator;
var init_NoopTextMapPropagator = __esm({
  "node_modules/@opentelemetry/api/build/esm/propagation/NoopTextMapPropagator.js"() {
    NoopTextMapPropagator = /** @class */
      function () {
        function NoopTextMapPropagator2() {
        }
        NoopTextMapPropagator2.prototype.inject = function (_context, _carrier) {
        };
        NoopTextMapPropagator2.prototype.extract = function (context2, _carrier) {
          return context2;
        };
        NoopTextMapPropagator2.prototype.fields = function () {
          return [];
        };
        return NoopTextMapPropagator2;
      }();
  }
});

// node_modules/@opentelemetry/api/build/esm/baggage/context-helpers.js
function getBaggage(context2) {
  return context2.getValue(BAGGAGE_KEY) || void 0;
}
function getActiveBaggage() {
  return getBaggage(ContextAPI.getInstance().active());
}
function setBaggage(context2, baggage) {
  return context2.setValue(BAGGAGE_KEY, baggage);
}
function deleteBaggage(context2) {
  return context2.deleteValue(BAGGAGE_KEY);
}
var BAGGAGE_KEY;
var init_context_helpers = __esm({
  "node_modules/@opentelemetry/api/build/esm/baggage/context-helpers.js"() {
    init_context2();
    init_context();
    BAGGAGE_KEY = createContextKey("OpenTelemetry Baggage Key");
  }
});

// node_modules/@opentelemetry/api/build/esm/api/propagation.js
var API_NAME4, NOOP_TEXT_MAP_PROPAGATOR, PropagationAPI;
var init_propagation = __esm({
  "node_modules/@opentelemetry/api/build/esm/api/propagation.js"() {
    init_global_utils();
    init_NoopTextMapPropagator();
    init_TextMapPropagator();
    init_context_helpers();
    init_utils();
    init_diag();
    API_NAME4 = "propagation";
    NOOP_TEXT_MAP_PROPAGATOR = new NoopTextMapPropagator();
    PropagationAPI = /** @class */
      function () {
        function PropagationAPI2() {
          this.createBaggage = createBaggage;
          this.getBaggage = getBaggage;
          this.getActiveBaggage = getActiveBaggage;
          this.setBaggage = setBaggage;
          this.deleteBaggage = deleteBaggage;
        }
        PropagationAPI2.getInstance = function () {
          if (!this._instance) {
            this._instance = new PropagationAPI2();
          }
          return this._instance;
        };
        PropagationAPI2.prototype.setGlobalPropagator = function (propagator) {
          return registerGlobal(API_NAME4, propagator, DiagAPI.instance());
        };
        PropagationAPI2.prototype.inject = function (context2, carrier, setter) {
          if (setter === void 0) {
            setter = defaultTextMapSetter;
          }
          return this._getGlobalPropagator().inject(context2, carrier, setter);
        };
        PropagationAPI2.prototype.extract = function (context2, carrier, getter) {
          if (getter === void 0) {
            getter = defaultTextMapGetter;
          }
          return this._getGlobalPropagator().extract(context2, carrier, getter);
        };
        PropagationAPI2.prototype.fields = function () {
          return this._getGlobalPropagator().fields();
        };
        PropagationAPI2.prototype.disable = function () {
          unregisterGlobal(API_NAME4, DiagAPI.instance());
        };
        PropagationAPI2.prototype._getGlobalPropagator = function () {
          return getGlobal(API_NAME4) || NOOP_TEXT_MAP_PROPAGATOR;
        };
        return PropagationAPI2;
      }();
  }
});

// node_modules/@opentelemetry/api/build/esm/propagation-api.js
var propagation;
var init_propagation_api = __esm({
  "node_modules/@opentelemetry/api/build/esm/propagation-api.js"() {
    init_propagation();
    propagation = PropagationAPI.getInstance();
  }
});

// node_modules/@opentelemetry/api/build/esm/api/trace.js
var API_NAME5, TraceAPI;
var init_trace = __esm({
  "node_modules/@opentelemetry/api/build/esm/api/trace.js"() {
    init_global_utils();
    init_ProxyTracerProvider();
    init_spancontext_utils();
    init_context_utils();
    init_diag();
    API_NAME5 = "trace";
    TraceAPI = /** @class */
      function () {
        function TraceAPI2() {
          this._proxyTracerProvider = new ProxyTracerProvider();
          this.wrapSpanContext = wrapSpanContext;
          this.isSpanContextValid = isSpanContextValid;
          this.deleteSpan = deleteSpan;
          this.getSpan = getSpan;
          this.getActiveSpan = getActiveSpan;
          this.getSpanContext = getSpanContext;
          this.setSpan = setSpan;
          this.setSpanContext = setSpanContext;
        }
        TraceAPI2.getInstance = function () {
          if (!this._instance) {
            this._instance = new TraceAPI2();
          }
          return this._instance;
        };
        TraceAPI2.prototype.setGlobalTracerProvider = function (provider) {
          var success = registerGlobal(API_NAME5, this._proxyTracerProvider, DiagAPI.instance());
          if (success) {
            this._proxyTracerProvider.setDelegate(provider);
          }
          return success;
        };
        TraceAPI2.prototype.getTracerProvider = function () {
          return getGlobal(API_NAME5) || this._proxyTracerProvider;
        };
        TraceAPI2.prototype.getTracer = function (name, version) {
          return this.getTracerProvider().getTracer(name, version);
        };
        TraceAPI2.prototype.disable = function () {
          unregisterGlobal(API_NAME5, DiagAPI.instance());
          this._proxyTracerProvider = new ProxyTracerProvider();
        };
        return TraceAPI2;
      }();
  }
});

// node_modules/@opentelemetry/api/build/esm/trace-api.js
var trace;
var init_trace_api = __esm({
  "node_modules/@opentelemetry/api/build/esm/trace-api.js"() {
    init_trace();
    trace = TraceAPI.getInstance();
  }
});

// node_modules/@opentelemetry/api/build/esm/index.js
var esm_exports = {};
__export(esm_exports, {
  DiagConsoleLogger: () => DiagConsoleLogger,
  DiagLogLevel: () => DiagLogLevel,
  INVALID_SPANID: () => INVALID_SPANID,
  INVALID_SPAN_CONTEXT: () => INVALID_SPAN_CONTEXT,
  INVALID_TRACEID: () => INVALID_TRACEID,
  ProxyTracer: () => ProxyTracer,
  ProxyTracerProvider: () => ProxyTracerProvider,
  ROOT_CONTEXT: () => ROOT_CONTEXT,
  SamplingDecision: () => SamplingDecision,
  SpanKind: () => SpanKind,
  SpanStatusCode: () => SpanStatusCode,
  TraceFlags: () => TraceFlags,
  ValueType: () => ValueType,
  baggageEntryMetadataFromString: () => baggageEntryMetadataFromString,
  context: () => context,
  createContextKey: () => createContextKey,
  createNoopMeter: () => createNoopMeter,
  createTraceState: () => createTraceState,
  default: () => esm_default,
  defaultTextMapGetter: () => defaultTextMapGetter,
  defaultTextMapSetter: () => defaultTextMapSetter,
  diag: () => diag2,
  isSpanContextValid: () => isSpanContextValid,
  isValidSpanId: () => isValidSpanId,
  isValidTraceId: () => isValidTraceId,
  metrics: () => metrics,
  propagation: () => propagation,
  trace: () => trace
});
var esm_default;
var init_esm = __esm({
  "node_modules/@opentelemetry/api/build/esm/index.js"() {
    init_utils();
    init_context();
    init_consoleLogger();
    init_types();
    init_NoopMeter();
    init_Metric();
    init_TextMapPropagator();
    init_ProxyTracer();
    init_ProxyTracerProvider();
    init_SamplingResult();
    init_span_kind();
    init_status();
    init_trace_flags();
    init_utils2();
    init_spancontext_utils();
    init_invalid_span_constants();
    init_context_api();
    init_diag_api();
    init_metrics_api();
    init_propagation_api();
    init_trace_api();
    esm_default = {
      context,
      diag: diag2,
      metrics,
      propagation,
      trace
    };
  }
});

// node_modules/@opentelemetry/api-logs/build/src/types/LogRecord.js
var require_LogRecord = __commonJS({
  "node_modules/@opentelemetry/api-logs/build/src/types/LogRecord.js"(exports2) {
    "use strict";
    Object.defineProperty(exports2, "__esModule", { value: true });
    exports2.SeverityNumber = void 0;
    var SeverityNumber;
    (function (SeverityNumber2) {
      SeverityNumber2[SeverityNumber2["UNSPECIFIED"] = 0] = "UNSPECIFIED";
      SeverityNumber2[SeverityNumber2["TRACE"] = 1] = "TRACE";
      SeverityNumber2[SeverityNumber2["TRACE2"] = 2] = "TRACE2";
      SeverityNumber2[SeverityNumber2["TRACE3"] = 3] = "TRACE3";
      SeverityNumber2[SeverityNumber2["TRACE4"] = 4] = "TRACE4";
      SeverityNumber2[SeverityNumber2["DEBUG"] = 5] = "DEBUG";
      SeverityNumber2[SeverityNumber2["DEBUG2"] = 6] = "DEBUG2";
      SeverityNumber2[SeverityNumber2["DEBUG3"] = 7] = "DEBUG3";
      SeverityNumber2[SeverityNumber2["DEBUG4"] = 8] = "DEBUG4";
      SeverityNumber2[SeverityNumber2["INFO"] = 9] = "INFO";
      SeverityNumber2[SeverityNumber2["INFO2"] = 10] = "INFO2";
      SeverityNumber2[SeverityNumber2["INFO3"] = 11] = "INFO3";
      SeverityNumber2[SeverityNumber2["INFO4"] = 12] = "INFO4";
      SeverityNumber2[SeverityNumber2["WARN"] = 13] = "WARN";
      SeverityNumber2[SeverityNumber2["WARN2"] = 14] = "WARN2";
      SeverityNumber2[SeverityNumber2["WARN3"] = 15] = "WARN3";
      SeverityNumber2[SeverityNumber2["WARN4"] = 16] = "WARN4";
      SeverityNumber2[SeverityNumber2["ERROR"] = 17] = "ERROR";
      SeverityNumber2[SeverityNumber2["ERROR2"] = 18] = "ERROR2";
      SeverityNumber2[SeverityNumber2["ERROR3"] = 19] = "ERROR3";
      SeverityNumber2[SeverityNumber2["ERROR4"] = 20] = "ERROR4";
      SeverityNumber2[SeverityNumber2["FATAL"] = 21] = "FATAL";
      SeverityNumber2[SeverityNumber2["FATAL2"] = 22] = "FATAL2";
      SeverityNumber2[SeverityNumber2["FATAL3"] = 23] = "FATAL3";
      SeverityNumber2[SeverityNumber2["FATAL4"] = 24] = "FATAL4";
    })(SeverityNumber = exports2.SeverityNumber || (exports2.SeverityNumber = {}));
  }
});

// node_modules/@opentelemetry/api-logs/build/src/NoopLogger.js
var require_NoopLogger = __commonJS({
  "node_modules/@opentelemetry/api-logs/build/src/NoopLogger.js"(exports2) {
    "use strict";
    Object.defineProperty(exports2, "__esModule", { value: true });
    exports2.NOOP_LOGGER = exports2.NoopLogger = void 0;
    var NoopLogger = class {
      emit(_logRecord) {
      }
    };
    exports2.NoopLogger = NoopLogger;
    exports2.NOOP_LOGGER = new NoopLogger();
  }
});

// node_modules/@opentelemetry/api-logs/build/src/NoopLoggerProvider.js
var require_NoopLoggerProvider = __commonJS({
  "node_modules/@opentelemetry/api-logs/build/src/NoopLoggerProvider.js"(exports2) {
    "use strict";
    Object.defineProperty(exports2, "__esModule", { value: true });
    exports2.NOOP_LOGGER_PROVIDER = exports2.NoopLoggerProvider = void 0;
    var NoopLogger_1 = require_NoopLogger();
    var NoopLoggerProvider = class {
      getLogger(_name, _version, _options) {
        return new NoopLogger_1.NoopLogger();
      }
    };
    exports2.NoopLoggerProvider = NoopLoggerProvider;
    exports2.NOOP_LOGGER_PROVIDER = new NoopLoggerProvider();
  }
});

// node_modules/@opentelemetry/api-logs/build/src/ProxyLogger.js
var require_ProxyLogger = __commonJS({
  "node_modules/@opentelemetry/api-logs/build/src/ProxyLogger.js"(exports2) {
    "use strict";
    Object.defineProperty(exports2, "__esModule", { value: true });
    exports2.ProxyLogger = void 0;
    var NoopLogger_1 = require_NoopLogger();
    var ProxyLogger = class {
      constructor(_provider, name, version, options) {
        this._provider = _provider;
        this.name = name;
        this.version = version;
        this.options = options;
      }
      /**
       * Emit a log record. This method should only be used by log appenders.
       *
       * @param logRecord
       */
      emit(logRecord) {
        this._getLogger().emit(logRecord);
      }
      /**
       * Try to get a logger from the proxy logger provider.
       * If the proxy logger provider has no delegate, return a noop logger.
       */
      _getLogger() {
        if (this._delegate) {
          return this._delegate;
        }
        const logger = this._provider.getDelegateLogger(this.name, this.version, this.options);
        if (!logger) {
          return NoopLogger_1.NOOP_LOGGER;
        }
        this._delegate = logger;
        return this._delegate;
      }
    };
    exports2.ProxyLogger = ProxyLogger;
  }
});

// node_modules/@opentelemetry/api-logs/build/src/ProxyLoggerProvider.js
var require_ProxyLoggerProvider = __commonJS({
  "node_modules/@opentelemetry/api-logs/build/src/ProxyLoggerProvider.js"(exports2) {
    "use strict";
    Object.defineProperty(exports2, "__esModule", { value: true });
    exports2.ProxyLoggerProvider = void 0;
    var NoopLoggerProvider_1 = require_NoopLoggerProvider();
    var ProxyLogger_1 = require_ProxyLogger();
    var ProxyLoggerProvider = class {
      getLogger(name, version, options) {
        var _a;
        return (_a = this.getDelegateLogger(name, version, options)) !== null && _a !== void 0 ? _a : new ProxyLogger_1.ProxyLogger(this, name, version, options);
      }
      getDelegate() {
        var _a;
        return (_a = this._delegate) !== null && _a !== void 0 ? _a : NoopLoggerProvider_1.NOOP_LOGGER_PROVIDER;
      }
      /**
       * Set the delegate logger provider
       */
      setDelegate(delegate) {
        this._delegate = delegate;
      }
      getDelegateLogger(name, version, options) {
        var _a;
        return (_a = this._delegate) === null || _a === void 0 ? void 0 : _a.getLogger(name, version, options);
      }
    };
    exports2.ProxyLoggerProvider = ProxyLoggerProvider;
  }
});

// node_modules/@opentelemetry/api-logs/build/src/platform/node/globalThis.js
var require_globalThis = __commonJS({
  "node_modules/@opentelemetry/api-logs/build/src/platform/node/globalThis.js"(exports2) {
    "use strict";
    Object.defineProperty(exports2, "__esModule", { value: true });
    exports2._globalThis = void 0;
    exports2._globalThis = typeof globalThis === "object" ? globalThis : global;
  }
});

// node_modules/@opentelemetry/api-logs/build/src/platform/node/index.js
var require_node = __commonJS({
  "node_modules/@opentelemetry/api-logs/build/src/platform/node/index.js"(exports2) {
    "use strict";
    Object.defineProperty(exports2, "__esModule", { value: true });
    exports2._globalThis = void 0;
    var globalThis_1 = require_globalThis();
    Object.defineProperty(exports2, "_globalThis", {
      enumerable: true, get: function () {
        return globalThis_1._globalThis;
      }
    });
  }
});

// node_modules/@opentelemetry/api-logs/build/src/platform/index.js
var require_platform = __commonJS({
  "node_modules/@opentelemetry/api-logs/build/src/platform/index.js"(exports2) {
    "use strict";
    Object.defineProperty(exports2, "__esModule", { value: true });
    exports2._globalThis = void 0;
    var node_1 = require_node();
    Object.defineProperty(exports2, "_globalThis", {
      enumerable: true, get: function () {
        return node_1._globalThis;
      }
    });
  }
});

// node_modules/@opentelemetry/api-logs/build/src/internal/global-utils.js
var require_global_utils = __commonJS({
  "node_modules/@opentelemetry/api-logs/build/src/internal/global-utils.js"(exports2) {
    "use strict";
    Object.defineProperty(exports2, "__esModule", { value: true });
    exports2.API_BACKWARDS_COMPATIBILITY_VERSION = exports2.makeGetter = exports2._global = exports2.GLOBAL_LOGS_API_KEY = void 0;
    var platform_1 = require_platform();
    exports2.GLOBAL_LOGS_API_KEY = Symbol.for("io.opentelemetry.js.api.logs");
    exports2._global = platform_1._globalThis;
    function makeGetter(requiredVersion, instance, fallback) {
      return (version) => version === requiredVersion ? instance : fallback;
    }
    exports2.makeGetter = makeGetter;
    exports2.API_BACKWARDS_COMPATIBILITY_VERSION = 1;
  }
});

// node_modules/@opentelemetry/api-logs/build/src/api/logs.js
var require_logs = __commonJS({
  "node_modules/@opentelemetry/api-logs/build/src/api/logs.js"(exports2) {
    "use strict";
    Object.defineProperty(exports2, "__esModule", { value: true });
    exports2.LogsAPI = void 0;
    var global_utils_1 = require_global_utils();
    var NoopLoggerProvider_1 = require_NoopLoggerProvider();
    var ProxyLoggerProvider_1 = require_ProxyLoggerProvider();
    var LogsAPI = class _LogsAPI {
      constructor() {
        this._proxyLoggerProvider = new ProxyLoggerProvider_1.ProxyLoggerProvider();
      }
      static getInstance() {
        if (!this._instance) {
          this._instance = new _LogsAPI();
        }
        return this._instance;
      }
      setGlobalLoggerProvider(provider) {
        if (global_utils_1._global[global_utils_1.GLOBAL_LOGS_API_KEY]) {
          return this.getLoggerProvider();
        }
        global_utils_1._global[global_utils_1.GLOBAL_LOGS_API_KEY] = (0, global_utils_1.makeGetter)(global_utils_1.API_BACKWARDS_COMPATIBILITY_VERSION, provider, NoopLoggerProvider_1.NOOP_LOGGER_PROVIDER);
        this._proxyLoggerProvider.setDelegate(provider);
        return provider;
      }
      /**
       * Returns the global logger provider.
       *
       * @returns LoggerProvider
       */
      getLoggerProvider() {
        var _a, _b;
        return (_b = (_a = global_utils_1._global[global_utils_1.GLOBAL_LOGS_API_KEY]) === null || _a === void 0 ? void 0 : _a.call(global_utils_1._global, global_utils_1.API_BACKWARDS_COMPATIBILITY_VERSION)) !== null && _b !== void 0 ? _b : this._proxyLoggerProvider;
      }
      /**
       * Returns a logger from the global logger provider.
       *
       * @returns Logger
       */
      getLogger(name, version, options) {
        return this.getLoggerProvider().getLogger(name, version, options);
      }
      /** Remove the global logger provider */
      disable() {
        delete global_utils_1._global[global_utils_1.GLOBAL_LOGS_API_KEY];
        this._proxyLoggerProvider = new ProxyLoggerProvider_1.ProxyLoggerProvider();
      }
    };
    exports2.LogsAPI = LogsAPI;
  }
});

// node_modules/@opentelemetry/api-logs/build/src/index.js
var require_src = __commonJS({
  "node_modules/@opentelemetry/api-logs/build/src/index.js"(exports2) {
    "use strict";
    Object.defineProperty(exports2, "__esModule", { value: true });
    exports2.logs = exports2.ProxyLoggerProvider = exports2.ProxyLogger = exports2.NoopLoggerProvider = exports2.NOOP_LOGGER_PROVIDER = exports2.NoopLogger = exports2.NOOP_LOGGER = exports2.SeverityNumber = void 0;
    var LogRecord_1 = require_LogRecord();
    Object.defineProperty(exports2, "SeverityNumber", {
      enumerable: true, get: function () {
        return LogRecord_1.SeverityNumber;
      }
    });
    var NoopLogger_1 = require_NoopLogger();
    Object.defineProperty(exports2, "NOOP_LOGGER", {
      enumerable: true, get: function () {
        return NoopLogger_1.NOOP_LOGGER;
      }
    });
    Object.defineProperty(exports2, "NoopLogger", {
      enumerable: true, get: function () {
        return NoopLogger_1.NoopLogger;
      }
    });
    var NoopLoggerProvider_1 = require_NoopLoggerProvider();
    Object.defineProperty(exports2, "NOOP_LOGGER_PROVIDER", {
      enumerable: true, get: function () {
        return NoopLoggerProvider_1.NOOP_LOGGER_PROVIDER;
      }
    });
    Object.defineProperty(exports2, "NoopLoggerProvider", {
      enumerable: true, get: function () {
        return NoopLoggerProvider_1.NoopLoggerProvider;
      }
    });
    var ProxyLogger_1 = require_ProxyLogger();
    Object.defineProperty(exports2, "ProxyLogger", {
      enumerable: true, get: function () {
        return ProxyLogger_1.ProxyLogger;
      }
    });
    var ProxyLoggerProvider_1 = require_ProxyLoggerProvider();
    Object.defineProperty(exports2, "ProxyLoggerProvider", {
      enumerable: true, get: function () {
        return ProxyLoggerProvider_1.ProxyLoggerProvider;
      }
    });
    var logs_1 = require_logs();
    exports2.logs = logs_1.LogsAPI.getInstance();
  }
});

// node_modules/@vercel/otel/dist/node/index.js
var node_exports = {};
__export(node_exports, {
  FetchInstrumentation: () => sr,
  OTLPHttpJsonTraceExporter: () => rr,
  OTLPHttpProtoTraceExporter: () => dt,
  registerOTel: () => xv
});
function me() {
  return globalThis[gA]?.get();
}
function Os(r) {
  return Object.fromEntries(Object.entries(r).filter(([e, t]) => t !== void 0));
}
function mp(r) {
  return r ? r.split("::").at(-1) : void 0;
}
function gp(r = me(), e) {
  if (!r)
    return;
  let t = e ? SA(e, r.headers) : void 0;
  return Os({ [As]: r.headers.host, [_p]: r.headers["user-agent"], "http.referer": r.headers.referer, "vercel.request_id": mp(r.headers["x-vercel-id"]), "vercel.matched_path": r.headers["x-matched-path"], "vercel.edge_region": process.env.VERCEL_REGION, ...t });
}
function SA(r, e) {
  if (typeof r == "function")
    return r(e, TA);
  let t = {};
  for (let [n, i] of Object.entries(r)) {
    let s = e[i.toLocaleLowerCase()];
    s !== void 0 && (t[n] = s);
  }
  return t;
}
function er(r) {
  return (r & d.TraceFlags.SAMPLED) !== 0;
}
function OA(r) {
  let { kind: e, attributes: t } = r, { "operation.name": n, "resource.name": i, "span.type": s, "next.span_type": o, "http.method": a, "http.route": u } = t;
  if (n)
    return;
  let c = i ?? (a && typeof a == "string" && u && typeof u == "string" ? `${a} ${u}` : u);
  if (r.kind === d.SpanKind.SERVER && a && u && typeof a == "string" && typeof u == "string")
    return { "operation.name": "web.request", "resource.name": c };
  let _ = r.instrumentationLibrary.name, p = o ?? s;
  if (p && typeof p == "string") {
    let f = Tp(_, p);
    return u ? { "operation.name": f, "resource.name": c } : { "operation.name": f };
  }
  return { "operation.name": Tp(_, e === d.SpanKind.INTERNAL ? "" : AA[e]) };
}
function Tp(r, e) {
  if (!r)
    return e;
  let t = r.replace(/[ @./]/g, "_");
  return t.startsWith("_") && (t = t.slice(1)), e ? `${t}.${e}` : t;
}
function Is(r) {
  return typeof r.url == "string" ? r.url : kA;
}
function Ch(r) {
  let e = new Nh.Writer();
  return eO(r, e), e.finish();
}
function eO(r, e) {
  if (r.resourceSpans != null && r.resourceSpans.length)
    for (let t = 0; t < r.resourceSpans.length; ++t)
      tO(r.resourceSpans[t], e.uint32(10).fork()).ldelim();
  return e;
}
function tO(r, e) {
  if (r.resource != null && rO(r.resource, e.uint32(10).fork()).ldelim(), r.scopeSpans != null && r.scopeSpans.length)
    for (let t = 0; t < r.scopeSpans.length; ++t)
      nO(r.scopeSpans[t], e.uint32(18).fork()).ldelim();
  return r.schemaUrl != null && e.uint32(26).string(r.schemaUrl), e;
}
function rO(r, e) {
  if (r.attributes != null && r.attributes.length)
    for (let t = 0; t < r.attributes.length; ++t)
      ir(r.attributes[t], e.uint32(10).fork()).ldelim();
  return r.droppedAttributesCount != null && e.uint32(16).uint32(r.droppedAttributesCount), e;
}
function nO(r, e) {
  if (r.scope != null && oO(r.scope, e.uint32(10).fork()).ldelim(), r.spans != null && r.spans.length)
    for (let t = 0; t < r.spans.length; ++t)
      aO(r.spans[t], e.uint32(18).fork()).ldelim();
  return r.schemaUrl != null && e.uint32(26).string(r.schemaUrl), e;
}
function ir(r, e) {
  return r.key != null && e.uint32(10).string(r.key), r.value != null && wh(r.value, e.uint32(18).fork()).ldelim(), e;
}
function wh(r, e) {
  return r.stringValue != null && e.uint32(10).string(r.stringValue), r.boolValue != null && e.uint32(16).bool(r.boolValue), r.intValue != null && e.uint32(24).int64(r.intValue), r.doubleValue != null && e.uint32(33).double(r.doubleValue), r.arrayValue != null && iO(r.arrayValue, e.uint32(42).fork()).ldelim(), r.kvlistValue != null && sO(r.kvlistValue, e.uint32(50).fork()).ldelim(), r.bytesValue != null && e.uint32(58).bytes(r.bytesValue), e;
}
function iO(r, e) {
  if (r.values != null && r.values.length)
    for (let t = 0; t < r.values.length; ++t)
      wh(r.values[t], e.uint32(10).fork()).ldelim();
  return e;
}
function sO(r, e) {
  if (r.values != null && r.values.length)
    for (let t = 0; t < r.values.length; ++t)
      ir(r.values[t], e.uint32(10).fork()).ldelim();
  return e;
}
function oO(r, e) {
  if (r.name != null && e.uint32(10).string(r.name), r.version != null && e.uint32(18).string(r.version), r.attributes != null && r.attributes.length)
    for (let t = 0; t < r.attributes.length; ++t)
      ir(r.attributes[t], e.uint32(26).fork()).ldelim();
  return r.droppedAttributesCount != null && e.uint32(32).uint32(r.droppedAttributesCount), e;
}
function aO(r, e) {
  if (r.traceId != null && e.uint32(10).bytes(r.traceId), r.spanId != null && e.uint32(18).bytes(r.spanId), r.traceState != null && e.uint32(26).string(r.traceState), r.parentSpanId != null && e.uint32(34).bytes(r.parentSpanId), r.name != null && e.uint32(42).string(r.name), r.kind != null && e.uint32(48).int32(r.kind), r.startTimeUnixNano != null && e.uint32(57).fixed64(r.startTimeUnixNano), r.endTimeUnixNano != null && e.uint32(65).fixed64(r.endTimeUnixNano), r.attributes != null && r.attributes.length)
    for (let t = 0; t < r.attributes.length; ++t)
      ir(r.attributes[t], e.uint32(74).fork()).ldelim();
  if (r.droppedAttributesCount != null && e.uint32(80).uint32(r.droppedAttributesCount), r.events != null && r.events.length)
    for (let t = 0; t < r.events.length; ++t)
      cO(r.events[t], e.uint32(90).fork()).ldelim();
  if (r.droppedEventsCount != null && e.uint32(96).uint32(r.droppedEventsCount), r.links != null && r.links.length)
    for (let t = 0; t < r.links.length; ++t)
      lO(r.links[t], e.uint32(106).fork()).ldelim();
  return r.droppedLinksCount != null && e.uint32(112).uint32(r.droppedLinksCount), r.status != null && uO(r.status, e.uint32(122).fork()).ldelim(), e;
}
function uO(r, e) {
  return r.message != null && e.uint32(18).string(r.message), r.code != null && e.uint32(24).int32(r.code), e;
}
function cO(r, e) {
  if (r.timeUnixNano != null && e.uint32(9).fixed64(r.timeUnixNano), r.name != null && e.uint32(18).string(r.name), r.attributes != null && r.attributes.length)
    for (let t = 0; t < r.attributes.length; ++t)
      ir(r.attributes[t], e.uint32(26).fork()).ldelim();
  return r.droppedAttributesCount != null && e.uint32(32).uint32(r.droppedAttributesCount), e;
}
function lO(r, e) {
  if (r.traceId != null && e.uint32(10).bytes(r.traceId), r.spanId != null && e.uint32(18).bytes(r.spanId), r.traceState != null && e.uint32(26).string(r.traceState), r.attributes != null && r.attributes.length)
    for (let t = 0; t < r.attributes.length; ++t)
      ir(r.attributes[t], e.uint32(34).fork()).ldelim();
  return r.droppedAttributesCount != null && e.uint32(40).uint32(r.droppedAttributesCount), e;
}
function Dh(r, e) {
  return r.replace(/\{(?<temp1>[^{}]+)\}/g, (t, n) => {
    let i = e[n];
    return i !== void 0 ? String(i) : t;
  });
}
function pO(r) {
  let e = r.indexOf("?");
  return e === -1 ? r : r.substring(0, e);
}
function hO(r) {
  let e = 0, n = r.clone().body?.getReader();
  if (!n)
    return Promise.resolve(0);
  let i = () => n.read().then(({ done: s, value: o }) => {
    if (!s)
      return e += o.byteLength, i();
  });
  return i().then(() => e);
}
function _t(r, e) {
  if (e instanceof Error)
    r.recordException(e), r.setStatus({ code: d.SpanStatusCode.ERROR, message: e.message });
  else {
    let t = String(e);
    r.setStatus({ code: d.SpanStatusCode.ERROR, message: t });
  }
}
function ws(r, e, t, n) {
  for (let [i, s] of Object.entries(e)) {
    let o = n.get(t, s);
    o !== void 0 && r.setAttribute(i, o);
  }
}
function fO(r, e) {
  if (r.socketPath)
    throw new Error("Cannot construct a network URL: options.socketPath is specified, indicating a Unix domain socket.");
  let t = r.protocol ?? e;
  t && !t.endsWith(":") && (t += ":");
  let n = r.hostname, i = r.port ?? r.defaultPort;
  if (!n && r.host) {
    let c = r.host.split(":");
    n = c[0];
    let _ = c[1];
    if (c.length > 1 && _ && i === void 0) {
      let p = parseInt(_, 10);
      isNaN(p) || (i = p);
    }
  }
  n || (n = "localhost");
  let s;
  if (i !== void 0 && i !== "") {
    let c = parseInt(String(i), 10);
    isNaN(c) ? s = t === "https:" ? 443 : 80 : s = c;
  } else
    s = t === "https:" ? 443 : 80;
  let o = r.path || "/", a = `${t}//${n}:${s}`, u = new URL(o, a);
  if (r.auth) {
    let c = r.auth.split(":");
    u.username = decodeURIComponent(c[0] || ""), c.length > 1 && (u.password = decodeURIComponent(c[1] || ""));
  }
  return u;
}
function mO(r) {
  let [e, t, n, i, s] = r.split("-");
  return !e || !t || !n || !i || e.length !== 2 || t.length !== 32 || n.length !== 16 || i.length !== 2 || e === "00" && s ? null : { traceId: t, spanId: n, traceFlags: parseInt(i, 16) };
}
function BO() {
  let r = (0, Vs.parseEnvironment)(process.env);
  return { ...Vs.DEFAULT_ENVIRONMENT, ...r };
}
function qO(r, e) {
  return (r ?? ["auto"]).map((t) => t === "auto" ? (d.diag.debug("@vercel/otel: Configure instrumentations: fetch", e?.fetch), [new sr(e?.fetch)]) : t === "fetch" ? (d.diag.debug("@vercel/otel: Configure instrumentations: fetch", e?.fetch), new sr(e?.fetch)) : t).flat();
}
function GO(r, e, t) {
  let n = process.env.OTEL_PROPAGATORS && t.OTEL_PROPAGATORS && t.OTEL_PROPAGATORS.length > 0 ? t.OTEL_PROPAGATORS : void 0;
  return (r ?? n ?? ["auto"]).map((i) => {
    if (i === "none")
      return [];
    if (i === "auto") {
      let s = [];
      return s.push({ name: "tracecontext", propagator: new jr() }), s.push({ name: "baggage", propagator: new He.W3CBaggagePropagator() }), s.push({ name: "vercel-runtime", propagator: new xs() }), d.diag.debug(`@vercel/otel: Configure propagators: ${s.map((o) => o.name).join(", ")}`), s.map((o) => o.propagator);
    }
    if (i === "tracecontext")
      return d.diag.debug("@vercel/otel: Configure propagator: tracecontext"), new jr();
    if (i === "baggage")
      return d.diag.debug("@vercel/otel: Configure propagator: baggage"), new He.W3CBaggagePropagator();
    if (typeof i == "string")
      throw new Error(`Unknown propagator: "${i}"`);
    return i;
  }).flat();
}
function VO(r, e) {
  if (r && typeof r != "string")
    return r;
  let t = r && r !== "auto" ? r : e.OTEL_TRACES_SAMPLER || sf;
  switch (d.diag.debug("@vercel/otel: Configure sampler: ", t), t) {
    case "always_on":
      return new C.AlwaysOnSampler();
    case "always_off":
      return new C.AlwaysOffSampler();
    case "parentbased_always_on":
      return new C.ParentBasedSampler({ root: new C.AlwaysOnSampler() });
    case "parentbased_always_off":
      return new C.ParentBasedSampler({ root: new C.AlwaysOffSampler() });
    case "traceidratio":
      return new C.TraceIdRatioBasedSampler(of(e));
    case "parentbased_traceidratio":
      return new C.ParentBasedSampler({ root: new C.TraceIdRatioBasedSampler(of(e)) });
    default:
      return d.diag.error(`@vercel/otel: OTEL_TRACES_SAMPLER value "${String(e.OTEL_TRACES_SAMPLER)} invalid, defaulting to ${sf}".`), new C.AlwaysOnSampler();
  }
}
function of(r) {
  if (r.OTEL_TRACES_SAMPLER_ARG === void 0 || r.OTEL_TRACES_SAMPLER_ARG === "")
    return d.diag.error(`@vercel/otel: OTEL_TRACES_SAMPLER_ARG is blank, defaulting to ${cr}.`), cr;
  d.diag.debug("@vercel/otel: Configure sampler probability: ", r.OTEL_TRACES_SAMPLER_ARG);
  let e = Number(r.OTEL_TRACES_SAMPLER_ARG);
  return isNaN(e) ? (d.diag.error(`@vercel/otel: OTEL_TRACES_SAMPLER_ARG=${r.OTEL_TRACES_SAMPLER_ARG} was given, but it is invalid, defaulting to ${cr}.`), cr) : e < 0 || e > 1 ? (d.diag.error(`@vercel/otel: OTEL_TRACES_SAMPLER_ARG=${r.OTEL_TRACES_SAMPLER_ARG} was given, but it is out of range ([0..1]), defaulting to ${cr}.`), cr) : e;
}
function HO(r, e, t) {
  return [...(r ?? ["auto"]).flatMap((n) => {
    if (n === "auto") {
      let i = [new C.BatchSpanProcessor(new qs())];
      if (process.env.VERCEL_OTEL_ENDPOINTS) {
        let s = process.env.VERCEL_OTEL_ENDPOINTS_PORT || "4318", o = process.env.VERCEL_OTEL_ENDPOINTS_PROTOCOL || "http/protobuf";
        d.diag.debug("@vercel/otel: Configure vercel otel collector on port: ", s, o);
        let a = { url: `http://localhost:${s}/v1/traces`, headers: {} }, u = o === "http/protobuf" ? new dt(a) : new rr(a);
        i.push(new C.BatchSpanProcessor(u));
      } else
        (!e.traceExporter || e.traceExporter === "auto" || t.OTEL_EXPORTER_OTLP_TRACES_ENDPOINT || t.OTEL_EXPORTER_OTLP_ENDPOINT) && i.push(new C.BatchSpanProcessor(jO(t)));
      return i;
    }
    return n;
  }).filter($O), ...e.traceExporter && e.traceExporter !== "auto" ? [new C.BatchSpanProcessor(e.traceExporter)] : []];
}
function jO(r) {
  let e = process.env.OTEL_EXPORTER_OTLP_TRACES_PROTOCOL ?? process.env.OTEL_EXPORTER_OTLP_PROTOCOL ?? "http/protobuf", t = kO(r), n = { ...He.baggageUtils.parseKeyPairsIntoRecord(r.OTEL_EXPORTER_OTLP_HEADERS), ...He.baggageUtils.parseKeyPairsIntoRecord(r.OTEL_EXPORTER_OTLP_TRACES_HEADERS) };
  switch (d.diag.debug("@vercel/otel: Configure trace exporter: ", e, t, `headers: ${Object.keys(n).join(",") || "<none>"}`), e) {
    case "http/json":
      return new rr({ url: t, headers: n });
    case "http/protobuf":
      return new dt({ url: t, headers: n });
    default:
      return d.diag.warn(`@vercel/otel: Unsupported OTLP traces protocol: ${e}. Using http/protobuf.`), new dt();
  }
}
function kO(r) {
  let e = r.OTEL_EXPORTER_OTLP_TRACES_ENDPOINT;
  if (e && typeof e == "string")
    return e;
  let t = r.OTEL_EXPORTER_OTLP_ENDPOINT;
  return t && typeof t == "string" ? `${t}/${df}` : FO;
}
function $O(r) {
  return r != null;
}
function xv(r) {
  let e;
  r ? typeof r == "string" ? e = { serviceName: r } : e = r : e = {}, new Gs(e).start();
}
var import_url, import_module, import_path, $b, import_meta, require2, __filename, __dirname, _f, js, pf, hf, ff, Ef, z, dc, l, $r, ht, Y, m, d, h, dr, ks, $s, pc, hc, Tc, Ys, Qs, Zs, Ac, Yr, Rc, bc, yc, Lc, Mc, to, Nc, Cc, wc, xc, Ae, Uc, Bc, qc, ro, jc, kc, $c, Wc, Kc, co, el, rl, nl, ho, Eo, sl, ol, dl, El, ml, Tl, Sl, Al, Ol, bl, A, Pl, Po, gr, In, Mn, Mo, Co, Do, Bo, wl, xl, Bl, Gl, Gn, Vl, Hl, jo, kn, jl, Fl, $l, Wl, Kl, zl, $o, Ql, Ko, ed, Qo, td, rd, Jo, Ze, sd, ad, cd, ld, na, dd, _d, pd, hd, Ed, rt, md, ca, Td, Sd, Od, bd, Pd, vd, Ld, Nd, wd, Dd, la, st, fa, Bd, Gd, ga, Vd, Hd, jd, Oa, Fd, Xd, Wd, Kd, Yd, Qd, Zd, Jd, e_, t_, Li, wt, fe, xt, r_, be, s_, o_, Ba, wi, Di, u_, d_, h_, m_, g_, T_, S_, Fi, Xa, Ka, L_, N_, w_, x_, Qi, D_, au, wr, du, pu, U_, H_, F_, k_, X_, z_, Y_, Ou, Q_, Z_, J_, tp, fs, np, ip, op, wu, ap, up, Ur, Op, Br, ys, Lp, Np, Dp, Gp, Hp, Kp, zp, Qp, Jp, th, qe, rc, lh, sc, Th, Ah, Rh, Ph, Ih, Mh, Vh, jh, kh, $h, Wh, Zh, Jh, tf, rf, C, af, lr, uf, cf, Vs, lf, He, cp, lp, As, dp, Uu, _p, Bu, pp, hp, fp, Ep, gA, TA, Rs, AA, wp, Cp, tr, FA, kA, rr, Wu, xh, Nh, dt, ac, sr, dO, Uh, _O, Bh, qh, EO, uc, cc, jr, xs, Bs, nf, qs, UO, Gs, sf, cr, df, FO;
var init_node2 = __esm({
  "node_modules/@vercel/otel/dist/node/index.js"() {
    import_url = require("url");
    import_module = require("module");
    import_path = __toESM(require("path"), 1);
    init_esm();
    $b = __toESM(require_src(), 1);
    import_meta = {};
    require2 = (0, import_module.createRequire)(import_meta.url);
    __filename = (0, import_url.fileURLToPath)(import_meta.url);
    __dirname = import_path.default.dirname(__filename);
    _f = Object.create;
    js = Object.defineProperty;
    pf = Object.getOwnPropertyDescriptor;
    hf = Object.getOwnPropertyNames;
    ff = Object.getPrototypeOf;
    Ef = Object.prototype.hasOwnProperty;
    z = ((r) => typeof require2 < "u" ? require2 : typeof Proxy < "u" ? new Proxy(r, { get: (e, t) => (typeof require2 < "u" ? require2 : e)[t] }) : r)(function (r) {
      if (typeof require2 < "u")
        return require2.apply(this, arguments);
      throw Error('Dynamic require of "' + r + '" is not supported');
    });
    dc = (r, e) => () => (r && (e = r(r = 0)), e);
    l = (r, e) => () => (e || r((e = { exports: {} }).exports, e), e.exports);
    $r = (r, e, t, n) => {
      if (e && typeof e == "object" || typeof e == "function")
        for (let i of hf(e))
          !Ef.call(r, i) && i !== t && js(r, i, { get: () => e[i], enumerable: !(n = pf(e, i)) || n.enumerable });
      return r;
    };
    ht = (r, e, t) => ($r(r, e, "default"), t && $r(t, e, "default"));
    Y = (r, e, t) => (t = r != null ? _f(ff(r)) : {}, $r(e || !r || !r.__esModule ? js(t, "default", { value: r, enumerable: true }) : t, r));
    m = (r) => $r(js({}, "__esModule", { value: true }), r);
    d = {};
    h = dc(() => {
      ht(d, esm_exports);
    });
    dr = l((ye) => {
      "use strict";
      Object.defineProperty(ye, "__esModule", { value: true });
      ye.isTracingSuppressed = ye.unsuppressTracing = ye.suppressTracing = void 0;
      var mf = (h(), m(d)), Fs = (0, mf.createContextKey)("OpenTelemetry SDK Context Key SUPPRESS_TRACING");
      function gf(r) {
        return r.setValue(Fs, true);
      }
      ye.suppressTracing = gf;
      function Tf(r) {
        return r.deleteValue(Fs);
      }
      ye.unsuppressTracing = Tf;
      function Sf(r) {
        return r.getValue(Fs) === true;
      }
      ye.isTracingSuppressed = Sf;
    });
    ks = l((F) => {
      "use strict";
      Object.defineProperty(F, "__esModule", { value: true });
      F.BAGGAGE_MAX_TOTAL_LENGTH = F.BAGGAGE_MAX_PER_NAME_VALUE_PAIRS = F.BAGGAGE_MAX_NAME_VALUE_PAIRS = F.BAGGAGE_HEADER = F.BAGGAGE_ITEMS_SEPARATOR = F.BAGGAGE_PROPERTIES_SEPARATOR = F.BAGGAGE_KEY_PAIR_SEPARATOR = void 0;
      F.BAGGAGE_KEY_PAIR_SEPARATOR = "=";
      F.BAGGAGE_PROPERTIES_SEPARATOR = ";";
      F.BAGGAGE_ITEMS_SEPARATOR = ",";
      F.BAGGAGE_HEADER = "baggage";
      F.BAGGAGE_MAX_NAME_VALUE_PAIRS = 180;
      F.BAGGAGE_MAX_PER_NAME_VALUE_PAIRS = 4096;
      F.BAGGAGE_MAX_TOTAL_LENGTH = 8192;
    });
    $s = l((_e) => {
      "use strict";
      Object.defineProperty(_e, "__esModule", { value: true });
      _e.parseKeyPairsIntoRecord = _e.parsePairKeyValue = _e.getKeyPairs = _e.serializeKeyPairs = void 0;
      var Af = (h(), m(d)), je = ks();
      function Of(r) {
        return r.reduce((e, t) => {
          let n = `${e}${e !== "" ? je.BAGGAGE_ITEMS_SEPARATOR : ""}${t}`;
          return n.length > je.BAGGAGE_MAX_TOTAL_LENGTH ? e : n;
        }, "");
      }
      _e.serializeKeyPairs = Of;
      function Rf(r) {
        return r.getAllEntries().map(([e, t]) => {
          let n = `${encodeURIComponent(e)}=${encodeURIComponent(t.value)}`;
          return t.metadata !== void 0 && (n += je.BAGGAGE_PROPERTIES_SEPARATOR + t.metadata.toString()), n;
        });
      }
      _e.getKeyPairs = Rf;
      function _c(r) {
        let e = r.split(je.BAGGAGE_PROPERTIES_SEPARATOR);
        if (e.length <= 0)
          return;
        let t = e.shift();
        if (!t)
          return;
        let n = t.indexOf(je.BAGGAGE_KEY_PAIR_SEPARATOR);
        if (n <= 0)
          return;
        let i = decodeURIComponent(t.substring(0, n).trim()), s = decodeURIComponent(t.substring(n + 1).trim()), o;
        return e.length > 0 && (o = (0, Af.baggageEntryMetadataFromString)(e.join(je.BAGGAGE_PROPERTIES_SEPARATOR))), { key: i, value: s, metadata: o };
      }
      _e.parsePairKeyValue = _c;
      function bf(r) {
        return typeof r != "string" || r.length === 0 ? {} : r.split(je.BAGGAGE_ITEMS_SEPARATOR).map((e) => _c(e)).filter((e) => e !== void 0 && e.value.length > 0).reduce((e, t) => (e[t.key] = t.value, e), {});
      }
      _e.parseKeyPairsIntoRecord = bf;
    });
    pc = l((Xr) => {
      "use strict";
      Object.defineProperty(Xr, "__esModule", { value: true });
      Xr.W3CBaggagePropagator = void 0;
      var Xs = (h(), m(d)), Pf = dr(), Fe = ks(), Ws = $s(), Ks = class {
        inject(e, t, n) {
          let i = Xs.propagation.getBaggage(e);
          if (!i || (0, Pf.isTracingSuppressed)(e))
            return;
          let s = (0, Ws.getKeyPairs)(i).filter((a) => a.length <= Fe.BAGGAGE_MAX_PER_NAME_VALUE_PAIRS).slice(0, Fe.BAGGAGE_MAX_NAME_VALUE_PAIRS), o = (0, Ws.serializeKeyPairs)(s);
          o.length > 0 && n.set(t, Fe.BAGGAGE_HEADER, o);
        }
        extract(e, t, n) {
          let i = n.get(t, Fe.BAGGAGE_HEADER), s = Array.isArray(i) ? i.join(Fe.BAGGAGE_ITEMS_SEPARATOR) : i;
          if (!s)
            return e;
          let o = {};
          return s.length === 0 || (s.split(Fe.BAGGAGE_ITEMS_SEPARATOR).forEach((u) => {
            let c = (0, Ws.parsePairKeyValue)(u);
            if (c) {
              let _ = { value: c.value };
              c.metadata && (_.metadata = c.metadata), o[c.key] = _;
            }
          }), Object.entries(o).length === 0) ? e : Xs.propagation.setBaggage(e, Xs.propagation.createBaggage(o));
        }
        fields() {
          return [Fe.BAGGAGE_HEADER];
        }
      };
      Xr.W3CBaggagePropagator = Ks;
    });
    hc = l((Wr) => {
      "use strict";
      Object.defineProperty(Wr, "__esModule", { value: true });
      Wr.AnchoredClock = void 0;
      var zs = class {
        constructor(e, t) {
          this._monotonicClock = t, this._epochMillis = e.now(), this._performanceMillis = t.now();
        }
        now() {
          let e = this._monotonicClock.now() - this._performanceMillis;
          return this._epochMillis + e;
        }
      };
      Wr.AnchoredClock = zs;
    });
    Tc = l((ve) => {
      "use strict";
      Object.defineProperty(ve, "__esModule", { value: true });
      ve.isAttributeValue = ve.isAttributeKey = ve.sanitizeAttributes = void 0;
      var fc = (h(), m(d));
      function yf(r) {
        let e = {};
        if (typeof r != "object" || r == null)
          return e;
        for (let [t, n] of Object.entries(r)) {
          if (!Ec(t)) {
            fc.diag.warn(`Invalid attribute key: ${t}`);
            continue;
          }
          if (!mc(n)) {
            fc.diag.warn(`Invalid attribute value set for key: ${t}`);
            continue;
          }
          Array.isArray(n) ? e[t] = n.slice() : e[t] = n;
        }
        return e;
      }
      ve.sanitizeAttributes = yf;
      function Ec(r) {
        return typeof r == "string" && r.length > 0;
      }
      ve.isAttributeKey = Ec;
      function mc(r) {
        return r == null ? true : Array.isArray(r) ? vf(r) : gc(r);
      }
      ve.isAttributeValue = mc;
      function vf(r) {
        let e;
        for (let t of r)
          if (t != null) {
            if (!e) {
              if (gc(t)) {
                e = typeof t;
                continue;
              }
              return false;
            }
            if (typeof t !== e)
              return false;
          }
        return true;
      }
      function gc(r) {
        switch (typeof r) {
          case "number":
          case "boolean":
          case "string":
            return true;
        }
        return false;
      }
    });
    Ys = l((Kr) => {
      "use strict";
      Object.defineProperty(Kr, "__esModule", { value: true });
      Kr.loggingErrorHandler = void 0;
      var If = (h(), m(d));
      function Lf() {
        return (r) => {
          If.diag.error(Mf(r));
        };
      }
      Kr.loggingErrorHandler = Lf;
      function Mf(r) {
        return typeof r == "string" ? r : JSON.stringify(Nf(r));
      }
      function Nf(r) {
        let e = {}, t = r;
        for (; t !== null;)
          Object.getOwnPropertyNames(t).forEach((n) => {
            if (e[n])
              return;
            let i = t[n];
            i && (e[n] = String(i));
          }), t = Object.getPrototypeOf(t);
        return e;
      }
    });
    Qs = l((ft) => {
      "use strict";
      Object.defineProperty(ft, "__esModule", { value: true });
      ft.globalErrorHandler = ft.setGlobalErrorHandler = void 0;
      var Cf = Ys(), Sc = (0, Cf.loggingErrorHandler)();
      function wf(r) {
        Sc = r;
      }
      ft.setGlobalErrorHandler = wf;
      function xf(r) {
        try {
          Sc(r);
        } catch {
        }
      }
      ft.globalErrorHandler = xf;
    });
    Zs = l((_r) => {
      "use strict";
      Object.defineProperty(_r, "__esModule", { value: true });
      _r.TracesSamplerValues = void 0;
      var Df;
      (function (r) {
        r.AlwaysOff = "always_off", r.AlwaysOn = "always_on", r.ParentBasedAlwaysOff = "parentbased_always_off", r.ParentBasedAlwaysOn = "parentbased_always_on", r.ParentBasedTraceIdRatio = "parentbased_traceidratio", r.TraceIdRatio = "traceidratio";
      })(Df = _r.TracesSamplerValues || (_r.TracesSamplerValues = {}));
    });
    Ac = l((zr) => {
      "use strict";
      Object.defineProperty(zr, "__esModule", { value: true });
      zr._globalThis = void 0;
      zr._globalThis = typeof globalThis == "object" ? globalThis : typeof self == "object" ? self : typeof window == "object" ? window : typeof global == "object" ? global : {};
    });
    Yr = l((v) => {
      "use strict";
      Object.defineProperty(v, "__esModule", { value: true });
      v.getEnvWithoutDefaults = v.parseEnvironment = v.DEFAULT_ENVIRONMENT = v.DEFAULT_SPAN_ATTRIBUTE_PER_LINK_COUNT_LIMIT = v.DEFAULT_SPAN_ATTRIBUTE_PER_EVENT_COUNT_LIMIT = v.DEFAULT_ATTRIBUTE_COUNT_LIMIT = v.DEFAULT_ATTRIBUTE_VALUE_LENGTH_LIMIT = void 0;
      var Ie = (h(), m(d)), Uf = Zs(), Bf = Ac(), qf = ",", Gf = ["OTEL_SDK_DISABLED"];
      function Vf(r) {
        return Gf.indexOf(r) > -1;
      }
      var Hf = ["OTEL_BSP_EXPORT_TIMEOUT", "OTEL_BSP_MAX_EXPORT_BATCH_SIZE", "OTEL_BSP_MAX_QUEUE_SIZE", "OTEL_BSP_SCHEDULE_DELAY", "OTEL_BLRP_EXPORT_TIMEOUT", "OTEL_BLRP_MAX_EXPORT_BATCH_SIZE", "OTEL_BLRP_MAX_QUEUE_SIZE", "OTEL_BLRP_SCHEDULE_DELAY", "OTEL_ATTRIBUTE_VALUE_LENGTH_LIMIT", "OTEL_ATTRIBUTE_COUNT_LIMIT", "OTEL_SPAN_ATTRIBUTE_VALUE_LENGTH_LIMIT", "OTEL_SPAN_ATTRIBUTE_COUNT_LIMIT", "OTEL_LOGRECORD_ATTRIBUTE_VALUE_LENGTH_LIMIT", "OTEL_LOGRECORD_ATTRIBUTE_COUNT_LIMIT", "OTEL_SPAN_EVENT_COUNT_LIMIT", "OTEL_SPAN_LINK_COUNT_LIMIT", "OTEL_SPAN_ATTRIBUTE_PER_EVENT_COUNT_LIMIT", "OTEL_SPAN_ATTRIBUTE_PER_LINK_COUNT_LIMIT", "OTEL_EXPORTER_OTLP_TIMEOUT", "OTEL_EXPORTER_OTLP_TRACES_TIMEOUT", "OTEL_EXPORTER_OTLP_METRICS_TIMEOUT", "OTEL_EXPORTER_OTLP_LOGS_TIMEOUT", "OTEL_EXPORTER_JAEGER_AGENT_PORT"];
      function jf(r) {
        return Hf.indexOf(r) > -1;
      }
      var Ff = ["OTEL_NO_PATCH_MODULES", "OTEL_PROPAGATORS"];
      function kf(r) {
        return Ff.indexOf(r) > -1;
      }
      v.DEFAULT_ATTRIBUTE_VALUE_LENGTH_LIMIT = 1 / 0;
      v.DEFAULT_ATTRIBUTE_COUNT_LIMIT = 128;
      v.DEFAULT_SPAN_ATTRIBUTE_PER_EVENT_COUNT_LIMIT = 128;
      v.DEFAULT_SPAN_ATTRIBUTE_PER_LINK_COUNT_LIMIT = 128;
      v.DEFAULT_ENVIRONMENT = { OTEL_SDK_DISABLED: false, CONTAINER_NAME: "", ECS_CONTAINER_METADATA_URI_V4: "", ECS_CONTAINER_METADATA_URI: "", HOSTNAME: "", KUBERNETES_SERVICE_HOST: "", NAMESPACE: "", OTEL_BSP_EXPORT_TIMEOUT: 3e4, OTEL_BSP_MAX_EXPORT_BATCH_SIZE: 512, OTEL_BSP_MAX_QUEUE_SIZE: 2048, OTEL_BSP_SCHEDULE_DELAY: 5e3, OTEL_BLRP_EXPORT_TIMEOUT: 3e4, OTEL_BLRP_MAX_EXPORT_BATCH_SIZE: 512, OTEL_BLRP_MAX_QUEUE_SIZE: 2048, OTEL_BLRP_SCHEDULE_DELAY: 5e3, OTEL_EXPORTER_JAEGER_AGENT_HOST: "", OTEL_EXPORTER_JAEGER_AGENT_PORT: 6832, OTEL_EXPORTER_JAEGER_ENDPOINT: "", OTEL_EXPORTER_JAEGER_PASSWORD: "", OTEL_EXPORTER_JAEGER_USER: "", OTEL_EXPORTER_OTLP_ENDPOINT: "", OTEL_EXPORTER_OTLP_TRACES_ENDPOINT: "", OTEL_EXPORTER_OTLP_METRICS_ENDPOINT: "", OTEL_EXPORTER_OTLP_LOGS_ENDPOINT: "", OTEL_EXPORTER_OTLP_HEADERS: "", OTEL_EXPORTER_OTLP_TRACES_HEADERS: "", OTEL_EXPORTER_OTLP_METRICS_HEADERS: "", OTEL_EXPORTER_OTLP_LOGS_HEADERS: "", OTEL_EXPORTER_OTLP_TIMEOUT: 1e4, OTEL_EXPORTER_OTLP_TRACES_TIMEOUT: 1e4, OTEL_EXPORTER_OTLP_METRICS_TIMEOUT: 1e4, OTEL_EXPORTER_OTLP_LOGS_TIMEOUT: 1e4, OTEL_EXPORTER_ZIPKIN_ENDPOINT: "http://localhost:9411/api/v2/spans", OTEL_LOG_LEVEL: Ie.DiagLogLevel.INFO, OTEL_NO_PATCH_MODULES: [], OTEL_PROPAGATORS: ["tracecontext", "baggage"], OTEL_RESOURCE_ATTRIBUTES: "", OTEL_SERVICE_NAME: "", OTEL_ATTRIBUTE_VALUE_LENGTH_LIMIT: v.DEFAULT_ATTRIBUTE_VALUE_LENGTH_LIMIT, OTEL_ATTRIBUTE_COUNT_LIMIT: v.DEFAULT_ATTRIBUTE_COUNT_LIMIT, OTEL_SPAN_ATTRIBUTE_VALUE_LENGTH_LIMIT: v.DEFAULT_ATTRIBUTE_VALUE_LENGTH_LIMIT, OTEL_SPAN_ATTRIBUTE_COUNT_LIMIT: v.DEFAULT_ATTRIBUTE_COUNT_LIMIT, OTEL_LOGRECORD_ATTRIBUTE_VALUE_LENGTH_LIMIT: v.DEFAULT_ATTRIBUTE_VALUE_LENGTH_LIMIT, OTEL_LOGRECORD_ATTRIBUTE_COUNT_LIMIT: v.DEFAULT_ATTRIBUTE_COUNT_LIMIT, OTEL_SPAN_EVENT_COUNT_LIMIT: 128, OTEL_SPAN_LINK_COUNT_LIMIT: 128, OTEL_SPAN_ATTRIBUTE_PER_EVENT_COUNT_LIMIT: v.DEFAULT_SPAN_ATTRIBUTE_PER_EVENT_COUNT_LIMIT, OTEL_SPAN_ATTRIBUTE_PER_LINK_COUNT_LIMIT: v.DEFAULT_SPAN_ATTRIBUTE_PER_LINK_COUNT_LIMIT, OTEL_TRACES_EXPORTER: "", OTEL_TRACES_SAMPLER: Uf.TracesSamplerValues.ParentBasedAlwaysOn, OTEL_TRACES_SAMPLER_ARG: "", OTEL_LOGS_EXPORTER: "", OTEL_EXPORTER_OTLP_INSECURE: "", OTEL_EXPORTER_OTLP_TRACES_INSECURE: "", OTEL_EXPORTER_OTLP_METRICS_INSECURE: "", OTEL_EXPORTER_OTLP_LOGS_INSECURE: "", OTEL_EXPORTER_OTLP_CERTIFICATE: "", OTEL_EXPORTER_OTLP_TRACES_CERTIFICATE: "", OTEL_EXPORTER_OTLP_METRICS_CERTIFICATE: "", OTEL_EXPORTER_OTLP_LOGS_CERTIFICATE: "", OTEL_EXPORTER_OTLP_COMPRESSION: "", OTEL_EXPORTER_OTLP_TRACES_COMPRESSION: "", OTEL_EXPORTER_OTLP_METRICS_COMPRESSION: "", OTEL_EXPORTER_OTLP_LOGS_COMPRESSION: "", OTEL_EXPORTER_OTLP_CLIENT_KEY: "", OTEL_EXPORTER_OTLP_TRACES_CLIENT_KEY: "", OTEL_EXPORTER_OTLP_METRICS_CLIENT_KEY: "", OTEL_EXPORTER_OTLP_LOGS_CLIENT_KEY: "", OTEL_EXPORTER_OTLP_CLIENT_CERTIFICATE: "", OTEL_EXPORTER_OTLP_TRACES_CLIENT_CERTIFICATE: "", OTEL_EXPORTER_OTLP_METRICS_CLIENT_CERTIFICATE: "", OTEL_EXPORTER_OTLP_LOGS_CLIENT_CERTIFICATE: "", OTEL_EXPORTER_OTLP_PROTOCOL: "http/protobuf", OTEL_EXPORTER_OTLP_TRACES_PROTOCOL: "http/protobuf", OTEL_EXPORTER_OTLP_METRICS_PROTOCOL: "http/protobuf", OTEL_EXPORTER_OTLP_LOGS_PROTOCOL: "http/protobuf", OTEL_EXPORTER_OTLP_METRICS_TEMPORALITY_PREFERENCE: "cumulative" };
      function $f(r, e, t) {
        if (typeof t[r] > "u")
          return;
        let n = String(t[r]);
        e[r] = n.toLowerCase() === "true";
      }
      function Xf(r, e, t, n = -1 / 0, i = 1 / 0) {
        if (typeof t[r] < "u") {
          let s = Number(t[r]);
          isNaN(s) || (s < n ? e[r] = n : s > i ? e[r] = i : e[r] = s);
        }
      }
      function Wf(r, e, t, n = qf) {
        let i = t[r];
        typeof i == "string" && (e[r] = i.split(n).map((s) => s.trim()));
      }
      var Kf = { ALL: Ie.DiagLogLevel.ALL, VERBOSE: Ie.DiagLogLevel.VERBOSE, DEBUG: Ie.DiagLogLevel.DEBUG, INFO: Ie.DiagLogLevel.INFO, WARN: Ie.DiagLogLevel.WARN, ERROR: Ie.DiagLogLevel.ERROR, NONE: Ie.DiagLogLevel.NONE };
      function zf(r, e, t) {
        let n = t[r];
        if (typeof n == "string") {
          let i = Kf[n.toUpperCase()];
          i != null && (e[r] = i);
        }
      }
      function Js(r) {
        let e = {};
        for (let t in v.DEFAULT_ENVIRONMENT) {
          let n = t;
          switch (n) {
            case "OTEL_LOG_LEVEL":
              zf(n, e, r);
              break;
            default:
              if (Vf(n))
                $f(n, e, r);
              else if (jf(n))
                Xf(n, e, r);
              else if (kf(n))
                Wf(n, e, r);
              else {
                let i = r[n];
                typeof i < "u" && i !== null && (e[n] = String(i));
              }
          }
        }
        return e;
      }
      v.parseEnvironment = Js;
      function Yf() {
        return typeof process < "u" && process && process.env ? Js(process.env) : Js(Bf._globalThis);
      }
      v.getEnvWithoutDefaults = Yf;
    });
    Rc = l((Qr) => {
      "use strict";
      Object.defineProperty(Qr, "__esModule", { value: true });
      Qr.getEnv = void 0;
      var Qf = z("os"), Oc = Yr();
      function Zf() {
        let r = (0, Oc.parseEnvironment)(process.env);
        return Object.assign({ HOSTNAME: Qf.hostname() }, Oc.DEFAULT_ENVIRONMENT, r);
      }
      Qr.getEnv = Zf;
    });
    bc = l((Zr) => {
      "use strict";
      Object.defineProperty(Zr, "__esModule", { value: true });
      Zr._globalThis = void 0;
      Zr._globalThis = typeof globalThis == "object" ? globalThis : global;
    });
    yc = l((Jr) => {
      "use strict";
      Object.defineProperty(Jr, "__esModule", { value: true });
      Jr.hexToBase64 = void 0;
      function Pc(r) {
        return r >= 48 && r <= 57 ? r - 48 : r >= 97 && r <= 102 ? r - 87 : r - 55;
      }
      var Jf = Buffer.alloc(8), eE = Buffer.alloc(16);
      function tE(r) {
        let e;
        r.length === 16 ? e = Jf : r.length === 32 ? e = eE : e = Buffer.alloc(r.length / 2);
        let t = 0;
        for (let n = 0; n < r.length; n += 2) {
          let i = Pc(r.charCodeAt(n)), s = Pc(r.charCodeAt(n + 1));
          e.writeUInt8(i << 4 | s, t++);
        }
        return e.toString("base64");
      }
      Jr.hexToBase64 = tE;
    });
    Lc = l((tn) => {
      "use strict";
      Object.defineProperty(tn, "__esModule", { value: true });
      tn.RandomIdGenerator = void 0;
      var rE = 8, Ic = 16, eo = class {
        constructor() {
          this.generateTraceId = vc(Ic), this.generateSpanId = vc(rE);
        }
      };
      tn.RandomIdGenerator = eo;
      var en = Buffer.allocUnsafe(Ic);
      function vc(r) {
        return function () {
          for (let t = 0; t < r / 4; t++)
            en.writeUInt32BE(Math.random() * 2 ** 32 >>> 0, t * 4);
          for (let t = 0; t < r && !(en[t] > 0); t++)
            t === r - 1 && (en[r - 1] = 1);
          return en.toString("hex", 0, r);
        };
      }
    });
    Mc = l((rn) => {
      "use strict";
      Object.defineProperty(rn, "__esModule", { value: true });
      rn.otperformance = void 0;
      var nE = z("perf_hooks");
      rn.otperformance = nE.performance;
    });
    to = l((nn) => {
      "use strict";
      Object.defineProperty(nn, "__esModule", { value: true });
      nn.VERSION = void 0;
      nn.VERSION = "1.19.0";
    });
    Nc = l((b) => {
      "use strict";
      Object.defineProperty(b, "__esModule", { value: true });
      b.MessageTypeValues = b.RpcGrpcStatusCodeValues = b.MessagingOperationValues = b.MessagingDestinationKindValues = b.HttpFlavorValues = b.NetHostConnectionSubtypeValues = b.NetHostConnectionTypeValues = b.NetTransportValues = b.FaasInvokedProviderValues = b.FaasDocumentOperationValues = b.FaasTriggerValues = b.DbCassandraConsistencyLevelValues = b.DbSystemValues = b.SemanticAttributes = void 0;
      b.SemanticAttributes = { AWS_LAMBDA_INVOKED_ARN: "aws.lambda.invoked_arn", DB_SYSTEM: "db.system", DB_CONNECTION_STRING: "db.connection_string", DB_USER: "db.user", DB_JDBC_DRIVER_CLASSNAME: "db.jdbc.driver_classname", DB_NAME: "db.name", DB_STATEMENT: "db.statement", DB_OPERATION: "db.operation", DB_MSSQL_INSTANCE_NAME: "db.mssql.instance_name", DB_CASSANDRA_KEYSPACE: "db.cassandra.keyspace", DB_CASSANDRA_PAGE_SIZE: "db.cassandra.page_size", DB_CASSANDRA_CONSISTENCY_LEVEL: "db.cassandra.consistency_level", DB_CASSANDRA_TABLE: "db.cassandra.table", DB_CASSANDRA_IDEMPOTENCE: "db.cassandra.idempotence", DB_CASSANDRA_SPECULATIVE_EXECUTION_COUNT: "db.cassandra.speculative_execution_count", DB_CASSANDRA_COORDINATOR_ID: "db.cassandra.coordinator.id", DB_CASSANDRA_COORDINATOR_DC: "db.cassandra.coordinator.dc", DB_HBASE_NAMESPACE: "db.hbase.namespace", DB_REDIS_DATABASE_INDEX: "db.redis.database_index", DB_MONGODB_COLLECTION: "db.mongodb.collection", DB_SQL_TABLE: "db.sql.table", EXCEPTION_TYPE: "exception.type", EXCEPTION_MESSAGE: "exception.message", EXCEPTION_STACKTRACE: "exception.stacktrace", EXCEPTION_ESCAPED: "exception.escaped", FAAS_TRIGGER: "faas.trigger", FAAS_EXECUTION: "faas.execution", FAAS_DOCUMENT_COLLECTION: "faas.document.collection", FAAS_DOCUMENT_OPERATION: "faas.document.operation", FAAS_DOCUMENT_TIME: "faas.document.time", FAAS_DOCUMENT_NAME: "faas.document.name", FAAS_TIME: "faas.time", FAAS_CRON: "faas.cron", FAAS_COLDSTART: "faas.coldstart", FAAS_INVOKED_NAME: "faas.invoked_name", FAAS_INVOKED_PROVIDER: "faas.invoked_provider", FAAS_INVOKED_REGION: "faas.invoked_region", NET_TRANSPORT: "net.transport", NET_PEER_IP: "net.peer.ip", NET_PEER_PORT: "net.peer.port", NET_PEER_NAME: "net.peer.name", NET_HOST_IP: "net.host.ip", NET_HOST_PORT: "net.host.port", NET_HOST_NAME: "net.host.name", NET_HOST_CONNECTION_TYPE: "net.host.connection.type", NET_HOST_CONNECTION_SUBTYPE: "net.host.connection.subtype", NET_HOST_CARRIER_NAME: "net.host.carrier.name", NET_HOST_CARRIER_MCC: "net.host.carrier.mcc", NET_HOST_CARRIER_MNC: "net.host.carrier.mnc", NET_HOST_CARRIER_ICC: "net.host.carrier.icc", PEER_SERVICE: "peer.service", ENDUSER_ID: "enduser.id", ENDUSER_ROLE: "enduser.role", ENDUSER_SCOPE: "enduser.scope", THREAD_ID: "thread.id", THREAD_NAME: "thread.name", CODE_FUNCTION: "code.function", CODE_NAMESPACE: "code.namespace", CODE_FILEPATH: "code.filepath", CODE_LINENO: "code.lineno", HTTP_METHOD: "http.method", HTTP_URL: "http.url", HTTP_TARGET: "http.target", HTTP_HOST: "http.host", HTTP_SCHEME: "http.scheme", HTTP_STATUS_CODE: "http.status_code", HTTP_FLAVOR: "http.flavor", HTTP_USER_AGENT: "http.user_agent", HTTP_REQUEST_CONTENT_LENGTH: "http.request_content_length", HTTP_REQUEST_CONTENT_LENGTH_UNCOMPRESSED: "http.request_content_length_uncompressed", HTTP_RESPONSE_CONTENT_LENGTH: "http.response_content_length", HTTP_RESPONSE_CONTENT_LENGTH_UNCOMPRESSED: "http.response_content_length_uncompressed", HTTP_SERVER_NAME: "http.server_name", HTTP_ROUTE: "http.route", HTTP_CLIENT_IP: "http.client_ip", AWS_DYNAMODB_TABLE_NAMES: "aws.dynamodb.table_names", AWS_DYNAMODB_CONSUMED_CAPACITY: "aws.dynamodb.consumed_capacity", AWS_DYNAMODB_ITEM_COLLECTION_METRICS: "aws.dynamodb.item_collection_metrics", AWS_DYNAMODB_PROVISIONED_READ_CAPACITY: "aws.dynamodb.provisioned_read_capacity", AWS_DYNAMODB_PROVISIONED_WRITE_CAPACITY: "aws.dynamodb.provisioned_write_capacity", AWS_DYNAMODB_CONSISTENT_READ: "aws.dynamodb.consistent_read", AWS_DYNAMODB_PROJECTION: "aws.dynamodb.projection", AWS_DYNAMODB_LIMIT: "aws.dynamodb.limit", AWS_DYNAMODB_ATTRIBUTES_TO_GET: "aws.dynamodb.attributes_to_get", AWS_DYNAMODB_INDEX_NAME: "aws.dynamodb.index_name", AWS_DYNAMODB_SELECT: "aws.dynamodb.select", AWS_DYNAMODB_GLOBAL_SECONDARY_INDEXES: "aws.dynamodb.global_secondary_indexes", AWS_DYNAMODB_LOCAL_SECONDARY_INDEXES: "aws.dynamodb.local_secondary_indexes", AWS_DYNAMODB_EXCLUSIVE_START_TABLE: "aws.dynamodb.exclusive_start_table", AWS_DYNAMODB_TABLE_COUNT: "aws.dynamodb.table_count", AWS_DYNAMODB_SCAN_FORWARD: "aws.dynamodb.scan_forward", AWS_DYNAMODB_SEGMENT: "aws.dynamodb.segment", AWS_DYNAMODB_TOTAL_SEGMENTS: "aws.dynamodb.total_segments", AWS_DYNAMODB_COUNT: "aws.dynamodb.count", AWS_DYNAMODB_SCANNED_COUNT: "aws.dynamodb.scanned_count", AWS_DYNAMODB_ATTRIBUTE_DEFINITIONS: "aws.dynamodb.attribute_definitions", AWS_DYNAMODB_GLOBAL_SECONDARY_INDEX_UPDATES: "aws.dynamodb.global_secondary_index_updates", MESSAGING_SYSTEM: "messaging.system", MESSAGING_DESTINATION: "messaging.destination", MESSAGING_DESTINATION_KIND: "messaging.destination_kind", MESSAGING_TEMP_DESTINATION: "messaging.temp_destination", MESSAGING_PROTOCOL: "messaging.protocol", MESSAGING_PROTOCOL_VERSION: "messaging.protocol_version", MESSAGING_URL: "messaging.url", MESSAGING_MESSAGE_ID: "messaging.message_id", MESSAGING_CONVERSATION_ID: "messaging.conversation_id", MESSAGING_MESSAGE_PAYLOAD_SIZE_BYTES: "messaging.message_payload_size_bytes", MESSAGING_MESSAGE_PAYLOAD_COMPRESSED_SIZE_BYTES: "messaging.message_payload_compressed_size_bytes", MESSAGING_OPERATION: "messaging.operation", MESSAGING_CONSUMER_ID: "messaging.consumer_id", MESSAGING_RABBITMQ_ROUTING_KEY: "messaging.rabbitmq.routing_key", MESSAGING_KAFKA_MESSAGE_KEY: "messaging.kafka.message_key", MESSAGING_KAFKA_CONSUMER_GROUP: "messaging.kafka.consumer_group", MESSAGING_KAFKA_CLIENT_ID: "messaging.kafka.client_id", MESSAGING_KAFKA_PARTITION: "messaging.kafka.partition", MESSAGING_KAFKA_TOMBSTONE: "messaging.kafka.tombstone", RPC_SYSTEM: "rpc.system", RPC_SERVICE: "rpc.service", RPC_METHOD: "rpc.method", RPC_GRPC_STATUS_CODE: "rpc.grpc.status_code", RPC_JSONRPC_VERSION: "rpc.jsonrpc.version", RPC_JSONRPC_REQUEST_ID: "rpc.jsonrpc.request_id", RPC_JSONRPC_ERROR_CODE: "rpc.jsonrpc.error_code", RPC_JSONRPC_ERROR_MESSAGE: "rpc.jsonrpc.error_message", MESSAGE_TYPE: "message.type", MESSAGE_ID: "message.id", MESSAGE_COMPRESSED_SIZE: "message.compressed_size", MESSAGE_UNCOMPRESSED_SIZE: "message.uncompressed_size" };
      b.DbSystemValues = { OTHER_SQL: "other_sql", MSSQL: "mssql", MYSQL: "mysql", ORACLE: "oracle", DB2: "db2", POSTGRESQL: "postgresql", REDSHIFT: "redshift", HIVE: "hive", CLOUDSCAPE: "cloudscape", HSQLDB: "hsqldb", PROGRESS: "progress", MAXDB: "maxdb", HANADB: "hanadb", INGRES: "ingres", FIRSTSQL: "firstsql", EDB: "edb", CACHE: "cache", ADABAS: "adabas", FIREBIRD: "firebird", DERBY: "derby", FILEMAKER: "filemaker", INFORMIX: "informix", INSTANTDB: "instantdb", INTERBASE: "interbase", MARIADB: "mariadb", NETEZZA: "netezza", PERVASIVE: "pervasive", POINTBASE: "pointbase", SQLITE: "sqlite", SYBASE: "sybase", TERADATA: "teradata", VERTICA: "vertica", H2: "h2", COLDFUSION: "coldfusion", CASSANDRA: "cassandra", HBASE: "hbase", MONGODB: "mongodb", REDIS: "redis", COUCHBASE: "couchbase", COUCHDB: "couchdb", COSMOSDB: "cosmosdb", DYNAMODB: "dynamodb", NEO4J: "neo4j", GEODE: "geode", ELASTICSEARCH: "elasticsearch", MEMCACHED: "memcached", COCKROACHDB: "cockroachdb" };
      b.DbCassandraConsistencyLevelValues = { ALL: "all", EACH_QUORUM: "each_quorum", QUORUM: "quorum", LOCAL_QUORUM: "local_quorum", ONE: "one", TWO: "two", THREE: "three", LOCAL_ONE: "local_one", ANY: "any", SERIAL: "serial", LOCAL_SERIAL: "local_serial" };
      b.FaasTriggerValues = { DATASOURCE: "datasource", HTTP: "http", PUBSUB: "pubsub", TIMER: "timer", OTHER: "other" };
      b.FaasDocumentOperationValues = { INSERT: "insert", EDIT: "edit", DELETE: "delete" };
      b.FaasInvokedProviderValues = { ALIBABA_CLOUD: "alibaba_cloud", AWS: "aws", AZURE: "azure", GCP: "gcp" };
      b.NetTransportValues = { IP_TCP: "ip_tcp", IP_UDP: "ip_udp", IP: "ip", UNIX: "unix", PIPE: "pipe", INPROC: "inproc", OTHER: "other" };
      b.NetHostConnectionTypeValues = { WIFI: "wifi", WIRED: "wired", CELL: "cell", UNAVAILABLE: "unavailable", UNKNOWN: "unknown" };
      b.NetHostConnectionSubtypeValues = { GPRS: "gprs", EDGE: "edge", UMTS: "umts", CDMA: "cdma", EVDO_0: "evdo_0", EVDO_A: "evdo_a", CDMA2000_1XRTT: "cdma2000_1xrtt", HSDPA: "hsdpa", HSUPA: "hsupa", HSPA: "hspa", IDEN: "iden", EVDO_B: "evdo_b", LTE: "lte", EHRPD: "ehrpd", HSPAP: "hspap", GSM: "gsm", TD_SCDMA: "td_scdma", IWLAN: "iwlan", NR: "nr", NRNSA: "nrnsa", LTE_CA: "lte_ca" };
      b.HttpFlavorValues = { HTTP_1_0: "1.0", HTTP_1_1: "1.1", HTTP_2_0: "2.0", SPDY: "SPDY", QUIC: "QUIC" };
      b.MessagingDestinationKindValues = { QUEUE: "queue", TOPIC: "topic" };
      b.MessagingOperationValues = { RECEIVE: "receive", PROCESS: "process" };
      b.RpcGrpcStatusCodeValues = { OK: 0, CANCELLED: 1, UNKNOWN: 2, INVALID_ARGUMENT: 3, DEADLINE_EXCEEDED: 4, NOT_FOUND: 5, ALREADY_EXISTS: 6, PERMISSION_DENIED: 7, RESOURCE_EXHAUSTED: 8, FAILED_PRECONDITION: 9, ABORTED: 10, OUT_OF_RANGE: 11, UNIMPLEMENTED: 12, INTERNAL: 13, UNAVAILABLE: 14, DATA_LOSS: 15, UNAUTHENTICATED: 16 };
      b.MessageTypeValues = { SENT: "SENT", RECEIVED: "RECEIVED" };
    });
    Cc = l((ke) => {
      "use strict";
      var iE = ke && ke.__createBinding || (Object.create ? function (r, e, t, n) {
        n === void 0 && (n = t), Object.defineProperty(r, n, {
          enumerable: true, get: function () {
            return e[t];
          }
        });
      } : function (r, e, t, n) {
        n === void 0 && (n = t), r[n] = e[t];
      }), sE = ke && ke.__exportStar || function (r, e) {
        for (var t in r)
          t !== "default" && !Object.prototype.hasOwnProperty.call(e, t) && iE(e, r, t);
      };
      Object.defineProperty(ke, "__esModule", { value: true });
      sE(Nc(), ke);
    });
    wc = l((k) => {
      "use strict";
      Object.defineProperty(k, "__esModule", { value: true });
      k.TelemetrySdkLanguageValues = k.OsTypeValues = k.HostArchValues = k.AwsEcsLaunchtypeValues = k.CloudPlatformValues = k.CloudProviderValues = k.SemanticResourceAttributes = void 0;
      k.SemanticResourceAttributes = { CLOUD_PROVIDER: "cloud.provider", CLOUD_ACCOUNT_ID: "cloud.account.id", CLOUD_REGION: "cloud.region", CLOUD_AVAILABILITY_ZONE: "cloud.availability_zone", CLOUD_PLATFORM: "cloud.platform", AWS_ECS_CONTAINER_ARN: "aws.ecs.container.arn", AWS_ECS_CLUSTER_ARN: "aws.ecs.cluster.arn", AWS_ECS_LAUNCHTYPE: "aws.ecs.launchtype", AWS_ECS_TASK_ARN: "aws.ecs.task.arn", AWS_ECS_TASK_FAMILY: "aws.ecs.task.family", AWS_ECS_TASK_REVISION: "aws.ecs.task.revision", AWS_EKS_CLUSTER_ARN: "aws.eks.cluster.arn", AWS_LOG_GROUP_NAMES: "aws.log.group.names", AWS_LOG_GROUP_ARNS: "aws.log.group.arns", AWS_LOG_STREAM_NAMES: "aws.log.stream.names", AWS_LOG_STREAM_ARNS: "aws.log.stream.arns", CONTAINER_NAME: "container.name", CONTAINER_ID: "container.id", CONTAINER_RUNTIME: "container.runtime", CONTAINER_IMAGE_NAME: "container.image.name", CONTAINER_IMAGE_TAG: "container.image.tag", DEPLOYMENT_ENVIRONMENT: "deployment.environment", DEVICE_ID: "device.id", DEVICE_MODEL_IDENTIFIER: "device.model.identifier", DEVICE_MODEL_NAME: "device.model.name", FAAS_NAME: "faas.name", FAAS_ID: "faas.id", FAAS_VERSION: "faas.version", FAAS_INSTANCE: "faas.instance", FAAS_MAX_MEMORY: "faas.max_memory", HOST_ID: "host.id", HOST_NAME: "host.name", HOST_TYPE: "host.type", HOST_ARCH: "host.arch", HOST_IMAGE_NAME: "host.image.name", HOST_IMAGE_ID: "host.image.id", HOST_IMAGE_VERSION: "host.image.version", K8S_CLUSTER_NAME: "k8s.cluster.name", K8S_NODE_NAME: "k8s.node.name", K8S_NODE_UID: "k8s.node.uid", K8S_NAMESPACE_NAME: "k8s.namespace.name", K8S_POD_UID: "k8s.pod.uid", K8S_POD_NAME: "k8s.pod.name", K8S_CONTAINER_NAME: "k8s.container.name", K8S_REPLICASET_UID: "k8s.replicaset.uid", K8S_REPLICASET_NAME: "k8s.replicaset.name", K8S_DEPLOYMENT_UID: "k8s.deployment.uid", K8S_DEPLOYMENT_NAME: "k8s.deployment.name", K8S_STATEFULSET_UID: "k8s.statefulset.uid", K8S_STATEFULSET_NAME: "k8s.statefulset.name", K8S_DAEMONSET_UID: "k8s.daemonset.uid", K8S_DAEMONSET_NAME: "k8s.daemonset.name", K8S_JOB_UID: "k8s.job.uid", K8S_JOB_NAME: "k8s.job.name", K8S_CRONJOB_UID: "k8s.cronjob.uid", K8S_CRONJOB_NAME: "k8s.cronjob.name", OS_TYPE: "os.type", OS_DESCRIPTION: "os.description", OS_NAME: "os.name", OS_VERSION: "os.version", PROCESS_PID: "process.pid", PROCESS_EXECUTABLE_NAME: "process.executable.name", PROCESS_EXECUTABLE_PATH: "process.executable.path", PROCESS_COMMAND: "process.command", PROCESS_COMMAND_LINE: "process.command_line", PROCESS_COMMAND_ARGS: "process.command_args", PROCESS_OWNER: "process.owner", PROCESS_RUNTIME_NAME: "process.runtime.name", PROCESS_RUNTIME_VERSION: "process.runtime.version", PROCESS_RUNTIME_DESCRIPTION: "process.runtime.description", SERVICE_NAME: "service.name", SERVICE_NAMESPACE: "service.namespace", SERVICE_INSTANCE_ID: "service.instance.id", SERVICE_VERSION: "service.version", TELEMETRY_SDK_NAME: "telemetry.sdk.name", TELEMETRY_SDK_LANGUAGE: "telemetry.sdk.language", TELEMETRY_SDK_VERSION: "telemetry.sdk.version", TELEMETRY_AUTO_VERSION: "telemetry.auto.version", WEBENGINE_NAME: "webengine.name", WEBENGINE_VERSION: "webengine.version", WEBENGINE_DESCRIPTION: "webengine.description" };
      k.CloudProviderValues = { ALIBABA_CLOUD: "alibaba_cloud", AWS: "aws", AZURE: "azure", GCP: "gcp" };
      k.CloudPlatformValues = { ALIBABA_CLOUD_ECS: "alibaba_cloud_ecs", ALIBABA_CLOUD_FC: "alibaba_cloud_fc", AWS_EC2: "aws_ec2", AWS_ECS: "aws_ecs", AWS_EKS: "aws_eks", AWS_LAMBDA: "aws_lambda", AWS_ELASTIC_BEANSTALK: "aws_elastic_beanstalk", AZURE_VM: "azure_vm", AZURE_CONTAINER_INSTANCES: "azure_container_instances", AZURE_AKS: "azure_aks", AZURE_FUNCTIONS: "azure_functions", AZURE_APP_SERVICE: "azure_app_service", GCP_COMPUTE_ENGINE: "gcp_compute_engine", GCP_CLOUD_RUN: "gcp_cloud_run", GCP_KUBERNETES_ENGINE: "gcp_kubernetes_engine", GCP_CLOUD_FUNCTIONS: "gcp_cloud_functions", GCP_APP_ENGINE: "gcp_app_engine" };
      k.AwsEcsLaunchtypeValues = { EC2: "ec2", FARGATE: "fargate" };
      k.HostArchValues = { AMD64: "amd64", ARM32: "arm32", ARM64: "arm64", IA64: "ia64", PPC32: "ppc32", PPC64: "ppc64", X86: "x86" };
      k.OsTypeValues = { WINDOWS: "windows", LINUX: "linux", DARWIN: "darwin", FREEBSD: "freebsd", NETBSD: "netbsd", OPENBSD: "openbsd", DRAGONFLYBSD: "dragonflybsd", HPUX: "hpux", AIX: "aix", SOLARIS: "solaris", Z_OS: "z_os" };
      k.TelemetrySdkLanguageValues = { CPP: "cpp", DOTNET: "dotnet", ERLANG: "erlang", GO: "go", JAVA: "java", NODEJS: "nodejs", PHP: "php", PYTHON: "python", RUBY: "ruby", WEBJS: "webjs" };
    });
    xc = l(($e) => {
      "use strict";
      var oE = $e && $e.__createBinding || (Object.create ? function (r, e, t, n) {
        n === void 0 && (n = t), Object.defineProperty(r, n, {
          enumerable: true, get: function () {
            return e[t];
          }
        });
      } : function (r, e, t, n) {
        n === void 0 && (n = t), r[n] = e[t];
      }), aE = $e && $e.__exportStar || function (r, e) {
        for (var t in r)
          t !== "default" && !Object.prototype.hasOwnProperty.call(e, t) && oE(e, r, t);
      };
      Object.defineProperty($e, "__esModule", { value: true });
      aE(wc(), $e);
    });
    Ae = l((Le) => {
      "use strict";
      var uE = Le && Le.__createBinding || (Object.create ? function (r, e, t, n) {
        n === void 0 && (n = t), Object.defineProperty(r, n, {
          enumerable: true, get: function () {
            return e[t];
          }
        });
      } : function (r, e, t, n) {
        n === void 0 && (n = t), r[n] = e[t];
      }), Dc = Le && Le.__exportStar || function (r, e) {
        for (var t in r)
          t !== "default" && !Object.prototype.hasOwnProperty.call(e, t) && uE(e, r, t);
      };
      Object.defineProperty(Le, "__esModule", { value: true });
      Dc(Cc(), Le);
      Dc(xc(), Le);
    });
    Uc = l((sn) => {
      "use strict";
      Object.defineProperty(sn, "__esModule", { value: true });
      sn.SDK_INFO = void 0;
      var cE = to(), pr = Ae();
      sn.SDK_INFO = { [pr.SemanticResourceAttributes.TELEMETRY_SDK_NAME]: "opentelemetry", [pr.SemanticResourceAttributes.PROCESS_RUNTIME_NAME]: "node", [pr.SemanticResourceAttributes.TELEMETRY_SDK_LANGUAGE]: pr.TelemetrySdkLanguageValues.NODEJS, [pr.SemanticResourceAttributes.TELEMETRY_SDK_VERSION]: cE.VERSION };
    });
    Bc = l((on) => {
      "use strict";
      Object.defineProperty(on, "__esModule", { value: true });
      on.unrefTimer = void 0;
      function lE(r) {
        r.unref();
      }
      on.unrefTimer = lE;
    });
    qc = l((ee) => {
      "use strict";
      var dE = ee && ee.__createBinding || (Object.create ? function (r, e, t, n) {
        n === void 0 && (n = t), Object.defineProperty(r, n, {
          enumerable: true, get: function () {
            return e[t];
          }
        });
      } : function (r, e, t, n) {
        n === void 0 && (n = t), r[n] = e[t];
      }), Xe = ee && ee.__exportStar || function (r, e) {
        for (var t in r)
          t !== "default" && !Object.prototype.hasOwnProperty.call(e, t) && dE(e, r, t);
      };
      Object.defineProperty(ee, "__esModule", { value: true });
      Xe(Rc(), ee);
      Xe(bc(), ee);
      Xe(yc(), ee);
      Xe(Lc(), ee);
      Xe(Mc(), ee);
      Xe(Uc(), ee);
      Xe(Bc(), ee);
    });
    ro = l((We) => {
      "use strict";
      var _E = We && We.__createBinding || (Object.create ? function (r, e, t, n) {
        n === void 0 && (n = t), Object.defineProperty(r, n, {
          enumerable: true, get: function () {
            return e[t];
          }
        });
      } : function (r, e, t, n) {
        n === void 0 && (n = t), r[n] = e[t];
      }), pE = We && We.__exportStar || function (r, e) {
        for (var t in r)
          t !== "default" && !Object.prototype.hasOwnProperty.call(e, t) && _E(e, r, t);
      };
      Object.defineProperty(We, "__esModule", { value: true });
      pE(qc(), We);
    });
    jc = l((y) => {
      "use strict";
      Object.defineProperty(y, "__esModule", { value: true });
      y.addHrTimes = y.isTimeInput = y.isTimeInputHrTime = y.hrTimeToMicroseconds = y.hrTimeToMilliseconds = y.hrTimeToNanoseconds = y.hrTimeToTimeStamp = y.hrTimeDuration = y.timeInputToHrTime = y.hrTime = y.getTimeOrigin = y.millisToHrTime = void 0;
      var no = ro(), Gc = 9, hE = 6, fE = Math.pow(10, hE), an = Math.pow(10, Gc);
      function hr(r) {
        let e = r / 1e3, t = Math.trunc(e), n = Math.round(r % 1e3 * fE);
        return [t, n];
      }
      y.millisToHrTime = hr;
      function io() {
        let r = no.otperformance.timeOrigin;
        if (typeof r != "number") {
          let e = no.otperformance;
          r = e.timing && e.timing.fetchStart;
        }
        return r;
      }
      y.getTimeOrigin = io;
      function Vc(r) {
        let e = hr(io()), t = hr(typeof r == "number" ? r : no.otperformance.now());
        return Hc(e, t);
      }
      y.hrTime = Vc;
      function EE(r) {
        if (so(r))
          return r;
        if (typeof r == "number")
          return r < io() ? Vc(r) : hr(r);
        if (r instanceof Date)
          return hr(r.getTime());
        throw TypeError("Invalid input type");
      }
      y.timeInputToHrTime = EE;
      function mE(r, e) {
        let t = e[0] - r[0], n = e[1] - r[1];
        return n < 0 && (t -= 1, n += an), [t, n];
      }
      y.hrTimeDuration = mE;
      function gE(r) {
        let e = Gc, t = `${"0".repeat(e)}${r[1]}Z`, n = t.substr(t.length - e - 1);
        return new Date(r[0] * 1e3).toISOString().replace("000Z", n);
      }
      y.hrTimeToTimeStamp = gE;
      function TE(r) {
        return r[0] * an + r[1];
      }
      y.hrTimeToNanoseconds = TE;
      function SE(r) {
        return r[0] * 1e3 + r[1] / 1e6;
      }
      y.hrTimeToMilliseconds = SE;
      function AE(r) {
        return r[0] * 1e6 + r[1] / 1e3;
      }
      y.hrTimeToMicroseconds = AE;
      function so(r) {
        return Array.isArray(r) && r.length === 2 && typeof r[0] == "number" && typeof r[1] == "number";
      }
      y.isTimeInputHrTime = so;
      function OE(r) {
        return so(r) || typeof r == "number" || r instanceof Date;
      }
      y.isTimeInput = OE;
      function Hc(r, e) {
        let t = [r[0] + e[0], r[1] + e[1]];
        return t[1] >= an && (t[1] -= an, t[0] += 1), t;
      }
      y.addHrTimes = Hc;
    });
    kc = l((Fc) => {
      "use strict";
      Object.defineProperty(Fc, "__esModule", { value: true });
    });
    $c = l((fr) => {
      "use strict";
      Object.defineProperty(fr, "__esModule", { value: true });
      fr.ExportResultCode = void 0;
      var RE;
      (function (r) {
        r[r.SUCCESS = 0] = "SUCCESS", r[r.FAILED = 1] = "FAILED";
      })(RE = fr.ExportResultCode || (fr.ExportResultCode = {}));
    });
    Wc = l((un) => {
      "use strict";
      Object.defineProperty(un, "__esModule", { value: true });
      un.CompositePropagator = void 0;
      var Xc = (h(), m(d)), oo = class {
        constructor(e = {}) {
          var t;
          this._propagators = (t = e.propagators) !== null && t !== void 0 ? t : [], this._fields = Array.from(new Set(this._propagators.map((n) => typeof n.fields == "function" ? n.fields() : []).reduce((n, i) => n.concat(i), [])));
        }
        inject(e, t, n) {
          for (let i of this._propagators)
            try {
              i.inject(e, t, n);
            } catch (s) {
              Xc.diag.warn(`Failed to inject with ${i.constructor.name}. Err: ${s.message}`);
            }
        }
        extract(e, t, n) {
          return this._propagators.reduce((i, s) => {
            try {
              return s.extract(i, t, n);
            } catch (o) {
              Xc.diag.warn(`Failed to inject with ${s.constructor.name}. Err: ${o.message}`);
            }
            return i;
          }, e);
        }
        fields() {
          return this._fields.slice();
        }
      };
      un.CompositePropagator = oo;
    });
    Kc = l((Et) => {
      "use strict";
      Object.defineProperty(Et, "__esModule", { value: true });
      Et.validateValue = Et.validateKey = void 0;
      var ao = "[_0-9a-z-*/]", bE = `[a-z]${ao}{0,255}`, PE = `[a-z0-9]${ao}{0,240}@[a-z]${ao}{0,13}`, yE = new RegExp(`^(?:${bE}|${PE})$`), vE = /^[ -~]{0,255}[!-~]$/, IE = /,|=/;
      function LE(r) {
        return yE.test(r);
      }
      Et.validateKey = LE;
      function ME(r) {
        return vE.test(r) && !IE.test(r);
      }
      Et.validateValue = ME;
    });
    co = l((cn) => {
      "use strict";
      Object.defineProperty(cn, "__esModule", { value: true });
      cn.TraceState = void 0;
      var zc = Kc(), Yc = 32, NE = 512, Qc = ",", Zc = "=", uo = class r {
        constructor(e) {
          this._internalState = /* @__PURE__ */ new Map(), e && this._parse(e);
        }
        set(e, t) {
          let n = this._clone();
          return n._internalState.has(e) && n._internalState.delete(e), n._internalState.set(e, t), n;
        }
        unset(e) {
          let t = this._clone();
          return t._internalState.delete(e), t;
        }
        get(e) {
          return this._internalState.get(e);
        }
        serialize() {
          return this._keys().reduce((e, t) => (e.push(t + Zc + this.get(t)), e), []).join(Qc);
        }
        _parse(e) {
          e.length > NE || (this._internalState = e.split(Qc).reverse().reduce((t, n) => {
            let i = n.trim(), s = i.indexOf(Zc);
            if (s !== -1) {
              let o = i.slice(0, s), a = i.slice(s + 1, n.length);
              (0, zc.validateKey)(o) && (0, zc.validateValue)(a) && t.set(o, a);
            }
            return t;
          }, /* @__PURE__ */ new Map()), this._internalState.size > Yc && (this._internalState = new Map(Array.from(this._internalState.entries()).reverse().slice(0, Yc))));
        }
        _keys() {
          return Array.from(this._internalState.keys()).reverse();
        }
        _clone() {
          let e = new r();
          return e._internalState = new Map(this._internalState), e;
        }
      };
      cn.TraceState = uo;
    });
    el = l(($) => {
      "use strict";
      Object.defineProperty($, "__esModule", { value: true });
      $.W3CTraceContextPropagator = $.parseTraceParent = $.TRACE_STATE_HEADER = $.TRACE_PARENT_HEADER = void 0;
      var ln = (h(), m(d)), CE = dr(), wE = co();
      $.TRACE_PARENT_HEADER = "traceparent";
      $.TRACE_STATE_HEADER = "tracestate";
      var xE = "00", DE = "(?!ff)[\\da-f]{2}", UE = "(?![0]{32})[\\da-f]{32}", BE = "(?![0]{16})[\\da-f]{16}", qE = "[\\da-f]{2}", GE = new RegExp(`^\\s?(${DE})-(${UE})-(${BE})-(${qE})(-.*)?\\s?$`);
      function Jc(r) {
        let e = GE.exec(r);
        return !e || e[1] === "00" && e[5] ? null : { traceId: e[2], spanId: e[3], traceFlags: parseInt(e[4], 16) };
      }
      $.parseTraceParent = Jc;
      var lo = class {
        inject(e, t, n) {
          let i = ln.trace.getSpanContext(e);
          if (!i || (0, CE.isTracingSuppressed)(e) || !(0, ln.isSpanContextValid)(i))
            return;
          let s = `${xE}-${i.traceId}-${i.spanId}-0${Number(i.traceFlags || ln.TraceFlags.NONE).toString(16)}`;
          n.set(t, $.TRACE_PARENT_HEADER, s), i.traceState && n.set(t, $.TRACE_STATE_HEADER, i.traceState.serialize());
        }
        extract(e, t, n) {
          let i = n.get(t, $.TRACE_PARENT_HEADER);
          if (!i)
            return e;
          let s = Array.isArray(i) ? i[0] : i;
          if (typeof s != "string")
            return e;
          let o = Jc(s);
          if (!o)
            return e;
          o.isRemote = true;
          let a = n.get(t, $.TRACE_STATE_HEADER);
          if (a) {
            let u = Array.isArray(a) ? a.join(",") : a;
            o.traceState = new wE.TraceState(typeof u == "string" ? u : void 0);
          }
          return ln.trace.setSpanContext(e, o);
        }
        fields() {
          return [$.TRACE_PARENT_HEADER, $.TRACE_STATE_HEADER];
        }
      };
      $.W3CTraceContextPropagator = lo;
    });
    rl = l((tl) => {
      "use strict";
      Object.defineProperty(tl, "__esModule", { value: true });
    });
    nl = l((ae) => {
      "use strict";
      Object.defineProperty(ae, "__esModule", { value: true });
      ae.getRPCMetadata = ae.deleteRPCMetadata = ae.setRPCMetadata = ae.RPCType = void 0;
      var VE = (h(), m(d)), _o = (0, VE.createContextKey)("OpenTelemetry SDK Context Key RPC_METADATA"), HE;
      (function (r) {
        r.HTTP = "http";
      })(HE = ae.RPCType || (ae.RPCType = {}));
      function jE(r, e) {
        return r.setValue(_o, e);
      }
      ae.setRPCMetadata = jE;
      function FE(r) {
        return r.deleteValue(_o);
      }
      ae.deleteRPCMetadata = FE;
      function kE(r) {
        return r.getValue(_o);
      }
      ae.getRPCMetadata = kE;
    });
    ho = l((dn) => {
      "use strict";
      Object.defineProperty(dn, "__esModule", { value: true });
      dn.AlwaysOffSampler = void 0;
      var $E = (h(), m(d)), po = class {
        shouldSample() {
          return { decision: $E.SamplingDecision.NOT_RECORD };
        }
        toString() {
          return "AlwaysOffSampler";
        }
      };
      dn.AlwaysOffSampler = po;
    });
    Eo = l((_n) => {
      "use strict";
      Object.defineProperty(_n, "__esModule", { value: true });
      _n.AlwaysOnSampler = void 0;
      var XE = (h(), m(d)), fo = class {
        shouldSample() {
          return { decision: XE.SamplingDecision.RECORD_AND_SAMPLED };
        }
        toString() {
          return "AlwaysOnSampler";
        }
      };
      _n.AlwaysOnSampler = fo;
    });
    sl = l((hn) => {
      "use strict";
      Object.defineProperty(hn, "__esModule", { value: true });
      hn.ParentBasedSampler = void 0;
      var pn = (h(), m(d)), WE = Qs(), il = ho(), mo = Eo(), go = class {
        constructor(e) {
          var t, n, i, s;
          this._root = e.root, this._root || ((0, WE.globalErrorHandler)(new Error("ParentBasedSampler must have a root sampler configured")), this._root = new mo.AlwaysOnSampler()), this._remoteParentSampled = (t = e.remoteParentSampled) !== null && t !== void 0 ? t : new mo.AlwaysOnSampler(), this._remoteParentNotSampled = (n = e.remoteParentNotSampled) !== null && n !== void 0 ? n : new il.AlwaysOffSampler(), this._localParentSampled = (i = e.localParentSampled) !== null && i !== void 0 ? i : new mo.AlwaysOnSampler(), this._localParentNotSampled = (s = e.localParentNotSampled) !== null && s !== void 0 ? s : new il.AlwaysOffSampler();
        }
        shouldSample(e, t, n, i, s, o) {
          let a = pn.trace.getSpanContext(e);
          return !a || !(0, pn.isSpanContextValid)(a) ? this._root.shouldSample(e, t, n, i, s, o) : a.isRemote ? a.traceFlags & pn.TraceFlags.SAMPLED ? this._remoteParentSampled.shouldSample(e, t, n, i, s, o) : this._remoteParentNotSampled.shouldSample(e, t, n, i, s, o) : a.traceFlags & pn.TraceFlags.SAMPLED ? this._localParentSampled.shouldSample(e, t, n, i, s, o) : this._localParentNotSampled.shouldSample(e, t, n, i, s, o);
        }
        toString() {
          return `ParentBased{root=${this._root.toString()}, remoteParentSampled=${this._remoteParentSampled.toString()}, remoteParentNotSampled=${this._remoteParentNotSampled.toString()}, localParentSampled=${this._localParentSampled.toString()}, localParentNotSampled=${this._localParentNotSampled.toString()}}`;
        }
      };
      hn.ParentBasedSampler = go;
    });
    ol = l((fn) => {
      "use strict";
      Object.defineProperty(fn, "__esModule", { value: true });
      fn.TraceIdRatioBasedSampler = void 0;
      var To = (h(), m(d)), So = class {
        constructor(e = 0) {
          this._ratio = e, this._ratio = this._normalize(e), this._upperBound = Math.floor(this._ratio * 4294967295);
        }
        shouldSample(e, t) {
          return { decision: (0, To.isValidTraceId)(t) && this._accumulate(t) < this._upperBound ? To.SamplingDecision.RECORD_AND_SAMPLED : To.SamplingDecision.NOT_RECORD };
        }
        toString() {
          return `TraceIdRatioBased{${this._ratio}}`;
        }
        _normalize(e) {
          return typeof e != "number" || isNaN(e) ? 0 : e >= 1 ? 1 : e <= 0 ? 0 : e;
        }
        _accumulate(e) {
          let t = 0;
          for (let n = 0; n < e.length / 8; n++) {
            let i = n * 8, s = parseInt(e.slice(i, i + 8), 16);
            t = (t ^ s) >>> 0;
          }
          return t;
        }
      };
      fn.TraceIdRatioBasedSampler = So;
    });
    dl = l((En) => {
      "use strict";
      Object.defineProperty(En, "__esModule", { value: true });
      En.isPlainObject = void 0;
      var KE = "[object Object]", zE = "[object Null]", YE = "[object Undefined]", QE = Function.prototype, al = QE.toString, ZE = al.call(Object), JE = em(Object.getPrototypeOf, Object), ul = Object.prototype, cl = ul.hasOwnProperty, Ke = Symbol ? Symbol.toStringTag : void 0, ll = ul.toString;
      function em(r, e) {
        return function (t) {
          return r(e(t));
        };
      }
      function tm(r) {
        if (!rm(r) || nm(r) !== KE)
          return false;
        let e = JE(r);
        if (e === null)
          return true;
        let t = cl.call(e, "constructor") && e.constructor;
        return typeof t == "function" && t instanceof t && al.call(t) === ZE;
      }
      En.isPlainObject = tm;
      function rm(r) {
        return r != null && typeof r == "object";
      }
      function nm(r) {
        return r == null ? r === void 0 ? YE : zE : Ke && Ke in Object(r) ? im(r) : sm(r);
      }
      function im(r) {
        let e = cl.call(r, Ke), t = r[Ke], n = false;
        try {
          r[Ke] = void 0, n = true;
        } catch {
        }
        let i = ll.call(r);
        return n && (e ? r[Ke] = t : delete r[Ke]), i;
      }
      function sm(r) {
        return ll.call(r);
      }
    });
    El = l((Tn) => {
      "use strict";
      Object.defineProperty(Tn, "__esModule", { value: true });
      Tn.merge = void 0;
      var _l = dl(), om = 20;
      function am(...r) {
        let e = r.shift(), t = /* @__PURE__ */ new WeakMap();
        for (; r.length > 0;)
          e = hl(e, r.shift(), 0, t);
        return e;
      }
      Tn.merge = am;
      function Ao(r) {
        return gn(r) ? r.slice() : r;
      }
      function hl(r, e, t = 0, n) {
        let i;
        if (!(t > om)) {
          if (t++, mn(r) || mn(e) || fl(e))
            i = Ao(e);
          else if (gn(r)) {
            if (i = r.slice(), gn(e))
              for (let s = 0, o = e.length; s < o; s++)
                i.push(Ao(e[s]));
            else if (Er(e)) {
              let s = Object.keys(e);
              for (let o = 0, a = s.length; o < a; o++) {
                let u = s[o];
                i[u] = Ao(e[u]);
              }
            }
          } else if (Er(r))
            if (Er(e)) {
              if (!um(r, e))
                return e;
              i = Object.assign({}, r);
              let s = Object.keys(e);
              for (let o = 0, a = s.length; o < a; o++) {
                let u = s[o], c = e[u];
                if (mn(c))
                  typeof c > "u" ? delete i[u] : i[u] = c;
                else {
                  let _ = i[u], p = c;
                  if (pl(r, u, n) || pl(e, u, n))
                    delete i[u];
                  else {
                    if (Er(_) && Er(p)) {
                      let f = n.get(_) || [], L = n.get(p) || [];
                      f.push({ obj: r, key: u }), L.push({ obj: e, key: u }), n.set(_, f), n.set(p, L);
                    }
                    i[u] = hl(i[u], c, t, n);
                  }
                }
              }
            } else
              i = e;
          return i;
        }
      }
      function pl(r, e, t) {
        let n = t.get(r[e]) || [];
        for (let i = 0, s = n.length; i < s; i++) {
          let o = n[i];
          if (o.key === e && o.obj === r)
            return true;
        }
        return false;
      }
      function gn(r) {
        return Array.isArray(r);
      }
      function fl(r) {
        return typeof r == "function";
      }
      function Er(r) {
        return !mn(r) && !gn(r) && !fl(r) && typeof r == "object";
      }
      function mn(r) {
        return typeof r == "string" || typeof r == "number" || typeof r == "boolean" || typeof r > "u" || r instanceof Date || r instanceof RegExp || r === null;
      }
      function um(r, e) {
        return !(!(0, _l.isPlainObject)(r) || !(0, _l.isPlainObject)(e));
      }
    });
    ml = l((mt) => {
      "use strict";
      Object.defineProperty(mt, "__esModule", { value: true });
      mt.callWithTimeout = mt.TimeoutError = void 0;
      var Sn = class r extends Error {
        constructor(e) {
          super(e), Object.setPrototypeOf(this, r.prototype);
        }
      };
      mt.TimeoutError = Sn;
      function cm(r, e) {
        let t, n = new Promise(function (s, o) {
          t = setTimeout(function () {
            o(new Sn("Operation timed out."));
          }, e);
        });
        return Promise.race([r, n]).then((i) => (clearTimeout(t), i), (i) => {
          throw clearTimeout(t), i;
        });
      }
      mt.callWithTimeout = cm;
    });
    Tl = l((gt) => {
      "use strict";
      Object.defineProperty(gt, "__esModule", { value: true });
      gt.isUrlIgnored = gt.urlMatches = void 0;
      function gl(r, e) {
        return typeof e == "string" ? r === e : !!r.match(e);
      }
      gt.urlMatches = gl;
      function lm(r, e) {
        if (!e)
          return false;
        for (let t of e)
          if (gl(r, t))
            return true;
        return false;
      }
      gt.isUrlIgnored = lm;
    });
    Sl = l((An) => {
      "use strict";
      Object.defineProperty(An, "__esModule", { value: true });
      An.isWrapped = void 0;
      function dm(r) {
        return typeof r == "function" && typeof r.__original == "function" && typeof r.__unwrap == "function" && r.__wrapped === true;
      }
      An.isWrapped = dm;
    });
    Al = l((On) => {
      "use strict";
      Object.defineProperty(On, "__esModule", { value: true });
      On.Deferred = void 0;
      var Oo = class {
        constructor() {
          this._promise = new Promise((e, t) => {
            this._resolve = e, this._reject = t;
          });
        }
        get promise() {
          return this._promise;
        }
        resolve(e) {
          this._resolve(e);
        }
        reject(e) {
          this._reject(e);
        }
      };
      On.Deferred = Oo;
    });
    Ol = l((Rn) => {
      "use strict";
      Object.defineProperty(Rn, "__esModule", { value: true });
      Rn.BindOnceFuture = void 0;
      var _m = Al(), Ro = class {
        constructor(e, t) {
          this._callback = e, this._that = t, this._isCalled = false, this._deferred = new _m.Deferred();
        }
        get isCalled() {
          return this._isCalled;
        }
        get promise() {
          return this._deferred.promise;
        }
        call(...e) {
          if (!this._isCalled) {
            this._isCalled = true;
            try {
              Promise.resolve(this._callback.call(this._that, ...e)).then((t) => this._deferred.resolve(t), (t) => this._deferred.reject(t));
            } catch (t) {
              this._deferred.reject(t);
            }
          }
          return this._deferred.promise;
        }
      };
      Rn.BindOnceFuture = Ro;
    });
    bl = l((bn) => {
      "use strict";
      Object.defineProperty(bn, "__esModule", { value: true });
      bn._export = void 0;
      var Rl = (h(), m(d)), pm = dr();
      function hm(r, e) {
        return new Promise((t) => {
          Rl.context.with((0, pm.suppressTracing)(Rl.context.active()), () => {
            r.export(e, (n) => {
              t(n);
            });
          });
        });
      }
      bn._export = hm;
    });
    A = l((T) => {
      "use strict";
      var fm = T && T.__createBinding || (Object.create ? function (r, e, t, n) {
        n === void 0 && (n = t), Object.defineProperty(r, n, {
          enumerable: true, get: function () {
            return e[t];
          }
        });
      } : function (r, e, t, n) {
        n === void 0 && (n = t), r[n] = e[t];
      }), P = T && T.__exportStar || function (r, e) {
        for (var t in r)
          t !== "default" && !Object.prototype.hasOwnProperty.call(e, t) && fm(e, r, t);
      };
      Object.defineProperty(T, "__esModule", { value: true });
      T.internal = T.baggageUtils = void 0;
      P(pc(), T);
      P(hc(), T);
      P(Tc(), T);
      P(Qs(), T);
      P(Ys(), T);
      P(jc(), T);
      P(kc(), T);
      P($c(), T);
      T.baggageUtils = $s();
      P(ro(), T);
      P(Wc(), T);
      P(el(), T);
      P(rl(), T);
      P(nl(), T);
      P(ho(), T);
      P(Eo(), T);
      P(sl(), T);
      P(ol(), T);
      P(dr(), T);
      P(co(), T);
      P(Yr(), T);
      P(El(), T);
      P(Zs(), T);
      P(ml(), T);
      P(Tl(), T);
      P(Sl(), T);
      P(Ol(), T);
      P(to(), T);
      var Em = bl();
      T.internal = { _export: Em._export };
    });
    Pl = l((Pn) => {
      "use strict";
      Object.defineProperty(Pn, "__esModule", { value: true });
      Pn.ExceptionEventName = void 0;
      Pn.ExceptionEventName = "exception";
    });
    Po = l((yn) => {
      "use strict";
      Object.defineProperty(yn, "__esModule", { value: true });
      yn.Span = void 0;
      var pe = (h(), m(d)), X = A(), ze = Ae(), mm = Pl(), bo = class {
        constructor(e, t, n, i, s, o, a = [], u, c, _) {
          this.attributes = {}, this.links = [], this.events = [], this._droppedAttributesCount = 0, this._droppedEventsCount = 0, this._droppedLinksCount = 0, this.status = { code: pe.SpanStatusCode.UNSET }, this.endTime = [0, 0], this._ended = false, this._duration = [-1, -1], this.name = n, this._spanContext = i, this.parentSpanId = o, this.kind = s, this.links = a;
          let p = Date.now();
          this._performanceStartTime = X.otperformance.now(), this._performanceOffset = p - (this._performanceStartTime + (0, X.getTimeOrigin)()), this._startTimeProvided = u != null, this.startTime = this._getTime(u ?? p), this.resource = e.resource, this.instrumentationLibrary = e.instrumentationLibrary, this._spanLimits = e.getSpanLimits(), _ != null && this.setAttributes(_), this._spanProcessor = e.getActiveSpanProcessor(), this._spanProcessor.onStart(this, t), this._attributeValueLengthLimit = this._spanLimits.attributeValueLengthLimit || 0;
        }
        spanContext() {
          return this._spanContext;
        }
        setAttribute(e, t) {
          return t == null || this._isSpanEnded() ? this : e.length === 0 ? (pe.diag.warn(`Invalid attribute key: ${e}`), this) : (0, X.isAttributeValue)(t) ? Object.keys(this.attributes).length >= this._spanLimits.attributeCountLimit && !Object.prototype.hasOwnProperty.call(this.attributes, e) ? (this._droppedAttributesCount++, this) : (this.attributes[e] = this._truncateToSize(t), this) : (pe.diag.warn(`Invalid attribute value set for key: ${e}`), this);
        }
        setAttributes(e) {
          for (let [t, n] of Object.entries(e))
            this.setAttribute(t, n);
          return this;
        }
        addEvent(e, t, n) {
          if (this._isSpanEnded())
            return this;
          if (this._spanLimits.eventCountLimit === 0)
            return pe.diag.warn("No events allowed."), this._droppedEventsCount++, this;
          this.events.length >= this._spanLimits.eventCountLimit && (pe.diag.warn("Dropping extra events."), this.events.shift(), this._droppedEventsCount++), (0, X.isTimeInput)(t) && ((0, X.isTimeInput)(n) || (n = t), t = void 0);
          let i = (0, X.sanitizeAttributes)(t);
          return this.events.push({ name: e, attributes: i, time: this._getTime(n), droppedAttributesCount: 0 }), this;
        }
        setStatus(e) {
          return this._isSpanEnded() ? this : (this.status = e, this);
        }
        updateName(e) {
          return this._isSpanEnded() ? this : (this.name = e, this);
        }
        end(e) {
          if (this._isSpanEnded()) {
            pe.diag.error(`${this.name} ${this._spanContext.traceId}-${this._spanContext.spanId} - You can only call end() on a span once.`);
            return;
          }
          this._ended = true, this.endTime = this._getTime(e), this._duration = (0, X.hrTimeDuration)(this.startTime, this.endTime), this._duration[0] < 0 && (pe.diag.warn("Inconsistent start and end time, startTime > endTime. Setting span duration to 0ms.", this.startTime, this.endTime), this.endTime = this.startTime.slice(), this._duration = [0, 0]), this._spanProcessor.onEnd(this);
        }
        _getTime(e) {
          if (typeof e == "number" && e < X.otperformance.now())
            return (0, X.hrTime)(e + this._performanceOffset);
          if (typeof e == "number")
            return (0, X.millisToHrTime)(e);
          if (e instanceof Date)
            return (0, X.millisToHrTime)(e.getTime());
          if ((0, X.isTimeInputHrTime)(e))
            return e;
          if (this._startTimeProvided)
            return (0, X.millisToHrTime)(Date.now());
          let t = X.otperformance.now() - this._performanceStartTime;
          return (0, X.addHrTimes)(this.startTime, (0, X.millisToHrTime)(t));
        }
        isRecording() {
          return this._ended === false;
        }
        recordException(e, t) {
          let n = {};
          typeof e == "string" ? n[ze.SemanticAttributes.EXCEPTION_MESSAGE] = e : e && (e.code ? n[ze.SemanticAttributes.EXCEPTION_TYPE] = e.code.toString() : e.name && (n[ze.SemanticAttributes.EXCEPTION_TYPE] = e.name), e.message && (n[ze.SemanticAttributes.EXCEPTION_MESSAGE] = e.message), e.stack && (n[ze.SemanticAttributes.EXCEPTION_STACKTRACE] = e.stack)), n[ze.SemanticAttributes.EXCEPTION_TYPE] || n[ze.SemanticAttributes.EXCEPTION_MESSAGE] ? this.addEvent(mm.ExceptionEventName, n, t) : pe.diag.warn(`Failed to record an exception ${e}`);
        }
        get duration() {
          return this._duration;
        }
        get ended() {
          return this._ended;
        }
        get droppedAttributesCount() {
          return this._droppedAttributesCount;
        }
        get droppedEventsCount() {
          return this._droppedEventsCount;
        }
        get droppedLinksCount() {
          return this._droppedLinksCount;
        }
        _isSpanEnded() {
          return this._ended && pe.diag.warn(`Can not execute the operation on ended Span {traceId: ${this._spanContext.traceId}, spanId: ${this._spanContext.spanId}}`), this._ended;
        }
        _truncateToLimitUtil(e, t) {
          return e.length <= t ? e : e.substr(0, t);
        }
        _truncateToSize(e) {
          let t = this._attributeValueLengthLimit;
          return t <= 0 ? (pe.diag.warn(`Attribute value limit must be positive, got ${t}`), e) : typeof e == "string" ? this._truncateToLimitUtil(e, t) : Array.isArray(e) ? e.map((n) => typeof n == "string" ? this._truncateToLimitUtil(n, t) : n) : e;
        }
      };
      yn.Span = bo;
    });
    gr = l((mr) => {
      "use strict";
      Object.defineProperty(mr, "__esModule", { value: true });
      mr.SamplingDecision = void 0;
      var gm;
      (function (r) {
        r[r.NOT_RECORD = 0] = "NOT_RECORD", r[r.RECORD = 1] = "RECORD", r[r.RECORD_AND_SAMPLED = 2] = "RECORD_AND_SAMPLED";
      })(gm = mr.SamplingDecision || (mr.SamplingDecision = {}));
    });
    In = l((vn) => {
      "use strict";
      Object.defineProperty(vn, "__esModule", { value: true });
      vn.AlwaysOffSampler = void 0;
      var Tm = gr(), yo = class {
        shouldSample() {
          return { decision: Tm.SamplingDecision.NOT_RECORD };
        }
        toString() {
          return "AlwaysOffSampler";
        }
      };
      vn.AlwaysOffSampler = yo;
    });
    Mn = l((Ln) => {
      "use strict";
      Object.defineProperty(Ln, "__esModule", { value: true });
      Ln.AlwaysOnSampler = void 0;
      var Sm = gr(), vo = class {
        shouldSample() {
          return { decision: Sm.SamplingDecision.RECORD_AND_SAMPLED };
        }
        toString() {
          return "AlwaysOnSampler";
        }
      };
      Ln.AlwaysOnSampler = vo;
    });
    Mo = l((Cn) => {
      "use strict";
      Object.defineProperty(Cn, "__esModule", { value: true });
      Cn.ParentBasedSampler = void 0;
      var Nn = (h(), m(d)), Am = A(), yl = In(), Io = Mn(), Lo = class {
        constructor(e) {
          var t, n, i, s;
          this._root = e.root, this._root || ((0, Am.globalErrorHandler)(new Error("ParentBasedSampler must have a root sampler configured")), this._root = new Io.AlwaysOnSampler()), this._remoteParentSampled = (t = e.remoteParentSampled) !== null && t !== void 0 ? t : new Io.AlwaysOnSampler(), this._remoteParentNotSampled = (n = e.remoteParentNotSampled) !== null && n !== void 0 ? n : new yl.AlwaysOffSampler(), this._localParentSampled = (i = e.localParentSampled) !== null && i !== void 0 ? i : new Io.AlwaysOnSampler(), this._localParentNotSampled = (s = e.localParentNotSampled) !== null && s !== void 0 ? s : new yl.AlwaysOffSampler();
        }
        shouldSample(e, t, n, i, s, o) {
          let a = Nn.trace.getSpanContext(e);
          return !a || !(0, Nn.isSpanContextValid)(a) ? this._root.shouldSample(e, t, n, i, s, o) : a.isRemote ? a.traceFlags & Nn.TraceFlags.SAMPLED ? this._remoteParentSampled.shouldSample(e, t, n, i, s, o) : this._remoteParentNotSampled.shouldSample(e, t, n, i, s, o) : a.traceFlags & Nn.TraceFlags.SAMPLED ? this._localParentSampled.shouldSample(e, t, n, i, s, o) : this._localParentNotSampled.shouldSample(e, t, n, i, s, o);
        }
        toString() {
          return `ParentBased{root=${this._root.toString()}, remoteParentSampled=${this._remoteParentSampled.toString()}, remoteParentNotSampled=${this._remoteParentNotSampled.toString()}, localParentSampled=${this._localParentSampled.toString()}, localParentNotSampled=${this._localParentNotSampled.toString()}}`;
        }
      };
      Cn.ParentBasedSampler = Lo;
    });
    Co = l((wn) => {
      "use strict";
      Object.defineProperty(wn, "__esModule", { value: true });
      wn.TraceIdRatioBasedSampler = void 0;
      var Om = (h(), m(d)), vl = gr(), No = class {
        constructor(e = 0) {
          this._ratio = e, this._ratio = this._normalize(e), this._upperBound = Math.floor(this._ratio * 4294967295);
        }
        shouldSample(e, t) {
          return { decision: (0, Om.isValidTraceId)(t) && this._accumulate(t) < this._upperBound ? vl.SamplingDecision.RECORD_AND_SAMPLED : vl.SamplingDecision.NOT_RECORD };
        }
        toString() {
          return `TraceIdRatioBased{${this._ratio}}`;
        }
        _normalize(e) {
          return typeof e != "number" || isNaN(e) ? 0 : e >= 1 ? 1 : e <= 0 ? 0 : e;
        }
        _accumulate(e) {
          let t = 0;
          for (let n = 0; n < e.length / 8; n++) {
            let i = n * 8, s = parseInt(e.slice(i, i + 8), 16);
            t = (t ^ s) >>> 0;
          }
          return t;
        }
      };
      wn.TraceIdRatioBasedSampler = No;
    });
    Do = l((St) => {
      "use strict";
      Object.defineProperty(St, "__esModule", { value: true });
      St.buildSamplerFromEnv = St.loadDefaultConfig = void 0;
      var xn = (h(), m(d)), H = A(), Il = In(), wo = Mn(), xo = Mo(), Ll = Co(), Rm = (0, H.getEnv)(), bm = H.TracesSamplerValues.AlwaysOn, Tt = 1;
      function Pm() {
        return { sampler: Nl(Rm), forceFlushTimeoutMillis: 3e4, generalLimits: { attributeValueLengthLimit: (0, H.getEnv)().OTEL_ATTRIBUTE_VALUE_LENGTH_LIMIT, attributeCountLimit: (0, H.getEnv)().OTEL_ATTRIBUTE_COUNT_LIMIT }, spanLimits: { attributeValueLengthLimit: (0, H.getEnv)().OTEL_SPAN_ATTRIBUTE_VALUE_LENGTH_LIMIT, attributeCountLimit: (0, H.getEnv)().OTEL_SPAN_ATTRIBUTE_COUNT_LIMIT, linkCountLimit: (0, H.getEnv)().OTEL_SPAN_LINK_COUNT_LIMIT, eventCountLimit: (0, H.getEnv)().OTEL_SPAN_EVENT_COUNT_LIMIT, attributePerEventCountLimit: (0, H.getEnv)().OTEL_SPAN_ATTRIBUTE_PER_EVENT_COUNT_LIMIT, attributePerLinkCountLimit: (0, H.getEnv)().OTEL_SPAN_ATTRIBUTE_PER_LINK_COUNT_LIMIT } };
      }
      St.loadDefaultConfig = Pm;
      function Nl(r = (0, H.getEnv)()) {
        switch (r.OTEL_TRACES_SAMPLER) {
          case H.TracesSamplerValues.AlwaysOn:
            return new wo.AlwaysOnSampler();
          case H.TracesSamplerValues.AlwaysOff:
            return new Il.AlwaysOffSampler();
          case H.TracesSamplerValues.ParentBasedAlwaysOn:
            return new xo.ParentBasedSampler({ root: new wo.AlwaysOnSampler() });
          case H.TracesSamplerValues.ParentBasedAlwaysOff:
            return new xo.ParentBasedSampler({ root: new Il.AlwaysOffSampler() });
          case H.TracesSamplerValues.TraceIdRatio:
            return new Ll.TraceIdRatioBasedSampler(Ml(r));
          case H.TracesSamplerValues.ParentBasedTraceIdRatio:
            return new xo.ParentBasedSampler({ root: new Ll.TraceIdRatioBasedSampler(Ml(r)) });
          default:
            return xn.diag.error(`OTEL_TRACES_SAMPLER value "${r.OTEL_TRACES_SAMPLER} invalid, defaulting to ${bm}".`), new wo.AlwaysOnSampler();
        }
      }
      St.buildSamplerFromEnv = Nl;
      function Ml(r) {
        if (r.OTEL_TRACES_SAMPLER_ARG === void 0 || r.OTEL_TRACES_SAMPLER_ARG === "")
          return xn.diag.error(`OTEL_TRACES_SAMPLER_ARG is blank, defaulting to ${Tt}.`), Tt;
        let e = Number(r.OTEL_TRACES_SAMPLER_ARG);
        return isNaN(e) ? (xn.diag.error(`OTEL_TRACES_SAMPLER_ARG=${r.OTEL_TRACES_SAMPLER_ARG} was given, but it is invalid, defaulting to ${Tt}.`), Tt) : e < 0 || e > 1 ? (xn.diag.error(`OTEL_TRACES_SAMPLER_ARG=${r.OTEL_TRACES_SAMPLER_ARG} was given, but it is out of range ([0..1]), defaulting to ${Tt}.`), Tt) : e;
      }
    });
    Bo = l((At) => {
      "use strict";
      Object.defineProperty(At, "__esModule", { value: true });
      At.reconfigureLimits = At.mergeConfig = void 0;
      var Cl = Do(), Uo = A();
      function ym(r) {
        let e = { sampler: (0, Cl.buildSamplerFromEnv)() }, t = (0, Cl.loadDefaultConfig)(), n = Object.assign({}, t, e, r);
        return n.generalLimits = Object.assign({}, t.generalLimits, r.generalLimits || {}), n.spanLimits = Object.assign({}, t.spanLimits, r.spanLimits || {}), n;
      }
      At.mergeConfig = ym;
      function vm(r) {
        var e, t, n, i, s, o, a, u, c, _, p, f;
        let L = Object.assign({}, r.spanLimits), R = (0, Uo.getEnvWithoutDefaults)();
        return L.attributeCountLimit = (o = (s = (i = (t = (e = r.spanLimits) === null || e === void 0 ? void 0 : e.attributeCountLimit) !== null && t !== void 0 ? t : (n = r.generalLimits) === null || n === void 0 ? void 0 : n.attributeCountLimit) !== null && i !== void 0 ? i : R.OTEL_SPAN_ATTRIBUTE_COUNT_LIMIT) !== null && s !== void 0 ? s : R.OTEL_ATTRIBUTE_COUNT_LIMIT) !== null && o !== void 0 ? o : Uo.DEFAULT_ATTRIBUTE_COUNT_LIMIT, L.attributeValueLengthLimit = (f = (p = (_ = (u = (a = r.spanLimits) === null || a === void 0 ? void 0 : a.attributeValueLengthLimit) !== null && u !== void 0 ? u : (c = r.generalLimits) === null || c === void 0 ? void 0 : c.attributeValueLengthLimit) !== null && _ !== void 0 ? _ : R.OTEL_SPAN_ATTRIBUTE_VALUE_LENGTH_LIMIT) !== null && p !== void 0 ? p : R.OTEL_ATTRIBUTE_VALUE_LENGTH_LIMIT) !== null && f !== void 0 ? f : Uo.DEFAULT_ATTRIBUTE_VALUE_LENGTH_LIMIT, Object.assign({}, r, { spanLimits: L });
      }
      At.reconfigureLimits = vm;
    });
    wl = l((Dn) => {
      "use strict";
      Object.defineProperty(Dn, "__esModule", { value: true });
      Dn.BatchSpanProcessorBase = void 0;
      var Ot = (h(), m(d)), Ye = A(), qo = class {
        constructor(e, t) {
          this._exporter = e, this._isExporting = false, this._finishedSpans = [], this._droppedSpansCount = 0;
          let n = (0, Ye.getEnv)();
          this._maxExportBatchSize = typeof t?.maxExportBatchSize == "number" ? t.maxExportBatchSize : n.OTEL_BSP_MAX_EXPORT_BATCH_SIZE, this._maxQueueSize = typeof t?.maxQueueSize == "number" ? t.maxQueueSize : n.OTEL_BSP_MAX_QUEUE_SIZE, this._scheduledDelayMillis = typeof t?.scheduledDelayMillis == "number" ? t.scheduledDelayMillis : n.OTEL_BSP_SCHEDULE_DELAY, this._exportTimeoutMillis = typeof t?.exportTimeoutMillis == "number" ? t.exportTimeoutMillis : n.OTEL_BSP_EXPORT_TIMEOUT, this._shutdownOnce = new Ye.BindOnceFuture(this._shutdown, this), this._maxExportBatchSize > this._maxQueueSize && (Ot.diag.warn("BatchSpanProcessor: maxExportBatchSize must be smaller or equal to maxQueueSize, setting maxExportBatchSize to match maxQueueSize"), this._maxExportBatchSize = this._maxQueueSize);
        }
        forceFlush() {
          return this._shutdownOnce.isCalled ? this._shutdownOnce.promise : this._flushAll();
        }
        onStart(e, t) {
        }
        onEnd(e) {
          this._shutdownOnce.isCalled || e.spanContext().traceFlags & Ot.TraceFlags.SAMPLED && this._addToBuffer(e);
        }
        shutdown() {
          return this._shutdownOnce.call();
        }
        _shutdown() {
          return Promise.resolve().then(() => this.onShutdown()).then(() => this._flushAll()).then(() => this._exporter.shutdown());
        }
        _addToBuffer(e) {
          if (this._finishedSpans.length >= this._maxQueueSize) {
            this._droppedSpansCount === 0 && Ot.diag.debug("maxQueueSize reached, dropping spans"), this._droppedSpansCount++;
            return;
          }
          this._droppedSpansCount > 0 && (Ot.diag.warn(`Dropped ${this._droppedSpansCount} spans because maxQueueSize reached`), this._droppedSpansCount = 0), this._finishedSpans.push(e), this._maybeStartTimer();
        }
        _flushAll() {
          return new Promise((e, t) => {
            let n = [], i = Math.ceil(this._finishedSpans.length / this._maxExportBatchSize);
            for (let s = 0, o = i; s < o; s++)
              n.push(this._flushOneBatch());
            Promise.all(n).then(() => {
              e();
            }).catch(t);
          });
        }
        _flushOneBatch() {
          return this._clearTimer(), this._finishedSpans.length === 0 ? Promise.resolve() : new Promise((e, t) => {
            let n = setTimeout(() => {
              t(new Error("Timeout"));
            }, this._exportTimeoutMillis);
            Ot.context.with((0, Ye.suppressTracing)(Ot.context.active()), () => {
              let i = this._finishedSpans.splice(0, this._maxExportBatchSize), s = () => this._exporter.export(i, (a) => {
                var u;
                clearTimeout(n), a.code === Ye.ExportResultCode.SUCCESS ? e() : t((u = a.error) !== null && u !== void 0 ? u : new Error("BatchSpanProcessor: span export failed"));
              }), o = i.map((a) => a.resource).filter((a) => a.asyncAttributesPending);
              o.length === 0 ? s() : Promise.all(o.map((a) => {
                var u;
                return (u = a.waitForAsyncAttributes) === null || u === void 0 ? void 0 : u.call(a);
              })).then(s, (a) => {
                (0, Ye.globalErrorHandler)(a), t(a);
              });
            });
          });
        }
        _maybeStartTimer() {
          if (this._isExporting)
            return;
          let e = () => {
            this._isExporting = true, this._flushOneBatch().then(() => {
              this._isExporting = false, this._finishedSpans.length > 0 && (this._clearTimer(), this._maybeStartTimer());
            }).catch((t) => {
              this._isExporting = false, (0, Ye.globalErrorHandler)(t);
            });
          };
          if (this._finishedSpans.length >= this._maxExportBatchSize)
            return e();
          this._timer === void 0 && (this._timer = setTimeout(() => e(), this._scheduledDelayMillis), (0, Ye.unrefTimer)(this._timer));
        }
        _clearTimer() {
          this._timer !== void 0 && (clearTimeout(this._timer), this._timer = void 0);
        }
      };
      Dn.BatchSpanProcessorBase = qo;
    });
    xl = l((Un) => {
      "use strict";
      Object.defineProperty(Un, "__esModule", { value: true });
      Un.BatchSpanProcessor = void 0;
      var Im = wl(), Go = class extends Im.BatchSpanProcessorBase {
        onShutdown() {
        }
      };
      Un.BatchSpanProcessor = Go;
    });
    Bl = l((qn) => {
      "use strict";
      Object.defineProperty(qn, "__esModule", { value: true });
      qn.RandomIdGenerator = void 0;
      var Lm = 8, Ul = 16, Vo = class {
        constructor() {
          this.generateTraceId = Dl(Ul), this.generateSpanId = Dl(Lm);
        }
      };
      qn.RandomIdGenerator = Vo;
      var Bn = Buffer.allocUnsafe(Ul);
      function Dl(r) {
        return function () {
          for (let t = 0; t < r / 4; t++)
            Bn.writeUInt32BE(Math.random() * 2 ** 32 >>> 0, t * 4);
          for (let t = 0; t < r && !(Bn[t] > 0); t++)
            t === r - 1 && (Bn[r - 1] = 1);
          return Bn.toString("hex", 0, r);
        };
      }
    });
    Gl = l((Me) => {
      "use strict";
      var Mm = Me && Me.__createBinding || (Object.create ? function (r, e, t, n) {
        n === void 0 && (n = t), Object.defineProperty(r, n, {
          enumerable: true, get: function () {
            return e[t];
          }
        });
      } : function (r, e, t, n) {
        n === void 0 && (n = t), r[n] = e[t];
      }), ql = Me && Me.__exportStar || function (r, e) {
        for (var t in r)
          t !== "default" && !Object.prototype.hasOwnProperty.call(e, t) && Mm(e, r, t);
      };
      Object.defineProperty(Me, "__esModule", { value: true });
      ql(xl(), Me);
      ql(Bl(), Me);
    });
    Gn = l((Qe) => {
      "use strict";
      var Nm = Qe && Qe.__createBinding || (Object.create ? function (r, e, t, n) {
        n === void 0 && (n = t), Object.defineProperty(r, n, {
          enumerable: true, get: function () {
            return e[t];
          }
        });
      } : function (r, e, t, n) {
        n === void 0 && (n = t), r[n] = e[t];
      }), Cm = Qe && Qe.__exportStar || function (r, e) {
        for (var t in r)
          t !== "default" && !Object.prototype.hasOwnProperty.call(e, t) && Nm(e, r, t);
      };
      Object.defineProperty(Qe, "__esModule", { value: true });
      Cm(Gl(), Qe);
    });
    Vl = l((Hn) => {
      "use strict";
      Object.defineProperty(Hn, "__esModule", { value: true });
      Hn.Tracer = void 0;
      var j = (h(), m(d)), Vn = A(), wm = Po(), xm = Bo(), Dm = Gn(), Ho = class {
        constructor(e, t, n) {
          this._tracerProvider = n;
          let i = (0, xm.mergeConfig)(t);
          this._sampler = i.sampler, this._generalLimits = i.generalLimits, this._spanLimits = i.spanLimits, this._idGenerator = t.idGenerator || new Dm.RandomIdGenerator(), this.resource = n.resource, this.instrumentationLibrary = e;
        }
        startSpan(e, t = {}, n = j.context.active()) {
          var i, s, o;
          t.root && (n = j.trace.deleteSpan(n));
          let a = j.trace.getSpan(n);
          if ((0, Vn.isTracingSuppressed)(n))
            return j.diag.debug("Instrumentation suppressed, returning Noop Span"), j.trace.wrapSpanContext(j.INVALID_SPAN_CONTEXT);
          let u = a?.spanContext(), c = this._idGenerator.generateSpanId(), _, p, f;
          !u || !j.trace.isSpanContextValid(u) ? _ = this._idGenerator.generateTraceId() : (_ = u.traceId, p = u.traceState, f = u.spanId);
          let L = (i = t.kind) !== null && i !== void 0 ? i : j.SpanKind.INTERNAL, R = ((s = t.links) !== null && s !== void 0 ? s : []).map((pt) => ({ context: pt.context, attributes: (0, Vn.sanitizeAttributes)(pt.attributes) })), w = (0, Vn.sanitizeAttributes)(t.attributes), U = this._sampler.shouldSample(n, _, e, L, w, R);
          p = (o = U.traceState) !== null && o !== void 0 ? o : p;
          let S = U.decision === j.SamplingDecision.RECORD_AND_SAMPLED ? j.TraceFlags.SAMPLED : j.TraceFlags.NONE, Te = { traceId: _, spanId: c, traceFlags: S, traceState: p };
          if (U.decision === j.SamplingDecision.NOT_RECORD)
            return j.diag.debug("Recording is off, propagating context in a non-recording span"), j.trace.wrapSpanContext(Te);
          let Se = (0, Vn.sanitizeAttributes)(Object.assign(w, U.attributes));
          return new wm.Span(this, n, e, Te, L, f, R, t.startTime, void 0, Se);
        }
        startActiveSpan(e, t, n, i) {
          let s, o, a;
          if (arguments.length < 2)
            return;
          arguments.length === 2 ? a = t : arguments.length === 3 ? (s = t, a = n) : (s = t, o = n, a = i);
          let u = o ?? j.context.active(), c = this.startSpan(e, s, u), _ = j.trace.setSpan(u, c);
          return j.context.with(_, a, void 0, c);
        }
        getGeneralLimits() {
          return this._generalLimits;
        }
        getSpanLimits() {
          return this._spanLimits;
        }
        getActiveSpanProcessor() {
          return this._tracerProvider.getActiveSpanProcessor();
        }
      };
      Hn.Tracer = Ho;
    });
    Hl = l((jn) => {
      "use strict";
      Object.defineProperty(jn, "__esModule", { value: true });
      jn.defaultServiceName = void 0;
      function Um() {
        return `unknown_service:${process.argv0}`;
      }
      jn.defaultServiceName = Um;
    });
    jo = l((Rt) => {
      "use strict";
      Object.defineProperty(Rt, "__esModule", { value: true });
      Rt.normalizeType = Rt.normalizeArch = void 0;
      var Bm = (r) => {
        switch (r) {
          case "arm":
            return "arm32";
          case "ppc":
            return "ppc32";
          case "x64":
            return "amd64";
          default:
            return r;
        }
      };
      Rt.normalizeArch = Bm;
      var qm = (r) => {
        switch (r) {
          case "sunos":
            return "solaris";
          case "win32":
            return "windows";
          default:
            return r;
        }
      };
      Rt.normalizeType = qm;
    });
    kn = l((Fn) => {
      "use strict";
      Object.defineProperty(Fn, "__esModule", { value: true });
      Fn.execAsync = void 0;
      var Gm = z("child_process"), Vm = z("util");
      Fn.execAsync = Vm.promisify(Gm.exec);
    });
    jl = l(($n) => {
      "use strict";
      Object.defineProperty($n, "__esModule", { value: true });
      $n.getMachineId = void 0;
      var Hm = kn(), jm = (h(), m(d));
      async function Fm() {
        try {
          let e = (await (0, Hm.execAsync)('ioreg -rd1 -c "IOPlatformExpertDevice"')).stdout.split(`
`).find((n) => n.includes("IOPlatformUUID"));
          if (!e)
            return "";
          let t = e.split('" = "');
          if (t.length === 2)
            return t[1].slice(0, -1);
        } catch (r) {
          jm.diag.debug(`error reading machine id: ${r}`);
        }
        return "";
      }
      $n.getMachineId = Fm;
    });
    Fl = l((Xn) => {
      "use strict";
      Object.defineProperty(Xn, "__esModule", { value: true });
      Xn.getMachineId = void 0;
      var km = z("fs"), $m = (h(), m(d));
      async function Xm() {
        let r = ["/etc/machine-id", "/var/lib/dbus/machine-id"];
        for (let e of r)
          try {
            return (await km.promises.readFile(e, { encoding: "utf8" })).trim();
          } catch (t) {
            $m.diag.debug(`error reading machine id: ${t}`);
          }
        return "";
      }
      Xn.getMachineId = Xm;
    });
    $l = l((Wn) => {
      "use strict";
      Object.defineProperty(Wn, "__esModule", { value: true });
      Wn.getMachineId = void 0;
      var Wm = z("fs"), Km = kn(), kl = (h(), m(d));
      async function zm() {
        try {
          return (await Wm.promises.readFile("/etc/hostid", { encoding: "utf8" })).trim();
        } catch (r) {
          kl.diag.debug(`error reading machine id: ${r}`);
        }
        try {
          return (await (0, Km.execAsync)("kenv -q smbios.system.uuid")).stdout.trim();
        } catch (r) {
          kl.diag.debug(`error reading machine id: ${r}`);
        }
        return "";
      }
      Wn.getMachineId = zm;
    });
    Wl = l((Kn) => {
      "use strict";
      Object.defineProperty(Kn, "__esModule", { value: true });
      Kn.getMachineId = void 0;
      var Xl = z("process"), Ym = kn(), Qm = (h(), m(d));
      async function Zm() {
        let r = "QUERY HKEY_LOCAL_MACHINE\\SOFTWARE\\Microsoft\\Cryptography /v MachineGuid", e = "%windir%\\System32\\REG.exe";
        Xl.arch === "ia32" && "PROCESSOR_ARCHITEW6432" in Xl.env && (e = "%windir%\\sysnative\\cmd.exe /c " + e);
        try {
          let n = (await (0, Ym.execAsync)(`${e} ${r}`)).stdout.split("REG_SZ");
          if (n.length === 2)
            return n[1].trim();
        } catch (t) {
          Qm.diag.debug(`error reading machine id: ${t}`);
        }
        return "";
      }
      Kn.getMachineId = Zm;
    });
    Kl = l((zn) => {
      "use strict";
      Object.defineProperty(zn, "__esModule", { value: true });
      zn.getMachineId = void 0;
      var Jm = (h(), m(d));
      async function eg() {
        return Jm.diag.debug("could not read machine-id: unsupported platform"), "";
      }
      zn.getMachineId = eg;
    });
    zl = l((Oe) => {
      "use strict";
      Object.defineProperty(Oe, "__esModule", { value: true });
      Oe.getMachineId = void 0;
      var tg = z("process"), bt;
      Oe.getMachineId = bt;
      switch (tg.platform) {
        case "darwin":
          Oe.getMachineId = bt = jl().getMachineId;
          break;
        case "linux":
          Oe.getMachineId = bt = Fl().getMachineId;
          break;
        case "freebsd":
          Oe.getMachineId = bt = $l().getMachineId;
          break;
        case "win32":
          Oe.getMachineId = bt = Wl().getMachineId;
          break;
        default:
          Oe.getMachineId = bt = Kl().getMachineId;
      }
    });
    $o = l((Yn) => {
      "use strict";
      Object.defineProperty(Yn, "__esModule", { value: true });
      Yn.hostDetectorSync = void 0;
      var Fo = Ae(), rg = Ze(), Yl = z("os"), ng = jo(), ig = zl(), ko = class {
        detect(e) {
          let t = { [Fo.SemanticResourceAttributes.HOST_NAME]: (0, Yl.hostname)(), [Fo.SemanticResourceAttributes.HOST_ARCH]: (0, ng.normalizeArch)((0, Yl.arch)()) };
          return new rg.Resource(t, this._getAsyncAttributes());
        }
        _getAsyncAttributes() {
          return (0, ig.getMachineId)().then((e) => {
            let t = {};
            return e && (t[Fo.SemanticResourceAttributes.HOST_ID] = e), t;
          });
        }
      };
      Yn.hostDetectorSync = new ko();
    });
    Ql = l((Qn) => {
      "use strict";
      Object.defineProperty(Qn, "__esModule", { value: true });
      Qn.hostDetector = void 0;
      var sg = $o(), Xo = class {
        detect(e) {
          return Promise.resolve(sg.hostDetectorSync.detect(e));
        }
      };
      Qn.hostDetector = new Xo();
    });
    Ko = l((Zn) => {
      "use strict";
      Object.defineProperty(Zn, "__esModule", { value: true });
      Zn.osDetectorSync = void 0;
      var Zl = Ae(), og = Ze(), Jl = z("os"), ag = jo(), Wo = class {
        detect(e) {
          let t = { [Zl.SemanticResourceAttributes.OS_TYPE]: (0, ag.normalizeType)((0, Jl.platform)()), [Zl.SemanticResourceAttributes.OS_VERSION]: (0, Jl.release)() };
          return new og.Resource(t);
        }
      };
      Zn.osDetectorSync = new Wo();
    });
    ed = l((Jn) => {
      "use strict";
      Object.defineProperty(Jn, "__esModule", { value: true });
      Jn.osDetector = void 0;
      var ug = Ko(), zo = class {
        detect(e) {
          return Promise.resolve(ug.osDetectorSync.detect(e));
        }
      };
      Jn.osDetector = new zo();
    });
    Qo = l((ei) => {
      "use strict";
      Object.defineProperty(ei, "__esModule", { value: true });
      ei.processDetectorSync = void 0;
      var cg = (h(), m(d)), Re = Ae(), lg = Ze(), dg = z("os"), Yo = class {
        detect(e) {
          let t = { [Re.SemanticResourceAttributes.PROCESS_PID]: process.pid, [Re.SemanticResourceAttributes.PROCESS_EXECUTABLE_NAME]: process.title, [Re.SemanticResourceAttributes.PROCESS_EXECUTABLE_PATH]: process.execPath, [Re.SemanticResourceAttributes.PROCESS_COMMAND_ARGS]: [process.argv[0], ...process.execArgv, ...process.argv.slice(1)], [Re.SemanticResourceAttributes.PROCESS_RUNTIME_VERSION]: process.versions.node, [Re.SemanticResourceAttributes.PROCESS_RUNTIME_NAME]: "nodejs", [Re.SemanticResourceAttributes.PROCESS_RUNTIME_DESCRIPTION]: "Node.js" };
          process.argv.length > 1 && (t[Re.SemanticResourceAttributes.PROCESS_COMMAND] = process.argv[1]);
          try {
            let n = dg.userInfo();
            t[Re.SemanticResourceAttributes.PROCESS_OWNER] = n.username;
          } catch (n) {
            cg.diag.debug(`error obtaining process owner: ${n}`);
          }
          return new lg.Resource(t);
        }
      };
      ei.processDetectorSync = new Yo();
    });
    td = l((ti) => {
      "use strict";
      Object.defineProperty(ti, "__esModule", { value: true });
      ti.processDetector = void 0;
      var _g = Qo(), Zo = class {
        detect(e) {
          return Promise.resolve(_g.processDetectorSync.detect(e));
        }
      };
      ti.processDetector = new Zo();
    });
    rd = l((te) => {
      "use strict";
      var pg = te && te.__createBinding || (Object.create ? function (r, e, t, n) {
        n === void 0 && (n = t), Object.defineProperty(r, n, {
          enumerable: true, get: function () {
            return e[t];
          }
        });
      } : function (r, e, t, n) {
        n === void 0 && (n = t), r[n] = e[t];
      }), Je = te && te.__exportStar || function (r, e) {
        for (var t in r)
          t !== "default" && !Object.prototype.hasOwnProperty.call(e, t) && pg(e, r, t);
      };
      Object.defineProperty(te, "__esModule", { value: true });
      Je(Hl(), te);
      Je(Ql(), te);
      Je(ed(), te);
      Je($o(), te);
      Je(Ko(), te);
      Je(td(), te);
      Je(Qo(), te);
    });
    Jo = l((et) => {
      "use strict";
      var hg = et && et.__createBinding || (Object.create ? function (r, e, t, n) {
        n === void 0 && (n = t), Object.defineProperty(r, n, {
          enumerable: true, get: function () {
            return e[t];
          }
        });
      } : function (r, e, t, n) {
        n === void 0 && (n = t), r[n] = e[t];
      }), fg = et && et.__exportStar || function (r, e) {
        for (var t in r)
          t !== "default" && !Object.prototype.hasOwnProperty.call(e, t) && hg(e, r, t);
      };
      Object.defineProperty(et, "__esModule", { value: true });
      fg(rd(), et);
    });
    Ze = l((ri) => {
      "use strict";
      Object.defineProperty(ri, "__esModule", { value: true });
      ri.Resource = void 0;
      var nd = (h(), m(d)), tt = Ae(), ea = A(), Eg = Jo(), Tr = class r {
        constructor(e, t) {
          var n;
          this._attributes = e, this.asyncAttributesPending = t != null, this._syncAttributes = (n = this._attributes) !== null && n !== void 0 ? n : {}, this._asyncAttributesPromise = t?.then((i) => (this._attributes = Object.assign({}, this._attributes, i), this.asyncAttributesPending = false, i), (i) => (nd.diag.debug("a resource's async attributes promise rejected: %s", i), this.asyncAttributesPending = false, {}));
        }
        static empty() {
          return r.EMPTY;
        }
        static default() {
          return new r({ [tt.SemanticResourceAttributes.SERVICE_NAME]: (0, Eg.defaultServiceName)(), [tt.SemanticResourceAttributes.TELEMETRY_SDK_LANGUAGE]: ea.SDK_INFO[tt.SemanticResourceAttributes.TELEMETRY_SDK_LANGUAGE], [tt.SemanticResourceAttributes.TELEMETRY_SDK_NAME]: ea.SDK_INFO[tt.SemanticResourceAttributes.TELEMETRY_SDK_NAME], [tt.SemanticResourceAttributes.TELEMETRY_SDK_VERSION]: ea.SDK_INFO[tt.SemanticResourceAttributes.TELEMETRY_SDK_VERSION] });
        }
        get attributes() {
          var e;
          return this.asyncAttributesPending && nd.diag.error("Accessing resource attributes before async attributes settled"), (e = this._attributes) !== null && e !== void 0 ? e : {};
        }
        async waitForAsyncAttributes() {
          this.asyncAttributesPending && await this._asyncAttributesPromise;
        }
        merge(e) {
          var t;
          if (!e)
            return this;
          let n = Object.assign(Object.assign({}, this._syncAttributes), (t = e._syncAttributes) !== null && t !== void 0 ? t : e.attributes);
          if (!this._asyncAttributesPromise && !e._asyncAttributesPromise)
            return new r(n);
          let i = Promise.all([this._asyncAttributesPromise, e._asyncAttributesPromise]).then(([s, o]) => {
            var a;
            return Object.assign(Object.assign(Object.assign(Object.assign({}, this._syncAttributes), s), (a = e._syncAttributes) !== null && a !== void 0 ? a : e.attributes), o);
          });
          return new r(n, i);
        }
      };
      ri.Resource = Tr;
      Tr.EMPTY = new Tr({});
    });
    sd = l((id) => {
      "use strict";
      Object.defineProperty(id, "__esModule", { value: true });
    });
    ad = l((od) => {
      "use strict";
      Object.defineProperty(od, "__esModule", { value: true });
    });
    cd = l((ud) => {
      "use strict";
      Object.defineProperty(ud, "__esModule", { value: true });
    });
    ld = l((ni) => {
      "use strict";
      Object.defineProperty(ni, "__esModule", { value: true });
      ni.browserDetector = void 0;
      var mg = rt(), ta = class {
        detect(e) {
          return Promise.resolve(mg.browserDetectorSync.detect(e));
        }
      };
      ni.browserDetector = new ta();
    });
    na = l((ii) => {
      "use strict";
      Object.defineProperty(ii, "__esModule", { value: true });
      ii.envDetectorSync = void 0;
      var gg = (h(), m(d)), Tg = A(), Sg = Ae(), Ag = Ze(), ra = class {
        constructor() {
          this._MAX_LENGTH = 255, this._COMMA_SEPARATOR = ",", this._LABEL_KEY_VALUE_SPLITTER = "=", this._ERROR_MESSAGE_INVALID_CHARS = "should be a ASCII string with a length greater than 0 and not exceed " + this._MAX_LENGTH + " characters.", this._ERROR_MESSAGE_INVALID_VALUE = "should be a ASCII string with a length not exceed " + this._MAX_LENGTH + " characters.";
        }
        detect(e) {
          let t = {}, n = (0, Tg.getEnv)(), i = n.OTEL_RESOURCE_ATTRIBUTES, s = n.OTEL_SERVICE_NAME;
          if (i)
            try {
              let o = this._parseResourceAttributes(i);
              Object.assign(t, o);
            } catch (o) {
              gg.diag.debug(`EnvDetector failed: ${o.message}`);
            }
          return s && (t[Sg.SemanticResourceAttributes.SERVICE_NAME] = s), new Ag.Resource(t);
        }
        _parseResourceAttributes(e) {
          if (!e)
            return {};
          let t = {}, n = e.split(this._COMMA_SEPARATOR, -1);
          for (let i of n) {
            let s = i.split(this._LABEL_KEY_VALUE_SPLITTER, -1);
            if (s.length !== 2)
              continue;
            let [o, a] = s;
            if (o = o.trim(), a = a.trim().split(/^"|"$/).join(""), !this._isValidAndNotEmpty(o))
              throw new Error(`Attribute key ${this._ERROR_MESSAGE_INVALID_CHARS}`);
            if (!this._isValid(a))
              throw new Error(`Attribute value ${this._ERROR_MESSAGE_INVALID_VALUE}`);
            t[o] = decodeURIComponent(a);
          }
          return t;
        }
        _isValid(e) {
          return e.length <= this._MAX_LENGTH && this._isBaggageOctetString(e);
        }
        _isBaggageOctetString(e) {
          for (let t = 0; t < e.length; t++) {
            let n = e.charCodeAt(t);
            if (n < 33 || n === 44 || n === 59 || n === 92 || n > 126)
              return false;
          }
          return true;
        }
        _isValidAndNotEmpty(e) {
          return e.length > 0 && this._isValid(e);
        }
      };
      ii.envDetectorSync = new ra();
    });
    dd = l((si) => {
      "use strict";
      Object.defineProperty(si, "__esModule", { value: true });
      si.envDetector = void 0;
      var Og = na(), ia = class {
        detect(e) {
          return Promise.resolve(Og.envDetectorSync.detect(e));
        }
      };
      si.envDetector = new ia();
    });
    _d = l((ai) => {
      "use strict";
      Object.defineProperty(ai, "__esModule", { value: true });
      ai.browserDetectorSync = void 0;
      var oi = Ae(), sa = rt(), Rg = (h(), m(d)), oa = class {
        detect(e) {
          if (!(typeof navigator < "u"))
            return sa.Resource.empty();
          let n = { [oi.SemanticResourceAttributes.PROCESS_RUNTIME_NAME]: "browser", [oi.SemanticResourceAttributes.PROCESS_RUNTIME_DESCRIPTION]: "Web Browser", [oi.SemanticResourceAttributes.PROCESS_RUNTIME_VERSION]: navigator.userAgent };
          return this._getResourceAttributes(n, e);
        }
        _getResourceAttributes(e, t) {
          return e[oi.SemanticResourceAttributes.PROCESS_RUNTIME_VERSION] === "" ? (Rg.diag.debug("BrowserDetector failed: Unable to find required browser resources. "), sa.Resource.empty()) : new sa.Resource(Object.assign({}, e));
        }
      };
      ai.browserDetectorSync = new oa();
    });
    pd = l((he) => {
      "use strict";
      var bg = he && he.__createBinding || (Object.create ? function (r, e, t, n) {
        n === void 0 && (n = t), Object.defineProperty(r, n, {
          enumerable: true, get: function () {
            return e[t];
          }
        });
      } : function (r, e, t, n) {
        n === void 0 && (n = t), r[n] = e[t];
      }), ui = he && he.__exportStar || function (r, e) {
        for (var t in r)
          t !== "default" && !Object.prototype.hasOwnProperty.call(e, t) && bg(e, r, t);
      };
      Object.defineProperty(he, "__esModule", { value: true });
      ui(ld(), he);
      ui(dd(), he);
      ui(_d(), he);
      ui(na(), he);
    });
    hd = l((ci) => {
      "use strict";
      Object.defineProperty(ci, "__esModule", { value: true });
      ci.isPromiseLike = void 0;
      var Pg = (r) => r !== null && typeof r == "object" && typeof r.then == "function";
      ci.isPromiseLike = Pg;
    });
    Ed = l((yt) => {
      "use strict";
      Object.defineProperty(yt, "__esModule", { value: true });
      yt.detectResourcesSync = yt.detectResources = void 0;
      var Sr = Ze(), Pt = (h(), m(d)), yg = hd(), vg = async (r = {}) => {
        let e = await Promise.all((r.detectors || []).map(async (t) => {
          try {
            let n = await t.detect(r);
            return Pt.diag.debug(`${t.constructor.name} found resource.`, n), n;
          } catch (n) {
            return Pt.diag.debug(`${t.constructor.name} failed: ${n.message}`), Sr.Resource.empty();
          }
        }));
        return fd(e), e.reduce((t, n) => t.merge(n), Sr.Resource.empty());
      };
      yt.detectResources = vg;
      var Ig = (r = {}) => {
        var e;
        let t = ((e = r.detectors) !== null && e !== void 0 ? e : []).map((i) => {
          try {
            let s = i.detect(r), o;
            if ((0, yg.isPromiseLike)(s)) {
              let a = async () => (await s).attributes;
              o = new Sr.Resource({}, a());
            } else
              o = s;
            return o.waitForAsyncAttributes ? o.waitForAsyncAttributes().then(() => Pt.diag.debug(`${i.constructor.name} found resource.`, o)) : Pt.diag.debug(`${i.constructor.name} found resource.`, o), o;
          } catch (s) {
            return Pt.diag.error(`${i.constructor.name} failed: ${s.message}`), Sr.Resource.empty();
          }
        }), n = t.reduce((i, s) => i.merge(s), Sr.Resource.empty());
        return n.waitForAsyncAttributes && n.waitForAsyncAttributes().then(() => {
          fd(t);
        }), n;
      };
      yt.detectResourcesSync = Ig;
      var fd = (r) => {
        r.forEach((e) => {
          if (Object.keys(e.attributes).length > 0) {
            let t = JSON.stringify(e.attributes, null, 4);
            Pt.diag.verbose(t);
          }
        });
      };
    });
    rt = l((re2) => {
      "use strict";
      var Lg = re2 && re2.__createBinding || (Object.create ? function (r, e, t, n) {
        n === void 0 && (n = t), Object.defineProperty(r, n, {
          enumerable: true, get: function () {
            return e[t];
          }
        });
      } : function (r, e, t, n) {
        n === void 0 && (n = t), r[n] = e[t];
      }), nt = re2 && re2.__exportStar || function (r, e) {
        for (var t in r)
          t !== "default" && !Object.prototype.hasOwnProperty.call(e, t) && Lg(e, r, t);
      };
      Object.defineProperty(re2, "__esModule", { value: true });
      nt(Ze(), re2);
      nt(sd(), re2);
      nt(Jo(), re2);
      nt(ad(), re2);
      nt(cd(), re2);
      nt(pd(), re2);
      nt(Ed(), re2);
    });
    md = l((li) => {
      "use strict";
      Object.defineProperty(li, "__esModule", { value: true });
      li.MultiSpanProcessor = void 0;
      var Mg = A(), aa = class {
        constructor(e) {
          this._spanProcessors = e;
        }
        forceFlush() {
          let e = [];
          for (let t of this._spanProcessors)
            e.push(t.forceFlush());
          return new Promise((t) => {
            Promise.all(e).then(() => {
              t();
            }).catch((n) => {
              (0, Mg.globalErrorHandler)(n || new Error("MultiSpanProcessor: forceFlush failed")), t();
            });
          });
        }
        onStart(e, t) {
          for (let n of this._spanProcessors)
            n.onStart(e, t);
        }
        onEnd(e) {
          for (let t of this._spanProcessors)
            t.onEnd(e);
        }
        shutdown() {
          let e = [];
          for (let t of this._spanProcessors)
            e.push(t.shutdown());
          return new Promise((t, n) => {
            Promise.all(e).then(() => {
              t();
            }, n);
          });
        }
      };
      li.MultiSpanProcessor = aa;
    });
    ca = l((di) => {
      "use strict";
      Object.defineProperty(di, "__esModule", { value: true });
      di.NoopSpanProcessor = void 0;
      var ua = class {
        onStart(e, t) {
        }
        onEnd(e) {
        }
        shutdown() {
          return Promise.resolve();
        }
        forceFlush() {
          return Promise.resolve();
        }
      };
      di.NoopSpanProcessor = ua;
    });
    Td = l((it) => {
      "use strict";
      Object.defineProperty(it, "__esModule", { value: true });
      it.BasicTracerProvider = it.ForceFlushState = void 0;
      var vt = (h(), m(d)), Lt = A(), gd = rt(), Ng = la(), Cg = Do(), wg = md(), xg = ca(), Dg = Gn(), Ug = Bo(), It;
      (function (r) {
        r[r.resolved = 0] = "resolved", r[r.timeout = 1] = "timeout", r[r.error = 2] = "error", r[r.unresolved = 3] = "unresolved";
      })(It = it.ForceFlushState || (it.ForceFlushState = {}));
      var Ar = class {
        constructor(e = {}) {
          var t;
          this._registeredSpanProcessors = [], this._tracers = /* @__PURE__ */ new Map();
          let n = (0, Lt.merge)({}, (0, Cg.loadDefaultConfig)(), (0, Ug.reconfigureLimits)(e));
          this.resource = (t = n.resource) !== null && t !== void 0 ? t : gd.Resource.empty(), this.resource = gd.Resource.default().merge(this.resource), this._config = Object.assign({}, n, { resource: this.resource });
          let i = this._buildExporterFromEnv();
          if (i !== void 0) {
            let s = new Dg.BatchSpanProcessor(i);
            this.activeSpanProcessor = s;
          } else
            this.activeSpanProcessor = new xg.NoopSpanProcessor();
        }
        getTracer(e, t, n) {
          let i = `${e}@${t || ""}:${n?.schemaUrl || ""}`;
          return this._tracers.has(i) || this._tracers.set(i, new Ng.Tracer({ name: e, version: t, schemaUrl: n?.schemaUrl }, this._config, this)), this._tracers.get(i);
        }
        addSpanProcessor(e) {
          this._registeredSpanProcessors.length === 0 && this.activeSpanProcessor.shutdown().catch((t) => vt.diag.error("Error while trying to shutdown current span processor", t)), this._registeredSpanProcessors.push(e), this.activeSpanProcessor = new wg.MultiSpanProcessor(this._registeredSpanProcessors);
        }
        getActiveSpanProcessor() {
          return this.activeSpanProcessor;
        }
        register(e = {}) {
          vt.trace.setGlobalTracerProvider(this), e.propagator === void 0 && (e.propagator = this._buildPropagatorFromEnv()), e.contextManager && vt.context.setGlobalContextManager(e.contextManager), e.propagator && vt.propagation.setGlobalPropagator(e.propagator);
        }
        forceFlush() {
          let e = this._config.forceFlushTimeoutMillis, t = this._registeredSpanProcessors.map((n) => new Promise((i) => {
            let s, o = setTimeout(() => {
              i(new Error(`Span processor did not completed within timeout period of ${e} ms`)), s = It.timeout;
            }, e);
            n.forceFlush().then(() => {
              clearTimeout(o), s !== It.timeout && (s = It.resolved, i(s));
            }).catch((a) => {
              clearTimeout(o), s = It.error, i(a);
            });
          }));
          return new Promise((n, i) => {
            Promise.all(t).then((s) => {
              let o = s.filter((a) => a !== It.resolved);
              o.length > 0 ? i(o) : n();
            }).catch((s) => i([s]));
          });
        }
        shutdown() {
          return this.activeSpanProcessor.shutdown();
        }
        _getPropagator(e) {
          var t;
          return (t = this.constructor._registeredPropagators.get(e)) === null || t === void 0 ? void 0 : t();
        }
        _getSpanExporter(e) {
          var t;
          return (t = this.constructor._registeredExporters.get(e)) === null || t === void 0 ? void 0 : t();
        }
        _buildPropagatorFromEnv() {
          let e = Array.from(new Set((0, Lt.getEnv)().OTEL_PROPAGATORS)), n = e.map((i) => {
            let s = this._getPropagator(i);
            return s || vt.diag.warn(`Propagator "${i}" requested through environment variable is unavailable.`), s;
          }).reduce((i, s) => (s && i.push(s), i), []);
          if (n.length !== 0)
            return e.length === 1 ? n[0] : new Lt.CompositePropagator({ propagators: n });
        }
        _buildExporterFromEnv() {
          let e = (0, Lt.getEnv)().OTEL_TRACES_EXPORTER;
          if (e === "none" || e === "")
            return;
          let t = this._getSpanExporter(e);
          return t || vt.diag.error(`Exporter "${e}" requested through environment variable is unavailable.`), t;
        }
      };
      it.BasicTracerProvider = Ar;
      Ar._registeredPropagators = /* @__PURE__ */ new Map([["tracecontext", () => new Lt.W3CTraceContextPropagator()], ["baggage", () => new Lt.W3CBaggagePropagator()]]);
      Ar._registeredExporters = /* @__PURE__ */ new Map();
    });
    Sd = l((_i) => {
      "use strict";
      Object.defineProperty(_i, "__esModule", { value: true });
      _i.ConsoleSpanExporter = void 0;
      var da = A(), _a = class {
        export(e, t) {
          return this._sendSpans(e, t);
        }
        shutdown() {
          return this._sendSpans([]), this.forceFlush();
        }
        forceFlush() {
          return Promise.resolve();
        }
        _exportInfo(e) {
          var t;
          return { traceId: e.spanContext().traceId, parentId: e.parentSpanId, traceState: (t = e.spanContext().traceState) === null || t === void 0 ? void 0 : t.serialize(), name: e.name, id: e.spanContext().spanId, kind: e.kind, timestamp: (0, da.hrTimeToMicroseconds)(e.startTime), duration: (0, da.hrTimeToMicroseconds)(e.duration), attributes: e.attributes, status: e.status, events: e.events, links: e.links };
        }
        _sendSpans(e, t) {
          for (let n of e)
            console.dir(this._exportInfo(n), { depth: 3 });
          if (t)
            return t({ code: da.ExportResultCode.SUCCESS });
        }
      };
      _i.ConsoleSpanExporter = _a;
    });
    Od = l((pi) => {
      "use strict";
      Object.defineProperty(pi, "__esModule", { value: true });
      pi.InMemorySpanExporter = void 0;
      var Ad = A(), pa = class {
        constructor() {
          this._finishedSpans = [], this._stopped = false;
        }
        export(e, t) {
          if (this._stopped)
            return t({ code: Ad.ExportResultCode.FAILED, error: new Error("Exporter has been stopped") });
          this._finishedSpans.push(...e), setTimeout(() => t({ code: Ad.ExportResultCode.SUCCESS }), 0);
        }
        shutdown() {
          return this._stopped = true, this._finishedSpans = [], this.forceFlush();
        }
        forceFlush() {
          return Promise.resolve();
        }
        reset() {
          this._finishedSpans = [];
        }
        getFinishedSpans() {
          return this._finishedSpans;
        }
      };
      pi.InMemorySpanExporter = pa;
    });
    bd = l((Rd) => {
      "use strict";
      Object.defineProperty(Rd, "__esModule", { value: true });
    });
    Pd = l((hi) => {
      "use strict";
      Object.defineProperty(hi, "__esModule", { value: true });
      hi.SimpleSpanProcessor = void 0;
      var Bg = (h(), m(d)), Mt = A(), ha = class {
        constructor(e) {
          this._exporter = e, this._shutdownOnce = new Mt.BindOnceFuture(this._shutdown, this), this._unresolvedExports = /* @__PURE__ */ new Set();
        }
        async forceFlush() {
          await Promise.all(Array.from(this._unresolvedExports)), this._exporter.forceFlush && await this._exporter.forceFlush();
        }
        onStart(e, t) {
        }
        onEnd(e) {
          var t, n;
          if (this._shutdownOnce.isCalled || !(e.spanContext().traceFlags & Bg.TraceFlags.SAMPLED))
            return;
          let i = () => Mt.internal._export(this._exporter, [e]).then((s) => {
            var o;
            s.code !== Mt.ExportResultCode.SUCCESS && (0, Mt.globalErrorHandler)((o = s.error) !== null && o !== void 0 ? o : new Error(`SimpleSpanProcessor: span export failed (status ${s})`));
          }).catch((s) => {
            (0, Mt.globalErrorHandler)(s);
          });
          if (e.resource.asyncAttributesPending) {
            let s = (n = (t = e.resource).waitForAsyncAttributes) === null || n === void 0 ? void 0 : n.call(t).then(() => (s != null && this._unresolvedExports.delete(s), i()), (o) => (0, Mt.globalErrorHandler)(o));
            s != null && this._unresolvedExports.add(s);
          } else
            i();
        }
        shutdown() {
          return this._shutdownOnce.call();
        }
        _shutdown() {
          return this._exporter.shutdown();
        }
      };
      hi.SimpleSpanProcessor = ha;
    });
    vd = l((yd) => {
      "use strict";
      Object.defineProperty(yd, "__esModule", { value: true });
    });
    Ld = l((Id) => {
      "use strict";
      Object.defineProperty(Id, "__esModule", { value: true });
    });
    Nd = l((Md) => {
      "use strict";
      Object.defineProperty(Md, "__esModule", { value: true });
    });
    wd = l((Cd) => {
      "use strict";
      Object.defineProperty(Cd, "__esModule", { value: true });
    });
    Dd = l((xd) => {
      "use strict";
      Object.defineProperty(xd, "__esModule", { value: true });
    });
    la = l((I) => {
      "use strict";
      var qg = I && I.__createBinding || (Object.create ? function (r, e, t, n) {
        n === void 0 && (n = t), Object.defineProperty(r, n, {
          enumerable: true, get: function () {
            return e[t];
          }
        });
      } : function (r, e, t, n) {
        n === void 0 && (n = t), r[n] = e[t];
      }), B = I && I.__exportStar || function (r, e) {
        for (var t in r)
          t !== "default" && !Object.prototype.hasOwnProperty.call(e, t) && qg(e, r, t);
      };
      Object.defineProperty(I, "__esModule", { value: true });
      B(Vl(), I);
      B(Td(), I);
      B(Gn(), I);
      B(Sd(), I);
      B(Od(), I);
      B(bd(), I);
      B(Pd(), I);
      B(vd(), I);
      B(ca(), I);
      B(In(), I);
      B(Mn(), I);
      B(Mo(), I);
      B(Co(), I);
      B(gr(), I);
      B(Po(), I);
      B(Ld(), I);
      B(Nd(), I);
      B(wd(), I);
      B(Dd(), I);
    });
    st = {};
    fa = dc(() => {
      ht(st, $b);
    });
    Bd = l((Ne) => {
      "use strict";
      Object.defineProperty(Ne, "__esModule", { value: true });
      Ne.disableInstrumentations = Ne.enableInstrumentations = Ne.parseInstrumentationOptions = void 0;
      function Ud(r = []) {
        let e = [];
        for (let t = 0, n = r.length; t < n; t++) {
          let i = r[t];
          if (Array.isArray(i)) {
            let s = Ud(i);
            e = e.concat(s.instrumentations);
          } else
            typeof i == "function" ? e.push(new i()) : i.instrumentationName && e.push(i);
        }
        return { instrumentations: e };
      }
      Ne.parseInstrumentationOptions = Ud;
      function Gg(r, e, t) {
        for (let n = 0, i = r.length; n < i; n++) {
          let s = r[n];
          e && s.setTracerProvider(e), t && s.setMeterProvider(t), s.getConfig().enabled || s.enable();
        }
      }
      Ne.enableInstrumentations = Gg;
      function Vg(r) {
        r.forEach((e) => e.disable());
      }
      Ne.disableInstrumentations = Vg;
    });
    Gd = l((fi) => {
      "use strict";
      Object.defineProperty(fi, "__esModule", { value: true });
      fi.registerInstrumentations = void 0;
      var qd = (h(), m(d)), Ea = Bd();
      function Hg(r) {
        let { instrumentations: e } = (0, Ea.parseInstrumentationOptions)(r.instrumentations), t = r.tracerProvider || qd.trace.getTracerProvider(), n = r.meterProvider || qd.metrics.getMeterProvider();
        return (0, Ea.enableInstrumentations)(e, t, n), () => {
          (0, Ea.disableInstrumentations)(e);
        };
      }
      fi.registerInstrumentations = Hg;
    });
    ga = l((mi) => {
      "use strict";
      Object.defineProperty(mi, "__esModule", { value: true });
      mi.LogRecord = void 0;
      var jg = (h(), m(d)), Or = (h(), m(d)), Ei = A(), ma = class {
        constructor(e, t, n) {
          this.attributes = {}, this.totalAttributesCount = 0, this._isReadonly = false;
          let { timestamp: i, observedTimestamp: s, severityNumber: o, severityText: a, body: u, attributes: c = {}, context: _ } = n, p = Date.now();
          if (this.hrTime = (0, Ei.timeInputToHrTime)(i ?? p), this.hrTimeObserved = (0, Ei.timeInputToHrTime)(s ?? p), _) {
            let f = Or.trace.getSpanContext(_);
            f && Or.isSpanContextValid(f) && (this.spanContext = f);
          }
          this.severityNumber = o, this.severityText = a, this.body = u, this.resource = e.resource, this.instrumentationScope = t, this._logRecordLimits = e.logRecordLimits, this.setAttributes(c);
        }
        set severityText(e) {
          this._isLogRecordReadonly() || (this._severityText = e);
        }
        get severityText() {
          return this._severityText;
        }
        set severityNumber(e) {
          this._isLogRecordReadonly() || (this._severityNumber = e);
        }
        get severityNumber() {
          return this._severityNumber;
        }
        set body(e) {
          this._isLogRecordReadonly() || (this._body = e);
        }
        get body() {
          return this._body;
        }
        get droppedAttributesCount() {
          return this.totalAttributesCount - Object.keys(this.attributes).length;
        }
        setAttribute(e, t) {
          return this._isLogRecordReadonly() ? this : t === null ? this : e.length === 0 ? (Or.diag.warn(`Invalid attribute key: ${e}`), this) : !(0, Ei.isAttributeValue)(t) && !(typeof t == "object" && !Array.isArray(t) && Object.keys(t).length > 0) ? (Or.diag.warn(`Invalid attribute value set for key: ${e}`), this) : (this.totalAttributesCount += 1, Object.keys(this.attributes).length >= this._logRecordLimits.attributeCountLimit && !Object.prototype.hasOwnProperty.call(this.attributes, e) ? this : ((0, Ei.isAttributeValue)(t) ? this.attributes[e] = this._truncateToSize(t) : this.attributes[e] = t, this));
        }
        setAttributes(e) {
          for (let [t, n] of Object.entries(e))
            this.setAttribute(t, n);
          return this;
        }
        setBody(e) {
          return this.body = e, this;
        }
        setSeverityNumber(e) {
          return this.severityNumber = e, this;
        }
        setSeverityText(e) {
          return this.severityText = e, this;
        }
        _makeReadonly() {
          this._isReadonly = true;
        }
        _truncateToSize(e) {
          let t = this._logRecordLimits.attributeValueLengthLimit;
          return t <= 0 ? (Or.diag.warn(`Attribute value limit must be positive, got ${t}`), e) : typeof e == "string" ? this._truncateToLimitUtil(e, t) : Array.isArray(e) ? e.map((n) => typeof n == "string" ? this._truncateToLimitUtil(n, t) : n) : e;
        }
        _truncateToLimitUtil(e, t) {
          return e.length <= t ? e : e.substring(0, t);
        }
        _isLogRecordReadonly() {
          return this._isReadonly && jg.diag.warn("Can not execute the operation on emitted log record"), this._isReadonly;
        }
      };
      mi.LogRecord = ma;
    });
    Vd = l((gi) => {
      "use strict";
      Object.defineProperty(gi, "__esModule", { value: true });
      gi.Logger = void 0;
      var Fg = (h(), m(d)), kg = ga(), Ta = class {
        constructor(e, t) {
          this.instrumentationScope = e, this._sharedState = t;
        }
        emit(e) {
          let t = e.context || Fg.context.active(), n = new kg.LogRecord(this._sharedState, this.instrumentationScope, Object.assign({ context: t }, e));
          this._sharedState.activeProcessor.onEmit(n, t), n._makeReadonly();
        }
      };
      gi.Logger = Ta;
    });
    Hd = l((Nt) => {
      "use strict";
      Object.defineProperty(Nt, "__esModule", { value: true });
      Nt.reconfigureLimits = Nt.loadDefaultConfig = void 0;
      var Rr = A();
      function $g() {
        return { forceFlushTimeoutMillis: 3e4, logRecordLimits: { attributeValueLengthLimit: (0, Rr.getEnv)().OTEL_LOGRECORD_ATTRIBUTE_VALUE_LENGTH_LIMIT, attributeCountLimit: (0, Rr.getEnv)().OTEL_LOGRECORD_ATTRIBUTE_COUNT_LIMIT }, includeTraceContext: true };
      }
      Nt.loadDefaultConfig = $g;
      function Xg(r) {
        var e, t, n, i, s, o;
        let a = (0, Rr.getEnvWithoutDefaults)();
        return { attributeCountLimit: (n = (t = (e = r.attributeCountLimit) !== null && e !== void 0 ? e : a.OTEL_LOGRECORD_ATTRIBUTE_COUNT_LIMIT) !== null && t !== void 0 ? t : a.OTEL_ATTRIBUTE_COUNT_LIMIT) !== null && n !== void 0 ? n : Rr.DEFAULT_ATTRIBUTE_COUNT_LIMIT, attributeValueLengthLimit: (o = (s = (i = r.attributeValueLengthLimit) !== null && i !== void 0 ? i : a.OTEL_LOGRECORD_ATTRIBUTE_VALUE_LENGTH_LIMIT) !== null && s !== void 0 ? s : a.OTEL_ATTRIBUTE_VALUE_LENGTH_LIMIT) !== null && o !== void 0 ? o : Rr.DEFAULT_ATTRIBUTE_VALUE_LENGTH_LIMIT };
      }
      Nt.reconfigureLimits = Xg;
    });
    jd = l((Ti) => {
      "use strict";
      Object.defineProperty(Ti, "__esModule", { value: true });
      Ti.MultiLogRecordProcessor = void 0;
      var Wg = A(), Sa = class {
        constructor(e, t) {
          this.processors = e, this.forceFlushTimeoutMillis = t;
        }
        async forceFlush() {
          let e = this.forceFlushTimeoutMillis;
          await Promise.all(this.processors.map((t) => (0, Wg.callWithTimeout)(t.forceFlush(), e)));
        }
        onEmit(e, t) {
          this.processors.forEach((n) => n.onEmit(e, t));
        }
        async shutdown() {
          await Promise.all(this.processors.map((e) => e.shutdown()));
        }
      };
      Ti.MultiLogRecordProcessor = Sa;
    });
    Oa = l((Si) => {
      "use strict";
      Object.defineProperty(Si, "__esModule", { value: true });
      Si.NoopLogRecordProcessor = void 0;
      var Aa = class {
        forceFlush() {
          return Promise.resolve();
        }
        onEmit(e, t) {
        }
        shutdown() {
          return Promise.resolve();
        }
      };
      Si.NoopLogRecordProcessor = Aa;
    });
    Fd = l((Ai) => {
      "use strict";
      Object.defineProperty(Ai, "__esModule", { value: true });
      Ai.LoggerProviderSharedState = void 0;
      var Kg = Oa(), Ra = class {
        constructor(e, t, n) {
          this.resource = e, this.forceFlushTimeoutMillis = t, this.logRecordLimits = n, this.loggers = /* @__PURE__ */ new Map(), this.registeredLogRecordProcessors = [], this.activeProcessor = new Kg.NoopLogRecordProcessor();
        }
      };
      Ai.LoggerProviderSharedState = Ra;
    });
    Xd = l((ot) => {
      "use strict";
      Object.defineProperty(ot, "__esModule", { value: true });
      ot.LoggerProvider = ot.DEFAULT_LOGGER_NAME = void 0;
      var br = (h(), m(d)), zg = (fa(), m(st)), Yg = rt(), kd = A(), Qg = Vd(), $d = Hd(), Zg = jd(), Jg = Fd();
      ot.DEFAULT_LOGGER_NAME = "unknown";
      var ba = class {
        constructor(e = {}) {
          let { resource: t = Yg.Resource.default(), logRecordLimits: n, forceFlushTimeoutMillis: i } = (0, kd.merge)({}, (0, $d.loadDefaultConfig)(), e);
          this._sharedState = new Jg.LoggerProviderSharedState(t, i, (0, $d.reconfigureLimits)(n)), this._shutdownOnce = new kd.BindOnceFuture(this._shutdown, this);
        }
        getLogger(e, t, n) {
          if (this._shutdownOnce.isCalled)
            return br.diag.warn("A shutdown LoggerProvider cannot provide a Logger"), zg.NOOP_LOGGER;
          e || br.diag.warn("Logger requested without instrumentation scope name.");
          let i = e || ot.DEFAULT_LOGGER_NAME, s = `${i}@${t || ""}:${n?.schemaUrl || ""}`;
          return this._sharedState.loggers.has(s) || this._sharedState.loggers.set(s, new Qg.Logger({ name: i, version: t, schemaUrl: n?.schemaUrl }, this._sharedState)), this._sharedState.loggers.get(s);
        }
        addLogRecordProcessor(e) {
          this._sharedState.registeredLogRecordProcessors.length === 0 && this._sharedState.activeProcessor.shutdown().catch((t) => br.diag.error("Error while trying to shutdown current log record processor", t)), this._sharedState.registeredLogRecordProcessors.push(e), this._sharedState.activeProcessor = new Zg.MultiLogRecordProcessor(this._sharedState.registeredLogRecordProcessors, this._sharedState.forceFlushTimeoutMillis);
        }
        forceFlush() {
          return this._shutdownOnce.isCalled ? (br.diag.warn("invalid attempt to force flush after LoggerProvider shutdown"), this._shutdownOnce.promise) : this._sharedState.activeProcessor.forceFlush();
        }
        shutdown() {
          return this._shutdownOnce.isCalled ? (br.diag.warn("shutdown may only be called once per LoggerProvider"), this._shutdownOnce.promise) : this._shutdownOnce.call();
        }
        _shutdown() {
          return this._sharedState.activeProcessor.shutdown();
        }
      };
      ot.LoggerProvider = ba;
    });
    Wd = l((Oi) => {
      "use strict";
      Object.defineProperty(Oi, "__esModule", { value: true });
      Oi.ConsoleLogRecordExporter = void 0;
      var eT = A(), tT = A(), Pa = class {
        export(e, t) {
          this._sendLogRecords(e, t);
        }
        shutdown() {
          return Promise.resolve();
        }
        _exportInfo(e) {
          var t, n, i;
          return { timestamp: (0, eT.hrTimeToMicroseconds)(e.hrTime), traceId: (t = e.spanContext) === null || t === void 0 ? void 0 : t.traceId, spanId: (n = e.spanContext) === null || n === void 0 ? void 0 : n.spanId, traceFlags: (i = e.spanContext) === null || i === void 0 ? void 0 : i.traceFlags, severityText: e.severityText, severityNumber: e.severityNumber, body: e.body, attributes: e.attributes };
        }
        _sendLogRecords(e, t) {
          for (let n of e)
            console.dir(this._exportInfo(n), { depth: 3 });
          t?.({ code: tT.ExportResultCode.SUCCESS });
        }
      };
      Oi.ConsoleLogRecordExporter = Pa;
    });
    Kd = l((Ri) => {
      "use strict";
      Object.defineProperty(Ri, "__esModule", { value: true });
      Ri.SimpleLogRecordProcessor = void 0;
      var ya = A(), va = class {
        constructor(e) {
          this._exporter = e, this._shutdownOnce = new ya.BindOnceFuture(this._shutdown, this);
        }
        onEmit(e) {
          this._shutdownOnce.isCalled || this._exporter.export([e], (t) => {
            var n;
            if (t.code !== ya.ExportResultCode.SUCCESS) {
              (0, ya.globalErrorHandler)((n = t.error) !== null && n !== void 0 ? n : new Error(`SimpleLogRecordProcessor: log record export failed (status ${t})`));
              return;
            }
          });
        }
        forceFlush() {
          return Promise.resolve();
        }
        shutdown() {
          return this._shutdownOnce.call();
        }
        _shutdown() {
          return this._exporter.shutdown();
        }
      };
      Ri.SimpleLogRecordProcessor = va;
    });
    Yd = l((bi) => {
      "use strict";
      Object.defineProperty(bi, "__esModule", { value: true });
      bi.InMemoryLogRecordExporter = void 0;
      var zd = A(), Ia = class {
        constructor() {
          this._finishedLogRecords = [], this._stopped = false;
        }
        export(e, t) {
          if (this._stopped)
            return t({ code: zd.ExportResultCode.FAILED, error: new Error("Exporter has been stopped") });
          this._finishedLogRecords.push(...e), t({ code: zd.ExportResultCode.SUCCESS });
        }
        shutdown() {
          return this._stopped = true, this.reset(), Promise.resolve();
        }
        getFinishedLogRecords() {
          return this._finishedLogRecords;
        }
        reset() {
          this._finishedLogRecords = [];
        }
      };
      bi.InMemoryLogRecordExporter = Ia;
    });
    Qd = l((Pi) => {
      "use strict";
      Object.defineProperty(Pi, "__esModule", { value: true });
      Pi.BatchLogRecordProcessorBase = void 0;
      var rT = (h(), m(d)), Ct = A(), La = class {
        constructor(e, t) {
          var n, i, s, o;
          this._exporter = e, this._finishedLogRecords = [];
          let a = (0, Ct.getEnv)();
          this._maxExportBatchSize = (n = t?.maxExportBatchSize) !== null && n !== void 0 ? n : a.OTEL_BLRP_MAX_EXPORT_BATCH_SIZE, this._maxQueueSize = (i = t?.maxQueueSize) !== null && i !== void 0 ? i : a.OTEL_BLRP_MAX_QUEUE_SIZE, this._scheduledDelayMillis = (s = t?.scheduledDelayMillis) !== null && s !== void 0 ? s : a.OTEL_BLRP_SCHEDULE_DELAY, this._exportTimeoutMillis = (o = t?.exportTimeoutMillis) !== null && o !== void 0 ? o : a.OTEL_BLRP_EXPORT_TIMEOUT, this._shutdownOnce = new Ct.BindOnceFuture(this._shutdown, this), this._maxExportBatchSize > this._maxQueueSize && (rT.diag.warn("BatchLogRecordProcessor: maxExportBatchSize must be smaller or equal to maxQueueSize, setting maxExportBatchSize to match maxQueueSize"), this._maxExportBatchSize = this._maxQueueSize);
        }
        onEmit(e) {
          this._shutdownOnce.isCalled || this._addToBuffer(e);
        }
        forceFlush() {
          return this._shutdownOnce.isCalled ? this._shutdownOnce.promise : this._flushAll();
        }
        shutdown() {
          return this._shutdownOnce.call();
        }
        async _shutdown() {
          this.onShutdown(), await this._flushAll(), await this._exporter.shutdown();
        }
        _addToBuffer(e) {
          this._finishedLogRecords.length >= this._maxQueueSize || (this._finishedLogRecords.push(e), this._maybeStartTimer());
        }
        _flushAll() {
          return new Promise((e, t) => {
            let n = [], i = Math.ceil(this._finishedLogRecords.length / this._maxExportBatchSize);
            for (let s = 0; s < i; s++)
              n.push(this._flushOneBatch());
            Promise.all(n).then(() => {
              e();
            }).catch(t);
          });
        }
        _flushOneBatch() {
          return this._clearTimer(), this._finishedLogRecords.length === 0 ? Promise.resolve() : new Promise((e, t) => {
            (0, Ct.callWithTimeout)(this._export(this._finishedLogRecords.splice(0, this._maxExportBatchSize)), this._exportTimeoutMillis).then(() => e()).catch(t);
          });
        }
        _maybeStartTimer() {
          this._timer === void 0 && (this._timer = setTimeout(() => {
            this._flushOneBatch().then(() => {
              this._finishedLogRecords.length > 0 && (this._clearTimer(), this._maybeStartTimer());
            }).catch((e) => {
              (0, Ct.globalErrorHandler)(e);
            });
          }, this._scheduledDelayMillis), (0, Ct.unrefTimer)(this._timer));
        }
        _clearTimer() {
          this._timer !== void 0 && (clearTimeout(this._timer), this._timer = void 0);
        }
        _export(e) {
          return new Promise((t, n) => {
            this._exporter.export(e, (i) => {
              var s;
              if (i.code !== Ct.ExportResultCode.SUCCESS) {
                n((s = i.error) !== null && s !== void 0 ? s : new Error(`BatchLogRecordProcessorBase: log record export failed (status ${i})`));
                return;
              }
              t(i);
            });
          });
        }
      };
      Pi.BatchLogRecordProcessorBase = La;
    });
    Zd = l((yi) => {
      "use strict";
      Object.defineProperty(yi, "__esModule", { value: true });
      yi.BatchLogRecordProcessor = void 0;
      var nT = Qd(), Ma = class extends nT.BatchLogRecordProcessorBase {
        onShutdown() {
        }
      };
      yi.BatchLogRecordProcessor = Ma;
    });
    Jd = l((vi) => {
      "use strict";
      Object.defineProperty(vi, "__esModule", { value: true });
      vi.BatchLogRecordProcessor = void 0;
      var iT = Zd();
      Object.defineProperty(vi, "BatchLogRecordProcessor", {
        enumerable: true, get: function () {
          return iT.BatchLogRecordProcessor;
        }
      });
    });
    e_ = l((Ii) => {
      "use strict";
      Object.defineProperty(Ii, "__esModule", { value: true });
      Ii.BatchLogRecordProcessor = void 0;
      var sT = Jd();
      Object.defineProperty(Ii, "BatchLogRecordProcessor", {
        enumerable: true, get: function () {
          return sT.BatchLogRecordProcessor;
        }
      });
    });
    t_ = l((W) => {
      "use strict";
      Object.defineProperty(W, "__esModule", { value: true });
      W.BatchLogRecordProcessor = W.InMemoryLogRecordExporter = W.SimpleLogRecordProcessor = W.ConsoleLogRecordExporter = W.NoopLogRecordProcessor = W.LogRecord = W.LoggerProvider = void 0;
      var oT = Xd();
      Object.defineProperty(W, "LoggerProvider", {
        enumerable: true, get: function () {
          return oT.LoggerProvider;
        }
      });
      var aT = ga();
      Object.defineProperty(W, "LogRecord", {
        enumerable: true, get: function () {
          return aT.LogRecord;
        }
      });
      var uT = Oa();
      Object.defineProperty(W, "NoopLogRecordProcessor", {
        enumerable: true, get: function () {
          return uT.NoopLogRecordProcessor;
        }
      });
      var cT = Wd();
      Object.defineProperty(W, "ConsoleLogRecordExporter", {
        enumerable: true, get: function () {
          return cT.ConsoleLogRecordExporter;
        }
      });
      var lT = Kd();
      Object.defineProperty(W, "SimpleLogRecordProcessor", {
        enumerable: true, get: function () {
          return lT.SimpleLogRecordProcessor;
        }
      });
      var dT = Yd();
      Object.defineProperty(W, "InMemoryLogRecordExporter", {
        enumerable: true, get: function () {
          return dT.InMemoryLogRecordExporter;
        }
      });
      var _T = e_();
      Object.defineProperty(W, "BatchLogRecordProcessor", {
        enumerable: true, get: function () {
          return _T.BatchLogRecordProcessor;
        }
      });
    });
    Li = l((Pr) => {
      "use strict";
      Object.defineProperty(Pr, "__esModule", { value: true });
      Pr.AggregationTemporality = void 0;
      var pT;
      (function (r) {
        r[r.DELTA = 0] = "DELTA", r[r.CUMULATIVE = 1] = "CUMULATIVE";
      })(pT = Pr.AggregationTemporality || (Pr.AggregationTemporality = {}));
    });
    wt = l((yr) => {
      "use strict";
      Object.defineProperty(yr, "__esModule", { value: true });
      yr.DataPointType = void 0;
      var hT;
      (function (r) {
        r[r.HISTOGRAM = 0] = "HISTOGRAM", r[r.EXPONENTIAL_HISTOGRAM = 1] = "EXPONENTIAL_HISTOGRAM", r[r.GAUGE = 2] = "GAUGE", r[r.SUM = 3] = "SUM";
      })(hT = yr.DataPointType || (yr.DataPointType = {}));
    });
    fe = l((M) => {
      "use strict";
      Object.defineProperty(M, "__esModule", { value: true });
      M.equalsCaseInsensitive = M.binarySearchLB = M.setEquals = M.FlatMap = M.isPromiseAllSettledRejectionResult = M.PromiseAllSettled = M.callWithTimeout = M.TimeoutError = M.instrumentationScopeId = M.hashAttributes = M.isNotNullish = void 0;
      function fT(r) {
        return r != null;
      }
      M.isNotNullish = fT;
      function ET(r) {
        let e = Object.keys(r);
        return e.length === 0 ? "" : (e = e.sort(), JSON.stringify(e.map((t) => [t, r[t]])));
      }
      M.hashAttributes = ET;
      function mT(r) {
        var e, t;
        return `${r.name}:${(e = r.version) !== null && e !== void 0 ? e : ""}:${(t = r.schemaUrl) !== null && t !== void 0 ? t : ""}`;
      }
      M.instrumentationScopeId = mT;
      var Mi = class r extends Error {
        constructor(e) {
          super(e), Object.setPrototypeOf(this, r.prototype);
        }
      };
      M.TimeoutError = Mi;
      function gT(r, e) {
        let t, n = new Promise(function (s, o) {
          t = setTimeout(function () {
            o(new Mi("Operation timed out."));
          }, e);
        });
        return Promise.race([r, n]).then((i) => (clearTimeout(t), i), (i) => {
          throw clearTimeout(t), i;
        });
      }
      M.callWithTimeout = gT;
      async function TT(r) {
        return Promise.all(r.map(async (e) => {
          try {
            return { status: "fulfilled", value: await e };
          } catch (t) {
            return { status: "rejected", reason: t };
          }
        }));
      }
      M.PromiseAllSettled = TT;
      function ST(r) {
        return r.status === "rejected";
      }
      M.isPromiseAllSettledRejectionResult = ST;
      function AT(r, e) {
        let t = [];
        return r.forEach((n) => {
          t.push(...e(n));
        }), t;
      }
      M.FlatMap = AT;
      function OT(r, e) {
        if (r.size !== e.size)
          return false;
        for (let t of r)
          if (!e.has(t))
            return false;
        return true;
      }
      M.setEquals = OT;
      function RT(r, e) {
        let t = 0, n = r.length - 1;
        for (; n - t > 1;) {
          let i = Math.trunc((n + t) / 2);
          r[i] <= e ? t = i : n = i - 1;
        }
        return r[n] <= e ? n : r[t] <= e ? t : -1;
      }
      M.binarySearchLB = RT;
      function bT(r, e) {
        return r.toLowerCase() === e.toLowerCase();
      }
      M.equalsCaseInsensitive = bT;
    });
    xt = l((vr) => {
      "use strict";
      Object.defineProperty(vr, "__esModule", { value: true });
      vr.AggregatorKind = void 0;
      var PT;
      (function (r) {
        r[r.DROP = 0] = "DROP", r[r.SUM = 1] = "SUM", r[r.LAST_VALUE = 2] = "LAST_VALUE", r[r.HISTOGRAM = 3] = "HISTOGRAM", r[r.EXPONENTIAL_HISTOGRAM = 4] = "EXPONENTIAL_HISTOGRAM";
      })(PT = vr.AggregatorKind || (vr.AggregatorKind = {}));
    });
    r_ = l((Ni) => {
      "use strict";
      Object.defineProperty(Ni, "__esModule", { value: true });
      Ni.DropAggregator = void 0;
      var yT = xt(), Na = class {
        constructor() {
          this.kind = yT.AggregatorKind.DROP;
        }
        createAccumulation() {
        }
        merge(e, t) {
        }
        diff(e, t) {
        }
        toMetricData(e, t, n, i) {
        }
      };
      Ni.DropAggregator = Na;
    });
    be = l((ne) => {
      "use strict";
      Object.defineProperty(ne, "__esModule", { value: true });
      ne.isValidName = ne.isDescriptorCompatibleWith = ne.createInstrumentDescriptorWithView = ne.createInstrumentDescriptor = ne.InstrumentType = void 0;
      var n_ = (h(), m(d)), vT = fe(), IT;
      (function (r) {
        r.COUNTER = "COUNTER", r.HISTOGRAM = "HISTOGRAM", r.UP_DOWN_COUNTER = "UP_DOWN_COUNTER", r.OBSERVABLE_COUNTER = "OBSERVABLE_COUNTER", r.OBSERVABLE_GAUGE = "OBSERVABLE_GAUGE", r.OBSERVABLE_UP_DOWN_COUNTER = "OBSERVABLE_UP_DOWN_COUNTER";
      })(IT = ne.InstrumentType || (ne.InstrumentType = {}));
      function LT(r, e, t) {
        var n, i, s, o;
        return i_(r) || n_.diag.warn(`Invalid metric name: "${r}". The metric name should be a ASCII string with a length no greater than 255 characters.`), { name: r, type: e, description: (n = t?.description) !== null && n !== void 0 ? n : "", unit: (i = t?.unit) !== null && i !== void 0 ? i : "", valueType: (s = t?.valueType) !== null && s !== void 0 ? s : n_.ValueType.DOUBLE, advice: (o = t?.advice) !== null && o !== void 0 ? o : {} };
      }
      ne.createInstrumentDescriptor = LT;
      function MT(r, e) {
        var t, n;
        return { name: (t = r.name) !== null && t !== void 0 ? t : e.name, description: (n = r.description) !== null && n !== void 0 ? n : e.description, type: e.type, unit: e.unit, valueType: e.valueType, advice: e.advice };
      }
      ne.createInstrumentDescriptorWithView = MT;
      function NT(r, e) {
        return (0, vT.equalsCaseInsensitive)(r.name, e.name) && r.unit === e.unit && r.type === e.type && r.valueType === e.valueType;
      }
      ne.isDescriptorCompatibleWith = NT;
      var CT = /^[a-z][a-z0-9_.\-/]{0,254}$/i;
      function i_(r) {
        return r.match(CT) != null;
      }
      ne.isValidName = i_;
    });
    s_ = l((Ut) => {
      "use strict";
      Object.defineProperty(Ut, "__esModule", { value: true });
      Ut.HistogramAggregator = Ut.HistogramAccumulation = void 0;
      var wT = xt(), xT = wt(), Ca = be(), DT = fe();
      function UT(r) {
        let e = r.map(() => 0);
        return e.push(0), { buckets: { boundaries: r, counts: e }, sum: 0, count: 0, hasMinMax: false, min: 1 / 0, max: -1 / 0 };
      }
      var Dt = class {
        constructor(e, t, n = true, i = UT(t)) {
          this.startTime = e, this._boundaries = t, this._recordMinMax = n, this._current = i;
        }
        record(e) {
          this._current.count += 1, this._current.sum += e, this._recordMinMax && (this._current.min = Math.min(e, this._current.min), this._current.max = Math.max(e, this._current.max), this._current.hasMinMax = true);
          let t = (0, DT.binarySearchLB)(this._boundaries, e);
          this._current.buckets.counts[t + 1] += 1;
        }
        setStartTime(e) {
          this.startTime = e;
        }
        toPointValue() {
          return this._current;
        }
      };
      Ut.HistogramAccumulation = Dt;
      var wa = class {
        constructor(e, t) {
          this._boundaries = e, this._recordMinMax = t, this.kind = wT.AggregatorKind.HISTOGRAM;
        }
        createAccumulation(e) {
          return new Dt(e, this._boundaries, this._recordMinMax);
        }
        merge(e, t) {
          let n = e.toPointValue(), i = t.toPointValue(), s = n.buckets.counts, o = i.buckets.counts, a = new Array(s.length);
          for (let _ = 0; _ < s.length; _++)
            a[_] = s[_] + o[_];
          let u = 1 / 0, c = -1 / 0;
          return this._recordMinMax && (n.hasMinMax && i.hasMinMax ? (u = Math.min(n.min, i.min), c = Math.max(n.max, i.max)) : n.hasMinMax ? (u = n.min, c = n.max) : i.hasMinMax && (u = i.min, c = i.max)), new Dt(e.startTime, n.buckets.boundaries, this._recordMinMax, { buckets: { boundaries: n.buckets.boundaries, counts: a }, count: n.count + i.count, sum: n.sum + i.sum, hasMinMax: this._recordMinMax && (n.hasMinMax || i.hasMinMax), min: u, max: c });
        }
        diff(e, t) {
          let n = e.toPointValue(), i = t.toPointValue(), s = n.buckets.counts, o = i.buckets.counts, a = new Array(s.length);
          for (let u = 0; u < s.length; u++)
            a[u] = o[u] - s[u];
          return new Dt(t.startTime, n.buckets.boundaries, this._recordMinMax, { buckets: { boundaries: n.buckets.boundaries, counts: a }, count: i.count - n.count, sum: i.sum - n.sum, hasMinMax: false, min: 1 / 0, max: -1 / 0 });
        }
        toMetricData(e, t, n, i) {
          return {
            descriptor: e, aggregationTemporality: t, dataPointType: xT.DataPointType.HISTOGRAM, dataPoints: n.map(([s, o]) => {
              let a = o.toPointValue(), u = e.type === Ca.InstrumentType.UP_DOWN_COUNTER || e.type === Ca.InstrumentType.OBSERVABLE_GAUGE || e.type === Ca.InstrumentType.OBSERVABLE_UP_DOWN_COUNTER;
              return { attributes: s, startTime: o.startTime, endTime: i, value: { min: a.hasMinMax ? a.min : void 0, max: a.hasMinMax ? a.max : void 0, sum: u ? void 0 : a.sum, buckets: a.buckets, count: a.count } };
            })
          };
        }
      };
      Ut.HistogramAggregator = wa;
    });
    o_ = l((Ci) => {
      "use strict";
      Object.defineProperty(Ci, "__esModule", { value: true });
      Ci.Buckets = void 0;
      var xa = class r {
        constructor(e = new Da(), t = 0, n = 0, i = 0) {
          this.backing = e, this.indexBase = t, this.indexStart = n, this.indexEnd = i;
        }
        get offset() {
          return this.indexStart;
        }
        get length() {
          return this.backing.length === 0 || this.indexEnd === this.indexStart && this.at(0) === 0 ? 0 : this.indexEnd - this.indexStart + 1;
        }
        counts() {
          return Array.from({ length: this.length }, (e, t) => this.at(t));
        }
        at(e) {
          let t = this.indexBase - this.indexStart;
          return e < t && (e += this.backing.length), e -= t, this.backing.countAt(e);
        }
        incrementBucket(e, t) {
          this.backing.increment(e, t);
        }
        decrementBucket(e, t) {
          this.backing.decrement(e, t);
        }
        trim() {
          for (let e = 0; e < this.length; e++)
            if (this.at(e) !== 0) {
              this.indexStart += e;
              break;
            } else if (e === this.length - 1) {
              this.indexStart = this.indexEnd = this.indexBase = 0;
              return;
            }
          for (let e = this.length - 1; e >= 0; e--)
            if (this.at(e) !== 0) {
              this.indexEnd -= this.length - e - 1;
              break;
            }
          this._rotate();
        }
        downscale(e) {
          this._rotate();
          let t = 1 + this.indexEnd - this.indexStart, n = 1 << e, i = 0, s = 0;
          for (let o = this.indexStart; o <= this.indexEnd;) {
            let a = o % n;
            a < 0 && (a += n);
            for (let u = a; u < n && i < t; u++)
              this._relocateBucket(s, i), i++, o++;
            s++;
          }
          this.indexStart >>= e, this.indexEnd >>= e, this.indexBase = this.indexStart;
        }
        clone() {
          return new r(this.backing.clone(), this.indexBase, this.indexStart, this.indexEnd);
        }
        _rotate() {
          let e = this.indexBase - this.indexStart;
          e !== 0 && (e > 0 ? (this.backing.reverse(0, this.backing.length), this.backing.reverse(0, e), this.backing.reverse(e, this.backing.length)) : (this.backing.reverse(0, this.backing.length), this.backing.reverse(0, this.backing.length + e)), this.indexBase = this.indexStart);
        }
        _relocateBucket(e, t) {
          e !== t && this.incrementBucket(e, this.backing.emptyBucket(t));
        }
      };
      Ci.Buckets = xa;
      var Da = class r {
        constructor(e = [0]) {
          this._counts = e;
        }
        get length() {
          return this._counts.length;
        }
        countAt(e) {
          return this._counts[e];
        }
        growTo(e, t, n) {
          let i = new Array(e).fill(0);
          i.splice(n, this._counts.length - t, ...this._counts.slice(t)), i.splice(0, t, ...this._counts.slice(0, t)), this._counts = i;
        }
        reverse(e, t) {
          let n = Math.floor((e + t) / 2) - e;
          for (let i = 0; i < n; i++) {
            let s = this._counts[e + i];
            this._counts[e + i] = this._counts[t - i - 1], this._counts[t - i - 1] = s;
          }
        }
        emptyBucket(e) {
          let t = this._counts[e];
          return this._counts[e] = 0, t;
        }
        increment(e, t) {
          this._counts[e] += t;
        }
        decrement(e, t) {
          this._counts[e] >= t ? this._counts[e] -= t : this._counts[e] = 0;
        }
        clone() {
          return new r([...this._counts]);
        }
      };
    });
    Ba = l((Q) => {
      "use strict";
      Object.defineProperty(Q, "__esModule", { value: true });
      Q.getSignificand = Q.getNormalBase2 = Q.MIN_VALUE = Q.MAX_NORMAL_EXPONENT = Q.MIN_NORMAL_EXPONENT = Q.SIGNIFICAND_WIDTH = void 0;
      Q.SIGNIFICAND_WIDTH = 52;
      var BT = 2146435072, qT = 1048575, Ua = 1023;
      Q.MIN_NORMAL_EXPONENT = -Ua + 1;
      Q.MAX_NORMAL_EXPONENT = Ua;
      Q.MIN_VALUE = Math.pow(2, -1022);
      function GT(r) {
        let e = new DataView(new ArrayBuffer(8));
        return e.setFloat64(0, r), ((e.getUint32(0) & BT) >> 20) - Ua;
      }
      Q.getNormalBase2 = GT;
      function VT(r) {
        let e = new DataView(new ArrayBuffer(8));
        e.setFloat64(0, r);
        let t = e.getUint32(0), n = e.getUint32(4);
        return (t & qT) * Math.pow(2, 32) + n;
      }
      Q.getSignificand = VT;
    });
    wi = l((Bt) => {
      "use strict";
      Object.defineProperty(Bt, "__esModule", { value: true });
      Bt.nextGreaterSquare = Bt.ldexp = void 0;
      function HT(r, e) {
        return r === 0 || r === Number.POSITIVE_INFINITY || r === Number.NEGATIVE_INFINITY || Number.isNaN(r) ? r : r * Math.pow(2, e);
      }
      Bt.ldexp = HT;
      function jT(r) {
        return r--, r |= r >> 1, r |= r >> 2, r |= r >> 4, r |= r >> 8, r |= r >> 16, r++, r;
      }
      Bt.nextGreaterSquare = jT;
    });
    Di = l((xi) => {
      "use strict";
      Object.defineProperty(xi, "__esModule", { value: true });
      xi.MappingError = void 0;
      var qa = class extends Error {
      };
      xi.MappingError = qa;
    });
    u_ = l((Ui) => {
      "use strict";
      Object.defineProperty(Ui, "__esModule", { value: true });
      Ui.ExponentMapping = void 0;
      var qt = Ba(), FT = wi(), a_ = Di(), Ga = class {
        constructor(e) {
          this._shift = -e;
        }
        mapToIndex(e) {
          if (e < qt.MIN_VALUE)
            return this._minNormalLowerBoundaryIndex();
          let t = qt.getNormalBase2(e), n = this._rightShift(qt.getSignificand(e) - 1, qt.SIGNIFICAND_WIDTH);
          return t + n >> this._shift;
        }
        lowerBoundary(e) {
          let t = this._minNormalLowerBoundaryIndex();
          if (e < t)
            throw new a_.MappingError(`underflow: ${e} is < minimum lower boundary: ${t}`);
          let n = this._maxNormalLowerBoundaryIndex();
          if (e > n)
            throw new a_.MappingError(`overflow: ${e} is > maximum lower boundary: ${n}`);
          return FT.ldexp(1, e << this._shift);
        }
        get scale() {
          return this._shift === 0 ? 0 : -this._shift;
        }
        _minNormalLowerBoundaryIndex() {
          let e = qt.MIN_NORMAL_EXPONENT >> this._shift;
          return this._shift < 2 && e--, e;
        }
        _maxNormalLowerBoundaryIndex() {
          return qt.MAX_NORMAL_EXPONENT >> this._shift;
        }
        _rightShift(e, t) {
          return Math.floor(e * Math.pow(2, -t));
        }
      };
      Ui.ExponentMapping = Ga;
    });
    d_ = l((Bi) => {
      "use strict";
      Object.defineProperty(Bi, "__esModule", { value: true });
      Bi.LogarithmMapping = void 0;
      var Gt = Ba(), c_ = wi(), l_ = Di(), Va = class {
        constructor(e) {
          this._scale = e, this._scaleFactor = c_.ldexp(Math.LOG2E, e), this._inverseFactor = c_.ldexp(Math.LN2, -e);
        }
        mapToIndex(e) {
          if (e <= Gt.MIN_VALUE)
            return this._minNormalLowerBoundaryIndex() - 1;
          if (Gt.getSignificand(e) === 0)
            return (Gt.getNormalBase2(e) << this._scale) - 1;
          let t = Math.floor(Math.log(e) * this._scaleFactor), n = this._maxNormalLowerBoundaryIndex();
          return t >= n ? n : t;
        }
        lowerBoundary(e) {
          let t = this._maxNormalLowerBoundaryIndex();
          if (e >= t) {
            if (e === t)
              return 2 * Math.exp((e - (1 << this._scale)) / this._scaleFactor);
            throw new l_.MappingError(`overflow: ${e} is > maximum lower boundary: ${t}`);
          }
          let n = this._minNormalLowerBoundaryIndex();
          if (e <= n) {
            if (e === n)
              return Gt.MIN_VALUE;
            if (e === n - 1)
              return Math.exp((e + (1 << this._scale)) / this._scaleFactor) / 2;
            throw new l_.MappingError(`overflow: ${e} is < minimum lower boundary: ${n}`);
          }
          return Math.exp(e * this._inverseFactor);
        }
        get scale() {
          return this._scale;
        }
        _minNormalLowerBoundaryIndex() {
          return Gt.MIN_NORMAL_EXPONENT << this._scale;
        }
        _maxNormalLowerBoundaryIndex() {
          return (Gt.MAX_NORMAL_EXPONENT + 1 << this._scale) - 1;
        }
      };
      Bi.LogarithmMapping = Va;
    });
    h_ = l((qi) => {
      "use strict";
      Object.defineProperty(qi, "__esModule", { value: true });
      qi.getMapping = void 0;
      var kT = u_(), $T = d_(), XT = Di(), __ = -10, p_ = 20, WT = Array.from({ length: 31 }, (r, e) => e > 10 ? new $T.LogarithmMapping(e - 10) : new kT.ExponentMapping(e - 10));
      function KT(r) {
        if (r > p_ || r < __)
          throw new XT.MappingError(`expected scale >= ${__} && <= ${p_}, got: ${r}`);
        return WT[r + 10];
      }
      qi.getMapping = KT;
    });
    m_ = l((Ht) => {
      "use strict";
      Object.defineProperty(Ht, "__esModule", { value: true });
      Ht.ExponentialHistogramAggregator = Ht.ExponentialHistogramAccumulation = void 0;
      var zT = xt(), YT = wt(), QT = (h(), m(d)), Ha = be(), f_ = o_(), E_ = h_(), ZT = wi(), Vt = class r {
        constructor(e, t) {
          this.low = e, this.high = t;
        }
        static combine(e, t) {
          return new r(Math.min(e.low, t.low), Math.max(e.high, t.high));
        }
      }, JT = 20, eS = 160, ja = 2, Gi = class r {
        constructor(e = e, t = eS, n = true, i = 0, s = 0, o = 0, a = Number.POSITIVE_INFINITY, u = Number.NEGATIVE_INFINITY, c = new f_.Buckets(), _ = new f_.Buckets(), p = (0, E_.getMapping)(JT)) {
          this.startTime = e, this._maxSize = t, this._recordMinMax = n, this._sum = i, this._count = s, this._zeroCount = o, this._min = a, this._max = u, this._positive = c, this._negative = _, this._mapping = p, this._maxSize < ja && (QT.diag.warn(`Exponential Histogram Max Size set to ${this._maxSize},                 changing to the minimum size of: ${ja}`), this._maxSize = ja);
        }
        record(e) {
          this.updateByIncrement(e, 1);
        }
        setStartTime(e) {
          this.startTime = e;
        }
        toPointValue() {
          return { hasMinMax: this._recordMinMax, min: this.min, max: this.max, sum: this.sum, positive: { offset: this.positive.offset, bucketCounts: this.positive.counts() }, negative: { offset: this.negative.offset, bucketCounts: this.negative.counts() }, count: this.count, scale: this.scale, zeroCount: this.zeroCount };
        }
        get sum() {
          return this._sum;
        }
        get min() {
          return this._min;
        }
        get max() {
          return this._max;
        }
        get count() {
          return this._count;
        }
        get zeroCount() {
          return this._zeroCount;
        }
        get scale() {
          return this._count === this._zeroCount ? 0 : this._mapping.scale;
        }
        get positive() {
          return this._positive;
        }
        get negative() {
          return this._negative;
        }
        updateByIncrement(e, t) {
          if (e > this._max && (this._max = e), e < this._min && (this._min = e), this._count += t, e === 0) {
            this._zeroCount += t;
            return;
          }
          this._sum += e * t, e > 0 ? this._updateBuckets(this._positive, e, t) : this._updateBuckets(this._negative, -e, t);
        }
        merge(e) {
          this._count === 0 ? (this._min = e.min, this._max = e.max) : e.count !== 0 && (e.min < this.min && (this._min = e.min), e.max > this.max && (this._max = e.max)), this.startTime = e.startTime, this._sum += e.sum, this._count += e.count, this._zeroCount += e.zeroCount;
          let t = this._minScale(e);
          this._downscale(this.scale - t), this._mergeBuckets(this.positive, e, e.positive, t), this._mergeBuckets(this.negative, e, e.negative, t);
        }
        diff(e) {
          this._min = 1 / 0, this._max = -1 / 0, this._sum -= e.sum, this._count -= e.count, this._zeroCount -= e.zeroCount;
          let t = this._minScale(e);
          this._downscale(this.scale - t), this._diffBuckets(this.positive, e, e.positive, t), this._diffBuckets(this.negative, e, e.negative, t);
        }
        clone() {
          return new r(this.startTime, this._maxSize, this._recordMinMax, this._sum, this._count, this._zeroCount, this._min, this._max, this.positive.clone(), this.negative.clone(), this._mapping);
        }
        _updateBuckets(e, t, n) {
          let i = this._mapping.mapToIndex(t), s = false, o = 0, a = 0;
          if (e.length === 0 ? (e.indexStart = i, e.indexEnd = e.indexStart, e.indexBase = e.indexStart) : i < e.indexStart && e.indexEnd - i >= this._maxSize ? (s = true, a = i, o = e.indexEnd) : i > e.indexEnd && i - e.indexStart >= this._maxSize && (s = true, a = e.indexStart, o = i), s) {
            let u = this._changeScale(o, a);
            this._downscale(u), i = this._mapping.mapToIndex(t);
          }
          this._incrementIndexBy(e, i, n);
        }
        _incrementIndexBy(e, t, n) {
          if (n === 0)
            return;
          if (t < e.indexStart) {
            let s = e.indexEnd - t;
            s >= e.backing.length && this._grow(e, s + 1), e.indexStart = t;
          } else if (t > e.indexEnd) {
            let s = t - e.indexStart;
            s >= e.backing.length && this._grow(e, s + 1), e.indexEnd = t;
          }
          let i = t - e.indexBase;
          i < 0 && (i += e.backing.length), e.incrementBucket(i, n);
        }
        _grow(e, t) {
          let n = e.backing.length, i = e.indexBase - e.indexStart, s = n - i, o = (0, ZT.nextGreaterSquare)(t);
          o > this._maxSize && (o = this._maxSize);
          let a = o - i;
          e.backing.growTo(o, s, a);
        }
        _changeScale(e, t) {
          let n = 0;
          for (; e - t >= this._maxSize;)
            e >>= 1, t >>= 1, n++;
          return n;
        }
        _downscale(e) {
          if (e === 0)
            return;
          if (e < 0)
            throw new Error(`impossible change of scale: ${this.scale}`);
          let t = this._mapping.scale - e;
          this._positive.downscale(e), this._negative.downscale(e), this._mapping = (0, E_.getMapping)(t);
        }
        _minScale(e) {
          let t = Math.min(this.scale, e.scale), n = Vt.combine(this._highLowAtScale(this.positive, this.scale, t), this._highLowAtScale(e.positive, e.scale, t)), i = Vt.combine(this._highLowAtScale(this.negative, this.scale, t), this._highLowAtScale(e.negative, e.scale, t));
          return Math.min(t - this._changeScale(n.high, n.low), t - this._changeScale(i.high, i.low));
        }
        _highLowAtScale(e, t, n) {
          if (e.length === 0)
            return new Vt(0, -1);
          let i = t - n;
          return new Vt(e.indexStart >> i, e.indexEnd >> i);
        }
        _mergeBuckets(e, t, n, i) {
          let s = n.offset, o = t.scale - i;
          for (let a = 0; a < n.length; a++)
            this._incrementIndexBy(e, s + a >> o, n.at(a));
        }
        _diffBuckets(e, t, n, i) {
          let s = n.offset, o = t.scale - i;
          for (let a = 0; a < n.length; a++) {
            let c = (s + a >> o) - e.indexBase;
            c < 0 && (c += e.backing.length), e.decrementBucket(c, n.at(a));
          }
          e.trim();
        }
      };
      Ht.ExponentialHistogramAccumulation = Gi;
      var Fa = class {
        constructor(e, t) {
          this._maxSize = e, this._recordMinMax = t, this.kind = zT.AggregatorKind.EXPONENTIAL_HISTOGRAM;
        }
        createAccumulation(e) {
          return new Gi(e, this._maxSize, this._recordMinMax);
        }
        merge(e, t) {
          let n = t.clone();
          return n.merge(e), n;
        }
        diff(e, t) {
          let n = t.clone();
          return n.diff(e), n;
        }
        toMetricData(e, t, n, i) {
          return {
            descriptor: e, aggregationTemporality: t, dataPointType: YT.DataPointType.EXPONENTIAL_HISTOGRAM, dataPoints: n.map(([s, o]) => {
              let a = o.toPointValue(), u = e.type === Ha.InstrumentType.UP_DOWN_COUNTER || e.type === Ha.InstrumentType.OBSERVABLE_GAUGE || e.type === Ha.InstrumentType.OBSERVABLE_UP_DOWN_COUNTER;
              return { attributes: s, startTime: o.startTime, endTime: i, value: { min: a.hasMinMax ? a.min : void 0, max: a.hasMinMax ? a.max : void 0, sum: u ? void 0 : a.sum, positive: { offset: a.positive.offset, bucketCounts: a.positive.bucketCounts }, negative: { offset: a.negative.offset, bucketCounts: a.negative.bucketCounts }, count: a.count, scale: a.scale, zeroCount: a.zeroCount } };
            })
          };
        }
      };
      Ht.ExponentialHistogramAggregator = Fa;
    });
    g_ = l((Ft) => {
      "use strict";
      Object.defineProperty(Ft, "__esModule", { value: true });
      Ft.LastValueAggregator = Ft.LastValueAccumulation = void 0;
      var tS = xt(), Ir = A(), rS = wt(), jt = class {
        constructor(e, t = 0, n = [0, 0]) {
          this.startTime = e, this._current = t, this.sampleTime = n;
        }
        record(e) {
          this._current = e, this.sampleTime = (0, Ir.millisToHrTime)(Date.now());
        }
        setStartTime(e) {
          this.startTime = e;
        }
        toPointValue() {
          return this._current;
        }
      };
      Ft.LastValueAccumulation = jt;
      var ka = class {
        constructor() {
          this.kind = tS.AggregatorKind.LAST_VALUE;
        }
        createAccumulation(e) {
          return new jt(e);
        }
        merge(e, t) {
          let n = (0, Ir.hrTimeToMicroseconds)(t.sampleTime) >= (0, Ir.hrTimeToMicroseconds)(e.sampleTime) ? t : e;
          return new jt(e.startTime, n.toPointValue(), n.sampleTime);
        }
        diff(e, t) {
          let n = (0, Ir.hrTimeToMicroseconds)(t.sampleTime) >= (0, Ir.hrTimeToMicroseconds)(e.sampleTime) ? t : e;
          return new jt(t.startTime, n.toPointValue(), n.sampleTime);
        }
        toMetricData(e, t, n, i) {
          return { descriptor: e, aggregationTemporality: t, dataPointType: rS.DataPointType.GAUGE, dataPoints: n.map(([s, o]) => ({ attributes: s, startTime: o.startTime, endTime: i, value: o.toPointValue() })) };
        }
      };
      Ft.LastValueAggregator = ka;
    });
    T_ = l((kt) => {
      "use strict";
      Object.defineProperty(kt, "__esModule", { value: true });
      kt.SumAggregator = kt.SumAccumulation = void 0;
      var nS = xt(), iS = wt(), Ce = class {
        constructor(e, t, n = 0, i = false) {
          this.startTime = e, this.monotonic = t, this._current = n, this.reset = i;
        }
        record(e) {
          this.monotonic && e < 0 || (this._current += e);
        }
        setStartTime(e) {
          this.startTime = e;
        }
        toPointValue() {
          return this._current;
        }
      };
      kt.SumAccumulation = Ce;
      var $a = class {
        constructor(e) {
          this.monotonic = e, this.kind = nS.AggregatorKind.SUM;
        }
        createAccumulation(e) {
          return new Ce(e, this.monotonic);
        }
        merge(e, t) {
          let n = e.toPointValue(), i = t.toPointValue();
          return t.reset ? new Ce(t.startTime, this.monotonic, i, t.reset) : new Ce(e.startTime, this.monotonic, n + i);
        }
        diff(e, t) {
          let n = e.toPointValue(), i = t.toPointValue();
          return this.monotonic && n > i ? new Ce(t.startTime, this.monotonic, i, true) : new Ce(t.startTime, this.monotonic, i - n);
        }
        toMetricData(e, t, n, i) {
          return { descriptor: e, aggregationTemporality: t, dataPointType: iS.DataPointType.SUM, dataPoints: n.map(([s, o]) => ({ attributes: s, startTime: o.startTime, endTime: i, value: o.toPointValue() })), isMonotonic: this.monotonic };
        }
      };
      kt.SumAggregator = $a;
    });
    S_ = l((ue) => {
      "use strict";
      var sS = ue && ue.__createBinding || (Object.create ? function (r, e, t, n) {
        n === void 0 && (n = t), Object.defineProperty(r, n, {
          enumerable: true, get: function () {
            return e[t];
          }
        });
      } : function (r, e, t, n) {
        n === void 0 && (n = t), r[n] = e[t];
      }), Lr = ue && ue.__exportStar || function (r, e) {
        for (var t in r)
          t !== "default" && !Object.prototype.hasOwnProperty.call(e, t) && sS(e, r, t);
      };
      Object.defineProperty(ue, "__esModule", { value: true });
      Lr(r_(), ue);
      Lr(s_(), ue);
      Lr(m_(), ue);
      Lr(g_(), ue);
      Lr(T_(), ue);
    });
    Fi = l((q) => {
      "use strict";
      Object.defineProperty(q, "__esModule", { value: true });
      q.DefaultAggregation = q.ExponentialHistogramAggregation = q.ExplicitBucketHistogramAggregation = q.HistogramAggregation = q.LastValueAggregation = q.SumAggregation = q.DropAggregation = q.Aggregation = void 0;
      var oS = (h(), m(d)), at = S_(), Pe = be(), Ee = class {
        static Drop() {
          return A_;
        }
        static Sum() {
          return O_;
        }
        static LastValue() {
          return R_;
        }
        static Histogram() {
          return b_;
        }
        static ExponentialHistogram() {
          return aS;
        }
        static Default() {
          return uS;
        }
      };
      q.Aggregation = Ee;
      var Mr = class r extends Ee {
        createAggregator(e) {
          return r.DEFAULT_INSTANCE;
        }
      };
      q.DropAggregation = Mr;
      Mr.DEFAULT_INSTANCE = new at.DropAggregator();
      var $t = class r extends Ee {
        createAggregator(e) {
          switch (e.type) {
            case Pe.InstrumentType.COUNTER:
            case Pe.InstrumentType.OBSERVABLE_COUNTER:
            case Pe.InstrumentType.HISTOGRAM:
              return r.MONOTONIC_INSTANCE;
            default:
              return r.NON_MONOTONIC_INSTANCE;
          }
        }
      };
      q.SumAggregation = $t;
      $t.MONOTONIC_INSTANCE = new at.SumAggregator(true);
      $t.NON_MONOTONIC_INSTANCE = new at.SumAggregator(false);
      var Nr = class r extends Ee {
        createAggregator(e) {
          return r.DEFAULT_INSTANCE;
        }
      };
      q.LastValueAggregation = Nr;
      Nr.DEFAULT_INSTANCE = new at.LastValueAggregator();
      var Cr = class r extends Ee {
        createAggregator(e) {
          return r.DEFAULT_INSTANCE;
        }
      };
      q.HistogramAggregation = Cr;
      Cr.DEFAULT_INSTANCE = new at.HistogramAggregator([0, 5, 10, 25, 50, 75, 100, 250, 500, 750, 1e3, 2500, 5e3, 7500, 1e4], true);
      var Vi = class extends Ee {
        constructor(e, t = true) {
          if (super(), this._recordMinMax = t, e === void 0 || e.length === 0)
            throw new Error("HistogramAggregator should be created with boundaries.");
          e = e.concat(), e = e.sort((s, o) => s - o);
          let n = e.lastIndexOf(-1 / 0), i = e.indexOf(1 / 0);
          i === -1 && (i = void 0), this._boundaries = e.slice(n + 1, i);
        }
        createAggregator(e) {
          return new at.HistogramAggregator(this._boundaries, this._recordMinMax);
        }
      };
      q.ExplicitBucketHistogramAggregation = Vi;
      var Hi = class extends Ee {
        constructor(e = 160, t = true) {
          super(), this._maxSize = e, this._recordMinMax = t;
        }
        createAggregator(e) {
          return new at.ExponentialHistogramAggregator(this._maxSize, this._recordMinMax);
        }
      };
      q.ExponentialHistogramAggregation = Hi;
      var ji = class extends Ee {
        _resolve(e) {
          switch (e.type) {
            case Pe.InstrumentType.COUNTER:
            case Pe.InstrumentType.UP_DOWN_COUNTER:
            case Pe.InstrumentType.OBSERVABLE_COUNTER:
            case Pe.InstrumentType.OBSERVABLE_UP_DOWN_COUNTER:
              return O_;
            case Pe.InstrumentType.OBSERVABLE_GAUGE:
              return R_;
            case Pe.InstrumentType.HISTOGRAM:
              return e.advice.explicitBucketBoundaries ? new Vi(e.advice.explicitBucketBoundaries) : b_;
          }
          return oS.diag.warn(`Unable to recognize instrument type: ${e.type}`), A_;
        }
        createAggregator(e) {
          return this._resolve(e).createAggregator(e);
        }
      };
      q.DefaultAggregation = ji;
      var A_ = new Mr(), O_ = new $t(), R_ = new Nr(), b_ = new Cr(), aS = new Hi(), uS = new ji();
    });
    Xa = l((Xt) => {
      "use strict";
      Object.defineProperty(Xt, "__esModule", { value: true });
      Xt.DEFAULT_AGGREGATION_TEMPORALITY_SELECTOR = Xt.DEFAULT_AGGREGATION_SELECTOR = void 0;
      var cS = Fi(), lS = Li(), dS = (r) => cS.Aggregation.Default();
      Xt.DEFAULT_AGGREGATION_SELECTOR = dS;
      var _S = (r) => lS.AggregationTemporality.CUMULATIVE;
      Xt.DEFAULT_AGGREGATION_TEMPORALITY_SELECTOR = _S;
    });
    Ka = l(($i) => {
      "use strict";
      Object.defineProperty($i, "__esModule", { value: true });
      $i.MetricReader = void 0;
      var P_ = (h(), m(d)), ki = fe(), y_ = Xa(), Wa = class {
        constructor(e) {
          var t, n, i;
          this._shutdown = false, this._aggregationSelector = (t = e?.aggregationSelector) !== null && t !== void 0 ? t : y_.DEFAULT_AGGREGATION_SELECTOR, this._aggregationTemporalitySelector = (n = e?.aggregationTemporalitySelector) !== null && n !== void 0 ? n : y_.DEFAULT_AGGREGATION_TEMPORALITY_SELECTOR, this._metricProducers = (i = e?.metricProducers) !== null && i !== void 0 ? i : [];
        }
        setMetricProducer(e) {
          if (this._sdkMetricProducer)
            throw new Error("MetricReader can not be bound to a MeterProvider again.");
          this._sdkMetricProducer = e, this.onInitialized();
        }
        selectAggregation(e) {
          return this._aggregationSelector(e);
        }
        selectAggregationTemporality(e) {
          return this._aggregationTemporalitySelector(e);
        }
        onInitialized() {
        }
        async collect(e) {
          if (this._sdkMetricProducer === void 0)
            throw new Error("MetricReader is not bound to a MetricProducer");
          if (this._shutdown)
            throw new Error("MetricReader is shutdown");
          let [t, ...n] = await Promise.all([this._sdkMetricProducer.collect({ timeoutMillis: e?.timeoutMillis }), ...this._metricProducers.map((a) => a.collect({ timeoutMillis: e?.timeoutMillis }))]), i = t.errors.concat((0, ki.FlatMap)(n, (a) => a.errors)), s = t.resourceMetrics.resource, o = t.resourceMetrics.scopeMetrics.concat((0, ki.FlatMap)(n, (a) => a.resourceMetrics.scopeMetrics));
          return { resourceMetrics: { resource: s, scopeMetrics: o }, errors: i };
        }
        async shutdown(e) {
          if (this._shutdown) {
            P_.diag.error("Cannot call shutdown twice.");
            return;
          }
          e?.timeoutMillis == null ? await this.onShutdown() : await (0, ki.callWithTimeout)(this.onShutdown(), e.timeoutMillis), this._shutdown = true;
        }
        async forceFlush(e) {
          if (this._shutdown) {
            P_.diag.warn("Cannot forceFlush on already shutdown MetricReader.");
            return;
          }
          if (e?.timeoutMillis == null) {
            await this.onForceFlush();
            return;
          }
          await (0, ki.callWithTimeout)(this.onForceFlush(), e.timeoutMillis);
        }
      };
      $i.MetricReader = Wa;
    });
    L_ = l((Wi) => {
      "use strict";
      Object.defineProperty(Wi, "__esModule", { value: true });
      Wi.PeriodicExportingMetricReader = void 0;
      var v_ = (h(), m(d)), Xi = A(), pS = Ka(), I_ = fe(), hS = (h(), m(d)), za = class extends pS.MetricReader {
        constructor(e) {
          var t, n, i, s;
          if (super({ aggregationSelector: (t = e.exporter.selectAggregation) === null || t === void 0 ? void 0 : t.bind(e.exporter), aggregationTemporalitySelector: (n = e.exporter.selectAggregationTemporality) === null || n === void 0 ? void 0 : n.bind(e.exporter), metricProducers: e.metricProducers }), e.exportIntervalMillis !== void 0 && e.exportIntervalMillis <= 0)
            throw Error("exportIntervalMillis must be greater than 0");
          if (e.exportTimeoutMillis !== void 0 && e.exportTimeoutMillis <= 0)
            throw Error("exportTimeoutMillis must be greater than 0");
          if (e.exportTimeoutMillis !== void 0 && e.exportIntervalMillis !== void 0 && e.exportIntervalMillis < e.exportTimeoutMillis)
            throw Error("exportIntervalMillis must be greater than or equal to exportTimeoutMillis");
          this._exportInterval = (i = e.exportIntervalMillis) !== null && i !== void 0 ? i : 6e4, this._exportTimeout = (s = e.exportTimeoutMillis) !== null && s !== void 0 ? s : 3e4, this._exporter = e.exporter;
        }
        async _runOnce() {
          try {
            await (0, I_.callWithTimeout)(this._doRun(), this._exportTimeout);
          } catch (e) {
            if (e instanceof I_.TimeoutError) {
              v_.diag.error("Export took longer than %s milliseconds and timed out.", this._exportTimeout);
              return;
            }
            (0, Xi.globalErrorHandler)(e);
          }
        }
        async _doRun() {
          var e, t;
          let { resourceMetrics: n, errors: i } = await this.collect({ timeoutMillis: this._exportTimeout });
          i.length > 0 && v_.diag.error("PeriodicExportingMetricReader: metrics collection errors", ...i);
          let s = async () => {
            let o = await Xi.internal._export(this._exporter, n);
            if (o.code !== Xi.ExportResultCode.SUCCESS)
              throw new Error(`PeriodicExportingMetricReader: metrics export failed (error ${o.error})`);
          };
          n.resource.asyncAttributesPending ? (t = (e = n.resource).waitForAsyncAttributes) === null || t === void 0 || t.call(e).then(s, (o) => hS.diag.debug("Error while resolving async portion of resource: ", o)) : await s();
        }
        onInitialized() {
          this._interval = setInterval(() => {
            this._runOnce();
          }, this._exportInterval), (0, Xi.unrefTimer)(this._interval);
        }
        async onForceFlush() {
          await this._runOnce(), await this._exporter.forceFlush();
        }
        async onShutdown() {
          this._interval && clearInterval(this._interval), await this._exporter.shutdown();
        }
      };
      Wi.PeriodicExportingMetricReader = za;
    });
    N_ = l((Ki) => {
      "use strict";
      Object.defineProperty(Ki, "__esModule", { value: true });
      Ki.InMemoryMetricExporter = void 0;
      var M_ = A(), Ya = class {
        constructor(e) {
          this._shutdown = false, this._metrics = [], this._aggregationTemporality = e;
        }
        export(e, t) {
          if (this._shutdown) {
            setTimeout(() => t({ code: M_.ExportResultCode.FAILED }), 0);
            return;
          }
          this._metrics.push(e), setTimeout(() => t({ code: M_.ExportResultCode.SUCCESS }), 0);
        }
        getMetrics() {
          return this._metrics;
        }
        forceFlush() {
          return Promise.resolve();
        }
        reset() {
          this._metrics = [];
        }
        selectAggregationTemporality(e) {
          return this._aggregationTemporality;
        }
        shutdown() {
          return this._shutdown = true, Promise.resolve();
        }
      };
      Ki.InMemoryMetricExporter = Ya;
    });
    w_ = l((zi) => {
      "use strict";
      Object.defineProperty(zi, "__esModule", { value: true });
      zi.ConsoleMetricExporter = void 0;
      var C_ = A(), fS = Xa(), Qa = class r {
        constructor(e) {
          var t;
          this._shutdown = false, this._temporalitySelector = (t = e?.temporalitySelector) !== null && t !== void 0 ? t : fS.DEFAULT_AGGREGATION_TEMPORALITY_SELECTOR;
        }
        export(e, t) {
          if (this._shutdown) {
            setImmediate(t, { code: C_.ExportResultCode.FAILED });
            return;
          }
          return r._sendMetrics(e, t);
        }
        forceFlush() {
          return Promise.resolve();
        }
        selectAggregationTemporality(e) {
          return this._temporalitySelector(e);
        }
        shutdown() {
          return this._shutdown = true, Promise.resolve();
        }
        static _sendMetrics(e, t) {
          for (let n of e.scopeMetrics)
            for (let i of n.metrics)
              console.dir({ descriptor: i.descriptor, dataPointType: i.dataPointType, dataPoints: i.dataPoints });
          t({ code: C_.ExportResultCode.SUCCESS });
        }
      };
      zi.ConsoleMetricExporter = Qa;
    });
    x_ = l((Yi) => {
      "use strict";
      Object.defineProperty(Yi, "__esModule", { value: true });
      Yi.ViewRegistry = void 0;
      var Za = class {
        constructor() {
          this._registeredViews = [];
        }
        addView(e) {
          this._registeredViews.push(e);
        }
        findViews(e, t) {
          return this._registeredViews.filter((i) => this._matchInstrument(i.instrumentSelector, e) && this._matchMeter(i.meterSelector, t));
        }
        _matchInstrument(e, t) {
          return (e.getType() === void 0 || t.type === e.getType()) && e.getNameFilter().match(t.name) && e.getUnitFilter().match(t.unit);
        }
        _matchMeter(e, t) {
          return e.getNameFilter().match(t.name) && (t.version === void 0 || e.getVersionFilter().match(t.version)) && (t.schemaUrl === void 0 || e.getSchemaUrlFilter().match(t.schemaUrl));
        }
      };
      Yi.ViewRegistry = Za;
    });
    Qi = l((D) => {
      "use strict";
      Object.defineProperty(D, "__esModule", { value: true });
      D.isObservableInstrument = D.ObservableUpDownCounterInstrument = D.ObservableGaugeInstrument = D.ObservableCounterInstrument = D.ObservableInstrument = D.HistogramInstrument = D.CounterInstrument = D.UpDownCounterInstrument = D.SyncInstrument = void 0;
      var Wt = (h(), m(d)), ES = A(), Kt = class {
        constructor(e, t) {
          this._writableMetricStorage = e, this._descriptor = t;
        }
        _record(e, t = {}, n = Wt.context.active()) {
          if (typeof e != "number") {
            Wt.diag.warn(`non-number value provided to metric ${this._descriptor.name}: ${e}`);
            return;
          }
          this._descriptor.valueType === Wt.ValueType.INT && !Number.isInteger(e) && (Wt.diag.warn(`INT value type cannot accept a floating-point value for ${this._descriptor.name}, ignoring the fractional digits.`), e = Math.trunc(e), !Number.isInteger(e)) || this._writableMetricStorage.record(e, t, n, (0, ES.millisToHrTime)(Date.now()));
        }
      };
      D.SyncInstrument = Kt;
      var Ja = class extends Kt {
        add(e, t, n) {
          this._record(e, t, n);
        }
      };
      D.UpDownCounterInstrument = Ja;
      var eu = class extends Kt {
        add(e, t, n) {
          if (e < 0) {
            Wt.diag.warn(`negative value provided to counter ${this._descriptor.name}: ${e}`);
            return;
          }
          this._record(e, t, n);
        }
      };
      D.CounterInstrument = eu;
      var tu = class extends Kt {
        record(e, t, n) {
          if (e < 0) {
            Wt.diag.warn(`negative value provided to histogram ${this._descriptor.name}: ${e}`);
            return;
          }
          this._record(e, t, n);
        }
      };
      D.HistogramInstrument = tu;
      var ut = class {
        constructor(e, t, n) {
          this._observableRegistry = n, this._descriptor = e, this._metricStorages = t;
        }
        addCallback(e) {
          this._observableRegistry.addCallback(e, this);
        }
        removeCallback(e) {
          this._observableRegistry.removeCallback(e, this);
        }
      };
      D.ObservableInstrument = ut;
      var ru = class extends ut {
      };
      D.ObservableCounterInstrument = ru;
      var nu = class extends ut {
      };
      D.ObservableGaugeInstrument = nu;
      var iu = class extends ut {
      };
      D.ObservableUpDownCounterInstrument = iu;
      function mS(r) {
        return r instanceof ut;
      }
      D.isObservableInstrument = mS;
    });
    D_ = l((Zi) => {
      "use strict";
      Object.defineProperty(Zi, "__esModule", { value: true });
      Zi.Meter = void 0;
      var ie = be(), zt = Qi(), su = class {
        constructor(e) {
          this._meterSharedState = e;
        }
        createHistogram(e, t) {
          let n = (0, ie.createInstrumentDescriptor)(e, ie.InstrumentType.HISTOGRAM, t), i = this._meterSharedState.registerMetricStorage(n);
          return new zt.HistogramInstrument(i, n);
        }
        createCounter(e, t) {
          let n = (0, ie.createInstrumentDescriptor)(e, ie.InstrumentType.COUNTER, t), i = this._meterSharedState.registerMetricStorage(n);
          return new zt.CounterInstrument(i, n);
        }
        createUpDownCounter(e, t) {
          let n = (0, ie.createInstrumentDescriptor)(e, ie.InstrumentType.UP_DOWN_COUNTER, t), i = this._meterSharedState.registerMetricStorage(n);
          return new zt.UpDownCounterInstrument(i, n);
        }
        createObservableGauge(e, t) {
          let n = (0, ie.createInstrumentDescriptor)(e, ie.InstrumentType.OBSERVABLE_GAUGE, t), i = this._meterSharedState.registerAsyncMetricStorage(n);
          return new zt.ObservableGaugeInstrument(n, i, this._meterSharedState.observableRegistry);
        }
        createObservableCounter(e, t) {
          let n = (0, ie.createInstrumentDescriptor)(e, ie.InstrumentType.OBSERVABLE_COUNTER, t), i = this._meterSharedState.registerAsyncMetricStorage(n);
          return new zt.ObservableCounterInstrument(n, i, this._meterSharedState.observableRegistry);
        }
        createObservableUpDownCounter(e, t) {
          let n = (0, ie.createInstrumentDescriptor)(e, ie.InstrumentType.OBSERVABLE_UP_DOWN_COUNTER, t), i = this._meterSharedState.registerAsyncMetricStorage(n);
          return new zt.ObservableUpDownCounterInstrument(n, i, this._meterSharedState.observableRegistry);
        }
        addBatchObservableCallback(e, t) {
          this._meterSharedState.observableRegistry.addBatchCallback(e, t);
        }
        removeBatchObservableCallback(e, t) {
          this._meterSharedState.observableRegistry.removeBatchCallback(e, t);
        }
      };
      Zi.Meter = su;
    });
    au = l((Ji) => {
      "use strict";
      Object.defineProperty(Ji, "__esModule", { value: true });
      Ji.MetricStorage = void 0;
      var gS = be(), ou = class {
        constructor(e) {
          this._instrumentDescriptor = e;
        }
        getInstrumentDescriptor() {
          return this._instrumentDescriptor;
        }
        updateDescription(e) {
          this._instrumentDescriptor = (0, gS.createInstrumentDescriptor)(this._instrumentDescriptor.name, this._instrumentDescriptor.type, { description: e, valueType: this._instrumentDescriptor.valueType, unit: this._instrumentDescriptor.unit, advice: this._instrumentDescriptor.advice });
        }
      };
      Ji.MetricStorage = ou;
    });
    wr = l((Yt) => {
      "use strict";
      Object.defineProperty(Yt, "__esModule", { value: true });
      Yt.AttributeHashMap = Yt.HashMap = void 0;
      var TS = fe(), es = class {
        constructor(e) {
          this._hash = e, this._valueMap = /* @__PURE__ */ new Map(), this._keyMap = /* @__PURE__ */ new Map();
        }
        get(e, t) {
          return t ?? (t = this._hash(e)), this._valueMap.get(t);
        }
        getOrDefault(e, t) {
          let n = this._hash(e);
          if (this._valueMap.has(n))
            return this._valueMap.get(n);
          let i = t();
          return this._keyMap.has(n) || this._keyMap.set(n, e), this._valueMap.set(n, i), i;
        }
        set(e, t, n) {
          n ?? (n = this._hash(e)), this._keyMap.has(n) || this._keyMap.set(n, e), this._valueMap.set(n, t);
        }
        has(e, t) {
          return t ?? (t = this._hash(e)), this._valueMap.has(t);
        }
        *keys() {
          let e = this._keyMap.entries(), t = e.next();
          for (; t.done !== true;)
            yield [t.value[1], t.value[0]], t = e.next();
        }
        *entries() {
          let e = this._valueMap.entries(), t = e.next();
          for (; t.done !== true;)
            yield [this._keyMap.get(t.value[0]), t.value[1], t.value[0]], t = e.next();
        }
        get size() {
          return this._valueMap.size;
        }
      };
      Yt.HashMap = es;
      var uu = class extends es {
        constructor() {
          super(TS.hashAttributes);
        }
      };
      Yt.AttributeHashMap = uu;
    });
    du = l((ts) => {
      "use strict";
      Object.defineProperty(ts, "__esModule", { value: true });
      ts.DeltaMetricProcessor = void 0;
      var cu = wr(), lu = class {
        constructor(e) {
          this._aggregator = e, this._activeCollectionStorage = new cu.AttributeHashMap(), this._cumulativeMemoStorage = new cu.AttributeHashMap();
        }
        record(e, t, n, i) {
          let s = this._activeCollectionStorage.getOrDefault(t, () => this._aggregator.createAccumulation(i));
          s?.record(e);
        }
        batchCumulate(e, t) {
          Array.from(e.entries()).forEach(([n, i, s]) => {
            let o = this._aggregator.createAccumulation(t);
            o?.record(i);
            let a = o;
            if (this._cumulativeMemoStorage.has(n, s)) {
              let u = this._cumulativeMemoStorage.get(n, s);
              a = this._aggregator.diff(u, o);
            }
            if (this._activeCollectionStorage.has(n, s)) {
              let u = this._activeCollectionStorage.get(n, s);
              a = this._aggregator.merge(u, a);
            }
            this._cumulativeMemoStorage.set(n, o, s), this._activeCollectionStorage.set(n, a, s);
          });
        }
        collect() {
          let e = this._activeCollectionStorage;
          return this._activeCollectionStorage = new cu.AttributeHashMap(), e;
        }
      };
      ts.DeltaMetricProcessor = lu;
    });
    pu = l((rs) => {
      "use strict";
      Object.defineProperty(rs, "__esModule", { value: true });
      rs.TemporalMetricProcessor = void 0;
      var SS = Li(), AS = wr(), _u = class r {
        constructor(e, t) {
          this._aggregator = e, this._unreportedAccumulations = /* @__PURE__ */ new Map(), this._reportHistory = /* @__PURE__ */ new Map(), t.forEach((n) => {
            this._unreportedAccumulations.set(n, []);
          });
        }
        buildMetrics(e, t, n, i) {
          this._stashAccumulations(n);
          let s = this._getMergedUnreportedAccumulations(e), o = s, a;
          if (this._reportHistory.has(e)) {
            let c = this._reportHistory.get(e), _ = c.collectionTime;
            a = c.aggregationTemporality, a === SS.AggregationTemporality.CUMULATIVE ? o = r.merge(c.accumulations, s, this._aggregator) : o = r.calibrateStartTime(c.accumulations, s, _);
          } else
            a = e.selectAggregationTemporality(t.type);
          this._reportHistory.set(e, { accumulations: o, collectionTime: i, aggregationTemporality: a });
          let u = OS(o);
          if (u.length !== 0)
            return this._aggregator.toMetricData(t, a, u, i);
        }
        _stashAccumulations(e) {
          let t = this._unreportedAccumulations.keys();
          for (let n of t) {
            let i = this._unreportedAccumulations.get(n);
            i === void 0 && (i = [], this._unreportedAccumulations.set(n, i)), i.push(e);
          }
        }
        _getMergedUnreportedAccumulations(e) {
          let t = new AS.AttributeHashMap(), n = this._unreportedAccumulations.get(e);
          if (this._unreportedAccumulations.set(e, []), n === void 0)
            return t;
          for (let i of n)
            t = r.merge(t, i, this._aggregator);
          return t;
        }
        static merge(e, t, n) {
          let i = e, s = t.entries(), o = s.next();
          for (; o.done !== true;) {
            let [a, u, c] = o.value;
            if (e.has(a, c)) {
              let _ = e.get(a, c), p = n.merge(_, u);
              i.set(a, p, c);
            } else
              i.set(a, u, c);
            o = s.next();
          }
          return i;
        }
        static calibrateStartTime(e, t, n) {
          for (let [i, s] of e.keys()) {
            let o = t.get(i, s);
            o?.setStartTime(n);
          }
          return t;
        }
      };
      rs.TemporalMetricProcessor = _u;
      function OS(r) {
        return Array.from(r.entries());
      }
    });
    U_ = l((ns) => {
      "use strict";
      Object.defineProperty(ns, "__esModule", { value: true });
      ns.AsyncMetricStorage = void 0;
      var RS = au(), bS = du(), PS = pu(), yS = wr(), hu = class extends RS.MetricStorage {
        constructor(e, t, n, i) {
          super(e), this._attributesProcessor = n, this._deltaMetricStorage = new bS.DeltaMetricProcessor(t), this._temporalMetricStorage = new PS.TemporalMetricProcessor(t, i);
        }
        record(e, t) {
          let n = new yS.AttributeHashMap();
          Array.from(e.entries()).forEach(([i, s]) => {
            n.set(this._attributesProcessor.process(i), s);
          }), this._deltaMetricStorage.batchCumulate(n, t);
        }
        collect(e, t) {
          let n = this._deltaMetricStorage.collect();
          return this._temporalMetricStorage.buildMetrics(e, this._instrumentDescriptor, n, t);
        }
      };
      ns.AsyncMetricStorage = hu;
    });
    H_ = l((Z) => {
      "use strict";
      Object.defineProperty(Z, "__esModule", { value: true });
      Z.getConflictResolutionRecipe = Z.getDescriptionResolutionRecipe = Z.getTypeConflictResolutionRecipe = Z.getUnitConflictResolutionRecipe = Z.getValueTypeConflictResolutionRecipe = Z.getIncompatibilityDetails = void 0;
      function vS(r, e) {
        let t = "";
        return r.unit !== e.unit && (t += `	- Unit '${r.unit}' does not match '${e.unit}'
`), r.type !== e.type && (t += `	- Type '${r.type}' does not match '${e.type}'
`), r.valueType !== e.valueType && (t += `	- Value Type '${r.valueType}' does not match '${e.valueType}'
`), r.description !== e.description && (t += `	- Description '${r.description}' does not match '${e.description}'
`), t;
      }
      Z.getIncompatibilityDetails = vS;
      function B_(r, e) {
        return `	- use valueType '${r.valueType}' on instrument creation or use an instrument name other than '${e.name}'`;
      }
      Z.getValueTypeConflictResolutionRecipe = B_;
      function q_(r, e) {
        return `	- use unit '${r.unit}' on instrument creation or use an instrument name other than '${e.name}'`;
      }
      Z.getUnitConflictResolutionRecipe = q_;
      function G_(r, e) {
        let t = { name: e.name, type: e.type, unit: e.unit }, n = JSON.stringify(t);
        return `	- create a new view with a name other than '${r.name}' and InstrumentSelector '${n}'`;
      }
      Z.getTypeConflictResolutionRecipe = G_;
      function V_(r, e) {
        let t = { name: e.name, type: e.type, unit: e.unit }, n = JSON.stringify(t);
        return `	- create a new view with a name other than '${r.name}' and InstrumentSelector '${n}'
    	- OR - create a new view with the name ${r.name} and description '${r.description}' and InstrumentSelector ${n}
    	- OR - create a new view with the name ${e.name} and description '${r.description}' and InstrumentSelector ${n}`;
      }
      Z.getDescriptionResolutionRecipe = V_;
      function IS(r, e) {
        return r.valueType !== e.valueType ? B_(r, e) : r.unit !== e.unit ? q_(r, e) : r.type !== e.type ? G_(r, e) : r.description !== e.description ? V_(r, e) : "";
      }
      Z.getConflictResolutionRecipe = IS;
    });
    F_ = l((ss) => {
      "use strict";
      Object.defineProperty(ss, "__esModule", { value: true });
      ss.MetricStorageRegistry = void 0;
      var LS = be(), j_ = (h(), m(d)), is = H_(), fu = class r {
        constructor() {
          this._sharedRegistry = /* @__PURE__ */ new Map(), this._perCollectorRegistry = /* @__PURE__ */ new Map();
        }
        static create() {
          return new r();
        }
        getStorages(e) {
          let t = [];
          for (let i of this._sharedRegistry.values())
            t = t.concat(i);
          let n = this._perCollectorRegistry.get(e);
          if (n != null)
            for (let i of n.values())
              t = t.concat(i);
          return t;
        }
        register(e) {
          this._registerStorage(e, this._sharedRegistry);
        }
        registerForCollector(e, t) {
          let n = this._perCollectorRegistry.get(e);
          n == null && (n = /* @__PURE__ */ new Map(), this._perCollectorRegistry.set(e, n)), this._registerStorage(t, n);
        }
        findOrUpdateCompatibleStorage(e) {
          let t = this._sharedRegistry.get(e.name);
          return t === void 0 ? null : this._findOrUpdateCompatibleStorage(e, t);
        }
        findOrUpdateCompatibleCollectorStorage(e, t) {
          let n = this._perCollectorRegistry.get(e);
          if (n === void 0)
            return null;
          let i = n.get(t.name);
          return i === void 0 ? null : this._findOrUpdateCompatibleStorage(t, i);
        }
        _registerStorage(e, t) {
          let n = e.getInstrumentDescriptor(), i = t.get(n.name);
          if (i === void 0) {
            t.set(n.name, [e]);
            return;
          }
          i.push(e);
        }
        _findOrUpdateCompatibleStorage(e, t) {
          let n = null;
          for (let i of t) {
            let s = i.getInstrumentDescriptor();
            (0, LS.isDescriptorCompatibleWith)(s, e) ? (s.description !== e.description && (e.description.length > s.description.length && i.updateDescription(e.description), j_.diag.warn("A view or instrument with the name ", e.name, ` has already been registered, but has a different description and is incompatible with another registered view.
`, `Details:
`, (0, is.getIncompatibilityDetails)(s, e), `The longer description will be used.
To resolve the conflict:`, (0, is.getConflictResolutionRecipe)(s, e))), n = i) : j_.diag.warn("A view or instrument with the name ", e.name, ` has already been registered and is incompatible with another registered view.
`, `Details:
`, (0, is.getIncompatibilityDetails)(s, e), `To resolve the conflict:
`, (0, is.getConflictResolutionRecipe)(s, e));
          }
          return n;
        }
      };
      ss.MetricStorageRegistry = fu;
    });
    k_ = l((os) => {
      "use strict";
      Object.defineProperty(os, "__esModule", { value: true });
      os.MultiMetricStorage = void 0;
      var Eu = class {
        constructor(e) {
          this._backingStorages = e;
        }
        record(e, t, n, i) {
          this._backingStorages.forEach((s) => {
            s.record(e, t, n, i);
          });
        }
      };
      os.MultiMetricStorage = Eu;
    });
    X_ = l((Zt) => {
      "use strict";
      Object.defineProperty(Zt, "__esModule", { value: true });
      Zt.BatchObservableResultImpl = Zt.ObservableResultImpl = void 0;
      var Qt = (h(), m(d)), $_ = wr(), MS = Qi(), mu = class {
        constructor(e, t) {
          this._instrumentName = e, this._valueType = t, this._buffer = new $_.AttributeHashMap();
        }
        observe(e, t = {}) {
          if (typeof e != "number") {
            Qt.diag.warn(`non-number value provided to metric ${this._instrumentName}: ${e}`);
            return;
          }
          this._valueType === Qt.ValueType.INT && !Number.isInteger(e) && (Qt.diag.warn(`INT value type cannot accept a floating-point value for ${this._instrumentName}, ignoring the fractional digits.`), e = Math.trunc(e), !Number.isInteger(e)) || this._buffer.set(t, e);
        }
      };
      Zt.ObservableResultImpl = mu;
      var gu = class {
        constructor() {
          this._buffer = /* @__PURE__ */ new Map();
        }
        observe(e, t, n = {}) {
          if (!(0, MS.isObservableInstrument)(e))
            return;
          let i = this._buffer.get(e);
          if (i == null && (i = new $_.AttributeHashMap(), this._buffer.set(e, i)), typeof t != "number") {
            Qt.diag.warn(`non-number value provided to metric ${e._descriptor.name}: ${t}`);
            return;
          }
          e._descriptor.valueType === Qt.ValueType.INT && !Number.isInteger(t) && (Qt.diag.warn(`INT value type cannot accept a floating-point value for ${e._descriptor.name}, ignoring the fractional digits.`), t = Math.trunc(t), !Number.isInteger(t)) || i.set(n, t);
        }
      };
      Zt.BatchObservableResultImpl = gu;
    });
    z_ = l((as) => {
      "use strict";
      Object.defineProperty(as, "__esModule", { value: true });
      as.ObservableRegistry = void 0;
      var NS = (h(), m(d)), W_ = Qi(), K_ = X_(), xr = fe(), Tu = class {
        constructor() {
          this._callbacks = [], this._batchCallbacks = [];
        }
        addCallback(e, t) {
          this._findCallback(e, t) >= 0 || this._callbacks.push({ callback: e, instrument: t });
        }
        removeCallback(e, t) {
          let n = this._findCallback(e, t);
          n < 0 || this._callbacks.splice(n, 1);
        }
        addBatchCallback(e, t) {
          let n = new Set(t.filter(W_.isObservableInstrument));
          if (n.size === 0) {
            NS.diag.error("BatchObservableCallback is not associated with valid instruments", t);
            return;
          }
          this._findBatchCallback(e, n) >= 0 || this._batchCallbacks.push({ callback: e, instruments: n });
        }
        removeBatchCallback(e, t) {
          let n = new Set(t.filter(W_.isObservableInstrument)), i = this._findBatchCallback(e, n);
          i < 0 || this._batchCallbacks.splice(i, 1);
        }
        async observe(e, t) {
          let n = this._observeCallbacks(e, t), i = this._observeBatchCallbacks(e, t);
          return (await (0, xr.PromiseAllSettled)([...n, ...i])).filter(xr.isPromiseAllSettledRejectionResult).map((a) => a.reason);
        }
        _observeCallbacks(e, t) {
          return this._callbacks.map(async ({ callback: n, instrument: i }) => {
            let s = new K_.ObservableResultImpl(i._descriptor.name, i._descriptor.valueType), o = Promise.resolve(n(s));
            t != null && (o = (0, xr.callWithTimeout)(o, t)), await o, i._metricStorages.forEach((a) => {
              a.record(s._buffer, e);
            });
          });
        }
        _observeBatchCallbacks(e, t) {
          return this._batchCallbacks.map(async ({ callback: n, instruments: i }) => {
            let s = new K_.BatchObservableResultImpl(), o = Promise.resolve(n(s));
            t != null && (o = (0, xr.callWithTimeout)(o, t)), await o, i.forEach((a) => {
              let u = s._buffer.get(a);
              u != null && a._metricStorages.forEach((c) => {
                c.record(u, e);
              });
            });
          });
        }
        _findCallback(e, t) {
          return this._callbacks.findIndex((n) => n.callback === e && n.instrument === t);
        }
        _findBatchCallback(e, t) {
          return this._batchCallbacks.findIndex((n) => n.callback === e && (0, xr.setEquals)(n.instruments, t));
        }
      };
      as.ObservableRegistry = Tu;
    });
    Y_ = l((us) => {
      "use strict";
      Object.defineProperty(us, "__esModule", { value: true });
      us.SyncMetricStorage = void 0;
      var CS = au(), wS = du(), xS = pu(), Su = class extends CS.MetricStorage {
        constructor(e, t, n, i) {
          super(e), this._attributesProcessor = n, this._deltaMetricStorage = new wS.DeltaMetricProcessor(t), this._temporalMetricStorage = new xS.TemporalMetricProcessor(t, i);
        }
        record(e, t, n, i) {
          t = this._attributesProcessor.process(t, n), this._deltaMetricStorage.record(e, t, n, i);
        }
        collect(e, t) {
          let n = this._deltaMetricStorage.collect();
          return this._temporalMetricStorage.buildMetrics(e, this._instrumentDescriptor, n, t);
        }
      };
      us.SyncMetricStorage = Su;
    });
    Ou = l((we) => {
      "use strict";
      Object.defineProperty(we, "__esModule", { value: true });
      we.FilteringAttributesProcessor = we.NoopAttributesProcessor = we.AttributesProcessor = void 0;
      var Dr = class {
        static Noop() {
          return DS;
        }
      };
      we.AttributesProcessor = Dr;
      var cs = class extends Dr {
        process(e, t) {
          return e;
        }
      };
      we.NoopAttributesProcessor = cs;
      var Au = class extends Dr {
        constructor(e) {
          super(), this._allowedAttributeNames = e;
        }
        process(e, t) {
          let n = {};
          return Object.keys(e).filter((i) => this._allowedAttributeNames.includes(i)).forEach((i) => n[i] = e[i]), n;
        }
      };
      we.FilteringAttributesProcessor = Au;
      var DS = new cs();
    });
    Q_ = l((ls) => {
      "use strict";
      Object.defineProperty(ls, "__esModule", { value: true });
      ls.MeterSharedState = void 0;
      var US = be(), BS = D_(), qS = fe(), GS = U_(), VS = F_(), HS = k_(), jS = z_(), FS = Y_(), kS = Ou(), Ru = class {
        constructor(e, t) {
          this._meterProviderSharedState = e, this._instrumentationScope = t, this.metricStorageRegistry = new VS.MetricStorageRegistry(), this.observableRegistry = new jS.ObservableRegistry(), this.meter = new BS.Meter(this);
        }
        registerMetricStorage(e) {
          let t = this._registerMetricStorage(e, FS.SyncMetricStorage);
          return t.length === 1 ? t[0] : new HS.MultiMetricStorage(t);
        }
        registerAsyncMetricStorage(e) {
          return this._registerMetricStorage(e, GS.AsyncMetricStorage);
        }
        async collect(e, t, n) {
          let i = await this.observableRegistry.observe(t, n?.timeoutMillis), s = this.metricStorageRegistry.getStorages(e);
          if (s.length === 0)
            return null;
          let o = s.map((a) => a.collect(e, t)).filter(qS.isNotNullish);
          return o.length === 0 ? { errors: i } : { scopeMetrics: { scope: this._instrumentationScope, metrics: o }, errors: i };
        }
        _registerMetricStorage(e, t) {
          let i = this._meterProviderSharedState.viewRegistry.findViews(e, this._instrumentationScope).map((s) => {
            let o = (0, US.createInstrumentDescriptorWithView)(s, e), a = this.metricStorageRegistry.findOrUpdateCompatibleStorage(o);
            if (a != null)
              return a;
            let u = s.aggregation.createAggregator(o), c = new t(o, u, s.attributesProcessor, this._meterProviderSharedState.metricCollectors);
            return this.metricStorageRegistry.register(c), c;
          });
          if (i.length === 0) {
            let o = this._meterProviderSharedState.selectAggregations(e.type).map(([a, u]) => {
              let c = this.metricStorageRegistry.findOrUpdateCompatibleCollectorStorage(a, e);
              if (c != null)
                return c;
              let _ = u.createAggregator(e), p = new t(e, _, kS.AttributesProcessor.Noop(), [a]);
              return this.metricStorageRegistry.registerForCollector(a, p), p;
            });
            i = i.concat(o);
          }
          return i;
        }
      };
      ls.MeterSharedState = Ru;
    });
    Z_ = l((ds) => {
      "use strict";
      Object.defineProperty(ds, "__esModule", { value: true });
      ds.MeterProviderSharedState = void 0;
      var $S = fe(), XS = x_(), WS = Q_(), bu = class {
        constructor(e) {
          this.resource = e, this.viewRegistry = new XS.ViewRegistry(), this.metricCollectors = [], this.meterSharedStates = /* @__PURE__ */ new Map();
        }
        getMeterSharedState(e) {
          let t = (0, $S.instrumentationScopeId)(e), n = this.meterSharedStates.get(t);
          return n == null && (n = new WS.MeterSharedState(this, e), this.meterSharedStates.set(t, n)), n;
        }
        selectAggregations(e) {
          let t = [];
          for (let n of this.metricCollectors)
            t.push([n, n.selectAggregation(e)]);
          return t;
        }
      };
      ds.MeterProviderSharedState = bu;
    });
    J_ = l((_s) => {
      "use strict";
      Object.defineProperty(_s, "__esModule", { value: true });
      _s.MetricCollector = void 0;
      var KS = A(), Pu = class {
        constructor(e, t) {
          this._sharedState = e, this._metricReader = t;
        }
        async collect(e) {
          let t = (0, KS.millisToHrTime)(Date.now()), n = [], i = [], s = Array.from(this._sharedState.meterSharedStates.values()).map(async (o) => {
            let a = await o.collect(this, t, e);
            a?.scopeMetrics != null && n.push(a.scopeMetrics), a?.errors != null && i.push(...a.errors);
          });
          return await Promise.all(s), { resourceMetrics: { resource: this._sharedState.resource, scopeMetrics: n }, errors: i };
        }
        async forceFlush(e) {
          await this._metricReader.forceFlush(e);
        }
        async shutdown(e) {
          await this._metricReader.shutdown(e);
        }
        selectAggregationTemporality(e) {
          return this._metricReader.selectAggregationTemporality(e);
        }
        selectAggregation(e) {
          return this._metricReader.selectAggregation(e);
        }
      };
      _s.MetricCollector = Pu;
    });
    tp = l((hs) => {
      "use strict";
      Object.defineProperty(hs, "__esModule", { value: true });
      hs.MeterProvider = void 0;
      var ps = (h(), m(d)), ep = rt(), zS = Z_(), YS = J_(), yu = class {
        constructor(e) {
          var t;
          this._shutdown = false;
          let n = ep.Resource.default().merge((t = e?.resource) !== null && t !== void 0 ? t : ep.Resource.empty());
          if (this._sharedState = new zS.MeterProviderSharedState(n), e?.views != null && e.views.length > 0)
            for (let i of e.views)
              this._sharedState.viewRegistry.addView(i);
        }
        getMeter(e, t = "", n = {}) {
          return this._shutdown ? (ps.diag.warn("A shutdown MeterProvider cannot provide a Meter"), (0, ps.createNoopMeter)()) : this._sharedState.getMeterSharedState({ name: e, version: t, schemaUrl: n.schemaUrl }).meter;
        }
        addMetricReader(e) {
          let t = new YS.MetricCollector(this._sharedState, e);
          e.setMetricProducer(t), this._sharedState.metricCollectors.push(t);
        }
        async shutdown(e) {
          if (this._shutdown) {
            ps.diag.warn("shutdown may only be called once per MeterProvider");
            return;
          }
          this._shutdown = true, await Promise.all(this._sharedState.metricCollectors.map((t) => t.shutdown(e)));
        }
        async forceFlush(e) {
          if (this._shutdown) {
            ps.diag.warn("invalid attempt to force flush after MeterProvider shutdown");
            return;
          }
          await Promise.all(this._sharedState.metricCollectors.map((t) => t.forceFlush(e)));
        }
      };
      hs.MeterProvider = yu;
    });
    fs = l((Jt) => {
      "use strict";
      Object.defineProperty(Jt, "__esModule", { value: true });
      Jt.ExactPredicate = Jt.PatternPredicate = void 0;
      var QS = /[\^$\\.+?()[\]{}|]/g, vu = class r {
        constructor(e) {
          e === "*" ? (this._matchAll = true, this._regexp = /.*/) : (this._matchAll = false, this._regexp = new RegExp(r.escapePattern(e)));
        }
        match(e) {
          return this._matchAll ? true : this._regexp.test(e);
        }
        static escapePattern(e) {
          return `^${e.replace(QS, "\\$&").replace("*", ".*")}$`;
        }
        static hasWildcard(e) {
          return e.includes("*");
        }
      };
      Jt.PatternPredicate = vu;
      var Iu = class {
        constructor(e) {
          this._matchAll = e === void 0, this._pattern = e;
        }
        match(e) {
          return !!(this._matchAll || e === this._pattern);
        }
      };
      Jt.ExactPredicate = Iu;
    });
    np = l((Es) => {
      "use strict";
      Object.defineProperty(Es, "__esModule", { value: true });
      Es.InstrumentSelector = void 0;
      var rp = fs(), Lu = class {
        constructor(e) {
          var t;
          this._nameFilter = new rp.PatternPredicate((t = e?.name) !== null && t !== void 0 ? t : "*"), this._type = e?.type, this._unitFilter = new rp.ExactPredicate(e?.unit);
        }
        getType() {
          return this._type;
        }
        getNameFilter() {
          return this._nameFilter;
        }
        getUnitFilter() {
          return this._unitFilter;
        }
      };
      Es.InstrumentSelector = Lu;
    });
    ip = l((ms) => {
      "use strict";
      Object.defineProperty(ms, "__esModule", { value: true });
      ms.MeterSelector = void 0;
      var Mu = fs(), Nu = class {
        constructor(e) {
          this._nameFilter = new Mu.ExactPredicate(e?.name), this._versionFilter = new Mu.ExactPredicate(e?.version), this._schemaUrlFilter = new Mu.ExactPredicate(e?.schemaUrl);
        }
        getNameFilter() {
          return this._nameFilter;
        }
        getVersionFilter() {
          return this._versionFilter;
        }
        getSchemaUrlFilter() {
          return this._schemaUrlFilter;
        }
      };
      ms.MeterSelector = Nu;
    });
    op = l((gs) => {
      "use strict";
      Object.defineProperty(gs, "__esModule", { value: true });
      gs.View = void 0;
      var ZS = fs(), sp = Ou(), JS = np(), eA = ip(), tA = Fi();
      function rA(r) {
        return r.instrumentName == null && r.instrumentType == null && r.instrumentUnit == null && r.meterName == null && r.meterVersion == null && r.meterSchemaUrl == null;
      }
      var Cu = class {
        constructor(e) {
          var t;
          if (rA(e))
            throw new Error("Cannot create view with no selector arguments supplied");
          if (e.name != null && (e?.instrumentName == null || ZS.PatternPredicate.hasWildcard(e.instrumentName)))
            throw new Error("Views with a specified name must be declared with an instrument selector that selects at most one instrument per meter.");
          e.attributeKeys != null ? this.attributesProcessor = new sp.FilteringAttributesProcessor(e.attributeKeys) : this.attributesProcessor = sp.AttributesProcessor.Noop(), this.name = e.name, this.description = e.description, this.aggregation = (t = e.aggregation) !== null && t !== void 0 ? t : tA.Aggregation.Default(), this.instrumentSelector = new JS.InstrumentSelector({ name: e.instrumentName, type: e.instrumentType, unit: e.instrumentUnit }), this.meterSelector = new eA.MeterSelector({ name: e.meterName, version: e.meterVersion, schemaUrl: e.meterSchemaUrl });
        }
      };
      gs.View = Cu;
    });
    wu = l((g) => {
      "use strict";
      Object.defineProperty(g, "__esModule", { value: true });
      g.TimeoutError = g.View = g.Aggregation = g.SumAggregation = g.LastValueAggregation = g.HistogramAggregation = g.DropAggregation = g.ExponentialHistogramAggregation = g.ExplicitBucketHistogramAggregation = g.DefaultAggregation = g.MeterProvider = g.InstrumentType = g.ConsoleMetricExporter = g.InMemoryMetricExporter = g.PeriodicExportingMetricReader = g.MetricReader = g.DataPointType = g.AggregationTemporality = void 0;
      var nA = Li();
      Object.defineProperty(g, "AggregationTemporality", {
        enumerable: true, get: function () {
          return nA.AggregationTemporality;
        }
      });
      var iA = wt();
      Object.defineProperty(g, "DataPointType", {
        enumerable: true, get: function () {
          return iA.DataPointType;
        }
      });
      var sA = Ka();
      Object.defineProperty(g, "MetricReader", {
        enumerable: true, get: function () {
          return sA.MetricReader;
        }
      });
      var oA = L_();
      Object.defineProperty(g, "PeriodicExportingMetricReader", {
        enumerable: true, get: function () {
          return oA.PeriodicExportingMetricReader;
        }
      });
      var aA = N_();
      Object.defineProperty(g, "InMemoryMetricExporter", {
        enumerable: true, get: function () {
          return aA.InMemoryMetricExporter;
        }
      });
      var uA = w_();
      Object.defineProperty(g, "ConsoleMetricExporter", {
        enumerable: true, get: function () {
          return uA.ConsoleMetricExporter;
        }
      });
      var cA = be();
      Object.defineProperty(g, "InstrumentType", {
        enumerable: true, get: function () {
          return cA.InstrumentType;
        }
      });
      var lA = tp();
      Object.defineProperty(g, "MeterProvider", {
        enumerable: true, get: function () {
          return lA.MeterProvider;
        }
      });
      var xe = Fi();
      Object.defineProperty(g, "DefaultAggregation", {
        enumerable: true, get: function () {
          return xe.DefaultAggregation;
        }
      });
      Object.defineProperty(g, "ExplicitBucketHistogramAggregation", {
        enumerable: true, get: function () {
          return xe.ExplicitBucketHistogramAggregation;
        }
      });
      Object.defineProperty(g, "ExponentialHistogramAggregation", {
        enumerable: true, get: function () {
          return xe.ExponentialHistogramAggregation;
        }
      });
      Object.defineProperty(g, "DropAggregation", {
        enumerable: true, get: function () {
          return xe.DropAggregation;
        }
      });
      Object.defineProperty(g, "HistogramAggregation", {
        enumerable: true, get: function () {
          return xe.HistogramAggregation;
        }
      });
      Object.defineProperty(g, "LastValueAggregation", {
        enumerable: true, get: function () {
          return xe.LastValueAggregation;
        }
      });
      Object.defineProperty(g, "SumAggregation", {
        enumerable: true, get: function () {
          return xe.SumAggregation;
        }
      });
      Object.defineProperty(g, "Aggregation", {
        enumerable: true, get: function () {
          return xe.Aggregation;
        }
      });
      var dA = op();
      Object.defineProperty(g, "View", {
        enumerable: true, get: function () {
          return dA.View;
        }
      });
      var _A = fe();
      Object.defineProperty(g, "TimeoutError", {
        enumerable: true, get: function () {
          return _A.TimeoutError;
        }
      });
    });
    ap = l((Ts) => {
      "use strict";
      Object.defineProperty(Ts, "__esModule", { value: true });
      Ts.AbstractAsyncHooksContextManager = void 0;
      var pA = z("events"), hA = ["addListener", "on", "once", "prependListener", "prependOnceListener"], xu = class {
        constructor() {
          this._kOtListeners = Symbol("OtListeners"), this._wrapped = false;
        }
        bind(e, t) {
          return t instanceof pA.EventEmitter ? this._bindEventEmitter(e, t) : typeof t == "function" ? this._bindFunction(e, t) : t;
        }
        _bindFunction(e, t) {
          let n = this, i = function (...s) {
            return n.with(e, () => t.apply(this, s));
          };
          return Object.defineProperty(i, "length", { enumerable: false, configurable: true, writable: false, value: t.length }), i;
        }
        _bindEventEmitter(e, t) {
          return this._getPatchMap(t) !== void 0 || (this._createPatchMap(t), hA.forEach((i) => {
            t[i] !== void 0 && (t[i] = this._patchAddListener(t, t[i], e));
          }), typeof t.removeListener == "function" && (t.removeListener = this._patchRemoveListener(t, t.removeListener)), typeof t.off == "function" && (t.off = this._patchRemoveListener(t, t.off)), typeof t.removeAllListeners == "function" && (t.removeAllListeners = this._patchRemoveAllListeners(t, t.removeAllListeners))), t;
        }
        _patchRemoveListener(e, t) {
          let n = this;
          return function (i, s) {
            var o;
            let a = (o = n._getPatchMap(e)) === null || o === void 0 ? void 0 : o[i];
            if (a === void 0)
              return t.call(this, i, s);
            let u = a.get(s);
            return t.call(this, i, u || s);
          };
        }
        _patchRemoveAllListeners(e, t) {
          let n = this;
          return function (i) {
            let s = n._getPatchMap(e);
            return s !== void 0 && (arguments.length === 0 ? n._createPatchMap(e) : s[i] !== void 0 && delete s[i]), t.apply(this, arguments);
          };
        }
        _patchAddListener(e, t, n) {
          let i = this;
          return function (s, o) {
            if (i._wrapped)
              return t.call(this, s, o);
            let a = i._getPatchMap(e);
            a === void 0 && (a = i._createPatchMap(e));
            let u = a[s];
            u === void 0 && (u = /* @__PURE__ */ new WeakMap(), a[s] = u);
            let c = i.bind(n, o);
            u.set(o, c), i._wrapped = true;
            try {
              return t.call(this, s, c);
            } finally {
              i._wrapped = false;
            }
          };
        }
        _createPatchMap(e) {
          let t = /* @__PURE__ */ Object.create(null);
          return e[this._kOtListeners] = t, t;
        }
        _getPatchMap(e) {
          return e[this._kOtListeners];
        }
      };
      Ts.AbstractAsyncHooksContextManager = xu;
    });
    up = l((Ss) => {
      "use strict";
      Object.defineProperty(Ss, "__esModule", { value: true });
      Ss.AsyncLocalStorageContextManager = void 0;
      var fA = (h(), m(d)), EA = z("async_hooks"), mA = ap(), Du = class extends mA.AbstractAsyncHooksContextManager {
        constructor() {
          super(), this._asyncLocalStorage = new EA.AsyncLocalStorage();
        }
        active() {
          var e;
          return (e = this._asyncLocalStorage.getStore()) !== null && e !== void 0 ? e : fA.ROOT_CONTEXT;
        }
        with(e, t, n, ...i) {
          let s = n == null ? t : t.bind(n);
          return this._asyncLocalStorage.run(e, s, ...i);
        }
        enable() {
          return this;
        }
        disable() {
          return this._asyncLocalStorage.disable(), this;
        }
      };
      Ss.AsyncLocalStorageContextManager = Du;
    });
    Ur = l((De) => {
      "use strict";
      Object.defineProperty(De, "__esModule", { value: true });
      De.toAnyValue = De.toKeyValue = De.toAttributes = void 0;
      function RA(r) {
        return Object.keys(r).map((e) => Gu(e, r[e]));
      }
      De.toAttributes = RA;
      function Gu(r, e) {
        return { key: r, value: Vu(e) };
      }
      De.toKeyValue = Gu;
      function Vu(r) {
        let e = typeof r;
        return e === "string" ? { stringValue: r } : e === "number" ? Number.isInteger(r) ? { intValue: r } : { doubleValue: r } : e === "boolean" ? { boolValue: r } : r instanceof Uint8Array ? { bytesValue: r } : Array.isArray(r) ? { arrayValue: { values: r.map(Vu) } } : e === "object" && r != null ? { kvlistValue: { values: Object.entries(r).map(([t, n]) => Gu(t, n)) } } : {};
      }
      De.toAnyValue = Vu;
    });
    Op = l((Ue) => {
      "use strict";
      Object.defineProperty(Ue, "__esModule", { value: true });
      Ue.toOtlpSpanEvent = Ue.toOtlpLink = Ue.sdkSpanToOtlpSpan = void 0;
      var Hu = Ur();
      function bA(r, e) {
        var t;
        let n = r.spanContext(), i = r.status;
        return { traceId: e.encodeSpanContext(n.traceId), spanId: e.encodeSpanContext(n.spanId), parentSpanId: e.encodeOptionalSpanContext(r.parentSpanId), traceState: (t = n.traceState) === null || t === void 0 ? void 0 : t.serialize(), name: r.name, kind: r.kind == null ? 0 : r.kind + 1, startTimeUnixNano: e.encodeHrTime(r.startTime), endTimeUnixNano: e.encodeHrTime(r.endTime), attributes: (0, Hu.toAttributes)(r.attributes), droppedAttributesCount: r.droppedAttributesCount, events: r.events.map((s) => Ap(s, e)), droppedEventsCount: r.droppedEventsCount, status: { code: i.code, message: i.message }, links: r.links.map((s) => Sp(s, e)), droppedLinksCount: r.droppedLinksCount };
      }
      Ue.sdkSpanToOtlpSpan = bA;
      function Sp(r, e) {
        var t;
        return { attributes: r.attributes ? (0, Hu.toAttributes)(r.attributes) : [], spanId: e.encodeSpanContext(r.context.spanId), traceId: e.encodeSpanContext(r.context.traceId), traceState: (t = r.context.traceState) === null || t === void 0 ? void 0 : t.serialize(), droppedAttributesCount: r.droppedAttributesCount || 0 };
      }
      Ue.toOtlpLink = Sp;
      function Ap(r, e) {
        return { attributes: r.attributes ? (0, Hu.toAttributes)(r.attributes) : [], name: r.name, timeUnixNano: e.encodeHrTime(r.time), droppedAttributesCount: r.droppedAttributesCount || 0 };
      }
      Ue.toOtlpSpanEvent = Ap;
    });
    Br = l((se) => {
      "use strict";
      Object.defineProperty(se, "__esModule", { value: true });
      se.getOtlpEncoder = se.encodeAsString = se.encodeAsLongBits = se.toLongBits = se.hrTimeToNanos = void 0;
      var bs = A(), PA = BigInt(1e9);
      function ju(r) {
        return BigInt(r[0]) * PA + BigInt(r[1]);
      }
      se.hrTimeToNanos = ju;
      function bp(r) {
        let e = Number(BigInt.asUintN(32, r)), t = Number(BigInt.asUintN(32, r >> BigInt(32)));
        return { low: e, high: t };
      }
      se.toLongBits = bp;
      function Fu(r) {
        let e = ju(r);
        return bp(e);
      }
      se.encodeAsLongBits = Fu;
      function Pp(r) {
        return ju(r).toString();
      }
      se.encodeAsString = Pp;
      var yA = typeof BigInt < "u" ? Pp : bs.hrTimeToNanoseconds;
      function Rp(r) {
        return r;
      }
      function yp(r) {
        if (r !== void 0)
          return (0, bs.hexToBase64)(r);
      }
      var vA = { encodeHrTime: Fu, encodeSpanContext: bs.hexToBase64, encodeOptionalSpanContext: yp };
      function IA(r) {
        var e, t;
        if (r === void 0)
          return vA;
        let n = (e = r.useLongBits) !== null && e !== void 0 ? e : true, i = (t = r.useHex) !== null && t !== void 0 ? t : false;
        return { encodeHrTime: n ? Fu : yA, encodeSpanContext: i ? Rp : bs.hexToBase64, encodeOptionalSpanContext: i ? Rp : yp };
      }
      se.getOtlpEncoder = IA;
    });
    ys = l((Ps) => {
      "use strict";
      Object.defineProperty(Ps, "__esModule", { value: true });
      Ps.createExportTraceServiceRequest = void 0;
      var LA = Ur(), MA = Op(), NA = Br();
      function CA(r, e) {
        let t = (0, NA.getOtlpEncoder)(e);
        return { resourceSpans: xA(r, t) };
      }
      Ps.createExportTraceServiceRequest = CA;
      function wA(r) {
        let e = /* @__PURE__ */ new Map();
        for (let t of r) {
          let n = e.get(t.resource);
          n || (n = /* @__PURE__ */ new Map(), e.set(t.resource, n));
          let i = `${t.instrumentationLibrary.name}@${t.instrumentationLibrary.version || ""}:${t.instrumentationLibrary.schemaUrl || ""}`, s = n.get(i);
          s || (s = [], n.set(i, s)), s.push(t);
        }
        return e;
      }
      function xA(r, e) {
        let t = wA(r), n = [], i = t.entries(), s = i.next();
        for (; !s.done;) {
          let [o, a] = s.value, u = [], c = a.values(), _ = c.next();
          for (; !_.done;) {
            let f = _.value;
            if (f.length > 0) {
              let { name: L, version: R, schemaUrl: w } = f[0].instrumentationLibrary, U = f.map((S) => (0, MA.sdkSpanToOtlpSpan)(S, e));
              u.push({ scope: { name: L, version: R }, spans: U, schemaUrl: w });
            }
            _ = c.next();
          }
          let p = { resource: { attributes: (0, LA.toAttributes)(o.attributes), droppedAttributesCount: 0 }, scopeSpans: u, schemaUrl: void 0 };
          n.push(p), s = i.next();
        }
        return n;
      }
    });
    Lp = l((N) => {
      "use strict";
      Object.defineProperty(N, "__esModule", { value: true });
      N.parseRetryAfterToMills = N.isExportRetryable = N.invalidTimeout = N.configureExporterTimeout = N.appendRootPathToUrlIfNeeded = N.appendResourcePathToUrl = N.parseHeaders = N.DEFAULT_EXPORT_BACKOFF_MULTIPLIER = N.DEFAULT_EXPORT_MAX_BACKOFF = N.DEFAULT_EXPORT_INITIAL_BACKOFF = N.DEFAULT_EXPORT_MAX_ATTEMPTS = void 0;
      var ku = (h(), m(d)), vp = A(), Ip = 1e4;
      N.DEFAULT_EXPORT_MAX_ATTEMPTS = 5;
      N.DEFAULT_EXPORT_INITIAL_BACKOFF = 1e3;
      N.DEFAULT_EXPORT_MAX_BACKOFF = 5e3;
      N.DEFAULT_EXPORT_BACKOFF_MULTIPLIER = 1.5;
      function DA(r = {}) {
        let e = {};
        return Object.entries(r).forEach(([t, n]) => {
          typeof n < "u" ? e[t] = String(n) : ku.diag.warn(`Header "${t}" has wrong value and will be ignored`);
        }), e;
      }
      N.parseHeaders = DA;
      function UA(r, e) {
        return r.endsWith("/") || (r = r + "/"), r + e;
      }
      N.appendResourcePathToUrl = UA;
      function BA(r) {
        try {
          let e = new URL(r);
          return e.pathname === "" && (e.pathname = e.pathname + "/"), e.toString();
        } catch {
          return ku.diag.warn(`Could not parse export URL: '${r}'`), r;
        }
      }
      N.appendRootPathToUrlIfNeeded = BA;
      function qA(r) {
        return typeof r == "number" ? r <= 0 ? $u(r, Ip) : r : GA();
      }
      N.configureExporterTimeout = qA;
      function GA() {
        var r;
        let e = Number((r = (0, vp.getEnv)().OTEL_EXPORTER_OTLP_TRACES_TIMEOUT) !== null && r !== void 0 ? r : (0, vp.getEnv)().OTEL_EXPORTER_OTLP_TIMEOUT);
        return e <= 0 ? $u(e, Ip) : e;
      }
      function $u(r, e) {
        return ku.diag.warn("Timeout must be greater than 0", r), e;
      }
      N.invalidTimeout = $u;
      function VA(r) {
        return [429, 502, 503, 504].includes(r);
      }
      N.isExportRetryable = VA;
      function HA(r) {
        if (r == null)
          return -1;
        let e = Number.parseInt(r, 10);
        if (Number.isInteger(e))
          return e > 0 ? e * 1e3 : -1;
        let t = new Date(r).getTime() - Date.now();
        return t >= 0 ? t : 0;
      }
      N.parseRetryAfterToMills = HA;
    });
    Np = l((vs) => {
      "use strict";
      Object.defineProperty(vs, "__esModule", { value: true });
      vs.OTLPExporterBase = void 0;
      var Mp = (h(), m(d)), qr = A(), jA = Lp(), Xu = class {
        constructor(e = {}) {
          this._sendingPromises = [], this.url = this.getDefaultUrl(e), typeof e.hostname == "string" && (this.hostname = e.hostname), this.shutdown = this.shutdown.bind(this), this._shutdownOnce = new qr.BindOnceFuture(this._shutdown, this), this._concurrencyLimit = typeof e.concurrencyLimit == "number" ? e.concurrencyLimit : 30, this.timeoutMillis = (0, jA.configureExporterTimeout)(e.timeoutMillis), this.onInit(e);
        }
        export(e, t) {
          if (this._shutdownOnce.isCalled) {
            t({ code: qr.ExportResultCode.FAILED, error: new Error("Exporter has been shutdown") });
            return;
          }
          if (this._sendingPromises.length >= this._concurrencyLimit) {
            t({ code: qr.ExportResultCode.FAILED, error: new Error("Concurrent export limit reached") });
            return;
          }
          this._export(e).then(() => {
            t({ code: qr.ExportResultCode.SUCCESS });
          }).catch((n) => {
            t({ code: qr.ExportResultCode.FAILED, error: n });
          });
        }
        _export(e) {
          return new Promise((t, n) => {
            try {
              Mp.diag.debug("items to be sent", e), this.send(e, t, n);
            } catch (i) {
              n(i);
            }
          });
        }
        shutdown() {
          return this._shutdownOnce.call();
        }
        forceFlush() {
          return Promise.all(this._sendingPromises).then(() => {
          });
        }
        _shutdown() {
          return Mp.diag.debug("shutdown started"), this.onShutdown(), this.forceFlush();
        }
      };
      vs.OTLPExporterBase = Xu;
    });
    Dp = l((Ny, xp) => {
      "use strict";
      xp.exports = $A;
      function $A(r, e) {
        for (var t = new Array(arguments.length - 1), n = 0, i = 2, s = true; i < arguments.length;)
          t[n++] = arguments[i++];
        return new Promise(function (a, u) {
          t[n] = function (_) {
            if (s)
              if (s = false, _)
                u(_);
              else {
                for (var p = new Array(arguments.length - 1), f = 0; f < p.length;)
                  p[f++] = arguments[f];
                a.apply(null, p);
              }
          };
          try {
            r.apply(e || null, t);
          } catch (c) {
            s && (s = false, u(c));
          }
        });
      }
    });
    Gp = l((qp) => {
      "use strict";
      var Ls = qp;
      Ls.length = function (e) {
        var t = e.length;
        if (!t)
          return 0;
        for (var n = 0; --t % 4 > 1 && e.charAt(t) === "=";)
          ++n;
        return Math.ceil(e.length * 3) / 4 - n;
      };
      var nr = new Array(64), Bp = new Array(123);
      for (ce = 0; ce < 64;)
        Bp[nr[ce] = ce < 26 ? ce + 65 : ce < 52 ? ce + 71 : ce < 62 ? ce - 4 : ce - 59 | 43] = ce++;
      var ce;
      Ls.encode = function (e, t, n) {
        for (var i = null, s = [], o = 0, a = 0, u; t < n;) {
          var c = e[t++];
          switch (a) {
            case 0:
              s[o++] = nr[c >> 2], u = (c & 3) << 4, a = 1;
              break;
            case 1:
              s[o++] = nr[u | c >> 4], u = (c & 15) << 2, a = 2;
              break;
            case 2:
              s[o++] = nr[u | c >> 6], s[o++] = nr[c & 63], a = 0;
              break;
          }
          o > 8191 && ((i || (i = [])).push(String.fromCharCode.apply(String, s)), o = 0);
        }
        return a && (s[o++] = nr[u], s[o++] = 61, a === 1 && (s[o++] = 61)), i ? (o && i.push(String.fromCharCode.apply(String, s.slice(0, o))), i.join("")) : String.fromCharCode.apply(String, s.slice(0, o));
      };
      var Up = "invalid encoding";
      Ls.decode = function (e, t, n) {
        for (var i = n, s = 0, o, a = 0; a < e.length;) {
          var u = e.charCodeAt(a++);
          if (u === 61 && s > 1)
            break;
          if ((u = Bp[u]) === void 0)
            throw Error(Up);
          switch (s) {
            case 0:
              o = u, s = 1;
              break;
            case 1:
              t[n++] = o << 2 | (u & 48) >> 4, o = u, s = 2;
              break;
            case 2:
              t[n++] = (o & 15) << 4 | (u & 60) >> 2, o = u, s = 3;
              break;
            case 3:
              t[n++] = (o & 3) << 6 | u, s = 0;
              break;
          }
        }
        if (s === 1)
          throw Error(Up);
        return n - i;
      };
      Ls.test = function (e) {
        return /^(?:[A-Za-z0-9+/]{4})*(?:[A-Za-z0-9+/]{2}==|[A-Za-z0-9+/]{3}=)?$/.test(e);
      };
    });
    Hp = l((wy, Vp) => {
      "use strict";
      Vp.exports = Ms;
      function Ms() {
        this._listeners = {};
      }
      Ms.prototype.on = function (e, t, n) {
        return (this._listeners[e] || (this._listeners[e] = [])).push({ fn: t, ctx: n || this }), this;
      };
      Ms.prototype.off = function (e, t) {
        if (e === void 0)
          this._listeners = {};
        else if (t === void 0)
          this._listeners[e] = [];
        else
          for (var n = this._listeners[e], i = 0; i < n.length;)
            n[i].fn === t ? n.splice(i, 1) : ++i;
        return this;
      };
      Ms.prototype.emit = function (e) {
        var t = this._listeners[e];
        if (t) {
          for (var n = [], i = 1; i < arguments.length;)
            n.push(arguments[i++]);
          for (i = 0; i < t.length;)
            t[i].fn.apply(t[i++].ctx, n);
        }
        return this;
      };
    });
    Kp = l((xy, Wp) => {
      "use strict";
      Wp.exports = jp(jp);
      function jp(r) {
        return typeof Float32Array < "u" ? function () {
          var e = new Float32Array([-0]), t = new Uint8Array(e.buffer), n = t[3] === 128;
          function i(u, c, _) {
            e[0] = u, c[_] = t[0], c[_ + 1] = t[1], c[_ + 2] = t[2], c[_ + 3] = t[3];
          }
          function s(u, c, _) {
            e[0] = u, c[_] = t[3], c[_ + 1] = t[2], c[_ + 2] = t[1], c[_ + 3] = t[0];
          }
          r.writeFloatLE = n ? i : s, r.writeFloatBE = n ? s : i;
          function o(u, c) {
            return t[0] = u[c], t[1] = u[c + 1], t[2] = u[c + 2], t[3] = u[c + 3], e[0];
          }
          function a(u, c) {
            return t[3] = u[c], t[2] = u[c + 1], t[1] = u[c + 2], t[0] = u[c + 3], e[0];
          }
          r.readFloatLE = n ? o : a, r.readFloatBE = n ? a : o;
        }() : function () {
          function e(n, i, s, o) {
            var a = i < 0 ? 1 : 0;
            if (a && (i = -i), i === 0)
              n(1 / i > 0 ? 0 : 2147483648, s, o);
            else if (isNaN(i))
              n(2143289344, s, o);
            else if (i > 34028234663852886e22)
              n((a << 31 | 2139095040) >>> 0, s, o);
            else if (i < 11754943508222875e-54)
              n((a << 31 | Math.round(i / 1401298464324817e-60)) >>> 0, s, o);
            else {
              var u = Math.floor(Math.log(i) / Math.LN2), c = Math.round(i * Math.pow(2, -u) * 8388608) & 8388607;
              n((a << 31 | u + 127 << 23 | c) >>> 0, s, o);
            }
          }
          r.writeFloatLE = e.bind(null, Fp), r.writeFloatBE = e.bind(null, kp);
          function t(n, i, s) {
            var o = n(i, s), a = (o >> 31) * 2 + 1, u = o >>> 23 & 255, c = o & 8388607;
            return u === 255 ? c ? NaN : a * (1 / 0) : u === 0 ? a * 1401298464324817e-60 * c : a * Math.pow(2, u - 150) * (c + 8388608);
          }
          r.readFloatLE = t.bind(null, $p), r.readFloatBE = t.bind(null, Xp);
        }(), typeof Float64Array < "u" ? function () {
          var e = new Float64Array([-0]), t = new Uint8Array(e.buffer), n = t[7] === 128;
          function i(u, c, _) {
            e[0] = u, c[_] = t[0], c[_ + 1] = t[1], c[_ + 2] = t[2], c[_ + 3] = t[3], c[_ + 4] = t[4], c[_ + 5] = t[5], c[_ + 6] = t[6], c[_ + 7] = t[7];
          }
          function s(u, c, _) {
            e[0] = u, c[_] = t[7], c[_ + 1] = t[6], c[_ + 2] = t[5], c[_ + 3] = t[4], c[_ + 4] = t[3], c[_ + 5] = t[2], c[_ + 6] = t[1], c[_ + 7] = t[0];
          }
          r.writeDoubleLE = n ? i : s, r.writeDoubleBE = n ? s : i;
          function o(u, c) {
            return t[0] = u[c], t[1] = u[c + 1], t[2] = u[c + 2], t[3] = u[c + 3], t[4] = u[c + 4], t[5] = u[c + 5], t[6] = u[c + 6], t[7] = u[c + 7], e[0];
          }
          function a(u, c) {
            return t[7] = u[c], t[6] = u[c + 1], t[5] = u[c + 2], t[4] = u[c + 3], t[3] = u[c + 4], t[2] = u[c + 5], t[1] = u[c + 6], t[0] = u[c + 7], e[0];
          }
          r.readDoubleLE = n ? o : a, r.readDoubleBE = n ? a : o;
        }() : function () {
          function e(n, i, s, o, a, u) {
            var c = o < 0 ? 1 : 0;
            if (c && (o = -o), o === 0)
              n(0, a, u + i), n(1 / o > 0 ? 0 : 2147483648, a, u + s);
            else if (isNaN(o))
              n(0, a, u + i), n(2146959360, a, u + s);
            else if (o > 17976931348623157e292)
              n(0, a, u + i), n((c << 31 | 2146435072) >>> 0, a, u + s);
            else {
              var _;
              if (o < 22250738585072014e-324)
                _ = o / 5e-324, n(_ >>> 0, a, u + i), n((c << 31 | _ / 4294967296) >>> 0, a, u + s);
              else {
                var p = Math.floor(Math.log(o) / Math.LN2);
                p === 1024 && (p = 1023), _ = o * Math.pow(2, -p), n(_ * 4503599627370496 >>> 0, a, u + i), n((c << 31 | p + 1023 << 20 | _ * 1048576 & 1048575) >>> 0, a, u + s);
              }
            }
          }
          r.writeDoubleLE = e.bind(null, Fp, 0, 4), r.writeDoubleBE = e.bind(null, kp, 4, 0);
          function t(n, i, s, o, a) {
            var u = n(o, a + i), c = n(o, a + s), _ = (c >> 31) * 2 + 1, p = c >>> 20 & 2047, f = 4294967296 * (c & 1048575) + u;
            return p === 2047 ? f ? NaN : _ * (1 / 0) : p === 0 ? _ * 5e-324 * f : _ * Math.pow(2, p - 1075) * (f + 4503599627370496);
          }
          r.readDoubleLE = t.bind(null, $p, 0, 4), r.readDoubleBE = t.bind(null, Xp, 4, 0);
        }(), r;
      }
      function Fp(r, e, t) {
        e[t] = r & 255, e[t + 1] = r >>> 8 & 255, e[t + 2] = r >>> 16 & 255, e[t + 3] = r >>> 24;
      }
      function kp(r, e, t) {
        e[t] = r >>> 24, e[t + 1] = r >>> 16 & 255, e[t + 2] = r >>> 8 & 255, e[t + 3] = r & 255;
      }
      function $p(r, e) {
        return (r[e] | r[e + 1] << 8 | r[e + 2] << 16 | r[e + 3] << 24) >>> 0;
      }
      function Xp(r, e) {
        return (r[e] << 24 | r[e + 1] << 16 | r[e + 2] << 8 | r[e + 3]) >>> 0;
      }
    });
    zp = l((exports, module) => {
      "use strict";
      module.exports = inquire;
      function inquire(moduleName) {
        try {
          var mod = eval("quire".replace(/^/, "re"))(moduleName);
          if (mod && (mod.length || Object.keys(mod).length))
            return mod;
        } catch (r) {
        }
        return null;
      }
    });
    Qp = l((Yp) => {
      "use strict";
      var Ku = Yp;
      Ku.length = function (e) {
        for (var t = 0, n = 0, i = 0; i < e.length; ++i)
          n = e.charCodeAt(i), n < 128 ? t += 1 : n < 2048 ? t += 2 : (n & 64512) === 55296 && (e.charCodeAt(i + 1) & 64512) === 56320 ? (++i, t += 4) : t += 3;
        return t;
      };
      Ku.read = function (e, t, n) {
        var i = n - t;
        if (i < 1)
          return "";
        for (var s = null, o = [], a = 0, u; t < n;)
          u = e[t++], u < 128 ? o[a++] = u : u > 191 && u < 224 ? o[a++] = (u & 31) << 6 | e[t++] & 63 : u > 239 && u < 365 ? (u = ((u & 7) << 18 | (e[t++] & 63) << 12 | (e[t++] & 63) << 6 | e[t++] & 63) - 65536, o[a++] = 55296 + (u >> 10), o[a++] = 56320 + (u & 1023)) : o[a++] = (u & 15) << 12 | (e[t++] & 63) << 6 | e[t++] & 63, a > 8191 && ((s || (s = [])).push(String.fromCharCode.apply(String, o)), a = 0);
        return s ? (a && s.push(String.fromCharCode.apply(String, o.slice(0, a))), s.join("")) : String.fromCharCode.apply(String, o.slice(0, a));
      };
      Ku.write = function (e, t, n) {
        for (var i = n, s, o, a = 0; a < e.length; ++a)
          s = e.charCodeAt(a), s < 128 ? t[n++] = s : s < 2048 ? (t[n++] = s >> 6 | 192, t[n++] = s & 63 | 128) : (s & 64512) === 55296 && ((o = e.charCodeAt(a + 1)) & 64512) === 56320 ? (s = 65536 + ((s & 1023) << 10) + (o & 1023), ++a, t[n++] = s >> 18 | 240, t[n++] = s >> 12 & 63 | 128, t[n++] = s >> 6 & 63 | 128, t[n++] = s & 63 | 128) : (t[n++] = s >> 12 | 224, t[n++] = s >> 6 & 63 | 128, t[n++] = s & 63 | 128);
        return n - i;
      };
    });
    Jp = l((Uy, Zp) => {
      "use strict";
      Zp.exports = XA;
      function XA(r, e, t) {
        var n = t || 8192, i = n >>> 1, s = null, o = n;
        return function (u) {
          if (u < 1 || u > i)
            return r(u);
          o + u > n && (s = r(n), o = 0);
          var c = e.call(s, o, o += u);
          return o & 7 && (o = (o | 7) + 1), c;
        };
      }
    });
    th = l((By, eh) => {
      "use strict";
      eh.exports = G;
      var Gr = qe();
      function G(r, e) {
        this.lo = r >>> 0, this.hi = e >>> 0;
      }
      var ct = G.zero = new G(0, 0);
      ct.toNumber = function () {
        return 0;
      };
      ct.zzEncode = ct.zzDecode = function () {
        return this;
      };
      ct.length = function () {
        return 1;
      };
      var WA = G.zeroHash = "\0\0\0\0\0\0\0\0";
      G.fromNumber = function (e) {
        if (e === 0)
          return ct;
        var t = e < 0;
        t && (e = -e);
        var n = e >>> 0, i = (e - n) / 4294967296 >>> 0;
        return t && (i = ~i >>> 0, n = ~n >>> 0, ++n > 4294967295 && (n = 0, ++i > 4294967295 && (i = 0))), new G(n, i);
      };
      G.from = function (e) {
        if (typeof e == "number")
          return G.fromNumber(e);
        if (Gr.isString(e))
          if (Gr.Long)
            e = Gr.Long.fromString(e);
          else
            return G.fromNumber(parseInt(e, 10));
        return e.low || e.high ? new G(e.low >>> 0, e.high >>> 0) : ct;
      };
      G.prototype.toNumber = function (e) {
        if (!e && this.hi >>> 31) {
          var t = ~this.lo + 1 >>> 0, n = ~this.hi >>> 0;
          return t || (n = n + 1 >>> 0), -(t + n * 4294967296);
        }
        return this.lo + this.hi * 4294967296;
      };
      G.prototype.toLong = function (e) {
        return Gr.Long ? new Gr.Long(this.lo | 0, this.hi | 0, !!e) : { low: this.lo | 0, high: this.hi | 0, unsigned: !!e };
      };
      var Be = String.prototype.charCodeAt;
      G.fromHash = function (e) {
        return e === WA ? ct : new G((Be.call(e, 0) | Be.call(e, 1) << 8 | Be.call(e, 2) << 16 | Be.call(e, 3) << 24) >>> 0, (Be.call(e, 4) | Be.call(e, 5) << 8 | Be.call(e, 6) << 16 | Be.call(e, 7) << 24) >>> 0);
      };
      G.prototype.toHash = function () {
        return String.fromCharCode(this.lo & 255, this.lo >>> 8 & 255, this.lo >>> 16 & 255, this.lo >>> 24, this.hi & 255, this.hi >>> 8 & 255, this.hi >>> 16 & 255, this.hi >>> 24);
      };
      G.prototype.zzEncode = function () {
        var e = this.hi >> 31;
        return this.hi = ((this.hi << 1 | this.lo >>> 31) ^ e) >>> 0, this.lo = (this.lo << 1 ^ e) >>> 0, this;
      };
      G.prototype.zzDecode = function () {
        var e = -(this.lo & 1);
        return this.lo = ((this.lo >>> 1 | this.hi << 31) ^ e) >>> 0, this.hi = (this.hi >>> 1 ^ e) >>> 0, this;
      };
      G.prototype.length = function () {
        var e = this.lo, t = (this.lo >>> 28 | this.hi << 4) >>> 0, n = this.hi >>> 24;
        return n === 0 ? t === 0 ? e < 16384 ? e < 128 ? 1 : 2 : e < 2097152 ? 3 : 4 : t < 16384 ? t < 128 ? 5 : 6 : t < 2097152 ? 7 : 8 : n < 128 ? 9 : 10;
      };
    });
    qe = l((zu) => {
      "use strict";
      var E = zu;
      E.asPromise = Dp();
      E.base64 = Gp();
      E.EventEmitter = Hp();
      E.float = Kp();
      E.inquire = zp();
      E.utf8 = Qp();
      E.pool = Jp();
      E.LongBits = th();
      E.isNode = !!(typeof global < "u" && global && global.process && global.process.versions && global.process.versions.node);
      E.global = E.isNode && global || typeof window < "u" && window || typeof self < "u" && self || zu;
      E.emptyArray = Object.freeze ? Object.freeze([]) : [];
      E.emptyObject = Object.freeze ? Object.freeze({}) : {};
      E.isInteger = Number.isInteger || function (e) {
        return typeof e == "number" && isFinite(e) && Math.floor(e) === e;
      };
      E.isString = function (e) {
        return typeof e == "string" || e instanceof String;
      };
      E.isObject = function (e) {
        return e && typeof e == "object";
      };
      E.isset = E.isSet = function (e, t) {
        var n = e[t];
        return n != null && e.hasOwnProperty(t) ? typeof n != "object" || (Array.isArray(n) ? n.length : Object.keys(n).length) > 0 : false;
      };
      E.Buffer = function () {
        try {
          var r = E.inquire("buffer").Buffer;
          return r.prototype.utf8Write ? r : null;
        } catch {
          return null;
        }
      }();
      E._Buffer_from = null;
      E._Buffer_allocUnsafe = null;
      E.newBuffer = function (e) {
        return typeof e == "number" ? E.Buffer ? E._Buffer_allocUnsafe(e) : new E.Array(e) : E.Buffer ? E._Buffer_from(e) : typeof Uint8Array > "u" ? e : new Uint8Array(e);
      };
      E.Array = typeof Uint8Array < "u" ? Uint8Array : Array;
      E.Long = E.global.dcodeIO && E.global.dcodeIO.Long || E.global.Long || E.inquire("long");
      E.key2Re = /^true|false|0|1$/;
      E.key32Re = /^-?(?:0|[1-9][0-9]*)$/;
      E.key64Re = /^(?:[\\x00-\\xff]{8}|-?(?:0|[1-9][0-9]*))$/;
      E.longToHash = function (e) {
        return e ? E.LongBits.from(e).toHash() : E.LongBits.zeroHash;
      };
      E.longFromHash = function (e, t) {
        var n = E.LongBits.fromHash(e);
        return E.Long ? E.Long.fromBits(n.lo, n.hi, t) : n.toNumber(!!t);
      };
      function rh(r, e, t) {
        for (var n = Object.keys(e), i = 0; i < n.length; ++i)
          (r[n[i]] === void 0 || !t) && (r[n[i]] = e[n[i]]);
        return r;
      }
      E.merge = rh;
      E.lcFirst = function (e) {
        return e.charAt(0).toLowerCase() + e.substring(1);
      };
      function nh(r) {
        function e(t, n) {
          if (!(this instanceof e))
            return new e(t, n);
          Object.defineProperty(this, "message", {
            get: function () {
              return t;
            }
          }), Error.captureStackTrace ? Error.captureStackTrace(this, e) : Object.defineProperty(this, "stack", { value: new Error().stack || "" }), n && rh(this, n);
        }
        return e.prototype = Object.create(Error.prototype, {
          constructor: { value: e, writable: true, enumerable: false, configurable: true }, name: {
            get: function () {
              return r;
            }, set: void 0, enumerable: false, configurable: true
          }, toString: {
            value: function () {
              return this.name + ": " + this.message;
            }, writable: true, enumerable: false, configurable: true
          }
        }), e;
      }
      E.newError = nh;
      E.ProtocolError = nh("ProtocolError");
      E.oneOfGetter = function (e) {
        for (var t = {}, n = 0; n < e.length; ++n)
          t[e[n]] = 1;
        return function () {
          for (var i = Object.keys(this), s = i.length - 1; s > -1; --s)
            if (t[i[s]] === 1 && this[i[s]] !== void 0 && this[i[s]] !== null)
              return i[s];
        };
      };
      E.oneOfSetter = function (e) {
        return function (t) {
          for (var n = 0; n < e.length; ++n)
            e[n] !== t && delete this[e[n]];
        };
      };
      E.toJSONOptions = { longs: String, enums: String, bytes: String, json: true };
      E._configure = function () {
        var r = E.Buffer;
        if (!r) {
          E._Buffer_from = E._Buffer_allocUnsafe = null;
          return;
        }
        E._Buffer_from = r.from !== Uint8Array.from && r.from || function (t, n) {
          return new r(t, n);
        }, E._Buffer_allocUnsafe = r.allocUnsafe || function (t) {
          return new r(t);
        };
      };
    });
    rc = l((Gy, ah) => {
      "use strict";
      ah.exports = O;
      var oe = qe(), Yu, Ns = oe.LongBits, ih = oe.base64, sh = oe.utf8;
      function Vr(r, e, t) {
        this.fn = r, this.len = e, this.next = void 0, this.val = t;
      }
      function Zu() {
      }
      function KA(r) {
        this.head = r.head, this.tail = r.tail, this.len = r.len, this.next = r.states;
      }
      function O() {
        this.len = 0, this.head = new Vr(Zu, 0, 0), this.tail = this.head, this.states = null;
      }
      var oh = function () {
        return oe.Buffer ? function () {
          return (O.create = function () {
            return new Yu();
          })();
        } : function () {
          return new O();
        };
      };
      O.create = oh();
      O.alloc = function (e) {
        return new oe.Array(e);
      };
      oe.Array !== Array && (O.alloc = oe.pool(O.alloc, oe.Array.prototype.subarray));
      O.prototype._push = function (e, t, n) {
        return this.tail = this.tail.next = new Vr(e, t, n), this.len += t, this;
      };
      function Ju(r, e, t) {
        e[t] = r & 255;
      }
      function zA(r, e, t) {
        for (; r > 127;)
          e[t++] = r & 127 | 128, r >>>= 7;
        e[t] = r;
      }
      function ec(r, e) {
        this.len = r, this.next = void 0, this.val = e;
      }
      ec.prototype = Object.create(Vr.prototype);
      ec.prototype.fn = zA;
      O.prototype.uint32 = function (e) {
        return this.len += (this.tail = this.tail.next = new ec((e = e >>> 0) < 128 ? 1 : e < 16384 ? 2 : e < 2097152 ? 3 : e < 268435456 ? 4 : 5, e)).len, this;
      };
      O.prototype.int32 = function (e) {
        return e < 0 ? this._push(tc, 10, Ns.fromNumber(e)) : this.uint32(e);
      };
      O.prototype.sint32 = function (e) {
        return this.uint32((e << 1 ^ e >> 31) >>> 0);
      };
      function tc(r, e, t) {
        for (; r.hi;)
          e[t++] = r.lo & 127 | 128, r.lo = (r.lo >>> 7 | r.hi << 25) >>> 0, r.hi >>>= 7;
        for (; r.lo > 127;)
          e[t++] = r.lo & 127 | 128, r.lo = r.lo >>> 7;
        e[t++] = r.lo;
      }
      O.prototype.uint64 = function (e) {
        var t = Ns.from(e);
        return this._push(tc, t.length(), t);
      };
      O.prototype.int64 = O.prototype.uint64;
      O.prototype.sint64 = function (e) {
        var t = Ns.from(e).zzEncode();
        return this._push(tc, t.length(), t);
      };
      O.prototype.bool = function (e) {
        return this._push(Ju, 1, e ? 1 : 0);
      };
      function Qu(r, e, t) {
        e[t] = r & 255, e[t + 1] = r >>> 8 & 255, e[t + 2] = r >>> 16 & 255, e[t + 3] = r >>> 24;
      }
      O.prototype.fixed32 = function (e) {
        return this._push(Qu, 4, e >>> 0);
      };
      O.prototype.sfixed32 = O.prototype.fixed32;
      O.prototype.fixed64 = function (e) {
        var t = Ns.from(e);
        return this._push(Qu, 4, t.lo)._push(Qu, 4, t.hi);
      };
      O.prototype.sfixed64 = O.prototype.fixed64;
      O.prototype.float = function (e) {
        return this._push(oe.float.writeFloatLE, 4, e);
      };
      O.prototype.double = function (e) {
        return this._push(oe.float.writeDoubleLE, 8, e);
      };
      var YA = oe.Array.prototype.set ? function (e, t, n) {
        t.set(e, n);
      } : function (e, t, n) {
        for (var i = 0; i < e.length; ++i)
          t[n + i] = e[i];
      };
      O.prototype.bytes = function (e) {
        var t = e.length >>> 0;
        if (!t)
          return this._push(Ju, 1, 0);
        if (oe.isString(e)) {
          var n = O.alloc(t = ih.length(e));
          ih.decode(e, n, 0), e = n;
        }
        return this.uint32(t)._push(YA, t, e);
      };
      O.prototype.string = function (e) {
        var t = sh.length(e);
        return t ? this.uint32(t)._push(sh.write, t, e) : this._push(Ju, 1, 0);
      };
      O.prototype.fork = function () {
        return this.states = new KA(this), this.head = this.tail = new Vr(Zu, 0, 0), this.len = 0, this;
      };
      O.prototype.reset = function () {
        return this.states ? (this.head = this.states.head, this.tail = this.states.tail, this.len = this.states.len, this.states = this.states.next) : (this.head = this.tail = new Vr(Zu, 0, 0), this.len = 0), this;
      };
      O.prototype.ldelim = function () {
        var e = this.head, t = this.tail, n = this.len;
        return this.reset().uint32(n), n && (this.tail.next = e.next, this.tail = t, this.len += n), this;
      };
      O.prototype.finish = function () {
        for (var e = this.head.next, t = this.constructor.alloc(this.len), n = 0; e;)
          e.fn(e.val, t, n), n += e.len, e = e.next;
        return t;
      };
      O._configure = function (r) {
        Yu = r, O.create = oh(), Yu._configure();
      };
    });
    lh = l((Vy, ch) => {
      "use strict";
      ch.exports = ge;
      var uh = rc();
      (ge.prototype = Object.create(uh.prototype)).constructor = ge;
      var Ge = qe();
      function ge() {
        uh.call(this);
      }
      ge._configure = function () {
        ge.alloc = Ge._Buffer_allocUnsafe, ge.writeBytesBuffer = Ge.Buffer && Ge.Buffer.prototype instanceof Uint8Array && Ge.Buffer.prototype.set.name === "set" ? function (e, t, n) {
          t.set(e, n);
        } : function (e, t, n) {
          if (e.copy)
            e.copy(t, n, 0, e.length);
          else
            for (var i = 0; i < e.length;)
              t[n++] = e[i++];
        };
      };
      ge.prototype.bytes = function (e) {
        Ge.isString(e) && (e = Ge._Buffer_from(e, "base64"));
        var t = e.length >>> 0;
        return this.uint32(t), t && this._push(ge.writeBytesBuffer, t, e), this;
      };
      function QA(r, e, t) {
        r.length < 40 ? Ge.utf8.write(r, e, t) : e.utf8Write ? e.utf8Write(r, t) : e.write(r, t);
      }
      ge.prototype.string = function (e) {
        var t = Ge.Buffer.byteLength(e);
        return this.uint32(t), t && this._push(QA, t, e), this;
      };
      ge._configure();
    });
    sc = l((Hy, fh) => {
      "use strict";
      fh.exports = x;
      var le = qe(), ic, ph = le.LongBits, ZA = le.utf8;
      function de(r, e) {
        return RangeError("index out of range: " + r.pos + " + " + (e || 1) + " > " + r.len);
      }
      function x(r) {
        this.buf = r, this.pos = 0, this.len = r.length;
      }
      var dh = typeof Uint8Array < "u" ? function (e) {
        if (e instanceof Uint8Array || Array.isArray(e))
          return new x(e);
        throw Error("illegal buffer");
      } : function (e) {
        if (Array.isArray(e))
          return new x(e);
        throw Error("illegal buffer");
      }, hh = function () {
        return le.Buffer ? function (t) {
          return (x.create = function (i) {
            return le.Buffer.isBuffer(i) ? new ic(i) : dh(i);
          })(t);
        } : dh;
      };
      x.create = hh();
      x.prototype._slice = le.Array.prototype.subarray || le.Array.prototype.slice;
      x.prototype.uint32 = /* @__PURE__ */ function () {
        var e = 4294967295;
        return function () {
          if (e = (this.buf[this.pos] & 127) >>> 0, this.buf[this.pos++] < 128 || (e = (e | (this.buf[this.pos] & 127) << 7) >>> 0, this.buf[this.pos++] < 128) || (e = (e | (this.buf[this.pos] & 127) << 14) >>> 0, this.buf[this.pos++] < 128) || (e = (e | (this.buf[this.pos] & 127) << 21) >>> 0, this.buf[this.pos++] < 128) || (e = (e | (this.buf[this.pos] & 15) << 28) >>> 0, this.buf[this.pos++] < 128))
            return e;
          if ((this.pos += 5) > this.len)
            throw this.pos = this.len, de(this, 10);
          return e;
        };
      }();
      x.prototype.int32 = function () {
        return this.uint32() | 0;
      };
      x.prototype.sint32 = function () {
        var e = this.uint32();
        return e >>> 1 ^ -(e & 1) | 0;
      };
      function nc() {
        var r = new ph(0, 0), e = 0;
        if (this.len - this.pos > 4) {
          for (; e < 4; ++e)
            if (r.lo = (r.lo | (this.buf[this.pos] & 127) << e * 7) >>> 0, this.buf[this.pos++] < 128)
              return r;
          if (r.lo = (r.lo | (this.buf[this.pos] & 127) << 28) >>> 0, r.hi = (r.hi | (this.buf[this.pos] & 127) >> 4) >>> 0, this.buf[this.pos++] < 128)
            return r;
          e = 0;
        } else {
          for (; e < 3; ++e) {
            if (this.pos >= this.len)
              throw de(this);
            if (r.lo = (r.lo | (this.buf[this.pos] & 127) << e * 7) >>> 0, this.buf[this.pos++] < 128)
              return r;
          }
          return r.lo = (r.lo | (this.buf[this.pos++] & 127) << e * 7) >>> 0, r;
        }
        if (this.len - this.pos > 4) {
          for (; e < 5; ++e)
            if (r.hi = (r.hi | (this.buf[this.pos] & 127) << e * 7 + 3) >>> 0, this.buf[this.pos++] < 128)
              return r;
        } else
          for (; e < 5; ++e) {
            if (this.pos >= this.len)
              throw de(this);
            if (r.hi = (r.hi | (this.buf[this.pos] & 127) << e * 7 + 3) >>> 0, this.buf[this.pos++] < 128)
              return r;
          }
        throw Error("invalid varint encoding");
      }
      x.prototype.bool = function () {
        return this.uint32() !== 0;
      };
      function Cs(r, e) {
        return (r[e - 4] | r[e - 3] << 8 | r[e - 2] << 16 | r[e - 1] << 24) >>> 0;
      }
      x.prototype.fixed32 = function () {
        if (this.pos + 4 > this.len)
          throw de(this, 4);
        return Cs(this.buf, this.pos += 4);
      };
      x.prototype.sfixed32 = function () {
        if (this.pos + 4 > this.len)
          throw de(this, 4);
        return Cs(this.buf, this.pos += 4) | 0;
      };
      function _h() {
        if (this.pos + 8 > this.len)
          throw de(this, 8);
        return new ph(Cs(this.buf, this.pos += 4), Cs(this.buf, this.pos += 4));
      }
      x.prototype.float = function () {
        if (this.pos + 4 > this.len)
          throw de(this, 4);
        var e = le.float.readFloatLE(this.buf, this.pos);
        return this.pos += 4, e;
      };
      x.prototype.double = function () {
        if (this.pos + 8 > this.len)
          throw de(this, 4);
        var e = le.float.readDoubleLE(this.buf, this.pos);
        return this.pos += 8, e;
      };
      x.prototype.bytes = function () {
        var e = this.uint32(), t = this.pos, n = this.pos + e;
        if (n > this.len)
          throw de(this, e);
        if (this.pos += e, Array.isArray(this.buf))
          return this.buf.slice(t, n);
        if (t === n) {
          var i = le.Buffer;
          return i ? i.alloc(0) : new this.buf.constructor(0);
        }
        return this._slice.call(this.buf, t, n);
      };
      x.prototype.string = function () {
        var e = this.bytes();
        return ZA.read(e, 0, e.length);
      };
      x.prototype.skip = function (e) {
        if (typeof e == "number") {
          if (this.pos + e > this.len)
            throw de(this, e);
          this.pos += e;
        } else
          do
            if (this.pos >= this.len)
              throw de(this);
          while (this.buf[this.pos++] & 128);
        return this;
      };
      x.prototype.skipType = function (r) {
        switch (r) {
          case 0:
            this.skip();
            break;
          case 1:
            this.skip(8);
            break;
          case 2:
            this.skip(this.uint32());
            break;
          case 3:
            for (; (r = this.uint32() & 7) !== 4;)
              this.skipType(r);
            break;
          case 5:
            this.skip(4);
            break;
          default:
            throw Error("invalid wire type " + r + " at offset " + this.pos);
        }
        return this;
      };
      x._configure = function (r) {
        ic = r, x.create = hh(), ic._configure();
        var e = le.Long ? "toLong" : "toNumber";
        le.merge(x.prototype, {
          int64: function () {
            return nc.call(this)[e](false);
          }, uint64: function () {
            return nc.call(this)[e](true);
          }, sint64: function () {
            return nc.call(this).zzDecode()[e](false);
          }, fixed64: function () {
            return _h.call(this)[e](true);
          }, sfixed64: function () {
            return _h.call(this)[e](false);
          }
        });
      };
    });
    Th = l((jy, gh) => {
      "use strict";
      gh.exports = lt;
      var mh = sc();
      (lt.prototype = Object.create(mh.prototype)).constructor = lt;
      var Eh = qe();
      function lt(r) {
        mh.call(this, r);
      }
      lt._configure = function () {
        Eh.Buffer && (lt.prototype._slice = Eh.Buffer.prototype.slice);
      };
      lt.prototype.string = function () {
        var e = this.uint32();
        return this.buf.utf8Slice ? this.buf.utf8Slice(this.pos, this.pos = Math.min(this.pos + e, this.len)) : this.buf.toString("utf-8", this.pos, this.pos = Math.min(this.pos + e, this.len));
      };
      lt._configure();
    });
    Ah = l((Fy, Sh) => {
      "use strict";
      Sh.exports = Hr;
      var oc = qe();
      (Hr.prototype = Object.create(oc.EventEmitter.prototype)).constructor = Hr;
      function Hr(r, e, t) {
        if (typeof r != "function")
          throw TypeError("rpcImpl must be a function");
        oc.EventEmitter.call(this), this.rpcImpl = r, this.requestDelimited = !!e, this.responseDelimited = !!t;
      }
      Hr.prototype.rpcCall = function r(e, t, n, i, s) {
        if (!i)
          throw TypeError("request must be specified");
        var o = this;
        if (!s)
          return oc.asPromise(r, o, e, t, n, i);
        if (!o.rpcImpl) {
          setTimeout(function () {
            s(Error("already ended"));
          }, 0);
          return;
        }
        try {
          return o.rpcImpl(e, t[o.requestDelimited ? "encodeDelimited" : "encode"](i).finish(), function (u, c) {
            if (u)
              return o.emit("error", u, e), s(u);
            if (c === null) {
              o.end(true);
              return;
            }
            if (!(c instanceof n))
              try {
                c = n[o.responseDelimited ? "decodeDelimited" : "decode"](c);
              } catch (_) {
                return o.emit("error", _, e), s(_);
              }
            return o.emit("data", c, e), s(null, c);
          });
        } catch (a) {
          o.emit("error", a, e), setTimeout(function () {
            s(a);
          }, 0);
          return;
        }
      };
      Hr.prototype.end = function (e) {
        return this.rpcImpl && (e || this.rpcImpl(null, null, null), this.rpcImpl = null, this.emit("end").off()), this;
      };
    });
    Rh = l((Oh) => {
      "use strict";
      var JA = Oh;
      JA.Service = Ah();
    });
    Ph = l(($y, bh) => {
      "use strict";
      bh.exports = {};
    });
    Ih = l((vh) => {
      "use strict";
      var J = vh;
      J.build = "minimal";
      J.Writer = rc();
      J.BufferWriter = lh();
      J.Reader = sc();
      J.BufferReader = Th();
      J.util = qe();
      J.rpc = Rh();
      J.roots = Ph();
      J.configure = yh;
      function yh() {
        J.util._configure(), J.Writer._configure(J.BufferWriter), J.Reader._configure(J.BufferReader);
      }
      yh();
    });
    Mh = l((Wy, Lh) => {
      "use strict";
      Lh.exports = Ih();
    });
    Vh = l((Gh) => {
      "use strict";
      Object.defineProperty(Gh, "__esModule", { value: true });
    });
    jh = l((Hh) => {
      "use strict";
      Object.defineProperty(Hh, "__esModule", { value: true });
    });
    kh = l((Fh) => {
      "use strict";
      Object.defineProperty(Fh, "__esModule", { value: true });
    });
    $h = l((Fr) => {
      "use strict";
      Object.defineProperty(Fr, "__esModule", { value: true });
      Fr.ESpanKind = void 0;
      var gO;
      (function (r) {
        r[r.SPAN_KIND_UNSPECIFIED = 0] = "SPAN_KIND_UNSPECIFIED", r[r.SPAN_KIND_INTERNAL = 1] = "SPAN_KIND_INTERNAL", r[r.SPAN_KIND_SERVER = 2] = "SPAN_KIND_SERVER", r[r.SPAN_KIND_CLIENT = 3] = "SPAN_KIND_CLIENT", r[r.SPAN_KIND_PRODUCER = 4] = "SPAN_KIND_PRODUCER", r[r.SPAN_KIND_CONSUMER = 5] = "SPAN_KIND_CONSUMER";
      })(gO = Fr.ESpanKind || (Fr.ESpanKind = {}));
    });
    Wh = l((Xh) => {
      "use strict";
      Object.defineProperty(Xh, "__esModule", { value: true });
    });
    Zh = l((Ve) => {
      "use strict";
      Object.defineProperty(Ve, "__esModule", { value: true });
      Ve.toMetric = Ve.toScopeMetrics = Ve.toResourceMetrics = void 0;
      var Kh = (h(), m(d)), or = wu(), Ds = Ur(), TO = Br();
      function SO(r, e) {
        let t = (0, TO.getOtlpEncoder)(e);
        return { resource: { attributes: (0, Ds.toAttributes)(r.resource.attributes), droppedAttributesCount: 0 }, schemaUrl: void 0, scopeMetrics: Yh(r.scopeMetrics, t) };
      }
      Ve.toResourceMetrics = SO;
      function Yh(r, e) {
        return Array.from(r.map((t) => ({ scope: { name: t.scope.name, version: t.scope.version }, metrics: t.metrics.map((n) => Qh(n, e)), schemaUrl: t.scope.schemaUrl })));
      }
      Ve.toScopeMetrics = Yh;
      function Qh(r, e) {
        let t = { name: r.descriptor.name, description: r.descriptor.description, unit: r.descriptor.unit }, n = bO(r.aggregationTemporality);
        switch (r.dataPointType) {
          case or.DataPointType.SUM:
            t.sum = { aggregationTemporality: n, isMonotonic: r.isMonotonic, dataPoints: zh(r, e) };
            break;
          case or.DataPointType.GAUGE:
            t.gauge = { dataPoints: zh(r, e) };
            break;
          case or.DataPointType.HISTOGRAM:
            t.histogram = { aggregationTemporality: n, dataPoints: OO(r, e) };
            break;
          case or.DataPointType.EXPONENTIAL_HISTOGRAM:
            t.exponentialHistogram = { aggregationTemporality: n, dataPoints: RO(r, e) };
            break;
        }
        return t;
      }
      Ve.toMetric = Qh;
      function AO(r, e, t) {
        let n = { attributes: (0, Ds.toAttributes)(r.attributes), startTimeUnixNano: t.encodeHrTime(r.startTime), timeUnixNano: t.encodeHrTime(r.endTime) };
        switch (e) {
          case Kh.ValueType.INT:
            n.asInt = r.value;
            break;
          case Kh.ValueType.DOUBLE:
            n.asDouble = r.value;
            break;
        }
        return n;
      }
      function zh(r, e) {
        return r.dataPoints.map((t) => AO(t, r.descriptor.valueType, e));
      }
      function OO(r, e) {
        return r.dataPoints.map((t) => {
          let n = t.value;
          return { attributes: (0, Ds.toAttributes)(t.attributes), bucketCounts: n.buckets.counts, explicitBounds: n.buckets.boundaries, count: n.count, sum: n.sum, min: n.min, max: n.max, startTimeUnixNano: e.encodeHrTime(t.startTime), timeUnixNano: e.encodeHrTime(t.endTime) };
        });
      }
      function RO(r, e) {
        return r.dataPoints.map((t) => {
          let n = t.value;
          return { attributes: (0, Ds.toAttributes)(t.attributes), count: n.count, min: n.min, max: n.max, sum: n.sum, positive: { offset: n.positive.offset, bucketCounts: n.positive.bucketCounts }, negative: { offset: n.negative.offset, bucketCounts: n.negative.bucketCounts }, scale: n.scale, zeroCount: n.zeroCount, startTimeUnixNano: e.encodeHrTime(t.startTime), timeUnixNano: e.encodeHrTime(t.endTime) };
        });
      }
      function bO(r) {
        switch (r) {
          case or.AggregationTemporality.DELTA:
            return 1;
          case or.AggregationTemporality.CUMULATIVE:
            return 2;
        }
      }
    });
    Jh = l((Us) => {
      "use strict";
      Object.defineProperty(Us, "__esModule", { value: true });
      Us.createExportMetricsServiceRequest = void 0;
      var PO = Zh();
      function yO(r, e) {
        return { resourceMetrics: r.map((t) => (0, PO.toResourceMetrics)(t, e)) };
      }
      Us.createExportMetricsServiceRequest = yO;
    });
    tf = l((ar) => {
      "use strict";
      Object.defineProperty(ar, "__esModule", { value: true });
      ar.toLogAttributes = ar.createExportLogsServiceRequest = void 0;
      var vO = Br(), lc = Ur();
      function IO(r, e) {
        let t = (0, vO.getOtlpEncoder)(e);
        return { resourceLogs: MO(r, t) };
      }
      ar.createExportLogsServiceRequest = IO;
      function LO(r) {
        let e = /* @__PURE__ */ new Map();
        for (let t of r) {
          let { resource: n, instrumentationScope: { name: i, version: s = "", schemaUrl: o = "" } } = t, a = e.get(n);
          a || (a = /* @__PURE__ */ new Map(), e.set(n, a));
          let u = `${i}@${s}:${o}`, c = a.get(u);
          c || (c = [], a.set(u, c)), c.push(t);
        }
        return e;
      }
      function MO(r, e) {
        let t = LO(r);
        return Array.from(t, ([n, i]) => ({
          resource: { attributes: (0, lc.toAttributes)(n.attributes), droppedAttributesCount: 0 }, scopeLogs: Array.from(i, ([, s]) => {
            let { instrumentationScope: { name: o, version: a, schemaUrl: u } } = s[0];
            return { scope: { name: o, version: a }, logRecords: s.map((c) => NO(c, e)), schemaUrl: u };
          }), schemaUrl: void 0
        }));
      }
      function NO(r, e) {
        var t, n, i;
        return { timeUnixNano: e.encodeHrTime(r.hrTime), observedTimeUnixNano: e.encodeHrTime(r.hrTimeObserved), severityNumber: r.severityNumber, severityText: r.severityText, body: (0, lc.toAnyValue)(r.body), attributes: ef(r.attributes), droppedAttributesCount: r.droppedAttributesCount, flags: (t = r.spanContext) === null || t === void 0 ? void 0 : t.traceFlags, traceId: e.encodeOptionalSpanContext((n = r.spanContext) === null || n === void 0 ? void 0 : n.traceId), spanId: e.encodeOptionalSpanContext((i = r.spanContext) === null || i === void 0 ? void 0 : i.spanId) };
      }
      function ef(r) {
        return Object.keys(r).map((e) => (0, lc.toKeyValue)(e, r[e]));
      }
      ar.toLogAttributes = ef;
    });
    rf = l((V) => {
      "use strict";
      var CO = V && V.__createBinding || (Object.create ? function (r, e, t, n) {
        n === void 0 && (n = t), Object.defineProperty(r, n, {
          enumerable: true, get: function () {
            return e[t];
          }
        });
      } : function (r, e, t, n) {
        n === void 0 && (n = t), r[n] = e[t];
      }), ur = V && V.__exportStar || function (r, e) {
        for (var t in r)
          t !== "default" && !Object.prototype.hasOwnProperty.call(e, t) && CO(e, r, t);
      };
      Object.defineProperty(V, "__esModule", { value: true });
      V.createExportLogsServiceRequest = V.createExportMetricsServiceRequest = V.createExportTraceServiceRequest = void 0;
      ur(Vh(), V);
      ur(Br(), V);
      ur(jh(), V);
      ur(kh(), V);
      ur($h(), V);
      ur(Wh(), V);
      var wO = ys();
      Object.defineProperty(V, "createExportTraceServiceRequest", {
        enumerable: true, get: function () {
          return wO.createExportTraceServiceRequest;
        }
      });
      var xO = Jh();
      Object.defineProperty(V, "createExportMetricsServiceRequest", {
        enumerable: true, get: function () {
          return xO.createExportMetricsServiceRequest;
        }
      });
      var DO = tf();
      Object.defineProperty(V, "createExportLogsServiceRequest", {
        enumerable: true, get: function () {
          return DO.createExportLogsServiceRequest;
        }
      });
    });
    C = Y(la(), 1);
    h();
    fa();
    af = Y(Gd(), 1);
    lr = Y(rt(), 1);
    uf = Y(t_(), 1);
    cf = Y(wu(), 1);
    Vs = Y(Yr(), 1);
    lf = Y(up(), 1);
    He = Y(A(), 1);
    cp = "http.method";
    lp = "http.url";
    As = "http.host";
    dp = "http.scheme";
    Uu = "http.status_code";
    _p = "http.user_agent";
    Bu = "http.response_content_length_uncompressed";
    pp = "net.peer.port";
    hp = "net.peer.name";
    fp = "service.name";
    Ep = "service.version";
    h();
    gA = Symbol.for("@vercel/request-context");
    TA = {
      keys(r) {
        return [];
      }, get(r, e) {
        return r[e.toLocaleLowerCase()];
      }
    };
    h();
    Rs = class {
      constructor(e, t) {
        this.processors = e;
        this.attributesFromHeaders = t;
        this.rootSpanIds = /* @__PURE__ */ new Map();
        this.waitSpanEnd = /* @__PURE__ */ new Map();
      }
      forceFlush() {
        return Promise.all(this.processors.map((e) => e.forceFlush().catch((t) => {
          d.diag.error("@vercel/otel: forceFlush failed:", t);
        }))).then(() => {
        });
      }
      shutdown() {
        return Promise.all(this.processors.map((e) => e.shutdown().catch(() => {
        }))).then(() => {
        });
      }
      onStart(e, t) {
        let { traceId: n, spanId: i, traceFlags: s } = e.spanContext(), o = !e.parentSpanId || !this.rootSpanIds.has(n);
        if (o ? this.rootSpanIds.set(n, { rootSpanId: i, open: [] }) : this.rootSpanIds.get(n)?.open.push(e), o && er(s)) {
          let a = me(), u = gp(a, this.attributesFromHeaders);
          u && e.setAttributes(u), a && a.waitUntil(async () => {
            if (this.rootSpanIds.has(n)) {
              let c = new Promise((p) => {
                this.waitSpanEnd.set(n, p);
              }), _;
              await Promise.race([c, new Promise((p) => {
                _ = setTimeout(() => {
                  this.waitSpanEnd.delete(n), p(void 0);
                }, 50);
              })]), _ && clearTimeout(_);
            }
            return this.forceFlush();
          });
        }
        for (let a of this.processors)
          a.onStart(e, t);
      }
      onEnd(e) {
        let { traceId: t, spanId: n, traceFlags: i } = e.spanContext(), s = er(i), o = this.rootSpanIds.get(t), a = o?.rootSpanId === n;
        if (s) {
          let u = OA(e);
          u && Object.assign(e.attributes, u);
        }
        if (a) {
          if (this.rootSpanIds.delete(t), o.open.length > 0) {
            for (let u of o.open)
              if (!u.ended && u.spanContext().spanId !== n)
                try {
                  u.end();
                } catch (c) {
                  d.diag.error("@vercel/otel: onEnd failed:", c);
                }
          }
        } else if (o)
          for (let u = 0; u < o.open.length; u++)
            o.open[u]?.spanContext().spanId === n && o.open.splice(u, 1);
        for (let u of this.processors)
          u.onEnd(e);
        if (a) {
          let u = this.waitSpanEnd.get(t);
          u && (this.waitSpanEnd.delete(t), u());
        }
      }
    };
    AA = { [d.SpanKind.INTERNAL]: "internal", [d.SpanKind.SERVER]: "server", [d.SpanKind.CLIENT]: "client", [d.SpanKind.PRODUCER]: "producer", [d.SpanKind.CONSUMER]: "consumer" };
    wp = Y(ys(), 1);
    Cp = Y(Np(), 1);
    h();
    tr = class extends Cp.OTLPExporterBase {
      constructor(e = {}) {
        super(e), e.headers && (this._headers = e.headers);
      }
      onShutdown() {
        d.diag.debug("@vercel/otel/otlp: onShutdown");
      }
      onInit() {
        d.diag.debug("@vercel/otel/otlp: onInit");
      }
      send(e, t, n) {
        if (this._shutdownOnce.isCalled) {
          d.diag.debug("@vercel/otel/otlp: Shutdown already started. Cannot send objects");
          return;
        }
        let i = this.convert(e), s, o, a;
        try {
          ({ body: s, contentType: o, headers: a } = this.toMessage(i));
        } catch (c) {
          d.diag.warn("@vercel/otel/otlp: no proto", c);
          return;
        }
        let u = fetch(this.url, { method: "POST", body: s, headers: { ...this._headers, ...a, "Content-Type": o, "User-Agent": "OTel-OTLP-Exporter-JavaScript/0.46.0" }, next: { internal: true } }).then((c) => {
          d.diag.debug("@vercel/otel/otlp: onSuccess", c.status, c.statusText), t(), c.arrayBuffer().catch(() => {
          });
        }).catch((c) => {
          d.diag.error("@vercel/otel/otlp: onError", c), n(c);
        }).finally(() => {
          let c = this._sendingPromises.indexOf(u);
          this._sendingPromises.splice(c, 1);
        });
        this._sendingPromises.push(u);
      }
      getDefaultUrl(e) {
        throw new Error("Method not implemented.");
      }
    };
    FA = "v1/traces";
    kA = `http://localhost:4318/${FA}`;
    rr = class {
      constructor(e = {}) {
        this.impl = new Wu(e);
      }
      export(e, t) {
        this.impl.export(e, t);
      }
      shutdown() {
        return this.impl.shutdown();
      }
      forceFlush() {
        return this.impl.forceFlush();
      }
    };
    Wu = class extends tr {
      convert(e) {
        return (0, wp.createExportTraceServiceRequest)(e, { useHex: true, useLongBits: false });
      }
      toMessage(e) {
        return { body: JSON.stringify(e), contentType: "application/json" };
      }
      getDefaultUrl(e) {
        return Is(e);
      }
    };
    xh = Y(ys(), 1);
    Nh = Y(Mh(), 1);
    dt = class {
      constructor(e = {}) {
        this.impl = new ac(e);
      }
      export(e, t) {
        this.impl.export(e, t);
      }
      shutdown() {
        return this.impl.shutdown();
      }
      forceFlush() {
        return this.impl.forceFlush();
      }
    };
    ac = class extends tr {
      convert(e) {
        return (0, xh.createExportTraceServiceRequest)(e, void 0);
      }
      toMessage(e) {
        return { body: Ch(e), contentType: "application/x-protobuf", headers: { accept: "application/x-protobuf" } };
      }
      getDefaultUrl(e) {
        return Is(e);
      }
    };
    h();
    sr = class {
      constructor(e = {}) {
        this.instrumentationName = "@vercel/otel/fetch";
        this.instrumentationVersion = "1.0.0";
        this.config = e;
      }
      getConfig() {
        return this.config;
      }
      setConfig() {
      }
      setTracerProvider(e) {
        this.tracerProvider = e;
      }
      setMeterProvider() {
      }
      shouldIgnore(e, t) {
        let n = this.config.ignoreUrls ?? [];
        if (t?.opentelemetry?.ignore !== void 0)
          return t.opentelemetry.ignore;
        if (n.length === 0)
          return false;
        let i = e.toString();
        return n.some((s) => typeof s == "string" ? s === "*" ? true : i.startsWith(s) : s.test(i));
      }
      shouldPropagate(e, t) {
        let n = process.env.VERCEL_URL || process.env.NEXT_PUBLIC_VERCEL_URL || null, i = process.env.VERCEL_BRANCH_URL || process.env.NEXT_PUBLIC_VERCEL_BRANCH_URL || null, s = this.config.propagateContextUrls ?? [], o = this.config.dontPropagateContextUrls ?? [];
        if (t?.opentelemetry?.propagateContext)
          return t.opentelemetry.propagateContext;
        let a = e.toString();
        return o.length > 0 && o.some((u) => typeof u == "string" ? u === "*" ? true : a.startsWith(u) : u.test(a)) ? false : n && e.protocol === "https:" && (e.host === n || e.host === i || e.host === me()?.headers.host) || !n && e.protocol === "http:" && e.hostname === "localhost" ? true : s.some((u) => typeof u == "string" ? u === "*" ? true : a.startsWith(u) : u.test(a));
      }
      startSpan({ tracer: e, url: t, fetchType: n, method: i = "GET", name: s, attributes: o = {} }) {
        let a = this.config.resourceNameTemplate, u = { [cp]: i, [lp]: t.toString(), [As]: t.host, [dp]: t.protocol.replace(":", ""), [hp]: t.hostname, [pp]: t.port }, c = a ? Dh(a, u) : pO(t.toString()), _ = s ?? `${n} ${i} ${t.toString()}`, p = d.context.active();
        return e.startSpan(_, { kind: d.SpanKind.CLIENT, attributes: { ...u, "operation.name": `${n}.${i}`, "http.client.name": n, "resource.name": c, ...o } }, p);
      }
      instrumentHttp(e, t) {
        let { tracerProvider: n } = this;
        if (!n)
          return;
        let i = n.getTracer(this.instrumentationName, this.instrumentationVersion), { attributesFromRequestHeaders: s, attributesFromResponseHeaders: o } = this.config, a = e.request, u = e.get, c = (_) => (p, f, L) => {
          let R, w = {}, U;
          if (typeof p == "string" || p instanceof URL ? (R = new URL(p.toString()), typeof f == "function" ? U = f : f && typeof L == "function" ? (w = f, U = L) : f && (w = f)) : (w = p, typeof f == "function" && (U = f), R = fO(w, t)), this.shouldIgnore(R))
            return _.apply(this, [R, w, U]);
          let S = this.startSpan({ tracer: i, url: R, fetchType: "http", method: w.method || "GET" });
          if (!S.isRecording() || !er(S.spanContext().traceFlags))
            return S.end(), _.apply(this, [R, w, U]);
          if (this.shouldPropagate(R)) {
            let Te = d.context.active(), Se = d.trace.setSpan(Te, S);
            d.propagation.inject(Se, w.headers || {}, _O);
          }
          s && ws(S, s, w.headers || {}, Bh);
          try {
            let Te = Date.now(), Se = _.apply(this, [R, w, U]);
            return Se.prependListener("response", (K) => {
              let pt = Date.now() - Te;
              S.setAttribute("http.response_time", pt), K.statusCode !== void 0 ? (S.setAttribute(Uu, K.statusCode), K.statusCode >= 500 && _t(S, `Status: ${K.statusCode}`)) : _t(S, "Response status code is undefined"), o && ws(S, o, K.headers, Bh), Se.listenerCount("response") <= 1 && K.resume(), K.on("end", () => {
                let kr, Hs = K.statusCode;
                K.aborted && !K.complete ? kr = { code: d.SpanStatusCode.ERROR } : Hs && Hs >= 100 && Hs < 500 ? kr = { code: d.SpanStatusCode.UNSET } : kr = { code: d.SpanStatusCode.ERROR }, S.setStatus(kr), S.isRecording() && (K.headers["content-length"] && S.setAttribute(Bu, K.headers["content-length"]), S.end());
              });
            }), Se.on("error", (K) => {
              S.isRecording() && (_t(S, K), S.end());
            }), Se.on("close", () => {
              S.isRecording() && S.end();
            }), Se;
          } catch (Te) {
            throw _t(S, Te), S.end(), Te;
          }
        };
        e.request = c(a), e.get = c(u);
      }
      instrumentFetch() {
        let { tracerProvider: e } = this;
        if (!e)
          return;
        let t = e.getTracer(this.instrumentationName, this.instrumentationVersion), { attributesFromRequestHeaders: n, attributesFromResponseHeaders: i } = this.config;
        process.env.NEXT_OTEL_FETCH_DISABLED = "1";
        let s = globalThis.fetch;
        this.originalFetch = s;
        let o = async (a, u) => {
          let c = u;
          if (c?.next?.internal)
            return s(a, c);
          let _ = new Request(a instanceof Request ? a.clone() : a, c), p = new URL(_.url);
          if (this.shouldIgnore(p, c))
            return s(a, c);
          let f = this.startSpan({ tracer: t, url: p, fetchType: "fetch", method: _.method, name: c?.opentelemetry?.spanName, attributes: c?.opentelemetry?.attributes });
          if (!f.isRecording() || !er(f.spanContext().traceFlags))
            return f.end(), s(a, c);
          if (this.shouldPropagate(p, c)) {
            let L = d.context.active(), R = d.trace.setSpan(L, f);
            d.propagation.inject(R, _.headers, dO);
          }
          n && ws(f, n, _.headers, Uh);
          try {
            let L = Date.now();
            c?.body && c.body instanceof FormData && _.headers.delete("content-type");
            let R = await s(a, { ...c, headers: _.headers }), w = Date.now() - L;
            return f.setAttribute(Uu, R.status), f.setAttribute("http.response_time", w), i && ws(f, i, R.headers, Uh), R.status >= 500 && _t(f, `Status: ${R.status} (${R.statusText})`), R.body ? hO(R).then((U) => {
              f.isRecording() && (f.setAttribute(Bu, U), f.end());
            }, (U) => {
              f.isRecording() && (_t(f, U), f.end());
            }) : f.end(), R;
          } catch (L) {
            throw _t(f, L), f.end(), L;
          }
        };
        globalThis.fetch = o;
      }
      enable() {
        this.disable(), this.instrumentFetch();
        try {
          let e = z("node:http"), t = z("node:https");
          this.instrumentHttp(e, "http:"), this.instrumentHttp(t, "https:");
        } catch {
        }
      }
      disable() {
        this.originalFetch && (globalThis.fetch = this.originalFetch);
      }
    };
    dO = {
      set(r, e, t) {
        r.set(e, t);
      }
    };
    Uh = {
      get(r, e) {
        let t = r.get(e);
        if (t !== null)
          return t.includes(",") ? t.split(",").map((n) => n.trimStart()) : t;
      }, keys(r) {
        let e = [];
        return r.forEach((t, n) => {
          e.push(n);
        }), e;
      }
    };
    _O = {
      set(r, e, t) {
        r[e.toLowerCase()] = t;
      }
    };
    Bh = {
      get(r, e) {
        return r[e.toLowerCase()];
      }, keys(r) {
        return Object.keys(r);
      }
    };
    h();
    qh = Y(A(), 1);
    EO = "00";
    uc = "traceparent";
    cc = "tracestate";
    jr = class {
      fields() {
        return [uc, cc];
      }
      inject(e, t, n) {
        let i = d.trace.getSpanContext(e);
        if (!i || (0, qh.isTracingSuppressed)(e) || !(0, d.isSpanContextValid)(i))
          return;
        let s = `${EO}-${i.traceId}-${i.spanId}-0${Number(i.traceFlags || 0).toString(16)}`;
        n.set(t, uc, s), i.traceState && n.set(t, cc, i.traceState.serialize());
      }
      extract(e, t, n) {
        let i = n.get(t, uc);
        if (!i)
          return e;
        let s = Array.isArray(i) ? i[0] : i;
        if (typeof s != "string")
          return e;
        let o = mO(s);
        if (!o)
          return e;
        o.isRemote = true;
        let a = n.get(t, cc);
        if (a) {
          let u = Array.isArray(a) ? a.join(",") : a;
          o.traceState = (0, d.createTraceState)(typeof u == "string" ? u : void 0);
        }
        return d.trace.setSpanContext(e, o);
      }
    };
    h();
    xs = class {
      fields() {
        return [];
      }
      inject() {
      }
      extract(e) {
        let t = me();
        if (!t?.telemetry)
          return d.diag.warn("@vercel/otel: Vercel telemetry extension not found."), e;
        let { rootSpanContext: n } = t.telemetry;
        return n ? (d.diag.debug("@vercel/otel: Extracted root SpanContext from Vercel request context.", n), d.trace.setSpanContext(e, { ...n, isRemote: true, traceFlags: n.traceFlags || d.TraceFlags.SAMPLED })) : e;
      }
    };
    h();
    Bs = Y(A(), 1);
    nf = Y(rf(), 1);
    qs = class {
      export(e, t) {
        let n = me();
        if (!n?.telemetry) {
          d.diag.warn("@vercel/otel: no telemetry context found"), t({ code: Bs.ExportResultCode.SUCCESS, error: void 0 });
          return;
        }
        try {
          let i = (0, nf.createExportTraceServiceRequest)(e, { useHex: true, useLongBits: false });
          n.telemetry.reportSpans(i), t({ code: Bs.ExportResultCode.SUCCESS, error: void 0 });
        } catch (i) {
          t({ code: Bs.ExportResultCode.FAILED, error: i instanceof Error ? i : new Error(String(i)) });
        }
      }
      shutdown() {
        return Promise.resolve();
      }
      forceFlush() {
        return Promise.resolve();
      }
    };
    UO = { ALL: d.DiagLogLevel.ALL, VERBOSE: d.DiagLogLevel.VERBOSE, DEBUG: d.DiagLogLevel.DEBUG, INFO: d.DiagLogLevel.INFO, WARN: d.DiagLogLevel.WARN, ERROR: d.DiagLogLevel.ERROR, NONE: d.DiagLogLevel.NONE };
    Gs = class {
      constructor(e = {}) {
        this.configuration = e;
      }
      start() {
        let e = BO(), t = this.configuration, n = process.env.NEXT_RUNTIME || "nodejs", i = !!e.OTEL_SDK_DISABLED;
        if (process.env.OTEL_LOG_LEVEL && d.diag.setLogger(new d.DiagConsoleLogger(), { logLevel: UO[process.env.OTEL_LOG_LEVEL.toUpperCase()] }), i)
          return;
        let s = t.idGenerator ?? new C.RandomIdGenerator(), o = t.contextManager ?? new lf.AsyncLocalStorageContextManager();
        o.enable(), this.contextManager = o;
        let a = e.OTEL_SERVICE_NAME || t.serviceName || "app", u = new lr.Resource(Os({ [fp]: a, "node.ci": process.env.CI ? true : void 0, "node.env": process.env.NODE_ENV, env: process.env.VERCEL_ENV || process.env.NEXT_PUBLIC_VERCEL_ENV, "vercel.region": process.env.VERCEL_REGION, "vercel.runtime": n, "vercel.sha": process.env.VERCEL_GIT_COMMIT_SHA || process.env.NEXT_PUBLIC_VERCEL_GIT_COMMIT_SHA, "vercel.host": process.env.VERCEL_URL || process.env.NEXT_PUBLIC_VERCEL_URL || void 0, "vercel.branch_host": process.env.VERCEL_BRANCH_URL || process.env.NEXT_PUBLIC_VERCEL_BRANCH_URL || void 0, "vercel.deployment_id": process.env.VERCEL_DEPLOYMENT_ID || void 0, [Ep]: process.env.VERCEL_DEPLOYMENT_ID, ...t.attributes })), c = t.resourceDetectors ?? [lr.envDetectorSync];
        if (t.autoDetectResources ?? true) {
          let S = { detectors: c };
          u = u.merge((0, lr.detectResourcesSync)(S));
        }
        let p = GO(t.propagators, t, e), f = VO(t.traceSampler, e), L = HO(t.spanProcessors, t, e);
        L.length === 0 && d.diag.warn("@vercel/otel: No span processors configured. No spans will be exported.");
        let R = t.spanLimits, w = new C.BasicTracerProvider({ resource: u, idGenerator: s, sampler: f, spanLimits: R });
        if (w.addSpanProcessor(new Rs(L, t.attributesFromHeaders)), w.register({ contextManager: o, propagator: new He.CompositePropagator({ propagators: p }) }), this.tracerProvider = w, t.logRecordProcessor) {
          let S = new uf.LoggerProvider({ resource: u });
          this.loggerProvider = S, S.addLogRecordProcessor(t.logRecordProcessor), st.logs.setGlobalLoggerProvider(S);
        }
        if (t.metricReader || t.views) {
          let S = new cf.MeterProvider({ resource: u, views: t.views ?? [] });
          t.metricReader && S.addMetricReader(t.metricReader), d.metrics.setGlobalMeterProvider(S), this.meterProvider = S;
        }
        let U = qO(t.instrumentations, t.instrumentationConfig);
        this.disableInstrumentations = (0, af.registerInstrumentations)({ instrumentations: U }), d.diag.info("@vercel/otel: started", a, n);
      }
      async shutdown() {
        let e = [];
        this.tracerProvider && e.push(this.tracerProvider.shutdown()), this.loggerProvider && e.push(this.loggerProvider.shutdown()), this.meterProvider && e.push(this.meterProvider.shutdown()), d.diag.info("@vercel/otel: shutting down", e.length, process.env.NEXT_RUNTIME), await Promise.all(e), this.contextManager && this.contextManager.disable();
        let { disableInstrumentations: t } = this;
        t && t();
      }
    };
    sf = "always_on";
    cr = 1;
    df = "v1/traces";
    FO = `http://localhost:4318/${df}`;
  }
});

// dist/instrumentation.js
Object.defineProperty(exports, "__esModule", { value: true });
var { registerOTel, OTLPHttpJsonTraceExporter } = (init_node2(), __toCommonJS(node_exports));
registerOTel({
  serviceName: "kubiks-cli",
  traceExporter: new OTLPHttpJsonTraceExporter({
    url: "http://localhost:7432/v1/traces"
  })
});
