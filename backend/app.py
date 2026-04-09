import os
from flask import Flask, request, jsonify, send_from_directory
from flask_socketio import SocketIO, emit, join_room, leave_room
from flask_cors import CORS
from datetime import datetime
from dotenv import load_dotenv

load_dotenv()

# UNIFIED SETUP: Serving static files from frontend/dist
# We use absolute path to ensure Flask finds the dist folder correctly
base_dir = os.path.abspath(os.path.dirname(__file__))
static_folder = os.path.join(base_dir, "..", "frontend", "dist")

app = Flask(__name__, static_folder=static_folder, static_url_path="")
CORS(app)

# Use eventlet for production performance and Render compatibility
socketio = SocketIO(app, cors_allowed_origins="*", async_mode="eventlet")

# State management
rooms = {}  # { room_key: [list of usernames] }
user_sid_map = {} # { sid: (username, room) }

# SERVE FRONTEND ROUTES
@app.route("/", defaults={"path": ""})
@app.route("/<path:path>")
def serve(path):
    if path != "" and os.path.exists(app.static_folder + "/" + path):
        return send_from_directory(app.static_folder, path)
    else:
        return send_from_directory(app.static_folder, "index.html")

# SOCKET EVENTS
@socketio.on("join")
def on_join(data):
    username = data.get("username")
    room = data.get("room")
    
    if not username or not room:
        return

    join_room(room)
    user_sid_map[request.sid] = (username, room)
    
    if room not in rooms:
        rooms[room] = []
    
    if username not in rooms[room]:
        rooms[room].append(username)

    # Notify room
    emit("user_joined", {"username": username, "msg": f"{username} joined the space"}, to=room)
    # Update user list
    emit("room_users", {"users": rooms[room]}, to=room)

@socketio.on("send_message")
def on_send_message(data):
    room = data.get("room")
    username = data.get("username")
    msg = data.get("msg")
    
    if not room or not msg:
        return

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
    if request.sid in user_sid_map:
        username, room = user_sid_map[request.sid]
        del user_sid_map[request.sid]
        
        if room in rooms and username in rooms[room]:
            rooms[room].remove(username)
            if not rooms[room]:
                del rooms[room]
            else:
                emit("user_left", {"username": username, "msg": f"{username} left the space"}, to=room)
                emit("room_users", {"users": rooms[room]}, to=room)

if __name__ == "__main__":
    port = int(os.environ.get("PORT", 5000))
    socketio.run(app, host="0.0.0.0", port=port, debug=False)