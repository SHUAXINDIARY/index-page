import { useCallback, useEffect, useMemo, useState, memo } from 'react';
import { createPortal } from 'react-dom';
import { AnimatePresence, motion } from 'motion/react';
import { useTheme } from '../../hooks/useTheme';
import { Card } from '../Card';
import { X, Maximize2 } from 'lucide-react';
import { AnnotatedWorldMap } from './AnnotatedWorldMap';
import type { ViewportTransform } from './canvasMap';
import { MIN_MAP_SCALE } from './canvasMap';
import { toCanvasMarkers, toCanvasRoutes } from './mapMarkers';
import {
  FULLSCREEN_QUERY_KEY,
  FULLSCREEN_QUERY_VALUE,
  DEFAULT_MAP_ARIA_LABEL,
  MARKER_LEGEND_TOKEN_CLASS,
} from './constant';
import type { WorldMapProps } from './types';
import './WorldMap.css';

const fullscreenButtonIcon = <Maximize2 size={18} />;
const closeButtonIcon = <X size={24} />;

interface LegendItemProps {
  type: string;
  label: string;
  isVisible: boolean;
  onClick: (type: string) => void;
}

const LegendItem = memo(function LegendItem({ type, label, isVisible, onClick }: LegendItemProps) {
  const handleClick = useCallback(() => onClick(type), [onClick, type]);
  const dotClassName = MARKER_LEGEND_TOKEN_CLASS[type] ?? 'world-map-legend-dot--travel';

  return (
    <div
      className={`world-map-legend-item ${isVisible ? 'active' : 'inactive'}`}
      onClick={handleClick}
      onKeyDown={(e): void => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          handleClick();
        }
      }}
      role="button"
      tabIndex={0}
    >
      <div
        className={`world-map-legend-dot ${dotClassName}`}
        style={{ opacity: isVisible ? 1 : 0.3 }}
      />
      <span className="world-map-legend-label" style={{ opacity: isVisible ? 1 : 0.5 }}>
        {label}
      </span>
    </div>
  );
});

export const WorldMap = memo(function WorldMap({ config }: WorldMapProps) {
  const { resolvedMode, color: themeColor } = useTheme();

  const [isFullscreen, setIsFullscreen] = useState(() => {
    if (typeof window === 'undefined') return false;
    const url = new URL(window.location.href);
    return url.searchParams.get(FULLSCREEN_QUERY_KEY) === FULLSCREEN_QUERY_VALUE;
  });

  const [visibleTypes, setVisibleTypes] = useState<Set<string>>(() => {
    const types = new Set<string>();
    config.legend?.forEach((item) => types.add(item.type));
    return types;
  });

  const [viewportTransform, setViewportTransform] = useState<ViewportTransform>({
    scale: MIN_MAP_SCALE,
    x: 0,
    y: 0,
  });

  const allCanvasMarkers = useMemo(() => toCanvasMarkers(config.markers), [config.markers]);
  const canvasRoutes = useMemo(() => toCanvasRoutes(config.routes), [config.routes]);

  const visibleMarkers = useMemo(
    () => allCanvasMarkers.filter((marker) => visibleTypes.has(marker.type)),
    [allCanvasMarkers, visibleTypes],
  );

  const ariaLabel = DEFAULT_MAP_ARIA_LABEL;

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

  useEffect(() => {
    updateFullscreenQuery(isFullscreen);
  }, [isFullscreen, updateFullscreenQuery]);

  const handleLegendClick = useCallback((type: string) => {
    setVisibleTypes((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(type)) {
        newSet.delete(type);
      } else {
        newSet.add(type);
      }
      return newSet;
    });
  }, []);

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

  const handleOpenFullscreen = useCallback(() => {
    setIsFullscreen(true);
  }, []);

  const handleCloseFullscreen = useCallback(() => {
    setIsFullscreen(false);
  }, []);

  const mapCommonProps = {
    markers: visibleMarkers,
    routes: canvasRoutes,
    ariaLabel,
    themeMode: resolvedMode,
    themeColor,
    viewportTransform,
    onViewportTransformChange: setViewportTransform,
  };

  return (
    <>
      <Card className="world-map-card">
        <div className="world-map-container" onDoubleClick={handleOpenFullscreen}>
          <AnnotatedWorldMap key={resolvedMode} {...mapCommonProps} />
        </div>
        <button
          className="world-map-fullscreen-button"
          onClick={handleOpenFullscreen}
          title="全屏查看地图"
          aria-label="全屏查看地图"
          type="button"
        >
          {fullscreenButtonIcon}
        </button>
        <div className="world-map-legend">
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

      {createPortal(
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
                type="button"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.2, delay: 0.1 }}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
              >
                {closeButtonIcon}
              </motion.button>
              <motion.div
                className="world-map-fullscreen-container"
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.3, ease: 'easeOut' }}
              >
                <AnnotatedWorldMap
                  key={`fullscreen-${resolvedMode}`}
                  {...mapCommonProps}
                  className="annotated-world-map--fullscreen"
                />
              </motion.div>
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
        </AnimatePresence>,
        document.body,
      )}
    </>
  );
});
