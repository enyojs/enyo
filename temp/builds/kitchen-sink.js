'use strict';

var
	utils = require('utils'),
	kind = require('kind'),
	logger = require('logger'),
	roots = require('roots');

var enyo = exports = module.exports = {};



enyo.global = global;

// BEGIN BROWSER

enyo.ready = require('ready');

Object.keys(roots).forEach(function (key) { enyo[key] = roots[key]; });

enyo.path = require('path');

enyo.dom = require('dom');
enyo.requiresWindow = enyo.dom.requiresWindow;

enyo.dispatcher = require('dispatcher');
enyo.$ = enyo.dispatcher.$;

enyo.iePreventDefault = enyo.dispatcher.iePreventDefault;
enyo.makeBubble = enyo.dispatcher.makeBubble;
enyo.unmakeBubble = enyo.dispatcher.unmakeBubble;
enyo.dispatch = function (e) { return enyo.dispatcher.dispatch(e); };
enyo.bubbler = enyo.dispatcher.bubbler;
enyo.getPosition = enyo.dispatcher.getPosition;
enyo.bubble = enyo.dispatcher.bubble;

enyo.Router = require('Router');

var cookie = require('cookie');
enyo.getCookie = cookie.getCookie;
enyo.setCookie = cookie.setCookie;

enyo.xhr = require('xhr');
enyo.Blob = require('Blob');
enyo.FormData = require('FormData');
enyo.Ajax = require('Ajax');
enyo.AjaxProperties = require('AjaxProperties');
enyo.JsonpRequest = require('Jsonp');
enyo.WebService = require('WebService');

enyo.HTMLStringDelegate = require('HTMLStringDelegate');
enyo.Control = require('Control');
enyo.floatingLayer = require('floatingLayer');
enyo.fullscreen = require('fullscreen');

var animation = require('animation');
Object.keys(animation).forEach(function (key) { enyo[key] = animation[key]; });

enyo.ri = require('resolution');
enyo.Animator = require('Animator');

// END BROWSER

// BEGIN KERNEL

// enyo.options
enyo.options = require('options');

// enyo.job
enyo.job = require('job');

// enyo.json
enyo.json = require('json');

// enyo.platform
enyo.platform = require('platform');

// enyo.logging
enyo.logging = logger;

// enyo.log, enyo.warn, enyo.error, enyo.setLogLevel
enyo.log = logger.log;
enyo.warn = logger.warn;
enyo.error = logger.error;
enyo.setLogLevel = logger.setLogLevel;

// enyo.kind
enyo.kind = kind;

// enyo.inherit
enyo.inherit = kind.inherit;

// enyo.isInherited
enyo.isInherited = kind.isInherited;

// enyo.concatenated
enyo.concatenated = kind.concatenated;

// enyo.singleton
enyo.singleton = kind.singleton;

// enyo.concatHandler
enyo.concatHandler = kind.concatHandler;

// enyo.constructorForKind
enyo.constructorForKind = kind.constructorForKind;
enyo.createFromKind = kind.createFromKind;

// enyo.Theme
enyo.Theme = kind.Theme;

// enyo.registerTheme
enyo.registerTheme = kind.registerTheme;

// all of the utils functions need to be exposed from the enyo namespace directly
Object.keys(utils).forEach(function (key) { enyo[key] = utils[key]; });

// END KERNEL

// BEGIN CORE

// enyo.jobs
enyo.jobs = require('jobs');

// enyo.Object
enyo.Object = require('CoreObject');

// enyo.LinkedList
enyo.LinkedList = require('LinkedList');

// enyo.LinkedListNode
enyo.LinkedListNode = require('LinkedListNode');

// enyo.Binding
enyo.Binding = require('Binding');
// shared resource so this will work
enyo.bindings = enyo.Binding.bindings;
// this won't
// enyo.defaultBindingKind = enyo.Binding.defaultBindingKind

// enyo.ObserverChain
enyo.ObserverChain = require('ObserverChain');

// enyo.ObserverChainNode
enyo.ObserverChainNode = require('ObserverChainNode');

//
enyo.Application = require('Application');
enyo.applications = enyo.Application.applications;

enyo.Component = require('Component');
enyo.UiComponent = require('UiComponent');

enyo.Signals = require('Signals');
enyo.MultipleDispatchComponent = require('MultipleDispatchComponent');
enyo.Controller = require('Controller');
enyo.ViewController = require('ViewController');

enyo.create = enyo.Component.create;

enyo.Layout = require('Layout');

enyo.Async = require('Async');
enyo.BaseLayout = require('BaseLayout');

// END CORE




// BEGIN MIXINS

