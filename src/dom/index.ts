import { createThaiAddressIndex } from "../addressIndex.js";
import { loadThaiAddressData } from "../dataLoader.js";
import type {
  ThaiAddressData,
  ThaiAddressIndex,
  ThaiAddressSuggestion
} from "../types.js";

export interface AttachThaiAddressAutocompleteOptions {
  data?: ThaiAddressData;
  dataUrl?: string;
  index?: ThaiAddressIndex;
  limit?: number;
  minLength?: number;
  onSelect?: (suggestion: ThaiAddressSuggestion) => void;
}

function injectStyles(): void {
  if (document.getElementById("thai-address-autocomplete-style")) {
    return;
  }

  const style = document.createElement("style");
  style.id = "thai-address-autocomplete-style";
  style.textContent = `
    .thai-address-dom-listbox {
      border: 1px solid #d7dce2;
      border-radius: 8px;
      box-shadow: 0 10px 30px rgb(15 23 42 / 12%);
      margin-top: 6px;
      max-height: 260px;
      overflow: auto;
      padding: 4px;
      background: white;
      z-index: 20;
    }
    .thai-address-dom-option {
      appearance: none;
      background: transparent;
      border: 0;
      border-radius: 6px;
      cursor: pointer;
      display: block;
      font: inherit;
      padding: 8px 10px;
      text-align: left;
      width: 100%;
    }
    .thai-address-dom-option:hover,
    .thai-address-dom-option:focus {
      background: #eef6f3;
      outline: none;
    }
  `;
  document.head.append(style);
}

function renderSuggestions(
  listbox: HTMLDivElement,
  input: HTMLInputElement,
  suggestions: ThaiAddressSuggestion[],
  onSelect?: (suggestion: ThaiAddressSuggestion) => void
): void {
  listbox.replaceChildren();

  for (const suggestion of suggestions) {
    const option = document.createElement("button");
    option.type = "button";
    option.className = "thai-address-dom-option";
    option.setAttribute("role", "option");
    option.textContent = suggestion.label;
    option.addEventListener("mousedown", (event) => event.preventDefault());
    option.addEventListener("click", () => {
      input.value = suggestion.label;
      listbox.replaceChildren();
      listbox.hidden = true;
      onSelect?.(suggestion);
    });
    listbox.append(option);
  }

  listbox.hidden = suggestions.length === 0;
}

export function attachThaiAddressAutocomplete(
  input: HTMLInputElement,
  options: AttachThaiAddressAutocompleteOptions = {}
): () => void {
  injectStyles();

  let index = options.index ?? (options.data ? createThaiAddressIndex(options.data) : undefined);
  let disposed = false;
  const limit = options.limit ?? 8;
  const minLength = options.minLength ?? 1;
  const listbox = document.createElement("div");
  listbox.className = "thai-address-dom-listbox";
  listbox.hidden = true;
  listbox.setAttribute("role", "listbox");
  input.insertAdjacentElement("afterend", listbox);

  function handleInput(): void {
    if (!index || input.value.trim().length < minLength) {
      renderSuggestions(listbox, input, [], options.onSelect);
      return;
    }

    renderSuggestions(listbox, input, index.search(input.value, { limit }), options.onSelect);
  }

  input.setAttribute("aria-autocomplete", "list");
  input.addEventListener("input", handleInput);
  input.addEventListener("blur", () => {
    window.setTimeout(() => {
      if (!disposed) {
        listbox.hidden = true;
      }
    }, 120);
  });

  if (!index && options.dataUrl) {
    loadThaiAddressData(options.dataUrl).then((data) => {
      if (!disposed) {
        index = createThaiAddressIndex(data);
        handleInput();
      }
    });
  }

  return () => {
    disposed = true;
    input.removeEventListener("input", handleInput);
    listbox.remove();
  };
}

export type { ThaiAddressSuggestion };
