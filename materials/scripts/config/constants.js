/**
 * 配置常量
 * Configuration constants
 */

// 目录路径配置
const path = require('path');
const DIRECTORIES = {
    REGISTRATION: path.resolve(__dirname, '../../../registration'),
    SUBMISSION: path.resolve(__dirname, '../../../submissions'),
    SCRIPTS: __dirname
};

// 文件名配置
const FILE_NAMES = {
    README: '../../README.md',
    HACKATHON_INFO: 'HACKATHON.md'
};

// 字段名配置 - 适配新的 Issue 模板格式
const FIELD_NAMES = {
    // 注册字段
    REGISTRATION: {
        NAME: 'Name',
        INTRODUCTION: 'Introduction',
        CONTACT_METHOD: 'ContactMethod',
        WALLET_ADDRESS: 'Wallet Address',
        WANTS_TEAM: 'WantsTeam',
        TRACK: 'Track',
        COMMENT: 'Comment'
    },
    // 项目提交字段
    SUBMISSION: {
        PROJECT_NAME: 'ProjectName',
        TRACK: 'Track',
        PROJECT_DESCRIPTION: 'ProjectDescription',
        REPO_LINK: 'Github Repo Link',
        TEAM_LEAD: 'Team Lead',
        TEAM_WALLET_ADDRESS: 'Team Wallet Address'
    }
};

// Git 相关配置
const GIT_CONFIG = {
    USER_EMAIL: 'action@github.com',
    USER_NAME: 'GitHub Action'
};

// GitHub 相关配置
const GITHUB_CONFIG = {
    REPO_URL: 'https://github.com/CasualHackathon/agenthack',
    ISSUE_TITLE_PREFIXES: {
        REGISTRATION: 'Registration',
        SUBMISSION: 'Submission'
    }
};

// README 更新标记
const README_MARKERS = {
    REGISTRATION: {
        START: '<!-- Registration start -->',
        END: '<!-- Registration end -->'
    },
    SUBMISSION: {
        START: '<!-- Submission start -->',
        END: '<!-- Submission end -->'
    },
    SUMMARY: {
        START: '<!-- Registration summary start -->',
        END: '<!-- Registration summary end -->'
    }
};

// 状态指示符
const STATUS_INDICATORS = {
    NOT_SUBMITTED: '⚪',
    SUBMITTED: '🟢'
};

module.exports = {
    DIRECTORIES,
    FILE_NAMES,
    FIELD_NAMES,
    GIT_CONFIG,
    GITHUB_CONFIG,
    README_MARKERS,
    STATUS_INDICATORS
};
