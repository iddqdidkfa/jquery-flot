(function ($) {
    var options = {
        liveLegend: {
            enabled: false,
            content: null,
            legendsSelector: '.legendLabel'
        }
    };

    function init(plot) {

        var jqPlotUpdateLegendTimeout = null;
        var jqPlotLatestPosition = null;

        var placeHolder = plot.getPlaceholder();
        var legends;
        var llOptions;
        var enabled = false;

        var legendUpdater = function(event, pos, item) {
            if (enabled) {
                jqPlotLatestPosition = pos;
                if (!jqPlotUpdateLegendTimeout) {
                    jqPlotUpdateLegendTimeout = setTimeout(updateLegend, 50);
                }
            }
        };



        plot.hooks.bindEvents.push(function (plot, eventHolder) {
            placeHolder.bind("plothover", legendUpdater);
            llOptions = plot.getOptions().liveLegend;
            enabled = llOptions.enabled;
            legends = placeHolder.find(llOptions.legendsSelector);
        });

        plot.hooks.shutdown.push(function (plot, eventHolder){
            placeHolder.getPlaceholder().unbind("plothover", legendUpdater);
        });

        function updateLegend() {
            jqPlotUpdateLegendTimeout = null;

            var pos = jqPlotLatestPosition;

            var axes = plot.getAxes();
            if (pos.x < axes.xaxis.min || pos.x > axes.xaxis.max ||
                pos.y < axes.yaxis.min || pos.y > axes.yaxis.max)
                return;

            var i, j, dataSet = plot.getData();
            var label;
            for (i = 0; i < dataSet.length; ++i) {
                var series = dataSet[i];

                var nearestPoint;
                for (j = 0; j < series.data.length; ++j)
                    if (series.data[j][0] > pos.x) {
                        nearestPoint = (((series.data[j][0] - pos.x) < (pos.x - series.data[j - 1][0]))) ? j : (j - 1);
                        break;
                    }
                if (series.data[nearestPoint] == undefined) {
                    return;
                }
                if (llOptions.content == null) {
                    label = series.label + ': ' + series.data[nearestPoint][1];
                } else {
                    label = llOptions.content(series.label, series.data[nearestPoint][0], series.data[nearestPoint][1], i);
                }
                legends.eq(i).html(label);
            }
        }
    }

    $.plot.plugins.push({
        init: init,
        options: options,
        name: 'livelegend',
        version: '0.1'
    });
})(jQuery);
