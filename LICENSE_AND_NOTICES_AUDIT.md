# 许可证与第三方声明审计（Phase 0）

## 仓库内声明

| 项目/目录 | 本地可见版本 | 声明/文件 | 处理要求 |
|---|---|---|---|
| CoastalTutor 根项目（OpenMAIC 演进代码库） | 当前 `coastaltutor@0.2.1`，HEAD `322d824` | `package.json` 与根 `LICENSE` 声明 AGPL-3.0 | 不要按规格中的 MIT 假设替换。若以网络服务运行修改版，核实 AGPL-3.0 第 13 条对远程交互用户提供对应源代码的要求；保留原版权/许可和修改说明 |
| `C:\OpenMAIC-legacy` 初始提交 | `openmaic@0.1.0`, `0d20abf` | package manifest 未声明 license，初始提交根目录也未包含根 LICENSE | 不能据当前版本推断初始提交许可证。追溯其上游准确 commit/tag 和对应 LICENSE，并在分发前法律核查；不要把无文件当成 MIT |
| `packages/mathml2omml` | `0.5.0` | 独立 LICENSE 与 package manifest：LGPL-3.0-or-later | 保留独立声明；修改/打包该子组件时按 LGPL 对应义务处理 |
| `packages/pptxgenjs` | 本地 fork `4.0.1` | package manifest：MIT | 保留版权/许可和本地修改说明；依赖也应单独纳入 SBOM/NOTICE |
| DeepTutor | 本地源树比对为 `v1.7.1`, release commit `f7aed0744c36c5afef16a4261c31ebee1208cac2` | 源目录已有 Apache-2.0 `LICENSE` 和官方 `THIRD_PARTY_NOTICES.md` | 两份文件保持原样；修改源代码时另记录本地 diff；consumer UI 可白标但不能移除法律声明 |
| 中国课程图谱数据 | 已下载快照 `b17bbe759fb38245e86483b1915fce89d79c6662`（2026-11-07） | 上游仓库声明 CC BY-NC 4.0；本地完整文本位于 `public/curriculum/china/LICENSE-CC-BY-NC-4.0.txt` | 产品界面使用 CoastalTutor 名称；保留 `public/curriculum/china/NOTICE.md` 与根 `THIRD_PARTY_NOTICES.md` 的来源、许可和改动记录；商业使用前取得适当授权 |
| npm 依赖、字体/图片/图标、模型、文档 | lockfile/资产引用 | 多种许可/条款，不等同根项目许可 | 需要 SBOM 与第三方 notice 核查；模型权重、字体、课程源文档另行核用途/再分发条件 |
| `C:\CoastalTutor UI\K-9` DOCX | 四个 BC Curriculum 课程文件 | 文件本体未随仓库审计许可元数据 | 保留原文件、来源和署名；核对来源网站/许可和可再分发范围后再打包给用户 |

## 现有 notice 与盲点

- CoastalTutor 根项目有 AGPL-3.0 `LICENSE` 和新增的 `THIRD_PARTY_NOTICES.md`；DeepTutor 子目录自带上游 `THIRD_PARTY_NOTICES.md`。
- 本次没有重新扫描 lockfile 中每个 transitive dependency、媒体资源、字体、示例图片、模型权重或数据文件的许可证全文；需在实际集成/发布前生成 SBOM 并逐项处理冲突和 NOTICE。
- `C:\OpenMAIC-legacy` 初始快照缺根 license 文件；需通过上游 git history 精确对应许可证，不可只看当前上游网页声称整个历史始终适用同一许可证。
- 新品牌可隐藏消费界面的工程项目名，但不能删许可证、源代码版权、开源致谢或必要的 About/source notice。

## 变更说明清单模板

进入实现阶段后，为每个第三方来源增加：项目名、tag/完整 commit、许可证文件版本、改动目录、改动摘要、保留的版权/NOTICE、依赖子组件、对应源代码获取方式。中国课程图谱数据和 DeepTutor 已在根 `THIRD_PARTY_NOTICES.md` 中登记。

## 官方依据

- DeepTutor v1.7.1 README/许可证：<https://github.com/HKUDS/DeepTutor/blob/v1.7.1/README.md>
- DeepTutor v1.7.1 tag：<https://github.com/HKUDS/DeepTutor/releases/tag/v1.7.1>
- CoastalTutor 根 LICENSE 与 package manifests：本地审计对象。
