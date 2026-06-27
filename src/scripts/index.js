/*
  Файл index.js является точкой входа в наше приложение
  и только он должен содержать логику инициализации нашего приложения
  используя при этом импорты из других файлов

  Из index.js не допускается что то экспортировать
*/

import { createCardElement } from "./components/card.js"; // Импортируй только то, что реально используешь!
import { openModalWindow, closeModalWindow, setCloseModalWindowEventListeners } from "./components/modal.js";
import { getUserInfo, setUserInfo, getInitialCards, addCard, deleteCardApi, addLike, removeLike } from "./components/api.js";

let userId; 
// DOM узлы
const placesWrap = document.querySelector(".places__list");
const profileFormModalWindow = document.querySelector(".popup_type_edit");
const profileForm = profileFormModalWindow.querySelector(".popup__form");
const profileTitleInput = profileForm.querySelector(".popup__input_type_name");
const profileDescriptionInput = profileForm.querySelector(".popup__input_type_description");

const cardFormModalWindow = document.querySelector(".popup_type_new-card");
const cardForm = cardFormModalWindow.querySelector(".popup__form");
const cardNameInput = cardForm.querySelector(".popup__input_type_card-name");
const cardLinkInput = cardForm.querySelector(".popup__input_type_url");

const imageModalWindow = document.querySelector(".popup_type_image");
const imageElement = imageModalWindow.querySelector(".popup__image");
const imageCaption = imageModalWindow.querySelector(".popup__caption");

const openProfileFormButton = document.querySelector(".profile__edit-button");
const openCardFormButton = document.querySelector(".profile__add-button");

const profileTitle = document.querySelector(".profile__title");
const profileDescription = document.querySelector(".profile__description");
const profileAvatar = document.querySelector(".profile__image");

const avatarFormModalWindow = document.querySelector(".popup_type_edit-avatar");
const avatarForm = avatarFormModalWindow.querySelector(".popup__form");
const avatarInput = avatarForm.querySelector(".popup__input");

const handlePreviewPicture = ({ name, link }) => {
  imageElement.src = link;
  imageElement.alt = name;
  imageCaption.textContent = name;
  openModalWindow(imageModalWindow);
};

const handleProfileFormSubmit = (evt) => {
  evt.preventDefault();
  
  // 1. Находим кнопку (лучше вынести поиск в начало файла)
  const submitButton = evt.target.querySelector('.popup__button');
  const originalText = submitButton.textContent;
  
  // 2. Меняем текст перед запросом
  submitButton.textContent = 'Сохранение...';

  setUserInfo({
    name: profileTitleInput.value,
    about: profileDescriptionInput.value,
  })
    .then((userData) => {
      profileTitle.textContent = userData.name;
      profileDescription.textContent = userData.about;
      closeModalWindow(profileFormModalWindow);
    })
    .catch((err) => {
      console.error('Ошибка:', err);
    })
    .finally(() => {
      // 3. Возвращаем текст обратно (сработает в любом случае!)
      submitButton.textContent = originalText;
    });
};

const handleAvatarFromSubmit = (evt) => {
  evt.preventDefault();
  
  // Добавляем логику отправки на сервер
  setUserAvatar(avatarInput.value)
    .then((userData) => {
      profileAvatar.style.backgroundImage = `url('${userData.avatar}')`;
      closeModalWindow(avatarFormModalWindow);
      avatarForm.reset(); // Очищаем форму после успеха
    })
    .catch((err) => {
      console.error('Ошибка при обновлении аватара:', err);
    });
};

const handleCardFormSubmit = (evt) => {
  evt.preventDefault();
  
  addCard(cardNameInput.value, cardLinkInput.value)
    .then((cardData) => {
      placesWrap.prepend(
        createCardElement(
          cardData,
          userId,
          {
            onPreviewPicture: handlePreviewPicture,
            onLikeIcon: likeCard,
            // И здесь обновляем вызов:
            onDeleteCard: (cardElement) => {
              handleRemoveCard(cardData._id, cardElement);
            },
          }
        )
      );
      
      closeModalWindow(cardFormModalWindow);
      evt.target.reset();
    })
    .catch((err) => {
      console.error('Ошибка при создании карточки:', err);
    });
};

// EventListeners
profileForm.addEventListener("submit", handleProfileFormSubmit);
cardForm.addEventListener("submit", handleCardFormSubmit);
avatarForm.addEventListener("submit", handleAvatarFromSubmit);

openProfileFormButton.addEventListener("click", () => {
  profileTitleInput.value = profileTitle.textContent;
  profileDescriptionInput.value = profileDescription.textContent;
  openModalWindow(profileFormModalWindow);
});

profileAvatar.addEventListener("click", () => {
  avatarForm.reset();
  openModalWindow(avatarFormModalWindow);
});

openCardFormButton.addEventListener("click", () => {
  cardForm.reset();
  openModalWindow(cardFormModalWindow);
});

getInitialCards()
  .then((cards) => {
    cards.forEach((cardData) => {
      placesWrap.append(
        createCardElement(cardData, userId,  {
          onPreviewPicture: handlePreviewPicture,
          onLikeIcon: likeCard,
          // Передаем функцию, которая знает, какой ID удалять
          onDeleteCard: (cardElement) => {
            handleRemoveCard(cardData._id, cardElement);
          },
        })
      );
    });
  })
  .catch((err) => {
    console.error('Ошибка при загрузке карточек:', err);
  });

//настраиваем обработчики закрытия попапов
const allPopups = document.querySelectorAll(".popup");
allPopups.forEach((popup) => {
  setCloseModalWindowEventListeners(popup);
});

// Получаем данные профиля с сервера
// В самом низу index.js замени вызов на этот:
getUserInfo()
  .then((userData) => {
    userId = userData._id;
    profileTitle.textContent = userData.name;
    profileDescription.textContent = userData.about;
    profileAvatar.style.backgroundImage = `url('${userData.avatar}')`;
    
    // Только теперь запрашиваем карточки, когда userId уже точно есть!
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
              .catch(err => console.error(err));
          },
          onDeleteCard: (cardId, cardElement) => {
            handleRemoveCard(cardId, cardElement);
          },
        })
      );
    });
  })
  .catch((err) => {
    console.error('Ошибка инициализации:', err);
  });

  // Пример того, как должна выглядеть логика удаления
const handleRemoveCard = (cardId, cardElement) => {
  deleteCardApi(cardId)
    .then(() => {
      // Удаляем элемент из DOM только после того, как сервер подтвердил успех
      cardElement.remove();
    })
    .catch((err) => {
      console.error('Ошибка при удалении:', err);
    });
};

const handleLikeClick = (cardId, isLiked, cardElement) => {
  const likeMethod = isLiked ? removeLike : addLike; // Выбираем метод
  
  likeMethod(cardId)
    .then((updatedCard) => {
      // Обновляем состояние кнопки и счетчик лайков на странице
      // updatedCard.likes — это свежий массив лайков с сервера
      updateLikeView(cardElement, updatedCard.likes); 
    })
    .catch((err) => console.error(err));
};