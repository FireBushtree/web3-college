const { ObjectId } = require('mongodb');

class Course {
  constructor(db) {
    this.collection = db.collection('courses');
  }

  async create(courseData) {
    const { name, description, price, creator } = courseData;
    
    if (!name || !description || price === undefined) {
      throw new Error('课程名称、简介和价格都是必填字段');
    }

    if (!creator) {
      throw new Error('课程创建者是必填字段');
    }

    const course = {
      name,
      description,
      price: Number(price),
      creator,
      enabled: false,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    const result = await this.collection.insertOne(course);
    return { _id: result.insertedId, ...course };
  }

  async findAll() {
    return await this.collection.find({}).toArray();
  }

  async findByIds(ids) {
    try {
      const objectIds = ids.map(id => ObjectId.createFromHexString(id));
      return await this.collection.find({ _id: { $in: objectIds } }).toArray();
    } catch (error) {
      throw new Error('无效的课程ID格式');
    }
  }

  async findById(id) {
    try {
      return await this.collection.findOne({ _id: ObjectId.createFromHexString(id) });
    } catch (error) {
      throw new Error('无效的课程ID格式');
    }
  }

  async updateEnabled(id, enabled) {
    try {
      const result = await this.collection.updateOne(
        { _id: ObjectId.createFromHexString(id) },
        { 
          $set: { 
            enabled,
            updatedAt: new Date()
          }
        }
      );
      
      if (result.matchedCount === 0) {
        throw new Error('课程不存在');
      }
      
      return await this.findById(id);
    } catch (error) {
      if (error.message === '课程不存在') {
        throw error;
      }
      throw new Error('无效的课程ID格式');
    }
  }
}

module.exports = Course;