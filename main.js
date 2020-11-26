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

//The necessary config to call the API.
const axiosConfig = {
  headers: {
    "Content-Type": "text/plain; charset=utf-8",
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers":
      "Accept, Content-Type, Content-Length, Accept-Encoding, X-CSRF-Token, Authorization",
    "Access-Control-Allow-Methods": "POST, GET, OPTIONS, PUT, DELETE",
  },
};
const proxyurl = "https://cors-anywhere.herokuapp.com/"; //This proxy is used to avoid CORS problems.
const apiUrl = "http://golmole.ddns.net:8080/traceroute";
const baseUrl = "http://golmole.ddns.net:8080";

//Adds the listeners to the buttons
document.getElementById("singleIP").addEventListener("click", getOneRoute);
document.getElementById("allIP").addEventListener("click", getAllRoutes);

let formattedData = [];
useGeographic();

//This function formats the data returned by the API, in the variable formattedData
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

//This function is used to format the hops in a useful way to create the lines.
let formatHops = function (hops) {
  if (hops != null) {
    for (let i = 0; i < hops.length - 1; i++) {
      let formattedHop = {
        source: hops[i],
        dest: hops[i + 1],
      };
      formattedData.push(formattedHop);
    }
  }
};

//Creates the features (the lines for the routes)
let addFeaturesToMap = function () {
  let features = formattedData.map((hop) => {
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

//Initialize the map at a certain point.
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

//Creates the style for the lines that will be displayed for the routes.
let styleFunction = function (feature) {
  let geometry = feature.getGeometry();
  //var randomColor = Math.floor(Math.random() * 16777215).toString(16);
  let styles = [
    new Style({
      stroke: new Stroke({
        // color: "#" + randomColor,
        color: [128, 128, 128],
        width: 1,
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

//Retrieves one traceroute result from the API.
function getOneRoute() {
  console.log("requête post - 1 ip");
  let ipAddress = document.getElementById("inputSingleIP").value;
  document.getElementById("loader").style.display = "block";
  if (validateIPorURL(ipAddress)) {
    let body = { address: ipAddress };
    axios.post(proxyurl + apiUrl, body, axiosConfig).then((response) => {
      document.getElementById("loader").style.display = "none";
      console.log("single route : ", response);
      formatData(response);
      addFeaturesToMap();
    });
  } else {
    alert("You need to insert a valid URL or IPv4");
  }
}

//Retrieves all routes from the API.
function getAllRoutes() {
  console.log("requête get - toutes les ip");

  axios
    .get(proxyurl + baseUrl + "/all-routes", axiosConfig)
    .then((response) => {
      console.log("response : ", response);

      formatData(response);
      addFeaturesToMap();
      // let test = formattedData.reduce(
      //   (map, hop) => ({
      //     ...map,
      //     [hop]: (map[hop] || 0) + 1,
      //   }),
      //   {}
      // );
      console.log("formattedData : ", test);
    });
}

function validateIPorURL(ipaddress) {
  var pattern = new RegExp(
    "^(https?:\\/\\/)?" + // protocol
      "((([a-z\\d]([a-z\\d-]*[a-z\\d])*)\\.)+[a-z]{2,}|" + // domain name
      "((\\d{1,3}\\.){3}\\d{1,3}))" + // OR ip (v4) address
      "(\\:\\d+)?(\\/[-a-z\\d%_.~+]*)*" + // port and path
      "(\\?[;&a-z\\d%_.~+=-]*)?" + // query string
      "(\\#[-a-z\\d_]*)?$",
    "i"
  ); // fragment locator
  return !!pattern.test(ipaddress);
}
