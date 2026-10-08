const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const path = require("path");

const app = express();
const server = http.createServer(app);
const io = new Server(server);

const PORT = process.env.PORT || 3000;

// Játék fájlok
app.use(express.static(path.join(__dirname)));

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "index.html"));
});

// =========================
// BEÁLLÍTÁSOK
// =========================

const MAX_BOTS = 5;

// IDE ÍRD A SAJÁT ADMIN NEVEDET
const ADMIN_NAME = "Devid";

// =========================
// JÁTÉKOSOK
// =========================

const players = new Map();

io.on("connection", (socket) => {
  console.log("Player connected:", socket.id);

  // Játékos belép
  socket.on("join", (player) => {
    const name = String(player?.name || "Anonymous")
      .trim()
      .slice(0, 16);

    const isAdmin =
      name.toLowerCase() === ADMIN_NAME.toLowerCase();

    const newPlayer = {
      id: socket.id,
      name: isAdmin ? "🛡️ " + ADMIN_NAME : name || "Anonymous",
      x: Number(player?.x) || 2500,
      y: Number(player?.y) || 2500,
      mass: 10,
      skin: Number(player?.skin) || 0,
      admin: isAdmin,
      bot: false
    };

    players.set(socket.id, newPlayer);

    // Az új játékos megkapja a jelenlegi játékosokat
    socket.emit(
      "players",
      Array.from(players.values())
    );

    // Többieknek jelezzük az új játékost
    socket.broadcast.emit(
      "playerJoined",
      newPlayer
    );

    console.log(
      `${newPlayer.name} joined${isAdmin ? " [ADMIN]" : ""}`
    );
  });

  // Játékos mozgása
  socket.on("update", (data) => {
    const player = players.get(socket.id);

    if (!player) return;

    if (typeof data?.x === "number") {
      player.x = data.x;
    }

    if (typeof data?.y === "number") {
      player.y = data.y;
    }

    if (typeof data?.mass === "number") {
      player.mass = Math.max(1, data.mass);
    }

    if (typeof data?.skin === "number") {
      player.skin = data.skin;
    }

    io.emit("playerUpdate", player);
  });

  // Játékos kilép
  socket.on("disconnect", () => {
    const player = players.get(socket.id);

    players.delete(socket.id);

    io.emit("playerLeft", socket.id);

    if (player) {
      console.log(`${player.name} left`);
    }
  });
});

// =========================
// SZERVER INDÍTÁSA
// =========================

server.listen(PORT, "0.0.0.0", () => {
  console.log(
    `Cube.io server running on port ${PORT}`
  );
  console.log(
    `Maximum bots: ${MAX_BOTS}`
  );
  console.log(
    `const ADMIN_NAME = "TigerD";
  );
});
