Recall is NOT:

- a note-taking application;
- a traditional journal;
- a document manager.

Recall IS:

An AI-powered Personal Memory Operating System that helps users capture, understand, organize, recall and reflect on their lives.

Надыр, сейчас, как ментор, я бы сначала обратил внимание на один важный момент.

**Если Ербосын действительно получил код интерфейса Fabric, не публикуйте его как есть и не выпускайте продукт, который выглядит почти идентично.** Даже если код удалось воспроизвести с помощью ИИ, это не означает, что его можно безопасно использовать как основу коммерческого продукта. Лучше воспринимать его как **референс**: изучить архитектуру интерфейса, а затем постепенно заменить дизайн, компоненты, стили, иконки и пользовательские сценарии на собственные. Это значительно снизит юридические и репутационные риски.

Теперь к самому продукту.

---

# Если бы Recall создавался в Y Combinator

Я бы вообще сказал вам забыть слово **дневник**.

Вы делаете не дневник.

Вы делаете **Personal Memory Operating System**.

Это меняет всё.

---

# Recall v1.0 MVP

Я бы сделал только 8 основных разделов.

```
Home

Timeline

Memories

Insights

People

Search

AI

Settings
```

Больше ничего.

---

# HOME

Это главный экран.

Человек должен открыть приложение и сразу понять

> "ИИ уже сегодня что-то сделал для меня."

Не просто пустая страница.

---

## Верхняя часть

```
Good morning, Nadyr

Friday, June 26

You captured

🎤 1 voice note

📷 4 photos

💭 2 ideas

😊 Mood: Positive
```

---

Справа

```
Today's Memory Score

92%

Everything safely remembered.
```

---

Ниже

```
Continue today's journal

[ Voice ]

[ Upload Photos ]

[ Write ]

[ Import ]
```

Все четыре кнопки большие.

---

# Voice

Самая важная кнопка.

После нажатия

```
🎤

Recording...

```

После остановки

ИИ делает

```
Transcription

↓

Summary

↓

Emotion

↓

Tags

↓

Timeline

↓

People

↓

Locations
```

Автоматически.

---

# Upload Photos

Пользователь просто кидает

3 фотографии.

ИИ автоматически определяет

```
Objects

People

Place

Weather

Event

Time

Emotion
```

---

# Write

Обычный текст.

Но после отправки

ИИ делает

```
Summary

Key Moments

Mood

Action Items

```

---

# Import

Очень важная функция.

```
Google Photos

Apple Photos

Calendar

Notion

PDF

TXT

Audio
```

---

# TIMELINE

Самая красивая часть продукта.

```
Today

↓

Yesterday

↓

Last Week

↓

Last Month

↓

Last Year
```

Каждый день —

красивая карточка.

---

Карточка

```
📷

Graduation

12 Photos

Voice Note

AI Summary

Mood

Weather

People

```

---

При открытии

ИИ показывает

```
Timeline

↓

Photos

↓

Transcript

↓

Summary

↓

Thoughts

↓

Related Memories

```

---

# MEMORIES

Не просто список.

Карточки.

Например

```
Travel

Projects

Ideas

Family

Friends

School

University

Books

Music

Health
```

ИИ автоматически сортирует.

---

# INSIGHTS

Вот это ваша главная киллер-фича.

Каждую неделю

ИИ пишет

```
Weekly Reflection
```

Например

```
You smiled 32% more.

You slept less.

You met 8 friends.

You were most productive on Tuesday.
```

---

Через месяц

```
Monthly Patterns
```

---

Через три месяца

```
Blind Spots
```

Например

```
Every time you sleep after 2 AM

↓

Next day productivity drops 28%.
```

---

# PEOPLE

Очень крутая функция.

ИИ автоматически строит

```
Mom

↓

Friend

↓

Teacher

↓

Erbosyn

↓

Classmates

```

При открытии человека

```
Photos

Voice Notes

Events

Chats

Places

Timeline

```

Все связанные воспоминания.

---

# SEARCH

Самый мощный поиск.

Можно написать

```
Show me

↓

all sunsets

↓

all memories with Erbosyn

↓

everything about RailGuard

↓

my happiest week

↓

all ideas about AI

```

ИИ ищет по всему.

---

# AI

Это чат.

Но не ChatGPT.

Это

Recall AI.

Например

```
Why was I happier in April?

```

ИИ отвечает.

---

Или

```
When did I first mention SmartPasture?

```

---

Или

```
Summarize my last semester.

```

---

# SETTINGS

Минимум.

```
Profile

Subscription

Privacy

Export

Delete Data

Connected Apps

```

---

# Что делает ИИ автоматически

После каждой записи.

