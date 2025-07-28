const express = require('express');
const session = require('express-session');
const path = require('path');
const { MongoClient } = require('mongodb');
const bcrypt = require('bcrypt');
const nodemailer = require('nodemailer');
const crypto = require('crypto');

const otpStore = {}; 

const PORT = 3000;
const app = express();

const mongoClient = new MongoClient("mongodb://localhost:27017/");
const dbName = "GoCart-Users";

app.use(express.static(path.join(__dirname, "../public")));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.set("view engine", "ejs");
app.set('views', path.join(__dirname, '../views'));

app.use(session({
  secret: "tryfgvfyuygd",
  resave: false,
  saveUninitialized: false,
}));

function checkAuth(req, res, next) {
  if (req.session.isAuthenticated) {
    next();
  } else {
    res.redirect('/account');
  }
}

app.use((req, res, next) => {
  res.locals.user = req.session?.user || null;
  res.locals.currentPath = req.path;
  next();
});

app.get("/home", (req, res) => {
  const user = req.session.user || { username: 'Guest' };
  res.render("home", { user });
});

app.get("/account", (req, res) => {
  const user = req.session.user || { username: 'Guest' };
  res.render("account", { user });
});

app.post("/signup", async (req, res) => {
  const { username, password, email } = req.body;
  const db = mongoClient.db(dbName);

  try {
    const existingUser = await db.collection("users").findOne({
      $or: [{ username }, { email }]
    });

    if (existingUser) {
      return res.send(`<script>alert("Username or email already registered."); window.location.href="/account";</script>`);
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    await db.collection("users").insertOne({ username, email, password: hashedPassword });

    res.redirect("/account");
  } catch (err) {
    console.error("Signup error:", err);
    res.status(500).send("Server error");
  }
});

app.post("/login", async (req, res) => {
  const { username, password } = req.body;
  const db = mongoClient.db(dbName);

  try {
    const user = await db.collection("users").findOne({ username });

    if (!user) {
      return res.send(`<script>alert("User does not exist or check your username."); window.location.href="/account";</script>`);
    }

    const isPasswordMatch = await bcrypt.compare(password, user.password);

    if (!isPasswordMatch) {
      return res.send(`<script>alert("Incorrect password."); window.location.href="/account";</script>`);
    }

    req.session.isAuthenticated = true;
    req.session.user = { username: user.username };
    res.redirect("/home");

  } catch (err) {
    console.error("Login error:", err);
    res.status(500).send("Server error");
  }
});


app.get("/logout", (req, res) => {
  req.session.destroy(err => {
    if (err) {
      console.log(err);
      return res.send("Error logging out");
    }
    res.redirect("/guest");
  });
});

      
app.get("/home", (req, res) => {
  const user = req.session.user || { username: 'Guest' };
  res.render("home", { user });
});

app.get("/guest", (req, res) => {
  const user = req.session.user;

  if (!user) {
    req.session.destroy(err => {
      if (err) {
        console.error('Session destruction error:', err);
      }
      res.render("home", { user: { username: 'Guest' } });
    });
  } else {
    res.render("home", { user });
  }
});

  app.get("/products", checkAuth, (req, res) => {
    res.render("products", { user: req.session.user });
  });
  
  app.get("/cart", checkAuth, (req, res) => {
    res.render("cart", { user: req.session.user });
  });
  
    app.get('/product-details1',checkAuth, (req, res) => {
      res.render("product-details1", { user: req.session.user  });
      });

      app.get("/product-details2", checkAuth, (req, res) => {
        res.render("product-details2", { user: req.session.user });
      });
      
      app.get("/product-details3", checkAuth, (req, res) => {
        res.render("product-details3", { user: req.session.user });
      });

      app.get("/product-details4", checkAuth, (req, res) => {
        res.render("product-details4", { user: req.session.user });
      });
      
      app.get("/product-details5", checkAuth, (req, res) => {
        res.render("product-details5", { user: req.session.user });
      }); 
           app.get("/product-details6", checkAuth, (req, res) => {
        res.render("product-details6", { user: req.session.user });
      }); 
           app.get("/product-details7", checkAuth, (req, res) => {
        res.render("product-details7", { user: req.session.user });
      }); 
           app.get("/product-details8", checkAuth, (req, res) => {
        res.render("product-details8", { user: req.session.user });
      });  
          app.get("/product-details9", checkAuth, (req, res) => {
        res.render("product-details9", { user: req.session.user });
      });   
         app.get("/product-details10", checkAuth, (req, res) => {
        res.render("product-details10", { user: req.session.user });
      });

      app.get("/product-details11", checkAuth, (req, res) => {
        res.render("product-details11", { user: req.session.user });
      });
      app.get("/product-details12", checkAuth, (req, res) => {
        res.render("product-details12", { user: req.session.user });
      });

      // Add item to cart
app.post('/cart/add', async (req, res) => {
  const { name, price, quantity, image } = req.body; // image included
  const quantityNumber = parseInt(quantity, 10);

  if (isNaN(quantityNumber) || quantityNumber <= 0) {
    return res.status(400).send("Invalid quantity");
  }

  const username = req.session.user?.username;
  if (!username) {
    return res.status(401).send("Not logged in");
  }

  const db = mongoClient.db(dbName);
  const cartCollection = db.collection('carts');

  try {
    // Look for existing item in the cart
    const existingItem = await cartCollection.findOne({ username, 'items.name': name });

    if (existingItem) {
      // If the item already exists, increment the quantity
      await cartCollection.updateOne(
        { username, 'items.name': name },
        { $inc: { 'items.$.quantity': quantityNumber } }
      );
    } else {
      // Add a new item to the cart with the image path
      await cartCollection.updateOne(
        { username },
        {
          $push: {
            items: {
              name,
              price,
              quantity: quantityNumber,
              image // store the image path
            }
          },
        },
        { upsert: true }
      );
    }

    res.status(200).redirect("/cart");

  } catch (err) {
    console.error("Error adding item to cart:", err);
    res.status(500).send("Server error");
  }
});
      app.post('/cart/update', checkAuth, async (req, res) => {
        const { name, quantity } = req.body;
        const username = req.session.user.username;
        const quantityNumber = parseInt(quantity, 10);
      
        if (isNaN(quantityNumber) || quantityNumber <= 0) {
          return res.status(400).send("Invalid quantity");
        }
      
        try {
          const cartCollection = mongoClient.db(dbName).collection('carts');

          
          const cart = await cartCollection.findOne({ username });
          const item = cart?.items.find(item => item.name === name);
      
          if (!item) {
            return res.status(404).send("Item not found in cart");
          }
      
          const price = item.price; // get the price from the item
      
          // Update the quantity of the item
          await cartCollection.updateOne(
            { username, 'items.name': name },
            { $set: { 'items.$.quantity': quantityNumber } }
          );
      
          res.json({
            success: true,
            updatedItem: {
              name,
              quantity: quantityNumber,
              price //  now this is defined
            }
          });
      
        } catch (err) {
          console.error("Error updating cart:", err);
          res.status(500).send("Server error");
        }
      });
      
      

      app.post('/cart/remove', checkAuth, async (req, res) => {
        const { name } = req.body;
        const username = req.session.user.username;
      
        try {
          const cartCollection = mongoClient.db(dbName).collection('carts');

          
          // Remove the item from the cart
          const result = await cartCollection.updateOne(
            { username },
            { $pull: { items: { name } } }
          );
      
          if (result.modifiedCount === 0) {
            return res.status(404).send("Item not found in cart");
          }
      
          res.status(200).send("Item removed from cart");
      
        } catch (err) {
          console.error("Error removing item from cart:", err);
          res.status(500).send("Server error");
        }
      });
      
      app.get('/cart/data', checkAuth, async (req, res) => {
        const db = mongoClient.db(dbName);
        const username = req.session.user.username;
    
        const cartData = await db.collection("carts").findOne({ username });
    
        if (cartData && cartData.items.length > 0) {
            return res.json(cartData.items); // Return items including image paths
        } else {
            return res.json([]); // Return an empty array if there are no items
        }
    });
    
    app.post("/checkout", async (req, res) => {
      try {
        // Delete all cart items in the "carts" collection for the current user
        const db = mongoClient.db(dbName);
        const username = req.session.user.username;
    
        const cartData = await db.collection("carts").deleteMany({ username: req.session.user.username });

    
        // Send response to frontend
        res.json({ success: true, message: "Thank you for your purchase! Have a wonderful day!" });
      } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: "Something went wrong. Please try again!" });
      }
    });

    app.get("/forgot-password", (req, res) => {
  res.render("forgot-password", { user: req.session.user || { username: 'Guest' } });
});

    //reset password
    app.post("/forgot-password", async (req, res) => {
  const { username, newPassword } = req.body;
  const db = mongoClient.db(dbName);

  try {
    const user = await db.collection("users").findOne({ username });

    if (!user) {
      return res.send(`<script>alert("User not found."); window.location.href="/forgot-password";</script>`);
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    await db.collection("users").updateOne(
      { username },
      { $set: { password: hashedPassword } }
    );

    res.send(`<script>alert("Password reset successful."); window.location.href="/account";</script>`);

  } catch (err) {
    console.error("Forgot password error:", err);
    res.status(500).send("Server error");
  }
});
app.get('/forgot-password1', (req, res) => {
  res.render('forgot-password1');  // You can create this view for OTP verification
});

app.post("/forgot-password1", async (req, res) => {
  const { email } = req.body;
  const db = mongoClient.db(dbName);
  const user = await db.collection("users").findOne({ email });

  if (!user) {
    return res.send(`<script>alert("No user found with that email."); window.location.href="/forgot-password";</script>`);
  }

  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  const expiresAt = Date.now() + 10 * 60 * 1000; // 10 minutes

  otpStore[email] = { otp, expiresAt };

  // Setup nodemailer
  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: 'GoCart212443@gmail.com', // replace with your email
      pass: 'njbe oyae ghyr bpuz'     // use Gmail App Password (not your real one)
    },
  tls: {
    rejectUnauthorized: false
  },
  debug:true
  });
  
  const mailOptions = {
    from: 'GoCart Support <GoCart212443@gmail.com>',
    to: email,
    subject: 'GoCart Password Reset OTP',
    text: `Your OTP is: ${otp}. It is valid for 10 minutes.`
  };

  transporter.sendMail(mailOptions, function (error, info) {
    if (error) {
      console.error(error);
      res.send("Failed to send OTP");
    } else {
      res.redirect(`/verify-otp?email=${encodeURIComponent(email)}`);
    }
  });
});


