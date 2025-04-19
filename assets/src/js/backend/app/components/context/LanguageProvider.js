import React, { useState, useEffect, useCallback, useContext, createContext } from 'react';
import { app_url, rest_url } from '../common/functions';
import request from '../common/request';

const LanguageContext = createContext();

const get_langcode = (l) => l.toString().split('_')[0];

export default function LanguageProvider({ children, config={} }) {
  const [language, setLanguage] = useState(get_langcode(config?.locale??'en'));
  const [translations, setTranslations] = useState({});

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
    if (!langCode || langCode == '') {langCode = 'en';}
    const url = app_url(`../translations/${langCode}.json`);
    lang_request(url).then(data => {
      cache[url] = data;
      setTranslations(data);
      setLanguage(langCode);
      window.i18ns[langCode] = {};
      // window.i18ns[langCode] = {...window?.i18ns[langCode]??{}, ...data};
      request(rest_url('/partnership/v1/locale'), {method: 'POST', headers: {'Content-Type': 'application/json'}, body: JSON.stringify({language: langCode, user_id: parseInt(config?.user_id??0)})}).then(data => console.log(data)).catch(console.error);
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