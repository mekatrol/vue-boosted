export interface LanguageInfo extends NavigatorLanguage {
  languageVariant: string;
  languageBase: string;
}

export const useLanguageInfo = (): LanguageInfo => {
  // Regex to split base and variant parts into named groups
  const re = /^\s*(?<base>[A-Za-z]{2}){1}(-(?<variant>[A-Za-z]{2})){0,1}\s*$/;
  const match = re.exec(window.navigator.language);

  // Get base and variant if found
  const base = match?.groups ? match.groups['base'] : '';
  const variant = match?.groups ? match.groups['variant'] ?? '' : '';

  // Construct language info
  const languageInfo: LanguageInfo = {
    language: window.navigator.language,
    languages: window.navigator.languages,
    languageVariant: base,
    languageBase: variant
  };

  return languageInfo;
};
