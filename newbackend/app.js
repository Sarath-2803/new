require("dotenv").config();
const { neon } = require("@neondatabase/serverless");

// Create a Neon SQL client using your DATABASE_URL from .env
const sql = neon(process.env.DATABASE_URL);

const express = require("express");

const app = express();
const path = require("path");
const session = require("express-session");
const passport = require("passport");
const LocalStrategy = require("passport-local").Strategy;
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const bcrypt = require("bcrypt");
const nodemailer = require('nodemailer');

const db = require("./models");
const { where } = require("sequelize");
const Item = db.Item;
const User = db.User;

app.set("views", path.join(__dirname, "views"));
app.use(express.json()); // Middleware to parse JSON bodies
app.use(express.urlencoded({ extended: true }));
// app.use(express.static("public")); // Serve static files from the "public" directory
app.set("view engine", "ejs");
// app.set("views", "./views"); // Set the directory for views

const cookieParser = require("cookie-parser");
const csrf = require("tiny-csrf");
const user = require("./models/user");

app.use(cookieParser("secret"));
app.use(csrf("this_is_32_characters_long______", ["POST", "PUT", "DELETE"]));

// Session middleware (must come before passport)
app.use(
  session({
    secret: "your_session_secret_here",
    resave: false,
    saveUninitialized: false,
  })
);

app.use(passport.initialize());
app.use(passport.session());

passport.use(
  new LocalStrategy(
    {
      usernameField: "email", // or 'username' if you use username
      passwordField: "password",
    },
    async (email, password, done) => {
      try {
        const user = await User.findOne({ where: { email } });
        if (!user) return done(null, false, { message: "Incorrect email." });
        const match = await bcrypt.compare(password, user.password);
        if (!match) return done(null, false, { message: "Incorrect password." });
        return done(null, user);
      } catch (err) {
        return done(err);
      }
    }
  )
);

passport.use(new GoogleStrategy({
  clientID: process.env.GOOGLE_CLIENT_ID,
  clientSecret: process.env.GOOGLE_CLIENT_SECRET,
  callbackURL: "/auth/google/callback"
},
  async function (accessToken, refreshToken, profile, done) {
    try {
      let user = await User.findOne({ where: { googleId: profile.id } });
      if (!user) {
        user = await User.create({
          googleId: profile.id,
          email: profile.emails[0].value,
          name: profile.displayName
        });
      }
      return done(null, user);
    } catch (err) {
      return done(err);
    }
  }
));

passport.serializeUser((user, done) => {
  done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
  try {
    const user = await User.findByPk(id);
    done(null, user);
  } catch (err) {
    done(err);
  }
});

const ensureLoggedIn = require('connect-ensure-login').ensureLoggedIn;

//Routes
app.get("/", (req, res) => {
  res.render("index", { title: "myShop" });
});

app.get("/signup", (req, res) => {
  console.log("CSRF Token:", req.csrfToken());
  res.render("signup", { title: "myShop Sign Up", csrfToken: req.csrfToken() });
});

app.post("/signup", async (req, res, next) => {
  try {
    const hashedPassword = await bcrypt.hash(req.body.password, 10);
    const user = await db.User.create({
      name: req.body.name,
      siteName: req.body.siteName,
      number: req.body.number,
      shopName: req.body.shopName,
      email: req.body.email,
      password: hashedPassword,
    });
    // Log the user in after signup
    req.login(user, function (err) {
      if (err) { return next(err); }
      return res.redirect("/dashboard");
    });
  } catch (error) {
    console.error("Error creating user:", error);
    return res.send("Error creating user. Please try again.");
  }
});

app.get("/login", (req, res) => {
  res.render("login", { title: "myShop Login", csrfToken: req.csrfToken() });
});

app.post('/login',
  passport.authenticate('local', {
    successRedirect: '/dashboard',
    failureRedirect: '/login',
    failureFlash: false // set to true if using connect-flash
  })
);

app.get("/logout", ensureLoggedIn('/login'), (req, res) => {
  req.logout((err) => {
    if (err) {
      console.error("Error logging out:", err);
      return res.status(500).send("Error logging out");
    }
    res.redirect("/");
  });
}
);



app.get("/dashboard", ensureLoggedIn('/login'), async (req, res) => {
  var itemData = await Item.getAllItem(req.user.id); // Fetch items for the logged-in user
  res.render("dashboard", {
    title: "Dashboard",
    data: itemData,
    siteName: req.user.siteName, // Pass the user's siteName to the view
    csrfToken: req.csrfToken(), // <-- Add this line
    active: 'dashboard', // <-- add this
  });
});

app.get("/about", ensureLoggedIn('/login'), (req, res) => {
  res.render("about", { title: "myShop About", siteName: "MyShop", active: 'about' }); // You can pass siteName or other data as needed
}
);

