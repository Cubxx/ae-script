cubx.b.set_undo_group(function () {
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
        const marker = get_last_layer().property('Marker').is(Property);
        const beg = marker.keyTime(ni) + delay,
            dur = (marker.keyValue(ni) as MarkerValue).duration;
        return [beg, beg + dur]; //标记开始 结束
    }
    const comp = cubx.b.get_active_comp();
    const marker_num = get_last_layer()
        .property('ADBE Marker')
        .is(Property).numKeys;
    const delay = 0 / 30; //入点向后延迟时间
    for (let n = 1; n < marker_num; n++) {
        //调整出入点 复制
        get_layers()[1].startTime = 0; //图层对齐合成开头
        get_layers()[1].assign({
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
})();
