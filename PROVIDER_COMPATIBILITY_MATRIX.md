# Provider 兼容性矩阵（Phase 0，非白名单）

## 判定范围

- CoastalTutor Provider registry：`lib/ai/providers.ts`。代码注册 OpenAI、Anthropic、Google、GLM、Qwen、DeepSeek、Kimi、MiniMax、SiliconFlow、Doubao、OpenRouter、Grok、Xiaomi、Ollama、Lemonade、Groq，以及 auto route。模型定义中包含流式和 tools capability 声明；这只说明应用代码的预期能力，不等于真实供应商账号验证。
- DeepTutor 候选固定版：本机 `C:\CoastalTutor\third_party\personal-ai-tutor-runtime` 的官方 `v1.7.1` 源码，commit `f7aed0744c36c5afef16a4261c31ebee1208cac2`；以 `deeptutor/services/provider_registry.py` 和服务实现为准。
- 两个代码注册表可静态映射出 16 个供应商候选（含不同 binding 名称）。“代码级候选”不等于规格要求的“通过真实请求验证”。未使用任何 API Key 发请求，未测试流式、tool/function calling 或 JSON/structured output。当前正式可用白名单：**无（未认证）**。

## 候选对照

| CoastalTutor ID | DeepTutor v1.7.1 binding/近似项 | 静态判断 | Stream / tools / JSON 状态 | 开放决策 |
|---|---|---|---|---|
| `openai` | `openai` | 同 vendor；旧端 OpenAI SDK，DeepTutor 有多个 API format / profile | 两边代码支持相关功能；按具体模型与 format 逐项实测 | 未验证，不开放 |
| `anthropic` | `anthropic` | 同 vendor、native provider 路径存在 | streaming/tools 有原生路径；结构化输出/参数差异须实测 | 未验证，不开放 |
| `google` | `gemini` | 同 vendor但 provider ID/协议不同；DeepTutor 文档默认走 Gemini OpenAI-compatible URL，旧端为 Google SDK | 跨 SDK 工具和受约束 JSON 有差异风险 | 未验证，不开放 |
| `glm` | `zhipu` | 同厂商异 ID | 通常兼容 OpenAI wire format；模型工具调用/JSON 各有差异 | 未验证，不开放 |
| `qwen` | `dashscope` | 同服务异 ID；endpoint/地域可能不同 | OpenAI-compatible 与 DashScope 特性需按模型检查 | 未验证，不开放 |
| `deepseek` | `deepseek` | 同 ID/服务 | 多数是 OpenAI-compatible；推理输出、工具与 JSON 需分别验证 | 未验证，不开放 |
| `kimi` | `moonshot` | 同服务异 ID | OpenAI-compatible 基础路径；长上下文、工具和 JSON 行为需测 | 未验证，不开放 |
| `minimax` | `minimax` | 同厂商；旧端含 Anthropic-compatible MiniMax 路径，DeepTutor 文档默认 OpenAI-compatible URL | SDK/协议端点需统一；不可仅依据厂商名称共享 | 未验证，不开放 |
| `siliconflow` | `siliconflow` | 同 ID/服务 | OpenAI-compatible 基础能力；tool/JSON 依模型支持 | 未验证，不开放；托管 fallback 还需商业许可 |
| `doubao` | `volcengine` | 同一供应商生态但 ID/endpoint 模式不同 | Ark base URL、模型 endpoint、工具/JSON 能力需核实 | 未验证，不开放 |
| `openrouter` | `openrouter` | 同 ID/路由商 | 下游模型能力不同；需限制到逐模型允许能力 | 未验证，不开放 |
| `xiaomi` | `xiaomi_mimo` | 同厂商异 ID | OpenAI-compatible 入口；功能视具体 MiMo 模型 | 未验证，不开放 |
| `ollama` | `ollama` | 同名本地服务 | 网络地址、模型存在性、context/tool 支持依部署配置 | 未验证，不开放 |
| `lemonade` | `lemonade` | 同名本地服务 | 需验证部署可达性、模型以及 tools/JSON 支持 | 未验证，不开放 |
| `groq` | `groq` | 同 ID/服务 | 受支持模型清单决定工具/结构化输出；流式需实测 | 未验证，不开放 |
| `grok` | `xai` | 同 vendor 异 ID；具体默认 Base URL 与 XAI API 格式按模型核对 | 以 XAI endpoint 上的流式/tools/JSON 能力实测 | 未验证，不开放 |
| `auto` | 不适用 | CoastalTutor 内部路由，不是用户供应商 | 选择逻辑与用户凭证/计费边界需分开 | 排除 |

上表静态列出 16 个需验证映射候选；即使厂商相同也不代表已满足默认模型、协议、流式、工具调用及 structured output 全套要求。最终名单必须以本机固定版本源代码、默认模型配置和低成本真实请求测试为准。

## BYOK 现状与建议路径

