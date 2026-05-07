import { useState, useEffect } from "react";
import "./Admin.css";

function Admin() {
  const [admin, setAdmin] = useState(null);
  const [showAuth, setShowAuth] = useState(false);
  const [authMode, setAuthMode] = useState("login");
  const [authForm, setAuthForm] = useState({ username: "", password: "" });
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const savedAdmin = localStorage.getItem("admin");
    if (savedAdmin) {
      setAdmin(JSON.parse(savedAdmin));
    } else {
      setShowAuth(true);
    }
  }, []);

  useEffect(() => {
    if (admin) {
      fetchStats();
    }
  }, [admin]);

  const handleAuth = async () => {
    try {
      const endpoint =
        authMode === "login" ? "/api/admin/login" : "/api/admin/register";
      const response = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(authForm),
      });
      const data = await response.json();
      if (response.ok) {
        setAdmin(data.admin);
        localStorage.setItem("admin", JSON.stringify(data.admin));
        setShowAuth(false);
        setAuthForm({ username: "", password: "" });
      } else {
        alert(data.error);
      }
    } catch (error) {
      console.error("认证失败:", error);
      alert("认证失败，请稍后再试");
    }
  };

  const handleLogout = () => {
    setAdmin(null);
    localStorage.removeItem("admin");
    setShowAuth(true);
  };

  const fetchStats = async () => {
    try {
      const response = await fetch("/api/admin/stats", {
        headers: {
          "x-admin-id": admin.id,
        },
      });
      if (!response.ok) {
        throw new Error("获取统计数据失败");
      }
      const data = await response.json();
      setStats(data);
      setLoading(false);
    } catch (err) {
      setError(err.message);
      setLoading(false);
    }
  };

  if (showAuth) {
    return (
      <div className="admin-auth-modal">
        <div className="admin-auth-content">
          <h2>{authMode === "login" ? "管理员登录" : "管理员注册"}</h2>
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
          <div className="admin-auth-buttons">
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
          </div>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="admin-loading">
        <div className="spinner"></div>
        <p>加载中...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="admin-error">
        <p>错误: {error}</p>
        <button onClick={fetchStats}>重试</button>
      </div>
    );
  }

  return (
    <div className="admin">
      <header className="admin-header">
        <h1>管理员面板</h1>
        <div className="admin-header-right">
          <span className="admin-info">{admin.username}</span>
          <a href="/" className="back-btn">
            返回对话
          </a>
          <button className="logout-btn" onClick={handleLogout}>
            退出
          </button>
        </div>
      </header>

      <main className="admin-content">
        <section className="stats-overview">
          <h2>总体统计</h2>
          <div className="stats-grid">
            <div className="stat-card">
              <div className="stat-icon users">👥</div>
              <div className="stat-info">
                <span className="stat-value">{stats.total.userCount}</span>
                <span className="stat-label">用户数</span>
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-icon conversations">💬</div>
              <div className="stat-info">
                <span className="stat-value">
                  {stats.total.conversationCount}
                </span>
                <span className="stat-label">对话数</span>
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-icon messages">📝</div>
              <div className="stat-info">
                <span className="stat-value">{stats.total.messageCount}</span>
                <span className="stat-label">提问数</span>
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-icon feedbacks">📊</div>
              <div className="stat-info">
                <span className="stat-value">{stats.total.feedbackCount}</span>
                <span className="stat-label">反馈数</span>
              </div>
            </div>
          </div>

          <div className="satisfaction-overview">
            <div className="satisfaction-bar">
              <div
                className="satisfaction-fill"
                style={{
                  width: stats.total.satisfactionRate,
                }}
              ></div>
            </div>
            <div className="satisfaction-stats">
              <span className="satisfied">✓ 满意: {stats.total.satisfied}</span>
              <span className="satisfaction-rate">
                满意率: {stats.total.satisfactionRate}
              </span>
              <span className="dissatisfied">
                ✗ 不满意: {stats.total.dissatisfied}
              </span>
            </div>
          </div>
        </section>

        <section className="user-stats">
          <h2>用户统计详情</h2>
          {stats.users.length === 0 ? (
            <div className="no-data">
              <p>暂无用户数据</p>
            </div>
          ) : (
            <div className="user-list">
              {stats.users.map((user) => (
                <div key={user.id} className="user-item">
                  <span className="user-name">{user.username}</span>
                  <span className="user-meta">
                    <span className="meta-item satisfied">
                      ✓ 满意: {user.satisfied}
                    </span>
                    <span className="meta-item dissatisfied">
                      ✗ 不满意: {user.dissatisfied}
                    </span>
                    <span className="meta-item questions">
                      📝 问题总数: {user.messageCount}
                    </span>
                  </span>
                </div>
              ))}
            </div>
          )}
        </section>
      </main>
    </div>
  );
}

export default Admin;
