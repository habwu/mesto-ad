const config = {
  baseUrl: 'https://mesto.nomoreparties.co/v1/apf-cohort-203', 
  headers: {
    authorization: '67c5edf6-11f3-4cd2-8cab-2009fa0c1d9f',
    'Content-Type': 'application/json'
  }
};

const getResponseData = (res) => {
  return res.ok ? res.json() : Promise.reject(`Ошибка: ${res.status}`);
};

export const getUserInfo = () => {
  return fetch(`${config.baseUrl}/users/me`, {
    headers: config.headers
  }).then(getResponseData);
};
// Добавляем функцию отправки новых данных профиля
export const setUserInfo = ({ name, about }) => {
  return fetch(`${config.baseUrl}/users/me`, {
    method: "PATCH", // Метод для частичного обновления данных
    headers: config.headers,
    body: JSON.stringify({
      name,
      about,
    }),
  }).then(getResponseData);
};

// Функция для получения карточек с сервера
export const getInitialCards = () => {
  return fetch(`${config.baseUrl}/cards`, {
    headers: config.headers
  }).then(getResponseData);
};

// Функция для добавления новой карточки на сервер
export const addCard = (name, link) => {
  return fetch(`${config.baseUrl}/cards`, {
    method: "POST",
    headers: config.headers,
    body: JSON.stringify({
      name,
      link,
    }),
  }).then(getResponseData);
};

// Функция для удаления карточки
export const deleteCardApi = (cardId) => {
  return fetch(`${config.baseUrl}/cards/${cardId}`, {
    method: "DELETE",
    headers: config.headers,
  }).then(getResponseData);
};

// Поставить лайк
export const addLike = (cardId) => {
  return fetch(`${config.baseUrl}/cards/${cardId}/likes`, {
    method: "PUT",
    headers: config.headers,
  }).then(getResponseData);
};

// Убрать лайк
export const removeLike = (cardId) => {
  return fetch(`${config.baseUrl}/cards/${cardId}/likes`, {
    method: "DELETE",
    headers: config.headers,
  }).then(getResponseData);
};


export const setUserAvatar = (avatarUrl) => {
  return fetch(`${config.baseUrl}/users/me/avatar`, {
    method: "PATCH",
    headers: config.headers,
    body: JSON.stringify({
      avatar: avatarUrl
    }),
  }).then(getResponseData);
};