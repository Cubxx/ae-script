/**
 * 图层导出/导入
 * 目前支持：形状层、文本层
 */
import JSON from 'json5';
import * as _ from 'soil-ts';
import { a, f, t } from './util';

const config = {
  version: '1.0.0',
  icons: {
    import:
      '\x89PNG\r\n\x1A\n\x00\x00\x00\rIHDR\x00\x00\x00\x18\x00\x00\x00\x18\b\x06\x00\x00\x00àw=ø\x00\x00\x00\tpHYs\x00\x00\x0EÃ\x00\x00\x0EÃ\x01Ço¨d\x00\x00\x00\x19tEXtSoftware\x00www.inkscape.org\x9Bî<\x1A\x00\x00\x01\x06IDATH\x89íÕ±JÃP\x14\x06à¯­\b\x82«í#\x18PQpë"\x05_Ç\x07ëàê&â\x03\b\x1D«/PpvqÐëà\tÞh\x9A&\x81\x82C\x7Fø9IÎ9ÿ\x7Fï!¹\x19¤\x94l\x13Ã­ª÷0¸\t¶Æ ã\x88\x1E"ÎÚ6ü»\x11í\fv\x06Ý\fÆ¸EÑPSDÍ¸\x8F\x01L}\x7F\\u&Eä¦M\x02M\x06¯¸Â\'\x1Eq\x92å\x8Eq\x8F\x01®£¶\x16m\x8E\x8Ar¥ð\x16ñ0â\fËÆî\x94RÉ£ \x1A\x16)¥UúÁ*\x9EÕÕVtòÄ]°®)7i\x12ÿ£³\x97mæ`Ã¨\x968\x8Fëµ3ÿ­\x93\x1B$\x8C6\x984\t\x97\x18â#¿)ñ\x82SLZ\x88¬Ã\x04g¡\x85ê[Tà\tïXä«h\x89\x11.°\x8FK<SÝÁ2\x12ó\x1Eâ¢g\x9E\x8BÓý\x97Ù\x19[?ì¾\x00{}Ç\x97×÷\x05\x0E\x00\x00\x00\x00IEND®B`\x82',
    export:
      '\x89PNG\r\n\x1A\n\x00\x00\x00\rIHDR\x00\x00\x00\x18\x00\x00\x00\x18\b\x06\x00\x00\x00àw=ø\x00\x00\x00\tpHYs\x00\x00\x0EÃ\x00\x00\x0EÃ\x01Ço¨d\x00\x00\x00\x19tEXtSoftware\x00www.inkscape.org\x9Bî<\x1A\x00\x00\x00ìIDATH\x89í\x95Á\tÂ@\x10E_\x8C\b\x16 ¶ b@°\v\x9B°\x13¯zK\r\x1E­B\x1B\x10<\x89Ú\x82\x05\x88\x88\x8C\x97\x91ÌJ4cdÁ\x83\x1F\x86°Ù\x9D÷²°K\x12\x11!f\x1AQé5\x04S-\x7FDÄ[¹\x14É½}\x9FÂ¯Zn\x89\x07>7Àµ\x88¬DdfÞ%ß\br\x03Bá«\x17s\x1F\v²\x12\x80\x15XIVw\x07ý§ñ³ lMPUÇtç8\x88o×üÜEû\vâ\n:Zß&à4ÍÄB\x9Fã7Íg\x87 àXAÛÑ<q¬\t8V @ZÑ|r\b\x1AÀÍ\x0E\x1E9\x02\x03 ë\x80¼J\x17È\x94\x05@"Å?¹\x07l\x80\v°µ_áL\n\f\x81\x160\x02\x0E\x10î`¯\x13Ë\x1Ap´giá\x10î J¢_´;Ánç\x99×X! \x00\x00\x00\x00IEND®B`\x82',
    setting:
      "\x89PNG\r\n\x1A\n\x00\x00\x00\rIHDR\x00\x00\x00\x18\x00\x00\x00\x18\b\x06\x00\x00\x00àw=ø\x00\x00\x00\tpHYs\x00\x00\x0EÃ\x00\x00\x0EÃ\x01Ço¨d\x00\x00\x00\x19tEXtSoftware\x00www.inkscape.org\x9Bî<\x1A\x00\x00\x01ÊIDATH\x89µ\x961OTA\x10Ç\x7FÏ\x1C\rØ\\¼B\x13@L,ý\x02Ä\x0Eb)\x85V´BÁéUÚó%4á\x1B(±C\v*\v!!Á³4jabB£\x05t'R ?\x8B\x1BâòÜwï\x12ò&\x99äí\x7Fÿ;³;;3û\n\x95&åJ£Ö\x81Ö\x98¼»@\x0FèÄø\x10x\x0EìÕ-,Æ\bÑUà\x1B0\x00¾\x07v+ðÛ\x81W\x8BZ§\v\x0Ee¡\x06Ëj\x0E\\T÷Õ\x1Dõ©º­þVÛ\t§\x1DØvpvbÍ½:\x07³ê/µ¯~\x88]\x0EÔG\x99\x8D¬Ä\x9CÁí«ÇêÍQ\x0E^\x85\x83\x99\x18wÔÉ\x11!\x98\n\x0Eêt8Ü¬r0§\x9E©ë\x19C-uM}\x1Dº\x16X\x99·\x1E6æÎ±´\x0En\x00E¤`*-à\x1D°\x01Ü\tÝ\b¬\x9CæGaãzU\x16½\x89\x1Dô\x12¬\x1BØr\x82-\x07ÖM°^`[£î`B}«\x1E\x96îåK&\x1C_Õ\x97Éø(ÖN¤¼ªVaé»Èp\x8A\f/céâ®¶\x9A\fÑ¼Cy\x9CÉ ÷1÷9ÔÀÊ\x99ô$ææs!ú\x11Çì\x94\x0Ey\n,\x02]àSh7°Ó\x12÷ZØøY\x15¢M\x87\x856í¿B\x9BÊ\\p®Ðfbme¡\x9D·\x8Acÿo\x15+\x19ã«^l\x15\x1FÃÁì¨,:\x00î\x03gÀ\tð\fØ\x05^\x00í\x84×fø\x1Eì\x06ç\x04ø\x03,\x85\x8DÊ,Êé¥Úuã\x0FÎ8oò\x00x\bô\x13¬\x0F<¨3\x0Eã=\x99\x97\x92Æÿ*þ\x02\x1DÕàî\x95Þ\x02Ò\x00\x00\x00\x00IEND®B`\x82",
  },
  pth: (() => {
    const name = 'layer-saver.ui.jsx';
    const root = Folder.myDocuments.fsName + '/' + name.split('.')[0];
    return {
      config_data: root + '/user.cfg',
      layers: root + '/layers',
      update: {
        download_from:
          'https://raw.githubusercontent.com/Cubxx/ae-script/main/dist/' + name,
        download_to: root + '/' + name,
        move_to: Folder.appPackage.fsName + '/Scripts/ScriptUI Panels/' + name,
      },
    };
  })(),
  /**配置数据 */
  data: { auto_updata: true },
  syncData() {
    const filepath = config.pth.config_data;
    const file = f.new(filepath);
    const write = () => {
      f.writeJson(filepath, config.data);
    };
    if (file.exists) {
      config.data = f.readJson(filepath);
    } else {
      write();
    }
    a.watchAll(config.data, write);
    //@ts-ignore: invoke once
    delete this.syncData;
  },
};
/**属性数据 */
type PropertyJson = {
  value?: unknown;
  expression?: string;
  expressionEnabled?: boolean;
  keys?: KeyframeData[];
  ['@matchName']?: string;
  [x: string]: unknown;
};
/**关键帧数据 */
class KeyframeData {
  [key: string]: unknown;
  constructor(property: Property) {
    if (KeyframeData.isSpatial(property)) {
      this.SpatialAutoBezier = false;
      this.SpatialContinuous = false;
      this.InSpatialTangent = [0, 0];
      this.OutSpatialTangent = [0, 0];
      this.Roving = false;
    }
  }
  /**判断属性值类型是否为空间值 */
  static isSpatial(p: Property) {
    return !!_.filter(
      [PropertyValueType.TwoD_SPATIAL, PropertyValueType.ThreeD_SPATIAL],
      (e): e is PropertyValueType => e === p.propertyValueType,
    ).length;
  }
  /**入点插值类型 */
  InInterpolationType = KeyframeInterpolationType.LINEAR;
  OutInterpolationType = KeyframeInterpolationType.LINEAR;
  /**入点缓动 */
  InTemporalEase = [new KeyframeEase(0, 0.1)] as [
    KeyframeEase,
  ]; /* | [KeyframeEase, KeyframeEase] | [KeyframeEase, KeyframeEase, KeyframeEase] */
  OutTemporalEase = [new KeyframeEase(0, 0.1)] as [
    KeyframeEase,
  ]; /* | [KeyframeEase, KeyframeEase] | [KeyframeEase, KeyframeEase, KeyframeEase] */
  /**时间自动贝塞尔 */
  TemporalAutoBezier = false;
  /**时间连续性 */
  TemporalContinuous = false;
  Time = 0;
  Value = null as unknown;
  //以下为空间值特有属性
  SpatialAutoBezier?: boolean;
  SpatialContinuous?: boolean;
  /**入点空间线性 */
  InSpatialTangent?: [number, number] /* | [number, number, number] */;
  OutSpatialTangent?: [number, number] /* | [number, number, number] */;
  /**漂浮关键帧 */
  Roving?: boolean;
}
const cvt = {
  _any2obj: {
    'object[]'(v: object[]) {
      _.map(v, (e, i, arr) => {
        cvt.set_property_data(i, arr[i], arr);
      });
      return v;
    },
    MarkerValue(v: MarkerValue) {
      return v;
    },
    Shape(v: Shape) {
      return v;
    },
    TextDocument(v: TextDocument) {
      const obj: Partial<TextDocument> = {};
      _.each(
        (
          [
            'applyFill',
            'applyStroke',
            'fillColor',
            'font',
            'fontSize',
            'justification',
            'leading',
            'strokeColor',
            'strokeOverFill',
            'strokeWidth',
            'text',
            'tracking',
          ] satisfies NonReadonlyKeys<TextDocument>[]
        ).concat(v.boxText ? ['boxTextPos', 'boxTextSize'] : []),
        (key) => {
          //@ts-ignore
          obj[key] = v[key];
        },
      );
      return obj;
    },
    KeyframeEase(v: KeyframeEase) {
      return v;
    },
    KeyframeData(v: KeyframeData) {
      _.forOwn(v, (value, key, obj) => {
        cvt.set_property_data(key, obj[key], obj);
      });
      return v;
    },
  },
  _obj2any: {
    'object[]'(v: object[]): any[] {
      return _.map(v, (e, i, arr) => cvt.get_property_data(i, arr));
    },
    MarkerValue(v: Partial<MarkerValue>) {
      return new MarkerValue('');
    },
    Shape(v: Partial<Shape>) {
      const obj = new Shape();
      _.forOwn(v, (value, key: string) => {
        //@ts-ignore
        obj[key] = value;
      });
      return obj;
    },
    TextDocument(v: Partial<TextDocument>) {
      return v;
    },
    KeyframeEase(v: Partial<KeyframeEase>) {
      const { speed, influence } = v;
      return new KeyframeEase(speed, influence < 0.1 ? 0.1 : influence); // 脚本设置 influence 范围 0.1 - 100
    },
    KeyframeData(v: Partial<KeyframeData>) {
      const obj = {} as KeyframeData;
      _.forOwn(v, (value, key) => {
        obj[key] = cvt.get_property_data(key, v);
      });
      return obj;
    },
  },
  type(value: {}) {
    const type = value.constructor.name;
    switch (type) {
      case 'MarkerValue':
        return type;
      case 'Shape':
        return type;
      case 'TextDocument':
        return type;
      case 'KeyframeEase':
        return type;
      case 'KeyframeData':
        return type;
    }
    if (value instanceof Array) {
      if (value.length === 0) {
        return;
      } else if (
        _.filter(value, (e): e is object => typeof e === 'object').length ===
        value.length
      ) {
        return 'object[]';
      }
    }
  },
  /**
   * 自动识别 type, 并写入 data 对象
   * @description 识别成功: 添加 type 属性, 转化 value
   */
  set_property_data(key: string | number, value: any, data: object) {
    const type = cvt.type(value);
    if (type) {
      data[key] = cvt._any2obj[type](value);
      data[key]['@type'] = type;
    } else {
      data[key] = value;
    }
  },
  /**
   * 获取 type 属性, 返回 value
   * @description 获取成功: 删除 type 属性, 转化 value
   * @description 如果 value 是 object[], 则遍历调用本方法
   */
  get_property_data<T extends object>(key: keyof T, data: T) {
    const value = data[key];
    const type: string | void = value['@type'];
    if (type) {
      delete value['@type'];
      return cvt._obj2any[type](value);
    } else if (cvt.type(value) === 'object[]') {
      return cvt._obj2any['object[]'](value as object[]);
    }
    return value;
  },
};
const lyr = {
  /**
   * 返回不同模式的递归函数
   */
  recur_factory: function (
    mode: 'get' | 'set',
    {
      GroupFn = (p: PropertyGroup | MaskPropertyGroup, d: {}) => true,
      PropertyFn = (p: Property, d: {}) => true,
    },
  ) {
    //@ts-ignore
    const that = this;
    const group_fn = mode + '_group',
      property_fn = mode + '_property';
    return function recur(p: _PropertyClasses, d: {}) {
      if (p instanceof PropertyGroup || p instanceof MaskPropertyGroup) {
        if (!GroupFn(p, d)) return;
        return that[group_fn](p, d, recur);
      } else if (p instanceof Property) {
        if (!PropertyFn(p, d)) return;
        switch (p.propertyValueType) {
          case PropertyValueType.NO_VALUE:
            return;
          // case PropertyValueType.CUSTOM_VALUE: return;
          default:
            return that[property_fn](p, d);
        }
      }
    };
  } as {
    (
      mode: 'get',
      {
        GroupFn,
        PropertyFn,
      }: {
        GroupFn?: (
          p: PropertyGroup | MaskPropertyGroup,
          d: PropertyJson,
        ) => boolean;
        PropertyFn?: (p: Property, d: PropertyJson) => boolean;
      },
    ): (p: _PropertyClasses, d: PropertyJson) => void | {};
    (
      mode: 'set',
      {
        GroupFn,
        PropertyFn,
      }: {
        GroupFn?: (
          p: PropertyGroup | MaskPropertyGroup,
          d: PropertyJson,
        ) => boolean;
        PropertyFn?: (p: Property, d: PropertyJson) => boolean;
      },
    ): (p: _PropertyClasses, d: PropertyJson) => _PropertyClasses;
  },
  /**
   * 递归获取 PropertyGroup 下的所有 _PropertyClasses
   * 并对不同的 _PropertyClasses 执行不同函数
   */
  get_group(
    group: PropertyGroup | MaskPropertyGroup,
    data: PropertyJson,
    recur: (p: _PropertyClasses, d: {}) => void | {},
  ) {
    data['@matchName'] = group.matchName;
    _.eachProperties(group, (property: _PropertyClasses) => {
      const value = recur(property, {});
      if (value != null) {
        data[property.name] = value;
      }
    });
    return data;
  },
  set_group(
    group: PropertyGroup | MaskPropertyGroup,
    data: {},
    recur: (p: _PropertyClasses, d: {}) => _PropertyClasses,
  ) {
    _.forOwn(data, (sub_data, key) => {
      if (key[0] === '@') {
        return;
      }
      if (typeof sub_data !== 'object') {
        group[key] = sub_data;
        return;
      }
      let property: _PropertyClasses;
      const matchName = sub_data['@matchName'],
        name = key;
      if (matchName) {
        if (group.canAddProperty(matchName)) {
          // group
          property = group.addProperty(matchName);
          if (group.propertyType === PropertyType.INDEXED_GROUP) {
            property.name = name;
          }
        } else {
          // property
          property = group.property(matchName);
        }
      } else if (name) {
        // property
        property = group.property(name);
      } else {
        return a.abort('属性创建/获取失败:' + name);
      }
      recur(property, sub_data);
    });
    return group;
  },
  /**
   * 获取 Property 的属性，并写入 data
   */
  get_property(property: Property, data: object = {}) {
    function get(
      key: keyof PropertyJson,
      defalutValue?: PropertyJson[keyof PropertyJson],
    ) {
      cvt.set_property_data(key, property[key] ?? defalutValue, data);
    }
    if (!property.canVaryOverTime) {
      // 不能设置 关键帧或表达式
      get('value');
      return data;
    }
    if (property.canSetExpression && property.expression) {
      // 有表达式
      get('expression');
      get('expressionEnabled');
    }
    if (property.numKeys) {
      // 有关键帧
      const keys: KeyframeData[] = Array(property.numKeys);
      _.map(keys, (e, i, arr) => {
        const obj = (arr[i] = new KeyframeData(property));
        _.forOwn(obj, (value, key, obj) => {
          obj[key] = property['key' + key](i + 1);
        });
      });
      get('keys', keys);
    } else {
      get('value');
    }
    return data;
  },
  set_property(property: Property, data: PropertyJson) {
    const obj: PropertyJson = {};
    _.forOwn(data, (value, key) => {
      obj[key] = cvt.get_property_data(key, data);
    });
    const { value, expression, expressionEnabled, keys } = obj;
    if (value != null) {
      if (property.name === 'Source Text') {
        const val: Partial<TextDocument> = value;
        property.setValue(new TextDocument(val.text ?? ''));
        _.forOwn(val, (v, k) => {
          property.value[k] = v;
        });
      } else {
        property.setValue(value);
      }
      // if (property.parentProperty.elided) {
      //     $.writeln(['属性父级隐藏', property.name, property.parentProperty.name].join('\t'));
      // } else if (property.elided) {
      //     $.writeln(['属性隐藏', property.name].join('\t'));
      // }
    }
    if (expression) {
      property.expression = expression;
      property.expressionEnabled = !!expressionEnabled;
    }
    if (keys) {
      // 设置关键帧
      if (keys.length === 0) alert('关键帧获取失败', '脚本警告');
      _.map(keys, ({ Time, Value }) => {
        property.setValueAtTime(Time, Value);
      });
      // 设置关键帧属性
      const isSpatial = KeyframeData.isSpatial(property);
      _.map(
        keys,
        (
          {
            InInterpolationType, // 入点插值
            OutInterpolationType,
            InTemporalEase, // 入点缓动
            OutTemporalEase,
            TemporalAutoBezier, // 时间自动贝塞尔
            TemporalContinuous,
            // 以下为空间值特有属性
            SpatialAutoBezier,
            SpatialContinuous, // 空间连续性
            InSpatialTangent, // 入点空间线性
            OutSpatialTangent,
            Roving, // 漂浮关键帧
          },
          i,
        ) => {
          property.setInterpolationTypeAtKey(
            i + 1,
            InInterpolationType,
            OutInterpolationType,
          );
          property.setTemporalEaseAtKey(i + 1, InTemporalEase, OutTemporalEase);
          property.setTemporalAutoBezierAtKey(i + 1, TemporalAutoBezier);
          property.setTemporalContinuousAtKey(i + 1, TemporalContinuous);
          if (isSpatial) {
            property.setSpatialTangentsAtKey(
              i + 1,
              InSpatialTangent,
              OutSpatialTangent,
            );
            property.setSpatialAutoBezierAtKey(i + 1, SpatialAutoBezier);
            property.setSpatialContinuousAtKey(i + 1, SpatialContinuous);
            property.setRovingAtKey(i + 1, Roving);
          }
        },
      );
    }
    return property;
  },
  get_layer(layer: Layer, propertyNames: (keyof Layer)[] = []) {
    const data: PropertyJson = {};
    _.map(
      (
        [
          'name',
          'comment',
          'startTime', //先设置开始时间, 再设置出入点
          'inPoint',
          'outPoint',
          'label',
          'locked',
          'shy',
          'solo',
          'stretch',
          'outPoint',
        ] as (keyof Layer)[]
      ).concat(propertyNames),
      (key) => {
        data[key] = layer[key];
      },
    );
    function defaultFn(p: _PropertyClasses, d: PropertyJson) {
      if (p.isModified) {
        if (p.canSetEnabled && !p.enabled) {
          d['enabled'] = false;
        }
        return true;
      }
    }
    lyr.get_group(
      layer,
      data,
      lyr.recur_factory('get', {
        GroupFn(p, d) {
          switch (p.parentProperty.matchName) {
            case 'ADBE Root Vectors Group':
              return defaultFn(p, d);
            case 'ADBE Mask Parade': {
              _.map(
                [
                  'color',
                  'inverted',
                  'locked',
                  'maskFeatherFalloff',
                  'maskMode',
                  'maskMotionBlur',
                  'rotoBezier',
                ],
                (key) => {
                  d[key] = p[key];
                },
              );
              return true;
            }
            case 'ADBE Effect Parade':
              return true; // 所有效果都要导出
            case 'ADBE Transform Group':
              return defaultFn(p, d);
            default:
              return defaultFn(p, d);
          }
        },
        PropertyFn(p, d) {
          switch (p.parentProperty.matchName) {
            case 'ADBE Text Animator Properties': {
              //文本动画设计器属性
              d['@matchName'] = p.matchName;
              return defaultFn(p, d);
            }
            case 'ADBE Transform Group': {
              return (
                defaultFn(p, d) &&
                _.filter(
                  ['X Position', 'Y Position'],
                  (e): e is string => e === p.name,
                ).length === 0
              );
            }
            default:
              return defaultFn(p, d);
          }
        },
      }),
    );
    return data;
  },
  set_layer(layer: Layer, data: {}) {
    return lyr.set_group(layer, data, lyr.recur_factory('set', {}));
  },
};
const matchTypes = {
  'ADBE Vector Layer': 'Shape',
  'ADBE Text Layer': 'Text',
  'ADBE Camera Layer': 'Camera',
  'ADBE Light Layer': 'Light',
} as const;
const hlp = {
  import_layer(data: PropertyJson) {
    const layer = t.add_layer(matchTypes[data['@matchName']]);
    lyr.set_layer(layer, data);
    return layer;
  },
  export_layer(layer: Layer) {
    if (layer.parent) {
      a.abort('抱歉，暂不支持导出有父级图层的图层');
    }
    const propertyNames: (keyof AVLayer)[] = [
      'adjustmentLayer',
      'autoOrient',
      // 'audioEnabled', // 音视频层
      'blendingMode',
      'effectsActive',
      // 'environmentLayer', // 光线追踪的合成层 音视频层
      'frameBlendingType',
      'guideLayer',
      'motionBlur',
      'preserveTransparency',
      'quality',
      'samplingQuality',
      'threeDLayer',
      // 'threeDPerChar', // TextLayer
      'trackMatteType',
    ];
    // 判断图层类型
    const type = matchTypes[layer.matchName];
    switch (type) {
      case 'Text': {
        propertyNames.push('threeDPerChar');
      }
      case 'Shape': {
        (layer as TextLayer | ShapeLayer).canSetCollapseTransformation &&
          propertyNames.push('collapseTransformation');
        (layer as TextLayer | ShapeLayer).canSetTimeRemapEnabled &&
          propertyNames.push('timeRemapEnabled');
        break;
      }
      case 'Camera':
      case 'Light':
      default:
        a.abort('图层类型错误: ' + layer.matchName);
    }
    return lyr.get_layer(layer, propertyNames);
  },
};
const app = {
  import() {
    const datas = f.open({
      path: config.pth.layers,
      filter: '*.json',
      multi: true,
    });
    if (!datas) return;
    _.forOwn(datas, (value) => {
      hlp.import_layer(JSON.parse(value));
    });
  },
  export() {
    const layers = t.get_selected_layers();
    const datas: Record<string, string> = {};
    _.map(layers, (layer) => {
      const data = hlp.export_layer(layer);
      datas[layer.name + '.json'] = JSON.stringify(data)
        .replace(/\[\s+\]/g, '[]')
        .replace(/\{\s+\}/g, '{}');
    });
    f.save(datas, { path: config.pth.layers });
  },
  UI: () => {
    function setting() {
      const { data, version } = config;
      _.tree.parse({
        style: {
          text: `${$.fileName} ${version}`,
          margins: 10,
        },
        panel: {
          style: { text: 'Update' },
          button: {
            style: {
              text: 'Check Update',
              alignment: 'fill',
              onClick: app.update,
            },
          },
          checkbox: {
            style: {
              text: 'Check Update on Startup',
              value: data.auto_updata,
              onClick(this: Checkbox) {
                data.auto_updata = this.value;
              },
            },
          },
        },
      });
    }
    const ui = _.reduce(
      [
        [config.icons.import, app.import],
        [config.icons.export, app.export],
        [config.icons.setting, setting],
      ] as const,
      (acc, [icon, fn], i) =>
        _.assign(acc, {
          ['iconbutton' + i]: {
            param: [, , icon, { style: 'toolbutton' }],
            style: {
              preferredSize: [30, 30],
              onClick: fn && (() => _.setUndoGroup('', fn)),
            },
          },
        }),
      {
        style: {
          orientation: 'column',
          alignChildren: 'center',
          margins: 0,
          spacing: 0,
        },
      } as LooseObj,
    );
    _.tree.context = this;
    _.tree.parse(ui);
  },
  update() {
    a.update({
      current_version: config.version,
      latest_version: (text) => text.match(/version: \'([\s\S]+?)\'/)?.[1],
      ...config.pth.update,
    });
  },
};
config.syncData();
config.data.auto_updata && app.update();
app.UI();
