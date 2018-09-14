<template>
  <div>
    <confirm-modal
      ref="confirmModal"
      :confirm-send-tx="sendTx"
      :signed-tx="signedTx"
      :fee="transactionFee"
      :is-hardware-wallet="isHardwareWallet"
      :gas-price="$store.state.gasPrice"
      :from="fromAddress"
      :to="toAddress"
      :value="amount"
      :gas="gasLimit"
      :data="data"
      :nonce="nonce + 1"/>
    <confirm-modal
      ref="offlineGenerateConfirmModal"
      :confirm-send-tx="generateTx"
      :signed-tx="signedTx"
      :fee="transactionFee"
      :is-hardware-wallet="isHardwareWallet"
      :gas-price="$store.state.gasPrice"
      :from="fromAddress"
      :to="toAddress"
      :value="amount"
      :gas="gasLimit"
      :data="data"
      :nonce="nonce + 1"/>
    <confirm-sign-modal
      ref="signConfirmModal"
      :confirm-sign-message="messageReturn"
      :show-success="showSuccessModal"
      :message-to-sign="messageToSign"
      :signed-message="signedMessage"
      :is-hardware-wallet="isHardwareWallet"
      :from="fromAddress"
    />
    <success-modal
      ref="successModal"
      message=""
      link-message="Close"/>
  </div>
</template>

<script>
import ConfirmModal from './components/ConfirmModal';
import SuccessModal from './components/SuccessModal';
import ConfirmSignModal from './components/ConfirmSignModal';

export default {
  components: {
    'confirm-modal': ConfirmModal,
    'success-modal': SuccessModal,
    'confirm-sign-modal': ConfirmSignModal
  },
  props: {
    active: {
      type: Boolean,
      default: false
    },
    rawTx: {
      type: Object,
      default: function() {
        return {};
      }
    }
  },
  data() {
    return {
      isHardwareWallet: false,
      responseFunction: null,
      advancedExpend: false,
      addressValid: true,
      amount: 0,
      amountValid: true,
      nonce: 0,
      gasLimit: 21000,
      data: '0x',
      gasAmount: this.$store.state.gasPrice,
      parsedBalance: 0,
      toAddress: '',
      transactionFee: 0,
      selectedCurrency: { symbol: 'ETH', name: 'Ethereum' },
      raw: {},
      signer: {},
      signedTxObject: {},
      signedTx: '',
      messageToSign: '',
      signedMessage: '',
      successMessage: '',
      linkMessage: 'OK',
      dismissed: true
    };
  },
  computed: {
    fromAddress() {
      if (this.$store.state.wallet) {
        return this.$store.state.wallet.getAddressString();
      }
    }
  },
  created() {
    this.$eventHub.$on('showSuccessModal', (message, linkMessage) => {
      if (!message) message = null;
      this.showSuccessModal(message, linkMessage);
    });

    this.$eventHub.$on(
      'showConfirmModal',
      (tx, isHardware, signer, resolve) => {
        this.parseRawTx(tx);
        this.isHardwareWallet = isHardware;
        this.responseFunction = resolve;
        this.successMessage = 'Sending Transaction';
        // this.signer = signer(tx)
        signer(tx).then(_response => {
          this.signedTxObject = _response;
          this.signedTx = this.signedTxObject.rawTransaction;
        });
        this.confirmationModalOpen();
      }
    );

    this.$eventHub.$on(
      'showTxConfirmModal',
      (tx, isHardware, signer, resolve) => {
        this.parseRawTx(tx);
        this.isHardwareWallet = isHardware;
        this.responseFunction = resolve;
        this.successMessage = 'Sending Transaction';
        // this.signer = signer(tx)
        signer(tx).then(_response => {
          this.signedTxObject = _response;
          this.signedTx = this.signedTxObject.rawTransaction;
        });
        this.confirmationModalOpen();
      }
    );

    this.$eventHub.$on(
      'showMessageConfirmModal',
      (data, isHardware, signer, resolve) => {
        this.responseFunction = resolve;
        this.messageToSign = data;
        signer(data).then(_response => {
          this.signedMessage = _response;
        });
        // this.signer = signer(data)
        this.signConfirmationModalOpen();
      }
    );
  },
  mounted() {
    this.$refs.confirmModal.$refs.confirmation.$on('hidden', () => {
      if (this.dismissed) {
        this.reset();
      }
    });

    this.$refs.successModal.$refs.success.$on('hide', () => {
      this.successMessage = '';
      this.linkMessage = 'OK';
    });
  },
  methods: {
    confirmationModalOpen() {
      window.scrollTo(0, 0);
      this.$refs.confirmModal.$refs.confirmation.show();
    },
    confirmationOfflineGenerateModalOpen() {
      window.scrollTo(0, 0);
      this.$refs.offlineGenerateConfirmModal.$refs.confirmation.show();
    },
    signConfirmationModalOpen() {
      window.scrollTo(0, 0);
      this.$refs.signConfirmModal.$refs.signConfirmation.show();
    },
    showSuccessModal(message, linkMessage) {
      this.reset();
      if (message !== null) this.successMessage = message;
      if (linkMessage !== null) this.linkMessage = linkMessage;
      this.$refs.successModal.$refs.success.show();
    },
    parseRawTx(tx) {
      this.raw = tx;
      this.nonce = +tx.nonce;
      this.data = tx.data;
      this.gasLimit = +tx.gas;
      this.toAddress = tx.to;
      this.amount = +tx.value;
      // this.signedTx = this.signedTxObject.rawTransaction
    },
    messageReturn() {
      this.dismissed = false;
      this.responseFunction(this.signedMessage);
      this.$refs.signConfirmModal.$refs.signConfirmation.hide();
      this.showSuccessModal();
    },
    generateTx() {
      this.dismissed = false;
      this.responseFunction(this.signedTxObject);
      this.$refs.confirmModal.$refs.confirmation.hide();
    },
    sendTx() {
      this.dismissed = false;
      this.responseFunction(this.signedTxObject);
      this.$refs.confirmModal.$refs.confirmation.hide();
      this.showSuccessModal();
    },
    reset() {
      this.responseFunction = null;
      this.advancedExpend = false;
      this.addressValid = true;
      this.amount = 0;
      this.amountValid = true;
      this.nonce = 0;
      this.gasLimit = 21000;
      this.data = '0x';
      this.gasAmount = this.$store.state.gasPrice;
      this.parsedBalance = 0;
      this.toAddress = '';
      this.transactionFee = 0;
      this.selectedCurrency = { symbol: 'ETH', name: 'Ethereum' };
      this.raw = {};
      this.signedTx = '';
      this.messageToSign = '';
      this.signedMessage = '';
      this.messageToSign = '';
    }
  }
};
</script>

<style scoped>
</style>