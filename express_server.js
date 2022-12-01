const express = require('express');
const app = express();
const PORT = 8080; //default port 8080 (usually when is working in localhost)

app.use(express.urlencoded ({ extended: true }));
app.set("view engine", "ejs");

const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

function generateRandomString() {
    let result = '';
    let characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    for (let i = 0; i < 6; i++) {
        result += characters.charAt(Math.floor(Math.random() * characters.length));
    }
    return result
}

app.get("/", (req, res) => {
    res.send("Hello")
});

app.listen(PORT, () => {
    console.log(`Example app listening on port ${PORT}!`)
});

app.get("/urls/json", (req, res) => {
    res.json(urlDatabase)
})

app.get("/urls", (req, res) => {
    const templateVars ={ url: urlDatabase};
    res.render("urls_index", templateVars);
})

app.get("/hello", (req, res) => {
    res.send(res.send("<html><body>Hello <b>World<b></body></html>\n"))
})

app.get("/urls/new", (req, res) => {
    res.render("urls_new")
});

app.get("/urls/:id", (req, res) => {
    const templateVars = { id: req.params.id, longURL: urlDatabase[req.params.id] };
    res.render("urls_show", templateVars);
});

app.post("/urls", (req, res) => {
    const shortURL = generateRandomString();
    const { longURL } = req.body;
    urlDatabase[shortURL] = longURL 
    res.redirect(`urls/${shortURL}`)
    console.log(req.body);
    res.send("Ok")
})

app.post("/urls/:id", (req, res) => {
    console.log(urlDatabase);
    const updatedURL = req.params.id;
    console.log(updatedURL);
    urlDatabase[updatedURL] = req.body.longURL
    console.log(urlDatabase);
    
    res.redirect("/urls")
})

app.get("/u/:id", (req, res) => {
    const longURL = urlDatabase[req.params.id]
    console.log(longURL)
    res.redirect(longURL)
})

app.post("/urls/:id/delete", (req, res) => {
    delete urlDatabase[req.params.id]
    res.redirect("/urls")
})

// app.get("/login", (req, res) => {
//     res.render()
// })
app.post('/login', (req, res) => {
    res.cookie(req.body.username);
    console.log(req.body.username)
    const templateVars = {
    username: undefined,
    urls: urlDatabase,
  };
  res.redirect("/urls");
})