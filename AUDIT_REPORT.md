# Phase 0 审计报告

审计日期：2026-11-04（America/Vancouver）  
说明：本文保留为 Phase 0 历史审计快照；当前实现状态以 `IMPLEMENTATION_STATUS.md` 为准。
范围：`C:\CoastalTutor`、新增的 `C:\CoastalTutor\third_party\personal-ai-tutor-runtime`、独立工作树 `C:\OpenMAIC-legacy`、本机找到的课程文档 `C:\CoastalTutor UI\K-9`，以及 DeepTutor 官方 `v1.7.1` 发布资料。
Phase 0 完成后，项目负责人指示继续；Phase 1 的本地备份、版本锁和服务端配置基础已完成。未改生产数据库、未部署服务、未测试任何真实供应商 API。

## 结论摘要

1. **实际二次开发平台是 `C:\CoastalTutor`。** 它是基于 OpenMAIC 代码演进的 CoastalTutor 教育平台，当前 `package.json` 为 `coastaltutor@0.2.1`，检出 `main` 分支，HEAD `322d824f4945f57776dffff62bd47dac6196d9f1`（2026-05-16）。仓库远程为 `https://github.com/uploasoulai/tutor.git`。当前仓库有用户未提交改动，必须保留。
2. **`C:\OpenMAIC-legacy` 是刚才单独检出的原始初始提交，不是那份已二次开发的平台。** 它是 detached HEAD `0d20abf`，`openmaic@0.1.0`，当前干净；该目录没有 Supabase schema、教育门户、Vercel 配置或 Docker 文件。不要把后续整合直接做在这个初始快照上。
3. 主仓库已有 Next.js/Vercel 配置、Supabase Auth 集成、学生/家长/教师/管理员路由、BC 课程检索与学习记录设计；**没有发现 Stripe 支付代码**。Vercel 配置证明项目适配 Vercel，但没有本地 Vercel 项目绑定或可核实的线上部署元数据，因此无法确认生产项目、域名或当前部署 commit。
4. 本机找到四份 BC K–9 DOCX 源文件，但它们在 `C:\CoastalTutor UI\K-9`，不在 Git 仓库中。seed 脚本预期写入 Supabase。数据库表的远程只读查询失败（Supabase 请求返回 `fetch failed`），因此**已导入年级、科目和主题数量仍待数据库连通后核实**。
5. 当前 OpenMAIC/CoastalTutor BYOK 设置主要在浏览器 `localStorage`，不是用户隔离的服务器端密钥库。它不能直接安全共享给 DeepTutor。DeepTutor 源码已合入 `C:\CoastalTutor\third_party\personal-ai-tutor-runtime`，版本 `1.7.1`，与官方 commit `f7aed0744c36c5afef16a4261c31ebee1208cac2` 逐文件比较后内容一致（仅行尾不同）；源码目录本身没有 Git 元数据。官方材料显示多用户隔离工作区、Admin/Learner 和显式 Guardian 授权，但没有 Teacher 角色。它原生提供 per-user model/profile 能力，但需审计其 API Key 保存、加密和 owner 隔离后才能判断能否作 BYOK adapter。
6. **当前没有可批准给用户的共同 Provider 白名单。** 两边存在一批可静态映射的候选供应商，但实际请求、流式、工具调用和结构化输出均未对固定 DeepTutor 版本完成验证。兼容表按候选而非已验证白名单记录。

## 仓库、版本和本地状态

| 目录 | 状态 | 识别结果 |
|---|---|---|
| `C:\CoastalTutor` | `main`，HEAD `322d824`；`main...tutor/main`；远程 `origin`、`tutor` 均指向用户 GitHub `tutor` 仓库 | 当前主要二次开发项目；`package.json` 名称/版本 `coastaltutor@0.2.1`；依赖 Next.js `16.1.2`、Node `22.x`；有 OpenMAIC 上游代码历史和大量本地教育平台提交 |
| `C:\CoastalTutor\third_party\personal-ai-tutor-runtime` | 已纳入 CoastalTutor 主仓库；无独立 `.git` 或子模块；本地运行数据单独保留且不提交 | 固定上游版本及改动边界记录在 `UPSTREAM_VERSION.md`；保留 Apache LICENSE 和 `THIRD_PARTY_NOTICES.md` |
| `C:\OpenMAIC-legacy` | detached HEAD `0d20abf`；无工作区改动 | 原始 `openmaic@0.1.0` 初始快照，不包含 CoastalTutor 后续教育平台功能 |
| `C:\CoastalTutor UI\K-9` | 普通数据目录，不是 Git 仓库 | 四份课程 DOCX，详见课程清单 |

