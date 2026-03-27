import { useState, useEffect } from 'react';
import { OrgAgent } from '../../types';
import styles from './OrgChartSelect.module.css';

interface OrgChartSelectProps {
  value: string;
  onChange: (agentId: string, agentName: string) => void;
  className?: string;
}

export function OrgChartSelect({ value, onChange, className }: OrgChartSelectProps) {
  const [agents, setAgents] = useState<OrgAgent[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/org-chart')
      .then(r => r.json())
      .then(data => {
        setAgents(data.agents || []);
        setLoading(false);
      })
      .catch(() => {
        setLoading(false);
      });
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedId = e.target.value;
    const agent = agents.find(a => a.id === selectedId);
    if (agent) {
      onChange(agent.id, agent.name);
    }
  };

  if (loading) {
    return (
      <select className={`${styles.select} ${className || ''}`} disabled>
        <option value="">加载中...</option>
      </select>
    );
  }

  return (
    <select 
      className={`${styles.select} ${className || ''}`} 
      value={value}
      onChange={handleChange}
    >
      <option value="">选择负责人</option>
      {agents.map(agent => (
        <option key={agent.id} value={agent.id}>
          {agent.name}
        </option>
      ))}
    </select>
  );
}
