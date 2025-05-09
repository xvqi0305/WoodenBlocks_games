/**
 * 游戏主文件
 * 负责初始化游戏、处理用户交互和更新游戏界面
 */

import { GameState } from './gameState.js';
import { BLOCK_SHAPES, createBlockElement } from '../components/blocks.js';

class Game {
    constructor() {
        // 初始化游戏状态
        this.gameState = new GameState();
        
        // DOM元素引用
        this.gameBoard = document.getElementById('game-board');
        this.blockSlots = [
            document.getElementById('block-slot-0'),
            document.getElementById('block-slot-1'),
            document.getElementById('block-slot-2')
        ];
        this.scoreValue = document.getElementById('score-value');
        this.streakValue = document.getElementById('streak-value');
        this.finalScore = document.getElementById('final-score');
        this.highScore = document.getElementById('high-score');
        
        // 对话框
        this.gameOverDialog = document.getElementById('game-over-dialog');
        this.helpDialog = document.getElementById('help-dialog');
        
        // 按钮
        this.newGameBtn = document.getElementById('new-game-btn');
        this.playAgainBtn = document.getElementById('play-again-btn');
        this.helpBtn = document.getElementById('help-btn');
        this.closeHelpBtn = document.getElementById('close-help-btn');
        
        // 音乐相关
        this.backgroundMusic = document.getElementById('background-music');
        this.musicToggleButton = document.getElementById('music-toggle-btn');
        this.isMusicPlaying = false; // 初始假定音乐关闭，下面尝试开启

        if (this.backgroundMusic && this.musicToggleButton) {
            // 尝试默认播放音乐
            this.backgroundMusic.play().then(() => {
                this.isMusicPlaying = true;
                this.musicToggleButton.textContent = '音乐关'; // 音乐正在播放，按钮显示“关”
            }).catch(error => {
                // 大多数浏览器在用户首次与页面交互前会阻止自动播放
                console.warn("背景音乐自动播放失败 (这通常是正常的，需要用户交互才能播放):", error.name, error.message);
                this.isMusicPlaying = false;
                this.musicToggleButton.textContent = '音乐开'; // 音乐未播放，按钮显示“开”
            });
        } else {
            // 如果元素未找到，确保按钮文本是合理的默认值
            if (this.musicToggleButton) {
                this.musicToggleButton.textContent = '音乐开';
            }
        }

        // 拖拽相关
        this.draggedBlock = null;
        this.draggedBlockType = null;
        this.draggedBlockIndex = null;
        this.initialGridX = 0;  // 初始网格X坐标
        this.initialGridY = 0;  // 初始网格Y坐标
        this.previewElement = null;
        
        // 计算单元格大小
        this.cellSize = this.calculateCellSize();
        
        // 初始化游戏
        this.initGame();
    }
    
    // 计算单元格大小，基于游戏板的大小
    calculateCellSize() {
        const boardWidth = this.gameBoard.clientWidth;
        return Math.floor(boardWidth / 9);
    }
    
    // 初始化游戏
    initGame() {
        // 创建9x9网格
        this.createGameGrid();
        
        // 显示初始的三个方块
        this.updateAvailableBlocks();
        
        // 更新分数显示
        this.updateScoreDisplay();
        
        // 添加事件监听器
        this.addEventListeners();
        
        // 设置窗口大小变化监听器
        window.addEventListener('resize', () => {
            this.cellSize = this.calculateCellSize();
            this.updateGameBoard();
        });
    }
    
