const fs = require("fs");



const deleteFile = (filePath) => {
    return fs.unlink(filePath, (err) =>  {
        if (err) {
            throw (err)
        }
    })
}


exports.deleteFile = deleteFile;