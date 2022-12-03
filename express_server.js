const express = require('express');
const app = express();
const bcrypt = require('bcryptjs')
const cookieSession = require('cookie-session');
const { getUserByEmail } = require('./helpers')
const PORT = 8080; //default port 8080 (usually when is working in localhost)

app.use(express.urlencoded({ extended: true }));
app.set("view engine", "ejs");
app.use(cookieSession({
    name: 'session',
    keys: ['userId']
  }));

const urlDatabase = {
    b6UTxQ: {
      longURL: "https://www.tsn.ca",
      userID: "aJ48lW",
    },
    i3BoGr: {
      longURL: "https://www.google.ca",
      userID: "user2RandomID",
    },
  };

const users = {
    userRandomID: {
        id: "aJ48lW",
        email: "user@example.com",
        password: "12345",
    },
    user2RandomID: {
        id: "user2RandomID",
        email: "user2@example.com",
        password: "dishwasher-funk",
    },
};

//generating random string to id
function generateRandomString() {
    let result = '';
    let characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    for (let i = 0; i < 6; i++) {
        result += characters.charAt(Math.floor(Math.random() * characters.length));
    }
    return result;
};
//checking if email already exists
const checkEmail = (newEmail) => {
    // const newEmail = req.body.email
    for (let user in users) {
        if (users[user].email === newEmail) {
            return users[user].id;
        }
    }
    return false;
};
// registering, login and logout
const getUserByID = (userID, users) => {
    for (let user in users) {
        if (users[user].id === userID) {
            return users[user]
        }
    }
    return false;
};

const urlsForUser = function (userId) {
    const urls = {};

    const keys = Object.keys(urlDatabase)
    for (const id of keys) {
        const url = urlDatabase[id];
        if (url.userID === userId) {
            urls[id] = url;
        }
    }
    return urls;
};


//ROUTES StartS HERE


// ---------- LOGIN PAGE ----------
app.get("/login", (req, res) => {
    const templateVars = { url: urlDatabase, user_id: null };

    res.render("login", templateVars)
})

app.post('/login', (req, res) => {
    const email = req.body.email;
    const password = req.body.password;
    if(!email || !password) {return res.send("Cannot be empty! Please <a href='/login'> Try again</a>")}

    const user = getUserByEmail(email, users)
    if (!user) return res.status(403).send("Invalid login credentials! Please <a href='/login'>Try again</a>")

    if (bcrypt.compareSync(password, user.password)) {
        console.log(user.id)
        req.session.user_id = user.id;
        res.redirect("/urls");
      } else {
        res.status(403).send('Incorrect password, please try again');
      }
});

app.post("/logout", (req, res) => {
    req.session = null;
    res.redirect("/login");
})


// ---------- REGISTER PAGES ----------
app.get("/register", (req, res) => {
    const templateVars = { url: urlDatabase, user_id: null };
    res.render("register", templateVars);
})

app.post("/register", (req, res) => {
    const { email, password } = req.body;

    if(!email || !password) {return res.send("Cannot be empty! Please <a href='/register'> Try again</a>")}
    
    if (checkEmail(email)) { return res.status(400).send("Email already exists\n Try another email. <a href='/register'> Try again</a> ") }

    const id = generateRandomString(6);
    const hashedPassword = bcrypt.hashSync(password, 10);

    users[id] = { id, email, password: hashedPassword }
    req.session.user_id = id;
    console.log(users);
    res.redirect('/urls');
});


// ---------- MAIN PAGES ----------
app.get("/urls", (req, res) => {
    const userCookieID = req.session.user_id;
    const user = getUserByID(userCookieID, users);
    if (!user){
        return res.send('You must login first! Please <a href="/login">Try again</a>')
    }
    const urls = urlsForUser(userCookieID)
    const templateVars = { url: urls, user_id: user.id, user_email: user.email };
    
    res.render("urls_index", templateVars);
});

app.post("/urls", (req, res) => {
    const userCookieID = req.session.user_id;
    const user = getUserByID(userCookieID, users);
    const shortURL = generateRandomString();
    const { longURL } = req.body;
    urlDatabase[shortURL] =  { userID: userCookieID, longURL: longURL } 
    //res.render("/urls/" + shortURL);
    const urls = urlsForUser(userCookieID);

    const templateVars = { url: urls, user_id: user.id, user_email: user.email };
    res.render("urls_index", templateVars );
});

//Creating a new longURL with random ShortURL id route
app.get("/urls/new", (req, res) => {
    const userCookieID = req.session.user_id;
    const user = getUserByID(userCookieID, users);
    if (!user){
        res.redirect("/login");
    } else {
        const templateVars = {
        url: urlDatabase,
        user_id: req.session.user_id,
        user_email: user.email
    }
    res.render("urls_new", templateVars);
    }
});

app.post("/urls/new", (req, res) => {
  let newUrlId = generateRandomString();
  //this checks if the randomstring is not in the DB before adding it; 
  if (!urlDatabase[newUrlId]) {
    urlDatabase[newUrlId] = {
      longURL: req.body.longURL,
      userID: req.session.user_id 
    }
  }
  res.redirect("/urls/" + newUrlId);
});
//Editing longURL page
app.get("/urls/:id", (req, res) => {
    const userCookieID = req.session.user_id;
    const user = getUserByID(userCookieID, users);
    if (!user){
        return res.send('You must login first! Please <a href="/login">Try again</a>');
    }
    if (urlDatabase[req.params.id].userID !== req.session.user_id) {
        return res.status(403).send('Sorry, only the user can view this page!');
    }
    const longURL = urlDatabase[req.params.id].longURL;
    const templateVars = { user_id: req.params.id, id: req.params.id, longURL: longURL, user_email: user.email};
    res.render("urls_show", templateVars);
});
// Edit the LongURL
app.post("/urls/:id", (req, res) => {
    const updatedURL = req.params.id;
    urlDatabase[updatedURL].longURL = req.body.longURL

    res.redirect("/urls");
});

// shortURL redirect to longURL
app.get("/u/:id", (req, res) => {
    
    const longURL = urlDatabase[req.params.id].longURL
    if (!longURL) { return res.send('This URL id does not exist') }
    if(longURL.includes('http')){ res.redirect(longURL) }
    else{ res.redirect('http://' + longURL) }  
});

//deleting route
app.post("/urls/:id/delete", (req, res) => {
    delete urlDatabase[req.params.id];
    res.redirect("/urls");
});

app.get("/", (req, res) => {
    res.redirect("/login")
});
app.get("/urls/json", (req, res) => {
    res.json(urlDatabase)
});
app.get("/hello", (req, res) => {
    res.send(res.send("<html><body>Hello <b>World<b></body></html>\n"))
});

app.listen(PORT, () => {
    console.log(`App listening on port ${PORT}!`)
});