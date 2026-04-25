type BackButtonProps = {
  onClick: () => void;
};

export default function BackButton({ onClick }: BackButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="ui-floating-btn pointer-events-auto h-12 px-4 text-sm font-semibold"
    >
      Back
    </button>
  );
}
