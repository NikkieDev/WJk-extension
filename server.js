const express = require('express');
const cors = require('cors');
const app = express();

app.use(express.json({extended: true}));
app.use(cors());

app.get('/order/coffee', (req, res) => {
  console.log("reached!");
  const coffeeData = req.headers["coffeedata"];
  const extraData = req.headers["extradata"];

  if (coffeeData == undefined || extraData == undefined || req.headers["username"] == undefined) {
    res.status(400).json({success: false});
    return;
  }

  console.log(`request: ${coffeeData}\n${extraData}`)
  fetch("",
  {
    headers: { "Content-Type": "application/json" },
    method: "POST",
    body: JSON.stringify({
      "text": `${req.headers.username} will: \n
      ${(coffeeData.length > 0) ? `Coffee: ${coffeeData}` : ""}
      ${(extraData.length > 0) ? `Extra: ${extraData}` : ""}`
    }),
  }).then(console.log("Send to slack!")).catch(err => console.log(err));
  res.status(200).json({ success: true });
})

app.listen(8080);