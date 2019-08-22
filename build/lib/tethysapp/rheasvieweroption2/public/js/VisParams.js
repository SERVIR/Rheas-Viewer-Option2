var VISPARAMS = {
  'ch2Spi': [
    {color:"#FFFFFF", quantity:"-9999", label:["No Data"], opacity:"0"},
    {color:"#b10026", quantity:"-2", label:["-2 and less","Extremely Dry"], opacity:"1"},
    {color:"#fc4e2a", quantity:"-1.5", label:["-2 to -1.5","Severely Dry"], opacity:"1"},
    {color:"#feb24c", quantity:"-1", label:["-1.5 to -1","Moderately Dry"], opacity:"1"},
    {color:"#c7e9b4", quantity:"1", label:["-1 to 1","Near Normal"], opacity:"1"},
    {color:"#7fcdbb", quantity:"1.5", label:["1 to 1.5","Moderately Wet"], opacity:"1"},
    {color:"#1d91c0", quantity:"2", label:["1.5 to 2","Severely Wet"], opacity:"1"},
    {color:"#0c2c84", quantity:"3", label:["2 and above","Extremely Wet"], opacity:"1"},
    // {color:"#FFFFFF", quantity:"-9999", label:["No Data"], opacity:"0"},
    // {color:"#FF0000", quantity:"-2", label:["-2 and less","Extremely Dry"], opacity:"1"},
    // {color:"#FB8420", quantity:"-1.5", label:["-2 to -1.5","Severely Dry"], opacity:"1"},
    // {color:"#F9FF42", quantity:"-1", label:["-1.5 to -1","Moderately Dry"], opacity:"1"},
    // {color:"#BFBFBF", quantity:"1", label:["-1 to 1","Near Normal"], opacity:"1"},
    // {color:"#00FF43", quantity:"1.5", label:["1 to 1.5","Moderately Wet"], opacity:"1"},
    // {color:"#00FFFF", quantity:"2", label:["1.5 to 2","Severely Wet"], opacity:"1"},
    // {color:"#3700f1", quantity:"3", label:["2 and above","Extremely Wet"], opacity:"1"},
  ],
  'temp': [
    {color:"#FFFFFF", quantity:"-9999", label:["No Data"], opacity:"0"},
    {color:"#b10026", quantity:"273", label:["less than 0&deg;C",""], opacity:"1"},
    {color:"#fc4e2a", quantity:"278", label:["0&deg;C to 5&deg;C", ""], opacity:"1"},
    {color:"#feb24c", quantity:"283", label:["5&deg;C to 10&deg;C",""], opacity:"1"},
    {color:"#ffeda0", quantity:"288", label:["10&deg;C to 15&deg;C",""], opacity:"1"},
    {color:"#c7e9b4", quantity:"293", label:["15&deg;C to 20&deg;C",""], opacity:"1"},
    {color:"#7fcdbb", quantity:"298", label:["20&deg;C to 25&deg;C",""], opacity:"1"},
    {color:"#1d91c0", quantity:"403", label:["25&deg;C to 30&deg;C",""], opacity:"1"},
    {color:"#0c2c84", quantity:"500", label:["30&deg;C or more",""], opacity:"1"},
  ],
  // 0 -310
  'rain': [
    {color:"#FFFFFF", quantity:"-9999", label:["No Data"], opacity:"0"},
    {color:"#b10026", quantity:"25", label:["less than 25",""], opacity:"1"},
    {color:"#fc4e2a", quantity:"50", label:["25 to 50", ""], opacity:"1"},
    {color:"#feb24c", quantity:"75", label:["50 to 75",""], opacity:"1"},
    {color:"#ffeda0", quantity:"100", label:["75 to 100",""], opacity:"1"},
    {color:"#c7e9b4", quantity:"150", label:["100 to 150",""], opacity:"1"},
    {color:"#7fcdbb", quantity:"200", label:["150 to 200",""], opacity:"1"},
    {color:"#1d91c0", quantity:"300", label:["200 to 300",""], opacity:"1"},
    {color:"#0c2c84", quantity:"1000", label:["300 or more",""], opacity:"1"},
  ],
  //
  'evap': [
    {color:"#FFFFFF", quantity:"-9999", label:["No Data"], opacity:"0"},
    {color:"#b10026", quantity:"5", label:["less than 25",""], opacity:"1"},
    {color:"#fc4e2a", quantity:"10", label:["25 to 50", ""], opacity:"1"},
    {color:"#feb24c", quantity:"15", label:["50 to 75",""], opacity:"1"},
    {color:"#ffeda0", quantity:"20", label:["75 to 100",""], opacity:"1"},
    {color:"#c7e9b4", quantity:"25", label:["100 to 150",""], opacity:"1"},
    {color:"#7fcdbb", quantity:"50", label:["150 to 200",""], opacity:"1"},
    {color:"#1d91c0", quantity:"75", label:["200 to 300",""], opacity:"1"},
    {color:"#0c2c84", quantity:"100", label:["300 or more",""], opacity:"1"},
  ],
  'soilMoist': [
    {color:"#FFFFFF", quantity:"-9999", label:["No Data"], opacity:"0"},
    {color:"#b10026", quantity:"5", label:["less than 5",""], opacity:"1"},
    {color:"#fc4e2a", quantity:"10", label:["5 to 10", ""], opacity:"1"},
    {color:"#feb24c", quantity:"15", label:["10 to 15",""], opacity:"1"},
    {color:"#ffeda0", quantity:"20", label:["15 to 20",""], opacity:"1"},
    {color:"#c7e9b4", quantity:"25", label:["20 to 25",""], opacity:"1"},
    {color:"#7fcdbb", quantity:"30", label:["25 to 30",""], opacity:"1"},
    {color:"#1d91c0", quantity:"35", label:["30 to 35",""], opacity:"1"},
    {color:"#0c2c84", quantity:"100", label:["35 or more",""], opacity:"1"},
  ],
  // 'soilMoist': [
  //   {color:"#FFFFFF", quantity:"-9999", label:["No Data"], opacity:"0"},
  //   {color:"#b10026", quantity:"10", label:["less than 20","less than 20"], opacity:"1"},
  //   {color:"#fc4e2a", quantity:"20", label:["20 to 20", "less than 40"], opacity:"1"},
  //   {color:"#feb24c", quantity:"30", label:["40 to 20","less than 60"], opacity:"1"},
  //   {color:"#ffeda0", quantity:"40", label:["60 to 20","less than 80"], opacity:"1"},
  //   {color:"#c7e9b4", quantity:"50", label:["60 to 20","less than 80"], opacity:"1"},
  //   {color:"#7fcdbb", quantity:"60", label:["60 to 20","less than 80"], opacity:"1"},
  //   {color:"#1d91c0", quantity:"80", label:["60 to 20","less than 80"], opacity:"1"},
  //   {color:"#0c2c84", quantity:"100", label:["80 or more","80 or more"], opacity:"1"},
  // ],
  'none': [],
};

