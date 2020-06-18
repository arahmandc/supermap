var viewer;
var url_3D = "http://localhost:8090/iserver/services/3D-community-scenes/rest/realspace"; 

function onload(){
	
	//Initializing the viewer object using the bingmap image service
	viewer = new Cesium.Viewer('cesiumContainer');
	viewer.imageryLayers.addImageryProvider(new Cesium.BingMapsImageryProvider({
		key: 'ApuX0xxOLB0rZkG-O0DdI2g9fCIu8pF5tMB0vism8ISqkT5CwhUyflOWo_zmUci9', //You can go to the webist（https://www.bingmapsportal.com/）to apply key
		url: 'https://dev.virtualearth.net'
	}));			
	var scene = viewer.scene;
	var promise = scene.open(url_3D);

}
