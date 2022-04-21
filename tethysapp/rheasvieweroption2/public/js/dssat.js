$("#home").css("background-color","#ddd");
 $("#home").css("color","black");

var wms_url = $("#dssat").attr('data-geoserver-url');
var wfs_url = $("#dssat").attr('data-geoserverwfs-url');
var wms_workspace = $("#dssat").attr('data-geoserver-workspace');
var var_data = $("#variable").attr('data-variable-info');
var_data = JSON.parse(var_data);
var rest_url = $("#variable").attr('data-rest-url');
var date = "";
var projection = ol.proj.get('EPSG:3857');
var baseLayer = new ol.layer.Tile({
			source: new ol.source.XYZ({
                attributions: 'Tiles © <a href="https://services.arcgisonline.com/ArcGIS/' +
                    'rest/services/World_Topo_Map/MapServer">ArcGIS</a>',
                url: 'https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Light_Gray_Base/MapServer/tile/{z}/{y}/{x}'
            })});
var view = new ol.View({
	center: ol.proj.transform([39.669571, -1.036878], 'EPSG:4326', 'EPSG:3857'),
	projection: projection,
	zoom: 6
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


var layers = [baseLayer, new ol.layer.Image({
	source: new ol.source.ImageWMS()
}), vector_layer];

var vicmap = new ol.Map({
	target: document.getElementById("vicmap"),
	layers: layers,
	view: view
});


	var xhr = ajax_update_database("dates", {
		"variable": "soil_moist",
		"region": "ken_n_25",
		"db": "kenya"
	});

	xhr.done(function (data) {
		if ("dates" in data) {
			var dates = data.dates;
			date = dates[0];
			document.getElementById("vicdate").innerHTML = dates[0];
			var index = find_var_index("soil_moist_4", var_data);
			var min = var_data[index]["min"];
			var max = var_data[index]["max"];

			add_wms_vic(data, date);
		} else {
			console.log("error");

		}
	}).fail(function(xhr, status, error) {
            alert(error);
            hideLoader();
        });



var yield_data;
var store;

function get_cal(bounds) {
	var layer_extent = bounds;
	var transformed_extent = ol.proj.transformExtent(layer_extent, 'EPSG:4326', 'EPSG:3857');
	dssatmap.getView().fit(transformed_extent, dssatmap.getSize());
	dssatmap.updateSize();
};

function add_dssat(data, scale) {
	yield_data = data.yield;
	document.getElementById("dssatdate").innerHTML=yield_data[yield_data.length-1][3];
	store = data.storename;
	var styling = get_styling("dssat", scale, 'curr_dssat');
	var bbox = get_bounds1(wms_workspace, store, rest_url, get_cal);

	vectorLayer1.setSource(new ol.source.Vector({
		   features: (new ol.format.GeoJSON()).readFeatures(boundaries, {
                featureProjection: 'EPSG:3857'
            })

	}));
		vectorLayer2.setSource(new ol.source.Vector({
		   features: (new ol.format.GeoJSON()).readFeatures(tanz, {
                featureProjection: 'EPSG:3857'
            })

	}));
		vectorLayer3.setSource(new ol.source.Vector({
		   features: (new ol.format.GeoJSON()).readFeatures(rwa, {
                featureProjection: 'EPSG:3857'
            })

	}));
		vectorLayer4.setSource(new ol.source.Vector({
		   features: (new ol.format.GeoJSON()).readFeatures(uga, {
                featureProjection: 'EPSG:3857'
            })

	}));
		vectorLayer5.setSource(new ol.source.Vector({
		   features: (new ol.format.GeoJSON()).readFeatures(eth, {
                featureProjection: 'EPSG:3857'
            })

	}));




}

//need to have this block when you add dssat in current page
// var xhr = ajax_update_database("get-schema-yield-home", {
// 	"db": "kenya",
// 	"schema": "ken_n_25",
// 	  "startdate": "",
//                     "enddate": "",
//
// });
// xhr.done(function (data) {
// 	if ("success" in data) {
// 		ajax_update_database("scale1", {
// 			"min": 300,
// 			"max": 3500,
// 		}).done(function (data1) {
// 			if ("success" in data1) {
// 				add_dssat(data, data1.scale);
// 			} else {
// 				$(".error").html('<h3>Error Retrieving the layer</h3>');
// 			}
//
// 		});
// 	} else {
// 		$(".error").append('<h3>Error Processing Request. Please be sure to select an area/schema with data.</h3>');
// 	}
// });

var styleCache = {};
   var poor = [153, 0, 0, 0.81];
    var low=[255, 128, 0, 0.81];
    var mid = [255, 255, 0, 0.81];
    var much = [128, 192, 0, 0.81];
    var high = [0, 128, 0, 0.81];
var default_style = new ol.style.Style({
	fill: new ol.style.Fill({
		color: [250, 250, 250, 1]
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

function styleFunction(feature, resolution) {
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
			var avg_val = yield_data[index][2];

			if (avg_val >= 2.0) {
				styleCache[index] = new ol.style.Style({
					fill: new ol.style.Fill({
						color: high
					}),
					stroke: new ol.style.Stroke({
						color: '#030303',
						width: 1
					})
				});
			} else if (avg_val > 0.8 && avg_val <= 1.9) {
				styleCache[index] = new ol.style.Style({
					fill: new ol.style.Fill({
						color: much
					}),
					stroke: new ol.style.Stroke({
						color: '#030303',
						width: 1
					})
				});
			} else if (avg_val > 0.4 && avg_val <= 0.8) {
				styleCache[index] = new ol.style.Style({
					fill: new ol.style.Fill({
						color: mid
					}),
					stroke: new ol.style.Stroke({
						color: '#030303',
						width: 1
					})
				});
			} else if (avg_val > 0.0 && avg_val <= 0.4) {
				styleCache[index] = new ol.style.Style({
					fill: new ol.style.Fill({
						color: low
					}),
					stroke: new ol.style.Stroke({
						color: '#030303',
						width: 1
					})
				});
			}
			else if (avg_val < 0.0) {
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

		}
		return [styleCache[index]];
	} else {
		return [default_style];
	}

};

  function styleFunctionBoundaries(feature, resolution) {
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


			  styleCache[index] = new ol.style.Style({

				  stroke: new ol.style.Stroke({
					  color: [97, 97, 97, 1],
					  width: 1
				  })
			  });


		  return [styleCache[index]];
	  }
	  return [default_sty];
  };



get_bounds = function (ws, store, url, callback) {
	// console.log(ws,store,url);
	var lastChar = url.substr(-1); // Selects the last character
	if (lastChar != '/') { // If the last character is not a slash
		url = url + '/'; // Append a slash to it.
	}
	// var bbox_url = url+'workspaces/'+ws+'/coveragestores/'+store+'/coverages/'+store+'.xml';
	var bbox;

	var xhr = ajax_update_database("bounds1", {
		"url": url,
		"store": store,
		"workspace": ws,
		'type': 'raster'
	});

	xhr.done(function (data) {
		if ("success" in data) {
			callback(data.bounds);
		} else {
			console.log("not succes");
		}
	}).fail(function () {});

	return bbox;

};
get_bounds1 = function (ws, store, url, callback) {
	// console.log(ws,store,url);
	var lastChar = url.substr(-1); // Selects the last character
	if (lastChar != '/') { // If the last character is not a slash
		url = url + '/'; // Append a slash to it.
	}
	// var bbox_url = url+'workspaces/'+ws+'/coveragestores/'+store+'/coverages/'+store+'.xml';
	var bbox;

	var xhr = ajax_update_database("bounds1", {
		"url": url,
		"store": store,
		"workspace": ws,
		'type': 'vector'
	});

	xhr.done(function (data) {
		if ("success" in data) {
			callback(data.bounds);
		} else {
			console.log("not succes");
		}
	}).fail(function (xhr, status, error) {
		var errorMessage = xhr.status + ': ' + xhr.statusText
		alert('Error - ' + errorMessage);
	});

	return bbox;

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
            ctx.fillRect(0, i * 45, 25, 50);
                    ctx.fillStyle = "white";

                    ctx.fillText("high", 35, 10);
                    ctx.fillText("mid", 35, 110);
                    ctx.fillText("poor", 35, 230);
            }
        });

};

get_styling = function (variable, scale, cv) {

  var index = find_var_index(variable, var_data);
        var color1 = var_data[index]["color1"];
        var color2 = var_data[index]["color2"];
        var color3 = var_data[index]["color3"];
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

add_kenya=function (variable) {
	var style = "cwg";
	var l = variable.split('_')[0]+'_'+variable.split('_')[1];
	wms_source = new ol.source.ImageWMS({
			url: 'https://thredds.servirglobal.net/thredds/wms/rheas/nc/kenya/' + variable.split('_')[0]+'_'+variable.split('_')[1] + '_final.nc?',
			params: {
				'LAYERS': l,
				// 'TIME': time,
				'STYLES': 'boxfill/' + style,
				'ABOVEMAXCOLOR': 'extend',
				'BELOWMINCOLOR': 'extend',
				'COLORSCALERANGE': 'auto',
				//'SLD_BODY': sld_string
			},
			crossOrigin: 'Anonymous'
		});
		wms_layer = new ol.layer.Image({
			source: wms_source,
			id: "viclayer",
		});

		wms_layer.setZIndex(2);
		vicmap.addLayer(wms_layer);
				var link = 'https://thredds.servirglobal.net/thredds/wms/rheas/nc/kenya/' + variable.split('_')[0] +'_'+variable.split('_')[1]+ '_final.nc' + "?SERVICE=WMS&VERSION=1.3.0&time=" + time + "&REQUEST=GetLegendGraphic&LAYER=" + variable.split('_')[0] +'_'+variable.split('_')[1] + "&colorscalerange=" + range + "&PALETTE=" + style + "&transparent=TRUE";
		//   map.addLayer(boundaryLayer);
		var div = document.getElementById("vic_legend");
		div.innerHTML =
			'<img src="' + link + '" alt="legend">';
};

add_eth=function (variable) {
	var style = "cwg";
			var l = variable.split('_')[0]+'_'+variable.split('_')[1];
	console.log(l);
	var wms_source = new ol.source.ImageWMS({
			url: 'https://thredds.servirglobal.net/thredds/wms/rheas/nc/ethiopia/' + variable.split('_')[0]+'_'+variable.split('_')[1] + '_final.nc?',
			params: {
				'LAYERS': l,
				// 'TIME': time,
				'STYLES': 'boxfill/' + style,
				'ABOVEMAXCOLOR': 'extend',
				'BELOWMINCOLOR': 'extend',
				'COLORSCALERANGE': 'auto',
				//'SLD_BODY': sld_string
			},
			crossOrigin: 'Anonymous'
		});
		var wms_layer = new ol.layer.Image({
			source: wms_source,
			id: "viclayer1",
		});

		wms_layer.setZIndex(3);
		vicmap.addLayer(wms_layer);

};
add_tza=function (variable) {
	var style = "cwg";

};
add_uga=function (variable) {
	var style = "cwg";

};
add_rwa=function (variable) {
	var style = "cwg";
};



add_wms_vic = function (data,date) {
	try {
		var variable = "soil_moist_4";
		var index = find_var_index(variable, var_data);

		var style = "cwg";
		var range = Math.round(var_data[index]["min"]).toFixed(2) + "," + Math.round(var_data[index]["max"]).toFixed(2);

		var time = date + 'T00:00:00.000Z';
		var l = variable.split('_')[0]+'_'+variable.split('_')[1];

		add_kenya(variable);
		add_eth(variable);


		var vectorLayerBoundaries = new ol.layer.Vector({
			source: new ol.source.Vector(),
			style: styleFunctionBoundaries
		});
		vectorLayerBoundaries.setSource(new ol.source.Vector({
			features: (new ol.format.GeoJSON()).readFeatures(boundaries, {
				featureProjection: 'EPSG:3857'
			})
		}));
		vectorLayerBoundaries.setZIndex(Infinity);
		vicmap.addLayer(vectorLayerBoundaries);


				var vectorLayerBoundaries1 = new ol.layer.Vector({
			source: new ol.source.Vector(),
			style: styleFunctionBoundaries
		});
		vectorLayerBoundaries1.setSource(new ol.source.Vector({
			features: (new ol.format.GeoJSON()).readFeatures(tanz, {
				featureProjection: 'EPSG:3857'
			})
		}));
		vectorLayerBoundaries1.setZIndex(Infinity);
		vicmap.addLayer(vectorLayerBoundaries1);

						var vectorLayerBoundaries2 = new ol.layer.Vector({
			source: new ol.source.Vector(),
			style: styleFunctionBoundaries
		});
		vectorLayerBoundaries2.setSource(new ol.source.Vector({
			features: (new ol.format.GeoJSON()).readFeatures(rwa, {
				featureProjection: 'EPSG:3857'
			})
		}));
		vectorLayerBoundaries2.setZIndex(Infinity);
		vicmap.addLayer(vectorLayerBoundaries2);

				var vectorLayerBoundaries3 = new ol.layer.Vector({
			source: new ol.source.Vector(),
			style: styleFunctionBoundaries
		});
		vectorLayerBoundaries3.setSource(new ol.source.Vector({
			features: (new ol.format.GeoJSON()).readFeatures(uga, {
				featureProjection: 'EPSG:3857'
			})
		}));
		vectorLayerBoundaries3.setZIndex(Infinity);
		vicmap.addLayer(vectorLayerBoundaries3);

				var vectorLayerBoundaries4 = new ol.layer.Vector({
			source: new ol.source.Vector(),
			style: styleFunctionBoundaries
		});
		vectorLayerBoundaries4.setSource(new ol.source.Vector({
			features: (new ol.format.GeoJSON()).readFeatures(eth, {
				featureProjection: 'EPSG:3857'
			})
		}));
		vectorLayerBoundaries4.setZIndex(Infinity);
		vicmap.addLayer(vectorLayerBoundaries4);
		hideLoader();
	}
	catch(err){
		alert("There is no Soil Moist data");
		hideLoader();
	}

};

var vectorLayer1 = new ol.layer.Vector({
	source: new ol.source.Vector(),
	style: styleFunction
});
var vectorLayer2 = new ol.layer.Vector({
	source: new ol.source.Vector(),
	style: styleFunction
});
var vectorLayer3 = new ol.layer.Vector({
	source: new ol.source.Vector(),
	style: styleFunction
});
var vectorLayer4 = new ol.layer.Vector({
	source: new ol.source.Vector(),
	style: styleFunction
});
var vectorLayer5 = new ol.layer.Vector({
	source: new ol.source.Vector(),
	style: styleFunction
});

var baseLayer1 = new ol.layer.Tile({
			source: new ol.source.XYZ({
                attributions: 'Tiles © <a href="https://services.arcgisonline.com/ArcGIS/' +
                    'rest/services/World_Topo_Map/MapServer">ArcGIS</a>',
                url: 'https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Light_Gray_Base/MapServer/tile/{z}/{y}/{x}'
            })
});

var dssatmap = new ol.Map({
	target: 'dssatmap',
	layers: [baseLayer1, vectorLayer1,vectorLayer2,vectorLayer3,vectorLayer4,vectorLayer5],
	view: new ol.View({
		center: ol.proj.transform([39.669571, -1.036878], 'EPSG:4326', 'EPSG:3857'),
		projection: projection,
		zoom: 6
	})
});

dssatmap.getView().on('change:resolution', (event) => {
	vicmap.setView(dssatmap.getView());
});
vicmap.getView().on('change:resolution', (event) => {
	dssatmap.setView(vicmap.getView());

});
function showLoader() {
    $('#loading').show();
}
function hideLoader() {
    $('#loading').hide();
}