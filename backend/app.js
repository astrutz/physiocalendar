const express = require('express');
const app = express();
const PORT = 4000;

app.get('/backup', (req, res) => {
  res.send({});
});

app.put('/backup', () => {

});


app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}.`);
});