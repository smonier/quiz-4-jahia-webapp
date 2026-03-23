import React from 'react';
import {cndTypes} from 'douane/lib/config';
import {Qna, Quiz, Warmup, ContentPerso, Score} from 'components';
import {Typography} from '@mui/material';
import {useTranslation} from 'react-i18next';
import {previewTarget, media} from 'types';

export const Preview = ({previewTarget: {id, type}, media}) => {
    const {t} = useTranslation();

    switch (true) {
        case type === cndTypes.QUIZ:
            return <Quiz/>;
        case type === cndTypes.QNA:
            return <Qna id={id}/>;
        case type === cndTypes.WARMUP:
            return <Warmup id={id}/>;
        case cndTypes.CONTENT_PERSO.includes(type):
            return <ContentPerso id={id} media={media}/>;
        case type === cndTypes.SCORE_PERSO:
            return <Score/>;
        default:
            return (
                <Typography color="error"
                            component="p"
                >
                    {t('error.nodeType.notSupported')} : {type}
                </Typography>
            );
    }
};

Preview.propTypes = {
    previewTarget,
    media
};
