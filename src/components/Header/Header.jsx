import {Indicator} from 'components/Header/Indicator';
import {Button, Typography} from '@mui/material';
import {makeStyles} from 'tss-react/mui';
import {manageTransition} from 'misc/utils';

const useStyles = makeStyles()((theme) => ({
    wrapper: {
        zIndex: 5,
        position: 'relative',
        backgroundColor: 'transparent',
        '.showResult &': {
            backgroundColor: theme.palette.grey['300']
        },
        // Transition: 'background-color 0.1s ease-in-out'
        transition: theme.transitions.create(['background-color'], {
            duration: 100, // Theme.transitions.duration.standard, // '10s',//
            easing: theme.transitions.easing.header
        })
    },
    header: {

        position: 'relative',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        // Width:'100%',
        padding: `${theme.spacing(2)} ${theme.geometry.caption.padding.lg}`,
        [theme.breakpoints.between('xs', 'sm')]: {
            padding: `${theme.spacing(2)} ${theme.geometry.caption.padding.main}`
        }

    },
    headerIndicators: {
        display: 'flex',
        justifyContent: 'center',
        zIndex: 4,
        listStyle: 'none',
        padding: 0,
        margin: 0
        // '.showResult &': {
        //     // [theme.breakpoints.between('xs', 'sm')]: {
        //     //     marginBottom: `${theme.spacing(1)}px`
        //     // }
        // }
    },
    headerResult: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        // Height: 0,
        height: theme.geometry.header.result.height,
        width: '100%',
        maxWidth: '1280px',
        overflow: 'hidden',
        opacity: 0,
        visibility: 'hidden',
        marginBottom: theme.spacing(1),
        // Transition: theme.transitions.create(['height'], {
        //     duration: theme.transitions.duration.standard, // '10s',//
        //     easing: theme.transitions.easing.header
        // }),
        // transition: 'opacity 0.1s ease-in-out',
        transition: theme.transitions.create(['opacity'], {
            duration: 100, // Theme.transitions.duration.standard, // '10s',//
            easing: theme.transitions.easing.header
        }),
        '.showResult &': {
            // Height: theme.geometry.header.result.height, // '45px',//'auto',
            // marginBottom: `${theme.spacing(1)}px`
            opacity: 1,
            visibility: 'visible'
        }
    },
    headerText: {
        textTransform: 'capitalize',
        fontWeight: theme.typography.fontWeightBold,
        color: theme.palette.grey[700],
        lineHeight: 1,
        [theme.breakpoints.between('xs', 'sm')]: {
            fontSize: '1.75rem'
        }
    }
}));

export const Header = props => {
    const {classes} = useStyles();

    const {isPreview} = React.useContext(JahiaCtx);
    const {state, dispatch} = React.useContext(StoreCtx);
    const {config: {isTransitionEnabled, transitionTimeout, isBrowsingEnabled}, languageBundle} = React.useContext(AppCtx);

    const {
        slideSet,
        currentResult,
        showNext,
        nextIsScore
    } = state;

    const handleNextSlide = () =>
        manageTransition({
            isTransitionEnabled,
            transitionTimeout,
            dispatch,
            payload: {
                case: 'NEXT_SLIDE'
            }
        });

    const handleShowScore = () =>
        manageTransition({
            isTransitionEnabled,
            transitionTimeout,
            dispatch,
            payload: {
                case: 'SHOW_SCORE',
                payload: {
                    isPreview
                }
            }
        });

    const getHeaderResultLabel = () => {
        if (currentResult) {
            return languageBundle.correctAnswer;
        }

        return languageBundle.wrongAnswer;
    };

    const getHeaderBtnNext = () => {
        if (nextIsScore) {
            return (
                <Button disabled={!showNext}
                        onClick={handleShowScore}
                >
                    {languageBundle.btnShowResults}
                </Button>
            );
        }

        return (
            <Button disabled={!showNext}
                    onClick={handleNextSlide}
            >
                {languageBundle.btnNextQuestion}
            </Button>
        );
    };

    return (
        <div className={classes.wrapper}>
            <div className={classes.header}>
                <ol className={classes.headerIndicators}>
                    {slideSet.map(itemId => (
                        <Indicator
                            key={itemId}
                            id={itemId}
                            isClickable={isBrowsingEnabled}
                        />
                    ))}
                </ol>
                {languageBundle &&
                <div className={classes.headerResult}>
                    <Typography className={classes.headerText}
                                variant="h4"
                    >
                        {getHeaderResultLabel()}
                    </Typography>

                    {getHeaderBtnNext()}
                </div>}
            </div>
        </div>
    );
};
