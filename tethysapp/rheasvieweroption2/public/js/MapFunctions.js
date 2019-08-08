var mapApp={};

mapApp.AnimationTimeInterval = 1000; //ms
mapApp.geomCache = {};

mapApp.setMap = function(map){
  mapApp.map = map;
}

mapApp.setTopMap = function(map){
  map.dragging.disable();
  map.touchZoom.disable();
  map.doubleClickZoom.disable();
  map.scrollWheelZoom.disable();
  map.boxZoom.disable();
  map.keyboard.disable();
  if (map.tap) map.tap.disable();
  document.getElementById('top-map-container').style.cursor='default';
  mapApp.topMap = map;
  mapApp.map.on('move',function(e){
    mapApp.submapRefactor();
  });
  mapApp.map.on('zoomend',function(e){
    // mapApp.submapRefactor();
    setTimeout(function(){mapApp.submapRefactor()},100);
  });
}

mapApp.addSlider = function (args){
  mapApp.map = args.map || mapApp.map;
  mapApp.variable = args.variable || 'SPI';
  mapApp.year = args.year || 2017;
  mapApp.startDate = args.startDate || 1;
  mapApp.endDate = args.endDate || 12*3;
  mapApp.interval = args.interval || 'dd';

  mapApp.slider = L.control.slider(mapApp.sliderValueChanged, {
    id:"time-slider",
    orientation: 'horizontal',
    position: 'bottomleft',
    min: mapApp.startDate,
    max: mapApp.endDate,
    value: mapApp.startDate,
    collapsed: false,
    size: '300px',
    getValue: mapApp._formatLabel,
    increment:true,
  });
  mapApp.map.addControl(mapApp.slider);
  mapApp.animationControl = L.control({position: 'bottomleft'});
  mapApp.animationControl.onAdd = function (map) {
      let symbol = "&#9658;";
      if (mapApp.animation) symbol = "<b>||</b>";
      var div = L.DomUtil.create('div', 'info animControl');
      div.innerHTML += '<span class="leaflet-span-anim"><b>'+mapApp._formatLabel(mapApp.startDate)+'</b></span>';
      div.innerHTML += '<span class="leaflet-btn-anim" id="playpause" onclick="mapApp.changeAnimationState()"><a>'+symbol+'</a></span>';
      div.innerHTML += '<span class="leaflet-span-anim"><b>'+mapApp._formatLabel(mapApp.endDate)+'</b></span>';
      return div;
  };
  mapApp.animationControl.addTo(mapApp.map);
}

mapApp.removeSlider = function (){
  if (mapApp.map && mapApp.slider) mapApp.map.removeControl(mapApp.slider);
  if (mapApp.map && mapApp.animationControl) mapApp.map.removeControl(mapApp.animationControl);
  mapApp.changeAnimationState(true);
}

//update the selected geometry
mapApp.updateGeometry = function(l0,l1){
  // if(!l1) return;
  if (mapApp.activeLayer != undefined){
    mapApp.map.removeLayer(mapApp.activeLayer);
  }
  // if (mapApp.mapMask != undefined){
  //   mapApp.map.removeLayer(mapApp.mapMask);
  // }
  if (mapApp.geomCache[l1] != undefined){
    mapApp.activeLayer = L.geoJSON(mapApp.geomCache[l1],{color:'#222222',fillOpacity:"0"}).addTo(mapApp.map);
    mapApp.map.fitBounds(mapApp.activeLayer.getBounds());
    // applyMask(mapApp.geomCache[l1]);
  }else {
    if (mapApp.geomLoading != undefined) mapApp.geomLoading.abort();

    mapApp.geomLoading = $.ajax({
      dataType : 'json',
      url : '/static/dmlocal/Shapes/'+l0+'/'+l1+'.geojson',
      success: function(fcoll){
        mapApp.activeLayer = L.geoJson(fcoll,{color:'#222222',fillOpacity:"0", weight:"1.5"}).addTo(mapApp.map);
        mapApp.geomCache[l1] = fcoll;
        mapApp.map.fitBounds(mapApp.activeLayer.getBounds());
        setTimeout(function(){mapApp.submapRefactor();},500);
        // applyMask(fcoll);
      }
    });
  }

  // function applyMask(fcoll){
  //   var latlngs = fcoll.features[0].geometry.coordinates[0].map(function(item){
  //     return new L.LatLng(item[1], item[0])
  //   });
  //   mapApp.mapMask = L.mask(latlngs);
  //   mapApp.mapMask.addTo(mapApp.map)
  // }
}



