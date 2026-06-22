type ToggleSwitchProps = {
  label: string;
  value: boolean;
  onChange: (value: boolean) => void;
  disabled?: boolean;
};

export default function ToggleSwitch({ label, value, onChange, disabled = false }: ToggleSwitchProps){
  return (
    <div className={`flex items-center gap-2 ${disabled ? "opacity-40 cursor-not-allowed" : ""}`}>
      <span className="text-xs font-medium">{label}</span>
      <button
        type="button"
        disabled={disabled}
        onClick={() => !disabled && onChange(!value)}
        className={`w-9 h-5 flex items-center rounded-full px-[2px] transition-all duration-300 ${
          value ? "bg-[rgb(var(--global-button-bg))]" : "bg-gray-300 dark:bg-gray-600"
        } ${disabled ? "cursor-not-allowed" : "cursor-pointer"}`}
      >
        <div className={`w-3 h-3 bg-white rounded-full shadow transition-all duration-300 ${value ? "translate-x-4" : "translate-x-0"}`} />
      </button>
      <span className="text-xs opacity-60">{value ? "Yes" : "No"}</span>
    </div>
  );
};