`C:\CoastalTutor` 当前未提交文件：已修改 `app/layout.tsx`；未跟踪 `components/global-nav.tsx`、`test_output.txt`、`test_output_interaction.txt`。本审计没有覆盖、清理或重置这些改动。没有发现 `.gitmodules` 或已登记 Git 子模块。仓库历史有多条上游分支引用和本地教育产品提交；当前工作区不是官方 OpenMAIC 主线的干净 checkout。

沿革中可见 `337e2e6`（CoastalTutor phase 1 integration）、`1543ecd`（重做 auth / 年级科目 / 品牌）、`40c28c3`（移除 OpenMAIC 痕迹并重做 UI）、之后的课程、家长、教师、课堂和课程生成提交。它们说明这不是“原封不动的 OpenMAIC”，但 `git log` 不能单独证明每个改动目前都上线或曾部署。

## 页面与已完成程度（代码静态盘点）

- 页面入口包括 `/login`、`/signup`、`/reset-password`、`/onboarding`、`/student`、`/student/lesson`、`/student/ap-prep`、`/parent`、`/teacher`、`/admin`、`/classroom`、`/generation-preview`、`/explore`。现有 `README.md` 仍是 “Coming soon”，没有完整产品/部署手册。
- 学生端已有学习计划、课程生成/同步、课程播放、答题与学习进度/掌握度、学习会话等 API 和 Supabase 模型；包含 Grade 1/2 的离线或 fallback 教学目标。不能把它等同 DeepTutor 的成熟自主学习工作区。
- 家长端已有关联学生列表、报告历史、日报生成及定时任务相关 API。教师端已有学生列表/摘要、学生详情、提醒/告警列表和处理 API。两者是实际代码，不是空页面；但没有完整验收证据，也不能据静态存在就判定生产安全或功能完整。
- 管理员端包括关系目录/关系管理、运维状态等代码。API 使用服务端 Supabase admin client，因此每个入口必须检查已验证用户及角色；部分功能是否齐备需结合逐路由验证。
- 互动课堂、白板/演示、生成预览以及媒体提供商代码保留在 CoastalTutor；提交 `40c28c3` 移除了显式 OpenMAIC 品牌痕迹，之后仍保留或重做了教学课程生成流程。这些模块适合先 KEEP/ADAPT，再决定如何做统一入口。
- 未发现 Stripe SDK、Stripe webhook/checkout 或支付表结构；会员/订阅体系尚无可确认实现。

## 认证、数据库、部署和数据现状

- Supabase Auth 是现有网页登录实现，使用 `@supabase/ssr` cookies；服务器端角色读取依赖 `profiles`，角色记录不存在时才回退到服务端维护的 `app_metadata`。已移除用户可自行编辑的 `user_metadata.role` 授权路径。已有角色类型 `student / parent / teacher / admin`。
- `supabase_schema.sql` 声明 profiles、students、parents、teachers、家长/学生关系、教师/学生关系、课程标准、学习成果、掌握度、会话、答题、XP、徽章、家长报告和教师提醒等表；`supabase_phase1_migration.sql` 包含增列、将 embedding 改为 512 维并清空既有 embedding 的破坏性操作。该迁移若尚未运行，必须先核实现有数据并备份；不得直接执行。
- 两份 SQL 都没有声明 RLS 启用或策略。业务读取/写入普遍由 server-side service-role helper 执行，因此安全边界依赖每个 API 路由授权与 owner/relationship 过滤。静态扫描看到部分接口会先验证角色、部分服务层使用 `user.id` 或 relationship 过滤；还没有逐端点越权审计或线上 RLS 实况核实。
- `.env.example` 与 `.env.local` 中的变量名已记录在本报告审计过程，但本报告不记录值。`.env.local` 被 `.gitignore` 忽略。Supabase URL/服务密钥变量已配置；由于网络请求失败，未读取任何用户记录或个人资料。
- `vercel.json` 指定 Next.js、`pnpm install`/`pnpm build`，API function 最大时长 300 秒；`Dockerfile` 和 Compose 同时支持长驻 Node 容器，并挂载 `/app/data`。因此仓库支持 Vercel 和 Docker 两种运行方式，但**实际生产选择/项目绑定未知**。没有 `C:\CoastalTutor\.vercel` 元数据。当前配置不是证据证明旧部署仍在线。
- 从 Serverless 角度，长任务最长 300 秒仍受平台执行时限/请求生命周期约束；课堂生成有异步 job 同步路径。Phase 0 未发现必须迁服务器的确定证据，建议保持 Vercel 形态，先验证线上设置与课堂任务成功率。
- 仓库没有独立 Supabase migration 目录；目前是根目录 SQL 文件，迁移执行历史只能在 Supabase 项目端核对。未发现课程资料上传 bucket、Storage bucket 声明或 Edge Function 源码；这不代表远端不存在。

