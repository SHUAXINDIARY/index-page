import { useEffect, useRef, useState, useCallback, memo } from 'react';
import type { MutableRefObject } from 'react';
import maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import { AnimatePresence, motion } from 'motion/react';
import { Card } from '../Card';
import { X, Maximize2 } from 'lucide-react';
import './WorldMap.css';
import type { WorldMapProps, WorldMapMarkers, WorldMapMarker } from './types';
import {
  FULLSCREEN_QUERY_KEY,
  FULLSCREEN_QUERY_VALUE,
  DEFAULT_MAP_STYLE,
  DEFAULT_MAP_CENTER,
  DEFAULT_MAP_ZOOM,
  MARKER_COLOR_MAP,
  DEFAULT_MARKER_COLOR,
  MARKER_OFFSET_DISTANCE,
  POPUP_OFFSET,
  MARKER_DOT_STYLE,
  SKY_CONFIG,
} from './constant';

// [rendering-hoist-jsx] 提升静态 JSX 元素到组件外部，避免每次渲染重新创建
const fullscreenButtonIcon = <Maximize2 size={18} />;
const closeButtonIcon = <X size={24} />;

// [js-early-exit] 纯函数提取到组件外部，避免每次渲染重新创建
const getMarkerColor = (type: string): string => {
  return MARKER_COLOR_MAP[type] || DEFAULT_MARKER_COLOR;
};

// [rerender-memo] 提取图例项为独立的 memoized 组件
interface LegendItemProps {
  type: string;
  label: string;
  isVisible: boolean;
  onClick: (type: string) => void;
}

const LegendItem = memo(function LegendItem({ type, label, isVisible, onClick }: LegendItemProps) {
  const handleClick = useCallback(() => onClick(type), [onClick, type]);
  const color = getMarkerColor(type);
  
  return (
    <div 
      className={`world-map-legend-item ${isVisible ? 'active' : 'inactive'}`}
      onClick={handleClick}
    >
      <div
        className="world-map-legend-dot"
        style={{ 
          backgroundColor: color,
          opacity: isVisible ? 1 : 0.3
        }}
      />
      <span 
        className="world-map-legend-label"
        style={{ opacity: isVisible ? 1 : 0.5 }}
      >
        {label}
      </span>
    </div>
  );
});

