"use strict";
cubx.b.set_undo_group(function () {
    var data = cubx.f.open({ filter: '*.txt' });
    if (!data)
        return;
    data.each(function (text) {
        var layers = cubx.b.get_active_comp().layers;
        text.split('\n').map(function (e) {
            layers.addText(e);
        });
    });
})();
//# sourceMappingURL=create%20TextLayer%20from%20File.jsx.map