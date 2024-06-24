"use strict";
cubx.b.set_undo_group(function () {
    var get_layers = function () {
        var temp = comp.layers;
        return function () {
            return isValid(temp) ? temp : (temp = comp.layers);
        };
    }();
    var get_last_layer = function () {
        var temp = get_layers()[get_layers().length];
        return function () {
            return isValid(temp) ? temp : (temp = get_layers()[get_layers().length]);
        };
    }();
    function get_last_layer_marker(ni) {
        var marker = get_last_layer().property('Marker').is(Property);
        var beg = marker.keyTime(ni) + delay, dur = marker.keyValue(ni).duration;
        return [beg, beg + dur];
    }
    var comp = cubx.b.get_active_comp();
    var marker_num = get_last_layer().property('ADBE Marker').is(Property).numKeys;
    var delay = 0 / 30;
    for (var n = 1; n < marker_num; n++) {
        get_layers()[1].startTime = 0;
        get_layers()[1].assign({
            inPoint: get_last_layer_marker(n)[1],
            outPoint: get_last_layer_marker(n + 1)[0]
        });
        get_layers()[1].startTime = n === 1
            ? 0 - get_layers()[1].inPoint
            : get_layers()[2].outPoint - get_layers()[1].inPoint;
        if (n != marker_num - 1) {
            get_layers()[1].duplicate();
        }
    }
    get_last_layer().remove();
})();
//# sourceMappingURL=cut%20AVLayer%20by%20Markers.jsx.map