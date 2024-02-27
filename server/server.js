const express = require('express');
const fs = require('fs');
const cors = require('cors');
const app = express();

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

  if (coffeeData == undefined || extraData == undefined || req.headers["username"] == undefined || coldData == undefined) {
    res.status(400).json({success: false});
    return;
  }

  console.log(`Received order: ${coffeeData}\n${extraData}\n${coldData}`)
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