import { localeCodes, localeLabels, localizedPath, type LocaleCode } from "./locales";

export type LessonStatus = "playable" | "coming-soon";
export type LessonId = "alphabet" | "animals" | "math" | "chess" | "typing" | "chemistry";
export type AgeRangeId = "3-5" | "6-8" | "9+";

export type LocaleMeta = {
  code: LocaleCode;
  label: string;
};

export type HomeCopy = {
  productName: string;
  navLessons: string;
  navForParents: string;
  heroTitle: string;
  heroSubtitle: string;
  startFlowTitle: string;
  startFlow: StartFlowStep[];
  ageTitle: string;
  ageLead: string;
  lessonTitle: string;
  lessonLead: string;
  playableLabel: string;
  soonLabel: string;
  startLesson: string;
  exploreSoon: string;
};

export type StartFlowStep = {
  title: string;
  description: string;
};

export type AgeRange = {
  id: AgeRangeId;
  label: string;
  description: string;
};

export type ActivityChoice = {
  id: string;
  label: string;
  visual: string;
};

export type ActivityPrompt = {
  id: string;
  question: string;
  target: string;
  choices: ActivityChoice[];
  correctChoiceId: string;
};

export type NumberFlashcard = {
  value: number;
  word: string;
  speechText: string;
  objectsLabel: string;
};

export type ActivityCopy = {
  correct: string;
  incorrect: string;
  next: string;
  progress: string;
};

export type NumberFlashcardCopy = {
  listen: string;
  next: string;
  previous: string;
  writePrompt: string;
  objectsLabel: string;
  progress: string;
};

export type LessonImage = {
  src: string;
  alt: string;
};

export type LessonBase = {
  id: LessonId;
  title: string;
  description: string;
  subject: string;
  ageRange: AgeRangeId;
  status: LessonStatus;
  icon: string;
  image: LessonImage;
  accent: "berry" | "sky" | "leaf" | "sun";
  route: string;
};

export type PlayableLesson = LessonBase & {
  status: "playable";
  activity:
    | {
        type: "choice";
        copy: ActivityCopy;
        prompts: ActivityPrompt[];
      }
    | {
        type: "number-flashcards";
        copy: NumberFlashcardCopy;
        cards: NumberFlashcard[];
      };
};

export type ComingSoonLesson = LessonBase & {
  status: "coming-soon";
  soonNote: string;
};

export type Lesson = PlayableLesson | ComingSoonLesson;

export const locales: LocaleMeta[] = localeCodes.map((code) => ({
  code,
  label: localeLabels[code]
}));

