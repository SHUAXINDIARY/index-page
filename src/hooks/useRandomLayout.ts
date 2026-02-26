import { useMemo, useState, useEffect, useCallback, useSyncExternalStore } from 'react';

/** 卡片尺寸配置 */
interface CardSize {
  /** 卡片宽度 */
  width: number;
  /** 卡片高度 */
  height: number;
}

/** 卡片位置信息 */
interface CardPosition {
  /** X 坐标 */
  x: number;
  /** Y 坐标 */
  y: number;
  /** 卡片宽度 */
  width: number;
  /** 卡片高度 */
  height: number;
}

/** 卡片配置项 */
interface CardConfig {
  /** 卡片唯一标识 */
  id: string;
  /** 卡片尺寸 */
  size: CardSize;
}

/** 基础布局结果（不含缩放） */
interface BaseLayoutResult {
  /** 各卡片的位置映射 */
  positions: Record<string, CardPosition>;
  /** 整体布局的宽度 */
  totalWidth: number;
  /** 整体布局的高度 */
  totalHeight: number;
}

/** 布局结果（含缩放） */
interface LayoutResult extends BaseLayoutResult {
  /** 缩放比例（用于适配视口） */
  scale: number;
}

/** 卡片尺寸分类 */
type CardSizeCategory = 'large' | 'medium' | 'small';

/** 带分类的卡片配置 */
interface CategorizedCard extends CardConfig {
  /** 尺寸分类 */
  category: CardSizeCategory;
  /** 面积 */
  area: number;
}

/** 卡片间距 */
const CARD_GAP = 20;

/** 视口内边距 */
const VIEWPORT_PADDING = 80;

/** 最小缩放比例 */
const MIN_SCALE = 0.5;

/** 最大缩放比例 */
const MAX_SCALE = 1;

/** 视口尺寸缓存 */
let cachedViewportSize = {
  width: typeof window !== 'undefined' ? window.innerWidth : 1920,
  height: typeof window !== 'undefined' ? window.innerHeight : 1080,
};

/** 服务端渲染默认视口 */
const serverSnapshot = { width: 1920, height: 1080 };

/** 更新视口尺寸缓存 */
const updateViewportCache = () => {
  cachedViewportSize = {
    width: window.innerWidth,
    height: window.innerHeight,
  };
};

/** 获取视口尺寸（返回缓存对象，确保引用稳定） */
const getViewportSize = () => cachedViewportSize;

/** 获取服务端视口快照 */
const getServerSnapshot = () => serverSnapshot;

/** 订阅视口变化 */
const subscribeToViewport = (callback: () => void) => {
  const handleResize = () => {
    updateViewportCache();
    callback();
  };
  window.addEventListener('resize', handleResize);
  return () => window.removeEventListener('resize', handleResize);
};

/** 大卡片面积阈值 */
const LARGE_AREA_THRESHOLD = 60000;

/** 中等卡片面积阈值 */
const MEDIUM_AREA_THRESHOLD = 15000;

/** 黄金比例 */
const GOLDEN_RATIO = 1.618;

/** 随机打乱数组（Fisher-Yates 洗牌算法） */
const shuffleArray = <T,>(array: T[]): T[] => {
  const result = [...array];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
};

/** 根据面积对卡片进行分类 */
const categorizeCard = (card: CardConfig): CategorizedCard => {
  const area = card.size.width * card.size.height;
  let category: CardSizeCategory;

  if (area >= LARGE_AREA_THRESHOLD) {
    category = 'large';
  } else if (area >= MEDIUM_AREA_THRESHOLD) {
    category = 'medium';
  } else {
    category = 'small';
  }

  return { ...card, category, area };
};

/** 检测两个矩形是否重叠 */
const isOverlapping = (
  rect1: CardPosition,
  rect2: CardPosition,
  gap: number = CARD_GAP
): boolean => {
  return !(
    rect1.x + rect1.width + gap <= rect2.x ||
    rect2.x + rect2.width + gap <= rect1.x ||
    rect1.y + rect1.height + gap <= rect2.y ||
    rect2.y + rect2.height + gap <= rect1.y
  );
};

