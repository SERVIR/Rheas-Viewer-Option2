 var wms_url = $("#dssat").attr('data-geoserver-url');
  var wfs_url = $("#dssat").attr('data-geoserverwfs-url');
 var wms_workspace = $("#dssat").attr('data-geoserver-workspace');
 var var_data = $("#variable").attr('data-variable-info');
 var_data = JSON.parse(var_data);
 var  rest_url = $("#variable").attr('data-rest-url');
 var date="";
 var projection = ol.proj.get('EPSG:3857');
    var baseLayer = new ol.layer.Tile({
         source: new ol.source.OSM()
    });
    var view = new ol.View({
        center: ol.proj.transform([39.669571,-4.036878], 'EPSG:4326','EPSG:3857'),
        projection: projection,
        zoom: 7
    });

    var vector_source = new ol.source.Vector({
        wrapX: false
    });

    var vector_layer = new ol.layer.Vector({
        name: 'my_vectorlayer',
        source: vector_source,
        style: new ol.style.Style({
            fill: new ol.style.Fill({
                color: 'rgba(255, 255, 255, 0.2)'
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


   var layers = [baseLayer,new ol.layer.Image({
        source: new ol.source.ImageWMS()
    }),vector_layer];

    var vicmap = new ol.Map({
        target: document.getElementById("vicmap"),
        layers: layers,
        view: view
    });




    var xhr = ajax_update_database("dates1",{"variable":"net_long","region":"kenya_tethys","db":"rheas"});
            xhr.done(function(data) {
                if("success" in data) {
                    var dates = data.dates;
                    console.log(dates);
                    date=dates.slice(-1)[0][1];
                    console.log(date);
                    var xhr1 = ajax_update_database("raster1",{"db":"rheas","variable":"net_long","region":"kenya_tethys","date":date});
                     xhr1.done(function(data) {
                        if("success" in data) {
                            add_wms_vic(data);
                        } else {
                            $(".error").html('<h3>Error Retrieving the layer</h3>');


                        }
                    });
                } else {
                    console.log("error");

                }
            });
            var yield_data;
            var store;
            function get_cal(bounds){
            console.log("from get cal");
            var layer_extent = bounds;
            var transformed_extent = ol.proj.transformExtent(layer_extent,'EPSG:4326','EPSG:3857');
            dssatmap.getView().fit(transformed_extent,dssatmap.getSize());
            dssatmap.updateSize();
            console.log("updated map");
     };
   function add_dssat(data){
        console.log("from dsat");

          yield_data = data.yield;
         store = data.storename;
         console.log("after bounds");
         var bbox = get_bounds1(wms_workspace,store,rest_url,get_cal);

            vectorLayer1.setSource(new ol.source.Vector({
                format: new ol.format.GeoJSON(),
                url: function(extent) {
                    return wfs_url+'?service=WFS&' +
                        'version=1.1.0&request=GetFeature&typename='+wms_workspace+':'+store+'&' +
                        'outputFormat=application/json&srsname=EPSG:3857&' +
                        'bbox=' + extent.join(',') + ',EPSG:3857';
                },
                strategy: ol.loadingstrategy.bbox,
                wrapX: false
            }));
     }
 var xhr=ajax_update_database("get-schema-yield",{"db":"rheas","schema":"kenya_tethys"});
            xhr.done(function(data) {
                if("success" in data) {
               add_dssat(data);
              } else {
            $(".error").append('<h3>Error Processing Request. Please be sure to select an area/schema with data.</h3>');
        }
});

//    ajax_update_database("get-schema-yield",{"db":"rheassm","schema":"kenya_nowcast2"}).done(function(data) {
//        if("success" in data) {
//               add_dssat(data);
//              } else {
//            $(".error").append('<h3>Error Processing Request. Please be sure to select an area/schema with data.</h3>');
//        }
//    }).error(function(){
//        console.log("error");
//    });

   var styleCache = {};
    var high = [64,196,64,0.81];
    var mid = [108,152,64,0.81];
    var low = [152,108,64,0.81];
    var poor = [196,32,32,0.81];
    var default_style = new ol.style.Style({
        fill: new ol.style.Fill({
            color: [250,250,250,1]
        }),
        stroke: new ol.style.Stroke({
            color: [220,220,220,1],
            width: 4
        })
    });
   function styleFunction(feature, resolution) {
        // get the incomeLevel from the feature properties
        var level = feature.getId().split(".")[1];
        if(yield_data != null){
            // var index = yield_data.findIndex(function(x) { return x[0]==level });
            var index = -1;
            for (var i = 0; i < yield_data.length; ++i) {
                if (yield_data[i][0] == level) {
                    index = i;
                    break;
                }
            }

            if (index=="-1") {
                return [default_style];
            }
            // check the cache and create a new style for the income
            // level if its not been created before.
            if (index!="-1") {
                var avg_val = yield_data[index][1];

                if(avg_val > 2000){
                    styleCache[index] = new ol.style.Style({
                        fill: new ol.style.Fill({
                            color: high
                        }),
                        stroke: new ol.style.Stroke({
                            color: '#030303',
                            width: 3
                        })
                    });
                }else if(avg_val > 1500 && avg_val < 2000){
                    styleCache[index] = new ol.style.Style({
                        fill: new ol.style.Fill({
                            color: mid
                        }),
                        stroke: new ol.style.Stroke({
                            color: '#030303',
                            width: 3
                        })
                    });
                }else if(avg_val > 1000 && avg_val < 1500){
                    styleCache[index] = new ol.style.Style({
                        fill: new ol.style.Fill({
                            color: low
                        }),
                        stroke: new ol.style.Stroke({
                            color: '#030303',
                            width: 3
                        })
                    });
                }else if(avg_val < 1000){
                    styleCache[index] = new ol.style.Style({
                        fill: new ol.style.Fill({
                            color: poor
                        }),
                        stroke: new ol.style.Stroke({
                            color: '#030303',
                            width: 3
                        })
                    });
                }

            }
            return [styleCache[index]];
        }else{
            return [default_style];
        }

    };

 get_bounds = function(ws,store,url,callback){
        // console.log(ws,store,url);
        var lastChar = url.substr(-1); // Selects the last character
        if (lastChar != '/') {         // If the last character is not a slash
            url = url + '/';            // Append a slash to it.
        }
        // var bbox_url = url+'workspaces/'+ws+'/coveragestores/'+store+'/coverages/'+store+'.xml';
        var bbox;

        var xhr = ajax_update_database("bounds1",{"url":url,"store":store,"workspace":ws,'type':'raster'});

        xhr.done(function(data) {
            if("success" in data) {
                callback(data.bounds);
            } else {
                console.log("not succes");
            }
        }).fail(function(){
        });

        return bbox;

    };
     get_bounds1 = function(ws,store,url,callback){
 console.log("from gbounds");
        // console.log(ws,store,url);
        var lastChar = url.substr(-1); // Selects the last character
        if (lastChar != '/') {         // If the last character is not a slash
            url = url + '/';            // Append a slash to it.
        }
        // var bbox_url = url+'workspaces/'+ws+'/coveragestores/'+store+'/coverages/'+store+'.xml';
        var bbox;

        var xhr = ajax_update_database("bounds1",{"url":url,"store":store,"workspace":ws,'type':'vector'});

        xhr.done(function(data) {
            console.log(data);
            if("success" in data) {
                callback(data.bounds);
            } else {
                console.log("not succes");
            }
        }).fail(function(xhr, status, error){
         var errorMessage = xhr.status + ': ' + xhr.statusText
         alert('Error - ' + errorMessage);
        });

        return bbox;

    };
 gen_color_bar = function(colors,scale){
        var cv  = document.getElementById('cv_vic'),
            ctx = cv.getContext('2d');
        ctx.clearRect(0,0,cv.width,cv.height);
        colors.forEach(function(color,i){
            ctx.beginPath();
            ctx.fillStyle = color;
            ctx.fillRect(i*15,0,15,20);
            ctx.fillText(scale[i].toFixed(),i*15,30);
        });

    };

    get_styling = function(variable,min,max,scale){

        //var index = variable_data.findIndex(function(x){return variable.includes(x["id"])});
        var index = find_var_index(variable,var_data);
        var start = var_data[index]["start"];
        var end = var_data[index]["end"];

        var sld_color_string = '';
        if(scale[scale.length-1] == 0){
            var colors = chroma.scale([start,start]).mode('lab').correctLightness().colors(20);
            gen_color_bar(colors,scale);
            var color_map_entry = '<ColorMapEntry color="'+colors[0]+'" quantity="'+scale[0]+'" label="label1" opacity="0.7"/>';
            sld_color_string += color_map_entry;
        }else{
            var colors = chroma.scale([start,end]).mode('lab').correctLightness().colors(20);
            gen_color_bar(colors,scale);
            colors.forEach(function(color,i){
                var color_map_entry = '<ColorMapEntry color="'+color+'" quantity="'+scale[i]+'" label="label'+i+'" opacity="0.7"/>';
                sld_color_string += color_map_entry;
            });
        }

        return sld_color_string
    };
 add_wms_vic = function(data){

        function get_cal(bounds){
            var layer_extent = bounds;
            var transformed_extent = ol.proj.transformExtent(layer_extent,'EPSG:4326','EPSG:3857');
            vicmap.getView().fit(transformed_extent,vicmap.getSize());
            vicmap.updateSize();
        };
        //vicmap.removeLayer(wms_layer);
        var layer_name = wms_workspace+":"+data.storename;
        var styling = get_styling(data.variable,data.min,data.max,data.scale);
        var bbox = get_bounds(wms_workspace,data.storename,rest_url,get_cal);
        var sld_string = '<StyledLayerDescriptor version="1.0.0"><NamedLayer><Name>'+layer_name+'</Name><UserStyle><FeatureTypeStyle><Rule>\
        <RasterSymbolizer> \
        <ColorMap type="ramp"> \
        <ColorMapEntry color="#f00" quantity="-9999" label="label0" opacity="0"/>'+
            styling+'</ColorMap>\
        </RasterSymbolizer>\
        </Rule>\
        </FeatureTypeStyle>\
        </UserStyle>\
        </NamedLayer>\
        </StyledLayerDescriptor>';
        var wms_source = new ol.source.ImageWMS({
            url: wms_url,
            params: {'LAYERS':layer_name,'SLD_BODY':sld_string},
            serverType: 'geoserver',
            crossOrigin: 'Anonymous'
        });
        var wms_layer = new ol.layer.Image({
            source: wms_source
        });
        vicmap.addLayer(wms_layer);
    };

 var  vectorLayer1 = new ol.layer.Vector({
            source: new ol.source.Vector(),
            style: styleFunction
        });
        var baseLayer1 = new ol.layer.Tile({
            source: new ol.source.OSM()
        });
        
 var dssatmap = new ol.Map({
    target: 'dssatmap',
    layers: [baseLayer1,vectorLayer1],
    view: new ol.View({
      center: ol.proj.transform([-90,34.7304], 'EPSG:4326','EPSG:3857'),
            projection: ol.proj.get('EPSG:3857'),
            zoom: 7
    })
  });

dssatmap.getView().on('change:resolution', (event) => {
    vicmap.setView(dssatmap.getView());
});
vicmap.getView().on('change:resolution', (event) => {
    dssatmap.setView(vicmap.getView());

});