    // 创建游戏网格
    createGameGrid() {
        console.log('创建游戏网格');
        
        this.gameBoard.innerHTML = '';
        
        for (let y = 0; y < 9; y++) {
            for (let x = 0; x < 9; x++) {
                const cell = document.createElement('div');
                cell.className = 'grid-cell';
                cell.dataset.x = x;
                cell.dataset.y = y;
                
                // 添加3x3子区域的视觉区分
                const subgridX = Math.floor(x / 3);
                const subgridY = Math.floor(y / 3);
                cell.classList.add(`subgrid-${subgridY}-${subgridX}`);
                
                // 添加特殊的样式类以增强3x3子区域的视觉区分
                if ((subgridX + subgridY) % 2 === 0) {
                    cell.classList.add('subgrid-even');
                } else {
                    cell.classList.add('subgrid-odd');
                }
                
                this.gameBoard.appendChild(cell);
            }
        }
    }
    
    // 更新游戏板显示
    updateGameBoard() {
        // 清除当前游戏板
        this.gameBoard.innerHTML = '';
        
        // 重新创建网格
        this.createGameGrid();
        
        // 根据游戏状态更新网格显示
        for (let y = 0; y < 9; y++) {
            for (let x = 0; x < 9; x++) {
                const blockType = this.gameState.grid[y][x];
                if (blockType) {
                    this.renderBlockInGrid(blockType, x, y);
                }
            }
        }
        
        // 更新可用方块显示
        this.updateAvailableBlocks();
    }
    
    // 在网格中渲染方块
    renderBlockInGrid(blockType, gridX, gridY) {
        console.log(`渲染单个单元格: 类型=${blockType}, 位置=(${gridX},${gridY})`);
        
        // 检查方块类型是否存在
        if (!BLOCK_SHAPES[blockType]) {
            console.error(`方块类型 ${blockType} 不存在!`);
            return;
        }

        // 获取方块样式 (颜色等)
        const blockShape = BLOCK_SHAPES[blockType];
        const { color, borderColor } = blockShape;

        // 找到目标网格单元格元素
        const cellElement = this.gameBoard.querySelector(`[data-x="${gridX}"][data-y="${gridY}"]`);

        if (cellElement) {
            // 清除可能存在的旧单元格内容 (防止重复添加)
            while (cellElement.firstChild) {
                cellElement.removeChild(cellElement.firstChild);
            }

            // 创建单个方块单元格视觉元素
            const blockCell = document.createElement('div');
            blockCell.className = 'block-cell';
            blockCell.style.width = `${this.cellSize - 2}px`;
            blockCell.style.height = `${this.cellSize - 2}px`;
            blockCell.style.backgroundColor = color;
            blockCell.style.borderColor = borderColor;

            // 添加到网格单元格
            cellElement.appendChild(blockCell);
            cellElement.dataset.filled = 'true';
            cellElement.dataset.blockType = blockType; // 保持数据属性，可能有用
        } else {
            console.error(`找不到单元格元素: (${gridX},${gridY})`);
        }
    }
    
    // 更新可用方块显示
    updateAvailableBlocks() {
        // 清空方块槽
        this.blockSlots.forEach(slot => {
            slot.innerHTML = '';
        });
        
        // 显示当前可用的方块
        this.gameState.availableBlocks.forEach((blockType, index) => {
            if (index < this.blockSlots.length) {
                const slot = this.blockSlots[index];
                
                // 计算方块在槽中的大小
                const slotSize = slot.clientWidth;
                const blockShape = BLOCK_SHAPES[blockType];
                const maxDimension = Math.max(blockShape.width, blockShape.height);
                const scale = Math.min(1, (slotSize * 0.8) / (maxDimension * this.cellSize));
                
                // 创建方块元素
                const blockElement = createBlockElement(blockType, this.cellSize * scale);
                
                // 设置方块位置居中
                blockElement.style.position = 'absolute';
                blockElement.style.left = '50%';
                blockElement.style.top = '50%';
                blockElement.style.transform = 'translate(-50%, -50%)';
                
                // 添加拖拽属性
                blockElement.draggable = true;
                blockElement.dataset.blockType = blockType;
                blockElement.dataset.blockIndex = index;
                
                // 添加到槽中
                slot.appendChild(blockElement);
                
                // 添加拖拽事件监听器
                this.addDragListeners(blockElement);
            }
        });
    }
    
