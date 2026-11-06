# Provider 兼容性矩阵（Phase 0，非白名单）

## 判定范围

- CoastalTutor Provider registry：`lib/ai/providers.ts`。代码注册 OpenAI、Anthropic、Google、GLM、Qwen、DeepSeek、Kimi、MiniMax、SiliconFlow、Doubao、OpenRouter、Grok、Xiaomi、Ollama、Lemonade、Groq，以及 auto route。模型定义中包含流式和 tools capability 声明；这只说明应用代码的预期能力，不等于真实供应商账号验证。
- DeepTutor 候选固定版：本机 `C:\CoastalTutor\DeepTutor` 的官方 `v1.7.1` 源码，commit `f7aed0744c36c5afef16a4261c31ebee1208cac2`；以 `deeptutor/services/provider_registry.py` 和服务实现为准。
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
- Platform AI 与 BYOK 必须按选择模式明确分流。DeepSeek 主服务和 SiliconFlow fallback 均需配置、商业 SaaS 转发条款确认和 usage ledger；不得让 BYOK 意外回退到平台 key。

## 必做的验证矩阵（Phase 4 前置）

对每个候选在 CoastalTutor 和 DeepTutor v1.7.1 各自用同一厂商低成本默认 chat model 验证：API key 无效/有效错误分类、单次文本、SSE/chunk streaming、tool call、JSON schema/structured output、超时与 429、区域和 base URL、模型/协议组合。保存不含 key 的原始状态码和结果；只有两边全部满足产品必需项的供应商才能进入初始选择列表。Embedding/RAG 另列，不从聊天 key 推断可用。
