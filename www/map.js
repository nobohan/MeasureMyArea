 // from https://openlayers.org/en/latest/examples/measure.html
 // Julien Minet - August 2017
 
 function init() {
 	
 	// Define the base layer
   var raster = new ol.layer.Tile({
     source: new ol.source.BingMaps({
     	 key: 'AsimXzSlPY90ums1pR61Hks092T5UEPJnMldMe57BevdwqzBO--lWr0iICStIbrl',
     	 imagerySet: 'AerialWithLabels'
     })
   });

   // WMTS
/*   var parser = new ol.format.WMTSCapabilities();
   fetch('https://tiles.maps.eox.at/wmts/1.0.0/WMTSCapabilities.xml').then(function(response) {
     return response.text();
   }).then(function(text) {
     var result = parser.read(text);
     var options = ol.source.WMTS.optionsFromCapabilities(result, {
       layer: 's2cloudless_3857',
       matrixSet: 'EPSG:3857'
     });

     var wmts = new ol.layer.Tile({
       opacity: 1,
       source: new ol.source.WMTS( /** @type {!olx.source.WMTSOptions} (options) )
     });
   })*/
   

   var wms = new ol.layer.Tile({
     source: new ol.source.TileWMS({
       url: 'https://tiles.maps.eox.at/wms',
       params: {LAYERS: 's2cloudless_3857'},
       attributions: 'Sentinel-2 cloudless by EOX IT Services GmbH (Contains modified Copernicus Sentinel data 2016)'
     })
   });


   // Define the draw layer
   var source = new ol.source.Vector({
     features: (new ol.format.GeoJSON()).readFeatures(barrage)   
   });


   var vector = new ol.layer.Vector({
     source: source,
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


   /**
    * Currently drawn feature.
    * @type {ol.Feature}
    */
   var sketch;


   /**
    * The help tooltip element.
    * @type {Element}
    */
   var helpTooltipElement;


   /**
    * Overlay to show the help messages.
    * @type {ol.Overlay}
    */
   var helpTooltip;


   /**
    * The measure tooltip element.
    * @type {Element}
    */
   var measureTooltipElement;


   /**
    * Overlay to show the measurement.
    * @type {ol.Overlay}
    */
   var measureTooltip;


   /**
    * Message to show when the user is drawing a polygon.
    * @type {string}
    */
   var continuePolygonMsg = 'Click to continue drawing the polygon';


   /**
    * Message to show when the user is drawing a line.
    * @type {string}
    */
   var continueLineMsg = 'Click to continue drawing the line';


   /**
    * Handle pointer move.
    * @param {ol.MapBrowserEvent} evt The event.
    */
   var pointerMoveHandler = function(evt) {
     if (evt.dragging) {
       return;
     }
     /** @type {string} */
     var helpMsg = 'Click to change the shape';

     if (sketch) {
       var geom = (sketch.getGeometry());
       if (geom instanceof ol.geom.Polygon) {
         helpMsg = continuePolygonMsg;
       } else if (geom instanceof ol.geom.LineString) {
         helpMsg = continueLineMsg;
       }
     }

     helpTooltipElement.innerHTML = helpMsg;
     helpTooltip.setPosition(evt.coordinate);

     helpTooltipElement.classList.remove('hidden');
   };


   var map = new ol.Map({
     layers: [wms, vector],
     target: 'map',
     view: new ol.View({
       center: ol.proj.transform([-4.8, 10.8], 'EPSG:4326', 'EPSG:3857'),
       zoom: 11
     })
   });

   map.on('pointermove', pointerMoveHandler);

   map.getViewport().addEventListener('mouseout', function() {
     helpTooltipElement.classList.add('hidden');
   });

   var typeSelect = document.getElementById('type');

   var draw; // global so we can remove it later


   /**
    * Format area output.
    * @param {ol.geom.Polygon} polygon The polygon.
    * @return {string} Formatted area.
    */
   var formatArea = function(polygon) {
     var area = ol.Sphere.getArea(polygon);
     var output;
     if (area > 10000) {
       output = (Math.round(area / 1000000 * 100) / 100) +
           ' ' + 'km<sup>2</sup>';
     } else {
       output = (Math.round(area * 100) / 100) +
           ' ' + 'm<sup>2</sup>';
     }
     return output;
   };

   function addInteraction() {
     var type = 'Polygon';
     draw = new ol.interaction.Draw({
       source: source,
       type: 'Polygon',
       style: new ol.style.Style({
         fill: new ol.style.Fill({
           color: 'rgba(255, 255, 255, 0.2)'
         }),
         stroke: new ol.style.Stroke({
           color: 'rgba(0, 0, 0, 0.5)',
           lineDash: [10, 10],
           width: 2
         }),
         image: new ol.style.Circle({
           radius: 5,
           stroke: new ol.style.Stroke({
             color: 'rgba(0, 0, 0, 0.7)'
           }),
           fill: new ol.style.Fill({
             color: 'rgba(255, 255, 255, 0.2)'
           })
         })
       })
     });
     map.addInteraction(draw);
     
     // Add modify interaction
     var modify = new ol.interaction.Modify({source: source});
     map.addInteraction(modify);

     createMeasureTooltip();
     createHelpTooltip();

     var listener;
     draw.on('drawstart',
         function(evt) {
           // set sketch
           sketch = evt.feature;

           /** @type {ol.Coordinate|undefined} */
           var tooltipCoord = evt.coordinate;

           listener = sketch.getGeometry().on('change', function(evt) {
             var geom = evt.target;
             var output;
             if (geom instanceof ol.geom.Polygon) {
               output = formatArea(geom);
               tooltipCoord = geom.getInteriorPoint().getCoordinates();
             } else if (geom instanceof ol.geom.LineString) {
               output = formatLength(geom);
               tooltipCoord = geom.getLastCoordinate();
             }
             measureTooltipElement.innerHTML = output;
             measureTooltip.setPosition(tooltipCoord);
           });
         }, this);

     draw.on('drawend',
         function() {
           measureTooltipElement.className = 'tooltip tooltip-static';
           measureTooltip.setOffset([0, -7]);
           // unset sketch
           sketch = null;
           // unset tooltip so that a new one can be created
           measureTooltipElement = null;
           createMeasureTooltip();
           ol.Observable.unByKey(listener);
         }, this);
   }


   /**
    * Creates a new help tooltip
    */
   function createHelpTooltip() {
     if (helpTooltipElement) {
       helpTooltipElement.parentNode.removeChild(helpTooltipElement);
     }
     helpTooltipElement = document.createElement('div');
     helpTooltipElement.className = 'tooltip hidden';
     helpTooltip = new ol.Overlay({
       element: helpTooltipElement,
       offset: [15, 0],
       positioning: 'center-left'
     });
     map.addOverlay(helpTooltip);
   }

   /**
    * Creates a new measure tooltip
    */
   function createMeasureTooltip() {
     if (measureTooltipElement) {
       measureTooltipElement.parentNode.removeChild(measureTooltipElement);
     }
     measureTooltipElement = document.createElement('div');
     measureTooltipElement.className = 'tooltip tooltip-measure';
     measureTooltip = new ol.Overlay({
       element: measureTooltipElement,
       offset: [0, -15],
       positioning: 'bottom-center'
     });
     map.addOverlay(measureTooltip);
   }

   addInteraction();
      
 }