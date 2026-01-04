"use client";

import { useState, useRef, useEffect } from "react";
import { Button } from "./button";
import { Calendar, Clock, ChevronLeft, ChevronRight, X } from "lucide-react";
import { cn } from "@/lib/utils";

interface DateTimePickerProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
}

const MONTHS = [
  "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
  "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"
];

const DAYS = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];

export function DateTimePicker({ value, onChange, placeholder = "Selecionar data e hora", className }: DateTimePickerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [currentMonth, setCurrentMonth] = useState(new Date().getMonth());
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear());
  const [selectedDate, setSelectedDate] = useState<Date | null>(value ? new Date(value) : null);
  const [hours, setHours] = useState(selectedDate?.getHours() || 12);
  const [minutes, setMinutes] = useState(selectedDate?.getMinutes() || 0);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (value) {
      const date = new Date(value);
      setSelectedDate(date);
      setCurrentMonth(date.getMonth());
      setCurrentYear(date.getFullYear());
      setHours(date.getHours());
      setMinutes(date.getMinutes());
    }
  }, [value]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const getDaysInMonth = (month: number, year: number) => {
    return new Date(year, month + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (month: number, year: number) => {
    return new Date(year, month, 1).getDay();
  };

  const handleDateSelect = (day: number) => {
    const newDate = new Date(currentYear, currentMonth, day, hours, minutes);
    setSelectedDate(newDate);
  };

  const handleConfirm = () => {
    if (selectedDate) {
      const finalDate = new Date(
        selectedDate.getFullYear(),
        selectedDate.getMonth(),
        selectedDate.getDate(),
        hours,
        minutes
      );
      onChange(finalDate.toISOString().slice(0, 16));
    }
    setIsOpen(false);
  };

  const handleClear = () => {
    setSelectedDate(null);
    onChange("");
    setIsOpen(false);
  };

  const prevMonth = () => {
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear(currentYear - 1);
    } else {
      setCurrentMonth(currentMonth - 1);
    }
  };

  const nextMonth = () => {
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear(currentYear + 1);
    } else {
      setCurrentMonth(currentMonth + 1);
    }
  };

  const renderCalendar = () => {
    const daysInMonth = getDaysInMonth(currentMonth, currentYear);
    const firstDay = getFirstDayOfMonth(currentMonth, currentYear);
    const days = [];

    for (let i = 0; i < firstDay; i++) {
      days.push(<div key={`empty-${i}`} className="w-8 h-8" />);
    }

    for (let day = 1; day <= daysInMonth; day++) {
      const isSelected = selectedDate &&
        selectedDate.getDate() === day &&
        selectedDate.getMonth() === currentMonth &&
        selectedDate.getFullYear() === currentYear;

      const isToday = new Date().getDate() === day &&
        new Date().getMonth() === currentMonth &&
        new Date().getFullYear() === currentYear;

      days.push(
        <button
          key={day}
          type="button"
          onClick={() => handleDateSelect(day)}
          className={cn(
            "w-8 h-8 rounded-lg text-sm font-medium transition-all",
            isSelected
              ? "bg-emerald-500 text-white"
              : isToday
              ? "bg-zinc-700 text-emerald-400"
              : "text-zinc-300 hover:bg-zinc-700"
          )}
        >
          {day}
        </button>
      );
    }

    return days;
  };

  const formatDisplayValue = () => {
    if (!value) return "";
    const date = new Date(value);
    return date.toLocaleString("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit"
    });
  };

  return (
    <div ref={containerRef} className={cn("relative", className)}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          "w-full flex items-center justify-between px-3 py-2 rounded-md border transition-colors",
          "bg-zinc-800 border-zinc-700 text-left",
          "hover:border-zinc-600 focus:outline-none focus:ring-2 focus:ring-emerald-500/50",
          !value && "text-zinc-500"
        )}
      >
        <span className="flex items-center gap-2">
          <Calendar className="w-4 h-4 text-zinc-400" />
          {value ? formatDisplayValue() : placeholder}
        </span>
        {value && (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              handleClear();
            }}
            className="p-1 hover:bg-zinc-700 rounded"
          >
            <X className="w-4 h-4 text-zinc-400" />
          </button>
        )}
      </button>

      {isOpen && (
        <div className="absolute z-50 mt-2 p-4 bg-zinc-900 border border-zinc-700 rounded-xl shadow-xl min-w-[300px]">
          {/* Month/Year Navigation */}
          <div className="flex items-center justify-between mb-4">
            <button
              type="button"
              onClick={prevMonth}
              className="p-1 hover:bg-zinc-800 rounded-lg transition-colors"
            >
              <ChevronLeft className="w-5 h-5 text-zinc-400" />
            </button>
            <span className="font-semibold text-zinc-100">
              {MONTHS[currentMonth]} {currentYear}
            </span>
            <button
              type="button"
              onClick={nextMonth}
              className="p-1 hover:bg-zinc-800 rounded-lg transition-colors"
            >
              <ChevronRight className="w-5 h-5 text-zinc-400" />
            </button>
          </div>

          {/* Days Header */}
          <div className="grid grid-cols-7 gap-1 mb-2">
            {DAYS.map((day) => (
              <div key={day} className="w-8 h-8 flex items-center justify-center text-xs font-medium text-zinc-500">
                {day}
              </div>
            ))}
          </div>

          {/* Calendar Grid */}
          <div className="grid grid-cols-7 gap-1 mb-4">
            {renderCalendar()}
          </div>

          {/* Time Picker */}
          <div className="border-t border-zinc-700 pt-4 mb-4">
            <div className="flex items-center justify-center gap-2">
              <Clock className="w-4 h-4 text-zinc-400" />
              <div className="flex items-center gap-1">
                <select
                  value={hours}
                  onChange={(e) => setHours(parseInt(e.target.value))}
                  className="bg-zinc-800 border border-zinc-700 rounded-lg px-2 py-1.5 text-sm text-zinc-100 focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
                >
                  {Array.from({ length: 24 }, (_, i) => (
                    <option key={i} value={i}>
                      {i.toString().padStart(2, "0")}
                    </option>
                  ))}
                </select>
                <span className="text-zinc-400 font-bold">:</span>
                <select
                  value={minutes}
                  onChange={(e) => setMinutes(parseInt(e.target.value))}
                  className="bg-zinc-800 border border-zinc-700 rounded-lg px-2 py-1.5 text-sm text-zinc-100 focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
                >
                  {Array.from({ length: 60 }, (_, i) => (
                    <option key={i} value={i}>
                      {i.toString().padStart(2, "0")}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-2">
            <Button
              type="button"
              onClick={handleClear}
              variant="outline"
              size="sm"
              className="flex-1"
            >
              Limpar
            </Button>
            <Button
              type="button"
              onClick={handleConfirm}
              size="sm"
              className="flex-1 bg-emerald-600 hover:bg-emerald-700"
              disabled={!selectedDate}
            >
              Confirmar
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
