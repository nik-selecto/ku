import EventEmitter from 'events';

const PLUS_MINUS_EVENT = 'plus-minus' as const;
const UPDATE_EVENT = 'update' as const;

export class TransactionWaiter {
    protected transactionsCounter = 0;

    protected transactionsEmitter = new EventEmitter();

    protected isRunning = true;

    constructor() {
        this.transactionsEmitter.on(PLUS_MINUS_EVENT, (n: 1 | -1) => {
            console.log('n', n);

            this.transactionsCounter += n;

            this.transactionsEmitter.emit(UPDATE_EVENT, this.transactionsCounter);
        });
    }

    protected start(check: { isAlready: boolean }): false | { isAlready: boolean } {
        if (!this.isRunning) return false;

        if (check.isAlready) return check;

        console.log('start');
        this.transactionsEmitter.emit(PLUS_MINUS_EVENT, 1);
        // eslint-disable-next-line no-param-reassign
        check.isAlready = true;

        return check;
    }

    protected finish() {
        this.transactionsEmitter.emit(PLUS_MINUS_EVENT, -1);
        console.log('finish');
    }
}
