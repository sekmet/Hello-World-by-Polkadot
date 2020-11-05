#!/usr/bin/env node

const chalk = require('chalk');
const clear = require('clear');
const figlet = require('figlet');
const inquirer  = require('./lib/inquirer');

const run = async () => {
  const selectedChain = await inquirer.askChainType();
  if (selectedChain) { 
    return selectedChain;
  }
};

clear();

console.log(
  chalk.red(
    figlet.textSync('Polkadot Backend-JS', { horizontalLayout: 'full' })
  )
);

run().catch(console.error);