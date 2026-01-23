'use client';

import React from 'react';
import DatePicker, { registerLocale } from 'react-datepicker';
import { tr } from 'date-fns/locale';
import 'react-datepicker/dist/react-datepicker.css';
import { Input } from './input';

registerLocale('tr', tr);

interface DateTimePickerProps {
  selected: Date | null;
  onChange: (date: Date | null) => void;
  placeholderText?: string;
  minDate?: Date;
  maxDate?: Date;
  id?: string;
  disabled?: boolean;
  className?: string;
}

export function DateTimePicker({
  selected,
  onChange,
  placeholderText = 'Tarih ve saat seçin',
  minDate,
  maxDate,
  id,
  disabled = false,
  className,
}: DateTimePickerProps) {
  return (
    <DatePicker
      id={id}
      selected={selected}
      onChange={onChange}
      showTimeSelect
      timeFormat="HH:mm"
      timeIntervals={15}
      timeCaption="Saat"
      dateFormat="dd.MM.yyyy HH:mm"
      placeholderText={placeholderText}
      minDate={minDate}
      maxDate={maxDate}
      disabled={disabled}
      locale="tr"
      className={className}
      customInput={
        <Input className="w-full cursor-pointer" />
      }
      calendarStartDay={1}
      showPopperArrow={false}
      popperClassName="z-50"
      autoFocus={false}
      preventOpenOnFocus={true}
      shouldCloseOnSelect={true}
    />
  );
}