/** 检测是否与已放置的卡片重叠 */
const hasCollision = (
  newRect: CardPosition,
  placedCards: CardPosition[],
  gap: number = CARD_GAP
): boolean => {
  return placedCards.some((placed) => isOverlapping(newRect, placed, gap));
};

/** 计算布局边界 */
const getBounds = (placedCards: CardPosition[]) => {
  if (placedCards.length === 0) {
    return { minX: 0, minY: 0, maxX: 0, maxY: 0, centerX: 0, centerY: 0 };
  }

  let minX = Infinity;
  let minY = Infinity;
  let maxX = -Infinity;
  let maxY = -Infinity;

  placedCards.forEach((p) => {
    minX = Math.min(minX, p.x);
    minY = Math.min(minY, p.y);
    maxX = Math.max(maxX, p.x + p.width);
    maxY = Math.max(maxY, p.y + p.height);
  });

  return {
    minX,
    minY,
    maxX,
    maxY,
    centerX: (minX + maxX) / 2,
    centerY: (minY + maxY) / 2,
  };
};

/** 计算宽高比偏离程度（越接近黄金比例越好） */
const getAspectRatioScore = (
  placedCards: CardPosition[],
  newCard: CardPosition
): number => {
  const allCards = [...placedCards, newCard];
  const bounds = getBounds(allCards);
  const width = bounds.maxX - bounds.minX;
  const height = bounds.maxY - bounds.minY;

  if (height === 0) return 0;

  const ratio = width / height;
  const targetRatio = GOLDEN_RATIO;

  return Math.abs(ratio - targetRatio) * 100;
};

/** 计算视觉平衡分数（基于质心偏移） */
const getBalanceScore = (
  placedCards: CardPosition[],
  newCard: CardPosition
): number => {
  const allCards = [...placedCards, newCard];
  const bounds = getBounds(allCards);

  let weightedX = 0;
  let weightedY = 0;
  let totalArea = 0;

  allCards.forEach((card) => {
    const area = card.width * card.height;
    const centerX = card.x + card.width / 2;
    const centerY = card.y + card.height / 2;
    weightedX += centerX * area;
    weightedY += centerY * area;
    totalArea += area;
  });

  const centroidX = weightedX / totalArea;
  const centroidY = weightedY / totalArea;

  const offsetX = Math.abs(centroidX - bounds.centerX);
  const offsetY = Math.abs(centroidY - bounds.centerY);

  return (offsetX + offsetY) * 0.5;
};

/** 计算紧凑度分数（填充率） */
const getCompactnessScore = (
  placedCards: CardPosition[],
  newCard: CardPosition
): number => {
  const allCards = [...placedCards, newCard];
  const bounds = getBounds(allCards);

  const boundingArea = (bounds.maxX - bounds.minX) * (bounds.maxY - bounds.minY);
  const cardsArea = allCards.reduce((sum, c) => sum + c.width * c.height, 0);

  if (boundingArea === 0) return 0;

  const fillRate = cardsArea / boundingArea;
  return (1 - fillRate) * 200;
};

/** 计算边缘对齐分数（鼓励卡片边缘对齐） */
const getAlignmentScore = (
  placedCards: CardPosition[],
  newCard: CardPosition
): number => {
  let alignmentBonus = 0;

  placedCards.forEach((placed) => {
    if (Math.abs(newCard.x - placed.x) < 2) alignmentBonus -= 15;
    if (Math.abs(newCard.x + newCard.width - (placed.x + placed.width)) < 2) alignmentBonus -= 15;
    if (Math.abs(newCard.y - placed.y) < 2) alignmentBonus -= 15;
    if (Math.abs(newCard.y + newCard.height - (placed.y + placed.height)) < 2) alignmentBonus -= 15;
    if (Math.abs(newCard.x - (placed.x + placed.width + CARD_GAP)) < 2) alignmentBonus -= 10;
    if (Math.abs(newCard.y - (placed.y + placed.height + CARD_GAP)) < 2) alignmentBonus -= 10;
  });

  return alignmentBonus;
};

