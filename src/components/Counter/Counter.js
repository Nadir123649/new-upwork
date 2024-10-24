// Counter.js
import React from 'react';
import { useSelector } from 'react-redux';

const Counter = () => {
  const count = useSelector((state) => state.chat.count);

  return (
    <div className="counter">
      <p>Messages sent: {count}/2</p>
    </div>
  );
};

export default Counter;