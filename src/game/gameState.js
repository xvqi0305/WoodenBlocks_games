/**
 * 游戏状态管理模块
 * 负责管理游戏的核心状态和逻辑
 */

import { BlockGenerator, getBlockCellCount, BLOCK_SHAPES } from '../components/blocks.js';

export class GameState {
    constructor() {
        // 初始化游戏状态
        this.score = 0;
        this.highScore = this.loadHighScore();
        this.streak = 0;
        this.isGameOver = false;
        
        // 初始化9x9网格
        this.grid = Array(9).fill().map(() => Array(9).fill(null));
        
        // 创建方块生成器
        this.blockGenerator = new BlockGenerator();
        
        // 当前可选择的三个方块
        this.availableBlocks = [];
        
        // 生成初始的三个方块
        this.generateNewBlocks();
    }
    
    // 加载本地存储的最高分
    loadHighScore() {
        const savedScore = localStorage.getItem('woodenBlocksHighScore');
        return savedScore ? parseInt(savedScore) : 0;
    }
    
    // 保存最高分到本地存储
    saveHighScore() {
        localStorage.setItem('woodenBlocksHighScore', this.highScore.toString());
    }
    
    // 生成新的三个方块
    generateNewBlocks() {
        this.availableBlocks = this.blockGenerator.generateThreeBlocks();
    }
    
    // 放置方块到网格
    placeBlock(blockType, gridX, gridY) {
        console.log(`尝试放置方块: 类型=${blockType}, 位置=(${gridX},${gridY})`);
        
        const blockIndex = this.availableBlocks.indexOf(blockType);
        if (blockIndex === -1) {
            console.error(`方块类型 ${blockType} 不在可用方块列表中!`);
            return false;
        }
        
        // 检查放置是否有效
        if (!this.isValidPlacement(blockType, gridX, gridY)) {
            console.error(`方块放置无效!`);
            return false;
        }
        
        // 获取方块形状信息
        const blockShape = this.getBlockShape(blockType);
        if (!blockShape) {
            console.error(`无法获取方块形状: ${blockType}`);
            return false;
        }
        
        const { cells } = blockShape;
        console.log(`放置方块: 类型=${blockType}, 单元格数=${cells.length}`);
        
        // 在网格上标记方块位置 - 使用原始的blockType而不是其他值
        cells.forEach(([x, y]) => {
            const gridPosX = gridX + x;
            const gridPosY = gridY + y;
            this.grid[gridPosY][gridPosX] = blockType;
        });
        
        // 从可用方块中移除已放置的方块
        this.availableBlocks.splice(blockIndex, 1);
        
        // 增加基础得分（方块单元格数量）
        const cellCount = getBlockCellCount(blockType);
        this.addScore(cellCount, 'place');
        
        // 检查并处理消除
        this.checkAndClearLines();
        
        // 如果所有方块都已放置，生成新的三个方块
        if (this.availableBlocks.length === 0) {
            this.generateNewBlocks();
        }
        
        // 检查游戏是否结束
        this.checkGameOver();
        
        return true;
    }
    
    // 检查方块放置是否有效
    isValidPlacement(blockType, gridX, gridY) {
        console.log(`检查放置有效性: 方块类型=${blockType}, 网格位置=(${gridX},${gridY})`);
        
        // 获取方块形状
        const blockShape = this.getBlockShape(blockType);
        console.log('方块形状对象:', blockShape);
        
        if (!blockShape) {
            console.error(`方块类型 ${blockType} 不存在!`);
            return false;
        }
        
        const { cells } = blockShape;
        console.log('方块单元格坐标:', cells);
        
        // 检查每个单元格
        for (const [x, y] of cells) {
            const gridPosX = gridX + x;
            const gridPosY = gridY + y;
            
            console.log(`检查单元格: 相对坐标=(${x},${y}), 网格坐标=(${gridPosX},${gridPosY})`);
            
            // 检查是否超出边界
            if (gridPosX < 0 || gridPosX >= 9 || gridPosY < 0 || gridPosY >= 9) {
                console.log(`单元格 (${gridPosX},${gridPosY}) 超出边界`);
                return false;
            }
            
            // 检查单元格是否已被占用
            if (this.grid[gridPosY][gridPosX] !== null) {
                console.log(`单元格 (${gridPosX},${gridPosY}) 已被占用`);
                return false;
            }
        }
        
        console.log('放置有效!');
        return true;
    }
    
    // 获取方块形状信息
    getBlockShape(blockType) {
        // 直接使用从blocks.js导入的BLOCK_SHAPES
        return BLOCK_SHAPES[blockType];
    }
    
