"use strict";
var cubx = (function () {
    var a = {
        abort: function (message) {
            if (!$.level) {
                alert(message, 'Abort');
            }
            throw message;
        },
        checkLength: function (array, message, minLength) {
            if (minLength === void 0) { minLength = 1; }
            if (array.length < minLength) {
                a.abort(message);
            }
        },
        emptyArray: function (array) {
            var obj = {};
            var group_info_arr = array
                .map(function (e, i) {
                if (e instanceof PropertyGroup) {
                    var parentProperty = e.parentProperty, propertyIndex = e.propertyIndex;
                    return { parentProperty: parentProperty, propertyIndex: propertyIndex };
                }
                else {
                    obj[i] = e;
                }
            })
                .filter(function (e) { return !!e; });
            group_info_arr.map(function (_a) {
                var parentProperty = _a.parentProperty, propertyIndex = _a.propertyIndex;
                parentProperty(propertyIndex).remove();
            });
            obj.each(function (value) { return value.remove(); });
        }
    };
    var b = {
        set_undo_group: function (fn, tip) {
            var _this = this;
            if (tip === void 0) { tip = new Date().getTime() + ''; }
            return function () {
                app.beginUndoGroup('cubx.' + tip);
                fn.call(_this);
                app.endUndoGroup();
            };
        },
        get_active_comp: function () {
            var comp = app.project.activeItem;
            if (comp instanceof CompItem) {
                return comp;
            }
            else {
                return a.abort('请在时间轴上打开合成');
            }
        },
        get_selected_comps: function () {
            var comps = app.project.selection.filter(function (e) { return e instanceof CompItem; });
            a.checkLength(comps, '请在项目面板中选择合成');
            return comps;
        },
        get_selected_layers: function () {
            var layers = this.get_active_comp().selectedLayers;
            a.checkLength(layers, '请选择图层');
            return layers;
        },
        get_selected_properties: function () {
            var layers = this.get_selected_layers();
            var properties = [];
            layers.map(function (layer) {
                properties = properties.concat(layer.selectedProperties);
            });
            return properties;
        },
        add_layer: function (type) {
            var _a, _b;
            if (type === void 0) { type = 'Shape'; }
            return (_b = (_a = this.get_active_comp().layers)['add' + type]) === null || _b === void 0 ? void 0 : _b.call(_a);
        },
        add_solid_layer: function (bgColor) {
            if (bgColor === void 0) { bgColor = [0.5, 0.5, 0.5, 1]; }
            var layer = this.add_layer();
            layer.name = 'Solid';
            var contents = layer
                .property('ADBE Root Vectors Group')
                .is(PropertyGroup);
            contents
                .addProperty('ADBE Vector Shape - Rect')
                .property('Size')
                .is(Property)
                .setValue([layer.width, layer.height]);
            contents
                .addProperty('ADBE Vector Graphic - Fill')
                .property('Color')
                .is(Property)
                .setValue(bgColor);
            return layer;
        },
        add_adjustment_layer: function () {
            var layer = this.add_solid_layer();
            layer.name = 'Adjustment';
            layer.label = 5;
            layer.adjustmentLayer = true;
            return layer;
        },
        add_null_layer: function () {
            var layer = this.add_layer();
            layer.name = 'Null';
            layer.label = 1;
            layer.transform.scale.expression = '[100, 100]';
            layer.transform.opacity.setValue(0);
            var contents = layer
                .property('ADBE Root Vectors Group')
                .is(PropertyGroup);
            contents.addProperty('ADBE Vector Shape - Rect');
            return layer;
        },
        add_layer_from_group: function (group) {
            var layer = group.propertyGroup(2);
            if (!(layer instanceof ShapeLayer)) {
                a.abort('请选择 形状层 - 内容(Contents) 的子属性组');
            }
            var new_layer = layer.duplicate();
            new_layer.name = [layer.name, group.name].join(' - ');
            var contents = new_layer
                .property('ADBE Root Vectors Group')
                .is(PropertyGroup);
            var beDels = contents
                .map(function (e, i) {
                if (i + 1 != group.propertyIndex) {
                    return e;
                }
            })
                .filter(function (e) { return !!e; });
            a.emptyArray(beDels);
            return new_layer;
        },
        add_layers_from_selected_groups: function () {
            var _this = this;
            var properties = this.get_selected_properties();
            var groups = properties.filter(function (e) {
                return e instanceof PropertyGroup &&
                    !(e instanceof MaskPropertyGroup);
            });
            a.checkLength(groups, '请选择属性组(除蒙版以外)');
            var beDels = groups.map(function (e) { return (_this.add_layer_from_group(e), e); });
            a.emptyArray(beDels);
        },
        unpack_comp: function (comp_layer) {
            comp_layer.selected = true;
            var containingComp = comp_layer.containingComp, startTime = comp_layer.startTime;
            var layers = comp_layer.source.layers;
            for (var i = 1; i <= layers.length; i++) {
                layers[i].copyToComp(containingComp);
                containingComp.layers[comp_layer.index - 1].startTime +=
                    startTime;
            }
            comp_layer.selected = false;
        },
        unpack_selected_comps: function () {
            var layers = this.get_selected_layers();
            var comp_layers = layers.filter(function (layer) {
                layer.selected = false;
                return (layer instanceof AVLayer &&
                    layer.source instanceof CompItem);
            });
            a.checkLength(comp_layers, '请选择合成图层');
            var beDels = comp_layers.map(function (e, i) { return (b.unpack_comp(e), e.source); });
            a.emptyArray(beDels);
        },
        unpack_layer: function (layer) {
            layer.selected = true;
            var contents = layer
                .property('ADBE Root Vectors Group')
                .is(PropertyGroup);
            var group_array = contents.filter(function (e) {
                return (e instanceof PropertyGroup &&
                    !(e instanceof MaskPropertyGroup));
            });
            a.checkLength(group_array, "".concat(layer.name, " \u56FE\u5C42\u53EA\u6709 ").concat(group_array.length, " \u4E2A\u5C5E\u6027\u7EC4"), 2);
            group_array.map(this.add_layer_from_group, true);
            layer.selected = false;
        },
        unpack_selected_layers: function () {
            var layers = this.get_selected_layers();
            var shape_layers = layers.filter(function (e) {
                e.selected = false;
                return e instanceof ShapeLayer;
            });
            a.checkLength(shape_layers, '请选择形状图层');
            var beDels = shape_layers.map(function (e) { return (b.unpack_layer(e), e); });
            a.emptyArray(beDels);
        },
        render: function () {
            app.project.renderQueue.showWindow(true);
            app.project.renderQueue.render();
        },
        render_active_comp: function () {
            this.render_comp(this.get_active_comp());
        },
        render_selected_comps: function () {
            this.get_selected_comps().map(this.render_comp);
        },
        render_comp: function (comp) {
            var item = app.project.renderQueue.items.add(comp);
            this.render_setting(item);
            item.render = true;
        },
        render_setting: function (item) {
            if (!app.project.file) {
                return alert('请先保存项目');
            }
            item.outputModule(1).setSettings({
                'Output File Info': {
                    'Base Path': app.project.file.fsName.replace(/\\[^\\]+$/, ''),
                    'Subfolder Path': 'render',
                    'File Name': item.comp.name
                }
            });
        }
    };
    var u = {
        show: function (win) {
            win.layout.layout(true);
            win.layout.resize();
            win.onResizing = win.onResize = function () { return win.layout.resize(); };
            if (win instanceof Window) {
                win.show();
            }
        },
        palette: (function (that, text) {
            if (text === void 0) { text = ''; }
            return that instanceof Panel
                ? that
                : new Window('palette', void 0, void 0, {
                    resizeable: true
                }).assign({
                    orientation: 'column',
                    alignChildren: 'left',
                    margins: 0,
                    spacing: 0,
                    text: text
                });
        }),
        dialog: (function (that, text) {
            if (text === void 0) { text = ''; }
            return that instanceof Panel
                ? that
                : new Window('dialog', void 0, void 0, {
                    resizeable: true
                }).assign({
                    orientation: 'column',
                    alignChildren: 'left',
                    margins: 0,
                    spacing: 0,
                    text: text
                });
        }),
        group: function (node) {
            return node.add('group').assign({
                orientation: 'row',
                alignChildren: 'center',
                margins: 0,
                spacing: 10
            });
        },
        panel: function (node, text) {
            if (text === void 0) { text = ''; }
            return node.add('panel').assign({
                orientation: 'row',
                alignChildren: 'center',
                margins: 10,
                spacing: 10,
                text: text
            });
        },
        button: function (node, text) {
            if (text === void 0) { text = ''; }
            return node.add('button', void 0, text);
        },
        iconbutton: function (node, icon) {
            return node.add('iconbutton', void 0, icon, {
                style: 'toolbutton'
            });
        },
        statictext: function (node, text) {
            var group = u.group(node);
            group.add('statictext', void 0, text);
            return group;
        },
        edittext: function (node, text, value) {
            return u.statictext(node, text).add('edittext', void 0, value);
        },
        slider: function (node, text) {
            return u.statictext(node, text).add('slider', void 0, 0, 0, 100);
        },
        dropdownlist: function (node, text, items) {
            return u.statictext(node, text).add('dropdownlist', void 0, items);
        },
        divider: function (node) {
            return u.panel(node).assign({
                alignment: 'fill'
            });
        },
        checkbox: function (node, text) {
            return node.add('checkbox', void 0, text);
        }
    };
    var f = {
        read: function (path) {
            var file = path instanceof File ? path : f.repair_path(path);
            file.encoding = 'utf-8';
            file.open('r');
            var text = file.read();
            file.close();
            return text;
        },
        write: function (path, text) {
            var file = path instanceof File ? path : f.repair_path(path);
            file.encoding = 'utf-8';
            file.open('w');
            file.write(text);
            file.close();
        },
        open: function (config) {
            var path = config.path, prompt = config.prompt, filter = config.filter, multi = config.multi;
            var files = path !== void 0
                ? new File(path).openDlg(prompt, filter, multi)
                : File.openDialog(prompt, filter, multi);
            if (!files)
                return;
            var datas = {};
            (files instanceof File ? [files] : files).map(function (file) {
                datas[File.decode(file.name)] = f.read(file.fsName);
            });
            return datas;
        },
        save: function (datas, config) {
            var path = config.path, prompt = config.prompt;
            var folder = path !== void 0
                ? new Folder(path).selectDlg(prompt)
                : Folder.selectDialog(prompt);
            if (!folder)
                return;
            datas.each(function (text, name) {
                f.write(folder.fsName + '\\' + name, text);
            });
        },
        repair_path: (function (path, type) {
            if (type === void 0) { type = 'file'; }
            function create_folder(folder, result) {
                if (folder.exists || folder.create()) {
                    return result;
                }
                else {
                    return abort('文件夹创建失败');
                }
            }
            switch (type) {
                case 'file': {
                    var file = new File(path);
                    return file.exists
                        ? file
                        : create_folder(file.parent, file);
                }
                case 'folder': {
                    var folder = new Folder(path);
                    return create_folder(folder, folder);
                }
            }
        })
    };
    File.isEncodingAvailable('utf-8') ||
        alert('文件读写功能受限: 系统不支持utf-8编码');
    return { a: a, b: b, u: u, f: f };
})();
var abort = cubx.a.abort;
(function () {
    function curry_each(data) {
        return function (len) {
            return function (getValue) {
                return function (fn, order) {
                    var array = [];
                    for (var i = len - 1; i >= 0; i--) {
                        var index = order ? len - 1 - i : i;
                        fn(getValue(data, index), index, array);
                    }
                    return array;
                };
            };
        };
    }
    Array.prototype.map = function (fn, order) {
        var _this = this;
        return curry_each(this)(this.length)(function (arr, i) { return arr[i]; })(function (e, i, arr) { return (arr[i] = fn(e, i, _this)); }, order);
    };
    Array.prototype.filter = function (fn) {
        var _this = this;
        return curry_each(this)(this.length)(function (arr, i) { return arr[i]; })(function (e, i, arr) { return fn(e, i, _this) && arr.push(e); });
    };
    Object.prototype.is = function (constructor) {
        if (this instanceof constructor) {
            return this;
        }
        else {
            return abort("\u6570\u636E\u7C7B\u578B\u4E0D\u4E3A ".concat(constructor));
        }
    };
    Object.prototype.each = function (fn) {
        for (var key in this) {
            if (this.hasOwnProperty(key)) {
                fn(this[key], key, this);
            }
        }
    };
    Object.prototype.assign = function (config) {
        var _this = this;
        config.each(function (v, k) {
            _this[k] = v;
        });
        return this;
    };
    PropertyGroup.prototype.map = function (fn, order) {
        var _this = this;
        return curry_each(this)(this.numProperties)(function (arr, i) { return arr(i + 1); })(function (e, i, arr) { return (arr[i] = fn(e, i, _this)); }, order);
    };
    PropertyGroup.prototype.filter = function (fn) {
        var _this = this;
        return curry_each(this)(this.numProperties)(function (arr, i) { return arr(i + 1); })(function (e, i, arr) { return fn(e, i, _this) && arr.push(e); });
    };
    MaskPropertyGroup.prototype.map = function (fn, order) {
        var _this = this;
        return curry_each(this)(this.numProperties)(function (arr, i) { return arr(i + 1); })(function (e, i, arr) { return (arr[i] = fn(e, i, _this)); }, order);
    };
    MaskPropertyGroup.prototype.filter = function (fn) {
        var _this = this;
        return curry_each(this)(this.numProperties)(function (arr, i) { return arr(i + 1); })(function (e, i, arr) { return fn(e, i, _this) && arr.push(e); });
    };
})();
//# sourceMappingURL=cubx.lib.jsx.map