import { useEffect, useRef, useState, useCallback } from 'react';
import type { MutableRefObject } from 'react';
import maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import { Card } from '../Card';
import { X, Maximize2 } from 'lucide-react';
import './WorldMap.css';
import type { WorldMapConfig } from '../../config/content';

interface WorldMapProps {
  config: WorldMapConfig;
}

export const WorldMap = ({ config }: WorldMapProps) => {
  const fullscreenQueryKey = 'map';
  const fullscreenQueryValue = 'fullscreen';
  type WorldMapMarkers = WorldMapConfig['markers'];
  type WorldMapMarker = NonNullable<WorldMapMarkers>[number];
  const mapContainer = useRef<HTMLDivElement>(null);
  const fullscreenMapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<maplibregl.Map | null>(null);
  const fullscreenMap = useRef<maplibregl.Map | null>(null);
  const markersRef = useRef<maplibregl.Marker[]>([]);
  const fullscreenMarkersRef = useRef<maplibregl.Marker[]>([]);
  // 按类型存储标记点的 Map
  const markersMapRef = useRef<Map<string, maplibregl.Marker[]>>(new Map());
  const fullscreenMarkersMapRef = useRef<Map<string, maplibregl.Marker[]>>(new Map());
  const [mapLoaded, setMapLoaded] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(() => {
    if (typeof window === 'undefined') return false;
    const url = new URL(window.location.href);
    return url.searchParams.get(fullscreenQueryKey) === fullscreenQueryValue;
  });
  // 追踪哪些类型的标记点是可见的
  const [visibleTypes, setVisibleTypes] = useState<Set<string>>(() => {
    // 初始化时所有类型都可见
    const types = new Set<string>();
    config.legend?.forEach(item => types.add(item.type));
    return types;
  });

  // 根据类型获取标记颜色
  const getMarkerColor = useCallback((type: string): string => {
    const colorMap: Record<string, string> = {
      travel: '#ff8c42', // 橙色 - 旅行
      residence: '#4a90e2', // 蓝色 - 居住
      wish: '#ff6b9d', // 粉色 - 愿望
      airport: '#DDFF00', // 灰色 - 机场
    };
    return colorMap[type] || '#666666';
  }, []);

  // 更新标记点可见性的函数
  const updateMarkerVisibility = useCallback((type: string, visible: boolean) => {
    const markers = markersMapRef.current.get(type) || [];
    markers.forEach(marker => {
      const element = marker.getElement();
      element.style.display = visible ? 'block' : 'none';
    });
    
    // 同步更新全屏地图的标记点
    const fullscreenMarkers = fullscreenMarkersMapRef.current.get(type) || [];
    fullscreenMarkers.forEach(marker => {
      const element = marker.getElement();
      element.style.display = visible ? 'block' : 'none';
    });
  }, []);

  // 图例点击处理函数
  const handleLegendClick = useCallback((type: string) => {
    setVisibleTypes(prev => {
      const newSet = new Set(prev);
      if (newSet.has(type)) {
        newSet.delete(type);
        updateMarkerVisibility(type, false);
      } else {
        newSet.add(type);
        updateMarkerVisibility(type, true);
      }
      return newSet;
    });
  }, [updateMarkerVisibility]);

  const updateFullscreenQuery = useCallback(
    (enabled: boolean) => {
      if (typeof window === 'undefined') return;

      const url = new URL(window.location.href);
      if (enabled) {
        url.searchParams.set(fullscreenQueryKey, fullscreenQueryValue);
      } else {
        url.searchParams.delete(fullscreenQueryKey);
      }
      window.history.replaceState(null, '', url.toString());
    },
    [fullscreenQueryKey, fullscreenQueryValue]
  );

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
    dot.style.width = '10px';
    dot.style.height = '10px';
    dot.style.borderRadius = '50%';
    dot.style.backgroundColor = color;
    dot.style.border = '2px solid white';
    dot.style.boxShadow = '0 2px 6px rgba(0, 0, 0, 0.4)';
    dot.style.cursor = 'pointer';
    dot.style.transition = 'transform 0.2s ease';
    
    // 设置数据属性用于调试
    container.dataset.type = type;
    container.dataset.color = color;
    
    container.appendChild(dot);
    return container;
  }, [getMarkerColor]);

  // 计算标记点偏移，避免相同位置的标记点重叠
  const getMarkerOffset = useCallback((marker: WorldMapMarker, allMarkers: WorldMapMarkers) => {
    if (!allMarkers) return { lat: marker.lat, lng: marker.lng };
    
    // 找出所有与当前标记点位置相同的标记点
    const sameLocationMarkers = allMarkers.filter(
      m => m.lat === marker.lat && m.lng === marker.lng
    );
    
    if (sameLocationMarkers.length <= 1) {
      return { lat: marker.lat, lng: marker.lng };
    }
    
    // 计算当前标记点在相同位置标记点中的索引
    const index = sameLocationMarkers.findIndex(
      m => m.type === marker.type && m.name === marker.name
    );
    
    // 为每个标记点计算偏移量（呈圆形分布）
    const offsetDistance = 0.15; // 偏移距离（经纬度）
    const angle = (2 * Math.PI * index) / sameLocationMarkers.length;
    
    return {
      lat: marker.lat + offsetDistance * Math.sin(angle),
      lng: marker.lng + offsetDistance * Math.cos(angle),
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
        offset: 25,
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

    const styleUrl = config.style || 'https://demotiles.maplibre.org/style.json';

    // 初始化地图 - MapLibre 不需要 access token
    // projection 和 setFog 在运行时支持，但类型定义可能不完整
    map.current = new maplibregl.Map({
      container: mapContainer.current,
      style: styleUrl, // 使用 MapLibre 默认样式
      center: [120, 30], // 初始中心点（中国附近）
      zoom: 1.5, // 初始缩放级别
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
            // 设置 sky 属性来配置大气效果
            style.sky = {
              'sky-color': '#199EF3', // 天空颜色
              'horizon-color': '#ffffff', // 地平线颜色
              'fog-color': '#BAD2EB', // 雾颜色（对应低层大气）
              'fog-ground-blend': 0.5, // 雾与地面的混合
              'horizon-fog-blend': 0.5, // 地平线与雾的混合
              'sky-horizon-blend': 0.5, // 天空与地平线的混合
              'atmosphere-blend': [
                'interpolate',
                ['linear'],
                ['zoom'],
                0,
                1,
                10,
                1,
                12,
                0.8
              ] // 大气可见度，根据缩放级别调整
            };
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

    const styleUrl = config.style || 'https://demotiles.maplibre.org/style.json';

    // 创建全屏地图
    fullscreenMap.current = new maplibregl.Map({
      container: fullscreenMapContainer.current,
      style: styleUrl,
      center: map.current?.getCenter().toArray() || [120, 30],
      zoom: map.current?.getZoom() || 1.5,
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
            style.sky = {
              'sky-color': '#199EF3',
              'horizon-color': '#ffffff',
              'fog-color': '#BAD2EB',
              'fog-ground-blend': 0.5,
              'horizon-fog-blend': 0.5,
              'sky-horizon-blend': 0.5,
              'atmosphere-blend': [
                'interpolate',
                ['linear'],
                ['zoom'],
                0,
                1,
                10,
                1,
                12,
                0.8
              ]
            };
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
          <Maximize2 size={18} />
        </button>
        <div className="world-map-legend">
          {config.legend?.map((item) => (
            <div 
              key={item.type} 
              className={`world-map-legend-item ${visibleTypes.has(item.type) ? 'active' : 'inactive'}`}
              onClick={() => handleLegendClick(item.type)}
            >
              <div
                className="world-map-legend-dot"
                style={{ 
                  backgroundColor: getMarkerColor(item.type),
                  opacity: visibleTypes.has(item.type) ? 1 : 0.3
                }}
              />
              <span 
                className="world-map-legend-label"
                style={{ opacity: visibleTypes.has(item.type) ? 1 : 0.5 }}
              >
                {item.label}
              </span>
            </div>
          ))}
        </div>
      </Card>

      {/* 全屏地图覆盖层 */}
      {isFullscreen && (
        <div className="world-map-fullscreen">
          <button 
            className="world-map-fullscreen-close"
            onClick={handleCloseFullscreen}
            aria-label="关闭全屏"
          >
            <X size={24} />
          </button>
          <div className="world-map-fullscreen-container" ref={fullscreenMapContainer} />
          <div className="world-map-fullscreen-legend">
            {config.legend?.map((item) => (
              <div 
                key={item.type} 
                className={`world-map-legend-item ${visibleTypes.has(item.type) ? 'active' : 'inactive'}`}
                onClick={() => handleLegendClick(item.type)}
              >
                <div
                  className="world-map-legend-dot"
                  style={{ 
                    backgroundColor: getMarkerColor(item.type),
                    opacity: visibleTypes.has(item.type) ? 1 : 0.3
                  }}
                />
                <span 
                  className="world-map-legend-label"
                  style={{ opacity: visibleTypes.has(item.type) ? 1 : 0.5 }}
                >
                  {item.label}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </>
  );
};
