/**
 * Создает хранилище Redux
 * @param {function} reducer - Функция-редьюсер
 * @param {*} [preloadedState] - Начальное состояние
 * @param {function} [enhancer] - Усилитель хранилища (например, middleware)
 * @returns {object} Объект хранилища Redux
 */
function createStore(reducer, preloadedState, enhancer) {
  // Обработка случая, когда enhancer передается как второй аргумент
  if (typeof preloadedState === "function" && typeof enhancer === "undefined") {
    enhancer = preloadedState;
    preloadedState = undefined;
  }

  // Если передан enhancer, создаем усиленное хранилище
  if (typeof enhancer !== "undefined") {
    if (typeof enhancer !== "function") {
      throw new Error("Expected the enhancer to be a function.");
    }

    return enhancer(createStore)(reducer, preloadedState);
  }

  if (typeof reducer !== "function") {
    throw new Error("Expected the reducer to be a function.");
  }

  let currentReducer = reducer;
  let currentState = preloadedState;
  let currentListeners = [];
  let nextListeners = currentListeners;
  let isDispatching = false;

  /**
   * Делает копию currentListeners для nextListeners
   */
  function ensureCanMutateNextListeners() {
    if (nextListeners === currentListeners) {
      nextListeners = currentListeners.slice();
    }
  }

  /**
   * Возвращает текущее состояние приложения
   * @returns {*} Текущее состояние
   */
  function getState() {
    if (isDispatching) {
      throw new Error(
        "You may not call store.getState() while the reducer is executing. " +
          "The reducer has already received the state as an argument. " +
          "Pass it down from the top reducer instead."
      );
    }

    return currentState;
  }

  /**
   * Добавляет слушателя изменений
   * @param {function} listener - Функция-слушатель
   * @returns {function} Функция для отписки
   */
  function subscribe(listener) {
    if (typeof listener !== "function") {
      throw new Error("Expected the listener to be a function.");
    }

    if (isDispatching) {
      throw new Error(
        "You may not call store.subscribe() while the reducer is executing. " +
          "If you would like to be notified after the store has been updated, subscribe from a " +
          "component and invoke store.getState() in the callback to access the latest state. " +
          "See https://redux.js.org/api/store#subscribelistener for more details."
      );
    }

    let isSubscribed = true;

    ensureCanMutateNextListeners();
    nextListeners.push(listener);

    return function unsubscribe() {
      if (!isSubscribed) {
        return;
      }

      if (isDispatching) {
        throw new Error(
          "You may not unsubscribe from a store listener while the reducer is executing. " +
            "See https://redux.js.org/api/store#subscribelistener for more details."
        );
      }

      isSubscribed = false;

      ensureCanMutateNextListeners();
      const index = nextListeners.indexOf(listener);
      nextListeners.splice(index, 1);
      currentListeners = null;
    };
  }

  /**
   * Отправляет действие
   * @param {object} action - Простое действие (объект с полем type)
   * @returns {object} То же действие
   */
  function dispatch(action) {
    if (!isPlainObject(action)) {
      throw new Error(
        "Actions must be plain objects. " +
          "Use custom middleware for async actions."
      );
    }

    if (typeof action.type === "undefined") {
      throw new Error(
        'Actions may not have an undefined "type" property. ' +
          "Have you misspelled a constant?"
      );
    }

    if (isDispatching) {
      throw new Error("Reducers may not dispatch actions.");
    }

    try {
      isDispatching = true;
      currentState = currentReducer(currentState, action);
    } finally {
      isDispatching = false;
    }

    const listeners = (currentListeners = nextListeners);
    for (let i = 0; i < listeners.length; i++) {
      const listener = listeners[i];
      listener();
    }

    return action;
  }

  /**
   * Заменяет редьюсер
   * @param {function} nextReducer - Новый редьюсер
   */
  function replaceReducer(nextReducer) {
    if (typeof nextReducer !== "function") {
      throw new Error("Expected the nextReducer to be a function.");
    }

    currentReducer = nextReducer;
    dispatch({ type: "@@redux/INIT" });
  }

  // Инициализация хранилища
  dispatch({ type: "@@redux/INIT" });

  return {
    dispatch,
    subscribe,
    getState,
    replaceReducer,
  };
}

/**
 * Проверяет, является ли объект простым (не экземпляром класса и т.д.)
 * @param {object} obj - Объект для проверки
 * @returns {boolean} Результат проверки
 */
function isPlainObject(obj) {
  if (typeof obj !== "object" || obj === null) return false;

  let proto = obj;
  while (Object.getPrototypeOf(proto) !== null) {
    proto = Object.getPrototypeOf(proto);
  }

  return Object.getPrototypeOf(obj) === proto;
}

/**
 * Комбинирует несколько редьюсеров в один
 * @param {object} reducers - Объект с редьюсерами
 * @returns {function} Комбинированный редьюсер
 */
function combineReducers(reducers) {
  const reducerKeys = Object.keys(reducers);
  const finalReducers = {};

  for (let i = 0; i < reducerKeys.length; i++) {
    const key = reducerKeys[i];

    if (typeof reducers[key] === "function") {
      finalReducers[key] = reducers[key];
    }
  }

  const finalReducerKeys = Object.keys(finalReducers);

  return function combination(state = {}, action) {
    let hasChanged = false;
    const nextState = {};

    for (let i = 0; i < finalReducerKeys.length; i++) {
      const key = finalReducerKeys[i];
      const reducer = finalReducers[key];
      const previousStateForKey = state[key];
      const nextStateForKey = reducer(previousStateForKey, action);

      nextState[key] = nextStateForKey;
      hasChanged = hasChanged || nextStateForKey !== previousStateForKey;
    }

    hasChanged =
      hasChanged || finalReducerKeys.length !== Object.keys(state).length;

    return hasChanged ? nextState : state;
  };
}

/**
 * Применяет middleware к хранилищу Redux
 * @param {...function} middlewares - Middleware-функции
 * @returns {function} Усилитель хранилища
 */
function applyMiddleware(...middlewares) {
  return (createStore) => (reducer, preloadedState) => {
    const store = createStore(reducer, preloadedState);
    let dispatch = () => {
      throw new Error(
        "Dispatching while constructing your middleware is not allowed. " +
          "Other middleware would not be applied to this dispatch."
      );
    };

    const middlewareAPI = {
      getState: store.getState,
      dispatch: (action, ...args) => dispatch(action, ...args),
    };

    const chain = middlewares.map((middleware) => middleware(middlewareAPI));
    dispatch = compose(...chain)(store.dispatch);

    return {
      ...store,
      dispatch,
    };
  };
}

/**
 * Комбинирует функции справа налево
 * @param {...function} funcs - Функции для композиции
 * @returns {function} Комбинированная функция
 */
function compose(...funcs) {
  if (funcs.length === 0) {
    return (arg) => arg;
  }

  if (funcs.length === 1) {
    return funcs[0];
  }

  return funcs.reduce(
    (a, b) =>
      (...args) =>
        a(b(...args))
  );
}

// Экспортируем API Redux
const Redux = {
  createStore,
  combineReducers,
  applyMiddleware,
  compose,
};

// Пример использования:
/*
const counterReducer = (state = 0, action) => {
  switch (action.type) {
    case 'INCREMENT':
      return state + 1
    case 'DECREMENT':
      return state - 1
    default:
      return state
  }
}

const store = Redux.createStore(counterReducer)

store.subscribe(() => {
  console.log('State changed:', store.getState())
})

store.dispatch({ type: 'INCREMENT' })
store.dispatch({ type: 'INCREMENT' })
store.dispatch({ type: 'DECREMENT' })
*/
