/**
 * 项目提交信息提取脚本
 * Submission information extraction script
 * 
 * 用于处理 GitHub Issue 中的提交信息，创建项目提交文件并更新 README 表格
 */

const SubmissionProcessor = require('./processors/submission-processor');

// 从环境变量获取参数
const issueBody = process.env.ISSUE_BODY || '';
const githubUser = process.env.ISSUE_USER || '';

// 调试输出
console.log('处理用户:', githubUser);
console.log('Issue 内容:\n', issueBody);

try {
    // 处理项目提交
    SubmissionProcessor.processSubmission(issueBody, githubUser);

    // Set script_success to true when processing completes successfully
    if (process.env.GITHUB_OUTPUT) {
        const fs = require('fs');
        fs.appendFileSync(process.env.GITHUB_OUTPUT, `script_success=true\n`);
    }

    console.log('✅ 项目提交处理成功');
} catch (error) {
    // Set script_success to false when processing fails
    if (process.env.GITHUB_OUTPUT) {
        const fs = require('fs');
        fs.appendFileSync(process.env.GITHUB_OUTPUT, `script_success=false\n`);
        fs.appendFileSync(process.env.GITHUB_OUTPUT, `error_message<<EOF\n❌ **提交处理失败**\n\n${error.message}\nEOF\n`);
    }

    console.error('ERROR_MESSAGE:', `❌ **提交处理失败**\n\n${error.message}`);
    console.error('项目提交处理失败:', error.message);
    process.exit(1);
}
