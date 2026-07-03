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
  ageTitle: string;
  lessonTitle: string;
  playableLabel: string;
  soonLabel: string;
  startLesson: string;
  exploreSoon: string;
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

export type ActivityCopy = {
  correct: string;
  incorrect: string;
  next: string;
  progress: string;
};

export type LessonBase = {
  id: LessonId;
  title: string;
  description: string;
  subject: string;
  ageRange: AgeRangeId;
  status: LessonStatus;
  icon: string;
  accent: "berry" | "sky" | "leaf" | "sun";
  route: string;
};

export type PlayableLesson = LessonBase & {
  status: "playable";
  activity: {
    type: "choice";
    copy: ActivityCopy;
    prompts: ActivityPrompt[];
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
    productName: "BrightLearn",
    navLessons: "Lessons",
    navForParents: "For parents",
    heroTitle: "Learn by playing, one tiny adventure at a time",
    heroSubtitle: "Choose a language, pick an age range, and start with colorful lessons made for children and guided adults.",
    ageTitle: "Choose an age range",
    lessonTitle: "Learning worlds",
    playableLabel: "Play",
    soonLabel: "Soon",
    startLesson: "Start lesson",
    exploreSoon: "Preview"
  },
  ru: {
    productName: "BrightLearn",
    navLessons: "Уроки",
    navForParents: "Для родителей",
    heroTitle: "Учись через игру, по одному маленькому приключению",
    heroSubtitle: "Выберите язык, возраст и начните с ярких уроков для детей и взрослых помощников.",
    ageTitle: "Выберите возраст",
    lessonTitle: "Миры обучения",
    playableLabel: "Играть",
    soonLabel: "Скоро",
    startLesson: "Начать урок",
    exploreSoon: "Посмотреть"
  },
  kk: {
    productName: "BrightLearn",
    navLessons: "Сабақтар",
    navForParents: "Ата-аналарға",
    heroTitle: "Үйрен де ойна, әр қадамда жаңа қызық аш",
    heroSubtitle: "Тілді, жасты таңдап, балалар мен ересек көмекшілерге арналған түрлі түсті сабақтарды бастаңыз.",
    ageTitle: "Жас аралығын таңдаңыз",
    lessonTitle: "Үйрену әлемдері",
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
      description: "Counting and number games are coming next.",
      subject: "Math",
      ageRange: "6-8",
      status: "coming-soon",
      icon: "123",
      accent: "sky",
      route: localizedPath("en", "/lessons/math"),
      soonNote: "We will add counting, addition, and playful number challenges."
    },
    {
      id: "chess",
      title: "Chess First Moves",
      description: "Learn how pieces move on the board.",
      subject: "Logic",
      ageRange: "6-8",
      status: "coming-soon",
      icon: "Chess",
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
      description: "Скоро появятся игры со счетом и числами.",
      subject: "Математика",
      ageRange: "6-8",
      status: "coming-soon",
      icon: "123",
      accent: "sky",
      route: localizedPath("ru", "/lessons/math"),
      soonNote: "Мы добавим счет, сложение и веселые задания с числами."
    },
    {
      id: "chess",
      title: "Первые ходы в шахматах",
      description: "Узнай, как ходят фигуры.",
      subject: "Логика",
      ageRange: "6-8",
      status: "coming-soon",
      icon: "Шах",
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
      description: "Санау мен сандар ойыны жақында қосылады.",
      subject: "Математика",
      ageRange: "6-8",
      status: "coming-soon",
      icon: "123",
      accent: "sky",
      route: localizedPath("kk", "/lessons/math"),
      soonNote: "Біз санау, қосу және қызықты сан тапсырмаларын қосамыз."
    },
    {
      id: "chess",
      title: "Шахматтағы алғашқы жүрістер",
      description: "Фигуралардың қалай жүретінін үйрен.",
      subject: "Логика",
      ageRange: "6-8",
      status: "coming-soon",
      icon: "Шах",
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

