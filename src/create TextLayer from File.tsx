cubx.b.set_undo_group(function () {
    const data = cubx.f.open({ filter: '*.txt' });
    if (!data) return;
    data.each((text) => {
        const { layers } = cubx.b.get_active_comp();
        _.map(text.split('\n'), (e) => {
            layers.addText(e);
        });
    });
})();
