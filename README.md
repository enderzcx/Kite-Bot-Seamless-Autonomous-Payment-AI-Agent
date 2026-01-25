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

🧬 这是一次大胆、轻松愉快、不卷的黑客松。我们不强求技术壁垒，而是鼓励跨界创意。就算你没有代码基础，也可以借助 AI 工具生成代码模块，非技术类参赛者也可以用 Figma 画一个界面、写一份提案、录一个 Demo 视频——我们要的是"理念呈现与思维创新"，加入黑客松，开启你的 Agent 创新体验！

## 📊 活动主视觉

![Agent Hack Banner][BANNER_IMAGE_PATH]

## 01 | 报名方式与议程安排

📍 线上举行｜自由报名（面向所有人）

| 活动                 | 时间                      | 形式    | 相关链接                                                        |
| -------------------- | ------------------------- | ------- | --------------------------------------------------------------- |
| **开始报名**   | [REGISTRATION_START_DATE] | 📍 线上 | **👉 [点击此处填写报名表](https://github.com/CasualHackathon/agenthack/issues/new?template=register.md)** |
| 🗓**Open Day** | [OPEN_DAY_DATE_TIME]      | 📍 线上 | **👉 [点击此处提交 Demo](https://github.com/CasualHackathon/agenthack/issues/new?template=submission.md)** |
| 🏁**Demo Day** | [DEMO_DAY_DATE_TIME]      | 📍 线上 | [Zoom 链接][ZOOM_LINK]                                          |

**报名教程：**

- [Bilibili][VIDEO_TUTORIAL_BILIBILI]
- [YouTube][VIDEO_TUTORIAL_YOUTUBE]

### **注意事项：**

1. 禁止修改他人信息。
2. 提交 Demo 时必须先完成注册，否则提交无效。
3. 提交资料时，只在对应位置填写信息，不要修改其它基础内容，特别是 issues title。
4. 提交报名后，预计1分钟内会显示在下方报名列表中，如未显示请联系相关技术人员。
5. 提交 Demo 时，请先 Fork 当前代码库，然后将 Demo 相关代码，放到以你 Github ID 命名的目录下，如：`/submission/[your-github-account]`，然后再提交 PR，我们会在审阅后合并，禁止修改其它信息。

## 📅 赛道介绍 (Tracks)

本次黑客松共设立三个核心赛道，你可以根据兴趣选择其一进行挑战。

### 1. 💸 支付赛道 (Payment Track)
**支持方**: Kite AI  
**核心方向**: 探索 AI/Agent 场景下的自动化支付、链上结算与资金流转方案。

* **挑战内容**: 构建能够“花钱”的 AI。无论是通过 API 自动结算，还是 AI Agent 之间的自动转账，我们期待看到 AI 在金融交互上的突破。
* **你需要完成**: 基于 Kite AI 提供的 API 或 SDK，实现一个具备支付/结算功能的 Demo。

### 2. 🧠 LLM 应用赛道 (LLM Application Track)
**支持方**: SpoonOS  
**核心方向**: 基于 SpoonOS Framework 调用 LLM，构建可执行的 AI 应用 / Agent 工作流。

* **挑战内容**: 利用 SpoonOS 的框架，打造具有实际功能的工作流（Workflow）或智能体（Agent）。
* **参考场景**: 信息抓取与总结发布、自动化客服、垂直领域助手等。
* **推荐工具**: [SpoonOS · 最低技术使用要求（Hackathon）](https://www.notion.so/SpoonOS-Hackathon-2f1bbd63be8780db8c59c20349715dd5?pvs=21)

### 3. 🔮 预测市场赛道 (Prediction Market Track)
**支持方**: OGBC × ScalingX  
**核心方向**: 设计具备扩展性的预测市场结构、激励机制与数据输入方案。

* **挑战内容**: 结合博弈论与数据输入，构建一个预测市场的 Demo 或合约逻辑。
* **参考素材**: 我们将提供行业参考案例与预测题目示例，你可以基于此设计你的机制。


## 🛠 开发者资源 (Developer Resources)

为了帮助大家快速上手，各赛道支持方提供了详细的技术文档与素材：

#### Kite AI (支付赛道)
* **文档**: 自动化与结算 API/SDK 文档（含“一键调用支付”接口）。
* **代码示例**: AI Agent 自动转账 Hello World 级别 Demo 代码。
* **教程**: “如何将 AI 与支付链路打通” Workshop 视频/PPT。

#### SpoonOS (LLM 应用赛道)
* **指南**: SpoonOS Framework 快速上手指南。
* **模板库**: 常见 Agent 工作流模板（如：抓取信息 -> 总结 -> 发布）。
* **FAQ**: 环境安装与模型调用常见报错解答。
* **Workshop**: Rick 老师的 SpoonOS 实战教学视频。

#### OGBC × ScalingX (预测市场赛道)
* **逻辑文档**: 预测市场合约交互文档与逻辑架构图（适合快速理解底层逻辑）。
* **案例库**: 过往优秀的预测市场项目案例链接。
* **实战任务**: 现成的预测题目示例与行业素材。

#### 工具支持 (Optional)
* **DataDance SDK**: 推荐使用，用于增强数据处理能力。[查看文档](https://docs.google.com/document/d/1xbGWsV8spQXA2ZBCmN-xJjcNvdJEWwo77edUyXh0aKs/edit?tab=t.0)


## 03 | 项目提交要求

**截止时间：** [SUBMISSION_DEADLINE] 前（UTC+8）

请通过 GitHub Issues 提交以下材料：

- ✅ 项目 GitHub 仓库（必须开源）
- ✅ 可选: 演示幻灯片（PDF 或幻灯片格式）
- ✅ 项目摘要（包括功能概述、用例和核心亮点）
- ✅ 可选：演示视频或用户指南
- ✅ 每个核心团队成员的联系信息（微信 / 邮箱 / 钱包地址）

 我们使用 GitHub Flow 进行作品提交。请严格遵守以下步骤：

### 1. 准备代码
确保你的项目包含一个清晰的 `README.md`，介绍你的项目功能和运行方式。

### 2. Fork & Clone
Fork 本仓库到你的个人 GitHub，并 Clone 到本地。

### 3. 创建目录
在 `submissions` 目录下创建一个以你的**项目名称**命名的文件夹。
`submissions/你的项目名/`

### 4. 提交 PR (Pull Request)
将你的代码提交到该文件夹，并向本仓库发起 PR。

### 🚨 重要：PR 填写规范 (评审关键)
在提交 Pull Request 时，**必须**在描述框中备注以下信息，否则评委可能无法正确归类你的项目：

```text
------ 提交信息模板 ------
1. 项目名称: [你的项目名]
2. 参赛赛道: [例如: LLM 应用赛道 (SpoonOS)]
3. 技术栈清单: [例如: SpoonOS, Python, OpenAI API, Kite SDK]
4. 项目简介: [一句话介绍你的项目做什么]
5. Demo 链接/视频: [如果有，请提供]

```


## 04 | Demo Day 展示指南

**时间：** [DEMO_DAY_DATE_TIME] (UTC+8)

**展示安排：**

- 每个团队一般有 5 - 8 分钟的展示时间，但会视最终提交 Demo 数调整每个项目的具体展示时间——请合理安排时间
- 演示建议内容：
  - 项目介绍
  - 解决的问题
  - 核心功能演示
  - 技术见解
- 项目将按照提交顺序进行展示
- Zoom 链接：[ZOOM_LINK]



## 05 | 评委阵容

| 姓名           | 身份            | 专长                |
| -------------- | --------------- | ------------------- |
| [JUDGE_1_NAME] | [JUDGE_1_TITLE] | [JUDGE_1_EXPERTISE] |
| [JUDGE_2_NAME] | [JUDGE_2_TITLE] | [JUDGE_2_EXPERTISE] |
| [JUDGE_3_NAME] | [JUDGE_3_TITLE] | [JUDGE_3_EXPERTISE] |
| [JUDGE_4_NAME] | [JUDGE_4_TITLE] | [JUDGE_4_EXPERTISE] |
| [JUDGE_5_NAME] | [JUDGE_5_TITLE] | [JUDGE_5_EXPERTISE] |

## 06 | 奖项设置

| 奖项            | 奖励              | 数量                 |
| --------------- | ----------------- | -------------------- |
| 🥇 一等奖       | [FIRST_PRIZE]     | [FIRST_PRIZE_COUNT]  |
| 🥈 二等奖       | [SECOND_PRIZE]    | [SECOND_PRIZE_COUNT] |
| 🥉 三等奖       | [THIRD_PRIZE]     | [THIRD_PRIZE_COUNT]  |
| 🎖️ 最佳创意奖 | [BEST_IDEA_PRIZE] | [BEST_IDEA_COUNT]    |
| 🎖️ 最佳技术奖 | [BEST_TECH_PRIZE] | [BEST_TECH_COUNT]    |

## 07 | 赞助商与合作伙伴

<table>
    <tr>
        <td align="center" valign="middle">
            <a href="https://x.com/ChainforGood" target="_blank">
                <img src="./materials/images/ChainforGood.png" alt="ChainforGood" width="130" />
            </a>
        </td>
        <td align="center" valign="middle">
            <a href="https://lxdao.io/" target="_blank">
                <img src="./materials/images/LXDAO.png" alt="LXDAO" width="130" />
            </a>
        </td>
        <td align="center" valign="middle">
            <a href="https://ethpanda.org/" target="_blank">
                <img src="./materials/images/ETHPanda.png" alt="ETHPanda" width="130" />
            </a>
        </td>
    </tr>
</table>

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

## 08 | 报名列表

<!-- Registration star -->

| 姓名      | GitHub ID | 联系方式 | 组队意愿 | 备注 | 更新资料 |
| --------- | --------- | -------- | -------- | ---- | -------- |
| 待更新... | -         | -        | -        | -    | -        |

<!-- Registration end -->

## 09 | 提交名单

<!-- Submission star -->

| 项目名称  | GitHub ID | 项目描述 | 项目链接 | 提交时间 |
| --------- | --------- | -------- | -------- | -------- |
| 待更新... | -         | -        | -        | -        |

<!-- Submission end -->

## 🔗 快速链接

- 📝 [报名表单][REGISTRATION_FORM_LINK]
- 🎥 [教程视频 - Bilibili][VIDEO_TUTORIAL_BILIBILI]
- 🎥 [教程视频 - YouTube][VIDEO_TUTORIAL_YOUTUBE]
- 💬 [社区讨论](https://github.com/CasualHackathon/agenthack/discussions)
- 🐛 [问题反馈](https://github.com/CasualHackathon/agenthack/issues)

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

## 📧 联系我们

- **主办方：** 残酷共学
- **技术支持：** [TECH_CONTACT_EMAIL]
- **运营协调：** [OPS_CONTACT_EMAIL]
- **微信社群：** [WECHAT_GROUP_INFO]
- **Discord：** [DISCORD_LINK]

## 📜 许可证

[LICENSE_TYPE]
