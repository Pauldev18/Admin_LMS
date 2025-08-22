// src/pages/Messages.jsx
import { useState, useEffect, useRef, useMemo } from "react";
import {
  FiSend,
  FiPaperclip,
  FiImage,
  FiSmile,
  FiMessageSquare,
  FiDownload,
  FiX,
} from "react-icons/fi";
import EmojiPicker from "emoji-picker-react";
import useChatSocket from "../API/useChatSocket";
import {
  createOrGetChat,          // (userIdA, userIdB) => roomId
  // getAllUsersByInstructor, // KHÔNG dùng nữa
  getAllUsers,              // GET /api/users?currentUserId=<id>
  getChatById,              // GET /api/messages/{chatId}
  getMessagesByChatId,      // GET /api/messages/{chatId}/messages
  uploadFile,               // POST /api/upload
} from "../API/chatApi";
import { useLocation, useNavigate, useSearchParams } from "react-router-dom";

/* --------- Lấy auth từ localStorage (key: auth) --------- */
function readAuthFromLocal() {
  try {
    const raw = localStorage.getItem("auth");
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export default function Messages() {
  const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:8080";
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();

  /* --------- Auth / Current user --------- */
  const [auth, setAuth] = useState(() => readAuthFromLocal());
  useEffect(() => {
    const onStorage = (e) => {
      if (e.key === "auth") setAuth(readAuthFromLocal());
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);
  const currentUserLMS = useMemo(() => auth?.user || null, [auth]);

  /* --------- State chính --------- */
  const [chats, setChats] = useState([]);                 // danh sách user ở sidebar
  const [allUsersIndex, setAllUsersIndex] = useState({}); // index nhanh userId->user
  const [selectedChat, setSelectedChat] = useState(null); // đối tác đang chat {id,name,profilePicture}
  const [currentChatId, setCurrentChatId] = useState(null); // id phòng chat
  const [messages, setMessages] = useState([]);
  const [message, setMessage] = useState("");
  const [previewFile, setPreviewFile] = useState(null);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [partnerTyping, setPartnerTyping] = useState(false);
  const [nguoiNhanId, setNguoiNhanId] = useState("");

  /* --------- Refs --------- */
  const fileInputRef = useRef(null);
  const imageInputRef = useRef(null);
  const messagesWrapRef = useRef(null);
  const subRef = useRef(null);
  const typingSubRef = useRef(null);

  /* --------- Socket hook --------- */
  const { subscribe, subscribeTyping, send, unsubscribe, unsubscribeTyping } =
    useChatSocket((msg) => setMessages((prev) => [...prev, msg]), currentUserLMS);

  /* --------- Bảo vệ: chưa đăng nhập -> /login --------- */
  useEffect(() => {
    if (!currentUserLMS) navigate("/login", { replace: true });
  }, [currentUserLMS, navigate]);

  /* --------- Tải danh sách users cho sidebar + index --------- */
  useEffect(() => {
    if (!currentUserLMS?.id) return;

    (async () => {
      try {
        // chỉ dùng getAllUsers(currentUserId)
        const { data } = await getAllUsers(currentUserLMS.id);
        const list = (data || []).map((u) => ({
          id: u.id,
          name: u.name,
          profilePicture: u.avatar,
        }));
        setChats(list);

        const idx = {};
        list.forEach((u) => (idx[String(u.id)] = u));
        setAllUsersIndex(idx);
      } catch (e) {
        console.error("getAllUsers failed:", e);
        setChats([]);
        setAllUsersIndex({});
      }
    })();
  }, [currentUserLMS]);

  /* --------- Auto scroll khi có message mới --------- */
  useEffect(() => {
    const wrap = messagesWrapRef.current;
    if (wrap) wrap.scrollTo({ top: wrap.scrollHeight, behavior: "smooth" });
  }, [messages]);

  /* --------- Mở phòng theo ?chatId= --------- */
  useEffect(() => {
    const urlChatId = searchParams.get("chatId");
    if (!urlChatId || !currentUserLMS?.id) return;
    if (String(currentChatId) === String(urlChatId)) return;
    openRoomById(urlChatId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams, currentUserLMS, allUsersIndex]);

  /* --------- Hàm mở phòng theo roomId --------- */
  const openRoomById = async (roomId) => {
    try {
      const { data: chat } = await getChatById(roomId);
      if (!chat) return;

      // tuỳ backend, ưu tiên sender/receiver; fallback user1/user2
      const sId = chat.senderId ?? chat.user1Id;
      const rId = chat.receiverId ?? chat.user2Id;

      const partnerId =
        String(sId) === String(currentUserLMS.id) ? rId : sId;

      const partner =
        allUsersIndex[String(partnerId)] || {
          id: partnerId,
          name:
            String(sId) === String(partnerId)
              ? chat.senderName || `User ${partnerId}`
              : chat.receiverName || `User ${partnerId}`,
          avatar: null,
        };

      setSelectedChat({
        id: partner.id,
        name: partner.name,
        profilePicture: partner.avatar,
      });
      setNguoiNhanId(partner.id);
      setCurrentChatId(chat.id);

      const res = await getMessagesByChatId(chat.id);
      setMessages(res.data || []);

      if (subRef.current) {
        unsubscribe(subRef.current);
        subRef.current = null;
      }
      if (typingSubRef.current) {
        unsubscribeTyping(typingSubRef.current);
        typingSubRef.current = null;
      }
      subRef.current = subscribe(chat.id);
      typingSubRef.current = subscribeTyping(chat.id, (senderId) => {
        if (String(senderId) !== String(currentUserLMS.id)) {
          setPartnerTyping(true);
          setTimeout(() => setPartnerTyping(false), 3000);
        }
      });
    } catch (e) {
      console.error("Không mở được phòng theo chatId:", e);
    }
  };

  /* --------- Cleanup khi unmount --------- */
  useEffect(() => {
    return () => {
      if (subRef.current) {
        unsubscribe(subRef.current);
        subRef.current = null;
      }
      if (typingSubRef.current) {
        unsubscribeTyping(typingSubRef.current);
        typingSubRef.current = null;
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /* --------- Chọn user ở sidebar -> lấy/ tạo room và mở --------- */
  const handleSelectChat = async (chatUser) => {
    try {
      const roomId = await createOrGetChat(currentUserLMS.id, chatUser.id);
      const url = new URL(window.location.href);
      url.searchParams.set("chatId", roomId);
      navigate(
        { pathname: location.pathname, search: url.search, hash: location.hash },
        { replace: false }
      );
      await openRoomById(roomId);
    } catch (e) {
      console.error("Lỗi handleSelectChat:", e);
    }
  };

  /* --------- Gửi tín hiệu typing --------- */
  useEffect(() => {
    if (!message || !selectedChat || !currentChatId) return;
    const timeout = setTimeout(() => {
      send(
        {
          chatId: currentChatId,
          senderId: currentUserLMS.id,
          receiverId: selectedChat.id,
          type: "TYPING",
        },
        "/app/chat.typing"
      );
    }, 120);
    return () => clearTimeout(timeout);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [message]);

  /* --------- Upload file --------- */
  const handleFileUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setPreviewFile({
      file,
      previewUrl: URL.createObjectURL(file),
      type: file.type || "application/octet-stream",
    });
    e.target.value = null;
  };

  /* --------- Gửi message --------- */
  const handleSendMessage = async () => {
    if (!selectedChat || !currentChatId) return;

    let type = "TEXT";
    let content = message;
    let fileUrl = null;

    if (previewFile) {
      const { data } = await uploadFile(previewFile.file);
      fileUrl = data;
      content = previewFile.file.name;
      type = previewFile.type.startsWith("image/") ? "IMAGE" : "FILE";
    }

    send({
      chatId: currentChatId,
      senderId: currentUserLMS.id,
      receiverId: selectedChat.id,
      content,
      fileUrl,
      type,
      timestamp: new Date().toISOString(),
    });

    setMessage("");
    setPreviewFile(null);
    setShowEmojiPicker(false);
  };

  const onEmojiClick = (emoji) => setMessage((p) => p + emoji.emoji);

  /* ===================== UI ===================== */
  return (
    <div className="h-[calc(100vh-6rem)] flex">
      {/* Sidebar */}
      <aside className="w-80 border-r bg-white">
        <header className="p-4 border-b">
          <h1 className="text-xl font-bold">Messages</h1>
        </header>
        <div className="overflow-y-auto h-[calc(100%-4rem)]">
          {chats.map((chat) => (
            <button
              key={chat.id}
              onClick={() => handleSelectChat(chat)}
              className={`w-full p-4 text-left hover:bg-gray-50 ${
                selectedChat?.id === chat.id ? "bg-primary-50" : ""
              }`}
            >
              <div className="flex items-center">
                <div className="h-10 w-10 rounded-full bg-primary-100 text-primary-600 flex items-center justify-center overflow-hidden">
                  {chat.profilePicture ? (
                    <img
                      src={chat.profilePicture}
                      alt={chat.name}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    chat.name?.charAt(0) || "U"
                  )}
                </div>
                <div className="ml-3 flex-1">
                  <p className="font-bold text-gray-800">{chat.name}</p>
                </div>
              </div>
            </button>
          ))}
        </div>
      </aside>

      {/* Chat Window */}
      <main className="flex-1 flex flex-col bg-gray-50 overflow-hidden">
        {selectedChat ? (
          <>
            <div className="p-4 bg-white border-b flex items-center">
              <div className="h-10 w-10 rounded-full bg-primary-100 text-primary-600 flex items-center justify-center overflow-hidden">
                {selectedChat.profilePicture ? (
                  <img
                    src={selectedChat.profilePicture}
                    alt={selectedChat.name}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  selectedChat.name?.charAt(0) || "U"
                )}
              </div>
              <div className="ml-3">
                <h2 className="text-lg font-bold text-gray-900">
                  {selectedChat.name}
                </h2>
                {partnerTyping && selectedChat?.id === nguoiNhanId && (
                  <p className="text-sm text-gray-800 font-medium italic">
                    Đang nhập...
                  </p>
                )}
              </div>
            </div>

            <div
              ref={messagesWrapRef}
              className="flex-1 overflow-y-auto overscroll-contain p-4 min-h-0"
            >
              {messages.map((m, i) => (
                <div
                  key={i}
                  className={`flex mb-4 ${
                    String(m.senderId) === String(currentUserLMS.id)
                      ? "justify-end"
                      : "justify-start"
                  }`}
                >
                  <div
                    className={`max-w-[70%] rounded-lg p-3 ${
                      String(m.senderId) === String(currentUserLMS.id)
                        ? "bg-blue-300 text-black"
                        : "bg-gray-200 text-black"
                    }`}
                  >
                    {m.type === "IMAGE" && m.fileUrl ? (
                      <div className="relative inline-block">
                        <img
                          src={`${BASE_URL}${m.fileUrl}`}
                          alt={m.content}
                          className="max-w-xs rounded"
                        />
                        <a
                          href={`${BASE_URL}/api/upload/download/${m.fileUrl
                            .split("/")
                            .pop()}`}
                          className="absolute top-2 right-2 text-gray-800 bg-white/80 p-1 rounded-full hover:bg-white"
                          title="Tải ảnh"
                        >
                          <FiDownload className="h-5 w-5 drop-shadow" />
                        </a>
                      </div>
                    ) : m.type === "FILE" && m.fileUrl ? (
                      <div className="flex items-center space-x-2">
                        <a
                          href={`${BASE_URL}${m.fileUrl}`}
                          target="_blank"
                          rel="noreferrer"
                          className="underline break-all"
                        >
                          {m.content}
                        </a>
                        <a
                          href={`${BASE_URL}/api/upload/download/${m.fileUrl
                            .split("/")
                            .pop()}`}
                          className="text-gray-700 hover:text-gray-900"
                          title="Tải tệp"
                        >
                          <FiDownload className="h-5 w-5" />
                        </a>
                      </div>
                    ) : (
                      <p className="font-semibold text-base text-black">
                        {m.content}
                      </p>
                    )}
                    <p className="text-xs mt-1 text-gray-800 font-medium">
                      {new Date(m.timestamp || m.createdAt).toLocaleTimeString()}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            {/* Input */}
            <div className="p-4 bg-white border-t">
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="p-2 text-gray-500 hover:text-gray-700"
                >
                  <FiPaperclip className="h-5 w-5" />
                </button>
                <input
                  ref={fileInputRef}
                  type="file"
                  className="hidden"
                  onChange={handleFileUpload}
                />

                <button
                  onClick={() => imageInputRef.current?.click()}
                  className="p-2 text-gray-500 hover:text-gray-700"
                >
                  <FiImage className="h-5 w-5" />
                </button>
                <input
                  ref={imageInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleFileUpload}
                />

                <div className="relative">
                  <button
                    onClick={() => setShowEmojiPicker((s) => !s)}
                    className="p-2 text-gray-500 hover:text-gray-700"
                  >
                    <FiSmile className="h-5 w-5" />
                  </button>
                  {showEmojiPicker && (
                    <div className="absolute bottom-12 left-0 z-10">
                      <EmojiPicker onEmojiClick={onEmojiClick} />
                    </div>
                  )}
                </div>

                <input
                  type="text"
                  value={message}
                  placeholder="Type a message…"
                  onChange={(e) => setMessage(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleSendMessage()}
                  className="flex-1 form-input"
                />

                <button
                  onClick={handleSendMessage}
                  disabled={!message.trim() && !previewFile}
                  className="p-2 text-primary-500 hover:text-primary-600 disabled:text-gray-400"
                >
                  <FiSend className="h-5 w-5" />
                </button>
              </div>

              {previewFile && (
                <div className="mt-3 flex items-center justify-between bg-gray-50 p-3 rounded">
                  <div className="flex items-center space-x-3">
                    {previewFile.type.startsWith("image/") ? (
                      <img
                        src={previewFile.previewUrl}
                        className="h-12 w-12 object-cover rounded"
                      />
                    ) : (
                      <FiPaperclip className="h-6 w-6 text-gray-600" />
                    )}
                    <span className="text-sm font-semibold text-gray-800">
                      {previewFile.file.name}
                    </span>
                  </div>
                  <button
                    onClick={() => setPreviewFile(null)}
                    className="p-1 text-gray-500 hover:text-gray-700"
                  >
                    <FiX className="h-4 w-4" />
                  </button>
                </div>
              )}
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <div className="h-16 w-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <FiMessageSquare className="h-8 w-8 text-gray-500" />
              </div>
              <p className="text-gray-600">Select a chat to start messaging</p>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
