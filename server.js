const express = require("express");
const path = require("path");
const app = express();
const http = require("http").createServer(app);
const io = require("socket.io")(http);

const ROOT = path.resolve(__dirname);

// Servir archivos estáticos
app.use(express.static(path.join(ROOT, "public")));

// Raíz → jugador.html
app.get("/", (req, res) => {
  res.sendFile(path.join(ROOT, "public", "jugador.html"));
});

// Variables del juego
let frase = "";
let mostradas = [];
let p1 = 0;
let p2 = 0;
let pistaActual = "";

// Funciones del panel
function generarPanel() {
  return frase.split("").map(l => (l === " " ? " " : mostradas.includes(l) ? l : "_"));
}

function enviarEstado() {
  io.emit("estado", {
    panel: generarPanel(),
    p1,
    p2
  });
  io.emit("pista", pistaActual);
}

// Conexión de Socket.IO
io.on("connection", (socket) => {
  // Enviar estado y pista al conectarse
  enviarEstado();

  // Cambiar frase
  socket.on("nuevaFrase", (nueva) => {
    frase = nueva.toUpperCase();
    mostradas = [];
    p1 = 0;
    p2 = 0;
    enviarEstado();
  });

  // Revelar letra
  socket.on("revelarLetra", (letra) => {
    letra = letra.toUpperCase();
    if (frase.includes(letra) && !mostradas.includes(letra)) {
      mostradas.push(letra);
    }
    enviarEstado();
  });

  // Sumar dinero
  socket.on("sumarDinero", (data) => {
    const { jugador, cantidad } = data;
    if (jugador === 1) p1 += cantidad;
    if (jugador === 2) p2 += cantidad;
    enviarEstado();
  });

  // Cambiar pista
  socket.on("cambiarPista", (texto) => {
    pistaActual = texto;
    io.emit("pista", pistaActual);
  });
});

const PORT = process.env.PORT || 3000;
http.listen(PORT, () => console.log(`Servidor listo en puerto ${PORT}`));
