// Import the Express framework
const express = require("express");
// Create an Express application
const app = express();
// Create an HTTP server using the Express application
const server = require("http").Server(app);
// Generate unique IDs (UUIDs)
const { v4: uuidv4 } = require("uuid");
// Set the view engine to EJS (Embedded JavaScript)
app.set("view engine", "ejs");
// Set up Socket.IO with CORS configuration
const io = require("socket.io")(server, {
  cors: {
    origin: '*'
  }
});
// Import the ExpressPeerServer from the Peer library
const { ExpressPeerServer } = require("peer");
// Options for the ExpressPeerServer
const opinions = {
  debug: true,
}

// Set up the ExpressPeerServer at the "/peerjs" path
app.use("/peerjs", ExpressPeerServer(server, opinions));
// Serve static files from the "public" directory
app.use(express.static("public"));

// Redirect the root URL to a randomly generated room
app.get("/", (req, res) => {
  res.redirect(`/${uuidv4()}`);
});

// Render the "room" view with the provided room ID
app.get("/:room", (req, res) => {
  res.render("room", { roomId: req.params.room });
});

// Event handler for a Socket.IO connection
io.on("connection", (socket) => {
  // Event handler for joining a room
  socket.on("join-room", (roomId, userId, userName) => {
    // Join the specified room
    socket.join(roomId);
    // Broadcast a "user-connected" event after a short delay
    setTimeout(() => {
      socket.to(roomId).broadcast.emit("user-connected", userId);
    }, 1000);
    // Event handler for receiving and broadcasting messages
    socket.on("message", (message) => {
      io.to(roomId).emit("createMessage", message, userName);
    });

    socket.on('disconnect', () => {
      socket.broadcast.emit('clear-grid');
  });
  });
});

// Start the server, listening on the specified port or defaulting to 3030
server.listen(process.env.PORT || 3030);
















// const muteButton = document.querySelector("#muteButton");
// const stopVideo = document.querySelector("#stopVideo");
// muteButton.addEventListener("click", () => {
//   const enabled = myVideoStream.getAudioTracks()[0].enabled;
//   if (enabled) {
//     myVideoStream.getAudioTracks()[0].enabled = false;
//     html = `<i class="fas fa-microphone-slash"></i>`;
//     muteButton.classList.toggle("background__red");
//     muteButton.innerHTML = html;
//   } else {
//     myVideoStream.getAudioTracks()[0].enabled = true;
//     html = `<i class="fas fa-microphone"></i>`;
//     muteButton.classList.toggle("background__red");
//     muteButton.innerHTML = html;
//   }
// });

// stopVideo.addEventListener("click", () => {
//   const enabled = myVideoStream.getVideoTracks()[0].enabled;
//   if (enabled) {
//     myVideoStream.getVideoTracks()[0].enabled = false;
//     html = `<i class="fas fa-video-slash"></i>`;
//     stopVideo.classList.toggle("background__red");
//     stopVideo.innerHTML = html;
//   } else {
//     myVideoStream.getVideoTracks()[0].enabled = true;
//     html = `<i class="fas fa-video"></i>`;
//     stopVideo.classList.toggle("background__red");
//     stopVideo.innerHTML = html;
//   }
// });