- CoastalTutor `lib/store/settings.ts` 明确将 settings 与浏览器 `localStorage` 同步；`lib/ai/providers.ts` 在浏览器从 `providersConfig` 读取 Provider 配置，发送 AI 请求时从 client config 取 key。用户可在一个浏览器 profile 中持续保存 key；该 key 并非服务器加密 vault，存在本机 profile、浏览器扩展/脚本和客户端故障上报面。
- CoastalTutor 另有 server Provider 配置读取环境变量/服务器 YAML 的路径，面向服务托管 key；它没有自动把个人浏览器 key 转成用户隔离的 server secret。
- DeepTutor v1.7.1 同时有管理员共享 catalog/grants 和 owner-bound personal LLM profiles；后者在 `deeptutor/multi_user/personal_models.py` 从 owner catalog 合并模型。源码存在 personal credential profile 路径，但尚未审计保存密文/密钥派生、写 API 与输入兼容性，所以仍未确认可直接安全接收平台 BYOK。
- **最小候选方案：** Supabase Auth 仍作唯一平台身份；新增服务端凭据存储只保存 KMS/Secret Manager 加密密文、provider code、验证时间和指纹。DeepTutor 为每个 learner 建立稳定映射，并先核实其 owner catalog/credential store 是否能由可信 adapter 写入；CoastalTutor 的课堂请求经服务器端 adapter 以当前用户身份取密钥。OpenMAIC 前端不再把用户 key 写入 localStorage。密文只在服务请求内解密，不返回浏览器、不写日志；删除/换供应商时同步撤销旧引用。
- 若 DeepTutor v1.7.1 不能可靠按用户解析 credential，先维持 BYOK 不开放，或另外设计受限 gateway；不要把用户个人 key 塞进 admin 全局 catalog，也不要让所有 learner 共用一个 user profile/主密钥。
- Platform AI 与 BYOK 必须按选择模式明确分流。当前测试期经用户明确指定 SiliconFlow 为显式主 Provider；这不启用自动 fallback。商业化前若要把 SiliconFlow 作为面向终端用户的通用托管服务或 fallback，仍需完成转发条款确认。DeepSeek 可用后按配置切换主 Provider；BYOK 不得意外回退到平台 Key。

## 必做的验证矩阵（Phase 4 前置）

对每个候选在 CoastalTutor 和 DeepTutor v1.7.1 各自用同一厂商低成本默认 chat model 验证：API key 无效/有效错误分类、单次文本、SSE/chunk streaming、tool call、JSON schema/structured output、超时与 429、区域和 base URL、模型/协议组合。保存不含 key 的原始状态码和结果；只有两边全部满足产品必需项的供应商才能进入初始选择列表。Embedding/RAG 另列，不从聊天 key 推断可用。

## 第一版定型要求（2026-11-07）

本节记录产品边界；它不是已实现或已验收的功能声明。

### 用户设置与白名单

- BYOK 首次设置只显示 Provider、API Key、Test Connection。Model ID、Base URL、Endpoint、Embedding、TTS/ASR、图像/视频、温度和 Agent 参数由平台维护，不进入普通用户设置。
- CoastalTutor 当前内置 LLM Provider ID 与 DeepTutor v1.7.1 的 canonical provider binding 可静态对应 16 组：`openai/openai`、`anthropic/anthropic`、`google/gemini`、`glm/zhipu`、`qwen/dashscope`、`deepseek/deepseek`、`kimi/moonshot`、`minimax/minimax`、`siliconflow/siliconflow`、`doubao/volcengine`、`openrouter/openrouter`、`xiaomi/xiaomi_mimo`、`ollama/ollama`、`lemonade/lemonade`、`groq/groq`、`grok/xai`。这些是静态候选，不是可用白名单。
- CoastalTutor 另有 `tencent-hunyuan`，DeepTutor v1.7.1 registry 没有对应 provider；因此不属于共同候选。CoastalTutor 的 `auto` 是内部路由，也不是用户 Provider。
- 提供商名称或静态 ID 映射不等于兼容。只有固定模型、认证、协议、流式、普通工具调用和结构化 JSON 测试在两边都通过后，才标记为 `verified` 并显示给 BYOK 用户。当前 `verified` 数量为 0；不得向用户显示候选为已支持。
- 虽然 `ollama` 与 `lemonade` 属于静态交集，第一版托管式 BYOK 页面默认排除这类用户本机 Provider：服务端无法访问用户设备上的 `localhost`，而让用户填写可访问的 Base URL 又违反简化设置目标。将来若提供本机 Agent/Connector，再单独评估。
- Endpoint/地域由平台为每个 Provider 维护一个 canonical 默认值，不让用户输入。若同一供应商的 Key 按地域隔离（例如 MiniMax 的不同平台 Key），第一版只支持已验证的默认地域；其他地域 Key 在 Test Connection 中明确失败，不自动把 Key 发往未配置或未验证的地址。平台若要支持多个地域，需将地域作为一个明确的小选项重新评估用户体验。
- “Test Connection”只验证该用户凭证能否完成平台选定的最小文本请求。它不能替代发布验收所需的 streaming/tool/JSON 集成测试。UI 只提供平台验证过的一个默认聊天模型，换模型由平台目录控制。

