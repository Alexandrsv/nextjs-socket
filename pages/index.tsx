import type { NextPage } from "next";
import { useEffect, useRef, useState } from "react";
import SocketIOClient from "socket.io-client";

interface IMsg {
  user: string;
  msg: string;
}

const user = "User_" + String(new Date().getTime()).slice(-3);

const Home: NextPage = () => {
  const inputRef = useRef<HTMLInputElement>(null);

  // connected flag
  const [connected, setConnected] = useState<boolean>(false);

  // init chat and message
  const [chat, setChat] = useState<IMsg[]>([]);
  const [msg, setMsg] = useState<string>("");

  useEffect((): any => {
    // connect to socket server
    const socket = SocketIOClient("localhost:3000", { path: "/api/socketio" });

    // log socket connection
    socket.on("connect", () => {
      console.log("SOCKET CONNECTED!", socket.id);
      setConnected(true);
    });

    // update chat on new message dispatched
    socket.on("message", (message: IMsg) => {
      chat.push(message);
      setChat([...chat]);
    });

    // socket disconnet onUnmount if exists
    if (socket) return () => socket.disconnect();
  }, []);

  const sendMessage = async () => {
    if (msg) {
      // build message obj
      const message: IMsg = {
        user,
        msg,
      };

      // dispatch message to other users
      const resp = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(message),
      });

      // reset field if OK
      if (resp.ok) setMsg("");
    }

    // focus after click
    inputRef?.current?.focus();
  };

  return (
    <div className="flex flex-col w-full h-screen">
      <div className="py-4 text-white  bg-gradient-to-r from-cyan-500 to-blue-500 sticky top-0">
        <h1 className="text-center text-2xl font-semibold">
          Чат реального вермени
        </h1>
        <h2 className="mt-2 text-center">Next.js + Socket.io</h2>
      </div>
      <div className="flex flex-col flex-1 bg-gray-200">
        <div className="flex-1 p-4 font-mono">
          {chat.length ? (
            chat.map((message, i) => (
              <div key={"msg_" + i} className="mt-1">
                <span
                  className={
                    message.user === user ? "text-red-500" : "text-black"
                  }
                >
                  {message.user === user ? "Вы" : message.user}
                </span>
                : {message.msg}
              </div>
            ))
          ) : (
            <div className="text-sm text-center text-gray-400 py-6">
              Нет сообщений
            </div>
          )}
        </div>
        <div className="bg-gradient-to-l from-cyan-500 to-blue-500 p-4 h-20 sticky bottom-0">
          <div className="flex flex-row flex-1 h-full divide-gray-200 divide-x">
            <div className="pr-2 flex-1">
              <input
                ref={inputRef}
                type="text"
                value={msg}
                placeholder={connected ? "Type a message..." : "Connecting..."}
                className="w-full h-full rounded shadow border-gray-400 outline-none px-2"
                disabled={!connected}
                onChange={(e) => {
                  setMsg(e.target.value);
                }}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    sendMessage();
                  }
                }}
              />
            </div>
            <div className="flex flex-col justify-center items-stretch pl-2">
              <button
                className="bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 shadow text-sm text-white text-lg	 h-full px-5"
                onClick={sendMessage}
                disabled={!connected}
              >
                Отправить
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;
