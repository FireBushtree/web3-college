const { MongoClient, ObjectId } = require('mongodb');

class Course {
  constructor(db) {
    this.collection = db.collection('courses');
  }

  async create(courseData) {
    const { name, description, price } = courseData;
    
    if (!name || !description || price === undefined) {
      throw new Error('课程名称、简介和价格都是必填字段');
    }

    const course = {
      name,
      description,
      price: Number(price),
      createdAt: new Date(),
      updatedAt: new Date()
    };

    const result = await this.collection.insertOne(course);
    return { _id: result.insertedId, ...course };
  }

  async findAll() {
    return await this.collection.find({}).toArray();
  }

  async findById(id) {
    return await this.collection.findOne({ _id: new ObjectId(id) });
  }
}

module.exports = Course;