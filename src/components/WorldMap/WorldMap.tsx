import { useEffect, useRef, useState, useCallback } from 'react';
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
  const mapContainer = useRef<HTMLDivElement>(null);
  const fullscreenMapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<maplibregl.Map | null>(null);
  const fullscreenMap = useRef<maplibregl.Map | null>(null);
  const markersRef = useRef<maplibregl.Marker[]>([]);
  const fullscreenMarkersRef = useRef<maplibregl.Marker[]>([]);
  const [mapLoaded, setMapLoaded] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);

  // 根据类型获取标记颜色
  const getMarkerColor = useCallback((type: string): string => {
    const colorMap: Record<string, string> = {
      travel: '#ff8c42', // 橙色 - 旅行
      residence: '#4a90e2', // 蓝色 - 居住
      wish: '#ff6b9d', // 粉色 - 愿望
      airport: '#999999', // 灰色 - 机场
    };
    return colorMap[type] || '#666666';
  }, []);

  // 添加标记点
  const addMarkers = useCallback(() => {
    if (!map.current || !config.markers) return;

    config.markers.forEach((marker) => {
      // 根据类型设置颜色
      const color = getMarkerColor(marker.type);
      
      // 创建标记元素
      const el = document.createElement('div');
      el.className = 'world-map-marker';
      el.style.backgroundColor = color;
      el.style.width = '12px';
      el.style.height = '12px';
      el.style.borderRadius = '50%';
      el.style.border = '2px solid white';
      el.style.boxShadow = '0 2px 8px rgba(0, 0, 0, 0.3)';
      el.style.cursor = 'pointer';
      
      // 创建标记
      const mapMarker = new maplibregl.Marker(el)
        .setLngLat([marker.lng, marker.lat])
        .setPopup(
          new maplibregl.Popup({ offset: 25 }).setHTML(
            `<div class="world-map-popup">
              <strong>${marker.name}</strong>
              ${marker.description ? `<p>${marker.description}</p>` : ''}
            </div>`
          )
        )
        .addTo(map.current!);

      markersRef.current.push(mapMarker);
    });
  }, [config.markers, getMarkerColor]);

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
      // 使用 addMarkers 的当前引用
      if (map.current && config.markers) {
        config.markers.forEach((marker) => {
          const color = getMarkerColor(marker.type);
          const el = document.createElement('div');
          el.className = 'world-map-marker';
          el.style.backgroundColor = color;
          el.style.width = '12px';
          el.style.height = '12px';
          el.style.borderRadius = '50%';
          el.style.border = '2px solid white';
          el.style.boxShadow = '0 2px 8px rgba(0, 0, 0, 0.3)';
          el.style.cursor = 'pointer';
          
          const mapMarker = new maplibregl.Marker(el)
            .setLngLat([marker.lng, marker.lat])
            .setPopup(
              new maplibregl.Popup({ offset: 25 }).setHTML(
                `<div class="world-map-popup">
                  <strong>${marker.name}</strong>
                  ${marker.description ? `<p>${marker.description}</p>` : ''}
                </div>`
              )
            )
            .addTo(map.current!);

          markersRef.current.push(mapMarker);
        });
      }
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
  }, [config.style, config.markers, getMarkerColor]);

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
      if (fullscreenMap.current && config.markers) {
        config.markers.forEach((marker) => {
          const color = getMarkerColor(marker.type);
          const el = document.createElement('div');
          el.className = 'world-map-marker';
          el.style.backgroundColor = color;
          el.style.width = '12px';
          el.style.height = '12px';
          el.style.borderRadius = '50%';
          el.style.border = '2px solid white';
          el.style.boxShadow = '0 2px 8px rgba(0, 0, 0, 0.3)';
          el.style.cursor = 'pointer';
          
          const mapMarker = new maplibregl.Marker(el)
            .setLngLat([marker.lng, marker.lat])
            .setPopup(
              new maplibregl.Popup({ offset: 25 }).setHTML(
                `<div class="world-map-popup">
                  <strong>${marker.name}</strong>
                  ${marker.description ? `<p>${marker.description}</p>` : ''}
                </div>`
              )
            )
            .addTo(fullscreenMap.current!);

          fullscreenMarkersRef.current.push(mapMarker);
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
  }, [isFullscreen, config.style, config.markers, getMarkerColor]);

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
            <div key={item.type} className="world-map-legend-item">
              <div
                className="world-map-legend-dot"
                style={{ backgroundColor: getMarkerColor(item.type) }}
              />
              <span className="world-map-legend-label">{item.label}</span>
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
              <div key={item.type} className="world-map-legend-item">
                <div
                  className="world-map-legend-dot"
                  style={{ backgroundColor: getMarkerColor(item.type) }}
                />
                <span className="world-map-legend-label">{item.label}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </>
  );
};
