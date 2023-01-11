import {assert, clearStore, test} from 'matchstick-as/assembly/index';
import {Address, BigInt, Bytes, log} from '@graphprotocol/graph-ts';

import {AdminPlugin, Action, AdminProposal} from '../../generated/schema';

import {
  ADDRESS_ONE,
  ADDRESS_TWO,
  DAO_ADDRESS,
  ONE_ETH,
  STRING_DATA,
  PROPOSAL_ID,
  CONTRACT_ADDRESS
} from '../constants';
import {createDummyActions} from '../utils';
import {
  createNewProposalCreatedEvent,
  createProposalExecutedEvent
} from './utils';

import {
  handleProposalExecuted,
  _handleProposalCreated
} from '../../src/packages/admin/admin';

const actionValue = '0';
const actionData = '0x00000000';

test('Run Admin plugin (handleProposalCreated) mappings with mock event', () => {
  // create state
  let pluginId = Address.fromString(CONTRACT_ADDRESS).toHexString();
  let adminPlugin = new AdminPlugin(pluginId);
  adminPlugin.save();

  // create event
  let actions = createDummyActions(ADDRESS_TWO, actionValue, actionData);
  let event = createNewProposalCreatedEvent(
    PROPOSAL_ID,
    ADDRESS_ONE,
    STRING_DATA,
    actions,
    CONTRACT_ADDRESS
  );

  // handle event
  _handleProposalCreated(event, DAO_ADDRESS, STRING_DATA);

  let entityID =
    Address.fromString(CONTRACT_ADDRESS).toHexString() +
    '_' +
    BigInt.fromString(PROPOSAL_ID).toHexString();

  // checks
  assert.fieldEquals('AdminProposal', entityID, 'id', entityID);
  assert.fieldEquals('AdminProposal', entityID, 'dao', DAO_ADDRESS);
  assert.fieldEquals('AdminProposal', entityID, 'plugin', pluginId);
  assert.fieldEquals('AdminProposal', entityID, 'proposalId', PROPOSAL_ID);
  assert.fieldEquals('AdminProposal', entityID, 'creator', ADDRESS_ONE);
  assert.fieldEquals('AdminProposal', entityID, 'metadata', STRING_DATA);
  assert.fieldEquals('AdminProposal', entityID, 'executed', 'false');
  assert.fieldEquals(
    'AdminProposal',
    entityID,
    'createdAt',
    event.block.timestamp.toString()
  );

  // check actions
  for (let index = 0; index < actions.length; index++) {
    const actionId =
      CONTRACT_ADDRESS + '_' + PROPOSAL_ID + '_' + index.toString();
    const actionEntity = Action.load(actionId);
    if (actionEntity) {
      assert.fieldEquals('Action', actionId, 'id', actionId);
      assert.fieldEquals('Action', actionId, 'to', ADDRESS_TWO);
      assert.fieldEquals('Action', actionId, 'value', actionValue);
      assert.fieldEquals('Action', actionId, 'data', actionData);
      assert.fieldEquals('Action', actionId, 'dao', DAO_ADDRESS);
      assert.fieldEquals('Action', actionId, 'proposal', PROPOSAL_ID);
    }
  }

  clearStore();
});

test('Run Admin plugin (handleProposalExecuted) mappings with mock event', () => {
  // create state
  let pluginId = Address.fromString(CONTRACT_ADDRESS).toHexString();
  let adminPlugin = new AdminPlugin(pluginId);
  adminPlugin.save();

  let entityID =
    Address.fromString(CONTRACT_ADDRESS).toHexString() +
    '_' +
    BigInt.fromString(PROPOSAL_ID).toHexString();

  let adminstratorAddress = Address.fromString(ADDRESS_ONE);

  let adminProposal = new AdminProposal(entityID);
  adminProposal.dao = DAO_ADDRESS;
  adminProposal.plugin = pluginId;
  adminProposal.proposalId = BigInt.fromString(PROPOSAL_ID);
  adminProposal.creator = adminstratorAddress;
  adminProposal.metadata = STRING_DATA;
  adminProposal.executed = false;
  adminProposal.createdAt = BigInt.fromString(ONE_ETH);
  adminProposal.adminstrator = adminstratorAddress.toHexString();
  adminProposal.save();

  const actionId = CONTRACT_ADDRESS + '_' + PROPOSAL_ID + '_' + PROPOSAL_ID;
  let action = new Action(actionId);
  action.to = Address.fromString(ADDRESS_TWO);
  action.value = BigInt.fromString(actionValue);
  action.data = Bytes.fromHexString(actionData);
  action.dao = DAO_ADDRESS;
  action.proposal = entityID;
  action.save();

  // create event
  let event = createProposalExecutedEvent(
    PROPOSAL_ID,
    ['0x'],
    CONTRACT_ADDRESS
  );

  // handle event
  handleProposalExecuted(event);

  // checks
  assert.fieldEquals('AdminProposal', entityID, 'id', entityID);
  assert.fieldEquals('AdminProposal', entityID, 'executed', 'true');

  clearStore();
});