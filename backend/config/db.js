const mongoose = require('mongoose');

const connectDB = async () => {
    try {
        const mongoURI = process.env.MONGODB_URI;
        
        if (!mongoURI) {
            throw new Error('MONGODB_URI environment variable is required');
        }

        // Connection event handlers
        mongoose.connection.on('connected', () => {
            console.log("✅ Database connected successfully");
            console.log(`📍 Connected to: ${mongoURI.replace(/\/\/.*@/, '//***:***@')}`);
        });

        mongoose.connection.on('error', (err) => {
            console.error("❌ Database connection error:", err.message);
        });

        mongoose.connection.on('disconnected', () => {
            console.warn("⚠️  Database disconnected");
        });

        mongoose.connection.on('reconnected', () => {
            console.log("🔄 Database reconnected");
        });

        // Simple connection options for local development
        const options = {
            maxPoolSize: 10,
            serverSelectionTimeoutMS: 5000,
            socketTimeoutMS: 45000
        };

        // Log connection attempt
        console.log("🔌 Attempting database connection...");

        await mongoose.connect(mongoURI, options);
        
        // Set up graceful shutdown
        process.on('SIGINT', async () => {
            console.log('🛑 Received SIGINT, closing database connection...');
            await mongoose.connection.close();
            console.log('✅ Database connection closed');
            process.exit(0);
        });

        process.on('SIGTERM', async () => {
            console.log('🛑 Received SIGTERM, closing database connection...');
            await mongoose.connection.close();
            console.log('✅ Database connection closed');
            process.exit(0);
        });
        
    } catch (error) {
        console.error("❌ MongoDB connection failed:", error.message);
        if (process.env.NODE_ENV === 'development') {
            console.error("Stack trace:", error.stack);
            console.log("Troubleshooting tips:");
            console.log("- Check your internet connection");
            console.log("- Verify MongoDB Atlas IP whitelist settings");
            console.log("- Confirm MONGODB_URI in .env file is correct");
            console.log("- Ensure MongoDB service is running (if using local MongoDB)");
            console.log("- Check database credentials and permissions");
        }
        process.exit(1);
    }
}

module.exports = connectDB;