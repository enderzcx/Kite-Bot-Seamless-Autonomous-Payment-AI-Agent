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
    console.log('✅ 注册处理成功');
} catch (error) {
    console.error('❌ 注册处理失败:', error.message);
    console.error('错误堆栈:', error.stack);
    process.exit(1);
}
