import React from 'react';
import PropTypes from 'prop-types';
import classnames from 'clsx';
import {Media, cssSharedClasses} from 'components';
import {Typography, CircularProgress} from '@mui/material';

import {useTranslation} from 'react-i18next';
import {media} from 'types';

export const Loading = ({media, isActive = false, msg, ...props}) => {
    const {t} = useTranslation();
    const sharedClasses = cssSharedClasses(props);

    return (
        <div className={classnames(
            sharedClasses.item,
            sharedClasses.showOverlay,
            (isActive ? 'active' : '')
        )}
        >
            {media &&
            <Media id={media.id}
                   types={media.types}
                   path={media.path}
                   alt="background"
            />}
            <div className={classnames(
                sharedClasses.caption,
                sharedClasses.captionMain
            )}
            >
                <Typography
                    className={classnames(
                        sharedClasses.wait,
                        sharedClasses.textUppercase
                    )}
                    variant="body2"
                >
                    {t(msg)}
                </Typography>
                <CircularProgress/>
            </div>
        </div>
    );
};

Loading.propTypes = {
    media,
    isActive: PropTypes.bool.isRequired,
    msg: PropTypes.string
};
