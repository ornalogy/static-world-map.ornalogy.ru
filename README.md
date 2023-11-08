# Статическая карта мира Orna GPS RPG

[static-world-map.ornalogy.ru](https://static-world-map.ornalogy.ru)

## Что умеет?

* Показывает уникальный непереезжающие объекты по населенным пунктам
* Рассчитывает расстояние от выбранной точки до окружающих объектов
* Показывает какие объекты, и сколько, попадают в радиус обзора

## Как добавить свою карту?

1. Оформить карту своего населенного пунтка в формате:

```json
{
  "title": "<name>",
  "version": "1.0",
  "osmid": <osmid>,
  "center": [ <latitude>, <longitude> ],
  "markers": {
    "<uuid>": [ <markeType>, <latitude>, <longitude> ],
    ...
  }
}
```

[Пример кары](./docs/maps/yaroslavl.json), где:

* *name* - название населенного пунтка
* *osmid* - ид населенного пункта на карте OpenStreetMap. Например Москва = 2555133 (https://www.openstreetmap.org/relation/2555133)
* *latitude* *longitude* - координаты точки на карте, например [yandex.ru/maps](https://yandex.ru/maps)
* *markeType* - тим метки на карте:
  * 5 - Данж
  * 7 - Арканист
  * 10 - Базар
  * 14 - Колизей
* *uuid* - случайный уникальный идентификатор объекта в рамках одной карты

2. Оформить задачу на добавление населенного пунтка с указанием карты: [issues/new](https://github.com/ornalogy/static-world-map.ornalogy.ru/issues/new)

3. Либо обсудить на форуме: [t.me/ornalogy](https://t.me/ornalogy/2)
