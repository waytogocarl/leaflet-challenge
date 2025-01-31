// Create the 'basemap' tile layer that will be the background of our map.
let topo = L.tileLayer('https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png', {
	attribution: 'Map data: &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, <a href="http://viewfinderpanoramas.org">SRTM</a> | Map style: &copy; <a href="https://opentopomap.org">OpenTopoMap</a> (<a href="https://creativecommons.org/licenses/by-sa/3.0/">CC-BY-SA</a>)',
  });

// OPTIONAL: Step 2
// Create the 'street' tile layer as a second background of the map
let streetmap = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
  attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
});

// Create the map object with center and zoom options.
// Then add the 'basemap' tile layer to the map.
let baseMaps = {
  "Topography": topo,
  "Street": streetmap
};

// OPTIONAL: Step 2
// Create the layer groups, base maps, and overlays for our two sets of data, earthquakes and tectonic_plates.
let layers = {
  Earthquakes: new L.LayerGroup(),
  Tectonic_Plates: new L.LayerGroup()
};

let myMap = L.map("map", {
  center: [40.73, -96],
  zoom: 5,
  layers: [streetmap]
});

// Add a control to the map that will allow the user to change which layers are visible.
L.control.layers(baseMaps, layers).addTo(myMap);


// Make a request that retrieves the earthquake geoJSON data.
d3.json("https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_month.geojson").then(function (data) {

  // This function returns the style data for each of the earthquakes we plot on
  // the map. Pass the magnitude and depth of the earthquake into two separate functions
  // to calculate the color and radius.
  function styleInfo(feature) {
    // extract magnitude and depth
    const magnitude = feature.properties.mag;
    const depth = feature.geometry.coordinates[2];
    // use the getColor function to determine color based on depth
    const color = getColor(depth)
    // calculate radius
    const radius = calculateRadius(magnitude)
    // return the style object
    return {
      radius: radius,
      fillColor: color,
      fillOpacity: 0.6,
      weight: 0.5,
      color: "black", // border color
      opacity: 1.0 // border opacity
    };

  }

  // This function determines the color of the marker based on the depth of the earthquake.
  function getColor(depth) {
    if (depth > 90) return "red";
    else if (depth > 70) return "orange";
    else if (depth > 50) return "gold";
    else if (depth > 30) return "yellow";
    else if (depth >= 10) return "lightgreen";
    else return "pink";
  }

  // This function determines the radius of the earthquake marker based on its magnitude.
  function calculateRadius(magnitude) {
    if (magnitude === 0) {
      return 1;
    }
    return magnitude * 4;
  }


  // Add a GeoJSON layer to the map once the file is loaded.
  let earthquakes = L.geoJson(data, {
    // Turn each feature into a circleMarker on the map.
    pointToLayer: function (feature, latlng) {
      return L.circleMarker(latlng);
    },
    // Set the style for each circleMarker using our styleInfo function.
    style: styleInfo,
    // Create a popup for each marker to display the magnitude and location of the earthquake after the marker has been created and styled
    onEachFeature: function (feature, layer) {
      //"Magnitude: " + feature.properties.mag + "<br>" + "Location: " + feature.properties.place it is being used for string concatenation. It combines the static strings ("Magnitude: ", "", and "Location: ")
      layer.bindPopup(
        "Magnitude: "
        + feature.properties.mag 
        + "<br>Depth" 
        + feature.geometry.coordinates[2] 
        + "<br>Location: " 
        + feature.properties.place
      );
    }
  // OPTIONAL: Step 2
  // Add the data to the earthquake layer instead of directly to the map.
  });

  layers.Earthquakes.addLayer(earthquakes);
  layers.Earthquakes.addTo(myMap)



  // Create a legend control object.
  let legend = L.control({ 
    position: "bottomright"
  });

  // Then add all the details for the legend
  legend.onAdd = function () {
    let div = L.DomUtil.create("div", "info legend");

    // Initialize depth intervals and colors for the legend
    let depthRanges = [-10, 10, 30, 50, 70, 90];
    let depthColors = [
      "#FFC0CB", 
      "#90EE90", 
      "#FFFF00", 
      "#FFD700", 
      "#FFA500", 
      "#FF0000"
    ];

    // Loop through our depth intervals to generate a label with a colored square for each interval.
    for (let i = 0; i < depthRanges.length; i++) {
      div.innerHTML += '<i style="background: ' + depthColors[i] + '"></i> '
        + depthRanges[i] +  (depthRanges[i + 1] ? "&ndash;" + depthRanges[i + 1] + "<br>" : "+");
    }
    return div;
  };

  // Finally, add the legend to the map.
  legend.addTo(myMap);


  // OPTIONAL: Step 2
  // Make a request to get our Tectonic Plate geoJSON data.
  d3.json("https://raw.githubusercontent.com/fraxen/tectonicplates/master/GeoJSON/PB2002_boundaries.json").then(function (plate_data) {
    // Save the geoJSON data, along with style information, to the tectonic_plates layer.
    let tectonic_plates = L.geoJSON(plate_data, {
      color: "orange",
      weight: 2,
      opacity: 1
    });

    // Then add the tectonic_plates layer to the map.
    layers.Tectonic_Plates.addLayer(tectonic_plates);
    layers.Tectonic_Plates.addTo(myMap)
    
  });
});
