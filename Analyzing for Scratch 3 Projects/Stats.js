function CountBlocks(ProjectData, ToplevelBlockOPs, MenuOPs) {
    let BlocksNum = 0,
        PilesNum = 0,
        TrueBlocksNum = 0,
        TruePilesNum = 0,
        FuncDefinitions = 0;
    const BlocksNumInType = { motion: 0, looks: 0, sound: 0, event: 0, control: 0, sensing: 0, operator: 0, data: 0, procedures: 0, others: 0 };
    const ExtBlocksNumInTypes = {};

    const blocksById = new Map();
    const hatCache = new Map();

    ProjectData.targets?.forEach(target => {
        Object.entries(target.blocks || {}).forEach(([blockId, blockData]) => {
            if (blockData && typeof blockData === 'object') blocksById.set(blockId, blockData);
        });
    });

    const shouldExcludeBlock = function (blockData) {
        if (!blockData || typeof blockData !== 'object') return false;
        const opcode = blockData.opcode || 'unknown';
        const shadow = !!blockData.shadow;
        if (opcode === "procedures_definition" || opcode === "procedures_prototype" || MenuOPs.includes(opcode) || ((opcode === "argument_reporter_string_number" || opcode === "argument_reporter_boolean") && shadow)) {
            return true;
        }
        const opcode_prefix = opcode.split('_')[0];
        if (["motion", "looks", "sound", "event", "control", "sensing", "operator", "data", "procedures"].includes(opcode_prefix)) {
            BlocksNumInType[opcode_prefix] = (BlocksNumInType[opcode_prefix] || 0) + 1;
        } else if (opcode === "argument_reporter_string_number" || opcode === "argument_reporter_boolean") {
            BlocksNumInType["procedures"] += 1;
        } else if (Array.isArray(blockData) && (blockData[0] === 12 || blockData[0] === 13)) {
            BlocksNumInType["data"] += 1;
        } else {
            BlocksNumInType["others"] += 1;
            ExtBlocksNumInTypes[opcode_prefix] = (ExtBlocksNumInTypes[opcode_prefix] || 0) + 1;
        }
        return false;
    };

    const TopLevelBlocksIsHat = function (blockId, blockData) {
        if (hatCache.has(blockId)) return hatCache.get(blockId);

        const visited = new Set([blockId]);
        const parentChain = [];
        let currentParentId = blockData?.parent;
        let currentNextId = blockData?.next;
        let maxIterations = 5000;
        let iterations = 0;

        while (currentParentId && iterations < maxIterations) {
            iterations++;

            if (visited.has(currentParentId) && blockData.next === currentNextId && blockData.parent === currentParentId) {
                parentChain.push(currentParentId);
                hatCache.set(blockId, false);
                return false;
            }

            visited.add(currentParentId);
            parentChain.push(currentParentId);

            const parentBlock = blocksById.get(currentParentId);
            if (!parentBlock) {
                hatCache.set(blockId, false);
                return false;
            }

            if (ToplevelBlockOPs.includes(parentBlock.opcode)) {
                hatCache.set(blockId, true);
                return true;
            }

            currentParentId = parentBlock.parent;
            currentNextId = parentBlock.next;
        }

        hatCache.set(blockId, false);
        return false;
    };

    ProjectData.targets?.forEach(target => {
        Object.entries(target.blocks || {}).forEach(([blockId, blockData]) => {
            if (blockData.opcode === "procedures_definition") {
                BlocksNum += 1;
                PilesNum += 1;
                TruePilesNum += 1;
                TrueBlocksNum += 1;
                BlocksNumInType.procedures += 1;
                FuncDefinitions += 1;
            } else {
                if (shouldExcludeBlock(blockData)) return;

                if ((Array.isArray(blockData) && blockData.length > 0 && (blockData[0] === 12 || blockData[0] === 13))) {
                    if (blockData.length === 5) {
                        BlocksNumInType.data += 1;
                        BlocksNum += 1;
                        PilesNum += 1;
                        return;
                    } else return;
                } else if ('topLevel' in blockData && blockData.topLevel) {
                    BlocksNum += 1;
                    PilesNum += 1;
                    if (ToplevelBlockOPs.includes(blockData.opcode)) {
                        TruePilesNum += 1;
                        TrueBlocksNum += 1;
                    }
                } else if (TopLevelBlocksIsHat(blockId, blockData)) {
                    BlocksNum += 1;
                    TrueBlocksNum += 1;
                }
                const inputs = blockData.inputs || {};
                if (length.inputs !== 0) {
                    Object.values(inputs).forEach(inputData => {
                        if (Array.isArray(inputData)) {
                            inputData.forEach(item => {
                                if (Array.isArray(item) && item.length > 0 && (item[0] === 12 || item[0] === 13)) {
                                    BlocksNum += 1;
                                    BlocksNumInType.data += 1;
                                    TrueBlocksNum += 1;
                                }
                            });
                        }
                    });
                }
            }
        });
    });
    return { BlocksNum, PilesNum, TruePilesNum, BlocksNumInType, TrueBlocksNum, ExtBlocksNumInTypes, FuncDefinitions};
};