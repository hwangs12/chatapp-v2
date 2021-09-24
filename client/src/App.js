import React, { useState, useEffect } from "react";

import io from "socket.io-client";

import "./App.css";

const socket = io("http://localhost:5000");

export const App = () => {
	const [message, setMessage] = useState("");
	const [messages, setMessages] = useState([]);
	const [username, setUsername] = useState("");
	const [signedInUser, setSignedInUser] = useState("");
	const [room, setRoom] = useState("");
	const [userInRoom, setUserInRoom] = useState({ usrname: "", roomname: "" });

	useEffect(() => {
		socket.on("message", ({ messageFromServer, messageSender }) => {
			setMessages([...messages, { messageFromServer, messageSender }]);
		});
	}, [messages]);

	useEffect(() => {
		socket.on("userToSelf", ({ registeredUser }) => {
			setSignedInUser(registeredUser);
		});
	}, [signedInUser]);

	useEffect(() => {
		socket.on("welcome", ({ channelFromServer, registeredUsername }) => {
			setUserInRoom({
				usrname: registeredUsername,
				roomname: channelFromServer,
			});
		});
	}, [userInRoom]);

	const sendMessage = (e) => {
		e.preventDefault();
		socket.emit("message", { message, signedInUser });
		setMessage("");
	};

	const handleMessage = (e) => {
		setMessage(e.target.value);
	};

	const handleUsername = (e) => {
		setUsername(e.target.value);
	};

	const registerUsername = (e) => {
		e.preventDefault();
		socket.emit("registerUser", { username });
		setUsername("");
	};

	const submitRoom = (e) => {
		e.preventDefault();
		socket.emit("joinroom", { room, signedInUser });
		setRoom("");
	};

	const handleRoom = (e) => {
		setRoom(e.target.value);
	};

	return (
		<div className="chatWithAliens">
			{signedInUser.length === 0 && (
				<div className="signFormContainer">
					<h1>Chat Aliens</h1>
					<div className="registerFormContainer">
						<form onSubmit={registerUsername}>
							<input
								type="text"
								name="username"
								value={username}
								onChange={handleUsername}
								placeholder="username..."
							/>
							<button type="submit">REGISTER</button>
						</form>
					</div>
				</div>
			)}
			{signedInUser.length !== 0 && userInRoom.roomname.length === 0 && (
				<div>
					<h1>{`Welcome ${signedInUser}. Please pick a channel!`}</h1>

					<div className="roomContainer">
						<form onSubmit={submitRoom}>
							<input
								type="text"
								name="room"
								value={room}
								onChange={handleRoom}
								placeholder="channel..."
							/>
							<button type="submit">ENTER</button>
						</form>
					</div>
				</div>
			)}
			{userInRoom.roomname.length > 0 && (
				<div>
					<div className="welcomeMsg">
						<h1>{`Hi ${userInRoom.usrname}. You are now in Channel ${userInRoom.roomname}.`}</h1>
						<h3>
							Send any message to see if anyone's here or invite
							your friend to your channel :)
						</h3>
					</div>

					<div className="chatFormContainer">
						<form onSubmit={sendMessage}>
							<input
								type="text"
								name="message"
								value={message}
								onChange={handleMessage}
								placeholder="send message..."
							/>
							<button type="submit">SEND</button>
						</form>
					</div>
					<div className="chatContainer">
						<ul className="chatList">
							{messages.map((message, index) => {
								const {
									messageFromServer: msg,
									messageSender: sender,
								} = message;
								return (
									<li key={index}>
										<h3>{`From ${sender} : ${msg}`}</h3>
									</li>
								);
							})}
						</ul>
					</div>
				</div>
			)}
		</div>
	);
};

export default App;
