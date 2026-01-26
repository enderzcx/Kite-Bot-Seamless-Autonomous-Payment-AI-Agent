/**
 * 注册信息提取脚本
 * Registration information extraction script
 * 
 * 用于处理 GitHub Issue 中的注册信息，创建用户注册文件并更新 README 表格
 */

const RegistrationProcessor = require('./processors/registration-processor');

// 从环境变量获取参数
const issueBody = process.env.ISSUE_BODY || '';
const githubUser = process.env.ISSUE_USER || '';

// 调试输出
console.log('处理用户:', githubUser);
console.log('Issue 内容:\n', issueBody);
console.log('---');

try {
    // 处理注册
    RegistrationProcessor.processRegistration(issueBody, githubUser);

    // Set script_success to true when processing completes successfully
    if (process.env.GITHUB_OUTPUT) {
        const fs = require('fs');
        fs.appendFileSync(process.env.GITHUB_OUTPUT, `script_success=true\n`);
    }

    console.log('✅ 注册处理成功');
} catch (error) {
    // Set script_success to false when processing fails
    if (process.env.GITHUB_OUTPUT) {
        const fs = require('fs');
        fs.appendFileSync(process.env.GITHUB_OUTPUT, `script_success=false\n`);
        fs.appendFileSync(process.env.GITHUB_OUTPUT, `error_message<<EOF\n❌ **报名处理失败**\n\n${error.message}\nEOF\n`);
    }

    console.error('ERROR_MESSAGE:', `❌ **报名处理失败**\n\n${error.message}`);
    console.error('❌ 注册处理失败:', error.message);
    console.error('错误堆栈:', error.stack);
    process.exit(1);
}
