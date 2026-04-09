import eventlet
eventlet.monkey_patch()
import os
from flask import Flask, request
from flask_socketio import SocketIO, emit, join_room, leave_room
from flask_cors import CORS
from datetime import datetime
from dotenv import load_dotenv

load_dotenv()

app = Flask(__name__)
CORS(app)

# Use eventlet for production performance and Render compatibility
socketio = SocketIO(app, cors_allowed_origins="*", async_mode="eventlet")

# State management
rooms = {}  # { room_key: [list of usernames] }
user_sid_map = {} # { sid: {"username": "...", "room": "..."} }

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
    user_sid_map[request.sid] = {"username": username, "room": room}
    
    if room not in rooms:
        rooms[room] = []
    
    if username not in rooms[room]:
        rooms[room].append(username)
    
    emit("user_joined", {"username": "System", "msg": f"{username} joined the chat"}, to=room)
    emit("room_users", {"users": rooms[room]}, to=room)

@socketio.on("send_message")
def on_send_message(data):
    room = data.get("room")
    username = data.get("username")
    msg = data.get("msg")
    msg_type = data.get("type", "text") # Default to text
    
    if not room or not msg:
        return

    payload = {
        "username": username,
        "msg": msg,
        "type": msg_type,
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
    if request.sid in user_sid_map:
        user_info = user_sid_map.pop(request.sid)
        username = user_info["username"]
        room = user_info["room"]
        
        if room in rooms and username in rooms[room]:
            rooms[room].remove(username)
            emit("user_left", {"username": "System", "msg": f"{username} left the chat"}, to=room)
            emit("room_users", {"users": rooms[room]}, to=room)
            
            if not rooms[room]:
                del rooms[room]

if __name__ == "__main__":
    port = int(os.environ.get("PORT", 5000))
    socketio.run(app, host="0.0.0.0", port=port)