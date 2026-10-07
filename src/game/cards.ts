import type { NodeId, PlaceId } from "./types"

/**
 * Стартовая колода.
 * Темы, фразы узлов и фразы для другой формулировки — черновик, чтобы карту можно было собрать до конца.
 * Автор заменит этот файл своими текстами. Фразы ничего не диагностируют и не означают проблему.
 */

export const nodeMeta: Record<NodeId, { title: string; question: string }> = {
  situation: {
    title: "Ситуация",
    question: "Что происходит?",
  },
  inside: {
    title: "Внутри",
    question: "Что ты в этот момент думаешь / чувствуешь / ожидаешь?",
  },
  action: {
    title: "Действие",
    question: "Что ты обычно делаешь в этой ситуации?",
  },
  consequence: {
    title: "Последствие",
    question: "К чему это обычно приводит?",
  },
}

export const situationThemes: { id: string; label: string; asksForWords: boolean }[] = [
  { id: "relations", label: "Отношения", asksForWords: false },
  { id: "family", label: "Семья", asksForWords: false },
  { id: "work", label: "Работа", asksForWords: false },
  { id: "fatigue", label: "Усталость", asksForWords: false },
  { id: "money", label: "Деньги", asksForWords: false },
  { id: "choice", label: "Выбор", asksForWords: false },
  { id: "other", label: "Другое", asksForWords: true },
]

export const nodePhrases: Record<Exclude<NodeId, "situation">, { id: string; text: string }[]> = {
  inside: [
    { id: "unheard", text: "Мне кажется, что меня не слышат" },
    { id: "easier-alone", text: "Я жду, что станет легче само" },
    { id: "wont-manage", text: "Я думаю, что опять не справлюсь" },
    { id: "must-move", text: "Мне важно, чтобы это наконец сдвинулось" },
    { id: "tired-first", text: "Я чувствую усталость раньше, чем понимаю, от чего" },
    { id: "guess", text: "Я ожидаю, что другой человек догадается сам" },
  ],
  action: [
    { id: "postpone", text: "Молчу и откладываю разговор" },
    { id: "take-all", text: "Беру всё на себя" },
    { id: "explain-again", text: "Объясняю ещё раз и подробнее" },
    { id: "into-tasks", text: "Ухожу в дела и не возвращаюсь к теме" },
    { id: "agree", text: "Соглашаюсь, хотя внутри не согласен" },
    { id: "ask-straight", text: "Спрашиваю прямо, что происходит" },
  ],
  consequence: [
    { id: "talk-stops", text: "Разговор обрывается, и тема остаётся" },
    { id: "more-tired", text: "Я устаю сильнее, чем в начале" },
    { id: "distance", text: "Человек рядом отдаляется" },
    { id: "same-outside", text: "Снаружи ничего не меняется" },
    { id: "quiet", text: "Становится тихо, но вопрос никуда не делся" },
    { id: "pretend", text: "Я делаю вид, что всё в порядке" },
  ],
}

export const places: { id: PlaceId; label: string }[] = [
  { id: "thought", label: "мысль" },
  { id: "expectation", label: "ожидание" },
  { id: "action", label: "действие" },
  { id: "reaction", label: "реакция" },
]

export const alternativePhrases: Record<PlaceId, { id: string; text: string }[]> = {
  thought: [
    { id: "not-the-whole", text: "Эта мысль — про сейчас, не про всю мою жизнь" },
    { id: "may-not-know", text: "Я могу не знать, чем это кончится, и всё равно сказать, что мне важно" },
    { id: "notice-thought", text: "Я могу заметить мысль и не идти за ней сразу" },
    { id: "no-ready-answer", text: "Мне можно не иметь готового ответа" },
    { id: "what-matters", text: "Я думаю о том, что мне важно, а не только о том, чего я боюсь" },
  ],
  expectation: [
    { id: "say-what-i-wait", text: "Я могу сказать, чего жду, а не ждать молча" },
    { id: "may-not-guess", text: "Другой человек может не догадаться — и я всё равно могу спросить" },
    { id: "one-answer", text: "Я жду одного конкретного ответа, не всего сразу" },
    { id: "check-wait", text: "Ожидание можно проверить, а не хранить про себя" },
    { id: "wait-less", text: "Мне можно ждать меньше, чем я привык" },
  ],
  action: [
    { id: "name-one", text: "Назвать вслух одну вещь и остановиться" },
    { id: "ask-not-explain", text: "Спросить, вместо того чтобы объяснять ещё раз" },
    { id: "name-when", text: "Отложить разговор, но назвать, когда я к нему вернусь" },
    { id: "one-step", text: "Сделать один шаг, не весь список" },
    { id: "minute-quiet", text: "Помолчать минуту и только потом ответить" },
  ],
  reaction: [
    { id: "pause", text: "Пауза, прежде чем я отвечу" },
    { id: "need-time", text: "Сказать, что мне нужно время" },
    { id: "come-back-calmer", text: "Вернуться к разговору, когда я уже спокойнее" },
    { id: "short-reply", text: "Ответить коротко, без длинного объяснения" },
    { id: "stay", text: "Остаться в разговоре, а не исчезнуть из него" },
  ],
}
