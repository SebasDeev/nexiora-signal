import { Award, GripHorizontal, Star } from 'lucide-react';
import {
  useEffect,
  useRef,
  useState,
  type PointerEvent,
} from 'react';

import type { CitizenReportProgress } from '@nexiora/types';

interface CitizenProgressWidgetProps {
  progress: CitizenReportProgress;
}

interface FloatingPosition {
  left: number;
  top: number;
}

interface DragState {
  pointerId: number;
  offsetX: number;
  offsetY: number;
}

const SAFE_MARGIN = 12;

export function CitizenProgressWidget({
  progress,
}: CitizenProgressWidgetProps) {
  const cardRef = useRef<HTMLElement>(null);
  const dragRef = useRef<DragState | null>(null);
  const [position, setPosition] = useState<FloatingPosition | null>(null);
  const goal = progress.nextBadge ?? progress.currentBadge;
  const title = progress.currentBadge
    ? `Insignia ${progress.currentBadge.name}`
    : 'Camino a Nexoer';
  const detail = progress.nextBadge
    ? `${progress.reportCount} de ${progress.nextBadge.requiredReports} reportes`
    : 'Todas las insignias desbloqueadas';

  function constrainPosition(
    left: number,
    top: number,
  ): FloatingPosition | null {
    const card = cardRef.current;
    const map = card?.closest('.citizen-map-view');
    if (!card || !map) return null;

    const maxLeft = Math.max(SAFE_MARGIN, map.clientWidth - card.offsetWidth - SAFE_MARGIN);
    const maxTop = Math.max(SAFE_MARGIN, map.clientHeight - card.offsetHeight - SAFE_MARGIN);

    return {
      left: Math.min(maxLeft, Math.max(SAFE_MARGIN, left)),
      top: Math.min(maxTop, Math.max(SAFE_MARGIN, top)),
    };
  }

  function getPointerPosition(
    clientX: number,
    clientY: number,
    drag: DragState,
  ): FloatingPosition | null {
    const map = cardRef.current?.closest('.citizen-map-view');
    if (!map) return null;

    const mapRect = map.getBoundingClientRect();
    return constrainPosition(
      clientX - mapRect.left - drag.offsetX,
      clientY - mapRect.top - drag.offsetY,
    );
  }

  function startDrag(event: PointerEvent<HTMLElement>) {
    if (event.pointerType === 'mouse' && event.button !== 0) return;

    const card = cardRef.current;
    if (!card) return;

    const cardRect = card.getBoundingClientRect();
    dragRef.current = {
      pointerId: event.pointerId,
      offsetX: event.clientX - cardRect.left,
      offsetY: event.clientY - cardRect.top,
    };

    event.currentTarget.setPointerCapture(event.pointerId);
    event.preventDefault();
  }

  function moveDrag(event: PointerEvent<HTMLElement>) {
    const drag = dragRef.current;
    if (!drag || drag.pointerId !== event.pointerId) return;

    const nextPosition = getPointerPosition(event.clientX, event.clientY, drag);
    if (nextPosition) setPosition(nextPosition);
  }

  function stopDrag(event: PointerEvent<HTMLElement>) {
    if (dragRef.current?.pointerId !== event.pointerId) return;

    dragRef.current = null;
    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }
  }

  useEffect(() => {
    function keepWidgetInView() {
      if (!position) return;
      const nextPosition = constrainPosition(position.left, position.top);

      if (nextPosition) setPosition(nextPosition);
    }

    window.addEventListener('resize', keepWidgetInView);
    return () => window.removeEventListener('resize', keepWidgetInView);
  }, [position]);

  return (
    <aside
      ref={cardRef}
      className="citizen-progress-card"
      aria-label="Progreso ciudadano"
      style={position ? { left: position.left, top: position.top, right: 'auto' } : undefined}
      onPointerMove={moveDrag}
      onPointerUp={stopDrag}
      onPointerCancel={stopDrag}
    >
      <div
        className="citizen-progress-heading citizen-progress-drag-handle"
        onPointerDown={startDrag}
        aria-label="Mantén presionado y arrastra para mover el progreso ciudadano"
      >
        <span className="citizen-progress-star"><Star size={15} fill="currentColor" /></span>
        <div>
          <p>Progreso ciudadano</p>
          <strong>{title}</strong>
        </div>
        <GripHorizontal className="citizen-progress-grip" size={17} aria-hidden="true" />
      </div>

      <div className="citizen-progress-total">
        <span>{progress.stars} estrellas</span>
        {goal && <Award size={16} aria-hidden="true" />}
      </div>

      <div
        className="citizen-progress-track"
        role="progressbar"
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={progress.progressToNext}
        aria-label={detail}
      >
        <span style={{ width: `${progress.progressToNext}%` }} />
      </div>

      <p className="citizen-progress-detail">{detail}</p>
    </aside>
  );
}
