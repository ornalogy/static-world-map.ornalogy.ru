import { Map, View, Feature, Overlay } from 'https://cdn.jsdelivr.net/npm/ol@8.1.0/+esm'
import { OSM, Vector as VectorSource } from 'https://cdn.jsdelivr.net/npm/ol@8.1.0/source.js/+esm'
import { Tile, Vector as VectorLayer } from 'https://cdn.jsdelivr.net/npm/ol@8.1.0/layer.js/+esm'
import { fromLonLat, toLonLat } from 'https://cdn.jsdelivr.net/npm/ol@8.1.0/proj.js/+esm'
import { Point } from 'https://cdn.jsdelivr.net/npm/ol@8.1.0/geom.js/+esm'
import { Icon, Style } from 'https://cdn.jsdelivr.net/npm/ol@8.1.0/style.js/+esm'

const mapName = location.search.replace('?', '')
const container = document.getElementById('popup')
const content = document.getElementById('popup-content')
const closer = document.getElementById('popup-closer')
const overlay = new Overlay({
  element: container,
  autoPan: { animation: { duration: 250 } }
})
const map = new Map({
  target: 'map',
  layers: [new Tile({ source: new OSM() })],
  overlays: [overlay]
})
const types = {
  5: 'img/dungeon.png'
}

fetch(`./maps/${mapName}.json`).then(async res => {
  const mapData = await res.json()
  const markers = []

  document.title = mapData.title + ' — ' + document.title

  for (const raw of mapData.markers) {
    const marker = new Feature({ geometry: new Point(fromLatLon(raw.location)) })

    marker.setStyle(new Style({ image: new Icon({ src: types[raw.type], width: 64, height: 64 }) }))
    markers.push(marker)
  }

  map.addLayer(new VectorLayer({ source: new VectorSource({ features: markers }) }))
  map.setView(new View({
    center: fromLatLon(mapData.center),
    zoom: 12,
    maxZoom: 18,
    minZoom: 10
  }))
}).catch(err => alert(err.stack || err))


closer.onclick = () => {
  overlay.setPosition(undefined)
  closer.blur()

  return false
}

map.on('singleclick', (evt) => {
  const { coordinate } = evt
  const lonLat = toLatLon(coordinate)

  content.innerHTML = '<div>You clicked here:</div><code>' + lonLat + '</code>'
  overlay.setPosition(coordinate)
})


/**
 * @param {Array<number>} coordinate
 * @returns {Array<number>}
 */
function fromLatLon([latitude, longitude]) {
  return fromLonLat([longitude, latitude])
}

/**
 * @param {Array<number>} coordinate
 * @returns {Array<number>}
 */
function toLatLon([longitude, latitude]) {
  return toLonLat([longitude, latitude]).reverse()
}
