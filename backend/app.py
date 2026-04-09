import os
from flask import Flask, request
from flask_socketio import SocketIO, emit, join_room, leave_room
from flask_cors import CORS
from datetime import datetime
from dotenv import load_dotenv

load_dotenv()

app = Flask(__name__)
CORS(app)

# Part 1.2: Update SocketIO init
# required for Render deployment
socketio = SocketIO(app, cors_allowed_origins="*", async_mode="eventlet")

# Part 1.3: Track connected users per room
rooms = {}  # { room_key: [list of usernames] }
user_sid_map = {} # { sid: {"username": "...", "room": "..."} }

# Part 1.7: Health check route
@app.route("/")
def index():
    return "Chat server running"

@socketio.on("join")
def on_join(data):
    username = data.get("username")
    room = data.get("room")
    
    if not username or not room:
        return

    join_room(room)
    
    # Store user tracking info
    user_sid_map[request.sid] = {"username": username, "room": room}
    
    if room not in rooms:
        rooms[room] = []
    
    if username not in rooms[room]:
        rooms[room].append(username)
    
    # Part 1.4: Emit events
    emit("user_joined", {"username": "System", "msg": f"{username} joined the chat"}, to=room)
    emit("room_users", {"users": rooms[room]}, to=room)

@socketio.on("send_message")
def on_send_message(data):
    room = data.get("room")
    username = data.get("username")
    msg = data.get("msg")
    
    if not room or not msg:
        return

    # Part 1.5: Message payload
    payload = {
        "username": username,
        "msg": msg,
        "timestamp": datetime.now().strftime("%H:%M")
    }
    emit("receive_message", payload, to=room)

@socketio.on("typing")
def on_typing(data):
    room = data.get("room")
    username = data.get("username")
    is_typing = data.get("is_typing")
    emit("display_typing", {"username": username, "is_typing": is_typing}, to=room, include_self=False)

@socketio.on("disconnect")
def on_disconnect():
    # Part 1.6: Handle disconnect using request.sid
    if request.sid in user_sid_map:
        user_info = user_sid_map.pop(request.sid)
        username = user_info["username"]
        room = user_info["room"]
        
        if room in rooms and username in rooms[room]:
            rooms[room].remove(username)
            emit("user_left", {"username": "System", "msg": f"{username} left the chat"}, to=room)
            emit("room_users", {"users": rooms[room]}, to=room)
            
            # Cleanup room if empty
            if not rooms[room]:
                del rooms[room]

# Part 1.10: Read port from environment
port = int(os.environ.get("PORT", 5000))
if __name__ == "__main__":
    socketio.run(app, host="0.0.0.0", port=port)