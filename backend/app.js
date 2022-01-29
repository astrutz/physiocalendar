const express = require('express');
const fs = require('fs');
const app = express();
const PORT = 4000;

app.get('/backup', (req, res) => {
  const data = JSON.parse(fs.readFileSync(__dirname + '/data/backup.json'));
  res.send(data);
});

app.put('/backup', () => {

});


app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}.`);
});