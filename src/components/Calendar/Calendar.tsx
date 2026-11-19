import { Card } from '../Card';
import { LoadingIndicator } from '../LoadingIndicator/LoadingIndicator';
import './Calendar.css';
import dayjs from 'dayjs';
import 'dayjs/locale/zh-cn';
import React, { useEffect, useState } from 'react';
import { calendar } from '../../config/content';
import ICAL from 'ical.js';
import { Tooltip } from '../Tooltip';

dayjs.locale('zh-cn');

/** 从 ICS 解析的节气或节假日事件 */
interface CalendarEvent {
  /** 事件名称 */
  summary: string;
  /** 开始日期 */
  startDate: dayjs.Dayjs;
  /** 包含当日的结束日期 */
  endDate: dayjs.Dayjs;
  /** 事件标记类型 */
  kind: 'solar-term' | 'holiday';
}

const SOLAR_TERMS = new Set([
  '立春',
  '雨水',
  '惊蛰',
  '春分',
  '清明',
  '谷雨',
  '立夏',
  '小满',
  '芒种',
  '夏至',
  '小暑',
  '大暑',
  '立秋',
  '处暑',
  '白露',
  '秋分',
  '寒露',
  '霜降',
  '立冬',
  '小雪',
  '大雪',
  '冬至',
  '小寒',
  '大寒',
]);

const CALENDAR_GRID_DAYS = 42;
/** 节假日文件下载的最长等待时间（毫秒） */
const ICS_LOAD_TIMEOUT_MS = 30_000;

const getEventKind = (summary: string): CalendarEvent['kind'] => {
  return SOLAR_TERMS.has(summary.replace(/[（(].*?[）)]$/, ''))
    ? 'solar-term'
    : 'holiday';
};

