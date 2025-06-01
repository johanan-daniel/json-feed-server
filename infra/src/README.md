# xkcd_lambda
## Running locally
1. Run `sam build`
2. Ensure Docker and DynamoDB are running locally
3. Ensure .env.json exists under the xkcd_lambda directory and contains the correct values
3. Run `sam local invoke XkcdLambda -n src/xkcd_lambda/.env.json`
## Deploying
1. Run `sam build`
2. Run `sam deploy`

# DynamoDB
## Running locally
1. In a separate terminal session, be in the root directory of the folder holding the DynamoDB docker compose file
2. Run `docker compose up` to create/restart containers and connect to stderr