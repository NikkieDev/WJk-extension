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
  let totalValue = parseInt(document.querySelector("#order-items").textContent);
  Object.keys(items).forEach(key => {
    items[key].forEach(value => {
      if (value.name == item) {
        switch (operator) {
          case "increase":
            value.quantity++;
            totalValue++;
            break;
          case "decrease":
            value.quantity--;

            if (value.quantity >= 0)
              totalValue--;
              else value.quantity = 0;
            if (totalValue <= 0) totalValue= 0;
            break;
        }

        document.querySelector("#order-items").textContent = totalValue.toString();

        const itemSelector = document.querySelector(`[data-item='${value.name}']`).parentNode.parentNode;
        itemSelector.querySelector(".cart-item__counter").textContent = value.quantity.toString();
      }
    })
  });
}

async function populate(item, html) {
  const element = document.createElement("div");
  element.classList.add("cart-item__wrapper");
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

  // coffee.onclick = () => coffeeClick(coffee, coffeeDropper);
  coffeeDropper.querySelector(".dropdown__close-btn")
  .onclick = () => dropperClick(coffee, coffeeDropper)
})();

function dropperClick(parent, dropper) {
  dropper.querySelector(".dropdown__close-btn").onclick = null;
  dropper.style.display = "none"
  setTimeout(() => {
    parent.onclick = () => coffeeClick(parent, dropper);
  }, 50);
}

function coffeeClick(parent, dropper) {
  parent.onclick = null;
  dropper.style.display = "block";
  dropper.querySelector(".dropdown__close-btn").onclick = () => dropperClick(parent, dropper);
}