/** 解析 ICS；异常交由加载流程处理，避免将解析失败误当作无节假日。 */
const parseICS = (icsContent: string): CalendarEvent[] => {
  const events: CalendarEvent[] = [];

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

    // 获取结束时间
    // ICS 全天事件的 DTEND 是排他的（exclusive），需要减去一天转为包含性结束日期
    const endTime = event.endDate;
    const endDate = endTime
      ? dayjs(endTime.toJSDate()).subtract(1, 'day')
      : startDate;

    if (summary && startDate) {
      events.push({
        summary,
        startDate,
        endDate,
        kind: getEventKind(summary),
      });
    }
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
  const [isLoading, setIsLoading] = useState(Boolean(calendar?.icsUrl));
  const [hasLoadError, setHasLoadError] = useState(false);

  // 加载并解析 ICS 文件
  useEffect(() => {
    const icsUrl = calendar?.icsUrl;
    if (!icsUrl) return;
    let active = true;
    const controller = new AbortController();
    const timeout = window.setTimeout(
      () => controller.abort(),
      ICS_LOAD_TIMEOUT_MS,
    );

    const loadICS = async () => {
      try {
        const response = await fetch(icsUrl, { signal: controller.signal });
        if (!response.ok) throw new Error('日历数据请求失败');
        const icsContent = await response.text();
        const parsedEvents = parseICS(icsContent);
        if (active) setEvents(parsedEvents);
      } catch (error) {
        if (active) {
          console.error('加载日历数据失败:', error);
          setHasLoadError(true);
        }
      } finally {
        window.clearTimeout(timeout);
        if (active) setIsLoading(false);
      }
    };

    void loadICS();
    return () => {
      active = false;
      controller.abort();
      window.clearTimeout(timeout);
    };
  }, []);

  if (isLoading) {
    return (
      <Card className="calendar-card calendar-card--loading">
        <div aria-busy="true">
          <LoadingIndicator label="正在加载日历…" />
        </div>
      </Card>
    );
  }

  // 获取某一天的所有事件，保留同一天内不同类型的标记
  const getEventsForDay = (date: dayjs.Dayjs): CalendarEvent[] => {
    return events.filter((event) => {
      const eventStart = event.startDate.startOf('day');
      const eventEnd = event.endDate
        ? event.endDate.startOf('day')
        : eventStart;
      const checkDate = date.startOf('day');

      return (
        checkDate.isSame(eventStart) ||
        checkDate.isSame(eventEnd) ||
        (checkDate.isAfter(eventStart) && checkDate.isBefore(eventEnd))
      );
    });
  };

  const weekDays = ['一', '二', '三', '四', '五', '六', '日'];
  const days = [];
  let currentDate = startDate;

  while (currentDate.isBefore(endDate) || currentDate.isSame(endDate, 'day')) {
    days.push(currentDate);
    currentDate = currentDate.add(1, 'day');
  }

  // 保持月视图始终为六行，避免不同月份导致卡片高度和底部留白跳变。
  while (days.length < CALENDAR_GRID_DAYS) {
    days.push(currentDate);
    currentDate = currentDate.add(1, 'day');
  }

  return (
    <>
      <Card className="calendar-card" ariaLabel={today.format('YYYY年M月日历')}>
        <div className="calendar-header">
          <span className="calendar-date">{today.format('YYYY/MM/DD')}</span>
          <span className="calendar-weekday">
            周{weekDays[today.day() === 0 ? 6 : today.day() - 1]}
          </span>
        </div>
        {hasLoadError ? (
          <p className="calendar-load-error" role="status">
            节假日加载失败，显示基础日历
          </p>
        ) : (
          <div className="calendar-legend" role="group" aria-label="日历标记说明">
            <span className="calendar-legend-item">
              <span
                className="calendar-legend-dot calendar-legend-dot--solar"
                aria-hidden="true"
              />
              节气
            </span>
            <span className="calendar-legend-item">
              <span
                className="calendar-legend-dot calendar-legend-dot--holiday"
                aria-hidden="true"
              />
              节假日
            </span>
          </div>
        )}
        <div className="calendar-weekdays">
          {weekDays.map((day) => (
            <div key={day} className="calendar-weekday-label">
              {day}
            </div>
          ))}
        </div>
        <div className="calendar-days">
          {days.map((day) => {
            const isToday = day.isSame(today, 'day');
            const isCurrentMonth = day.isSame(today, 'month');
            const dayEvents = getEventsForDay(day);
            const hasSolarTerm = dayEvents.some(
              (event) => event.kind === 'solar-term',
            );
            const hasHoliday = dayEvents.some(
              (event) => event.kind === 'holiday',
            );
            const eventSummary = dayEvents
              .map((event) => event.summary)
              .join(' · ');

            const dayElement = (
              <div
                role="img"
                aria-current={isToday ? 'date' : undefined}
                className={`calendar-day ${isToday ? 'today' : ''} ${!isCurrentMonth ? 'other-month' : ''} ${dayEvents.length ? 'has-event' : ''} ${hasSolarTerm ? 'has-solar-term' : ''} ${hasHoliday ? 'has-holiday' : ''}`}
                aria-label={
                  eventSummary
                    ? `${day.format('YYYY年M月D日')}，${eventSummary}`
                    : day.format('YYYY年M月D日')
                }
              >
                <span className="calendar-day-number">{day.date()}</span>
                {dayEvents.length > 0 && (
                  <div className="event-dots" aria-hidden="true">
                    {hasSolarTerm && (
                      <span className="event-dot event-dot--solar" />
                    )}
                    {hasHoliday && (
                      <span className="event-dot event-dot--holiday" />
                    )}
                  </div>
                )}
              </div>
            );

            // 如果有事件，使用 Tooltip 包裹
            return dayEvents.length > 0 ? (
              <Tooltip key={day.format('YYYY-MM-DD')} content={eventSummary}>
                {dayElement}
              </Tooltip>
            ) : (
              <React.Fragment key={day.format('YYYY-MM-DD')}>
                {dayElement}
              </React.Fragment>
            );
          })}
        </div>
      </Card>
    </>
  );
};
