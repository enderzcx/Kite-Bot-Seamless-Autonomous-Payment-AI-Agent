const path = require('path');
const FileManager = require('../utils/file-manager');
const { parseIssueFields, parseFieldFromContent } = require('../utils/field-parser');
const UserManager = require('../services/user-manager');
const ReadmeManager = require('../services/readme-manager');
const GitManager = require('../utils/git-manager');
const { DIRECTORIES, FILE_NAMES, FIELD_NAMES, STATUS_INDICATORS } = require('../config/constants');

/**
 * 项目提交处理器
 * Submission processor
 */
class SubmissionProcessor {
    /**
     * 处理项目提交
     * @param {string} issueBody - Issue 内容
     * @param {string} githubUser - GitHub 用户名
     */
    static processSubmission(issueBody, githubUser) {
        console.log('开始处理项目提交...');

        // 验证用户是否已注册
        const displayName = UserManager.getUserDisplayName(githubUser);

        // 解析字段
        const fields = parseIssueFields(issueBody);
        const submissionData = this.extractSubmissionData(fields, displayName, githubUser);

        // 验证必填字段
        this.validateSubmissionData(submissionData);

        // 创建项目文件
        this.createSubmissionFile(githubUser, submissionData);

        // 更新提交表格
        this.updateSubmissionTable();

        console.log('项目提交处理完成');
    }

    /**
     * 从解析的字段中提取提交数据
     * @param {Object} fields - 解析的字段
     * @param {string} displayName - 用户显示名称
     * @param {string} githubUser - GitHub 用户名
     * @returns {Object} 提交数据
     */
    static extractSubmissionData(fields, displayName, githubUser) {
        return {
            projectName: fields[FIELD_NAMES.SUBMISSION.PROJECT_NAME] || '',
            track: fields[FIELD_NAMES.SUBMISSION.TRACK] || '',
            projectDescription: fields[FIELD_NAMES.SUBMISSION.PROJECT_DESCRIPTION] || '',
            repoLink: fields[FIELD_NAMES.SUBMISSION.REPO_LINK] || '',
            teamLead: fields[FIELD_NAMES.SUBMISSION.TEAM_LEAD] || displayName,
            teamWalletAddress: fields[FIELD_NAMES.SUBMISSION.TEAM_WALLET_ADDRESS] || ''
        };
    }

    /**
     * 验证提交数据
     * @param {Object} submissionData - 提交数据
     */
    static validateSubmissionData(submissionData) {
        const { projectName, track, projectDescription, repoLink, teamLead } = submissionData;

        if (!projectName || !track || !projectDescription || !repoLink || !teamLead) {
            console.error('项目提交字段不全，缺少必填信息（项目名称、赛道、项目描述、仓库链接、负责人为必填项）');
            process.exit(1);
        }
    }

    /**
     * 获取提交文件路径
     * @param {string} githubUser - GitHub 用户名
     * @returns {string} 提交文件路径
     */
    static getSubmissionFilePath(githubUser) {
        const submissionDir = path.join(DIRECTORIES.SUBMISSION, githubUser);
        return path.join(submissionDir, FILE_NAMES.HACKATHON_INFO);
    }

    /**
     * 创建提交文件
     * @param {string} githubUser - GitHub 用户名
     * @param {Object} submissionData - 提交数据
     */
    static createSubmissionFile(githubUser, submissionData) {
        const submissionDir = path.join(DIRECTORIES.SUBMISSION, githubUser);
        FileManager.ensureDirectoryExists(submissionDir);

        const content = this.generateSubmissionFileContent(githubUser, submissionData);
        const filePath = this.getSubmissionFilePath(githubUser);

        FileManager.writeFileContent(filePath, content);
        console.log(`项目信息已写入: ${filePath}`);
    }

    /**
     * 生成提交文件内容
     * @param {string} githubUser - GitHub 用户名
     * @param {Object} submissionData - 提交数据
     * @returns {string} 文件内容
     */
    static generateSubmissionFileContent(githubUser, submissionData) {
        const { projectName, track, projectDescription, repoLink, teamLead, teamWalletAddress } = submissionData;

        return `# ${projectName}

GitHub User: ${githubUser}
${FIELD_NAMES.SUBMISSION.PROJECT_NAME}: ${projectName}
${FIELD_NAMES.SUBMISSION.TRACK}: ${track}
${FIELD_NAMES.SUBMISSION.PROJECT_DESCRIPTION}: ${projectDescription}
${FIELD_NAMES.SUBMISSION.REPO_LINK}: ${repoLink}
${FIELD_NAMES.SUBMISSION.TEAM_LEAD}: ${teamLead}
${FIELD_NAMES.SUBMISSION.TEAM_WALLET_ADDRESS}: ${teamWalletAddress}`;
    }

    /**
     * 更新提交表格
     */
    static updateSubmissionTable() {
        const submissionRoot = DIRECTORIES.SUBMISSION;
        const userFolders = FileManager.getSubDirectories(submissionRoot);

        const rows = userFolders.map(folder => {
            const submissionFile = path.join(submissionRoot, folder, FILE_NAMES.HACKATHON_INFO);
            const content = FileManager.readFileContent(submissionFile);

            if (!content) return null;

            const displayName = UserManager.getUserDisplayName(folder);

            return {
                folder: folder,
                name: displayName,
                projectName: parseFieldFromContent(content, FIELD_NAMES.SUBMISSION.PROJECT_NAME),
                track: parseFieldFromContent(content, FIELD_NAMES.SUBMISSION.TRACK),
                projectDescription: parseFieldFromContent(content, FIELD_NAMES.SUBMISSION.PROJECT_DESCRIPTION),
                teamLead: parseFieldFromContent(content, FIELD_NAMES.SUBMISSION.TEAM_LEAD),
                teamWalletAddress: parseFieldFromContent(content, FIELD_NAMES.SUBMISSION.TEAM_WALLET_ADDRESS),
                repoLink: parseFieldFromContent(content, FIELD_NAMES.SUBMISSION.REPO_LINK)
            };
        }).filter(Boolean);

        // 按项目名称首字母升序排序
        rows.sort((a, b) => {
            const nameA = (a.projectName || '').toLowerCase();
            const nameB = (b.projectName || '').toLowerCase();
            return nameA.localeCompare(nameB);
        });

        const tableContent = this.generateSubmissionTable(rows, submissionRoot);
        ReadmeManager.updateReadmeSection('SUBMISSION', tableContent);
    }

    /**
     * 生成提交表格内容
     * @param {Array} rows - 提交数据行
     * @param {string} submissionRoot - 提交根目录
     * @returns {string} 表格内容
     */
    static generateSubmissionTable(rows, submissionRoot) {
        let table = '| 项目名称 | GitHub ID | 项目描述 | 项目链接 | 提交时间 |\n| ----------- | ----------------- | -------------- | ------ | -------- |\n';

        rows.forEach(row => {
            // 生成操作链接
            const folderUrl = ReadmeManager.generateFolderUrl(`submissions/${row.folder}`);

            table += `| ${row.projectName} | ${row.folder} | ${row.projectDescription} | [Repo](${row.repoLink}) \\| [Folder](${folderUrl}) | - |\n`;
        });

        return table;
    }
}

module.exports = SubmissionProcessor;
