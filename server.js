const express = require("express");
const app = express();
const http = require("http").createServer(app);
const io = require("socket.io")(http);

app.use(express.static("public"));

let frase = "";
let mostradas = [];
let p1 = 0;
let p2 = 0;

function generarPanel() {
  return frase.split("").map(l => {
    if (l === " ") return " ";
    return mostradas.includes(l) ? l : "_";
  });
}

function enviarEstado() {
  io.emit("estado", {
    panel: generarPanel(),
    p1,
    p2
  });
}

io.on("connection", (socket) => {
  enviarEstado();

  socket.on("nuevaFrase", (nueva) => {
    frase = nueva.toUpperCase();
    mostradas = [];
    p1 = 0;
    p2 = 0;
    enviarEstado();
  });

  socket.on("revelarLetra", (letra) => {
    letra = letra.toUpperCase();
    if (frase.includes(letra) && !mostradas.includes(letra)) {
      mostradas.push(letra);
    }
    enviarEstado();
  });

  socket.on("sumarDinero", (data) => {
  const { jugador, cantidad } = data;

  if (jugador === 1) p1 += cantidad;
  if (jugador === 2) p2 += cantidad;

  enviarEstado();
  });
});

http.listen(3000, () => console.log("Servidor listo"));