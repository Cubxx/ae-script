(function() {
    var arrayProto = Array.prototype;
    var objectProto = Object.prototype;
    var hasOwnProperty = objectProto.hasOwnProperty;
    var nativeConcat = arrayProto.concat;
    var nativeSlice = arrayProto.slice;
    var nativeToString = objectProto.toString;
    var MAX_SAFE_INTEGER = 9007199254740991;
    var reFlags = /\w*$/;
    var reIsUint = /^(?:0|[1-9]\d*)$/;
    function has(object, key) {
        return object != null && hasOwnProperty.call(object, key);
    }
    function isObject(value) {
        if (value == null) {
            return false;
        }
        var type = typeof value;
        return type === "object" || type === "function";
    }
    function assign(object, source) {
        var result = Object(object);
        if (isObject(source)) {
            for (var key in source) {
                if (has(source, key)) {
                    result[key] = source[key];
                }
            }
        }
        return result;
    }
    function contains(array, value) {
        var index = -1;
        var length = array.length;
        while (++index < length) {
            if (array[index] === value) {
                return true;
            }
        }
        return false;
    }
    function getTag(value) {
        if (value == null) {
            return value === undefined ? "[object Undefined]" : "[object Null]";
        }
        return nativeToString.call(value);
    }
    function isArray(value) {
        return getTag(value) == "[object Array]";
    }
    function isObjectLike(value) {
        return typeof value === "object" && value !== null;
    }
    function isArguments(value) {
        return isObjectLike(value) && getTag(value) == "[object Arguments]";
    }
    function or() {
        var index = -1;
        var length = arguments.length;
        while (++index < length) {
            if (arguments[index]) {
                return true;
            }
        }
        return false;
    }
    function stubFalse() {
        return false;
    }
    function map(array, iteratee) {
        var index = -1;
        var length = array == null ? 0 : array.length;
        var result = new Array(length);
        while (++index < length) {
            result[index] = iteratee(array[index], index, array);
        }
        return result;
    }
    function isIndex(value, length) {
        var type = typeof value;
        length = length == null ? MAX_SAFE_INTEGER : length;
        return !!length && or(type === "number", reIsUint.test(value)) && value > -1 && value % 1 == 0 && value < length;
    }
    function arrayLikeKeys(value, inherited) {
        var isArr = isArray(value);
        var isArg = !isArr && isArguments(value);
        var skipIndexes = isArr || isArg;
        var length = value.length;
        var result = new Array(skipIndexes ? length : 0);
        var index = skipIndexes ? -1 : length;
        while (++index < length) {
            result[index] = "".concat(index);
        }
        for (var key in value) {
            if (has(value, key) && !(skipIndexes && (key === "length" || isIndex(key, length)))) {
                result.push(key);
            }
        }
        return result;
    }
    function isLength(value) {
        return typeof value === "number" && value > -1 && value % 1 == 0 && value <= MAX_SAFE_INTEGER;
    }
    function isArrayLike(value) {
        return value != null && typeof value !== "function" && isLength(value.length);
    }
    function keys(object) {
        if (object == null) {
            return [];
        }
        if (isArrayLike(object)) {
            return arrayLikeKeys(object);
        }
        var result = [];
        for (var key in object) {
            if (has(object, key)) {
                result.push(key);
            }
        }
        return result;
    }
    function reduce(array, iteratee, initialValue) {
        var length = array.length;
        if (length === 0 && initialValue === undefined) {
            return undefined;
        }
        var accumulator = initialValue === undefined ? array[0] : initialValue;
        var startIndex = initialValue === undefined ? 0 : -1;
        var currentIndex = startIndex;
        while (++currentIndex < length) {
            accumulator = iteratee(accumulator, array[currentIndex], currentIndex, array);
        }
        return accumulator;
    }
    function filter(array, predicate) {
        var index = -1;
        var resIndex = 0;
        var length = array == null ? 0 : array.length;
        var result = [];
        while (++index < length) {
            var value = array[index];
            if (predicate(value, index, array)) {
                result[resIndex++] = value;
            }
        }
        return result;
    }
    function cloneRegExp(regexp) {
        var matched = reFlags.exec(regexp.toString());
        var flags = matched === null ? undefined : matched.toString();
        var RegExpCtor = regexp.constructor;
        var result = new RegExpCtor(regexp.source, flags);
        result.lastIndex = regexp.lastIndex;
        return result;
    }
    function copyArray(source, array) {
        var index = -1;
        var length = source.length;
        array || (array = new Array(length));
        while (++index < length) {
            array[index] = source[index];
        }
        return array;
    }
    function copyObject(source, props, object) {
        object || (object = {});
        var index = -1, length = props.length;
        while (++index < length) {
            var key = props[index];
            object[key] = source[key];
        }
        return object;
    }
    function initCloneObject(object) {
        var Ctor = object.constructor;
        return typeof Ctor == "function" && Ctor instanceof Ctor ? new Ctor : {};
    }
    var argsTag = "[object Arguments]";
    var arrayTag = "[object Array]";
    var boolTag = "[object Boolean]";
    var dateTag = "[object Date]";
    var errorTag = "[object Error]";
    var numberTag = "[object Number]";
    var objectTag = "[object Object]";
    var regexpTag = "[object RegExp]";
    var stringTag = "[object String]";
    var cloneableTags = {};
    cloneableTags[argsTag] = cloneableTags[arrayTag] = cloneableTags[boolTag] = cloneableTags[dateTag] = cloneableTags[numberTag] = cloneableTags[objectTag] = cloneableTags[regexpTag] = cloneableTags[stringTag] = true;
    cloneableTags[errorTag] = false;
    function initCloneByTag(object, tag) {
        var Ctor = object.constructor;
        switch (tag) {
          case boolTag:
          case dateTag:
            return new Ctor(object.valueOf());

          case numberTag:
          case stringTag:
            return new Ctor(object);

          case regexpTag:
            return cloneRegExp(object);
        }
    }
    function isRegExpExecArray(array) {
        return typeof array[0] === "string" && has(array, "index");
    }
    function initCloneArray(array) {
        var length = array.length;
        var Ctor = array.constructor;
        var result = new Ctor(length);
        if (length && isRegExpExecArray(array)) {
            result.index = array.index;
            result.input = array.input;
        }
        return result;
    }
    function baseClone(value, isDeep, customizer, key, object, stackA, stackB) {
        var result;
        if (result !== undefined) {
            return result;
        }
        if (!isObject(value)) {
            return value;
        }
        var isArr = isArray(value);
        var tag = getTag(value);
        if (isArr) {
            result = initCloneArray(value);
            {
                return copyArray(value, result);
            }
        } else {
            var isFunc = typeof value === "function";
            if (or(tag == objectTag, tag == argsTag, isFunc && !object)) {
                result = isFunc ? {} : initCloneObject(value);
                {
                    return copyObject(value, keys(value), result);
                }
            } else {
                return cloneableTags[tag] ? initCloneByTag(value, tag) : object ? value : {};
            }
        }
    }
    function clone(value) {
        return baseClone(value);
    }
    function forEach(array, iteratee) {
        var index = -1;
        var length = array.length;
        while (++index < length) {
            if (iteratee(array[index], index, array) === false) {
                break;
            }
        }
        return array;
    }
    function baseFindIndex(array, predicate, fromIndex, fromRight) {
        var length = array.length;
        var index = fromIndex + -1;
        while (++index < length) {
            if (predicate(array[index], index, array)) {
                return index;
            }
        }
        return -1;
    }
    function baseIsNaN(value) {
        return value !== value;
    }
    function strictIndexOf(array, value, fromIndex) {
        var index = fromIndex - 1;
        var length = array.length;
        while (++index < length) {
            if (array[index] === value) {
                return index;
            }
        }
        return -1;
    }
    function baseIndexOf(array, value, fromIndex) {
        return value === value ? strictIndexOf(array, value, fromIndex) : baseFindIndex(array, baseIsNaN, fromIndex);
    }
    function arrayIncludes(array, value) {
        var length = array == null ? 0 : array.length;
        return !!length && baseIndexOf(array, value, 0) > -1;
    }
    function some(array, predicate) {
        var index = -1;
        var length = array.length;
        while (++index < length) {
            if (predicate(array[index], index, array)) {
                return true;
            }
        }
        return false;
    }
    function forOwn(object, iteratee) {
        for (var key in object) {
            if (has(object, key)) {
                if (iteratee(object[key], key, object) === false) {
                    break;
                }
            }
        }
        return object;
    }
    function isNil(value) {
        return value == null;
    }
    function isNull(value) {
        return value === null;
    }
    function baseUniq(array, iteratee, comparator) {
        var index = -1;
        var includes = arrayIncludes;
        var result = [];
        var seen = result;
        var length = array.length;
        {
            seen = result;
        }
        outer: while (++index < length) {
            var value = array[index];
            var computed = value;
            value = value !== 0 ? value : 0;
            if (computed === computed) {
                var seenIndex = seen.length;
                while (seenIndex--) {
                    if (seen[seenIndex] === computed) {
                        continue outer;
                    }
                }
                result.push(value);
            } else if (!includes(seen, computed)) {
                if (seen !== result) {
                    seen.push(computed);
                }
                result.push(value);
            }
        }
        return result;
    }
    function uniq(array) {
        return array != null && array.length ? baseUniq(array) : [];
    }
    function createIsNativeType(nativeObject) {
        return function(value) {
            return value != null && value instanceof nativeObject;
        };
    }
    var isPanel = createIsNativeType(Panel);
    var isWindow = createIsNativeType(Window);
    var root = this;
    var global = $.global;
    var tree = {
        version: "beta 1.0.0",
        parse: runInContext,
        windows: []
    };
    var layoutModeFlags = [ 0, 1, 2 ];
    var validContainerType = [ "dialog", "palette", "window" ];
    var mainContainerDefault = {
        dockable: true,
        show: true,
        singleton: false
    };
    var controlParamRef = {
        button: 3,
        checkbox: 3,
        dropdownlist: 3,
        edittext: 3,
        iconbutton: 3,
        image: 3,
        listbox: 3,
        progressbar: 4,
        radiobutton: 3,
        scrollbar: 5,
        slider: 5,
        statictext: 3,
        treeview: 3
    };
    var containerParamRef = {
        group: 2,
        panel: 3,
        tab: 3,
        tabbedpanel: 3
    };
    var elementTypeFlags = {
        button: "A",
        checkbox: "B",
        dialog: "C",
        dropdownlist: "D",
        edittext: "E",
        group: "G",
        iconbutton: "H",
        image: "I",
        item: "J",
        listbox: "K",
        node: "L",
        palette: "M",
        panel: "N",
        progressbar: "O",
        radiobutton: "P",
        scrollbar: "Q",
        slider: "R",
        statictext: "S",
        tab: "T",
        tabbedpanel: "U",
        treeview: "V",
        window: "W"
    };
    var reCombination = /[CGMNTW][ABDEFGHIKNOPQRSUV]|[DK]J|[VL][LJ]|UT/, reContainer = /[DGKLNTUV]/, reListItemContainer = /[DKLV]/, reSelectableElement = /[DKUV]/, reNativeContainer = /[GNTU]/, reNativeControl = /[ABDEHIKOPQRSV]/;
    var isContainer = createIsElementFlag(reContainer), isListItemContainer = createIsElementFlag(reListItemContainer), isNativeContainer = createIsElementFlag(reNativeContainer), isNativeControl = createIsElementFlag(reNativeControl), isSelectableElement = createIsElementFlag(reSelectableElement);
    function addContainer(container, value, flag, collector) {
        return flag == "node" ? addNodeContainer(container, value, flag, collector) : addGeneralContainer(container, value, flag, collector);
    }
    function addControl(container, value, key, collector) {
        var element = isListItemContainer(container.type) ? addListItem(container, value) : addGeneralControl(container, value, key);
        assign(element, getElementStyle(value));
    }
    function addGeneralContainer(container, value, flag, collector) {
        var style = getElementStyle(value);
        var newContainer = nativeAddContainer(container, flag, assignElementParam(value, flag));
        if (isSelectableElement(flag) && has(style, "selection")) {
            var value_1 = {
                container: newContainer,
                itemIndex: style.selection
            };
            collector.selectableElement.push(value_1);
            delete style["selection"];
            return assign(newContainer, style);
        }
        assign(newContainer, style);
        return newContainer;
    }
    function addGeneralControl(container, value, flag, collector) {
        return nativeAddControl(container, flag, assignElementParam(value, flag));
    }
    function addGetElementMethods(constructors) {
        forEach(constructors, function(constructor) {
            var prototype = constructor.prototype;
            prototype.getElementById = getElementById;
            prototype.getElementsByName = getElementsByName;
            prototype.getElementsByType = getElementsByType;
            freezeProperty(prototype, "getElementById");
            freezeProperty(prototype, "getElementsByName");
            freezeProperty(prototype, "getElementsByType");
        });
    }
    function addListItem(container, value, flag, collector) {
        return nativeAddNodeItem(container, getListItemParam(value));
    }
    function addNodeContainer(container, value, flag, collector) {
        var style = getElementStyle(value);
        var node = nativeAddNode(container, getListItemParam(value));
        if (style.expanded) {
            collector.nodeItems.push(node);
        }
        delete style["expanded"];
        assign(node, style);
        return node;
    }
    function assignContext(global, dockable, isSingletonWindow) {
        if (isSingletonWindow || !dockable) {
            return Window;
        }
        if (isValidContext(root)) {
            return root;
        }
        return isValidContext(global) ? global : Window;
    }
    function assignElementParam(value, flag) {
        return assignUniqueName(getElementParam(value), flag);
    }
    function assignLayoutMode(setAll, setAlone) {
        if (contains(layoutModeFlags, setAlone)) {
            return setAlone;
        }
        if (contains(layoutModeFlags, setAll)) {
            return setAll;
        }
        return 0;
    }
    function assignUniqueName(param, flag) {
        var name = param[0];
        if (isNil(name)) {
            return param;
        }
        var index = getCreationPropertiesIndex(flag);
        var creationProperties = param[index];
        if (!isObject(creationProperties)) {
            param[index] = {};
        }
        if (has(creationProperties, "name")) {
            return param;
        }
        param[index].name = name;
        return param;
    }
    function assignWindowType(param) {
        var type = String(param[0]);
        param[0] = contains(validContainerType, type) ? type : [ "palette" ];
        return param;
    }
    function baseGet(object, key) {
        return isNil(object) ? undefined : object[key];
    }
    function baseGetConfig(value) {
        return baseGet(value, "config");
    }
    function baseGetElementId(element) {
        var properties = element.properties;
        return properties && properties.name;
    }
    function baseGetListItemParam(value) {
        return baseGet(value, "param");
    }
    function baseGetParam(value) {
        var result = baseGet(value, "param");
        return isArray(result) ? mapNullToUndefined(result) : [];
    }
    function baseGetStyle(value) {
        var result = baseGet(value, "style");
        return isObject(result) ? result : {};
    }
    function buildNativeWindow(resource, context, showWindow, layoutMode) {
        var container = bulidElements(resource, context);
        initLayout(container, layoutMode);
        if (isWindow(container) && showWindow) {
            container.show();
        }
        return container;
    }
    function buildSingletonWindow(resource, context, showWindow, layoutMode) {
        var container;
        return function() {
            if (isInvisibleContainer(container)) {
                container = bulidElements(resource, context);
            }
            initLayout(container, layoutMode);
            if (isWindow(container) && showWindow) {
                container.show();
            }
            return container;
        };
    }
    function buildWindow(isSingletonWindow) {
        var func = isSingletonWindow ? buildSingletonWindow : buildNativeWindow;
        return func.apply(null, nativeSlice.call(arguments, 1));
    }
    function bulidElements(resource, context) {
        var container = initMainContainer(resource, context);
        var collector = {
            nodeItems: [],
            selectableElement: []
        };
        parseElement(resource, container, collector);
        selectChildItem(collector.selectableElement);
        expandTreeViewNodes(collector.nodeItems);
        return container;
    }
    function castArray(value) {
        return isArray(value) ? value : [ value ];
    }
    function createIsElementFlag(regex) {
        return function(flag) {
            if (has(elementTypeFlags, flag)) {
                return regex.test(elementTypeFlags[flag]);
            }
            return false;
        };
    }
    function baseEachElement(containers, accumulator, breaker, predicate) {
        return some(containers, function(container) {
            var result = [];
            var isDone = some(container.children, function(element) {
                if (isNativeContainer(element.type)) {
                    result.push(element);
                }
                if (predicate(element)) {
                    accumulator.push(element);
                }
                return breaker(accumulator);
            });
            return isDone ? true : baseEachElement(result, accumulator, breaker, predicate);
        });
    }
    function expandTreeViewNodes(nodes) {
        forEach(nodes, function(node) {
            node.expanded = true;
        });
    }
    function filterFindElementInput(input) {
        return uniq(map(nativeConcat.apply([], input), String));
    }
    function freezeProperty(object, property) {
        object.watch(property, function(name, oldValue) {
            return oldValue;
        });
    }
    function getCreationPropertiesIndex(key) {
        if (isNativeControl(key)) {
            return controlParamRef[key];
        }
        if (isNativeContainer(key)) {
            return containerParamRef[key];
        }
        return 0;
    }
    function getElementById(targetId) {
        var id = String(targetId);
        var result = [];
        var breaker = function(accumulator) {
            return accumulator.length > 0;
        };
        baseEachElement([ this ], result, breaker, function(element) {
            var elementId = baseGetElementId(element);
            if (isNil(elementId)) {
                return false;
            }
            return id === elementId;
        });
        return result.length === 0 ? null : result[0];
    }
    function getElementParam(value) {
        return isArray(value) ? mapNullToUndefined(value) : baseGetParam(value);
    }
    function getElementStyle(value) {
        return isArray(value) ? {} : baseGetStyle(value);
    }
    function getElementsByName() {
        var targetNames = filterFindElementInput(arguments);
        var seen = [];
        var result = [];
        var breaker = function() {
            return targetNames.length === seen.length;
        };
        baseEachElement([ this ], result, breaker, function(element) {
            var elementId = baseGetElementId(element);
            if (isNil(elementId)) {
                return false;
            }
            if (contains(targetNames, elementId) && !contains(seen, elementId)) {
                seen.push(elementId);
                return true;
            }
            return false;
        });
        return result.length === 0 ? null : result;
    }
    function getElementsByType() {
        var targetTypes = filterFindElementInput(arguments);
        var result = [];
        baseEachElement([ this ], result, stubFalse, function(element) {
            return contains(targetTypes, element.type);
        });
        return result.length === 0 ? null : result;
    }
    function getListItemParam(value) {
        var result = isObject(value) ? baseGetListItemParam(value) : value;
        return String(result);
    }
    function getMainContainer(param, context) {
        return isPanel(context) ? context : new Window(param[0], param[1], param[2], param[3]);
    }
    function initBuildValues(resource, parserSelf) {
        var config = assign(clone(mainContainerDefault), baseGetConfig(resource));
        var showWindow = Boolean(config.show);
        var dockable = Boolean(config.dockable);
        var isSingletonWindow = Boolean(config.singleton);
        var context = assignContext(parserSelf.context, dockable, isSingletonWindow);
        var layoutMode = assignLayoutMode(parserSelf.layoutMode, config.layoutMode);
        return [ isSingletonWindow, resource, context, showWindow, layoutMode ];
    }
    function initLayout(container, layoutMode) {
        container.layout.layout(layoutMode);
        container.layout.resize();
    }
    function initMainContainer(resource, context) {
        var mainContainer = getMainContainer(assignWindowType(baseGetParam(resource)), context);
        mainContainer.onResizing = mainContainer.onResize = function() {
            this.layout.resize();
        };
        assign(mainContainer, baseGetStyle(resource));
        return mainContainer;
    }
    function isInvisibleContainer(container) {
        return isNil(container) || !container.visible;
    }
    function isTabbedpanel(element) {
        return element.type == "tabbedpanel";
    }
    function isValidCombination(parentType, childType) {
        var flagCombination = elementTypeFlags[parentType] + elementTypeFlags[childType];
        return reCombination.test(flagCombination);
    }
    function isValidContext(context) {
        return context === global || isPanel(context);
    }
    function isValidElement(flag) {
        return has(elementTypeFlags, flag);
    }
    function mapNullToUndefined(array) {
        return map(array, function(value) {
            return isNull(value) ? undefined : value;
        });
    }
    function nativeAddContainer(container, type, param) {
        return container.add(type, param[1], param[2], param[3]);
    }
    function nativeAddControl(container, type, param) {
        return container.add(type, param[1], param[2], param[3], param[4], param[5]);
    }
    function nativeAddNode(container, text) {
        return container.add("node", text);
    }
    function nativeAddNodeItem(node, text) {
        return node.add("item", text);
    }
    function parseElement(resource, container, collector) {
        forOwn(resource, function(value, key) {
            var flag = trimNumber(key).toLowerCase();
            if (isValidElement(flag) && isValidCombination(container.type, flag)) {
                if (isContainer(flag)) {
                    var newContainer = addContainer(container, value, flag, collector);
                    parseElement(value, newContainer, collector);
                } else {
                    addControl(container, value, flag);
                }
            }
        });
    }
    function runInContext(resource) {
        addGetElementMethods([ Window, Panel, Group ]);
        var resource_ = isObject(resource) ? resource : {};
        var container = buildWindow.apply(null, initBuildValues(resource_, tree));
        tree.windows.push(container);
        return container;
    }
    function selectChildItem(selectableElementValues) {
        forEach(selectableElementValues, function(value) {
            var container = value.container;
            var itemIndex = value.itemIndex;
            if (isTabbedpanel(container)) {
                container.selection = itemIndex;
            } else {
                container.selection = map(castArray(itemIndex), function(value) {
                    return container.items[value];
                });
            }
        });
    }
    function trimNumber(string) {
        return string.replace(/\d/g, "");
    }
    function eachProperties(propertyGroup, iteratee) {
        var index = 0;
        var length = propertyGroup.numProperties + 1;
        while (++index < length) {
            if (iteratee(propertyGroup.property(index), index, propertyGroup) === false) {
                break;
            }
        }
        return propertyGroup;
    }
    function setUndoGroup(undoString, func) {
        app.beginUndoGroup(undoString);
        func();
        app.endUndoGroup();
    }
    var a = {
        abort: function(message) {
            if (!$.level) {
                alert(message, "Abort");
            }
            throw new Error(message);
        },
        checkLength: function(array, message, minLength) {
            if (minLength === void 0) {
                minLength = 1;
            }
            if (array.length < minLength) {
                a.abort(message);
            }
        },
        emptyArray: function(array) {
            var obj = {};
            var group_info_arr = filter(map(array, function(e, i) {
                if (e instanceof PropertyGroup) {
                    var parentProperty = e.parentProperty, propertyIndex = e.propertyIndex;
                    return {
                        parentProperty: parentProperty,
                        propertyIndex: propertyIndex
                    };
                } else {
                    obj[i] = e;
                }
            }), function(e) {
                return !!e;
            });
            map(group_info_arr, function(_a) {
                var parentProperty = _a.parentProperty, propertyIndex = _a.propertyIndex;
                parentProperty(propertyIndex).remove();
            });
            forOwn(obj, function(value) {
                return value.remove();
            });
        }
    };
    var b = {
        get_active_comp: function() {
            var comp = app.project.activeItem;
            return comp instanceof CompItem ? comp : a.abort("请在时间轴上打开合成");
        },
        get_selected_comps: function() {
            var comps = filter(app.project.selection, function(e) {
                return e instanceof CompItem;
            });
            a.checkLength(comps, "请在项目面板中选择合成");
            return comps;
        },
        get_selected_layers: function() {
            var layers = b.get_active_comp().selectedLayers;
            a.checkLength(layers, "请选择图层");
            return layers;
        },
        get_selected_properties: function() {
            var layers = b.get_selected_layers();
            var properties = [];
            forEach(layers, function(layer) {
                properties = properties.concat(layer.selectedProperties);
            });
            return properties;
        },
        add_layer: function(type) {
            var _a, _b;
            if (type === void 0) {
                type = "Shape";
            }
            return (_b = (_a = this.get_active_comp().layers)["add" + type]) === null || _b === void 0 ? void 0 : _b.call(_a);
        },
        add_solid_layer: function(bgColor) {
            if (bgColor === void 0) {
                bgColor = [ 0.5, 0.5, 0.5, 1 ];
            }
            var layer = b.add_layer();
            layer.name = "Solid";
            var contents = layer.property("ADBE Root Vectors Group");
            contents.addProperty("ADBE Vector Shape - Rect").property("Size").setValue([ layer.width, layer.height ]);
            contents.addProperty("ADBE Vector Graphic - Fill").property("Color").setValue(bgColor);
            return layer;
        },
        add_adjustment_layer: function() {
            var layer = b.add_solid_layer();
            layer.name = "Adjustment";
            layer.label = 5;
            layer.adjustmentLayer = true;
            return layer;
        },
        add_null_layer: function() {
            var layer = b.add_layer();
            layer.name = "Null";
            layer.label = 1;
            layer.transform.scale.expression = "[100, 100]";
            layer.transform.opacity.setValue(0);
            var contents = layer.property("ADBE Root Vectors Group");
            contents.addProperty("ADBE Vector Shape - Rect");
            return layer;
        },
        add_layer_from_group: function(group) {
            var layer = group.propertyGroup(2);
            if (!(layer instanceof ShapeLayer)) {
                a.abort("请选择 形状层 - 内容(Contents) 的子属性组");
            }
            var new_layer = layer.duplicate();
            new_layer.name = [ layer.name, group.name ].join(" - ");
            var contents = new_layer.property("ADBE Root Vectors Group");
            var beDels = [];
            eachProperties(contents, function(e, i) {
                i + 1 != group.propertyIndex && e && beDels.push(e);
            });
            a.emptyArray(beDels);
            return new_layer;
        },
        add_layers_from_selected_groups: function() {
            var properties = b.get_selected_properties();
            var groups = filter(properties, function(e) {
                return e instanceof PropertyGroup && !(e instanceof MaskPropertyGroup);
            });
            a.checkLength(groups, "请选择属性组(除蒙版以外)");
            var beDels = map(groups, function(e) {
                return b.add_layer_from_group(e), e;
            });
            a.emptyArray(beDels);
        },
        unpack_comp: function(comp_layer) {
            comp_layer.selected = true;
            var containingComp = comp_layer.containingComp, startTime = comp_layer.startTime;
            var layers = comp_layer.source.layers;
            for (var i = 1; i <= layers.length; i++) {
                layers[i].copyToComp(containingComp);
                containingComp.layers[comp_layer.index - 1].startTime += startTime;
            }
            comp_layer.selected = false;
        },
        unpack_selected_comps: function() {
            var layers = b.get_selected_layers();
            var comp_layers = filter(layers, function(layer) {
                layer.selected = false;
                return layer instanceof AVLayer && layer.source instanceof CompItem;
            });
            a.checkLength(comp_layers, "请选择合成图层");
            var beDels = map(comp_layers, function(e, i) {
                return b.unpack_comp(e), e.source;
            });
            a.emptyArray(beDels);
        },
        unpack_layer: function(layer) {
            layer.selected = true;
            var contents = layer.property("ADBE Root Vectors Group");
            var group_array = [];
            eachProperties(contents, function(e) {
                e instanceof PropertyGroup && !(e instanceof MaskPropertyGroup) && group_array.push(e);
            });
            a.checkLength(group_array, "".concat(layer.name, " 图层只有 ").concat(group_array.length, " 个属性组"), 2);
            map(group_array, b.add_layer_from_group);
            layer.selected = false;
        },
        unpack_selected_layers: function() {
            var layers = b.get_selected_layers();
            var shape_layers = filter(layers, function(e) {
                e.selected = false;
                return e instanceof ShapeLayer;
            });
            a.checkLength(shape_layers, "请选择形状图层");
            var beDels = map(shape_layers, function(e) {
                return b.unpack_layer(e), e;
            });
            a.emptyArray(beDels);
        },
        render: function() {
            app.project.renderQueue.showWindow(true);
            app.project.renderQueue.render();
        },
        render_active_comp: function() {
            b.render_comp(b.get_active_comp());
        },
        render_selected_comps: function() {
            map(b.get_selected_comps(), b.render_comp);
        },
        render_comp: function(comp) {
            var item = app.project.renderQueue.items.add(comp);
            b.render_setting(item);
            item.render = true;
        },
        render_setting: function(item) {
            if (!app.project.file) {
                return alert("请先保存项目");
            }
            item.outputModule(1).setSettings({
                "Output File Info": {
                    "Base Path": app.project.file.fsName.replace(/\\[^\\]+$/, ""),
                    "Subfolder Path": "render",
                    "File Name": item.comp.name
                }
            });
        }
    };
    function fix_expression() {
        var map$1 = [ [ "点", "Point" ], [ "3D点", "3D Point" ], [ "角度", "Angle" ], [ "滑块", "Slider" ], [ "颜色", "Color" ], [ "复选框", "Checkbox" ], [ "菜单", "Menu" ], [ "图层", "Layer" ] ];
        var fix = {
            zh_CN: function() {
                map(map$1, function(_a) {
                    var zh = _a[0], en = _a[1];
                    return app.project.autoFixExpressions(en, zh);
                });
            },
            en_US: function() {
                map(map$1, function(_a) {
                    var zh = _a[0], en = _a[1];
                    return app.project.autoFixExpressions(zh, en);
                });
            }
        };
        if (has(fix, app.isoLanguage)) {
            fix[app.isoLanguage]();
        }
    }
    var ui = reduce([ [ "UC", b.unpack_selected_comps ], [ "UL", b.unpack_selected_layers ], [ "AS", b.add_solid_layer ], [ "AA", b.add_adjustment_layer ], [ "AN", b.add_null_layer ], [ "AG", b.add_layers_from_selected_groups ], [ "R", b.render_selected_comps ], [ "F", fix_expression ] ], function(acc, _a, i) {
        var text = _a[0], fn = _a[1];
        acc["button" + i] = {
            style: {
                text: text,
                preferredSize: [ 30, 30 ],
                onClick: function() {
                    return setUndoGroup(text, fn);
                }
            }
        };
        return acc;
    }, {
        style: {
            orientation: "column",
            alignChildren: "center",
            margins: 0,
            spacing: 0
        }
    });
    tree.context = this;
    tree.parse(ui);
}).call(this);
//# sourceMappingURL=toolbox.ui.jsx.map
