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
    });
    items.extra.forEach(extraItem => {
      populate(extraItem, html)
      .then(finishedHtml => droppers[1].appendChild(finishedHtml));
    })
  })
}

(async function() { 
  'use strict';

  const coffee = document.querySelector("[data-title='coffee']");
  const extra = document.querySelector("[data-title='extras']");
  
  const coffeeDropper = coffee.querySelector(".dropdown");
  const extraDropper = extra.querySelector(".dropdown");
  
  await createCoffeeDrops([coffeeDropper, extraDropper]);

  coffee.onclick = () => coffeeClick(coffee, coffeeDropper);
  extra.onclick = () => coffeeClick(extra, extraDropper);

  document.querySelectorAll(".order-interactions__child")[0].addEventListener("click", () => clearList());
  document.querySelectorAll(".order-interactions__child")[1].addEventListener("click", () => submitOrder());
})();

function dropperClick(parent, dropper) {
  document.body.style.height = "100%";
  dropper.querySelector(".dropdown__close-btn").onclick = null;
  dropper.style.display = "none"
  setTimeout(() => parent.onclick = () => coffeeClick(parent, dropper), 50);
}

function coffeeClick(parent, dropper) {
  parent.onclick = null;
  dropper.style.display = "block";
  dropper.querySelector(".dropdown__close-btn").onclick = () => dropperClick(parent, dropper);
  document.body.style.height = "480px";
}

function submitOrder() {
  console.log("Sending order!");

  chrome.storage.sync.get(["username"]).then(result => {
    if (result.username == null) {
      let username = window.prompt("Please fill in your name first");

      if (username != null)
        chrome.storage.sync.set({ "username": username });
    } else {
      if (parseInt(document.querySelector("#order-items").textContent) > 0) {
        let coffeeData = [], extraData = [];
        console.log("Counting products");

        items.coffee.forEach(coffee => {
          if (coffee.quantity > 0)
            coffeeData.push(`${coffee.name} x${coffee.quantity}`);
        })

        items.extra.forEach(extra => {
          if (extra.quantity > 0)
            extraData.push(`${extra.name} x${extra.quantity}`);
        });

        if (coffeeData.length > 0 || extraData.length > 0) {
          console.log("Sending order");
          alert("Sending order");
          fetch("https://hooks.slack.com/services/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",
          {
            headers: { "Content-Type": "application/json" },
            method: "POST",
            body: JSON.stringify({
              "text": `<@447111749204705294> ${result.username} will: \n
              ${(coffeeData.length > 0) ? ("Coffee: " + coffeeData.join("\n") + "\n\n") : ""}
              ${(extraData.length > 0) ? ("Extra: " + extraData.join("\n") + "\n\n") : ""}`
            }),
          }).catch(err => alert(`Couldn't reach SLACK API, ${err}`));
        }

        window.close();
      }
    }
  })
}

function clearList() {
  console.log("Clearing order");

  Object.keys(items).forEach(item => items[item].forEach(cartItem => cartItem.quantity = 0));
  document.querySelectorAll(".cart-item__counter").forEach(cartItem => cartItem.textContent = "0");
  document.querySelector("#order-items").textContent = "0";
}