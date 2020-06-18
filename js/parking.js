var dataUrl =
  "http://localhost:8090/iserver/services/data-mapWorkspace/rest/data";
var parkingDataUrl =
  "http://localhost:8090/iserver/services/data-mapWorkspace/rest/data/datasources/data/datasets/ParkingsGround";
$(function () {
  $("#searchParking").click(function () {
    vectorLayer.removeAllFeatures();
    markerLayer.clearMarkers();
    closeInfoWin();

    drawPoint.activate();
  });

  //draw the Location point
  var drawPoint = new SuperMap.Control.DrawFeature(
    vectorLayer,
    SuperMap.Handler.Point,
    {
      multi: false,
    }
  );
  drawPoint.events.on({
    featureadded: drawPointCompleted,
  });
  map.addControl(drawPoint);

  function drawPointCompleted(e) {
    //stop drawing
    drawPoint.deactivate();
    var distanceVal = $("#disValue").val().toString();
    var queryByDistanceParams = new SuperMap.REST.QueryByDistanceParameters({
      queryParams: new Array(
        new SuperMap.REST.FilterParameter({
          name: "ParkingsGround@data",
        })
      ),
      returnContent: true,
      isNearest: true,
      distance: distanceVal,
      expectCount: 1,
      geometry: e.feature.geometry,
    });

    var queryByDistanceService = new SuperMap.REST.QueryByDistanceService(url);
    queryByDistanceService.events.on({
      processCompleted: queryByDistanceSuccess,
      processFailed: processFailed,
    });
    queryByDistanceService.processAsync(queryByDistanceParams);
  }
  function queryByDistanceSuccess(e) {
    console.log(e);
    //parking Lot returned from service
    if (e.result.recordsets.length < 1) {
      alert("Sorry, there is no parking lot at this distance!");
      return;
    }

    var selectedFeature = e.result.recordsets[0].features[0];
    var i,
      j,
      feature,
      result = e.result;
    //display parking Lots on the map with marker symbol
    if (result && result.recordsets) {
      for (i = 0; i < result.recordsets.length; i++) {
        if (result.recordsets[i].features) {
          for (j = 0; j < result.recordsets[i].features.length; j++) {
            feature = result.recordsets[i].features[j];
            var point = feature.geometry,
              size = new SuperMap.Size(44, 33),
              offset = new SuperMap.Pixel(-(size.w / 2), -size.h),
              icon = new SuperMap.Icon("./img/marker.png", size, offset);
            markerLayer.addMarker(
              new SuperMap.Marker(new SuperMap.LonLat(point.x, point.y), icon)
            );
          }
        }
      }
    }
    //add a map popup window at the selected parking Lot
    var center = new SuperMap.LonLat(feature.geometry.x, feature.geometry.y);
    var contentHTML =
      "<div style='width:80px; font-size:12px;font-weight:bold ; opacity: 0.8'>";
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
  $("#clearParking").click(function () {
    drawPoint.deactivate();
    vectorLayer.removeAllFeatures();
    markerLayer.clearMarkers();
    closeInfoWin();
  });

  //edit parking Lots
  $("#edit").click(function () {
    if ($(this).is(":checked") == true) {
      //start edit
      var getFeatureParam, getFeatureBySQLService, getFeatureBySQLParams;

      getFeatureParam = new SuperMap.REST.FilterParameter({
        name: "ParkingsGround@data",
        attributeFilter: "SMID > 0",
      });
      getFeatureBySQLParams = new SuperMap.REST.GetFeaturesBySQLParameters({
        queryParameter: getFeatureParam,
        datasetNames: ["data:ParkingsGround"],
        toIndex: -1,
      });
      getFeatureBySQLService = new SuperMap.REST.GetFeaturesBySQLService(
        dataUrl,
        {
          eventListeners: {
            processCompleted: processCompleted,
            processFailed: processFailed,
          },
        }
      );

      getFeatureBySQLService.processAsync(getFeatureBySQLParams);
    } else {
      //stop edit
      //remove vector layer
      vectorLayer.removeAllFeatures();
      //refresh tiled layer
      layer.redraw();
    }
  });

  function processCompleted(getFeaturesEventArgs) {
    var i,
      len,
      features,
      feature,
      result = getFeaturesEventArgs.result;
    if (result && result.features) {
      features = result.features;
      for (i = 0, len = features.length; i < len; i++) {
        feature = features[i];
        feature.style = {
          fillColor: "gray",
          strokeColor: "blue",
          pointRadius: 6,
        };
        vectorLayer.addFeatures(feature);
      }
    }
    selectFeature.deactivate();
  }

  function processFailed(e) {
    alert(e.error.errorMsg);
  }

  $("#addParking").click(function () {
    if (vectorLayer.features.length < 1) {
      alert("Please Start Edit");
      return;
    }

    addPoint.activate();
  });
  var addPoint = new SuperMap.Control.DrawFeature(
    vectorLayer,
    SuperMap.Handler.Point,
    {
      multi: false,
    }
  );
  addPoint.events.on({
    featureadded: addPointCompleted,
  });
  map.addControl(addPoint);

  function addPointCompleted(drawGeometryArgs) {
    addPoint.deactivate();

    var geometry = drawGeometryArgs.feature.geometry;

    var fieldNames = ["Purpose", "Name"];
    var fieldValues = [$("#purpose").val(), $("#name").val()];
    var editFeatureParameter,
      editFeatureService,
      features = {
        fieldNames: fieldNames,
        fieldValues: fieldValues,
        geometry: geometry,
      };
    editFeatureParameter = new SuperMap.REST.EditFeaturesParameters({
      features: [features],
      editType: SuperMap.REST.EditType.ADD,
      returnContent: false,
    });
    editFeatureService = new SuperMap.REST.EditFeaturesService(parkingDataUrl, {
      eventListeners: {
        processCompleted: addFeaturesProcessCompleted,
        processFailed: processFailed,
      },
    });
    editFeatureService.processAsync(editFeatureParameter);
  }

  function addFeaturesProcessCompleted(e) {
    vectorLayer.redraw();
    alert("Add new parking lot successfully");
  }

  $("#selectParking").click(function () {
    selectFeature.activate();
  });
  $("#modifyParking ").click(function () {
    closeInfoWin();
    if (featureSelected == null) {
      alert("Please select a feature first");
      return;
    }
    console.log(featureSelected);
    var fieldNames = ["Purpose", "Name"];
    var fieldValues = [$("#purpose").val(), $("#name").val()];
    var updateFeature = {
      fieldNames: fieldNames,
      fieldValues: fieldValues,
      geometry: featureSelected.geometry,
    };
    updateFeature.geometry.id = featureSelected.data.SMID;
    console.log(updateFeature);
    editFeatureParameter = new SuperMap.REST.EditFeaturesParameters({
      features: [updateFeature],
      editType: SuperMap.REST.EditType.UPDATE,
    });
    editFeatureService = new SuperMap.REST.EditFeaturesService(parkingDataUrl, {
      eventListeners: {
        processCompleted: updateFeaturesProcessCompleted,
        processFailed: processFailed,
      },
    });
    editFeatureService.processAsync(editFeatureParameter);
  });
  function updateFeaturesProcessCompleted(e) {
    alert("Modify parking lot successfully");
    featureSelected = null;
  }

  $("#deleteParking ").click(function () {
    closeInfoWin();
    if (featureSelected == null) {
      alert("Please select a feature first");
      return;
    }
    var editFeatureParameter, editFeatureService;
    editFeatureParameter = new SuperMap.REST.EditFeaturesParameters({
      IDs: [featureSelected.data.SMID],
      editType: SuperMap.REST.EditType.DELETE,
    });
    editFeatureService = new SuperMap.REST.EditFeaturesService(parkingDataUrl, {
      eventListeners: {
        processCompleted: deleteFeaturesProcessCompleted,
        processFailed: processFailed,
      },
    });
    editFeatureService.processAsync(editFeatureParameter);
  });
  function deleteFeaturesProcessCompleted(e) {
    alert("Delete parking lot successfully");
    featureSelected = null;
    vectorLayer.redraw();
  }
});
