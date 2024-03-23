// Express server

// IMPORT LIBRARIES
const express = require("express");
const cors = require("cors");
const mysql = require("mysql2/promise");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const swaggerUi = require("swagger-ui-express"),
  swaggerDocument = require("../swagger.json");

require("dotenv").config();

// CREATE VARIABLES
const server = express();
const port = process.env.PORT || 4000;

// CONFIGURATION
server.use(cors());
server.use(express.json({ limit: "25mb" }));
server.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerDocument));

// MYSQL CONFIGURATION
// CONFIGURATION
server.use(cors());
server.use(express.json({ limit: "25mb" }));
server.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerDocument));

// MYSQL CONFIGURATION
async function getConnection(database) {
  let host, user, password;

  host = process.env.MYSQL_HOST || "localhost";
  user = process.env.MYSQL_USER || "root";
  password = process.env.MYSQL_PASS;

  const connection = await mysql.createConnection({
    host: host,
    database: database, // Specifies which database is used
    user: user,
    password: password,
  });

  await connection.connect();

  return connection;
}

// START THE SERVER
server.listen(port, () => {
  console.log(`Server listening at http://localhost:${port}`);
});

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

// access to Swagger documentation at root
server.get("/", (req, res) => {
  res.redirect("/api-docs");
});

// get all recipes
server.get("/api/recetas", authenticateToken, async (req, res) => {
  try {
    const conn = await getConnection(process.env.MYSQL_RECIPES_DB);

    const sql = "SELECT * FROM recetas";

    const [results] = await conn.query(sql);

    const numOfElements = results.length;

    res.status(200).json({
      info: { count: numOfElements },
      results: results,
    });

    conn.end();
  } catch (error) {
    res.status(500).json({
      error: "Error interno del servidor",
    });
  }
});

// get recipe by its id
server.get("/api/recetas/:id", async (req, res) => {
  try {
    const recipeId = req.params.id;

    const foundRecipe = "SELECT * FROM recetas WHERE id = ?";

    const conn = await getConnection(process.env.MYSQL_RECIPES_DB);

    const [results] = await conn.query(foundRecipe, [recipeId]);

    const recipesResults = results[0];

    if (results.length === 0) {
      res.status(404).json({
        success: false,
        error: "No se ha encontrado la receta",
      });
    } else {
      res.status(200).json(recipesResults);
    }

    conn.end();
  } catch (error) {
    res.status(500).json({
      error: "Error interno del servidor",
    });
  }
});

// add recipe
server.post("/api/recetas", async (req, res) => {
  console.log(req.body);
  const { nombre, ingredientes, instrucciones } = req.body;

  if (
    !nombre ||
    !ingredientes ||
    !instrucciones ||
    nombre === "" ||
    ingredientes === "" ||
    instrucciones === ""
  ) {
    return res.status(400).json({
      success: false,
      error: "Los campos no pueden estar vacíos",
    });
  }

  try {
    const conn = await getConnection(process.env.MYSQL_RECIPES_DB);

    // insert recipe data
    const insertRecipes = `
      INSERT INTO recetas (nombre, ingredientes, instrucciones)
      VALUES (?, ?, ?)`;

    const [results] = await conn.execute(insertRecipes, [
      nombre,
      ingredientes,
      instrucciones,
    ]);

    conn.end();

    res.status(201).json({
      success: true,
      id: results.insertId,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: "Error interno del servidor al insertar la receta",
    });
  }
});

server.put("/api/recetas/:id", async (req, res) => {
  const { nombre, ingredientes, instrucciones } = req.body;

  try {
    const conn = await getConnection(process.env.MYSQL_RECIPES_DB);

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

    res.status(200).json({
      success: true,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: "Error interno del servidor al actualizar la receta",
    });
  }
});

server.delete("/api/recetas/:id", async (req, res) => {
  const deletedId = req.params.id;

  try {
    const conn = await getConnection(process.env.MYSQL_RECIPES_DB);

    const deleteRecipe = `
      DELETE FROM recetas WHERE id = ?
    `;

    const [deleteResult] = await conn.execute(deleteRecipe, [deletedId]);

    conn.end();

    res.status(200).json({
      success: true,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: "Error interno del servidor al borrar la receta",
    });
  }
});

// User registration: username, email and password
server.post("/registro", async (req, res) => {
  const { nombre, email, password } = req.body;
  console.log(req.body);

  if (!nombre) {
    res.status(400).json({
      success: false,
      error: "El nombre de usuaria no puede estar vacio",
    });
    return;
  }

  if (nombre.length < 4) {
    res.status(400).json({
      success: false,
      error: "El nombre de usuaria es demasiado corto",
    });
    return;
  }

  if (nombre.includes(" ")) {
    res.status(400).json({
      success: false,
      error: "El nombre de usuaria no puede contener espacios",
    });
    return;
  }

  if (!email) {
    res.status(400).json({
      success: false,
      error: "El email de la usuaria no puede estar vacio",
    });
    return;
  }

  if (!/\b[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}\b/i.test(email)) {
    res.status(400).json({
      success: false,
      error: "El email no es válido",
    });
    return;
  }

  if (!password) {
    res.status(400).json({
      success: false,
      error: "La contraseña no puede estar vacia",
    });
    return;
  }

  if (password.length < 8) {
    res.status(400).json({
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
    return res.status(400).json({
      success: false,
      error:
        "La contraseña debe contener al menos una letra, un número y un símbolo",
    });
  }

  const conn = await getConnection(process.env.MYSQL_USERS_DB);

  const queryCheckUserName = `
  SELECT *
    FROM usuarios
    WHERE nombre = ?
  `;

  const [existingUserNames] = await conn.query(queryCheckUserName, [nombre]);

  if (existingUserNames.length > 0) {
    res.status(400).json({
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
    res.status(400).json({
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

    res.status(201).json({
      success: true,
      token: token,
    });
  } else {
    res.status(500).json({
      success: false,
      error: "Error en el registro de usuario",
    });
  }

  conn.end();
});

server.post('/login', async (req, res) => {
  const {email, password} = req.body;

  if (!email) {
    res.status(400).json({
      success: false,
      error: "El email de la usuaria no puede estar vacio",
    });
    return;
  }

  if (!password) {
    res.status(400).json({
      success: false,
      error: "La contraseña no puede estar vacía",
    });
    return;
  }

  const conn = await getConnection(process.env.MYSQL_USERS_DB);

  const querySearchUser = `
    SELECT * FROM usuarios
      WHERE email = ?
  `;

  const [results] = await conn.query( querySearchUser, [email] );

  conn.end();

  if( results.length !== 1 ) {
    res.status(400).json({
      success:false, 
      error: "Las credenciales no son válidas"});
    return;
  }

  const userdata = results[0];

  const correctPassword = await bcrypt.compare(password, userdata.password);

  if( !correctPassword ) {
    res.status(400).json({
      success: false, 
      error: "Las credenciales no son válidas"
    });
    return;
  }

  const token = generateToken({ email });

  res.json({
    success: true, 
    token: token, 
  });

});
