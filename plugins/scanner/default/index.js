const fs = require('fs');
const path = require('path');

const {getAllFileExtensions, doScan, isBookFolder} = require('./valid');

/**
 * must resturn promise
 */
module.exports = async function scan(){
  const libraryPath = this.root;
  const logger = this.logger;
  const result = this.result;
  try
  {
    // list of absolute path[]
    const queue = [];

    fs.readdirSync(libraryPath).forEach((file) => {
      queue.push(path.resolve(libraryPath, file))
    });

    while(queue.length > 0)
    {
      const fileAbsolutePath = queue.shift();
      const stat = fs.statSync(fileAbsolutePath);

      if(stat.isDirectory())
      {
        if(isBookFolder(fileAbsolutePath))
        {
          logger.verbose(`add a book to db: ${fileAbsolutePath}`);
          result.push({
            path: fileAbsolutePath,
            type: 'folder',
            time: new Date().getTime(),
          })
        }
        else
        {
          fs.readdirSync(fileAbsolutePath).forEach((file) => {
            queue.push(path.resolve(fileAbsolutePath, file))
          });
        }
      }
      else if(stat.isFile())
      {
        // zip, txt, pdf, epub logic
        const ext = path.extname(fileAbsolutePath).toLowerCase();
        const fileExtensions = getAllFileExtensions();

        if(!fileExtensions.includes(ext))
        {
          logger.debug('not supported file: ' + fileAbsolutePath)
          continue;
        }

        if(!doScan(fileAbsolutePath))
        {
          continue;
        }

        logger.verbose(`add a book to db: ${fileAbsolutePath}`);
        result.push({
          path: fileAbsolutePath,
          type: ext,
          time: new Date().getTime(),
        })
      }
    }
    this.end = new Date().getTime();
  }
  catch(e)
  {
    logger.error(e);
  }
}