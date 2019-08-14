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

var LIBRARY_OBJECT = (function() {
    // Wrap the library in a package function
    "use strict"; // And enable strict mode for this library

    /************************************************************************
     *                      MODULE LEVEL / GLOBAL VARIABLES
     *************************************************************************/
    var current_layer,
        element,
        $interactionModal,
        layers,
        map,
        popup,
        $plotModal,
        public_interface,			// Object returned by the module
        rest_url,
        variable_data,
        $vicplotModal,
        wms_workspace,
        wms_url,
        wms_layer,
        wms_source;



    /************************************************************************
     *                    PRIVATE FUNCTION DECLARATIONS
     *************************************************************************/
    var add_wms,
        clear_coords,
        get_bounds,
        get_plot,
        get_styling,
        gen_color_bar,
        init_events,
        init_jquery_vars,
        init_dropdown,
        init_all,
        init_map;


    /************************************************************************
     *                    PRIVATE FUNCTION IMPLEMENTATIONS
     *************************************************************************/

    clear_coords = function(){
        $("#poly-lat-lon").val('');
        $("#point-lat-lon").val('');
    };

    init_jquery_vars = function(){
        $interactionModal = $("#interaction-modal");
        $plotModal = $("#plot-modal");
        $vicplotModal = $("#vic-plot-modal");
        var $var_element = $("#variable");
        variable_data = $var_element.attr('data-variable-info');
        variable_data = JSON.parse(variable_data);
        wms_url = $var_element.attr('data-geoserver-url');
        rest_url = $var_element.attr('data-rest-url');
        // wms_url = JSON.parse(wms_url);
        wms_workspace = $var_element.attr('data-geoserver-workspace');
        // wms_workspace = JSON.parse(wms_workspace);
    };

    init_dropdown = function () {
        $(".db_table").select2();
        $(".schema_table").select2();
        $(".var_table").select2();
        $(".time_table").select2();

        $(".interaction").select2();
        $(".region_table_plot").select2();
        $(".variable_table_plot").select2();
        $(".date_table_plot").select2();
    };

    init_map = function() {
        var projection = ol.proj.get('EPSG:3857');
        var baseLayer = new ol.layer.Tile({
            source: new ol.source.BingMaps({
                key: '5TC0yID7CYaqv3nVQLKe~xWVt4aXWMJq2Ed72cO4xsA~ApdeyQwHyH_btMjQS1NJ7OHKY8BK-W-EMQMrIavoQUMYXeZIQOUURnKGBOC7UCt4',
                imagerySet: 'AerialWithLabels' // Options 'Aerial', 'AerialWithLabels', 'Road'
            })
        });
        var fullScreenControl = new ol.control.FullScreen();
        var view = new ol.View({
            center: ol.proj.transform([39.669571,-4.036878], 'EPSG:4326','EPSG:3857'),
            projection: projection,
            zoom: 4
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


        layers = [baseLayer,wms_layer,vector_layer];

        map = new ol.Map({
            target: document.getElementById("map"),
            layers: layers,
            view: view
        });

  

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
                    vector_source.clear();
                });

            }

        };

        vector_layer.getSource().on('addfeature', function(event){
            //Extracting the point/polygon values from the drawn feature
            var feature_json = saveData();
            var parsed_feature = JSON.parse(feature_json);
            var feature_type = parsed_feature["features"][0]["geometry"]["type"];
	        console.log("add feat");
            if (feature_type == 'Point'){
            console.log("from point");

                $plotModal.find('.info').html('');
                var coords = parsed_feature["features"][0]["geometry"]["coordinates"];
            console.log(coords);
                var proj_coords = ol.proj.transform(coords, 'EPSG:3857','EPSG:4326');
                $("#point-lat-lon").val(proj_coords);
                $plotModal.find('.info').html('<b>You have selected a point at '+proj_coords[1].toFixed(2)+','+proj_coords[0].toFixed(2)+'. Click on Show plot to view the Time series.</b>');
                $plotModal.modal('show');
            } else if (feature_type == 'Polygon'){
            console.log("from polygon");
                $plotModal.find('.info').html('');
                var coords = parsed_feature["features"][0]["geometry"]["coordinates"][0];
                proj_coords = [];
                coords.forEach(function (coord) {
                    var transformed = ol.proj.transform(coord,'EPSG:3857','EPSG:4326');
                    proj_coords.push('['+transformed+']');
                });
            console.log(proj_coords);

                var json_object = '{"type":"Polygon","coordinates":[['+proj_coords+']]}';
                $("#poly-lat-lon").val(json_object);
                $plotModal.find('.info').html('<b>You have selected the following polygon object '+proj_coords+'. Click on Show plot to view the Time series.</b>');
                $plotModal.modal('show');
            }
get_plot();
        });

        function saveData() {
            // get the format the user has chosen
            var data_type = 'GeoJSON',
                // define a format the data shall be converted to
                format = new ol.format[data_type](),
                // this will be the data in the chosen format
                data;
            try {
                // convert the data of the vector_layer into the chosen format
                data = format.writeFeatures(vector_layer.getSource().getFeatures());
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
            if(featureType == 'None'){
                $('#data').val('');
                clear_coords();
                map.removeInteraction(draw);
                vector_layer.getSource().clear();
            }else if(featureType == 'Point')
            {
console.log("jhkjh");
                clear_coords();
                addInteraction(featureType);
            }else if(featureType == 'Polygon'){
                clear_coords();
                addInteraction(featureType);
            }
            $interactionModal.modal('hide');
        }).change();

    };



    init_events = function(){
    

        map.on("singleclick",function(evt){

            $(element).popover('destroy');


            if (map.getTargetElement().style.cursor == "pointer"  && $("#interaction-type").find('option:selected').val()=="None") {
                var clickCoord = evt.coordinate;
                popup.setPosition(clickCoord);
                var view = map.getView();
                var viewResolution = view.getResolution();

                var wms_url = current_layer.getSource().getGetFeatureInfoUrl(evt.coordinate, viewResolution, view.getProjection(), {'INFO_FORMAT': 'application/json'}); //Get the wms url for the clicked point

                if (wms_url) {
                    //Retrieving the details for clicked point via the url
                    $.ajax({
                        type: "GET",
                        url: wms_url,
                        dataType: 'json',
                        success: function (result) {
                            var value = parseFloat(result["features"][0]["properties"]["GRAY_INDEX"]);
                            value = value.toFixed(2);
                            $(element).popover({
                                'placement': 'top',
                                'html': true,
                                //Dynamically Generating the popup content
                                'content':'Value: '+value
                            });

                            $(element).popover('show');
                            $(element).next().css('cursor', 'text');


                        },
                        error: function (XMLHttpRequest, textStatus, errorThrown) {
                            console.log(Error);
                        }
                    });
                }
            }
        });

        map.on('pointermove', function(evt) {
            if (evt.dragging) {
                return;
            }
            var pixel = map.getEventPixel(evt.originalEvent);
            var hit = map.forEachLayerAtPixel(pixel, function(layer) {
                if (layer != layers[0] && layer != layers[2]){
                    current_layer = layer;
                    return true;}
            });
            map.getTargetElement().style.cursor = hit ? 'pointer' : '';
        });

    };

    init_all = function(){
        init_jquery_vars();
        init_dropdown();
        init_map();
        init_events();
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

    get_bounds = function(ws,store,url,callback){
        // console.log(ws,store,url);
        var lastChar = url.substr(-1); // Selects the last character
        if (lastChar != '/') {         // If the last character is not a slash
            url = url + '/';            // Append a slash to it.
        }
        // var bbox_url = url+'workspaces/'+ws+'/coveragestores/'+store+'/coverages/'+store+'.xml';
        var bbox;

        var xhr = ajax_update_database("bounds",{"url":url,"store":store,"workspace":ws,'type':'raster'});

        xhr.done(function(data) {
            if("success" in data) {
                callback(data.bounds);
            } else {

            }
        });

        return bbox;

    };

    get_styling = function(variable,min,max,scale){

        //var index = variable_data.findIndex(function(x){return variable.includes(x["id"])});
        var index = find_var_index(variable,variable_data);
        var start = variable_data[index]["start"];
        var end = variable_data[index]["end"];

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

    get_plot = function(){
console.log("from get plot");
        var db = $("#db_table option:selected").val();
        var region = $("#schema_table option:selected").val();
        var variable = $("#var_table option:selected").val();
        var point = $("#point-lat-lon").val();
        var polygon = $("#poly-lat-lon").val();
console.log(point);
console.log(polygon);
console.log(variable);
        var xhr = ajax_update_database("get-vic-plot",{"db":db,"region":region,"variable":variable,"point":point,"polygon":polygon});
        xhr.done(function(data) {
            $vicplotModal.find('.info').html('');
            $vicplotModal.find('.warning').html('');
            $vicplotModal.find('.table').html('');
	
            if("success" in data) {
                if(data.interaction == "point" || data.interaction == "polygon"){
                    //var index = variable_data.findIndex(function(x){return variable.includes(x["id"])});
                    var index = find_var_index(variable,variable_data);
                    var display_name = variable_data[index]["display_name"];
                    var units = variable_data[index]["units"];
                    $("#plotter").highcharts({
                        chart: {
                            type:'area',
                            zoomType: 'x'
                        },
                        title: {
                            text:display_name+" for "+region
                            // style: {
                            //     fontSize: '13px',
                            //     fontWeight: 'bold'
                            // }
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
                                text: units
                            }

                        },
                        exporting: {
                            enabled: true
                        },
                        series: [{
                            data:data.time_series,
                            name: display_name
                        }]
                    });
                    $vicplotModal.find('.table').append('<thead></thead><tr><th>Mean</th><th>Standard Deviation</th><th>Minimum</th><th>Maximum</th></tr></thead>');
                    $vicplotModal.find('.table').append('<tr><td>'+data.mean+'</td><td>'+data.stddev+'</td><td>'+data.min+'</td><td>'+data.max+'</td></tr>');
                    $("#plotter").removeClass('hidden');
                    $("#summary").removeClass('hidden');


                }

            } else {
                $vicplotModal.find('.warning').html('<b>'+data.error+'</b>');
                console.log(data.error);

            }
        });
    };

    

    /************************************************************************
     *                        DEFINE PUBLIC INTERFACE
     *************************************************************************/

    public_interface = {

    };

    /************************************************************************
     *                  INITIALIZATION / CONSTRUCTOR
     *************************************************************************/

    // Initialization: jQuery function that gets called when
    // the DOM tree finishes loading
    $(function() {
        init_all();
           $('#vicslider').change(function(e){
           // alert("vic moved");
            current_layer.setOpacity(0.3);
        });
             $('#dssatslider').change(function(e){
          //  alert("dssat moved");
        });
        $("#interaction").on('click',function(){
            $interactionModal.modal('show');
        });
         $("#db_table").change(function(){
            var db = $("#db_table option:selected").val();
            $("#schema_table").html('');

            var xhr = ajax_update_database("schemas",{"db":db});
            xhr.done(function(data) {
                if("success" in data) {
                    var schemas = data.schemas;
                    schemas.forEach(function(schema,i){
                        var new_option = new Option(schema,schema);
                        if(i==0){
                            $("#schema_table").append(new_option).trigger('change');
                        }else{
                            $("#schema_table").append(new_option);
                        }
                    });
                    // variables.forEach(function(variable,i){
                    //     var new_option = new Option(variable,variable);
                    //     $("#variable_table_plot").append(new_option);
                    // });

                } else {
                    console.log("error");

                }
            });

        }).change();

        $("#schema_table").change(function(){
            var db = $("#db_table option:selected").val();
            var region = $("#schema_table option:selected").val();
            $("#var_table").html('');
            $("#variable_table_plot").html('');
            var xhr = ajax_update_database("variables",{"region":region,"db":db});
            xhr.done(function(data) {
                if("success" in data) {
			console.log(data.variables);
                    var variables = data.variables;
                    variables.forEach(function(variable,i){
                        var new_option = new Option(variable,variable);
                        if(i==0){
                            $("#var_table").append(new_option).trigger('change');
                        }else{
                            $("#var_table").append(new_option);
                        }
                    });
                    variables.forEach(function(variable,i){
                        var new_option = new Option(variable,variable);
                        $("#variable_table_plot").append(new_option);
                    });

                } else {
                    console.log("error");

                }
            });

        }).change();

        $("#var_table").change(function(){
            var db = $("#db_table option:selected").val();
            var variable = $("#var_table option:selected").val();
            var region = $("#schema_table option:selected").val();

            var xhr = ajax_update_database("dates",{"variable":variable,"region":region,"db":db});
            xhr.done(function(data) {
                if("success" in data) {
                    var dates = data.dates;
                    $("#time_table").html('');
                    dates.forEach(function(date,i){
                        var new_option = new Option(date[0],date[1]);
                        if(i==0){
                            $("#time_table").append(new_option).trigger('change');
                        }else{
                            $("#time_table").append(new_option);
                        }
                    });

                } else {
                    console.log("error");

                }
            });

        });

        $("#time_table").change(function(){
            var db = $("#db_table option:selected").val();
            var variable = $("#var_table option:selected").val();
            var region = $("#schema_table option:selected").val();
            var date = $("#time_table option:selected").val();
            $(".error").html('');
         
            var xhr = ajax_update_database("raster",{"db":db,"variable":variable,"region":region,"date":date});

            xhr.done(function(data) {
                if("success" in data) {
                    add_wms(data);

                } else {
                    $(".error").html('<h3>Error Retrieving the layer</h3>');


                }
            });

        });


    });

    return public_interface;

}()); // End of package wrapper
// NOTE: that the call operator (open-closed parenthesis) is used to invoke the library wrapper
// function immediately after being parsed.
