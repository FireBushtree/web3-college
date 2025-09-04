const Router = require('koa-router');
const { ethers } = require('ethers');

const router = new Router();

// 认证中间件
const authMiddleware = async (ctx, next) => {
  try {
    const address = ctx.headers['x-auth-address'];
    const message = decodeURIComponent(ctx.headers['x-auth-message'] || '');
    const signature = ctx.headers['x-auth-signature'];
    const timestamp = parseInt(ctx.headers['x-auth-timestamp'] || '0');
    const expiry = parseInt(ctx.headers['x-auth-expiry'] || '0');

    // 检查必要的认证头
    if (!address || !message || !signature || !timestamp || !expiry) {
      ctx.status = 401;
      ctx.body = {
        success: false,
        message: '缺少必要的认证头信息'
      };
      return;
    }

    // 验证地址格式
    if (!ethers.isAddress(address)) {
      ctx.status = 401;
      ctx.body = {
        success: false,
        message: '无效的钱包地址格式'
      };
      return;
    }

    // 检查过期时间
    const now = Math.floor(Date.now() / 1000);
    if (now > expiry) {
      ctx.status = 401;
      ctx.body = {
        success: false,
        message: '认证已过期，请重新签名'
      };
      return;
    }

    // 验证签名
    try {
      const recoveredAddress = ethers.verifyMessage(message, signature);

      if (recoveredAddress.toLowerCase() !== address.toLowerCase()) {
        ctx.status = 401;
        ctx.body = {
          success: false,
          message: '签名验证失败'
        };
        return;
      }

      // 验证消息格式和内容
      if (!message.includes(`地址: ${address}`) ||
          !message.includes(`签发时间: ${timestamp}`) ||
          !message.includes(`过期时间: ${expiry}`)) {
        ctx.status = 401;
        ctx.body = {
          success: false,
          message: '消息格式验证失败'
        };
        return;
      }

      // 将认证信息添加到上下文
      ctx.state.auth = {
        address,
        timestamp,
        expiry,
        remainingSeconds: expiry - now
      };

      await next();
    } catch (signatureError) {
      ctx.status = 401;
      ctx.body = {
        success: false,
        message: '签名验证失败',
        error: signatureError.message
      };
    }
  } catch (error) {
    console.error('认证中间件错误:', error);
    ctx.status = 500;
    ctx.body = {
      success: false,
      message: '服务器内部错误'
    };
  }
};
/**
 * 验证Token接口（Header方式）
 * POST /api/auth/verify-token
 */
router.post('/verify-token', authMiddleware, async (ctx) => {
  try {
    const { address, timestamp, expiry, remainingSeconds } = ctx.state.auth;

    ctx.status = 200;
    ctx.body = {
      success: true,
      message: '认证验证成功',
      data: {
        address,
        authenticated: true,
        timestamp,
        expiry,
        remainingSeconds,
        remainingTime: `${Math.floor(remainingSeconds / 60)} 分钟`,
        expiryDate: new Date(expiry * 1000).toLocaleString('zh-CN')
      }
    };
  } catch (error) {
    console.error('Token验证错误:', error);
    ctx.status = 500;
    ctx.body = {
      success: false,
      message: '服务器内部错误'
    };
  }
});

/**
 * 生成符合前端格式的认证消息
 * POST /api/auth/generate-message
 */
router.post('/generate-message', async (ctx) => {
  try {
    const { address, validHours = 24 } = ctx.request.body;

    if (!address) {
      ctx.status = 400;
      ctx.body = {
        success: false,
        message: '缺少钱包地址参数'
      };
      return;
    }

    if (!ethers.isAddress(address)) {
      ctx.status = 400;
      ctx.body = {
        success: false,
        message: '无效的钱包地址格式'
      };
      return;
    }

    const now = Math.floor(Date.now() / 1000);
    const expiry = now + (validHours * 3600);

    const message = `去中心化认证
地址: ${address}
签发时间: ${now}
过期时间: ${expiry}
域名: ${ctx.headers.host || 'localhost'}
随机数: ${Math.random().toString(36)}`;

    ctx.status = 200;
    ctx.body = {
      success: true,
      message: '生成认证消息成功',
      data: {
        message,
        address,
        timestamp: now,
        expiry,
        validHours
      }
    };
  } catch (error) {
    console.error('生成认证消息错误:', error);
    ctx.status = 500;
    ctx.body = {
      success: false,
      message: '服务器内部错误'
    };
  }
});


module.exports = { router, authMiddleware };