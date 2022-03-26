const express = require("express");
const bodyParser = require("body-parser");

const app = express();
app.use(bodyParser.json());
const port = 7777;

const { JsonToSdk } = require("./dsJsonToSdk.js");

app.post("/convert", (req, res) => {
  const { lang, json } = req.body;
  const inputStr = JSON.stringify(json);

  if (!lang) {
    return res.status(400).send(`[FATAL] Missing language parameter!`);
  }

  if (!inputStr) {
    return res.status(400).send(`[FATAL] Missing JSON string!`);
  }

  const jsonToSdk = new JsonToSdk();
  try {
    const inputJson = JSON.parse(inputStr);
    const output = jsonToSdk.convert(inputJson, lang);
    return res.send(output);
  } catch (e) {
    return res
      .status(400)
      .send(
        `Error while converting input JSON string to ${lang}:\n${e.message}`
      );
  }
});

app.listen(port, () => {
  console.log(`JSON to SDK API running on port ${port}`);
});
