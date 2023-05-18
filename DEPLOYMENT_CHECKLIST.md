# Deployment Checklist

This checklist is seen as a guide to deploy the stack to a new chain.

## Pre-Deployment

- [ ] Choose an ENS domain for DAOs
- [ ] Choose an ENS domain for plugins
- [ ] Check if there is an official ENS deployment for the chosen chain and if yes:
  - [ ] Check if there is already an entry for it in `packages/contracts/deploy/helpers.ts`
  - [ ] Check that the owner of the DAO domain is the deployer
  - [ ] Check that the owner of the plugin domain is the deployer
- [x] Run `yarn` in the repository root to install the dependencies
- [x] Run `yarn build` in `packages/contracts` to make sure the contracts compile
  - [x] Check that the compiler version in `hardhat.config.ts` is set to at least `0.8.17` and on the [known solidity bugs page](https://docs.soliditylang.org/en/latest/bugs.html) that no relevant vulnerabilities exist that are fixed in later versions. If the latter is not the case, consider updating the compiler pragmas to a safe version and rolling out fixes for affected contracts.
- [x] Run `yarn test` in `packages/contracts` to make sure the contract tests succeed
- [x] Run `yarn deploy --network hardhat --reset` to make sure the deploy scripts work
- [x] Set `ETH_KEY` in `.env` to the deployers private key
- [x] Set the right API key for the chains blockchain explorer in `.env` (e.g. for mainnet it is `ETHERSCAN_KEY`)
- [x] Set the chosen DAO ENS domain (in step 1) to `NETWORK_DAO_ENS_DOMAIN` in `.env` and replace `NETWORK` with the correct network name (e.g. for mainnet it is `MAINNET_DAO_ENS_DOMAIN`)
- [x] Set the chosen Plugin ENS domain (in step 2) to `NETWORK_PLUGIN_ENS_DOMAIN` in `.env` and replace `NETWORK` with the corxect network name (e.g. for mainnet it is `MAINNET_PLUGIN_ENS_DOMAIN`)
- [x] Set the subdomain to be used of the managing DAO to `MANAGINGDAO_SUBDOMAIN` in `.env`. If you want to use `management.dao.eth` put only `management`
- [x] Set the multisig members of the managing DAO as a comma (`,`) separated list to `MANAGINGDAO_MULTISIG_APPROVERS` in `.env`
- [x] Set the amount of minimum approvals the managing DAO needs to `MANAGINGDAO_MULTISIG_MINAPPROVALS` in `.env`

## Deployment

To deploy run `yarn deploy --network NETWORK` in `packages/contracts` and replace `NETWORK` with the correct network name (e.g. for mainnet it is `yarn deploy --network mainnet`)

## After-Deployment

### Configuration updates

- [x] Take the addresses from this file `packages/contracts/deployed_contracts.json`
- [x] Update `active_contracts.json` with the new deployed addresses
- [ ] Update `packages/contracts/Releases.md` with the new deployed addresses
- [x] Add the managing DAOs' multisig address to `packages/subgraph/.env-example` in the format `{NETWORK}_MANAGINGDAO_MULTISIG`

### Verification

- [x] Take the addresses from this file `packages/contracts/deployed_contracts.json`
- [x] Wait for the deployment script finishing verification
- [x] Go to the blockchain explorer and verify that each address is verified
  - [x] If it is not try to verfiy it with `npx hardhat verify --network NETWORK ADDRESS CONTRUCTOR-ARGS`. More infos on how to use this command can be found here: [https://hardhat.org/hardhat-runner/docs/guides/verifying](https://hardhat.org/hardhat-runner/docs/guides/verifying)
  - [x] If it is a proxy try to activate the blockchain explorer's proxy feature
  - [x] If the proxies are not verified with the `Similar Match Source Code` feature
    - [x] Verify one of the proxies
    - [x] Check if the other proxies are now verified with `Similar Match Source Code`

### Configurations

- [x] Check if the managing DAO set in the `DAO_ENSSubdomainRegistrar`
- [x] Check if the managing DAO set in the `Plugin_ENSSubdomainRegistrar`
- [x] Check if the managing DAO set in the `DAORegistry`
- [x] Check if the `DAO_ENSSubdomainRegistrar` set in the `DAORegistry`
- [x] Check if the managing DAO set in the `PluginRepoRegistry`
- [x] Check if the `Plugin_ENSSubdomainRegistrar` set in the `PluginRepoRegistry`
- [x] Check if the `PluginRepoRegistry` is set in the `PluginRepoFactory`
- [ ] Check if the managing DAO set in the `PluginSetupProcessor`
- [x] Check if the `PluginRepoRegistry` set in the `PluginSetupProcessor`
- [x] Check if the `DAORegistry` set in the `DAOFactory`
- [x] Check if the `PluginSetupProcessor` set in the `DAOFactory`

### Permissions

- [x] Check that the deployer has the ROOT permission on the managing DAO
- [x] Check if `DAO_ENSSubdomainRegistrar` is approved for all for the DAO' ENS domain. Call `isApprovedForAll` on the ENS registry
- [x] Check if `Plugin_ENSSubdomainRegistrar` is approved for all for the plugin' ENS domain. Call `isApprovedForAll` on the ENS registry
- [x] Check if the `DAORegistry` has `REGISTER_ENS_SUBDOMAIN_PERMISSION` on `DAO_ENSSubdomainRegistrar`
- [x] Check if the `PluginRepoRegistry` has `REGISTER_ENS_SUBDOMAIN_PERMISSION` on `Plugin_ENSSubdomainRegistrar`
- [x] Check if the `DAOFactory` has `REGISTER_DAO_PERMISSION` on `DAORegistry`
- [x] Check if the `PluginRepoFactory` has `REGISTER_PLUGIN_REPO_PERMISSION` on `PluginRepoRegistry`

### Packages

- [x] Publish a new version of `@aragon/osx-artifacts` (`./packages/contracts`) to NPM
- [x] Publish a new version of `@aragon/osx` (`./packages/contracts/src`) to NPM
- [x] Publish a new version of `@aragon/osx-ethers` (`./packages/contracts-ethers`) to NPM
- [x] Publish a new version of `@aragon/sdk-client` (`sdk/`) to NPM
- [ ] Update the changelog with the new version

### Subgraph

- [x] Update `packages/subgraph/manifest/data/NETWORK.json` where `NETWORK` is replaced with the deployed network with the new contract addresses. If the file doesn't exist create a new one.
- [x] Update the version in `packages/subgraph/package.json`
- [x] Update `packages/subgraph/.env` with the correct values
  - [x] set `NETWORK_NAME` to the deployed network
  - [x] set `SUBGRAPH_NAME` to `osx`
  - [x] set `GRAPH_KEY` with the value obtained from the [Satsuma Dashboard](https://app.satsuma.xyz/dashboard)
  - [x] set the `SUBGRAPH_VERSION` to the same value as in `packages/subgraph/package.json`
- [x] Run `yarn manifest` in `packages/subgraph` to generate the manifest
- [x] Run `yarn build` in `packages/subgraph` to build the subgraph
- [x] Run `yarn test` in `packages/subgraph` to test the subgraph
- [x] Run `yarn deploy` in `packages/subgraph` to deploy the subgraph
- [ ] Test the new deployed subgraph with the frontend team
- [ ] Promote the new subgraph to live in the [Satsuma Dashboard](https://app.satsuma.xyz/dashboard)

## Appendix

- Changing the owner of the chosen ENS domains will also revoke the permissions of the `DAO_ENSSubdomainRegistrar` and `Plugin_ENSSubdomainRegistrar`. Therefore if the ownership gets transfered, restore the approval for these 2 contracts.
