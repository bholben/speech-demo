// SpeechRecognition API allows us to convert the user's audible requests into text
window.SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
const recognition = new window.SpeechRecognition();
recognition.interimResults = true;
recognition.start();
recognition.addEventListener('result', buildTranscript);
recognition.addEventListener('end', recognition.start);

// SpeechSynthesis API allows us to respond audibly with Siri/Alexa voice, etc.
const utterance = new window.SpeechSynthesisUtterance();
window.speechSynthesis.addEventListener('voiceschanged', () => {
  const voices = window.speechSynthesis.getVoices();
  // Samantha is pretty much Siri
  utterance.voice = voices.find(voice => voice.name === 'Samantha');
});

const userNotepad = document.querySelector('.user-notepad');
let userP = document.createElement('p');
userNotepad.appendChild(userP);

function buildTranscript(e) {
  const deviceNotePad = document.querySelector('.device-notepad');
  const deviceP = deviceNotePad.querySelector('.device-text');
  const rawTranscriptArray = Array.from(e.results).map(result => result[0]);
  const rawTranscript = rawTranscriptArray
    .map(result => result.transcript)
    .join('');
  const confidentTranscript = rawTranscriptArray
    .filter(result => result.confidence > 0.5)
    .map(result => result.transcript)
    .join('');

  userP.textContent = rawTranscript;
  if (e.results[0].isFinal) {
    userP = document.createElement('p');
    userNotepad.appendChild(userP);
  }

  writeResponse(rawTranscript, deviceNotePad, deviceP);
  speakResponse(confidentTranscript);
}

function writeResponse(rawTranscript, deviceNotePad, deviceP) {
  const response = getResponse(rawTranscript);
  if (response) {
    deviceNotePad.style.display = 'inherit';
    deviceP.textContent = response;
  }
}

function speakResponse(confidentTranscript) {
  const response = getResponse(confidentTranscript);
  if (response) {
    utterance.text = response;
    window.speechSynthesis.speak(utterance);
  }
}

function getResponse(transcript) {
  // Search for a key phrase and return the response
  const request = Object.keys(requestMap).find(req => {
    return transcript.toLowerCase().includes(req);
  });
  return requestMap[request];
}

const requestMap = {
  'order food': 'Where would you like to order from?',
  'braves': 'I don\'t have any good news'
}