var WMSLAYERS = {
  "ch2Spi" : "SPI",
  "temp" : "Temperature (&deg;C)",
  "rain" : "Rainfall (mm/day)",
  "evap" : "Evapotranspiration",
  "soilMoist" : "Soil Moisture",
  "none" : "No Layers",
}

//helper function for aggregating data over mapping

var VALUESCALE = {
  'temp': function(x){return x-273;},
  'emodisNdvi': function (data){return (data/200) -0.1;},
  'ndviAnomaly': function (data){return -1*(data/200);},
  'rainfallAggregate' : function(data){return app._getAggregated('aggregate_rain', data);}
}

var INDICES = [
  ["tempExtreme","Temperature (min, max)"],
  ["rain","Rainfall"],
  ["soilMoist","Soil Moisture"],
  ["evap","Total Evapotranspiration"],
  ["NDVI","NDVI"],
  ["tempMean", "Mean Temperature" ],
  ["ndviAnomaly","NDVI Anomaly"],
  ["ch2Spi", "SPI"],
  ["seasonAgg", "Aggregated Anomalies"],
  ["pNormal", "Percentage of Normal"]
  // ["spi-1To1","Area Under SPI (-1 to 1)"]
]


var TOOLTIPS = {
  "tempExtreme":"Exteme temperatures on the agricultural region of district",
  "tempMean":"Mean temperature of agricultural region of district",
  "rain":"Average and accumulative rainfall of the region",
  "NDVI":"MAX NDVI of the region",
  "ndviAnomaly":"NDVI anomaly of the region",
  "soilMoist":"Mean soil moisture of the region",
  "evap":"Mean Evapotranspiration of the region",
  "seasonAgg":"Area under seasonally aggregated anomalies",
  "seasonAgg":"Percentage of normal equating to current value "
}
