import React from 'react';
import Card from '../ui/Card';
import Stat from '../ui/Stat';

const StatCard = ({ title, label, value, delta, deltaType, icon, ...props }) => {
  // Support both 'title' and 'label' props for backwards compatibility
  const displayLabel = label || title;

  return (
    <Card padding="md" {...props}>
      <Stat
        label={displayLabel}
        value={value}
        delta={delta}
        deltaType={deltaType}
        icon={icon}
      />
    </Card>
  );
};

export default StatCard;
