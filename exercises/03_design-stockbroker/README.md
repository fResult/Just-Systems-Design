# Design A Stockbroker

Design a stockbroker: a platform that acts as the intermediary between end-customers and some central stock exchange.

Many systems design questions are intentionally left very vague and are literally given in the form of `Design Foobar`.\
It's your job to ask clarifying questions to better understand the system that you have to build.

We've laid out some of these questions below; their answers should give you some guidance on the problem.\
Before looking at them, we encourage you to take few minutes to think about what questions you'd ask in a real interview.

## Table of Content

- [Clarifying Questions](#clarifying-questions-to-ask)
- [Solution](#solution-walkthrough)

## Clarifying Questions To Ask

### Question 1

**Q:** *What do we mean exactly by a stock broker? Is this something like Robinhood or Etrade?*

**A:** Yes, exactly.

### Question 2

**Q:**

- *What is the platform supposed to support exactly?*
- *Are we just supporting the ability for customers to buy and sell stocks, or are we supporting more?*
- *For instance, are we allowing other types of securities like options and futures to be traded on our platform?*
- *Are we supporting special types of orders like limit orders and stop losses?*

**A:**\
We're only supporting market orders on stocks in this design.\
A market order means that, given a placed order to buy or sell a stock.\
We should try to execute the order as soon as possible regardless of the stock price.\
We also aren't designing any “margin” system, so the available balance is the source of truth for what can be bought.

### Question 3

**Q:** *Are we designing any of the auxiliary aspects of the stock brokerage, like depositing and withdrawing funds, downloading tax documents, etc.?*

**A:** No — we're just designing the core trading aspect of the platform.

### Question 4

**Q:**

- *Are we just designing the system to place trades?*
- *Do we want to support other trade-related operations like getting trade statuses?*
- *In other words, how comprehensive should the API that's going to support this platform be?*

**A:**\
In essence, you're only designing a system around a PlaceTrade API call from the user.\
But you should define that API call (inputs, response, etc.).

### Question 5

**Q:**

- *Where does a customer's balance live?*
- *Is the platform pulling a customer's money directly from their bank account, or are we expecting that customers will have already deposited funds into the platform somehow?*
- *In other words, are we ever directly interacting with banks?*

**A:**\
No, you won't be interacting with banks.\
You can assume that customers have already deposited funds into the platform.\
And you can further assume that you have a SQL table with the balance for each customer who wants to make a trade.

### Question 6

**Q:**

- *How many customers are we building this for?*
- *And is our customer-base a global one?*

**A:**\
Millions of customers, millions of trades a day.\
Let's assume that our customers are only located in 1 region — the U.S., for instance.

### Question 7

**Q:** *What kind of availability are we looking for?*

**A:** As high as possible, with this kind of service people can lose a lot of money if the system is down even for a few minutes.

### Question 8

**Q:**

- *Are we also designing the UI for this platform?*
- *What kinds of clients can we assume we have to support?*

**A:**\
You don't have to design the UI, but you should design the PlaceTrade API call that a UI would be making to your backend.\
Clients would be either a mobile app or a webapp.

### Question 9

**Q:**

- *So we want to design the API for the actual brokerage, that itself interacts with some central stock exchange on behalf of customers. Does this exchange have an API?*
- *If yes, do we know what it looks like, and do we have any guarantees about it?*

**A:**\
Yes, the exchange has an API, and your platform's API (the PlaceTrade call) will have to interact with the exchange's API.\
As far as that's concerned, you can assume that the call to the exchange to make an actual trade will take in a callback (in addition to the info about the trade) that will get executed when that trade completes at the exchange level (meaning, when the trade either gets `FILLED` or `REJECTED`, this callback will be executed).\
You can also assume that the exchange's system is highly available—your callback will always get executed at least once.

## Solution Walkthrough

Our solution walkthroughs are meant to supplement our video solutions.\
We recommend starting with the video solution and using the walkthrough either as a point of reference while you watch the video or as a review tool if you need to brush up on this question's solution later on.

### 1. Gathering System Requirements

To begin with, we need to gather system requirements to understand what exactly we are building.

**From the answers we were given to our [clarifying questions](#clarifying-questions-to-ask):**

- We are building a stock-brokerage platform similar to Robinhood, acting as an intermediary between end-customers and a central stock exchange.
- The central stock exchange executes stock trades, while the stockbroker platform handles customer interactions and trade placements.
- We are only supporting market trades—trades executed at the current stock price.
- Customer balances, representing funds previously deposited by customers, are stored in a SQL table.
- We need to design a *PlaceTrade* API call. The central exchange's equivalent API method will accept a callback that is guaranteed to be executed upon completion of a call to that API method.
- The system should support millions of trades per day from millions of customers in a single region (e.g., the U.S.).
- The system needs to be highly available (99.999% uptime).

### 2. Upcoming With A Plan

It's important to organize ourselves and to lay out a clear plan regarding how we're going to tackle our design.\
What are the major, distinguishable components of our how system?

**We will approach the design front to back:**

- The *PlaceTrade* API call that clients will make.
- The API server(s) handling client API calls.
- The system responsible for executing orders for each customer.

**We need to ensure the following:**

- Trades must not be stuck indefinitely without either being executed or failing.
- A single customer's trades must be executed in the order they were placed.
- Customer balances must never go negative.

### 3. API Call

**Signature:**

The core API call to implement is *PlaceTrade*.

```txt
PlaceTrade(
  customerId: string,
  stockTicker: string,
  type: string (BUY/SELL),
  quantity: integer,
) => (
  tradeId: string,
  stockTicker: string,
  type: string (BUY/SELL),
  quantity: integer,
  createdAt: timestamp,
  status: string (PLACED),
  reason: string,
)
```

Customer ID is derived from an authentication token known only to the user and passed into the API call.

**Status values:**

- **PLACED**
- **IN PROGRESS**
- **FILLED**
- **REJECTED**

Initially, the status will be **PLACED**, with other statuses set asynchronously after the exchange executes our callback.\
A *GetTrade* API call could return statuses other than **PLACED**.

**Potential reasons for a REJECTED trade:**

- Insufficient funds.
- Random error.
- Market hours closed.

### 4. API Server(s)

Multiple API servers will handle incoming requests.\
No caching is needed for trade placements, so round-robin load balancing will distribute requests among API servers.

API servers will store trades in a SQL table within the same database as the `balances` table, ensuring atomic updates using ACID transactions.

**SQL table for `trades`:**

- `id`: *string*, auto-generated string.
- `customer_id`: *string*, the id of the customer making the trade.
- `stock_ticker`: *string*, stock ticker symbol of the stock being traded.
- `type`: *string*, either **BUY** or **SELL**.
- `quantity`: *integer*, (no fractional shares), the number of shares to trade.
- `status`: *string*, the status of the trade; starts as **PLACED**.
- `created_at`: *timestamp*, trade creation time.
- `reason`: *string*, the human-readable justification of the trade's status.

> **Note:**\
> For monitoring to ensure that the trades that have status is `PLACED` or `IN PROGRESS` will not be get lost (at minute 56.48 til the end of the solution video).\
> We’ll add index to `customer_id`, because we will query `trades` frequently by `customer_id`.\
> And also add index to `status` will be useful.\
> Because we can polling the monitoring every x seconds.

**SQL table for `balances`:**

- `id`: *string*, auto-generated string.
- `customer_id`: *string*, the id of the customer making the trade.
- `amount`: *float*, amount in USD.
- `last_modified`: *timestamp*, last modification time.

### 5. Trade-Execution — Queue

To handle the massive volume of trades: hundred of orders placed every second.\
We'll need a robust execution system.

**Ensure the following:**

- A single customer can only have one **BUY** trade processed at a time to prevent negative balances.
- Market orders are executed at an unknown price until the exchange responds, so we need to query the exchange to confirm trade execution.

We will use a **Publish/Subscribe** pattern with a message queue like Apache Kafka or Google Cloud Pub/Sub.\
Customer IDs map to topics, providing at-least-once delivery semantics to ensure no missed trades.\
API servers write a row to the database and create a message routed to a customer-specific topic when customers make trades.

This ensures a single thread processes trades for each customer.

Subscribers of topics are clusters of workers with **leader election** for *high availability*.\
The leader processes messages by executing trades with the exchange.\
A single customer's trades are handled by the same cluster, simplifying logic and SQL queries.

**Estimating topics and clusters:**

For millions of trades per day, roughly 10-100 trades per second are expected during trading hours.\
With execution logic lasting about a second, we need about 10-100 topics and clusters of workers to process trades in parallel.

```txt
~100,000 seconds per day (3600 * 24)
~1,000,000 trades per day
trades bunched in 1/3rd of the day
--> (1,000,000 / 100,000) * 3 = ~30 trades per second
```

### 6. Trade-Execution — Logic

The subscribers (our workers) are streaming / waiting for messages.

**Example message in the topic queue:**

```json
{ "customerId": "c1" }
```

**Worker logic pseudo-code:**

```sql
-- Fetch the oldest trade not in a terminal state.
trade = SELECT * FROM trades WHERE
    customer_id = 'c1' AND status IN ('PLACED', 'IN PROGRESS')
    ORDER BY created_at LIMIT 1;

/* If the trade is PLACED, we know it is ready
 * to be executed, then mark it as IN PROGRESS.
 */
if trade.status == "PLACED" {
    UPDATE trades SET status = 'IN PROGRESS' WHERE id = trade.id;
}

/* If the trade already exists in the exchange, the callback will handle it. */
if exchange.TradeExists(trade.id) {
    return;
}

-- Fetch the customer's balance.
balance = SELECT amount FROM balances WHERE
    customer_id = 'c1';

/* Define the callback executed by the exchange once the trade completes.
 * We will defind it next further down.
 */
callback = ...

exchange.Execute(
    trade.stockTicker,
    trade.type,
    trade.quantity,
    max_price = balance,
    callback,
)
```

### 7. Exchange Callback

**Exchange callback pseudo-code:**

```sql
function exchange_callback(exchange_trade) {
    if exchange_trade.status == 'FILLED' {
        BEGIN TRANSACTION;
        trade = SELECT * FROM trades WHERE id = database_trade.id;
        if trade.status <> 'IN PROGRESS' {
            ROLLBACK;
            pubsub.send({ customer_id: database_trade.customer_id });
            return;
        }
        UPDATE balances SET amount -= exchange_trade.amount WHERE customer_id = database_trade.customer_id;
        UPDATE trades SET status = 'FILLED' WHERE id = database_trade.id;
        COMMIT;
    } else if exchange_trade.status == 'REJECTED' {
        BEGIN TRANSACTION;
        UPDATE trades
          SET status = 'REJECTED', reason = exchange_trade.reason
          WHERE id = database_trade.id;
        COMMIT;
    }
    pubsub.send({ customer_id: database_trade.customer_id });
    return http.status(200);
}
```

### 8. System Diagram

![Stockbroker System Diagram](./img/stockbroker-system-diagram.svg)