## DeepTutor 固定版本审计

- 官方发布页截至审计日显示稳定版 `v1.7.1`，发布日期 2026-10-31，标记 commit `f7aed07`。许可证为 Apache-2.0。官方发布材料支持 Docker `ghcr.io/hkuds/deeptutor:1.7.1` 及长期运行服务；它不是 Vercel serverless 函数包。
- `C:\CoastalTutor\third_party\personal-ai-tutor-runtime` 的源树版本为 `1.7.1`。用 `git ls-remote` 核对官方 `v1.7.1` tag 后，commit 完整 SHA 为 `f7aed0744c36c5afef16a4261c31ebee1208cac2`；与本地及临时官方 tag checkout 比较 4,471 个文件，路径大小写归一化且行尾归一化后内容相同。本地目录没有 `.git`，所以由 [UPSTREAM_VERSION.md](third_party/personal-ai-tutor-runtime/UPSTREAM_VERSION.md) 记录来源和锁定版本；Compose 的 GHCR image 已固定到 `1.7.1`。未启动服务或写入 runtime data。
- `v1.7.1` 多用户模式为可选认证、服务端多用户工作区：Admin 管理 Provider/model catalog、凭据、用户和 grant；Learner 类型锁定学习权限并有 adaptive profile/device credentials；授权 Guardian 能查看报告、批准资料、重置凭据。用户工作区按 UID 隔离。Admin 创建用户时有 Standard/Learner/Custom 等类别。
- 官方文档没有 Teacher role 或班级教师管理能力。Guardian 相关功能不等于独立家长登录/家庭关系体系；需要结合版本源代码确认 Guardian 的账号身份、关联创建/撤销和报告范围，不能与 Supabase parent 表直接视作兼容。
- Provider 文档中配置的是连接和模型 profile；多用户管理采用管理员维护共享凭据及 grants，同时 v1.7.1 代码存在 owner-bound personal LLM profile 能力。尚未验证其通用 API Key 的密文保存位置、默认格式和跨服务 adapter 接口，因此不能据此宣称已满足平台统一 BYOK。

## Phase 1 已完成

- 回滚分支：`codex/phase1-backup-20261104`，指向原 HEAD `322d824f4945f57776dffff62bd47dac6196d9f1`。
- 当前工作分支：`codex/phase1-foundations-20261104`。分支均为本地分支，未推送。
- 恢复包：`C:\CoastalTutor-phase1-backup-20261104`，包括 `CoastalTutor.bundle` 和工作区快照；明确排除了 `.env.local` 等运行时密钥文件。Bundle 已验证完整。
- DeepTutor upstream pin：新增 `third_party/personal-ai-tutor-runtime/UPSTREAM_VERSION.md`，锁定 tag/commit；集成用 Compose 从固定源码构建本地镜像，另一个 GHCR compose 继续固定 `1.7.1`。
- 功能/连接配置：新增 server-only `lib/server/deeptutor-config.ts` 和 `.env.example` 变量 `DEEPTUTOR_ENABLED`、`DEEPTUTOR_PUBLIC_URL`、`DEEPTUTOR_INTERNAL_URL`、`DEEPTUTOR_HOST_SSO_SECRET`。功能默认关闭；服务端校验密钥最小长度。
- 生产 Supabase、Vercel 与任何运行中 DeepTutor 数据未改。

## Phase 3 已实现的本地代码（尚未部署）

- CoastalTutor 新增 `/api/deeptutor/launch`：要求有效 Supabase 会话；仅由 `profiles.role` 或可信 `app_metadata` 判定角色；教师拒绝接入；家长关联从 `parent_student_links` 服务端读取；签发 60 秒 HMAC-SHA256 票据并用跨站 POST 送往集成服务，不把票据写入 URL。
- DeepTutor 新增票据兑换：校验签名、issuer/audience、过期时间、jti 重放；生成原生 `dt_token` HttpOnly cookie；以 Supabase UUID 派生稳定 workspace UID；不接受本地密码注册/登录；仅管理员票据可在空账户库引导建立首个管理员。
- 学生映射到 DeepTutor `user` + `learner` preset；家长映射为普通账户，并只同步 `view_reports` Guardian 权限；平台管理的关系与用户自建关系分开标记。DeepTutor 教师入口未作为平台身份开放。
- DeepTutor `compose.yaml` 本地构建集成源代码，而 GHCR 官方镜像不含这些改动。只有完成运行配置、认证开关和共享密钥设置后才能启动 SSO；当前尚未部署、未创建运行数据，也未改 Supabase/Vercel。
- 教师账户按本版本策略休眠：注册页不再提供教师选项；旧教师路由由 layout 重定向，角色授权 helper 对 teacher 返回拒绝，因此现有教师 API 不能访问。原教师页面和数据保留在仓库中。
- 本地代码未运行测试或服务。接下来需配置 DeepTutor `auth.enabled=true`、双边密钥、域名/反向代理以及启动入口，再按 Phase 7 执行授权和隔离测试。