    // 添加拖拽事件监听器
    addDragListeners(blockElement) {
        // 触摸设备的拖拽
        blockElement.addEventListener('touchstart', (e) => {
            if (e.touches.length === 1) {
                const touch = e.touches[0];
                this.handleDragStart(blockElement, touch.clientX, touch.clientY);
            }
            e.preventDefault(); // 防止默认触摸行为，如页面滚动
        }, { passive: false });

        // 鼠标设备的拖拽
        blockElement.addEventListener('mousedown', (e) => {
            if (e.button === 0) { // 仅处理鼠标左键
                this.handleDragStart(blockElement, e.clientX, e.clientY);
            }
            e.preventDefault(); // 防止默认鼠标行为，如文本选择
        });
    }

    // 处理拖拽开始
    handleDragStart(blockElement, clientX, clientY) {
        this.draggedBlockType = blockElement.dataset.blockType;
        this.draggedBlockIndex = parseInt(blockElement.dataset.blockIndex);
        
        // console.log(`开始拖拽方块: 类型=${this.draggedBlockType}, 索引=${this.draggedBlockIndex}`);
        
        if (!this.gameState.availableBlocks.includes(this.draggedBlockType)) {
            console.error(`方块类型 ${this.draggedBlockType} 不在可用方块列表中!`);
            return;
        }
        const shapeDetails = BLOCK_SHAPES[this.draggedBlockType];
        if (!shapeDetails) {
            console.error(`方块形状 ${this.draggedBlockType} 不存在!`);
            return;
        }
        
        this.draggedBlock = createBlockElement(this.draggedBlockType, this.cellSize, false);
        this.draggedBlock.style.position = 'fixed';
        this.draggedBlock.style.zIndex = '1000';
        this.draggedBlock.style.opacity = '0.8';
        this.draggedBlock.style.pointerEvents = 'none'; // 允许事件穿透
        
        const boardRect = this.gameBoard.getBoundingClientRect();
        // 计算控制点（鼠标/触摸）所在的网格坐标
        const controlGridX = Math.floor((clientX - boardRect.left) / this.cellSize);
        const controlGridY = Math.floor((clientY - boardRect.top) / this.cellSize);
        
        const blockWidth = shapeDetails.width;
        const blockHeight = shapeDetails.height;
        
        // 计算方块左上角应在的网格坐标 (使控制点在方块右下角)
        const placeGridX = controlGridX - blockWidth + 1;
        const placeGridY = controlGridY - blockHeight + 1;
        
        this.initialGridX = placeGridX; // 保存用于可能的复位或逻辑
        this.initialGridY = placeGridY;
        
        // 定位拖拽的方块，使其中心大致在鼠标/触摸点下方
        this.draggedBlock.style.left = `${clientX - (this.cellSize * blockWidth / 2)}px`;
        this.draggedBlock.style.top = `${clientY - (this.cellSize * blockHeight / 2)}px`;
        
        document.body.appendChild(this.draggedBlock);
        this.updateBlockPreview(placeGridX, placeGridY); // 预览基于计算的放置点
        
        // 添加全局事件监听器以处理拖拽过程和结束
        document.addEventListener('mousemove', this.handleDragMove);
        document.addEventListener('touchmove', this.handleTouchMove, { passive: false });
        document.addEventListener('mouseup', this.handleDragEnd);
        document.addEventListener('touchend', this.handleDragEnd);
    }

