# CoastalTutor 本地开发

CoastalTutor 是面向学生与家庭的学习门户。学生的 School Learning 与 Personal AI Tutor 共用同一个 DeepTutor 学习者身份；Interactive Classroom 保留旧版互动课堂能力。教师入口暂不启用。

## 启动本地学习服务

先在 Docker Desktop 启动后端与网页：

```powershell
powershell -ExecutionPolicy Bypass -File .\scripts\start-deeptutor.ps1
```

DeepTutor 地址为 <http://localhost:3782>。主站在另一个终端启动：

```powershell
pnpm dev
```

开发预览入口（仅本地开发环境提供）：

- 学生：<http://localhost:3000/student?preview=student>
- 家长：<http://localhost:3000/parent?preview=parent>

正式登录使用 Supabase Auth。把平台管理员邮箱写入本机 `.env.local` 的 `DEEPTUTOR_ADMIN_EMAIL`；该邮箱完成注册后，首次进入学习空间会映射为 DeepTutor Admin。不要把密钥提交到 Git。

## 生产部署要求

DeepTutor 使用 Docker 长期运行并保存持久化数据，不能把 `localhost` 当成正式站点地址。生产门户需要 `DEEPTUTOR_ENABLED=true`、可从浏览器访问的 `DEEPTUTOR_PUBLIC_URL`、门户服务器可访问的 `DEEPTUTOR_INTERNAL_URL`、以及两端相同的 `DEEPTUTOR_HOST_SSO_SECRET`。Vercel 环境变量变更后需要重新部署。

Supabase 六小时心跳由 `.github/workflows/supabase-keepalive.yml` 执行。GitHub Actions 的 `KEEPALIVE_SECRET` 必须与生产 Vercel 中的值相同。
