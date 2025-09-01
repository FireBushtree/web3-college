const Router = require('koa-router');
const Course = require('../models/Course');
const { getDatabase } = require('../config/database');

const router = new Router();

router.post('/', async (ctx) => {
  try {
    const db = getDatabase();
    const courseModel = new Course(db);
    
    const { name, description, price, creator } = ctx.request.body;
    
    const course = await courseModel.create({ name, description, price, creator });
    
    ctx.status = 201;
    ctx.body = {
      success: true,
      message: '课程创建成功',
      data: course
    };
  } catch (error) {
    ctx.status = 400;
    ctx.body = {
      success: false,
      message: error.message
    };
  }
});

router.get('/', async (ctx) => {
  try {
    const db = getDatabase();
    const courseModel = new Course(db);
    
    const courses = await courseModel.findAll();
    
    ctx.status = 200;
    ctx.body = {
      success: true,
      message: '获取课程列表成功',
      data: courses
    };
  } catch (error) {
    ctx.status = 500;
    ctx.body = {
      success: false,
      message: error.message
    };
  }
});

router.put('/:id/enable', async (ctx) => {
  try {
    const db = getDatabase();
    const courseModel = new Course(db);
    
    const course = await courseModel.updateEnabled(ctx.params.id, true);
    
    ctx.status = 200;
    ctx.body = {
      success: true,
      message: '课程启用成功',
      data: course
    };
  } catch (error) {
    ctx.status = 400;
    ctx.body = {
      success: false,
      message: error.message
    };
  }
});

router.put('/:id/disable', async (ctx) => {
  try {
    const db = getDatabase();
    const courseModel = new Course(db);
    
    const course = await courseModel.updateEnabled(ctx.params.id, false);
    
    ctx.status = 200;
    ctx.body = {
      success: true,
      message: '课程禁用成功',
      data: course
    };
  } catch (error) {
    ctx.status = 400;
    ctx.body = {
      success: false,
      message: error.message
    };
  }
});

module.exports = router;