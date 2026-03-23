import React from 'react';
import PropTypes from 'prop-types';
import {AppCtx, JahiaCtx} from 'contexts';
import {useQuery} from '@apollo/client';
import {GetPersonalizedScoreNode} from 'webappGraphql';
import {Button, Typography} from '@mui/material';
import {makeStyles} from 'tss-react/mui';
import InfoIcon from '@mui/icons-material/Info';
import {Media, Loading, EmbeddedPathInHtmlResolver, useCssSharedClasses} from 'components';
import classnames from 'clsx';
import {formatPersoResultJcrProps} from './PersoResultModel';
import {Variant} from './Variant';
import {useTranslation} from 'react-i18next';

const useStyles = makeStyles()(theme => ({
    content: {
        // TextAlign: 'left',
        maxWidth: '500px',
        margin: `${theme.spacing(4)} auto 0`

    }
}));

export const PersonalizedSlide = ({personalizedResultId, onClick}) => {
    const {t} = useTranslation();
    const {workspace, locale, previewCm} = React.useContext(JahiaCtx);

    const sharedClasses = useCssSharedClasses();
    const {classes} = useStyles();

    const {config: {isResetEnabled}, content: quizContent, languageBundle} = React.useContext(AppCtx);

    const {loading, error, data} = useQuery(GetPersonalizedScoreNode, {
        variables: {
            workspace,
            language: locale,
            id: personalizedResultId
        },
        skip: !personalizedResultId
    });

    if (loading) {
        return <Loading isActive msg="loading.score"/>;
    }

    if (error) {
        return <p>Error :(</p>;
    }

    const {
        media = quizContent.media,
        title = quizContent.title,
        subtitle = quizContent.subtitle,
        content
    } = formatPersoResultJcrProps(data.response.persoResultContent);

    return (
        <>
            {media &&
            <Media {...media}
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

                <Typography
                    /* eslint-disable-next-line react/no-children-prop */
                    children={<EmbeddedPathInHtmlResolver htmlAsString={content}/>}
                    component="div"
                    className={classes.content}
                />

                {!previewCm &&
                    <Variant personalizedResultId={personalizedResultId}/>}

                {previewCm &&
                    <Typography
                        component="div"
                        className={classes.content}
                    >
                        <InfoIcon/> <br/>
                        {t('rendering.perso.notRendered')}
                    </Typography>}

                {isResetEnabled &&
                <Button onClick={onClick}>
                    {languageBundle && languageBundle.btnReset}
                </Button>}
            </div>
        </>
    );
};

PersonalizedSlide.propTypes = {
    personalizedResultId: PropTypes.string.isRequired,
    onClick: PropTypes.func.isRequired
};
