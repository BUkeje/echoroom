import { useState } from "react";
import AudioPlayer from "./components/AudioPlayer";

function App() {
  const [username, setUsername] = useState("");
  const [room, setRoom] = useState("");
  const [connected, setConnected] = useState(false);
  const [socket, setSocket] = useState(null);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [playbackEvent, setPlaybackEvent] = useState(null);

  function joinRoom() {
    if (!username || !room) {
      alert("Enter both fields");
      return;
    }

    const ws = new WebSocket("ws://localhost:8000/ws");

    ws.onopen = () => {
      console.log("Connected to server");

      ws.send(
        JSON.stringify({
          type: "join",
          username,
          room,
        })
      );

      setConnected(true);
    };

    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      console.log("Message from server:", data);

      if (data.type === "system" || data.type === "message") {
        setMessages((prev) => [...prev, data]);
      }

      if (
        data.type === "play" ||
        data.type === "pause" ||
        data.type === "seek" ||
        data.type === "track_change"
      ) {
        setPlaybackEvent(data);
      }
    };

    setSocket(ws);
  }

  function sendMessage() {
    if (!input.trim() || !socket) return;

    socket.send(
      JSON.stringify({
        type: "message",
        username,
        room,
        message: input,
      })
    );

    setInput("");
  }

  if (!connected) {
    return (
      <div style={{ textAlign: "center", marginTop: "50px" }}>
        <h1>🎧 EchoRoom</h1>

        <input
          placeholder="Enter your name"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
        />

        <br />

        <input
          placeholder="Room ID"
          value={room}
          onChange={(e) => setRoom(e.target.value)}
        />

        <br />

        <button onClick={joinRoom}>Join Room</button>
      </div>
    );
  }

  return (
    <div style={{ textAlign: "center", marginTop: "50px" }}>
      <h2>Room: {room}</h2>

      <div
        style={{
          border: "1px solid #ccc",
          width: "400px",
          height: "300px",
          margin: "20px auto",
          padding: "10px",
          overflowY: "scroll",
          textAlign: "left",
        }}
      >
        {messages.map((msg, i) => (
          <div key={i} style={{ marginBottom: 6 }}>
            {msg.type === "system" ? (
              <em style={{ color: "gray" }}>{msg.message}</em>
            ) : (
              <span>
                <strong>{msg.username}:</strong> {msg.message}
              </span>
            )}
          </div>
        ))}
      </div>

      <input
        value={input}
        onChange={(e) => setInput(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter") sendMessage();
        }}
        placeholder="Type a message..."
      />

      <button onClick={sendMessage}>Send</button>

      <AudioPlayer socket={socket} playbackEvent={playbackEvent} />
    </div>
  );
}

export default App;