mapApp._formatLabel = function(value){
  var date = new Date();
  var d = new Date();
  d.setYear(mapApp.year);
  d.setDate(1);
  if(mapApp.interval == 'dd'){
    d.setMonth(parseInt((value-1)/3))
    var dekad = "D"+((value-1)%3+1);
    return d.toString('yy-MMM-')+dekad;
  }
  else if(mapApp.interval == 'mm'){
    d.setMonth(value-1);
    return d.toString("yy-MMM");
  }else {
    d.setMonth(value-1);
    d1 = new Date(d);
    d1.addMonths(1);
    d2 = new Date(d);
    d2.addMonths(2);
    return d.toString('yy-')+d.toString('MMM')[0]+d1.toString('MMM')[0]+d2.toString('MMM')[0];
  }
  return "label"+value;
}

mapApp._pad = function(num, size){
  s = num+"";
  while (s.length < size) s = "0" + s;
  return s;
}

mapApp._getTimeString = function(interval,year,index){
  var suffix = mapApp._pad(index,2);
  if (interval=='dd'){
    suffix = mapApp._pad(parseInt((index-1)/3)+1,2)+mapApp._pad((index%3==0)?3:(index%3),2);
  }else if (interval == '3m'){
    var su2 = mapApp._pad((index+1>12)?1:(index+1),2);
    var su3 = mapApp._pad((index+2>12)?(index-10):(index+2),2);
    suffix = suffix+su2+su3;
  }
  return year+suffix;
}

mapApp._getWMSSld = function(layername, style){
  var selectedStyle = VISPARAMS[style];
  var retText = '<StyledLayerDescriptor version="1.0.0"><NamedLayer><Name>'+layername+'</Name><UserStyle><FeatureTypeStyle><Rule><RasterSymbolizer><ColorMap type="ramp">';
  for (var i = 0; i< selectedStyle.length;i++){
    var cMap = selectedStyle[i];
    retText += '<ColorMapEntry color="'+cMap.color+'" quantity="'+cMap.quantity+'" label="'+cMap.label+'" opacity="'+cMap.opacity+'"/>'
  }
  retText += '</ColorMap></RasterSymbolizer></Rule></FeatureTypeStyle></UserStyle></NamedLayer></StyledLayerDescriptor>';
  return retText;
};

mapApp.getWMSLayer = function(interval, year, timeIndex){
  var wmsURL = "http://tethys.icimod.org:8181/geoserver/wms?";
  var layername = 'saldas'+interval.toUpperCase()+":"+mapApp.selectedVariable+"_"+mapApp._getTimeString(interval,year,timeIndex);
  var wmsOptions = {
    format:'image/png',
    transparent:true,
    layers:layername,
    SLD_BODY: mapApp._getWMSSld(layername, mapApp.selectedVariable),
    opacity:0,
  };
  // console.log(mapApp._getWMSSld(layername, mapApp.selectedVariable));
  return L.tileLayer.wms(wmsURL, wmsOptions);
};

mapApp._getSeries = function(interval, year, startDate, endDate){
  var dataSeries = [];
  for (var i = 0; i <= (endDate-startDate);i++){
    var thisTime = startDate+i;
    var thisYear = year;
    if (thisTime>12){
      thisTime = thisTime-12;
      thisYear = parseInt(thisYear)+1;
    }
    dataSeries.push({
      date:mapApp._getTimeString(interval, thisYear, thisTime),
      wmsLayer : mapApp.getWMSLayer(interval, thisYear, thisTime)
    });
  }
  return dataSeries;
}
mapApp._clearWMSLayers = function(){
  if (!mapApp.activeSeries) return;
  for (var i; i<mapApp.activeSeries.length; i++){
    mapApp.map.removeLayer(mapApp.activeSeries[i].wmsLayer);
  }
}


