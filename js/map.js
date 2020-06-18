var layer,
  map,
  infowin,
  vectorLayer,
  markerLayer,
  featureSelected,
  selectFeature;
var url =
  "http://localhost:8090/iserver/services/map-mapWorkspace/rest/maps/myMap";

function closeInfoWin() {
  if (infowin) {
    try {
      infowin.hide();
      infowin.destroy();
    } catch (e) {}
  }
}

$(function () {
  //Frame layout initialization
  $("#layout").ligerLayout();
  $("#accordion").ligerAccordion({});
  $("#scene").click(function () {
    window.open("http://localhost:8090/SuperMapWebGISDemo_Frame/scene.html");
  });

  //initialize map control
  map = new SuperMap.Map("map", {
    controls: [new SuperMap.Control.Navigation(), new SuperMap.Control.Zoom()],
  });
  //allow overLay Layers
  map.allOverlays = true;

  //initialize Layer as TiledDynamicRESTLayer
  layer = new SuperMap.Layer.TiledDynamicRESTLayer(
    "layer",
    url,
    { cacheEnabled: false },
    {
      maxResolution: "auto",
    }
  );

  //define a Layer to display features created
  vectorLayer = new SuperMap.Layer.Vector("Vector Layer");
  markerLayer = new SuperMap.Layer.Markers("Markers");

  //register a LayerINitialized event to Layer
  layer.events.on({
    layerInitialized: addlayer,
  });
  function addlayer() {
    //add Layer to the map control
    map.addLayers([layer, vectorLayer, markerLayer]);
    //set default center point to the map
    map.setCenter(new SuperMap.LonLat(411531.36, 6181382.98), 1);
  }
  //measurement
  $("#measureDistance").click(function () {
    drawLine.activate();
  });
  $("#measureArea").click(function () {
    drawPolygon.activate();
  });

  //initialize DrawFeature as path
  var drawLine = new SuperMap.Control.DrawFeature(
    vectorLayer,
    SuperMap.Handler.Path,
    { multi: true }
  );
  //register featureadded event to drawline when finished drawing
  drawLine.events.on({ featureadded: drawCompleted });
  //add the drawline to the map
  map.addControl(drawLine);

  var drawPolygon = new SuperMap.Control.DrawFeature(
    vectorLayer,
    SuperMap.Handler.Polygon
  );
  drawPolygon.events.on({
    featureadded: drawCompleted,
  });
  map.addControl(drawPolygon);

  function drawCompleted(drawGeometryArgs) {
    //stop drawing
    drawLine.deactivate();
    drawPolygon.deactivate();
    //get the geometry of the feature
    var geometry = drawGeometryArgs.feature.geometry,
      measureParam = new SuperMap.REST.MeasureParameters(geometry),
      //Measurement service class, which is responsible for passing the measurement parameters to the server and obtaining the measurement results returned by the server
      myMeasuerService = new SuperMap.REST.MeasureService(url);
    myMeasuerService.events.on({
      processCompleted: measureCompleted,
    });
    //Judge and assign the measureservice type. Set measuremode.distance when it is determined to be linestring, otherwise measuremode.area
    if (geometry.__proto__.CLASS_NAME == "SuperMap.Geometry.Polygon") {
      myMeasuerService.measureMode = SuperMap.REST.MeasureMode.AREA;
    } else {
      myMeasuerService.measureMode = SuperMap.REST.MeasureMode.DISTANCE;
    }

    myMeasuerService.processAsync(measureParam);
  }
  function measureCompleted(measureEventArgs) {
    console.log(measureEventArgs);
    var distance = measureEventArgs.result.distance;
    var area = measureEventArgs.result.area;
    var unit = measureEventArgs.result.unit;
    if (area == -1) {
      alert(distance + "m");
    } else {
      alert(area + "m²");
    }
  }

  //building Location query
  $("#houseSearch").click(function () {
    //Clear the earlier query result
    vectorLayer.removeAllFeatures();
    //Get value from input
    var sql = $("#querykey").val().toString();
    console.log(sql);
    var queryParam = new SuperMap.REST.FilterParameter({
      //Set the query layer
      name: "House@data",
      attributeFilter: sql, //Set query SQL conditions
    });
    var queryBySQLParams = new SuperMap.REST.QueryBySQLParameters({
      queryParams: [queryParam],
    });
    var myQueryBySQLService = new SuperMap.REST.QueryBySQLService(url, {
      eventListeners: {
        processCompleted: queryCompleted,
        processFailed: queryError,
      },
    });
    myQueryBySQLService.processAsync(queryBySQLParams);
  });
  function queryCompleted(queryEventArgs) {
    var style = {
      strokeColor: "#304DBE",
      strokeWidth: 1,
      fillColor: "#304DBE",
      fillOpacity: "0.8",
    };
    var i,
      j,
      feature,
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
  function queryError(e) {
    console.log(e);
  }

  //Instantiate the selectFeature control. Call onSelect and onUnselect methods
  //Call onSelect method when the feature is selected. Call onUnselect method when the selected features are canceled
  selectFeature = new SuperMap.Control.SelectFeature(vectorLayer, {
    onSelect: onFeatureSelect,
    onUnselect: onUnFeatureSelect,
  });
  //Add control to map
  map.addControl(selectFeature);
  //Activate the control
  selectFeature.activate();

  function onFeatureSelect(e) {
    console.log(e);
    closeInfoWin();
    var feature = e;
    //store original style of selected feature
    feature.originalStyle = feature.style;
    //set highlight style to new selected feature
    feature.style = {
      fillColor: "red",
      strokeColor: "yellow",
      pointRadius: 6,
    };
    featureSelected = feature;

    //get the center point of the house
    var center = new SuperMap.LonLat(
      (feature.geometry.bounds.left + feature.geometry.bounds.right) / 2,
      (feature.geometry.bounds.bottom + feature.geometry.bounds.top) / 2
    );

    var contentHTML = "<table border='1'>";

    for (i in feature.attributes) {
      if (
        i != "SmID" &&
        i != "SmUserID" &&
        i != "SmArea" &&
        i != "SmPerimeter"
      ) {
        contentHTML += "<tr>";
        contentHTML += "<td>" + i + "</td>";
        contentHTML += "<td>" + feature.attributes[i] + "</td>";
        contentHTML += "</tr>";
      }
    }

    contentHTML += "</table>";
    var icon = new SuperMap.Icon();

    popup = new SuperMap.Popup.Anchored(
      "chicken",
      center,
      new SuperMap.Size(220, 140),
      contentHTML,
      icon,
      true,
      null
    );
    infowin = popup;
    map.addPopup(infowin);
    vectorLayer.redraw();
  }

  function onUnFeatureSelect(e) {
    console.log(e);
    e.style = e.originalStyle;
  }

  //clear
  $("#clear").click(function () {
    closeInfoWin();
    vectorLayer.removeAllFeatures();
  });
});