// enyo.MixinSupport
enyo.MixinSupport = require('MixinSupport');

// enyo.ObserverSupport
enyo.ObserverSupport = require('ObserverSupport');

// enyo.BindingSupport
enyo.BindingSupport = require('BindingSupport');

// enyo.ComputedSupport
enyo.ComputedSupport = require('ComputedSupport');

enyo.ComponentBindingSupport = require('ComponentBindingSupport');

enyo.ApplicationSupport = require('ApplicationSupport');
enyo.MultipleDispatchSupport = require('MultipleDispatchSupport');

enyo.EventEmitter = require('EventEmitter');
enyo.RegisteredEventSupport = enyo.EventEmitter;
enyo.ProxyObject = require('ProxyObject');

enyo.RepeaterChildSupport = require('RepeaterChildSupport');
enyo.StylesheetSupport = require('StylesheetSupport');

// END MIXINS


// BEGIN EXT

enyo.dev = require('dev');
enyo.bench = utils.perfNow;
enyo.master = require('master');

enyo.macroize = require('macroize');
enyo.quickReplace = enyo.macroize.quickReplace;
enyo.quickMacroize = enyo.macroize.quickMacroize;

var hooks = require('hooks');
enyo.$L = hooks.$L;
enyo.updateLocale = hooks.updateLocale;

enyo.EmptyBinding = require('EmptyBinding');
enyo.BooleanBinding = require('BooleanBinding');
enyo.BooleanOnlyBinding = require('BooleanOnlyBinding');
enyo.InputBinding = require('InputBinding');
enyo.InvertBooleanBinding = require('InvertBooleanBinding');
enyo.StringBinding = require('StringBinding');

// END EXT

// BEGIN DATA

enyo.Source = require('Source');
enyo.sources = enyo.Source.sources;
enyo.States = require('States');
enyo.StateSupport = require('StateSupport');
enyo.store = require('Store');
enyo.ModelList = require('ModelList');
enyo.Model = require('Model');
enyo.Collection = require('Collection');
enyo.Filter = require('Filter');
enyo.ModelController = require('ModelController');
enyo.RelationalModel = require('RelationalModel');
enyo.toOne = require('toOne');
enyo.toMany = require('toMany');
enyo.manyToMany = require('manyToMany');
enyo.Relation = require('Relation');
enyo.BucketFilter = require('BucketFilter');
enyo.ProgressiveFilter = require('ProgressiveFilter');
enyo.XHRSource = require('XhrSource');
enyo.LocalStorageSource = require('LocalStorageSource');
enyo.AjaxSource = require('AjaxSource');
enyo.JsonpSource = require('JsonpSource');


// END DATA


// BEGIN TOUCH

enyo.gesture = require('gesture');
// doesn't export, decorates gesture further...yeah...I know...
require('touch');
require('drag');

// END TOUCH

// BEGIN SCROLLING

enyo.Scroller = require('Scroller');
enyo.ScrollMath = require('ScrollMath');
enyo.ScrollStrategy = require('ScrollStrategy');
enyo.ScrollThumb = require('ScrollThumb');
enyo.TouchScrollStrategy = require('TouchScrollStrategy');
enyo.TranslateScrollStrategy = require('TranslateScrollStrategy');
enyo.TransitionScrollStrategy = require('TransitionScrollStrategy');

// END SCROLLING








enyo.Button = require('Button');
enyo.DataGridList = require('DataGridList');
enyo.DataList = require('DataList');
enyo.Image = require('Image');
enyo.Popup = require('Popup');
enyo.RichText = require('RichText');
enyo.Scrim = require('Scrim');
enyo.SpriteAnimation = require('SpriteAnimation');
enyo.ToolDecorator = require('ToolDecorator');
enyo.Anchor = require('Anchor');
enyo.Audio = require('Audio');
enyo.Checkbox = require('Checkbox');
enyo.DataRepeater = require('DataRepeater');
enyo.DataTable = require('DataTable');
enyo.DragAvatar = require('DragAvatar');
enyo.Drawer = require('Drawer');
enyo.floatingLayer = require('floatingLayer');
enyo.Group = require('Group');
enyo.GroupItem = require('GroupItem');
enyo.Input = require('Input');
enyo.Media = require('Media');
enyo.MediaSource = require('MediaSource');
enyo.Option = require('Option');
enyo.OptionGroup = require('OptionGroup');
enyo.Repeater = require('Repeater');
enyo.Select = require('Select');
enyo.Style = require('Style');
enyo.Table = require('Table');
enyo.TableCell = require('TableCell');
enyo.TableRow = require('TableRow');
enyo.TextArea = require('TextArea');
enyo.Video = require('Video');