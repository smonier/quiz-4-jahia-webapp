import React from 'react';
import {Typography, useTheme} from '@mui/material';
import {makeStyles} from 'tss-react/mui';
import classnames from 'clsx';
import {AppCtx, StoreCtx} from 'contexts';

const childTiles = nbRow => {
    const transitionRow = [...Array(nbRow)];
    return transitionRow.reduce((obj, item, i) => {
        const index = i + 1;
        const key = `&:nth-child(${index})`;
        obj[key] = {
            top: `calc(${(index - 1)} * ${100 / nbRow}%)`,
            transitionDelay: `${(index - 1) * 0.1}s`
        };
        return obj;
    }, {});
};

const useStyles = makeStyles()(theme => ({
    loader: {
        position: 'absolute',
        zIndex: 8, // '999',
        top: 0,
        left: 0,
        bottom: 0,
        width: 0,
        transition: 'width 0s 1.4s ease',
        '&.active': {
            width: '100%',
            transitionDelay: '0s'
        }
    },
    icon: {
        position: 'absolute',
        zIndex: 4,
        top: '50%',
        left: '50%',
        transform: 'translateX(-50%) translateY(-50%)',
        opacity: 0,
        transition: 'opacity .5s ease',

        '& svg': {
            transformOrigin: '0 0'
        },

        '.active &': {
            opacity: 1
            // Transition: 'opacity .5s 1.4s ease',
        }
    },
    text: {
        textTransform: 'uppercase'
    },
    tile: {
        position: 'absolute',
        left: 0,
        width: 0,
        height: `${100 / theme.transitions.row}%`,
        backgroundColor: theme.palette.primary.main,
        transition: 'width .3s ease',
        ...childTiles(theme.transitions.row),

        '.active &': {
            width: '100%'
        }
    }
}));

export const Transition = () => {
    const theme = useTheme();
    const {config: {transitionLabel}} = React.useContext(AppCtx);
    const {state: {transitionActive}} = React.useContext(StoreCtx);

    const transitionRow = [...Array(theme.transitions.row)];
    const {classes} = useStyles();

    return (
        <div className={classnames(
            classes.loader,
            (transitionActive ? 'active' : '')
        )}
        >
            <div className={classes.icon}>
                <Typography variant="h4" className={classes.text}>
                    {transitionLabel}
                </Typography>
            </div>
            {/* eslint-disable-next-line react/no-array-index-key */}
            {transitionRow.map((row, i) => <div key={i} className={classes.tile}/>)}
        </div>
    );
};
