import { useMemo } from "react";
import { CountdownCircleTimer } from "react-countdown-circle-timer";

function formatMMSS(t){const m=String(Math.floor(t/60)).padStart(2,"0");const s=String(t%60).padStart(2,"0");return `${m}:${s}`;}

export default function RestTimer({
                                      seconds = 90,
                                      playing = false,
                                      onComplete,
                                      resetKey,
                                      size = 80,
                                      strokeWidth = 6,
                                  }) {
    const colorsTime = useMemo(() => {
        const t1=seconds, t2=Math.max(1,Math.ceil(seconds*0.5)), t3=Math.max(1,Math.ceil(seconds*0.2));
        return [t1,t2,t3,0];
    }, [seconds]);

    return (
        <div className="inline-flex flex-col items-center">
            <CountdownCircleTimer
                key={resetKey}
                isPlaying={playing}
                duration={seconds}
                size={size}
                strokeWidth={strokeWidth}
                colors={["#2563EB","#F59E0B","#DC2626","#DC2626"]}
                colorsTime={colorsTime}
                onComplete={() => { onComplete?.(); return { shouldRepeat:false }; }}
            >
                {({ remainingTime }) => (
                    <span className="font-mono text-base md:text-lg">{formatMMSS(remainingTime)}</span>
                )}
            </CountdownCircleTimer>
            <div className="mt-1 text-[10px] text-gray-500">Recupero</div>
        </div>
    );
}
