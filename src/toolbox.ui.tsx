// 自制工具面板
import * as _ from 'soil-ts';
import { t } from './util';

const ui = _.reduce(
  [
    ['UC', 'unpack_selected_comps'],
    ['UL', 'unpack_selected_layers'],
    ['AS', 'add_solid_layer'],
    ['AA', 'add_adjustment_layer'],
    ['AN', 'add_null_layer'],
    ['AG', 'add_layers_from_selected_groups'],
    ['R', 'render_selected_comps'],
    ['F', 'simple_fix_expression'],
    ['SM', 'show_matchname'],
  ] satisfies [string, keyof typeof t][],
  (acc, [text, helpTip], i) => {
    acc['button' + i] = {
      style: {
        text,
        helpTip,
        preferredSize: [30, 30],
        onClick: () => _.setUndoGroup(text, t[helpTip]),
      },
    };
    return acc;
  },
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
