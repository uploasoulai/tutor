# 遗留课程目录清单（Phase 0）

## 查找范围与结论

- Git 仓库：`C:\CoastalTutor`。根目录 schema 与 `scripts/seed-bc.ts` 定义课程数据库/导入逻辑；仓库内未找到 DOCX、JSON、CSV、YAML 课程内容导出或 seed 记录集。
- 本机课程资料：`C:\CoastalTutor UI\K-9`，发现 4 个 `.docx` 文件，每个文件名都标示 K–9；文件不在 Git 管理内。
- Supabase 结构：`bc_subjects` 记录科目代码、名称、年级与来源文件；`bc_learning_outcomes` 记录标准/主题、展开说明、chunk、排序、难度、源文件、embedding；RPC `match_bc_learning_outcomes` 用于检索。
- Supabase 项目 URL/服务密钥变量已配置，但远程只读请求失败（fetch failed）。因此以下是**本地源资料和导入器覆盖范围**，不是数据库实际行数报告。数据库中实际存在多少记录、哪些文档导入成功、是否重复/损坏，都未能确认。

## 找到的源文档

| 文件 | 源领域 | 文件覆盖范围（文档标示） | seed 配置名称 | 状态 |
|---|---|---|---|---|
| `en_mathematics_k-9_elab.docx` | Mathematics | Kindergarten–Grade 9 | Mathematics / Math | 可读 DOCX；导入器按年级切分标准及 elaborations |
| `en_english-language-arts_k-9_elab.docx` | English Language Arts | Kindergarten–Grade 9 | English Language Arts / Language Arts | 可读 DOCX；K–9 |
| `en_arts-education_k-9_elab.docx` | Arts Education | Kindergarten–Grade 9（Grade 9 含 General、Dance、Drama、Music、Visual Arts 等分支） | Arts Education / Arts | 可读 DOCX；年级 9 内容有课程分支，导入器需核查是否可无损表示 |
| `en_adst_k-9_elab.docx` | Applied Design, Skills, and Technologies | Kindergarten–Grade 9（部分年段按组合年级呈现） | 导入器设置为 `ADST` | **确定的映射缺陷：** DOCX 标题写全称 `APPLIED DESIGN, SKILLS, AND TECHNOLOGIES`，导入器查找字面 `Area of Learning: ADST`，无法命中标题，预计该文件所有年级导入为 0 条，须修正后另行验证 |

这些文件的名称和正文属于 BC Curriculum 课程资料。脚本表名 `bc_*`、文件名、页面默认年级并不能证明 Supabase 实际数据完整或为正式官方课程记录；需保留 `source_file` 和来源/许可元数据。

## 导入逻辑中的年级/科目覆盖

`scripts/seed-bc.ts` 明确循环 Kindergarten 与 Grade 1–9，并只配置 Mathematics、English Language Arts、Arts Education、ADST 四个 subject type。即使 DOCX 文件包含 K–9，导入器对 ADST 的字段映射问题会造成漏入。脚本对每个识别到的标准生成 `outcome_code`、`chunk_text`，请求 Voyage embeddings，再 upsert 到 Supabase；这只是导入机制，不是实际数据存在证明。

当前检索到的 fallback 课程目标主要是 Grade 1/2 数学例子；`DEFAULT_GRADE` 设为 Grade 2。它们属于应用内 fallback，不代表 BC 标准库实际覆盖范围。

## 关系和完整性

`bc_subjects.code` 预期为如 `MATH-K` / `MATH-2`；`bc_learning_outcomes.subject_id` 关联科目，另用 `source_file`, `chunk_index`, `outcome_code`, `sequence_order`, `metadata.embedding_model` 跟踪来源、顺序和 embedding。SQL 对 outcome code 做唯一约束，但没有显式检查课程源版本、导入批次或每个年级预期行数。

`supabase_phase1_migration.sql` 把 outcome embedding 列改成 `vector(512)`，使用 `USING NULL::vector(512)` 清空已有向量。若执行迁移会丢失现有向量；运行前导出旧数据/确认可重建，并与运行历史比对。

## 实际记录数

| 项目 | 本地可确认 | 远端数据库核验 |
|---|---|---|
| DOCX 源文件数 | 4 | 不适用 |
| 源文件名包含的年级范围 | K–9 | 不代表已导入 |
| 导入器配置的领域 | Math、ELA、Arts、ADST | `bc_subjects` 行数未知 |
| `bc_learning_outcomes` 总数/年级分布 | 无本地数据导出 | **未知：远端连接失败** |
| 每科目主题/标准数量、重复/损坏数 | DOCX 可解析，但未作为 DB 记录验证 | **未知** |

本地脚本使用的结构化提取逻辑依赖英文标题和段落 marker。初步检查发现 ADST 匹配必失败；Arts Grade 9 有多个课程分支；不得将未经逐文件复核的解析行数报告成数据库课程主题数量。

## 建议保留/迁移

1. 先对四个 DOCX 做只读清单和来源/许可核查，并将原件复制到正式受控备份；不要只保留在 `C:\CoastalTutor UI\K-9`。
2. 修正 ADST 标题映射前，不要运行 seed；先对每个文件按 K–9 输出预览，人工抽查中英文/段落完整性、重复 outcome 和主题层级。
3. Supabase 连通后仅查询聚合：subject 的 grade/area/source_file 分布，outcome 的 subject_id/source_file 数量、重复 key、空文本、embedding 维数和中文字符完整性。不要先执行改变 embedding 的迁移。
4. 导出并校验的数据再规划为 optional curriculum pack；保留来源、年级、科目、原始 source file 和来源版本。没有记录的年级/学科不补齐，BC 标准不作为平台强制框架。