const homeCopy: Record<LocaleCode, HomeCopy> = {
  en: {
    productName: "Uyren",
    navLessons: "Lessons",
    navForParents: "For parents",
    heroTitle: "Learn by playing, one tiny adventure at a time",
    heroSubtitle: "Choose a language, pick an age range, and start with colorful lessons made for children and guided adults.",
    startFlowTitle: "Start in three taps",
    startFlow: [
      { title: "Choose language", description: "English, Russian, or Kazakh" },
      { title: "Choose age", description: "3-5, 6-8, or 9+" },
      { title: "Pick a lesson", description: "Play now or preview what is next" }
    ],
    ageTitle: "Choose an age range",
    ageLead: "Big buttons for small hands, with simple paths for parents and teachers.",
    lessonTitle: "Learning worlds",
    lessonLead: "Start with playable lessons, then grow into math, chess, computers, and science.",
    playableLabel: "Play",
    soonLabel: "Soon",
    startLesson: "Start lesson",
    exploreSoon: "Preview"
  },
  ru: {
    productName: "Uyren",
    navLessons: "Уроки",
    navForParents: "Для родителей",
    heroTitle: "Учись через игру, по одному маленькому приключению",
    heroSubtitle: "Выберите язык, возраст и начните с ярких уроков для детей и взрослых помощников.",
    startFlowTitle: "Начните за три нажатия",
    startFlow: [
      { title: "Выберите язык", description: "Английский, русский или казахский" },
      { title: "Выберите возраст", description: "3-5, 6-8 или 9+" },
      { title: "Выберите урок", description: "Играйте сейчас или смотрите, что будет дальше" }
    ],
    ageTitle: "Выберите возраст",
    ageLead: "Большие кнопки для детей и понятный путь для родителей и учителей.",
    lessonTitle: "Миры обучения",
    lessonLead: "Начните с игровых уроков, затем переходите к математике, шахматам, компьютерам и науке.",
    playableLabel: "Играть",
    soonLabel: "Скоро",
    startLesson: "Начать урок",
    exploreSoon: "Посмотреть"
  },
  kk: {
    productName: "Uyren",
    navLessons: "Сабақтар",
    navForParents: "Ата-аналарға",
    heroTitle: "Үйрен де ойна, әр қадамда жаңа қызық аш",
    heroSubtitle: "Тілді, жасты таңдап, балалар мен ересек көмекшілерге арналған түрлі түсті сабақтарды бастаңыз.",
    startFlowTitle: "Үш қадаммен бастаңыз",
    startFlow: [
      { title: "Тілді таңдаңыз", description: "Ағылшын, орыс немесе қазақ тілі" },
      { title: "Жасты таңдаңыз", description: "3-5, 6-8 немесе 9+" },
      { title: "Сабақты таңдаңыз", description: "Қазір ойнаңыз немесе келесі сабақтарды көріңіз" }
    ],
    ageTitle: "Жас аралығын таңдаңыз",
    ageLead: "Балаларға ыңғайлы үлкен батырмалар және ата-ана мен мұғалімге түсінікті жол.",
    lessonTitle: "Үйрену әлемдері",
    lessonLead: "Алдымен ойын сабақтарынан бастап, кейін математика, шахмат, компьютер және ғылымға өтіңіз.",
    playableLabel: "Ойнау",
    soonLabel: "Жақында",
    startLesson: "Сабақты бастау",
    exploreSoon: "Көру"
  }
};

const ageRanges: Record<LocaleCode, AgeRange[]> = {
  en: [
    { id: "3-5", label: "3-5", description: "Look, tap, match" },
    { id: "6-8", label: "6-8", description: "Practice basics" },
    { id: "9+", label: "9+", description: "Grow deeper" }
  ],
  ru: [
    { id: "3-5", label: "3-5", description: "Смотри, нажимай, находи" },
    { id: "6-8", label: "6-8", description: "Тренируй основы" },
    { id: "9+", label: "9+", description: "Учись глубже" }
  ],
  kk: [
    { id: "3-5", label: "3-5", description: "Қара, бас, сәйкестендір" },
    { id: "6-8", label: "6-8", description: "Негіздерді жаттықтыр" },
    { id: "9+", label: "9+", description: "Тереңірек үйрен" }
  ]
};

const lessonImageSources: Record<LessonId, string> = {
  alphabet: "/media/lessons/alphabet.svg",
  animals: "/media/lessons/animals.svg",
  math: "/media/lessons/math.svg",
  chess: "/media/lessons/chess.svg",
  typing: "/media/lessons/typing.svg",
  chemistry: "/media/lessons/chemistry.svg"
};

function lessonImage(id: LessonId, alt: string): LessonImage {
  return {
    src: lessonImageSources[id],
    alt
  };
}

const numberWords: Record<LocaleCode, string[]> = {
  en: ["zero", "one", "two", "three", "four", "five", "six", "seven", "eight", "nine", "ten"],
  ru: ["ноль", "один", "два", "три", "четыре", "пять", "шесть", "семь", "восемь", "девять", "десять"],
  kk: ["нөл", "бір", "екі", "үш", "төрт", "бес", "алты", "жеті", "сегіз", "тоғыз", "он"]
};

