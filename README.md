# DeepSteem - a DashBoard for the STEEM blockchain

DeepSteem is a DashBoard for the STEEM blockchain which shows several statistics for an account. It is written a standalone Angular application that requires no backend. A live version runs on http://deepsteem.com.

![foo](screenshot.png)

## Run DeepSteem locally

Clone the repository with `git clone https://github.com/nafest/deepsteem.git` and install all dependencies with `npm install`. Then, run `ng serve` for a dev server. Navigate to `http://localhost:4200/`. The app will automatically reload if you change any of the source files.

## Configuration

The default account name and whether a link to the last post of this account is displayed, can be configured in `src/app/config.ts`.

## Current features

At the present state, DeepSteem has the following features (amongst others):
* Computation of vote power and vote value
* Estimation of incoming curation rewards
* Estimation of incoming author rewards for posts
* Graph showing the amount of self-votes
* List of followers with cumulated vote value of all followers


### Explaining DeepSteem Futher


### What Is DeepSteem?



DeepSteem is a dashboard for the STEEM blockchain written as frontend only Angular application. It is a small STEEM dashboard which was created by @nafestw. It is built on the STEEM blockchain where it gets its data from. 


## Features 

* Estimation of incoming curation rewards

This means thet DeepSteem can help you calculate your estimated curation rewards

* Accurate estimation of incoming author rewards

DeepSteem helps yyou calculate your authoor rewards 

* Cumulative voting power of all followers

It allows you know the total amount of vote all your followers can give

* Computation of vote power and vote 

It shows the amount of vote a voting power can give 

* Graph showing the amount of self-votes

It helps you calculate with a graph the amount of vote a user gives himself 

* List of followers with a cumulated vote value of all 
 followers






### More About DeepSteem

DeepSteem is implemented as frontend only Angular application (this way it can be run locally very easily). It uses steemjs to retrieve data from the STEEM blockchain.

The current STEEM price is retrieved from https://coinmarketcap.com, using their REST API. Bootstrap is used for styling the frontend.



## We at DeepSteem want our users to enjoy more features in the future. Presently we are looking forward to 

* Displaying of a diagram of the price feed

* Classification of followers into active/inactive

* Overhaul of the interface (especially visually)









### Frequently Asked Questions 



### How does DeepSteem get the current value of STEEM?

The current STEEM price is retrieved from https://coinmarketcap.com, using their REST API.

### Do I need to log in to DeepSteem with my steemit password before I can access my profile?

No, you do not need to log in with your steemit password. All you need is your username.

### What is followers cumulative voting value?

Followers cumulative value means the total amount of vote worth all your followers will give when they vote you

### Can I post using Deepsteem?

The feature is not available on DeepSteem

### Can I contribute or report a bug on DeepSteem?

If you want to fix bugs or add a feature to DeepSteem, open a pull request on [Github](https://github.com/nafest/deepsteem).

For questions and suggestions please contribute or ask on [GITHUB](https://github.com/nafest/deepsteem)


