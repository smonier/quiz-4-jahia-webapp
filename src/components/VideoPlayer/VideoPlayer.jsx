import React, {useRef} from 'react';
import PropTypes from 'prop-types';
import {AppCtx, JahiaCtx} from 'contexts';
import ReactPlayer from 'react-player';
import {syncVideoStatus} from 'misc/trackerWem';
import {makeStyles} from 'tss-react/mui';

const useStyles = makeStyles()((/* theme */) => ({
    playerWrapper: {}
}));

export const VideoPlayer = ({ownerID, videoURL, videoId}) => {
    const {classes} = useStyles();
    const {isPreview} = React.useContext(JahiaCtx);
    const {core: {id: quizId, path: quizPath, type: quizType}} = React.useContext(AppCtx);

    const player = useRef(null);

    const handleVideoStatus = ({status}) => {
        if (!isPreview) {
            syncVideoStatus({
                quiz: {
                    id: quizId,
                    path: quizPath,
                    type: quizType
                },
                parentId: ownerID,
                player,
                status,
                video: {
                    id: videoId,
                    url: videoURL
                }
            });
        }
    };

    // Const onReadyHandler = () => {
    //     console.log("onReady seekTo 4.2s")
    //     player.current.seekTo(4.2,"seconds");
    // }
    const onStartHandler = () => {
        // Player.current.seekTo(4.2,"seconds");
    };

    const onPlayHandler = () => handleVideoStatus({status: 'started'});
    const onEndedHandler = () => handleVideoStatus({status: 'end'});
    const onPauseHandler = () => handleVideoStatus({status: 'pause'});

    return (
        <div className={classes.playerWrapper}>
            <ReactPlayer
                ref={player}
                controls
                className="react-player"
                url={videoURL}
                width="100%"
                // Height='100%'
                // onReady={onReadyHandler}
                onPause={onPauseHandler}
                // OnSeek={(seconds)=> console.log("onSeek : ",seconds)}
                // onDuration={(seconds)=> console.log("onDuration :",seconds)}
                onEnded={onEndedHandler}
                onStart={onStartHandler}
                // OnProgress={(object)=> console.log("onProgress : ",object)}
                onPlay={onPlayHandler}
            />
        </div>
    );
};

VideoPlayer.propTypes = {
    videoURL: PropTypes.string.isRequired,
    ownerID: PropTypes.string.isRequired,
    videoId: PropTypes.string.isRequired
};
