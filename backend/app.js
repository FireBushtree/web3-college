const Koa = require('koa');
const bodyParser = require('koa-bodyparser');
const { connectToDatabase } = require('./config/database');
const courseRoutes = require('./routes/courses');

const app = new Koa();

app.use(bodyParser());

const apiRouter = new (require('koa-router'))({ prefix: '/api' });
apiRouter.use('/courses', courseRoutes.routes(), courseRoutes.allowedMethods());

app.use(apiRouter.routes());
app.use(apiRouter.allowedMethods());

app.use(async (ctx) => {
  ctx.status = 404;
  ctx.body = {
    success: false,
    message: '接口不存在'
  };
});

const PORT = process.env.PORT || 3000;

async function startServer() {
  try {
    await connectToDatabase();
    
    app.listen(PORT, () => {
      console.log(`服务器运行在端口 ${PORT}`);
      console.log(`课程新增接口: POST http://localhost:${PORT}/api/courses`);
      console.log(`课程查询接口: GET http://localhost:${PORT}/api/courses`);
    });
  } catch (error) {
    console.error('启动服务器失败:', error);
    process.exit(1);
  }
}

startServer();