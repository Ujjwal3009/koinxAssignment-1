const express = require("express");
const mongoose = require("mongoose");
require("dotenv").config();
const axios = require("axios");
const { User } = require("./models/user");
const { Eth } = require("./models/eth");

const app = express();
app.use(express.json());
app.use(express.static("public"));

mongoose.connect(
  process.env.CONNECTION_STRING,
  {
    dbName: "koinxassessment",
  },
  (err) => {
    if (err) throw err;
    console.log("Connected to MongoDB!!!");
  }
);

// function to fetch ethereum prices and update in mongodb schema
const fetchEthereum = () => {
  axios
    .get(process.env.ETH_FETCH_URL)
    .then((res) => {
      Eth.findByIdAndUpdate(
        process.env.ETH_PRICE_MONGOOSE_ID,
        {
          price: res.data.ethereum.inr,
          lastFetched: new Date(),
        },
        (err, previous) => {
          if (err) console.log(err);
          else console.log("Previous values : " + previous);
        }
      );
    })
    .catch((error) => {
      console.error(error);
    });
};

// fetch ethereum prices every 10 minutes
setInterval(fetchEthereum, 600000);

app.get("/", (request, result) => {
  result.send("Welcome to the show !");
});

// route to fetch and store normal transactions from etherscan api
app.get("/fetchTransactions", (request, result) => {
  if (request.query.address !== null && request.query.address !== undefined) {
    User.findOne({ address: request.query.address }, (err, foundUser) => {
      if (foundUser !== null && foundUser !== undefined) {
        result.send(foundUser.transactions);
      } else {
        axios
          .get(
            `https://api.etherscan.io/api?module=account&action=txlist&address=${request.query.address}&startblock=0&endblock=99999999&page=1&offset=10&sort=asc&apikey=${process.env.ETHERSCAN_API}`
          )
          .then((res) => {
            const newUser = new User({
              address: request.query.address,
              transactions: res.data.result,
            });

            newUser.save();

            result.send(res.data.result);
          })
          .catch((err) => {
            result.send(err);
          });
      }
    });
  } else {
    result.send("Address cannot be empty !");
  }
});

app.get("/currentBalance", (request, result) => {
  if (request.query.address !== null && request.query.address !== undefined) {
    User.findOne({ address: request.query.address }, (err, foundUser) => {
      if (foundUser !== null && foundUser !== undefined) {
        let balanceInEth = 0;

        for (let i = 0; i < foundUser.transactions.length; i++) {
          if (foundUser.transactions[i].to === request.query.address) {
            balanceInEth += foundUser.transactions[i].value / Math.pow(10, 18);
          }
          if (foundUser.transactions[i].from === request.query.address) {
            balanceInEth -= foundUser.transactions[i].value / Math.pow(10, 18);
          }
        }

        Eth.findById(process.env.ETH_PRICE_MONGOOSE_ID)
          .then((price) => {
            result.send(
              "Current Balance is : " +
                balanceInEth +
                " and current ethereum price is : " +
                price.price
            );
          })
          .catch((err) => {
            result.send(
              "Current Balance is : " +
                balanceInEth +
                " but cannot fetch eth prices !"
            );
          });
      } else {
        result.send("Cannot find user with the given address !");
      }
    });
  } else {
    result.send("Address cannot empty !");
  }
});

app.get("/currentBalanceUsingApi", (request, result) => {
  if (request.query.address !== null && request.query.address !== undefined) {
    axios
      .get(
        `https://api.etherscan.io/api?module=account&action=balance&address=${request.query.address}&tag=latest&apikey=${process.env.ETHERSCAN_API}`
      )
      .then((res) => {
        const balanceInWei = res.data.result;
        const balanceInEth = balanceInWei / Math.pow(10, 18);
        Eth.findById(process.env.ETH_PRICE_MONGOOSE_ID)
          .then((price) => {
            result.send(
              "Current Balance is : " +
                balanceInEth +
                " and current ethereum price is : " +
                price.price
            );
          })
          .catch((err) => {
            result.send(
              "Current Balance is : " +
                balanceInEth +
                " but cannot fetch eth prices !"
            );
          });
      })
      .catch((err) => {
        result.send("Some error occured !");
      });
  } else {
    result.send("Address cannot be empty !");
  }
});

app.listen(process.env.PORT, () => {
  console.log("App listening at :", process.env.PORT);
});