//Otp
app.get("/verify-otp", (req, res) => {
  const email = req.query.email;
  res.render("verify-otp", { email });
});

app.post("/verify-otp", async (req, res) => {
  const { email, otp, newPassword } = req.body;
  const stored = otpStore[email];

  if (!stored || stored.otp !== otp || Date.now() > stored.expiresAt) {
    return res.send(`<script>alert("Invalid or expired OTP."); window.location.href="/forgot-password";</script>`);
  }

  const hashedPassword = await bcrypt.hash(newPassword, 10);
  const db = mongoClient.db(dbName);

  await db.collection("users").updateOne(
    { email },
    { $set: { password: hashedPassword } }
  );

  delete otpStore[email]; // Clear OTP after successful reset

  res.send(`<script>alert("Password reset successful."); window.location.href="/account";</script>`);
});


      let db; // Define db at the top so it's accessible in routes

      async function init() {
        try {
          console.log("Connecting to MongoDB...");
          await mongoClient.connect();
          db = mongoClient.db("test"); // Initialize db here
          console.log("Connected to MongoDB");
      
          app.listen(PORT, () => {
            console.log(`Server running on port ${PORT}`);
          });
        } catch (err) {
          console.error("Failed to connect to MongoDB:", err);
        }
      }
      
      init();
      