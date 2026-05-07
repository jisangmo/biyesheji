const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = 3001;

// 解析JSON请求体
app.use(express.json());

// 静态文件服务 - 提供前端构建产物
app.use(express.static(path.join(__dirname, '../dist')));

// API路由前缀
const apiRouter = express.Router();

// 手动配置CORS（仅对API路由）
apiRouter.use((req, res, next) => {
  const origin = req.headers.origin;
  const allowedOrigins = ['http://localhost:5173', 'http://localhost:5174', 'http://localhost:5176', 'http://localhost:3000', 'http://localhost:8080', 'http://localhost:3001'];
  if (allowedOrigins.includes(origin) || !origin) {
    res.setHeader('Access-Control-Allow-Origin', origin || '*');
  } else {
    res.setHeader('Access-Control-Allow-Origin', '*');
  }
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, x-user-id, x-admin-id');
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }
  next();
});

// 对话存储文件路径
const conversationsPath = path.join(__dirname, 'conversations.json');
const usersPath = path.join(__dirname, 'users.json');
const feedbacksPath = path.join(__dirname, 'feedbacks.json');
const adminUsersPath = path.join(__dirname, 'admin_users.json');

// 确保对话文件存在并添加模拟数据
if (!fs.existsSync(conversationsPath)) {
  const mockConversations = [
    {
      id: '1',
      title: '手机歌对话',
      messages: [
        { id: 1, content: '你好！我是季桑陌，有什么可以帮助你的吗？', isUser: false },
        { id: 2, content: '我想了解一下最新的手机歌', isUser: true },
        { id: 3, content: '好的，最近有很多热门的手机歌，比如《孤勇者》、《起风了》等。你喜欢什么类型的音乐呢？', isUser: false }
      ],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    },
    {
      id: '2',
      title: 'Trae安装Vite失败解决',
      messages: [
        { id: 1, content: '你好！我是季桑陌，有什么可以帮助你的吗？', isUser: false },
        { id: 2, content: '我在Trae中安装Vite失败了，怎么办？', isUser: true },
        { id: 3, content: 'Vite安装失败可能是由于网络问题或依赖冲突。你可以尝试使用npm install vite@latest命令来安装最新版本的Vite。', isUser: false }
      ],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    },
    {
      id: '3',
      title: 'AI面试常见问题STAR法则作答',
      messages: [
        { id: 1, content: '你好！我是季桑陌，有什么可以帮助你的吗？', isUser: false },
        { id: 2, content: '我想了解一下AI面试常见问题的STAR法则作答', isUser: true },
        { id: 3, content: 'STAR法则是情境(Situation)、任务(Task)、行动(Action)、结果(Result)的缩写。在AI面试中，你可以使用这个法则来结构化地回答问题。', isUser: false }
      ],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    },
    {
      id: '4',
      title: '简历Word',
      messages: [
        { id: 1, content: '你好！我是季桑陌，有什么可以帮助你的吗？', isUser: false },
        { id: 2, content: '我想制作一份简历，有什么建议吗？', isUser: true },
        { id: 3, content: '制作简历时，要注意简洁明了，突出重点，使用专业的格式和字体。你可以使用Word的简历模板来快速制作。', isUser: false }
      ],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    },
    {
      id: '5',
      title: '销售管理分析AI面如何回答',
      messages: [
        { id: 1, content: '你好！我是季桑陌，有什么可以帮助你的吗？', isUser: false },
        { id: 2, content: '销售管理分析AI面试时如何回答问题？', isUser: true },
        { id: 3, content: '在销售管理分析AI面试中，你需要展示你的数据分析能力、问题解决能力和沟通能力。可以使用STAR法则来结构化地回答问题。', isUser: false }
      ],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }
  ];
  fs.writeFileSync(conversationsPath, JSON.stringify(mockConversations, null, 2));
}

// 确保用户文件存在
if (!fs.existsSync(usersPath)) {
  fs.writeFileSync(usersPath, JSON.stringify([], null, 2));
}

// 确保反馈文件存在
if (!fs.existsSync(feedbacksPath)) {
  fs.writeFileSync(feedbacksPath, JSON.stringify([], null, 2));
}

// 确保管理员用户文件存在
if (!fs.existsSync(adminUsersPath)) {
  fs.writeFileSync(adminUsersPath, JSON.stringify([], null, 2));
}

