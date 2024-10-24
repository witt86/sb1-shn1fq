import React, { useRef, useEffect } from 'react';
import { ViewType, Course } from '../types';
import { ChevronDown } from 'lucide-react';
import { formatTimeRange } from '../utils/date';

interface CalendarBodyProps {
  viewType: ViewType;
  courses: Course[];
  currentDate: Date;
  onTimeSlotClick: (date: Date, courses: Course[]) => void;
  onCourseClick?: (course: Course) => void;
}

const CalendarBody: React.FC<CalendarBodyProps> = ({ 
  viewType, 
  courses, 
  currentDate, 
  onTimeSlotClick,
  onCourseClick 
}) => {
  const calendarRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (calendarRef.current) {
      const today = new Date();
      if (
        currentDate.getMonth() === today.getMonth() &&
        currentDate.getFullYear() === today.getFullYear()
      ) {
        const dayElement = calendarRef.current.querySelector(`[data-date="${today.toISOString().split('T')[0]}"]`);
        if (dayElement) {
          dayElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
      }
    }
  }, [viewType, currentDate]);

  const renderCourseCard = (course: Course) => {
    const teacherName = course.teacher?.teacherName || 'Unknown Teacher';
    const startTime = formatTimeRange(course.startTime, course.endTime);

    return (
      <div
        key={course.ID}
        className="course-card tw-bg-white tw-rounded-lg tw-shadow tw-p-1 tw-mb-1 tw-w-full tw-text-xs"
        style={{
          borderLeft: `2px solid ${getCourseColor(teacherName)}`,
          backgroundColor: `${getCourseColor(teacherName)}20`,
        }}
        onClick={(e) => {
          e.stopPropagation();
          if (onCourseClick) {
            onCourseClick(course);
          }
        }}
      >
        <div className="tw-flex tw-items-center tw-justify-between">
          <span className="tw-font-semibold tw-truncate tw-mr-1">{teacherName}</span>
          <span className="tw-truncate">{course.students.map(s => s.studentName).join(', ')}</span>
          <span>{startTime}</span>
        </div>
      </div>
    );
  };

  const renderDayColumn = (day: Date) => {
    const dayStart = new Date(day.getFullYear(), day.getMonth(), day.getDate(), 7);
    const dayEnd = new Date(day.getFullYear(), day.getMonth(), day.getDate(), 23, 59, 59, 999);
    const dayCourses = courses.filter(
      (course) => course.startTime >= dayStart && course.startTime <= dayEnd
    );

    const hours = Array.from({ length: 17 }, (_, i) => i + 7);
    const isToday = day.toDateString() === new Date().toDateString();

    return (
      <div 
        className="tw-w-64 tw-flex-shrink-0 tw-border-r tw-border-gray-300"
        data-date={day.toISOString().split('T')[0]}
      >
        <div className={`tw-sticky tw-top-0 tw-h-16 tw-bg-white tw-z-10 tw-border-b tw-border-gray-200 tw-text-center tw-font-semibold tw-shadow-sm tw-flex tw-flex-col tw-justify-center ${isToday ? 'tw-bg-blue-100' : ''}`}>
          <div className="tw-text-sm tw-text-gray-500">
            {day.toLocaleDateString('zh-CN', { weekday: 'short' })}
          </div>
          <div className={isToday ? 'tw-text-blue-600 tw-font-bold' : ''}>
            {day.toLocaleDateString('zh-CN', { month: 'numeric', day: 'numeric' })}
          </div>
        </div>
        <div className="tw-relative">
          {hours.map((hour) => {
            const hourStart = new Date(day.getFullYear(), day.getMonth(), day.getDate(), hour);
            const hourEnd = new Date(day.getFullYear(), day.getMonth(), day.getDate(), hour + 1);
            const hourCourses = dayCourses.filter((course) => 
              course.startTime >= hourStart && course.startTime < hourEnd
            );
            const displayedCourses = hourCourses.slice(0, 5);
            const hiddenCount = hourCourses.length - displayedCourses.length;

            return (
              <div
                key={hour}
                className="tw-relative tw-border-b tw-border-gray-200"
                style={{ height: '128px' }}
                onClick={() => onTimeSlotClick(hourStart, hourCourses)}
              >
                <div className="tw-absolute tw-inset-0 tw-overflow-y-auto">
                  {displayedCourses.map((course) => renderCourseCard(course))}
                </div>
                {hiddenCount > 0 && (
                  <button
                    className="tw-absolute tw-bottom-0 tw-right-0 tw-bg-gray-200 tw-text-gray-600 tw-rounded-full tw-p-1 tw-text-xs tw-flex tw-items-center"
                    onClick={(e) => {
                      e.stopPropagation();
                      onTimeSlotClick(hourStart, hourCourses);
                    }}
                  >
                    <ChevronDown size={12} className="tw-mr-1" />
                    还有 {hiddenCount} 个
                  </button>
                )}
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  const renderCalendar = () => {
    let days: Date[] = [];
    const startDate = new Date(currentDate);

    if (viewType === 'day') {
      days = [startDate];
    } else if (viewType === 'week') {
      startDate.setDate(startDate.getDate() - startDate.getDay());
      days = Array.from({ length: 7 }, (_, i) => {
        const day = new Date(startDate);
        day.setDate(day.getDate() + i);
        return day;
      });
    } else if (viewType === 'month') {
      startDate.setDate(1);
      const daysInMonth = new Date(startDate.getFullYear(), startDate.getMonth() + 1, 0).getDate();
      days = Array.from({ length: daysInMonth }, (_, i) => {
        const day = new Date(startDate);
        day.setDate(day.getDate() + i);
        return day;
      });
    }

    return (
      <div className="tw-flex tw-h-full" ref={calendarRef}>
        {renderTimeColumn()}
        <div className={`tw-flex tw-flex-1 ${viewType !== 'day' ? 'tw-overflow-x-auto' : ''}`}>
          {days.map((day, index) => (
            <div key={index} className={viewType === 'day' ? 'tw-flex-1' : ''}>
              {renderDayColumn(day)}
            </div>
          ))}
        </div>
      </div>
    );
  };

  const renderTimeColumn = () => {
    const hours = Array.from({ length: 17 }, (_, i) => i + 7);
    return (
      <div className="tw-sticky tw-left-0 tw-bg-white tw-z-20 tw-w-20 tw-shadow-md tw-flex-shrink-0">
        <div className="tw-h-16 tw-border-b tw-border-r tw-border-gray-200"></div>
        {hours.map((hour) => (
          <div key={hour} className="tw-h-32 tw-border-b tw-border-r tw-border-gray-200 tw-pr-2 tw-text-sm tw-font-medium tw-text-gray-700 tw-bg-gray-50 tw-flex tw-items-center tw-justify-end">
            {`${hour.toString().padStart(2, '0')}:00`}
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="tw-h-full tw-overflow-hidden">
      <div className="tw-sticky tw-top-0 tw-z-30 tw-bg-white">
        {renderCalendar()}
      </div>
    </div>
  );
};

const getCourseColor = (teacherName: string) => {
  const colors = [
    '#FF6B6B', '#4ECDC4', '#45B7D1', '#FFA07A', '#98D8C8',
    '#F06292', '#AED581', '#7986CB', '#4DB6AC', '#DCE775'
  ];
  const index = teacherName.charCodeAt(0) % colors.length;
  return colors[index];
};

export default CalendarBody;