app.get("/contact", ensureLoggedIn('/login'), (req, res) => {
  res.render("contact", { title: "myShop Contact", siteName: "MyShop", active: 'contact' }); // You can pass siteName or other data as needed
}
);

app.get("/account", ensureLoggedIn('/login'), async (req, res) => {
  const user = await User.findOne({ where: { id: req.user.id } });
  return res.render("account", { title: "myShop Account", data: user, siteName: user.siteName, csrfToken: req.csrfToken(), active: 'account' }); // Pass the user's siteName to the view
})

app.get("/updateaccount", ensureLoggedIn('/login'), async (req, res) => {
  res.render("updateAccount", {
    title: "Update Account",
    data: req.user,
    siteName: req.user.siteName,
    csrfToken: req.csrfToken(),
    active: 'account'

  });
}
);

app.post("/account", ensureLoggedIn('/login'), async (req, res) => {
  try {
    const user = await User.update(
      { name: req.body.name, siteName: req.body.siteName, number: req.body.number, shopName: req.body.shopName },
      { where: { id: req.user.id } }
    );
    return res.redirect("/account");
  } catch (error) {
    console.error("Error updating account:", error);
    return res.send("Error updating account");
  }
}
);

//Route to get all items
// app.get("/items", async (req, res) => {
//   try {
//     const items = await Item.getAllItem();
//     return res.json(items);
//   } catch (error) {
//     console.error("Error fetching items:", error);
//     return res.status(500).json(error);
//   }
// });

//Route to add an item
app.post("/additem", ensureLoggedIn('/login'), async (req, res) => {
  try {
    const item = await Item.addItem({
      name: req.body.name,
      image: req.body.image,
      price: req.body.price,
      userId: req.user.id, // Associate item with logged-in user
    });
    return res.redirect("/dashboard");
  } catch (error) {
    console.error("Error adding item:", error);
    return res.send("Error adding item");
  }
});

//Route to update an item
app.post("/update", ensureLoggedIn('/login'), async (req, res) => {
  try {
    const item = await Item.updateItem({
      id: req.body.id,
      name: req.body.name,
      image: req.body.image,
      price: req.body.price,
      userId: req.user.id, // Associate item with logged-in user
    });
    return res.redirect("/dashboard");
  } catch (error) {
    return res.send("Error updating item");
  }
});

//Route to delete an item
app.delete("/delete/:id", ensureLoggedIn('/login'), async (req, res) => {
  try {
    const item = await Item.deleteItem({ id: req.params.id, userId: req.user.id }); // Ensure the item belongs to the logged-in user
    return res.send("Item deleted successfully!");
  } catch (error) {
    return res.send("Error deleting item");
  }
});


app.get("/myshop/:siteName", async (req, res) => {
  try {
    // Find the user by siteName
    const user = await User.findOne({ where: { siteName: req.params.siteName } });
    if (!user) {
      return res.send("Site not found!");
    }
    // Fetch items for this user
    const data = await Item.getAllItem(user.id);
    res.render("template", { title: user.shopName, data: data, shopName: user.shopName, number: user.number });
  } catch (error) {
    console.error("Error loading template:", error);
    res.send("Error loading site!");
  }
});

app.get('/auth/google',
  passport.authenticate('google', { scope: ['profile', 'email'] })
);

app.get('/auth/google/callback',
  passport.authenticate('google', { failureRedirect: '/login' }),
  function (req, res) {
    // Successful authentication
    res.redirect('/dashboard');
  }
);

app.post("/contact",ensureLoggedIn('/login'), async (req, res) => {
  const { contactName, contactEmail, contactMessage } = req.body;

  // Configure your transporter (use your real email and app password or SMTP credentials)
  let transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.GMAIL_USER,
      pass: process.env.GMAIL_PASS
    }
  });

  // Email options
  let mailOptions = {
    from: contactEmail,
    to: 'customerhelp.myprod@gmail.com',            // where you want to receive contact messages
    subject: `New Contact Form Submission from ${contactName}`,
    text: `Name: ${contactName}\nEmail: ${contactEmail}\n\nMessage:\n${contactMessage}`
  };

  try {
    await transporter.sendMail(mailOptions);
    res.render("contact", {
      title: "Contact",
      siteName: "MyShop",
      active: "contact",
      message: "Thank you for reaching out! We'll get back to you soon."
    });
  } catch (error) {
    console.error("Error sending contact email:", error);
    res.render("contact", {
      title: "Contact",
      siteName: "MyShop",
      active: "contact",
      message: "Sorry, there was an error sending your message. Please try again later."
    });
  }
});


module.exports = app;
