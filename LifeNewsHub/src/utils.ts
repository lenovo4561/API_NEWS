export const getLang = (acceptLanguage?: string): string => {
  let lang;
  if (acceptLanguage) {
    lang = acceptLanguage.split(',')[0]
  }

  if (lang) {
    if (lang.startsWith('pt')) {
      lang = 'pt'
    } else if (lang.startsWith('es')) {
      lang = 'es'
    } else {
      lang = process.env.LOCALE
    }
  } else {
    lang = process.env.LOCALE
  }
  return lang
}