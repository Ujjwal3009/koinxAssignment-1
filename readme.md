# KoinX assessment by Aditya Malik

Live Hosting : https://koinxassignmentbyadityamalik.herokuapp.com/

## To run this app :

1. npm i
2. make .env file and copy content from .env.example file and fill in your credentials
3. node app.js / nodemon

## List of APIs (test using postman) :

1. GET "/" : for loading home page
2. GET "/fetchTransactions" : for fetching transactions of
   the user (pass "address" as request param)
3. GET "/currentBalance" : for fetching current balance
   and current ethereum prices (pass "address" as request param)
4. GET "/currentBalanceUsingApi" : for fetching current
   balance and current ethereum prices using Etherscan api (pass "address"
   as request param)
