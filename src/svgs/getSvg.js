//  getSvg.js
const fs = require('fs');
const path = require('path');

const svgDir = path.resolve(__dirname, './assets');

// 读取单个文件
function readfile(filename) {
  return new Promise((resolve, reject) => {
    fs.readFile(path.join(svgDir, filename), 'utf8', (err, data) => {
      // console.log(data.replace(/<\?xml.*?\?>|<\!--.*?-->|<!DOCTYPE.*?>/g, ''));
      if (err) {
        reject(err);
      }

      // remove comment

      const comment = `<!-- Generator: Sketch 52.4 (67378) - http://www.bohemiancoding.com/sketch -->`;
      const commentStart = data.indexOf(comment);
      const commentEnd = data.indexOf(comment) + comment.length;
      const commentData =
          data.substring(0, commentStart) + data.substring(commentEnd);

      // remove title
      const titleStart = commentData.indexOf('<title>');
      const titleEnd = commentData.indexOf('</title>') + '</title>'.length;
      const titleData =
          commentData.substring(0, titleStart) + commentData.substring(titleEnd);

      // remove desc
      const descStart = titleData.indexOf('<desc>');
      const descEnd = titleData.indexOf('</desc>') + '</desc>'.length;
      const descData =
          titleData.substring(0, descStart) + titleData.substring(descEnd);
      resolve({
        [filename.slice(0, filename.lastIndexOf('.'))]: descData,
      });
    });
  });
}

// 读取SVG文件夹下所有svg
function readSvgs() {
  return new Promise((resolve, reject) => {
    // Logger.info(`svgDir: ${svgDir}`);
    fs.readdir(svgDir, (err, files) => {
      if (err) {
        reject(err);
      }

      Promise.all(files.map(filename => readfile(filename)))
          .then(data => resolve(data))
          .catch(err1 => reject(err1));
    });
  });
}

// 生成js文件
readSvgs()
    .then(data => {
      const svgFile = `export default ${JSON.stringify(
          Object.assign.apply(this, data),
      )}`;
      fs.writeFile(path.resolve(__dirname, './svgs.js'), svgFile, err => {
        if (err) {
          throw new Error(err);
        }
      });
    })
    .catch(err => {
      throw new Error(err)
    })
