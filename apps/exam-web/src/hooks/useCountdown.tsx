import { useEffect, useMemo, useRef, useState } from "react";
import { differenceInMilliseconds, intervalToDuration } from "date-fns";

export const useCountdown = (targetDate: Date) => {
  const [currentTime, setCurrentTime] = useState(new Date());
  const requestRef = useRef<number>();

  const animate = () => {
    setCurrentTime(new Date());
    requestRef.current = requestAnimationFrame(animate);
  };

  useEffect(() => {
    const timeDifference = differenceInMilliseconds(targetDate, currentTime);

    if (timeDifference <= 0) {
      cancelAnimationFrame(requestRef.current as number);
      // Handle when the countdown reaches zero or goes negative
    } else {
      requestRef.current = requestAnimationFrame(animate);
    }

    return () => cancelAnimationFrame(requestRef.current as number);

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [targetDate, currentTime]);

  const timeDifference = useMemo(
    () => differenceInMilliseconds(targetDate, currentTime),
    [targetDate, currentTime],
  );

  const countdown = useMemo(() => {
    if (timeDifference > 0) {
      const duration = intervalToDuration({ start: 0, end: timeDifference });

      return `${
        duration.hours
          ? duration.hours < 10
            ? `0${duration.hours}`
            : duration.hours
          : "00"
      }:${
        duration.minutes
          ? duration.minutes < 10
            ? `0${duration.minutes}`
            : duration.minutes
          : "00"
      }:${
        duration.seconds
          ? duration.seconds < 10
            ? `0${duration.seconds}`
            : duration.seconds
          : "00"
      }`;
    } else {
      return "Selesai";
    }
  }, [timeDifference]);

  return { countdown, isEnded: timeDifference <= 1 };
};
