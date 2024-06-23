# Storage

## Scripts

```bash
```

## Estimation Cheat Sheet

### Units Cheat Sheet

These values are defined by the International System of Units.

$$
\begin{aligned}
  \bullet&\ 1kB = 1000\ bytes\\
  \bullet&\ 1MB = 1000kB\\
  \bullet&\ 1GB = 1000MB\\
  \bullet&\ 1TB = 1000GB\\
  \bullet&\ 1PB = 1000TB\\
\end{aligned}
$$

### Storage Scale Cheat Sheet

```txt
- A character
    => 1 byte
- Typical metadata for a "thing," excluding images (name, description, other attributes, etc.)
    => ~1-10KB
- A high-quality 1920x1080p image
    => ~2MB (realistically can be lossy-compressed by ~10-20x)
- 20 minutes of HD video
    => ~1GB
```

### Storage Capacity Cheat Sheet

How much storage can a single industry-grade machine have?

```txt
- ~10TB disk space
- ~256GB-1TB of RAM (1TB for really large/optimized machines)
```

### Latency Cheat Sheet

How long does it take for a regular HTTP request to make a round trip, not bound by bandwidth?

```txt
- Intra-continental
    => ~50-150ms
- Cross-continental
    => ~200-500ms
```

It can be 150ms, because some countries are really big, e.g. USA

### Bandwidth Cheat Sheet

```txt
- Mobile phone (4G)
    => ~1-3MB/s
- Public internet (home WiFi)
    => ~50-100MB/s
- Within a data center
    => ~5GB/s
```

Keep in mind, how much data that users have to download?, how much data are users getting from the servers?
