import express from "express";
import bodyParser from "body-parser";
import pg from 'pg'
const app = express();
const port = 3000;

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));

const db = new pg.Client({
  host: "localhost",
  database: "permalist",
  user: "postgres",
  password: "oscar",
  post: 5432
  });
  db.connect();


let items = [
  { id: 1, title: "Buy milk" },
  { id: 2, title: "Finish homework" },
];

app.get("/", (req, res) => {
  const query = "SELECT * FROM items";

  db.query(query)
    .then((result) => {
      const items = result.rows; // Assuming `db.query` returns `rows` containing the data
      res.render("index.ejs", {
        listTitle: "Today",
        listItems: items, // Pass retrieved items to the view
      });
    })
    .catch((err) => {
      console.error("Error selecting items:", err);
      res.status(500).send("Error retrieving items from the database.");
    });
});


app.post("/add", (req, res) => {
  const item = req.body.newItem;

  // Ensure the SQL query is correctly formatted
  const query = {
    text: "INSERT INTO items (title) VALUES ($1)", // Use placeholders to prevent SQL injection
    values: [item],
  };

  // Execute the query using your database client (e.g., pg for PostgreSQL)
  db.query(query)
    .then(() => {
      res.redirect("/");
    })
    .catch((err) => {
      console.error("Error inserting item:", err);
      res.status(500).send("Error adding item to the database.");
    });
});


app.post("/edit", (req, res) => {
  const id = req.body.updatedItemId; // Get the item ID
  const title = req.body.updatedItemTitle; // Get the updated title

  const query = {
    text: "UPDATE items SET title = $1 WHERE id = $2", // PostgreSQL syntax for placeholders
    values: [title, id],
  };

  // Execute the query
  db.query(query)
    .then(() => {
      res.redirect("/"); // Redirect to the main page after updating
    })
    .catch((err) => {
      console.error("Error updating item:", err);
      res.status(500).send("Error updating item in the database.");
    });
});


app.post("/delete", (req, res) => {
  const id = req.body.deleteItemId;
  const query = {
    text: "DELETE FROM items WHERE id = $1",
    values: [id]
    };
    // Execute the query
  db.query(query)
  .then(() => {
    res.redirect("/"); // Redirect to the main page after updating
  })
  .catch((err) => {
    console.error("Error updating item:", err);
    res.status(500).send("Error updating item in the database.");
  });
});


app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
