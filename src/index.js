import { render } from "react-dom";
import MyMap from "./MyMap";
import {OSM, Vector as VectorSource} from 'ol/source';
import View from "ol/View";
import {Tile as TileLayer, Vector as VectorLayer} from 'ol/layer';
import React, { Component } from "react";
import Map from "ol/Map";
import {useGeographic} from 'ol/proj';
import {Style, Circle, Fill, Stroke, Icon} from 'ol/style';
import Feature from 'ol/Feature';
import {Point, LineString} from 'ol/geom';

let fetch = require('node-fetch');


useGeographic();

let raster = new TileLayer({
  source: new OSM(),
});

let source = new VectorSource({wrapX:false});

let vector = new VectorLayer({
  source: source,
});

let map = new Map({
  layers: [raster, vector],
  target: 'map',
  view: new View({
    center: [2.3522, 48.8556],
    zoom: 4,
  }),
});


let styleFunction = function (feature){
  let geometry = feature.getGeometry();
  let styles = [
    new Style({
      stroke: new Stroke({
        color: '#ffcc33',
        width:2,
      })
    })
  ];

  geometry.forEachSegment(function (start, end){
    let dx = end[0] - start[0];
    let dy = end[1] - start[1];
    let rotation = Math.atan2(dy, dx);

    styles.push(
      new Style({
        geometry: new Point(end),
        image: new Icon({
          src: 'arrow.png',
          anchor: [0.75, 0.5],
          rotateWithView:true,
          rotation:-rotation,
        }),
      })
    )
  })
  return styles;
}

function getMapData(){


  fetch('https://aqueous-dusk-24314.herokuapp.com/ip/all').then((response) => {
      response.json().then((data) => {
          let features = data.map((res) => {
              let loc = [res.longitude, res.latitude];
              return new Feature(new Point(loc))
          });

          let layer = new VectorLayer({
              source: new VectorSource({
                  features: features
              }),
              style: new Style({
                  image: new Circle({
                      radius: 11,
                      fill: new Fill({color: 'red'})
                  })
              })
          });
          map.addLayer(layer)

      })
  });

  fetch('https://aqueous-dusk-24314.herokuapp.com/traceroute/all').then((response) => {

      response.json().then((data) => {
          let features = data.map((pingDat) => {
              let src = pingDat.src.properties;
              let target = pingDat.target.properties;
              let ping = [[src.longitude, src.latitude],
                  [target.longitude, target.latitude]];
              return  new Feature(new LineString(ping));
          });

          let layer = new VectorLayer({
              source: new VectorSource({
                  features: features
              }),
              style: styleFunction
          });
          map.addLayer(layer)
      })

  });


  fetch('https://aqueous-dusk-24314.herokuapp.com/ip/intermediate/all').then((response) => {
      response.json().then((data) => {
          let features = data.map((res) => {
              let loc = [res.longitude, res.latitude];
              return new Feature(new Point(loc))
          });

          let layer = new VectorLayer({
              source: new VectorSource({
                  features: features
              }),
              style: new Style({
                  image: new Circle({
                      radius: 7,
                      fill: new Fill({color: 'blue'})
                  })
              })
          });
          map.addLayer(layer)

      })
  });
}
getMapData();