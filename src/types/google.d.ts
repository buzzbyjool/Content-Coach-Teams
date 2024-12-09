declare namespace google.maps.places {
  class Autocomplete {
    constructor(
      inputField: HTMLInputElement,
      opts?: google.maps.places.AutocompleteOptions
    );
    addListener(eventName: string, handler: () => void): void;
    getPlace(): google.maps.places.PlaceResult;
  }

  interface AutocompleteOptions {
    types?: string[];
    componentRestrictions?: {
      country: string[];
    };
    fields?: string[];
  }

  interface PlaceResult {
    formatted_address?: string;
    geometry?: {
      location?: {
        lat(): number;
        lng(): number;
      };
    };
  }
}