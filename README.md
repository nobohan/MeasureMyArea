# Calculate lake area

## Technical description

This webmap uses OpenLayers 4. 

### Draw features & measure area

This webmap was built from http://openlayers.org/en/latest/examples/measure.html

### Sentinel 2 lastest imagery

* Cannot find a easy way to have latest S2 imagery. There are a WMS available at http://www.sentinel-hub.com/apps/wms but this is not free.
* Bing maps can be used instead: https://www.bingmapsportal.com
* See this question about serving Sentinel 2 data : https://gis.stackexchange.com/questions/253034/sentinel-2-imagery-as-a-webservice-in-a-leaflet-or-openlayers-map
* s2maps.eu is the best composite now (August 2017) for a cloudless, most recent, global earth imagery, but things will surely quickly evolve. See https://eox.at/2017/03/sentinel-2-cloudless/ for a complete story about s2maps.eu and the way to get it throuh WMTS: https://tiles.maps.eox.at/wmts/1.0.0/WMTSCapabilities.xml 

TODO:

Have pre-defined vector layer and modifiy the shape using http://openlayers.org/en/latest/examples/draw-and-modify-features.html