import { createClient } from 'redis';

const redisClient = createClient();

redisClient.on('error', (err) => console.error('Redis Client Error', err));

const subscribeToOrderEvents = async () => {
    try {

        await redisClient.connect();

        console.log(`[${new Date().toISOString()}] Redis Client connected`);

        await redisClient.subscribe('order_events', (message) => {

            console.log(`------------------------------------------------------------------------------------------`);
            console.log(`[${new Date().toISOString()}] | Step 1 : Order fullfillment Update request receieved through subscriber from Redis:`);

            try {
                const eventData = JSON.parse(message);
                processOrder(eventData);
            } catch (parseError) {
                console.error(`[${new Date().toISOString()}] Error parsing message: ${message}`, parseError);
            }
        });

        console.log(`[${new Date().toISOString()}] subscribed to order_events channel...`);

    } catch (error) {
        console.error(`[${new Date().toISOString()}] Error subscribing to Redis channel`, error);
    }
};

const delayWithSpinner = async (ms) => {
    const spinnerChars = ['/', '-', '\\', '-'];
    let spinnerIndex = 0;

    const spinner = setInterval(() => {
        process.stdout.write(`\r    ${spinnerChars[spinnerIndex++]}`);
        spinnerIndex %= spinnerChars.length;
    }, 200);

    await new Promise(resolve => setTimeout(resolve, ms));

    clearInterval(spinner);
    process.stdout.write('\r');
};

const processOrder = async (eventData) => {
    try {

        console.log(`[${new Date().toISOString()}] | Step 2 : Update:  Order fullfillment triggered ${eventData.orderId} for user ${eventData.userId}`);
        
        // Simulate order processing logic here
        await delayWithSpinner(2000);        

        console.log(`[${new Date().toISOString()}] | Step 3 : Update:  Order fullfillment completed successfully ${eventData.orderId}, user ${eventData.userId}`);


    } catch (error) {
        console.error(`[${new Date().toISOString()}] Error processing order ${eventData.orderId}`, error);
    } finally {
        console.log(`------------------------------------------------------------------------------------------`);
    }
};

// Start subscribing to the order events
subscribeToOrderEvents().catch(error => {
    console.error(`[${new Date().toISOString()}] Failed to subscribe to Redis events`, error);
});
