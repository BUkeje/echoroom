import wave
import math
import struct
import os

os.makedirs("public/audio", exist_ok=True)

def make_tone(filename, frequency, duration=5, sample_rate=44100):
    with wave.open(filename, "w") as file:
        file.setnchannels(1)
        file.setsampwidth(2)
        file.setframerate(sample_rate)

        for i in range(int(duration * sample_rate)):
            value = int(32767 * 0.3 * math.sin(2 * math.pi * frequency * i / sample_rate))
            file.writeframes(struct.pack("<h", value))

make_tone("public/audio/song1.wav", 440)
make_tone("public/audio/song2.wav", 660)

print("Created song1.wav and song2.wav in public/audio")