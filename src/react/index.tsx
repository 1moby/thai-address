import {
  type ChangeEvent,
  type InputHTMLAttributes,
  useEffect,
  useId,
  useMemo,
  useState
} from "react";
import { createThaiAddressIndex } from "../addressIndex.js";
import { loadThaiAddressData } from "../dataLoader.js";
import type {
  ThaiAddressData,
  ThaiAddressIndex,
  ThaiAddressSuggestion
} from "../types.js";

export interface UseThaiAddressOptions {
  data?: ThaiAddressData;
  dataUrl?: string;
}

export interface UseThaiAddressResult {
  index?: ThaiAddressIndex;
  loading: boolean;
  error?: Error;
}

export function useThaiAddress(options: UseThaiAddressOptions = {}): UseThaiAddressResult {
  const [loadedData, setLoadedData] = useState<ThaiAddressData | undefined>(options.data);
  const [loading, setLoading] = useState(!options.data && Boolean(options.dataUrl));
  const [error, setError] = useState<Error | undefined>();

  useEffect(() => {
    let cancelled = false;

    if (options.data) {
      setLoadedData(options.data);
      setLoading(false);
      setError(undefined);
      return;
    }

    if (!options.dataUrl) {
      setLoading(false);
      return;
    }

    setLoading(true);
    loadThaiAddressData(options.dataUrl)
      .then((data) => {
        if (!cancelled) {
          setLoadedData(data);
          setError(undefined);
        }
      })
      .catch((cause: unknown) => {
        if (!cancelled) {
          setError(cause instanceof Error ? cause : new Error(String(cause)));
        }
      })
      .finally(() => {
        if (!cancelled) {
          setLoading(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [options.data, options.dataUrl]);

  const index = useMemo(() => (loadedData ? createThaiAddressIndex(loadedData) : undefined), [loadedData]);
  return { index, loading, error };
}

export interface ThaiAddressAutocompleteProps
  extends Omit<InputHTMLAttributes<HTMLInputElement>, "onSelect" | "value" | "defaultValue">,
    UseThaiAddressOptions {
  label?: string;
  limit?: number;
  minLength?: number;
  value?: string;
  defaultValue?: string;
  onValueChange?: (value: string) => void;
  onSelect?: (suggestion: ThaiAddressSuggestion) => void;
}

export function ThaiAddressAutocomplete({
  data,
  dataUrl,
  label = "Thai address",
  limit = 8,
  minLength = 1,
  value,
  defaultValue = "",
  onValueChange,
  onSelect,
  className,
  ...inputProps
}: ThaiAddressAutocompleteProps) {
  const generatedId = useId();
  const inputId = inputProps.id ?? `thai-address-${generatedId}`;
  const listId = `${inputId}-listbox`;
  const [internalValue, setInternalValue] = useState(defaultValue);
  const currentValue = value ?? internalValue;
  const [open, setOpen] = useState(false);
  const { index, loading } = useThaiAddress({ data, dataUrl });

  const suggestions = useMemo(() => {
    if (!index || currentValue.trim().length < minLength) {
      return [];
    }

    return index.search(currentValue, { limit });
  }, [currentValue, index, limit, minLength]);

  function setText(nextValue: string): void {
    if (value === undefined) {
      setInternalValue(nextValue);
    }
    onValueChange?.(nextValue);
  }

  function handleChange(event: ChangeEvent<HTMLInputElement>): void {
    setText(event.currentTarget.value);
    setOpen(true);
    inputProps.onChange?.(event);
  }

  function handleSelect(suggestion: ThaiAddressSuggestion): void {
    setText(suggestion.label);
    setOpen(false);
    onSelect?.(suggestion);
  }

  return (
    <div className={className ?? "thai-address-autocomplete"}>
      <label htmlFor={inputId}>{label}</label>
      <input
        {...inputProps}
        id={inputId}
        role="combobox"
        aria-autocomplete="list"
        aria-controls={listId}
        aria-expanded={open && suggestions.length > 0}
        autoComplete="off"
        value={currentValue}
        onBlur={() => window.setTimeout(() => setOpen(false), 120)}
        onChange={handleChange}
        onFocus={() => setOpen(true)}
      />
      {loading ? <div role="status">Loading address data...</div> : null}
      {open && suggestions.length > 0 ? (
        <div id={listId} role="listbox">
          {suggestions.map((suggestion) => (
            <button
              key={suggestion.code}
              type="button"
              role="option"
              aria-selected="false"
              onMouseDown={(event) => event.preventDefault()}
              onClick={() => handleSelect(suggestion)}
            >
              {suggestion.label}
            </button>
          ))}
        </div>
      ) : null}
    </div>
  );
}

export type { ThaiAddressSuggestion };
