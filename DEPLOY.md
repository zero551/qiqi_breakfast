# 🚀 部署指南：让全家用上「奇奇的早餐」

全程点鼠标，大约 10 分钟。做完你会得到一个网址（比如 `qiqi-breakfast.vercel.app`），发到家庭群，大家用手机浏览器打开 → 添加到主屏幕即可。

---

## 第一步：注册 GitHub 并上传代码（2 分钟）

代码需要放到 GitHub，Vercel 才能拿到。

1. 打开 https://github.com ，注册一个账号（免费）。
2. 如果你会用命令行，在这个项目文件夹里执行：

       git init
       git add -A
       git commit -m "奇奇的早餐 V1"
       git branch -M main
       git remote add origin https://github.com/你的用户名/qiqi-breakfast.git
       git push -u origin main

   （先在 GitHub 网页上新建一个空仓库，名字比如叫 qiqi-breakfast）
3. **不会命令行也没关系**：安装 GitHub Desktop（https://desktop.github.com），
   用它把这个文件夹拖进去 → Publish 即可。

> 也可以跳过 GitHub，直接看文末「方法二：Vercel CLI」。

---

## 第二步：注册 Vercel 并导入项目（3 分钟）

1. 打开 https://vercel.com ，点 **Sign Up**，选 **Continue with GitHub**（用刚注册的 GitHub 登录）。
2. 登录后点 **Add New… → Project**。
3. 在列表里找到 `qiqi-breakfast`，点 **Import**。
4. 直接点 **Deploy**（不用改任何设置）。
5. 等 1~2 分钟，出现 🎉 就部署成功了，点 **Visit** 能看到网址。

> 此时打开已经能玩了，但走的是「本机模式」（各存各的）。下一步接上数据库就变成全家共享。

---

## 第三步：接入 Upstash Redis（全家共享的关键，3 分钟）

1. 在 Vercel 项目页面，点顶部的 **Storage** 标签。
2. 点 **Create Database**，在产品列表里选 **Upstash**（Redis）。
3. 按提示创建一个 Redis 数据库：
   - 名字随便填，比如 `qiqi-kv`
   - 区域（Region）选 **Singapore**（离国内近，快）
4. 创建完后，它会问你要不要 **Connect to Project**，选你的 `qiqi-breakfast` 项目，点连接。
   - 这一步会自动把 `KV_REST_API_URL` 和 `KV_REST_API_TOKEN` 两个密钥写进项目环境变量，你不用手动复制。
5. 回到项目 **Deployments**，对最新一条点 **⋯ → Redeploy**（重新部署一次，让环境变量生效）。

✅ 完成！现在打开网址，左上角会显示 **☁️ 全家共享模式**。把网址发到家庭群，所有人就是同一份早餐列表了。

---

## 方法二（可选）：Vercel CLI，不用 GitHub

如果你不想碰 GitHub，可以在电脑上装 Vercel 命令行直接传：

    npm install -g vercel
    vercel login
    vercel
    vercel --prod

之后接 Redis 的步骤同「第三步」。

---

## 添加到手机主屏幕（像 App 一样）

- **iPhone（Safari）**：打开网址 → 底部分享按钮 → **添加到主屏幕**。
- **安卓（Chrome）**：打开网址 → 右上角菜单 → **添加到主屏幕 / 安装应用**。

之后桌面上就有「奇奇早餐」图标，点开全屏，跟 App 一样。

---

## 常见问题

**Q: 免费额度够吗？**
A: Vercel 和 Upstash 的免费档对一家人来说绰绰有余，正常使用永远用不完。

**Q: 网址会被陌生人看到吗？**
A: 网址本身是一串随机字符，不主动分享别人基本碰不到。如果之后想加锁，V2 可以加一个简单口令。

**Q: 想换网址名？**
A: Vercel 项目设置 → Domains 里可以改成你喜欢的 `xxx.vercel.app`，免费。

**Q: 数据会丢吗？**
A: 云端模式数据存在 Upstash，很可靠。本机模式数据只在那台手机的浏览器里，清浏览器数据会丢。
