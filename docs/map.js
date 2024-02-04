import { oom } from 'https://cdn.jsdelivr.net/npm/@notml/core/+esm'
import { getDistance } from 'https://cdn.jsdelivr.net/npm/geolib@3.3.4/+esm'
import { Map, View, Feature, Overlay } from 'https://cdn.jsdelivr.net/npm/ol@8.1.0/+esm'
import { OSM, Vector as VectorSource } from 'https://cdn.jsdelivr.net/npm/ol@8.1.0/source.js/+esm'
import { Tile, Vector as VectorLayer } from 'https://cdn.jsdelivr.net/npm/ol@8.1.0/layer.js/+esm'
import { fromLonLat, toLonLat } from 'https://cdn.jsdelivr.net/npm/ol@8.1.0/proj.js/+esm'
import { Point } from 'https://cdn.jsdelivr.net/npm/ol@8.1.0/geom.js/+esm'
import { Icon, Text, Fill, Stroke, Style } from 'https://cdn.jsdelivr.net/npm/ol@8.1.0/style.js/+esm'
import { GeoJSON } from 'https://cdn.jsdelivr.net/npm/ol@8.1.0/format.js/+esm'

const mapName = location.search.replace('?', '')
const container = document.getElementById('popup')
const content = document.getElementById('popup-content')
const closer = document.getElementById('popup-closer')
/** @type {HTMLInputElement} */// @ts-ignore
const viewingRadius = document.getElementById('viewing-radius')
const canReachMarkers = document.getElementById('can-reach-markers')
const overlay = new Overlay({
  element: container,
  autoPan: { animation: { duration: 250 } }
})
const map = new Map({
  target: 'map',
  layers: [new Tile({ source: new OSM() })],
  overlays: [overlay]
})
/**
 * @type {{[x:string]:{icon:string,width?:number,height?:number,textOffsetY:number}}}
 */
const markerTypes = {
  5: { icon: '/img/dungeon.png', textOffsetY: -18 },
  7: { icon: '/img/arcanist.png', textOffsetY: -28 },
  10: { icon: '/img/bazaar.png', textOffsetY: -36 },
  14: { icon: '/img/coliseum.png', textOffsetY: -30 },
  101: { icon: '/img/tower_1_3.png', width: 64, height: 128, textOffsetY: -74 },
  102: { icon: '/img/tower_2_3.png', width: 64, height: 128, textOffsetY: -74 },
  103: { icon: '/img/tower_3_3.png', width: 64, height: 128, textOffsetY: -74 },
  104: { icon: '/img/tower_4_3.png', width: 64, height: 128, textOffsetY: -74 },
  105: { icon: '/img/tower_5_3.png', width: 64, height: 128, textOffsetY: -74 },
  106: { icon: '/img/monument_demeter.png', width: 64, height: 128, textOffsetY: -26 },
  107: { icon: '/img/monument_ithra.png', width: 64, height: 128, textOffsetY: -26 },
  108: { icon: '/img/monument_thor.png', width: 64, height: 128, textOffsetY: -26 },
  109: { icon: '/img/monument_vulcan.png', width: 64, height: 128, textOffsetY: -26 }
}
/**
 * @typedef Marker
 * @property {Point} point
 * @property {Style} style
 * @property {Feature} feature
 * @property {number} type
 * @property {number[]} location [lat, lon]
 */
/** @type {Array<Marker>} */
const markers = []
const explorerImg = '/img/explorer_m.png'
/** @type {Marker} */
let explorerMarker = null

markerTypes.t_prometheus = markerTypes['101']
markerTypes.t_themis = markerTypes['102']
markerTypes.t_oceanus = markerTypes['103']
markerTypes.t_eos = markerTypes['104']
markerTypes.t_selene = markerTypes['105']

markerTypes.m_demeter = markerTypes['106']
markerTypes.m_ithra = markerTypes['107']
markerTypes.m_thor = markerTypes['108']
markerTypes.m_vulcan = markerTypes['109']

fetch(`./maps/${mapName}.json`)
  .then(async res => initMap(await res.json()))
  .catch(err => alert(err.stack || err))

closer.onclick = () => closePopup()
map.on('singleclick', evt => updateMap(evt.coordinate))
viewingRadius.onchange = () => updateMap()

/**
 * @typedef {{[x:string]:Array<number,number,number>}} MapMarkers
 */
/**
 * @typedef MapLayer
 * @property {string} title
 * @property {MapMarkers} markers
 */
