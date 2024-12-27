const mongoose = require('mongoose');

//MongoDB connection string
const mongoURI = process.env.MONGO_URI || 'mongodb+srv://wachirasimon816:816%40Semwa1234@cluster-1.hsupj.mongodb.net/MobileTransaction?retryWrites=true&w=majority&appName=Cluster-1';

const connectToDatabase = async () => {
    try {
        await mongoose.connect(mongoURI, {
            useNewUrlParser: true,
      useUnifiedTopology: true,
            
        });
        console.log('Connected to MongoDB successfully.');
    } catch (error) {
        console.error('Error connecting to MongoDB:', error.message);
        process.exit(1);
    }
};

module.exports = connectToDatabase;
