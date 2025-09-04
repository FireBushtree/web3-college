const Koa = require('koa');
const bodyParser = require('koa-bodyparser');
const { connectToDatabase } = require('./config/database');
const courseRoutes = require('./routes/courses');
const { router: authRoutes } = require('./routes/auth');

const app = new Koa();

app.use(bodyParser());

const apiRouter = new (require('koa-router'))({ prefix: '/api' });
apiRouter.use('/courses', courseRoutes.routes(), courseRoutes.allowedMethods());
apiRouter.use('/auth', authRoutes.routes(), authRoutes.allowedMethods());

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
      console.log(`钱包验证接口: POST http://localhost:${PORT}/api/auth/verify-wallet`);
      console.log(`获取验证消息: GET http://localhost:${PORT}/api/auth/nonce`);
      console.log(`Header认证验证: POST http://localhost:${PORT}/api/auth/verify-token`);
      console.log(`生成认证消息: POST http://localhost:${PORT}/api/auth/generate-message`);
      console.log(`受保护的接口示例: GET http://localhost:${PORT}/api/auth/profile`);
    });
  } catch (error) {
    console.error('启动服务器失败:', error);
    process.exit(1);
  }
}

startServer();