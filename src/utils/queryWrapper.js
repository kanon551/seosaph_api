  const mongoose = require('mongoose');
  const path = require('path');
  const ShortUniqueId = require('short-unique-id');
  const { NotAcceptableException } = require('../utils/exceptions');

    const getRelevantModel = async(collectionName) => {
        const schemaPath = path.join(__dirname, `../models/${collectionName}`);
        const { [`${collectionName}Schema`]: CollectionSchema } = require(schemaPath);
        const model = mongoose.model(collectionName, CollectionSchema, collectionName);
        return model;
    }

  const find = async(collectionName, queryObject) => {
    
      const model = await getRelevantModel(collectionName);
      const results = await model.find(queryObject.filter)
        .select(queryObject.projection)
        .sort(queryObject.sort)
        .limit(queryObject.limit)
        .lean();
      
      return results;

  }

  const findOne = async(collectionName, queryObject) => {
      
      const model = await getRelevantModel(collectionName);
      const results = await model.findOne(queryObject.filter)
        .select(queryObject.projection)
        .lean();
      
      return results;
  
  }

  const findByQueryPagination = async (collectionName, queryObject) => {
    const model = await getRelevantModel(collectionName);
  
    // Ensure the model has the paginate plugin
    if (typeof model.paginate !== 'function') {
      throw new NotAcceptableException(`${collectionName} does not support pagination. Make sure mongoose-paginate-v2 is applied to its schema.`);
    }
  
    const {
      filter = {},
      projection = {},
      sort = { createdAt: -1 },
      page = 1,
      limit = 20
    } = queryObject;
  
    const options = {
      select: projection,
      sort,
      page: parseInt(page),
      limit: parseInt(limit),
      lean: true
    };
  
    const results = await model.paginate(filter, options);
    return results;
  };

  const aggregate = async (collectionName, pipeline) => {
    const model = await getRelevantModel(collectionName);
    const results = await model.aggregate(pipeline);
    return results;
  };

  const save = async (collectionName, data) => {
  
      const model = await getRelevantModel(collectionName);
      const newDocument = new model(data);
      await newDocument.save();
  
      return newDocument;
  };

  const getById = async (collectionName, id) => {
    
    const model = await getRelevantModel(collectionName);
    const document = await model.findById(id).lean();
    return document;
};

const updateDocument = async (collectionName, id, updateData) => {

  const model = await getRelevantModel(collectionName);
  const updatedDocument = await model.findByIdAndUpdate(id, updateData, { new: true }).lean();
  return updatedDocument;
};

const deleteDocument = async (collectionName, id) => {

  const model = await getRelevantModel(collectionName);
  await model.findByIdAndDelete(id);
  return { message: 'Document deleted successfully' };
};

const upsert = async (collectionName, payload) => {
  const model = await getRelevantModel(collectionName);
      const { randomUUID } = new ShortUniqueId({ length: 24 });

      payload.update.$setOnInsert = {
        _id: randomUUID(),
        ...payload.update.$setOnInsert
      };
      const upsertDocument = await model.findOneAndUpdate(
        payload.filter,
        payload.update,
        { upsert: true, returnDocument: 'after' }
    ).lean();

    return upsertDocument;
};


  module.exports = { find, findOne, save, getById, updateDocument, deleteDocument, upsert, findByQueryPagination, aggregate };