/** 生成候选位置 */
const generateCandidatePositions = (
  placedCards: CardPosition[],
  cardWidth: number,
  cardHeight: number
): Array<{ x: number; y: number }> => {
  const candidates: Array<{ x: number; y: number }> = [];

  if (placedCards.length === 0) {
    return [{ x: 0, y: 0 }];
  }

  const bounds = getBounds(placedCards);

  placedCards.forEach((placed) => {
    candidates.push(
      { x: placed.x + placed.width + CARD_GAP, y: placed.y },
      { x: placed.x, y: placed.y + placed.height + CARD_GAP },
      { x: placed.x + placed.width + CARD_GAP, y: placed.y + placed.height - cardHeight },
      { x: placed.x - cardWidth - CARD_GAP, y: placed.y },
      { x: placed.x, y: placed.y - cardHeight - CARD_GAP },
      { x: placed.x + placed.width + CARD_GAP, y: placed.y + (placed.height - cardHeight) / 2 },
      { x: placed.x + (placed.width - cardWidth) / 2, y: placed.y + placed.height + CARD_GAP },
      { x: placed.x - cardWidth - CARD_GAP, y: placed.y + placed.height - cardHeight },
      { x: placed.x + placed.width - cardWidth, y: placed.y - cardHeight - CARD_GAP }
    );
  });

  candidates.push(
    { x: bounds.maxX + CARD_GAP, y: bounds.minY },
    { x: bounds.minX, y: bounds.maxY + CARD_GAP },
    { x: bounds.minX - cardWidth - CARD_GAP, y: bounds.minY },
    { x: bounds.minX, y: bounds.minY - cardHeight - CARD_GAP },
    { x: bounds.maxX + CARD_GAP, y: bounds.centerY - cardHeight / 2 },
    { x: bounds.centerX - cardWidth / 2, y: bounds.maxY + CARD_GAP }
  );

  return candidates;
};

/** 计算位置综合得分 */
const calculatePositionScore = (
  placedCards: CardPosition[],
  newCard: CardPosition,
  category: CardSizeCategory
): number => {
  const bounds = getBounds(placedCards);
  const cardCenterX = newCard.x + newCard.width / 2;
  const cardCenterY = newCard.y + newCard.height / 2;

  const distToCenter = Math.sqrt(
    Math.pow(cardCenterX - bounds.centerX, 2) + Math.pow(cardCenterY - bounds.centerY, 2)
  );

  const aspectScore = getAspectRatioScore(placedCards, newCard);
  const balanceScore = getBalanceScore(placedCards, newCard);
  const compactnessScore = getCompactnessScore(placedCards, newCard);
  const alignmentScore = getAlignmentScore(placedCards, newCard);

  let categoryWeight = 1;
  if (category === 'large') {
    categoryWeight = 0.8;
  } else if (category === 'small') {
    categoryWeight = 1.2;
  }

  const randomFactor = (Math.random() - 0.5) * 30;

  return (
    distToCenter * 0.3 * categoryWeight +
    aspectScore * 0.25 +
    balanceScore * 0.2 +
    compactnessScore * 0.15 +
    alignmentScore +
    randomFactor
  );
};

/**
 * 使用美观布局算法计算卡片位置
 * 策略：
 * 1. 按尺寸分类卡片（大、中、小）
 * 2. 大卡片优先放置在中心区域作为锚点
 * 3. 中等卡片填充周围空间
 * 4. 小卡片填补空隙
 * 5. 综合考虑黄金比例、视觉平衡、紧凑度和对齐
 */
