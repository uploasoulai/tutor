# CoastalTutor 本地开发

CoastalTutor 是面向学生与家庭的学习门户。School Learning 按课程路线和知识图谱组织互动课堂；Personal AI Tutor 直接进入 DeepTutor。两者共用同一平台学习者身份和登录。Interactive Classroom 保留旧版互动课堂能力。教师入口暂不启用。

## 启动本地学习服务

先在 Docker Desktop 启动后端与网页：

```powershell
powershell -ExecutionPolicy Bypass -File .\scripts\start-personal-ai-tutor.ps1
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

## 中国课程学习

入口：登录后打开 `/school-learning/china`。当前数据包括数学、英语、语文、物理、科学、道德与法治、历史、地理、生物和化学知识点，以及先修关系、课程标准映射、题库和可选教材目录映射。原始题库与答案放在服务端 `curriculum_data/china`，不会由静态网站公开直链；页面只经登录后的 API 获取当前练习内容。学生课程由这些课程目标生成 CoastalTutor 互动课堂；学习会话写入现有 `learning_sessions`，答题掌握度使用现有平台 learner ID。

新的掌握度/答题记录需要在目标 Supabase 项目执行一次增量 SQL：`supabase_china_curriculum_migration.sql`。该文件只新增平台课程进度表与原子答题函数；此工作区尚未连接或修改生产数据库。数据来源、下载快照和许可记录见 `THIRD_PARTY_NOTICES.md` 与 `public/curriculum/china/NOTICE.md`。
