import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

export type Lang = "en" | "ru";

const STORAGE_KEY = "celldrop.lang";

type Dict = Record<string, string>;

const en: Dict = {
  "nav.analyzer": "Analyzer",
  "nav.history": "History",
  "nav.signin": "Sign in",
  "nav.getStarted": "Get started",
  "nav.openAnalyzer": "Open analyzer",
  "nav.signout": "Sign out",

  "footer.tagline": "Cell viability counting for the Goryaev chamber. Built for the lab bench.",

  "hero.eyebrow": "Free viability counter for the Goryaev chamber",
  "hero.title": "Count live and dead cells from one photo",
  "hero.sub":
    "Upload one frame of your Goryaev chamber and read viability and concentration in seconds. Then check every marked cell yourself. Free, in Russian and English.",
  "hero.primary": "Upload a photo",
  "hero.seeHow": "See how it works",
  "hero.trust": "A result in seconds and an easy check. Not a perfect answer in one click.",
  "hero.stat1": "faster than a clicker",
  "hero.stat2": "per sample",
  "hero.stat3": "editable by hand",

  "problem.eyebrow": "The problem",
  "problem.title": "Manual counting is slow and it strains the eyes",
  "problem.body":
    "Every day scientists grow cells for drug development, cancer research, and IVF. To track growth they recount by hand at the microscope, spinning the focus with one hand and holding a mechanical clicker in the other, calling out live and dead. Then they punch a formula into a calculator. It takes ten to fifteen minutes per sample and errors creep in with fatigue.",

  "how.eyebrow": "How it works",
  "how.title": "From photo to result in four steps",
  "how.capture.title": "Capture",
  "how.capture.body":
    "Hold your phone to the eyepiece or upload a photo from a digital microscope.",
  "how.detect.title": "Detect",
  "how.detect.body":
    "The engine locates the Goryaev grid and lets you confirm the region to count.",
  "how.classify.title": "Classify",
  "how.classify.body":
    "Transparent cells read as live. Cells stained blue by Trypan Blue read as dead.",
  "how.compute.title": "Compute",
  "how.compute.body":
    "Viability and concentration appear at once, with your dilution factor applied.",

  "math.eyebrow": "The math, transparent",
  "math.title": "Exactly the numbers your protocol expects",
  "math.viability": "Viability",
  "math.viabilityFormula": "live / (live + dead) x 100",
  "math.viabilityNote": "The share of transparent cells across everything counted.",
  "math.concentration": "Concentration",
  "math.concentrationFormula": "cells per square x dilution x 10^4",
  "math.concentrationNote":
    "One large square holds 0.1 microliter, which is where the 10^4 factor comes from. You set the dilution and how many squares you counted.",

  "trust.title": "Trust comes from control",
  "trust.body":
    "Computer vision is never perfect, so CellDrop never asks you to accept a black box. Every marker can be added, removed, or reclassified with a click. The counts and the math update the moment you touch the overlay.",

  "cta.title": "Bring your next count down to one second",

  "illustration.alt": "Goryaev grid with detected live and dead cells",

  "analyzer.eyebrow": "Analyzer",
  "analyzer.title": "Count a sample",
  "analyzer.sub":
    "Load a photo of a Goryaev chamber. CellDrop proposes the live and dead cells, then you refine by hand. Nothing leaves your browser.",

  "dropzone.title": "Drop a chamber photo here",
  "dropzone.sub": "Upload an image from a digital microscope or capture one from your camera.",
  "dropzone.upload": "Upload image",
  "dropzone.camera": "Use camera",
  "dropzone.sample": "Try a sample",

  "legend.live": "Live rings",
  "legend.dead": "Dead dots",
  "legend.region": "Region active",

  "results.live": "Live",
  "results.dead": "Dead",
  "results.viability": "Viability estimate",
  "results.concentration": "Concentration estimate",
  "results.concentrationUnit": "cells per mL, all counted",
  "results.total": "Total",
  "results.perSquare": "Per square",
  "results.livePerMl": "Live per mL",
  "results.save": "Save to history",
  "results.saving": "Saving",
  "results.saved": "Saved",
  "results.export": "Export CSV",

  "controls.tool": "Marker tool",
  "controls.live": "Live",
  "controls.dead": "Dead",
  "controls.erase": "Erase",
  "controls.region": "Region",
  "controls.toolHint":
    "Click the image to add a marker, Erase to remove one, or Region to drag a box that limits automatic detection. Shortcuts L, D, E, R.",
  "controls.sensitivity": "Detection sensitivity",
  "controls.blueStrength": "Blue strength",
  "controls.liveSensitivity": "Live sensitivity",
  "controls.cellSize": "Cell size",
  "controls.protocol": "Protocol",
  "controls.dilution": "Dilution factor",
  "controls.squares": "Large squares counted",
  "controls.clearMarkers": "Clear markers",
  "controls.newImage": "New image",
  "controls.resetRegion": "Reset region to full image",
  "controls.resetSettings": "Reset settings",
  "legend.hide": "Hide markers",
  "legend.show": "Show markers",
  "legend.undo": "Undo",

  "ruo.results":
    "Research use only. CellDrop is a counting aid, not a medical device. Do not use these results for clinical, diagnostic, embryo selection or cell therapy dosing decisions. Check the overlay yourself.",

  "analyzer.limits":
    "Check before you trust the number. Weak focus, glare, debris in the field and clumped cells all lower accuracy, and so do low cell counts. Compare the markers against the overlay and correct any the tool missed before you record a result.",
  "analyzer.verify":
    "Verify every count. Each marker sits on the cell it counted, so you see exactly what the tool saw. The final number is the one you confirm.",
  "analyzer.lowCount":
    "Low count. You have counted {count} cells. From counting statistics alone the expected spread is about {cv} percent. Aim for at least 100 cells across your squares before you rely on this number.",
  "analyzer.countOk":
    "Count above 100 cells. Random counting error is near its floor of about 10 percent.",

  "export.caption": "Saved and exported results are for research use only.",
  "export.csvHeader": "CellDrop research use only. Not for clinical or diagnostic use.",
  "save.privacy": "Saving stores your numbers only, not the photo.",

  "dropzone.privacy":
    "Your image is analysed in your browser and is never uploaded. It stays on your device, with no account.",
  "dropzone.captureTitle": "For the clearest count",
  "dropzone.capture1":
    "Use a digital microscope camera. A phone held to the eyepiece adds glare and uneven focus.",
  "dropzone.capture2": "Focus until the cell edges look sharp.",
  "dropzone.capture3": "Light the field evenly and avoid glare.",
  "dropzone.capture4":
    "Fill the frame with the grid so cells stay large and easy to separate.",
  "dropzone.captureMoreTrigger": "How to get a good frame",
  "dropzone.captureMoreBody":
    "A digital microscope camera gives the most stable image. If you must use a phone, rest it flat on the eyepiece, centre the grid, and hold still. Keep all cells in one focal plane, wipe the lens, and shoot at full zoom without cropping afterward.",

  "diff.heading": "What CellDrop does well",
  "diff.intro":
    "We are not the first cell counter. We are the simplest free way to get live and dead counts for the Goryaev chamber and to check them yourself.",
  "diff.t1.title": "Free live and dead counting",
  "diff.t1.body": "Viability and concentration at no cost, with no credits and no sign up.",
  "diff.t2.title": "Built for the Goryaev chamber",
  "diff.t2.body":
    "Square counting and concentration math tuned for the grid used across Russian speaking labs.",
  "diff.t3.title": "Russian and English",
  "diff.t3.body": "The full interface and every hint are available in both languages.",
  "diff.t4.title": "Your images stay private",
  "diff.t4.body": "Counting runs in your browser. Photos are never sent to a server.",
  "diff.t5.title": "An overlay you can verify",
  "diff.t5.body":
    "Every counted cell is marked on the photo so you can confirm the number yourself.",
  "diff.t6.title": "Correct it by hand",
  "diff.t6.body": "Add, remove or reclassify any marker before you trust the result.",

  "footer.ruo":
    "CellDrop is a research tool. All results are for research use only and must not guide clinical or diagnostic decisions. Photos are processed in your browser and never uploaded.",
  "footer.legalLink": "Research use and privacy",

  "legal.title": "Research use and privacy",
  "legal.body":
    "CellDrop is intended for research use only. It gives a fast estimate of live and dead cell counts, viability and concentration from a Goryaev chamber photo, together with a transparent overlay you can check and correct. CellDrop is not a medical device. Do not use its results for clinical or diagnostic decisions, for selecting embryos, or for dosing cell therapy. A qualified specialist is responsible for any decision. Your photo is processed entirely in your browser and is never uploaded to a server. If you choose to save a result, only the numbers are stored in your account, not the image. Accuracy falls with clumped cells, debris, poor focus and low cell counts. For a reliable figure, count at least 100 cells across squares and verify the overlay by eye.",

  "auth.signinTitle": "Sign in",
  "auth.signinSub": "Welcome back. Continue to your analyses.",
  "auth.signupTitle": "Create account",
  "auth.signupSub": "Save your analyses and revisit them anytime.",
  "auth.email": "Email",
  "auth.password": "Password",
  "auth.passwordHint": "At least six characters.",
  "auth.signin": "Sign in",
  "auth.signingIn": "Signing in",
  "auth.createAccount": "Create account",
  "auth.creatingAccount": "Creating account",
  "auth.noAccount": "No account yet?",
  "auth.createOne": "Create one",
  "auth.haveAccount": "Already have an account?",
  "auth.notConfigured":
    "Accounts are not enabled in this build. Add your Supabase keys to a .env file to turn on accounts and saved history. The analyzer works without an account.",
  "auth.pwTooShort": "Password must be at least six characters.",
  "auth.created":
    "Account created. Check your inbox if email confirmation is on, then sign in.",

  "history.eyebrow": "History",
  "history.title": "Saved analyses",
  "history.new": "New analysis",
  "history.loading": "Loading",
  "history.empty": "No analyses saved yet.",
  "history.runFirst": "Run your first count",
  "history.date": "Date",
  "history.live": "Live",
  "history.dead": "Dead",
  "history.viability": "Viability",
  "history.concentration": "Concentration",
  "history.deleteAria": "Delete analysis",
};

