import { useEffect, useState } from 'react';
import { Card } from './Card';
import './Clock.css';
import dayjs from 'dayjs';

export const Clock = () => {
  const [time, setTime] = useState(dayjs());

  useEffect(() => {
    const timer = setInterval(() => {
      setTime(dayjs());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  return (
    <Card className="clock-card">
      <div className="clock-time">{time.format('HH:mm')}</div>
    </Card>
  );
};