    // 处理拖拽移动
    handleDragMove = (e) => {
        if (!this.draggedBlock) return;
        
        const clientX = e.clientX || (e.touches && e.touches[0] && e.touches[0].clientX);
        const clientY = e.clientY || (e.touches && e.touches[0] && e.touches[0].clientY);
        
        if (typeof clientX === 'undefined' || typeof clientY === 'undefined') return;
        
        const shapeDetails = BLOCK_SHAPES[this.draggedBlockType];
        if (shapeDetails) {
             // 1. 更新被拖拽木块的屏幕位置 (使其中心大致跟随指针)
            const blockPixelWidth = this.cellSize * shapeDetails.width;
            const blockPixelHeight = this.cellSize * shapeDetails.height;
            const draggedBlockScreenX = clientX - (blockPixelWidth / 2);
            const draggedBlockScreenY = clientY - (blockPixelHeight / 2);
            
            this.draggedBlock.style.left = `${draggedBlockScreenX}px`;
            this.draggedBlock.style.top = `${draggedBlockScreenY}px`;

            // 2. 计算虚影的像素位置：实体木块位置 + 微小右下偏移
            const shadowOffsetX = 5; // 右偏移量 (像素)
            const shadowOffsetY = 5; // 下偏移量 (像素)
            const shadowScreenX = draggedBlockScreenX + shadowOffsetX;
            const shadowScreenY = draggedBlockScreenY + shadowOffsetY;

            // 3. 将虚影的像素位置转换为游戏板网格坐标 (使其对齐格子)
            const boardRect = this.gameBoard.getBoundingClientRect();
            const previewPlaceGridX = Math.round((shadowScreenX - boardRect.left) / this.cellSize);
            const previewPlaceGridY = Math.round((shadowScreenY - boardRect.top) / this.cellSize);
            
            // 4. 更新预览
            this.updateBlockPreview(previewPlaceGridX, previewPlaceGridY);
        }
    }

    // 处理触摸移动
    handleTouchMove = (e) => {
        if (this.draggedBlock) {
            e.preventDefault(); // 阻止滚动
        }
        // 直接将触摸事件对象传递给 handleDragMove，它能从中提取坐标
        if (e.touches && e.touches.length > 0) { 
            this.handleDragMove(e);
        }
    }
    
    // 处理拖拽结束
    handleDragEnd = (e) => {
        if (!this.draggedBlock) return;
        
        let clientX, clientY;

        if (e.type === 'mouseup') {
            clientX = e.clientX;
            clientY = e.clientY;
        } else if (e.type === 'touchend') {
            if (e.changedTouches && e.changedTouches.length > 0) {
                clientX = e.changedTouches[0].clientX;
                clientY = e.changedTouches[0].clientY;
            } else {
                console.warn("Touchend event did not have changedTouches.");
                this.cleanupDrag();
                document.removeEventListener('mousemove', this.handleDragMove);
                document.removeEventListener('touchmove', this.handleTouchMove);
                document.removeEventListener('mouseup', this.handleDragEnd);
                document.removeEventListener('touchend', this.handleDragEnd);
                return;
            }
        } else {
            console.error("Unknown event type in handleDragEnd:", e.type);
            this.cleanupDrag();
            document.removeEventListener('mousemove', this.handleDragMove);
            document.removeEventListener('touchmove', this.handleTouchMove);
            document.removeEventListener('mouseup', this.handleDragEnd);
            document.removeEventListener('touchend', this.handleDragEnd);
            return;
        }
        
        if (typeof clientX === 'undefined' || typeof clientY === 'undefined') {
            console.warn("Could not determine clientX/Y in handleDragEnd after type check.");
            this.cleanupDrag();
            document.removeEventListener('mousemove', this.handleDragMove);
            document.removeEventListener('touchmove', this.handleTouchMove);
            document.removeEventListener('mouseup', this.handleDragEnd);
            document.removeEventListener('touchend', this.handleDragEnd);
            return;
        }

        let placementSuccess = false;
        const boardRect = this.gameBoard.getBoundingClientRect();
        const shapeDetails = BLOCK_SHAPES[this.draggedBlockType];

        if (shapeDetails) {
             // ----- 开始新的最终放置位置计算 -----
            // 根据最终的指针位置，计算实体木块本应在的屏幕左上角像素坐标
            const finalDraggedBlockScreenX = clientX - (this.cellSize * shapeDetails.width / 2);
            const finalDraggedBlockScreenY = clientY - (this.cellSize * shapeDetails.height / 2);

            // 计算这个屏幕坐标对应的游戏板网格左上角 (用于最终放置)
            const placeGridX = Math.round((finalDraggedBlockScreenX - boardRect.left) / this.cellSize);
            const placeGridY = Math.round((finalDraggedBlockScreenY - boardRect.top) / this.cellSize);
            // ----- 结束新的最终放置位置计算 -----
            
            // console.log(`尝试放置: 最终计算放置点=(${placeGridX},${placeGridY})`);

            const blockWidthInCells = shapeDetails.width; // 已有 blockWidth
            const blockHeightInCells = shapeDetails.height; // 已有 blockHeight
            
            const isInBoard = 
                placeGridX >= 0 && (placeGridX + blockWidthInCells) <= 9 && 
                placeGridY >= 0 && (placeGridY + blockHeightInCells) <= 9;
            
            const isValid = isInBoard && this.gameState.isValidPlacement(this.draggedBlockType, placeGridX, placeGridY);
            
            // console.log(`放置检查: 在板内=${isInBoard}, 有效=${isValid}`);
            
            if (isValid) {
                placementSuccess = this.placeBlock(placeGridX, placeGridY);
                // console.log(`放置结果: ${placementSuccess ? '成功' : '失败'}`);
            }
        } else {
            console.error(`无法获取方块形状: ${this.draggedBlockType}`);
        }
        
        this.cleanupDrag();
        
        // 移除事件监听器
        document.removeEventListener('mousemove', this.handleDragMove);
        document.removeEventListener('touchmove', this.handleTouchMove);
        document.removeEventListener('mouseup', this.handleDragEnd);
        document.removeEventListener('touchend', this.handleDragEnd);
    }
    
