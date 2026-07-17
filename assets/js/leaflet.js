// Constants

const BDR_URL_STEM = "https://repository.library.brown.edu",
  BDR_URL_ITEM_STEM = `${BDR_URL_STEM}/studio/item`,
  BDR_URL_THUMB_STEM = `${BDR_URL_STEM}/viewers/image/thumbnail`,
  FLIGHTPATH_DATA_URL = "/B8649_flightpath.geojson",
  KIOSK_DATA = "/kiosk.geojson";

// HTML for the Find Coordinates control

const FIND_COORDS_CTL_HTML = `
  <form>
    <fieldset>
      <legend>Find Coordinates</legend>
      <label for="ctrl-lat">Latitude
          <input type="number" id="ctrl-lat" placeholder="Latitude (e.g. 29.97)" step="any" required>
      </label>
      <label for="ctrl-lng">Longitude
          <input type="number" id="ctrl-lng" placeholder="Longitude (e.g. 31.13)" step="any" required>
      </label>
    </fieldset>
    <button id="ctrl-submit" type="button">Add Marker</button>
  </form>`;

// a key for the canister colors
const CANISTER_KEY_HTML = `
  <ul>
    <li>
      <label for="green"><input id="green" type="color" value="#a3bc7e" disabled /> Left</label>
    </li>
    <li>
      <label for="blue"><input id="blue" type="color" value="#94cfe1" disabled /> Right</label>
    </li>
  </ul>`;

// Set up basemaps

function initializeBasemaps(L) {
  const basemaps = {
    Terrain: L.tileLayer(
      "https://tiles.stadiamaps.com/tiles/stamen_terrain/{z}/{x}/{y}{r}.{ext}",
      {
        attribution:
          '&copy; <a href="https://www.stadiamaps.com/" target="_blank">Stadia Maps</a> &copy; <a href="https://www.stamen.com/" target="_blank">Stamen Design</a> &copy; <a href="https://openmaptiles.org/" target="_blank">OpenMapTiles</a> &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
        ext: "png",
      },
    ),
    Satellite: L.tileLayer(
      "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
      {
        attribution:
          "Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community",
      },
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
      layer.setStyle({ color: "white" });
      layer.addTo(flightLayer);
    },
  });
  return flightLayer;
}

// init kiosk layer
function initKiosk(L) {
  let kioskLayer = L.featureGroup();
  let kioskPoints = new L.GeoJSON.AJAX(KIOSK_DATA, {
    onEachFeature: function (feature, layer) {
      // Extract UIDs from the nested structure
      const uids = feature.properties.u2ers_site_files || [];

      // Flatten and format the URLs
      const images = uids
        .flatMap((file) =>
          file.images.map(
            (img) => `<img src="/kiosk/${img.uid}.webp" width="100" />`,
          ),
        )
        .join("");

      layer.bindPopup(`
            <p><a href="/kiosk/${feature.properties.site_id}">${feature.properties.site_name}</a></p>
            <div class="thumbs">
                ${images || "No images available"}
            </div>
        `);
      layer.addTo(kioskLayer);
    },
  });
  return kioskLayer;
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
    photoMeta
      .map(
        (photo) =>
          `<li>Canister ${photo.canister}, frame ${photo.frame}: 
            <a href="${BDR_URL_ITEM_STEM}/${photo.pid}" target="_blank">${photo.pid} 
              <svg xmlns="http://www.w3.org/2000/svg" x="0px" y="0px" width="16" height="16" viewBox="0 0 28 28">
                <path d="M 25.980469 2.9902344 A 1.0001 1.0001 0 0 0 25.869141 3 L 20 3 A 1.0001 1.0001 0 1 0 20 5 L 23.585938 5 L 13.292969 15.292969 A 1.0001 1.0001 0 1 0 14.707031 16.707031 L 25 6.4140625 L 25 10 A 1.0001 1.0001 0 1 0 27 10 L 27 4.1269531 A 1.0001 1.0001 0 0 0 25.980469 2.9902344 z M 6 7 C 4.9069372 7 4 7.9069372 4 9 L 4 24 C 4 25.093063 4.9069372 26 6 26 L 21 26 C 22.093063 26 23 25.093063 23 24 L 23 14 L 23 11.421875 L 21 13.421875 L 21 16 L 21 24 L 6 24 L 6 9 L 14 9 L 16 9 L 16.578125 9 L 18.578125 7 L 16 7 L 14 7 L 6 7 z"></path>
              </svg>
            </a>
          </li>`,
      )
      .join("") +
    "</ul>";

  L.popup(clickCoords, { content: popupContent }).openOn(map);
}

// Map click handler
// If user clicks on a BDR box, show a popup with links to
//  the BDR items that fall under that box

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
        frame: feature.properties.Frame,
        canister: feature.properties.Canister,
      };
    });
  // only show the popup if the click is in a box
  if (photoMeta.length) {
    createPopup(photoMeta, [lat, lng], map, L);
  }
}

