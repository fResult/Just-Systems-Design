# Relational Databases

## ACID Transaction

**A type of database transaction that has four important properties:**

- A - Atomicity
- C - Consistency
- I - Isolation
- D - Durability

## ACID Transaction & Indexes

### Tables and INSERT

`tables.sql`

```sql
CREATE TABLE payments (
    customer_name varchar(128),
    processed_at date,
    amount int
);

create table balances (
    username varchar(128),
    balance int
);

create table large_table (
    random_int int
);


INSERT INTO payments VALUES ('clement', '2019-12-15', 10);
INSERT INTO payments VALUES ('antoine', ' 2020-01-01', 100);
INSERT INTO payments VALUES ('clement', '2020-01-02', 10);
INSERT INTO payments VALUES ('antoine', '2020-01-02', 100);
INSERT INTO payments VALUES ('antoine', '2020-01-03', 100);
INSERT INTO payments VALUES ('simon', '2020-02-05', 1000);
INSERT INTO payments VALUES ('antoine', '2020-02-01', 100);
INSERT INTO payments VALUES ('clement', '2020-02-03', 10);
INSERT INTO payments VALUES ('meghan', '2020-01-12', 80);
INSERT INTO payments VALUES ('meghan', '2020-01-13', 70);
INSERT INTO payments VALUES ('meghan', '2020-01-14', 90);
INSERT INTO payments VALUES ('alex', '2019-12-11', 10);
INSERT INTO payments VALUES ('clement', '2020-02-01', 10);
INSERT INTO payments values ('marli', '2020-01-18', 10);
INSERT INTO payments VALUES ('alex', '2019-12-15', 10);
INSERT INTO payments VALUES ('marli', '2020-01-25', 10);
INSERT INTO payments VALUES ('marli', '2020-02-02', 10);

INSERT INTO balances VALUES ('antoine', 0);
INSERT INTO balances VALUES ('clement', 1000);


INSERT INTO large_table (random_int)
SELECT round (random() * 1000000000)
FROM generate_series(1, 50000000) s(i);
```

### Queries

`queries.sql`

```sql
/*
 * Powerful Queries
 */

-- Sum the number of payments for each user.
SELECT customer_name, count(*)
FROM payments
GROUP BY customer_name
ORDER BY count DESC;

-- Sum the payment amounts for each month.
SELECT sum(amount), EXTRACT(YEAR FROM processed_at) as year, EXTRACT(MONTH FROM processed_at) AS month
FROM  payments
GROUP BY month, year
ORDER BY sum DESC;

-- Sum the payment amounts for each month for each user.
SELECT customer_name, SUM(amount), EXTRACT(YEAR FROM processed_at) as year, EXTRACT(MONTH FROM processed_at) as month
FROM payments
GROUP BY customer_name, month, year
ORDER BY customer_name DESC;

-- Find the largest single-user payments for each month
SELECT MAX(amount), year, month
FROM (
    SELECT customer_name, SUM(amount) AS amount, EXTRACT(YEAR FROM processed_at) as year, EXTRACT(MONTH FROM processed_at) as month
    FROM payments
    GROUP BY customer_name, month, year
) monthly_sums
GROUP BY year, month;

/*
 * Transactions
 */
-- Transfer 100 from Crement to Antoine.
BEGIN TRANSACTION;
UPDATE balances SET balance = balance - 100 where username = 'clement';
UPDATE balances SET balance = balance + 100 where username = 'antoine';
COMMIT;

-- Some time use this...
SELECT * FROM balances;

/*
 * Indexes
 */
-- Find the 10 largest ints.
execute SELECT * FROM large_table ORDER BY random_int DESC LIMIT 10;

-- Create an index on the ints in the table.
CREATE INDEX large_table_random_int_idx ON large_table(random_int);
```
