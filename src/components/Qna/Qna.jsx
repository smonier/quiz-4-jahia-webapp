import React from 'react';
import PropTypes from 'prop-types';
import {GetQnA} from 'webappGraphql';
import {useQuery} from '@apollo/client';
import {AppCtx, JahiaCtx, StoreCtx} from 'contexts';
import {formatQnaJcrProps} from './QnaModel';
import {Answer} from './Answer';
import {syncVisitorData, manageTransition} from 'misc';
import {Media, Loading, cssSharedClasses} from 'components';
import classnames from 'clsx';
import {FormGroup, Typography, Button} from '@mui/material';
import {makeStyles} from 'tss-react/mui';

const useStyles = makeStyles()((theme) => ({
    questionGroup: {
        textAlign: 'left',
        marginTop: theme.spacing(2),
        marginBottom: theme.spacing(4)
    },
    question: {
        marginBottom: theme.spacing(2)
    },
    formGroup: {
        textAlign: 'left',
        '& > div::before': {
            flexBasis: '100%',
            content: '""',
            height: '2px',
            marginLeft: '50px',
            borderTop: '2px solid rgba(255,255,255,.2)'
        },
        '&  > div:first-child::before': {
            borderTop: 'none'
        },
        '&  > div:last-child::after': {
            flexBasis: '100%',
            content: '""',
            height: '2px',
            marginLeft: '50px',
            borderBottom: '2px solid rgba(255,255,255,.2)'
        },
        marginBottom: theme.spacing(4)
    }
}));

const initialQNA = {
    enableSubmit: false
};

const reducer = (qna, action) => {
    const {payload} = action;

    switch (action.case) {
        case 'DATA_READY': {
            // Const {qnaData,quiz_validMark} = payload;
            const {qnaJcrProps} = payload;
            return {
                ...qna,
                ...formatQnaJcrProps(qnaJcrProps)
            };
        }

        case 'TOGGLE_ANSWER': {
            const {answer} = payload;// Answer id
            // console.debug("[STORE QNA] TOGGLE_ANSWER -> answer :",answer);
            let {answers} = qna;
            if (qna.inputType === 'radio') {
                answers = answers.map(answer => ({...answer, checked: false}));
            }

            answers = answers.map(_answer => {
                if (_answer.id === answer.id) {
                    return {
                        ..._answer,
                        checked: !_answer.checked
                    };
                }

                return _answer;
            });
            const enableSubmit = answers.filter(answer => answer.checked).length > 0;

            return {
                ...qna,
                answers,
                enableSubmit
            };
        }

        case 'RESET': {
            const {qnaJcrProps} = payload;
            return {
                ...initialQNA,
                ...formatQnaJcrProps(qnaJcrProps)
            };
        }

        default:
            throw new Error(`[STORE QNA] action case '${action.case}' is unknown `);
    }
};

export const Qna = ({id: qnaId, persoId, ...props}) => {
    const {classes} = useStyles();
    const sharedClasses = cssSharedClasses(props);

    const {workspace, locale, isPreview, previewCm} = React.useContext(JahiaCtx);
    const {config: {isTransitionEnabled, transitionTimeout}, languageBundle} = React.useContext(AppCtx);
    const {state, dispatch} = React.useContext(StoreCtx);

    const {
        currentSlide,
        reset
    } = state;
    const isActive = currentSlide === qnaId || currentSlide === persoId;

    const {loading, error, data} = useQuery(GetQnA, {
        variables: {
            workspace,
            language: locale,
            id: qnaId
        },
        skip: !qnaId
    });

    const [qna, qnaDispatch] = React.useReducer(
        reducer,
        initialQNA
    );

    React.useEffect(() => {
        if (loading === false && data) {
            const qnaJcrProps = data?.response?.qna || {};
            qnaDispatch({
                case: 'DATA_READY',
                payload: {
                    qnaJcrProps
                }
            });
        }
    }, [loading, data]);

    React.useEffect(() => {
        if (reset && data) {
            const qnaJcrProps = data?.response?.qna || {};
            qnaDispatch({
                case: 'RESET',
                payload: {
                    qnaJcrProps
                }
            });
        }
    }, [reset, data]);

    if (loading) {
        return <Loading isActive={isActive} msg="loading.question"/>;
    }

    if (error) {
        return <p>Error :(</p>;
    }

    const handleSubmit = () => {
        // Console.debug("[handleSubmit] qna.jExpField2Map => ",qna.jExpField2Map);
        if (qna.jExpField2Map) {
            // Get response cdpValue
            // Note case multiple is manage by comma separated case
            const values =
                qna.answers
                    .filter(answer => answer.checked)
                    .reduce(
                        (item, answer, index) => {
                            if (answer.cdpValue && answer.cdpValue.length > 0) {
                                if (index === 0) {
                                    item = answer.cdpValue;
                                } else {
                                    item = `${item}, ${answer.cdpValue}`;
                                }
                            }

                            return item;
                        }, null
                    );
            // Console.debug("[handleSubmit] update : ",qna.jExpField2Map," with values : ",values);

            // if tracker is not initialized the track event is not send
            if (!isPreview) {
                syncVisitorData({
                    qna: {
                        id: qna.id,
                        type: qna.type,
                        title: qna.title
                    },
                    propertyName: qna.jExpField2Map,
                    propertyValue: values
                });
            }
        }

        const payload = {
            case: 'SHOW_RESULT',
            payload: {
                isPreview,
                skipScore: qna.notUsedForScore,
                result: qna.notUsedForScore ? null : qna.answers
                    .reduce((test, answer) => test && (answer.isAnswer ? answer.checked : !answer.checked), true)
            }
        };

        if (qna.notUsedForScore) {
            manageTransition({
                isTransitionEnabled,
                transitionTimeout,
                dispatch,
                payload
            });
        } else {
            dispatch(payload);
        }
    };

    const getAnswers = () => {
        if (qna.answers) {
            return qna.answers.map(answer => (
                <Answer
                    key={answer.id}
                    id={answer.id}
                    qna={qna}
                    qnaDispatch={qnaDispatch}
                />
            ));
        }
    };

    return (
        <div className={classnames(
            sharedClasses.item,
            sharedClasses.showOverlay,
            (isActive ? 'active' : '')
        )}
        >
            {qna.media &&
                <Media {...qna.media}
                       alt={qna.title}
                />}
            <div className={sharedClasses.caption}>
                <div className={classes.questionGroup}>
                    <Typography className={classes.question}
                                variant="h4"
                    >
                        {qna.question}
                    </Typography>
                    <Typography variant="h5">
                        {qna.help}
                    </Typography>
                </div>

                <FormGroup className={classes.formGroup}
                           style={{}}
                           aria-label="answer"
                >
                    {getAnswers()}
                </FormGroup>

                <Button disabled={!qna.enableSubmit || previewCm}
                        onClick={handleSubmit}
                >
                    {languageBundle && languageBundle.btnSubmit}
                </Button>
            </div>
        </div>
    );
};

Qna.propTypes = {
    id: PropTypes.string.isRequired,
    persoId: PropTypes.string
};
