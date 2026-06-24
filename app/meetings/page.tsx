'use client';

import { useEffect, useState, useCallback, useRef } from 'react';
import { useAuth } from '@/lib/auth-context';
import { useToast } from '@/lib/toast-context';
import CustomSelect from '@/components/ui/CustomSelect';
import { Users, MapPin, X, Plus, Calendar, Clock, Tv, Video, Coffee, Monitor, Presentation, Volume2, Info, ChevronRight, Check } from 'lucide-react';

interface Room { id: string; name: string; capacity: number; floor: string; amenities: string[]; color: string; }
interface MeetingData { id: string; roomId: string; roomName: string; title: string; organizerName: string; organizer: string; date: string; startTime: string; endTime: string; status: string; attendees: string[]; }

const timeSlots = Array.from({ length: 20 }, (_, i) => { const h = Math.floor(i / 2) + 8; const m = i % 2 === 0 ? '00' : '30'; return `${String(h).padStart(2, '0')}:${m}`; });

const amenityIcons: Record<string, React.ReactNode> = {
  'Whiteboard': <Tv size={12} />,
  'Projector': <Presentation size={12} />,
  'Video Conf': <Video size={12} />,
  'TV': <Tv size={12} />,
  'Coffee': <Coffee size={12} />,
  'default': <Info size={12} />
};

const getAmenityIcon = (name: string) => {
  const normalized = name.toLowerCase();
  if (normalized.includes('whiteboard')) return amenityIcons['Whiteboard'];
  if (normalized.includes('projector') || normalized.includes('screen')) return amenityIcons['Projector'];
  if (normalized.includes('video') || normalized.includes('camera') || normalized.includes('conference')) return amenityIcons['Video Conf'];
  if (normalized.includes('tv') || normalized.includes('display')) return amenityIcons['TV'];
  if (normalized.includes('coffee') || normalized.includes('refreshment')) return amenityIcons['Coffee'];
  return amenityIcons['default'];
};

