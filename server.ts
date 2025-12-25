import express, { Express, Request, Response } from 'express';
import http from 'http';
import { Server as SocketIOServer, Socket } from 'socket.io';
import mongoose, { Schema, Document } from 'mongoose';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import cors from 'cors';
import fs from 'fs';
import path from 'path';

const app: Express = express();
const server = http.createServer(app);
const io = new SocketIOServer(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST'],
  },
  maxHttpBufferSize: 50e6, // 50 MB - allows large base64 images
  pingTimeout: 60000,
  pingInterval: 25000,
});

const PORT = process.env.PORT || 3001;

// Ensure uploads directory exists
const uploadsDir = path.join(process.cwd(), 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Middleware
app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// Serve local uploads
app.use('/uploads', express.static(uploadsDir));

// MongoDB Connection
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/sling-shot';

mongoose
  .connect(MONGODB_URI)
  .then(() => console.log('✓ MongoDB connected'))
  .catch((err) => console.error('✗ MongoDB connection error:', err));

// Message Schema
interface IMessage extends Document {
  userName: string;
  message: string;
  imageUrl: string;
  imageKey: string;
  createdAt: Date;
}

const messageSchema = new Schema<IMessage>({
  userName: { type: String, required: true },
  message: { type: String, required: true },
  imageUrl: { type: String, required: true },
  imageKey: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
});

const Message = mongoose.model<IMessage>('Message', messageSchema);

// S3 Configuration
const s3Client = new S3Client({
  region: process.env.AWS_REGION || 'us-east-1',
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID || '',
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || '',
  },
});

// Utility function to save image locally
async function saveImageLocally(
  imageData: string,
  fileName: string
): Promise<{ url: string; key: string }> {
  try {
    const base64Data = imageData.replace(/^data:image\/\w+;base64,/, '');
    const buffer = Buffer.from(base64Data, 'base64');
    const ext = imageData.split(';')[0].split('/')[1];
    const key = `${Date.now()}-${fileName}.${ext}`;
    const filePath = path.join(uploadsDir, key);

    fs.writeFileSync(filePath, buffer);

    const url = `/uploads/${key}`;
    return { url, key };
  } catch (error) {
    console.error('Local Storage Error:', error);
    throw new Error('Failed to save image locally');
  }
}

// Utility function to upload image (S3 or Local)
async function uploadImage(
  imageData: string,
  fileName: string
): Promise<{ url: string; key: string }> {
  // Check if S3 credentials are available
  const hasS3Credentials =
    process.env.AWS_ACCESS_KEY_ID &&
    process.env.AWS_SECRET_ACCESS_KEY &&
    process.env.AWS_S3_BUCKET;

  if (hasS3Credentials) {
    try {
      return await uploadImageToS3(imageData, fileName);
    } catch (error) {
      console.warn('S3 upload failed, falling back to local storage');
      return await saveImageLocally(imageData, fileName);
    }
  } else {
    return await saveImageLocally(imageData, fileName);
  }
}

// Utility function to upload image to S3
async function uploadImageToS3(
  imageData: string,
  fileName: string
): Promise<{ url: string; key: string }> {
  try {
    const base64Data = imageData.replace(/^data:image\/\w+;base64,/, '');
    const buffer = Buffer.from(base64Data, 'base64');
    const ext = imageData.split(';')[0].split('/')[1];
    const key = `messages/${Date.now()}-${fileName}.${ext}`;

    const command = new PutObjectCommand({
      Bucket: process.env.AWS_S3_BUCKET || 'sling-shot-bucket',
      Key: key,
      Body: buffer,
      ContentType: `image/${ext}`,
    });

    await s3Client.send(command);

    const url = `https://${process.env.AWS_S3_BUCKET}.s3.${process.env.AWS_REGION || 'us-east-1'}.amazonaws.com/${key}`;
    return { url, key };
  } catch (error) {
    console.error('S3 Upload Error:', error);
    throw new Error('Failed to upload image to S3');
  }
}

