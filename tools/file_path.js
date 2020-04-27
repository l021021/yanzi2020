var fs = require("fs")

function getAllFileFromPath(path) {
    fs.readdir(path, function(err, res) {


        // console.log(JSON.stringify(res))
        for (var subPath of res) {
            var statObj = fs.statSync(path + "/" + subPath);
            if (statObj.isDirectory()) {
                console.log("Dir:", subPath);
                getAllFileFromPath(path + "/" + subPath)
            } else {
                console.log("File:", subPath);

            }
        }
    })
}
getAllFileFromPath("c:\\codebase")