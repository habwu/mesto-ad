import { createCardElement } from "./components/card.js";
import { openModalWindow, closeModalWindow, setCloseModalWindowEventListeners } from "./components/modal.js";
import { getUserInfo, setUserInfo, getInitialCards, addCard, deleteCardApi, addLike, removeLike, setUserAvatar } from "./components/api.js";
import { enableValidation, clearValidation } from "./components/validation.js";

let userId;

// --- DOM Узлы ---
const placesWrap = document.querySelector(".places__list");
const allPopups = document.querySelectorAll(".popup");

// Профиль
const profileTitle = document.querySelector(".profile__title");
const profileDescription = document.querySelector(".profile__description");
const profileAvatar = document.querySelector(".profile__image");
const openProfileFormButton = document.querySelector(".profile__edit-button");
const profileFormModalWindow = document.querySelector(".popup_type_edit");
const profileForm = profileFormModalWindow.querySelector(".popup__form");
const profileTitleInput = profileForm.querySelector(".popup__input_type_name");
const profileDescriptionInput = profileForm.querySelector(".popup__input_type_description");

// Карточки
const openCardFormButton = document.querySelector(".profile__add-button");
const cardFormModalWindow = document.querySelector(".popup_type_new-card");
const cardForm = cardFormModalWindow.querySelector(".popup__form");
const cardNameInput = cardForm.querySelector(".popup__input_type_card-name");
const cardLinkInput = cardForm.querySelector(".popup__input_type_url");

// Аватар
const avatarFormModalWindow = document.querySelector(".popup_type_edit-avatar");
const avatarForm = avatarFormModalWindow.querySelector(".popup__form");
const avatarInput = avatarForm.querySelector(".popup__input");

// Попап с картинкой
const imageModalWindow = document.querySelector(".popup_type_image");
const imageElement = imageModalWindow.querySelector(".popup__image");
const imageCaption = imageModalWindow.querySelector(".popup__caption");

// --- Настройки валидации ---
const validationConfig = {
  formSelector: '.popup__form',
  inputSelector: '.popup__input',
  submitButtonSelector: '.popup__button',
  inactiveButtonClass: 'popup__button_disabled',
  inputErrorClass: 'popup__input_type_error',
  errorClass: 'popup__error_visible'
};

// --- Утилиты ---
const renderLoading = (isLoading, buttonElement, initialText = 'Сохранить', loadingText = 'Сохранение...') => {
  buttonElement.textContent = isLoading ? loadingText : initialText;
};

// --- Обработчики карточек ---
const handlePreviewPicture = ({ name, link }) => {
  imageElement.src = link;
  imageElement.alt = name;
  imageCaption.textContent = name;
  openModalWindow(imageModalWindow);
};

const handleRemoveCard = (cardId, cardElement) => {
  deleteCardApi(cardId)
    .then(() => {
      cardElement.remove();
    })
    .catch((err) => {
      console.error('Ошибка при удалении карточки:', err);
    });
};

// --- Обработчики сабмита форм ---
const handleProfileFormSubmit = (evt) => {
  evt.preventDefault();
  const submitButton = evt.target.querySelector('.popup__button');
  renderLoading(true, submitButton);

  setUserInfo({
    name: profileTitleInput.value,
    about: profileDescriptionInput.value,
  })
    .then((userData) => {
      profileTitle.textContent = userData.name;
      profileDescription.textContent = userData.about;
      closeModalWindow(profileFormModalWindow);
    })
    .catch((err) => console.error('Ошибка при обновлении профиля:', err))
    .finally(() => renderLoading(false, submitButton));
};

const handleCardFormSubmit = (evt) => {
  evt.preventDefault();
  const submitButton = evt.target.querySelector('.popup__button');
  renderLoading(true, submitButton, 'Создать', 'Создание...');

  addCard(cardNameInput.value, cardLinkInput.value)
    .then((cardData) => {
      placesWrap.prepend(
        createCardElement(cardData, userId, {
          onPreviewPicture: handlePreviewPicture,
          onLikeIcon: (likeButton, cardId, likeCount) => {
            const isLiked = likeButton.classList.contains('card__like-button_is-active');
            const method = isLiked ? removeLike : addLike;
            method(cardId)
              .then((updatedCard) => {
                likeButton.classList.toggle('card__like-button_is-active');
                likeCount.textContent = updatedCard.likes.length;
              })
              .catch((err) => console.error('Ошибка при лайке:', err));
          },
          onDeleteCard: (cardId, cardElement) => {
            handleRemoveCard(cardId, cardElement);
          },
        })
      );
      closeModalWindow(cardFormModalWindow);
      evt.target.reset();
    })
    .catch((err) => console.error('Ошибка при создании карточки:', err))
    .finally(() => renderLoading(false, submitButton, 'Создать'));
};

const handleAvatarFromSubmit = (evt) => {
  evt.preventDefault();
  const submitButton = evt.target.querySelector('.popup__button');
  renderLoading(true, submitButton);

  setUserAvatar(avatarInput.value)
    .then((userData) => {
      profileAvatar.style.backgroundImage = `url('${userData.avatar}')`;
      closeModalWindow(avatarFormModalWindow);
      avatarForm.reset();
    })
    .catch((err) => console.error('Ошибка при обновлении аватара:', err))
    .finally(() => renderLoading(false, submitButton));
};

// --- Слушатели событий ---
profileForm.addEventListener("submit", handleProfileFormSubmit);
cardForm.addEventListener("submit", handleCardFormSubmit);
avatarForm.addEventListener("submit", handleAvatarFromSubmit);

openProfileFormButton.addEventListener("click", () => {
  profileTitleInput.value = profileTitle.textContent;
  profileDescriptionInput.value = profileDescription.textContent;
  clearValidation(profileForm, validationConfig);
  openModalWindow(profileFormModalWindow);
});

openCardFormButton.addEventListener("click", () => {
  cardForm.reset();
  clearValidation(cardForm, validationConfig);
  openModalWindow(cardFormModalWindow);
});

profileAvatar.addEventListener("click", () => {
  avatarForm.reset();
  clearValidation(avatarForm, validationConfig);
  openModalWindow(avatarFormModalWindow);
});

allPopups.forEach((popup) => {
  setCloseModalWindowEventListeners(popup);
});

// --- Инициализация приложения ---
enableValidation(validationConfig);

getUserInfo()
  .then((userData) => {
    userId = userData._id;
    profileTitle.textContent = userData.name;
    profileDescription.textContent = userData.about;
    profileAvatar.style.backgroundImage = `url('${userData.avatar}')`;
    
    // Только после получения ID профиля идем за карточками
    return getInitialCards();
  })
  .then((cards) => {
    cards.forEach((cardData) => {
      placesWrap.append(
        createCardElement(cardData, userId, {
          onPreviewPicture: handlePreviewPicture,
          onLikeIcon: (likeButton, cardId, likeCount) => {
            const isLiked = likeButton.classList.contains('card__like-button_is-active');
            const method = isLiked ? removeLike : addLike;
            
            method(cardId)
              .then((updatedCard) => {
                likeButton.classList.toggle('card__like-button_is-active');
                likeCount.textContent = updatedCard.likes.length;
              })
              .catch((err) => console.error('Ошибка при лайке:', err));
          },
          onDeleteCard: (cardId, cardElement) => {
            handleRemoveCard(cardId, cardElement);
          },
        })
      );
    });
  })
  .catch((err) => {
    console.error('Ошибка инициализации приложения:', err);
  });