    // 更新方块预览
    updateBlockPreview(gridX, gridY) {
        // 清除之前的预览
        this.cleanupPreview();
        
        // 如果超出网格范围，不显示预览
        if (gridX < 0 || gridY < 0 || gridX >= 9 || gridY >= 9) {
            return;
        }
        
        // 验证方块类型是否有效
        if (!this.draggedBlockType || !BLOCK_SHAPES[this.draggedBlockType]) {
            console.error(`预览错误: 无效的方块类型 ${this.draggedBlockType}`);
            return;
        }
        
        console.log(`更新预览: 类型=${this.draggedBlockType}, 位置=(${gridX},${gridY})`);
        
        // 检查放置是否有效
        const isValid = this.gameState.isValidPlacement(this.draggedBlockType, gridX, gridY);
        console.log(`放置有效性: ${isValid}`);
        
        // 创建预览元素
        this.previewElement = createBlockElement(this.draggedBlockType, this.cellSize, true, isValid);
        
        // 获取网格位置的坐标，考虑页面滚动
        const boardRect = this.gameBoard.getBoundingClientRect();
        
        // 设置预览元素的位置
        this.previewElement.style.position = 'fixed';
        this.previewElement.style.left = `${boardRect.left + gridX * this.cellSize}px`;
        this.previewElement.style.top = `${boardRect.top + gridY * this.cellSize}px`;
        this.previewElement.style.pointerEvents = 'none';
        this.previewElement.style.opacity = '0.6'; // 降低透明度，使拖动的方块更明显
        this.previewElement.dataset.previewType = this.draggedBlockType;
        
        // 添加到文档
        document.body.appendChild(this.previewElement);
    }
    
    // 清理预览
    cleanupPreview() {
        if (this.previewElement) {
            this.previewElement.remove();
            this.previewElement = null;
        }
    }
    
