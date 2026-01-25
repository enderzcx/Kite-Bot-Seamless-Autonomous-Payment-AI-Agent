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
    const lines = bodyString.split('\n');
    const fields = {};
    let currentField = null;
    let currentValue = [];

    for (let i = 0; i < lines.length; i++) {
        const line = lines[i].trim();

        // 匹配字段行 **FieldName**:
        const fieldMatch = line.match(/^\*\*(.+?)\*\*\s*[:：]\s*(.*)$/);

        if (fieldMatch) {
            // 保存之前的字段
            if (currentField) {
                fields[currentField] = currentValue.join('\n').trim();
            }

            // 开始新字段
            currentField = fieldMatch[1].trim();
            const inlineValue = fieldMatch[2].trim();

            // 如果冒号后面直接有值，保存它
            if (inlineValue) {
                currentValue = [inlineValue];
            } else {
                currentValue = [];
            }
        } else if (currentField && line && !line.startsWith('**')) {
            // 如果正在收集字段值，且这行不是新字段，添加到当前值
            currentValue.push(line);
        } else if (!line || line.startsWith('---')) {
            // 空行或分隔符，保存当前字段
            if (currentField) {
                fields[currentField] = currentValue.join('\n').trim();
                currentField = null;
                currentValue = [];
            }
        }
    }

    // 保存最后一个字段
    if (currentField) {
        fields[currentField] = currentValue.join('\n').trim();
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
    const pattern = `**${fieldName}**:`;

    for (const line of lines) {
        if (line.startsWith(pattern)) {
            return line.slice(pattern.length).replace(/\s+$/, '').trim();
        }
    }

    return '';
}

module.exports = {
    parseIssueFields,
    parseFieldFromContent
};
