# Main Node

```bash
mkdir -p ./data/ipfs/data
echo -e "/key/swarm/psk/1.0.0/\n/base16/\n`tr -dc 'a-f0-9' < /dev/urandom | head -c64`" > ./data/ipfs/data/swarm.key
docker compose up -d
docker compose exec ipfs ipfs bootstrap rm --all
```

# Worker Node

```bash
docker compose up -d ipfs-cluster
```