// ==================== 用户管理API ====================

// 用户注册
apiRouter.post('/users/register', (req, res) => {
  try {
    const users = JSON.parse(fs.readFileSync(usersPath, 'utf8'));
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({ error: '用户名和密码不能为空' });
    }

    if (users.find(u => u.username === username)) {
      return res.status(400).json({ error: '用户名已存在' });
    }

    const newUser = {
      id: Date.now().toString(),
      username,
      password,
      createdAt: new Date().toISOString()
    };

    users.push(newUser);
    fs.writeFileSync(usersPath, JSON.stringify(users, null, 2));
    res.json({ success: true, user: { id: newUser.id, username: newUser.username } });
  } catch (error) {
    console.error('用户注册失败:', error);
    res.status(500).json({ error: '用户注册失败' });
  }
});

// 用户登录
apiRouter.post('/users/login', (req, res) => {
  try {
    const users = JSON.parse(fs.readFileSync(usersPath, 'utf8'));
    const { username, password } = req.body;

    const user = users.find(u => u.username === username && u.password === password);
    if (user) {
      res.json({ success: true, user: { id: user.id, username: user.username } });
    } else {
      res.status(401).json({ error: '用户名或密码错误' });
    }
  } catch (error) {
    console.error('用户登录失败:', error);
    res.status(500).json({ error: '用户登录失败' });
  }
});

// 获取当前用户信息
apiRouter.get('/users/current', (req, res) => {
  try {
    const users = JSON.parse(fs.readFileSync(usersPath, 'utf8'));
    const userId = req.headers['x-user-id'];

    if (!userId) {
      return res.status(401).json({ error: '未登录' });
    }

    const user = users.find(u => u.id === userId);
    if (user) {
      res.json({ id: user.id, username: user.username });
    } else {
      res.status(404).json({ error: '用户不存在' });
    }
  } catch (error) {
    console.error('获取用户信息失败:', error);
    res.status(500).json({ error: '获取用户信息失败' });
  }
});

// ==================== 管理员用户管理API ====================

// 管理员注册
apiRouter.post('/admin/register', (req, res) => {
  try {
    const adminUsers = JSON.parse(fs.readFileSync(adminUsersPath, 'utf8'));
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({ error: '用户名和密码不能为空' });
    }

    if (adminUsers.find(u => u.username === username)) {
      return res.status(400).json({ error: '管理员用户名已存在' });
    }

    const newAdmin = {
      id: Date.now().toString(),
      username,
      password,
      createdAt: new Date().toISOString()
    };

    adminUsers.push(newAdmin);
    fs.writeFileSync(adminUsersPath, JSON.stringify(adminUsers, null, 2));
    res.json({ success: true, admin: { id: newAdmin.id, username: newAdmin.username } });
  } catch (error) {
    console.error('管理员注册失败:', error);
    res.status(500).json({ error: '管理员注册失败' });
  }
});

// 管理员登录
apiRouter.post('/admin/login', (req, res) => {
  try {
    const adminUsers = JSON.parse(fs.readFileSync(adminUsersPath, 'utf8'));
    const { username, password } = req.body;

    const admin = adminUsers.find(u => u.username === username && u.password === password);
    if (admin) {
      res.json({ success: true, admin: { id: admin.id, username: admin.username } });
    } else {
      res.status(401).json({ error: '用户名或密码错误' });
    }
  } catch (error) {
    console.error('管理员登录失败:', error);
    res.status(500).json({ error: '管理员登录失败' });
  }
});

// 获取当前管理员信息
apiRouter.get('/admin/current', (req, res) => {
  try {
    const adminUsers = JSON.parse(fs.readFileSync(adminUsersPath, 'utf8'));
    const adminId = req.headers['x-admin-id'];

    if (!adminId) {
      return res.status(401).json({ error: '未登录' });
    }

    const admin = adminUsers.find(u => u.id === adminId);
    if (admin) {
      res.json({ id: admin.id, username: admin.username });
    } else {
      res.status(404).json({ error: '管理员不存在' });
    }
  } catch (error) {
    console.error('获取管理员信息失败:', error);
    res.status(500).json({ error: '获取管理员信息失败' });
  }
});

// ==================== 对话管理API ====================

