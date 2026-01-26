const path = require('path');
const FileManager = require('../utils/file-manager');
const { parseIssueFields } = require('../utils/field-parser');
const { parseFieldFromContent } = require('../utils/field-parser');
const UserManager = require('../services/user-manager');
const ReadmeManager = require('../services/readme-manager');
const GitManager = require('../utils/git-manager');
const { DIRECTORIES, FIELD_NAMES, GITHUB_CONFIG } = require('../config/constants');

/**
 * 注册处理器
 * Registration processor
 */
class RegistrationProcessor {
    /**
     * 处理注册请求
     * @param {string} issueBody - Issue 内容
     * @param {string} githubUser - GitHub 用户名
     */
    static processRegistration(issueBody, githubUser) {
        console.log('开始处理注册请求...');

        // 解析字段
        const fields = parseIssueFields(issueBody);
        console.log('🔍 解析到的字段:', JSON.stringify(fields, null, 2));

        const registrationData = this.extractRegistrationData(fields);
        console.log('📝 提取的注册数据:', JSON.stringify(registrationData, null, 2));

        // 验证必填字段
        this.validateRegistrationData(registrationData, githubUser);

        // 创建注册文件
        this.createRegistrationFile(githubUser, registrationData);

        // 更新 README 表格
        this.updateRegistrationTable();

        // 更新 README 统计信息
        ReadmeManager.updateSummary();

        console.log('注册处理完成');
    }

    /**
     * 从解析的字段中提取注册数据
     * @param {Object} fields - 解析的字段
     * @returns {Object} 注册数据
     */
    static extractRegistrationData(fields) {
        return {
            name: fields[FIELD_NAMES.REGISTRATION.NAME] || '',
            introduction: fields[FIELD_NAMES.REGISTRATION.INTRODUCTION] || '',
            contactMethod: fields[FIELD_NAMES.REGISTRATION.CONTACT_METHOD] || '',
            WantsTeam: fields[FIELD_NAMES.REGISTRATION.WANTS_TEAM] || '',
            comment: fields[FIELD_NAMES.REGISTRATION.COMMENT] || ''
        };
    }

    /**
     * 验证注册数据
     * @param {Object} registrationData - 注册数据
     * @param {string} githubUser - GitHub 用户名
     */
    static validateRegistrationData(registrationData, githubUser) {
        const { name, introduction } = registrationData;

        if (!name || !introduction || !githubUser) {
            console.error('注册字段不全，缺少必填信息（姓名和个人介绍为必填项）');
            process.exit(1);
        }
    }

    /**
     * 创建注册文件
     * @param {string} githubUser - GitHub 用户名
     * @param {Object} registrationData - 注册数据
     */
    static createRegistrationFile(githubUser, registrationData) {
        FileManager.ensureDirectoryExists(DIRECTORIES.REGISTRATION);

        const content = this.generateRegistrationFileContent(githubUser, registrationData);
        const filePath = UserManager.getRegistrationFilePath(githubUser);

        FileManager.writeFileContent(filePath, content);
        console.log(`报名信息已写入: ${filePath}`);
    }

    /**
     * 生成注册文件内容
     * @param {string} githubUser - GitHub 用户名
     * @param {Object} registrationData - 注册数据
     * @returns {string} 文件内容
     */
    static generateRegistrationFileContent(githubUser, registrationData) {
        const { name, introduction, contactMethod, WantsTeam, comment } = registrationData;

        return `# ${githubUser}

${FIELD_NAMES.REGISTRATION.NAME}: ${name}
${FIELD_NAMES.REGISTRATION.INTRODUCTION}: ${introduction}
${FIELD_NAMES.REGISTRATION.CONTACT_METHOD}: ${contactMethod}
${FIELD_NAMES.REGISTRATION.WANTS_TEAM}: ${WantsTeam}
${FIELD_NAMES.REGISTRATION.COMMENT}: ${comment}
`;
    }

    /**
     * 更新注册表格
     */
    static updateRegistrationTable() {
        const files = FileManager.getDirectoryFiles(DIRECTORIES.REGISTRATION, '.md');

        const rows = files.map(file => {
            const filePath = path.join(DIRECTORIES.REGISTRATION, file);
            const content = FileManager.readFileContent(filePath);
            const githubUser = path.basename(file, '.md');

            return {
                name: parseFieldFromContent(content, FIELD_NAMES.REGISTRATION.NAME),
                githubID: githubUser,
                introduction: parseFieldFromContent(content, FIELD_NAMES.REGISTRATION.INTRODUCTION),
                contactMethod: parseFieldFromContent(content, FIELD_NAMES.REGISTRATION.CONTACT_METHOD),
                WantsTeam: parseFieldFromContent(content, FIELD_NAMES.REGISTRATION.WANTS_TEAM),
                comment: parseFieldFromContent(content, FIELD_NAMES.REGISTRATION.COMMENT)
            };
        });

        // 按项目名称首字母升序排序
        rows.sort((a, b) => {
            const nameA = (a.name || '').toLowerCase();
            const nameB = (b.name || '').toLowerCase();
            return nameA.localeCompare(nameB);
        });

        const tableContent = this.generateRegistrationTable(rows);
        ReadmeManager.updateReadmeSection('REGISTRATION', tableContent);
    }

    /**
     * 生成注册表格内容
     * @param {Array} rows - 注册数据行
     * @returns {string} 表格内容
     */
    static generateRegistrationTable(rows) {
        let table = '| # | 姓名 | 个人介绍 | 联系方式 | 组队意愿 | 备注 | 更新资料 |\n| --- | ---- | ----------- | ----------- | ----------- | ------- | ------- |\n';

        rows.forEach((row, index) => {
            const issueTitle = `${GITHUB_CONFIG.ISSUE_TITLE_PREFIXES.REGISTRATION} - ${row.name}`;
            const issueBody = `${FIELD_NAMES.REGISTRATION.NAME}: ${row.name}\n${FIELD_NAMES.REGISTRATION.INTRODUCTION}: ${row.introduction}\n${FIELD_NAMES.REGISTRATION.CONTACT_METHOD}: ${row.contactMethod}\n${FIELD_NAMES.REGISTRATION.WANTS_TEAM}: ${row.WantsTeam}\n${FIELD_NAMES.REGISTRATION.COMMENT}: ${row.comment}`;
            const issueUrl = ReadmeManager.generateIssueUrl(issueTitle, issueBody);

            table += `| ${index + 1} | ${row.name} | ${row.introduction} | ${row.contactMethod} | ${row.WantsTeam} | ${row.comment} | [编辑](${issueUrl}) |\n`;
        });

        return table;
    }
}

module.exports = RegistrationProcessor;
