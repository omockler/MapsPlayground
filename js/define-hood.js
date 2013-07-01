var geocoder;
	var map;
	var infowindow = new google.maps.InfoWindow();
	var marker;
	var addresses = [];
	function initialize() {
		geocoder = new google.maps.Geocoder();
		var latlng = new google.maps.LatLng(39.64260533382056, -86.31097975350036);
		var mapOptions = {
			center: latlng,
			zoom: 12,
			mapTypeId: google.maps.MapTypeId.HYBRID
		};
		map = new google.maps.Map(document.getElementById("map-canvas"), mapOptions);

		var drawingManager = new google.maps.drawing.DrawingManager({
			drawingMode: google.maps.drawing.OverlayType.MARKER,
			drawingControl: true,
			drawingControlOptions: {
				position: google.maps.ControlPosition.TOP_CENTER,
				drawingModes: [
				google.maps.drawing.OverlayType.POLYGON,
				google.maps.drawing.OverlayType.RECTANGLE
				]
			}
		});
		drawingManager.setMap(map);
		google.maps.event.addListener(drawingManager, 'overlaycomplete', function(event) {
			if (event.type == google.maps.drawing.OverlayType.RECTANGLE) {
				var ne = event.overlay.bounds.getNorthEast();
				var sw = event.overlay.bounds.getSouthWest();
				var corners = {top: ne.lat(), bottom: sw.lat(), left: sw.lng(), right: ne.lng()};
				console.log(corners);
				var grid = CreateGrid(corners);
				codeGrid(grid);
			}
			if (event.type == google.maps.drawing.OverlayType.POLYGON) {
				var radius = event.overlay.getRadius();
			}
		});
	}

	function codeAddress(address) {
		geocoder.geocode( { 'address': address}, function(results, status) {
			if (status == google.maps.GeocoderStatus.OK) {
				map.setCenter(results[0].geometry.location);
				var marker = new google.maps.Marker({
					map: map,
					position: results[0].geometry.location
				});
			} else {
				alert("Geocode was not successful for the following reason: " + status);
			}
		});
	}

	function CreateGrid(corners) {
		var numGrid = 5;
		var height = corners.top - corners.bottom;
		var width = corners.right - corners.left;
		var vertStep = height / numGrid;
		var horzStep = width / numGrid;
		var coords = [];
		for (var i =  numGrid - 1; i >= 0; i--) {
			var currLng = corners.left + (horzStep * i);
			var smallCoords = [];
			for (var j = numGrid - 1; j >= 0; j--) {
				smallCoords.push({lng: currLng, lat:corners.bottom + (vertStep * j)});
			};
			coords.push(smallCoords);
		};
		return coords;
	}

	function codeGrid(grid) {
		grid.forEach(function(col) { 
			col.forEach(function(loc) { 
				var latlng = new google.maps.LatLng(loc.lat, loc.lng);
				geocoder.geocode({'latLng': latlng}, function (results, status) {
					if (status == google.maps.GeocoderStatus.OK) {
						if (results[0]) {
							console.log(results[0].formatted_address);
							addresses.push(results[0].formatted_address);
						} else {
							console.log("Failed due to no result");
						}
					} else {
						console.log("failed due to bad status: " + status);
					}
				});
			});
		});
	}

	function codeLatLng() {
		var latlng = new google.maps.LatLng(39.64260533382056, -86.31097975350036);
		geocoder.geocode({'latLng': latlng}, function(results, status) {
			if (status == google.maps.GeocoderStatus.OK) {
				if (results[1]) {
					map.setZoom(11);
					marker = new google.maps.Marker({
						position: latlng,
						map: map
					});
					infowindow.setContent(results[1].formatted_address);
					infowindow.open(map, marker);
				}
			} else {
				alert("Geocoder failed due to: " + status);
			}
		});
	}

	google.maps.event.addDomListener(window, 'load', initialize);