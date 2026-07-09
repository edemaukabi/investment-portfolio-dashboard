import type { KeyboardEventHandler } from 'react';
import { SearchIcon, CloseIcon } from './icons';
import styles from './SearchInput.module.css';

interface SearchInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
  autoFocus?: boolean;
  onFocus?: () => void;
  onKeyDown?: KeyboardEventHandler<HTMLInputElement>;
}

export default function SearchInput({
  value,
  onChange,
  placeholder,
  autoFocus,
  onFocus,
  onKeyDown,
}: SearchInputProps) {
  return (
    <div className={styles.wrap}>
      <SearchIcon size={16} className={styles.icon} />
      <input
        type="search"
        className={styles.input}
        placeholder={placeholder}
        value={value}
        autoFocus={autoFocus}
        onChange={(event) => onChange(event.target.value)}
        onFocus={onFocus}
        onKeyDown={onKeyDown}
        aria-label={placeholder}
      />
      {value && (
        <button
          type="button"
          className={styles.clear}
          onClick={() => onChange('')}
          aria-label="Clear search"
        >
          <CloseIcon size={14} />
        </button>
      )}
    </div>
  );
}
