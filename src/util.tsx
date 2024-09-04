// 封装了一些常用模块：文件系统、UI 构建、工具函数等
import * as _ from 'soil-ts';
import JSON from 'json5';

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
    const obj: Record<string, Property> = {};
    const group_info_arr = _.filter(
      _.map(array, (e, i) => {
        if (e instanceof PropertyGroup) {
          // return _.pick(e,  'propertyIndex');
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
  watch<T extends Object, K extends keyof T>(
    obj: T,
    key: K,
    callback: (newValue: T[K], oldValue: T[K]) => void,
  ) {
    obj.watch(key, (name, _old, _new) => {
      callback(_new, _old);
    });
    return () => {
      obj.unwatch(key);
    };
  },
  watchAll<T extends Object>(
    obj: T,
    callback: <K extends keyof T>(
      name: K,
      newValue: T[K],
      oldValue: T[K],
    ) => void,
  ) {
    const unwatchs: (() => void)[] = [];
    //@ts-ignore
    _.forOwn(obj, (value, key: keyof T) => {
      const unwatch = a.watch(obj, key, (...e) => {
        callback(key, ...e);
      });
      unwatchs.push(unwatch);
    });
    return () => {
      _.each(unwatchs, (unwatch) => unwatch());
    };
  },
  update(options: {
    current_version: string;
    latest_version: (text: string) => string | void;
    download_from: string;
    download_to: string;
    move_to: string;
  }) {
    const {
      current_version,
      latest_version,
      download_from,
      download_to,
      move_to,
    } = options;
    if ($.os.indexOf('Windows') !== -1) {
      system.callSystem(
        `cmd /c powershell -Command "echo Checking update...; iwr -Uri ${download_from} -OutFile ${download_to}"`,
      );
    } else {
      return alert('Update error: only support Windows');
    }
    const file = new File(download_to);
    if (!file.exists) {
      return alert("Update error: can't download script");
    }
    const version = latest_version(f.read(file));
    if (!version) {
      return alert("Update error: can't get version");
    }
    if (version === current_version) {
      file.remove();
      alert('Update success: already latest version', version);
    } else if (file.copy(move_to)) {
      file.remove();
      alert('Update success: please restart application', version);
    } else {
      alert(
        `Update error: can't move script, please move it manually:\n${file.fsName}`,
        version,
      );
    }
  },
};
/**工具箱模块 */
export const t = {
  // get
  get_active_comp() {
    const comp = app.project.activeItem;
    return comp instanceof CompItem ? comp : a.abort('Please select a comp');
  },
  get_selected_comps() {
    const comps = _.filter(app.project.selection, (e) => e instanceof CompItem);
    a.checkLength(comps, 'Please select comps in project panel');
    return comps;
  },
  get_selected_layers() {
    const layers = t.get_active_comp().selectedLayers;
    a.checkLength(layers, 'Please select layers');
    return layers;
  },
  get_selected_properties() {
    const layers = t.get_selected_layers();
    return _.flatMap(layers, (layer) => layer.selectedProperties);
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
    const layer = t.add_layer();
    layer.name = 'Solid';
    const contents = layer.property<PropertyGroup>('ADBE Root Vectors Group');
    contents
      .addProperty('ADBE Vector Shape - Rect')
      .property<Property>('Size')
      .setValue([layer.width, layer.height]);
    contents
      .addProperty('ADBE Vector Graphic - Fill')
      .property<Property>('Color')
      .setValue(bgColor);
    return layer;
  },
  add_adjustment_layer() {
    const layer = t.add_solid_layer();
    layer.name = 'Adjustment';
    layer.label = 5;
    layer.adjustmentLayer = true;
    return layer;
  },
  add_null_layer() {
    const layer = t.add_layer();
    layer.name = 'Null';
    layer.label = 1;
    layer.transform.scale.expression = ' 100';
    layer.transform.opacity.setValue(0);
    const contents = layer.property<PropertyGroup>('ADBE Root Vectors Group');
    contents.addProperty('ADBE Vector Shape - Rect');
    return layer;
  },
  add_layer_from_group(group: PropertyGroup) {
    const layer = group.propertyGroup(2);
    if (!(layer instanceof ShapeLayer)) {
      return a.abort('Please select ShapeLayer > Contents > Group');
    }
    const new_layer = layer.duplicate();
    new_layer.name = [layer.name, group.name].join(' - ');
    const contents = new_layer.property<PropertyGroup>(
      'ADBE Root Vectors Group',
    );
    const beDels: _PropertyClasses[] = [];
    _.eachProperties(contents, (e, i) => {
      i + 1 != group.propertyIndex && e && beDels.push(e);
    });
    a.emptyArray(beDels);
    return new_layer;
  },
  add_layers_from_selected_groups() {
    const properties = t.get_selected_properties();
    const groups = _.filter(
      properties,
      (e): e is PropertyGroup =>
        e instanceof PropertyGroup && !(e instanceof MaskPropertyGroup),
    );
    a.checkLength(
      groups,
      'Please select PropertyGroups, MaskPropertyGroup is not allowed',
    );
    const beDels = _.map(groups, (e) => (t.add_layer_from_group(e), e));
    a.emptyArray(beDels);
  },
  add_layers_from_file() {
    const data = f.open({ filter: '*.txt' });
    if (!data) return;
    _.forOwn(data, (text) => {
      const { layers } = t.get_active_comp();
      _.map(text.split('\n'), (e) => {
        layers.addText(e);
      });
    });
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
    const layers = t.get_selected_layers();
    const comp_layers = _.filter(
      layers,
      (layer): layer is AVLayer & { source: CompItem } => {
        layer.selected = false;
        return layer instanceof AVLayer && layer.source instanceof CompItem;
      },
    );
    a.checkLength(comp_layers, 'Please select Comp layers');
    const beDels = _.map(comp_layers, (e, i) => (t.unpack_comp(e), e.source));
    a.emptyArray(beDels);
  },
  unpack_layer(layer: ShapeLayer) {
    layer.selected = true;
    const contents = layer.property<PropertyGroup>('ADBE Root Vectors Group');
    const group_array: PropertyGroup[] = [];
    _.eachProperties(contents, (e) => {
      e instanceof PropertyGroup &&
        !(e instanceof MaskPropertyGroup) &&
        group_array.push(e);
    });
    a.checkLength(
      group_array,
      `${layer.name} layer only has ${group_array.length} Groups`,
      2,
    );
    _.map(group_array, t.add_layer_from_group);
    layer.selected = false;
  },
  unpack_selected_layers() {
    const layers = t.get_selected_layers();
    const shape_layers = _.filter(layers, (e): e is ShapeLayer => {
      e.selected = false;
      return e instanceof ShapeLayer;
    });
    a.checkLength(shape_layers, 'Please select ShapeLayers');
    const beDels = _.map(shape_layers, (e) => (t.unpack_layer(e), e));
    a.emptyArray(beDels);
  },
  // render
  render() {
    app.project.renderQueue.showWindow(true);
    app.project.renderQueue.render();
  },
  render_active_comp() {
    t.render_comp(t.get_active_comp());
  },
  render_selected_comps() {
    _.map(t.get_selected_comps(), t.render_comp);
  },
  render_comp(comp: CompItem) {
    const item = app.project.renderQueue.items.add(comp);
    t.render_setting(item);
    item.render = true;
  },
  render_setting(item: RenderQueueItem) {
    // item.setSettings({});
    // item.outputModule(1).applyTemplate('Template');
    if (!app.project.file) {
      return alert('Please save the project first');
    }
    item.outputModule(1).setSettings({
      'Output File Info': {
        'Base Path': app.project.file.fsName.replace(/\\[^\\]+$/, ''),
        'Subfolder Path': 'render',
        'File Name': item.comp.name,
      },
    });
  },
  // other
  simple_fix_expression() {
    // expression_controls
    _.forOwn(
      {
        '3D Point': 'ADBE Point3D Control',
        Angle: 'ADBE Angle Control',
        Checkbox: 'ADBE Checkbox Control',
        Color: 'ADBE Color Control',
        Layer: 'ADBE Layer Control',
        Point: 'ADBE Point Control',
        Slider: 'ADBE Slider Control',
        // in AE 2024
        'Dropdown Menu': 'Pseudo/@@ABzbw5g3TlyO2XPLzAXD9w',
        Menu: 'Pseudo/@@ABzbw5g3TlyO2XPLzAXD9w',
      },
      (v, k) => {
        app.project.autoFixExpressions(`${k} Control`, v);
        app.project.autoFixExpressions(k, `${v}-0001`);
      },
    );
  },
  show_matchname() {
    let selected: _PropertyClasses[] = [];
    for (const fn of [
      () => t.get_selected_properties(),
      () => t.get_selected_layers(),
    ]) {
      selected = fn();
      if (selected.length) break;
    }
    const matchanmes = _.map(selected, (item) => item.matchName);
    prompt('You can copy them', matchanmes.join('; '), 'MatchNames');
  },
  cut_layer_by_markers() {
    const comp = t.get_active_comp();
    const get_layers = (function () {
      let temp = comp.layers;
      return function () {
        return isValid(temp) ? temp : (temp = comp.layers);
      };
    })();
    const get_last_layer = (function () {
      let temp = get_layers()[get_layers().length];
      return function () {
        return isValid(temp)
          ? temp
          : (temp = get_layers()[get_layers().length]);
      };
    })();
    function get_last_layer_marker(ni: number) {
      const marker = get_last_layer().property<MarkerValueProperty>('Marker');
      const beg = marker.keyTime(ni) + delay,
        dur = marker.keyValue(ni).duration;
      return [beg, beg + dur]; //标记开始 结束
    }
    const marker_num =
      get_last_layer().property<Property>('ADBE Marker').numKeys;
    const delay = 0 / 30; //入点向后延迟时间
    for (let n = 1; n < marker_num; n++) {
      //调整出入点 复制
      get_layers()[1].startTime = 0; //图层对齐合成开头
      _.assign(get_layers()[1], {
        inPoint: get_last_layer_marker(n)[1],
        outPoint: get_last_layer_marker(n + 1)[0],
      });
      get_layers()[1].startTime =
        n === 1
          ? 0 - get_layers()[1].inPoint
          : get_layers()[2].outPoint - get_layers()[1].inPoint;
      if (n != marker_num - 1) {
        get_layers()[1].duplicate();
      }
    }
    get_last_layer().remove();
  },
};
type LooseFile = string | File;
/**文件模块 */
export const f = {
  new: ((path: string, type = 'f') => {
    const mkdirs = (folder: Folder) =>
      folder.exists ||
      folder.create() ||
      a.abort('Failed to create folder: ' + folder.fsName);
    switch (type) {
      case 'f': {
        const file = new File(path);
        mkdirs(file.parent);
        return file;
      }
      case 'd': {
        const folder = new Folder(path);
        mkdirs(folder);
        return folder;
      }
    }
  }) as {
    (path: string, type?: 'f'): File;
    (path: string, type: 'd'): Folder;
  },
  read(path: LooseFile) {
    const file = path instanceof File ? path : f.new(path);
    file.encoding = 'utf-8';
    file.open('r');
    const text = file.read();
    file.close();
    return text;
  },
  readJson(path: LooseFile) {
    return JSON.parse(f.read(path));
  },
  write(path: LooseFile, text: string) {
    const file = path instanceof File ? path : f.new(path);
    // if (
    //   file.exists &&
    //   !confirm('Find same name file, should replace it? ' + file.name)
    // ) {
    //   return;
    // }
    file.encoding = 'utf-8';
    file.open('w');
    file.write(text);
    file.close();
  },
  writeJson(path: LooseFile, obj: {}, format = false) {
    f.write(path, JSON.stringify(obj, null, format ? 2 : null));
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
};
