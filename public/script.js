// Connect to the default namespace
const socket = io();
// Get the video grid element
const videoGrid = document.getElementById("video-grid");
// Create a video element for the local user
const myVideo = document.createElement("video");
// Get the element that shows the chat
const showChat = document.querySelector("#showChat");
// Get the back button element
const backBtn = document.querySelector(".header__back");
const screenshare = document.querySelector("#shareScreen");
let screenStream; // Declare screenStream variable

// Mute the local user's video
myVideo.muted = true;

screenshare.addEventListener('click', () => {
  if (!screenStream) {
    startScreenSharing();
  } else {
    stopScreenSharing();
  }
});

// Function to start screen sharing
const startScreenSharing = () => {
  

  // Use the navigator.mediaDevices.getDisplayMedia() API to access the user's screen
  navigator.mediaDevices.getDisplayMedia({ video: true })
    .then((screenStream) => {
      // Replace the current video stream with the screen sharing stream
      replaceStream(screenStream);

      // Notify other participants about the screen sharing
      for (const connection of Object.values(peer.connections)) {
        // Call each participant and send the screen sharing stream
        const call = peer.call(connection[0].peer, screenStream);
        const video = document.createElement("video");

        // Add the other user's video to the video grid
        call.on("stream", (userVideoStream) => {
          addVideoStream(video, userVideoStream);
        });
      }
    })
    .catch((error) => {
      // Handle errors, such as when the user denies screen access
      console.error("Error accessing screen:", error);
    });
};

// Function to stop screen sharing
const stopScreenSharing = () => {


  
    videoGrid.removeChild(newStream)
};

// Function to replace the current stream with a new stream
const replaceStream = (newStream) => {
  myVideo.srcObject = newStream;
  myVideoStream = newStream;
};



socket.on('clear-grid', () => {
  videoGrid.removeChild(videoGrid.firstElementChild);
});





// Event listener for the back button
backBtn.addEventListener("click", () => {
  // Show the video grid and hide the chat window
  document.querySelector(".main__left").style.display = "flex";
  document.querySelector(".main__left").style.flex = "1";
  document.querySelector(".main__right").style.display = "none";
  document.querySelector(".header__back").style.display = "none";
});

// Function to go back to the video view
function backToVideo() {
  // Show the video grid and hide the chat window
  document.querySelector(".main__left").style.display = "flex";
  document.querySelector(".main__left").style.flex = "1";
  document.querySelector(".main__right").style.display = "none";
  document.querySelector(".header__back").style.display = "none";
}

// Event listener for showing the chat window
showChat.addEventListener("click", () => {
  // Show the chat window and hide the video grid
  document.querySelector(".main__right").style.display = "flex";
  document.querySelector(".main__right").style.flex = "1";
  document.querySelector(".main__left").style.display = "none";
  document.querySelector(".header__back").style.display = "block";
});

// Prompt the user to enter their name
const user = prompt("Enter your name");

// Create a Peer object
var peer = new Peer({
  path: '/peerjs',
  host: window.location.hostname,  // Dynamically set the host based on the current environment
  port: location.protocol === 'https:' ? 443 : 3030,  // Adjust the port based on the protocol
  debug: 3
});

let myVideoStream;

// Get user's audio and video stream
navigator.mediaDevices
  .getUserMedia({
    audio: true,
    video: true,
  })
// navigator.mediaDevices.getDisplayMedia({ audio: true, video: true })
  .then((stream) => {
    // Save the local user's stream
    myVideoStream = stream;
    // Add the local user's video to the video grid
    addVideoStream(myVideo, stream);

    // Handle incoming calls from other users
    peer.on("call", (call) => {
      console.log('someone call me');
      // Answer the call and send the local user's stream
      
      call.answer(stream);
      const video = document.createElement("video");
      // Add the other user's video to the video grid
      call.on("stream", (userVideoStream) => {
        addVideoStream(video, userVideoStream);
      });
    });

    // Notify the server when a new user connects
    socket.on("user-connected", (userId) => {
      connectToNewUser(userId, stream);
    });
  });

// Function to connect to a new user
const connectToNewUser = (userId, stream) => {
  console.log('I call someone' + userId);
  const call = peer.call(userId, stream);
  const video = document.createElement("video");
  call.on("stream", (userVideoStream) => {
    addVideoStream(video, userVideoStream);
  });
};

// Event handler when the Peer connection is open
peer.on("open", (id) => {
  console.log('my id is' + id);
  // Notify the server that the local user has joined the room
  socket.emit("join-room", ROOM_ID, id, user);
});

// Function to add a video stream to the video grid
const addVideoStream = (video, stream) => {
  video.srcObject = stream;
  video.addEventListener("loadedmetadata", () => {
    video.play();
    videoGrid.append(video);
  });
};

// Get the chat input, send button, and messages elements
let text = document.querySelector("#chat_message");
let send = document.getElementById("send");
let messages = document.querySelector(".messages");

// Event listener for sending a message
send.addEventListener("click", (e) => {
  if (text.value.length !== 0) {
    // Emit a message event to the server
    socket.emit("message", text.value);
    // Clear the chat input
    text.value = "";
  }
});

// Event listener for sending a message when the Enter key is pressed
text.addEventListener("keydown", (e) => {
  if (e.key === "Enter" && text.value.length !== 0) {
    // Emit a message event to the server
    socket.emit("message", text.value);
    // Clear the chat input
    text.value = "";
  }
});

// Get the invite button element
const inviteButton = document.querySelector("#inviteButton");

// Event listener for inviting others to the room
inviteButton.addEventListener("click", (e) => {
  // Prompt the user to copy and share the room link
  prompt(
    "Copy this link and send it to people you want to meet with",
    window.location.href
  );
});

// Event listener for receiving and displaying messages from the server
socket.on("createMessage", (message, userName) => {
  messages.innerHTML =
    messages.innerHTML +
    `<div class="message">
        <b><i class="far fa-user-circle"></i> <span> ${userName === user ? "me" : userName
    }</span> </b>
        <span>${message}</span>
    </div>`;
});








// User A's Actions:

// User A joins the room, sets up their own video and audio streams using navigator.mediaDevices.getUserMedia.
// User A sets up an event listener for incoming calls using peer.on("call", ...). This allows User A to handle calls initiated by other users.
// User B's Actions:

// User B joins the room and obtains their own video and audio streams.
// User B initiates a call to User A using peer.call(userId, stream). This call includes User B's stream.
// User A's "call" event listener is triggered, and User A answers the call using call.answer(stream). At this point, User A's stream is sent as the answer.
// User B's call event handler receives the stream from User A, and call.on("stream", ...) is triggered on User B's end.
// Inside the callback of call.on("stream", ...), User B's video stream is added to the video grid on User A's side.