const ru: Dict = {
  "nav.analyzer": "Анализатор",
  "nav.history": "История",
  "nav.signin": "Войти",
  "nav.getStarted": "Начать",
  "nav.openAnalyzer": "Открыть анализатор",
  "nav.signout": "Выйти",

  "footer.tagline":
    "Подсчёт жизнеспособности клеток в камере Горяева. Сделано для лабораторного стола.",

  "hero.eyebrow": "Бесплатный счётчик жизнеспособности для камеры Горяева",
  "hero.title": "Подсчёт живых и мёртвых клеток по одному фото",
  "hero.sub":
    "Загрузите один кадр камеры Горяева и узнайте жизнеспособность и концентрацию за секунды. Затем проверьте каждую отмеченную клетку сами. Бесплатно, на русском и английском.",
  "hero.primary": "Загрузить фото",
  "hero.seeHow": "Как это работает",
  "hero.trust": "Результат за секунды и простая проверка. Не идеальный ответ в один клик.",
  "hero.stat1": "быстрее счётчика",
  "hero.stat2": "на образец",
  "hero.stat3": "правится вручную",

  "problem.eyebrow": "Проблема",
  "problem.title": "Ручной подсчёт медленный и утомляет глаза",
  "problem.body":
    "Каждый день учёные выращивают клетки для разработки лекарств, исследований рака и ЭКО. Чтобы отслеживать рост, они пересчитывают клетки вручную под микроскопом: одной рукой крутят фокус, другой держат механический счётчик и называют живые и мёртвые. Потом вбивают формулу в калькулятор. Это занимает от десяти до пятнадцати минут на образец, и от усталости появляются ошибки.",

  "how.eyebrow": "Как это работает",
  "how.title": "От фото до результата за четыре шага",
  "how.capture.title": "Снимок",
  "how.capture.body":
    "Поднесите телефон к окуляру или загрузите фото с цифрового микроскопа.",
  "how.detect.title": "Область",
  "how.detect.body":
    "Движок находит сетку камеры Горяева и даёт подтвердить область подсчёта.",
  "how.classify.title": "Классификация",
  "how.classify.body":
    "Прозрачные клетки считаются живыми. Окрашенные трипановым синим — мёртвыми.",
  "how.compute.title": "Расчёт",
  "how.compute.body":
    "Жизнеспособность и концентрация появляются сразу, с учётом вашего фактора разведения.",

  "math.eyebrow": "Прозрачная математика",
  "math.title": "Ровно те числа, что ждёт ваш протокол",
  "math.viability": "Жизнеспособность",
  "math.viabilityFormula": "живые / (живые + мёртвые) x 100",
  "math.viabilityNote": "Доля прозрачных клеток от всех подсчитанных.",
  "math.concentration": "Концентрация",
  "math.concentrationFormula": "клеток на квадрат x разведение x 10^4",
  "math.concentrationNote":
    "Один большой квадрат вмещает 0,1 микролитра — отсюда множитель 10^4. Вы задаёте разведение и число посчитанных квадратов.",

  "trust.title": "Доверие рождается из контроля",
  "trust.body":
    "Компьютерное зрение не бывает идеальным, поэтому CellDrop не просит верить чёрному ящику. Любой маркер можно добавить, убрать или переназначить одним кликом. Счёт и расчёты обновляются в тот же миг.",

  "cta.title": "Сократите следующий подсчёт до одной секунды",

  "illustration.alt": "Сетка Горяева с распознанными живыми и мёртвыми клетками",

  "analyzer.eyebrow": "Анализатор",
  "analyzer.title": "Посчитать образец",
  "analyzer.sub":
    "Загрузите фото камеры Горяева. CellDrop предложит живые и мёртвые клетки, а вы уточните вручную. Ничего не покидает ваш браузер.",

  "dropzone.title": "Перетащите сюда фото камеры",
  "dropzone.sub": "Загрузите изображение с цифрового микроскопа или снимите на камеру.",
  "dropzone.upload": "Загрузить фото",
  "dropzone.camera": "Снять на камеру",
  "dropzone.sample": "Пример",

  "legend.live": "Живые кольца",
  "legend.dead": "Мёртвые точки",
  "legend.region": "Область активна",

  "results.live": "Живые",
  "results.dead": "Мёртвые",
  "results.viability": "Оценка жизнеспособности",
  "results.concentration": "Оценка концентрации",
  "results.concentrationUnit": "клеток на мл, всего",
  "results.total": "Всего",
  "results.perSquare": "На квадрат",
  "results.livePerMl": "Живых на мл",
  "results.save": "Сохранить в историю",
  "results.saving": "Сохранение",
  "results.saved": "Сохранено",
  "results.export": "Экспорт CSV",

  "controls.tool": "Инструмент",
  "controls.live": "Живая",
  "controls.dead": "Мёртвая",
  "controls.erase": "Стереть",
  "controls.region": "Область",
  "controls.toolHint":
    "Кликните по снимку, чтобы поставить маркер, Стереть — чтобы убрать, Область — чтобы рамкой ограничить авто-подсчёт. Клавиши L, D, E, R.",
  "controls.sensitivity": "Чувствительность",
  "controls.blueStrength": "Сила синего",
  "controls.liveSensitivity": "Чувствительность к живым",
  "controls.cellSize": "Размер клетки",
  "controls.protocol": "Протокол",
  "controls.dilution": "Фактор разведения",
  "controls.squares": "Посчитано больших квадратов",
  "controls.clearMarkers": "Сбросить маркеры",
  "controls.newImage": "Новое фото",
  "controls.resetRegion": "Сбросить область на весь кадр",
  "controls.resetSettings": "Сбросить настройки",
  "legend.hide": "Скрыть разметку",
  "legend.show": "Показать разметку",
  "legend.undo": "Отменить",

  "ruo.results":
    "Только для исследовательских целей. CellDrop — вспомогательный инструмент подсчёта, а не медицинское изделие. Не используйте эти результаты для клинических, диагностических решений, отбора эмбрионов или расчёта дозы клеточной терапии. Проверьте разметку самостоятельно.",

  "analyzer.limits":
    "Проверьте, прежде чем доверять числу. Слабый фокус, блики, мусор в поле и слипшиеся клетки снижают точность, как и малое число клеток. Сравните маркеры с разметкой и поправьте те, что инструмент пропустил, прежде чем записывать результат.",
  "analyzer.verify":
    "Проверяйте каждый подсчёт. Каждый маркер стоит на той клетке, которую посчитал, поэтому вы видите ровно то, что увидел инструмент. Итоговое число — то, которое подтвердили вы.",
  "analyzer.lowCount":
    "Мало клеток. Подсчитано клеток: {count}. Только по статистике подсчёта ожидаемый разброс составляет около {cv}%. Наберите не менее 100 клеток по квадратам, прежде чем полагаться на это число.",
  "analyzer.countOk":
    "Подсчитано более 100 клеток. Случайная погрешность подсчёта близка к своему пределу около 10 процентов.",

  "export.caption": "Сохранённые и экспортированные результаты предназначены только для научных целей.",
  "export.csvHeader":
    "CellDrop. Только для научных целей. Не для клинического или диагностического применения.",
  "save.privacy": "При сохранении хранятся только ваши значения, фото не сохраняется.",

  "dropzone.privacy":
    "Ваше изображение анализируется в браузере и никогда не загружается. Оно остаётся на вашем устройстве, без аккаунта.",
  "dropzone.captureTitle": "Для самого чёткого подсчёта",
  "dropzone.capture1":
    "Снимайте камерой цифрового микроскопа. Телефон у окуляра добавляет блики и неравномерный фокус.",
  "dropzone.capture2": "Наведите резкость, пока края клеток не станут чёткими.",
  "dropzone.capture3": "Освещайте поле равномерно и избегайте бликов.",
  "dropzone.capture4": "Заполните кадр сеткой, чтобы клетки оставались крупными и легко разделялись.",
  "dropzone.captureMoreTrigger": "Как получить хороший кадр",
  "dropzone.captureMoreBody":
    "Камера цифрового микроскопа даёт самое стабильное изображение. Если используете телефон, положите его ровно на окуляр, отцентрируйте сетку и держите неподвижно. Снимайте все клетки в одной фокальной плоскости, протрите объектив и делайте фото на полном увеличении без последующей обрезки.",

  "diff.heading": "Что CellDrop делает хорошо",
  "diff.intro":
    "Мы не первый счётчик клеток. Мы самый простой бесплатный способ получить подсчёт живых и мёртвых клеток для камеры Горяева и проверить его самостоятельно.",
  "diff.t1.title": "Бесплатный подсчёт живых и мёртвых",
  "diff.t1.body": "Жизнеспособность и концентрация без оплаты, без кредитов и без регистрации.",
  "diff.t2.title": "Создан для камеры Горяева",
  "diff.t2.body":
    "Подсчёт по квадратам и расчёт концентрации настроены под сетку, принятую в русскоязычных лабораториях.",
  "diff.t3.title": "Русский и английский",
  "diff.t3.body": "Весь интерфейс и все подсказки доступны на обоих языках.",
  "diff.t4.title": "Ваши изображения приватны",
  "diff.t4.body": "Подсчёт идёт в вашем браузере. Фото никогда не отправляются на сервер.",
  "diff.t5.title": "Разметка, которую можно проверить",
  "diff.t5.body": "Каждая учтённая клетка отмечена на фото, чтобы вы могли подтвердить результат сами.",
  "diff.t6.title": "Ручная коррекция",
  "diff.t6.body": "Добавляйте, удаляйте или меняйте класс любой метки, прежде чем доверять результату.",

  "footer.ruo":
    "CellDrop — исследовательский инструмент. Все результаты предназначены только для научных целей и не могут служить основанием для клинических или диагностических решений. Фотографии обрабатываются в вашем браузере и не загружаются на сервер.",
  "footer.legalLink": "Научное применение и конфиденциальность",

  "legal.title": "Научное применение и конфиденциальность",
  "legal.body":
    "CellDrop предназначен только для научных целей. Он даёт быструю оценку числа живых и мёртвых клеток, жизнеспособности и концентрации по фотографии камеры Горяева вместе с наглядной разметкой, которую вы можете проверить и исправить. CellDrop не является медицинским изделием. Не используйте его результаты для клинических или диагностических решений, для отбора эмбрионов или для расчёта дозы клеточной терапии. Ответственность за любое решение несёт квалифицированный специалист. Ваше фото обрабатывается полностью в вашем браузере и никогда не загружается на сервер. Если вы решите сохранить результат, в вашем аккаунте хранятся только значения, но не изображение. Точность снижается при слипшихся клетках, посторонних частицах, плохом фокусе и малом числе клеток. Для надёжного результата подсчитайте не менее 100 клеток по квадратам и проверьте разметку визуально.",

  "auth.signinTitle": "Вход",
  "auth.signinSub": "С возвращением. Продолжайте к своим анализам.",
  "auth.signupTitle": "Регистрация",
  "auth.signupSub": "Сохраняйте анализы и возвращайтесь к ним в любой момент.",
  "auth.email": "Почта",
  "auth.password": "Пароль",
  "auth.passwordHint": "Не менее шести символов.",
  "auth.signin": "Войти",
  "auth.signingIn": "Вход",
  "auth.createAccount": "Создать аккаунт",
  "auth.creatingAccount": "Создание",
  "auth.noAccount": "Ещё нет аккаунта?",
  "auth.createOne": "Создать",
  "auth.haveAccount": "Уже есть аккаунт?",
  "auth.notConfigured":
    "Аккаунты в этой сборке отключены. Добавьте ключи Supabase в файл .env, чтобы включить вход и сохранение истории. Анализатор работает и без аккаунта.",
  "auth.pwTooShort": "Пароль должен быть не короче шести символов.",
  "auth.created":
    "Аккаунт создан. Если включено подтверждение по почте, проверьте ящик и войдите.",

  "history.eyebrow": "История",
  "history.title": "Сохранённые анализы",
  "history.new": "Новый анализ",
  "history.loading": "Загрузка",
  "history.empty": "Пока нет сохранённых анализов.",
  "history.runFirst": "Сделать первый подсчёт",
  "history.date": "Дата",
  "history.live": "Живые",
  "history.dead": "Мёртвые",
  "history.viability": "Жизнеспособность",
  "history.concentration": "Концентрация",
  "history.deleteAria": "Удалить анализ",
};

