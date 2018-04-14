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