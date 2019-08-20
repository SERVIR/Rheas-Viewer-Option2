 var wms_url = $("#dssat").attr('data-geoserver-url');
 var date="";
   var xhr = ajax_update_database("dates1",{"variable":"albedo","region":"kenya_nowcast2","db":"rheassm"});
            xhr.done(function(data) {
                if("success" in data) {
                    var dates = data.dates;
                    console.log(dates);
                    date=dates[0][0];
                    console.log(date);
                } else {
                    console.log("error");

                }
            });
    var xhr = ajax_update_database("raster1",{"db":"rheassm","variable":"albedo","region":"kenya_nowcast2","date":date});
    console.log(date);
             xhr.done(function(data) {
                if("success" in data) {
                    add_wms(data);

                } else {
                    $(".error").html('<h3>Error Retrieving the layer</h3>');


                }
            });
 add_wms = function(data){
        // gs_layer_list.forEach(function(item){

        function get_cal(bounds){
            var layer_extent = bounds;
            var transformed_extent = ol.proj.transformExtent(layer_extent,'EPSG:4326','EPSG:3857');
            map.getView().fit(transformed_extent,map.getSize());
            map.updateSize();
        };

        map.removeLayer(wms_layer);
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

        wms_source = new ol.source.ImageWMS({
            url: wms_url,
            params: {'LAYERS':layer_name,'SLD_BODY':sld_string},
            serverType: 'geoserver',
            crossOrigin: 'Anonymous'
        });

        wms_layer = new ol.layer.Image({
            source: wms_source
        });

        map.addLayer(wms_layer);
        // var layer_extent = [11.3,-26.75,58.9,14.0];


    };
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
        var wms_source = new ol.source.ImageWMS();

        var wms_layer = new ol.layer.Image({
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


       var layers = [baseLayer,wms_layer,vector_layer];

        var map = new ol.Map({
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

