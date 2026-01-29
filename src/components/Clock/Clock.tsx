import { useEffect, useState } from 'react';
import { Card } from '../Card';
import './Clock.css';
import dayjs from 'dayjs';

export const Clock = () => {
  /** 当前时间 */
  const [time, setTime] = useState(dayjs());

  useEffect(() => {
    const timer = setInterval(() => {
      setTime(dayjs());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  return (
    <Card className="clock-card">
      <div className="clock-time">
        <span className="clock-hm">{time.format('HH:mm')}</span>
        <span className="clock-seconds">{time.format(':ss')}</span>
      </div>
    </Card>
  );
};

