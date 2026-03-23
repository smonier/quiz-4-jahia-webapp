import React from 'react';
import PropTypes from 'prop-types';
import {StoreCtx, AppCtx, JahiaCtx, CxsCtx} from 'contexts';
import {Button, Typography} from '@mui/material';
import {makeStyles} from 'tss-react/mui';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import InfoIcon from '@mui/icons-material/Info';
import {useMarketo, Media, useCssSharedClasses, EmbeddedPathInHtmlResolver} from 'components';
import classnames from 'clsx';
import {manageTransition} from 'misc/utils';
import {useTranslation} from 'react-i18next';

const useStyles = makeStyles()(theme => ({
    duration: {
        display: 'flex',
        alignItems: 'center',
        flexWrap: 'wrap',
        justifyContent: 'center',
        '& svg': {
            marginRight: '3px'
        },
        marginTop: theme.spacing(3)
    },
    description: {
        // TextAlign: 'left',
        maxWidth: '500px',
        margin: `${theme.spacing(4)} auto`

    },
    editInfo: {
        color: theme.palette.warning.dark
    },
    cxsError: {
        backgroundColor: theme.palette.error.dark,
        borderRadius: '3px',
        display: 'inline',
        padding: '5px 10px'
    }
}));

const MktoForm = ({formId, ...props}) => {
    useMarketo(props);
    return <form id={`mktoForm_${formId}`}/>;
};

MktoForm.propTypes = {
    formId: PropTypes.string.isRequired
};

export const Quiz = props => {
    const {t} = useTranslation();
    const {classes} = useStyles();
    const sharedClasses = useCssSharedClasses();
    const cxs = React.useContext(CxsCtx);
    const {isEdit} = React.useContext(JahiaCtx);
    const {
        core: {id},
        content: {title, subtitle, duration, description, media, mktgForm, mktoConfig},
        config: {isTransitionEnabled, transitionTimeout},
        mktgFormEnum,
        languageBundle
    } = React.useContext(AppCtx);

    const {state, dispatch} = React.useContext(StoreCtx);

    const {
        showNext,
        currentSlide
    } = state;

    const isActive = currentSlide === id;

    const onClick = () => {
        manageTransition({
            isTransitionEnabled,
            transitionTimeout,
            dispatch,
            payload: {
                case: 'NEXT_SLIDE'
            }
        });
    };

    const handleMktoFormSuccess = (/* values, targetPageUrl */) => {
        manageTransition({
            isTransitionEnabled,
            transitionTimeout,
            dispatch,
            payload: {
                case: 'NEXT_SLIDE'
            }
        });
        return false;
    };

    const handleMktoForm = form => {
        form.addHiddenFields({
            pageURL: document.location.href,
            cxsProfileId: window.cxs?.profileId
        });
        form.onSuccess(handleMktoFormSuccess);
    };

    const getStartComponent = () => {
        if (isEdit) {
            return (
                <Typography component="div"
                            className={classnames(
                                classes.editInfo,
                                classes.description
                            )}
                >
                    <InfoIcon/> <br/>
                    {t('rendering.app.noStart')}
                </Typography>
            );
        }

        const _cxs = window.cxs || false;

        if (!cxs &&
            _cxs.constructor === Object &&
            Object.keys(_cxs).length === 0) {
            return (
                <Typography className={classes.cxsError}
                            component="h5"
                >
                    {t('error.jExp.connexion')}
                </Typography>
            );
        }

        if (!mktgForm) {
            return (
                <Button disabled={!showNext}
                        onClick={onClick}
                >
                    {languageBundle && languageBundle.btnStart}
                </Button>
            );
        }

        if (mktgForm === mktgFormEnum.MARKETO && mktoConfig && cxs) {
            return (
                <MktoForm
                    baseUrl={mktoConfig.baseUrl}
                    munchkinId={mktoConfig.munchkinId}
                    formId={mktoConfig.formId}
                    whenReadyCallback={handleMktoForm}
                />
            );
        }
    };

    return (
        <div className={classnames(
            sharedClasses.item,
            sharedClasses.showOverlay,
            (isActive ? 'active' : '')
        )}
        >
            {media &&
            <Media {...media}
                   alt={title}
            />}

            <div className={classnames(
                sharedClasses.caption,
                sharedClasses.captionMain
            )}
            >
                <Typography className={sharedClasses.textUppercase}
                            variant="h3"
                >
                    {title}
                </Typography>
                <Typography
                    className={sharedClasses.subtitle}
                    color="primary"
                    variant="h4"
                >
                    {subtitle}
                </Typography>

                <Typography
                    component="div"
                    className={classes.duration}
                >
                    <AccessTimeIcon/>
                    {duration}
                </Typography>

                <Typography
                    /* eslint-disable-next-line react/no-children-prop */
                    children={<EmbeddedPathInHtmlResolver htmlAsString={description}/>}
                    component="div"
                    className={classes.description}/>

                {getStartComponent()}
            </div>
        </div>
    );
};

// Quiz.propTypes = {
//     quizData
// };
