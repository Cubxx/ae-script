cubx.b.set_undo_group(function () {
    const data = cubx.f.open({ filter: '*.txt' });
    if (!data) return;
    data.each(text => {
        const { layers } = cubx.b.get_active_comp();
        text.split('\n').map(e => {
            layers.addText(e);
        });
    });
})();