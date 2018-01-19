const Koa = require('koa');
const app = new Koa();
const route = require('koa-route');
const koaBody = require('koa-body');
//const serve = require('koa-static');

//404页面
var e404 = require('../index/e404');
app.use(route.get('/404.html', e404));


//无效地址重定向
app.use(async function(ctx, next) {
  await next();
  if (ctx.body || !ctx.idempotent) return;
  ctx.redirect('/404.html');
});


//index页面配置
var url_index = require('../index/url_index');
app.use(route.get('/', url_index));

//about页面配置
var url_about = require('../about/url_about');
app.use(route.get('/about', url_about));

//xmd_exc页面配置
var url_xmdexc = require('../xmd_exc/url_xmdexc');
app.use(route.get('/xmd-to-exc', url_xmdexc));


//xmd_exc的POST请求处理
var upload = require('../xmd_exc/views');
app.use(koaBody({ multipart: true }));
app.use(route.post('/xmd-to-exc', upload));


//app.listen(3000);
//console.log('app started at port 3000...');