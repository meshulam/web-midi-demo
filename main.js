'use strict';

const MAX_FILE_SIZE_BYTES = 50000;

let midiAccess;
let portSelectEl;
let messageEl;


function setupPortSelect() {
  portSelectEl.options.length = 0;

  for (const port of midiAccess.outputs.values()) {
    portSelectEl.appendChild(
      new Option(port.name, port.id)
    );
  }
}

function getPort() {
  if (portSelectEl.selectedOptions.length < 1) {
    return;
  }

  const id = portSelectEl.selectedOptions[0].value

  let selectedPort;
  for (const port of midiAccess.outputs.values()) {
    if (port.id === id) {
      selectedPort = port;
    }
  }

  return selectedPort;
}

function sendSysex() {
  messageEl.innerText = 'Sending...';

  const file = document.getElementById('file').files[0];
  if (!file) {
    messageEl.innerText = 'Please select a file';
    return;
  }
  if (file.size > MAX_FILE_SIZE_BYTES) {
    messageEl.innerText = 'File is too big, limit is 50kB';
    return;
  }

  const reader = new FileReader();

  reader.onload = function(evt) {
    const bytes = new Uint8Array(evt.target.result);
    const port = getPort();
    if (!port) {
      messageEl.innerText = 'No MIDI device selected';
      return;
    }
    port.send(bytes);
    messageEl.innerText = 'Sent!';
  }

  reader.readAsArrayBuffer(file);
}


window.addEventListener('load', function() {
  portSelectEl = document.getElementById('port-select');
  messageEl = document.getElementById('message');

  document.querySelector('#submit').addEventListener('click', sendSysex);

  navigator.requestMIDIAccess({ sysex: true }).then((ma) => {
    midiAccess = ma;
    setupPortSelect();
    messageEl.innerText = 'Let\'s MIDI';
  });
});