export const WorldMap = memo(function WorldMap({ config }: WorldMapProps) {
  // DOM 容器引用
  const mapContainer = useRef<HTMLDivElement>(null); // 卡片内地图容器
  const fullscreenMapContainer = useRef<HTMLDivElement>(null); // 全屏地图容器
  
  // MapLibre 地图实例引用
  const map = useRef<maplibregl.Map | null>(null); // 卡片内地图实例
  const fullscreenMap = useRef<maplibregl.Map | null>(null); // 全屏地图实例
  
  // 标记点引用（用于清理）
  const markersRef = useRef<maplibregl.Marker[]>([]); // 卡片内地图标记点
  const fullscreenMarkersRef = useRef<maplibregl.Marker[]>([]); // 全屏地图标记点
  // 按类型存储标记点的 Map
  const markersMapRef = useRef<Map<string, maplibregl.Marker[]>>(new Map());
  const fullscreenMarkersMapRef = useRef<Map<string, maplibregl.Marker[]>>(new Map());
  const [mapLoaded, setMapLoaded] = useState(false);
  
  // [rerender-lazy-state-init] 使用函数初始化避免每次渲染重新计算
  const [isFullscreen, setIsFullscreen] = useState(() => {
    if (typeof window === 'undefined') return false;
    const url = new URL(window.location.href);
    return url.searchParams.get(FULLSCREEN_QUERY_KEY) === FULLSCREEN_QUERY_VALUE;
  });
  
  // [rerender-lazy-state-init] 使用函数初始化 Set
  const [visibleTypes, setVisibleTypes] = useState<Set<string>>(() => {
    const types = new Set<string>();
    config.legend?.forEach(item => types.add(item.type));
    return types;
  });

  // 更新标记点可见性的函数
  const updateMarkerVisibility = useCallback((type: string, visible: boolean) => {
    const displayValue = visible ? 'block' : 'none';
    
    // [js-cache-property-access] 缓存 Map 查找结果
    const markers = markersMapRef.current.get(type);
    if (markers) {
      for (const marker of markers) {
        marker.getElement().style.display = displayValue;
      }
    }
    
    // 同步更新全屏地图的标记点
    const fullscreenMarkers = fullscreenMarkersMapRef.current.get(type);
    if (fullscreenMarkers) {
      for (const marker of fullscreenMarkers) {
        marker.getElement().style.display = displayValue;
      }
    }
  }, []);

  // [rerender-functional-setstate] 使用函数式 setState 避免闭包问题
  const handleLegendClick = useCallback((type: string) => {
    setVisibleTypes(prev => {
      const newSet = new Set(prev);
      const isCurrentlyVisible = newSet.has(type);
      
      if (isCurrentlyVisible) {
        newSet.delete(type);
      } else {
        newSet.add(type);
      }
      
      // 在 setState 回调中更新可见性
      updateMarkerVisibility(type, !isCurrentlyVisible);
      return newSet;
    });
  }, [updateMarkerVisibility]);

  const updateFullscreenQuery = useCallback((enabled: boolean) => {
    if (typeof window === 'undefined') return;

    const url = new URL(window.location.href);
    if (enabled) {
      url.searchParams.set(FULLSCREEN_QUERY_KEY, FULLSCREEN_QUERY_VALUE);
    } else {
      url.searchParams.delete(FULLSCREEN_QUERY_KEY);
    }
    window.history.replaceState(null, '', url.toString());
  }, []);

  // 根据全屏状态更新 URL 标记
  useEffect(() => {
    updateFullscreenQuery(isFullscreen);
  }, [isFullscreen, updateFullscreenQuery]);

  // 创建标记元素的辅助函数
  const createMarkerElement = useCallback((type: string) => {
    const color = getMarkerColor(type);
    
    // 创建外层容器
    const container = document.createElement('div');
    container.className = `world-map-marker-container world-map-marker-${type}`;
    
    // 创建小圆点
    const dot = document.createElement('div');
    dot.className = 'world-map-marker-dot';
    
    // [js-batch-dom-css] 批量设置样式，使用 cssText 减少重排
    dot.style.cssText = `
      width: ${MARKER_DOT_STYLE.width};
      height: ${MARKER_DOT_STYLE.height};
      border-radius: ${MARKER_DOT_STYLE.borderRadius};
      background-color: ${color};
      border: ${MARKER_DOT_STYLE.border};
      box-shadow: ${MARKER_DOT_STYLE.boxShadow};
      cursor: ${MARKER_DOT_STYLE.cursor};
      transition: ${MARKER_DOT_STYLE.transition};
    `;
    
    // 设置数据属性用于调试
    container.dataset.type = type;
    container.dataset.color = color;
    
    container.appendChild(dot);
    return container;
  }, []);

  // 计算标记点偏移，避免相同位置的标记点重叠
  const getMarkerOffset = useCallback((marker: WorldMapMarker, allMarkers: WorldMapMarkers) => {
    // [js-early-exit] 提前返回减少不必要的计算
    if (!allMarkers) {
      return { lat: marker.lat, lng: marker.lng };
    }
    
    // [js-cache-property-access] 缓存属性访问
    const { lat, lng, type, name } = marker;
    
    // 找出所有与当前标记点位置相同的标记点
    const sameLocationMarkers = allMarkers.filter(
      m => m.lat === lat && m.lng === lng
    );
    
    // [js-length-check-first] 先检查长度再进行复杂操作
    const markerCount = sameLocationMarkers.length;
    if (markerCount <= 1) {
      return { lat, lng };
    }
    
    // 计算当前标记点在相同位置标记点中的索引
    const index = sameLocationMarkers.findIndex(
      m => m.type === type && m.name === name
    );
    
    // 为每个标记点计算偏移量（呈圆形分布）
    const angle = (2 * Math.PI * index) / markerCount;
    
    return {
      lat: lat + MARKER_OFFSET_DISTANCE * Math.sin(angle),
      lng: lng + MARKER_OFFSET_DISTANCE * Math.cos(angle),
    };
  }, []);

  // 创建带弹窗的标记点，支持按类型分组存储
  const createMarkerWithPopup = useCallback(
    (
      mapInstance: maplibregl.Map,
      marker: WorldMapMarker,
      targetMarkersMapRef: MutableRefObject<Map<string, maplibregl.Marker[]>>,
      markerStoreRef: MutableRefObject<maplibregl.Marker[]>
    ) => {
      const el = createMarkerElement(marker.type);
      const position = getMarkerOffset(marker, config.markers);

      const popup = new maplibregl.Popup({
        offset: POPUP_OFFSET,
        closeButton: false,
        closeOnClick: false,
      }).setHTML(
        `<div class="world-map-popup">
          <strong>${marker.name}</strong>
          ${marker.description ? `<p>${marker.description}</p>` : ''}
          ${marker.imgUrl ? `<div class="world-map-popup-link-row"><a class="world-map-popup-link" href="${marker.imgUrl}" target="_blank" rel="noopener noreferrer">查看照片</a></div>` : ''}
        </div>`
      );

      const mapMarker = new maplibregl.Marker({ element: el })
        .setLngLat([position.lng, position.lat])
        .setPopup(popup)
        .addTo(mapInstance);

      if (!targetMarkersMapRef.current.has(marker.type)) {
        targetMarkersMapRef.current.set(marker.type, []);
      }
      targetMarkersMapRef.current.get(marker.type)!.push(mapMarker);
      markerStoreRef.current.push(mapMarker);

      return mapMarker;
    },
    [config.markers, createMarkerElement, getMarkerOffset]
  );

  // 添加标记点
  const addMarkers = useCallback(() => {
    if (!map.current || !config.markers) return;

    // 清空之前的映射
    markersMapRef.current.clear();

    config.markers.forEach((marker) => {
      createMarkerWithPopup(map.current!, marker, markersMapRef, markersRef);
    });
  }, [config.markers, createMarkerWithPopup]);

  useEffect(() => {
    if (!mapContainer.current || map.current) return;

    const styleUrl = config.style || DEFAULT_MAP_STYLE;

    // 初始化地图 - MapLibre 不需要 access token
    // projection 和 setFog 在运行时支持，但类型定义可能不完整
    map.current = new maplibregl.Map({
      container: mapContainer.current,
      style: styleUrl,
      center: DEFAULT_MAP_CENTER,
      zoom: DEFAULT_MAP_ZOOM,
      pitch: 0,
      bearing: 0,
      projection: { type: 'globe' }, // 使用 globe 投影
    } as any);

    // 添加导航控件
    map.current.addControl(new maplibregl.NavigationControl(), 'top-right');

    // 地图加载完成后添加标记点
    map.current.on('load', () => {
      setMapLoaded(true);
      // 使用 addMarkers 函数
      addMarkers();
    });

    // 设置大气效果 - 通过样式规范中的 sky 属性
    map.current.on('style.load', () => {
      if (map.current) {
        try {
          const style = map.current.getStyle();
          if (style) {
            style.sky = SKY_CONFIG;
            map.current.setStyle(style);
          }
        } catch (error) {
          // 如果样式不支持 sky 属性，静默失败
          console.warn('无法设置大气效果:', error);
        }
      }
    });

    // 清理函数
    return () => {
      // 清理标记点
      markersRef.current.forEach((marker) => marker.remove());
      markersRef.current = [];
      
      // 清理地图
      if (map.current) {
        map.current.remove();
        map.current = null;
      }
    };
  }, [config.style, config.markers, addMarkers]);

  // 当配置数据变化时更新标记点
  useEffect(() => {
    if (mapLoaded && map.current) {
      // 清理旧标记
      markersRef.current.forEach((marker) => marker.remove());
      markersRef.current = [];
      
      // 添加新标记
      addMarkers();
    }
  }, [config.markers, mapLoaded, addMarkers]);

  // 初始化全屏地图
  useEffect(() => {
    if (!isFullscreen || !fullscreenMapContainer.current || fullscreenMap.current) return;

    const styleUrl = config.style || DEFAULT_MAP_STYLE;

    // 创建全屏地图
    fullscreenMap.current = new maplibregl.Map({
      container: fullscreenMapContainer.current,
      style: styleUrl,
      center: map.current?.getCenter().toArray() || DEFAULT_MAP_CENTER,
      zoom: map.current?.getZoom() || DEFAULT_MAP_ZOOM,
      pitch: map.current?.getPitch() || 0,
      bearing: map.current?.getBearing() || 0,
      projection: { type: 'globe' },
    } as any);

    // 添加导航控件
    fullscreenMap.current.addControl(new maplibregl.NavigationControl(), 'top-right');

    // 地图加载完成后添加标记点
    fullscreenMap.current.on('load', () => {
      // 清空之前的映射
      fullscreenMarkersMapRef.current.clear();
      
      if (fullscreenMap.current && config.markers) {
        config.markers.forEach((marker) => {
          createMarkerWithPopup(
            fullscreenMap.current!,
            marker,
            fullscreenMarkersMapRef,
            fullscreenMarkersRef
          );
        });
      }

      // 设置大气效果
      if (fullscreenMap.current) {
        try {
          const style = fullscreenMap.current.getStyle();
          if (style) {
            style.sky = SKY_CONFIG;
            fullscreenMap.current.setStyle(style);
          }
        } catch (error) {
          console.warn('无法设置大气效果:', error);
        }
      }
    });

    // 同步地图状态
    const syncToFullscreen = () => {
      if (map.current && fullscreenMap.current) {
        const center = map.current.getCenter();
        const zoom = map.current.getZoom();
        const pitch = map.current.getPitch();
        const bearing = map.current.getBearing();
        
        fullscreenMap.current.setCenter(center);
        fullscreenMap.current.setZoom(zoom);
        fullscreenMap.current.setPitch(pitch);
        fullscreenMap.current.setBearing(bearing);
      }
    };

    // 同步全屏地图状态到原地图
    const syncFromFullscreen = () => {
      if (map.current && fullscreenMap.current) {
        const center = fullscreenMap.current.getCenter();
        const zoom = fullscreenMap.current.getZoom();
        const pitch = fullscreenMap.current.getPitch();
        const bearing = fullscreenMap.current.getBearing();
        
        map.current.setCenter(center);
        map.current.setZoom(zoom);
        map.current.setPitch(pitch);
        map.current.setBearing(bearing);
      }
    };

    // 监听全屏地图的移动和缩放
    fullscreenMap.current.on('moveend', syncFromFullscreen);
    fullscreenMap.current.on('zoomend', syncFromFullscreen);

    // 初始化时同步状态
    syncToFullscreen();

    return () => {
      // 清理全屏地图
      fullscreenMarkersRef.current.forEach((marker) => marker.remove());
      fullscreenMarkersRef.current = [];
      
      if (fullscreenMap.current) {
        fullscreenMap.current.remove();
        fullscreenMap.current = null;
      }
    };
  }, [isFullscreen, config.style, config.markers, createMarkerElement, getMarkerOffset, createMarkerWithPopup]);

  // 处理 ESC 键关闭全屏
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isFullscreen) {
        setIsFullscreen(false);
      }
    };

    if (isFullscreen) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = '';
    };
  }, [isFullscreen]);

  // 处理地图点击事件 - 双击地图背景进入全屏
  const handleMapClick = useCallback((e?: React.MouseEvent) => {
    if (e) {
      // 如果点击的是标记点或控件，不触发全屏
      const target = e.target as HTMLElement;
      if (
        target.closest('.maplibregl-marker') ||
        target.closest('.maplibregl-ctrl') ||
        target.closest('.maplibregl-popup')
      ) {
        return;
      }
    }
    setIsFullscreen(true);
  }, []);

  // 关闭全屏
  const handleCloseFullscreen = useCallback(() => {
    setIsFullscreen(false);
  }, []);

  return (
    <>
      <Card className="world-map-card">
        <div 
          className="world-map-container" 
          ref={mapContainer}
          onDoubleClick={handleMapClick}
        />
        <button 
          className="world-map-fullscreen-button"
          onClick={handleMapClick}
          title="全屏查看地图"
          aria-label="全屏查看地图"
        >
          {/* [rendering-hoist-jsx] 使用提升的静态图标 */}
          {fullscreenButtonIcon}
        </button>
        <div className="world-map-legend">
          {/* [rerender-memo] 使用 memoized 的 LegendItem 组件 */}
          {config.legend?.map((item) => (
            <LegendItem
              key={item.type}
              type={item.type}
              label={item.label}
              isVisible={visibleTypes.has(item.type)}
              onClick={handleLegendClick}
            />
          ))}
        </div>
      </Card>

      {/* [rendering-conditional-render] 使用条件渲染 + AnimatePresence 支持退出动画 */}
      <AnimatePresence>
        {isFullscreen && (
          <motion.div
            className="world-map-fullscreen"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
          >
            <motion.button
              className="world-map-fullscreen-close"
              onClick={handleCloseFullscreen}
              aria-label="关闭全屏"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.2, delay: 0.1 }}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
            >
              {/* [rendering-hoist-jsx] 使用提升的静态图标 */}
              {closeButtonIcon}
            </motion.button>
            <motion.div
              className="world-map-fullscreen-container"
              ref={fullscreenMapContainer}
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.3, ease: 'easeOut' }}
            />
            <motion.div
              className="world-map-fullscreen-legend"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.15 }}
            >
              {config.legend?.map((item) => (
                <LegendItem
                  key={item.type}
                  type={item.type}
                  label={item.label}
                  isVisible={visibleTypes.has(item.type)}
                  onClick={handleLegendClick}
                />
              ))}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
});
