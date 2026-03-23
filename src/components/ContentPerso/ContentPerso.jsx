import React from 'react';
import PropTypes from 'prop-types';
import {JahiaCtx, StoreCtx, CxsCtx} from 'contexts';
import {useLazyQuery} from '@apollo/client';
import {GetPersonalizedContentVariant} from 'webappGraphql';
import {Typography} from '@mui/material';
import {makeStyles} from 'tss-react/mui';
import InfoIcon from '@mui/icons-material/Info';
import {Qna, Warmup, Loading, Media, useCssSharedClasses} from 'components';
import classnames from 'clsx';
import {useTranslation} from 'react-i18next';
import {media} from 'types';

const useStyles = makeStyles()(theme => ({
    content: {
        // TextAlign: 'left',
        maxWidth: '500px',
        margin: `${theme.spacing(4)} auto 0`

    }
}));

const PreviewContentNotRendered = ({media, isActive}) => {
    const {t} = useTranslation();
    const sharedClasses = useCssSharedClasses();
    const {classes} = useStyles();

    return (
        <div className={classnames(
            sharedClasses.item,
            sharedClasses.showOverlay,
            (isActive ? 'active' : '')
        )}
        >
            {media &&
            <Media
                {...media}
                alt="background"
            />}
            <div
                className={classnames(
                    sharedClasses.caption,
                    sharedClasses.captionMain
                )}
            >
                <Typography
                    component="div"
                    className={classes.content}
                >
                    <InfoIcon/> <br/>
                    {t('rendering.perso.notRendered')}
                </Typography>
            </div>
        </div>
    );
};

PreviewContentNotRendered.propTypes = {
    isActive: PropTypes.bool.isRequired,
    media
};

export const ContentPerso = ({id: persoId, media}) => {
    const {workspace, cndTypes, previewCm} = React.useContext(JahiaCtx);
    const cxs = React.useContext(CxsCtx);
    const {state: {currentSlide}, dispatch} = React.useContext(StoreCtx);

    const [loadVariant, variantQuery] = useLazyQuery(GetPersonalizedContentVariant);
    const isActive = currentSlide === persoId;

    // Wait 1s before to call jExp in order to have time to synch user profile with answer
    React.useEffect(() => {
        if (persoId && cxs) {
            setTimeout(
                () => {
                    loadVariant({
                        variables: {
                            workspace,
                            id: persoId,
                            profileId: cxs.profileId,
                            sessionId: cxs.sessionId

                        },
                        fetchPolicy: 'no-cache'
                    });
                },
                1000
            );
            dispatch({
                case: 'PERSO_WAS_DONE',
                payload: {
                    persoId
                }
            });
        }
    }, [loadVariant, workspace, persoId, cxs, dispatch]);

    if (!variantQuery.data || variantQuery.loading) {
        if (previewCm) {
            return <PreviewContentNotRendered isActive={isActive} media={media}/>;
        }

        return <Loading isActive={isActive} media={media} msg="loading.nextQuestion"/>;
    }

    if (variantQuery.error) {
        return <p>Error getting your next question :(</p>;
    }

    if (previewCm) {
        return <PreviewContentNotRendered isActive={isActive} media={media}/>;
    }

    const {variant} = variantQuery.data.response?.result?.jExperience?.resolve;

    const getContent = node => {
        switch (node.primaryNodeType?.name) {
            case cndTypes.QNA:
                return (
                    <Qna
                        key={node.uuid}
                        id={node.uuid}
                        persoId={persoId}
                    />
                );

            case cndTypes.WARMUP:
                return (
                    <Warmup
                        key={node.uuid}
                        id={node.uuid}
                        persoId={persoId}
                    />
                );
            // Case cndTypes.CONTENT_PERSO :
            //         return <ContentPerso
            //             key={node.id}
            //             id={node.id}
            //             media={media}
            //             persoId={}
            //         />
            default:
                return (
                    <Typography
                        color="error"
                        component="p"
                    >
                        node type {node.primaryNodeType?.name} is not supported
                    </Typography>
                );
        }
    };

    return getContent(variant);
};

ContentPerso.propTypes = {
    id: PropTypes.string.isRequired,
    media
};
