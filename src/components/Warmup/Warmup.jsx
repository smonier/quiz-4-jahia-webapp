import React from 'react';
import PropTypes from 'prop-types';
import {AppCtx, JahiaCtx, StoreCtx} from 'contexts';
import {useQuery} from '@apollo/client';
import {GetWarmup} from 'webappGraphql';
import {formatWarmupJcrProps} from './WarmupModel';
import {ContentPerso, Loading, Media, Qna, cssSharedClasses, EmbeddedPathInHtmlResolver} from 'components';
import classnames from 'clsx';
import {Typography, Button} from '@mui/material';
import {makeStyles} from 'tss-react/mui';
import {manageTransition} from 'misc/utils';

const useStyles = makeStyles()((theme) => ({
    contentGroup: {
        textAlign: 'justify',
        maxWidth: '800px',
        margin: 'auto',
        marginTop: theme.spacing(3),
        marginBottom: theme.spacing(4)
    }
}));

export const Warmup = ({id: warmupId, persoId, ...props}) => {
    const {classes} = useStyles();
    const sharedClasses = cssSharedClasses(props);

    const {workspace, locale, cndTypes, previewCm} = React.useContext(JahiaCtx);
    const {config: {isTransitionEnabled, transitionTimeout}, languageBundle} = React.useContext(AppCtx);
    const {state, dispatch} = React.useContext(StoreCtx);

    const {
        currentSlide
    } = state;

    const isActive = currentSlide === warmupId || currentSlide === persoId;

    const {loading, error, data} = useQuery(GetWarmup, {
        variables: {
            workspace,
            language: locale,
            id: warmupId
        },
        skip: !warmupId
    });

    React.useEffect(() => {
        if (loading === false && data) {
            dispatch({
                case: 'ADD_SLIDES',
                payload: {
                    slides: data.response.warmup.children?.nodes?.map(node => node.uuid),
                    parentSlide: persoId || data.response.warmup.uuid
                }
            });
        }
    }, [loading, data, dispatch, persoId]);

    if (loading) {
        return <Loading isActive={isActive} msg="loading.warmup"/>;
    }

    if (error) {
        return <p>Error :(</p>;
    }

    const {id, media, title, subtitle, video, content, childNodes} = formatWarmupJcrProps(data.response.warmup);

    const handleCLick = () =>
        manageTransition({
            isTransitionEnabled,
            transitionTimeout,
            dispatch,
            payload: {
                case: 'NEXT_SLIDE'
            }
        });

    const displayPerso = persoId => {
        if (currentSlide === persoId) {
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
        <>
            <div className={classnames(
                sharedClasses.item,
                sharedClasses.showOverlay,
                (isActive ? 'active' : '')
            )}
            >
                {media &&
                    <Media
                        {...media}
                        alt={title}
                    />}

                <div className={classnames(
                    sharedClasses.caption,
                    sharedClasses.captionMain
                )}
                >
                    <Typography
                        className={sharedClasses.textUppercase}
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

                    <div className={classes.contentGroup}>
                        <Typography
                            /* eslint-disable-next-line react/no-children-prop */
                            children={<EmbeddedPathInHtmlResolver htmlAsString={content}/>}
                            component="div"
                            className={classes.content}
                        />

                        {video &&
                        <div>
                            <Media id={video.id}
                                   types={video.types}
                                   path={video.path}
                                   sourceID={id}
                            />
                        </div>}
                    </div>

                    <Button disabled={previewCm} onClick={handleCLick}>
                        {languageBundle && languageBundle.btnQuestion}
                    </Button>
                </div>
            </div>
            {childNodes.map(node => {
                if (node.types.includes(cndTypes.QNA)) {
                    return (
                        <Qna
                            key={node.id}
                            id={node.id}
                        />
                    );
                }

                if (cndTypes.CONTENT_PERSO.some(type => node.types.includes(type))) {
                    return displayPerso(node.id);
                }

                return null;
            })}
        </>
    );
};

Warmup.propTypes = {
    id: PropTypes.string.isRequired,
    persoId: PropTypes.string
};
