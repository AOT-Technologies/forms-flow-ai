import { useEffect, useRef } from 'react';

/**
 * Custom hook for auto-scrolling form builder container during drag events
 * @param {Object} containerRef - Ref to the scrollable container element
 * @param {boolean} isEnabled - Whether the auto-scroll should be active
 */
const useFormBuilderAutoScroll = (containerRef, isEnabled = true) => {
  const scrollIntervalRef = useRef(null);
  const isDraggingRef = useRef(false);
  const mouseDownTimeRef = useRef(0);

  useEffect(() => {
    const container = containerRef?.current;
    if (!container || !isEnabled) {
      return;
    }

    const SCROLL_THRESHOLD = 50; // Distance from edge in pixels to trigger scroll
    const SCROLL_SPEED = 10; // Pixels to scroll per interval
    const SCROLL_INTERVAL = 16; // ~60fps
    const DRAG_DELAY = 100; // Minimum time to consider it a drag (ms)

    const isDraggableElement = (target) => {
      return (
        target.closest('.formio-component') ||
        target.closest('.component-btn') ||
        target.closest('[draggable="true"]') ||
        target.closest('.builder-component') ||
        target.closest('.formio-drag') ||
        target.closest('.component-settings') ||
        target.closest('[data-component]') ||
        // Component palette elements (for dragging new components)
        target.closest('.formio-component-list') ||
        target.closest('.component-list-item') ||
        target.closest('.formio-builder-component') ||
        target.closest('[data-type]') ||
        target.closest('.btn-group') ||
        target.closest('.formio-component-button')
      );
    };

    const performAutoScroll = (e) => {
      if (!isDraggingRef.current || !container) return;

      const rect = container.getBoundingClientRect();
      const mouseX = e.clientX;
      const mouseY = e.clientY;

      // Only proceed if mouse is within or near the container
      if (
        mouseX < rect.left - SCROLL_THRESHOLD ||
        mouseX > rect.right + SCROLL_THRESHOLD ||
        mouseY < rect.top - SCROLL_THRESHOLD ||
        mouseY > rect.bottom + SCROLL_THRESHOLD
      ) {
        // Mouse is too far from container, stop scrolling
        if (scrollIntervalRef.current) {
          clearInterval(scrollIntervalRef.current);
          scrollIntervalRef.current = null;
        }
        return;
      }

      // Calculate distance from edges
      const distanceFromLeft = mouseX - rect.left;
      const distanceFromRight = rect.right - mouseX;
      const distanceFromTop = mouseY - rect.top;
      const distanceFromBottom = rect.bottom - mouseY;

      // Clear existing interval
      if (scrollIntervalRef.current) {
        clearInterval(scrollIntervalRef.current);
        scrollIntervalRef.current = null;
      }

      // Determine scroll direction and start scrolling if near edges
      let scrollX = 0;
      let scrollY = 0;

      if (distanceFromLeft < SCROLL_THRESHOLD && container.scrollLeft > 0) {
        // Increase scroll speed the closer to the edge
        const speedMultiplier = 1 - (distanceFromLeft / SCROLL_THRESHOLD);
        scrollX = -SCROLL_SPEED * speedMultiplier;
      } else if (
        distanceFromRight < SCROLL_THRESHOLD &&
        container.scrollLeft < container.scrollWidth - container.clientWidth
      ) {
        const speedMultiplier = 1 - (distanceFromRight / SCROLL_THRESHOLD);
        scrollX = SCROLL_SPEED * speedMultiplier;
      }

      if (distanceFromTop < SCROLL_THRESHOLD && container.scrollTop > 0) {
        const speedMultiplier = 1 - (distanceFromTop / SCROLL_THRESHOLD);
        scrollY = -SCROLL_SPEED * speedMultiplier;
      } else if (
        distanceFromBottom < SCROLL_THRESHOLD &&
        container.scrollTop < container.scrollHeight - container.clientHeight
      ) {
        const speedMultiplier = 1 - (distanceFromBottom / SCROLL_THRESHOLD);
        scrollY = SCROLL_SPEED * speedMultiplier;
      }

      // Start scrolling if needed
      if (scrollX !== 0 || scrollY !== 0) {
        scrollIntervalRef.current = setInterval(() => {
          if (container && isDraggingRef.current) {
            container.scrollBy({
              left: scrollX,
              top: scrollY,
              behavior: 'auto',
            });
          } else if (scrollIntervalRef.current) {
            clearInterval(scrollIntervalRef.current);
            scrollIntervalRef.current = null;
          }
        }, SCROLL_INTERVAL);
      }
    };

    const handleMouseDown = (e) => {
      // Check if the mousedown is on a draggable element
      if (isDraggableElement(e.target)) {
        mouseDownTimeRef.current = Date.now();
        isDraggingRef.current = false; // Will be set to true after delay
      }
    };

    const handleMouseMove = (e) => {
      // Check if we should consider this a drag (mouse was held down for a bit)
      if (
        mouseDownTimeRef.current > 0 &&
        Date.now() - mouseDownTimeRef.current > DRAG_DELAY
      ) {
        isDraggingRef.current = true;
      }

      performAutoScroll(e);
    };

    const handleMouseUp = () => {
      isDraggingRef.current = false;
      mouseDownTimeRef.current = 0;
      if (scrollIntervalRef.current) {
        clearInterval(scrollIntervalRef.current);
        scrollIntervalRef.current = null;
      }
    };

    // Listen for drag events at document level to catch drags from component palette
    const handleDragStart = (e) => {
      // Check if drag is starting from a component palette or form builder element
      if (isDraggableElement(e.target)) {
        isDraggingRef.current = true;
      }
    };

    const handleDragEnd = () => {
      isDraggingRef.current = false;
      mouseDownTimeRef.current = 0;
      if (scrollIntervalRef.current) {
        clearInterval(scrollIntervalRef.current);
        scrollIntervalRef.current = null;
      }
    };

    const handleDrag = (e) => {
      // Trigger auto-scroll during drag (works for both existing components and new components from palette)
      performAutoScroll(e);
    };

    // Add event listeners
    // Listen on document level for drag events to catch drags from component palette
    document.addEventListener('mousedown', handleMouseDown);
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
    document.addEventListener('dragstart', handleDragStart);
    document.addEventListener('drag', handleDrag);
    document.addEventListener('dragend', handleDragEnd);

    // Cleanup
    return () => {
      document.removeEventListener('mousedown', handleMouseDown);
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
      document.removeEventListener('dragstart', handleDragStart);
      document.removeEventListener('drag', handleDrag);
      document.removeEventListener('dragend', handleDragEnd);
      if (scrollIntervalRef.current) {
        clearInterval(scrollIntervalRef.current);
        scrollIntervalRef.current = null;
      }
    };
  }, [containerRef, isEnabled]);
};

export default useFormBuilderAutoScroll;

