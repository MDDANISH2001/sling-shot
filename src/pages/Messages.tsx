import React, { useState, useEffect } from "react";
import { getSocket, initializeSocket } from "../utils/socket";

interface MessageData {
  id: string;
  userName: string;
  message: string;
  imageUrl: string;
  createdAt: string;
}

export const Messages: React.FC = () => {
  const [messages, setMessages] = useState<MessageData[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    let socket = getSocket();
    
    // If socket doesn't exist, initialize it
    if (!socket || !socket.connected) {
      console.log('Initializing socket in Messages component');
      socket = initializeSocket();
    }

    // Wait for connection if not connected
    const initSocket = () => {
      if (!socket?.connected) {
        const checkConnection = setInterval(() => {
          if (socket?.connected) {
            clearInterval(checkConnection);
            socket.emit("get-messages");
          }
        }, 100);
        
        // Timeout after 5 seconds
        setTimeout(() => {
          clearInterval(checkConnection);
          if (!socket?.connected) {
            console.error('Socket connection timeout');
            setLoading(false);
          }
        }, 5000);
        return;
      }
      
      // Request all messages on component mount
      socket.emit("get-messages");
    };
    
    initSocket();


    // Listen for all messages response
    const handleAllMessages = (data: { messages: MessageData[] }) => {
      setMessages(data.messages);
      setLoading(false);
    };

    // Listen for new messages in real-time
    const handleReceiveMessage = (newMessage: MessageData) => {
      console.log('newMessage :', newMessage);
      setMessages((prevMessages) => [newMessage, ...prevMessages]);
    };

    // Handle errors
    const handleError = (error: any) => {
      console.error("Socket error:", error);
      setLoading(false);
    };

    socket.on("all-messages", handleAllMessages);
    socket.on("receive-message", handleReceiveMessage);
    socket.on("error", handleError);

    return () => {
      socket.off("all-messages", handleAllMessages);
      socket.off("receive-message", handleReceiveMessage);
      socket.off("error", handleError);
    };
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-6 flex items-center justify-center">
        <div className="flex flex-col items-center">
          <svg
            className="animate-spin h-12 w-12 text-indigo-600 mb-4"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
              fill="none"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            />
          </svg>
          <p className="text-gray-700 font-medium">Loading messages...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-6">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-4xl font-bold text-gray-800 mb-8 text-center">
          Messages Feed
        </h1>

        {messages.length === 0 ? (
          <div className="bg-white rounded-lg shadow-lg p-12 text-center">
            <svg
              className="w-16 h-16 mx-auto text-gray-400 mb-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
              />
            </svg>
            <p className="text-gray-600 text-lg">
              No messages yet. Be the first to share!
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className="bg-white rounded-lg shadow-md hover:shadow-lg transition overflow-hidden"
              >
                <div className="p-6">
                  <div className="flex gap-4">
                    {/* User Image */}
                    <div className="flex-shrink-0">
                      <img
                        src={msg.imageUrl}
                        alt={msg.userName}
                        className="w-16 h-16 rounded-full object-cover border-2 border-indigo-200"
                      />
                    </div>

                    {/* Message Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-baseline gap-2 mb-2">
                        <h3 className="text-lg font-bold text-gray-800">
                          {msg.userName}
                        </h3>
                        <span className="text-xs text-gray-500">
                          {new Date(msg.createdAt).toLocaleString()}
                        </span>
                      </div>
                      <p className="text-gray-700 leading-relaxed break-words">
                        {msg.message}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
