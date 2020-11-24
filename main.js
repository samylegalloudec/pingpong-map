import "ol/ol.css";
import Draw from "ol/interaction/Draw";
import olMap from "ol/Map";
import Point from "ol/geom/Point";
import { Feature } from "ol/index";
import { LineString } from "ol/geom";
import View from "ol/View";
import { Icon, Stroke, Style } from "ol/style";
import { OSM, Vector as VectorSource } from "ol/source";
import { Tile as TileLayer, Vector as VectorLayer } from "ol/layer";
import axios from "axios";
import { useGeographic } from "ol/proj";

const axiosConfig = {
  headers: {
    "Content-Type": "text/plain; charset=utf-8",
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers":
      "Accept, Content-Type, Content-Length, Accept-Encoding, X-CSRF-Token, Authorization",
    "Access-Control-Allow-Methods": "POST, GET, OPTIONS, PUT, DELETE",
  },
};
const proxyurl = "https://cors-anywhere.herokuapp.com/";
const apiUrl = "http://golmole.ddns.net:8080/traceroute";
const baseUrl = "http://golmole.ddns.net:8080";
const body = { address: "86.193.116.231" };

document.getElementById("singleIP").addEventListener("click", getOneRoute);
document.getElementById("allIP").addEventListener("click", getAllRoutes);

let formattedData = [];
let numberOfRoutesByHop = new Map();
useGeographic();

let formatData = function (axiosResponse) {
  if (Array.isArray(axiosResponse.data)) {
    for (let ip of axiosResponse.data) {
      formatHops(ip.hops);
    }
  } else {
    let hops = axiosResponse.data.hops;
    formatHops(hops);
  }
};

let formatHops = function (hops) {
  if (hops != null) {
    for (let i = 0; i < hops.length - 1; i++) {
      let formattedHop = {
        source: hops[i],
        dest: hops[i + 1],
      };
      formattedData.push(formattedHop);
      numberOfRoutesByHop.set(formattedHop, 1);
    }
  }
};

let addFeaturesToMap = function () {
  console.log("data :", formattedData);
  let features = formattedData.map((hop) => {
    console.log("hop : ", hop);
    let src = hop.source;
    let dest = hop.dest;
    let ping = [
      [
        src.location.lon !== "" ? src.location.lon : 0,
        src.location.lat !== "" ? src.location.lat : 0,
      ],
      [
        dest.location.lon !== "" ? dest.location.lon : 0,
        dest.location.lat !== "" ? dest.location.lat : 0,
      ],
    ];

    return new Feature(new LineString(ping));
  });

  let layer = new VectorLayer({
    source: new VectorSource({
      features: features,
    }),
    style: styleFunction,
  });

  map.addLayer(layer);
};

var raster = new TileLayer({
  source: new OSM(),
});
var source = new VectorSource();
var vector = new VectorLayer({
  source: source,
  style: styleFunction,
});
var place = [4.835659, 45.764043];
var map = new olMap({
  target: "map",
  view: new View({
    center: place,
    zoom: 1,
  }),
  layers: [
    new TileLayer({
      source: new OSM(),
    }),
  ],
});

let styleFunction = function (feature) {
  let geometry = feature.getGeometry();
  var randomColor = Math.floor(Math.random() * 16777215).toString(16);
  let styles = [
    new Style({
      stroke: new Stroke({
        // color: "#" + randomColor,
        color: [50, 0, 0],
        width: 2,
      }),
    }),
  ];

  geometry.forEachSegment(function (start, end) {
    let dx = end[0] - start[0];
    let dy = end[1] - start[1];
    let rotation = Math.atan2(dy, dx);
    // arrows
    styles.push(
      new Style({
        geometry: new Point(end),
        // image: new Icon({
        //   src: "./data/arrow.png",
        //   anchor: [0.75, 0.5],
        //   rotateWithView: true,
        //   rotation: -rotation,
        // }),
      })
    );
  });

  return styles;
};

map.on("pointermove", function (event) {
  if (map.hasFeatureAtPixel(event.pixel)) {
    map.getViewport().style.cursor = "pointer";
  } else {
    map.getViewport().style.cursor = "inherit";
  }
});

function getOneRoute() {
  console.log("requête post - 1 ip");
  axios.post(proxyurl + apiUrl, body, axiosConfig).then((response) => {
    console.log("single route : ", response);
    formatData(response);
    addFeaturesToMap();
  });
}

function getAllRoutes() {
  console.log("requête get - toutes les ip");
  axios
    .get(proxyurl + baseUrl + "/all-routes", axiosConfig)
    .then((response) => {
      console.log("response : ", response);
      formatData(response);
      addFeaturesToMap();
      let test = formattedData.reduce(function (obj, value) {
        console.log(obj);
        console.log(value);
      });
      console.log("test : ", test);
    });
}

// map.addInteraction(
//   new Draw({
//     source: source,
//     type: "LineString",
//   })
// );
