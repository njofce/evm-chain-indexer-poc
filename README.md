## A simple service to ingest and parse blockchain events

### Instructions

1. Run `npm install`
2. Run `docker-compose up -d` to start the MySQL database
3. Create a `.env` file based on the `.env.example` and add an RPC_URL from an rpc provider, ex. Alchemy
4. Run `npm run migrate-db`
5. Run `npm run start`

The service should start running on port 3000, and should start analyzing blocks.