// 获取用户的对话
apiRouter.get('/conversations', (req, res) => {
  try {
    console.log('==============================');
    console.log('收到对话请求');
    console.log('请求头:', req.headers);
    const conversations = JSON.parse(fs.readFileSync(conversationsPath, 'utf8'));
    const userId = req.headers['x-user-id'];

    console.log('用户ID:', userId);
    console.log('所有对话数量:', conversations.length);

    if (userId && userId !== "") {
      const userConversations = conversations.filter(c => c.userId === userId || c.userId === null || c.userId === undefined);
      console.log('筛选后的对话数量:', userConversations.length);
      res.json(userConversations);
    } else {
      console.log('用户ID为空，返回空数组');
      res.json([]);
    }
  } catch (error) {
    console.error('读取对话失败:', error);
    res.status(500).json({ error: '读取对话失败' });
  }
});

// 获取单个对话
apiRouter.get('/conversations/:id', (req, res) => {
  try {
    const conversations = JSON.parse(fs.readFileSync(conversationsPath, 'utf8'));
    const conversation = conversations.find(c => c.id === req.params.id);
    if (conversation) {
      res.json(conversation);
    } else {
      res.status(404).json({ error: '对话不存在' });
    }
  } catch (error) {
    console.error('读取对话失败:', error);
    res.status(500).json({ error: '读取对话失败' });
  }
});

