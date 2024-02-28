const express = require('express');
const fs = require('fs');
const cors = require('cors');
const app = express();
require('dotenv').config();

app.use(express.json({extended: true}));
app.use(cors());

app.get("/coffee/list", async (req, res) => {  
  const stockFile = await fs.readFileSync("./data/stock.json");
  const stock = JSON.parse(stockFile);
  
  res.status(200).json({ success: true, message: JSON.stringify(stock) });

  return;
});

app.get('/coffee/order', (req, res) => {
  const coffeeData = req.headers["coffeedata"];
  const extraData = req.headers["extradata"];
  const coldData = req.headers["colddata"];
  const luxaforUserId = req.headers["luxaforid"];

  if (coffeeData == undefined || extraData == undefined || req.headers["username"] == undefined || coldData == undefined) {
    res.status(400).json({success: false});
    return;
  }

  console.log(`Received order: ${coffeeData}\n${extraData}\n${coldData}`)

  if (luxaforUserId != null && luxaforUserId != "" || luxaforUserId != undefined) {
    fetch("https://api.luxafor.com/webhook/v1/actions/solid_color", {
      method: "POST",
      headers: { "Content-Type": "application/JSON" },
      body: JSON.stringify({
        "userId": luxaforUserId,
        "actionFields": {
          "color": "blue"
        }
      })
    }).then(r => r.json()).then(r => console.log("Successfully changed luxafor flag")).catch(e => console.log("Luxafor api error: ", e)); 
  }
  fetch(process.env.SLACK_HOOK,
  {
    headers: { "Content-Type": "application/json" },
    method: "POST",
    body: JSON.stringify({
      "text": `${req.headers.username} will: \n
      ${(coffeeData.length > 0) ? `Coffee: ${coffeeData}` : ""}
      ${(extraData.length > 0) ? `Extra: ${extraData}` : ""}
      ${(coldData.length > 0) ? `Cold: ${coldData}` : ""}`
    }),
  }).then(console.log("Send to slack!")).catch(err => console.log(err));
  res.status(200).json({ success: true });

  return
})

app.listen(8080);