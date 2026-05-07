import { useState, useRef, useEffect } from "react";
import "./App.css";

const API_BASE_URL = import.meta.env.VITE_API_URL || "/api";

function App() {
  const [user, setUser] = useState(null);
  const [showAuth, setShowAuth] = useState(false);
  const [authMode, setAuthMode] = useState("login");
  const [authForm, setAuthForm] = useState({ username: "", password: "" });
  const [conversations, setConversations] = useState([]);
  const [currentConversation, setCurrentConversation] = useState(null);
  const [messages, setMessages] = useState([
    {
      id: 1,
      content: "你好！我是季桑陌，有什么可以帮助你的吗？",
      isUser: false,
    },
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingConversations, setIsLoadingConversations] = useState(false);
  const [showStats, setShowStats] = useState(false);
  const [stats, setStats] = useState({
    total: 0,
    satisfied: 0,
    dissatisfied: 0,
    satisfactionRate: "0%",
  });
  const [messageFeedbacks, setMessageFeedbacks] = useState({});
  const [editingId, setEditingId] = useState(null);
  const [editingTitle, setEditingTitle] = useState("");
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    const savedUser = localStorage.getItem("user");
    if (savedUser) {
      setUser(JSON.parse(savedUser));
      fetchConversations();
    } else {
      loadGuestConversations();
    }
  }, []);

  const loadGuestConversations = () => {
    try {
      const saved = sessionStorage.getItem("guestConversations");
      if (saved) {
        const guestConversations = JSON.parse(saved);
        setConversations(guestConversations);
        if (guestConversations.length > 0) {
          setCurrentConversation(guestConversations[0]);
          setMessages(guestConversations[0].messages);
        }
      }
    } catch (error) {
      console.error("加载访客对话失败:", error);
    }
  };

  const saveGuestConversations = (newConversations) => {
    sessionStorage.setItem(
      "guestConversations",
      JSON.stringify(newConversations),
    );
  };

  useEffect(() => {
    if (user) {
      fetchFeedbackStats();
    }
  }, [user]);

  const fetchFeedbackStats = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/feedbacks/stats`);
      const data = await response.json();
      setStats(data);
    } catch (error) {
      console.error("获取统计失败:", error);
    }
  };

  const fetchConversations = async () => {
    setIsLoadingConversations(true);
    try {
      const response = await fetch(`${API_BASE_URL}/conversations`, {
        headers: {
          "x-user-id": user?.id || "",
        },
      });
      const data = await response.json();
      setConversations(data);
      if (data.length > 0) {
        setCurrentConversation(data[0]);
        setMessages(data[0].messages);
      } else {
        setCurrentConversation(null);
        setMessages([
          {
            id: 1,
            content: "你好！我是季桑陌，有什么可以帮助你的吗？",
            isUser: false,
          },
        ]);
      }
    } catch (error) {
      console.error("获取对话列表失败:", error);
    } finally {
      setIsLoadingConversations(false);
    }
  };

  const handleAuth = async () => {
    try {
      const endpoint =
        authMode === "login"
          ? `${API_BASE_URL}/users/login`
          : `${API_BASE_URL}/users/register`;
      const response = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(authForm),
      });
      const data = await response.json();
      if (response.ok) {
        setUser(data.user);
        localStorage.setItem("user", JSON.stringify(data.user));
        sessionStorage.removeItem("guestConversations");
        setShowAuth(false);
        setAuthForm({ username: "", password: "" });
        fetchConversationsWithUser(data.user);
      } else {
        alert(data.error);
      }
    } catch (error) {
      console.error("认证失败:", error);
      alert("认证失败，请稍后再试");
    }
  };

  const fetchConversationsWithUser = async (currentUser) => {
    setIsLoadingConversations(true);
    try {
      const response = await fetch(`${API_BASE_URL}/conversations`, {
        headers: {
          "x-user-id": currentUser.id,
        },
      });
      const data = await response.json();
      console.log("获取到的对话:", data);
      setConversations(data);
      if (data.length > 0) {
        setCurrentConversation(data[0]);
        setMessages(data[0].messages);
      } else {
        setCurrentConversation(null);
        setMessages([
          {
            id: 1,
            content: "你好！我是季桑陌，有什么可以帮助你的吗？",
            isUser: false,
          },
        ]);
      }
    } catch (error) {
      console.error("获取对话列表失败:", error);
    } finally {
      setIsLoadingConversations(false);
    }
  };

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem("user");
    setCurrentConversation(null);
    setConversations([]);
    setMessages([
      {
        id: 1,
        content: "你好！我是季桑陌，有什么可以帮助你的吗？",
        isUser: false,
      },
    ]);
    setMessageFeedbacks({});
  };

  const renameConversation = async (conversationId, newTitle) => {
    try {
      const response = await fetch(
        `${API_BASE_URL}/conversations/${conversationId}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ title: newTitle }),
        },
      );
      if (response.ok) {
        setConversations((prev) =>
          prev.map((c) =>
            c.id === conversationId ? { ...c, title: newTitle } : c,
          ),
        );
        if (currentConversation?.id === conversationId) {
          setCurrentConversation((prev) => ({ ...prev, title: newTitle }));
        }
      }
    } catch (error) {
      console.error("修改对话名称失败:", error);
    }
  };

  const createNewConversation = () => {
    const newConversation = {
      id: Date.now().toString(),
      title: "新对话",
      messages: [
        {
          id: 1,
          content: "你好！我是季桑陌，有什么可以帮助你的吗？",
          isUser: false,
        },
      ],
      userId: user?.id || null,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    if (user) {
      fetch(`${API_BASE_URL}/conversations`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newConversation),
      })
        .then((response) => response.json())
        .then((savedConversation) => {
          setConversations((prev) => [...prev, savedConversation]);
          setCurrentConversation(savedConversation);
          setMessages(savedConversation.messages);
          setMessageFeedbacks({});
        })
        .catch((error) => {
          console.error("创建对话失败:", error);
        });
    } else {
      const newConversations = [...conversations, newConversation];
      setConversations(newConversations);
      setCurrentConversation(newConversation);
      setMessages(newConversation.messages);
      setMessageFeedbacks({});
      saveGuestConversations(newConversations);
    }
  };

  const loadConversation = (conversationId) => {
    try {
      const conversation = conversations.find((c) => c.id === conversationId);
      if (conversation) {
        setCurrentConversation(conversation);
        setMessages(conversation.messages);
        setMessageFeedbacks({});
        fetchFeedbacksForConversation(conversationId);
      } else {
        fetch(`${API_BASE_URL}/conversations/${conversationId}`)
          .then((response) => response.json())
          .then((conversation) => {
            setCurrentConversation(conversation);
            setMessages(conversation.messages);
            setMessageFeedbacks({});
            fetchFeedbacksForConversation(conversationId);
          })
          .catch((error) => {
            console.error("加载对话失败:", error);
          });
      }
    } catch (error) {
      console.error("加载对话失败:", error);
    }
  };

  const fetchFeedbacksForConversation = async (conversationId) => {
    try {
      const response = await fetch(
        `${API_BASE_URL}/feedbacks/${conversationId}`,
      );
      const feedbacks = await response.json();
      const feedbackMap = {};
      feedbacks.forEach((fb) => {
        feedbackMap[fb.messageId] = fb.isSatisfied;
      });
      setMessageFeedbacks(feedbackMap);
    } catch (error) {
      console.error("获取反馈失败:", error);
    }
  };

  const saveConversation = (conversationId, updatedConversation) => {
    const newConversations = conversations.map((c) =>
      c.id === conversationId ? updatedConversation : c,
    );
    setConversations(newConversations);

    if (user) {
      fetch(`${API_BASE_URL}/conversations/${conversationId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updatedConversation),
      }).catch((error) => {
        console.error("保存对话失败:", error);
      });
    } else {
      saveGuestConversations(newConversations);
    }
  };

  const deleteConversation = (conversationId) => {
    const newConversations = conversations.filter(
      (c) => c.id !== conversationId,
    );
    setConversations(newConversations);

    if (currentConversation?.id === conversationId) {
      setCurrentConversation(null);
      setMessages([
        {
          id: 1,
          content: "你好！我是季桑陌，有什么可以帮助你的吗？",
          isUser: false,
        },
      ]);
      setMessageFeedbacks({});
    }

    if (user) {
      fetch(`${API_BASE_URL}/conversations/${conversationId}`, {
        method: "DELETE",
      })
        .then((response) => {
          if (response.ok) {
            fetchFeedbackStats();
          }
        })
        .catch((error) => {
          console.error("删除对话失败:", error);
        });
    } else {
      saveGuestConversations(newConversations);
    }
  };

  const submitFeedback = async (messageId, isSatisfied) => {
    if (!currentConversation) return;
    try {
      await fetch(`${API_BASE_URL}/feedbacks`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          conversationId: currentConversation.id,
          messageId,
          isSatisfied,
          userId: user?.id || null,
        }),
      });
      setMessageFeedbacks((prev) => ({ ...prev, [messageId]: isSatisfied }));
      fetchFeedbackStats();
    } catch (error) {
      console.error("提交反馈失败:", error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!input.trim()) return;

    const newUserMessage = {
      id: Date.now(),
      content: input,
      isUser: true,
    };

    const updatedMessages = [...messages, newUserMessage];
    setMessages(updatedMessages);
    setInput("");
    setIsLoading(true);

    try {
      const generateUUID = () => {
        return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(
          /[xy]/g,
          function (c) {
            const r = (Math.random() * 16) | 0;
            const v = c === "x" ? r : (r & 0x3) | 0x8;
            return v.toString(16);
          },
        );
      };

      const conversationId = currentConversation?.id || generateUUID();

      const response = await fetch("http://localhost/v1/chat-messages", {
        method: "POST",
        headers: {
          Authorization: `Bearer app-rpmrfaj1tApP0BhEeMQFGORL`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          inputs: {},
          query: input,
          response_mode: "streaming",
          conversation_id: "",
          user: "demo-yuyi-001",
          files: [],
        }),
      });

      if (!response.ok) {
        throw new Error(`API调用失败: ${response.status}`);
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder("utf-8");
      let fullAnswer = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value);
        const lines = chunk.split("\n");
        for (const line of lines) {
          if (line.startsWith("data: ")) {
            try {
              const data = JSON.parse(line.replace("data: ", ""));
              if (data.answer) {
                fullAnswer += data.answer;
                const tempMessages = [
                  ...updatedMessages,
                  {
                    id: Date.now() + 1,
                    content: fullAnswer,
                    isUser: false,
                  },
                ];
                setMessages(tempMessages);
              }
            } catch (e) {}
          }
        }
      }

      const aiResponse = {
        id: Date.now() + 1,
        content: fullAnswer || "抱歉，暂时无法获取回答，请稍后再试。",
        isUser: false,
      };

      const finalMessages = [...updatedMessages, aiResponse];
      setMessages(finalMessages);

      if (currentConversation) {
        await saveConversation(currentConversation.id, {
          ...currentConversation,
          messages: finalMessages,
        });
      }
    } catch (error) {
      console.error("API调用失败:", error);
      const errorMessage = {
        id: Date.now() + 1,
        content: "抱歉，暂时无法获取回答，请稍后再试。",
        isUser: false,
      };
      const finalMessages = [...updatedMessages, errorMessage];
      setMessages(finalMessages);

      if (currentConversation) {
        await saveConversation(currentConversation.id, {
          ...currentConversation,
          messages: finalMessages,
        });
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="app">
      <header className="header">
        <div className="header-left">
          <h1>季桑陌</h1>
        </div>
        <div className="header-right">
          <a href="/admin" className="header-btn admin-link hidden">
            管理
          </a>
          {user ? (
            <>
              <span className="user-info">{user.username}</span>
              <button
                className="header-btn hidden"
                onClick={() => setShowStats(true)}
              >
                统计
              </button>
              <button className="header-btn" onClick={handleLogout}>
                退出
              </button>
            </>
          ) : (
            <button className="header-btn" onClick={() => setShowAuth(true)}>
              登录
            </button>
          )}
        </div>
      </header>

      {showAuth && (
        <div className="auth-modal">
          <div className="auth-content">
            <h2>{authMode === "login" ? "登录" : "注册"}</h2>
            <input
              type="text"
              placeholder="用户名"
              value={authForm.username}
              onChange={(e) =>
                setAuthForm({ ...authForm, username: e.target.value })
              }
            />
            <input
              type="password"
              placeholder="密码"
              value={authForm.password}
              onChange={(e) =>
                setAuthForm({ ...authForm, password: e.target.value })
              }
            />
            <div className="auth-buttons">
              <button onClick={handleAuth}>
                {authMode === "login" ? "登录" : "注册"}
              </button>
              <button
                onClick={() =>
                  setAuthMode(authMode === "login" ? "register" : "login")
                }
              >
                切换到{authMode === "login" ? "注册" : "登录"}
              </button>
              <button onClick={() => setShowAuth(false)}>取消</button>
            </div>
          </div>
        </div>
      )}

      {showStats && (
        <div className="stats-modal">
          <div className="stats-content">
            <h2>满意程度统计</h2>
            <div className="stats-grid">
              <div className="stat-item">
                <span className="stat-label">总反馈数</span>
                <span className="stat-value">{stats.total}</span>
              </div>
              <div className="stat-item satisfied">
                <span className="stat-label">满意</span>
                <span className="stat-value">{stats.satisfied}</span>
              </div>
              <div className="stat-item dissatisfied">
                <span className="stat-label">不满意</span>
                <span className="stat-value">{stats.dissatisfied}</span>
              </div>
              <div className="stat-item rate">
                <span className="stat-label">满意率</span>
                <span className="stat-value">{stats.satisfactionRate}</span>
              </div>
            </div>
            <button onClick={() => setShowStats(false)}>关闭</button>
          </div>
        </div>
      )}

      <main className="main">
        <div className="sidebar">
          <div className="sidebar-item" onClick={createNewConversation}>
            <span>新增对话</span>
          </div>
          {isLoadingConversations ? (
            <div className="sidebar-item">加载中...</div>
          ) : (
            conversations.map((conversation) => (
              <div
                key={conversation.id}
                className={`sidebar-item ${currentConversation?.id === conversation.id ? "active" : ""}`}
                onClick={() => loadConversation(conversation.id)}
                onDoubleClick={() => {
                  setEditingId(conversation.id);
                  setEditingTitle(conversation.title);
                }}
              >
                {editingId === conversation.id ? (
                  <div className="edit-title-container">
                    <input
                      type="text"
                      className="edit-title-input"
                      value={editingTitle}
                      onChange={(e) => setEditingTitle(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          if (editingTitle.trim()) {
                            renameConversation(
                              conversation.id,
                              editingTitle.trim(),
                            );
                          }
                          setEditingId(null);
                          setEditingTitle("");
                        } else if (e.key === "Escape") {
                          setEditingId(null);
                          setEditingTitle("");
                        }
                      }}
                      onBlur={() => {
                        if (editingTitle.trim()) {
                          renameConversation(
                            conversation.id,
                            editingTitle.trim(),
                          );
                        }
                        setEditingId(null);
                        setEditingTitle("");
                      }}
                      autoFocus
                    />
                  </div>
                ) : (
                  <span>{conversation.title}</span>
                )}
                <button
                  className="delete-btn"
                  onClick={(e) => {
                    e.stopPropagation();
                    deleteConversation(conversation.id);
                  }}
                >
                  ×
                </button>
              </div>
            ))
          )}
        </div>

        <div className="chat-container">
          <div className="messages">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`message ${message.isUser ? "user" : "ai"}`}
              >
                <div className="message-content">{message.content}</div>
                {!message.isUser && user && (
                  <div className="feedback-buttons">
                    {messageFeedbacks[message.id] === true ? (
                      <span className="feedback-done satisfied">✓ 满意</span>
                    ) : messageFeedbacks[message.id] === false ? (
                      <span className="feedback-done dissatisfied">
                        ✗ 不满意
                      </span>
                    ) : (
                      <>
                        <button
                          className="feedback-btn satisfied"
                          onClick={() => submitFeedback(message.id, true)}
                        >
                          ✓ 满意
                        </button>
                        <button
                          className="feedback-btn dissatisfied"
                          onClick={() => submitFeedback(message.id, false)}
                        >
                          ✗ 不满意
                        </button>
                      </>
                    )}
                  </div>
                )}
              </div>
            ))}
            {isLoading && (
              <div className="message ai">
                <div className="message-content loading">
                  <span className="loading-dot"></span>
                  <span className="loading-dot"></span>
                  <span className="loading-dot"></span>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          <form onSubmit={handleSubmit} className="input-form">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="输入你的问题..."
              className="input-field"
              disabled={isLoading}
            />
            <button type="submit" className="send-btn" disabled={isLoading}>
              发送
            </button>
          </form>
        </div>
      </main>
    </div>
  );
}

export default App;
