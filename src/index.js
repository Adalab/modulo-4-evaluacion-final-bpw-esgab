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

async function getConnection(database) {
  const connection = await mysql.createConnection({
    host: process.env.MYSQL_HOST,
    database: database,
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
  const conn = await getConnection(process.env.MYSQL_DB1);

  const sql = "SELECT * FROM recetas";

  const [results] = await conn.query(sql);

  const numOfElements = results.length;

  res.json({
    info: { count: numOfElements },
    results: results,
  });

  conn.end();
});

// get recipe by its id
server.get("/api/recetas/:id", async (req, res) => {
  const recipeId = req.params.id;

  const foundRecipe = "SELECT * FROM recetas WHERE id = ?";

  const conn = await getConnection(process.env.MYSQL_DB1);

  const [results] = await conn.query(foundRecipe, [recipeId]);

  const recipesResults = results[0];

  if (results.length === 0) {
    res.json({
      success: false,
      error: "No se ha encontrado esta receta",
    });
  } else {
    res.json(recipesResults);
  }

  conn.end();
});

// add recipe
server.post("/api/recetas", async (req, res) => {
  const { nombre, ingredientes, instrucciones } = req.body;

  if (
    !nombre ||
    !ingredientes ||
    !instrucciones ||
    nombre === "" ||
    ingredientes === "" ||
    instrucciones === ""
  ) {
    return res.json({
      success: false,
      error: "Los campos no pueden estar vacíos",
    });
  }

  try {
    const conn = await getConnection(process.env.MYSQL_DB1);

    // insert recipe data
    const insertRecipes = `
      INSERT INTO recetas (nombre, ingredientes, instrucciones)
      VALUES (?, ?, ?)`;

    const [results] = await conn.execute(insertRecipes, [
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
    const conn = await getConnection(process.env.MYSQL_DB1);

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
    const conn = await getConnection(process.env.MYSQL_DB1);

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


// User registration: username, email and password
server.post("/registro", async (req, res) => {
  console.log(req.body);

  if (!req.body.nombre) {
    res.json({
      success: false,
      error: "El nombre de usuaria no puede estar vacio",
    });
    return;
  }

  if (req.body.nombre.length < 4) {
    res.json({
      success: false,
      error: "El nombre de usuaria es demasiado corto",
    });
    return;
  }

  if (req.body.nombre.includes(" ")) {
    res.json({
      success: false,
      error: "El nombre de usuaria no puede contener espacios",
    });
    return;
  }

  if (!req.body.email) {
    res.json({
      success: false,
      error: "El email de la usuaria no puede estar vacio",
    });
    return;
  }

  if (!/\b[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}\b/i.test(req.body.email)) {
    res.json({
      success: false,
      error: "El email no es válido",
    });
    return;
  }

  if (!req.body.password) {
    res.json({
      success: false,
      error: "La contraseña no puede estar vacia",
    });
    return;
  }

  if (req.body.password.length < 8) {
    res.json({
      success: false,
      error: "La contraseña debe tener como mínimo 8 caracteres",
    });
    return;
  }

  //  Check if the password contains at least one letter, one number, and one symbol
  if (
    !/(?=.*[a-zA-Z])(?=.*[0-9])(?=.*[!@#$%^&*()_+|}{:;.,<>?]).{8,}/.test(
      req.body.password
    )
  ) {
    return res.json({
      success: false,
      error:
        "La contraseña debe contener al menos una letra, un número y un símbolo",
    });
  }

  const conn = await getConnection(process.env.MYSQL_DB2);

  const queryCheckUserName = `
  SELECT *
    FROM usuarios
    WHERE nombre = ?
  `;

  const [existingUserNames] = await conn.query(queryCheckUserName, [
    req.body.nombre,
  ]);

  if (existingUserNames.length > 0) {
    res.json({
      success: false,
      error: "Ese nombre de usuario ya existe",
    });
    conn.end();
    return;
  }

  // Check if the email already exists
  const queryCheckEmail = `
  SELECT * FROM usuarios
  WHERE email = ?;
  `;

  const [existingEmails] = await conn.query(queryCheckEmail, [req.body.email]);

  if (existingEmails.length > 0) {
    // If a user with the given email exists, return an error
    res.json({
      success: false,
      error: "La dirección de correo electrónico ya está registrada",
    });
    conn.end();
    return;
  }

  const insertNewUser = `
  INSERT INTO usuarios (nombre, email, password)
    VALUES (?, ?, ?);
  `;

  // const crypedPass = await bcrypt.hash(req.body.pass, 10);

  const [insertResults] = await conn.execute(insertNewUser, [
    req.body.nombre,
    req.body.email,
    req.body.password,
  ]);

  conn.end();

  if (insertResults.affectedRows === 1) {
    res.send({ success: true });
  } else {
    res.send({ success: false });
  }
});
