# Main Node

```bash
mkdir -p ./data/ipfs/data
echo -e "/key/swarm/psk/1.0.0/\n/base16/\n`tr -dc 'a-f0-9' < /dev/urandom | head -c64`" > ./data/ipfs/data/swarm.key
docker-compose -f main-compose.yml up -d
docker-compose -f main-compose.yml exec ipfs ipfs bootstrap rm --all
cat ./data/cluster/identity.json
docker-compose -f main-compose.yml exec ipfs ipfs config show | grep "PeerID"
```

# Worker Node

```bash
docker-compose -f worker-compose.yml up -d 
docker-compose -f worker-compose.yml exec ipfs ipfs bootstrap rm --all

docker-compose -f worker-compose.yml exec ipfs ipfs config show | grep "PeerID"
docker-compose -f worker-compose.yml exec ipfs ipfs bootstrap add /ip4/65.108.198.250/tcp/4001/p2p/12D3KooWMZJccD1ivGpMwcwvkaZiHBZcuRBRVpwgoj9WsgCjXobi

```