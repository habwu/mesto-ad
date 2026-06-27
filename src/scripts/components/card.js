const getTemplate = () => {
  return document
    .getElementById("card-template")
    .content.querySelector(".card")
    .cloneNode(true);
};

export const createCardElement = (
  data,
  userId,
  { onPreviewPicture, onLikeIcon, onDeleteCard }
) => {
  const cardElement = getTemplate();
  const cardImage = cardElement.querySelector(".card__image");
  const cardTitle = cardElement.querySelector(".card__title");
  const likeButton = cardElement.querySelector(".card__like-button");
  const likeCount = cardElement.querySelector(".card__like-count");
  const deleteButton = cardElement.querySelector(".card__control-button_type_delete");

  cardImage.src = data.link;
  cardImage.alt = data.name;
  cardTitle.textContent = data.name;

  // Количество лайков
  likeCount.textContent = data.likes.length;

  // Проверка лайка
  const isLiked = data.likes.some((user) => user._id === userId);
  if (isLiked) {
    likeButton.classList.add("card__like-button_is-active");
  }

  // Обработчик лайка
  likeButton.addEventListener("click", () => {
    onLikeIcon(likeButton, data._id, likeCount);
  });

  // Обработчик удаления
  deleteButton.addEventListener("click", () => {
    onDeleteCard(data._id, cardElement);
  });

  // Скрытие корзины, если это не наша карточка
  if (data.owner._id !== userId) {
    deleteButton.remove();
  }

  // Открытие картинки
  cardImage.addEventListener("click", () => onPreviewPicture({ name: data.name, link: data.link }));

  return cardElement;
};