// 创建新对话
apiRouter.post('/conversations', (req, res) => {
  try {
    const conversations = JSON.parse(fs.readFileSync(conversationsPath, 'utf8'));
    const newConversation = {
      id: Date.now().toString(),
      title: req.body.title || `对话 ${conversations.length + 1}`,
      messages: req.body.messages || [],
      userId: req.body.userId || null,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    conversations.push(newConversation);
    fs.writeFileSync(conversationsPath, JSON.stringify(conversations, null, 2));
    res.json(newConversation);
  } catch (error) {
    console.error('创建对话失败:', error);
    res.status(500).json({ error: '创建对话失败' });
  }
});

// 更新对话
apiRouter.put('/conversations/:id', (req, res) => {
  try {
    const conversations = JSON.parse(fs.readFileSync(conversationsPath, 'utf8'));
    const index = conversations.findIndex(c => c.id === req.params.id);
    if (index !== -1) {
      conversations[index] = {
        ...conversations[index],
        ...req.body,
        updatedAt: new Date().toISOString()
      };
      fs.writeFileSync(conversationsPath, JSON.stringify(conversations, null, 2));
      res.json(conversations[index]);
    } else {
      res.status(404).json({ error: '对话不存在' });
    }
  } catch (error) {
    console.error('更新对话失败:', error);
    res.status(500).json({ error: '更新对话失败' });
  }
});

// 删除对话
apiRouter.delete('/conversations/:id', (req, res) => {
  try {
    const conversations = JSON.parse(fs.readFileSync(conversationsPath, 'utf8'));
    const filteredConversations = conversations.filter(c => c.id !== req.params.id);
    if (filteredConversations.length !== conversations.length) {
      fs.writeFileSync(conversationsPath, JSON.stringify(filteredConversations, null, 2));

      const feedbacks = JSON.parse(fs.readFileSync(feedbacksPath, 'utf8'));
      const filteredFeedbacks = feedbacks.filter(f => f.conversationId !== req.params.id);
      fs.writeFileSync(feedbacksPath, JSON.stringify(filteredFeedbacks, null, 2));

      res.json({ success: true });
    } else {
      res.status(404).json({ error: '对话不存在' });
    }
  } catch (error) {
    console.error('删除对话失败:', error);
    res.status(500).json({ error: '删除对话失败' });
  }
});

// ==================== 反馈API ====================

// 提交反馈
apiRouter.post('/feedbacks', (req, res) => {
  try {
    const feedbacks = JSON.parse(fs.readFileSync(feedbacksPath, 'utf8'));
    const { conversationId, messageId, isSatisfied, userId } = req.body;

    const newFeedback = {
      id: Date.now().toString(),
      conversationId,
      messageId,
      isSatisfied,
      userId: userId || null,
      createdAt: new Date().toISOString()
    };

    feedbacks.push(newFeedback);
    fs.writeFileSync(feedbacksPath, JSON.stringify(feedbacks, null, 2));
    res.json(newFeedback);
  } catch (error) {
    console.error('提交反馈失败:', error);
    res.status(500).json({ error: '提交反馈失败' });
  }
});

// 获取某个对话的所有反馈
apiRouter.get('/feedbacks/:conversationId', (req, res) => {
  try {
    const feedbacks = JSON.parse(fs.readFileSync(feedbacksPath, 'utf8'));
    const conversationFeedbacks = feedbacks.filter(f => f.conversationId === req.params.conversationId);
    res.json(conversationFeedbacks);
  } catch (error) {
    console.error('获取反馈失败:', error);
    res.status(500).json({ error: '获取反馈失败' });
  }
});

// 获取满意程度统计
apiRouter.get('/feedbacks/stats', (req, res) => {
  try {
    const feedbacks = JSON.parse(fs.readFileSync(feedbacksPath, 'utf8'));
    const total = feedbacks.length;
    const satisfied = feedbacks.filter(f => f.isSatisfied).length;
    const dissatisfied = total - satisfied;
    const satisfactionRate = total > 0 ? ((satisfied / total) * 100).toFixed(2) + '%' : '0%';

    res.json({
      total,
      satisfied,
      dissatisfied,
      satisfactionRate
    });
  } catch (error) {
    console.error('获取统计失败:', error);
    res.status(500).json({ error: '获取统计失败' });
  }
});

// ==================== 管理员API ====================

// 获取所有用户的统计信息
apiRouter.get('/admin/stats', (req, res) => {
  try {
    const adminUsers = JSON.parse(fs.readFileSync(adminUsersPath, 'utf8'));
    const adminId = req.headers['x-admin-id'];

    if (!adminId || !adminUsers.find(u => u.id === adminId)) {
      return res.status(401).json({ error: '未授权' });
    }

    const users = JSON.parse(fs.readFileSync(usersPath, 'utf8'));
    const conversations = JSON.parse(fs.readFileSync(conversationsPath, 'utf8'));
    const feedbacks = JSON.parse(fs.readFileSync(feedbacksPath, 'utf8'));

    const userStats = users.map(user => {
      const userConversations = conversations.filter(c => c.userId === user.id);
      const userMessages = userConversations.reduce((total, conv) => {
        return total + conv.messages.filter(m => m.isUser).length;
      }, 0);
      const userFeedbacks = feedbacks.filter(f => f.userId === user.id);
      const userSatisfied = userFeedbacks.filter(f => f.isSatisfied).length;
      const userDissatisfied = userFeedbacks.length - userSatisfied;

      return {
        id: user.id,
        username: user.username,
        conversationCount: userConversations.length,
        messageCount: userMessages,
        feedbackCount: userFeedbacks.length,
        satisfied: userSatisfied,
        dissatisfied: userDissatisfied,
        satisfactionRate: userFeedbacks.length > 0
          ? ((userSatisfied / userFeedbacks.length) * 100).toFixed(2) + '%'
          : '0%'
      };
    });

    const totalMessages = conversations.reduce((total, conv) => {
      return total + conv.messages.filter(m => m.isUser).length;
    }, 0);

    const totalFeedbacks = feedbacks.length;
    const totalSatisfied = feedbacks.filter(f => f.isSatisfied).length;
    const totalDissatisfied = totalFeedbacks - totalSatisfied;

    res.json({
      users: userStats,
      total: {
        userCount: users.length,
        conversationCount: conversations.length,
        messageCount: totalMessages,
        feedbackCount: totalFeedbacks,
        satisfied: totalSatisfied,
        dissatisfied: totalDissatisfied,
        satisfactionRate: totalFeedbacks > 0
          ? ((totalSatisfied / totalFeedbacks) * 100).toFixed(2) + '%'
          : '0%'
      }
    });
  } catch (error) {
    console.error('获取管理统计失败:', error);
    res.status(500).json({ error: '获取管理统计失败' });
  }
});

// 注册API路由
app.use('/api', apiRouter);

// 前端路由fallback - 所有非API请求都返回index.html
app.get(/^\/(?!api\/).*/, (req, res) => {
  res.sendFile(path.join(__dirname, '../dist', 'index.html'));
});

// 启动服务器
app.listen(PORT, () => {
  console.log(`后端服务器运行在 http://localhost:${PORT}`);
});