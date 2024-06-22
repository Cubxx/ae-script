const cubx = (function () {
    /**辅助模块 */
    const a = {
        /**终止程序并发出警告 */
        abort(message: string) {
            if (!$.level) {
                alert(message, 'Abort');
            }
            throw message;
        },
        /**数组.length < minLength 则 abort */
        checkLength(array: any[], message: string, minLength = 1) {
            if (array.length < minLength) {
                a.abort(message);
            }
        },
        /**
         * 让数组内所有元素执行 remove()
         * @description 对象.remove() 会导致该对象所在的对象数组 invalid
         * @description 解决方案1: 设置一个对象, 引用该元素, 再执行 remove()
         * @description 解决方案2: 获取元素的parent和index, 再执行 remove()
         */
        emptyArray(array: _PropertyClasses[]) {
            const obj = {} as Record<string, Property>;
            const group_info_arr = array
                .map((e, i) => {
                    if (e instanceof PropertyGroup) {
                        const { parentProperty, propertyIndex } = e;
                        return { parentProperty, propertyIndex };
                    } else {
                        obj[i] = e;
                    }
                })
                .filter(
                    (
                        e,
                    ): e is {
                        parentProperty: PropertyGroup;
                        propertyIndex: number;
                    } => !!e,
                );
            group_info_arr.map(({ parentProperty, propertyIndex }) => {
                parentProperty(propertyIndex).remove();
            });
            obj.each((value) => value.remove());
        },
    };
    /**工具箱模块 */
    const b = {
        // set
        set_undo_group(fn: () => void, tip = new Date().getTime() + '') {
            return () => {
                app.beginUndoGroup('cubx.' + tip);
                fn.call(this);
                app.endUndoGroup();
            };
        },
        // get
        get_active_comp() {
            const comp = app.project.activeItem;
            if (comp instanceof CompItem) {
                return comp;
            } else {
                return a.abort('请在时间轴上打开合成');
            }
        },
        get_selected_comps() {
            const comps = app.project.selection.filter((e): e is CompItem => e instanceof CompItem);
            a.checkLength(comps, '请在项目面板中选择合成');
            return comps;
        },
        get_selected_layers() {
            const layers = this.get_active_comp().selectedLayers;
            a.checkLength(layers, '请选择图层');
            return layers;
        },
        get_selected_properties() {
            const layers = this.get_selected_layers();
            let properties: _PropertyClasses[] = [];
            layers.map((layer) => {
                properties = properties.concat(layer.selectedProperties);
            });
            return properties;
        },
        //add layer
        add_layer: function (type = 'Shape') {
            //@ts-ignore
            return this.get_active_comp().layers['add' + type]?.();
        } as {
            (type?: 'Shape'): ShapeLayer;
            (type: 'Text' | 'BoxText'): TextLayer;
            (type: 'Camera'): CameraLayer;
            (type: 'Light'): LightLayer;
            (type: string): void;
        },
        add_solid_layer(bgColor = [0.5, 0.5, 0.5, 1]) {
            const layer = this.add_layer();
            layer.name = 'Solid';
            const contents = layer.property('ADBE Root Vectors Group').is(PropertyGroup);
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
        add_adjustment_layer() {
            const layer = this.add_solid_layer();
            layer.name = 'Adjustment';
            layer.label = 5;
            layer.adjustmentLayer = true;
            return layer;
        },
        add_null_layer() {
            const layer = this.add_layer();
            layer.name = 'Null';
            layer.label = 1;
            layer.transform.scale.expression = '[100, 100]';
            layer.transform.opacity.setValue(0);
            const contents = layer.property('ADBE Root Vectors Group').is(PropertyGroup);
            contents.addProperty('ADBE Vector Shape - Rect');
            return layer;
        },
        add_layer_from_group(group: PropertyGroup) {
            const layer = group.propertyGroup(2);
            if (!(layer instanceof ShapeLayer)) {
                a.abort('请选择 形状层 - 内容(Contents) 的子属性组');
            }
            const new_layer = layer.duplicate() as ShapeLayer;
            new_layer.name = [layer.name, group.name].join(' - ');
            const contents = new_layer.property('ADBE Root Vectors Group').is(PropertyGroup);
            const beDels = contents
                .map((e, i) => {
                    if (i + 1 != group.propertyIndex) {
                        return e;
                    }
                })
                .filter((e): e is _PropertyClasses => !!e);
            a.emptyArray(beDels);
            return new_layer;
        },
        add_layers_from_selected_groups() {
            const properties = this.get_selected_properties();
            const groups = properties.filter(
                (e): e is PropertyGroup =>
                    e instanceof PropertyGroup && !(e instanceof MaskPropertyGroup),
            );
            a.checkLength(groups, '请选择属性组(除蒙版以外)');
            const beDels = groups.map((e) => (this.add_layer_from_group(e), e));
            a.emptyArray(beDels);
        },
        // unpack
        unpack_comp(comp_layer: AVLayer) {
            comp_layer.selected = true;
            const { containingComp, startTime } = comp_layer;
            const layers: LayerCollection = comp_layer.source.layers;
            for (let i = 1; i <= layers.length; i++) {
                layers[i].copyToComp(containingComp);
                containingComp.layers[comp_layer.index - 1].startTime += startTime;
            }
            comp_layer.selected = false;
        },
        unpack_selected_comps() {
            const layers = this.get_selected_layers();
            const comp_layers = layers.filter((layer): layer is AVLayer & { source: CompItem } => {
                layer.selected = false;
                return layer instanceof AVLayer && layer.source instanceof CompItem;
            });
            a.checkLength(comp_layers, '请选择合成图层');
            const beDels = comp_layers.map((e, i) => (b.unpack_comp(e), e.source));
            a.emptyArray(beDels);
        },
        unpack_layer(layer: ShapeLayer) {
            layer.selected = true;
            const contents = layer.property('ADBE Root Vectors Group').is(PropertyGroup);
            const group_array = contents.filter((e): e is PropertyGroup => {
                return e instanceof PropertyGroup && !(e instanceof MaskPropertyGroup);
            });
            a.checkLength(group_array, `${layer.name} 图层只有 ${group_array.length} 个属性组`, 2);
            group_array.map(this.add_layer_from_group, true);
            layer.selected = false;
        },
        unpack_selected_layers() {
            const layers = this.get_selected_layers();
            const shape_layers = layers.filter((e): e is ShapeLayer => {
                e.selected = false;
                return e instanceof ShapeLayer;
            });
            a.checkLength(shape_layers, '请选择形状图层');
            const beDels = shape_layers.map((e) => (b.unpack_layer(e), e));
            a.emptyArray(beDels);
        },
        // render
        render() {
            app.project.renderQueue.showWindow(true);
            app.project.renderQueue.render();
        },
        render_active_comp() {
            this.render_comp(this.get_active_comp());
        },
        render_selected_comps() {
            this.get_selected_comps().map(this.render_comp);
        },
        render_comp(comp: CompItem) {
            const item = app.project.renderQueue.items.add(comp);
            this.render_setting(item);
            item.render = true;
        },
        render_setting(item: RenderQueueItem) {
            // item.setSettings({});
            // item.outputModule(1).applyTemplate('Template');
            if (!app.project.file) {
                return alert('请先保存项目');
            }
            item.outputModule(1).setSettings({
                'Output File Info': {
                    'Base Path': app.project.file.fsName.replace(/\\[^\\]+$/, ''),
                    'Subfolder Path': 'render',
                    'File Name': item.comp.name,
                },
            });
        },
    };
    /**UI模块 */
    const u = {
        show(win: Window | Panel) {
            win.layout.layout(true);
            win.layout.resize();
            // @ts-ignore
            win.onResizing = win.onResize = () => win.layout.resize();
            if (win instanceof Window) {
                win.show();
            }
        },
        palette: ((that: any, text = '') => {
            return that instanceof Panel
                ? that
                : new Window('palette', void 0, void 0, { resizeable: true }).assign({
                      orientation: 'column',
                      alignChildren: 'left',
                      margins: 0,
                      spacing: 0,
                      text,
                  });
        }) as {
            (that: typeof globalThis, text?: string): Panel | Window;
            (that: null, text?: string): Window;
        },
        dialog: ((that: any, text = '') => {
            return that instanceof Panel
                ? that
                : new Window('dialog', void 0, void 0, { resizeable: true }).assign({
                      orientation: 'column',
                      alignChildren: 'left',
                      margins: 0,
                      spacing: 0,
                      text,
                  });
        }) as {
            (that: typeof globalThis, text?: string): Panel | Window;
            (that: null, text?: string): Window;
        },
        group(node: Window | Panel | Group) {
            return node.add('group').assign({
                orientation: 'row',
                alignChildren: 'center',
                margins: 0,
                spacing: 10,
            });
        },
        panel(node: Window | Panel | Group, text = '') {
            return node.add('panel').assign({
                orientation: 'row',
                alignChildren: 'center',
                margins: 10,
                spacing: 10,
                text,
            });
        },
        button(node: Window | Panel | Group, text = '') {
            return node.add('button', void 0, text);
        },
        iconbutton(node: Window | Panel | Group, icon: string) {
            return node.add('iconbutton', void 0, icon, { style: 'toolbutton' });
        },
        statictext(node: Window | Panel | Group, text: string) {
            const group = u.group(node);
            group.add('statictext', void 0, text);
            return group;
        },
        edittext(node: Window | Panel | Group, text: string, value: string) {
            return u.statictext(node, text).add('edittext', void 0, value);
        },
        slider(node: Window | Panel | Group, text: string) {
            return u.statictext(node, text).add('slider', void 0, 0, 0, 100);
        },
        dropdownlist(node: Window | Panel | Group, text: string, items: string[]) {
            return u.statictext(node, text).add('dropdownlist', void 0, items);
        },
        divider(node: Window | Panel | Group) {
            return u.panel(node).assign({
                alignment: 'fill',
            });
        },
        checkbox(node: Window | Panel | Group, text: string) {
            return node.add('checkbox', void 0, text);
        },
    };
    /**文件模块 */
    const f = {
        read(path: string | File) {
            const file = path instanceof File ? path : f.repair_path(path);
            file.encoding = 'utf-8';
            file.open('r');
            const text = file.read();
            file.close();
            return text;
        },
        write(path: string | File, text: string) {
            const file = path instanceof File ? path : f.repair_path(path);
            // if (file.exists && !confirm('发现同名文件, 是否覆盖?\n' + file.name)) {
            //     return;
            // }
            file.encoding = 'utf-8';
            file.open('w');
            file.write(text);
            file.close();
        },
        open(config: {
            path?: string;
            prompt?: string;
            filter?: string;
            multi?: boolean;
        }): Record<string, string> | void {
            const { path, prompt, filter, multi } = config;
            const files =
                path !== void 0
                    ? new File(path).openDlg(prompt, filter, multi)
                    : File.openDialog(prompt, filter, multi);
            if (!files) return;
            const datas: Record<string, string> = {};
            (files instanceof File ? [files] : files).map((file) => {
                datas[File.decode(file.name)] = f.read(file.fsName);
            });
            return datas;
        },
        save(datas: Record<string, string>, config: { path?: string; prompt?: string }) {
            const { path, prompt } = config;
            const folder =
                path !== void 0 ? new Folder(path).selectDlg(prompt) : Folder.selectDialog(prompt);
            if (!folder) return;
            datas.each((text, name) => {
                f.write(folder.fsName + '\\' + name, text);
            });
        },
        /**检查路径是否存在，不存在则创建路径 */
        repair_path: ((path: string, type = 'file') => {
            function create_folder<T>(folder: Folder, result: T): T {
                if (folder.exists || folder.create()) {
                    return result;
                } else {
                    return abort('文件夹创建失败');
                }
            }
            switch (type) {
                case 'file': {
                    const file = new File(path);
                    return file.exists ? file : create_folder(file.parent, file);
                }
                case 'folder': {
                    const folder = new Folder(path);
                    return create_folder(folder, folder);
                }
            }
        }) as {
            (path: string, type?: 'file'): File;
            (path: string, type: 'folder'): Folder;
        },
    };
    File.isEncodingAvailable('utf-8') || alert('文件读写功能受限: 系统不支持utf-8编码');
    return { a, b, u, f };
})();
const { abort } = cubx.a;
//添加原型方法
(function () {
    /**
     * 构建遍历函数
     * @invoke (数组)(长度)(获取元素函数)( 遍历顺序：默认倒序)(回调函数)(构建返回数组函数)
     */
    function curry_each<T extends any[] | PropertyGroup>(data: T) {
        return function (len: number) {
            return function <U>(getValue: (array: T, index: number) => U) {
                return function <R>(
                    fn: (value: U, index: number, resultArray: R[]) => void,
                    order?: boolean,
                ) {
                    const array: R[] = [];
                    for (let i = len - 1; i >= 0; i--) {
                        const index = order ? len - 1 - i : i;
                        fn(getValue(data, index), index, array);
                    }
                    return array;
                };
            };
        };
    }
    Array.prototype.map = function (fn, order) {
        return curry_each(this)(this.length)((arr, i) => arr[i])(
            (e, i, arr) => (arr[i] = fn(e, i, this)),
            order,
        );
    };
    Array.prototype.filter = function (fn) {
        return curry_each(this)(this.length)((arr, i) => arr[i])(
            (e, i, arr) => fn(e, i, this) && arr.push(e),
        );
    };
    Object.prototype.is = function (constructor) {
        if (this instanceof constructor) {
            return this as InstanceType<typeof constructor>;
        } else {
            return abort(`数据类型不为 ${constructor}`);
        }
    };
    Object.prototype.each = function (fn) {
        for (let key in this) {
            if (this.hasOwnProperty(key)) {
                fn(this[key], key, this);
            }
        }
    };
    Object.prototype.assign = function (config) {
        config.each((v, k) => {
            // @ts-ignore
            this[k] = v;
        });
        return this;
    };
    PropertyGroup.prototype.map = function (fn, order) {
        return curry_each(this)(this.numProperties)((arr, i) => arr(i + 1))(
            (e, i, arr) => (arr[i] = fn(e, i, this)),
            order,
        );
    };
    PropertyGroup.prototype.filter = function (fn) {
        return curry_each(this)(this.numProperties)((arr, i) => arr(i + 1))(
            (e, i, arr) => fn(e, i, this) && arr.push(e),
        );
    };
    MaskPropertyGroup.prototype.map = function (fn, order) {
        return curry_each(this)(this.numProperties)((arr, i) => arr(i + 1))(
            (e, i, arr) => (arr[i] = fn(e, i, this)),
            order,
        );
    };
    MaskPropertyGroup.prototype.filter = function (fn) {
        return curry_each(this)(this.numProperties)((arr, i) => arr(i + 1))(
            (e, i, arr) => fn(e, i, this) && arr.push(e),
        );
    };
})();