const dictionaries: Record<Lang, Dict> = { en, ru };

interface I18nValue {
  lang: Lang;
  setLang: (lang: Lang) => void;
  t: (key: string) => string;
}

const I18nContext = createContext<I18nValue | undefined>(undefined);

function initialLang(): Lang {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored === "en" || stored === "ru") return stored;
  } catch {
    // ignore storage access issues
  }
  if (typeof navigator !== "undefined" && navigator.language.toLowerCase().startsWith("ru")) {
    return "ru";
  }
  return "en";
}

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Lang>(initialLang);

  useEffect(() => {
    document.documentElement.lang = lang;
    try {
      localStorage.setItem(STORAGE_KEY, lang);
    } catch {
      // ignore storage access issues
    }
  }, [lang]);

  const t = useCallback(
    (key: string) => dictionaries[lang][key] ?? en[key] ?? key,
    [lang]
  );

  const value = useMemo<I18nValue>(
    () => ({ lang, setLang: setLangState, t }),
    [lang, t]
  );

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export function useI18n(): I18nValue {
  const ctx = useContext(I18nContext);
  if (!ctx) throw new Error("useI18n must be used within a LanguageProvider.");
  return ctx;
}

export function LangToggle() {
  const { lang, setLang } = useI18n();
  return (
    <div className="lang-toggle" role="group" aria-label="Language">
      <button
        className={`lang-btn ${lang === "en" ? "lang-active" : ""}`.trim()}
        onClick={() => setLang("en")}
        aria-pressed={lang === "en"}
      >
        EN
      </button>
      <button
        className={`lang-btn ${lang === "ru" ? "lang-active" : ""}`.trim()}
        onClick={() => setLang("ru")}
        aria-pressed={lang === "ru"}
      >
        RU
      </button>
    </div>
  );
}