    // 清理拖拽状态
    cleanupDrag() {
        // 移除拖拽中的方块
        if (this.draggedBlock) {
            this.draggedBlock.remove();
            this.draggedBlock = null;
        }
        
        // 移除预览
        if (this.previewElement) {
            this.previewElement.remove();
            this.previewElement = null;
        }
        
        // 重置拖拽状态
        this.draggedBlockType = null;
        this.draggedBlockIndex = null;
    }
    
    // 放置方块 - 返回是否成功放置
    placeBlock(gridX, gridY) {
        console.log(`尝试放置方块: 类型=${this.draggedBlockType}, 位置=(${gridX},${gridY})`);
        
        // 验证方块类型是否有效
        if (!this.draggedBlockType || !BLOCK_SHAPES[this.draggedBlockType]) {
            console.error(`无效的方块类型: ${this.draggedBlockType}`);
            return false;
        }
        
        // 验证索引是否有效
        if (this.draggedBlockIndex === undefined || this.draggedBlockIndex < 0 || 
            this.draggedBlockIndex >= this.gameState.availableBlocks.length) {
            console.error(`无效的方块索引: ${this.draggedBlockIndex}`);
            return false;
        }
        
        // 确保使用正确的方块类型
        const blockType = this.draggedBlockType;
        console.log(`当前方块形状:`, BLOCK_SHAPES[blockType]);
        
        // 尝试在游戏状态中放置方块
        const success = this.gameState.placeBlock(blockType, gridX, gridY);
        
        if (success) {
            console.log(`方块放置成功: 类型=${blockType}`);
            
            // 播放放置音效
            this.playSound('place');
            
            // 显示放置动画
            this.showPlaceAnimation(blockType, gridX, gridY);
            
            // 更新游戏板显示
            this.updateGameBoard();
            
            // 更新分数显示
            this.updateScoreDisplay();
            
            // 检查游戏是否结束
            if (this.gameState.isGameOver) {
                this.showGameOver();
            }
        } else {
            console.error(`方块放置失败`);
        }
        
        // 返回放置结果
        return success;
    }
    
    // 显示放置动画
    showPlaceAnimation(blockType, gridX, gridY) {
        const { cells } = BLOCK_SHAPES[blockType];
        
        cells.forEach(([x, y]) => {
            const cellX = gridX + x;
            const cellY = gridY + y;
            
            // 找到对应的网格单元格
            const cellElement = this.gameBoard.querySelector(`[data-x="${cellX}"][data-y="${cellY}"]`);
            if (cellElement) {
                cellElement.classList.add('scale-up');
                setTimeout(() => {
                    cellElement.classList.remove('scale-up');
                }, 300);
            }
        });
    }
    
    // 显示消除动画
    showClearAnimation(clearedItems) {
        if (!clearedItems) return;
        
        // 播放消除音效
        this.playSound('clear');
        
        // 行消除动画
        clearedItems.rows.forEach(y => {
            for (let x = 0; x < 9; x++) {
                const cellElement = this.gameBoard.querySelector(`[data-x="${x}"][data-y="${y}"]`);
                if (cellElement) {
                    const blockCell = cellElement.querySelector('.block-cell');
                    if (blockCell) {
                        blockCell.classList.add('clear-animation');
                    }
                }
            }
        });
        
        // 列消除动画
        clearedItems.cols.forEach(x => {
            for (let y = 0; y < 9; y++) {
                const cellElement = this.gameBoard.querySelector(`[data-x="${x}"][data-y="${y}"]`);
                if (cellElement) {
                    const blockCell = cellElement.querySelector('.block-cell');
                    if (blockCell) {
                        blockCell.classList.add('clear-animation');
                    }
                }
            }
        });
        
        // 3x3子区域消除动画
        clearedItems.subgrids.forEach(({ x, y }) => {
            const startX = x * 3;
            const startY = y * 3;
            
            for (let dy = 0; dy < 3; dy++) {
                for (let dx = 0; dx < 3; dx++) {
                    const cellElement = this.gameBoard.querySelector(`[data-x="${startX + dx}"][data-y="${startY + dy}"]`);
                    if (cellElement) {
                        const blockCell = cellElement.querySelector('.block-cell');
                        if (blockCell) {
                            blockCell.classList.add('clear-animation');
                        }
                    }
                }
            }
        });
        
        // 延迟更新游戏板，等待动画完成
        setTimeout(() => {
            this.updateGameBoard();
        }, 400);
    }
    
