import { useRef, useState, useEffect } from "react";

export default function AudioPlayer() {
  const audioRef = useRef(null);

  const tracks = [
    {
      name: "Mock Song 1",
      src: "/audio/song1.wav",
    },
    {
      name: "Mock Song 2",
      src: "/audio/song2.wav",
    },
  ];

  const [currentTrackIndex, setCurrentTrackIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);

  const currentTrack = tracks[currentTrackIndex];

  async function togglePlay() {
    if (!audioRef.current) return;

    try {
      if (isPlaying) {
        audioRef.current.pause();
        setIsPlaying(false);
      } else {
        await audioRef.current.play();
        setIsPlaying(true);
      }
    } catch (error) {
      console.error("Audio failed to play:", error);
      alert("Audio file could not be played. Check your public/audio folder.");
    }
  }

  function nextTrack() {
    if (currentTrackIndex === tracks.length - 1) {
      // last song → stop playback
      setIsPlaying(false);
      return;
    }

    setCurrentTrackIndex(currentTrackIndex + 1);
    setIsPlaying(true);
  }

  function previousTrack() {
    if (currentTrackIndex === 0) return;

    setCurrentTrackIndex(currentTrackIndex - 1);
    setIsPlaying(true);
  }

  // Auto-play when track changes
  useEffect(() => {
    if (audioRef.current && isPlaying) {
      audioRef.current.play().catch(() => {});
    }
  }, [currentTrackIndex]);

  return (
    <div
      style={{
        marginTop: "30px",
        borderTop: "1px solid #ddd",
        paddingTop: "20px",
      }}
    >
      <h2>🎵 Audio Player</h2>

      <p>
        Now Playing: <strong>{currentTrack.name}</strong>
      </p>

      <audio ref={audioRef} src={currentTrack.src} onEnded={nextTrack} />

      <div style={{ display: "flex", gap: "10px", justifyContent: "center" }}>
        <button onClick={previousTrack}>Previous</button>

        <button onClick={togglePlay}>{isPlaying ? "Pause" : "Play"}</button>

        <button onClick={nextTrack}>Next</button>
      </div>
    </div>
  );
}
