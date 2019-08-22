 var wms_url = $("#dssat").attr('data-geoserver-url');
 var wms_workspace = $("#dssat").attr('data-geoserver-workspace');
 var var_data = $("#variable").attr('data-variable-info');
 var_data = JSON.parse(var_data);
 var  rest_url = $("#variable").attr('data-rest-url');
 var date="";
 var projection = ol.proj.get('EPSG:3857');
    var baseLayer = new ol.layer.Tile({
        source: new ol.source.BingMaps({
            key: '5TC0yID7CYaqv3nVQLKe~xWVt4aXWMJq2Ed72cO4xsA~ApdeyQwHyH_btMjQS1NJ7OHKY8BK-W-EMQMrIavoQUMYXeZIQOUURnKGBOC7UCt4',
            imagerySet: 'AerialWithLabels' // Options 'Aerial', 'AerialWithLabels', 'Road'
        })
    });
    var view = new ol.View({
        center: ol.proj.transform([39.669571,-4.036878], 'EPSG:4326','EPSG:3857'),
        projection: projection,
        zoom: 4
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
   var dssatmap = new ol.Map({
    target: 'dssatmap',
    layers: [
      new ol.layer.Tile({
        source: new ol.source.OSM()
      })
    ],
    view: new ol.View({
      center: ol.proj.fromLonLat([37.41, 8.82]),
      zoom: 4
    })
  });
    var xhr = ajax_update_database("dates1",{"variable":"albedo","region":"kenya_nowcast2","db":"rheassm"});
            xhr.done(function(data) {
                if("success" in data) {
                    var dates = data.dates;
                    console.log(dates);
                    date=dates.slice(-1)[0][1];
                    console.log(date);
                    var xhr1 = ajax_update_database("raster1",{"db":"rheassm","variable":"albedo","region":"kenya_nowcast2","date":date});
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

            }
        });

        return bbox;

    };
 gen_color_bar = function(colors,scale){
        var cv  = document.getElementById('cv'),
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