export default function MeetingsPage() {
  const { token, user } = useAuth();
  const { addToast } = useToast();
  const [rooms, setRooms] = useState<Room[]>([]);
  const [meetings, setMeetings] = useState<MeetingData[]>([]);
  const [selectedDate, setSelectedDate] = useState(() => {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  });
  const [showBookModal, setShowBookModal] = useState(false);
  const [selectedRoom, setSelectedRoom] = useState<Room | null>(null);
  const [form, setForm] = useState({ title: '', date: '', startTime: '09:00', endTime: '10:00' });
  const [loading, setLoading] = useState(true);
  const hasLoadedRef = useRef(false);
  const [hoveredSlot, setHoveredSlot] = useState<{ roomId: string, slot: string } | null>(null);

  const fetchData = useCallback(async (silent = false) => {
    if (!token) return;
    const showLoader = !silent && !hasLoadedRef.current;
    if (showLoader) setLoading(true);
    try {
      const [roomsRes, meetingsRes] = await Promise.all([
        fetch('/api/meetings/rooms', { headers: { Authorization: `Bearer ${token}` } }),
        fetch(`/api/meetings?date=${selectedDate}`, { headers: { Authorization: `Bearer ${token}` } }),
      ]);
      const roomsData = await roomsRes.json();
      const meetingsData = await meetingsRes.json();
      if (roomsData.success) setRooms(roomsData.data);
      if (meetingsData.success) {
        setMeetings(meetingsData.data);
        hasLoadedRef.current = true;
      }
    } catch (err) {
      console.error('Error fetching meetings data:', err);
    } finally {
      if (showLoader) setLoading(false);
    }
  }, [token, selectedDate]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const openBooking = (room: Room, startVal?: string) => {
    setSelectedRoom(room);
    let start = '09:00';
    let end = '10:00';
    if (startVal) {
      start = startVal;
      const idx = timeSlots.indexOf(startVal);
      if (idx !== -1 && idx < timeSlots.length - 1) {
        end = timeSlots[idx + 2] || timeSlots[idx + 1] || '18:00'; // Default booking of 1 hour if possible
      } else {
        const [h, m] = startVal.split(':').map(Number);
        const nextMin = m === 30 ? '00' : '30';
        const nextHr = m === 30 ? String(h + 1).padStart(2, '0') : String(h).padStart(2, '0');
        end = `${nextHr}:${nextMin}`;
      }
    }
    setForm({ title: '', date: selectedDate, startTime: start, endTime: end });
    setShowBookModal(true);
  };

  const handleBook = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedRoom) return;
    const res = await fetch('/api/meetings', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({ ...form, roomId: selectedRoom.id })
    });
    const data = await res.json();
    if (data.success) {
      addToast({ type: 'success', title: 'Meeting booked!' });
      setShowBookModal(false);
      fetchData(true); // Silent reload
    }
    else addToast({ type: 'error', title: 'Booking failed', message: data.error });
  };

  const handleCancel = async (id: string) => {
    const originalMeetings = [...meetings];
    setMeetings(prev => prev.filter(m => m.id !== id));
    try {
      const res = await fetch(`/api/meetings/${id}`, { method: 'DELETE', headers: { Authorization: `Bearer ${token}` } });
      const data = await res.json();
      if (data.success) {
        addToast({ type: 'success', title: 'Meeting cancelled' });
        fetchData(true); // Silent reload
      } else {
        setMeetings(originalMeetings);
        addToast({ type: 'error', title: 'Error', message: data.error });
      }
    } catch (err) {
      setMeetings(originalMeetings);
      addToast({ type: 'error', title: 'Network Error', message: 'Failed to connect to the server.' });
    }
  };

  const getRoomMeetings = (roomId: string) => meetings.filter(m => m.roomId === roomId && m.status === 'scheduled');

  return (
    <div data-testid="meetings-page" className="animate-fadeIn" style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-6)' }}>
      {/* Page Header */}
      <div 
        style={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center', 
          flexWrap: 'wrap', 
          gap: 'var(--space-4)',
          borderBottom: '1px solid var(--border-default)',
          paddingBottom: 'var(--space-4)'
        }}
      >
        <div>
          <h2 className="page-title" style={{ margin: 0, fontSize: '28px', fontWeight: 800, letterSpacing: '-0.02em', color: 'var(--text-primary)' }}>
            Meeting Rooms
          </h2>
          <p className="page-subtitle" style={{ margin: '4px 0 0 0', fontSize: 'var(--text-sm)', color: 'var(--text-secondary)' }}>
            Book a room and manage your schedules.
          </p>
        </div>
        
        <div 
          style={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: 'var(--space-3)', 
            backgroundColor: 'var(--bg-surface)', 
            padding: '8px 16px', 
            borderRadius: 'var(--radius-xl)', 
            border: '1px solid var(--border-default)',
            boxShadow: 'var(--shadow-xs)'
          }}
        >
          <span style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--text-secondary)', fontSize: 'var(--text-sm)', fontWeight: 600 }}>
            <Calendar size={15} /> Date:
          </span>
          <input 
            type="date" 
            className="form-input" 
            style={{ 
              width: 140, 
              padding: '4px 8px', 
              border: 'none', 
              outline: 'none', 
              fontSize: 'var(--text-sm)', 
              fontWeight: 500,
              cursor: 'pointer',
              backgroundColor: 'transparent'
            }} 
            value={selectedDate} 
            onChange={e => setSelectedDate(e.target.value)} 
            data-testid="meeting-date" 
          />
        </div>
      </div>

      {loading ? (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: 'var(--space-5)' }}>
          {[1, 2, 3, 4, 5].map(i => (
            <div key={i} className="skeleton" style={{ height: 350, borderRadius: 'var(--radius-xl)' }} />
          ))}
        </div>
      ) : (
        <div 
          className="stagger-children" 
          data-testid="room-grid"
          style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', 
            gap: 'var(--space-5)' 
          }}
        >
          {rooms.map(room => {
            const roomMeetings = getRoomMeetings(room.id);
            return (
              <div 
                key={room.id} 
                className="card relative flex flex-col" 
                style={{ 
                  overflow: 'hidden', 
                  borderRadius: 'var(--radius-xl)',
                  backgroundColor: 'var(--bg-surface)',
                  border: '1px solid var(--border-default)',
                  boxShadow: 'var(--shadow-sm)',
                  transition: 'transform 0.2s, box-shadow 0.2s',
                  padding: 'var(--space-5)',
                  gap: 'var(--space-4)'
                }} 
                data-testid={`room-card-${room.id}`}
                onMouseEnter={e => {
                  e.currentTarget.style.transform = 'translateY(-2px)';
                  e.currentTarget.style.boxShadow = 'var(--shadow-md)';
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.transform = 'none';
                  e.currentTarget.style.boxShadow = 'var(--shadow-sm)';
                }}
              >
                <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 4, background: room.color }} />
                
                {/* Header info */}
                <div>
                  <div style={{ fontSize: 'var(--text-lg)', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '6px' }}>
                    {room.name}
                  </div>
                  <div style={{ display: 'flex', gap: 'var(--space-3)', color: 'var(--text-secondary)', fontSize: 'var(--text-sm)' }}>
                    <span className="flex items-center gap-1.5" style={{ fontWeight: 500 }}><Users size={14} /> Up to {room.capacity} seats</span>
                    <span style={{ color: 'var(--text-muted)' }}>·</span>
                    <span className="flex items-center gap-1.5" style={{ fontWeight: 500 }}><MapPin size={14} /> {room.floor}</span>
                  </div>
                </div>

                {/* Amenities */}
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--space-2)' }}>
                  {room.amenities.map(a => (
                    <span 
                      key={a} 
                      className="badge"
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '6px',
                        padding: '4px 10px',
                        fontSize: 'var(--text-xs)',
                        fontWeight: 600,
                        backgroundColor: 'var(--bg-hover)',
                        color: 'var(--text-secondary)',
                        borderRadius: 'var(--radius-full)',
                        border: '1px solid var(--border-default)'
                      }}
                    >
                      {getAmenityIcon(a)}
                      {a}
                    </span>
                  ))}
                </div>

                {/* Interactive Visual Timeline */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', marginTop: '4px' }}>
                  <div className="flex-between text-xs font-semibold" style={{ color: 'var(--text-secondary)' }}>
                    <span>Daily Schedule</span>
                    <span style={{ fontSize: '10px', color: 'var(--text-muted)', fontWeight: 500 }}>Click free slot to book</span>
                  </div>
                  
                  <div 
                    style={{ 
                      display: 'grid', 
                      gridTemplateColumns: 'repeat(20, 1fr)', 
                      gap: '2px', 
                      height: '26px', 
                      backgroundColor: 'rgba(241, 245, 249, 0.8)', 
                      padding: '3px', 
                      borderRadius: 'var(--radius-md)', 
                      border: '1px solid var(--border-default)', 
                      position: 'relative' 
                    }}
                  >
                    {timeSlots.map(slot => {
                      const booking = roomMeetings.find(m => slot >= m.startTime && slot < m.endTime);
                      const isBooked = !!booking;
                      const isUserBooking = booking?.organizer === user?.id;
                      const isHovered = hoveredSlot?.roomId === room.id && hoveredSlot?.slot === slot;
                      
                      return (
                        <div
                          key={slot}
                          style={{
                            position: 'relative',
                            backgroundColor: isBooked ? (isUserBooking ? 'rgba(79, 70, 229, 0.5)' : 'rgba(148, 163, 184, 0.4)') : 'transparent',
                            border: isBooked ? 'none' : '1px dashed var(--border-default)',
                            borderRadius: '2px',
                            cursor: isBooked ? 'default' : 'pointer',
                            transition: 'all 0.15s ease',
                            transform: isHovered && !isBooked ? 'scaleY(1.15)' : 'none',
                          }}
                          onMouseEnter={() => !isBooked && setHoveredSlot({ roomId: room.id, slot })}
                          onMouseLeave={() => setHoveredSlot(null)}
                          onClick={() => !isBooked && openBooking(room, slot)}
                          title={isBooked ? `Booked: ${booking.title} (${booking.startTime} - ${booking.endTime}) by ${booking.organizerName}` : `${slot} - Click to book`}
                        />
                      );
                    })}
                  </div>
                  
                  {/* Timeline hours markings */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0 2px', fontSize: '9px', color: 'var(--text-muted)', fontWeight: 500 }}>
                    <span>08:00</span>
                    <span>10:00</span>
                    <span>12:00</span>
                    <span>14:00</span>
                    <span>16:00</span>
                    <span>18:00</span>
                  </div>
                </div>

                {/* Today's bookings list */}
                {roomMeetings.length > 0 && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
                    <div className="text-xs font-semibold" style={{ color: 'var(--text-secondary)' }}>Bookings details:</div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', maxHeight: '110px', overflowY: 'auto', paddingRight: '4px' }}>
                      {roomMeetings.map(m => (
                        <div 
                          key={m.id} 
                          className="flex-between text-xs" 
                          style={{ 
                            padding: '8px 12px', 
                            background: 'rgba(248, 250, 252, 0.5)', 
                            border: '1px solid var(--border-default)', 
                            borderRadius: 'var(--radius-md)'
                          }}
                        >
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', minWidth: 0, flex: 1 }}>
                            <span style={{ width: 8, height: 8, borderRadius: '50%', background: room.color, flexShrink: 0 }} />
                            <span style={{ fontWeight: 600, color: 'var(--text-primary)', flexShrink: 0 }}>{m.startTime} - {m.endTime}</span>
                            <span style={{ color: 'var(--text-muted)', flexShrink: 0 }}>·</span>
                            <span style={{ color: 'var(--text-secondary)', textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }} title={`${m.title} (${m.organizerName})`}>
                              {m.title} <span style={{ color: 'var(--text-muted)', fontSize: '10px' }}>({m.organizerName})</span>
                            </span>
                          </div>
                          {m.organizer === user?.id && (
                            <button 
                              className="btn btn-ghost btn-sm" 
                              style={{ padding: '2px 4px', height: 'auto', display: 'flex', alignItems: 'center', color: 'var(--danger)', border: 'none', background: 'transparent', cursor: 'pointer' }} 
                              onClick={() => handleCancel(m.id)} 
                              data-testid={`cancel-meeting-${m.id}`}
                              title="Cancel booking"
                            >
                              <X size={14} />
                            </button>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <button 
                  className="btn btn-primary w-full" 
                  style={{ 
                    marginTop: 'auto', 
                    padding: '10px', 
                    borderRadius: 'var(--radius-lg)', 
                    fontWeight: 600,
                    boxShadow: 'var(--shadow-xs)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '6px'
                  }} 
                  onClick={() => openBooking(room)} 
                  data-testid={`book-room-${room.id}`}
                >
                  <Plus size={16} /> Book This Room
                </button>
              </div>
            );
          })}
        </div>
      )}

      {/* Booking Side Drawer Overlay */}
      {showBookModal && selectedRoom && (
        <div 
          className="drawer-overlay animate-fadeIn" 
          onClick={() => setShowBookModal(false)}
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(15, 23, 42, 0.4)',
            backdropFilter: 'blur(4px)',
            zIndex: 100,
            display: 'flex',
            justifyContent: 'flex-end'
          }}
        >
          <div 
            className="drawer animate-slideInRight" 
            onClick={e => e.stopPropagation()} 
            role="dialog" 
            aria-labelledby="book-modal-title"
            style={{
              width: '100%',
              maxWidth: '460px',
              backgroundColor: 'var(--bg-surface)',
              height: '100%',
              boxShadow: 'var(--shadow-overlay)',
              display: 'flex',
              flexDirection: 'column',
              padding: 'var(--space-6)',
              overflowY: 'auto'
            }}
          >
            {/* Header */}
            <div 
              style={{ 
                display: 'flex', 
                justifyContent: 'space-between', 
                alignItems: 'center', 
                borderBottom: '1px solid var(--border-default)', 
                paddingBottom: 'var(--space-4)',
                marginBottom: 'var(--space-5)'
              }}
            >
              <div>
                <h3 className="drawer-title" id="book-modal-title" style={{ margin: 0, fontSize: '20px', fontWeight: 800 }}>
                  Book {selectedRoom.name}
                </h3>
                <span 
                  style={{ 
                    fontSize: 'var(--text-xs)', 
                    color: 'var(--text-secondary)',
                    backgroundColor: 'var(--bg-hover)',
                    padding: '3px 8px',
                    borderRadius: 'var(--radius-full)',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '4px',
                    marginTop: '6px',
                    fontWeight: 500
                  }}
                >
                  <MapPin size={11} /> {selectedRoom.floor} · Up to {selectedRoom.capacity} seats
                </span>
              </div>
              <button 
                className="drawer-close" 
                onClick={() => setShowBookModal(false)}
                style={{
                  border: 'none',
                  backgroundColor: 'transparent',
                  cursor: 'pointer',
                  color: 'var(--text-secondary)',
                  padding: '6px',
                  borderRadius: 'var(--radius-md)',
                  transition: 'background-color 0.2s'
                }}
                onMouseEnter={e => e.currentTarget.style.backgroundColor = 'var(--bg-hover)'}
                onMouseLeave={e => e.currentTarget.style.backgroundColor = 'transparent'}
              >
                <X size={20} />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleBook} data-testid="booking-form" style={{ display: 'flex', flexDirection: 'column', flex: 1 }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)', flex: 1 }}>
                
                {/* Info Card */}
                <div style={{ padding: 'var(--space-4)', background: 'rgba(79, 70, 229, 0.04)', border: '1px solid rgba(79, 70, 229, 0.1)', borderRadius: 'var(--radius-lg)', display: 'flex', gap: '12px' }}>
                  <div style={{ display: 'flex', color: '#4F46E5', marginTop: '2px' }}><Info size={16} /></div>
                  <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-secondary)', lineHeight: '1.5' }}>
                    Rooms have high demand. Please ensure you enter the accurate title and cancel if not using the room.
                  </div>
                </div>

                <div className="form-group" style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <label className="form-label" style={{ fontWeight: 600, fontSize: 'var(--text-sm)', color: 'var(--text-primary)' }}>Meeting Title</label>
                  <input 
                    className="form-input" 
                    value={form.title} 
                    onChange={e => setForm({ ...form, title: e.target.value })} 
                    required 
                    placeholder="e.g. Sprint Planning, 1-on-1 Sync" 
                    data-testid="booking-title" 
                    style={{
                      padding: '10px 14px',
                      border: '1px solid var(--border-default)',
                      borderRadius: 'var(--radius-lg)',
                      fontSize: 'var(--text-sm)',
                      outline: 'none',
                      transition: 'border-color 0.2s'
                    }}
                    onFocus={e => e.currentTarget.style.borderColor = '#4F46E5'}
                    onBlur={e => e.currentTarget.style.borderColor = 'var(--border-default)'}
                  />
                </div>

                <div className="form-group" style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <label className="form-label" style={{ fontWeight: 600, fontSize: 'var(--text-sm)', color: 'var(--text-primary)' }}>Date</label>
                  <input 
                    type="date" 
                    className="form-input" 
                    value={form.date} 
                    onChange={e => setForm({ ...form, date: e.target.value })} 
                    required 
                    data-testid="booking-date" 
                    style={{
                      padding: '10px 14px',
                      border: '1px solid var(--border-default)',
                      borderRadius: 'var(--radius-lg)',
                      fontSize: 'var(--text-sm)',
                      outline: 'none',
                      transition: 'border-color 0.2s'
                    }}
                    onFocus={e => e.currentTarget.style.borderColor = '#4F46E5'}
                    onBlur={e => e.currentTarget.style.borderColor = 'var(--border-default)'}
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-4)' }}>
                  <div className="form-group" style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    <label className="form-label" style={{ fontWeight: 600, fontSize: 'var(--text-sm)', color: 'var(--text-primary)' }}>Start Time</label>
                    <CustomSelect
                      value={form.startTime}
                      onChange={val => setForm({ ...form, startTime: val })}
                      testId="booking-start"
                      width="100%"
                      icon={null}
                      options={timeSlots.map(t => ({ value: t, label: t }))}
                    />
                  </div>
                  
                  <div className="form-group" style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    <label className="form-label" style={{ fontWeight: 600, fontSize: 'var(--text-sm)', color: 'var(--text-primary)' }}>End Time</label>
                    <CustomSelect
                      value={form.endTime}
                      onChange={val => setForm({ ...form, endTime: val })}
                      testId="booking-end"
                      width="100%"
                      icon={null}
                      options={[
                        ...timeSlots.map(t => ({ value: t, label: t })),
                        { value: '18:00', label: '18:00' }
                      ]}
                    />
                  </div>
                </div>
              </div>

              {/* Actions Footer */}
              <div 
                style={{ 
                  display: 'flex', 
                  gap: 'var(--space-3)', 
                  borderTop: '1px solid var(--border-default)', 
                  paddingTop: 'var(--space-4)', 
                  marginTop: 'var(--space-6)' 
                }}
              >
                <button 
                  type="button" 
                  className="btn btn-ghost" 
                  onClick={() => setShowBookModal(false)}
                  style={{
                    flex: 1,
                    padding: '12px',
                    borderRadius: 'var(--radius-lg)',
                    fontWeight: 600,
                    cursor: 'pointer',
                    border: '1px solid var(--border-default)',
                    backgroundColor: 'transparent',
                    color: 'var(--text-secondary)'
                  }}
                  onMouseEnter={e => e.currentTarget.style.backgroundColor = 'var(--bg-hover)'}
                  onMouseLeave={e => e.currentTarget.style.backgroundColor = 'transparent'}
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  className="btn btn-primary" 
                  data-testid="confirm-booking"
                  style={{
                    flex: 1,
                    padding: '12px',
                    borderRadius: 'var(--radius-lg)',
                    fontWeight: 600,
                    cursor: 'pointer',
                    border: 'none',
                    backgroundColor: '#4F46E5',
                    color: '#fff',
                    boxShadow: 'var(--shadow-sm)'
                  }}
                  onMouseEnter={e => e.currentTarget.style.backgroundColor = '#4338CA'}
                  onMouseLeave={e => e.currentTarget.style.backgroundColor = '#4F46E5'}
                >
                  Book Room
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