mapApp._addWMSLayers = function(){
  mapApp._clearWMSLayers();
  mapApp.isLayerAdded = [];
  for (var i = 0; i<mapApp.activeSeries.length; i++){
    mapApp.isLayerAdded.push(false);
  }
}

mapApp._changeWms = function(value){
  var index = value - mapApp.startDate;
  mapApp.oldWms = mapApp.activeWms;
  if (!mapApp.isLayerAdded[index]){
    // mapApp.map.addLayer(mapApp.activeSeries[index].wmsLayer);
    mapApp.topMap.addLayer(mapApp.activeSeries[index].wmsLayer);
    mapApp.isLayerAdded[index] = true;
  }
  if (mapApp.activeSeries[index+1] && !mapApp.isLayerAdded[index+1]){
    // mapApp.map.addLayer(mapApp.activeSeries[index+1].wmsLayer);
    mapApp.topMap.addLayer(mapApp.activeSeries[index+1].wmsLayer);
    mapApp.isLayerAdded[index+1] = true;
  }
  if (mapApp.activeSeries[index+2] && !mapApp.isLayerAdded[index+2]){
    // mapApp.map.addLayer(mapApp.activeSeries[index+2].wmsLayer);
    mapApp.topMap.addLayer(mapApp.activeSeries[index+2].wmsLayer);
    mapApp.isLayerAdded[index+2] = true;
  }
  if (mapApp.oldWms) mapApp.oldWms.setOpacity(0);
  mapApp.activeWms = mapApp.activeSeries[index].wmsLayer;
  mapApp.activeWms.setOpacity(1);
}

mapApp.updateSlider = function(args){
  mapApp.removeSlider();
  if (args.interval == 'dd') {
    args.startDate = args.startDate*3 - 2;
    args.endDate = args.endDate * 3;
  }
  // args.endDate --;
  mapApp.addSlider(args);
  mapApp.activeSeries = mapApp._getSeries(args.interval, args.year, args.startDate, args.endDate);
  mapApp._addWMSLayers();
  mapApp._changeWms(mapApp.startDate);
}

mapApp.sliderValueChanged = function(value){
  if (mapApp.activeSeries) mapApp._changeWms(value);
}

//events
mapApp.changeAnimationState = function(stop){
  if (mapApp.animation){
    mapApp.stopAnimation();
    $("#playpause a").html('<b>&#9658;</b>');
  }else if (!stop){
    mapApp.startAnimation();
    $("#playpause a").html('<b>||</b>');
  }
}
mapApp.startAnimation = function(){
  if (mapApp.animation) return;
  function nextStep(){
    if (parseInt(mapApp.slider.slider.value) < parseInt(mapApp.slider.slider.max))
      mapApp.slider.changeValue(parseInt(mapApp.slider.slider.value)+1);
    else mapApp.slider.changeValue(mapApp.slider.slider.min)
  }
  nextStep();
  mapApp.animation = setInterval(function(){
    nextStep();
  }, mapApp.AnimationTimeInterval);
}

mapApp.stopAnimation = function(){
  clearInterval(mapApp.animation);
  delete(mapApp.animation);
}

mapApp.mapVariableChanged = function(arg){
  var variable = arg;
  if (arg.value) variable = arg.value;
  mapApp.selectedVariable = variable;
  // if (mapApp.selectedVariable == 'none') {
  //   mapApp.stopAnimation();
  //   mapApp.topMap.removeLayer(mapApp.activeWms);
  // }
  mapApp.activeSeries = mapApp._getSeries(mapApp.interval, mapApp.year, mapApp.startDate, mapApp.endDate);
  mapApp._addWMSLayers();
  mapApp.slider.changeValue(mapApp.startDate);
  if (mapApp.selectedVariable == 'none') {
    mapApp.map.removeControl(mapApp.slider);
    mapApp.map.removeControl(mapApp.animationControl);
  }else {
    mapApp.map.addControl(mapApp.slider);
    mapApp.map.addControl(mapApp.animationControl);
  }
  mapApp.updateLegend();
}

