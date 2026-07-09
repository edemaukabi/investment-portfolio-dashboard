import styles from './FilterPills.module.css';

interface FilterPillsProps<T extends string> {
  options: readonly T[];
  value: T;
  onChange: (value: T) => void;
  label: string;
}

export default function FilterPills<T extends string>({
  options,
  value,
  onChange,
  label,
}: FilterPillsProps<T>) {
  return (
    <div className={styles.row} role="group" aria-label={label}>
      {options.map((option) => (
        <button
          key={option}
          type="button"
          className={option === value ? styles.pillActive : styles.pill}
          aria-pressed={option === value}
          onClick={() => onChange(option)}
        >
          {option}
        </button>
      ))}
    </div>
  );
}
