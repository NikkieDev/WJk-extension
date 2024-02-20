let prefabCache;

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

        const itemSelector = document.querySelector(`[data-item='${value.name}']`).parentNode.parentNode;
        itemSelector.querySelector(".cart-item__counter").textContent = value.quantity.toString();
      }
    })
  });
}

async function populate(item, html) {
  const element = document.createElement("div");
  element.innerHTML = html;
  
  if (item.img_path != null)
    element.querySelector(".cart-item__title-icon").setAttribute("src", `/assets/img/${item.img_path}`);
  else
    element.querySelector(".cart-item__title-icon").remove();

  element.querySelector(".cart-item__title-text").setAttribute("data-item", item.name);
  element.querySelector(".cart-item__title-text").textContent = item.name
  element.querySelector(".cart-item__counter").textContent = item.quantity.toString();
  element.querySelectorAll(".cart-item__button").forEach(btn => {
    (btn.getAttribute("data-type") == "minus")
    ? btn.addEventListener("click", () => changeItem(item.name, "decrease"))
    : btn.addEventListener("click", () => changeItem(item.name, "increase"));
  })

  return element;
}

async function createCoffeeDrops(droppers) {
  const coffeeItemPrefab = await fetch('/assets/prefabs/cart-item.html');
  
  coffeeItemPrefab.text()
  .then(html => {
    prefabCache = html;
    items.coffee.forEach(coffeeItem => {
      populate(coffeeItem, html)
      .then(finishedHtml => droppers[0].appendChild(finishedHtml))
    })
  });
}

(async function() { 
  'use strict';

  const coffee = document.querySelector("[data-title='coffee']");
  const extra = document.querySelector("[data-title='extras']");
  
  const coffeeDropper = coffee.querySelector(".dropdown");
  const extraDropper = extra.querySelector(".dropdown");
  
  await createCoffeeDrops([coffeeDropper, extraDropper]);
  
})();