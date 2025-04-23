import React, { useState, useEffect, useCallback, useContext, createContext } from 'react';
import { useSession } from '@context/SessionProvider';
import { app_url, rest_url } from '@functions';
import request from '@common/request';

const LanguageContext = createContext();

const get_langcode = (l) => l.toString().split('_')[0];

let isFirstCall = true;

export default function LanguageProvider({ children, config={} }) {
  const [language, setLanguage] = useState(get_langcode(config?.locale??''));
  const [translations, setTranslations] = useState({});
  const { session, setSession } = useSession();

  const cache = {};

  const lang_request = (url) => {
    return new Promise((resolve, reject) => {
      if (cache[url]) {
        resolve(cache[url]);
        return;
      }
      fetch(url).then(res => res.json()).then(data => resolve(data)).catch(err => reject(err));
    })
  }

  const loadLanguage = useCallback(async (langCode) => {
    if (!langCode || langCode == '') {langCode = session?.languageCode??'en';}
    const url = app_url(`../languages/translations/${langCode}.json`);
    lang_request(url).then(data => {
      cache[url] = data;
      setTranslations(data);
      setLanguage(langCode);
      setSession(prev => ({ ...prev, languageCode: langCode }));
      window.i18ns[langCode] = {};
      // window.i18ns[langCode] = {...window?.i18ns[langCode]??{}, ...data};
      if (!isFirstCall) {
        request(rest_url('/partnership/v1/locale'), {method: 'POST', headers: {'Content-Type': 'application/json'}, body: JSON.stringify({language: langCode, user_id: parseInt(config?.user_id??0)})}).then(data => console.log(data)).catch(console.error);
        isFirstCall = false;
      }
    }).catch(err => console.error('Failed to load language:', err));
  }, []);

  useEffect(() => {
    loadLanguage(language);
  }, [loadLanguage]);

  // const t = (key) => translations?.[key] || key;
  const t = (key) => {
    if (! translations?.[key]) {
      if (!window.i18ns?.[language]) {window.i18ns[language] = {};}
      window.i18ns[language][key] = translations[key] = key;
      // 
    }
    return translations?.[key] || key;
  };

  return (
    <LanguageContext.Provider value={{ language, switchLanguage: loadLanguage, __: t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export const useTranslation = () => useContext(LanguageContext);