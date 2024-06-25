// 自制工具面板
import * as _ from 'soil-ts';
import { b } from './cubx.lib';

function fix_expression() {
    const map = [
        ['点', 'Point'],
        ['3D点', '3D Point'],
        ['角度', 'Angle'],
        ['滑块', 'Slider'],
        ['颜色', 'Color'],
        ['复选框', 'Checkbox'],
        ['菜单', 'Menu'],
        ['图层', 'Layer'],
    ];
    const fix = {
        zh_CN() {
            _.map(map, ([zh, en]) => app.project.autoFixExpressions(en, zh));
        },
        en_US() {
            _.map(map, ([zh, en]) => app.project.autoFixExpressions(zh, en));
        },
    };
    if (_.has(fix, app.isoLanguage)) {
        //@ts-ignore
        fix[app.isoLanguage]();
    }
}
const ui = _.reduce(
    [
        ['UC', b.unpack_selected_comps],
        ['UL', b.unpack_selected_layers],
        ['AS', b.add_solid_layer],
        ['AA', b.add_adjustment_layer],
        ['AN', b.add_null_layer],
        ['AG', b.add_layers_from_selected_groups],
        ['R', b.render_selected_comps],
        ['F', fix_expression],
    ] as const,
    (acc, [text, fn], i) => {
        acc['button' + i] = {
            style: {
                text,
                preferredSize: [30, 30],
                onClick: () => _.setUndoGroup(text, fn),
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
    } as Data,
);
_.tree.context = this;
_.tree.parse(ui);
