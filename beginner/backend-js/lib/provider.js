'use strict';
// Import the API
const { ApiPromise, WsProvider } = require('@polkadot/api');
const chalk = require('chalk');
const CLI = require('clui');
const Spinner = CLI.Spinner;

module.exports = {
    searchByBlocknumber: async (blockChain, blockNumber) => {
        const status = new Spinner('Searching, please wait...');
        status.start();
        const wsProvider = new WsProvider(blockChain);
        const api = await ApiPromise.create({ provider: wsProvider });
        const chain = await api.rpc.system.chain();
        await api.rpc.chain.getBlockHash(blockNumber).then(async blockHash => {
           await api.rpc.chain.getHeader(blockHash).then(async foundBlockHeader => {
                status.stop();
                console.log(`[ ${chalk.red.bold(chain)} ] : found block #${chalk.green.bold(foundBlockHeader.number)} has hash ${chalk.cyan.bold(foundBlockHeader.hash)}`);
                console.log('\r');
                const signedBlock = await api.rpc.chain.getBlock(foundBlockHeader.hash);
                const allRecords = await api.query.system.events();

                signedBlock.block.extrinsics.forEach(({ isSigned, meta, method: { args, method, section } }, index) => {
                    // filter the specific events based on the phase and then the
                    // index of our extrinsic in the block
                    const events = allRecords
                        .filter(({ phase }) =>
                        phase.isApplyExtrinsic &&
                        phase.asApplyExtrinsic.eq(index)
                        )
                        .map(({ event }) => `${event.section}.${event.method}`);

                    console.log(`${chalk.red.bold(section)}.${chalk.cyan.bold(method)}:: ${events.join(', ') || 'no events'}`);
                    console.log('\r');
                    // explicit display of name, args & documentation
                    console.log(`${chalk.red.bold(section)}.${chalk.cyan.bold(method)}(${args.map((a) => a.toString()).join(', ')})`);
                    console.log('\r');
                    console.log(meta.documentation.map((d) => d.toString()).join('\n'));
         
                });

                process.exit(0);
            });
        }).catch((e) => {
            console.log('ERROR: ', e.message)
            process.exit(0);
         });

    },

    searchByBlockhash: async (blockChain, blockHash) => {
        const status = new Spinner('Searching, please wait...');
        status.start();
        const wsProvider = new WsProvider(blockChain);
        const api = await ApiPromise.create({ provider: wsProvider });
        const chain = await api.rpc.system.chain();
        await api.rpc.chain.getBlock(blockHash).then(async foundBlock => {
            let blockHeader = foundBlock.get('block').get('header');
            status.stop();
            console.log(`[ ${chalk.red.bold(chain)} ] : found block #${chalk.green.bold(blockHeader.number)} has hash ${chalk.cyan.bold(blockHeader.hash)}`);
            console.log('\r');
            const signedBlock = await api.rpc.chain.getBlock(blockHeader.hash);
            const allRecords = await api.query.system.events();
            signedBlock.block.extrinsics.forEach(({ isSigned, meta, method: { args, method, section } }, index) => {
                // filter the specific events based on the phase and then the
                // index of our extrinsic in the block
                const events = allRecords
                    .filter(({ phase }) =>
                    phase.isApplyExtrinsic &&
                    phase.asApplyExtrinsic.eq(index)
                    )
                    .map(({ event }) => `${event.section}.${event.method}`);
                console.log(`${chalk.red.bold(section)}.${chalk.cyan.bold(method)}:: ${events.join(', ') || 'no events'}`);
                console.log('\r');
                // explicit display of name, args & documentation
                console.log(`${chalk.red.bold(section)}.${chalk.cyan.bold(method)}(${args.map((a) => a.toString()).join(', ')})`);
                console.log('\r');
                console.log(meta.documentation.map((d) => d.toString()).join('\n'));
            });

         }).catch((e) => {
            console.log('ERROR: ', e.message)
            process.exit(0);
         });

        process.exit(0);
    },

    queryLatestBlock: async (blockChain) => {
        const status = new Spinner('Connecting, please wait...');
        status.start();
        // Construct
        const wsProvider = new WsProvider(blockChain);
        const api = await ApiPromise.create({ provider: wsProvider });
        let count = 0;

        const unsubscribe = await api.rpc.chain.subscribeNewHeads(async (header) => {
            // Retrieve the chain name
            const chain = await api.rpc.system.chain();
            // Log the information
            status.stop();
            console.log(`[ ${chalk.red.bold(chain)} ] : last block #${chalk.green.bold(header.number)} has hash ${chalk.cyan.bold(header.hash)}`);

            if (++count === 32) {
            unsubscribe();
            process.exit(0);
            }

        });
    
    }

}