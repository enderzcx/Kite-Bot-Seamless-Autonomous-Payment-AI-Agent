# 概览 (Overview)
目标: 增强报名和提交 Issues 的 README 自动更新机制的稳定性。
关键指标 (KPIs): 
- 无论 Issue 内容中有无加粗格式，都能正确提取值。
- 确保脚本标记与 README 标记同步。
- 提取过程中零"格式错误"。

回滚方案:
- git revert <commit>
- 将 `update_readme.js` 和 `README.md` 恢复到之前状态。

更新时间: 2026-01-25
