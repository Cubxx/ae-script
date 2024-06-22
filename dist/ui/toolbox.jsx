"use strict";
(function (that) {
    var b = cubx.b, u = cubx.u;
    var f = {
        fix_expression: function () {
            var maps = [
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
                case 'zh_CN':
                    maps.map(function (_a) {
                        var zh = _a[0], en = _a[1];
                        return app.project.autoFixExpressions(en, zh);
                    });
                    break;
                case 'en_US':
                    maps.map(function (_a) {
                        var zh = _a[0], en = _a[1];
                        return app.project.autoFixExpressions(zh, en);
                    });
                    break;
                default: break;
            }
        }
    };
    var a = {
        UI: function () {
            function btn(node, text, fn) {
                u.button(node, text).assign({
                    preferredSize: [30, 30],
                    onClick: b.set_undo_group(fn)
                });
            }
            var win = u.palette(that).assign({ spacing: -10 });
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
