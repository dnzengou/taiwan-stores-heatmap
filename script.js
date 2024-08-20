// Prepare Leaflet map
		var mymap = L.map('mapid').setView([23.7, 120.9], 7); // create map
		L.tileLayer('http://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}.png', {
			maxZoom: 18
		}).addTo(mymap);

		//Load store list json file in sequence then visualize the data
		d3.queue()
			.defer(d3.json, "https://cdn.rawgit.com/purmac/63823c7401819b53b6afcd55c21af482/raw/5f86bfdc3438c4f6731439f71ecf179f58173429/cvs_7eleven.json")
			.defer(d3.json, "https://cdn.rawgit.com/purmac/63823c7401819b53b6afcd55c21af482/raw/5f86bfdc3438c4f6731439f71ecf179f58173429/cvs_familymart.json")
			.defer(d3.json, "https://cdn.rawgit.com/purmac/63823c7401819b53b6afcd55c21af482/raw/5f86bfdc3438c4f6731439f71ecf179f58173429/cvs_ok.json")
			.defer(d3.json, "https://cdn.rawgit.com/purmac/63823c7401819b53b6afcd55c21af482/raw/5f86bfdc3438c4f6731439f71ecf179f58173429/cvs_hilife.json")
			.await(visualize);

		var colors = ["#575D90", "#2C4251", "#3E92CC", "#DB162F"];
		var coord = [];

		// Main Visualization function
		function visualize(error, seven, family, ok, hilife) {
      
			//Convert loaded json data to GeoJSON (Maybe store geojson directly?)
			geojson_seven = convertGeoJSON(seven);
			geojson_family = convertGeoJSON(family);
			geojson_ok = convertGeoJSON(ok);
			geojson_hilife = convertGeoJSON(hilife);

			// Inititate Leaflet GeoJSON Layers
			seven_layer = plotStoresOnMap(geojson_seven, colors[0]);
			ok_layer = plotStoresOnMap(geojson_ok, colors[1]);
			family_layer = plotStoresOnMap(geojson_family, colors[2]);
			hilife_layer = plotStoresOnMap(geojson_hilife, colors[3]);
			heatmap = densityHeatMap();

			//Add to Leaflet Layer Control
			mymap.addLayer(heatmap); // Default Layer in the control
			var cvs_layer = {
				"7-Eleven": seven_layer, "Family Mart": family_layer,
				"Hi-Life": hilife_layer, "OK Mart": ok_layer, "Heatmap": heatmap
			};
      
			L.control.layers({}, cvs_layer, { collapsed: false }).addTo(mymap);
		};


		function densityHeatMap() {
			var options = {
				"max": 0.2,
				"radius": 10,
				"blur": 5
			};
      
			return L.heatLayer(coord, options);
		}

		// Convert JSON to GeoJSON
		function convertGeoJSON(d) {
			var geojson_data = new Array()
			for (var city in d) {
				for (var area in d[city]) {
					for (var i = 0; i < d[city][area].storeList.length; i++) {
						geojson = {
							"type": "Point",
							"coordinates": [d[city][area].storeList[i].Longitude, d[city][area].storeList[i].Latitude]
						};
						coord.push(L.latLng(d[city][area].storeList[i].Latitude, d[city][area].storeList[i].Longitude));
						geojson_data.push(geojson);
					};
				};
			};
			return geojson_data;
		};

    // Plot GeoJSON to map
		function plotStoresOnMap(data, color) {
			var geojsonMarkerOptions = {
				radius: 3,
				fillColor: color,
				//color: "#000",
				weight: 0,
				fillOpacity: 0.8
			};

			//Make GeoJSON Layer for CVS Data
			return L.geoJSON(data, {
				pointToLayer: function (feature, latlng) {
					return L.circleMarker(latlng, geojsonMarkerOptions);
				}
			});
		};