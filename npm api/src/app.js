const  express = require('express')

const app = express();
const port = 4000;

app.get('/', (req, res) => {
  res.send('Hello, Express!');
});


app.get('/hello', async(req, res) => {
    const endpoint = "https://registry.npmjs.org/";
    const resp = await fetch(endpoint);
    const data = await resp.json();
    console.log(data)
  
  res.send('Express!');
});


app.get('/search/:text', async(req, res) => {
  const text= req.params.text

  console.log(text,"text")
  const endpoint = `https://registry.npmjs.org/-/v1/search?text=${text}`;
  const resp= await fetch(endpoint);
  const data = await resp.json();
  console.log(data);

res.send(data);
});



app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});