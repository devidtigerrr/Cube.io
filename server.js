const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const path = require("path");

const app = express();
const server = http.createServer(app);
const io = new Server(server);

const PORT = process.env.PORT || 3000;

app.use(express.static(path.join(__dirname)));

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "index.html"));
});

const players = new Map();

io.on("connection", (socket) => {
  console.log("Player connected:", socket.id);

  socket.on("join", (player) => {
    players.set(socket.id, {
      id: socket.id,
      name: String(player?.name || "Anonymous").slice(0, 16),
      x: Number(player?.x) || 2500,
      y: Number(player?.y) || 2500,
      mass: 10,
      skin: Number(player?.skin) || 0
    });

    socket.emit("players", Array.from(players.values()));
    socket.broadcast.emit("playerJoined", players.get(socket.id));
  });

  socket.on("update", (data) => {
    const player = players.get(socket.id);
    if (!player) return;

    if (typeof data.x === "number") player.x = data.x;
    if (typeof data.y === "number") player.y = data.y;
    if (typeof data.mass === "number") player.mass = data.mass;

    socket.broadcast.emit("playerUpdate", player);
  });

  socket.on("disconnect", () => {
    players.delete(socket.id);
    io.emit("playerLeft", socket.id);
    console.log("Player disconnected:", socket.id);
  });
});

server.listen(PORT, "0.0.0.0", () => {
  console.log(`Cube.io server running on port ${PORT}`);
});
