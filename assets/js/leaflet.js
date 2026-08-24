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
          <input type="number" id="ctrl-lat" placeholder="Latitude (e.g. 29.97)" min="-90" max="90" step="any" required>
      </label>
      <label for="ctrl-lng">Longitude
          <input type="number" id="ctrl-lng" placeholder="Longitude (e.g. 31.13)" min="-180" max="180" step="any" required>
      </label>
    </fieldset>
    <button id="ctrl-submit" type="button">Add Marker</button>
    &nbsp;
    <button id="ctrl-remove" type="button" disabled>Remove Marker</button>
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
      layer.bindPopup("Mission #" + mission);
      layer.setStyle({ color: "white" });
      layer.addTo(flightLayer);
    },
  });
  return flightLayer;
}

function initKiosk(L) {
  let kioskLayer = L.featureGroup();
  let kioskPoints = new L.GeoJSON.AJAX(KIOSK_DATA, {
    onEachFeature: function (feature, layer) {
      const siteId = feature.properties.site_id;
      const uids = feature.properties.u2ers_site_files || [];

      // Generate individual links for EACH image using img.uid
      const images = uids
        .flatMap((file) =>
          file.images.map(
            (img) => `
              <a href="/kiosk/${siteId}/?uid=${img.uid}">
                <img src="/kiosk/${img.uid}.webp" width="100" alt="" />
              </a>
            `,
          ),
        )
        .join("");

      layer.bindPopup(`
        <p><a href="/kiosk/${siteId}">${feature.properties.site_name}</a></p>
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
    const json = await response.json();
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

function mapClickHandler(a, coordControl, json, map, L) {
  if (coordControl && typeof coordControl.setCoordinates === "function") {
    coordControl.setCoordinates(a);
  }
  
  const lat = a.latlng.lat,
    lng = a.latlng.lng,
    turfClickCoords = turf.point([lng, lat]);

  if (!json || !json.features) return;

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

  if (photoMeta.length) {
    createPopup(photoMeta, [lat, lng], map, L);
  }
}

// Add a BDR image and its bounds to the map layer

function addBdrFeature(bdr, boxStyle, L, feature, layer) {
  let pid = feature.properties.pid;
  let bdrThumb = `${BDR_URL_THUMB_STEM}/${pid}`;

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

  let bdrViewer = `${BDR_URL_ITEM_STEM}/${pid}`;
  let geoArray = feature.geometry.coordinates;

  const first = geoArray[0][0][0].slice().reverse(),
    second = geoArray[0][0][1].slice().reverse(),
    third = geoArray[0][0][3].slice().reverse();

  const image = L.imageOverlay.rotated(bdrThumb, first, second, third, {
    opacity: 0.5,
    interactive: true,
  });
  image.addTo(bdr);
  layer.addTo(bdr).setStyle(boxStyle);
}

// Set up the control for finding coordinates

function initializeFindCoordinatesControl(map, L) {
  let currentMarker = null;

  const inputIcon = L.divIcon({
    className: "custom-pin-container",
    iconAnchor: [0, 24],
    popupAnchor: [0, -30],
    html: '<div class="custom-pin"></div>',
  });

  const onAddMarkerClick = function (form, e) {
    const coordinateForm = form.querySelector("form"),
      latInput = form.querySelector("#ctrl-lat"),
      lngInput = form.querySelector("#ctrl-lng"),
      latVal = parseFloat(latInput.value),
      lngVal = parseFloat(lngInput.value);

    latInput.setCustomValidity("");
    lngInput.setCustomValidity("");

    if (isNaN(latVal)) {
      latInput.setCustomValidity("Please enter a valid numeric latitude.");
    } else if (isNaN(lngVal)) {
      lngInput.setCustomValidity("Please enter a valid numeric longitude.");
    } else if (latVal < -90 || latVal > 90) {
      latInput.setCustomValidity("Latitude must be between -90 and 90.");
    } else if (lngVal < -180 || lngVal > 180) {
      lngInput.setCustomValidity("Longitude must be between -180 and 180.");
    }

    if (!coordinateForm.reportValidity()) {
      return;
    }

    const targetLatLng = [latVal, lngVal];

    if (currentMarker) {
      map.removeLayer(currentMarker);
    }

    currentMarker = L.marker(targetLatLng, { icon: inputIcon })
      .addTo(map)
      .bindPopup(`<b>Custom Coordinate</b><br>Lat: ${latVal}<br>Lon: ${lngVal}`)
      .openPopup();
    map.setView(targetLatLng, 14);

    // enable remove button
    const removeMarker = form.querySelector("#ctrl-remove");
    if (removeMarker) {
      removeMarker.disabled = false;
    }

    return true;
  };

  const onAddFindCoordinatesControl = function (map) {
    let form = L.DomUtil.create("div", "coordinate-control-container");
    form.innerHTML += FIND_COORDS_CTL_HTML;

    const addMarkerSubmitButton = form.querySelector("#ctrl-submit");
    const removeMarkerBtn = form.querySelector("#ctrl-remove");

    L.DomEvent.on(
      addMarkerSubmitButton,
      "click",
      onAddMarkerClick.bind(null, form),
    );

    // Bind remove click listener during initialization
    L.DomEvent.on(removeMarkerBtn, "click", () => {
      if (currentMarker) {
        map.removeLayer(currentMarker);
        currentMarker = null;
        removeMarkerBtn.disabled = true;
      }
    });

    L.DomEvent.disableClickPropagation(form);
    L.DomEvent.disableScrollPropagation(form);
    return form;
  };

  L.Control.inputControl = L.Control.extend({
    position: "bottomright",
    onAdd: onAddFindCoordinatesControl,
  });

  const inputControl = new L.Control.inputControl();
  inputControl.addTo(map);
}

// Main map setup function

async function initializeMap() {
  let map = L.map("map", {
    minZoom: 5,
    maxZoom: 20,
    zoomControl: true,
  }).setView([30.407, 30.368], 8);

  const basemaps = initializeBasemaps(L);
  basemaps.Satellite.addTo(map);

  const flightLayer = initializeFlightPaths(L);
  const kioskLayer = initKiosk(L);

  let boxStyle = {
    weight: 2,
    fillOpacity: 0,
  };

  let bdr = L.featureGroup();
  let boxes = new L.GeoJSON.AJAX("/geolocated.geojson", {
    onEachFeature: addBdrFeature.bind(null, bdr, boxStyle, L),
  });

  const overlayMaps = {
    Flights: flightLayer,
    Images: bdr,
    Sites: kioskLayer,
  };
  bdr.addTo(map);

  L.control
    .layers(basemaps, overlayMaps, { collapsed: false, position: "topright" })
    .addTo(map);

  const canisterLegend = new L.control({ position: "topright" });
  canisterLegend.onAdd = function (map) {
    let div = L.DomUtil.create("div", "info legend");
    div.innerHTML += CANISTER_KEY_HTML;
    return div;
  };
  canisterLegend.addTo(map);

  const coordControl = new L.Control.Coordinates({ position: "bottomright" });
  coordControl.addTo(map);

  initializeFindCoordinatesControl(map, L);

  const json = await getBdrData();

  map.on("click", (a) => mapClickHandler(a, coordControl, json, map, L));
}

initializeMap();