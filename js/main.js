'use strict';


const cartButton = document.querySelector("#cart-button");
const modal = document.querySelector(".modal");
const close = document.querySelector(".close");



function toggleModal() {
  modal.classList.toggle("is-open");
}

const buttonAuth = document.querySelector('.button-auth');
const modalAuth = document.querySelector('.modal-auth');
const closeAuth = document.querySelector('.close-auth');
const logInForm = document.querySelector('#logInForm');
const loginInput = document.querySelector('#login');
const userName = document.querySelector('.user-name');
const buttonOut = document.querySelector('.button-out');
const containerPromo = document.querySelector('.container-promo');
const restaurants = document.querySelector('.restaurants');
const menu = document.querySelector('.menu');
const logo = document.querySelector('.logo');
const cardsMenu = document.querySelector('.cards-menu');
const restaurantTitle = document.querySelector('.restaurant-title');
const restaurantRating = document.querySelector('.rating');
const restaurantPrice = document.querySelector('.price');
const restaurantCategory = document.querySelector('.category');
const inputSearch = document.querySelector('.input-search');
const modalBody = document.querySelector('.modal-body');
const modalPrice = document.querySelector('.modal-pricetag');
const btnClearCart = document.querySelector('.clear-cart');

const cardsRestaurants = document.querySelector('.cards-restaurants');

let login = localStorage.getItem('delivery');
const cart = [];

const getData = async function(url) {
  const response = await fetch(url);
  if(!response.ok) {
    throw new Error(`Error on ${url}, error status ${response.status}!`);
  }
  return await response.json();
}

function validName(str) {
  const regName = /^[a-zA-Z0-9-_\.]{1,20}$/;
  return regName.test(str);
}

function toggleModalAuth() {
  modalAuth.classList.toggle("is-open");
  if (modalAuth.classList.contains("is-open")) {
    disabledScroll();
  } else {
    enableScroll();
  }
}

function authorized() {
  function logOut(){
    login = '';
    localStorage.removeItem('delivery');

    buttonAuth.style.display = '';
    userName.style.display = '';
    buttonOut.style.display = '';
    cartButton.style.display = '';
    buttonOut.removeEventListener('click', logOut);

    checkAuth();
  }
  userName.textContent = login;
  buttonAuth.style.display = 'none';
  userName.style.display = 'inline';
  buttonOut.style.display = 'flex';
  cartButton.style.display = 'flex';

  buttonOut.addEventListener('click', logOut);
}

function notAuthorized() {

  function logIn(e) {
    e.preventDefault();

    if(validName(loginInput.value)) {
      login = loginInput.value;

      localStorage.setItem('delivery', login);
      toggleModalAuth();

      buttonAuth.removeEventListener('click', toggleModalAuth);
      closeAuth.removeEventListener('click', toggleModalAuth);
      logInForm.removeEventListener('submit', logIn);
      logInForm.reset();

      checkAuth();
    } else {
      loginInput.style.borderColor = '#ff0000';
      loginInput.value = '';
    }
  }

  buttonAuth.addEventListener('click', toggleModalAuth);
  closeAuth.addEventListener('click', toggleModalAuth);
  logInForm.addEventListener('submit', logIn);
  modalAuth.addEventListener('click', function (e) {
    if (e.target.classList.contains('is-open')) {
      toggleModalAuth();
    }
  })
}
function checkAuth() {
  if (login) {
    authorized();
  } else {
    notAuthorized();
  }
}
checkAuth();

getData('./db/partners.json').then(function(data) {
  data.forEach(createCardRestaurants)
});

function createCardRestaurants(restaurant) {
  const {
    image,
    kitchen,
    price,
    name,
    stars,
    products,
    time_of_delivery: timeOfDelivery
  } = restaurant;

  const cardRestaurant = document.createElement('a');
  cardRestaurant.className = 'card card-restaurant';
  cardRestaurant.products = products;
  cardRestaurant.info = { kitchen, price, name, stars };
  const card = `
    <img src="${image}" alt="image" class="card-image"/>
    <div class="card-text">
      <div class="card-heading">
        <h3 class="card-title">${name}</h3>
        <span class="card-tag tag">${timeOfDelivery} мин</span>
      </div>
    
      <div class="card-info">
        <div class="rating">
        ${stars}
        </div>
        <div class="price">От ${price} ₽</div>
        <div class="category">${kitchen}</div>
      </div>
    </div>
  `;
cardRestaurant.insertAdjacentHTML('beforeend', card)
  cardsRestaurants.insertAdjacentElement('beforeend', cardRestaurant);

}