### 统一凭证与两个应用

- 目标是一个用户 Provider 和一份 Key 同时服务 DeepTutor 主 LLM 与 CoastalTutor/OpenMAIC 课堂 LLM。不能把浏览器 `localStorage` 继续当共享凭证库，也不能将个人 Key 写进 DeepTutor 全局管理员 Provider catalog。
- 静态审计显示，CoastalTutor 现有客户端设置会把 provider config 与 Key 保存在浏览器设置中；DeepTutor v1.7.1 则有管理员共享 Provider catalog，以及 owner-bound personal model/profile 路径。当前尚未完成 DeepTutor 个人凭证写入、加密、按 owner 解析及撤销路径审计，因此“一次设置同时生效”仍未实现。
- 需要先比较两条实现路径：
  1. **加密用户凭证库 + 两个轻量适配器**：凭证只存一份；适配器分别为当前用户生成 CoastalTutor 请求配置和 DeepTutor owner profile。优点是少一跳、少一个运行服务；代价是需深入修改/适配 DeepTutor 的个人凭证存储，并严格验证租户隔离、更新与删除。
  2. **受限的内部 AI Gateway**：真实 Provider Key 仅存一份；两个应用使用各自服务凭据，Gateway 按已认证用户转发。优点是凭证轮换和 Provider 行为集中；代价是增加服务、网络跳转、流式/tool/JSON 协议兼容层和运行维护责任。第一版不引入大型通用代理平台；如选择此路径，应实现最小所需能力。
- 目前未因“看起来统一”而选定或实现 Gateway。完成 DeepTutor personal profile 安全审计后，再选复杂度更低且能隔离用户的路线。
- API Key 不能出现在浏览器响应、URL、应用日志或第三方分析中。换 Provider、更新 Key、删除账户时，两个应用应同步更新或撤销旧凭证。
- CoastalTutor now has a per-user AES-256-GCM encrypted Supabase credential vault API and an internal token-protected retrieval adapter consumed by both CoastalTutor and DeepTutor LLM runtime resolution. `BYOK_VERIFIED_PROVIDERS` is empty by default, and the branded settings UI stays disabled until real dual-system tests are recorded. Apply `supabase_learner_ai_credentials_migration.sql` and set a base64-encoded 32-byte `LEARNER_CREDENTIALS_ENCRYPTION_KEY` before enabling storage. Existing browser-local LLM keys still need a deliberate migration/retirement path.

### Platform AI 与错误语义

- BYOK 和 Platform AI 是互斥的显式模式。BYOK 请求只使用该用户自己的凭证；不得静默回退到平台 Key。
- Platform AI 第一版仅把 DeepSeek 作为平台主 Provider。SiliconFlow 仅在服务条款和转发授权确认、平台配置启用后作为 fallback；否则 fallback 关闭。不得在实现里默认启动它。
- 平台月成本限制、模型价格和会员额度均来自后台配置，不在业务代码写死，也不显示积分。可记录用户级 token 与成本 ledger；BYOK 不扣 Platform AI 额度。
- Platform AI 达限时返回 `platform_usage_limit_reached`。BYOK 则保留供应商错误类别并映射为可读说明；401、402、429、5xx、timeout 和 provider unavailable 分别处理，不能伪装成平台额度错误。

### 多媒体与 Embedding

- 一个聊天 API Key 只承诺文本 LLM 能力，不推断该 Key 能提供 Embedding、图像、视频、TTS 或 ASR。
- 普通课程优先用 HTML/CSS/SVG/Canvas/JavaScript 生成互动图示；缺少多媒体 Provider 不得使文本课程、测验或总结失败。
- 未配置额外服务时，向用户提供文字、静态图表或互动动画替代，并说明语音/图片/视频当前不可用。已有本地多媒体能力须单独核对运行成本与安全性后才能保留。
- Embedding/RAG 是单独能力。测试阶段可以先明确提示知识库功能未配置；若改用平台共享 Embedding，需另行确定预算、数据传输与隐私边界。

### 验收状态

- 旧版 OpenMAIC 与 DeepTutor v1.7.1 的 provider registry 已做静态读取；上面的 16 组仍待逐家真实请求验证。
- 本次没有向任何供应商发送请求，因此没有产生本次 Provider 测试费用；也没有供应商进入用户白名单。
- 后续真实验收至少包括两应用的最小文本请求、流式、tool/function calling、JSON/structured output、无效 Key、401/402/429、5xx、timeout、地域/Base URL 及 model/protocol 配对。每次只保存非敏感状态和结果，不记录 Key。
- Platform AI 的主/备用路由、月成本上限、用量 ledger、BYOK/平台模式隔离，以及无额外多媒体凭证时的降级行为，是独立验收项，不由 Provider `Test Connection` 代替。