## 关键风险与待核事项

1. **仓库定位/部署绑定：** 主站当前仓库和独立原始快照不能混为一谈。先确认线上域名、Vercel project ID、当前 deployment commit、Supabase project reference；不回写任何线上设置。
2. **遗留数据无法通过本地静态文件确认：** Supabase 请求失败，必须等连通后只做只读聚合查询，再计划迁移。当前不得执行 `supabase_phase1_migration.sql`。
3. **RLS 与 service role：** 缺少仓库内 RLS 定义，service-role 绕过 RLS；必须先完成所有端点的授权矩阵和对象级过滤审计，再设计跨模块身份适配。
4. **学生未成年人数据：** 学习记录、对话/课程内容、家长授权范围需要确定隐私政策、保留期限和最小化访问规则。DeepTutor Guardian 的可见范围要实测。
5. **BYOK 明文暴露面：** 浏览器端持久化能被同一浏览器 profile 的脚本/本机用户访问；不能将该值直接同步到 DeepTutor 的服务器 workspace。必须先定义加密密钥管理、密文存储和请求代理责任边界。
6. **课程解析准确性：** ADST 源文件标题是全名，而 seed 配置期望的标题关键字为 `ADST`；现有匹配方式会漏掉该文件内容。即便本地有四份 K–9 文档，也不能假定四个学科数据均已入库或完整。
7. **迁移 SQL：** 现有迁移将所有旧 embedding 值置 NULL，以适配 512 维模型，可能丢失已生成向量；运行前应导出/重嵌入并验证记录数。
8. **许可：** CoastalTutor 根项目声明 AGPL-3.0；不能按规格中的“OpenMAIC 是 MIT”直接覆盖事实。`mathml2omml` 是 LGPL-3.0-or-later，`pptxgenjs` 是 MIT。发布修改后的网络服务时需评估 AGPL 第 13 条源码提供义务；应核实修改和分发方式。
9. **没有成功的真实供应商验证：** 所有候选兼容性只能做文档/代码级映射，不允许据此构建最终可见名单。
10. **审计范围未包含云端账户/配置：** 未访问 Vercel、Supabase 控制台、Stripe 或用户生产账户；配置值未输出。

## 后续实施顺序

1. 配置并启动本地集成版 DeepTutor，先验证 SSO、角色、Guardian 关系和跨用户隔离；未通过前保持 `DEEPTUTOR_ENABLED=false`。
2. 接入统一 Dashboard 入口；新首页视觉按用户后续提供的设计实施。
3. 再做 Provider/BYOK 的密钥存储和双模块适配；目前不允许把浏览器 localStorage Key 直接同步到服务器。
4. 只读连通 Supabase，核实迁移历史、RLS、课程行数/年级/科目/主题、关系与 storage bucket；保存脱敏聚合结果。
5. Provider 只在固定版本、真实供应商低成本请求、stream/tools/JSON 能力验证后开放；审核前兼容表中没有“已批准”供应商。

## 环境变量名称（值未记录）

`.env.local` 实际出现的名称见仓库 `.env.example`；当前业务可识别的类别包括 Supabase URL/public/service secrets、LLM provider key/base URL/model 列表、媒体/TTS/ASR/PDF/search/embedding 配置、默认模型/路由选项、app URL 与定时任务 secret。完整变量名清单不在此重复；可从 `.env.example` 核对。`.env.local` 的任何值均未读入报告。

## 官方参考

- DeepTutor v1.7.1 发布：<https://github.com/HKUDS/DeepTutor/releases/tag/v1.7.1>
- DeepTutor v1.7.1 README：<https://github.com/HKUDS/DeepTutor/blob/v1.7.1/README.md>
- DeepTutor 多用户部署：<https://docs.deeptutor.info/get-started/multi-user/>
- DeepTutor Provider 配置：<https://docs.deeptutor.info/get-started/providers/>
- OpenMAIC 上游仓库：<https://github.com/THU-MAIC/OpenMAIC>
