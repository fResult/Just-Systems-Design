# Client-Server Model

## Scripts

### Try Dig

<!-- markdownlint-disable no-hard-tabs -->
```bash
> dig google.com

; <<>> DiG 9.10.6 <<>> google.com
;; global options: +cmd
;; Got answer:
;; ->>HEADER<<- opcode: QUERY, status: NOERROR, id: 58439
;; flags: qr rd ra; QUERY: 1, ANSWER: 1, AUTHORITY: 0, ADDITIONAL: 1

;; OPT PSEUDOSECTION:
; EDNS: version: 0, flags:; udp: 1400
;; QUESTION SECTION:
;google.com.			IN	A

;; ANSWER SECTION:
google.com.		217	IN	A	142.250.199.46

;; Query time: 9 msec
;; SERVER: 2405:9800:a:1::10#53(2405:9800:a:1::10)
;; WHEN: Sun Jun 30 16:26:38 +07 2024
;; MSG SIZE  rcvd: 55
```
<!-- markdownlint-enable -->

### Try NetCat

nc – arbitrary TCP and UDP connections and listens

**Listen to Port 8080:**

```bash
> nc -l 8080
```

**Open new terminal's session and try connect to `localhost:8080`:**

```bash
> nc localhost 8080
```

Then type anything and enter...
Then see the result in the first terminal's session

We can type and enter repeatedly and see results in the first terminal's session

![image](https://github.com/fResult/Just-Systems-Design/assets/19329932/2920e142-d2e2-4b91-8d6d-14a1132d84a8)

