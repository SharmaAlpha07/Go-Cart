app.get("/logout", (req, res) => {
  req.session.destroy(err => {
    if (err) return res.send("Logout failed");
    res.redirect("/account");
  });
});
