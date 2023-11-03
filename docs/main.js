import { oom } from 'https://cdn.jsdelivr.net/npm/@notml/core/+esm'

const map = location.search.replace('?', '')
const maps = [
  'yaroslavl'
]

if (maps.includes(map)) {
  oom(document.body, oom
    .div({ id: 'map' })
    .div({ id: 'popup', class: 'ol-popup' }, oom
      .div({ id: 'popup-closer', class: 'ol-popup-closer' })
      .div({ id: 'popup-content' })
    )
  )

  import('./map.js')
} else {
  const list = oom.div({ class: 'maps-list' })

  for (const m of maps) {
    list(oom.a(m, { href: `?${m}` }))
  }

  oom(document.body, list)
}
