import BigNumber from 'bignumber.js';
import { Toast } from '@/helpers';

const EAC_SCHEDULING_CONFIG = {
  FUTURE_GAS_PRICE_MIN: 1, // Gwei
  FEE: new BigNumber('0'),
  TOKEN_TRANSFER_ADDITIONAL_GAS: new BigNumber('20000'),
  TOKEN_SCHEDULING_GAS_LIMIT: new BigNumber('1500000'),
  FUTURE_GAS_LIMIT: new BigNumber('100000'),
  TIME_BOUNTY_MIN: new BigNumber('1'),
  TIME_BOUNTY_DEFAULTS: ['0.01', '0.02', '0.03'],
  BOUNTY_TO_DEPOSIT_MULTIPLIER: 2,
  SUPPORTED_MODES: [
    {
      name: 'Date & Time',
      executionWindow: {
        min: 5,
        default: 10
      },
      unit: 'Minutes'
    },
    {
      name: 'Block Number',
      executionWindow: {
        min: 20,
        default: 90
      },
      unit: 'Blocks'
    }
  ],
  TOKEN_TRANSFER_METHOD_ID: '23b872dd',
  APPROVE_TOKEN_TRANSFER_METHOD_ID: '095ea7b3'
};

const ERRORS = {
  SCHEDULING:
    'Scheduling parameters invalid. Please check if all data is valid.'
};

const calcSchedulingTotalCost = ({
  gasPrice,
  gasLimit,
  futureGasLimit,
  futureGasPrice,
  timeBounty
}) => {
  const deployCost = gasPrice.times(gasLimit);
  const futureExecutionCost = timeBounty.plus(
    futureGasLimit.times(futureGasPrice)
  );
  return deployCost.plus(futureExecutionCost).plus(EAC_SCHEDULING_CONFIG.FEE);
};

const canBeConvertedToWei = (web3, string, denomination = 'ether') => {
  try {
    web3.utils.toWei(string.toString(), denomination);
  } catch (e) {
    if (
      !e.message.includes('too many decimal places') ||
      !e.message.includes(`invalid number value ''`)
    ) {
      Toast.responseHandler(e, false);
    }
    return false;
  }
  return true;
};

export {
  calcSchedulingTotalCost,
  EAC_SCHEDULING_CONFIG,
  ERRORS,
  canBeConvertedToWei
};