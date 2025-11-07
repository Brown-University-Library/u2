// Constants

const BDR_URL_STEM = "https://repository.library.brown.edu",
  BDR_URL_ITEM_STEM = `${BDR_URL_STEM}/studio/item`,
  BDR_URL_THUMB_STEM = `${BDR_URL_STEM}/viewers/image/thumbnail`,
  FLIGHTPATH_DATA_URL =
    "/B8649_flightpath.geojson";

// Set up basemaps

function initializeBasemaps(L) {
  const basemaps = {
    Topo: L.tileLayer("https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png", {
      attribution:
        'Map data: &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, <a href="http://viewfinderpanoramas.org">SRTM</a> | Map style: &copy; <a href="https://opentopomap.org">OpenTopoMap</a> (<a href="https://creativecommons.org/licenses/by-sa/3.0/">CC-BY-SA</a>)',
    }),
    Outdoors: L.tileLayer(
      "https://tiles.stadiamaps.com/tiles/outdoors/{z}/{x}/{y}{r}.{ext}",
      {
        attribution:
          '&copy; <a href="https://www.stadiamaps.com/" target="_blank">Stadia Maps</a> &copy; <a href="https://openmaptiles.org/" target="_blank">OpenMapTiles</a> &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
        ext: "png",
      }
    ),
    Terrain: L.tileLayer(
      "https://tiles.stadiamaps.com/tiles/stamen_terrain/{z}/{x}/{y}{r}.{ext}",
      {
        attribution:
          '&copy; <a href="https://www.stadiamaps.com/" target="_blank">Stadia Maps</a> &copy; <a href="https://www.stamen.com/" target="_blank">Stamen Design</a> &copy; <a href="https://openmaptiles.org/" target="_blank">OpenMapTiles</a> &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
        ext: "png",
      }
    ),
    Satellite: L.tileLayer(
      "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
      {
        attribution:
          "Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community",
      }
    ),
  };

  return basemaps;
}

// Initialize flightpath layer

function initializeFlightPaths(L) {
  let flightLayer = L.featureGroup();
  let flightPaths = new L.GeoJSON.AJAX(FLIGHTPATH_DATA_URL, {
    onEachFeature: function (feature, layer) {
      const mission = feature.properties.MISSION;
      //const randomColor = '#'+Math.floor(Math.random()*16777215).toString(16);
      layer.bindPopup("Mission #" + mission);
      //layer.setStyle({"color": randomColor})
      layer.setStyle({ "color": "white" });
      layer.addTo(flightLayer);
    },
  });
  return flightLayer;
}

// fetch BDR geojson

