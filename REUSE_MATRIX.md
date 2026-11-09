# 旧平台复用矩阵（Phase 0）

| 旧组件/数据 | 当前状态 | 处理方式 | 目标位置 | 风险/验证 |
|---|---|---|---|---|
| Personal AI Tutor runtime source | 已归档于 `C:\CoastalTutor\third_party\personal-ai-tutor-runtime`，固定上游版本及本地改动记录在 `UPSTREAM_VERSION.md`；运行时数据独立保留且不提交 | **KEEP / PIN**；保留上游许可及通知 | Personal AI Tutor | Apache-2.0；账号桥和 BYOK 已进入实现，持续维护时需按固定版本审查上游变更 |
| Supabase Auth 与 Next.js 登录/注册/重置密码 | 已有 `/login`、`/signup`、`/reset-password`、callback；server/client Supabase helpers | **KEEP / ADAPT** | 平台唯一公开身份入口 | 检查线上 Supabase project、JWT claim、角色来源和账号恢复；不要另建 Auth 项目 |
| `profiles`, `students`, `parents`, `teachers` | SQL schema 已定义；远端记录数未知 | **KEEP / MIGRATE 后映射** | Supabase 主身份和外部 module identity map | 现有角色和 DeepTutor 用户类别不同；要先做稳定 UID 映射、重复账号处理及家长授权审计 |
| `parent_student_links`, `teacher_student_links` | SQL 和 API/服务层均存在 | **ADAPT / DEFER** | 家庭授权沿用 Supabase；教师 Phase 1 隐藏 | 部分 API 使用 service role；逐端点验证关系过滤、撤销和 IDOR |
| 学生端 `/student`、学习计划、课程播放 | 实际代码已实现，含动态课程和 fallback | **ADAPT** | School Learning 入口/与 DeepTutor 学习空间协调 | 与 DeepTutor 重复的学习计划、笔记和历史需定义唯一 owner；不双写相同记录 |
| 学生课程会话、答题、掌握度、XP、徽章、提醒 | SQL schema 与服务层存在 | **KEEP / MIGRATE**（仅先导出映射） | 保留平台审计数据；必要时适配 DeepTutor 学习记录 | 数据库真实数量未知；不要删除旧表或将旧记录等同 DeepTutor 的 mastery 语义 |
| BC 标准搜索/RAG 与 512 维向量 | `bc_subjects`, `bc_learning_outcomes`, `match_bc_learning_outcomes`；使用 Voyage embedding | **KEEP / ADAPT** 为 optional curriculum pack | 先作为外部课程上下文/共享资料 | DB 状态未知；seed 解析有 ADST 标题不匹配；现有 migration 会清空 embedding |
| 四个 K–9 课程 DOCX | `C:\CoastalTutor UI\K-9`，不属于 Git 仓库 | **KEEP / MIGRATE**（先备份并核对 provenance） | 可选课程包，不能在仓库中补造课程 | 文件是 BC K–9 官方课程领域名，但实际版本/来源需核文件元数据及版权；迁移前对账 |
| 家长页面、家长关联学生、学习报告 | UI/API/日报生成代码存在 | **ADAPT / DEFER** | 深度学习应用的 Guardian 体验经授权后展示 | DeepTutor guardian 控制不是现成 Supabase 映射；报告隐私/私密对话范围需用户策略 |
| 教师页面、教师班级/学生摘要、告警 | 有页面、API 和关联表，非空壳；完成度/生产安全未知 | **DEFER / HIDE**，保留源码 | Phase 1 无 Teacher Portal | DeepTutor 官方没有 Teacher role；不可把 Admin/Guardian 包装成教师 |
| Admin 关系管理和运维 API | 代码存在，部分有 admin auth | **KEEP / ADAPT** | 平台运营管理 | 确认所有写路径都调用 `assertAdminUser` 等服务端授权，不依赖 UI 隐藏 |
| `/classroom`、生成预览、互动白板/演示 | 旧课堂栈的主要产品模块；当前 CoastalTutor 使用自有课程引擎和生成流程 | **KEEP / ADAPT** | 用户入口 Interactive Classroom | 逐项盘点旧课程存储、播放兼容性、job 中止/恢复和用户归属；保持当前版本和部署可回滚 |
| OpenMAIC BYOK / Provider Settings | Provider 设置 UI 丰富，但 key 值在 `localStorage` / browser state | **ADAPT** | 统一设置服务的 OpenMAIC adapter | 不可直接复制浏览器明文 key 到 DeepTutor；旧版需用用户隔离的请求代理或经审查的 workspace profile adapter |
| 服务端 Provider 环境变量 | `server-providers.yml`/环境变量支持平台托管 provider | **KEEP**（只供平台运行配置） | 平台托管 AI 配置 | 当前没有用户级 usage ledger、key 隔离/成本上限的充分证据；不要把平台 key 返回前端 |
| 多媒体 API 设置 | 有 TTS/ASR/图片/视频/PDF 多组 UI 与 server adapter | **DEFER / HIDE** 第一版 | 后续可按平台能力逐步开关 | 多媒体成本、供应商条款和隐私未审；普通文本流程应避免依赖它们 |
| Vercel 配置 | `vercel.json` 配置 Next.js functions，最大时长 300 秒 | **KEEP**（先核线上） | 主门户/课堂前端和当前可运行服务 | 未确认线上项目、当前 deployment；不为迁移而迁服务器 |
| Dockerfile/Compose | 可构建 Node 22 standalone 容器，挂载 `/app/data` | **KEEP** | 本地/长驻部署回滚选项 | `.env.local` 被 Compose 引用；生产 secrets 和 volumes 需独立配置 |
| Stripe/支付 | 仓库搜索未发现 Stripe 包、路由、schema 或 webhook | **DEFER** | 暂无目标位置 | 规格提到的会员系统不应据此假定已有实现；经营价格/用量规则另行确认 |
| `C:\OpenMAIC-legacy` 初始工作树 | `0d20abf`, `openmaic@0.1.0`，干净的 detached worktree | **KEEP** 作为只读恢复点 | 上游初始 OpenMAIC 参考 | 不含本地教育功能；不把它当生产备份，也不要在此替换当前开发目录 |
| 用户当前未提交变更 | `app/layout.tsx` 修改；`components/global-nav.tsx`、两个 `test_output*.txt` 未跟踪 | **KEEP** | 原仓库现位置 | 本阶段未碰；后续修改前逐项查看并单独提交/备份，不删除日志文件 |

标签定义：KEEP=继续保留；MIGRATE=备份和校验后迁移；ADAPT=保留能力并适配接口/身份；DEFER/HIDE=暂不交付，保留源码。
