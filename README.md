# SPARK AI Hackathon

<!-- [English](/docs/README_EN-US.md) | [简体中文](/docs/README_ZH-CN.md) -->

<!-- 
📌 占位符说明：
- [BANNER_IMAGE_PATH] - 活动主视觉图片路径
- [ACTIVITY_THEME] - 活动主题
- [REGISTRATION_FORM_LINK] - 报名表单链接
- [VIDEO_TUTORIAL_BILIBILI] - Bilibili 教程视频
- [VIDEO_TUTORIAL_YOUTUBE] - YouTube 教程视频
- [ZOOM_LINK] - Demo Day Zoom 链接
-->

☄当 AI 撞击 Web3，让创意真正落地

**SPARK AI Hackathon** 是一场面向所有人的 **休闲黑客松（Casual Hackathon）**。

这里不比通宵、不拼履历、不设隐形门槛——我们关心的，从来不是你写了多少行代码，而是你的想法，是否真的能点燃火花。

## 📊 活动主视觉（Hero Image）

![Agent Hack Banner][BANNER_IMAGE_PATH]

## 报名方式与议程安排（Registration & Schedule）

📍 线上举行｜自由报名（面向所有人）

| **活动** | **时间** | **形式** | **相关链接** |
| --- | --- | --- | --- |
| **开始报名** | 2026 年 1 月 26 日 20: 00 (UTC+8) | 📍 线上 | [**👉 点击此处报名**](https://github.com/CasualHackathon/SPARK-AI-Hackathon/issues/new?template=register.md) |
| **Demo 提交截至** | 2026 年 2 月 1 日 12: 00 (UTC+8) | 📍 线上 | [**👉 点击此处提交 Demo**](https://github.com/CasualHackathon/SPARK-AI-Hackathon/issues/new?template=submission.md) |
| 🗓**Open Day** | 2026 年 1 月 28 日 19:00-20:30 (UTC+8) | 📍 线上 | [Zoom 链接][ZOOM_LINK] |
| **Workshop** | 2026年 1月19日 | 📍 线上 | [Zoom 链接][ZOOM_LINK] |
| 🏁**Demo Day** | 2026 年 2 月 1 日 20:00-22:00 (UTC+8) | 📍 线上 | [Zoom 链接][ZOOM_LINK] |
|  |  |  |  |
|  |  |  |  |
|  |  |  |  |

**报名教程：**

- [Bilibili][VIDEO_TUTORIAL_BILIBILI]
- [YouTube][VIDEO_TUTORIAL_YOUTUBE]

### **注意事项：**

1. 禁止修改他人信息。
2. 提交 Demo 时必须先完成注册，否则提交无效。
3. 提交资料时，只在对应位置填写信息，不要修改其它基础内容，特别是 issues title。
4. 提交报名后，预计1分钟内会显示在报名/提交列表页面（`docs/REGISTRATION.md`），如未显示请联系相关技术人员。
5. 提交 Demo 时，请先 Fork 当前代码库，然后将 Demo 相关代码，放到以你 Github ID 命名的目录下，如：`/submission/[your-github-account]`，然后再提交 PR，我们会在审阅后合并，禁止修改其它信息。

## 💰 奖励形式（Awards & Prizes）

本次黑客松采用 **奖金池 (Prize Pool)** 形式发放奖励，总奖金池高达 **$2,500 USDT**。

## 🏁 赛道与资源导航 (Tracks & Resources)

本次黑客松共设立三个核心赛道及一个通用工具支持。请选择你感兴趣的方向，直接获取对应资源。

---

### 1. 💸 支付赛道 (Payment Track)
> **支持方**: Kite AI

**🎯 核心目标**
探索 AI/Agent 场景下的自动化支付、链上结算与资金流转方案。我们需要看到 AI 不仅仅是“聊天”，还能真正地“产生交易”。

**💡 开发灵感 (Ideas)**
* **AI 购物助手**：自动寻找并购买数字商品（如 NFT/API Key）的 Agent。
* **自动订阅管理**：监测服务状态并在到期时自动调用钱包续费。
* **多 Agent 结算网络**：Agent 之间的数据交换与微支付（Micro-payment）结算。

**🛠 技术要求**
* 基于 Kite AI 提供的 API 或 SDK。
* 实现一个具备支付/结算功能的 Demo（重点是跑通流程）。

**📚 开发者资源 (Resources)**
| 资源类型 | 说明与链接 |
| :--- | :--- |
| **API/SDK** | 包含“一键调用支付”接口文档 ([查看官网](https://gokite.ai/) 或见仓库 `/docs/kite`) |
| **Demo 代码** | AI Agent 自动转账 Hello World 示例 |
| **教程** | "AI 与支付链路打通" Workshop 视频/PPT |

---

### 2. 🧠 LLM 应用赛道 (LLM Application Track)
> **支持方**: SpoonOS

**🎯 核心目标**
基于 SpoonOS Framework 调用 LLM，构建可执行的 AI 应用 / Agent 工作流。这是本次奖金最丰厚的赛道，我们期待看到完整的逻辑闭环。

**💡 开发灵感 (Ideas)**
* **Crypto 投研分析师**：抓取推特/新闻 -> 总结情绪 -> 生成日报。
* **社区治理 Mod**：自动回答 Discord 技术问题，整理 FAQ。
* **垂直领域助手**：法律文书生成器、代码审计初筛 Agent。

**🛠 技术要求**
* 必须使用 [SpoonOS Framework](https://www.notion.so/2f1bbd63be8780db8c59c20349715dd5?pvs=21)。
* 提交的项目需展示完整的工作流（Input -> Processing -> Output）。

**📚 开发者资源 (Resources)**
| 资源类型 | 说明与链接 |
| :--- | :--- |
| **核心文档** | [**SpoonOS · 最低技术要求（必读）**](https://www.notion.so/2f1bbd63be8780db8c59c20349715dd5?pvs=21) |
| **模板库** | 常用 Agent 工作流模板 (抓取 -> 总结 -> 发布) |
| **FAQ** | 环境安装与模型调用报错排查手册 |
| **Workshop** | Rick 老师的实战教学视频 |

---

### 3. 🔮 预测市场赛道 (Prediction Market Track)
> **支持方**: OGBC × ScalingX

**🎯 核心目标**
设计具备扩展性的预测市场结构、激励机制与数据输入方案。本赛道偏向于机制设计与合约逻辑的结合。

**💡 开发灵感 (Ideas)**
* **新闻事件预测市场**：结合 AI 预言机，当新闻发生时自动创建预测盘口。
* **KOL 影响力对赌**：基于社交媒体数据增长的预测合约。
* **去中心化赛事竞猜**：设计一个最小化的竞猜 DApp。

**🛠 技术要求**
* 参考官方提供的合约交互文档或逻辑架构图。
* 设计合理的激励机制（防作恶、激励正确预测）。

**📚 开发者资源 (Resources)**
| 资源类型 | 说明与链接 |
| :--- | :--- |
| **学习资料** | [**OGBC-Intern-Project 学习仓库**](https://github.com/ogalias/OGBC-Intern-Project) |
| **架构图** | 预测市场底层逻辑与合约交互图解（小白友好） |
| **案例库** | 优秀预测市场项目参考案例 |
| **实战题目** | 项目方发布的实战预测任务素材 |

---

### 🧰 通用工具支持 (Optional Tooling)
> **支持方**: DataDance

**🎯 工具定位**
这是一个**非强制的加分工具**，适用于所有赛道的数据处理场景。

**💡 推荐场景**
* 需要进行复杂数据清洗、格式化或多源数据接入的项目（例如预测市场的数据源处理，或 LLM 的上下文预处理）。

**📚 开发者资源 (Resources)**
| 资源类型 | 说明与链接 |
| :--- | :--- |
| **SDK 文档** | [**DataDance SDK 使用指南**](https://docs.google.com/document/d/1xbGWsV8spQXA2ZBCmN-xJjcNvdJEWwo77edUyXh0aKs/edit) (处理数据神器) |

## 项目提交要求(Submission Guide)

**⏰Demo提交截止时间：** **2026.2.1 12:00 前（UTC+8）**

请通过 GitHub Issues 提交以下材料：

- ✅ 项目 GitHub 仓库（必须开源）
- ✅ 可选: 演示幻灯片（PDF 或幻灯片格式）
- ✅ 项目摘要（包括功能概述、用例和核心亮点）
### 🚨 重要：摘要填写规范 (评审关键)
在提交 Pull Request 时，**必须**在描述框中备注以下信息，否则评委可能无法正确归类你的项目：

``
```text
------ 提交信息模板 ------
1. 项目名称: [你的项目名]
2. 参赛赛道: [例如: LLM 应用赛道 (SpoonOS)]
3. 技术栈清单: [例如: SpoonOS, Python, OpenAI API, Kite SDK]
4. 项目简介: [100字内]
5. Demo 链接/视频: [如果有，请提供]

```
- ✅ 可选：演示视频或用户指南
- ✅ 每个核心团队成员的联系信息（微信 / Github 邮箱 / 钱包地址）


## Demo Day 展示指南（Showcase & Demo Guide）

**时间：** **2026 年 2 月 1 日 20:00-22:00 (UTC+8)**

**展示安排：**

- 每个团队一般有 5 - 8 分钟的展示时间，但会视最终提交 Demo 数调整每个项目的具体展示时间——请合理安排时间
- 演示建议内容：
  - 项目介绍
  - 解决的问题
  - 核心功能演示
  - 技术见解
- 项目将按照提交顺序进行展示
- Zoom 链接：[ZOOM_LINK]

## 🏆 奖励与规则(Awards & Evaluation)

### 👥 组队规则
* **自由组队**: 支持跨背景自由组队。
* **人数限制**: 每支参赛队伍成员人数**少于 5 人**。

### 💰 奖励形式
* **总奖金池**: **$2,500 USDT**。
* **奖项设置**: 根据最终报名与参赛人数制定，预计设立**最多 17 个奖项**（覆盖 3 个赛道）。
* **火种持有者**: 凡是提交了有效 Demo 的小伙伴，人人可获得**项目专属创意 Badge**。

### 🎓 身份专属权益
我们对不同背景的选手提供针对性的激励：
* **针对实习计划正式学员**:
    * 瓜分奖金池 + 项目专属创意 Badge。
    * **额外加成**: 增加**奖励学分**（例如：第一名 +100 学分，后续获奖者 +50 学分）。
* **针对 Permissionless 学员及外部选手**:
    * 瓜分奖金池 + 项目专属创意 Badge。
    * *注：Permissionless 学员不包含学分奖励，可重点聚焦于奖金与个性化定制badge。*
*。

### 🔍 评审维度(Judging Criteria)
我们的评审将综合考虑以下四个核心方面：

1.  **技术实现完整度 (Technical Completeness)**
    * 代码是否完整？核心功能是否已通过代码落地？
2.  **Agent / AI 应用合理性 (Agent / AI Rationality)**
    * 是否真正发挥了 AI Agent 的自主性？逻辑是否通顺？
3.  **Web3 场景契合度 (Web3 Fit)**
    * 项目是否解决了 Web3 领域的实际问题（如支付、预测、治理）？
4.  **Demo 可运行性与表达清晰度 (Demo Runnability & Clarity)**
    * Demo 能否顺利演示？README 和文档是否清晰易读？

> ⚠️ **注意**：具体奖金分配细则与奖项设置，将在**黑客松后期统一公布**。

## 05 | 评委阵容（Judging Panel）

| 姓名           | 身份            | 专长                |
| -------------- | --------------- | ------------------- |
| [JUDGE_1_NAME] | [JUDGE_1_TITLE] | [JUDGE_1_EXPERTISE] |
| [JUDGE_2_NAME] | [JUDGE_2_TITLE] | [JUDGE_2_EXPERTISE] |
| [JUDGE_3_NAME] | [JUDGE_3_TITLE] | [JUDGE_3_EXPERTISE] |
| [JUDGE_4_NAME] | [JUDGE_4_TITLE] | [JUDGE_4_EXPERTISE] |
| [JUDGE_5_NAME] | [JUDGE_5_TITLE] | [JUDGE_5_EXPERTISE] |



## 赞助商与合作伙伴（Sponsors & Partners）

| | | | |
| :---: | :---: | :---: | :---: |
| <img src="./materials/images/LXDAO.png" width="200"> | <img src="./materials/images/OpenBuild.png" width="200"> | <img src="./materials/images/ali.png" width="200"> | <img src="./materials/images/cloudician.png" width="200"> |
| <img src="./materials/images/herstory.png" width="200"> | <img src="./materials/images/onekey.png" width="200"> | <img src="./materials/images/panews.png" width="200"> | <img src="./materials/images/zentachain.png" width="200"> |

### 🌐 社区支持

<table>
    <tr>
        <td align="center" valign="middle">
            <a href="https://x.com/nantangdao/" target="_blank">
                <img src="./materials/images/nantangdao.png" alt="nantangdao" width="130" />
            </a>
        </td>
        <td align="center" valign="middle">
            <a href="https://www.blockchainlabs.org/" target="_blank">
                <img src="./materials/images/blockchainlabs.png" alt="blockchainlabs" width="130" />
            </a>
        </td>
        <td align="center" valign="middle">
            <a href="https://x.com/SmartDeerGlobal" target="_blank">
                <img src="./materials/images/SmartDeer.png" alt="SmartDeer" width="130" />
            </a>
        </td>
        <td align="center" valign="middle">
            <a href="https://x.com/foresight_news?s=21" target="_blank">
                <img src="./materials/images/foresight_news.png" alt="foresight_news" width="130" />
            </a>
        </td>
    </tr>
</table>

## 报名与提交列表

报名/提交名单已移至独立页面，避免 README 过长：

- `docs/REGISTRATION.md`

## 🔗 快速链接

- 📝 [报名表单][REGISTRATION_FORM_LINK]
- 📄 [报名/提交名单](docs/REGISTRATION.md)
- 🎥 [教程视频 - Bilibili][VIDEO_TUTORIAL_BILIBILI]
- 🎥 [教程视频 - YouTube][VIDEO_TUTORIAL_YOUTUBE]
- 💬 [社区讨论](https://github.com/CasualHackathon/SPARK-AI-Hackathon/discussions)
- 🐛 [问题反馈](https://github.com/CasualHackathon/SPARK-AI-Hackathon/issues)

## ℹ️ 常见问题 (FAQ)

**Q: 我没有技术背景可以参加吗？**
A: 完全可以！我们鼓励非技术背景的参赛者参加。你可以专注于产品设计、运营策划、市场营销等方面，或者使用 AI 工具辅助。

**Q: 团队人数有限制吗？**
A: 没有硬性限制，建议 1-5 人组队效率最高。

**Q: 必须是 Web3 相关项目吗？**
A: 项目需要与 [ACTIVITY_THEME] 相关即可。

**Q: 代码必须在黑客松期间完成吗？**
A: 是的，所有代码需要在活动期间提交。可以基于现有框架进行开发。

**Q: 获奖后有什么后续支持？**
A: [FOLLOW_UP_SUPPORT]

