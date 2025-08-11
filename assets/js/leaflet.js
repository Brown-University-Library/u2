let map = L.map('map', {
    minZoom: 5,
    maxZoom: 20,
    zoomControl: true
}).setView([30.407, 30.368], 8);
const basemaps = {
    Topo: L.tileLayer('https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png', {
        attribution: 'Map data: &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, <a href="http://viewfinderpanoramas.org">SRTM</a> | Map style: &copy; <a href="https://opentopomap.org">OpenTopoMap</a> (<a href="https://creativecommons.org/licenses/by-sa/3.0/">CC-BY-SA</a>)'
    }),
    Outdoors: L.tileLayer('https://tiles.stadiamaps.com/tiles/outdoors/{z}/{x}/{y}{r}.{ext}', {
        attribution: '&copy; <a href="https://www.stadiamaps.com/" target="_blank">Stadia Maps</a> &copy; <a href="https://openmaptiles.org/" target="_blank">OpenMapTiles</a> &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
        ext: 'png'
    }),
    Terrain: L.tileLayer('https://tiles.stadiamaps.com/tiles/stamen_terrain/{z}/{x}/{y}{r}.{ext}', {
        attribution: '&copy; <a href="https://www.stadiamaps.com/" target="_blank">Stadia Maps</a> &copy; <a href="https://www.stamen.com/" target="_blank">Stamen Design</a> &copy; <a href="https://openmaptiles.org/" target="_blank">OpenMapTiles</a> &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
        ext: 'png'
    }),
    Satellite: L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
        attribution: 'Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community'
    })
};
basemaps.Satellite.addTo(map);

let box = {
    "color": "red",
    "weight": 2,
    "fillOpacity": 0
};

let flightLayer = L.featureGroup();
let flightPaths = new L.GeoJSON.AJAX("/B8649_flightpath.geojson", {
    onEachFeature: function (feature, layer) {
        let mission = feature.properties.MISSION;
        //const randomColor = '#'+Math.floor(Math.random()*16777215).toString(16);
        layer.bindPopup("Mission #" + mission);
        //.setStyle({"color": randomColor})
        layer.setStyle({ "color": "red" });
        layer.addTo(flightLayer);
    }
})

function seeLayers(e) {
    map.fitBounds(e.target.getBounds());
    var point = turf.point([e.latlng.lng, e.latlng.lat]);
    var content = '';
    polygons.eachLayer(function (layer) {
        var feature = layer.feature;
        if (turf.booleanPointInPolygon(point, feature)) {
            content += "<p>" + point + "</p>";
        }
    });
    L.showPopover()
        .setLatLng(e.latlng)
        .setContent(content)
        .openOn(map);

}

let bdr = L.featureGroup();
let boxes = new L.GeoJSON.AJAX("/bbox_sample.geojson", {
    onEachFeature: function (feature, layer) {
        // get BDR pid for each set of coordinates so we can grab the image from there; we don't need hi-res images here 
        let pid = feature.properties.pid;
        let bdrThumb = "https://repository.library.brown.edu/studio/thumbnail/" + pid;
        // link to BDR item
        let bdrViewer = "https://repository.library.brown.edu/studio/item/" + pid;

        let geoArray = feature.geometry.coordinates;
        // we have to take the arrays of coordinates from the geojson and flip them to be lon/lat for the rotated image overlay.
        // why? no one knows. why is it 1-3-2? again: no one knows. the imageOverlayRotated plugin calls the required coordinates
        // topLeft, topRight, bottomLeft, but this may or may not correspond to the actual points on the map, so I've used more-generic words
        let first = geoArray[0][0][0].reverse();
        let second = geoArray[0][0][1].reverse();
        let third = geoArray[0][0][3].reverse();

        // put the BDR image on the map and skew it using points from the geojson, not the layer bounds
        let image = L.imageOverlay.rotated(bdrThumb, first, second, third, { opacity: 0.5, interactive: true });
        image.addTo(bdr);
        layer.addTo(bdr).setStyle(box);

        // show popup on mouseover
        layer.on('click', function (e) {
            seeLayers;
            //console.log(pid);
        });

        // send user to BDR item on click
        layer.on('click', function() {
            event.preventDefault(); //to avoid changes the current page url
            window.open(bdrViewer); //the behavior is defined by the browser and user options
            return false; // prevents the default action associated with the event)
        });
    }
});


// establish the overlays
let overlayMaps = {
    "Flights": flightLayer,
    "Images": bdr
};
// Allow user to choose what overlays to display
const layerControl = L.control.layers(basemaps, overlayMaps, { collapsed: false, position: 'topright' }).addTo(map);

// Provide coordinates of mouse
let c = new L.Control.Coordinates({ position: 'topright' });
c.addTo(map);
map.on('click', function (a) {
    c.setCoordinates(a);
});