
/*****************************************************************************
 * FILE:    VIC MAIN JS
 * DATE:    6 JULY 2017
 * AUTHOR: Sarva Pulla
 * COPYRIGHT: (c) NASA SERVIR 2017
 * LICENSE: BSD 2-Clause
 *****************************************************************************/

/*****************************************************************************
 *                      LIBRARY WRAPPER
 *****************************************************************************/
var gwms, gmap, feat,testvar,testevt,boundaryLayer;
var eventt = [];
var selected=true;
var temp='KE041';
var flagg=true;
var gpolygon,sdate,edate;

var LIBRARY_OBJECT = (function () {
    // Wrap the library in a package function
    "use strict"; // And enable strict mode for this library

    /************************************************************************
     *                      MODULE LEVEL / GLOBAL VARIABLES
     *************************************************************************/
    var current_layer,
        element,
        shapeFile,
        $interactionModal,
        layers,
        map,
        map1,
        popup,
        $plotModal,
        public_interface, // Object returned by the module
        rest_url,
        db,
        region,
        db_enabled,
        selectedFeatures,
        variable_data,
        $dssatplotModal1,
        $dssatplotModal2,
        wms_workspace,
        wms_url,
        wms_layer,
        wms_source, gid, variable1, variable2, centeravg;


    /************************************************************************
     *                    PRIVATE FUNCTION DECLARATIONS
     *************************************************************************/
    var clear_coords,
        get_styling,
        gen_color_bar,
        init_events,
        init_jquery_vars,
        init_dropdown,
        init_all,
        init_map;
    var styleCache = {};

    var poor = [153, 0, 0, 1];
    var low = [255, 128, 0, 1];
    var mid = [255, 255, 0, 1];
    var much = [128, 192, 0, 1];
    var high = [0, 128, 0, 1];
    var default_style = new ol.style.Style({
        fill: new ol.style.Fill({
            color: [250, 250, 250, 0.5]
        }),
        stroke: new ol.style.Stroke({
            color: [220, 220, 220, 1],
            width: 1
        })
    });
    var default_sty = new ol.style.Style({

        stroke: new ol.style.Stroke({
            color: [97, 97, 97, 1],
            width: 1
        })
    });

    /************************************************************************
     *                    PRIVATE FUNCTION IMPLEMENTATIONS
     *************************************************************************/
    clear_coords = function () {
        $("#poly-lat-lon").val('');
        $("#point-lat-lon").val('');
    };


    init_jquery_vars = function () {
        $interactionModal = $("#interaction-modal");
        $plotModal = $("#plot-modal");
        $dssatplotModal1 = $("#outlook-dssat-plot-modal1");
        $dssatplotModal2 = $("#outlook-dssat-plot-modal2");
        var $var_element = $("#outlook_variable");
        variable_data = $var_element.attr('data-variable-info');
        variable_data = JSON.parse(variable_data);

    };


    init_dropdown = function () {
        $("#outlook").css("background-color", "#ddd");
        $("#outlook").css("color", "black");
         $("#outlook_db_table").select2();
        $("#outlook_ens_table").select2();
        $("#outlook_typeofchart").select2();
        $("#outlook_var_table3").select2();
        $("#outlook_var_table4").select2();
        $("#outlook_ens_table").append(new Option("Median", "avg")).trigger('change');
    };

        init_map = function () {
            var projection = ol.proj.get('EPSG:3857');
            var baseLayer = new ol.layer.Tile({
                source: new ol.source.XYZ({
                    url: 'https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Light_Gray_Base/MapServer/tile/{z}/{y}/{x}'
                })

            });

            var view = new ol.View({
                center: ol.proj.transform([39.669571, -1.036878], 'EPSG:4326', 'EPSG:3857'),
                projection: projection,
                zoom: 6
            });
            wms_source = new ol.source.ImageWMS();

            wms_layer = new ol.layer.Image({
                source: wms_source
            });
            var vector_source = new ol.source.Vector({
                wrapX: false
            });
            var vector_layer = new ol.layer.Vector({
                name: 'my_vectorlayer',
                source: vector_source,
                style: new ol.style.Style({
                    fill: new ol.style.Fill({
                        color: 'rgba(255, 255, 255, 0.5)'
                    }),
                    stroke: new ol.style.Stroke({
                        color: '#ffcc33',
                        width: 2
                    }),
                    image: new ol.style.Circle({
                        radius: 7,
                        fill: new ol.style.Fill({
                            color: '#ffcc33'
                        })
                    })
                })
            });
            gwms = wms_layer;
            vector_layer.setZIndex(9);
            layers = [baseLayer];
            // layers = [baseLayer,wms_layer,vector_layer,vectorLayer1];
            var vs = new ol.source.Vector({
                features: (new ol.format.GeoJSON()).readFeatures(boundaries, {
                    featureProjection: 'EPSG:3857'
                })
            });
            var style = new ol.style.Style({

                stroke: new ol.style.Stroke({
                    color: '#606060',
                    width: 1
                }),
                text: new ol.style.Text({
                    font: '12px Calibri,sans-serif',
                    fill: new ol.style.Fill({
                        color: '#000'
                    }),
                    stroke: new ol.style.Stroke({
                        color: '#fff',
                        width: 3
                    })
                })
            });


            var vectorLayerDistrict = new ol.layer.Vector({
                source: vs,
                style: function (feature) {
                    style.getText().setText(feature.get('name'));
                    return style;
                }
            });


            // $('#mapfull').data('map', map);
            map1 = new ol.Map({
                target: document.getElementById("outlook_map1"),
                layers: [baseLayer],
                view: view
            });
            gmap = map1;


            vectorLayerDistrict.setZIndex(77777);
            // map.addLayer(vectorLayerDistrict);
            boundaryLayer = vectorLayerDistrict;


            addControls();

            function addControls() {
                var element1 = document.createElement('div');
                element1.className = 'ol-control-panel ol-unselectable ol-control';
                element1.appendChild(createControl("FullScreen1", "fas fa-expand"));
                var controlPanel1 = new ol.control.Control({
                    element: element1
                });
                map1.addControl(controlPanel1);
            }

            function createControl(which, icon) {
                var drawElement = document.createElement('button');
                drawElement.id = "draw" + which;
                drawElement.innerHTML = "<span class='" + icon + "' aria-hidden='true'></span>";
                drawElement.title = which;
                drawElement.onclick = function () {
                    try {
                        var selectedFeature = select_interaction.getFeatures().item(0);
                        //Remove it from your feature source
                        vector_source.removeFeature(selectedFeature);
                    } catch (e) {

                    }
                    enableDrawInteraction(which);
                }
                return drawElement;
            }

            function enableDrawInteraction(which) {

                if (which == "FullScreen1") {
                    //                   if (document.getElementById("mapcontainer1").classList.contains("mapcontainerfull")) {
                    //                    document.getElementById("mapcontainer1").classList.remove("mapcontainerfull");
                    //                     document.getElementById("mapcontainer1").style.height="63vh";
                    //                    document.getElementById("crow").style.display='block';
                    //                 // //  map1.getView().setZoom(map1.getView().getZoom() - 1);
                    //                 //    map1.getView().setZoom(map1.getView().getZoom() + 1);
                    //                       setTimeout( function() { map1.updateSize();}, 200);
                    //                    document.getElementById("draw" + which).innerHTML = "<span class='" + "fas fa-expand" + "' aria-hidden='true'></span>";
                    //
                    //                } else {
                    //
                    //                   document.getElementById("mapcontainer1").classList.add("mapcontainerfull");
                    //                   document.getElementById("mapcontainer1").style.height="90%";
                    //                   document.getElementById("crow").style.display='none';
                    // //
                    // // //map1.getView().setZoom(map1.getView().getZoom() + 1);
                    // //  map1.getView().setZoom(map1.getView().getZoom() -1);
                    //                       setTimeout( function() { map1.updateSize();}, 200);
                    //                    document.getElementById("draw" + which).innerHTML = "<span class='" + "fa fa-window-minimize" + "' aria-hidden='true'></span>";
                    //                }
                    var elem = document.getElementById("outlook_mappanelbody1");
                    elem.requestFullscreen();
                    // window.open($('#etr').attr('href'));
                }


            };

        };
        init_events = function () {
            map1.on("singleclick", function (evt) {
                selected = false;
            });

        };

        init_all = function () {
            init_jquery_vars();
            init_dropdown();
            init_map();
            init_events();
        };

        gen_color_bar = function (colors, scale, cv, variable) {
            var cv = document.getElementById(cv),
                ctx = cv.getContext('2d');
            ctx.clearRect(0, 0, cv.width, cv.height);
            var k = 0;
            var j = 1;
            colors.forEach(function (color, i) {
                if (variable == "dssat") {
                    ctx.beginPath();
                    ctx.fillStyle = color;
                    if (variable == "dssat") {
                        ctx.fillRect(0, i * 45, 25, 50);
                        ctx.fillStyle = "white";

                        ctx.fillText("high", 35, 10);
                        ctx.fillText("mid", 35, 110);
                        ctx.fillText("poor", 35, 230);
                    }
                }
            });

        };


        function styleFunction11(feature, resolution) {
            // get the incomeLevel from the feature properties
            var level = feature.getProperties().countyid;

            if (yield_data != null) {
                // var index = yield_data.findIndex(function(x) { return x[0]==level });
                var index = -1;
                for (var i = 0; i < yield_data.length; ++i) {

                    if (yield_data[i][0] == level) {
                        index = i;
                        break;
                    }

                }

                if (level == temp & index != -1) {
                    var t = feature.getGeometry().getCoordinates()[0];
                    var result = t[0].map(coord => {
                        return ol.proj.transform(coord, 'EPSG:3857', 'EPSG:4326');
                    });
                    var js = JSON.stringify('{"type":"Polygon","coordinates":[' + JSON.stringify(result) + ']}');
                    $("#poly-lat-lon").val(JSON.stringify(result));
                    styleCache[index] = new ol.style.Style({
                        stroke: new ol.style.Stroke({
                            color: 'rgba(0, 0, 255, 1)',
                            width: 3
                        }),
                        fill: new ol.style.Fill({
                            color: 'rgba(0,0,255,0.2)'
                        })
                    });
                } else {

                    styleCache[index] = new ol.style.Style({
                        stroke: new ol.style.Stroke({
                            color: [97, 97, 97, 1],
                            width: 1
                        })
                    });

                }
                return [styleCache[index]];

            }
            return [default_sty];

        };


        function styleFunction1(feature, resolution) {
            // get the incomeLevel from the feature properties
            var level = feature.getProperties().countyid;

            if (yield_data != null) {
                // var index = yield_data.findIndex(function(x) { return x[0]==level });
                var index = -1;
                for (var i = 0; i < yield_data.length; ++i) {

                    if (yield_data[i][0] == level) {
                        index = i;
                        break;
                    }
                }

                if (index == "-1") {
                    return [default_style];
                }
                // check the cache and create a new style for the income
                // level if its not been created before.
                if (index != "-1") {
                    var avg_val = yield_data[index][1];


                    if (avg_val > 1182) {
                        styleCache[index] = new ol.style.Style({
                            fill: new ol.style.Fill({
                                color: high
                            }),
                            stroke: new ol.style.Stroke({
                                color: '#030303',
                                width: 1
                            })
                        });
                    } else if (avg_val > 905 && avg_val < 1182) {
                        styleCache[index] = new ol.style.Style({
                            fill: new ol.style.Fill({
                                color: much
                            }),
                            stroke: new ol.style.Stroke({
                                color: '#030303',
                                width: 1
                            })
                        });
                    } else if (avg_val > 628 && avg_val < 905) {
                        styleCache[index] = new ol.style.Style({
                            fill: new ol.style.Fill({
                                color: mid
                            }),
                            stroke: new ol.style.Stroke({
                                color: '#030303',
                                width: 1
                            })
                        });
                    } else if (avg_val > 350 && avg_val < 628) {
                        styleCache[index] = new ol.style.Style({
                            fill: new ol.style.Fill({
                                color: low
                            }),
                            stroke: new ol.style.Stroke({
                                color: '#030303',
                                width: 1
                            })
                        });
                    } else if (avg_val < 73) {
                        styleCache[index] = new ol.style.Style({
                            fill: new ol.style.Fill({
                                color: poor
                            }),
                            stroke: new ol.style.Stroke({
                                color: '#030303',
                                width: 1
                            })
                        });
                    }
                    if (level == temp && selected == false) {
                        // temp=3;

                        styleCache[index] = new ol.style.Style({
                            stroke: new ol.style.Stroke({
                                color: 'rgba(0, 0, 255, 0.7)',
                                width: 1
                            }),
                            fill: new ol.style.Fill({
                                color: 'rgba(0,0,255,0.5)'
                            })
                        });

                    }


                }
                return [styleCache[index]];
            } else {
                return [default_style];
            }


        };


        function styleFunction(feature, resolution) {
            // get the incomeLevel from the feature properties
            // var level = feature.getId().split(".")[1];
            var level = feature.getProperties().countyid;

            if (yield_data != null) {
                // var index = yield_data.findIndex(function(x) { return x[0]==level });
                var index = -1;
                for (var i = 0; i < yield_data.length; ++i) {
                    if (yield_data[i][0] == level) {
                        index = i;
                        break;
                    }
                }

                if (index == "-1") {
                    return [default_style];
                }
                // check the cache and create a new style for the income
                // level if its not been created before.
                if (index != "-1") {
                    var avg_val = yield_data[index][1];


                    if (avg_val > 1182) {
                        styleCache[index] = new ol.style.Style({
                            fill: new ol.style.Fill({
                                color: high
                            }),
                            stroke: new ol.style.Stroke({
                                color: '#030303',
                                width: 1
                            })
                        });
                    } else if (avg_val > 905 && avg_val < 1182) {
                        styleCache[index] = new ol.style.Style({
                            fill: new ol.style.Fill({
                                color: much
                            }),
                            stroke: new ol.style.Stroke({
                                color: '#030303',
                                width: 1
                            })
                        });
                    } else if (avg_val > 628 && avg_val < 905) {
                        styleCache[index] = new ol.style.Style({
                            fill: new ol.style.Fill({
                                color: mid
                            }),
                            stroke: new ol.style.Stroke({
                                color: '#030303',
                                width: 1
                            })
                        });
                    } else if (avg_val > 350 && avg_val < 628) {
                        styleCache[index] = new ol.style.Style({
                            fill: new ol.style.Fill({
                                color: low
                            }),
                            stroke: new ol.style.Stroke({
                                color: '#030303',
                                width: 1
                            })
                        });
                    } else if (avg_val < 73) {
                        styleCache[index] = new ol.style.Style({
                            fill: new ol.style.Fill({
                                color: poor
                            }),
                            stroke: new ol.style.Stroke({
                                color: '#030303',
                                width: 1
                            })
                        });
                    } else {

                        styleCache[index] = new ol.style.Style({
                            fill: new ol.style.Fill({
                                color: poor
                            }),
                            stroke: new ol.style.Stroke({
                                color: '#030303',
                                width: 1
                            })
                        });
                    }
                    if (level == temp & index != -1) {
                        styleCache[index] = new ol.style.Style({
                            stroke: new ol.style.Stroke({
                                color: 'rgba(0, 0, 255, 1)',
                                width: 3
                            }),
                            fill: new ol.style.Fill({
                                color: 'rgba(0,0,255,0.5)'
                            })
                        });
                        //document.getElementById("tooltip11").innerHTML = "County: Siaya<br>Yield: " + avg_val + " kg/ha";


                        ajax_update_database("get-county", {
                            "db": $("#outlook_db_table option:selected").val(),
                            "gid": level,
                            "schema": $("#outlook_db_table option:selected").val(),
                        }).done(function (data1) {
                            if ("success" in data1) {

                                var county_name = data1["county"].length > 0 ? data1["county"][0][0] : "Unknown";
                                if (avg_val) {
                                    var yield_val = Math.round(avg_val).toFixed(2);


                                    document.getElementById("tooltip11").innerHTML = "County: " + county_name + "<br>" + "Yield: " + yield_val + " kg/ha";
                                }
                                //  overlayt.setPosition(ol.proj.transform(event.mapBrowserEvent.coordinate, 'EPSG:3857', 'EPSG:4326'));

                                map1.addOverlay(overlayt);


                            }
                        });
                    }
                }
                return [styleCache[index]];
            } else {
                return [default_style];
            }


        };

        get_styling = function (variable, scale, cv) {

            var index = find_var_index(variable, variable_data);

            var color1 = variable_data[index]["color1"];
            var color2 = variable_data[index]["color2"];
            var color3 = variable_data[index]["color3"];
            var sld_color_string = '';
            if (scale[scale.length - 1] == 0) {
                var colors = chroma.scale([color1, color1, color1]).mode('lch').correctLightness().colors(20);
                //var colors1 = chroma.scale([color1,color1,color1]).mode('lch').correctLightness().colors(15);
                //var colors=[color1,color1,color1];
                gen_color_bar(colors, scale, cv, variable);
                var color_map_entry = '<ColorMapEntry color="' + colors[0] + '" quantity="' + scale[0] + '" label="label1" opacity="1"/>';
                sld_color_string += color_map_entry;
            } else {
                //   var colors=[color1,color2,color3];
                //	var colors = chroma.scale([color1,color3,color3]).mode('lch').correctLightness().colors(5);
                //	var colors = chroma.scale([color1, color2, color3]).mode('lch').correctLightness().colors(20);
                var colors = chroma.scale([color1, color2, color3]).mode('rgb').colors(20);
                if (variable == "dssat")
                    colors = (chroma.scale([color3, color2, color1])).colors(5);
                //colors = chroma.scale('Spectral').colors(5);
                gen_color_bar(colors, scale, cv, variable);
                colors.forEach(function (color, i) {
                    var color_map_entry = '<ColorMapEntry color="' + color + '" quantity="' + scale[i] + '" label="label' + i + '" opacity="1"/>';
                    sld_color_string += color_map_entry;
                });
            }

            return sld_color_string
        };
        var yield_data;
        var store;
        var lonlat;


        var vectorLayer1 = new ol.layer.Vector({
            source: new ol.source.Vector(),
            style: styleFunction
        });
        var vectorLayer11 = new ol.layer.Vector({
            source: new ol.source.Vector(),
            style: styleFunction11
        });
        var vectorLayer2 = new ol.layer.Vector({
            source: new ol.source.Vector(),
            style: styleFunction1
        });

        var select_interaction;
        var tooltip = document.getElementById('tooltip11');

        var overlayt = new ol.Overlay({
            element: tooltip,
            offset: [0, 0],
            positioning: 'bottom-left'

        });

        function add_dssat(data, scale) {
            yield_data = data.yield;
            store = data.storename;
            var styling = get_styling("dssat", scale, 'outlook_cv_dssat');
            vectorLayer1.setSource(new ol.source.Vector({
                features: (new ol.format.GeoJSON()).readFeatures(boundaries, {
                    featureProjection: 'EPSG:3857'
                })

            }));
            vectorLayer1.setZIndex(3);
            map1.addLayer(vectorLayer1);
            map1.crossOrigin = 'anonymous';
            select_interaction = new ol.interaction.Select({
                layers: [vectorLayer1],//selected==false && vectorLayer2.getSource()!=null?[vectorLayer2]:[vectorLayer1],
                style: new ol.style.Style({
                    fill: new ol.style.Fill({
                        color: 'rgba(0,0,255,0.5)'
                    }),
                    stroke: new ol.style.Stroke({
                        color: 'blue',
                        width: 3,
                    }),
                }),
                // wrapX: false
            });
            map1.addInteraction(select_interaction);

            select_interaction.on('select', function (e) {
                // map1.getView().setZoom(map.getView().getZoom()+1);
                selected = true;
                map1.getView().fit(e.selected[0].getGeometry(), {padding: [170, 50, 30, 150]});
                gid = e.selected[0].getProperties().countyid;// e.selected[0].getId().split(".")[1];
                console.log(gid);
                temp = gid;
                generate_dssat_graph("#outlook_dssat_plotter_1", gid, $("#outlook_var_table3 option:selected").val());
                generate_dssat_graph("#outlook_dssat_plotter_2", gid, $("#outlook_var_table4 option:selected").val());

                vectorLayer1.setZIndex(4);
            });
            selectedFeatures = select_interaction.getFeatures();
            selectedFeatures.on('add', function (event) {
                showLoader();

                var feature = event.target.item(0);
                try {

                    $(".error").html('');

                    var res = feature.getGeometry().getCoordinates()[0];
                    var result = res[0].map(coord => {
                        return ol.proj.transform(coord, 'EPSG:3857', 'EPSG:4326');
                    });
                    var json_object = '{"type":"Polygon","coordinates":[' + JSON.stringify(result) + ']}';
                    // $("#poly-lat-lon").val(json_object);
                    $("#poly-lat-lon").val(JSON.stringify(result));
                    var gid = feature.getProperties().countyid;//feature.getId().split(".")[1];
                    $("#gid").val(gid);
                    var schema = $("#outlook_db_table option:selected").val();

                    if (gid == undefined) gid = "KE041";
                    $("#schema").val(schema);

                    if (feature != undefined) {
                        document.getElementById("tooltip11").style.display = 'block';
                        document.getElementById("tooltip11").innerHTML = "County: " + "Loading..." + "<br>" + "Yield: " + "Loading...";
                        var gid = feature.getProperties().countyid;//evt.selected[0].getId().split(".")[1];
                        var county_name = "Unknown";
                        var yield_val = "unavailable";

                        if (gid == undefined) gid = 'KE041';
                        document.getElementById("tooltip11").innerHTML = "County: " + "Loading..." + "<br>" + "Yield: " + "Loading...";

                        ajax_update_database("get-schema-yield-gid", {
                            "db": $("#outlook_db_table option:selected").val(),
                            "schema": $("#outlook_db_table option:selected").val(),
                            "gid": gid,
                            "startdate": sdate,
                            "enddate": edate
                        }).done(function (data) {
                            if ("success" in data) {
                                county_name = data["county"].length > 0 ? data["county"][0][0] : "Unknown";
                                if (data.yield[0]) {
                                    yield_val = Math.round(data.yield[0][2]).toFixed(2);
                                }
                                document.getElementById("tooltip11").innerHTML = "County: " + county_name + "<br>" + "Yield: " + yield_val + " kg/ha";
                                map1.addOverlay(overlayt);
                            } else {
                                console.log("error");
                            }
                        });

                    } else {
                        document.getElementById("tooltip11").style.display = 'none';
                    }
                    var json_obj = {
                        "db": $("#outlook_db_table option:selected").val(),
                        "gid": gid,
                        "schema": $("#outlook_db_table option:selected").val()
                    };
                    var xhr = ajax_update_database("get-ensemble", json_obj);
                    xhr.done(function (data) {
                        if ("success" in data) {
                            $(".ensemble").removeClass('hidden');
                            $("#outlook_ens_table").html('');
                            var ensembles = data.ensembles;
                            $("#outlook_ens_table").append(new Option("Median", "avg"));
                            ensembles.forEach(function (ensemble, i) {
                                var new_option = new Option(ensemble, ensemble);
                                $("#outlook_ens_table").append(new_option);
                            });
                        } else {
                            // $(".error").append('<h3>Error Retrieving the ensemble data. Please select another feature.</h3>');

                        }
                    });
                } catch (e) {
                }
                hideLoader();
            });



        }

        Highcharts.SVGRenderer.prototype.symbols.download = function (x, y, w, h) {
            var path = [
                // Arrow stem
                'M', x + w * 0.5, y,
                'L', x + w * 0.5, y + h * 0.7,
                // Arrow head
                'M', x + w * 0.3, y + h * 0.5,
                'L', x + w * 0.5, y + h * 0.7,
                'L', x + w * 0.7, y + h * 0.5,
                // Box
                'M', x, y + h * 0.9,
                'L', x, y + h,
                'L', x + w, y + h,
                'L', x + w, y + h * 0.9
            ];
            return path;
        };

        function generate_dssat_graph(element, gid, variable) {
            showLoader1();
            showLoader2();

            var county_name = "";
            var ens = $("#outlook_ens_table option:selected").val();
            ajax_update_database("get-start-end-dates", {
                "db": $("#outlook_db_table option:selected").val(),
            }).done(function (data) {
                if ("success" in data) {
                    console.log(data);
                    sdate = data.startdate;
                    edate = data.enddate;


                    var jsonObj = {
                        "db": $("#outlook_db_table option:selected").val(),
                        "gid": gid,
                        "schema": $("#outlook_db_table option:selected").val(),
                        "ensemble": ens,
                        "startdate": sdate,
                        "enddate": edate
                    };
                    console.log(jsonObj);

                    var xhr = ajax_update_database("get-ens-values", jsonObj);
                    if (gid == undefined || gid == "") gid = 'KE041';

                    ajax_update_database("get-county", {
                        "db": $("#outlook_db_table option:selected").val(),
                        "gid": gid,
                        "schema": $("#outlook_db_table option:selected").val()
                    }).done(function (data) {
                        if ("success" in data) {
                            county_name = data["county"].length > 0 ? data["county"][0][0] : "Unknown";
                        }
                    });

                    xhr.done(function (data) {
                        hideLoader1();
                        hideLoader2();
                        var input, title, titletext, gwad_low, gwad_high, series, lai_low, lai_high;
                        series = [];
                        if (variable == "GWAD") {
                            input = data.gwad_series;
                            gwad_low = data.low_gwad_series;
                            gwad_high = data.high_gwad_series;

                            title = "Grain Weight : ";
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
                        }
                        else if (variable == "WSGD") {
                            input = $("#outlook_typeofchart option:selected").val() == "Daily" ? data.wsgd_series : data.wsgd_cum_series;
                            title = "Daily Water Stress : ";
                            titletext = "WSGD (0-1)";
                            series = [{
                                data: input,
                                name: titletext,
                                type: 'line',
                                lineWidth: 5,
                                showInLegend: false,
                                color: "green",
                            }]
                        }
                        else if (variable == "LAI") {
                            input = $("#outlook_typeofchart option:selected").val() == "Daily" ? data.lai_series : data.lai_cum_series;
                            lai_low = data.low_lai_series;
                            lai_high = data.high_lai_series;
                            title = "LAI :";
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
                                // exporting: {
                                //     enabled: true
                                // },
                                exporting: {
                                    filename: 'event-id-metadata-graph',
                                    buttons: {
                                        contextButton: {
                                            menuItems: ["viewFullscreen", "printChart", "viewData"]
                                        },
                                        'downloadButton': {
                                            symbol: 'download',
                                            symbolFill: '#B5C9DF',
                                            hoverSymbolFill: '#779ABF',
                                            theme: {
                                                class: "downloadButton highcharts-button highcharts-button-normal",
                                                id: "downloadButton"
                                            },
                                            menuItems: ["downloadPNG", "downloadJPEG", "downloadPDF", "downloadSVG", "downloadCSV", "downloadXLS"]

                                        }
                                    }
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
            }).fail(function () {
                hideLoader2();
                hideLoader1();
                            $(element).highcharts({
                                chart: {
                                    zoomType: 'x'
                                },
                                title: {
                                    text: "Chart title",
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
                                        text: ""
                                    }

                                },
                                 series: [],
                            },    function (chart) {

                                if (chart.series.length < 1 ){
                                    chart.renderer.text("No data", 140, 120).css({
                                        color: "black",
                                        fontSize: "16px"
                                    }).add();
                                }
                            });
                });
        }


        /************************************************************************

         *                        DEFINE PUBLIC INTERFACE
         *************************************************************************/

        public_interface = {};

        /************************************************************************
         *                  INITIALIZATION / CONSTRUCTOR
         *************************************************************************/

        // Initialization: jQuery function that gets called when
        // the DOM tree finishes loading
        $(function () {
            init_all();
            $('#dssatslider').change(function (e) {
                vectorLayer1.setOpacity(this.value);
            }).change();


            $("#interaction").on('click', function () {
                $interactionModal.modal('show');
            });

            //db = $("#outlook_db_table option:selected").val();
            db = $("#outlook_db_table option:selected").val();
            region = $("#outlook_db_table option:selected").val();
            $("#outlook_db_table").trigger('change');
            $("#outlook_db_table").change(function () {
                showLoader();
                $("#outlook_schema_table").html('');
                ajax_update_database("get-start-end-dates", {
                    "db": $("#outlook_db_table option:selected").val(),
                }).done(function (data) {
                    if ("success" in data) {
                        console.log(data);
                        sdate = data.startdate;
                        edate = data.enddate;



                mapchange(sdate,edate);
                  }
                }).fail(function () {
                    vectorLayer1.setSource(null);
                        alert('No data for selected forecast');
                               generate_dssat_graph("#outlook_dssat_plotter_1", "-1", $("#outlook_var_table3 option:selected").val());
                generate_dssat_graph("#outlook_dssat_plotter_2", "-1", $("#outlook_var_table4 option:selected").val());

                });
                $("#outlook_seasonyear").trigger('change');
                hideLoader();
            }).change();

            const unique = (value, index, self) => {
                return self.indexOf(value) === index
            };

            function mapchange(sdate,edate) {
                console.log(sdate,edate)
                showLoader();

                    ajax_update_database("get-schema-yield", {
                        "db": $("#outlook_db_table option:selected").val(),
                        "schema": $("#outlook_db_table option:selected").val(),
                        "startdate": sdate,
                        "enddate": edate,
                    }).done(function (data) {
                        if ("success" in data) {
                            ajax_update_database("scale", {
                                "min": $("#outlook_var_table3 option:selected").val() == "GWAD" ? 73 : $("#outlook_var_table3 option:selected").val() == "WSGD" ? 0 : 0.06,
                                "max": $("#outlook_var_table3 option:selected").val() == "GWAD" ? 1462 : $("#outlook_var_table3 option:selected").val() == "WSGD" ? 954 : 1.36,
                            }).done(function (data1) {
                                if ("success" in data1) {
                                    vectorLayer1.setSource(null);
                                    // vectorLayer2.setSource(null);
                                    add_dssat(data, data1.scale);
                                } else {
                                   alert('Cannot retrieve map');
                                }
                            });
                        }

                    });





                var gid = $("#gid").val();
                if (gid == undefined || gid == "") gid = 'KE041';


                generate_dssat_graph("#outlook_dssat_plotter_1", gid, $("#outlook_var_table3 option:selected").val());
                generate_dssat_graph("#outlook_dssat_plotter_2", gid, $("#outlook_var_table4 option:selected").val());
                hideLoader();

            }


            $("#outlook_var_table3").change(function () {
                if (gid == undefined || gid == "") gid = 'KE041';
                generate_dssat_graph("#outlook_dssat_plotter_1", gid, $("#outlook_var_table3 option:selected").val());
            });
            $("#outlook_var_table4").change(function () {
                if (gid == undefined || gid == "") gid = 'KE041';
                generate_dssat_graph("#outlook_dssat_plotter_2", gid, $("#outlook_var_table4 option:selected").val());
            });


            $("#outlook_ens_table").change(function () {

                var ens = $("#outlook_ens_table option:selected").val();
                var gid = $("#gid").val();
                if (gid == undefined || gid == "") gid = 'KE041';
                var xhr = ajax_update_database("get-ens-values", {
                    "db": $("#outlook_db_table option:selected").val(),
                    "gid": gid,
                    "schema": $("#outlook_db_table option:selected").val(),
                    "ensemble": ens,
                    "startdate": sdate,
                    "enddate": edate
                });
                xhr.done(function (data) {
                    if ("success" in data) {

                        generate_dssat_graph("#outlook_dssat_plotter_1", gid, $("#outlook_var_table3 option:selected").val());
                        generate_dssat_graph("#outlook_dssat_plotter_2", gid, $("#outlook_var_table4 option:selected").val());
                    }
                });
            });

            $("#outlook_typeofchart").change(function () {
                var gid = $("#gid").val();
                if (gid == undefined || gid == "") gid = 'KE041';
                generate_dssat_graph("#outlook_dssat_plotter_1", gid, $("#outlook_var_table3 option:selected").val());
                generate_dssat_graph("#outlook_dssat_plotter_2", gid, $("#outlook_var_table4 option:selected").val());

            });


            $("#togglePanel").click(function () {


                if ($("#paramscontainer").css('display') == 'none') {
                    $("#togglePanel").html("<span class=\"glyphicon glyphicon-chevron-left\"></span>");
                    $("#togglePanel").css("left", "15%");
                    $("#crow").css('margin-left', '6%');
                    $("#mrow").css('margin-left', '6%');
                    $("#outlook_paramscontainer").show();
                    $("#outlook_mapcontainer1").height("65vh");
                    $(".chartpanel").height("28vh");
                    $("#outlook_mc").width("89.5%");

                    $("#outlook-dssat-plot-modal1").height("27vh");

                    $("#outlook-dssat-plot-modal2").height("27vh");
                    /*      $("#vic_plotter_1").height("300px");
                          $("#vic_plotter_2").height("300px");
                          $("#dssat_plotter_1").height("300px");
                          $("#dssat_plotter_2").height("300px");*/

                } else {
                    $("#togglePanel").html("<span class=\"glyphicon glyphicon-chevron-right\"></span>");
                    $("#togglePanel").css('margin-left', '0%');
                    $("#togglePanel").css("left", "0%");
                    $("#outlook_mc").width("100%");
                    $("#outlook_paramscontainer").hide();

                    $("#outlook_mapcontainer1").height("51vh");
                    $(".chartpanel").height("42vh");

                    $("#outlook_dssat-plot-modal1").height("41vh");
                    $("#outlook_dssat-plot-modal2").height("41vh");

                    $("#outlook_dssat_plotter_1").height("97%");
                    $("#outlook_dssat_plotter_2").height("97%");
                    $("#crow").css('margin-left', '20px');
                    $("#mrow").css('margin-left', '20px');
                }


            });
        });


        function showLoader() {
            $('#outlook_loading').show();
        }

        function hideLoader() {
            $('#outlook_loading').hide();
        }

        function hideLoader1() {
            document.getElementById("outlook_chartloading1").style.display = "none";
        }

        function hideLoader2() {
            $('#outlook_chartloading2').hide();
        }

        function showLoader1() {
            document.getElementById("outlook_chartloading1").style.display = "block";
        }

        function showLoader2() {
            $('#outlook_chartloading2').show();
        }



// Strongly recommended: Hide loader after 20 seconds, even if the page hasn't finished loading
//setTimeout(hideLoader, 5 * 500);
        return public_interface;

}());
// End of package wrapper
// NOTE: that the call operator (open-closed parenthesis) is used to invoke the library wrapper
// function immediately after being parsed.
