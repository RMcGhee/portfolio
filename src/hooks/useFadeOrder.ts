import { useEffect, useState } from "react";

export function useFadeOrder (maxComponents: number) {
    const [fadeOrder, setFadeOrder] = useState(0);
    const [renderTimer, setRenderTimer] = useState<NodeJS.Timer|null>(null);

    useEffect(() => {
        const interval = setInterval(() => setFadeOrder(fadeOrder + 1), 350);
        setRenderTimer(interval);
  
        return () => clearInterval(interval);
    }, [fadeOrder]);
  
    useEffect(() => {
      if (fadeOrder > maxComponents && renderTimer !== null) {
        clearInterval(renderTimer);
      }
    }, [fadeOrder, renderTimer]);

    return [fadeOrder, ];
}