/* eslint-disable react-hooks/exhaustive-deps */
// Node modules.
import React, { useState, useEffect, useCallback } from 'react';
import {
  HashRouter,
  Switch,
  Route,
  Redirect,
} from 'react-router-dom';
import { Helmet } from 'react-helmet';
import fetch from 'node-fetch';
// Local modules.
import * as Config from './configs/index';
import * as Routes from './utils/Routes';
import { DataProcess } from './utils/DataProcess';
import { FigureProvider } from './utils/FigureProvider';
import { AppContext } from './contexts/AppContext';
// Local components.
import { withTracker } from './hoc/ga';
import * as Screen from './screens/';

const App: React.FC = () => {
  const [language, setLanguage] = useState<Language>('zh-TW');
  // Data preparing.
  const [masterData, setMasterData] = useState<DataProcess>();
  const [figureProvider, setFigureProvider] = useState<FigureProvider>();

  const download = useCallback(async (url: string, isJson = true) => {
    const res = await fetch(url);
    const data = isJson ? await res.json() : await res.text();
    return data;
  }, []);

  const fetchMasterData = useCallback(async (language: Language) => {
    const masterRawData = await Promise.all([
      download(`https://liveahero-community.github.io/translations/latest/${language}/CardMaster.json`),
      download(`https://liveahero-community.github.io/translations/latest/${language}/SidekickMaster.json`),
      download(`https://liveahero-community.github.io/translations/latest/${language}/SkillMaster.json`),
      download(`https://liveahero-community.github.io/translations/latest/${language}/SkillEffectMaster.json`),
      download(`https://liveahero-community.github.io/translations/latest/${language}/StatusMaster.json`),
      download(`https://liveahero-community.github.io/translations/latest/${language}/Japanese.properties`, false),
    ]).then(([heroDataRaw, sidekickDataRaw, skillDataRaw, skillEffectDataRaw, statusDataRaw, detailRaw]) => ({
      heroDataRaw, sidekickDataRaw, skillDataRaw, skillEffectDataRaw, statusDataRaw, detailRaw,
    }));

    const updatedMasterData = new DataProcess(masterRawData);

    setMasterData(updatedMasterData);
  }, [download]);

  const fetchIllurationCatalog = useCallback(async () => {
    setFigureProvider(await FigureProvider.build());
  }, []);

  useEffect(() => {
    fetchMasterData(language);
  }, [language, fetchMasterData]);

  useEffect(() => {
    fetchIllurationCatalog();
  }, []);

  return (
    <AppContext.Provider value={{ language, setLanguage, masterData, figureProvider }}>
      <Helmet>
        <meta charSet='utf-8' />
        <title>{Config.websiteTitle[language]}</title>
        <link rel='canonical' href={Config.publicUrl} />
        <meta name='description' content={Config.websiteDescription[language]} />
      </Helmet>

      <HashRouter>
        <Switch>
          <Route path={Routes.HERO}
            component={withTracker(Screen.HeroScreen)}
          />
          <Route path={Routes.HEROES}
            component={withTracker(Screen.HeroesScreen)}
          />
          <Route path={Routes.SKILL_CATEGORY}
            component={withTracker(Screen.SkillCategoryScreen)}
          />
          <Route path={Routes.SKILL_CATEGORIES}
            component={withTracker(Screen.SkillCategoriesScreen)}
          />
          <Route path={Routes.STATUSES}
            component={withTracker(Screen.StatusesScreen)}
          />
          <Route path={Routes.COMMUNITIES}
            component={withTracker(Screen.CommunitiesScreen)}
          />
          <Route path={Routes.CONTRIBUTORS}
            component={withTracker(Screen.ContributorsScreen)}
          />
          <Route path={Routes.HOME}>
            <Redirect to={Routes.HEROES} />
          </Route>
        </Switch>
      </HashRouter>
    </AppContext.Provider>
  );
}

export default App;
