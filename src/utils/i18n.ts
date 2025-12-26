export type LocalizedString = string | Record<string, string>;

export function getLocalizedText(content: LocalizedString | undefined, lang: string, defaultLang: string = 'zh'): string {
  if (!content) return '';
  
  if (typeof content === 'string') {
    return content;
  }
  
  // Try requested language
  if (content[lang]) {
    return content[lang];
  }
  
  // Try default language
  if (content[defaultLang]) {
    return content[defaultLang];
  }
  
  // Try 'en' as fallback
  if (content['en']) {
    return content['en'];
  }
  
  // Return first available value
  const values = Object.values(content);
  return values.length > 0 && values[0] ? values[0] : '';
}
