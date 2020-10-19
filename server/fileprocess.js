// do first scan
// and watch libirary folder
// https://bezkoder.com/node-js-watch-folder-changes/
// get basedir info from ../bin/www

const fs = require("fs");
const FileType = require("file-type");
const path = require("path");
const colors = require("colors");

const model = require("./model");

const basedir = path.resolve("./books");

// functions
const firstScan = (dir) => {
  fs.readdir(dir, { withFileTypes: true }, (err, files) => {
    if (err) {
      console.error(err.red);
      console.trace();
    } else {
      files.forEach(async (file) => {
        if (file.isFile()) {
          try {
            let type = await FileType.fromFile(path.join(dir, file.name));
            type = type ? type.ext : file.name.split(".").pop();

            let book = new model.book();
            book.type = type;
            book.path = path.join(dir, file.name);
            book._id = book.path;
            book.parent = dir;
            book.added = new Date().toJSON();
            book.last_seen_page = 0;

            model.library.put(book);
          } catch (e) {
            console.error(e.red);
            console.trace();
          }
        } else {
          // this is folder
          // do recursive work
          firstScan(path.join(dir, file.name));
        }
      });
    }
  });
};

///

firstScan(basedir);
