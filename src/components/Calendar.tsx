import { useRef, useState } from 'react';
import style from './Calendar.module.scss';
import { useFocus } from '@/hooks/useFocus';

interface CalendarProps {
    minDate?(date: string | Date): void;
    maxDate?(date: string | Date): void;
    onDatePick?(date: Date): void;
    onBlur?(): void
}

export function Calendar(props: CalendarProps) {

    const datenow = new Date();
    const [year, setYear] = useState(datenow.getFullYear());
    const [month, setMonth] = useState(datenow.getMonth());

    const [monthStart, setMonthStart] = useState(new Date(datenow.getFullYear(), datenow.getMonth(), 1));

    const offset = clamp(monthStart.getDay() - 1, 7);
    const daysInLastMonth = getDaysInMonth(clamp(monthStart.getMonth(), 12), monthStart.getFullYear());
    const daysInMonth = getDaysInMonth(monthStart.getMonth() + 1, monthStart.getFullYear());

    const calendarRef = useRef<HTMLDivElement>(null);

    useFocus(calendarRef, {
        autoFocus: true,
        blur: props.onBlur
    });

    const daysTable = [0, 1, 2, 3, 4, 5].map(index => {
        const dayIndex = index * 7;
        const week: number[] = [];

        for (let i = 0; i < 7; i++) {
            let day = dayIndex + i - offset;
            if (day < 0) {
                day = daysInLastMonth + day + 1;
            } else {
                day++;

                if (day > daysInMonth)
                    day = day - daysInMonth;
            }

            week.push(day);
        }

        return week;
    });

    let currOffset = 0;

    function setMonthClamp(newMonth: number) {
        const nextMonth = clamp(newMonth, 11, 0);
        let nextYear = newMonth > 11 ? year + 1 : newMonth < 0 ? year - 1 : year;

        setMonth(nextMonth);
        setYear(nextYear);

        setMonthStart(new Date(nextYear, nextMonth, 1));
    }

    function handlePickDate(month: number, day: number) {

    }

    return <div className={style.calendar} ref={calendarRef}>

        <div className={style.navigation}>
            <button onClick={() => setMonthClamp(month - 1)}>{'<'}</button>
            <p>{getMonthName(month)} {year}.</p>
            <button onClick={() => setMonthClamp(month + 1)}>{'>'}</button>
        </div>

        <div className={style.container}>
            {daysTable.map((week, ind) => {
                return <div key={ind} className={style.week}>
                    {week.map(day => {
                        const dayMonth = currOffset < offset ? (clamp(month - 1, 11, 0)) : currOffset + 1 > daysInMonth + offset ? (clamp(month + 1, 11, 0)) : month;
                        const dayOffset = currOffset;

                        function handleClick() {
                            const PREVIOUS_MONTH = dayOffset < offset;
                            const NEXT_MONTH = dayOffset + 1 > daysInMonth + offset;

                            const dayYear = PREVIOUS_MONTH ? month - 1 < 0 ? year - 1 : year
                                : NEXT_MONTH ? month + 1 > 11 ? year + 1 : year
                                    : year;

                            const date = new Date(dayYear, dayMonth, day);
                            props.onDatePick && props.onDatePick(date);
                        }

                        currOffset++;
                        return <div key={currOffset} onClick={handleClick} className={`${style.day} ${dayMonth !== month ? style.otherMonth : ''}`}>{day}</div>;
                    })}
                </div>
            })}
        </div>
    </div>

}

function clamp(num: number, limit: number, min: number = 1) {
    while (num < min)
        num += limit + 1;

    while (num > limit) {
        num -= limit + 1;
    }

    return num;
}

const MONTH_NAMES = [
    "January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"
];

const DAY_NAMES = [
    "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"
]

function getMonthName(month: number) {
    return MONTH_NAMES[month];
}

function getDayName(day: number) {
    return DAY_NAMES[day];
}

function getDaysInMonth(month: number, year: number) {
    const date = new Date(year, month, 0);
    return date.getDate();
}