// 封装了一些常用模块：文件系统、UI 构建、工具函数等
import * as _ from 'soil-ts';

/**辅助模块 */
export const a = {
    /**终止程序并发出警告 */
    abort(message: string) {
        if (!$.level) {
            alert(message, 'Abort');
        }
        throw new Error(message);
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
        const group_info_arr = _.filter(
            _.map(array, (e, i) => {
                if (e instanceof PropertyGroup) {
                    // return _.pick(e, ['parentProperty', 'propertyIndex']);
                    const { parentProperty, propertyIndex } = e;
                    return { parentProperty, propertyIndex };
                } else {
                    obj[i] = e;
                }
            }),
            (
                e,
            ): e is {
                parentProperty: PropertyGroup;
                propertyIndex: number;
            } => !!e,
        );
        _.map(group_info_arr, ({ parentProperty, propertyIndex }) => {
            parentProperty(propertyIndex).remove();
        });
        _.forOwn(obj, (value) => value.remove());
    },
};
/**工具箱模块 */
export const b = {
    // get
    get_active_comp() {
        const comp = app.project.activeItem;
        return comp instanceof CompItem
            ? comp
            : a.abort('请在时间轴上打开合成');
    },
    get_selected_comps() {
        const comps = _.filter(
            app.project.selection,
            (e): e is CompItem => e instanceof CompItem,
        );
        a.checkLength(comps, '请在项目面板中选择合成');
        return comps;
    },
    get_selected_layers() {
        const layers = b.get_active_comp().selectedLayers;
        a.checkLength(layers, '请选择图层');
        return layers;
    },
    get_selected_properties() {
        const layers = b.get_selected_layers();
        let properties: _PropertyClasses[] = [];
        _.each(layers, (layer) => {
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
        const layer = b.add_layer();
        layer.name = 'Solid';
        const contents = layer.property(
            'ADBE Root Vectors Group',
        ) as PropertyGroup;
        (
            contents
                .addProperty('ADBE Vector Shape - Rect')
                .property('Size') as Property
        ).setValue([layer.width, layer.height]);
        (
            contents
                .addProperty('ADBE Vector Graphic - Fill')
                .property('Color') as Property
        ).setValue(bgColor);
        return layer;
    },
    add_adjustment_layer() {
        const layer = b.add_solid_layer();
        layer.name = 'Adjustment';
        layer.label = 5;
        layer.adjustmentLayer = true;
        return layer;
    },
    add_null_layer() {
        const layer = b.add_layer();
        layer.name = 'Null';
        layer.label = 1;
        layer.transform.scale.expression = '[100, 100]';
        layer.transform.opacity.setValue(0);
        const contents = layer.property(
            'ADBE Root Vectors Group',
        ) as PropertyGroup;
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
        const contents = new_layer.property(
            'ADBE Root Vectors Group',
        ) as PropertyGroup;
        const beDels = [] as _PropertyClasses[];
        _.eachProperties(contents, (e, i) => {
            i + 1 != group.propertyIndex && e && beDels.push(e);
        });
        a.emptyArray(beDels);
        return new_layer;
    },
    add_layers_from_selected_groups() {
        const properties = b.get_selected_properties();
        const groups = _.filter(
            properties,
            (e): e is PropertyGroup =>
                e instanceof PropertyGroup && !(e instanceof MaskPropertyGroup),
        );
        a.checkLength(groups, '请选择属性组(除蒙版以外)');
        const beDels = _.map(groups, (e) => (b.add_layer_from_group(e), e));
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
        const layers = b.get_selected_layers();
        const comp_layers = _.filter(
            layers,
            (layer): layer is AVLayer & { source: CompItem } => {
                layer.selected = false;
                return (
                    layer instanceof AVLayer && layer.source instanceof CompItem
                );
            },
        );
        a.checkLength(comp_layers, '请选择合成图层');
        const beDels = _.map(
            comp_layers,
            (e, i) => (b.unpack_comp(e), e.source),
        );
        a.emptyArray(beDels);
    },
    unpack_layer(layer: ShapeLayer) {
        layer.selected = true;
        const contents = layer.property(
            'ADBE Root Vectors Group',
        ) as PropertyGroup;
        const group_array = [] as PropertyGroup[];
        _.eachProperties(contents, (e) => {
            e instanceof PropertyGroup &&
                !(e instanceof MaskPropertyGroup) &&
                group_array.push(e);
        });
        a.checkLength(
            group_array,
            `${layer.name} 图层只有 ${group_array.length} 个属性组`,
            2,
        );
        _.map(group_array, b.add_layer_from_group);
        layer.selected = false;
    },
    unpack_selected_layers() {
        const layers = b.get_selected_layers();
        const shape_layers = _.filter(layers, (e): e is ShapeLayer => {
            e.selected = false;
            return e instanceof ShapeLayer;
        });
        a.checkLength(shape_layers, '请选择形状图层');
        const beDels = _.map(shape_layers, (e) => (b.unpack_layer(e), e));
        a.emptyArray(beDels);
    },
    // render
    render() {
        app.project.renderQueue.showWindow(true);
        app.project.renderQueue.render();
    },
    render_active_comp() {
        b.render_comp(b.get_active_comp());
    },
    render_selected_comps() {
        _.map(b.get_selected_comps(), b.render_comp);
    },
    render_comp(comp: CompItem) {
        const item = app.project.renderQueue.items.add(comp);
        b.render_setting(item);
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
/**文件模块 */
export const f = {
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
        files instanceof File
            ? [files]
            : _.each(files, (file) => {
                  datas[File.decode(file.name)] = f.read(file.fsName);
              });
        return datas;
    },
    save(
        datas: Record<string, string>,
        config: { path?: string; prompt?: string },
    ) {
        const { path, prompt } = config;
        const folder =
            path !== void 0
                ? new Folder(path).selectDlg(prompt)
                : Folder.selectDialog(prompt);
        if (!folder) return;
        _.forOwn(datas, (text, name) => {
            f.write(folder.fsName + '\\' + name, text);
        });
    },
    /**检查路径是否存在，不存在则创建路径 */
    repair_path: ((path: string, type = 'file') => {
        function create_folder<T>(folder: Folder, result: T): T {
            if (folder.exists || folder.create()) {
                return result;
            } else {
                return a.abort('文件夹创建失败');
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
