import { Card } from '../Card';
import './Calendar.css';
import dayjs from 'dayjs';
import 'dayjs/locale/zh-cn';

dayjs.locale('zh-cn');

export const Calendar = () => {
  const today = dayjs();
  const startOfMonth = today.startOf('month');
  const endOfMonth = today.endOf('month');
  const startDate = startOfMonth.startOf('week');
  const endDate = endOfMonth.endOf('week');

  const weekDays = ['一', '二', '三', '四', '五', '六', '日'];
  const days = [];
  let currentDate = startDate;

  while (currentDate.isBefore(endDate) || currentDate.isSame(endDate, 'day')) {
    days.push(currentDate);
    currentDate = currentDate.add(1, 'day');
  }

  return (
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
          return (
            <div
              key={index}
              className={`calendar-day ${isToday ? 'today' : ''} ${!isCurrentMonth ? 'other-month' : ''}`}
            >
              {day.date()}
            </div>
          );
        })}
      </div>
    </Card>
  );
};

