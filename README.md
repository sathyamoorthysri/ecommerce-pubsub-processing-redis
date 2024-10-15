# Real-Time Event Processing in E-commerce: Implementing Publisher/Subscriber with Redis streaming features

An event-driven eCommerce application that leverages Redis Pub/Sub for real-time order processing. This project demonstrates asynchronous communication between order placement, confirmation, and inventory updates using Redis.

## Table of Contents

1. [Overview](#overview)
2. [Architecture](#architecture)
3. [Prerequisites](#prerequisites)
4. [Installation](#installation)
5. [Running the Application](#running-the-application)
6. [Features](#features)
7. [Spinner Feature](#spinner-feature)
8. [How It Works](#how-it-works)
9. [Notes](#notes)

---

## Overview

This repository demonstrates an event-driven architecture for an eCommerce platform using Redis Pub/Sub to manage order events asynchronously. It simulates an order processing system that decouples order creation from subsequent order confirmation, email notification, and inventory update tasks, allowing the system to handle high loads efficiently.

## Architecture

The architecture consists of the following key components:

- **Order Publisher**: Publishes an event when a new order is placed.
- **Order Subscriber**: Subscribes to the Redis channel and processes the order event.
- **Redis Pub/Sub**: Redis handles real-time communication between the publisher and subscriber components.

The system implements a delay and spinner in the console to simulate the processing time between steps such as order confirmation and inventory updates.

## Prerequisites

Before running this project, ensure the following is installed:

- **Node.js** (v18 or later)
- **Redis** (v6 or later)
- **Redis CLI** (for monitoring, optional)
- **Fiddler** or another network tool (optional, for observing Redis communication)

## Installation

1. Clone the repository:

    ```bash
    git clone https://github.com/sathyamoorthysri/redis-event-driven-ecommerce.git
    cd redis-event-driven-ecommerce
    ```

2. Install the required dependencies:

    ```bash
    npm install
    ```

3. Ensure that **Redis** is installed and running:

    ```bash
    redis-server
    ```

4. Set up the necessary files:
   - `pages/api/placeorder.js`: Publishes an order event to Redis.
   - `subscribers/EmailConfirmationUpdate.js`: Subscribes to the `order_events` channel and processes the order.
   - `subscribers/FullfillmentUpdate.js`: Subscribes to the `order_events` channel and processes the order.
   - `subscribers/InventoryUpdate.js`: Subscribes to the `order_events` channel and processes the order.

## Running the Application

1. **Start Redis**: Ensure Redis is running locally.

    ```bash
    redis-server
    ```

2. **Run the Subscriber**: Start the subscriber to listen for order events.

    ```bash
    node subscribers/EmailConfirmationUpdate.js
    ```
    ```bash
    node subscribers/FullfillmentUpdate.js
    ```
    ```bash
    node subscribers/InventoryUpdate.js
    ```

3. **Place an Order**: Run the order publisher to send an order event to Redis.

    ```bash
    curl --location 'http://localhost:3000/api/placeOrder' \ --header 'Content-Type: application/json' \ --data '{"orderId": "12345", "userId": "user_1", "items": [{"id": "item_1", "quantity": 2}, {"id": "item_2", "quantity": 1}]}'
    ```

4. **Monitor Redis Communication** (optional):

    Run Redis CLI monitor to observe communication in real-time.

    ```bash
    redis-cli monitor
    ```
   
## Features

- **Event-Driven Architecture**: Utilizes Redis Pub/Sub for real-time event handling.
- **Asynchronous Processing**: Orders are processed asynchronously, allowing the system to scale.
- **Spinner Feedback**: Displays a console spinner during delays to simulate the processing time.
- **Modular Components**: Publisher and subscriber components are decoupled, ensuring flexibility.

## Spinner Feature

During the order processing stages, a loading spinner (`/-\-/`) is displayed in the console. This spinner runs during each step's delay, providing visual feedback.

Example spinner code:

```javascript
const delayWithSpinner = async (ms) => {
    const spinnerChars = ['/', '-', '\\', '-'];
    let spinnerIndex = 0;
    const spinner = setInterval(() => {
        process.stdout.write(`\r   ${spinnerChars[spinnerIndex++]}`);
        spinnerIndex %= spinnerChars.length;
    }, 200);
    await new Promise(resolve => setTimeout(resolve, ms));
    clearInterval(spinner);
    process.stdout.write('\r   \n');
};
```

## How It Works

1. **Order Placement**: A new order is placed by publishing an event to the Redis `order_events` channel using `placeorder.js`.
   
2. **Order Processing**: The subscriber listens to the `order_events` channel and processes the order in three stages:
    - **Processing Order**
    - **Sending Confirmation Email**
    - **Updating Inventory**

3. **Delays and Spinner**: A delay of 2 seconds is introduced between each processing step, with a spinner displayed in the console to simulate the real-time progress.

### Example Order Event

```json
{
  "orderId": "12345",
  "userId": "user_1",
  "items": [
    { "productId": "prod_1", "quantity": 2 },
    { "productId": "prod_2", "quantity": 1 }
  ]
}
```

### Example Console Output

```
------------------------------------------------------------------------------------------
[2024-10-15T07:17:04.274Z] | Step 1 : Received request from a client to place an order
[2024-10-15T07:17:04.283Z] | Step 2 : Redis Client connected
[2024-10-15T07:17:04.284Z] | Step 3 : Order getting posted to redis
[2024-10-15T07:17:04.287Z] | Step 4 : Redis Client disconnected
[2024-10-15T07:17:04.292Z] | Step 5 : Service responded back to client browser
------------------------------------------------------------------------------------------
```

```
PS C:\git\ecommerce-event-driven-app> node .\subscribers\EmailConfirmationUpdate.js
[2024-10-15T07:20:55.946Z] Redis Client connected
[2024-10-15T07:20:55.949Z] subscribed to order_events channel...
------------------------------------------------------------------------------------------
[2024-10-15T07:21:31.881Z] | Step 1 : Email Confirmation Update request receieved through subscriber from Redis:
[2024-10-15T07:21:31.881Z] | Step 2 : Update:  Email Confirmation messaging triggered ORD-EY678 for user Sathyamoorthy S
[2024-10-15T07:21:33.890Z] | Step 3 : Update:  Email Confirmation message sent successfully ORD-EY678, user Sathyamoorthy S
------------------------------------------------------------------------------------------
```

```
PS C:\git\ecommerce-event-driven-app> node .\subscribers\FullfillmentUpdate.js
[2024-10-15T07:20:58.653Z] Redis Client connected
[2024-10-15T07:20:58.655Z] subscribed to order_events channel...
------------------------------------------------------------------------------------------
[2024-10-15T07:21:31.881Z] | Step 1 : Order fullfillment Update request receieved through subscriber from Redis:
[2024-10-15T07:21:31.881Z] | Step 2 : Update:  Order fullfillment triggered ORD-EY678 for user Sathyamoorthy S
[2024-10-15T07:21:33.890Z] | Step 3 : Update:  Order fullfillment completed successfully ORD-EY678, user Sathyamoorthy S
------------------------------------------------------------------------------------------
```

```
PS C:\git\ecommerce-event-driven-app> node.exe .\subscribers\InventoryUpdate.js
[2024-10-15T07:21:00.610Z] Redis Client connected
[2024-10-15T07:21:00.613Z] subscribed to order_events channel...
------------------------------------------------------------------------------------------
[2024-10-15T07:21:31.881Z] | Step 1 : Inventory Update request receieved through subscriber from Redis:
[2024-10-15T07:21:31.881Z] | Step 2 : Update:  Inventory Update triggered ORD-EY678 for user Sathyamoorthy S
[2024-10-15T07:21:33.890Z] | Step 3 : Update:  Inventory Update completed successfully ORD-EY678, user Sathyamoorthy S
------------------------------------------------------------------------------------------
```
![image](https://github.com/user-attachments/assets/b631721f-af46-4506-8182-7c1fb0ce7898)

## Notes

- Ensure Redis is correctly installed and running. If there are connection issues, check the Redis server logs.
- Use the `redis-cli monitor` command to observe communication between the publisher and subscriber.
- Modify and extend this project to integrate more advanced features like actual email sending, database integration for inventory, or payment processing.
