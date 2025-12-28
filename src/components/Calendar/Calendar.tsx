import { Card } from '../Card';
import './Calendar.css';
import dayjs from 'dayjs';
import 'dayjs/locale/zh-cn';
import { useEffect, useState, useRef } from 'react';
import { createPortal } from 'react-dom';
import { calendar } from '../../config/content';
import ICAL from 'ical.js';

dayjs.locale('zh-cn');

interface CalendarEvent {
  summary: string;
  startDate: dayjs.Dayjs;
  endDate: dayjs.Dayjs;
}

// 使用 ical.js 解析 ICS 文件
const parseICS = (icsContent: string): CalendarEvent[] => {
  const events: CalendarEvent[] = [];
  
  try {
    // 解析 ICS 内容
    const jcalData = ICAL.parse(icsContent);
    const comp = new ICAL.Component(jcalData);
    
    // 获取所有 VEVENT 组件
    const vevents = comp.getAllSubcomponents('vevent');
    
    for (const vevent of vevents) {
      const event = new ICAL.Event(vevent);
      
      // 获取事件摘要
      const summary = event.summary;
      
      // 获取开始时间
      const startTime = event.startDate;
      const startDate = dayjs(startTime.toJSDate());
      
      // 获取结束时间（如果没有结束时间，使用开始时间）
      const endTime = event.endDate;
      const endDate = endTime ? dayjs(endTime.toJSDate()) : startDate;
      
      if (summary && startDate) {
        events.push({
          summary,
          startDate,
          endDate,
        });
      }
    }
  } catch (error) {
    console.error('解析 ICS 文件时出错:', error);
  }
  
  return events;
};

export const Calendar = () => {
  const today = dayjs();
  const startOfMonth = today.startOf('month');
  const endOfMonth = today.endOf('month');
  const startDate = startOfMonth.startOf('week');
  const endDate = endOfMonth.endOf('week');

  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [tooltip, setTooltip] = useState<{
    visible: boolean;
    content: string;
    x: number;
    y: number;
  }>({
    visible: false,
    content: '',
    x: 0,
    y: 0,
  });
  const tooltipTimerRef = useRef<NodeJS.Timeout | null>(null);

  // 加载并解析 ICS 文件
  useEffect(() => {
    const loadICS = async () => {
      if (!calendar?.icsUrl) return;
      
      try {
        const response = await fetch(calendar.icsUrl);
        const icsContent = await response.text();
        const parsedEvents = parseICS(icsContent);
        setEvents(parsedEvents);
      } catch (error) {
        console.error('加载 ICS 文件失败:', error);
      }
    };

    loadICS();
  }, []);

  // 检查某一天是否有事件
  const hasEvent = (date: dayjs.Dayjs): CalendarEvent | undefined => {
    return events.find(event => {
      const eventStart = event.startDate.startOf('day');
      const eventEnd = event.endDate ? event.endDate.startOf('day') : eventStart;
      const checkDate = date.startOf('day');
      
      return checkDate.isSame(eventStart) || 
             checkDate.isSame(eventEnd) ||
             (checkDate.isAfter(eventStart) && checkDate.isBefore(eventEnd));
    });
  };

  // 处理鼠标悬停
  const handleMouseEnter = (event: CalendarEvent, e: React.MouseEvent<HTMLDivElement>) => {
    // 清除之前的定时器
    if (tooltipTimerRef.current) {
      clearTimeout(tooltipTimerRef.current);
    }

    const target = e.currentTarget;

    // 延迟显示 tooltip
    tooltipTimerRef.current = setTimeout(() => {
      // 检查元素是否仍然存在
      if (!target) return;
      
      const rect = target.getBoundingClientRect();
      setTooltip({
        visible: true,
        content: event.summary,
        x: rect.left + rect.width / 2,
        y: rect.top - 10,
      });
    }, 300); // 300ms 延迟
  };

  // 处理鼠标离开
  const handleMouseLeave = () => {
    // 清除定时器
    if (tooltipTimerRef.current) {
      clearTimeout(tooltipTimerRef.current);
      tooltipTimerRef.current = null;
    }

    setTooltip(prev => ({ ...prev, visible: false }));
  };

  // 清理定时器
  useEffect(() => {
    return () => {
      if (tooltipTimerRef.current) {
        clearTimeout(tooltipTimerRef.current);
      }
    };
  }, []);

  const weekDays = ['一', '二', '三', '四', '五', '六', '日'];
  const days = [];
  let currentDate = startDate;

  while (currentDate.isBefore(endDate) || currentDate.isSame(endDate, 'day')) {
    days.push(currentDate);
    currentDate = currentDate.add(1, 'day');
  }

  return (
    <>
      <Card className="calendar-card">
        <div className="calendar-header">
          <span className="calendar-date">{today.format('YYYY/MM/DD')}</span>
          <span className="calendar-weekday">周{weekDays[today.day() === 0 ? 6 : today.day() - 1]}</span>
        </div>
        <div className="calendar-weekdays">
          {weekDays.map((day) => (
            <div key={day} className="calendar-weekday-label">
              {day}
            </div>
          ))}
        </div>
        <div className="calendar-days">
          {days.map((day, index) => {
            const isToday = day.isSame(today, 'day');
            const isCurrentMonth = day.isSame(today, 'month');
            const event = hasEvent(day);
            
            return (
              <div
                key={index}
                className={`calendar-day ${isToday ? 'today' : ''} ${!isCurrentMonth ? 'other-month' : ''} ${event ? 'has-event' : ''}`}
                onMouseEnter={event ? (e) => handleMouseEnter(event, e) : undefined}
                onMouseLeave={event ? handleMouseLeave : undefined}
              >
                {day.date()}
                {event && <div className="event-dot" />}
              </div>
            );
          })}
        </div>

      </Card>

      {/* 使用 Portal 将 Tooltip 渲染到 body */}
      {tooltip.visible && createPortal(
        <div
          className="calendar-tooltip"
          style={{
            left: `${tooltip.x}px`,
            top: `${tooltip.y}px`,
          }}
        >
          <div className="calendar-tooltip-arrow" />
          <div className="calendar-tooltip-content">{tooltip.content}</div>
        </div>,
        document.body
      )}
    </>
  );
};

