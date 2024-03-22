// my Express server

// import libraries
const express = require("express");
const cors = require("cors");
const mysql = require("mysql2/promise");

require("dotenv").config();

// create and config server
const server = express();

server.use(cors());
server.use(express.json({ limit: "25mb" }));

// mysql config

async function getConnection() {
  const connection = await mysql.createConnection({
    host: process.env.MYSQL_HOST,
    database: process.env.MYSQL_DB,
    user: process.env.MYSQL_USER,
    password: process.env.MYSQL_PASS,
  });

  await connection.connect();

  return connection;
}

// init express aplication
const port = 4000;
server.listen(port, () => {
  console.log(`Server listening at http://localhost:${port}`);
});

// get all recipes
server.get("/api/recetas", async (req, res) => {
  const connection = await getConnection();

  const sql = "SELECT * FROM recetas";

  const [results] = await connection.query(sql);

  const numOfElements = results.length;

  res.json({
    info: { count: numOfElements },
    results: results,
  });

  connection.end();
});

// get recipe by its id
server.get("/api/recetas/:id", async (req, res) => {
  const recipeId = req.params.id;

  const foundRecipe = "SELECT * FROM recetas WHERE id = ?";

  const connection = await getConnection();

  const [results] = await connection.query(foundRecipe, [recipeId]);

  const recipesResults = results[0];

  if (results.length === 0) {
    res.json({
      success: false,
      error: "No se ha encontrado esta receta",
    });
  } else {
    res.json(recipesResults);
  }

  connection.end();
});

// add recipe
server.post("/api/recetas", async (req, res) => {
  const { nombre, ingredientes, instrucciones } = req.body;

  if ( !nombre || !ingredientes || !instrucciones || nombre === "" || ingredientes === "" || instrucciones === ""
  ) {
    return res.json({
      success: false,
      error: "Los campos no pueden estar vacíos",
    });
  }

  try {
    const connection = await getConnection();

    // insert recipe data
    const insertRecipes = `
      INSERT INTO recetas (nombre, ingredientes, instrucciones)
      VALUES (?, ?, ?)`;

    const [results] = await connection.execute(insertRecipes, [
      nombre,
      ingredientes,
      instrucciones,
    ]);

    connection.end();

    res.json({
      success: true,
      id: results.insertId,
    });
  
  } catch (error) {
    res.json({
      success: false,
      error: "Error al insertar la receta",
    });
  }
});

server.put("/api/recetas/:id", async (req, res) => {
  const { nombre, ingredientes, instrucciones } = req.body;

  try {
    const conn = await getConnection();

    const updateRecipe = `
      UPDATE recetas
        SET nombre = ?, ingredientes = ?, instrucciones = ?
        WHERE id = ?
    `;

    const [updateResult] = await conn.execute(updateRecipe, [
      nombre,
      ingredientes,
      instrucciones,
      req.params.id,
    ]);

    conn.end();

    res.json({
      success: true,
    });
  } catch (error) {
    res.json({
      success: false,
      error: "Error al actualizar la receta",
    });
  }
});

server.delete("/api/recetas/:id", async (req, res) => {
  const deletedId = req.params.id;

  try {
    const conn = await getConnection();

    const deleteRecipe = `
      DELETE FROM recetas WHERE id = ?
    `;

    const [deleteResult] = await conn.execute(deleteRecipe, [deletedId]);

    conn.end();

    res.json({
      success: true,
    });
  } catch (error) {
    res.json({
      success: false,
      error: "Error al borrar la receta",
    });
  }
});
