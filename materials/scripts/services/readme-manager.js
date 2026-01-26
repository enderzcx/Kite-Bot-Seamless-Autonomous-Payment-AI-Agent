const path = require('path');
const fs = require('fs');
const FileManager = require('../utils/file-manager');
const { README_MARKERS, GITHUB_CONFIG, DIRECTORIES } = require('../config/constants');

/**
 * README 管理类
 * README management utilities
 */
class ReadmeManager {
    /**
     * 获取 README 文件路径
     * @returns {string} README 文件路径
     */
    static getReadmePath() {
        return path.join(__dirname, '../../../README.md');
    }

    /**
     * 获取 CONTRIBUTING 文件路径
     * @returns {string} CONTRIBUTING 文件路径
     */
    static getContributingPath() {
        return path.join(__dirname, '../../../CONTRIBUTING.md');
    }

    /**
     * 更新 README 中指定区域的内容
     * @param {string} sectionType - 区域类型 ('REGISTRATION' 或 'SUBMISSION')
     * @param {string} tableContent - 表格内容
     */
    static updateReadmeSection(sectionType, tableContent) {
        // REGISTRATION 表格在 CONTRIBUTING.md 中，SUBMISSION 表格在 README.md 中
        const readmePath = sectionType === 'REGISTRATION'
            ? this.getContributingPath()
            : this.getReadmePath();
        const markers = README_MARKERS[sectionType];

        if (!markers) {
            throw new Error(`未知的区域类型: ${sectionType}`);
        }

        let readmeContent = FileManager.readFileContent(readmePath);

        const updatedContent = readmeContent.replace(
            new RegExp(`(${this.escapeRegex(markers.START)})[\\s\\S]*?(${this.escapeRegex(markers.END)})`, 'g'),
            `$1\n${tableContent}\n$2`
        );

        FileManager.writeFileContent(readmePath, updatedContent);
        const fileName = sectionType === 'REGISTRATION' ? 'CONTRIBUTING.md' : 'README.md';
        console.log(`${fileName} ${sectionType} 区域已更新`);
    }

    /**
     * 转义正则表达式特殊字符
     * @param {string} string - 需要转义的字符串
     * @returns {string} 转义后的字符串
     */
    static escapeRegex(string) {
        return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    }

    /**
     * 生成 GitHub Issue URL
     * @param {string} title - Issue 标题
     * @param {string} body - Issue 内容
     * @returns {string} Issue URL
     */
    static generateIssueUrl(title, body) {
        const encodedTitle = encodeURIComponent(title);
        const encodedBody = encodeURIComponent(body);
        return `${GITHUB_CONFIG.REPO_URL}/issues/new?title=${encodedTitle}&body=${encodedBody}`;
    }

    /**
     * 生成文件夹链接
     * @param {string} folderPath - 文件夹路径
     * @returns {string} 文件夹链接
     */
    static generateFolderUrl(folderPath) {
        return `${GITHUB_CONFIG.REPO_URL}/tree/main/${folderPath}`;
    }

    /**
     * 更新 README 中的报名/提交人数统计
     */
    static updateSummary() {
        const registrationCount = FileManager.getDirectoryFiles(DIRECTORIES.REGISTRATION, '.md').length;
        const submissionCount = FileManager.getDirectoryFiles(DIRECTORIES.SUBMISSION).filter(f => !f.startsWith('.')).length;

        const readmePath = this.getReadmePath();
        const markers = README_MARKERS.SUMMARY;

        let readmeContent = FileManager.readFileContent(readmePath);
        const summaryContent = `报名人数：${registrationCount}｜提交人数：${submissionCount}（名单详见 \`CONTRIBUTING.md\`）`;

        const updatedContent = readmeContent.replace(
            new RegExp(`(${this.escapeRegex(markers.START)})[\\s\\S]*?(${this.escapeRegex(markers.END)})`, 'g'),
            `$1\n${summaryContent}\n$2`
        );

        FileManager.writeFileContent(readmePath, updatedContent);
        console.log(`README 统计信息已更新: 报名 ${registrationCount} 人, 提交 ${submissionCount} 个`);
    }
}

module.exports = ReadmeManager;
