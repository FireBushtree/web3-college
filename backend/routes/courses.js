const Router = require("koa-router");
const Course = require("../models/Course");
const { getDatabase } = require("../config/database");
const { authMiddleware } = require("./auth");

const router = new Router();

router.post("/", async (ctx) => {
  try {
    const db = getDatabase();
    const courseModel = new Course(db);

    const { name, description, price, creator } = ctx.request.body;

    const course = await courseModel.create({
      name,
      description,
      price,
      creator,
    });

    ctx.status = 201;
    ctx.body = {
      success: true,
      message: "课程创建成功",
      data: course,
    };
  } catch (error) {
    ctx.status = 400;
    ctx.body = {
      success: false,
      message: error.message,
    };
  }
});

router.get("/", async (ctx) => {
  try {
    const db = getDatabase();
    const courseModel = new Course(db);

    const { idList } = ctx.query;
    let courses;

    if (idList) {
      const ids = Array.isArray(idList) ? idList : idList.split(",");
      courses = await courseModel.findByIds(ids);
    } else {
      courses = await courseModel.findAll();
    }

    ctx.status = 200;
    ctx.body = {
      success: true,
      message: "获取课程列表成功",
      data: courses,
    };
  } catch (error) {
    ctx.status = 500;
    ctx.body = {
      success: false,
      message: error.message,
    };
  }
});

router.get("/user", authMiddleware, async (ctx) => {
  try {
    const db = getDatabase();
    const courseModel = new Course(db);
    const authenticatedAddress = ctx.state.auth.address;

    if (!authenticatedAddress) {
      ctx.status = 500;
      ctx.body = {
        success: false,
        message: "缺少用户信息",
      };
    }

    // 查找该用户创建的课程
    const courses = await courseModel.findByCreator(authenticatedAddress);

    ctx.status = 200;
    ctx.body = {
      success: true,
      message: "获取用户课程列表成功",
      data: {
        courses: courses || [],
      },
    };
  } catch (error) {
    ctx.status = 500;
    ctx.body = {
      success: false,
      message: error.message,
    };
  }
});

router.put("/:id/enable", async (ctx) => {
  try {
    const db = getDatabase();
    const courseModel = new Course(db);

    const course = await courseModel.updateEnabled(ctx.params.id, true);

    ctx.status = 200;
    ctx.body = {
      success: true,
      message: "课程启用成功",
      data: course,
    };
  } catch (error) {
    ctx.status = 400;
    ctx.body = {
      success: false,
      message: error.message,
    };
  }
});

router.put("/:id/disable", async (ctx) => {
  try {
    const db = getDatabase();
    const courseModel = new Course(db);

    const course = await courseModel.updateEnabled(ctx.params.id, false);

    ctx.status = 200;
    ctx.body = {
      success: true,
      message: "课程禁用成功",
      data: course,
    };
  } catch (error) {
    ctx.status = 400;
    ctx.body = {
      success: false,
      message: error.message,
    };
  }
});

router.get("/:id", async (ctx) => {
  try {
    const db = getDatabase();
    const courseModel = new Course(db);

    const course = await courseModel.findById(ctx.params.id);

    if (!course) {
      ctx.status = 404;
      ctx.body = {
        success: false,
        message: "课程不存在",
      };
      return;
    }

    ctx.status = 200;
    ctx.body = {
      success: true,
      message: "获取课程详情成功",
      data: course,
    };
  } catch (error) {
    ctx.status = 400;
    ctx.body = {
      success: false,
      message: error.message,
    };
  }
});

module.exports = router;
