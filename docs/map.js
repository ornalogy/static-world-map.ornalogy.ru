import { getDistance } from 'https://cdn.jsdelivr.net/npm/geolib@3.3.4/+esm'
import { Map, View, Feature, Overlay } from 'https://cdn.jsdelivr.net/npm/ol@8.1.0/+esm'
import { OSM, Vector as VectorSource } from 'https://cdn.jsdelivr.net/npm/ol@8.1.0/source.js/+esm'
import { Tile, Vector as VectorLayer } from 'https://cdn.jsdelivr.net/npm/ol@8.1.0/layer.js/+esm'
import { fromLonLat, toLonLat } from 'https://cdn.jsdelivr.net/npm/ol@8.1.0/proj.js/+esm'
import { Point } from 'https://cdn.jsdelivr.net/npm/ol@8.1.0/geom.js/+esm'
import { Icon, Text, Fill, Stroke, Style } from 'https://cdn.jsdelivr.net/npm/ol@8.1.0/style.js/+esm'

const mapName = location.search.replace('?', '')
const container = document.getElementById('popup')
const content = document.getElementById('popup-content')
const closer = document.getElementById('popup-closer')
/** @type {HTMLInputElement} */// @ts-ignore
const viewingRadius = document.getElementById('viewing-radius')
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
  5: '/img/dungeon.png'
}
/** @type {Array<Feature>} */
const markers = []
const explorerImg = '/img/explorer_m.png'
/** @type {Feature} */
let explorerMarker = null

fetch(`./maps/${mapName}.json`)
  .then(async res => initMap(await res.json()))
  .catch(err => alert(err.stack || err))

closer.onclick = () => closePopup()
map.on('singleclick', evt => updateMap(evt.coordinate))
viewingRadius.onchange = () => updateMap()


/**
 * @typedef Marker
 * @property {string} uuid
 * @property {5} type
 * @property {[number, number]} location
 */
/**
 * @typedef MapData
 * @property {string} title
 * @property {[number, number]} center
 * @property {Array<Marker>} markers
/**
 * @param {MapData} mapData
 */
function initMap(mapData) {
  document.title = mapData.title + ' — ' + document.title

  for (const raw of mapData.markers) {
    const marker = new Feature({ geometry: new Point(fromLatLon(raw.location)) })

    marker.setStyle(new Style({ image: new Icon({ src: types[raw.type], width: 64, height: 64 }) }))
    markers.push(marker)
  }

  explorerMarker = new Feature({ geometry: new Point(fromLatLon(mapData.center)) })
  explorerMarker.setStyle(new Style({ image: new Icon({ src: explorerImg, width: 32, height: 32 }) }))

  map.addLayer(new VectorLayer({ source: new VectorSource({ features: [explorerMarker, ...markers] }) }))
  map.setView(new View({
    center: fromLatLon(mapData.center),
    zoom: 12,
    maxZoom: 18,
    minZoom: 10
  }))

  updateMap(fromLatLon(mapData.center))
}


/** @type {Array<number>} */
let lastUpdateMapCoordinate

/**
 * @param {Array<number>} [coordinate]
 */
function updateMap(coordinate) {
  const current = lastUpdateMapCoordinate = (coordinate || lastUpdateMapCoordinate)
  const pixel = coordinate ? map.getPixelFromCoordinate(coordinate) : null
  const features = pixel ? map.getFeaturesAtPixel(pixel) : null

  // @ts-ignore
  if (features && features.length === 1 && features[0].getStyle().getImage().getSrc() === explorerImg) {
    // @ts-ignore
    openPopup(features[0].getGeometry().getCoordinates())
  } else if (explorerMarker) {
    closePopup() // @ts-ignore
    explorerMarker.getGeometry().setCoordinates(current)
    for (const marker of markers) { // @ts-ignore
      const pos = toLatLon(marker.getGeometry().getCoordinates())
      const latLon = toLatLon(current)
      const distance = getDistance({ lat: latLon[0], lon: latLon[1] }, { lat: pos[0], lon: pos[1] })
      const viewing = viewingRadius.value ? parseInt(viewingRadius.value) : 0

      // @ts-ignore
      marker.getStyle().setText(new Text({
        text: `${distance}м`,
        font: ((viewing && viewing >= distance) ? 'bold ' : '') + '16px Noto Sans,sans-serif',
        fill: new Fill({ color: viewing ? (viewing < distance ? 'FireBrick' : 'DarkGreen') : 'black' }),
        stroke: new Stroke({ color: 'white', width: 2 }),
        offsetY: -18
      }))
    }
  }
}


/**
 * @param {Array<number>} coordinate
 */
function openPopup(coordinate) {
  const latLon = toLatLon(coordinate)
  const lat = (latLon[0] * 10000000 ^ 0) / 10000000
  const lon = (latLon[1] * 10000000 ^ 0) / 10000000

  content.innerHTML = `<div>Я здесь:</div><code>${lat},${lon}</code>`
  overlay.setPosition(coordinate)
}


function closePopup() {
  overlay.setPosition(undefined)
  closer.blur()

  return false
}


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
