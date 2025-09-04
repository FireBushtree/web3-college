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

  async findByCreator(creator) {
    return await this.collection.find({ creator }).toArray();
  }

  async update(id, updateData) {
    const { name, description, price } = updateData;
    
    // 构建更新对象，只包含提供的字段
    const updateObj = {
      updatedAt: new Date()
    };
    
    if (name !== undefined) {
      if (!name.trim()) {
        throw new Error('课程名称不能为空');
      }
      updateObj.name = name;
    }
    
    if (description !== undefined) {
      if (!description.trim()) {
        throw new Error('课程简介不能为空');
      }
      updateObj.description = description;
    }
    
    if (price !== undefined) {
      if (price < 0) {
        throw new Error('课程价格不能为负数');
      }
      updateObj.price = Number(price);
    }
    
    try {
      const result = await this.collection.updateOne(
        { _id: ObjectId.createFromHexString(id) },
        { $set: updateObj }
      );
      
      if (result.matchedCount === 0) {
        throw new Error('课程不存在');
      }
      
      return await this.findById(id);
    } catch (error) {
      if (error.message === '课程不存在' || error.message.includes('不能为空') || error.message.includes('不能为负数')) {
        throw error;
      }
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