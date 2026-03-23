import React from 'react';
import {AppCtx, StoreCtx} from 'contexts';

import {Media} from 'components/index';
import cssSharedClasses from 'components/cssSharedClasses';
import classnames from 'clsx';
import {Typography, Button} from '@mui/material';
import {makeStyles} from 'tss-react/mui';
import {CircularProgressbar} from 'react-circular-progressbar';
import PropTypes from 'prop-types';

const useStyles = makeStyles()((theme) => ({
    result: {
        marginTop: theme.spacing(4),
        maxWidth: '300px',
        margin: '32px auto',
        '& .CircularProgressbar': {
            '& .CircularProgressbar': {
                '&-text': {
                    fill: theme.palette.primary.main,
                    fontFamily: theme.typography.fontFamily
                },
                '&-trail': {
                    stroke: theme.palette.grey[300]
                },
                '&-path': {
                    stroke: theme.palette.primary.main
                }
            }
        }
    }
}));

export const Percentage = props => {
    const {classes} = useStyles();
    const {state} = React.useContext(StoreCtx);

    const sharedClasses = cssSharedClasses(props);
    const {media, title, subtitle, onClick} = props;
    const {config: {isResetEnabled}, languageBundle} = React.useContext(AppCtx);

    const {score} = state;

    return (
        <>
            {media &&
            <Media id={media.id}
                   types={media.types}
                   path={media.path}
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
                <Typography className={sharedClasses.subtitle}
                            color="primary"
                            variant="h4"
                >
                    {subtitle}
                </Typography>

                <div className={classes.result}>
                    <CircularProgressbar value={score} text={`${score}%`}/>
                </div>

                {isResetEnabled &&
                <Button onClick={onClick}>
                    {languageBundle && languageBundle.btnReset}
                </Button>}
            </div>
        </>
    );
};

Percentage.propTypes = {
    media: PropTypes.object,
    title: PropTypes.string,
    subtitle: PropTypes.string,
    onClick: PropTypes.func.isRequired
};

