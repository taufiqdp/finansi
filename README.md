## Prerequisites

- [Docker](https://docs.docker.com/get-docker/)

## How to run

1. Clone the repository

   ```bash
   git clone https://github.com/taufiqdp/finansi
   cd finansi
   ```

2. Rename the `.env.example` file to `.env` and fill in the required environment variables.

   ```bash
    mv .env.example .env
   ```

3. Run the Docker container

   ```bash
   docker compose up -d
   ```

4. Access the application
   Open your web browser and go to `http://localhost:3000`.
