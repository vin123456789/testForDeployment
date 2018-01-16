
function readImage(fileObj, imageId, msgId) {
    if (typeof FileReader == 'undefined') {
        document.getElementById(msgId).InnerHTML = "<h1>This browser doesn't support image preview</h1>";
        //Disabled the image
        document.getElementById(imageId).setAttribute("disabled", "disabled");
        return;
    }

    var file = fileObj.files[0];

    console.log(fileObj);
    console.log(file);
    console.log("file.size = " + file.size);  //file.size byte

    var reader = new FileReader();

    reader.onloadstart = function (e) {
        console.log("start reading....");
    }
    reader.onprogress = function (e) {
        console.log("reading....");
    }
    reader.onabort = function (e) {
        console.log("stop reading....");
    }
    reader.onerror = function (e) {
        console.log("reading error....");
    }
    reader.onload = function (e) {
        console.log("successfully read....");

        var img = document.getElementById(imageId);
        img.src = e.target.result;
        //or img.src = this.result;  //e.target == this
    }
    reader.readAsDataURL(file);
}