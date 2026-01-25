# 计划 (Plan)
path:agenthack/.github/scripts/update_readme.js Lx-Ly ~±30
path:agenthack/README.md Lx-Ly ~±2

## 步骤
1. 根据 `register.md` 模版审计 `update_readme.js` 逻辑。
2. 在 `update_readme.js` 中实现更健壮的 `extractValue` 函数（支持多行和复杂格式）。
3. 修正 `update_readme.js` 中的标记错误 (star -> start)。
4. 修正 `README.md` 中的标记错误 (star -> start)。
5. 验证工作流。

## 检查点
- 脚本解析逻辑单元测试（思维检查）。
- 正则表达式与模版格式匹配。

## 回滚
- 还原文件更改。