const calculateAestheticLayout = (cards: CardConfig[]): BaseLayoutResult => {
  const positions: Record<string, CardPosition> = {};
  const placedCards: CardPosition[] = [];

  const categorizedCards = cards.map(categorizeCard);

  const largeCards = shuffleArray(categorizedCards.filter((c) => c.category === 'large'));
  const mediumCards = shuffleArray(categorizedCards.filter((c) => c.category === 'medium'));
  const smallCards = shuffleArray(categorizedCards.filter((c) => c.category === 'small'));

  const sortedCards = [
    ...largeCards.sort((a, b) => b.area - a.area),
    ...mediumCards.sort((a, b) => b.area - a.area),
    ...smallCards.sort((a, b) => b.area - a.area),
  ];

  sortedCards.forEach((card) => {
    const { width, height } = card.size;

    const candidates = generateCandidatePositions(placedCards, width, height);

    let bestPosition: CardPosition | null = null;
    let bestScore = Infinity;

    for (const candidate of candidates) {
      const newRect: CardPosition = {
        x: candidate.x,
        y: candidate.y,
        width,
        height,
      };

      if (!hasCollision(newRect, placedCards)) {
        const score = calculatePositionScore(placedCards, newRect, card.category);

        if (score < bestScore) {
          bestScore = score;
          bestPosition = newRect;
        }
      }
    }

    if (!bestPosition) {
      const bounds = getBounds(placedCards);
      const fallbackPositions = [
        { x: bounds.maxX + CARD_GAP, y: bounds.minY },
        { x: bounds.minX, y: bounds.maxY + CARD_GAP },
        { x: bounds.minX - width - CARD_GAP, y: bounds.minY },
        { x: bounds.maxX + CARD_GAP, y: bounds.maxY - height },
      ];

      for (const pos of fallbackPositions) {
        const rect: CardPosition = { x: pos.x, y: pos.y, width, height };
        if (!hasCollision(rect, placedCards)) {
          bestPosition = rect;
          break;
        }
      }

      if (!bestPosition) {
        bestPosition = {
          x: bounds.maxX + CARD_GAP,
          y: bounds.minY,
          width,
          height,
        };
      }
    }

    positions[card.id] = bestPosition;
    placedCards.push(bestPosition);
  });

  const finalBounds = getBounds(placedCards);

  Object.keys(positions).forEach((id) => {
    positions[id].x -= finalBounds.minX;
    positions[id].y -= finalBounds.minY;
  });

  return {
    positions,
    totalWidth: finalBounds.maxX - finalBounds.minX,
    totalHeight: finalBounds.maxY - finalBounds.minY,
  };
};

/**
 * 计算适配视口的缩放比例
 * @param layoutWidth 布局宽度
 * @param layoutHeight 布局高度
 * @param viewportWidth 视口宽度
 * @param viewportHeight 视口高度
 * @returns 缩放比例
 */
const calculateScale = (
  layoutWidth: number,
  layoutHeight: number,
  viewportWidth: number,
  viewportHeight: number
): number => {
  const availableWidth = viewportWidth - VIEWPORT_PADDING * 2;
  const availableHeight = viewportHeight - VIEWPORT_PADDING * 2;

  const scaleX = availableWidth / layoutWidth;
  const scaleY = availableHeight / layoutHeight;

  const scale = Math.min(scaleX, scaleY, MAX_SCALE);

  return Math.max(scale, MIN_SCALE);
};

/**
 * 随机布局 Hook
 * @param cards 卡片配置列表
 * @returns 布局结果和刷新方法
 */
export const useRandomLayout = (cards: CardConfig[]) => {
  const [layoutKey, setLayoutKey] = useState(0);

  /** 订阅视口尺寸变化 */
  const viewport = useSyncExternalStore(
    subscribeToViewport,
    getViewportSize,
    getServerSnapshot
  );

  const layout = useMemo(() => {
    const baseLayout = calculateAestheticLayout(cards);
    const scale = calculateScale(
      baseLayout.totalWidth,
      baseLayout.totalHeight,
      viewport.width,
      viewport.height
    );

    return {
      ...baseLayout,
      scale,
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cards, layoutKey, viewport.width, viewport.height]);

  const refreshLayout = useCallback(() => {
    setLayoutKey((prev) => prev + 1);
  }, []);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'r' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        refreshLayout();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [refreshLayout]);

  return { layout, refreshLayout };
};

export type { CardConfig, CardPosition, LayoutResult };
