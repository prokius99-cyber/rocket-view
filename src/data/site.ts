/**
 * Единственный источник данных о бизнесе: название, контакты, адрес, часы, соцсети.
 * Каждое значение — из analysis.md (с источником). Нет факта — {{VERIFY: что}}.
 * Компоненты берут данные ТОЛЬКО отсюда, поэтому телефон на сайте всегда один (NAP).
 */
export const business = {
  name: 'Rocket View',
  /** Короткое описание для title/description — без {{VERIFY}}. */
  tagline: 'кальянный lounge на 3 этаже PiterLand',
  description:
    'Rocket View — кальянный lounge на 3 этаже ТРК PiterLand, Приморский проспект, 72. Кальян 1800 ₽, по будням днём с чаем 1500 ₽. Чаи, лимонады, PS5.',
  /** Телефон в формате +7XXXXXXXXXX и в человеческом виде. */
  phone: { e164: '+79995141367', display: '+7 (999) 514-13-67' },
  email: '',
  address: {
    street: 'Приморский проспект, 72',
    city: 'Санкт-Петербург',
    region: '',
    postalCode: '',
    note: '3 этаж, ТРК PiterLand',
    landmark: 'рядом Тимати Karting',
  },
  geo: { lat: 0, lon: 0 },
  /** Часы в формате schema.org: 'Mo-Fr 10:00-19:00'. Пусто — не выводим. 2ГИС и Яндекс; VK пишет до 1:00 — VERIFY. */
  hours: ['Mo-Su 11:00-24:00'],
  hoursDisplay: 'ежедневно 11:00–24:00',
  rating: {
    yandex: { value: '4,9', count: 107, reviews: 73, badge: 'Хорошее место 2026' },
    twoGis: { value: '4,2', count: 24 },
  },
  links: {
    yandexMaps: 'https://yandex.ru/maps/org/rocket_view/225412721410/',
    yandexReviews: 'https://yandex.ru/maps/org/rocket_view/225412721410/reviews/',
    twoGis: 'https://2gis.ru/spb/firm/70000001055801181',
    vk: 'https://vk.ru/rocketviewspb',
    telegram: '', // username без @ — для ссылки t.me/<username>
    whatsapp: '', // номер в формате 7XXXXXXXXXX
  },
  /** Цвет панели браузера на телефоне = --c-bg из DESIGN.md. */
  themeColor: '#c8c7c2',
  /** Тип для JSON-LD: Store, LocalBusiness, Restaurant, BeautySalon, AutoRepair и т.д. */
  schemaType: 'BarOrPub',
  /** Реквизиты для подвала и политики конфиденциальности. */
  legal: { operator: '{{VERIFY: ИП/ООО}}', inn: '{{VERIFY: ИНН}}', ogrn: '' },
};

/** Кальяны — меню Яндекс.Карт (analysis.md). */
export const hookahs = [
  { name: 'Кальян', price: 1800, note: '' },
  { name: 'Кальян + чай', price: 1500, note: 'по будням 11:00–18:00' },
  { name: 'Хука Про', price: 2000, note: 'электронная чаша' },
  { name: 'Кальян Премиум', price: 2200, note: 'сигарный табак' },
];

/** Заявки: адрес приёма (вебхук, форма, серверная функция). Пусто — форма предлагает мессенджеры. */
export const orderEndpoint = import.meta.env.PUBLIC_ORDER_ENDPOINT || '';

/** Демо для клиента: noindex + запрет в robots.txt. Включено по умолчанию до выкладки на домен клиента. */
export const isDemo = (import.meta.env.PUBLIC_DEMO ?? 'true') !== 'false';
