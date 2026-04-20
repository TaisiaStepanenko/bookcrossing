import { BOOK_CONDITION, EXCHANGE_TYPE, PLACES } from '../../api/models'

export const placeOptions = [
  { value: PLACES.MY_PLACE.en, label: PLACES.MY_PLACE.ru },
  { value: PLACES.NEAR.en, label: PLACES.NEAR.ru },
  { value: PLACES.RUSSIA.en, label: PLACES.RUSSIA.ru },
]

export const exchangeTypeOptions = [
  { value: EXCHANGE_TYPE.EXCHANGE.en, label: EXCHANGE_TYPE.EXCHANGE.ru },
  { value: EXCHANGE_TYPE.FREE.en, label: EXCHANGE_TYPE.FREE.ru },
]

export const conditionOptions = [
  { value: BOOK_CONDITION.EXCELLENT.en, label: BOOK_CONDITION.EXCELLENT.ru },
  { value: BOOK_CONDITION.GOOD.en, label: BOOK_CONDITION.GOOD.ru },
  { value: BOOK_CONDITION.SATISFACTORY.en, label: BOOK_CONDITION.SATISFACTORY.ru },
  { value: BOOK_CONDITION.POOR.en, label: BOOK_CONDITION.POOR.ru },
]
