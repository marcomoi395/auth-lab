const mongoose = require('mongoose');

const connectString = process.env.MONGO_URI;
const maxPoolSize = process.env.MONGO_MAX_POOL_SIZE || 51;

class Database {
    constructor() {
        this.connect();
    }

    async connect() {
        mongoose.set('debug', { color: true });
        try {
            await mongoose.connect(connectString, {
                maxPoolSize,
                useNewUrlParser: true,
                useUnifiedTopology: true,
            });
            console.log('Connected to MongoDB');
        } catch (err) {
            console.error('MongoDB connection error:', err);
        }
    }

    static getInstance() {
        if (!Database.instance) {
            Database.instance = new Database();
        }
        return Database.instance;
    }
}

module.exports = Database.getInstance();
