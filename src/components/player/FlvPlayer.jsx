import React from "react";
import "./style.css"

const FlvPlayer = ({ type, mpd, mimeCodec, ...props }) => {
  const playerList = `http://${mpd}`;
  const supportMediaSource =
    "MediaSource" in window &&
    MediaSource.isTypeSupported(`video/mp4; codecs="${mimeCodec.trim()}"`);
  
  setTimeout(() => {
    var player = window.videojs('vid1');
    player.play();
  }, 1000);

  return supportMediaSource ? (
    <div className="v-player" style={{ height: "600px" }}>
      <video-js id="vid1" width="600" height="300" className='video-js vjs-default-skin' controls>
        <source
          src={playerList}
          type="application/x-mpegURL" />
      </video-js>
    </div>
  ) : (
    <div className="v-native-player">
      您的浏览器不支持我们的播放器，请更换到最新CHROME浏览器，谢谢。
    </div>
  );
};

export default FlvPlayer;
