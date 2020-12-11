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
var gpolygon;
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
        $vicplotModal,
        $vicplotModal1,
        $vicplotModal2,
        $vicplotModal3,
        wms_workspace,
        wms_url,
        wms_layer,
        wms_source, gid, variable1, variable2, centeravg;


    /************************************************************************
     *                    PRIVATE FUNCTION DECLARATIONS
     *************************************************************************/
    var add_vic,
        clear_coords,
        get_bounds,
        get_bounds1,
        get_plot,
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
        $vicplotModal = $("#vic-plot-modal");
        $vicplotModal1 = $("#vic-plot-modal1");
        $vicplotModal2 = $("#vic-plot-modal2");
        $vicplotModal3 = $("#vic-plot-modal3");

        var $var_element = $("#variable");
        variable_data = $var_element.attr('data-variable-info');
        variable_data = JSON.parse(variable_data);
        //     wms_url = $var_element.attr('data-geoserver-url');
        //  rest_url = $var_element.attr('data-rest-url');
        //    db_enabled=$var_element.attr('data-db-enabled');
        // wms_url = JSON.parse(wms_url);
        //  wms_workspace = $var_element.attr('data-geoserver-workspace');
        // wms_workspace = JSON.parse(wms_workspace);

    };


    init_dropdown = function () {
        $("#analysis").css("background-color", "#ddd");
        $("#analysis").css("color", "black");
        //  $(".db_table").select2()
        //$(".schema_table").select2();

        $(".var_table").select2();
        $(".time_table").select2();
        $(".interaction").select2();
        $(".region_table_plot").select2();
        $(".date_table_plot").select2();
        $(".ens_table").select2();
        $(".seasonyear").select2();
        $(".typeofchart").select2();

        $("#ens_table").append(new Option("Median", "avg")).trigger('change');
    };

    init_map = function () {
        var projection = ol.proj.get('EPSG:3857');
        var baseLayer = new ol.layer.Tile({
            //			source: new ol.source.BingMaps({
            //				key: '5TC0yID7CYaqv3nVQLKe~xWVt4aXWMJq2Ed72cO4xsA~ApdeyQwHyH_btMjQS1NJ7OHKY8BK-W-EMQMrIavoQUMYXeZIQOUURnKGBOC7UCt4',
            //				imagerySet: 'AerialWithLabels' // Options 'Aerial', 'AerialWithLabels', 'Road'
            //			})

            source: new ol.source.XYZ({
                // attributions: 'Tiles © <a href="https://services.arcgisonline.com/ArcGIS/' +
                //     'rest/services/World_Topo_Map/MapServer">ArcGIS</a>',
                url: 'https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Light_Gray_Base/MapServer/tile/{z}/{y}/{x}'
            })

        });

        var fullScreenControl = new ol.control.FullScreen();


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
        map = new ol.Map({
            target: document.getElementById("map"),
            layers: layers,
            view: view,
        });

        // $('#mapfull').data('map', map);
        map1 = new ol.Map({
            target: document.getElementById("map1"),
            layers: [baseLayer],
            view: view
        });
        gmap = map;
        vector_layer.setZIndex(Infinity);
        map.addLayer(vector_layer);
        vectorLayerDistrict.setZIndex(77777);
        // map.addLayer(vectorLayerDistrict);
        boundaryLayer = vectorLayerDistrict;

        var sel = new ol.interaction.Select({
            source: vectorLayerDistrict
        });

        // map.addInteraction(sel);

        sel.on('select', function (e) {

            testvar = e.target.getFeatures().getArray()[0].getGeometry().getCoordinates();
            var result = testvar[0].map(coord => {
                return ol.proj.transform(coord, 'EPSG:3857', 'EPSG:4326');
            });
            var json_object = '{"type":"Polygon","coordinates":[' + JSON.stringify(result) + ']}';

            // var variable1 = $("#var_table1 option:selected").val();
            // var variable2 = $("#var_table2 option:selected").val();
            generate_vic_graph("#vic_plotter_1", variable1, "", json_object);
            generate_vic_graph("#vic_plotter_2", variable2, "", json_object);

        });


        var modify = new ol.interaction.Modify({
            source: vector_source
        });
        // map.addInteraction(modify);
        addControls();

        function addControls() {
            var element = document.createElement('div');
            var element1 = document.createElement('div');
            element.className = 'ol-control-panel ol-unselectable ol-control';
            element1.className = 'ol-control-panel ol-unselectable ol-control';
            // element.appendChild(createControl("Point", "glyphicon glyphicon-record"));
            element.appendChild(createControl("Polygon", "fas fa-draw-polygon"));
            element.appendChild(createControl("Recenter", "fas fa-compass"));
            // element.appendChild(createControl("ToggleDistrict", "fas fa-toggle-on"));
            element.appendChild(createControl("UploadShapeFile", "fas fa-upload"));
            element.appendChild(createControl("ClearAll", "far fa-trash-alt"));
            element.appendChild(createControl("FullScreen", "fas fa-expand"));
            element1.appendChild(createControl("FullScreen1", "fas fa-expand"));
            /*A custom control which has container holding input elements etc*/
            var controlPanel = new ol.control.Control({
                element: element
            });
            var controlPanel1 = new ol.control.Control({
                element: element1
            });
            map.addControl(controlPanel);
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

            if (which == "Recenter") {
                console.log("Process as Recenter");
                map.getView().animate({
                    center: ol.proj.transform([39.669571, -1.036878], 'EPSG:4326', 'EPSG:3857'),
                    duration: 1000,
                    zoom: 6
                });
            } else if (which == "ToggleDistrict") {
                if (boundaryLayer.getVisible()) {
                    boundaryLayer.setVisible(false);
                    document.getElementById("draw" + which).innerHTML = "<span class='" + "fas fa-toggle-off" + "' aria-hidden='true'></span>";

                } else {
                    boundaryLayer.setVisible(true);
                    document.getElementById("draw" + which).innerHTML = "<span class='" + "fas fa-toggle-on" + "' aria-hidden='true'></span>";
                }
            } else if (which == "ClearAll") {
                map.removeLayer(shapeFile);


            } else if (which == "FullScreen") {
//                    if (document.getElementById("mapcontainer").classList.contains("mapcontainerfull")) {
//                     document.getElementById("mapcontainer").classList.remove("mapcontainerfull");
//                      document.getElementById("mapcontainer").style.height="63vh";
//                     document.getElementById("crow").style.display='block';
//              setTimeout( function() { map.updateSize();}, 200);
//                     document.getElementById("draw" + which).innerHTML = "<span class='" + "fas fa-expand" + "' aria-hidden='true'></span>";
//
//                 } else {
//
//                    document.getElementById("mapcontainer").classList.add("mapcontainerfull");
//                    document.getElementById("mapcontainer").style.height="90%";
//                    document.getElementById("crow").style.display='none';
// setTimeout( function() { map.updateSize();}, 200);
//                     document.getElementById("draw" + which).innerHTML = "<span class='" + "fa fa-window-minimize" + "' aria-hidden='true'></span>";
//                 }
                var elem = document.getElementById("mappanelbody");
                elem.requestFullscreen();
            } else if (which == "FullScreen1") {
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
                var elem = document.getElementById("mappanelbody1");
                elem.requestFullscreen();
                // window.open($('#etr').attr('href'));
            }
            if (which == "Polygon") {
                try {
                    map.removeInteraction(draw);
                } catch (e) {
                }
                vector_source.clear();
                draw = new ol.interaction.Draw({
                    source: vector_source,
                    type: which
                });

                //vector_source.removeFeatures(vector_source.features);
                map.addInteraction(draw);
                var snap = new ol.interaction.Snap({
                    source: vector_source
                });
                map.addInteraction(snap);
                draw.on('drawend', function (evt) {
                    //               try{
                    //               select_interaction.getOverlay().clear();
                    //                 var selectedFeatures = select_interaction.getFeatures();
                    //                 console.log(selectedFeatures.length);
                    //                 for(var i=0;i<selectedFeatures.length;i++){
                    //                                 vector_source.removeFeature(selectedFeatures[i].item(0));
                    //
                    //                 }
                    //                 }
                    //                 catch(e){
                    //                        console.log(e);
                    //                 }
                    selectedFeatures.push(evt.feature);
                    feat = evt.feature;
                    processFeature(evt.feature, which);
                    map.removeInteraction(draw);

                });
            }
        }

        function processFeature(feature, featureType) {
            if (featureType == "Point") {
                console.log("Process as point");
                var coords = feature.getGeometry().getCoordinates();
                var proj_coords = ol.proj.transform(coords, 'EPSG:3857', 'EPSG:4326');
                $("#point-lat-lon").val(proj_coords);
                $("#poly-lat-lon").val("");
            } else if (featureType == "Polygon") {
                console.log("Process as Polygon");
                var coords = feature.getGeometry().getCoordinates();
                var proj_coords = ol.proj.transform(coords, 'EPSG:3857', 'EPSG:4326');
                $("#poly-lat-lon").val('{"type":"Polygon","coordinates":[' + JSON.stringify(proj_coords) + ']}');
                console.log($("#poly-lat-lon").val());
                $("#point-lat-lon").val("");
            }


        }

        //Code for adding interaction for drawing on the map
        var lastFeature, draw, featureType;

        //Clear the last feature before adding a new feature to the map
        var removeLastFeature = function () {
            if (lastFeature) vector_source.removeFeature(lastFeature);
        };

        //Add interaction to the map based on the selected interaction type
        var addInteraction = function (geomtype) {
            var typeSelect = document.getElementById('interaction-type');
            var value = typeSelect.value;
            $('#data').val('');
            if (value !== 'None') {
                if (draw)
                    map.removeInteraction(draw);

                draw = new ol.interaction.Draw({
                    source: vector_source,
                    type: geomtype
                });


                map.addInteraction(draw);
            }
            if (featureType === 'Point' || featureType === 'Polygon') {

                draw.on('drawend', function (e) {
                    lastFeature = e.feature;


                });

                draw.on('drawstart', function (e) {
                    selected = false;
                    vector_source.clear();
                });

            }

        };

        vector_layer.getSource().on('addfeature', function (event) {
            //Extracting the point/polygon values from the drawn feature
            var feature_json = saveData(vector_layer);
            var parsed_feature = JSON.parse(feature_json);
            var feature_type = parsed_feature["features"][0]["geometry"]["type"];
            if (feature_type == 'Point') {

                $plotModal.find('.info').html('');
                var coords = parsed_feature["features"][0]["geometry"]["coordinates"];
                var proj_coords = ol.proj.transform(coords, 'EPSG:3857', 'EPSG:4326');
                $("#point-lat-lon").val(proj_coords);
                $plotModal.find('.info').html('<b>You have selected a point at ' + proj_coords[1].toFixed(2) + ',' + proj_coords[0].toFixed(2) + '. Click on Show plot to view the Time series.</b>');
                $plotModal.modal('show');
            } else if (feature_type == 'Polygon') {
                console.log("from polygon");
                selected = false;
                $plotModal.find('.info').html('');
                var coords = parsed_feature["features"][0]["geometry"]["coordinates"][0];
                proj_coords = [];
                coords.forEach(function (coord) {
                    var transformed = ol.proj.transform(coord, 'EPSG:3857', 'EPSG:4326');
                    proj_coords.push('[' + transformed + ']');
                });

                var json_object = '{"type":"Polygon","coordinates":' + JSON.stringify(proj_coords) + '}';
                $("#poly-lat-lon").val('[' + proj_coords + ']');
                console.log($("#poly-lat-lon").val());
                //       $("#poly-lat-lon").val(proj_coords);
                $plotModal.find('.info').html('<b>You have selected the following polygon object ' + proj_coords + '. Click on Show plot to view the Time series.</b>');
                $plotModal.modal('show');
            }
            get_plot();
        });

        function saveData(layer) {
            // get the format the user has chosen
            var data_type = 'GeoJSON',
                // define a format the data shall be converted to
                format = new ol.format[data_type](),
                // this will be the data in the chosen format
                data;
            try {
                // convert the data of the vector_layer into the chosen format
                data = format.writeFeatures(layer.getSource().getFeatures());
            } catch (e) {
                // at time of creation there is an error in the GPX format (18.7.2014)
                $('#data').val(e.name + ": " + e.message);
                return;
            }
            // $('#data').val(JSON.stringify(data, null, 4));
            return data;

        }


        $('#interaction-type').change(function (e) {
            featureType = $(this).find('option:selected').val();
            if (featureType == 'None') {
                $('#data').val('');
                clear_coords();
                map.removeInteraction(draw);
                vector_layer.getSource().clear();
            } else if (featureType == 'Point') {
                clear_coords();
                addInteraction(featureType);
            } else if (featureType == 'Polygon') {
                clear_coords();
                addInteraction(featureType);
            }
            $interactionModal.modal('hide');
        }).change();

    };


    init_events = function () {

        map.on('pointermove', function (evt) {

//             testevt = evt;
//             if (evt.dragging) {
//                 return;
//             }
//             var pixel = map.getEventPixel(evt.originalEvent);
//
//
//             var highlight;
//             var feature = map.forEachFeatureAtPixel(pixel, function (feature) {
//                 return feature;
//             });
//             boundaryLayer.getSource().getFeatures().map(f => {
//                 var coords = evt.coordinate;
//                 let poli = new ol.geom.Polygon(f.getGeometry().getCoordinates());
//                 if(ol.extent.containsXY(poli.getExtent(), coords[0], coords[1]))
//                     highlight = f;
//                 if (feature !== highlight) {
//                     if (highlight) {
//                         featureOverlay.getSource().removeFeature(highlight);
//                     }
//                     if (feature) {
//                         //console.log(feature);
//                         featureOverlay.getSource().addFeature(feature);
//                     }
//                     highlight = feature;
//                 }
//
//                 // let intersectPolygon = intersect(polygonGeometry, coords);
//
// //let polygon = new Polygon(intersectPolygon.geometry.coordinates);
//
//             });
        });

        map1.on("singleclick", function (evt) {
            selected = false;
        });

        // map.on('pointermove', function (evt) {
        // 	if (evt.dragging) {
        // 		return;
        // 	}
        // 	var pixel = map.getEventPixel(evt.originalEvent);
        // 	var hit = map.forEachLayerAtPixel(pixel, function (layer) {
        // 		if (layer != layers[0] && layer != layers[2]) {
        // 			current_layer = layer;
        // 			return true;
        // 		}
        // 	});
        // 	map.getTargetElement().style.cursor = hit ? 'pointer' : '';
        // });

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
            ctx.beginPath();
            ctx.fillStyle = color;
            //            var my_gradient = ctx.createLinearGradient(0, 0, 150, 0);
            //            console.log(colors);
            //            my_gradient.addColorStop(0, colors[0]);
            //            my_gradient.addColorStop(0.5, colors[1]);
            //            my_gradient.addColorStop(1, colors[2]);
            //            ctx.fillStyle = my_gradient;
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
            // } else {
            //
            //     ctx.fillRect(i * 10, 0, 10, 20);
            //     ctx.fillStyle = "black";
            //     k = k + 1;
            //     if (k % 4 == 0) {
            //         try {
            //             if(variable=="net_long" || variable=="net_short" || variable=="rainf" || variable=="rootmoist"||
            //                 variable=="rel_humid" ||variable=="tmax"||variable=="tmin" || variable=="soil_temp"
            //                 || variable=="dryspells" || variable=="evap" || variable=="grnd_flux" || variable=="latent"
            //                 || variable=="pet_short" || variable=="pet_tall" ||  variable=="prec" || variable=="runoff"
            //                 || variable=="severity" || variable=="soil_moist" || variable=="surf_temp" || variable=="transp_veg"){
            //               ctx.fillText(Math.round(scale[k - 1]), j, 33);
            //             }else
            //             ctx.fillText(scale[k - 1].toFixed(2), j, 33);
            //             j = j + (cv.width / 7);
            //         } catch (e) {
            //             console.log(e);
            //         }
            //     }
            // }
        });

    };

    get_bounds = function (ws, store, url, callback) {
        // console.log(ws,store,url);
        var lastChar = url.substr(-1); // Selects the last character
        if (lastChar != '/') { // If the last character is not a slash
            url = url + '/'; // Append a slash to it.
        }
        // var bbox_url = url+'workspaces/'+ws+'/coveragestores/'+store+'/coverages/'+store+'.xml';
        var bbox;

        var xhr = ajax_update_database("bounds", {
            "url": url,
            "store": store,
            "workspace": ws,
            'type': 'raster'
        });

        xhr.done(function (data) {
            if ("success" in data) {
                callback(data.bounds);
            } else {

            }
        });

        return bbox;

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
                var js=JSON.stringify( '{"type":"Polygon","coordinates":[' + JSON.stringify(result) + ']}');
                // console.log(js);
                $("#poly-lat-lon").val(JSON.stringify(result));
                   generate_vic_graph("#vic_plotter_1", $("#var_table1 option:selected").val(), "", JSON.stringify(result) );
                generate_vic_graph("#vic_plotter_2", $("#var_table2 option:selected").val(), "", JSON.stringify(result));
            //    console.log(gpolygon);
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
                        "db": $("#db_table option:selected").val(),
                        "gid": level,
                        "schema": $("#schema_table option:selected").val(),
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
    get_bounds1 = function (ws, store, url, callback) {
        var lastChar = url.substr(-1); // Selects the last character
        if (lastChar != '/') { // If the last character is not a slash
            url = url + '/'; // Append a slash to it.
        }
        // var bbox_url = url+'workspaces/'+ws+'/coveragestores/'+store+'/coverages/'+store+'.xml';
        var bbox;
        var xhr_dssat = ajax_update_database("bounds", {
            "url": url,
            "store": store,
            "workspace": ws,
            'type': 'vector'
        });


        xhr_dssat.done(function (data) {
            if ("success" in data) {
                callback(data.bounds);
            } else {
                console.log("not succes");
            }
        });

        return bbox;

    };
    var yield_data;
    var store;
    var lonlat;

    function get_cal(bounds) {
        var layer_extent = bounds;
        var transformed_extent = ol.proj.transformExtent(layer_extent, 'EPSG:4326', 'EPSG:3857');
        // map.getView().fit(transformed_extent, map.getSize());
        var aa = layer_extent;
        centeravg = ol.extent.getCenter(aa);
        $("#point-lat-lon").val(centeravg.toString());

        // var variable1 = $("#var_table1 option:selected").val();
        // var variable2 = $("#var_table2 option:selected").val();
        // generate_vic_graph("#vic_plotter_1", variable1, centeravg.toString(), "");
        //  generate_vic_graph("#vic_plotter_2", variable2, centeravg.toString(), "");
        var features = vectorLayer1.getSource().getFeatures();
        var i;
        var found = false;
        for (i = 0; i < features.length && !found; i++) {
            if (features[i].getProperties().countyid === 'KE041') {
                found = true;
                var res = features[i].getGeometry().getCoordinates()[0];
                var result = res[0].map(coord => {
                    return ol.proj.transform(coord, 'EPSG:3857', 'EPSG:4326');
                });
                // var xhr = ajax_update_database("get-vic-nc", {"polygon": JSON.stringify(result)});
                // xhr.done(function (data) {
                //     console.log(data);
                //
                // });
                var json_object = '{"type":"Polygon","coordinates":[' + JSON.stringify(result) + ']}';
                // $("#poly-lat-lon").val(json_object);
                var jobj = JSON.stringify(result);
                $("#poly-lat-lon").val(JSON.stringify(result));
                console.log($("#poly-lat-lon").val());
               // gpolygon = jobj;
                generate_vic_graph("#vic_plotter_1", variable1, "", jobj);
                generate_vic_graph("#vic_plotter_2", variable2, "", jobj);
            }
        }


        map.updateSize();

    };
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

    var select_interaction, hoverInteraction;
    var tooltip = document.getElementById('tooltip11');

    var overlayt = new ol.Overlay({
        element: tooltip,
        offset: [0, 0],
        positioning: 'bottom-left'

    });

    function add_dssat(data, scale) {

        yield_data = data.yield;
        store = data.storename;
        var styling = get_styling("dssat", scale, 'cv_dssat');
        //  var bbox = get_bounds1(wms_workspace, store, rest_url, get_cal);
        vectorLayer1.setSource(new ol.source.Vector({
            // format: new ol.format.GeoJSON(),
            // url: function (extent) {
            //     return wms_url + '?service=WFS&' +
            //         'version=1.1.0&request=GetFeature&typename=' + wms_workspace + ':' + store + '&' +
            //         'outputFormat=application/json&srsname=EPSG:3857&' +
            //         'bbox=' + extent.join(',') + ',EPSG:3857';
            // },
            // strategy: ol.loadingstrategy.bbox,
            // wrapX: false,

            features: (new ol.format.GeoJSON()).readFeatures(boundaries, {
                featureProjection: 'EPSG:3857'
            })

        }));
        vectorLayer11.setSource(new ol.source.Vector({
            // format: new ol.format.GeoJSON(),
            // url: function (extent) {
            //     return wms_url + '?service=WFS&' +
            //         'version=1.1.0&request=GetFeature&typename=' + wms_workspace + ':' + store + '&' +
            //         'outputFormat=application/json&srsname=EPSG:3857&' +
            //         'bbox=' + extent.join(',') + ',EPSG:3857';
            // },
            // strategy: ol.loadingstrategy.bbox,
            // wrapX: false,
            features: (new ol.format.GeoJSON()).readFeatures(boundaries, {
                featureProjection: 'EPSG:3857'
            })
        }));
        vectorLayer1.setZIndex(3);
        map1.addLayer(vectorLayer1);
        vectorLayer11.setZIndex(Infinity);
        map.addLayer(vectorLayer11);
        //  vectorLayer2.setSource(new ol.source.Vector({
        // format: new ol.format.GeoJSON(),
        // url: function (extent) {
        //     return wms_url + '?service=WFS&' +
        //         'version=1.1.0&request=GetFeature&typename=' + wms_workspace + ':' + store + '&' +
        //         'outputFormat=application/json&srsname=EPSG:3857&' +
        //         'bbox=' + extent.join(',') + ',EPSG:3857';
        // },
        // strategy: ol.loadingstrategy.bbox,
        // wrapX: false,
        //      features: (new ol.format.GeoJSON()).readFeatures(boundaries, {
        //  featureProjection: 'EPSG:3857'
        //})

        // }));
        //   vectorLayer2.setZIndex(4);
        //     map1.addLayer(vectorLayer2);

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
        hoverInteraction = new ol.interaction.Select({
            condition: ol.events.condition.pointerMove,
            layers: [vectorLayer1],//vectorLayer2.getSource()==null?[vectorLayer1]:[vectorLayer2],  //Setting layers to be hovered
            style: new ol.style.Style({

                fill: new ol.style.Fill({
                    color: 'rgba(0,0,255,0.5)'
                }),
                stroke: new ol.style.Stroke({
                    color: 'blue',
                    width: 3,
                }),
            }),
        });
        //  map1.addInteraction(hoverInteraction);


        select_interaction.on('select', function (e) {
            // map1.getView().setZoom(map.getView().getZoom()+1);
            selected = true;
            map1.getView().fit(e.selected[0].getGeometry(), {padding: [170, 50, 30, 150]});
            gid = e.selected[0].getProperties().countyid;// e.selected[0].getId().split(".")[1];
            temp = gid;
            var polygon = $("#poly-lat-lon").val();
            generate_vic_graph("#vic_plotter_1", variable1, "", polygon);
            generate_vic_graph("#vic_plotter_2", variable2, "", polygon);
            generate_dssat_graph("#dssat_plotter_1", gid, $("#var_table3 option:selected").val());
            generate_dssat_graph("#dssat_plotter_2", gid, $("#var_table4 option:selected").val());
            // vectorLayer2.setSource(null);
            // console.log(vectorLayer2.getSource());
            //  vectorLayer2.setZIndex(3);

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
                console.log($("#poly-lat-lon").val());
                var gid = feature.getProperties().countyid;//feature.getId().split(".")[1];
                $("#gid").val(gid);
                var schema = $("#schema_table option:selected").val();

                if (gid == undefined) gid = "KE041";
                $("#schema").val(schema);

                if (feature != undefined) {
                    document.getElementById("tooltip11").style.display = 'block';
                    document.getElementById("tooltip11").innerHTML = "County: " + "Loading..." + "<br>" + "Yield: " + "Loading...";
                    var gid = feature.getProperties().countyid;//evt.selected[0].getId().split(".")[1];
                    var county_name = "Unknown";
                    var yield_val = "unavailable";
                    var startdate = '';
                    var enddate = '';
                    if ($("#myonoffswitch").is(':checked')) {
                        startdate = $("#seasonyear option:selected").val() + "-05-01";
                        enddate = $("#seasonyear option:selected").val() + "-08-31";
                    } else {
                        startdate = $("#seasonyear option:selected").val() + "-09-01";
                        enddate = (parseInt($("#seasonyear option:selected").val()) + 1) + "-07-31";

                    }
                    if (gid == undefined) gid = 'KE041';
                    document.getElementById("tooltip11").innerHTML = "County: " + "Loading..." + "<br>" + "Yield: " + "Loading...";

                    ajax_update_database("get-schema-yield-gid", {
                        "db": $("#db_table option:selected").val(),
                        "schema": $("#schema_table option:selected").val(),
                        "gid": gid,
                        "startdate": startdate,
                        "enddate": enddate
                    }).done(function (data) {
                        if ("success" in data) {

                            // ajax_update_database("get-county", {
                            //     "db": $("#db_table option:selected").val(),
                            //     "gid": gid,
                            //     "schema": $("#schema_table option:selected").val(),
                            // }).done(function (data1) {
                            //     if ("success" in data1) {

                            county_name = data["county"].length > 0 ? data["county"][0][0] : "Unknown";
                            if (data.yield[0]) {
                                yield_val = Math.round(data.yield[0][2]).toFixed(2);


                            }
                            document.getElementById("tooltip11").innerHTML = "County: " + county_name + "<br>" + "Yield: " + yield_val + " kg/ha";
                            //  overlayt.setPosition(ol.proj.transform(event.mapBrowserEvent.coordinate, 'EPSG:3857', 'EPSG:4326'));

                            map1.addOverlay(overlayt);


                            //         }
                            //     });
                            //
                            //
                        } else {
                            console.log("error");
                        }
                    });

                } else {
                    document.getElementById("tooltip11").style.display = 'none';
                }
                var json_obj = {
                    "db": $("#db_table option:selected").val(),
                    "gid": gid,
                    "schema": $("#schema_table option:selected").val()
                };
                var xhr = ajax_update_database("get-ensemble", json_obj);
                xhr.done(function (data) {
                    if ("success" in data) {
                        $(".ensemble").removeClass('hidden');
                        $("#ens_table").html('');
                        var ensembles = data.ensembles;
                        $("#ens_table").append(new Option("Median", "avg"));
                        ensembles.forEach(function (ensemble, i) {
                            var new_option = new Option(ensemble, ensemble);
                            $("#ens_table").append(new_option);
                        });
                    } else {
                        // $(".error").append('<h3>Error Retrieving the ensemble data. Please select another feature.</h3>');

                    }
                });
                var name_0 = feature.getProperties().name;


            } catch (e) {
            }
            hideLoader();
        });

        var hoverFeatures = hoverInteraction.getFeatures();
        hoverInteraction.on('select', function (evt) {
            if (evt.selected.length > 0) {
                var gid = evt.selected[0].getProperties().countyid;//evt.selected[0].getId().split(".")[1];
                var county_name = "Unknown";
                var yield_val = "unavailable";
                var startdate = '';
                var enddate = '';
                if ($("#myonoffswitch").is(':checked')) {
                    startdate = $("#seasonyear option:selected").val() + "-05-01";
                    enddate = $("#seasonyear option:selected").val() + "-08-31";
                } else {
                    startdate = $("#seasonyear option:selected").val() + "-09-01";
                    enddate = (parseInt($("#seasonyear option:selected").val()) + 1) + "-07-31";

                }
                // ajax_update_database("get-schema-yield-gid", {
                //     "db": $("#db_table option:selected").val(),
                //     "schema":$("#schema_table option:selected").val(),
                //     "gid": gid,
                //     "startdate":startdate,
                //     "enddate":enddate
                // }).done(function (data) {
                //     if ("success" in data) {
                //         ajax_update_database("get-county", {
                //             "db": $("#db_table option:selected").val(),
                //             "gid": gid,
                //             "schema": $("#schema_table option:selected").val(),
                //         }).done(function (data1) {
                //
                //             if ("success" in data1) {
                //                 county_name =data1["county"].length>0?data1["county"][0][0]:"Unknown";
                //
                //                 if (data.yield[0]) {
                //                     yield_val = Math.round(data.yield[0][3]).toFixed(2);
                //
                //                     document.getElementById("tooltip11").style.display = data.yield[0][3] ? 'block' : 'none';
                //                 }
                //                 document.getElementById("tooltip11").innerHTML = "County: " + county_name + "<br>" + "Yield: " + yield_val + " kg/ha";
                //                 overlayt.setPosition(ol.proj.transform(evt.mapBrowserEvent.coordinate, 'EPSG:3857', 'EPSG:4326'));
                //
                //                 map1.addOverlay(overlayt);
                //
                //
                //             }
                //         });
                //
                //
                //     } else {
                //         console.log("error");
                //     }
                // });

            } else {
                document.getElementById("tooltip11").style.display = 'none';
            }
        });

    }

    add_vic = function () {
        showLoader();
        map.removeLayer(wms_layer);
        //    var layer_name = wms_workspace + ":" + data.storename;

        var variable = $("#map_var_table option:selected").val();
        //    var styling = get_styling(data.variable, data.scale, 'cv_vic');
        //new var styling = get_styling(layer_name, data.scale, 'cv_vic');
        //new var bbox = get_bounds(wms_workspace, data.storename, rest_url, get_cal);

        // var sld_string = '<StyledLayerDescriptor version="1.0.0"><NamedLayer><Name>' + layer_name + '</Name><UserStyle><FeatureTypeStyle><Rule>\
        // <RasterSymbolizer> \
        // <ColorMap type="ramp"> \
        // <ColorMapEntry color="#f00" quantity="-9999" label="label0" opacity="0"/>' +
        //     styling + '</ColorMap>\
        // </RasterSymbolizer>\
        // </Rule>\
        // </FeatureTypeStyle>\
        // </UserStyle>\
        // </NamedLayer>\
        // </StyledLayerDescriptor>';
        var index = find_var_index(variable, variable_data);

        var style = variable_data[index]["color1"] + variable_data[index]["color2"] + variable_data[index]["color3"];
        var range = parseFloat(variable_data[index]["min"]).toFixed(2) + "," + parseFloat(variable_data[index]["max"]).toFixed(2);
        switch (variable) {
            case "albedo":
            case "baseflow":
            case "cdi":
            case "dryspells":
            case "evap":
            case "par":
            case "rel_humid":
                style = variable;
                break;
            case "grnd_flux":
            case "latent":
            case "sensible":
            case "net_short":
            case "net_long":
                style = "net_short_long";
                break;
            case "pet_short":
            case "pet_tall":
            case "transp_veg":
                style = "evap";
                break;
            case "prec":
            case "rainf":
            case "runoff":
                style = "prec_rainf";
                break;
            case "rootmoist":
                style = "avg_temp_rev";
                break;
            case "tmax":
            case "tmin":
            case "surf_temp":
                style = "avg_temp";
                break;
            case "severity":
                style = "dryspells";
                break;
            case "smdi":
            case "spi1":
            case "spi3":
            case "spi6":
            case "sri1":
            case "sri3":
            case "sri6":
                style = "cwg";
                break;
            default:
                style = "crimsonyellowblue";
        }

        // if (variable == "net_long" || variable == "net_short" || variable == "rainf" || variable == "rootmoist" ||
        //     variable == "rel_humid" || variable == "tmax" || variable == "tmin" || variable == "soil_temp"
        //     || variable == "dryspells" || variable == "evap" || variable == "grnd_flux" || variable == "latent"
        //     || variable == "pet_short" || variable == "pet_tall" || variable == "prec" || variable == "runoff"
        //     || variable == "severity" || variable == "soil_moist" || variable == "surf_temp" || variable == "transp_veg") {
        //     range = Math.round(variable_data[index]["min"]) + "," + Math.round(variable_data[index]["max"]);
        // } else {
        //     range = Math.round(variable_data[index]["min"]).toFixed(2) + "," + Math.round(variable_data[index]["max"]).toFixed(2);
        // }
        var time = $("#time_table option:selected").val() + 'T00:00:00.000Z';
        wms_source = new ol.source.ImageWMS({
            url: 'https://thredds.servirglobal.net/thredds/wms/rheas/' + variable + '_final.nc?',
            params: {
                'LAYERS': variable,
                'TIME': time,
                'STYLES': 'boxfill/' + style,
                'ABOVEMAXCOLOR': 'extend',
                'BELOWMINCOLOR': 'transparent',
                'COLORSCALERANGE': range,
                //'SLD_BODY': sld_string
            },
            crossOrigin: 'Anonymous'
        });
        wms_layer = new ol.layer.Image({
            source: wms_source,
            id: "viclayer",
        });

        wms_layer.setZIndex(2);
        map.addLayer(wms_layer);
        var link = 'https://thredds.servirglobal.net/thredds/wms/rheas/' + variable + '_final.nc' + "?SERVICE=WMS&VERSION=1.3.0&time=" + time + "&REQUEST=GetLegendGraphic&LAYER=" + variable + "&colorscalerange=" + range + "&PALETTE=" + style + "&transparent=TRUE";
        //   map.addLayer(boundaryLayer);
        var div = document.getElementById("vic_leg");
        div.innerHTML =
            '<img src="' + link + '" alt="legend">';
        hideLoader();

    };

    get_plot = function () {
        // var variable1 = $("#var_table1 option:selected").val();
        // var variable2 = $("#var_table2 option:selected").val();
        var point = $("#point-lat-lon").val();
        var polygon = $("#poly-lat-lon").val();
        generate_vic_graph("#vic_plotter_1", variable1, point, polygon);
        generate_vic_graph("#vic_plotter_2", variable2, point, polygon);

    };

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
                county_name = data["county"].length > 0 ? data["county"][0][0] : "Unknown";
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
        var dst = $("#time_table option:selected").text();
        //  if ($("#myonoffswitch").is(':checked') ) {


        startdate = dst;
        enddate = (parseInt(dst.substr(0, 4))) + "-12-31";
        // } else {
        //     startdate = dst;
        //     enddate = (parseInt(dst.substr(0,4)) + 1) + "-02-28";
        // }
        var json = {
            "db": $("#db_table option:selected").val(),
            "region": $("#schema_table option:selected").val(),
            "variable": variable,
            "point": point,
            "startdate": startdate,
            "enddate": enddate,
            "polygon": polygon
        };

        var xhr = ajax_update_database("get-vic-plot", json);
        xhr.done(function (data) {
            graph_data = data;
            if (data.time_series != undefined && data.time_series.length > 0)
                series = [{
                    data: data.time_series,
                    name: display_name,
                    showInLegend: false
                }];

            populate_vic_graph(element, display_name, units, point, polygon, graph_data, series);

        });
    }


    function populate_vic_graph(element, display_name, units, point, polygon, graph_data, series) {

        var county_name = "Polygon";
        if (gid == undefined || gid == "") gid = 'KE041';

        ajax_update_database("get-county", {
            "db": $("#db_table option:selected").val(),
            "gid": gid,
            "schema": $("#schema_table option:selected").val()
        }).done(function (data) {
            if ("success" in data && selected == true) {
                county_name = data["county"][0][0];
            }

          //  console.log(selected);
            //   var titletext = point == "" ? ( selected==false?"Polygon":county_name) : "At [" + parseFloat(point.split(',')[0]).toFixed(2) + ", " + parseFloat(point.split(',')[1]).toFixed(2) + "]";
            var titletext = selected == false ? "Polygon" : county_name;

            $(element).highcharts({
                    chart: {
                        type: display_name == 'Rainfall' ? 'column' : 'line',
                        zoomType: 'x',

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
        $('#vicslider').change(function (e) {
            wms_layer.setOpacity(this.value);

        }).change();
        $('#dssatslider').change(function (e) {
            vectorLayer1.setOpacity(this.value);
        }).change();

        function fillVarTables(element, variables) {
            variables.forEach(function (variable, i) {
                var index = find_var_index(variable, variable_data);
                if (variable_data[index] != undefined) {
                    var display_name = variable_data[index]["display_name"];
                    var new_option = new Option(display_name, variable);
                    // if (i == 0) {
                    //    // $(element).append(new_option).trigger('change');
                    //      $(element).append(new_option);
                    // } else {
                    $(element).append(new_option);
                    //}
                } else {
                    //   console.log(variable);
                }


            });
        }


        $("#interaction").on('click', function () {
            $interactionModal.modal('show');
        });

        db = $("#db_table option:selected").val();
        region = $("#schema_table option:selected").val();

        $("#db_table").change(function () {
            $("#schema_table").html('');
            var xhr = ajax_update_database("schemas", {
                "db": $("#db_table option:selected").val()
            });
            xhr.done(function (data) {
                if ("success" in data) {
                    var schemas = data.schemas;
                    schemas.forEach(function (schema, i) {
                        var new_option = new Option(schema, schema);
                        // if (i == 0) {
                        //     $("#schema_table").append(new_option).trigger('change');
                        // } else {
                        $("#schema_table").append(new_option);
                        //}
                        // if(schema=="kenya_tethys"){
                        //
                        //
                        // }
                    });
                    if ($("#db_table option:selected").val() == "rheas") $("#schema_table").val("ken_tethys2");
                    $("#schema_table").trigger('change');


                    if (schemas.length == 0) {
                        $("#time_table").html('');
                        $("#var_table1").html('');
                        $("#var_table2").html('');
                        $("#map_var_table").html('');

                        document.getElementsByClassName("cvs")[0].style.display = "none";
                        document.getElementsByClassName("cvs")[1].style.display = "none";
                        var polygon = $("#poly-lat-lon").val();
                        generate_vic_graph("#vic_plotter_1", variable1, "", polygon);
                        generate_vic_graph("#vic_plotter_2", variable2, "", polygon);

                        generate_dssat_graph("#dssat_plotter_1", "", $("#var_table3 option:selected").val());
                        generate_dssat_graph("#dssat_plotter_2", "", $("#var_table4 option:selected").val());
                        map.removeLayer(wms_layer);
                        map.removeLayer(boundaryLayer);
                        vectorLayer1.setSource(null);
                        // vectorLayer2.setSource(null);

                    } else {
                        document.getElementsByClassName("cvs")[0].style.display = "block";
                        document.getElementsByClassName("cvs1")[0].style.display = "block";
                    }

                } else {
                    console.log("error");
                }
            });


        }).change();

        $("#schema_table").change(function () {
            $("#var_table1").html('');
            $("#var_table2").html('');
            
            ajax_update_database("variables", {
                "region": $("#schema_table option:selected").val(),
                "db": $("#db_table option:selected").val()
            }).done(function (data) {
                if ("success" in data) {
                    var vars = data.variables;

                    fillVarTables("#var_table1", vars);

                    fillVarTables("#var_table2", vars);
                    $("#var_table1").val("rainf").attr("selected", "selected");
                    $("#var_table2").val("evap").attr("selected", "selected");
                    fillVarTables("#map_var_table", vars);

                    $("#map_var_table").val("evap").attr("selected", "selected");
                  //  $("#map_var_table").trigger('change');
                    mapchange();
                    $("#time_table").trigger('change');
                    //     $("#var_table1").trigger('change');
                    //   $("#var_table2").trigger('change');


                } else {
                    console.log("error");
                }
            });
        });
        const unique = (value, index, self) => {
            return self.indexOf(value) === index
        };

        function mapchange()
        {
                        showLoader();
            var variable = $("#map_var_table option:selected").val();
            variable1 = $("#var_table1 option:selected").val();
            variable2 = $("#var_table2 option:selected").val();

            var xhr = ajax_update_database("dates", {
                "variable": variable,
                "region": $("#schema_table option:selected").val(),
                "db": $("#db_table option:selected").val()
            });

            xhr.done(function (data) {
                var dts = [];
                if ("success" in data) {
                    var dates = data.dates;
                    $("#time_table").html('');
                    dates.forEach(function (date, i) {
                        var new_option = new Option(date, date);
                        $("#time_table").append(new_option);
                        var d = new Date(date);
                        dts.push(d.getFullYear());
                    });
                    const uniquedts = dts.filter(unique);
                    $("#seasonyear").html('');
                    uniquedts.forEach(function (date, i) {
                        var new_option = new Option(date, date);
                        if (i == 0) {
                            if (date == '2014') {
                                new_option.selected = true;
                                flagg = false;
                            }
                            $("#seasonyear").append(new_option);
                        } else {
                            if (date == '2014') {
                                new_option.selected = true;
                                flagg = false;
                            }
                            $("#seasonyear").append(new_option);
                        }
                    });
                    //   $("#seasonyear").trigger('change');
                    var startdate = "", enddate = "";
                    if ($("#myonoffswitch").is(':checked')) {
                        startdate = $("#seasonyear option:selected").val() + "-03-01";
                        enddate = $("#seasonyear option:selected").val() + "-08-31";
                    } else {
                        startdate = $("#seasonyear option:selected").val() + "-10-01";
                        enddate = (parseInt($("#seasonyear option:selected").val()) + 1) + "-02-28";

                    }
                  $("#time_table").val("2014-11-05").change();

                    if ($("#seasonyear option:selected").val() != undefined) {


                        ajax_update_database("get-schema-yield", {
                            "db": $("#db_table option:selected").val(),
                            "schema": $("#schema_table option:selected").val(),
                            "startdate": startdate,
                            "enddate": enddate,
                        }).done(function (data) {
                            if ("success" in data) {
                                ajax_update_database("scale", {
                                    "min": $("#var_table3 option:selected").val() == "GWAD" ? 73 : $("#var_table3 option:selected").val() == "WSGD" ? 0 : 0.06,
                                    "max": $("#var_table3 option:selected").val() == "GWAD" ? 1462 : $("#var_table3 option:selected").val() == "WSGD" ? 954 : 1.36,
                                }).done(function (data1) {
                                    if ("success" in data1) {
                                        vectorLayer1.setSource(null);
                                        // vectorLayer2.setSource(null);
                                        add_dssat(data, data1.scale);
                                    } else {
                                        $(".error").html('<h3>Error Retrieving the layer</h3>');
                                    }
                                });
                            }

                        });


                    }


                    var gid = $("#gid").val();
                    if (gid == undefined || gid == "") gid = 'KE041';

                    var point = $("#point-lat-lon").val();
                    var polygon = $("#poly-lat-lon").val();
                    generate_vic_graph("#vic_plotter_1", variable1, "", polygon);
                    generate_vic_graph("#vic_plotter_2", variable2, "", polygon);
                    generate_dssat_graph("#dssat_plotter_1", gid, $("#var_table3 option:selected").val());
                    generate_dssat_graph("#dssat_plotter_2", gid, $("#var_table4 option:selected").val());
                    //hideLoader();


                    if (dates.length == 0) {
                        document.getElementsByClassName("cvs")[0].style.display = "none";
                        document.getElementsByClassName("cvs")[1].style.display = "none";
                        var polygon = $("#poly-lat-lon").val();
                        generate_vic_graph("#vic_plotter_1", variable1, "", polygon);
                        generate_vic_graph("#vic_plotter_2", variable2, "", polygon);
                        generate_dssat_graph("#dssat_plotter_1", "", $("#var_table3 option:selected").val());
                        generate_dssat_graph("#dssat_plotter_2", "", $("#var_table4 option:selected").val());
                        map.removeLayer(wms_layer);
                        map.removeLayer(boundaryLayer);
                        vectorLayer1.setSource(null);
                        //  vectorLayer2.setSource(null);
                    } else {
                        document.getElementsByClassName("cvs")[0].style.display = "block";
                        document.getElementsByClassName("cvs1")[0].style.display = "block";
                    }

                } else {
                    console.log("error");
                }
            }).fail(function (xhr, status, error) {

                alert("There was a problem with the selected variable, please try selecting another map variable");
                hideLoader();
            });
        }

        $("#map_var_table").change(function () {
            showLoader();
            var variable = $("#map_var_table option:selected").val();
            variable1 = $("#var_table1 option:selected").val();
            variable2 = $("#var_table2 option:selected").val();

            var xhr = ajax_update_database("dates", {
                "variable": variable,
                "region": $("#schema_table option:selected").val(),
                "db": $("#db_table option:selected").val()
            });

            xhr.done(function (data) {
                var dts = [];
                if ("success" in data) {
                    var dates = data.dates;
                 //   $("#time_table").html('');
                    dates.forEach(function (date, i) {
                        var new_option = new Option(date, date);
                     //   $("#time_table").append(new_option);
                        var d = new Date(date);
                        dts.push(d.getFullYear());
                    });
                    const uniquedts = dts.filter(unique);
                    $("#seasonyear").html('');
                    uniquedts.forEach(function (date, i) {
                        var new_option = new Option(date, date);
                        if (i == 0) {
                            if (date == '2014') {
                                new_option.selected = true;
                                flagg = false;
                            }
                            $("#seasonyear").append(new_option);
                        } else {
                            if (date == '2014') {
                                new_option.selected = true;
                                flagg = false;
                            }
                            $("#seasonyear").append(new_option);
                        }
                    });
                    //   $("#seasonyear").trigger('change');
                    var startdate = "", enddate = "";
                    if ($("#myonoffswitch").is(':checked')) {
                        startdate = $("#seasonyear option:selected").val() + "-03-01";
                        enddate = $("#seasonyear option:selected").val() + "-08-31";
                    } else {
                        startdate = $("#seasonyear option:selected").val() + "-10-01";
                        enddate = (parseInt($("#seasonyear option:selected").val()) + 1) + "-02-28";

                    }
                  $("#time_table").trigger('change');
                  // if(!$("#time_table").val()=="2014-11-05")
                  //     else $("#time_table").val("2014-11-05").change();

                    if ($("#seasonyear option:selected").val() != undefined) {


                        ajax_update_database("get-schema-yield", {
                            "db": $("#db_table option:selected").val(),
                            "schema": $("#schema_table option:selected").val(),
                            "startdate": startdate,
                            "enddate": enddate,
                        }).done(function (data) {
                            if ("success" in data) {
                                ajax_update_database("scale", {
                                    "min": $("#var_table3 option:selected").val() == "GWAD" ? 73 : $("#var_table3 option:selected").val() == "WSGD" ? 0 : 0.06,
                                    "max": $("#var_table3 option:selected").val() == "GWAD" ? 1462 : $("#var_table3 option:selected").val() == "WSGD" ? 954 : 1.36,
                                }).done(function (data1) {
                                    if ("success" in data1) {
                                        vectorLayer1.setSource(null);
                                        // vectorLayer2.setSource(null);
                                        add_dssat(data, data1.scale);
                                    } else {
                                        $(".error").html('<h3>Error Retrieving the layer</h3>');
                                    }
                                });
                            }

                        });
                    }


                    var gid = $("#gid").val();
                    if (gid == undefined || gid == "") gid = 'KE041';

                    var point = $("#point-lat-lon").val();
                    var polygon = $("#poly-lat-lon").val();
                    generate_vic_graph("#vic_plotter_1", variable1, "", polygon);
                    generate_vic_graph("#vic_plotter_2", variable2, "", polygon);
                    generate_dssat_graph("#dssat_plotter_1", gid, $("#var_table3 option:selected").val());
                    generate_dssat_graph("#dssat_plotter_2", gid, $("#var_table4 option:selected").val());
//hideLoader();


                    if (dates.length == 0) {
                        document.getElementsByClassName("cvs")[0].style.display = "none";
                        document.getElementsByClassName("cvs")[1].style.display = "none";
                        var polygon = $("#poly-lat-lon").val();
                        generate_vic_graph("#vic_plotter_1", variable1, "", polygon);
                        generate_vic_graph("#vic_plotter_2", variable2, "", polygon);
                        generate_dssat_graph("#dssat_plotter_1", "", $("#var_table3 option:selected").val());
                        generate_dssat_graph("#dssat_plotter_2", "", $("#var_table4 option:selected").val());
                        map.removeLayer(wms_layer);
                        map.removeLayer(boundaryLayer);
                        vectorLayer1.setSource(null);
                        //  vectorLayer2.setSource(null);
                    } else {
                        document.getElementsByClassName("cvs")[0].style.display = "block";
                        document.getElementsByClassName("cvs1")[0].style.display = "block";
                    }

                } else {
                    console.log("error");
                }
            }).fail(function (xhr, status, error) {

                alert("There was a problem with the selected variable, please try selecting another map variable");
                hideLoader();
            });
//            hideLoader();

        });

        $("#var_table1").change(function () {
            variable1 = $("#var_table1 option:selected").val();
            var polygon = $("#poly-lat-lon").val();
            generate_vic_graph("#vic_plotter_1", variable1, "", polygon);
            // var xhr = ajax_update_database("dates", {
            //     "variable": variable1,
            //     "region": $("#schema_table option:selected").val(),
            //     "db": $("#db_table option:selected").val(),
            // });
            // xhr.done(function (data) {
            //     if ("success" in data) {
            //         var dates = data.dates;
            //         $("#time_table").html('');
            //         dates.forEach(function (date, i) {
            //
            //             var new_option = new Option(date, date);
            //              if (i == 0) {
            //
            //                   if(date=='2014') {
            //                       new_option.selected = true;
            //                       $("#seasonyear").append(new_option).trigger('change');
            //                   }else  $("#time_table").append(new_option);
            //             } else {
            //                $("#seasonyear").append(new_option);
            //                 if(date=='2014') {
            //                     new_option.selected = true;
            //                     $("#seasonyear").append(new_option).trigger('change');
            //                 }else  $("#time_table").append(new_option);
            //             }
            //
            //         });
            //
            //     } else {
            //         console.log("error");
            //
            //     }
            // });

        });
        $("#var_table2").change(function () {
            variable2 = $("#var_table2 option:selected").val();
            var polygon = $("#poly-lat-lon").val();
            generate_vic_graph("#vic_plotter_2", variable2, "", polygon);

        });
        $("#var_table3").change(function () {
            if (gid == undefined || gid == "") gid = 'KE041';
            generate_dssat_graph("#dssat_plotter_1", gid, $("#var_table3 option:selected").val());
        });
        $("#var_table4").change(function () {
            if (gid == undefined || gid == "") gid = 'KE041';
            generate_dssat_graph("#dssat_plotter_2", gid, $("#var_table4 option:selected").val());
        });


        $("#time_table").change(function () {
            showLoader();
            var variable = $("#map_var_table option:selected").val();
            var date = $("#time_table option:selected").val();

            var index = find_var_index(variable, variable_data);
            var min = variable_data[index]["min"];
            var max = variable_data[index]["max"];
            var display_name = variable_data[index]["display_name"];
            var units = variable_data[index]["units"];
            $("#var_name").html(display_name);
            $("#var_units").html(units);
            $(".error").html('');
            if (date != undefined) {
                add_vic();
                var polygon = $("#poly-lat-lon").val();
                variable1 = $("#var_table1 option:selected").val();

                variable2 = $("#var_table2 option:selected").val();
                generate_vic_graph("#vic_plotter_1", variable1, "", polygon);
                generate_vic_graph("#vic_plotter_2", variable2, "", polygon);
                //    $("#seasonyear").trigger('change');

                // } else {
                //     $(".error").append('<h3>Error Processing Request. Please be sure to select an area/schema with data.</h3>');
                // }
                // });
            } else {
                console.log("undefinedd");
            }


        });
        $("#ens_table").change(function () {
            console.log($("#poly-lat-lon").val());
            var ens = $("#ens_table option:selected").val();
            var gid = $("#gid").val();
            if (gid == undefined || gid == "") gid = 'KE041';
            var xhr = ajax_update_database("get-ens-values", {
                "db": $("#db_table option:selected").val(),
                "gid": gid,
                "schema": region,
                "ensemble": ens
            });
            xhr.done(function (data) {
                if ("success" in data) {

                    generate_dssat_graph("#dssat_plotter_1", gid, $("#var_table3 option:selected").val());
                    generate_dssat_graph("#dssat_plotter_2", gid, $("#var_table4 option:selected").val());
                }
            });
        });
        $("#myonoffswitch").change(function () {
            var startdate = "", enddate = "";
            if ($("#myonoffswitch").is(':checked')) {
                startdate = $("#seasonyear option:selected").val() + "-03-01";
                enddate = $("#seasonyear option:selected").val() + "-08-31";
            } else {
                startdate = $("#seasonyear option:selected").val() + "-10-01";
                enddate = (parseInt($("#seasonyear option:selected").val()) + 1) + "-02-28";

            }
            if ($("#seasonyear option:selected").val() != undefined) {
                ajax_update_database("get-schema-yield", {
                    "db": $("#db_table option:selected").val(),
                    "schema": $("#schema_table option:selected").val(),
                    "startdate": startdate,
                    "enddate": enddate,
                }).done(function (data) {

                    if ("success" in data) {
                        ajax_update_database("scale", {
                            "min": $("#var_table3 option:selected").val() == "GWAD" ? 73 : $("#var_table3 option:selected").val() == "WSGD" ? 0 : 0.06,
                            "max": $("#var_table3 option:selected").val() == "GWAD" ? 1462 : $("#var_table3 option:selected").val() == "WSGD" ? 954 : 1.36,
                        }).done(function (data1) {
                            if ("success" in data1) {
                                vectorLayer1.setSource(null);
                                //    vectorLayer2.setSource(null);
                                add_dssat(data, data1.scale);

                            } else {
                                $(".error").html('<h3>Error Retrieving the layer</h3>');
                            }
                        });
                    }
                });
            }
            var gid = $("#gid").val();
            if (gid == undefined || gid == "") gid = 'KE041';

            var point = $("#point-lat-lon").val();
            var polygon = $("#poly-lat-lon").val();
            //     generate_vic_graph("#vic_plotter_1", variable1, point, polygon);
            //     generate_vic_graph("#vic_plotter_2", variable2, point, polygon);

            generate_dssat_graph("#dssat_plotter_1", gid, $("#var_table3 option:selected").val());
            generate_dssat_graph("#dssat_plotter_2", gid, $("#var_table4 option:selected").val());

        });
        $("#seasonyear").change(function () {
            var startdate = "", enddate = "";
            if ($("#myonoffswitch").is(':checked')) {
                startdate = $("#seasonyear option:selected").val() + "-03-01";
                enddate = $("#seasonyear option:selected").val() + "-08-31";
            } else {
                startdate = $("#seasonyear option:selected").val() + "-10-01";
                enddate = (parseInt($("#seasonyear option:selected").val()) + 1) + "-02-28";

            }

            $("#time_table").val($("#seasonyear option:selected").val() + "-01-01").change();
            if ($("#seasonyear option:selected").val() != undefined) {


                ajax_update_database("get-schema-yield", {
                    "db": $("#db_table option:selected").val(),
                    "schema": $("#schema_table option:selected").val(),
                    "startdate": startdate,
                    "enddate": enddate,
                }).done(function (data) {
                    if ("success" in data) {
                        ajax_update_database("scale", {
                            "min": $("#var_table3 option:selected").val() == "GWAD" ? 73 : $("#var_table3 option:selected").val() == "WSGD" ? 0 : 0.06,
                            "max": $("#var_table3 option:selected").val() == "GWAD" ? 1462 : $("#var_table3 option:selected").val() == "WSGD" ? 954 : 1.36,
                        }).done(function (data1) {
                            if ("success" in data1) {
                                vectorLayer1.setSource(null);
                                // vectorLayer2.setSource(null);
                                add_dssat(data, data1.scale);
                            } else {
                                $(".error").html('<h3>Error Retrieving the layer</h3>');
                            }
                        });
                    }

                });
            }
            var gid = $("#gid").val();
            if (gid == undefined || gid == "") gid = 'KE041';

            var point = $("#point-lat-lon").val();
            var polygon = $("#poly-laft-lon").val();
            generate_vic_graph("#vic_plotter_1", variable1, "", polygon);
            generate_vic_graph("#vic_plotter_2", variable2, "", polygon);
            generate_dssat_graph("#dssat_plotter_1", gid, $("#var_table3 option:selected").val());
            generate_dssat_graph("#dssat_plotter_2", gid, $("#var_table4 option:selected").val());
            hideLoader();

        });
        $("#typeofchart").change(function () {
            var gid = $("#gid").val();
            if (gid == undefined || gid == "") gid = 'KE041';
            var polygon = $("#poly-lat-lon").val();
            //   generate_vic_graph("#vic_plotter_1", variable1, "",polygon);
            // generate_vic_graph("#vic_plotter_2", variable2, "",polygon);
            generate_dssat_graph("#dssat_plotter_1", gid, $("#var_table3 option:selected").val());
            generate_dssat_graph("#dssat_plotter_2", gid, $("#var_table4 option:selected").val());

        });


        $("#togglePanel").click(function () {


            if ($("#paramscontainer").css('display') == 'none') {
                $("#togglePanel").html("<span class=\"glyphicon glyphicon-chevron-left\"></span>");
                $("#togglePanel").css("left", "15%");
                $("#crow").css('margin-left', '6%');
                $("#mrow").css('margin-left', '6%');
                $("#paramscontainer").show();
                $("#mapcontainer").height("65vh");
                $("#mapcontainer1").height("65vh");
                $(".chartpanel").height("28vh");
                $("#mc").width("89.5%");

                $("#vic-plot-modal").height("27vh");
                $("#vic-plot-modal1").height("27vh");
                $("#vic-plot-modal2").height("27vh");
                $("#dssat-plot-modal").height("27vh");
                /*      $("#vic_plotter_1").height("300px");
                      $("#vic_plotter_2").height("300px");
                      $("#dssat_plotter_1").height("300px");
                      $("#dssat_plotter_2").height("300px");*/

            } else {
                $("#togglePanel").html("<span class=\"glyphicon glyphicon-chevron-right\"></span>");
                $("#togglePanel").css('margin-left', '0%');
                $("#togglePanel").css("left", "0%");
                $("#mc").width("100%");
                $("#paramscontainer").hide();
                /*  $("#mapcontainer").width("49%");
                   $("#mapcontainer1").width("49%");*/
                $("#mapcontainer").height("51vh");
                $("#mapcontainer1").height("51vh");
                $(".chartpanel").height("42vh");
                $("#vic-plot-modal").height("41vh");
                $("#vic-plot-modal1").height("41vh");
                $("#vic-plot-modal2").height("41vh");
                $("#dssat-plot-modal").height("41vh");
                $("#vic_plotter_1").height("97%");
                $("#vic_plotter_2").height("97%");
                $("#dssat_plotter_1").height("97%");
                $("#dssat_plotter_2").height("97%");
                $("#crow").css('margin-left', '20px');
                $("#mrow").css('margin-left', '20px');
            }


        });

        function readFile(evt) {
            var file = (evt.target.files)[0];
            var filename = file.name;
            var allowedExtensions = ['geojson'];
            var extension = filename.substr(filename.lastIndexOf('.') + 1).toLowerCase();
            if (allowedExtensions.indexOf(extension) === -1) {
                alert('Invalid file Format. Only ' + allowedExtensions.join(', ') + ' are allowed.');
                return false;
            }
            var r = new FileReader();
            r.onload = (function (file) {
                return function (e) {
                    var contents = e.target.result;
                    var vs = new ol.source.Vector({
                        features: (new ol.format.GeoJSON()).readFeatures(contents, {
                            featureProjection: 'EPSG:3857'
                        })
                    });
                    var style = new ol.style.Style({

                        stroke: new ol.style.Stroke({
                            color: 'white',
                            width: 1
                        }),
                        text: new ol.style.Text({
                            font: '12px Calibri,sans-serif',
                            fill: new ol.style.Fill({
                                color: 'green'
                            }),
                            stroke: new ol.style.Stroke({
                                color: 'pink',
                                width: 3
                            })
                        })
                    });


                    shapeFile = new ol.layer.Vector({
                        source: vs,
                        style: function (feature) {
                            style.getText().setText(feature.get('name'));
                            return style;
                        }
                    });
                    shapeFile.setZIndex(99999);
                    map.addLayer(shapeFile);
                    var res = JSON.parse(contents).features[0].geometry.coordinates[0];
                    var json_object = '{"type":"Polygon","coordinates":[' + JSON.stringify(res) + ']}';
                    var jobj = JSON.stringify(res);
                    generate_vic_graph("#vic_plotter_1", variable1, "", jobj);
                    generate_vic_graph("#vic_plotter_2", variable2, "", jobj);
                };
            })(file);
            r.readAsText(file);
        }

        var fileupload = $("#FileUpload1");
        var button = $("#drawUploadShapeFile");
        button.click(function () {
            fileupload.click();
        });
        fileupload.change(function (evt) {
            readFile(evt);
        });


    });

    function showLoader() {
        $('#loading').show();
    }

    function hideLoader() {
        $('#loading').hide();
    }

    function hideLoader1() {
        document.getElementById("chartloading1").style.display = "none";
    }

    function hideLoader2() {
        $('#chartloading2').hide();
    }

    function showLoader1() {
        document.getElementById("chartloading1").style.display = "block";
    }

    function showLoader2() {
        $('#chartloading2').show();
    }

    function showLoader3() {
        $('#chartloading3').show();
    }

    function showLoader4() {
        $('#chartloading4').show();
    }

    function hideLoader3() {
        $('#chartloading3').hide();
    }

    function hideLoader4() {
        $('#chartloading4').hide();
    }


// Strongly recommended: Hide loader after 20 seconds, even if the page hasn't finished loading
//setTimeout(hideLoader, 5 * 1000);
    return public_interface;

}()); // End of package wrapper
// NOTE: that the call operator (open-closed parenthesis) is used to invoke the library wrapper
// function immediately after being parsed.
