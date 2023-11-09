import { oom } from 'https://cdn.jsdelivr.net/npm/@notml/core/+esm'

const map = location.search.replace('?', '')
const maps = {
  'yaroslavl': 'Ярославль',
  'izhevsk': 'Ижевск',
  'sevastopol': 'Севастополь',
  'naberezhnye-chelny': 'Набережные Челны',
  'kazan': 'Казань',
  'samara': 'Самара'
}
const mapsIds = Object.keys(maps).sort()

if (mapsIds.includes(map)) {
  oom(document.body, oom
    .div({ id: 'map' })
    .div({ id: 'popup', class: 'ol-popup' }, oom
      .div({ id: 'popup-closer', class: 'ol-popup-closer' })
      .div({ id: 'popup-content' })
    )
    .div({ class: 'layer-props' }, oom
      .div({ class: 'layer-props-row' }, oom
        .img({ src: '/img/lantern.png' })
        .input({ id: 'viewing-radius', type: 'number', placeholder: 'Обзор' }))
      .div({ class: 'layer-props-row hidden', id: 'can-reach-markers' })
    )
  )

  import('./map.js')
} else {
  const list = oom.div({ class: 'maps-list' })

  for (const m of mapsIds) {
    list(oom.a(maps[m], { href: `?${m}` }))
  }

  oom(document.body, list, oom.div({ class: 'maps-list' }, oom.a({
    href: 'https://github.com/ornalogy/static-world-map.ornalogy.ru#readme'
  }, 'Как добавить свою карту?')))
}
