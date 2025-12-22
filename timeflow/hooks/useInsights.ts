import { useMemo } from 'react';
import { Session } from './use-sessions';

export const useInsights = (sessions: Session[]) => {
    return useMemo(() => {
        if (!sessions.length) return null;

        const now = new Date();
        const currentMonth = now.getMonth();
        const currentYear = now.getFullYear();

        // 1. Фільтруємо сесії за цей місяць
        const thisMonthSessions = sessions.filter(s => {
            const d = new Date(s.startTime);
            return d.getMonth() === currentMonth && d.getFullYear() === currentYear;
        });

        if (thisMonthSessions.length === 0) return null;

        // 2. Рахуємо загальний дохід за місяць
        const totalEarned = thisMonthSessions.reduce((acc, s) => {
             return acc + (s.elapsedTime / 1000 / 3600) * parseFloat(s.rate);
        }, 0);

        // 3. ПРОГНОЗ (Forecast)
        const daysPassed = now.getDate();
        const lastDayOfMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
        
        // Середній заробіток в день (враховуючи тільки дні, що пройшли)
        const dailyAverage = totalEarned / daysPassed;
        const projectedTotal = dailyAverage * lastDayOfMonth;

        // 4. НАЙКРАЩИЙ ДЕНЬ ТИЖНЯ
        const earningsByDate: Record<string, number> = {};

        thisMonthSessions.forEach(s => {
            const dateKey = new Date(s.startTime).toDateString();
            const earn = (s.elapsedTime / 1000 / 3600) * parseFloat(s.rate);

            if (!earningsByDate[dateKey]) {
                earningsByDate[dateKey] = 0;
            }
            earningsByDate[dateKey] += earn;
        });
        
        const bestDateKey = Object.keys(earningsByDate).reduce((a, b) => 
            earningsByDate[a] > earningsByDate[b] ? a : b
        , "");

        let formattedBestDay = "—";
        if (bestDateKey) {
            const dateObj = new Date(bestDateKey);
            const formatter = new Intl.DateTimeFormat('en-US', { 
                weekday: 'short', 
                month: 'short', 
                day: 'numeric' 
            });
            formattedBestDay = formatter.format(dateObj);
        }

        // 5. WORK PERSONA (Ритм роботи)
        const dayParts = { morning: 0, afternoon: 0, evening: 0, night: 0 };
        
        thisMonthSessions.forEach(s => {
            const hour = new Date(s.startTime).getHours();
            if (hour >= 5 && hour < 12) dayParts.morning++;
            else if (hour >= 12 && hour < 17) dayParts.afternoon++;
            else if (hour >= 17 && hour < 23) dayParts.evening++;
            else dayParts.night++;
        });

        const maxPart = Object.keys(dayParts).reduce((a, b) => dayParts[a as keyof typeof dayParts] > dayParts[b as keyof typeof dayParts] ? a : b);
        
        let personaEmoji = '☀️';
        let personaTitle = 'Day Person';
        
        switch (maxPart) {
            case 'morning': personaTitle = 'Early Bird'; personaEmoji = '🐦'; break;
            case 'afternoon': personaTitle = 'Deep Worker'; personaEmoji = '☕'; break;
            case 'evening': personaTitle = 'Night Owl'; personaEmoji = '🦉'; break;
            case 'night': personaTitle = 'Vampire Coder'; personaEmoji = '🧛'; break;
        }

        // 6. Бонус: "Середня тривалість сесії"
        const totalDurationMs = thisMonthSessions.reduce((acc, s) => acc + s.elapsedTime, 0);
        const avgDurationMs = thisMonthSessions.length ? totalDurationMs / thisMonthSessions.length : 0;
        const avgHours = (avgDurationMs / 1000 / 3600).toFixed(1);
        
        return {
            projected: projectedTotal.toFixed(2),
            bestDay: formattedBestDay,
            dailyAverage: dailyAverage.toFixed(2),
            totalEarned,
            persona: { title: personaTitle, emoji: personaEmoji },
            avgSession: avgHours
        };

    }, [sessions]);
};