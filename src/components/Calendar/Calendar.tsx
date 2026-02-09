import { Card } from '../Card';
import './Calendar.css';
import dayjs from 'dayjs';
import 'dayjs/locale/zh-cn';
import React, { useEffect, useState } from 'react';
import { calendar } from '../../config/content';
import ICAL from 'ical.js';
import { Tooltip } from '../Tooltip';

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
            
            const dayElement = (
              <div
                className={`calendar-day ${isToday ? 'today' : ''} ${!isCurrentMonth ? 'other-month' : ''} ${event ? 'has-event' : ''}`}
              >
                {day.date()}
                {event && <div className="event-dot" />}
              </div>
            );

            // 如果有事件，使用 Tooltip 包裹
            return event ? (
              <Tooltip key={index} content={event.summary}>
                {dayElement}
              </Tooltip>
            ) : (
              <React.Fragment key={index}>{dayElement}</React.Fragment>
            );
          })}
        </div>
      </Card>
    </>
  );
};

