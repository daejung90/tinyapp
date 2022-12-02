const express = require('express');
const app = express();
const cookieParser = require('cookie-parser')
const PORT = 8080; //default port 8080 (usually when is working in localhost)

app.use(express.urlencoded ({ extended: true }));
app.set("view engine", "ejs");
app.use(cookieParser())

const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

const users = {
    userRandomID: {
      id: "userRandomID",
      email: "user@example.com",
      password: "purple-monkey-dinosaur",
    },
    user2RandomID: {
      id: "user2RandomID",
      email: "user2@example.com",
      password: "dishwasher-funk",
    },
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
    console.log(`App listening on port ${PORT}!`)
});

app.get("/urls/json", (req, res) => {
    res.json(urlDatabase)
})

app.get("/urls", (req, res) => {
    const templateVars ={ url: urlDatabase, username: req.cookies.user_id};
    console.log("cookies: ", req.cookies)
    res.render("urls_index", templateVars);
})

app.get("/hello", (req, res) => {
    res.send(res.send("<html><body>Hello <b>World<b></body></html>\n"))
})

app.get("/urls/new", (req, res) => {
    const templateVars = {
        url: urlDatabase,
        username: req.cookies.user_id,
    }
    res.render("urls_new", templateVars)
});

app.get("/urls/:id", (req, res) => {
    const templateVars = { username: req.cookies.user_id, id: req.params.id, longURL: urlDatabase[req.params.id] };
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


app.post('/login', (req, res) => {
    res.cookie(req.body.user_id);
    console.log(req.body.user_id)
  res.cookie('username', req.body.user_id)
  res.redirect("/urls");

});

app.post("/logout", (req, res) => {
    res.clearCookie('user_id');
    res.redirect("/urls")
})

app.get("/register", (req, res) => {
    res.render("_login")
})

app.post("/register", (req, res) => {
    let newUserID = generateRandomString();
    users[newUserID] = {
        id: newUserID,
        email: req.body.email,
        password: req.body.password,
    }
    res.cookie('user_id', newUserID);
    console.log(users);
    console.log(users[req.params.id]);
    res.redirect('/urls')
});