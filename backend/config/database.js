const { MongoClient } = require('mongodb');

const url = 'mongodb://localhost:27017';
const dbName = 'web3_college';

let db = null;

async function connectToDatabase() {
  try {
    const client = new MongoClient(url);
    await client.connect();
    db = client.db(dbName);
    console.log('成功连接到MongoDB数据库');
    return db;
  } catch (error) {
    console.error('连接数据库失败:', error);
    throw error;
  }
}

function getDatabase() {
  if (!db) {
    throw new Error('数据库未连接，请先调用 connectToDatabase()');
  }
  return db;
}

module.exports = {
  connectToDatabase,
  getDatabase
};