# Publisher/Subscriber Pattern

## Scripts

1. Run server and subscribers

   ```bash
   ./run.md
    # OR if you are in the root directory
    ./22_publisher-subscriber-pattern/run.md
   ```

2. Open new 3 terminals, then run these 3 publishers

   - Run first publisher (News Station) in the second terminal

      ```bash
      ./run-publisher-news.md
      # OR if you are in the root directory
      ./22_publisher-subscriber-pattern/run-publisher-news.md
      ```

   - Run first publisher (Stock Broker) in the third terminal

      ```bash
      ./run-publisher-stock.md
      # OR if you are in the root directory
      ./22_publisher-subscriber-pattern/run-publisher-stock.md
      ```

   - Run first publisher (Youtube) in the fourth terminal

      ```bash
      ./run-publisher-youtube.md
      # OR if you are in the root directory
      ./22_publisher-subscriber-pattern/run-publisher-youtube.md
      ```

3. Then, see the result in the 1st terminal. Then kill some publisher process in the 2nd, 3rd, or 4th. Then, re-run the publisher process which you killed again to see result in the 1st terminal.