async function getBdrData() {
  const url = "/geolocated.geojson";
  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Response status: ${response.status}`);
    }
    json = await response.json();
    return json;
  } catch (error) {
    console.error(error.message);
  }
}

// create map popup from BDR-PID list

function createPopup(photoMeta, clickCoords, map, L) {
  const popupContent =
    "<p>Linked BDR pages:</p><ul>" +
    photoMeta.map(
      (photo) =>
        `<li>Frame ${photo.frame}: <a href="${BDR_URL_ITEM_STEM}/${photo.pid}">Check out ${photo.pid}</a></li>`
    ).join("") +
    "</ul>";

  L.popup(clickCoords, { content: popupContent }).openOn(map);
}

// Map click handler

function mapClickHandler(a, coordControl, json, map, L) {
  // get the coordinates of the click

  coordControl.setCoordinates(a);
  const lat = a.latlng.lat,
    lng = a.latlng.lng,
    turfClickCoords = turf.point([lng, lat]); // gotta reverse lat-lng to lng-lat

  // Filter BDR items for those that fall under the click;
  // extract PIDs
  const photoMeta = json.features
    .filter((feature) => {
      const featureBox = feature.geometry.coordinates,
        featurePolygon = turf.multiPolygon(featureBox);
      return turf.booleanPointInPolygon(turfClickCoords, featurePolygon);
    })
    .map((feature) => {
      return {
        pid: feature.properties.pid,
        frame: feature.properties.Frame
      }
    });
  // only show the popup if the click is in a box
  if (photoMeta.length) {
    createPopup(photoMeta, [lat, lng], map, L);
  }
}

// Main map setup function

async function initializeMap() {
  // Initialize map object

  let map = L.map("map", {
    minZoom: 5,
    maxZoom: 20,
    zoomControl: true,
  }).setView([30.407, 30.368], 8);

  // Set up basemaps
  const basemaps = initializeBasemaps(L);
  basemaps.Satellite.addTo(map);

  // Add flightpaths

  const flightLayer = initializeFlightPaths(L);

  // Style photo boxes
  let boxStyle = {
    weight: 2,
    fillOpacity: 0,
  };

  // a key for the canister colors
  let canisterKey = "<ul><li><input type=\"color\" value=\"#a3bc7e\" disabled /> Canister 5813</li><li><input type=\"color\" value=\"#d99c91\" disabled /> Canister 5812</li><li><input type=\"color\" value=\"#c75037\" disabled /> Canister 5796</li></ul>";
  let canisterLegend = new L.control({ position: "bottomright" });
  canisterLegend.onAdd = function (map) {
    let div = L.DomUtil.create('div', 'info legend');
    div.innerHTML += canisterKey;
    return div;
  }
  canisterLegend.addTo(map);

  let bdr = L.featureGroup();
  let boxes = new L.GeoJSON.AJAX(
    "/geolocated.geojson",
    {
      onEachFeature: function (feature, layer) {
        // get BDR pid for each set of coordinates so we can grab
        // the image from there; we don't need hi-res images here

        let pid = feature.properties.pid;
        let bdrThumb = `${BDR_URL_THUMB_STEM}/${pid}`;

        // grab the canister number so we can color-code
        switch (feature.properties.Canister) {
          case 5813:
            layer.setStyle({ color: '#a3bc7e' });
            break;
          case 5812:
            layer.setStyle({ color: '#d99c91' });
            break;
          case 5796:
            layer.setStyle({ color: '#c75037' });
            break;
          default:
            layer.setStyle({ color: 'white' })
        }


        // link to BDR item

        let bdrViewer = `${BDR_URL_ITEM_STEM}/${pid}`;
        let geoArray = feature.geometry.coordinates;

        // we have to take the arrays of coordinates from the geojson and
        // flip them to be lon/lat for the rotated image overlay.
        // why? no one knows. why is it 1-3-2? again: no one knows.
        // the imageOverlayRotated plugin calls the required coordinates
        // topLeft, topRight, bottomLeft, but this may or may not correspond to
        // the actual points on the map, so I've used more-generic words

        const first = geoArray[0][0][0].reverse(),
          second = geoArray[0][0][1].reverse(),
          third = geoArray[0][0][3].reverse();

        // put the BDR image on the map and skew it using points from the geojson, not the layer bounds
        const image = L.imageOverlay.rotated(bdrThumb, first, second, third, {
          opacity: 0.5,
          interactive: true,
        });
        image.addTo(bdr);
        layer.addTo(bdr).setStyle(boxStyle);
      },

    },
  );

  // establish the overlays
  let overlayMaps = {
    Flights: flightLayer,
    Images: bdr,
  };
  bdr.addTo(map);
  
  // Allow user to choose what overlays to display
  const layerControl = L.control
    .layers(basemaps, overlayMaps, { collapsed: false, position: "topright" })
    .addTo(map);

  // Set up coordinate control for mouse onclick
  let coordControl = new L.Control.Coordinates({ position: "topright" });
  coordControl.addTo(map);

  // Get BDR json

  const json = await getBdrData();

  // Add click handler for map

  map.on("click", (a) => mapClickHandler(a, coordControl, json, map, L));
}

initializeMap();
