import React from 'react';
import {createRoot} from 'react-dom/client';
import {ApolloProvider} from '@apollo/client';
import {ErrorHandler, App} from 'components';

import {serviceWorker, syncTracker, getRandomString} from 'misc';

import createCache from '@emotion/cache';
import {CacheProvider} from '@emotion/react';

import {contextValidator} from 'douane';
import {Store} from 'store';
import {JahiaCtxProvider, AppCtxProvider, CxsCtxProvider} from './contexts';

import {getClient, GetQuiz} from './webappGraphql';

import 'index.css';

import {formatQuizJcrProps} from 'components/Quiz/QuizModel';

import i18n from 'i18next';
import {initReactI18next} from 'react-i18next';
import {appLanguageBundle} from 'i18n/resources';

async function getQuizData({client, workspace, locale, quizId}) {
    const {data} = await client.query({
        query: GetQuiz,
        variables: {
            workspace,
            language: locale,
            id: quizId
        }
        // Skip:!quizId
    });
    return formatQuizJcrProps(data.response.quiz);
}

const render = async (target, context) => {
    const root = createRoot(document.getElementById(target));

    try {
        context = contextValidator(context);

        const styleCache = createCache({key: getRandomString(8, 'a')});
        const {host, workspace, isEdit, locale, quizId, gqlServerUrl, contextServerUrl, appContext, cndTypes, scope, previewCm, previewTarget} = context;

        await i18n.use(initReactI18next) // Passes i18n down to react-i18next
            .init({
                resources: appLanguageBundle,
                lng: locale,
                fallbackLng: 'en',
                interpolation: {
                    escapeValue: false // React already safes from xss => https://www.i18next.com/translation-function/interpolation#unescape
                }
            });

        const isPreview = workspace !== 'LIVE';
        const client = getClient(gqlServerUrl);
        const quizData = await getQuizData({client, workspace, locale, quizId});

        const focusId = previewCm && Boolean(previewTarget) ? previewTarget.id : quizData.core.id;

        if (workspace === 'LIVE' && !window.wem) {
            if (!window.digitalData) {
                window.digitalData = {
                    _webapp: true,
                    scope,
                    site: {
                        siteInfo: {
                            siteID: scope
                        }
                    },
                    page: {
                        pageInfo: {
                            pageID: 'WebApp Quiz',
                            pageName: document.title,
                            pagePath: document.location.pathname,
                            destinationURL: document.location.origin + document.location.pathname,
                            language: locale,
                            categories: [],
                            tags: []
                        },
                        attributes: {
                            quizKey: quizData.content.quizKey,
                            quizPath: quizData.core.path
                        },
                        consentTypes: []
                    },
                    events: [],
                    // LoadCallbacks:[{
                    //     priority:5,
                    //     name:'Unomi tracker context loaded',
                    //     execute: () => {
                    //         window.cxs = window.wem.getLoadedContext();
                    //     }
                    // }],
                    wemInitConfig: {
                        contextServerUrl,
                        timeoutInMilliseconds: '1500',
                        // ContextServerCookieName: "context-profile-id",
                        activateWem: true,
                        // TrackerProfileIdCookieName: "wem-profile-id",
                        trackerSessionIdCookieName: 'wem-session-id'
                    }
                };
            }

            window.wem = syncTracker();
        }

        root.render(
            <React.StrictMode>
                <CacheProvider value={styleCache}>
                    <JahiaCtxProvider value={{
                        workspace,
                        locale,
                        host,
                        isEdit,
                        contextServerUrl,
                        cndTypes,
                        previewCm,
                        previewTarget,
                        isPreview
                        }}
                    >
                        <Store quizData={quizData} focusId={focusId}>
                            <ApolloProvider client={client}>
                                <div style={{overflow: 'hidden'}}>
                                    <CxsCtxProvider>
                                        <AppCtxProvider value={{
                                            ...appContext,
                                            core: quizData.core,
                                            content: quizData.content,
                                            config: {
                                                ...quizData.config,
                                                transitionTimeout: 1000,
                                                isBrowsingEnabled: (quizData.config.isBrowsingEnabled && !isEdit && !previewCm)
                                            },
                                            languageBundle: quizData.languageBundle
                                        }}
                                        >
                                            <App/>
                                        </AppCtxProvider>
                                    </CxsCtxProvider>
                                </div>
                            </ApolloProvider>
                        </Store>
                    </JahiaCtxProvider>
                </CacheProvider>
            </React.StrictMode>
        );
    } catch (e) {
        console.error('error : ', e);
        // Note: create a generic error handler
        root.render(
            <ErrorHandler
                item={e.message}
                errors={e.errors}
            />,
            document.getElementById(target)
        );
    }
};

window.quizUIApp = render;

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
serviceWorker.unregister();
