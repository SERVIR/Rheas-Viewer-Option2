     var element,
        $interactionModal,
        layers,
        map,
        popup,
        $plotModal,
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
        wms_source, gid,variable1,variable2
var selected=true;
    var yield_data;
    var store;
            var projection = ol.proj.get('EPSG:3857');

            var view = new ol.View({
            center: ol.proj.transform([39.669571, -1.036878], 'EPSG:4326', 'EPSG:3857'),
            projection: projection,
            zoom: 6
        });

var init_all = function () {
        init_jquery_vars();
        init_dropdown();
    };
  var   clear_coords = function () {
        $("#poly-lat-lon").val('');
        $("#point-lat-lon").val('');
    };

   var init_jquery_vars = function () {
        $interactionModal = $("#interaction-modal");
        $plotModal = $("#plot-modal");
        $vicplotModal = $("#vic-plot-modal");
        $vicplotModal1 = $("#vic-plot-modal1");
        $vicplotModal2 = $("#vic-plot-modal2");
        $vicplotModal3 = $("#vic-plot-modal3");

        var $var_element = $("#variable");
        variable_data = $var_element.attr('data-variable-info');
        variable_data = JSON.parse(variable_data);
        wms_url = $var_element.attr('data-geoserver-url');
        rest_url = $var_element.attr('data-rest-url');
        db_enabled=$var_element.attr('data-db-enabled');
        // wms_url = JSON.parse(wms_url);
        wms_workspace = $var_element.attr('data-geoserver-workspace');
        // wms_workspace = JSON.parse(wms_workspace);

    };

    init_dropdown = function () {
           $("#analysis").css("background-color","#ddd");
  $("#analysis").css("color","black");
         $(".db_table").select2();
        $(".schema_table").select2();

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
  init_all();


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
                    if($("#db_table option:selected").val()=="rheas")$("#schema_table").val("ken_tethys2");
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
                    $("#map_var_table").trigger('change');
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


  function showLoader() {
    $('#loading').show();
}
function hideLoader() {
    $('#loading').hide();
}
function hideLoader1() {
    document.getElementById("chartloading1").style.display="none";
}
function hideLoader2() {
    $('#chartloading2').hide();
}
function showLoader1() {
    document.getElementById("chartloading1").style.display="block";
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