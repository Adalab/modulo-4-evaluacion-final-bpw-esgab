// my Express server

// import libraries
const express = require("express");
const cors = require("cors");
const mysql = require("mysql2/promise");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

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

// JWT functions

const generateToken = (payload) => {
  const token = jwt.sign(payload, "secreto", { expiresIn: "1h" });
  return token;
};

const verifyToken = (token) => {
  try {
    const decoded = jwt.verify(token, "secreto");
    return decoded;
  } catch (err) {
    return null;
  }
};

const authenticateToken = (req, res, next) => {
  const token = req.headers["authorization"];

  if (!token) {
    return res.status(401).json({
      error: "Token no proporcionado",
    });
  }

  const decoded = verifyToken(token);

  if (!decoded) {
    return res.status(401).json({
      error: "Token inválido",
    });
  }

  req.user = decoded;
  next();
};

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
  const { nombre, email, password } = req.body;
  console.log(req.body);

  if (!nombre) {
    res.json({
      success: false,
      error: "El nombre de usuaria no puede estar vacio",
    });
    return;
  }

  if (nombre.length < 4) {
    res.json({
      success: false,
      error: "El nombre de usuaria es demasiado corto",
    });
    return;
  }

  if (nombre.includes(" ")) {
    res.json({
      success: false,
      error: "El nombre de usuaria no puede contener espacios",
    });
    return;
  }

  if (!email) {
    res.json({
      success: false,
      error: "El email de la usuaria no puede estar vacio",
    });
    return;
  }

  if (!/\b[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}\b/i.test(email)) {
    res.json({
      success: false,
      error: "El email no es válido",
    });
    return;
  }

  if (!password) {
    res.json({
      success: false,
      error: "La contraseña no puede estar vacia",
    });
    return;
  }

  if (password.length < 8) {
    res.json({
      success: false,
      error: "La contraseña debe tener como mínimo 8 caracteres",
    });
    return;
  }

  //  Check if the password contains at least one letter, one number, and one symbol
  if (
    !/(?=.*[a-zA-Z])(?=.*[0-9])(?=.*[!@#$%^&*()_+|}{:;.,<>?]).{8,}/.test(
      password
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

  const [existingUserNames] = await conn.query(queryCheckUserName, [nombre]);

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

  const [existingEmails] = await conn.query(queryCheckEmail, [email]);

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

  const crypedPass = await bcrypt.hash(password, 10);

  const [insertResults] = await conn.execute(insertNewUser, [
    nombre,
    email,
    crypedPass,
  ]);

  if (insertResults.affectedRows === 1) {
    // Generate a token for the user
    const token = generateToken({ email });

    res.json({
      success: true,
      token: token,
    });

  } else {
    res.json({ 
      success: false,
      error: "Error en el registro de usuario"
    });
  }

  conn.end();

});
