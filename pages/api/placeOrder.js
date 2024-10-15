import { createClient } from 'redis';

const redisClient = createClient();

redisClient.on('error', (err) => console.error('Redis Client Error', err));

export default async function handler(req, res) {
    try {
        
        console.log(`------------------------------------------------------------------------------------------`);        
        
        console.log(`[${new Date().toISOString()}] | Step 1 : Received request from a client to place an order`);

        if (req.method === 'POST') {
            const { orderId, userId, items } = req.body;

            if (!orderId || !userId || !items || !items.length) {
                console.log('Invalid order data received');
                return res.status(400).json({ error: 'Invalid order data' });
            }
            
            const channel = 'order_events';           

            await redisClient.connect();
            
            console.log(`[${new Date().toISOString()}] | Step 2 : Redis Client connected`);

            await redisClient.publish(channel, JSON.stringify({ orderId, userId, items }));

            console.log(`[${new Date().toISOString()}] | Step 3 : Order getting posted to redis`);

            await redisClient.quit();

            console.log(`[${new Date().toISOString()}] | Step 4 : Redis Client disconnected`);

            res.status(200).json({ status: 'Order placed', orderId });
        }
        else {
            res.setHeader('Allow', ['POST']);
            res.status(405).end(`Method ${req.method} Not Allowed`);
            console.log(`Method ${req.method} is not allowed. Only POST is allowed.`);
        }
    } catch (error) {
        console.error('Error in placeOrder API:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }finally{
        console.log(`[${new Date().toISOString()}] | Step 5 : Service responded back to client browser`);
        console.log(`------------------------------------------------------------------------------------------`);
    }
}
