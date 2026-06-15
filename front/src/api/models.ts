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

export interface UpdateProfile {
  name?: string
  email?: string
  phone?: string
  cityId?: number
  birthdayDate?: string
  photo?: string
  description?: string
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
  reviews: {
    comment: string
    rating: number
    reviewDate: string
    reviewId: number
    reviewerInfo: {
      userId: number
      name: string
      photo: string
    }
    name: string
    photo: string
    userId: number
  }[]
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
  search?: string
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
  isMyBook: boolean
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
  genre: string[]
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
    city: number
    name: string
    avatar: string
    userId: number
    raiting: number
    reviewNumber: number
    registrationDate: string
  }
}

export const BOOK_COVER = {
  HARDCOVER: { en: 'HARDCOVER', ru: 'Твердый переплет' },
  PAPERBACK: { en: 'PAPERBACK', ru: 'Мягкий переплет' },
  SUPER_PAPERBACK: { en: 'SUPER_PAPERBACK', ru: 'Суперобложка' },
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

export type ExchangeType = keyof typeof EXCHANGE_TYPE

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
  genre?: string[] // "Роман"
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

export interface BookExchange {
  targetBookId: number
  offeredBookIds: number[]
  offerType?: OfferType
}

export interface IncomingAllExchanges {
  id: number
  name: string
  src: string
  exchangeType: 'EXCHANGE' | 'FREE'
  people: {
    id: number
    name: string
    avatar: string
  }[]
}

export interface IncomingExchange {
  id: number
  name: string
  avatar: string
  bookCount: OfferType
  userType: 'OWNER' | 'INITIATOR'
  type: TransferStatus
  currentStatusInitiator: TransferStatus
  currentStatusOwner: TransferStatus
  endedDate?: string
  exchangeType: 'EXCHANGE' | 'FREE'
  hasReview: boolean
  ownerBook: {
    id: number
    name: string
    src: string
    is_main: boolean
  }
  initiatorBooks: {
    id: number
    name: string
    src: string
    is_main: boolean
  }[]
}

export const TRANSFER_STATUS = {
  WAITING_RESPONSE: 'WAITING_RESPONSE',
  WAITING_CONFIRMATION: 'WAITING_CONFIRMATION',

  WAITING_TO_BE_SENT: 'WAITING_TO_BE_SENT',
  SENT: 'SENT',
  RECEIVED: 'RECEIVED',

  COMPLETED_SUCCESS: 'COMPLETED_SUCCESS',
  CANCELLED: 'CANCELLED',
  COMPLETED_PREMATURELY: 'COMPLETED_PREMATURELY',
}

export type TransferStatus = keyof typeof TRANSFER_STATUS

export interface Notification {
  notificationId: number
  userId: number
  userName: string
  transferId: number
  messageType: 'EXCHANGE' | 'REVIEW'
  isRead: boolean
  createdAt: string
  transferStatus?: string
  curStutus: 'NEW' | 'RUNNING' | 'ENDED'
  bookTitle?: string
  exchangeType?: 'EXCHANGE' | 'FREE'
}

export interface ChangeStatus {
  activity: 'accept' | 'cancel'
  keptBookIds?: number[]
  acceptOffer?: number
}

export interface Review {
  transferId: number
  rating: number
  comment: string
}
