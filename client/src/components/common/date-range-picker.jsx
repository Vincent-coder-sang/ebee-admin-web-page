/* eslint-disable react/prop-types */
/* eslint-disable no-unused-vars */
// src/components/common/date-range-picker.jsx
import React, { useState } from 'react';
import { Calendar, ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { format } from 'date-fns';

const DateRangePicker = ({ dateRange, onChange }) => {
  const [isOpen, setIsOpen] = useState(false);
  
  const presetRanges = [
    { 
      label: 'Today', 
      getRange: () => ({
        start: new Date(new Date().setHours(0, 0, 0, 0)),
        end: new Date(new Date().setHours(23, 59, 59, 999))
      })
    },
    { 
      label: 'Yesterday', 
      getRange: () => {
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        return {
          start: new Date(yesterday.setHours(0, 0, 0, 0)),
          end: new Date(yesterday.setHours(23, 59, 59, 999))
        };
      }
    },
    { 
      label: 'Last 7 Days', 
      getRange: () => ({
        start: new Date(new Date().setDate(new Date().getDate() - 7)),
        end: new Date()
      })
    },
    { 
      label: 'Last 30 Days', 
      getRange: () => ({
        start: new Date(new Date().setDate(new Date().getDate() - 30)),
        end: new Date()
      })
    },
    { 
      label: 'This Month', 
      getRange: () => {
        const now = new Date();
        return {
          start: new Date(now.getFullYear(), now.getMonth(), 1),
          end: new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999)
        };
      }
    }
  ];

  const handlePresetSelect = (preset) => {
    const range = preset.getRange();
    onChange(range);
    setIsOpen(false);
  };

  const formatDate = (date) => {
    if (!date) return 'Select date';
    return format(date, 'MMM dd, yyyy');
  };

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button variant="outline" className="w-full justify-start text-left font-normal">
          <Calendar className="mr-2 h-4 w-4" />
          {dateRange?.start ? (
            <>
              {formatDate(dateRange.start)} - {formatDate(dateRange.end)}
            </>
          ) : (
            <span>Select date range</span>
          )}
          <ChevronDown className="ml-auto h-4 w-4 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
        <div className="p-4">
          <div className="space-y-2">
            <h4 className="font-medium text-sm">Quick Select</h4>
            {presetRanges.map((preset) => (
              <Button
                key={preset.label}
                variant="ghost"
                className="w-full justify-start text-sm"
                onClick={() => handlePresetSelect(preset)}
              >
                {preset.label}
              </Button>
            ))}
          </div>
          
          <div className="mt-4">
            <h4 className="font-medium text-sm mb-2">Custom Range</h4>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-xs text-gray-500">From</label>
                <input
                  type="date"
                  className="w-full border rounded p-1 text-sm"
                  value={dateRange?.start ? dateRange.start.toISOString().split('T')[0] : ''}
                  onChange={(e) => {
                    const newStart = e.target.value ? new Date(e.target.value) : null;
                    onChange({ ...dateRange, start: newStart });
                  }}
                />
              </div>
              <div>
                <label className="text-xs text-gray-500">To</label>
                <input
                  type="date"
                  className="w-full border rounded p-1 text-sm"
                  value={dateRange?.end ? dateRange.end.toISOString().split('T')[0] : ''}
                  onChange={(e) => {
                    const newEnd = e.target.value ? new Date(e.target.value) : null;
                    onChange({ ...dateRange, end: newEnd });
                  }}
                />
              </div>
            </div>
            <Button
              variant="outline"
              size="sm"
              className="w-full mt-2"
              onClick={() => setIsOpen(false)}
            >
              Apply
            </Button>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
};

// Fallback simple version without Popover
export const SimpleDateRangePicker = ({ dateRange, onChange }) => {
  return (
    <div className="flex items-center gap-2">
      <input
        type="date"
        className="border rounded p-2 text-sm"
        value={dateRange?.start ? dateRange.start.toISOString().split('T')[0] : ''}
        onChange={(e) => {
          const newStart = e.target.value ? new Date(e.target.value) : null;
          onChange({ ...dateRange, start: newStart });
        }}
      />
      <span className="text-gray-500">to</span>
      <input
        type="date"
        className="border rounded p-2 text-sm"
        value={dateRange?.end ? dateRange.end.toISOString().split('T')[0] : ''}
        onChange={(e) => {
          const newEnd = e.target.value ? new Date(e.target.value) : null;
          onChange({ ...dateRange, end: newEnd });
        }}
      />
    </div>
  );
};

export default DateRangePicker;