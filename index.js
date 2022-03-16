const fs = require("fs")
const path = require("path")
const crypto = require('crypto');

function calcHash(path) {
    var fileBuffer = fs.readFileSync(path);
    var hashSum = crypto.createHash('sha256');
    hashSum.update(fileBuffer);
    return hashSum.digest('hex');
}

const getAllFiles = function (dirPath, arrayOfFiles) {
    files = fs.readdirSync(dirPath)

    arrayOfFiles = arrayOfFiles || []

    files.forEach(function (file) {
        if (fs.statSync(dirPath + "/" + file).isDirectory()) {
            arrayOfFiles = getAllFiles(dirPath + "/" + file, arrayOfFiles)
        } else {
            arrayOfFiles.push(path.join(dirPath, "/", file))
        }
    })

    return arrayOfFiles
}

var srcDir = '/Users/jgrayson/Downloads/earbuds-firmware-master/';
var destDir = '/Users/jgrayson/dev/earshot/';
var srcFiles = getAllFiles(srcDir).map(file => file.replace(srcDir, ''));
var destFiles = getAllFiles(destDir).map(file => file.replace(destDir, ''));

fs.writeFileSync('./srcFiles.txt', JSON.stringify(srcFiles, null, 4))
fs.writeFileSync('./destFiles.txt', JSON.stringify(destFiles, null, 4))

for (var i = 0; i < srcFiles.length; i++) {

    let srcFile = srcFiles[i];

    console.log('checking', srcFile)
    if (destFiles.includes(srcFile)) {
        try {
            if (calcHash(path.join(srcDir, srcFile)) != calcHash(path.join(destDir, srcFile))) {
                console.log('diff, copy:', srcFile)
                fs.copyFileSync(path.join(srcDir, srcFile), path.join(destDir, srcFile));
            }
        } catch (err) {
            console.log('Failed hash', err);
        }
    } else {
        // new file, add it
        console.log('new, copy:', srcFile)
        fs.copyFileSync(path.join(srcDir, srcFile), path.join(destDir, srcFile));
    }
}

for (var i = 0; i < destFiles.length; i++) {

    let destFile = destFiles[i];

    if (!destFile.indexOf('.git') == 0) {
        if (srcFiles.indexOf(destFile) < 0) {
            console.log('delete file:', destFile);
            fs.unlinkSync(path.join(destDir, destFile));
        }
    }
}
