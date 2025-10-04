# Messenger App

Современное веб-приложение для обмена сообщениями, построенное на Next.js 15 с Firebase и OpenAI.

## 🚀 Особенности

- **Реальное время**: Мгновенная доставка сообщений
- **AI-бот**: Интеграция с OpenAI для умного чата
- **Аутентификация**: Firebase Auth
- **Адаптивный дизайн**: Оптимизирован для мобильных устройств и десктопа
- **Типизация**: Полная поддержка TypeScript
- **Тестирование**: Unit и E2E тесты с Jest и Playwright

## 🛠 Технологии

- **Frontend**: Next.js 15, TypeScript
- **Стилизация**: Tailwind CSS
- **Состояние**: Redux Toolkit, RTK Query
- **Аутентификация**: Firebase Auth
- **База данных**: Firestore
- **AI**: OpenAI
- **Тестирование**: Jest, Playwright, Testing Library
- **Линтинг**: ESLint, Prettier

## 📦 Установка

1. **Клонируйте репозиторий**

   ```bash
   git clone <repository-url>
   cd messenger-app
   ```

2. **Установите зависимости**

   ```bash
   npm install
   ```

3. **Настройте переменные окружения**

   Создайте файл `.env.local` в корне проекта:

   ```env
   # Firebase Configuration
   NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key_here
   NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project_id.firebaseapp.com
   NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
   NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id

   # Firebase Admin SDK (Server-side)
   FIREBASE_ADMIN_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nYOUR_PRIVATE_KEY_HERE\n-----END PRIVATE KEY-----\n"
   FIREBASE_ADMIN_CLIENT_EMAIL=firebase-adminsdk-xxxxx@your_project_id.iam.gserviceaccount.com
   FIREBASE_ADMIN_PROJECT_ID=your_project_id
   FIREBASE_WEB_API_KEY=firebase_web_api_key

   # Bot Configuration
   BOT_NAME=AI Assistant
   OPEN_AI=gemini-pro
   ```

## 🚀 Разработка

```bash
# Запуск в режиме разработки
npm run dev

# Сборка для продакшена
npm run build

# Запуск продакшен сборки
npm start

# Линтинг
npm run lint

# Форматирование кода
npm run format

# Тесты
npm run test
npm run test:watch
npm run test:coverage

# E2E тесты
npm run test:e2e
npm run test:e2e:ui
```

```

## 📁 Структура проекта

```

src/
├── app/ # Next.js App Router
│ ├── (auth)/ # Аутентификация
│ ├── (main)/ # Основное приложение
│ └── api/ # API маршруты
├── modules/ # Модули приложения
│ ├── auth/ # Аутентификация
│ ├── chat/ # Чат функциональность
│ ├── profile/ # Профиль пользователя
│ └── users/ # Управление пользователями
├── server/ # Серверная логика
│ ├── auth/ # Верификация токенов
│ ├── bot/ # AI бот
│ ├── firebase/ # Firebase Admin
│ └── firestore/ # Firestore DAO
└── shared/ # Общие компоненты
├── components/ # UI компоненты
├── hooks/ # Кастомные хуки
├── lib/ # Утилиты
└── store/ # Redux store

```

## 🔧 Конфигурация

### ESLint
Настроен для TypeScript с правилами Next.js и Prettier.

### Prettier
Автоматическое форматирование кода.

### Husky
Pre-commit хуки для проверки кода.

### Jest
Конфигурация для тестирования React компонентов.

### Playwright
E2E тестирование с поддержкой различных браузеров.

## 📄 Лицензия

MIT License

```