// Add a BDR image and its bounds to the map layer

function addBdrFeature(bdr, boxStyle, L, feature, layer) {
  // get BDR pid for each set of coordinates so we can grab
  // the image from there; we don't need hi-res images here

  let pid = feature.properties.pid;
  let bdrThumb = `${BDR_URL_THUMB_STEM}/${pid}`;

  // grab the canister number so we can color-code
  if (
    feature.properties.Canister >= 5796 &&
    feature.properties.Canister <= 5804
  ) {
    layer.setStyle({ color: "#a3bc7e" });
  } else if (
    feature.properties.Canister >= 5812 &&
    feature.properties.Canister <= 5820
  ) {
    layer.setStyle({ color: "#94cfe1" });
  } else layer.setStyle({ color: "#fff" });

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
}

// Set up the control for finding coordinates

function initializeFindCoordinatesControl(map, L) {
  // Keep track of the user input marker so we can move or replace it
  let currentMarker = null;
  // Define the custom colored icon
  const inputIcon = L.divIcon({
    className: "custom-pin-container", // Wrapper class
    iconAnchor: [0, 24], // Point of the icon which will correspond to marker's location
    popupAnchor: [0, -30], // Point from which the popup should open relative to the iconAnchor
    html: '<div class="custom-pin"></div>', // The actual HTML structure
  });

  const onAddMarkerClick = function (form, e) {
    const coordinateForm = form.querySelector("form"),
      latInput = form.querySelector("#ctrl-lat"),
      lngInput = form.querySelector("#ctrl-lng"),
      latVal = parseFloat(latInput.value),
      lngVal = parseFloat(lngInput.value);

    // Validate coordinates
    if (isNaN(latVal) || isNaN(lngVal)) {
      alert("Please enter valid numeric latitude and longitude values.");
      return;
    }
    if (latVal < -90 || latVal > 90 || lngVal < -180 || lngVal > 180) {
      alert(
        "Coordinates out of range. Latitude must be between -90 and 90. Longitude must be between -180 and 180.",
      );
      return;
    }

    const targetLatLng = [latVal, lngVal];

    // Remove existing marker if it exists
    if (currentMarker) {
      map.removeLayer(currentMarker);
    }

    // Add new marker
    currentMarker = L.marker(targetLatLng, { icon: inputIcon })
      .addTo(map)
      .bindPopup(`<b>Custom Coordinate</b><br>Lat: ${latVal}<br>Lon: ${lngVal}`)
      .openPopup();

    // Center the map on the new marker
    map.setView(targetLatLng, 14);

    return true;
  };

  const onAddFindCoordinatesControl = function (map) {
    let form = L.DomUtil.create("div", "coordinate-control-container");
    form.innerHTML += FIND_COORDS_CTL_HTML;

    // Handle the button click inside the control
    const addMarkerSubmitButton = form.querySelector("#ctrl-submit");
    L.DomEvent.on(
      addMarkerSubmitButton,
      "click",
      onAddMarkerClick.bind(null, form),
    );
    L.DomEvent.disableClickPropagation(form);
    return form;
  };

  L.Control.inputControl = L.Control.extend({
    position: "bottomright", // Set default position
    onAdd: onAddFindCoordinatesControl,
  });

  const inputControl = new L.Control.inputControl();
  inputControl.addTo(map);
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

  // Add Kiosk points
  const kioskLayer = initKiosk(L);

  // Style photo boxes
  let boxStyle = {
    weight: 2,
    fillOpacity: 0,
  };

  let bdr = L.featureGroup();
  let boxes = new L.GeoJSON.AJAX("/geolocated.geojson", {
    onEachFeature: addBdrFeature.bind(null, bdr, boxStyle, L),
  });

  // establish the overlays
  let overlayMaps = {
    Flights: flightLayer,
    Images: bdr,
    Sites: kioskLayer,
  };
  bdr.addTo(map);

  // Allow user to choose what overlays to display
  const layerControl = L.control
    .layers(basemaps, overlayMaps, { collapsed: false, position: "topright" })
    .addTo(map);

  let canisterLegend = new L.control({ position: "topright" });
  canisterLegend.onAdd = function (map) {
    let div = L.DomUtil.create("div", "info legend");
    div.innerHTML += CANISTER_KEY_HTML;
    return div;
  };
  canisterLegend.addTo(map);

  // Set up viewer for mouse onclick coordinates
  let coordControl = new L.Control.Coordinates({ position: "bottomright" });
  coordControl.addTo(map);

  // Get BDR json
  const json = await getBdrData();

  // Add click handler for map (shows popup with BDR links if click is in a box)
  map.on("click", (a) => mapClickHandler(a, coordControl, json, map, L));

  // BEGIN FIND COORDINATES CONTROL
  initializeFindCoordinatesControl(map, L);
  // END FIND COORDINATES CONTROL
}

initializeMap();
