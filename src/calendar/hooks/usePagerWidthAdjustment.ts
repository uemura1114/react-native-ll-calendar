import { useEffect, useRef } from 'react';
import type { FlatList } from 'react-native';

const ADJUSTMENT_SETTLE_MS = 100;

/**
 * A paging FlatList keeps its pixel content offset when the window width
 * changes (rotation, split view, resizable desktop windows), so the panel that
 * was visible ends up partially scrolled out. This realigns the offset to the
 * panel that was active before the change.
 *
 * The realignment can make the list emit `onMomentumScrollEnd` with an offset
 * that no longer matches the new width, which would report a wrong date.
 * `isAdjustingRef` lets the caller skip those events; it is released shortly
 * after the adjustment so normal swipes keep working.
 */
export function usePagerWidthAdjustment<ItemT>(
  width: number,
  initialIndex: number
) {
  const listRef = useRef<FlatList<ItemT>>(null);
  const activeIndexRef = useRef(initialIndex);
  const isAdjustingRef = useRef(false);
  const previousWidthRef = useRef(width);

  useEffect(() => {
    if (previousWidthRef.current === width) return;
    previousWidthRef.current = width;

    if (!listRef.current) return;

    isAdjustingRef.current = true;
    listRef.current.scrollToOffset({
      offset: activeIndexRef.current * width,
      animated: false,
    });

    const timer = setTimeout(() => {
      isAdjustingRef.current = false;
    }, ADJUSTMENT_SETTLE_MS);

    return () => clearTimeout(timer);
  }, [width]);

  return { listRef, activeIndexRef, isAdjustingRef };
}
