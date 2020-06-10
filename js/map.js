var map;
var url = "http://182.54.152.26:58616/iserver/services/map-mapWorkspace/rest/maps/myMap";

$(function() {
			//Frame layout initialization
			$("#layout").ligerLayout();
			$("#accordion").ligerAccordion({});

			//initialize map control
			map = new SuperMap.Map("map", {
					controls: [
						new SuperMap.Control.Navigation(),
						new SuperMap.Control.Zoom()
					]
				});
			//allow overlayers
				map.allOverlays = true;

			//initialize layer as TiledDynamicRESTLayer
				var layer = new SuperMap.Layer.TiledDynamicRESTLayer("layer", url, null, {
					maxResolution: "auto"
				});
			//define a layer display features created
			var vectorLayer = new SuperMap.Layer.Vector("Vector Layer");

			//register a layerInitialized event to layer
				layer.events.on({
					"layerInitialized": addlayer
				});
			function addlayer() {
			//add layer to the map control
				map.addLayers([layer, vectorLayer]);
			//set default center point to the map
				map.setCenter(new SuperMap.LonLat(411531.36, 6181382.98), 1);
			}

		//measerment
			$("#measureDistance").click(function(){
					drawLine.activate();
				});
			$("#measureArea").click(function(){
					drawPolygon.activate();
				});
			$("#clear").click(function() {
					vectorLayer.removeAllFeatures();
				});



		//initialize drawFeature as path
			var drawLine = new SuperMap.Control.DrawFeature(vectorLayer, SuperMap.Handler.Path, {multi: true});
		//register featureadded event to drawlile when finished drawing
			drawLine.events.on({"featureadded": drawCompleted});
		//add the drawline to the map
			map.addControl(drawLine);


			var drawPolygon = new SuperMap.Control.DrawFeature(vectorLayer, SuperMap.Handler.Polygon);
				drawPolygon.events.on({
					"featureadded": drawCompleted
				});
				map.addControl(drawPolygon);


			function drawCompleted(drawGeometryArgs) {
		//stop drawing
			drawLine.deactivate();
			drawPolygon.deactivate();
		//get the geomatry of the feature
		var geometry = drawGeometryArgs.feature.geometry,
			measureParam = new SuperMap.REST.MeasureParameters(geometry),
			//Measurement service class, which is responsible for passing the measurement parameters to the server and obtaining the measurement results returned by the server
			myMeasuerService = new SuperMap.REST.MeasureService(url);
		myMeasuerService.events.on({
			"processCompleted": measureCompleted
		});

		//Judge and assign the measureservice type. Set measuremode.distance when it is determined to be linestring, otherwise measuremode.area
		if(geometry.__proto__.CLASS_NAME == "SuperMap.Geometry.Polygon"){
			myMeasuerService.measureMode = SuperMap.REST.MeasureMode.AREA;
		}else{
			myMeasuerService.measureMode = SuperMap.REST.MeasureMode.DISTANCE;
		}



		myMeasuerService.processAsync(measureParam);
	}

	function measureCompleted(measureEventArgs) {
		console.log(measureEventArgs);
		var distance = measureEventArgs.result.distance;
		var area = measureEventArgs.result.area;
		var unit = measureEventArgs.result.unit;
		if(area == -1){
			alert(distance + "m");
		}else{
			alert(area + "m²");
		}

	}

	//house search
	$("#houseSearch").click(function() {
		//Clear the earlier query result
		vectorLayer.removeAllFeatures();
		//Get value from input
		var sql = $("#querykey").val().toString();
		console.log(sql);
		var queryParam = new SuperMap.REST.FilterParameter({
			//Set the query layer
			name: "House@data",
			attributeFilter: sql //Set query SQL conditions
		});
		var queryBySQLParams = new SuperMap.REST.QueryBySQLParameters({
			queryParams: [queryParam]
		});
		var myQueryBySQLService = new SuperMap.REST.QueryBySQLService(url, {
			eventListeners: {
				"processCompleted": queryCompleted,
				"processFailed": queryError
			}
		});
		myQueryBySQLService.processAsync(queryBySQLParams);
	});
	
	function queryCompleted(queryEventArgs){
		var style = {
		            strokeColor: "#304DBE",
		            strokeWidth: 1,
		            fillColor: "#304DBE",
		            fillOpacity: "0.8"
		        };
				var i, j, feature,
				            result = queryEventArgs.result;
				        if (result && result.recordsets) {
				            for (i = 0; i < result.recordsets.length; i++) {
				                if (result.recordsets[i].features) {
				                    for (j = 0; j < result.recordsets[i].features.length; j++) {
				                        feature = result.recordsets[i].features[j];
				                        feature.style = style;
				                        vectorLayer.addFeatures(feature);
				                    }
				                }
				            }
				        }
			}
			function queryError(e){
				console.log(e);
			}
	



		  });