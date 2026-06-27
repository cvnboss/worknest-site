'use client';

import { useEffect, useState, useRef, useCallback } from 'react';
import { ChevronRight, Filter, Check } from 'lucide-react';

interface Option {
  value: string;
  label: string;
}

interface CustomSelectProps {
  value: string;
  onChange: (val: string) => void;
  options: Option[];
  testId?: string;
  icon?: React.ReactNode;
  minWidth?: string;
  width?: string;
  height?: string;
  align?: 'left' | 'right';
}

export default function CustomSelect({
  value,
  onChange,
  options,
  testId,
  icon = <Filter size={14} style={{ color: 'var(--text-muted)' }} />,
  minWidth = '160px',
  width,
  height = '40px',
  align = 'left'
}: CustomSelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Escape key handler to close dropdown
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        setIsOpen(false);
      }
    };
    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen]);

  const selectedOption = options.find(o => o.value === value) || options[0];

  const outerWidth = width || 'auto';

  return (
    <div 
      ref={dropdownRef} 
      style={{ 
        position: 'relative', 
        display: outerWidth === '100%' ? 'block' : 'inline-block',
        width: outerWidth,
        minWidth: width ? 'none' : minWidth
      }}
    >
      {/* Hidden native select for E2E testing compatibility */}
      <select
        value={value}
        onChange={e => onChange(e.target.value)}
        data-testid={testId}
        style={{
          position: 'absolute',
          opacity: 0,
          pointerEvents: 'none',
          width: '1px',
          height: '1px',
          overflow: 'hidden',
          zIndex: -1
        }}
      >
        {options.map(o => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>

      {/* Styled dropdown trigger button */}
      <div
        onClick={() => setIsOpen(!isOpen)}
        aria-expanded={isOpen}
        aria-haspopup="listbox"
        style={{
          height: height,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '10px',
          padding: '0 16px',
          backgroundColor: 'var(--bg-surface)',
          border: '1px solid var(--border-default)',
          borderRadius: 'var(--radius-lg)',
          boxShadow: 'var(--shadow-xs)',
          cursor: 'pointer',
          fontSize: 'var(--text-sm)',
          fontWeight: 600,
          color: 'var(--text-primary)',
          userSelect: 'none',
          width: '100%',
          transition: 'all 0.15s ease'
        }}
        onMouseEnter={e => {
          e.currentTarget.style.borderColor = 'var(--border-focus)';
          e.currentTarget.style.boxShadow = '0 1px 3px 0 rgba(0, 0, 0, 0.05), 0 1px 2px -1px rgba(0, 0, 0, 0.05)';
        }}
        onMouseLeave={e => {
          e.currentTarget.style.borderColor = 'var(--border-default)';
          e.currentTarget.style.boxShadow = 'var(--shadow-xs)';
        }}
      >
        <span style={{ display: 'flex', alignItems: 'center', gap: '8px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          {icon}
          {selectedOption?.label || ''}
        </span>
        <span
          style={{
            display: 'flex',
            color: 'var(--text-muted)',
            transform: isOpen ? 'rotate(-90deg)' : 'rotate(90deg)',
            transition: 'transform 0.2s ease',
            flexShrink: 0
          }}
        >
          <ChevronRight size={14} />
        </span>
      </div>

      {/* Dropdown Options List */}
      {isOpen && (
        <div
          className="custom-select-dropdown"
          role="listbox"
          style={{
            position: 'absolute',
            top: 'calc(100% + 6px)',
            left: align === 'left' ? 0 : 'auto',
            right: align === 'right' ? 0 : 'auto',
            width: outerWidth === '100%' ? '100%' : 'max-content',
            minWidth: '100%',
            backgroundColor: 'var(--bg-surface)',
            border: '1px solid var(--border-default)',
            borderRadius: 'var(--radius-xl)',
            boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)',
            zIndex: 100,
            overflowY: 'auto',
            overflowX: 'hidden',
            maxHeight: '240px',
            padding: '6px',
            display: 'flex',
            flexDirection: 'column',
            gap: '2px',
            transformOrigin: 'top',
            animation: 'fadeInUp 0.15s ease-out'
          }}
        >
          {options.map(o => {
            const isSelected = o.value === value;
            return (
              <div
                key={o.value}
                role="option"
                aria-selected={isSelected}
                onClick={() => {
                  onChange(o.value);
                  setIsOpen(false);
                }}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: '12px',
                  padding: '8px 12px',
                  borderRadius: 'var(--radius-lg)',
                  cursor: 'pointer',
                  fontSize: 'var(--text-sm)',
                  fontWeight: isSelected ? 600 : 500,
                  color: isSelected ? 'var(--primary-700)' : 'var(--text-secondary)',
                  backgroundColor: isSelected ? 'var(--primary-50)' : 'transparent',
                  transition: 'all 0.12s ease',
                  whiteSpace: 'nowrap'
                }}
                onMouseEnter={e => {
                  if (!isSelected) {
                    e.currentTarget.style.backgroundColor = 'var(--bg-hover)';
                    e.currentTarget.style.color = 'var(--text-primary)';
                  }
                }}
                onMouseLeave={e => {
                  if (!isSelected) {
                    e.currentTarget.style.backgroundColor = 'transparent';
                    e.currentTarget.style.color = 'var(--text-secondary)';
                  }
                }}
              >
                <span>{o.label}</span>
                {isSelected && <Check size={14} style={{ color: 'var(--primary-600)', flexShrink: 0 }} />}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
