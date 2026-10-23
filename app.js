require("dotenv").config();
require("reflect-metadata");
const express = require("express");
const path = require("path");
const personRoutes = require("./routes/Person");

const postgres = require("./app-data-source")

const app = express();
const PORT = process.env.PORT || 3000;

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));

app.get("/", (req, res) => res.redirect("/people"));
app.use("/people", personRoutes);

postgres.initialize().then(()=>{
  app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
  });
})

.catch((err) => {
  console.error("Error during Data Source initialization", err);
});
