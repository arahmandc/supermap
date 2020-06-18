
$(function() {

	//Search button
	$("#searchParking").click(function() {
		vectorLayer.removeAllFeatures();
		markerLayer.clearMarkers();
		closeInfoWin();
		drawPoint.activate();
	});


	//Define drawPoint control and add it to map
var drawPoint = new SuperMap.Control.DrawFeature(vectorLayer, SuperMap.Handler.Point, {
		multi: false
	});
	drawPoint.events.on({
		"featureadded": drawPointCompleted
	});
	map.addControl(drawPoint);


	//drawPointCompleted function and do distance query
	function drawPointCompleted(e) {
			drawPoint.deactivate();
			var distanceVal = $("#disValue").val().toString();
			var queryByDistanceParams = new SuperMap.REST.QueryByDistanceParameters({
				queryParams: new Array(new SuperMap.REST.FilterParameter({
					name: "ParkingsGround@data"
				})),
				returnContent: true,
				isNearest: true,
				distance: distanceVal,
				expectCount: 1,
				geometry: e.feature.geometry
			});
		
			var queryByDistanceService = new SuperMap.REST.QueryByDistanceService(url);
			queryByDistanceService.events.on({
				"processCompleted": queryByDistanceSuccess,
				"processFailed": processFailed
			});
			queryByDistanceService.processAsync(queryByDistanceParams);
	}


		function queryByDistanceSuccess(e) {
		if(e.result.recordsets.length < 1){
			alert("Sorry, there is no parking lot at this distance!");
						return;
					}
			var selectedFeature = e.result.recordsets[0].features[0];
					var i, j, feature,
						result = e.result;
					if (result && result.recordsets) {
						for (i = 0; i < result.recordsets.length; i++) {
							if (result.recordsets[i].features) {
								for (j = 0; j < result.recordsets[i].features.length; j++) {
									feature = result.recordsets[i].features[j];
									var point = feature.geometry,
									size = new SuperMap.Size(44, 33),
									offset = new SuperMap.Pixel(-(size.w / 2), -size.h),
									icon = new SuperMap.Icon("./img/marker.png", size, offset);
									markerLayer.addMarker(new SuperMap.Marker(new SuperMap.LonLat(point.x, point.y), icon));
								}
							}
						}
					}
					var center = new SuperMap.LonLat(feature.geometry.x, feature.geometry.y);
					var contentHTML = "<div style='width:80px; font-size:12px;font-weight:bold ; opacity: 0.8'>";
			        contentHTML += feature.attributes.Name;
			        contentHTML += "</div>";

			        //initiate FramedCloud class
					var icon = new SuperMap.Icon();
			        framedCloud = new SuperMap.Popup.FramedCloud(
			            "chicken",
			            center,
			            null,
			            contentHTML,
			            icon,
			            true,
			            null,
			            true
			        );

			        infowin = framedCloud;
					map.addPopup(framedCloud);
				}
			function processFailed(e) {
					console.log(e);
				}


			$("#clearParking").click(function() {
					drawPoint.deactivate();
			vectorLayer.removeAllFeatures();
					markerLayer.clearMarkers();
					closeInfoWin();
				});


});