const objectLabels: Record<LocaleCode, string[]> = {
  en: ["No apples", "1 apple", "2 apples", "3 apples", "4 apples", "5 apples", "6 apples", "7 apples", "8 apples", "9 apples", "10 apples"],
  ru: ["Нет яблок", "1 яблоко", "2 яблока", "3 яблока", "4 яблока", "5 яблок", "6 яблок", "7 яблок", "8 яблок", "9 яблок", "10 яблок"],
  kk: ["Алма жоқ", "1 алма", "2 алма", "3 алма", "4 алма", "5 алма", "6 алма", "7 алма", "8 алма", "9 алма", "10 алма"]
};

const numberFlashcardCopy: Record<LocaleCode, NumberFlashcardCopy> = {
  en: {
    listen: "Listen",
    next: "Next number",
    previous: "Previous number",
    writePrompt: "Write this number on paper, then trace it with your finger.",
    objectsLabel: "Count together",
    progress: "number card"
  },
  ru: {
    listen: "Слушать",
    next: "Следующее число",
    previous: "Предыдущее число",
    writePrompt: "Напиши это число на бумаге, затем обведи его пальцем.",
    objectsLabel: "Считаем вместе",
    progress: "карточка с числом"
  },
  kk: {
    listen: "Тыңдау",
    next: "Келесі сан",
    previous: "Алдыңғы сан",
    writePrompt: "Бұл санды қағазға жаз, кейін саусағыңмен қайталап сыз.",
    objectsLabel: "Бірге санайық",
    progress: "сан карточкасы"
  }
};

function numberCards(locale: LocaleCode): NumberFlashcard[] {
  return numberWords[locale].map((word, value) => ({
    value,
    word,
    speechText: word,
    objectsLabel: objectLabels[locale][value]
  }));
}

