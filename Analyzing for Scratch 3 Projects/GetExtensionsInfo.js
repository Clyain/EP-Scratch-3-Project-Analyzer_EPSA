function GetExtensionsInfo(source) {
    // 解析翻译数据
    function parseTranslationData(source) {
        const match = source.match(/Scratch\.translate\.setup\((\{[\s\S]*?\})\)\s*;?/);
        if (!match) return null;
        try { return JSON.parse(match[1]); } catch (e) { return null; }
    }

    // 解析 getInfo 函数
    function parseGetInfo(source) {
        const match = source.match(/getInfo\s*\(\s*\)\s*\{([\s\S]*?)\n\s{4}\}/);
        let body = '';
        if (match && match[1]) {
            body = match[1]; // 
            body = body.replace(/^\s*return\s*\{/, '').replace(/\}\s*;\s*$/, '').trim();
        }
        try {
            // 提取 name
            let name = null;
            let nameType = null;
            let nameKey = null;

            const translateMatch = body.match(/name\s*:\s*Scratch\.translate\(\s*(['"])(.*?)\1\s*\)/);
            if (translateMatch) {
                nameType = 'translate';
                nameKey = translateMatch[2];
            } else {
                const stringMatch = body.match(/name\s*:\s*(['"])(.*?)\1/);
                if (stringMatch) {
                    nameType = 'string';
                    name = stringMatch[2];
                }
            }
            // 提取 color1
            const colorMatch = body.match(/color1\s*:\s*(['"])([^'"]+)\1/);
            let color = '#0fbd8c';
            if (colorMatch) {
                color = colorMatch[2];
            }
            // 提取 id
            const idMatch = body.match(/id\s*:\s*(['"])([^'"]+)\1/);
            let id = null;
            if (idMatch) {
                id = idMatch[2];
            }


            body = body.replace(/\/\/.*$|\/\*[\s\S]*?\*\//gm, '').trim(); // 正则表达式匹配单行和多行注释
            body = body.split('\n').map(line => line.replace(/^\s+/, '')).join('\n'); // 删除缩进

            // 提取 ToplevelBlockOpcodes（即blockType值为 Scratch.BlockType.EVENT 的opcode）
            const ToplevelBlockOPs = (function () { const result = []; const blockRegex = /\{\s*opcode:\s*"([^"]+)",\s*blockType:\s*Scratch\.BlockType\.(\w+)/g; let match; while ((match = blockRegex.exec(body)) !== null) { const opcode = match[1]; const blockType = match[2]; if (blockType === 'EVENT') { result.push(id + '_' + opcode); } } return result; })();

            // 提取 MenuOpcodes（即 menus 对象内所有的键）
            const MenuOPs = (function () { const result = []; const lines = body.split('\n'); let menuStartLine = -1; for (let i = 0; i < lines.length; i++) { if (/^\s*menus:/.test(lines[i])) { menuStartLine = i; break; } } if (menuStartLine === -1) return result; for (let i = menuStartLine + 1; i < lines.length; i++) { const match = lines[i].match(/^\s*(\w+):\s*\{/); if (match) { result.push(id + '_menu_' + match[1]); } } return result; })();

            return { name, nameType, nameKey, color, ToplevelBlockOPs, MenuOPs };
        } catch (e) {
            console.warn('解析 getInfo 失败:', e.message);
            return null;
        }
    }

    try {
        const translationData = parseTranslationData(source);
        const zhMap = translationData?.['zh-cn'];
        const info = parseGetInfo(source);
        if (!info) {
            return { name: null, color: null, ToplevelBlockOPs: null, MenuOPs: null };
        }

        let displayName = null;
        if (info.nameType === 'translate' && info.nameKey) {
            displayName = zhMap?.['_' + info.nameKey] || zhMap?.[info.nameKey] || info.nameKey;
        } else if (info.nameType === 'string') {
            displayName = info.name;
        }

        return { name: displayName, color: info.color, ToplevelBlockOPs: info.ToplevelBlockOPs, MenuOPs: info.MenuOPs };
    } catch (e) {
        console.warn('GetExtensionsInfo 执行失败:', e.message);
        return { name: null, color: null, ToplevelBlockOPs: null, MenuOPs: null };
    }
}