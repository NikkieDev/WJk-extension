let items = {
  coffee: [
    { id: 1, name: "Espresso", img_path: "espresso.png", quantity: 0 },
    { id: 2, name: "Cappuccino", img_path: "cappuccino.png", quantity: 0 },
    { id: 3, name: "Latte Macchiato", img_path: "latte.png", quantity: 0 },
    { id: 4, name: "Black coffee", img_path: "black.png", quantity: 0 }
  ],
  extra: [
    { id: 5, name: "Spoon", quantity: 0 },
    { id: 6, name: "Sugar", quantity: 0 },
    { id: 7, name: "Milk", quantity: 0 },
    { id: 8, name: "Lotus Cookie", quantity: 0 }
  ]
}

function changeItem(item, operator) {
  Object.keys(items).forEach(key => {
    items[key].forEach(value => {
      if (value.name == item) {
        switch (operator) {
          case "increase":
            value.quantity++;
            break;
          case "decrease":
            value.quantity--;
            if (value.quantity <= 0) value.quantity = 0;
            break;
        }

        const itemSelector = document.querySelector(`[data-item='${item}']`).parentNode;
        itemSelector.querySelector(".cart-item__counter").textContent = value.quantity.toString();
      }
    })
  });
}

async function populateCoffee(item, html) {
  const element = document.createElement("div");
  element.innerHTML = html;
  
  element.querySelector(".cart-item__title").setAttribute("data-item", item.name);
  element.querySelector(".cart-item__title").textContent = item.name
  element.querySelector(".cart-item__counter").textContent = item.quantity.toString();
  element.querySelectorAll(".cart-item__button").forEach(btn => {
    (btn.getAttribute("data-type") == "minus")
    ? btn.addEventListener("click", () => changeItem(item.name, "decrease"))
    : btn.addEventListener("click", () => changeItem(item.name, "increase"));
  })

  return element;
}

async function populateExtra() {

}

async function createCoffee(coffeeDropper) {
  const coffeeItemPrefab = await fetch('/assets/prefabs/cart-item.html');

  coffeeItemPrefab.text()
  .then(html => {
    items.coffee.forEach(async coffeeItem => {
      populateCoffee(coffeeItem, html)
      .then(finishedHtml => {
        coffeeDropper.appendChild(finishedHtml);
      })
    })
  })
}

async function createExtra(extraDropper) {

}

(async function() { 
  'use strict';

  const coffee = document.querySelector("[data-title='coffee']");
  const extra = document.querySelector("[data-title='extras']");
  
  const coffeeDropper = coffee.querySelector(".dropdown");
  const extraDropper = extra.querySelector(".dropdown");
  
  await createCoffee(coffeeDropper);
  await createExtra(extraDropper);
  
})();