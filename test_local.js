#!/usr/bin/env node

const testIssueBody = `Name [姓名]: 李四

ContactMethod [联系方式]:
WeChat: lisi456

WantsTeam [组队意愿]: 是

Comment [备注]: 晚上有空`;

process.env.ISSUE_BODY = testIssueBody;
process.env.ISSUE_USER = 'lisi';
process.env.GITHUB_OUTPUT = '/dev/null';

console.log('=== 简化版本测试 ===\n');
require('./materials/scripts/signup_extract.js');