/**
 * @typedef MapData
 * @property {string} title
 * @property {number} [osmid]
 * @property {[number, number]} center
 * @property {number} zoom
 * @property {MapMarkers} [markers]
 * @property {MapLayer[]} [layers]
 */
/**
 * @param {MapData} mapData
 */
function initMap(mapData) {
  const features = []

  document.title = mapData.title + ' — ' + document.title

  if (mapData.markers) {
    for (const [type, lat, lon] of Object.values(mapData.markers)) {
      const location = [lat, lon]
      const point = new Point(fromLatLon(location))
      const feature = new Feature({ geometry: point })
      const style = new Style({ image: new Icon({ src: markerTypes[type].icon, width: 64, height: 64 }) })

      feature.setStyle(style)
      markers.push({ point, style, feature, type, location })
      features.push(feature)
    }
  }
  if (mapData.layers) {
    for (const layer of mapData.layers) {
      for (const [type, lat, lon] of Object.values(layer.markers)) {
        const location = [lat, lon]
        const point = new Point(fromLatLon(location))
        const feature = new Feature({ geometry: point })
        const style = new Style({
          image: new Icon({
            src: markerTypes[type].icon,
            width: markerTypes[type].width || 64,
            height: markerTypes[type].height || 64
          })
        })

        feature.setStyle(style)
        markers.push({ point, style, feature, type, location })
        features.push(feature)
      }
    }
  }

  const point = new Point(fromLatLon(mapData.center))
  const feature = new Feature({ geometry: point })
  const style = new Style({ image: new Icon({ src: explorerImg, width: 32, height: 32 }) })

  feature.setStyle(style)
  explorerMarker = { point, style, feature, type: null, location: mapData.center }

  map.addLayer(new VectorLayer({ source: new VectorSource({ features: [feature, ...features] }) }))
  map.setView(new View({
    center: fromLatLon(mapData.center),
    zoom: mapData.zoom || 12,
    maxZoom: 18,
    minZoom: 10
  }))

  updateMap(fromLatLon(mapData.center))

  if ('osmid' in mapData) showPolygon(mapData.osmid)
}


/**
 * @typedef GEODetails
 * @property {{coordinates:Array}} geometry
 */
/**
 * @param {number} osmid
 */
async function showPolygon(osmid) {
  const res = await fetch(`https://nominatim.openstreetmap.org/details?osmtype=R&osmid=${osmid}&polygon_geojson=1&linkedplaces=0&format=json`)
  /** @type {GEODetails} */
  const details = await res.json()
  const geojson = new GeoJSON().readFeatures(details.geometry, { featureProjection: 'EPSG:3857' })
  const features = []

  for (const feature of geojson) {
    feature.setStyle(new Style({
      stroke: new Stroke({
        color: 'rgba(255, 0, 0, 0.3)',
        width: 3
      })
    }))
    features.push(feature)
  }

  map.addLayer(new VectorLayer({ source: new VectorSource({ features }) }))
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

  if (features && features.length === 1 && features[0] === explorerMarker.feature) {
    openPopup(explorerMarker.point.getCoordinates())
  } else if (explorerMarker) {
    const canReach = {}

    closePopup()
    explorerMarker.point.setCoordinates(current)
    for (const marker of markers) {
      const pos = marker.location
      const latLon = toLatLon(current)
      const distance = getDistance({ lat: latLon[0], lon: latLon[1] }, { lat: pos[0], lon: pos[1] })
      const viewing = viewingRadius.value ? parseInt(viewingRadius.value) : 0
      const available = viewing && viewing >= distance

      if (available) {
        if (marker.type in canReach) {
          canReach[marker.type]++
        } else {
          canReach[marker.type] = 1
        }
      }
      marker.style.setText(new Text({
        text: `${distance}м`,
        font: (available ? 'bold ' : '') + '16px Noto Sans,sans-serif',
        fill: new Fill({ color: viewing ? (viewing < distance ? 'FireBrick' : 'DarkGreen') : 'black' }),
        stroke: new Stroke({ color: 'white', width: 2 }),
        offsetY: markerTypes[marker.type].textOffsetY
      }))
    }

    const canReachTypes = Object.keys(canReach)

    canReachMarkers.innerHTML = ''
    if (canReachTypes.length > 0) {
      const markers = oom(canReachMarkers)

      canReachTypes.sort((a, b) => canReach[b] - canReach[a])
      for (const type of canReachTypes) {
        markers(oom.div({ class: 'can-reach-marker' }, oom
          .img({ src: markerTypes[type].icon })
          .span(String(canReach[type]))))
      }
      canReachMarkers.classList.remove('hidden')
    } else {
      canReachMarkers.classList.add('hidden')
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