const lessons: Record<LocaleCode, Lesson[]> = {
  en: [
    {
      id: "alphabet",
      title: "Alphabet Garden",
      description: "Find friendly letters and hear their shapes in your head.",
      subject: "Language",
      ageRange: "3-5",
      status: "playable",
      icon: "A",
      image: lessonImage("alphabet", "Alphabet letter cards for early reading practice"),
      accent: "berry",
      route: localizedPath("en", "/lessons/alphabet"),
      activity: {
        type: "choice",
        copy: {
          correct: "Great job!",
          incorrect: "Try again.",
          next: "Next letter",
          progress: "letters found"
        },
        prompts: [
          {
            id: "letter-a",
            question: "Find the letter A",
            target: "A",
            correctChoiceId: "a",
            choices: [
              { id: "a", label: "A", visual: "A" },
              { id: "m", label: "M", visual: "M" },
              { id: "s", label: "S", visual: "S" }
            ]
          },
          {
            id: "letter-b",
            question: "Find the letter B",
            target: "B",
            correctChoiceId: "b",
            choices: [
              { id: "p", label: "P", visual: "P" },
              { id: "b", label: "B", visual: "B" },
              { id: "d", label: "D", visual: "D" }
            ]
          }
        ]
      }
    },
    {
      id: "animals",
      title: "Animal Friends",
      description: "Match animals by picture and name.",
      subject: "Nature",
      ageRange: "3-5",
      status: "playable",
      icon: "Paw",
      image: lessonImage("animals", "Simple animal learning cards with a cat and paw print"),
      accent: "leaf",
      route: localizedPath("en", "/lessons/animals"),
      activity: {
        type: "choice",
        copy: {
          correct: "Great job!",
          incorrect: "Try again.",
          next: "Next animal",
          progress: "animals matched"
        },
        prompts: [
          {
            id: "animal-cat",
            question: "Find the cat",
            target: "Cat",
            correctChoiceId: "cat",
            choices: [
              { id: "dog", label: "Dog", visual: "Dog" },
              { id: "cat", label: "Cat", visual: "Cat" },
              { id: "bird", label: "Bird", visual: "Bird" }
            ]
          },
          {
            id: "animal-horse",
            question: "Find the horse",
            target: "Horse",
            correctChoiceId: "horse",
            choices: [
              { id: "fish", label: "Fish", visual: "Fish" },
              { id: "bear", label: "Bear", visual: "Bear" },
              { id: "horse", label: "Horse", visual: "Horse" }
            ]
          }
        ]
      }
    },
    {
      id: "math",
      title: "Math Adventure",
      description: "Swipe number cards, listen to each word, and practice writing 0-10.",
      subject: "Math",
      ageRange: "6-8",
      status: "playable",
      icon: "123",
      image: lessonImage("math", "Counting blocks and numbers for early math practice"),
      accent: "sky",
      route: localizedPath("en", "/lessons/math"),
      activity: {
        type: "number-flashcards",
        copy: numberFlashcardCopy.en,
        cards: numberCards("en")
      }
    },
    {
      id: "chess",
      title: "Chess First Moves",
      description: "Learn how pieces move on the board.",
      subject: "Logic",
      ageRange: "6-8",
      status: "coming-soon",
      icon: "Chess",
      image: lessonImage("chess", "Chess board and pieces for first move lessons"),
      accent: "sun",
      route: localizedPath("en", "/lessons/chess"),
      soonNote: "We will add board practice for pawns, rooks, bishops, and kings."
    },
    {
      id: "typing",
      title: "Keyboard Camp",
      description: "Practice letters and simple typing.",
      subject: "Computer",
      ageRange: "9+",
      status: "coming-soon",
      icon: "Keys",
      image: lessonImage("typing", "Keyboard keys for computer typing practice"),
      accent: "berry",
      route: localizedPath("en", "/lessons/typing"),
      soonNote: "We will add gentle typing practice and keyboard games."
    },
    {
      id: "chemistry",
      title: "Tiny Chemistry",
      description: "Meet matter, colors, and safe experiments.",
      subject: "Science",
      ageRange: "9+",
      status: "coming-soon",
      icon: "Lab",
      image: lessonImage("chemistry", "Safe school chemistry beakers and molecules"),
      accent: "leaf",
      route: localizedPath("en", "/lessons/chemistry"),
      soonNote: "We will add simple science cards and teacher-friendly explanations."
    }
  ],
  ru: [
    {
      id: "alphabet",
      title: "Сад алфавита",
      description: "Находи дружелюбные буквы и запоминай их форму.",
      subject: "Язык",
      ageRange: "3-5",
      status: "playable",
      icon: "А",
      image: lessonImage("alphabet", "Карточки с буквами для первого чтения"),
      accent: "berry",
      route: localizedPath("ru", "/lessons/alphabet"),
      activity: {
        type: "choice",
        copy: {
          correct: "Отлично!",
          incorrect: "Попробуй еще раз.",
          next: "Следующая буква",
          progress: "букв найдено"
        },
        prompts: [
          {
            id: "letter-a",
            question: "Найди букву А",
            target: "А",
            correctChoiceId: "a",
            choices: [
              { id: "a", label: "А", visual: "А" },
              { id: "m", label: "М", visual: "М" },
              { id: "s", label: "С", visual: "С" }
            ]
          },
          {
            id: "letter-b",
            question: "Найди букву Б",
            target: "Б",
            correctChoiceId: "b",
            choices: [
              { id: "p", label: "П", visual: "П" },
              { id: "b", label: "Б", visual: "Б" },
              { id: "d", label: "Д", visual: "Д" }
            ]
          }
        ]
      }
    },
    {
      id: "animals",
      title: "Друзья-животные",
      description: "Соединяй животных по картинке и названию.",
      subject: "Природа",
      ageRange: "3-5",
      status: "playable",
      icon: "Лапа",
      image: lessonImage("animals", "Карточки с животными для изучения природы"),
      accent: "leaf",
      route: localizedPath("ru", "/lessons/animals"),
      activity: {
        type: "choice",
        copy: {
          correct: "Отлично!",
          incorrect: "Попробуй еще раз.",
          next: "Следующее животное",
          progress: "животных найдено"
        },
        prompts: [
          {
            id: "animal-cat",
            question: "Найди кошку",
            target: "Кошка",
            correctChoiceId: "cat",
            choices: [
              { id: "dog", label: "Собака", visual: "Собака" },
              { id: "cat", label: "Кошка", visual: "Кошка" },
              { id: "bird", label: "Птица", visual: "Птица" }
            ]
          },
          {
            id: "animal-horse",
            question: "Найди лошадь",
            target: "Лошадь",
            correctChoiceId: "horse",
            choices: [
              { id: "fish", label: "Рыба", visual: "Рыба" },
              { id: "bear", label: "Медведь", visual: "Медведь" },
              { id: "horse", label: "Лошадь", visual: "Лошадь" }
            ]
          }
        ]
      }
    },
    {
      id: "math",
      title: "Математическое приключение",
      description: "Листай карточки чисел, слушай слова и тренируй написание 0-10.",
      subject: "Математика",
      ageRange: "6-8",
      status: "playable",
      icon: "123",
      image: lessonImage("math", "Кубики и числа для первых занятий математикой"),
      accent: "sky",
      route: localizedPath("ru", "/lessons/math"),
      activity: {
        type: "number-flashcards",
        copy: numberFlashcardCopy.ru,
        cards: numberCards("ru")
      }
    },
    {
      id: "chess",
      title: "Первые ходы в шахматах",
      description: "Узнай, как ходят фигуры.",
      subject: "Логика",
      ageRange: "6-8",
      status: "coming-soon",
      icon: "Шах",
      image: lessonImage("chess", "Шахматная доска и фигуры для первых ходов"),
      accent: "sun",
      route: localizedPath("ru", "/lessons/chess"),
      soonNote: "Мы добавим практику с пешками, ладьями, слонами и королем."
    },
    {
      id: "typing",
      title: "Клавиатурный лагерь",
      description: "Тренируй буквы и простую печать.",
      subject: "Компьютер",
      ageRange: "9+",
      status: "coming-soon",
      icon: "Клав",
      image: lessonImage("typing", "Клавиши клавиатуры для тренировки печати"),
      accent: "berry",
      route: localizedPath("ru", "/lessons/typing"),
      soonNote: "Мы добавим спокойные упражнения и игры с клавиатурой."
    },
    {
      id: "chemistry",
      title: "Маленькая химия",
      description: "Знакомься с веществами, цветами и безопасными опытами.",
      subject: "Наука",
      ageRange: "9+",
      status: "coming-soon",
      icon: "Лаб",
      image: lessonImage("chemistry", "Безопасные школьные колбы и молекулы"),
      accent: "leaf",
      route: localizedPath("ru", "/lessons/chemistry"),
      soonNote: "Мы добавим простые научные карточки и объяснения для учителей."
    }
  ],
  kk: [
    {
      id: "alphabet",
      title: "Әліпби бағы",
      description: "Достық әріптерді тауып, олардың пішінін есте сақта.",
      subject: "Тіл",
      ageRange: "3-5",
      status: "playable",
      icon: "Ә",
      image: lessonImage("alphabet", "Алғашқы оқуға арналған әріп карточкалары"),
      accent: "berry",
      route: localizedPath("kk", "/lessons/alphabet"),
      activity: {
        type: "choice",
        copy: {
          correct: "Жарайсың!",
          incorrect: "Тағы байқап көр.",
          next: "Келесі әріп",
          progress: "әріп табылды"
        },
        prompts: [
          {
            id: "letter-a",
            question: "А әрпін тап",
            target: "А",
            correctChoiceId: "a",
            choices: [
              { id: "a", label: "А", visual: "А" },
              { id: "m", label: "М", visual: "М" },
              { id: "s", label: "С", visual: "С" }
            ]
          },
          {
            id: "letter-b",
            question: "Б әрпін тап",
            target: "Б",
            correctChoiceId: "b",
            choices: [
              { id: "p", label: "П", visual: "П" },
              { id: "b", label: "Б", visual: "Б" },
              { id: "d", label: "Д", visual: "Д" }
            ]
          }
        ]
      }
    },
    {
      id: "animals",
      title: "Жануар достар",
      description: "Жануарларды суреті мен атауы арқылы сәйкестендір.",
      subject: "Табиғат",
      ageRange: "3-5",
      status: "playable",
      icon: "Із",
      image: lessonImage("animals", "Табиғатты үйренуге арналған жануар карточкалары"),
      accent: "leaf",
      route: localizedPath("kk", "/lessons/animals"),
      activity: {
        type: "choice",
        copy: {
          correct: "Жарайсың!",
          incorrect: "Тағы байқап көр.",
          next: "Келесі жануар",
          progress: "жануар табылды"
        },
        prompts: [
          {
            id: "animal-cat",
            question: "Мысықты тап",
            target: "Мысық",
            correctChoiceId: "cat",
            choices: [
              { id: "dog", label: "Ит", visual: "Ит" },
              { id: "cat", label: "Мысық", visual: "Мысық" },
              { id: "bird", label: "Құс", visual: "Құс" }
            ]
          },
          {
            id: "animal-horse",
            question: "Жылқыны тап",
            target: "Жылқы",
            correctChoiceId: "horse",
            choices: [
              { id: "fish", label: "Балық", visual: "Балық" },
              { id: "bear", label: "Аю", visual: "Аю" },
              { id: "horse", label: "Жылқы", visual: "Жылқы" }
            ]
          }
        ]
      }
    },
    {
      id: "math",
      title: "Математика саяхаты",
      description: "Сан карточкаларын ауыстырып, сөзді тыңдап, 0-10 жазуды жаттықтыр.",
      subject: "Математика",
      ageRange: "6-8",
      status: "playable",
      icon: "123",
      image: lessonImage("math", "Алғашқы математикаға арналған сандар мен текшелер"),
      accent: "sky",
      route: localizedPath("kk", "/lessons/math"),
      activity: {
        type: "number-flashcards",
        copy: numberFlashcardCopy.kk,
        cards: numberCards("kk")
      }
    },
    {
      id: "chess",
      title: "Шахматтағы алғашқы жүрістер",
      description: "Фигуралардың қалай жүретінін үйрен.",
      subject: "Логика",
      ageRange: "6-8",
      status: "coming-soon",
      icon: "Шах",
      image: lessonImage("chess", "Алғашқы жүрістерге арналған шахмат тақтасы мен фигуралар"),
      accent: "sun",
      route: localizedPath("kk", "/lessons/chess"),
      soonNote: "Біз пешка, тура, піл және патшаға арналған тақта жаттығуларын қосамыз."
    },
    {
      id: "typing",
      title: "Пернетақта лагері",
      description: "Әріптер мен қарапайым теруді жаттықтыр.",
      subject: "Компьютер",
      ageRange: "9+",
      status: "coming-soon",
      icon: "Пер",
      image: lessonImage("typing", "Теру жаттығуларына арналған пернетақта пернелері"),
      accent: "berry",
      route: localizedPath("kk", "/lessons/typing"),
      soonNote: "Біз жеңіл теру жаттығулары мен пернетақта ойындарын қосамыз."
    },
    {
      id: "chemistry",
      title: "Кішкентай химия",
      description: "Заттармен, түстермен және қауіпсіз тәжірибелермен таныс.",
      subject: "Ғылым",
      ageRange: "9+",
      status: "coming-soon",
      icon: "Зерт",
      image: lessonImage("chemistry", "Қауіпсіз мектеп химиясына арналған колбалар мен молекулалар"),
      accent: "leaf",
      route: localizedPath("kk", "/lessons/chemistry"),
      soonNote: "Біз қарапайым ғылыми карточкалар мен мұғалімдерге арналған түсіндірмелер қосамыз."
    }
  ]
};

export function getHomeCopy(locale: LocaleCode): HomeCopy {
  return homeCopy[locale];
}

export function getAgeRanges(locale: LocaleCode): AgeRange[] {
  return ageRanges[locale];
}

export function getLessons(locale: LocaleCode): Lesson[] {
  return lessons[locale];
}

export function getLessonById(locale: LocaleCode, lessonId: string): Lesson | undefined {
  return lessons[locale].find((lesson) => lesson.id === lessonId);
}

export function getLessonIds(): LessonId[] {
  return lessons.en.map((lesson) => lesson.id);
}
