'use client';

import { useEffect, useState, useCallback, useRef } from 'react';
import { useAuth } from '@/lib/auth-context';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, Info, X, Clock, MapPin, Tag } from 'lucide-react';
import type { CalendarEvent } from '@/lib/types';

const getEventStyles = (e: CalendarEvent) => {
  if (e.type === 'meeting') {
    return {
      color: '#4F46E5',
      backgroundColor: 'rgba(79, 70, 229, 0.08)',
      borderLeft: '3px solid #6366F1',
    };
  }
  if (e.type === 'task_deadline') {
    const priority = e.metadata?.priority || 'medium';
    if (priority === 'urgent') {
      return {
        color: '#EF4444',
        backgroundColor: 'rgba(239, 68, 68, 0.08)',
        borderLeft: '3px solid #EF4444',
      };
    }
    if (priority === 'high') {
      return {
        color: '#F97316',
        backgroundColor: 'rgba(249, 115, 22, 0.08)',
        borderLeft: '3px solid #F97316',
      };
    }
    if (priority === 'low') {
      return {
        color: '#64748B',
        backgroundColor: 'rgba(100, 116, 139, 0.08)',
        borderLeft: '3px solid #94A3B8',
      };
    }
    return {
      color: '#3B82F6',
      backgroundColor: 'rgba(59, 130, 246, 0.08)',
      borderLeft: '3px solid #3B82F6',
    };
  }
  if (e.type === 'leave') {
    return {
      color: '#059669',
      backgroundColor: 'rgba(5, 150, 105, 0.08)',
      borderLeft: '3px solid #10B981',
    };
  }
  if (e.type === 'birthday') {
    return {
      color: '#D97706',
      backgroundColor: 'rgba(217, 119, 6, 0.08)',
      borderLeft: '3px solid #F59E0B',
    };
  }
  return {
    color: '#64748B',
    backgroundColor: 'rgba(241, 245, 249, 0.8)',
    borderLeft: '3px solid #CBD5E1',
  };
};

