require('dotenv').config();
const mongoose = require('mongoose');

const uri = process.env.MONGO_URI;

mongoose.connect(uri)
  .then(async () => {

    const User = mongoose.model('User', {
      name: String,
      age: Number
    });

    const user = await User.create({ name: 'Thomas', age: 22 });
    console.log('✔️ Inserted:', user);

    const found = await User.find({ age: { $gte: 18 } });
    console.log('🔍 Found users >= 18:', found);

    const updated = await User.updateOne({ name: 'Thomas' }, { $set: { age: 23 } });
    console.log('🔄 Updated count:', updated.modifiedCount);

    const deleted = await User.deleteOne({ name: 'Thomas' });
    console.log('❌ Deleted count:', deleted.deletedCount);

    mongoose.connection.close();
  })
  .catch(err => {
    console.error('❌ Error:', err);
  });
