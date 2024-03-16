import { oom } from 'https://cdn.jsdelivr.net/npm/@notml/core/+esm'

const map = location.search.replace('?', '')
const maps = {
  'yaroslavl': 'Ярославль',
  'izhevsk': 'Ижевск',
  'sevastopol': 'Севастополь',
  'naberezhnye-chelny': 'Набережные Челны',
  'kazan': 'Казань',
  'samara': 'Самара',
  'tula': 'Тула',
  'ryazan': 'Рязань',
  'yekaterinburg': 'Екатеринбург',
  'moscow': 'Москва'
}
const mapsIds = Object.keys(maps).sort()
const сustomMaps = {
  'moving/msk1': 'MSK Башни/монументы',
  'moving/krasnodar': 'Краснодар Башни/монументы',
  'moving/ussurijsk': 'Уссурийск Башни/монументы'
}
const сustomMapsIds = Object.keys(сustomMaps).sort()

if (mapsIds.includes(map) || сustomMapsIds.includes(map)) {
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
  const сustomList = oom.div({ class: 'maps-list' })

  for (const m of mapsIds) {
    list(oom.a(maps[m], { href: `?${m}` }))
  }
  for (const m of сustomMapsIds) {
    сustomList(oom.a(сustomMaps[m], { href: `?${m}` }))
  }

  oom(document.body,
    oom.h2('Карты постоянных объектов'),
    list,
    oom.h2('Произвольные карты'),
    сustomList,
    oom.div({ class: 'maps-list' }, oom.a({
      href: 'https://github.com/ornalogy/static-world-map.ornalogy.ru#readme'
    }, 'Как добавить свою карту?'))
  )
}