const formatDateLocal = (d: Date) => {
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

export default function CalendarPage() {
  const { token } = useAuth();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [isFetching, setIsFetching] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);

  const isFirstLoad = useRef(true);

  const fetchEvents = useCallback(async () => {
    if (!token) return;
    if (isFirstLoad.current) {
      setLoading(true);
    } else {
      setIsFetching(true);
    }
    
    // Fetch from start of month to end of month, plus a few days to fill grid
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    
    // Expand range to cover full grid (up to 42 days)
    const startStr = formatDateLocal(new Date(year, month, firstDay.getDate() - firstDay.getDay()));
    const endStr = formatDateLocal(new Date(year, month, lastDay.getDate() + (6 - lastDay.getDay())));

    try {
      const res = await fetch(`/api/calendar?start=${startStr}&end=${endStr}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) {
        setEvents(data.data);
      }
    } catch (err) {
      console.error('Failed to fetch calendar events', err);
    } finally {
      setLoading(false);
      setIsFetching(false);
      isFirstLoad.current = false;
    }
  }, [currentDate, token]);

  useEffect(() => {
    fetchEvents();
  }, [fetchEvents]);

  const nextMonth = () => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  const prevMonth = () => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  const today = () => setCurrentDate(new Date());

  const daysInMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0).getDate();
  const firstDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1).getDay();
  const prevMonthDays = new Date(currentDate.getFullYear(), currentDate.getMonth(), 0).getDate();

  const gridDays = [];
  // Previous month days
  for (let i = firstDayOfMonth - 1; i >= 0; i--) {
    gridDays.push({
      date: new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, prevMonthDays - i),
      isCurrentMonth: false
    });
  }
  // Current month days
  for (let i = 1; i <= daysInMonth; i++) {
    gridDays.push({
      date: new Date(currentDate.getFullYear(), currentDate.getMonth(), i),
      isCurrentMonth: true
    });
  }
  // Next month days to fill 6 rows
  const remainingCells = (gridDays.length % 7) === 0 ? 0 : 7 - (gridDays.length % 7);
  for (let i = 1; i <= remainingCells; i++) {
    gridDays.push({
      date: new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, i),
      isCurrentMonth: false
    });
  }

  const isToday = (d: Date) => {
    const todayDate = new Date();
    return d.getDate() === todayDate.getDate() &&
           d.getMonth() === todayDate.getMonth() &&
           d.getFullYear() === todayDate.getFullYear();
  };

  const isSelected = (d: Date) => {
    if (!selectedDate) return false;
    return d.getDate() === selectedDate.getDate() &&
           d.getMonth() === selectedDate.getMonth() &&
           d.getFullYear() === selectedDate.getFullYear();
  };

  const getEventsForDate = (d: Date) => {
    const dateStr = formatDateLocal(d);
    return events.filter(e => e.date === dateStr);
  };

  return (
    <div data-testid="calendar-page" className="animate-fadeIn" style={{ display: 'flex', flexDirection: 'column', height: 'calc(100vh - 128px)', overflow: 'hidden' }}>
      {/* Header section */}
      <div 
        className="filter-bar animate-fadeIn"
        style={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center', 
          flexWrap: 'wrap', 
          gap: 'var(--space-4)',
          background: 'var(--bg-surface)',
          padding: 'var(--space-4)',
          borderRadius: 'var(--radius-xl)',
          border: '1px solid var(--border-default)',
          boxShadow: 'var(--shadow-sm)',
          flexShrink: 0,
          marginBottom: 'var(--space-4)'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-4)', height: '40px' }}>
          <h2 style={{ fontSize: '22px', fontWeight: 800, margin: 0, letterSpacing: '-0.02em', color: 'var(--text-primary)', fontFamily: 'var(--font-display)', minWidth: '200px', lineHeight: '40px', display: 'flex', alignItems: 'center' }}>
            {currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
          </h2>
          <div 
            style={{ 
              display: 'flex', 
              backgroundColor: 'rgba(241, 245, 249, 0.8)', 
              padding: '3px', 
              borderRadius: 'var(--radius-lg)', 
              border: '1px solid var(--border-default)',
              height: '40px',
              alignItems: 'center'
            }}
          >
            <button 
              className="btn btn-secondary btn-sm" 
              onClick={prevMonth} 
              aria-label="Previous Month"
              style={{ border: 'none', background: 'transparent', padding: '6px 10px', display: 'flex', alignItems: 'center', cursor: 'pointer', borderRadius: 'var(--radius-md)' }}
            >
              <ChevronLeft size={16} />
            </button>
            <button 
              className="btn btn-secondary btn-sm" 
              onClick={today}
              style={{ border: 'none', background: 'white', padding: '6px 12px', fontSize: '12px', fontWeight: 600, cursor: 'pointer', borderRadius: 'var(--radius-md)', boxShadow: 'var(--shadow-xs)' }}
            >
              Today
            </button>
            <button 
              className="btn btn-secondary btn-sm" 
              onClick={nextMonth} 
              aria-label="Next Month"
              style={{ border: 'none', background: 'transparent', padding: '6px 10px', display: 'flex', alignItems: 'center', cursor: 'pointer', borderRadius: 'var(--radius-md)' }}
            >
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
        
        {/* Color Legend */}
        <div style={{
          display: 'flex', 
          gap: 'var(--space-4)', 
          flexWrap: 'wrap', 
          fontSize: 'var(--text-xs)', 
          fontWeight: 600, 
          color: 'var(--text-secondary)',
          backgroundColor: 'transparent',
          padding: '0 8px',
          borderRadius: 'var(--radius-full)',
          border: 'none',
          height: '40px',
          alignItems: 'center'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><span style={{ width: 8, height: 8, borderRadius: '50%', backgroundColor: '#6366F1' }} /> Meetings</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><span style={{ width: 8, height: 8, borderRadius: '50%', backgroundColor: '#3B82F6' }} /> Tasks</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><span style={{ width: 8, height: 8, borderRadius: '50%', backgroundColor: '#10B981' }} /> Leaves</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><span style={{ width: 8, height: 8, borderRadius: '50%', backgroundColor: '#F59E0B' }} /> Anniversaries</div>
        </div>
      </div>

      <div style={{ display: 'flex', gap: 'var(--space-5)', flex: 1, minHeight: 0 }}>
        {/* Calendar Grid Container */}
        <div 
          className="card" 
          style={{ 
            flex: 1, 
            display: 'flex', 
            flexDirection: 'column', 
            overflow: 'hidden',
            border: '1px solid var(--border-default)',
            borderRadius: 'var(--radius-xl)',
            boxShadow: 'var(--shadow-sm)'
          }}
        >
          {/* Days of week header */}
          <div 
            style={{ 
              display: 'grid', 
              gridTemplateColumns: 'repeat(7, 1fr)', 
              borderBottom: '1px solid var(--border-default)', 
              backgroundColor: 'rgba(248, 250, 252, 0.8)' 
            }}
          >
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
              <div 
                key={day} 
                style={{ 
                  padding: '12px 6px', 
                  textAlign: 'center', 
                  fontWeight: 700, 
                  fontSize: '11px', 
                  color: 'var(--text-secondary)', 
                  textTransform: 'uppercase', 
                  letterSpacing: '0.05em' 
                }}
              >
                {day}
              </div>
            ))}
          </div>

          {/* Grid Cells */}
          {loading ? (
            <div style={{ flex: 1, padding: 'var(--space-4)' }}>
              <div className="skeleton" style={{ width: '100%', height: '100%', borderRadius: 'var(--radius-lg)' }} />
            </div>
          ) : (
            <div style={{ 
              display: 'grid', 
              gridTemplateColumns: 'repeat(7, 1fr)', 
              gridAutoRows: '1fr', 
              flex: 1, 
              overflow: 'hidden',
              gap: '1px',
              backgroundColor: 'var(--border-default)',
              opacity: isFetching ? 0.75 : 1,
              transition: 'opacity 0.15s ease'
            }}>
              {gridDays.map((day, idx) => {
                const dayEvents = day.isCurrentMonth ? getEventsForDate(day.date) : [];
                const isT = isToday(day.date);
                const isSel = isSelected(day.date);
                return (
                  <div 
                    key={idx}
                    onClick={() => setSelectedDate(day.date)}
                    style={{ 
                      padding: '8px',
                      backgroundColor: isSel 
                        ? (isT ? 'rgba(99, 102, 241, 0.15)' : 'rgba(99, 102, 241, 0.08)') 
                        : isT
                          ? 'rgba(99, 102, 241, 0.03)' 
                          : !day.isCurrentMonth 
                            ? 'rgba(248, 250, 252, 0.8)' 
                            : 'var(--bg-surface)',
                      opacity: !day.isCurrentMonth ? 0.55 : 1,
                      cursor: 'pointer',
                      transition: 'all 0.2s',
                      minHeight: 100,
                      display: 'flex', 
                      flexDirection: 'column',
                      border: isT ? '2px solid #6366F1' : 'none',
                      position: 'relative'
                    }}
                    onMouseEnter={e => {
                      if (!isSel && !isT) {
                        e.currentTarget.style.backgroundColor = 'rgba(99, 102, 241, 0.02)';
                      }
                    }}
                    onMouseLeave={e => {
                      if (!isSel && !isT) {
                        e.currentTarget.style.backgroundColor = !day.isCurrentMonth ? 'rgba(248, 250, 252, 0.8)' : 'var(--bg-surface)';
                      }
                    }}
                  >
                    <div style={{ 
                      width: 24, height: 24, borderRadius: '50%', 
                      display: 'flex', alignItems: 'center', justifyContent: 'center', 
                      fontSize: '12px', fontWeight: 700,
                      backgroundColor: isT ? '#6366F1' : 'transparent',
                      color: isT ? 'white' : 'var(--text-primary)',
                      alignSelf: 'flex-end',
                      marginBottom: '6px'
                    }}>
                      {day.date.getDate()}
                    </div>
                    
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 3, flex: 1, minHeight: 0, overflow: 'hidden' }}>
                      {dayEvents.slice(0, 3).map(e => {
                        const eventStyles = getEventStyles(e);
                        return (
                          <div 
                            key={e.id} 
                            style={{ 
                              fontSize: '10px', 
                              padding: '2px 6px', 
                              borderRadius: 'var(--radius-sm)', 
                              backgroundColor: eventStyles.backgroundColor, 
                              color: eventStyles.color,
                              borderLeft: eventStyles.borderLeft,
                              whiteSpace: 'nowrap', 
                              overflow: 'hidden', 
                              textOverflow: 'ellipsis',
                              fontWeight: 600,
                              lineHeight: '1.3'
                            }}
                          >
                            {e.startTime && `${e.startTime} `}{e.title}
                          </div>
                        );
                      })}
                      {dayEvents.length > 3 && (
                        <div style={{ fontSize: '9px', color: 'var(--text-muted)', textAlign: 'center', marginTop: 1, fontWeight: 700 }}>
                          +{dayEvents.length - 3} more
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Day Detail Sidebar */}
        {selectedDate && (
          <div 
            className="card animate-fadeInRight" 
            style={{ 
              width: 320, 
              display: 'flex', 
              flexDirection: 'column', 
              flexShrink: 0,
              border: '1px solid var(--border-default)',
              borderRadius: 'var(--radius-xl)',
              boxShadow: 'var(--shadow-md)',
              backgroundColor: 'var(--bg-surface)'
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: 'var(--space-4) var(--space-5)', borderBottom: '1px solid var(--border-default)' }}>
              <span style={{ fontWeight: 700, fontSize: 'var(--text-sm)', color: 'var(--text-primary)' }}>
                {selectedDate.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
              </span>
              <button 
                className="btn btn-ghost btn-sm" 
                style={{ padding: 4, height: 'auto', borderRadius: 'var(--radius-md)', color: 'var(--text-muted)' }} 
                onClick={() => setSelectedDate(null)}
              >
                <X size={16} />
              </button>
            </div>
            
            <div className="card-body" style={{ flex: 1, overflowY: 'auto', padding: 'var(--space-5)', display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
              {(() => {
                const dayEvents = getEventsForDate(selectedDate);
                if (dayEvents.length === 0) {
                  return (
                    <div className="empty-state" style={{ padding: 'var(--space-8) 0' }}>
                      <div className="empty-state-icon" style={{ color: 'var(--text-muted)', marginBottom: 'var(--space-3)' }}><CalendarIcon size={32} /></div>
                      <div className="empty-state-title" style={{ fontSize: 'var(--text-sm)', fontWeight: 700 }}>No Events Scheduled</div>
                      <p style={{ color: 'var(--text-secondary)', fontSize: '11px', margin: '4px 0 0 0' }}>This date is currently clear.</p>
                    </div>
                  );
                }
                return dayEvents.map(e => {
                  const eventStyles = getEventStyles(e);
                  return (
                    <div 
                      key={e.id} 
                      style={{ 
                        display: 'flex', 
                        flexDirection: 'column',
                        gap: '6px', 
                        padding: 'var(--space-4)', 
                        borderRadius: 'var(--radius-lg)', 
                        backgroundColor: eventStyles.backgroundColor, 
                        borderLeft: eventStyles.borderLeft,
                        border: '1px solid var(--border-default)',
                        borderLeftWidth: '4px',
                        borderLeftColor: eventStyles.borderLeft.split(' ')[2]
                      }}
                    >
                      <div style={{ fontWeight: 700, fontSize: 'var(--text-sm)', color: eventStyles.color }}>
                        {e.title}
                      </div>
                      
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', fontSize: '11px', color: 'var(--text-secondary)' }}>
                        {e.startTime && (
                          <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                            <Clock size={11} /> {e.startTime} - {e.endTime}
                          </div>
                        )}
                        {e.metadata?.roomName && (
                          <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                            <MapPin size={11} /> Room: {e.metadata.roomName}
                          </div>
                        )}
                        {e.metadata?.priority && (
                          <div style={{ display: 'flex', alignItems: 'center', gap: '4px', textTransform: 'capitalize' }}>
                            <Tag size={11} /> Priority: {e.metadata.priority}
                          </div>
                        )}
                      </div>
                    </div>
                  );
                });
              })()}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
