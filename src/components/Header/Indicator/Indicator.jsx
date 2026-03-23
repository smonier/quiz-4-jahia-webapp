import React from 'react';
import PropTypes from 'prop-types';
import {StoreCtx} from 'contexts';
import {makeStyles} from 'tss-react/mui';
import classnames from 'clsx';

const useStyles = makeStyles()((theme) => ({
    indicator: {
        boxSizing: 'content-box !important',
        flex: '0 1 auto',
        width: theme.geometry.indicator.width,
        height: theme.geometry.indicator.height,
        marginRight: theme.geometry.indicator.spacer,
        marginLeft: theme.geometry.indicator.spacer,
        textIndent: '-999px',

        backgroundColor: theme.palette.common.white,
        backgroundClip: 'padding-box',
        // Use transparent borders to increase the hit area by 10px on top and bottom.
        borderTop: `${theme.geometry.indicator.hitAreaHeight} solid transparent`,
        borderBottom: `${theme.geometry.indicator.hitAreaHeight} solid transparent`,
        opacity: '.5',
        transition: theme.transitions.create(['opacity', 'height'], {
            duration: theme.transitions.duration.long,
            easing: theme.transitions.easing.ease
        }),
        '.showResult &': {
            backgroundColor: theme.palette.grey[900]
        },
        '&.clickable': {
            cursor: 'pointer'
        },
        '&.active': {
            opacity: 1
        }
    }
}));

export const Indicator = ({id, isClickable, ...props}) => {
    const {classes} = useStyles();

    const {state, dispatch} = React.useContext(StoreCtx);
    const {currentSlide} = state;

    const active = currentSlide === id;
    const handleCLick = () => {
        if (isClickable) {
            dispatch({
                case: 'SHOW_SLIDE',
                payload: {
                    slide: id
                }
            });
        }
    };

    return (
        <li className={classnames(
            classes.indicator,
            (active ? 'active' : ''),
            (isClickable ? 'clickable' : '')
        )}
            onClick={handleCLick}
         />
    );
};

Indicator.propTypes = {
    id: PropTypes.string.isRequired,
    isClickable: PropTypes.bool.isRequired
};
