const express = require('express');
const app = express();
const cookieParser = require('cookie-parser')
const PORT = 8080; //default port 8080 (usually when is working in localhost)

app.use(express.urlencoded({ extended: true }));
app.set("view engine", "ejs");
app.use(cookieParser())

// const urlDatabase = {
//     "b2xVn2": "http://www.lighthouselabs.ca",
//     "9sm5xK": "http://www.google.com"
// };
const urlDatabase = {
    b6UTxQ: {
      longURL: "https://www.tsn.ca",
      userID: "aJ48lW",
    },
    i3BoGr: {
      longURL: "https://www.google.ca",
      userID: "aJ48lW",
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
    return result
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

const getUser = (email, users) => {
    for (let user in users) {
        if (users[user].email === email) {
            return users[user]
        }
    }

    return false
}

//registering, login and logout
const getUserByID = (userID, users) => {
    for (let user in users) {
        if (users[user].id === userID) {
            return users[user]
        }
    }

    return false
}

const urlsForUser = function (userId) {
    const urls = {};
    
    // const keys = Object.values(urlDatabase)
    for (const id in urlDatabase){
        const url = urlDatabase[id]
        if (url.userID === userId) {
            urls[id] = url
        }
    }
    return urls
}

//ROUTES StartS HERE

app.get("/", (req, res) => {
    res.send("Hello")
});

app.get("/login", (req, res) => {
    const templateVars = { url: urlDatabase, user_id: null };

    const getUser = (email, users) => {
    for (let user in users) {
        if (users[user].email === email) {
            return users[user]
        }
    }

    return false
}
    res.render("login", templateVars)
})



app.post('/login', (req, res) => {
    const email = req.body.email
    const password = req.body.password
    const user = getUser(email, users)
    if (user.email !== email || user.password !== password) return res.status(403).send("Invalid login credentials! Please <a href='/login'>Try again</a>")

    res.cookie('user_id', user.id)
    res.redirect("/urls");
});

app.post("/logout", (req, res) => {
    res.clearCookie('user_id');
    res.redirect("/login")
})

app.get("/register", (req, res) => {
    const templateVars = { url: urlDatabase, user_id: null };
    res.render("register", templateVars)
})
// Register a new USER to the database - checking if the email already exists not working
app.post("/register", (req, res) => {
    const { email, password } = req.body
    if(!email || !password) {return res.send("Cannot be empty! Please <a href='/register'> Try again</a>")}
    // console.log("CHECK EMAIL:" + checkEmail(email))
    if (checkEmail(email)) { return res.status(400).send("Email already exists\n Try another email. <a href='/register'> Try again</a> ") }

    const id = generateRandomString(6);
    const user = {id, email, password}
    users[id] = user
    // let newUserID = generateRandomString();
    // users[newUserID] = {
    //     id: newUserID,
    //     email: req.body.email,
    //     password: req.body.password,
    // }
    res.cookie('user_id', id);
    console.log(users);
    console.log(users[req.params.id]);
    res.redirect('/urls')
});

app.get("/urls/json", (req, res) => {
    res.json(urlDatabase)
})

app.get("/urls", (req, res) => {
    const userCookieID = req.cookies.user_id //const id = req.cookies['user_id']
    const user = getUserByID(userCookieID, users)
    if (!user){
        return res.send('You must login first! Please <a href="/login">Try again</a>')
    }
    const id = req.cookies.user_id
    const urls = urlsForUser(id)
    const templateVars = { url: urls, user_id: user.id, user_email: user.email };

    
    if(user) {
        res.render("urls_index", templateVars);
        }
    
    //console.log("cookies: ", req.cookies)
    
})

app.get("/hello", (req, res) => {
    res.send(res.send("<html><body>Hello <b>World<b></body></html>\n"))
})

//Creating a new longURL with random ShortURL id route
app.get("/urls/new", (req, res) => {
    const userCookieID = req.cookies.user_id //const id = req.cookies['user_id']
    const user = getUserByID(userCookieID, users)
    if (!user){
        res.redirect("/login")
    } else {
        const templateVars = {
        url: urlDatabase,
        user_id: req.cookies.user_id,
        user_email: user.email
    }
    res.render("urls_new", templateVars)
}
    
});
app.post("/urls/new", (req, res) => {
    let newUrlId = generateRandomString();
  //this checks if the randomstring is not in the DB before adding it; but the functionality is not complete, it should generate a new random string and then re-try adding it, but what are the odds that this is actually needed 
  if (!urlDatabase[newUrlId]) {
    urlDatabase[newUrlId] = {
      longURL: req.body.longURL,
      userID: req.cookies.user_id
    }
  }

  res.redirect("/urls/" + newUrlId);
});

app.get("/urls/:id", (req, res) => {
    const userCookieID = req.cookies.user_id //const id = req.cookies['user_id']
    const user = getUserByID(userCookieID, users)
    // if (!user){
    //     return res.send('You must login first! Please <a href="/login">Try again</a>')
    // }
    // if (urlDatabase[req.params.id].userID !== req.cookies.user_id) {
    //     return res.status(403).send('Sorry, only the user can view this page!')
    //   }
    const longURL = urlDatabase[req.params.id].longURL
    const templateVars = { user_id: req.params.id, id: req.params.id, longURL: longURL, user_email: user.email};
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
    // console.log(urlDatabase);
    const updatedURL = req.params.id;
    // console.log(updatedURL);
    urlDatabase[updatedURL] = req.body.longURL
    // console.log(urlDatabase);

    res.redirect("/urls")
})

// shortURL redirect to longURL
app.get("/u/:id", (req, res) => {
    const longURL = urlDatabase[req.params.id].longURL
    if (!longURL) {
        return res.send('This URL id does not exist')
    }
    console.log(longURL)
    res.redirect(longURL)
})

//deleting route
app.post("/urls/:id/delete", (req, res) => {
    delete urlDatabase[req.params.id]
    res.redirect("/urls")
})



app.listen(PORT, () => {
    console.log(`App listening on port ${PORT}!`)
});