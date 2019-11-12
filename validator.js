file = {};
file.mp4boxfile = null;
file.objectToLoad = null;
file.objectIsFile = true;
file.fancytree = null;

var chunkSize  = 100000 * 100000; // bytes

var max_width = 1024;
var max_height = 700;

var video_width = null;
var video_height = null;

window.addEventListener('DOMContentLoaded', (event) => {
    var ele = document.getElementById('submit');

    ele.addEventListener('click', function(e){
        e.preventDefault();
        
        var fileInput = document.getElementById("fileToUpload");
        
        file.objectToLoad = fileInput.files[0];
        
        validateFile(file, function(w, h){
               if(w > max_width || h > max_height){
                   alert("rozdzielczość za duża " + w + ' / ' + h)
               }
            
        });
        
    });
});

function validateFile(fileobj, callFunction) {
    var fileSize   = fileobj.objectToLoad.size;
    var offset     = 0;
    var self       = this; // we need a reference to the current object
    var readBlock  = null;
 	var startDate  = new Date();

	fileobj.mp4boxfile = MP4Box.createFile(false);

	fileobj.mp4boxfile.onError = function(e) {
		console.log("Failed to parse ISOBMFF data");
	};

	fileobj.mp4boxfile.onSidx = function(sidx) {
		console.log(sidx);
	};
    
    fileobj.mp4boxfile.onReady = function (info) {
	   console.log("Received File Information");
        video_width = (info.tracks[0].video.width);
        video_height = (info.tracks[0].video.height);
        callFunction(video_width, video_height);
    }

    var onparsedbuffer = function(mp4boxfileobj, buffer) {
    	console.log("Appending buffer with offset "+offset);
		buffer.fileStart = offset;
    	mp4boxfileobj.appendBuffer(buffer);
	}

	var onBlockRead = function(evt) {
        if (evt.target.error == null) {
            onparsedbuffer(fileobj.mp4boxfile, evt.target.result); // callback for handling read chunk
            offset += evt.target.result.byteLength;
        } else {
            console.log("Read error: " + evt.target.error);
            return;
        }
        console.log(offset);
        console.log(fileSize);
        if (offset >= fileSize) {
			
            console.log("Done reading file ("+fileSize+ " bytes) in "+(new Date() - startDate)+" ms");
			fileobj.mp4boxfile.flush();
            return;
        }

        readBlock(offset, chunkSize, fileobj.objectToLoad);
    }

    readBlock = function(_offset, length, _file) {
        var r = new FileReader();
        console.log(_file);
        
        var blob = _file.slice(_offset, length + _offset);
        r.onload = onBlockRead;
        r.readAsArrayBuffer(blob);
    }

    readBlock(offset, chunkSize, fileobj.objectToLoad);
}

function createFileFormData(file) {
  //validate file
  var formData = new FormData();
  formData.append("Filedata", file);
  fileName = file.name;
    console.log(fileName);
  return formData;
}


