import React, { forwardRef, type ForwardedRef } from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import {
  Input,
  InputGroup,
  type InputProps,
  InputRightElement,
} from "@chakra-ui/react";
import { FiCalendar, FiClock } from "react-icons/fi";

type DateTimeMode = "date" | "time" | "datetime";
const dateTimeModeLabel: Record<DateTimeMode, string> = {
  date: "Date",
  time: "Time",
  datetime: "Date & Time",
};

type DateTimePickerProps = {
  mode: DateTimeMode;
  value: Date | null;
  onChange: (date: Date | null) => void;
};

const dateTimeModeProps = {
  date: {
    dateFormat: "dd.MM.yyyy",
  },
  time: {
    showTimeSelect: true,
    showTimeSelectOnly: true,
    timeIntervals: 1,
    timeCaption: "Time",
    dateFormat: "H:mm",
    timeFormat: "H:mm",
  },
  datetime: {
    timeFormat: "H:mm",
    dateFormat: "dd.MM.yyyy, H:mm",
    timeIntervals: 1,
    showTimeSelect: true,
  },
} as const;

export const DateTimePicker = ({
  value,
  onChange,
  mode,
}: DateTimePickerProps) => (
  <DatePicker
    selected={value}
    onChange={onChange}
    customInput={<ChakraInput value={value?.toISOString() ?? ""} mode={mode} />}
    {...dateTimeModeProps[mode]}
  />
);

type ChakraInputProps = InputProps & {
  mode: DateTimeMode;
  value: string | null;
};

// eslint-disable-next-line react/display-name
const ChakraInput = forwardRef(
  (props: ChakraInputProps, ref: ForwardedRef<HTMLInputElement>) => (
    <InputGroup>
      <Input
        {...props}
        ref={ref}
        value={props.value}
        placeholder={`Select ${dateTimeModeLabel[props.mode]}`}
        wfull
      />
      <InputRightElement>
        {props.mode === "time" ? <FiClock /> : <FiCalendar />}
      </InputRightElement>
    </InputGroup>
  )
);