function createCardGood(goods) {
  const { description, name, price, image, id } = goods;

  const card = document.createElement('div');
  card.className = 'card';

  card.insertAdjacentHTML('beforeend', `
    <img src="${image}" alt="image" class="card-image"/>
    <div class="card-text">
      <div class="card-heading">
        <h3 class="card-title card-title-reg">${name}</h3>
      </div>
      <div class="card-info">
        <div class="ingredients">${description}</div>
      </div>
      <div class="card-buttons">
        <button class="button button-primary button-add-cart" id="${id}">
          <span class="button-card-text">В корзину</span>
          <span class="button-cart-svg"></span>
        </button>
        <strong class="card-price card-price-bold">${price} ₽</strong>
      </div>
    </div>
  `);
  cardsMenu.insertAdjacentElement( 'beforeend' ,card)
}

function openGoods(e) {
  const target = e.target;

  if(login) {
    const restaurant = target.closest('.card-restaurant');
    if (restaurant) {
      cardsMenu.textContent = '';
      containerPromo.classList.add('hide');
      restaurants.classList.add('hide');
      menu.classList.remove('hide');

      const { name, kitchen, price, stars } = restaurant.info;

      restaurantTitle.textContent = name;
      restaurantRating.textContent = stars;
      restaurantPrice.textContent = `от ${price} р`;
      restaurantCategory.textContent = kitchen;

      getData(`./db/${restaurant.products}`).then(function (data) {
        data.forEach(createCardGood)
      })

    }
  } else {
    toggleModalAuth();
  }
}

function addToCart(e) {
  const target = e.target;
  const buttonAddToCart = target.closest('.button-add-cart');
  if(buttonAddToCart) {
    const card = target.closest('.card');
    const title = card.querySelector('.card-title-reg').textContent;
    const cost = card.querySelector('.card-price').textContent;
    const id = buttonAddToCart.id;

    const food = cart.find(function (item) {
      return item.id === id;
    })
    if(food) {
      food.count += 1;
    } else {
      cart.push({ id, title, cost, count: 1 });
    }

  }
}

function renderCart() {
  modalBody.textContent = '';

  cart.forEach(function ({ id, title, cost, count }) {
    const itemCart = `
    <div class="food-row">
      <span class="food-name">${title}</span>
      <strong class="food-price">${cost} ₽</strong>
      <div class="food-counter">
        <button class="counter-button counter-minus" data-id=${id}>-</button>
        <span class="counter">${count}</span>
        <button class="counter-button counter-plus" data-id=${id}>+</button>
      </div>
    </div>
    `;
    modalBody.insertAdjacentHTML('afterbegin', itemCart);
  });
  const totalPrice = cart.reduce(function(result, item) {
    return result + (parseFloat(item.cost) * item.count);
  }, 0);
  modalPrice.textContent = totalPrice + ' P';
}
function changeCount(e) {
  const target = e.target;

  if(target.classList.contains('counter-button')) {
    const food = cart.find(function (item) {
      return item.id === target.dataset.id;
    });
    if(target.classList.contains('counter-minus')) {
      food.count--;
      if(food.count === 0) {
        cart.splice(cart.indexOf(food), 1)
      }
    }
    if(target.classList.contains('counter-plus')) food.count++;
    renderCart();
  }


}
function init() {
  cartButton.addEventListener("click", function () {
    renderCart();
    toggleModal();
  });

  btnClearCart.addEventListener('click', function () {
    cart.length = 0;
    renderCart();
  });
  modalBody.addEventListener('click', changeCount);
  close.addEventListener("click", toggleModal);
  cardsRestaurants.addEventListener('click', openGoods);
  cardsMenu.addEventListener('click', addToCart);

  logo.addEventListener('click', function() {
    containerPromo.classList.remove('hide');
    restaurants.classList.remove('hide');
    menu.classList.add('hide');
  });
  // SLIDER
  new Swiper('.swiper-container', {
    slidesPerView: 1,
    speed: 700,
    loop: true,
    autoplay: true,
    effect: "cube",
    cubeEffect: {
      shadow: false
    }
  });
  inputSearch.addEventListener('keypress', function (e) {

    if(e.charCode === 13) {
      const value = e.target.value.trim();

      if(!value) {
        e.target.style.backgroundColor = 'red';
        e.target.value = '';
        setTimeout(function() {
          e.target.style.backgroundColor = '';
        }, 1500);
        return;
      }

      getData('./db/partners.json')
        .then(function (data) {
        return data.map(function(partner) {
          return partner.products;
        });
      })
        .then(function (linksProduct) {
          linksProduct.forEach(function (link) {
            getData(`./db/${link}`)
              .then(function(data) {

                const resultSearch = data.filter(function (item) {
                  const name = item.name.toLowerCase()
                  return name.includes(value.toLowerCase());
                })

                cardsMenu.textContent = '';
                containerPromo.classList.add('hide');
                restaurants.classList.add('hide');
                menu.classList.remove('hide');

                restaurantTitle.textContent = 'Резутьтат поиска';
                restaurantRating.textContent = '';
                restaurantPrice.textContent = '';
                restaurantCategory.textContent = 'РАЗНАЯ КУХНЯ';
                resultSearch.forEach(createCardGood);
              })
          })
        })
    }
  })
}
init();
