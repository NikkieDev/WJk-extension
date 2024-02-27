(async function() { 
  'use strict';
  let prefabCache;
  let items;

  fetch("http://localhost:8080/coffee/list")
  .then(r => r.json()).then(async r => {
    items = JSON.parse(r["message"]);
    await initialize();
  });

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
    .then(async html => {
      prefabCache = html;
      

      // make algorithm to loop througgh everything in 1 go
      await Promise.all(items.coffee.map(coffeeItem => {
        populate(coffeeItem, html)
        .then(finishedHTML => droppers[0].appendChild(finishedHTML));
      }));

      await Promise.all(items.extra.map(extraItem => {
        populate(extraItem, html)
        .then(finishedHtml => droppers[1].appendChild(finishedHtml));
      }));

      await Promise.all(items.cold.map(coldItem => {
        populate(coldItem, html)
        .then(finishedHtml => droppers[2].appendChild(finishedHtml));
      }))
    })
  }

  async function initialize() {
    const coffee = document.querySelector("[data-title='coffee']");
    const extra = document.querySelector("[data-title='extras']");
    const cold = document.querySelector("[data-title='cold']");
    
    const coffeeDropper = coffee.querySelector(".dropdown");
    const extraDropper = extra.querySelector(".dropdown");
    const coldDropper = cold.querySelector(".dropdown");
    
    await createCoffeeDrops([coffeeDropper, extraDropper, coldDropper]);

    coffee.onclick = () => coffeeClick(coffee, coffeeDropper);
    extra.onclick = () => coffeeClick(extra, extraDropper);
    cold.onclick = () => coffeeClick(cold, coldDropper);

    document.querySelectorAll(".order-interactions__child")[0].addEventListener("click", () => clearList());
    document.querySelectorAll(".order-interactions__child")[1].addEventListener("click", () => submitOrder());
  }

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

  async function submitOrder() {
    console.log("Sending order!");

    chrome.storage.sync.get(["username"]).then(async result => {
      if (result.username == null) {
        let username = window.prompt("Please fill in your name first");

        if (username != null)
          chrome.storage.sync.set({ "username": username });
      } else {
          try {
            if (parseInt(document.querySelector("#order-items").textContent) > 0) {
              let coffeeData = [], extraData = [], coldData = [];
              console.log("Counting products");

              items.coffee.forEach(coffee => {
                if (coffee.quantity > 0)
                  coffeeData.push(`${coffee.name} x${coffee.quantity}`);
              })
      
              items.extra.forEach(extra => {
                if (extra.quantity > 0)
                  extraData.push(`${extra.name} x${extra.quantity}`);
              });

              items.cold.forEach(cold => {
                if (cold.quantity > 0)
                  coldData.push(`${cold.name} x${cold.quantity}`);
              })
      
              if (coffeeData.length > 0 || extraData.length > 0 || coldData.length > 0) {
                console.log("Sending order");
                await fetch("http://localhost:8080/coffee/order",
                {
                  headers: {
                    "Content-Type": "application/json",
                    "coffeeData": coffeeData,
                    "extraData": extraData,
                    "coldData": coldData,
                    "username": result.username
                  },
                  method: "GET",
                }).catch(err => alert(`Couldn't reach API, ${err}`));
              }
            }
          } catch (e) {
            alert(e);
          }

          window.close();
      }
    })
  };

  function clearList() {
    console.log("Clearing order");

    Object.keys(items).forEach(item => items[item].forEach(cartItem => cartItem.quantity = 0));
    document.querySelectorAll(".cart-item__counter").forEach(cartItem => cartItem.textContent = "0");
    document.querySelector("#order-items").textContent = "0";
  }
})();