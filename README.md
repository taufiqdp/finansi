## Prerequisites

- [Docker](https://docs.docker.com/get-docker/)

## How to run

1. Clone the repository

   ```bash
   git clone https://github.com/taufiqdp/demo-adk-mcp
   cd demo-adk-mcp
   ```

2. Rename the `.env.example` file to `.env` and fill in the required environment variables.

   ```bash
    cp .env.example .env
   ```

3. Run the Docker container

   ```bash
   docker compose up -d
   ```

4. Access the application
   Open your web browser and go to `http://localhost:3000`.