// Socket.IO Events
io.on('connection', (socket: Socket) => {
  console.log(`✓ User connected: ${socket.id}`);

  // Handle incoming messages
  socket.on('send-message', async (data: { image: string; userName: string; message: string }) => {
    try {
      const { image, userName, message } = data;
      console.log('message :', message);
      console.log('userName :', userName);

      // Validate input
      if (!image || !userName || !message) {
        socket.emit('error', { message: 'Missing required fields' });
        return;
      }

      // Upload image to S3 or local storage
      const { url: imageUrl, key: imageKey } = await uploadImage(image, userName);

      // Save to MongoDB
      const newMessage = new Message({
        userName,
        message,
        imageUrl,
        imageKey,
      });

      const savedMessage = await newMessage.save();
      console.log('savedMessage :', savedMessage._id);

      // Emit to all connected clients
      io.emit('receive-message', {
        id: savedMessage._id,
        userName: savedMessage.userName,
        message: savedMessage.message,
        imageUrl: savedMessage.imageUrl,
        createdAt: savedMessage.createdAt,
      });

      // Emit confirmation back to sender
      socket.emit('message-sent', { success: true, messageId: savedMessage._id });
    } catch (error) {
      console.error('Error handling message:', error);
      socket.emit('error', { message: 'Failed to send message' });
    }
  });

  // Handle fetching all messages
  socket.on('get-messages', async () => {
    try {
      const messages = await Message.find().sort({ createdAt: -1 }).limit(50);

      socket.emit('all-messages', {
        messages: messages.map((msg) => ({
          id: msg._id,
          userName: msg.userName,
          message: msg.message,
          imageUrl: msg.imageUrl,
          createdAt: msg.createdAt,
        })),
      });
    } catch (error) {
      console.error('Error fetching messages:', error);
      socket.emit('error', { message: 'Failed to fetch messages' });
    }
  });

  // Handle slingshot shot from mobile app
  socket.on('shotFired', async (data: { 
    name: string; 
    message: string; 
    selfie: string; 
    force: number;
    timestamp: number;
  }) => {
    try {
      const { name, message, selfie, force, timestamp } = data;
      console.log(`🎯 Shot fired by ${name} with force ${force}`);

      // Upload image to S3 or local storage
      const { url: imageUrl, key: imageKey } = await uploadImage(selfie, name);

      // Save to MongoDB
      const newMessage = new Message({
        userName: name,
        message,
        imageUrl,
        imageKey,
      });

      const savedMessage = await newMessage.save();

      // Emit to big screen (display shot)
      console.log('savedMessage.imageUrl :', savedMessage.imageUrl);
      io.emit('displayShot', {
        id: savedMessage._id,
        userName: savedMessage.userName,
        message: savedMessage.message,
        imageUrl: savedMessage.imageUrl,
        force,
        timestamp,
        createdAt: savedMessage.createdAt,
      });

      // Confirm to mobile device
      socket.emit('shotSuccess', { messageId: savedMessage._id });
      console.log(`✓ Shot displayed on big screen`);
    } catch (error) {
      console.error('Error handling shot:', error);
      socket.emit('error', { message: 'Failed to process shot' });
    }
  });

  socket.on('disconnect', () => {
    console.log(`✗ User disconnected: ${socket.id}`);
  });
});

// REST API Endpoints

// Get all messages
app.get('/api/messages', async (req: Request, res: Response) => {
  try {
    const messages = await Message.find().sort({ createdAt: -1 });
    res.json({ success: true, data: messages });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch messages' });
  }
});

// Get single message
app.get('/api/messages/:id', async (req: Request, res: Response) => {
  try {
    const message = await Message.findById(req.params.id);
    if (!message) {
      res.status(404).json({ success: false, message: 'Message not found' });
      return;
    }
    res.json({ success: true, data: message });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch message' });
  }
});

// Delete message
app.delete('/api/messages/:id', async (req: Request, res: Response) => {
  try {
    const message = await Message.findByIdAndDelete(req.params.id);
    if (!message) {
      res.status(404).json({ success: false, message: 'Message not found' });
      return;
    }
    res.json({ success: true, message: 'Message deleted' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to delete message' });
  }
});

// Health check
app.get('/health', (req: Request, res: Response) => {
  res.json({ status: 'Server is running' });
});

server.listen(PORT, () => {
  console.log(`\n🚀 Server running on ${PORT}`);
  console.log(`📡 Socket.IO ready for connections\n`);
});
