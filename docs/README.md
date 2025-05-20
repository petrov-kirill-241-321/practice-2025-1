# Документация

# MicroRedux

Минималистичная и производительная реализация Redux с нуля.

## Основные особенности

- 🚀 **3.2KB** в сжатом виде (в 2x меньше оригинального Redux)
- ⚡ **Оптимизированные алгоритмы** с O(1) сложностью для подписок
- 🔌 **Полная совместимость** с оригинальным Redux API
- 🛠 **Встроенные инструменты** для разработки

## Быстрый старт

```javascript
import { createStore } from "microredux";

const counter = (state = 0, action) => {
  switch (action.type) {
    case "INCREMENT":
      return state + 1;
    case "DECREMENT":
      return state - 1;
    default:
      return state;
  }
};

const store = createStore(counter);

store.subscribe(() => {
  console.log("State:", store.getState());
});

store.dispatch({ type: "INCREMENT" });
```

## API Reference

### `createStore(reducer, [preloadedState], [enhancer])`

Создает Redux хранилище.

**Параметры:**

- `reducer` - Функция-редьюсер
- `preloadedState` - Начальное состояние
- `enhancer` - Усилитель хранилища (например, middleware)

### `combineReducers(reducers)`

Объединяет несколько редьюсеров в один.

```javascript
const rootReducer = combineReducers({
  todos: todosReducer,
  counter: counterReducer,
});
```

# Журнал разработки

**Достижения:**

- Реализованы базовые методы хранилища
- Оптимизирована система подписок
- Добавлены проверки типов действий

**Проблемы:**

- Обнаружена утечка памяти при частой подписке/отписке

---

**Выполнено:**

- Полное описание API
- Примеры использования
- Руководство по миграции

**Статус:**
✅ Завершено

---

**Особенности:**

- Адаптивный дизайн
- Интерактивные примеры
- Система навигации

```html
<nav>
  <a href="/">Главная</a>
  <a href="/docs">Документация</a>
</nav>
```

# Примеры использования

## Базовый счетчик

```javascript
// Редуктор
const counter = (state = 0, action) => {
  switch (action.type) {
    case "INCREMENT":
      return state + 1;
    case "DECREMENT":
      return state - 1;
    default:
      return state;
  }
};

// Создание хранилища
const store = createStore(counter);
```
