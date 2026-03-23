import React from 'react';
import {StoreCtxProvider} from 'contexts';

import {getRandomString} from 'misc/utils';
import {syncQuizScore} from 'misc/trackerWem';
import {quizData} from '../types';
import PropTypes from 'prop-types';

const showNext = ({slideSet, slide}) =>
    slideSet.indexOf(slide) < slideSet.length;// -1 ?

const getScore = ({resultSet, quiz, isPreview}) => {
    let score = 100;
    if (resultSet.length > 0) {
        const goodAnswers = resultSet.filter(result => result).length;
        const answers = resultSet.length;
        score = Math.floor((goodAnswers / answers) * 100);
    }

    // Wait 500ms before to call jExp in order to have time to synch user profile with answer
    if (!isPreview) {
        setTimeout(
            () => syncQuizScore({
                quiz,
                score
            }),
            500
        );
    }

    return score;
};

const init = ({quizData, focusId}) => {
    // Console.log("jContent.transition : ",jContent.transition);

    const quiz = {
        id: quizData.core.id,
        type: quizData.core.type,
        ...quizData.content
    };
    const {childNodes = [], scorePerso} = quiz;

    const scoreId = scorePerso?.uuid || getRandomString(5, '#aA');

    const slideSet = [quiz.id];
    childNodes.forEach(node => slideSet.push(node.id));
    slideSet.push(scoreId);

    // Const max = slideSet.length -1;

    return {
        quiz,
        resultSet: [], // Array of boolean, order is the same a slideSet
        currentResult: false, // Previously result
        slideSet, // [],//previously slideIndex
        slideSetInit: [...slideSet],
        persoWasDone: [],
        currentSlide: focusId, // QuizData.id,//null,//previously index
        showResult: false,
        showNext: showNext({slideSet, focusId}),
        showScore: focusId === scoreId,
        nextIsScore: false,
        // Max,
        score: 0,
        reset: false,
        transitionActive: false,
        scoreId
        // ScoreSplitPattern:"::"
    };
};

const reducer = (state, action) => {
    const {payload} = action;

    switch (action.case) {
        case 'USER_DATA_SCORE_READY': {
            const {userScore, isResetEnabled} = payload;
            const isUserCanDoTheQuiz = isResetEnabled || (typeof userScore === 'undefined');

            return {
                ...state,
                score: userScore ? userScore : state.score,
                showScore: !isUserCanDoTheQuiz,
                currentSlide: isUserCanDoTheQuiz ? state.currentSlide : state.slideSet.at(-1)
            };
        }

        case 'ADD_SLIDES': {
            const slides = payload.slides;
            const parentSlide = payload.parentSlide;
            let slideSet = state.slideSet;

            if (parentSlide && slideSet.includes(parentSlide)) {
                const position = slideSet.indexOf(parentSlide) + 1;
                slideSet.splice(position, 0, ...slides);
            } else {
                slideSet = [...slideSet, ...slides];
            }

            slideSet = [...new Set(slideSet)];
            return {
                ...state,
                slideSet,
                slideSetInit: [...slideSet],
                showNext: showNext({slideSet, slide: state.currentSlide})
            };
        }

        case 'NEXT_SLIDE': {
            const currentIndex = state.slideSet.indexOf(state.currentSlide);
            const nextIndex = currentIndex + 1;

            let nextSlide = state.currentSlide;

            if (currentIndex < (state.slideSet.length - 1)) {
                nextSlide = state.slideSet[nextIndex];
            }

            return {
                ...state,
                currentSlide: nextSlide,
                showNext: showNext({...state, slide: nextSlide}),
                showResult: false,
                reset: false
            };
        }

        case 'SHOW_SCORE': {
            // Console.debug("[STORE] SHOW_SCORE");
            const {isPreview} = payload;
            const [slide] = state.slideSet.slice(-1);
            let {score} = state;

            score = getScore({
                resultSet: state.resultSet,
                quiz: state.quiz,
                isPreview
            });

            return {
                ...state,
                currentSlide: slide,
                showNext: showNext({...state, slide}),
                showResult: false,
                showScore: true,
                score
            };
        }

        case 'SHOW_SLIDE': {
            const slide = payload.slide;
            const showScore = state.slideSet.indexOf(slide) === (state.slideSet.length - 1);

            return {
                ...state,
                currentSlide: slide,
                showScore,
                showNext: showNext({...state, slide})
            };
        }

        case 'SHOW_RESULT': {
            const {result: currentResult, skipScore, isPreview} = payload;
            const currentIndex = state.slideSet.indexOf(state.currentSlide);
            const nextIndex = currentIndex + 1;
            const nextIsScore = nextIndex === (state.slideSet.length - 1);

            // Console.debug("[STORE] SHOW_RESULT - currentResult: ", currentResult);

            const resultSet = currentResult === null ? [...state.resultSet] : [...state.resultSet, currentResult];
            // Const {quiz} = state;
            let {score, currentSlide: nextSlide} = state;

            if (skipScore) {
                if (nextIsScore) {
                    score = getScore({
                        resultSet: resultSet,
                        quiz: state.quiz,
                        isPreview
                    });
                }

                //     [nextSlide] = state.slideSet.slice(-1);
                // }else{
                //     nextSlide=state.slideSet[nextIndex]
                // }
                nextSlide = state.slideSet[nextIndex];
            }

            return {
                ...state,
                currentSlide: nextSlide,
                showNext: showNext({...state, slide: nextSlide}),
                showScore: skipScore && nextIsScore,
                nextIsScore,
                resultSet,
                currentResult,
                score,
                showResult: !skipScore
            };
        }

        case 'RESET': {
            // Console.debug("[STORE] RESET");

            const [currentSlide] = state.slideSet.slice(0, 1);
            // Console.debug("[STORE] RESET slideSet",state.slideSet);

            return {
                ...state,
                showNext: showNext({...state, slide: currentSlide}),
                currentSlide,
                resultSet: [],
                showScore: false,
                nextIsScore: false,
                currentResult: false,
                reset: true,
                persoWasDone: [],
                slideSet: [...state.slideSetInit]
            };
        }

        case 'TOGGLE_TRANSITION': {
            // Console.debug("[STORE] TOGGLE_TRANSITION");
            return {
                ...state,
                transitionActive: !state.transitionActive
            };
        }

        case 'PERSO_WAS_DONE': {
            const {persoId} = payload;
            // Console.debug("[STORE] SHOW_SLIDE - slide: ",slide);
            return {
                ...state,
                persoWasDone: [...state.persoWasDone, persoId]
            };
        }

        default:
            throw new Error(`[STORE] action case '${action.case}' is unknown `);
    }
};

export const Store = ({quizData, focusId, children}) => {
    const [state, dispatch] = React.useReducer(
        reducer,
        {quizData, focusId},
        init
    );
    return (
        <StoreCtxProvider value={{state, dispatch}}>
            {children}
        </StoreCtxProvider>
    );
};

Store.propTypes = {
    quizData,
    focusId: PropTypes.string,
    children: PropTypes.node
};