```
Speech to Text

↓

Summary

↓

Emotion Detection

↓

Topics

↓

Tags

↓

Location

↓

People

↓

Objects

↓

Timeline

↓

Embeddings

↓

Vector DB
```

---

# Какие функции добавить уже в MVP

Не все сразу, а только те, которые дают ощущение "вау".

### 1. AI Summary

После любой записи.

---

### 2. AI Titles

Вместо

```
Voice 17
```

ИИ пишет

```
Preparing for Physics Olympiad
```

---

### 3. AI Mood

```
😊

Happy
```

---

### 4. AI Tags

```
RailGuard

School

Friends

Presentation
```

---

### 5. Similar Memories

Очень крутая функция.

После записи

```
This reminds you of

↓

April 2025

↓

July 2024
```

---

### 6. Flashback

Каждое утро

```
One year ago today...
```

---

### 7. Weekly Report

Автоматически.

---

### 8. Memory Map

Мини-карта

```
Almaty

Astana

School

Home
```

---

# Что НЕ делать в MVP

❌ Книга.

❌ Цифровой двойник.

❌ Поведенческие прогнозы на основе слабых данных.

❌ 100 интеграций.

❌ Социальную сеть.

❌ Совместные воспоминания.

Все это можно добавить позже.

---

# Что, по моему мнению, сделает Recall действительно уникальным

Большинство AI-дневников работают по принципу: **"Ты записал → ИИ красиво переписал."**

Я бы сделал так, чтобы Recall работал по принципу:

> **"Ты живешь → Recall автоматически строит карту твоей жизни."**

Поэтому MVP должен не просто хранить записи, а постоянно отвечать на три вопроса:

1. **Что сегодня произошло?** (Timeline)
2. **Что это значит в контексте моей жизни?** (Insights)
3. **Как это связано с прошлым?** (Related Memories)

Если эти три механики работают хорошо, то даже первая версия будет ощущаться не как очередной AI Journal, а как начало настоящей **персональной системы памяти**.

## Что бы я дал Ербосыну как техническое ТЗ

Если отбросить всё лишнее, то у MVP должны быть всего **5 ключевых пользовательских сценариев**:

1. **Capture** — быстро сохранить воспоминание (голос, текст или фото).
2. **Understand** — ИИ автоматически структурирует и анализирует его.
3. **Explore** — пользователь легко находит любое прошлое событие через поиск или временную ленту.
4. **Reflect** — каждую неделю и месяц получает автоматические выводы и закономерности.
5. **Recall** — может задавать вопросы своей личной памяти естественным языком.

Если эти пять сценариев будут реализованы качественно, у вас получится MVP с четкой ценностью. Все остальные идеи — «чат с прошлым», печатная книга, расширенные поведенческие модели, совместные воспоминания — я бы оставил на последующие версии после получения обратной связи от первых пользователей.
   





   # Development Workflow

This document defines the product vision and long-term architecture of Recall.

When implementing new functionality, follow these rules:

## 1. Build one feature at a time

Never implement multiple large features in one step.

Each development iteration should focus on a single production-ready feature.

Example:

* Authentication
* Knowledge
* Upload Center
* Knowledge Detail
* Search
* AI Chat

After completing a feature:

* explain architectural decisions;
* ensure typecheck, lint and production build pass;
* wait for review before starting the next feature.

Do not continue automatically.

---

## 2. Production-first

Do not create temporary solutions that will later require rewriting.

Every implementation should already be compatible with the future FastAPI backend.

Use:

* React Query
* Service Layer
* Zustand
* Feature Modules
* Type-safe APIs

---

## 3. Backend Independence

The frontend must never depend directly on mock data.

All data must go through the Service Layer.

Current flow:

Mock Data

↓

Services

↓

React Query

↓

UI

Later this will become:

FastAPI

↓

Services

↓

React Query

↓

UI

The UI should require minimal changes when backend integration begins.

---

## 4. Think as a Product Engineer

Do not build screens only because they exist in other applications.

Every feature should answer:

* What user problem does this solve?
* Why should it exist in Recall?
* Does it strengthen Recall as an AI Memory Platform?

---

## 5. Avoid Feature Creep

If a feature is not essential for the MVP, do not implement it unless requested.

Examples of features that should wait:

* Advanced analytics
* Social features
* Digital twin
* Complex prediction systems
* Gamification

---

## 6. Finish Before Expanding

A feature is considered complete only when:

* UI implemented
* Responsive
* Accessible
* Type-safe
* Uses existing architecture
* Passes lint
* Passes typecheck
* Passes production build

Only then move to the next feature.

---

## 7. Communication

When finishing a feature:

* summarize what was implemented;
* explain architectural decisions;
* mention any technical debt;
* suggest two or three logical next steps.

Do not automatically begin the next major feature.

Wait for product review.