mapApp.addVariableSelector = function(){
  if (!mapApp.variableSelector) mapApp.variableSelector = L.control({position: 'topright'});
  else mapApp.map.removeControl(mapApp.variableSelector);
  mapApp.variableSelector.onAdd = function (map) {
    var layerObject = WMSLAYERS;
    var availableLayers = Object.keys(layerObject);

    var div = L.DomUtil.create('div', 'info');
    // console.log(availableLayers);
    var innerText = '<select onchange="mapApp.mapVariableChanged(this)" style="padding:2px;border-radius:3px;border-color:white;box-shadow:0px 1px 5px rgba(0,0,0,0.4);">'
    mapApp.selectedVariable = availableLayers[0]
    for(var i=0; i< availableLayers.length;i++){
      innerText += '<option value='+availableLayers[i]+' >'+layerObject[availableLayers[i]]+'</option>'
    }
    innerText += '</select>'
    div.innerHTML += innerText;
    return div;
  };
  mapApp.variableSelector.addTo(mapApp.map);
}

mapApp.updateLegend = function(){
  if (!mapApp.legend) mapApp.legend = L.control({position: 'bottomright'});
  else mapApp.map.removeControl(mapApp.legend);
  var selectedStyle = VISPARAMS[mapApp.selectedVariable];

  mapApp.legend.onAdd = function (map) {
      var div = L.DomUtil.create('div', 'info legend');
      var innerText = '<span class="legend-text"><b>'+WMSLAYERS[mapApp.selectedVariable]+'</b></span><br><table class = "legend-table" >';
      var scalefun = VALUESCALE[mapApp.selectedVariable];
      for (var i = selectedStyle.length-1; i>=0; i--) {
        cMap = selectedStyle[i];
        if (cMap.opacity>0) {
          innerText += '<tr class = "legend-row"><td class = "legend-symbol" style="background-color:'+cMap.color+';"></td>';
          innerText += '<td class = "legend-text legend-label">'+cMap.label.join('</td><td class="legend-text">')+'</td></tr>';

          // innerText += '<td class = "legend-text legend-quantity">';
          //
          // if (i==1) innerText += '&lt;'+((scalefun)? scalefun(cMap.quantity): cMap.quantity);
          // else if (i==selectedStyle.length) innerText += '&gt;'+((scalefun)? scalefun(selectedStyle[i-1].quantity):selectedStyle[i-1].quantity);
          // else innerText += ((scalefun)? scalefun(selectedStyle[i-1].quantity):selectedStyle[i-1].quantity)+" to "+ ((scalefun)? scalefun(cMap.quantity): cMap.quantity);
          //
          // innerText += '</td><td class = "legend-text legend-label">'+cMap.label+'</td></tr>';
        }
      }
      innerText += '</table>';
      div.innerHTML += innerText;
      return div;
  };

  mapApp.legend.addTo(mapApp.map);

  // expand legend on hover and prevent stacking
  $('.legend-text').off('mouseenter');
  $('.legend-text').off('mouseout');
  $('.legend-text').on('mouseenter',function(e){
    $('.legend-text').css('font-size','15px');
  });
  $('.legend-text').on('mouseout',function(e){
    $('.legend-text').css('font-size','10px');
  });
}

mapApp.submapRefactor = function(){
  var layers = mapApp.activeLayer._layers;
  var layerIndex = Object.keys(layers)[0];
  var polygonParts = layers[layerIndex]._parts[0];
  if (polygonParts && polygonParts.length > 0){
    var mapPaneElement = $(layers[layerIndex]._path).parent().parent().parent().parent();
    var mapTransformString = mapPaneElement.css("transform");
    var mapTransformArray = mapTransformString.split('(')[1].split(')')[0].split(',')
      .map(function(item){
        return parseInt(item);
      });
    var offsetX = mapTransformArray[mapTransformArray.length-2];
    var offsetY = mapTransformArray[mapTransformArray.length-1];
    var layerVertices = polygonParts.map(function(item){
      return (item.x+offsetX)+"px "+(item.y+offsetY)+"px";
    });
    $("#top-map-container").css("clip-path","polygon("+layerVertices.join(",")+")");
    $("#top-map-container").css("z-index","500");
    mapApp.topMap.flyTo(mapApp.map.getCenter(),mapApp.map.getZoom(),{animate:false,duration:0});
  }
  // console.log('refactored',$("#top-map-container").css("clip-path"));
}
