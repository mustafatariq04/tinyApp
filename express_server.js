var express = require("express");
var cookieParser = require("cookie-parser")

var app = express();
app.use(cookieParser());
var PORT = 8080; // default port 8080

app.set('view engine', 'ejs');

const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({extended: true}));

var urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

const users = {
  "userRandomID": {
    userId: "userRandomID",
    email: "user@example.com",
    password: "purple-monkey-dinosaur"
  },
 "user2RandomID": {
    userId: "user2RandomID",
    email: "user2@example.com",
    password: "dishwasher-funk"
  },
  "testId": {
    userId: "testId",
    email: "jake@hotmail.com",
    password: "dog"
  }
}

function generateRandomString(length) {
   var result           = '';
   var characters       = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
   var charactersLength = characters.length;
   for ( var i = 0; i < length; i++ ) {
      result += characters.charAt(Math.floor(Math.random() * charactersLength));
   }
   return result;
}

getUserByEmailPassword = (email, password) => {
  let user = null;
  for(let userId in users) {
    console.log('currently processing ', userId)
    if(users[userId].email === email && users[userId].password === password) {
      user = users[userId];
    }
  }
  return user;
}


app.get("/", (req, res) => {
  res.send("Hello!");
});


app.get("/urls", (req, res) => {
  let templateVars = {
    urls: urlDatabase,
    user: null
  };
  if(req.cookies['uId']) {
    templateVars.user = users[req.cookies['uId']];
  }
  res.render("urls_index", templateVars);
})


app.get("/urls/new", (req, res) => {
  let templateVars = {
    urls: urlDatabase,
    user: null
  }
  if(req.cookies['uId']) {
    templateVars.user = users[req.cookies['uId']];
    res.render("urls_new", templateVars);
  }
  res.redirect("/login");
});


app.get("/urls/:shortURL", (req, res) => {
  let templateVars = {
    urls: urlDatabase,
    user: null,
    shortURL: req.params.shortURL,
    longURL: urlDatabase[req.params.shortURL]
  }
  if(req.cookies['uId']) {
    templateVars.user = users[req.cookies['uId']];
  }
  res.render("urls_show", templateVars);
});




app.get("/register", (req, res) => {
  res.render("urls_register")
})

app.post("/register", (req, res) => {
  let userId = generateRandomString(6);
  let email = req.body.email;
  let password = req.body.password;
  for (let user in users) {
    if (users[user].email === email) {
      res.send("This email has already been taken");
    }
  }
  if(email.length == 0 || password.length == 0){
    res.send("Please provide a valid email and password");
  } else {
    users[userId] = {
      userId,
      email,
      password
    }
    res.cookie("uId", userId);
    console.log(users);
    res.redirect("/urls")
  }
});

app.get("/login", (req, res) =>{
  let templateVars = {
    uId: req.cookies["uId"],
    urls: urlDatabase,
    userObject: users,
    user: null
  };
  if (req.cookies.uId) {
    templateVars.user = users[req.cookies.uId];
  }
  res.render("urls_login", templateVars);
});


app.post("/login", (req, res) => {
  if (!req.body.email || !req.body.password) {
    res.status(400);
    res.send('Email and password cannot be empty');
  }
  let user = getUserByEmailPassword(req.body.email, req.body.password);

  if(user) {
    res.cookie('uId', user.userId)
    res.redirect("/urls");
  } else {
    res.status(400);
    res.send("invalid username and/or password");
  }
});


app.post("/logout", (req, res) => {
  res.clearCookie("uId");
  res.redirect("/urls");
})

app.post("/urls", (req, res) => {
  console.log(req.body);
  let generatedString = generateRandomString(6);
  urlDatabase[generatedString] = req.body.longURL;
  console.log(urlDatabase);
  res.redirect("/urls/" + generatedString);
});

app.post("/urls/:id", (req, res) => {
  urlDatabase[req.params.id] = req.body[req.params.id]
  res.redirect("/urls");
})

app.post("/urls/:shortURL/delete", (req, res) => {
  delete urlDatabase[req.params.shortURL];
  res.redirect("/urls")
})

app.get("/u/:shortURL", (req, res) => {
  const longURL = urlDatabase[req.params.shortURL]
  res.redirect(longURL);
});

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

app.get("/hello", (req, res) => {
  res.send("<html><body>Hello <b>World</b></body></html>\n");
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});