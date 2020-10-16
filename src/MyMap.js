import React, { Component } from "react";
import OlMap from "ol/Map";
import Draw from 'ol/interaction/Draw';
import OlView from "ol/View";
import Feature from 'ol/Feature';
import {Icon, Stroke, Style} from 'ol/style';
import OlLayerTile from "ol/layer/Tile";
import {OSM, Vector as VectorSource} from 'ol/source';
import Point from 'ol/geom/Point';
import {Tile as TileLayer, Vector as VectorLayer} from 'ol/layer';


class PublicMap extends Component {
  constructor(props) {
    super(props);

    let raster = new TileLayer({
      source: new OSM(),
    });

    let source = new VectorSource();

    let vector = new VectorLayer();

    



    // this.state = { center: [0, 0], zoom: 1 };

    // this.olmap = new OlMap({
    //   target: null,
    //   layers: [
    //     new OlLayerTile({
    //       source: new OSM()
    //     })
    //   ],
    //   view: new OlView({
    //     center: this.state.center,
    //     zoom: this.state.zoom
    //   })
    // });
  }
  styleFunction(feature){
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

  // updateMap() {
  //   this.olmap.getView().setCenter(this.state.center);
  //   this.olmap.getView().setZoom(this.state.zoom);
  // }

  // componentDidMount() {
  //   this.olmap.setTarget("map");

  //   // Listen to map changes
  //   this.olmap.on("moveend", () => {
  //     let center = this.olmap.getView().getCenter();
  //     let zoom = this.olmap.getView().getZoom();
  //     this.setState({ center, zoom });
  //   });

  // }

  // shouldComponentUpdate(nextProps, nextState) {
  //   let center = this.olmap.getView().getCenter();
  //   let zoom = this.olmap.getView().getZoom();
  //   if (center === nextState.center && zoom === nextState.zoom) return false;
  //   return true;
  // }

  // userAction() {
  //   this.setState({ center: [100000, 100000], zoom: 5 });
  // }

  render() {
    return (
      <div id="map" style={{ width: "100%", height: "360px" }}>
      </div>
    );
  }
}

export default PublicMap;
