
    function generate_vic_graph(element, variable, point, polygon) {
         showLoader1();
         showLoader2();

        var series = [];
        var graph_data, display_name, units;
        var index = find_var_index(variable, variable_data);
        if (index >= 0) {
            display_name = variable_data[index]["display_name"];
            units = variable_data[index]["units"];
        }
        var startdate = '';
        var enddate = '';
        var dst=$("#time_table option:selected").text();
     //   if ($("#myonoffswitch").is(':checked') ) {


            startdate = dst;
            // console.log(startdate);
            // console.log($("#time_table option:selected").val());
            enddate = (parseInt(dst.substr(0, 4))) + "-12-31";
       // }
        //  else {
        //     startdate = dst;
        //     enddate = (parseInt(dst.substr(0,4)) + 1) + "-02-28";
        // }
        var json={
            "db": $("#db_table option:selected").val(),
            "region": $("#schema_table option:selected").val(),
            "variable": variable,
            "point": point,
            "startdate": startdate,
            "enddate": enddate,
            "polygon":  polygon
        };
        console.log(json);
        var xhr = ajax_update_database("get-vic-plot", json);
        xhr.done(function (data) {
            graph_data = data;
            if (data.time_series != undefined && data.time_series.length > 0)
                series = [{
                    data: data.time_series,
                    name: display_name,
                    showInLegend: false
                }];

            populate_vic_graph(element, display_name, units, point, polygon,graph_data, series);
        });
    }


    function populate_vic_graph(element, display_name,units, point,polygon,graph_data,series) {
        var county_name = "Polygon";
        if (gid == undefined || gid == "") gid = 'KE041';

        ajax_update_database("get-county", {
            "db": $("#db_table option:selected").val(),
            "gid": gid,
            "schema": $("#schema_table option:selected").val()
        }).done(function (data) {
            if ("success" in data && selected==true) {
                county_name = data["county"][0][0];
            }

            console.log(selected);
         //   var titletext = point == "" ? ( selected==false?"Polygon":county_name) : "At [" + parseFloat(point.split(',')[0]).toFixed(2) + ", " + parseFloat(point.split(',')[1]).toFixed(2) + "]";
            var titletext =  selected==false?"Polygon":county_name;

            $(element).highcharts({
                    chart: {
                        type: display_name == 'Rainfall' ? 'column' : 'line',
                        zoomType: 'x'
                    },
                    title: {
                        text: titletext,
                        style: {
                            fontSize: '10px',
                            fontWeight: 'bold'
                        }
                    },
                    xAxis: {
                        type: 'datetime',
                        labels: {
                            format: '{value:%d %b %Y}'
                            // rotation: 90,
                            // align: 'left'
                        },
                        title: {
                            text: 'Date'
                        }
                    },
                    yAxis: {
                        title: {
                            text: display_name + ' ' + units
                        }

                    },
                    exporting: {
                        enabled: true
                    },
                    series: series
                },
                function (chart) {
                    if (chart.series.length < 1 || "error" in graph_data) {
                        chart.renderer.text("No data", 140, 120).css({
                            color: "black",
                            fontSize: "16px"
                        }).add();
                    }
                });
        });
        hideLoader1();
        hideLoader2();
    }



    function generate_dssat_graph(element, gid, variable) {
        showLoader3();
        showLoader4();
        var startdate = '';
        var enddate = '';
        if ($("#myonoffswitch").is(':checked')) {
            startdate = $("#seasonyear option:selected").val() + "-03-01";
            enddate = $("#seasonyear option:selected").val() + "-08-31";
        } else {
            startdate = $("#seasonyear option:selected").val() + "-10-01";
            enddate = (parseInt($("#seasonyear option:selected").val()) + 1) + "-02-28";

        }
        var county_name = "";
        var ens = $("#ens_table option:selected").val();

        var jsonObj = {
            "db": $("#db_table option:selected").val(),
            "gid": gid,
            "schema": $("#schema_table option:selected").val(),
            "ensemble": ens,
            "startdate": startdate,
            "enddate": enddate
        };


        var xhr = ajax_update_database("get-ens-values", jsonObj);
        if (gid == undefined || gid == "") gid = 'KE041';
        ajax_update_database("get-county", {
            "db": $("#db_table option:selected").val(),
            "gid": gid,
            "schema": $("#schema_table option:selected").val()
        }).done(function (data) {
            if ("success" in data) {
                county_name = data["county"].length>0?data["county"][0][0]:"Unknown";
            }
        });
        xhr.done(function (data) {
            var input, title, titletext, gwad_low, gwad_high, series, lai_low, lai_high;
            series = [];
            if (variable == "GWAD") {
                input = data.gwad_series;
                gwad_low = data.low_gwad_series;
                gwad_high = data.high_gwad_series;
                title = "Grain Weight " + $("#seasonyear option:selected").val() + " : ";
                titletext = "GWAD (kg/ha)";
                series = [{
                    data: input,
                    name: "Median",
                    type: 'line',
                    showInLegend: false,
                    lineWidth: 5,
                    color: "green",
                },
                    {
                        data: gwad_low,
                        name: "5th percentile",
                        type: 'line',
                        color: "red",
                        showInLegend: false,
                        fillOpacity: 0.1,
                        zIndex: -1,
                        dashStyle: "Dash"

                    }, {
                        data: gwad_high,
                        name: "95th percentile",
                        type: 'line',
                        color: "orange",
                        fillOpacity: 0.1,
                        showInLegend: false,
                        zIndex: -2,
                        dashStyle: "Dash"

                    }
                ]
            } else if (variable == "WSGD") {
                input = $("#typeofchart option:selected").val() == "Daily" ? data.wsgd_series : data.wsgd_cum_series;
                title = "Daily Water Stress " + $("#seasonyear option:selected").val() + " : ";
                titletext = "WSGD (0-1)";
                series = [{
                    data: input,
                    name: titletext,
                    type: 'line',
                    lineWidth: 5,
                    showInLegend: false,
                    color: "green",
                }]
            } else if (variable == "LAI") {
                input = $("#typeofchart option:selected").val() == "Daily" ? data.lai_series : data.lai_cum_series;
                lai_low = data.low_lai_series;
                lai_high = data.high_lai_series;
                title = "LAI " + $("#seasonyear option:selected").val() + " :";
                titletext = "LAI (m2/m2)";
                 series = [
                     {
                    data: input,
                    name: "Median",
                    type: 'line',
                    showInLegend: false,
                    lineWidth: 5,
                    color: "green",
                },
                    {
                        data: lai_low,
                        name: "5th percentile",
                        type: 'line',
                        color: "red",
                        showInLegend: false,
                        fillOpacity: 0.1,
                        zIndex: -1,
                        dashStyle: "Dash"

                    }, {
                        data: lai_high,
                        name: "95th percentile",
                        type: 'line',
                        color: "orange",
                        fillOpacity: 0.1,
                        showInLegend: false,
                        zIndex: -2,
                        dashStyle: "Dash"

                    }
                ]
            }
hideLoader3();
                    hideLoader4();
                  //   hideLoader();

            if ("error" in data) series = [];

            $(element).highcharts({
                    chart: {
                        zoomType: 'x'
                    },
                    title: {
                        text: title + county_name,
                        style: {
                            fontSize: '10px',
                            fontWeight: 'bold'
                        }
                    },
                    plotOptions: {
                        series: {
                            marker: {
                                enabled: false
                            }
                        }
                    },
                    xAxis: {
                        type: 'datetime',
                        labels: {
                            format: '{value:%d %b}'
                        },
                        title: {
                            text: 'Date'
                        }
                    },
                    yAxis: {
                        title: {
                            text: titletext
                        }

                    },
                    exporting: {
                        enabled: true
                    },
                    series: series,

                },
                function (chart) {
                    if (chart.series.length < 1 || "error" in data) {
                        chart.renderer.text("No data", 140, 120).css({
                            color: "black",
                            fontSize: "16px"
                        }).add();
                    }
                });

        });

    }
