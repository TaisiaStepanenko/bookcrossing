export interface Registration {
  name: string | null
  email: string | null
  password: string | null
  cityId: number | null
  birthday_date: string | null
  description: string | null
}

export interface Login {
  email: string
  password: string
}

export interface RegistrationReturn {
  token: string
  cityId: number
  name: string
  notificationNumber: number
}

export interface UserProfile {
  availableBooks: number
  birthdayDate: string
  cityId: number
  completedExchanges: number
  description: string
  email: string
  name: string
  phone: string
  photo: string
  rating: number
  registrationDate: string
  reviewNumber: number
  reviews: []
  userBooks: BookCatalogItem[]
  userId: number
}

export interface BooksFilters {
  cityId?: number
  place?: Places[]
  exchangeMethod?: ExchangeMethod[]
  condition?: BookCondition[]
  exchange?: ExchangeType[]
  page: number
  myBook?: boolean
  favorite?: boolean
}

export interface BooksCatalog {
  items: BookCatalogItem[]
  page: number
  totalPages: number
}

export interface BookCatalogItem {
  name: string
  author: string
  place: Places
  src: string
  exchangeType: ExchangeType
  exchangeMethod: ExchangeMethod
  isFavorite: boolean
  id: number
}

export interface Book {
  photos: { isMain: boolean; url: string }[]
  exchangeType: ExchangeType
  exchangeMethod: ExchangeMethod
  name: string
  author: string
  condition: BookCondition
  defects: string
  genre: string
  cover: BookCover
  bookId: number
  isFavorite: boolean
  publisherHouse: string
  year: number
  series: string
  description: string
  registrationDate: string
  obtainingMethod: string
  otherBooks: BookCatalogItem[]
  isMy: boolean
  userInfo: {
    shortName: string
    city: string
    name: string
    avatar: string
    userId: string
    raiting: string
    feedbacksNumbe: number
    registrationDate: string
  }
}

export const BOOK_COVER = {
  HARDCOVER: { en: 'HARDCOVER', ru: 'Твердый переплет' },
  PAPERBACK: { en: 'PAPERBACK', ru: 'Мягкий переплет' },
  SUPER_PAPERBACK: { en: 'SUPER_PAPERBACK', ru: 'Удовлетворительное' },
} as const
type BookCover = keyof typeof BOOK_COVER

export const BOOK_CONDITION = {
  EXCELLENT: { en: 'EXCELLENT', ru: 'Отличное' },
  GOOD: { en: 'GOOD', ru: 'Хорошее' },
  SATISFACTORY: { en: 'SATISFACTORY', ru: 'Удовлетворительное' },
  POOR: { en: 'POOR', ru: 'Плохое' },
} as const

type BookCondition = keyof typeof BOOK_CONDITION

export const EXCHANGE_METHOD = {
  MEETING: { en: 'MEETING', ru: 'Личная встреча' },
  DELIVERY: { en: 'DELIVERY', ru: 'Доставка' },
  ALL: { en: 'ALL', ru: 'Личная встреча и Доставка' },
} as const

export type ExchangeMethod = keyof typeof EXCHANGE_METHOD

export const EXCHANGE_TYPE = {
  EXCHANGE: { en: 'EXCHANGE', ru: 'Обмен' },
  FREE: { en: 'FREE', ru: 'Отдам даром' },
} as const

type ExchangeType = keyof typeof EXCHANGE_TYPE

export const PLACES = {
  MY_PLACE: { en: 'MY_PLACE', ru: 'Только в моём городе' },
  NEAR: { en: 'NEAR', ru: 'В ближайших городах' },
  RUSSIA: { en: 'RUSSIA', ru: 'По всей России' },
} as const

type Places = keyof typeof PLACES

export interface BookEdit {
  name?: string // "Война и мир 2"
  author?: string // "Лев Толстой"
  exchangeType?: string // "EXCHANGE"
  exchangeMethod?: string // "MEETING"
  condition?: string // "EXCELLENT"
  defects?: string // ""
  genre?: string // "Роман"
  cover?: string // "HARDCOVER"
  publisherHouse?: string // "Эксмо"
  year?: number // 2023
  series?: string // "Классика"
  description?: string // "Великий роман"
  obtainingMethod?: string // "Самовывоз"
}

export const OFFER_TYPE = {
  ONE: 'Одна за одну',
  TWO: 'Две за одну',
  THREE: 'Три за одну',
} as const

export type OfferType = keyof typeof OFFER_TYPE
