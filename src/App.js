import React, { Component } from 'react';
import { Container } from 'reactstrap';
import { getTokenOrRefresh } from './token_util';
import './custom.css'
import { ResultReason } from 'microsoft-cognitiveservices-speech-sdk';

const speechsdk = require('microsoft-cognitiveservices-speech-sdk')

var displayText = '';

export default class App extends Component {
  constructor(props) {
    super(props);

    this.state = {
      displayText: '準備完了...'
    }
  }

  async componentDidMount() {
    // check for valid speech key/region
    const tokenRes = await getTokenOrRefresh();
    if (tokenRes.authToken === null) {
      this.setState({
        displayText: 'FATAL_ERROR: ' + tokenRes.error
      });
    }
  }

  async sttFromMic() {
    const tokenObj = await getTokenOrRefresh();
    const speechConfig = speechsdk.SpeechConfig.fromAuthorizationToken(tokenObj.authToken, tokenObj.region);
    speechConfig.speechRecognitionLanguage = 'ja-JP';

    const audioConfig = speechsdk.AudioConfig.fromDefaultMicrophoneInput();
    const recognizer = new speechsdk.SpeechRecognizer(speechConfig, audioConfig);

    this.setState({
      displayText: 'マイクに向かって話してください...'
    });

    recognizer.recognizeOnceAsync(result => {
      // let displayText;
      if (result.reason === ResultReason.RecognizedSpeech) {
        displayText = `${result.text}`
      } else {
        displayText = 'ERROR: Speech was cancelled or could not be recognized. Ensure your microphone is working properly.';
      }

      this.setState({
        displayText: displayText
      });
    });
  }

  async mario() {
    window.location.href = 'http://127.0.0.1:8000/map/map/?q=' + this.state.displayText;
  }

  async fileChange(event) {
    const audioFile = event.target.files[0];
    console.log(audioFile);
    const fileInfo = audioFile.name + ` size=${audioFile.size} bytes `;

    this.setState({
      displayText: fileInfo
    });

    const tokenObj = await getTokenOrRefresh();
    const speechConfig = speechsdk.SpeechConfig.fromAuthorizationToken(tokenObj.authToken, tokenObj.region);
    speechConfig.speechRecognitionLanguage = 'ja-JP';

    const audioConfig = speechsdk.AudioConfig.fromWavFileInput(audioFile);
    const recognizer = new speechsdk.SpeechRecognizer(speechConfig, audioConfig);

    recognizer.recognizeOnceAsync(result => {
      let displayText;
      if (result.reason === ResultReason.RecognizedSpeech) {
        displayText = `RECOGNIZED: Text=${result.text}`
      } else {
        displayText = 'ERROR: Speech was cancelled or could not be recognized. Ensure your microphone is working properly.';
      }

      this.setState({
        displayText: fileInfo + displayText
      });
    });
  }

  render() {
    return (
      <Container className="app-container">
        <h1 className="display-4 mb-3">音声認識</h1>

        <div className="row main-container">
          <div className="col-6">
            <i className="fas fa-microphone fa-lg mr-2" onClick={() => this.sttFromMic()}></i>
            ←マイクをクリックし、話してください。

            {/* <div className="mt-2">
                            <label htmlFor="audio-file"><i className="fas fa-file-audio fa-lg mr-2"></i></label>
                            <input 
                                type="file" 
                                id="audio-file" 
                                onChange={(e) => this.fileChange(e)} 
                                style={{display: "none"}} 
                            />
                            Convert speech to text from an audio file.
                        </div> */}
          </div>
          <div className="col-6 output-display rounded">
            <code>{this.state.displayText}</code>
          </div>
          <button onClick={() => this.mario()}>検索</button>
        </div>
      </Container>
    );
  }
}