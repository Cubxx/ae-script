(function (that) {
    const { b, u } = cubx;
    const f = {
        fix_expression() {
            const maps = [
                ['点', 'Point'],
                ['3D点', '3D Point'],
                ['角度', 'Angle'],
                ['滑块', 'Slider'],
                ['颜色', 'Color'],
                ['复选框', 'Checkbox'],
                ['菜单', 'Menu'],
                ['图层', 'Layer'],
            ];
            switch (app.isoLanguage) {
                case 'zh_CN': maps.map(([zh, en]) => app.project.autoFixExpressions(en, zh)); break;
                case 'en_US': maps.map(([zh, en]) => app.project.autoFixExpressions(zh, en)); break;
                default: break;
            }
        },
    };
    const a = {
        UI() {
            function btn(node: Window | Panel | Group, text: string, fn: () => void) {
                u.button(node, text).assign({
                    preferredSize: [30, 30],
                    onClick: b.set_undo_group(fn),
                });
            }
            const win = u.palette(that).assign({ spacing: -10 });
            btn(win, "UC", b.unpack_selected_comps);
            btn(win, "UL", b.unpack_selected_layers);
            btn(win, "AS", b.add_solid_layer);
            btn(win, "AA", b.add_adjustment_layer);
            btn(win, "AN", b.add_null_layer);
            btn(win, "AG", b.add_layers_from_selected_groups);
            btn(win, "R", b.render_selected_comps);
            btn(win, "F", f.fix_expression);
            u.show(win);
        }
    };
    a.UI();
})(this); 