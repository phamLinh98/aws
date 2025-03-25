import { useState, useEffect } from 'react';
import { Typography } from 'antd';

const { Title } = Typography;

export const CountdownTimer = () => {
  const [count, setCount] = useState<number>(5);

  useEffect(() => {
    if (count > 0) {
      const timer = setTimeout(() => {
        setCount(count - 1);
      }, 1000);

      return () => clearTimeout(timer); // Cleanup function to clear the timer
    }
  }, [count]);

  return (
    <div>
      <Title level={1}>{count}</Title>
      {count === 0 && <Title level={3}>Time's up!</Title>}
    </div>
  );
};

export default CountdownTimer;