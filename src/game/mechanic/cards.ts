/**
 * Eight observable moves. Names are fixed.
 * A card is a way of moving inside one concrete situation.
 * It is not a type, a trait, a score, or advice.
 */

export const SPEC_VERSION = "8-cards-1"

export const CARD_IDS = [
  "waiting",
  "adaptation",
  "holding",
  "control",
  "acceleration",
  "avoidance",
  "doubt",
  "flight",
] as const

export type CardId = (typeof CARD_IDS)[number]

export const CARD_NAME: Record<CardId, string> = {
  waiting: "Ожидание",
  adaptation: "Адаптация",
  holding: "Удерживание",
  control: "Контроль",
  acceleration: "Ускорение",
  avoidance: "Избегание",
  doubt: "Сомнение",
  flight: "Бегство",
}

export const UNRESOLVED_LABEL = "Пока неясно"

export const PAIR_IDS = [
  "contact-started",
  "avoidance-flight",
  "waiting-avoidance",
  "waiting-object",
  "waiting-holding",
  "avoidance-doubt",
  "acceleration-control",
  "control-adaptation",
  "both-main",
] as const

export type PairId = (typeof PAIR_IDS)[number]

export type Choice = { id: string; label: string }

export const QUESTION: Record<Exclude<PairId, "both-main">, string> = {
  "contact-started": "Ты уже сказала, написала, посчитала или договорилась?",
  "avoidance-flight":
    "Ты уже начала это делать — сказала, написала, посчитала, договорилась — и потом прекратила?",
  "waiting-avoidance": "Ты сейчас ждёшь какого-то события, ответа или подходящего момента?",
  "waiting-object": "Чего именно ты ждёшь?",
  "waiting-holding": "Ты в это время продолжала делать что-то привычное в этой ситуации?",
  "avoidance-doubt": "Назови два варианта, между которыми ты выбирала.",
  "acceleration-control":
    "Что было главным: получить результат быстрее или сделать исход более предсказуемым?",
  "control-adaptation": "Что именно ты изменила?",
}

export const BOTH_MAIN_QUESTION = "Что было главным?"

export const YES_NO: Choice[] = [
  { id: "yes", label: "Да" },
  { id: "no", label: "Нет" },
]

export const TEMPO_CHOICES: Choice[] = [
  { id: "tempo", label: "Получить результат быстрее" },
  { id: "predictable", label: "Сделать исход более предсказуемым" },
  { id: "neither", label: "Ни то ни другое" },
]

export const CHANGE_CHOICES: Choice[] = [
  { id: "own-way", label: "Свой способ действовать" },
  { id: "conditions", label: "Условия, правила, лимиты, проверки или договорённости" },
  { id: "neither", label: "Ни то ни другое" },
]

export function isCardId(value: unknown): value is CardId {
  return typeof value === "string" && CARD_IDS.some((id) => id === value)
}
