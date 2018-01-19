const os = require('os');
const path = require('path');
const fs = require('fs')
const koaBody = require('koa-body');
const moment = require('moment');
const send = require('koa-send');
const xmind2excel =require("./xmd_esc");

//设置时间
var sleep = function (time) {
    return new Promise(function (resolve, reject) {
        setTimeout(function () {
            resolve();
        }, time);
    })
};

//删除文件
var callback = function (err) {
  if (err) throw err;
  console.log('删除文件成功')
}
var upload =  async function(ctx, next) {
  // ignore non-POSTs
  if ('POST' != ctx.method) return await next();
  const file = ctx.request.body.files.file;
  const reader = fs.createReadStream(file.path);
  const name = file.name.substr(0,file.name.length-6) + moment(new Date).format("(YYYY-MM-DD#HHmmss)")
  var xmindFile =  path.join(__dirname, '/usersfile/xmind', name + '.xmind')
  const stream = fs.createWriteStream(xmindFile);
  reader.pipe(stream);
  console.log('uploading %s -> %s', file.name, stream.path);
  const fileName = name + '.xlsx'
  var excelFile = path.join(__dirname, '/usersfile/excel', fileName)
  await reader.on('end', await async function () {
    let result = xmind2excel.x2e(xmindFile, excelFile)
    console.log('RESULT:' + result)
    ctx.attachment(fileName);
    await send(ctx, fileName, { root: __dirname + '/usersfile/excel' });
  });
  await sleep(15000)
  fs.unlink(xmindFile, callback);
  fs.unlink(excelFile, callback);
  //ctx.redirect('/');
};

module.exports = upload;
