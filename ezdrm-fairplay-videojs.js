function stringToArray(string) {
    var buffer = new ArrayBuffer(string.length*2); // 2 bytes for each char
    var array = new Uint16Array(buffer);
    for (var i=0, strLen=string.length; i<strLen; i++) {
        array[i] = string.charCodeAt(i);
    }
    return array;
}

function arrayToString(array) {
    var uint16array = new Uint16Array(array.buffer);
    return String.fromCharCode.apply(null, uint16array);
}

function waitForEvent(name, action, target) {
    target.addEventListener(name, function() {
        action(arguments[0]);
    }, false);
}

var drm = {
    keySystem: null,
    certificate: null,
    player: null,
    contentUrl: null,
    contentId: null,
    licenseUrl: null,
    drmCustomData: null,
    fairplay: function(option){
        if(option.player !== undefined){
            drm.player = option.player;
        }
        if(option.content_url !== undefined){
            drm.contentUrl = option.content_url;
        }
        if(option.drm_custom_data !== undefined){
            drm.drmCustomData = option.drm_custom_data;
        }
        if(option.license_url !== undefined){
            drm.licenseUrl = option.license_url;
        }
        var request = new XMLHttpRequest();
        request.responseType = 'arraybuffer';
        request.addEventListener('load', drm.onCertificateLoaded, false);
        request.addEventListener('error', drm.onCertificateError, false);
        request.open('GET', option.certificate_uri, true);
        //request.setRequestHeader('Pragma', 'Cache-Control: no-cache');
        //request.setRequestHeader("Cache-Control", "max-age=0");
        request.send();
    },
    onCertificateLoaded: function(event){
        var request = event.target;
        drm.certificate = new Uint8Array(request.response);
        drm.player.src({
            'src': drm.contentUrl,
        });
        drm.player.tech_.el_.addEventListener('webkitneedkey', drm.onNeedKey, false);
        drm.player.tech_.el_.addEventListener('error', drm.onError, false);
    },
    onCertificateError: function(event) {
        window.console.error('Failed to retrieve the server certificate.');
    },
	extractContentId: function(initData) {
			var uri = arrayToString(initData);
            var uriParts = uri.split('://', 1);
            var protocol = uriParts[0].slice(-3);

            uriParts = uri.split(';', 2);
            var contentId = uriParts.length > 1 ? uriParts[1] : '';

            //return protocol.toLowerCase() == 'skd' ? contentId : '';
		//drm.contentId = arrayToString(initData);
		//drm.contentId = drm.contentId.substring(drm.contentId.indexOf('skd://')+6);
		drm.contentId = contentId;
		return drm.contentId;
	},
    concatInitDataIdAndCertificate: function(initData, id, cert) {
            if (typeof id == "string")
                id = stringToArray(id);
            // layout is [initData][4 byte: idLength][idLength byte: id][4 byte:certLength][certLength byte: cert]
            var offset = 0;
            var buffer = new ArrayBuffer(initData.byteLength + 4 + id.byteLength + 4 + cert.byteLength);
            var dataView = new DataView(buffer);

            var initDataArray = new Uint8Array(buffer, offset, initData.byteLength);
            initDataArray.set(initData);
            offset += initData.byteLength;

            dataView.setUint32(offset, id.byteLength, true);
            offset += 4;

            var idArray = new Uint16Array(buffer, offset, id.length);
            idArray.set(id);
            offset += idArray.byteLength;

            dataView.setUint32(offset, cert.byteLength, true);
            offset += 4;

            var certArray = new Uint8Array(buffer, offset, cert.byteLength);
            certArray.set(cert);

            return new Uint8Array(buffer, 0, buffer.byteLength);

    },
    selectKeySystem : function(){
        if (WebKitMediaKeys.isTypeSupported("com.apple.fps.1_0", "video/mp4"))
        {
            drm.keySystem = "com.apple.fps.1_0";
        }
        else
        {
            throw "Key System not supported";
        }
    },
    onError: function(event){
        window.console.error('A video playback error occurred');
    },
    onNeedKey: function(event) {
        var video = event.target;
        var initData = event.initData;
        var contentId = drm.extractContentId(initData);
        initData = drm.concatInitDataIdAndCertificate(initData, contentId, drm.certificate);
        if (!video.webkitKeys)
        {
            drm.selectKeySystem();
            video.webkitSetMediaKeys(new WebKitMediaKeys(drm.keySystem));
        }

        if (!video.webkitKeys)
            throw "Could not create MediaKeys";

        var keySession = video.webkitKeys.createSession("video/mp4", initData);
        if (!keySession)
            throw "Could not create key session";

        keySession.contentId = contentId;
        waitForEvent('webkitkeymessage', drm.licenseRequestReady, keySession);
        waitForEvent('webkitkeyadded', drm.onKeyAdded, keySession);
        waitForEvent('webkitkeyerror', drm.onKeyError, keySession);
    },
    licenseRequestReady: function(event){
		var session = event.target;
        var message = event.message;
        var sessionId = session.sessionId;
        var blob = new Blob([message], {type: 'application/octet-binary'});
        var request = new XMLHttpRequest();
        request.session = session;
        request.open('POST', drm.licenseUrl + '?p1=' + Date.now(), true);
        request.setRequestHeader('Content-type', 'application/octet-stream');
        request.responseType = 'blob';
        request.addEventListener('load', drm.licenseRequestLoaded, false);
        request.addEventListener('error', drm.licenseRequestFailed, false);
		request.send(blob);
    },
    licenseRequestLoaded : function(event) {
            var request = event.target;
            if (request.status == 200) {
              var blob = request.response;

              var reader = new FileReader();
              reader.addEventListener('loadend', function () {
                var array = new Uint8Array(reader.result);
                request.session.update(array);
              });
              reader.readAsArrayBuffer(blob);
            }
    },
    licenseRequestFailed :  function(event) {
        window.console.error('The license request failed.');
    },
    onKeyError: function(event) {
        window.console.error('A decryption key error was encountered');
    },
    onKeyAdded: function(event) {
        window.console.log('Decryption key was added to session.');
    }
};



