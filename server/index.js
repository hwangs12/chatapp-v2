const express = require("express");
const app = express();
const http = require("http");
const server = http.createServer(app);
const { Server } = require("socket.io");
const io = new Server(server, {
	cors: {
		origin: "http://localhost:3000",
		methods: ["GET", "POST"],
	},
});

io.on("connection", (socket) => {
	console.log("a user connected");

	socket.on("registerUser", (payload) => {
		console.log("user has entered the chat: ", payload.username);
		socket.emit("userToSelf", { registeredUser: payload.username });
	});
	socket.on("joinroom", (payload) => {
		socket.join(payload.room);
		socket.emit("welcome", {
			channelFromServer: payload.room,
			registeredUsername: payload.signedInUser,
		});
		socket.on("message", ({ signedInUser, message }) => {
			io.to(payload.room).emit("message", {
				messageFromServer: message,
				messageSender: signedInUser,
			});
		});
	});
	socket.on("disconnect", () => {
		console.log("User has left");
	});
});

server.listen(5000, () => {
	console.log("listening on *:5000");
});
