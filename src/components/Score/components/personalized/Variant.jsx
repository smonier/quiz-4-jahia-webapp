import React from 'react';
import PropTypes from 'prop-types';
import {JahiaCtx, CxsCtx} from 'contexts';
import {GetPersonalizedScoreVariant} from 'webappGraphql';
import {useLazyQuery} from '@apollo/client';
import {Typography, CircularProgress} from '@mui/material';
import {makeStyles} from 'tss-react/mui';
import classnames from 'clsx';
import {cssSharedClasses, EmbeddedPathInHtmlResolver} from 'components';
import DOMPurify from 'dompurify';
import {useTranslation} from 'react-i18next';

const useStyles = makeStyles()((theme) => ({
    // Result:{
    //     marginTop: `${theme.spacing(4)}px`,
    // },
    personalizedArea: {
        padding: `${theme.spacing(4)} 0`
    }
}));

export const Variant = ({personalizedResultId, ...props}) => {
    const {t} = useTranslation();
    const {workspace, locale} = React.useContext(JahiaCtx);
    const cxs = React.useContext(CxsCtx);

    const sharedClasses = cssSharedClasses(props);
    const {classes} = useStyles();

    const [loadVariant, variantQuery] = useLazyQuery(GetPersonalizedScoreVariant);

    // Wait 1s before to call jExp in order to have time to synch user profile with answer
    React.useEffect(() => {
        if (personalizedResultId && cxs) {
            setTimeout(
                () => loadVariant({
                    variables: {
                        workspace,
                        language: locale,
                        id: personalizedResultId,
                        profileId: cxs.profileId,
                        sessionId: cxs.sessionId

                    },
                    fetchPolicy: 'no-cache'
                }),
                1000
            );
        }
    }, [loadVariant, locale, workspace, personalizedResultId, cxs]);

    if (!variantQuery.data || variantQuery.loading) {
        return (
            <div className={classnames(
                classes.personalizedArea
            )}
            >
                <Typography
                    className={classnames(
                        sharedClasses.wait,
                        sharedClasses.textUppercase
                    )}
                    variant="body2"
                >
                    {t('loading.personalizedScore')}
                </Typography>
                <CircularProgress/>
            </div>
        );
    }

    if (variantQuery.error) {
        return <p>Error getting your result :(</p>;
    }

    const {variant} = variantQuery.data.response?.result?.jExperience?.resolve;

    return (
        <Typography
            /* eslint-disable-next-line react/no-children-prop */
            children={<EmbeddedPathInHtmlResolver htmlAsString={DOMPurify.sanitize(variant.text.value, {ADD_ATTR: ['target']})}/>}
            className={classes.personalizedArea}
            component="div"/>
    );
};

Variant.propTypes = {
    personalizedResultId: PropTypes.string.isRequired
};