    // 检查并清除已填满的行、列和3x3区域
    checkAndClearLines() {
        const clearedItems = {
            rows: [],
            cols: [],
            subgrids: []
        };
        
        // 检查行
        for (let y = 0; y < 9; y++) {
            if (this.isRowFull(y)) {
                clearedItems.rows.push(y);
            }
        }
        
        // 检查列
        for (let x = 0; x < 9; x++) {
            if (this.isColFull(x)) {
                clearedItems.cols.push(x);
            }
        }
        
        // 检查3x3子区域
        for (let subY = 0; subY < 3; subY++) {
            for (let subX = 0; subX < 3; subX++) {
                if (this.isSubgridFull(subX, subY)) {
                    clearedItems.subgrids.push({ x: subX, y: subY });
                }
            }
        }
        
        // 计算总共消除的项数
        const totalCleared = clearedItems.rows.length + clearedItems.cols.length + clearedItems.subgrids.length;
        
        // 如果有消除，更新连续消除计数和分数
        if (totalCleared > 0) {
            this.streak++;
            
            // 计算消除得分
            this.calculateClearScore(totalCleared);
            
            // 清除已填满的行、列和区域
            this.clearLines(clearedItems);
            
            return clearedItems;
        } else {
            // 如果没有消除，重置连续消除计数
            this.streak = 0;
            return null;
        }
    }
    
    // 检查一行是否已填满
    isRowFull(y) {
        return this.grid[y].every(cell => cell !== null);
    }
    
    // 检查一列是否已填满
    isColFull(x) {
        return this.grid.every(row => row[x] !== null);
    }
    
    // 检查3x3子区域是否已填满
    isSubgridFull(subX, subY) {
        const startX = subX * 3;
        const startY = subY * 3;
        
        for (let y = 0; y < 3; y++) {
            for (let x = 0; x < 3; x++) {
                if (this.grid[startY + y][startX + x] === null) {
                    return false;
                }
            }
        }
        
        return true;
    }
    
    // 清除已填满的行、列和区域
    clearLines(clearedItems) {
        // 清除行
        clearedItems.rows.forEach(y => {
            for (let x = 0; x < 9; x++) {
                this.grid[y][x] = null;
            }
        });
        
        // 清除列
        clearedItems.cols.forEach(x => {
            for (let y = 0; y < 9; y++) {
                this.grid[y][x] = null;
            }
        });
        
        // 清除3x3子区域
        clearedItems.subgrids.forEach(({ x, y }) => {
            const startX = x * 3;
            const startY = y * 3;
            
            for (let dy = 0; dy < 3; dy++) {
                for (let dx = 0; dx < 3; dx++) {
                    this.grid[startY + dy][startX + dx] = null;
                }
            }
        });
    }
    
    // 计算消除得分
    calculateClearScore(totalCleared) {
        // 基础消除得分：每项18分
        const baseScore = totalCleared * 18;
        
        // 多重消除奖励 (Combo)
        let comboMultiplier = 1;
        if (totalCleared > 1) {
            comboMultiplier = 1 + (totalCleared - 1) * 0.5;
        }
        
        // 计算Combo得分
        const comboScore = Math.floor(baseScore * comboMultiplier);
        
        // 连续消除奖励 (Streak)
        let streakBonus = 0;
        if (this.streak === 2) {
            streakBonus = 10;
        } else if (this.streak === 3) {
            streakBonus = 25;
        } else if (this.streak === 4) {
            streakBonus = 45;
        } else if (this.streak >= 5) {
            streakBonus = 70;
        }
        
        // 总得分 = Combo得分 + Streak奖励
        const totalScore = comboScore + streakBonus;
        
        // 添加得分
        this.addScore(totalScore, 'clear', {
            combo: totalCleared,
            comboMultiplier,
            streakBonus
        });
        
        return {
            baseScore,
            comboScore,
            streakBonus,
            totalScore
        };
    }
    
    // 添加得分
    addScore(points, type, details = {}) {
        this.score += points;
        
        // 更新最高分
        if (this.score > this.highScore) {
            this.highScore = this.score;
            this.saveHighScore();
        }
        
        // 返回得分信息，用于UI显示
        return {
            points,
            type,
            ...details
        };
    }
    
    // 检查游戏是否结束
    checkGameOver() {
        // 如果已经是游戏结束状态，直接返回
        if (this.isGameOver) return true;
        
        // 检查当前可用的方块是否有任何一个可以放置
        for (const blockType of this.availableBlocks) {
            if (this.canPlaceBlockAnywhere(blockType)) {
                return false;
            }
        }
        
        // 如果没有任何方块可以放置，游戏结束
        this.isGameOver = true;
        return true;
    }
    
    // 检查指定方块是否可以放置在网格的任何位置
    canPlaceBlockAnywhere(blockType) {
        for (let y = 0; y < 9; y++) {
            for (let x = 0; x < 9; x++) {
                if (this.isValidPlacement(blockType, x, y)) {
                    return true;
                }
            }
        }
        return false;
    }
    
    // 重置游戏
    resetGame() {
        this.score = 0;
        this.streak = 0;
        this.isGameOver = false;
        this.grid = Array(9).fill().map(() => Array(9).fill(null));
        this.generateNewBlocks();
    }
}
