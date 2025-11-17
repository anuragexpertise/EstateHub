'use client';
import { useState, useEffect } from 'react';

export function DateTimeDisplay() {
    const [currentDateTime, setCurrentDateTime] = useState(new Date());

    useEffect(() => {
        const timer = setInterval(() => {
            setCurrentDateTime(new Date());
        }, 1000);

        return () => {
            clearInterval(timer);
        };
    }, []);

    const dateFormatter = new Intl.DateTimeFormat('en-GB', {
        year: 'numeric',
        month: 'short',
        day: '2-digit',
    });

    const timeFormatter = new Intl.DateTimeFormat('en-US', {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: true,
    });

    return (
        <div className="hidden sm:flex items-center gap-2 text-sm text-muted-foreground">
            <span>{dateFormatter.format(currentDateTime).replace(/ /g, '-')}</span>
            <span>|</span>
            <span>{timeFormatter.format(currentDateTime)}</span>
        </div>
    );
}
