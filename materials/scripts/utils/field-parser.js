/**
 * 通用字段解析工具
 * Common field parsing utilities for issue body and file content
 */

/**
 * 解析 Issue Body 中的字段
 * @param {string} bodyString - Issue body 内容
 * @returns {Object} 解析后的字段对象
 */
function parseIssueFields(bodyString) {
    const lines = bodyString.split('\n').map(l => l.trim());
    const fields = {};
    let currentKey = null;
    let currentValue = [];

    for (let i = 0; i < lines.length; i++) {
        const line = lines[i];

        // 字段行必须包含中文方括号 [ ] 和冒号
        const hasChineseBracket = line.includes('[') && line.includes(']');
        const hasColon = line.includes(':') || line.includes('：');
        const isPromptLine = (line.startsWith('_') && line.endsWith('_') && line.length > 2) || line.startsWith('---');
        const isFieldLine = hasChineseBracket && hasColon && !isPromptLine;

        if (isFieldLine) {
            // 保存之前的字段
            if (currentKey) {
                fields[currentKey] = currentValue.join('\n').trim();
            }

            // 解析新字段
            const colonIndex = line.indexOf(':') !== -1 ? line.indexOf(':') : line.indexOf('：');
            const key = line.slice(0, colonIndex).trim();
            const value = line.slice(colonIndex + 1).trim();

            currentKey = key;
            currentValue = value ? [value] : [];
        } else if (currentKey && line && !isPromptLine) {
            // 累积多行值
            currentValue.push(line);
        }
    }

    // 保存最后一个字段
    if (currentKey) {
        fields[currentKey] = currentValue.join('\n').trim();
    }

    return fields;
}

/**
 * 从文件内容中解析指定字段
 * @param {string} content - 文件内容
 * @param {string} fieldName - 字段名称
 * @returns {string} 字段值
 */
function parseFieldFromContent(content, fieldName) {
    const lines = content.split('\n');
    const pattern = `${fieldName}:`;

    for (const line of lines) {
        if (line.trim().startsWith(pattern)) {
            return line.slice(line.indexOf(':') + 1).trim();
        }
    }

    return '';
}

module.exports = {
    parseIssueFields,
    parseFieldFromContent
};
