$("#home").css("background-color","#ddd");
 $("#home").css("color","black");
 function showLoader() {
    $('#loading').show();
}
function hideLoader() {
    $('#loading').hide();
}
hideLoader();
var var_data = $("#variable").attr('data-variable-info');
var_data = JSON.parse(var_data);
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
	zoom: 5
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

 var default_sty = new ol.style.Style({

        stroke: new ol.style.Stroke({
            color: [97, 97, 97, 1],
            width: 1
        })
    });

try {
	showLoader();
	var style = "cwg";
	wms_source = new ol.source.ImageWMS({
		url: 'https://thredds.servirglobal.net/thredds/wms/rheas/nc/soil_moist_2021-12-31.nc?',
		params: {
			'LAYERS': "Band1",
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
	var index = find_var_index("soil_moist_4", var_data);
	var range = Math.round(var_data[index]["min"]).toFixed(2) + "," + Math.round(var_data[index]["max"]).toFixed(2);
	var link = 'https://thredds.servirglobal.net/thredds/wms/rheas/nc/soil_moist_2021-12-31.nc' + "?SERVICE=WMS&VERSION=1.3.0&REQUEST=GetLegendGraphic&LAYER=Band1&colorscalerange=" + range + "&PALETTE=" + style + "&transparent=TRUE";
	console.log(link);

	wms_layer.setZIndex(2);
	vicmap.addLayer(wms_layer);
	//   map.addLayer(boundaryLayer);
	var div = document.getElementById("vic_legend");
	div.innerHTML =
		'<img src="' + link + '" alt="legend">';
var vectorLayerBoundaries = new ol.layer.Vector({
		source: new ol.source.Vector(),
		style: [default_sty]
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
		style: [default_sty]
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
		style: [default_sty]
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
		style: [default_sty]
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
		style: [default_sty]
	});
	vectorLayerBoundaries4.setSource(new ol.source.Vector({
		features: (new ol.format.GeoJSON()).readFeatures(eth, {
			featureProjection: 'EPSG:3857'
		})
	}));
	vectorLayerBoundaries4.setZIndex(Infinity);
	vicmap.addLayer(vectorLayerBoundaries4);
	hideLoader();
} catch (err) {
	alert(err.toString())
	hideLoader();
}