    // 更新分数显示
    updateScoreDisplay() {
        this.scoreValue.textContent = this.gameState.score;
        this.streakValue.textContent = this.gameState.streak;
        
        // 如果有连续消除，高亮显示
        if (this.gameState.streak > 1) {
            this.streakValue.classList.add('highlight');
            setTimeout(() => {
                this.streakValue.classList.remove('highlight');
            }, 500);
        }
    }
    
    // 显示得分增加动画
    showScoreIncreaseAnimation(points, x, y) {
        const scoreElement = document.createElement('div');
        scoreElement.className = 'score-increase';
        scoreElement.textContent = `+${points}`;
        
        // 设置位置
        scoreElement.style.left = `${x}px`;
        scoreElement.style.top = `${y}px`;
        
        // 添加到文档
        document.body.appendChild(scoreElement);
        
        // 动画结束后移除
        setTimeout(() => {
            scoreElement.remove();
        }, 1000);
    }
    
    // 播放音效
    playSound(type) {
        // 这里可以实现音效播放逻辑
        // 由于简化实现，暂不添加音效
    }
    
    // 切换背景音乐播放状态
    toggleMusic() {
        if (!this.backgroundMusic || !this.musicToggleButton) {
            console.warn('音乐元素或按钮未找到');
            return;
        }

        if (this.isMusicPlaying) { // 如果当前正在播放，则用户意图是暂停
            this.backgroundMusic.pause();
            this.isMusicPlaying = false; // 更新状态：现在已暂停
            this.musicToggleButton.textContent = '音乐开';
        } else { // 如果当前已暂停，则用户意图是播放
            this.backgroundMusic.play().then(() => {
                this.isMusicPlaying = true; // 更新状态：现在正在播放
                this.musicToggleButton.textContent = '音乐关';
            }).catch(error => {
                console.error("音乐播放失败:", error);
                // isMusicPlaying 状态保持 false (因为播放失败)
                this.musicToggleButton.textContent = '音乐开'; // 确保按钮文本反映暂停状态
            });
        }
    }
    
    // 显示游戏结束对话框
    showGameOver() {
        this.finalScore.textContent = this.gameState.score;
        this.highScore.textContent = this.gameState.highScore;
        this.gameOverDialog.classList.remove('hidden');
    }
    
    // 添加事件监听器
    addEventListeners() {
        // 新游戏按钮
        this.newGameBtn.addEventListener('click', () => {
            this.gameState.resetGame();
            this.updateGameBoard();
            this.updateScoreDisplay();
        });
        
        // 再玩一次按钮
        this.playAgainBtn.addEventListener('click', () => {
            this.gameOverDialog.classList.add('hidden');
            this.gameState.resetGame();
            this.updateGameBoard();
            this.updateScoreDisplay();
        });
        
        // 帮助按钮
        this.helpBtn.addEventListener('click', () => {
            this.helpDialog.classList.remove('hidden');
        });
        
        // 关闭帮助按钮
        this.closeHelpBtn.addEventListener('click', () => {
            this.helpDialog.classList.add('hidden');
        });
        
        // 音乐切换按钮
        if (this.musicToggleButton) {
            this.musicToggleButton.addEventListener('click', () => this.toggleMusic());
        }
    }
}

// 当DOM加载完成后初始化游戏
document.addEventListener('DOMContentLoaded', () => {
    const game = new Game();
});
