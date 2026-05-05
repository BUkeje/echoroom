from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from typing import Dict, List

app = FastAPI()

rooms: Dict[str, List[dict]] = {}


@app.get("/")
def root():
    return {"message": "server is running"}


async def broadcast_to_room(room: str, message: dict):
    if room in rooms:
        for user in rooms[room]:
            await user["websocket"].send_json(message)


@app.websocket("/ws")
async def websocket_endpoint(websocket: WebSocket):
    await websocket.accept()

    room = None
    username = None

    try:
        while True:
            data = await websocket.receive_json()

            if data["type"] == "join":
                room = data["room"]
                username = data["username"]

                if room not in rooms:
                    rooms[room] = []

                rooms[room].append({
                    "username": username,
                    "websocket": websocket
                })

                print(f"{username} joined room {room}")

                await broadcast_to_room(room, {
                    "type": "system",
                    "message": f"{username} joined the room"
                })

            elif data["type"] == "message":
                message = data["message"]

                print(f"{username} in {room}: {message}")

                await broadcast_to_room(room, {
                    "type": "message",
                    "username": username,
                    "message": message
                })

            elif data["type"] in ["play", "pause", "seek", "track_change"]:
                await broadcast_to_room(room, data)

    except WebSocketDisconnect:
        print(f"{username} disconnected")

        if room and room in rooms:
            rooms[room] = [
                user for user in rooms[room]
                if user["websocket"] != websocket
            ]

            if len(rooms[room]) == 0:
                del rooms[room]
            else:
                await broadcast_to_room(room, {
                    "type": "system",
                    "message": f"{username} left the room"
                })