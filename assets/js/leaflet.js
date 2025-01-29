let map = L.map('map', {
    minZoom: 5,
    //attributionControl: false,
    zoomControl: true,
}).setView([29.9415, 31.1449], 11);
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

// api
//let bdroverlay = L.imageOverlay("https://repository.library.brown.edu/studio/thumbnail/bdr:6cnew3p2", gizaBounds, { opacity: 0.75, interactive: true });
// local manipulated img
//let bdroverlay = L.imageOverlay("/804/warped.png",[gizaBounds], {opacity:0.75, interactive: true});
//let rect = L.polygon(gizaBounds, { fillOpacity: 0, color: "red" });
/*rect.on('click', function(b) {
    event.preventDefault(); //to avoid changes the current page url
    window.open('https://repository.library.brown.edu/viewers/mirador/bdr:6cnew3p2/'); //the behavior is defined by the browser and user options
    return false; // prevents the default action associated with the event

});
let laurel = L.featureGroup([rect, bdroverlay]);
*/
let box = {
    "color": "red",
    "weight": 2,
    "fillOpacity": 0,
};

let flightLayer = L.featureGroup();
let flightPaths = new L.GeoJSON.AJAX("/B8649_flightpath.geojson", {
    onEachFeature: function(feature,layer) {
        let mission = feature.properties.MISSION;
        //const randomColor = '#'+Math.floor(Math.random()*16777215).toString(16);
        layer.bindPopup("Mission #" + mission);
        //.setStyle({"color": randomColor})
        layer.setStyle({"color": "red"});
        layer.addTo(flightLayer);
    }
})

/*let combo = L.featureGroup();
let bdrjson = new L.GeoJSON.AJAX("/bdr.geojson", {
    // build each polygon
    onEachFeature: function(feature, layer) {
        let pid = feature.properties.pid;
        let geoArray = feature.geometry.coordinates;
        // we have to take the arrays of coordinates from the geojson and flip them to be lon/lat for the rotated image overlay.
        // why? no one knows.
        let first = geoArray[0][0].reverse();
        let second = geoArray[0][1].reverse();
        let third = geoArray[0][2].reverse();
        let bottomleft = L.latLng(first),
            topleft = L.latLng(second),
            topright = L.latLng(third);

        if (pid.startsWith('bdr')) {
            let bdrViewer = "https://repository.library.brown.edu/studio/item/" + pid;
            let bdrThumb = "https://repository.library.brown.edu/studio/thumbnail/" + pid;

            // draw the outline
            layer.setStyle(box);
            // add the image overlay; if the bounding box is not a rectangle, it will not fit
            //let overlay = L.imageOverlay(bdrThumb, layer.getBounds(), {opacity: 1, interactive: true, className: pid });
            // rotate the overlay
            let rotation  = L.imageOverlay.rotated(bdrThumb, topleft, topright, bottomleft, {opacity: 1, interactive: true });

            // group the outline and overlay
            //overlay.addTo(combo);
            rotation.addTo(combo);
            layer.addTo(combo);

            // send user to BDR on click
            combo.on('click', function(c) {
                event.preventDefault(); //to avoid changes the current page url
                window.open(bdrViewer); //the behavior is defined by the browser and user options
                return false; // prevents the default action associated with the event)
            });
        }
    }
});
*/

let bounding_boxes = L.featureGroup();
let bboxes = new L.GeoJSON.AJAX("/bbox_sample.geojson", {
    // build each polygon
    onEachFeature:function(feature,layer) {
        // draw the outline
        layer.setStyle(box);
        layer.bindPopup("Frame: " + feature.properties.Frame);

        layer.addTo(bounding_boxes);

    }

});

// establish the overlays
let overlayMaps = {
    "Flights": flightLayer,
    //"Demo": combo,
    "Bounding boxes": bounding_boxes
};

// Allow user to choose what overlays to display
const layerControl = L.control.layers(basemaps, overlayMaps, { collapsed: false, position: 'topright' }).addTo(map);

// Provide coordinates of mouse
let c = new L.Control.Coordinates({ position: 'topright' });
c.addTo(map);
map.on('click', function(a) {
    c.setCoordinates(a);
});
