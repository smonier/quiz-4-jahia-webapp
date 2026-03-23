import React from 'react';
import {AppCtx, StoreCtx} from 'contexts';
import {Percentage, PersonalizedSlide} from './components';
import {useCssSharedClasses} from 'components';
import classnames from 'clsx';
import {manageTransition} from 'misc/utils';

export const Score = () => {
    const {state, dispatch} = React.useContext(StoreCtx);

    const sharedClasses = useCssSharedClasses();
    const {config: {isTransitionEnabled, transitionTimeout}, content: {title, subtitle, media, scorePerso}} = React.useContext(AppCtx);

    const personalizedResultId = scorePerso?.uuid;

    const {
        currentSlide,
        scoreId
    } = state;

    const isActive = currentSlide === scoreId;

    const onClick = () => {
        manageTransition({
            isTransitionEnabled,
            transitionTimeout,
            dispatch,
            payload: {
                case: 'RESET'
            }
        });
    };

    return (
        <div className={classnames(
            sharedClasses.item,
            sharedClasses.showOverlay,
            (isActive ? 'active' : '')
        )}
        >
            {personalizedResultId &&
                <PersonalizedSlide personalizedResultId={personalizedResultId} onClick={onClick}/>}
            {!personalizedResultId &&
                <Percentage media={media} title={title} subtitle={subtitle} onClick={onClick}/>}
        </div>
    );
};

// Score.propTypes = {
//     quizContent
// };
