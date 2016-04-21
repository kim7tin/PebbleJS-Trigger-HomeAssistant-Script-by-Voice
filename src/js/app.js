var UI = require('ui');
var Voice = require('ui/voice');

var aesjs = require('aes-js');

var key = aesjs.util.convertStringToBytes("KooltechsAES");
var rand_key = aesjs.util.convertStringToBytes("01020304", "hex");
Array.prototype.push.apply(rand_key, key);

// Convert text to bytes
var text = 'TextMustBe16Byte';
var textBytes = aesjs.util.convertStringToBytes(text);

var aesEcb = new aesjs.ModeOfOperation.ecb(rand_key);
var encryptedBytes = aesEcb.encrypt(textBytes);
console.log(encryptedBytes);
console.log(aesjs.util.convertBytesToString(encryptedBytes));
// Since electronic codebook does not store state, we can
// reuse the same instance.
// var aesEcb = new aesjs.ModeOfOperation.ecb(key);
var decryptedBytes = aesEcb.decrypt(encryptedBytes);

// Convert our bytes back into text
var decryptedText = aesjs.util.convertBytesToString(decryptedBytes);
console.log(decryptedText);
// "TextMustBe16Byte"

var Settings = require('settings');
// Set a configurable with the open callback
Settings.config({
	url : 'http://socket.kooltechs.com/kgarage_pebble/login'
}, function(e) {
	console.log('opening configurable');
}, function(e) {
	console.log('closed configurable');
});

function start(websocketServerLocation) {
	ws = new WebSocket(websocketServerLocation);
	ws.onopen = function() {
		var data_send = {
			"ownerID" : "1",
			"sessionKey" : "2",
			"devType" : "5",
			"UDID" : "4"
		};
		encryptedBytes = aesEcb.encrypt(JSON.stringify(data_send));
		var send_byte = [ 5001 ];
		Array.prototype.push.apply(send_byte, aesjs.util.convertStringToBytes(
				"01020304", "hex"));
		Array.prototype.push.apply(send_byte, encryptedBytes);
		ws.send(send_byte);
	};

	ws.onmessage = function(evt) {
		console.log("=======onmessage=======");
		console.log(evt.data);
	};

	ws.onclose = function() {
		// websocket is closed.
		console.log("Connection is closed");
		setTimeout(function() {
			start(websocketServerLocation);
		}, 1000);
	};
}

start("ws://socket.kooltechs.com:23580");

var options = Settings.option();
console.log("Debug=====>" + JSON.stringify(options));

Voice.dictate('start', function(e) {
	var voice_geted = e.err || e.transcription;
	var control = voice_geted.match(/open|close/i);
	var left_right = voice_geted.match(/left|right/i);
	var get = (/is|what|how|status/i).test(voice_geted);
	var body = "voice: " + voice_geted + "\r\n";

	// body += "control: " + (control ? control : "N/A") + "\r\n";
	// body += "l/r: " + (left_right ? left_right : "N/A") + "\r\n";
	// body += "get: " + (get ? "yes" : "no") + "\r\n";
	if (options.door) {
		options.door.forEach(function(e, i, a) {
			var regex = new RegExp(e.door_name, 'i');
			var door_test = regex.test(voice_geted);
			if (door_test) {
				if (get) {
					body += "control: you ask me status of " + e.door_name
							+ "\r\n";
				} else {
					if (control) {
						body += "control: you want me " + control + " "
								+ e.door_name + " \r\n";
					}
				}
			}
			// body += e.door_name + ": " + (door_test ? "yes" : "no") +
			// "\r\n";

		});

		if (left_right) {
			if (get) {
				body += "control: you ask me status of "
						+ options.door[0].door_name + "(" + left_right
						+ " door)\r\n";
			} else {
				if (control) {
					body += "control: you want me " + control + " "
							+ options.door[0].door_name + "(" + left_right
							+ " door) \r\n";
				}
			}
		}
	}

	console.log(body);
	var result = new UI.Card({
		title : 'Transcription',
		body : body,
	});
	result.show();
});