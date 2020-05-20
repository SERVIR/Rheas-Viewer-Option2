
var temp='KE041';
  var poor = [153, 0, 0, 1];
    var low=[255, 128, 0, 1];
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
            var baseLayer = new ol.layer.Tile({
            //			source: new ol.source.BingMaps({
            //				key: '5TC0yID7CYaqv3nVQLKe~xWVt4aXWMJq2Ed72cO4xsA~ApdeyQwHyH_btMjQS1NJ7OHKY8BK-W-EMQMrIavoQUMYXeZIQOUURnKGBOC7UCt4',
            //				imagerySet: 'AerialWithLabels' // Options 'Aerial', 'AerialWithLabels', 'Road'
            //			})

            source: new ol.source.XYZ({
                attributions: 'Tiles © <a href="https://services.arcgisonline.com/ArcGIS/' +
                    'rest/services/World_Topo_Map/MapServer">ArcGIS</a>',
                url: 'https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Light_Gray_Base/MapServer/tile/{z}/{y}/{x}'
            })

        });
  var vectorLayer1 = new ol.layer.Vector({
            source: new ol.source.Vector({
                features: (new ol.format.GeoJSON()).readFeatures(boundaries, {
                    featureProjection: 'EPSG:3857'
                })
            }),
            style: styleFunction
        });
var  map1 = new ol.Map({
            target: document.getElementById("map1"),
            layers: [baseLayer],
            view: view
        });
map1.addLayer(vectorLayer1);
  vectorLayer1.setZIndex(3);
  vectorLayer1.setZoomLevel(5);
        map1.crossOrigin = 'anonymous';


           var  select_interaction = new ol.interaction.Select();
    map1.addInteraction(select_interaction);
     var tooltip = document.getElementById('tooltip11');
    var overlayt = new ol.Overlay({
                    element: tooltip,
                    offset: [0, 0],
                    positioning: 'bottom-left'

                });
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
    });
    selectedFeatures = select_interaction.getFeatures();

    selectedFeatures.on('add', function (event) {
        try {

            $(".error").html('');
            var feature = event.target.item(0);
            var res = feature.getGeometry().getCoordinates()[0];
            var result = res[0].map(coord => {
                return ol.proj.transform(coord, 'EPSG:3857', 'EPSG:4326');
            });
            var json_object = '{"type":"Polygon","coordinates":[' + JSON.stringify(result) + ']}';
            // $("#poly-lat-lon").val(json_object);
            $("#poly-lat-lon").val(JSON.stringify(result));

            var gid = feature.getProperties().countyid;//feature.getId().split(".")[1];
            $("#gid").val(gid);
            var schema = $("#schema_table option:selected").val();

            $("#gid").val(gid);
            $("#schema").val(schema);
            var xhr = ajax_update_database("get-ensemble", {
                "db": $("#db_table option:selected").val(),
                "gid": gid,
                "schema": $("#schema_table option:selected").val()
            });
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
        //hover to click
        if (event != undefined) {
            var gid = event.target.item(0).getProperties().countyid;//evt.selected[0].getId().split(".")[1];
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
            ajax_update_database("get-schema-yield-gid", {
                "db": $("#db_table option:selected").val(),
                "schema": $("#schema_table option:selected").val(),
                "gid": gid,
                "startdate": startdate,
                "enddate": enddate
            }).done(function (data) {
                if ("success" in data) {
                    ajax_update_database("get-county", {
                        "db": $("#db_table option:selected").val(),
                        "gid": gid,
                        "schema": $("#schema_table option:selected").val(),
                    }).done(function (data1) {

                        if ("success" in data1) {
                            county_name = data1["county"].length > 0 ? data1["county"][0][0] : "Unknown";
                            if (data.yield[0]) {
                                yield_val = Math.round(data.yield[0][3]).toFixed(2);

                                document.getElementById("tooltip11").style.display = data.yield[0][3] ? 'block' : 'none';
                            }
                            document.getElementById("tooltip11").innerHTML = "County: " + county_name + "<br>" + "Yield: " + yield_val + " kg/ha";
                            //    overlayt.setPosition(ol.proj.transform(event.coordinate, 'EPSG:3857', 'EPSG:4326'));

                            map1.addOverlay(overlayt);


                        }
                    });


                } else {
                    console.log("error");
                }
            });

        } else {
            document.getElementById("tooltip11").style.display = 'none';
        }
    });

       map1.on("singleclick", function (evt) {
            selected = false;
        });

           gen_color_bar = function (colors, scale, cv, variable) {
        var cv = document.getElementById(cv),
            ctx = cv.getContext('2d');
        ctx.clearRect(0, 0, cv.width, cv.height);
        var k = 0;
        var j = 1;
        colors.forEach(function (color, i) {
            ctx.beginPath();
            ctx.fillStyle = color;
            if (variable == "dssat") {
                ctx.fillRect(0, i * 45, 25, 50);
                 ctx.fillStyle = "white";

                ctx.fillText("high", 35, 10);
                ctx.fillText("mid", 35, 110);
                                 ctx.fillText("poor", 35, 230);

            }
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
   function add_dssat(data, scale) {
        yield_data = data.yield;
        store = data.storename;
        var styling = get_styling("dssat", scale, 'cv_dssat');
        //  var bbox = get_bounds1(wms_workspace, store, rest_url, get_cal);
         vectorLayer1 = new ol.layer.Vector({
            source: new ol.source.Vector({
                features: (new ol.format.GeoJSON()).readFeatures(boundaries, {
                    featureProjection: 'EPSG:3857'
                })
            }),
            style: styleFunction
        });
    }

        $('#dssatslider').change(function (e) {
            vectorLayer1.setOpacity(this.value);
        }).change();

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
                }

                 if (level == temp & index != -1) {
                styleCache[index] = new ol.style.Style({
                    stroke: new ol.style.Stroke({
                        color: 'rgba(0, 0, 255, 1)',
                        width: 3
                    }),
                    // fill: new ol.style.Fill({
                    //     color: 'rgba(0,0,255,0)'
                    // })
                });
            }
            }
            return [styleCache[index]];
        } else {
            return [default_style];
        }


    };



