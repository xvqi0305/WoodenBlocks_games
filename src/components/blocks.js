/**
 * 方块定义模块
 * 定义游戏中所有可用的方块形状
 */

// 方块形状定义
// 每个方块由相对坐标数组定义，相对于左上角(0,0)的位置
export const BLOCK_SHAPES = {
    // 基础形状(条形)
    SINGLE: { 
        cells: [[0, 0]], 
        width: 1, 
        height: 1,
        color: '#3CA3DE',
        borderColor: '#3B82AC'
    },
    HORIZONTAL_2: { 
        cells: [[0, 0], [1, 0]], 
        width: 2, 
        height: 1,
        color: '#F555AD',
        borderColor: '#BE3A82'
    },
    HORIZONTAL_3: { 
        cells: [[0, 0], [1, 0], [2, 0]], 
        width: 3, 
        height: 1,
        color: '#FA5053',
        borderColor: '#DE3638'
    },
    HORIZONTAL_4: { 
        cells: [[0, 0], [1, 0], [2, 0], [3, 0]], 
        width: 4, 
        height: 1,
        color: '#F99825',
        borderColor: '#E06917'
    },
    HORIZONTAL_5: { 
        cells: [[0, 0], [1, 0], [2, 0], [3, 0], [4, 0]], 
        width: 5, 
        height: 1,
        color: '#86BD42',
        borderColor: '#629E12'
    },
    VERTICAL_2: { 
        cells: [[0, 0], [0, 1]], 
        width: 1, 
        height: 2,
        color: '#F555AD',
        borderColor: '#BE3A82'
    },
    VERTICAL_3: { 
        cells: [[0, 0], [0, 1], [0, 2]], 
        width: 1, 
        height: 3,
        color: '#FA5053',
        borderColor: '#DE3638'
    },
    VERTICAL_4: { 
        cells: [[0, 0], [0, 1], [0, 2], [0, 3]], 
        width: 1, 
        height: 4,
        color: '#F99825',
        borderColor: '#E06917'
    },
    VERTICAL_5: { 
        cells: [[0, 0], [0, 1], [0, 2], [0, 3], [0, 4]], 
        width: 1, 
        height: 5,
        color: '#86BD42',
        borderColor: '#629E12'
    },
    
    // 方形
    SQUARE_2X2: { 
        cells: [[0, 0], [1, 0], [0, 1], [1, 1]], 
        width: 2, 
        height: 2,
        color: '#B57CE3',
        borderColor: '#8A5BB6'
    },
    SQUARE_3X3: { 
        cells: [
            [0, 0], [1, 0], [2, 0],
            [0, 1], [1, 1], [2, 1],
            [0, 2], [1, 2], [2, 2]
        ], 
        width: 3, 
        height: 3,
        color: '#52CCBC',
        borderColor: '#239E90'
    },
    
    // L形
    L_SHAPE: { 
        cells: [[0, 0], [0, 1], [0, 2], [1, 2]], 
        width: 2, 
        height: 3,
        color: '#3CA3DE',
        borderColor: '#3B82AC'
    },
    L_SHAPE_MIRROR: { 
        cells: [[1, 0], [1, 1], [1, 2], [0, 2]], 
        width: 2, 
        height: 3,
        color: '#3CA3DE',
        borderColor: '#3B82AC'
    },
    L_SHAPE_LARGE: { 
        cells: [[0, 0], [0, 1], [0, 2], [0, 3], [1, 3]], 
        width: 2, 
        height: 4,
        color: '#F555AD',
        borderColor: '#BE3A82'
    },
    L_SHAPE_LARGE_MIRROR: { 
        cells: [[1, 0], [1, 1], [1, 2], [1, 3], [0, 3]], 
        width: 2, 
        height: 4,
        color: '#F555AD',
        borderColor: '#BE3A82'
    },
    
    // T形
    T_SHAPE: { 
        cells: [[1, 0], [0, 1], [1, 1], [2, 1]], 
        width: 3, 
        height: 2,
        color: '#FA5053',
        borderColor: '#DE3638'
    },
    
    // Z/S形
    Z_SHAPE: { 
        cells: [[0, 0], [1, 0], [1, 1], [2, 1]], 
        width: 3, 
        height: 2,
        color: '#F99825',
        borderColor: '#E06917'
    },
    Z_SHAPE_MIRROR: { 
        cells: [[1, 0], [2, 0], [0, 1], [1, 1]], 
        width: 3, 
        height: 2,
        color: '#F99825',
        borderColor: '#E06917'
    },
    
    // U形
    U_SHAPE: { 
        cells: [[0, 0], [2, 0], [0, 1], [1, 1], [2, 1]], 
        width: 3, 
        height: 2,
        color: '#86BD42',
        borderColor: '#629E12'
    },
    
    // 十字形
    CROSS: { 
        cells: [[1, 0], [0, 1], [1, 1], [2, 1], [1, 2]], 
        width: 3, 
        height: 3,
        color: '#B57CE3',
        borderColor: '#8A5BB6'
    }
};

// 获取所有方块形状的键数组
export const getAllBlockTypes = () => Object.keys(BLOCK_SHAPES);

// 获取方块单元格数量
export const getBlockCellCount = (blockType) => {
    return BLOCK_SHAPES[blockType].cells.length;
};

// 创建随机方块生成器
export class BlockGenerator {
    constructor() {
        this.blockBag = [];
        this.refillBag();
    }
    
    // 重新填充方块袋并洗牌
    refillBag() {
        this.blockBag = getAllBlockTypes();
        this.shuffleBag();
    }
    
    // 洗牌算法 (Fisher-Yates)
    shuffleBag() {
        for (let i = this.blockBag.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [this.blockBag[i], this.blockBag[j]] = [this.blockBag[j], this.blockBag[i]];
        }
    }
    
    // 从袋中抽取一个方块
    getNextBlock() {
        // 如果袋子空了，重新填充
        if (this.blockBag.length === 0) {
            this.refillBag();
        }
        
        // 从袋中取出一个方块
        return this.blockBag.pop();
    }
    
    // 生成三个随机方块
    generateThreeBlocks() {
        return [
            this.getNextBlock(),
            this.getNextBlock(),
            this.getNextBlock()
        ];
    }
}

// 创建方块DOM元素
export const createBlockElement = (blockType, cellSize, isPreview = false, isValid = true) => {
    const blockShape = BLOCK_SHAPES[blockType];
    const blockElement = document.createElement('div');
    blockElement.className = 'block';
    blockElement.dataset.blockType = blockType;
    
    // 设置方块容器的大小
    blockElement.style.width = `${blockShape.width * cellSize}px`;
    blockElement.style.height = `${blockShape.height * cellSize}px`;
    blockElement.style.position = 'relative';
    
    // 为每个单元格创建元素
    blockShape.cells.forEach(([x, y]) => {
        const cell = document.createElement('div');
        cell.className = isPreview 
            ? (isValid ? 'block-cell preview-valid' : 'block-cell preview-invalid')
            : 'block-cell';
        
        // 设置单元格位置和大小
        cell.style.width = `${cellSize - 2}px`; // 减去边框
        cell.style.height = `${cellSize - 2}px`;
        cell.style.left = `${x * cellSize}px`;
        cell.style.top = `${y * cellSize}px`;
        
        // 设置单元格颜色
        if (!isPreview) {
            cell.style.backgroundColor = blockShape.color;
            cell.style.borderColor = blockShape.borderColor;
        }
        
        blockElement.appendChild(cell);
    });
    
    return blockElement;
};
