import './ReportButton.css';

interface ReportButtonProps {
  onClick: () => void;
}

export function ReportButton({ onClick }: ReportButtonProps) {
  return (
    <button className="report-button" type="button" onClick={onClick}>
      🚦 Reportar semáforo
    </button>
  );
}