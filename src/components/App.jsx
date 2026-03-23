import React from 'react';
import {JahiaCtx, StoreCtx, AppCtx, CxsCtx} from '../contexts';
import {Grid, Typography} from '@mui/material';
import {ThemeProvider} from '@mui/material/styles';
import {makeStyles} from 'tss-react/mui';
import {Quiz, Warmup, Transition, Score, Header, Qna, ContentPerso, Preview, theme} from 'components';
import classnames from 'clsx';

import 'react-circular-progressbar/dist/styles.css';
import {useTranslation} from 'react-i18next';
import {getUserContext} from '../data/userJexpContext';

const useStyles = makeStyles()(() => ({
    main: {
        paddingTop: '100px', // `${theme.geometry.header.heights.max}px` cannot use theme, theme is undefined
        marginTop: '-100px',
        position: 'relative',
        '& *, &::after, &::before': {
            boxSizing: 'border-box'
        }

        // ".showResult &"  :{
        //     paddingTop:`108px`//${theme.geometry.header.heights.max}
        // }
    }
}));

export const App = () => {
    const {t} = useTranslation();
    const {classes} = useStyles();
    const cxs = React.useContext(CxsCtx);
    const {cndTypes, previewTarget} = React.useContext(JahiaCtx);
    const {content: {media, childNodes, quizKey}, config: {userTheme, isResetEnabled}} = React.useContext(AppCtx);
    const userPropScoreName = `quiz-score-${quizKey}`;

    const {state, dispatch} = React.useContext(StoreCtx);
    const {
        currentSlide,
        showResult,
        showScore,
        persoWasDone
    } = state;

    React.useEffect(() => {
        if (!isResetEnabled && cxs) {
            getUserContext({cxs, userPropScoreName, isResetEnabled, dispatch});
        }
    }, [cxs, userPropScoreName, isResetEnabled, dispatch]);

    const displayScore = () => {
        if (showScore) {
            return <Score/>;
        }
    };

    const displayPerso = persoId => {
        if ((currentSlide === persoId) || persoWasDone.includes(persoId)) {
            return (
                <ContentPerso
                    key={persoId}
                    id={persoId}
                    media={media}
                />
            );
        }
    };

    return (
        <ThemeProvider theme={theme(userTheme)}>
            <Grid container spacing={3}>
                <Grid item
                      xs
                      style={{margin: 'auto', position: 'relative'}}
                      className={classnames((showResult ? 'showResult' : ''))}
                >
                    <Header/>
                    <div className={classnames(
                    classes.main
                    // (showResult?'showResult':'')
                )}
                    >
                        <Transition/>
                        {Boolean(previewTarget) && <Preview {...{previewTarget, media: media}}/>}

                        {!previewTarget &&
                        <>
                            <Quiz/>

                            {childNodes.map(node => {
                                if (node.types.includes(cndTypes.QNA)) {
                                    return (
                                        <Qna
                                            key={node.id}
                                            id={node.id}
                                        />
                                    );
                                }

                                if (node.types.includes(cndTypes.WARMUP)) {
                                    return (
                                        <Warmup
                                            key={node.id}
                                            id={node.id}
                                        />
                                    );
                                }

                                if (cndTypes.CONTENT_PERSO.some(type => node.types.includes(type))) {
                                    return displayPerso(node.id);
                                }

                                return (
                                    <Typography
                                        key={node.id}
                                        color="error"
                                        component="p"
                                    >
                                        {t('error.nodeType.notSupported')} : {node.type}
                                    </Typography>
                                );
                            })}

                            {displayScore()}
                        </>}
                    </div>
                </Grid>
            </Grid>
        </ThemeProvider>
    );
};

// App.propTypes = {
//     quizData
// };
