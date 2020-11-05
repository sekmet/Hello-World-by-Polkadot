'use strict';
const inquirer = require('inquirer');
const blockChains = require('./chains');
const chainProvider = require('./provider');

module.exports = {
    askChainType: () => {
        inquirer
        .prompt([           
        {
            type: 'list',
            name: 'chain',
            message: 'What chain do you want to query?',
            choices: ['Polkadot', 'Kusama', 'Localnode'],
            filter: function (value) {
                return value.toLowerCase();
            },
        },
        {
            type: 'list',
            name: 'mode',
            message: 'What do you want to do?',
            choices: [
              'Display information about the latest block',
              new inquirer.Separator(),
              'Search for a block by number (height)',
              'Search for a hash',
            ],
        },         
        ])
        .then(async (answers) => {

            if (answers.mode == 'Search for a block by number (height)'){

                await inquirer
                .prompt({
                    type: 'input',
                    name: 'block_number',
                    message: "What's block number?",
                    validate: function(value){
                        if (value){
                            return true;
                        }

                        return 'Please enter a valid block number';
                    }
                })
                .then((answer_block) => {
                    //console.log(JSON.stringify(answer_block, null, '  '));
                    if (answers.chain !== 'localnode') {
                        return chainProvider.searchByBlocknumber(Object(blockChains)[answers.chain], answer_block.block_number);
                    } else {
                        return chainProvider.searchByBlocknumber(blockChains.local, answer_block.block_number);
                    }
                    
                });

            }

            if (answers.mode == 'Search for a hash'){

                await inquirer
                .prompt({
                    type: 'input',
                    name: 'block_hash',
                    message: "What's block hash?",
                    validate: function(value){
                        if (value){
                            return true;
                        }

                        return 'Please enter a valid block hash';
                    }
                })
                .then((answer_hash) => {
                    //console.log(JSON.stringify(answer_hash, null, '  '));
                    if (answers.chain !== 'localnode') {
                        return chainProvider.searchByBlockhash(Object(blockChains)[answers.chain], answer_hash.block_hash);
                    } else {
                        return chainProvider.searchByBlockhash(blockChains.local, answer_hash.block_hash);
                    }
                });

            }

            return answers;

        })
        .then((answers) => {
            //console.log(JSON.stringify(answers, null, '  '));
            if (answers.chain !== 'localnode' && answers.mode == 'Display information about the latest block') {
                return chainProvider.queryLatestBlock(Object(blockChains)[answers.chain]);
            } else {
                return chainProvider.queryLatestBlock(blockChains.local);
            }
            return answers;
        });
    }
}